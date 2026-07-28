import React, { useEffect, useState } from 'react';
import { orderService, type OrderData, type RefundBankDetails } from '../../../services/orderService';
import { useCart } from '../../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  Clock,
  ShieldCheck,
  Package,
  Truck,
  Navigation,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  MapPin,
  XCircle,
  Building2,
  X,
} from 'lucide-react';

/* ─── Order Tracking Steps ─────────────────────────────────────────────────── */
const TRACKING_STEPS = [
  {
    label: 'Placed',
    sublabel: 'Order confirmed',
    icon: Clock,
    status: 'PENDING_VERIFICATION',
  },
  {
    label: 'Payment Verified',
    sublabel: 'Payment approved',
    icon: ShieldCheck,
    status: 'APPROVED',
  },
  {
    label: 'Studio Processing',
    sublabel: 'Being hand-packed',
    icon: Package,
    status: 'PROCESSING',
  },
  {
    label: 'Shipped',
    sublabel: 'On the way',
    icon: Truck,
    status: 'SHIPPED',
  },
  {
    label: 'Out for Delivery',
    sublabel: 'In your city',
    icon: Navigation,
    status: 'OUT_FOR_DELIVERY',
  },
  {
    label: 'Delivered',
    sublabel: 'Enjoy your piece!',
    icon: CheckCircle2,
    status: 'DELIVERED',
  },
];

const STATUS_TO_STEP: Record<string, number> = {
  PENDING_VERIFICATION: 1,
  APPROVED: 2,
  PROCESSING: 3,
  SHIPPED: 4,
  OUT_FOR_DELIVERY: 5,
  DELIVERED: 6,
};

const STATUS_BADGE: Record<string, { label: string; cls: string }> = {
  PENDING_VERIFICATION: { label: 'Awaiting Verification', cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  APPROVED:             { label: 'Payment Verified',      cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  PROCESSING:           { label: 'Studio Processing',     cls: 'bg-purple-50 text-purple-700 border-purple-200' },
  SHIPPED:              { label: 'Shipped',               cls: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  OUT_FOR_DELIVERY:     { label: 'Out for Delivery',      cls: 'bg-cyan-50 text-cyan-700 border-cyan-200' },
  DELIVERED:            { label: 'Delivered',             cls: 'bg-green-50 text-green-700 border-green-200' },
  CANCEL_REQUESTED:     { label: 'Cancel Requested',      cls: 'bg-amber-100 text-amber-900 border-amber-300 font-bold' },
  CANCELLED:            { label: 'Cancelled',             cls: 'bg-gray-100 text-gray-700 border-gray-300' },
  REFUND_PROCESSED:     { label: 'Refund Processed',      cls: 'bg-emerald-100 text-emerald-800 border-emerald-300 font-bold' },
  REJECTED:             { label: 'Rejected',              cls: 'bg-red-50 text-red-700 border-red-200' },
};

/* ─── Tracking Stepper Component ───────────────────────────────────────────── */
const OrderTracker: React.FC<{ status: string }> = ({ status }) => {
  const currentStep = STATUS_TO_STEP[status] ?? 1;

  return (
    <div className="relative">
      {/* Connecting line behind steps */}
      <div className="absolute top-[18px] left-0 right-0 h-0.5 bg-warm-gray/30 z-0 mx-8 hidden sm:block" />
      {/* Filled progress line */}
      <div
        className="absolute top-[18px] left-0 h-0.5 bg-brass z-0 mx-8 hidden sm:block transition-all duration-700 ease-in-out"
        style={{ width: `calc(${((currentStep - 1) / (TRACKING_STEPS.length - 1)) * 100}% - 0px)` }}
      />

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-6 gap-x-2 relative z-10">
        {TRACKING_STEPS.map((step, idx) => {
          const stepNum = idx + 1;
          const isDone    = currentStep > stepNum;
          const isCurrent = currentStep === stepNum;
          const StepIcon  = step.icon;

          return (
            <div key={step.status} className="flex flex-col items-center text-center gap-2">
              {/* Icon Circle */}
              <div className="relative">
                {isCurrent && (
                  <span className="absolute inset-0 rounded-full animate-ping bg-brass/30 z-0" />
                )}
                <div
                  className={`relative z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-500 border-2 ${
                    isCurrent
                      ? 'bg-brass border-brass text-charcoal shadow-lg shadow-brass/30 scale-110'
                      : isDone
                      ? 'bg-charcoal border-charcoal text-warm-white'
                      : 'bg-warm-white border-warm-gray/40 text-mid-gray/40'
                  }`}
                >
                  <StepIcon className="w-4 h-4" />
                </div>
              </div>

              {/* Labels */}
              <div className="space-y-0.5">
                <p
                  className={`text-[10px] font-bold uppercase tracking-wider leading-tight ${
                    isCurrent
                      ? 'text-brass'
                      : isDone
                      ? 'text-charcoal'
                      : 'text-mid-gray/40'
                  }`}
                >
                  {step.label}
                </p>
                <p
                  className={`text-[9px] font-light leading-tight hidden sm:block ${
                    isCurrent ? 'text-brass/70' : isDone ? 'text-mid-gray' : 'text-mid-gray/30'
                  }`}
                >
                  {step.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

/* ─── Main Component ────────────────────────────────────────────────────────── */
export const OrderHistory: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading]  = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const { refreshCart } = useCart();
  const navigate = useNavigate();

  // Cancellation Modal State
  const [cancellingOrder, setCancellingOrder] = useState<OrderData | null>(null);
  const [cancelReasonPreset, setCancelReasonPreset] = useState('Ordered by mistake');
  const [cancelReasonCustom, setCancelReasonCustom] = useState('');
  const [bankHolderName, setBankHolderName] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNo, setBankAccountNo] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankUpiId, setBankUpiId] = useState('');
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      setOrders(data);
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadOrders(); }, []);

  const toggleItems = (orderId: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(orderId)) next.delete(orderId);
      else next.add(orderId);
      return next;
    });
  };

  const handleReorder = async (orderId: number) => {
    try {
      await orderService.reorder(orderId);
      await refreshCart();
      toast.success('Items added back to your cart!');
      navigate('/cart');
    } catch {
      toast.error('Reorder failed');
    }
  };

  const openCancelModal = (ord: OrderData) => {
    setCancellingOrder(ord);
    setCancelReasonPreset('Ordered by mistake');
    setCancelReasonCustom('');
    setBankHolderName('');
    setBankName('');
    setBankAccountNo('');
    setBankIfsc('');
    setBankUpiId('');
  };

  const handleCancelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cancellingOrder) return;

    const fullReason = cancelReasonPreset === 'Other'
      ? cancelReasonCustom.trim()
      : cancelReasonCustom.trim() ? `${cancelReasonPreset} — ${cancelReasonCustom.trim()}` : cancelReasonPreset;

    if (!fullReason) {
      toast.error('Please specify a cancellation reason.');
      return;
    }

    const refundDetails: RefundBankDetails = {
      holder_name: bankHolderName,
      bank_name: bankName,
      account_number: bankAccountNo,
      ifsc_code: bankIfsc,
      upi_id: bankUpiId,
    };

    try {
      setSubmittingCancel(true);
      await orderService.requestCancelOrder(cancellingOrder.id, {
        cancellation_reason: fullReason,
        refund_bank_details: refundDetails,
      });
      toast.success('Cancellation request & refund details submitted!');
      setCancellingOrder(null);
      loadOrders();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to submit cancellation request.');
    } finally {
      setSubmittingCancel(false);
    }
  };

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Orders…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-12 animate-fadeIn font-sans">
      {/* Page Header */}
      <div className="border-b border-warm-gray/40 pb-6 mb-8">
        <h1 className="font-brand text-3xl md:text-4xl text-charcoal mb-1">My Orders</h1>
        <p className="text-[13px] text-mid-gray font-light">
          Track your studio pieces from order to doorstep &amp; manage refunds
        </p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-16 text-center shadow-sm">
          <ClipboardList className="w-12 h-12 text-mid-gray/30 mx-auto mb-4" />
          <h3 className="font-brand text-2xl text-charcoal mb-2">No Orders Yet</h3>
          <p className="text-[13px] text-mid-gray font-light max-w-sm mx-auto mb-6">
            You haven't placed any orders yet. Explore our handcrafted stoneware collections.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <span>Explore Shop</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((ord) => {
            const isCancelledState = ['CANCEL_REQUESTED', 'CANCELLED', 'REFUND_PROCESSED'].includes(ord.status);
            const isRejected = ord.status === 'REJECTED';
            const canCancel = ['PENDING_VERIFICATION', 'APPROVED', 'PROCESSING'].includes(ord.status);
            const badge = STATUS_BADGE[ord.status];
            const itemsExpanded = expandedItems.has(ord.id);

            return (
              <div
                key={ord.id}
                className="bg-warm-white border border-warm-gray/50 rounded-2xl shadow-sm overflow-hidden"
              >
                {/* ── Card Header ── */}
                <div className="px-5 md:px-7 py-5 flex flex-wrap items-center justify-between gap-3 border-b border-warm-gray/30">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-mid-gray mb-0.5">Order Number</p>
                    <p className="font-mono text-base font-bold text-charcoal tracking-wide">#{ord.order_number}</p>
                    <p className="text-[10px] text-mid-gray mt-0.5">
                      {new Date(ord.created_at).toLocaleDateString('en-IN', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Status badge */}
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${badge?.cls}`}>
                      {badge?.label}
                    </span>
                    {/* Amount */}
                    <div className="text-right">
                      <p className="text-[9px] font-bold uppercase tracking-widest text-mid-gray mb-0.5">Total Paid</p>
                      <p className="font-brand text-xl text-charcoal">₹{Number(ord.total_amount).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* ── Cancellation & Refund Info Box ── */}
                {isCancelledState ? (
                  <div className="mx-5 md:mx-7 my-5 bg-amber-500/10 border border-amber-500/30 rounded-xl p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-900">
                        <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                        <span>
                          {ord.status === 'CANCEL_REQUESTED' && 'Cancellation & Refund Requested'}
                          {ord.status === 'CANCELLED' && 'Order Cancelled'}
                          {ord.status === 'REFUND_PROCESSED' && 'Refund Successfully Processed'}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono font-bold text-amber-900 bg-amber-500/20 px-2.5 py-0.5 rounded-full">
                        {ord.status}
                      </span>
                    </div>

                    {ord.cancellation_reason && (
                      <p className="text-xs text-amber-900/90 font-light">
                        <strong>Reason for cancellation:</strong> "{ord.cancellation_reason}"
                      </p>
                    )}

                    {ord.refund_bank_details && (
                      <div className="bg-warm-white/80 p-3 rounded-lg border border-amber-500/20 text-xs space-y-1 text-charcoal">
                        <span className="font-bold text-[10px] uppercase tracking-wider text-brass block mb-1">
                          Submitted Refund Bank Details:
                        </span>
                        <div className="grid grid-cols-2 gap-2 text-[11px]">
                          {ord.refund_bank_details.holder_name && (
                            <div><span className="text-mid-gray">Holder:</span> {ord.refund_bank_details.holder_name}</div>
                          )}
                          {ord.refund_bank_details.account_number && (
                            <div><span className="text-mid-gray">Account:</span> {ord.refund_bank_details.account_number}</div>
                          )}
                          {ord.refund_bank_details.ifsc_code && (
                            <div><span className="text-mid-gray">IFSC:</span> {ord.refund_bank_details.ifsc_code}</div>
                          )}
                          {ord.refund_bank_details.upi_id && (
                            <div><span className="text-mid-gray">UPI:</span> {ord.refund_bank_details.upi_id}</div>
                          )}
                        </div>
                      </div>
                    )}

                    {ord.refund_transaction_ref && (
                      <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-xs text-emerald-900 space-y-0.5">
                        <span className="font-bold block">Refund Reference UTR / Transaction ID:</span>
                        <span className="font-mono font-bold text-emerald-700">{ord.refund_transaction_ref}</span>
                        {ord.refund_notes && <p className="text-emerald-800 font-light mt-1">{ord.refund_notes}</p>}
                      </div>
                    )}
                  </div>
                ) : isRejected ? (
                  /* Rejection Box */
                  <div className="mx-5 md:mx-7 my-5 bg-red-50 border border-red-200 rounded-xl p-5 space-y-2">
                    <div className="flex items-center gap-2 font-bold text-red-700 text-xs uppercase tracking-wider">
                      <XCircle className="w-4 h-4 shrink-0" />
                      <span>Payment Rejected by Studio</span>
                    </div>
                    {ord.rejection_reason && (
                      <p className="text-xs text-red-700/90 font-light">
                        <strong>Reason:</strong> "{ord.rejection_reason}"
                      </p>
                    )}
                  </div>
                ) : (
                  /* ── Tracking Stepper ── */
                  <div className="px-5 md:px-7 py-6 space-y-5">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-brass">
                      Delivery Status Timeline
                    </p>
                    <OrderTracker status={ord.status} />

                    <div className="bg-porcelain/60 border border-warm-gray/30 rounded-xl px-4 py-3 flex items-start gap-3">
                      {(() => {
                        const stepIdx = (STATUS_TO_STEP[ord.status] ?? 1) - 1;
                        const step = TRACKING_STEPS[stepIdx];
                        const StepIcon = step?.icon ?? Clock;
                        return (
                          <>
                            <div className="w-8 h-8 bg-brass/15 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                              <StepIcon className="w-4 h-4 text-brass" />
                            </div>
                            <div>
                              <p className="text-[11px] font-bold text-charcoal uppercase tracking-wide">
                                Currently: {step?.label}
                              </p>
                              <p className="text-[11px] text-mid-gray font-light mt-0.5">
                                {ord.status === 'PENDING_VERIFICATION' && 'Our team is reviewing your payment. This usually takes 2–4 hours.'}
                                {ord.status === 'APPROVED' && 'Your payment has been verified! Studio artisans are preparing your order.'}
                                {ord.status === 'PROCESSING' && 'Your stoneware pieces are being carefully hand-packed in our Gujarat studio.'}
                                {ord.status === 'SHIPPED' && `Your parcel is on its way!${ord.courier_partner ? ` Shipped via ${ord.courier_partner}.` : ''}`}
                                {ord.status === 'OUT_FOR_DELIVERY' && 'Your package is out for delivery with the courier today.'}
                                {ord.status === 'DELIVERED' && 'Your studio pieces have been delivered.'}
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                )}

                {/* ── Courier Tracking Info (if shipped) ── */}
                {ord.tracking_number && (
                  <div className="mx-5 md:mx-7 mb-4 bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex items-center gap-3 text-xs text-indigo-900">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <div>
                      <p className="font-bold uppercase tracking-wider text-[10px] text-indigo-600 mb-0.5">
                        Courier Tracking
                      </p>
                      <p className="font-semibold">
                        {ord.courier_partner || 'Standard Courier'} — AWB #{ord.tracking_number}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Items (Collapsible) ── */}
                <div className="border-t border-warm-gray/30 mx-0">
                  <button
                    onClick={() => toggleItems(ord.id)}
                    className="w-full flex items-center justify-between px-5 md:px-7 py-3.5 text-[11px] font-bold uppercase tracking-widest text-mid-gray hover:text-charcoal hover:bg-porcelain/40 transition-colors"
                  >
                    <span>Items Ordered ({ord.items?.length || 0})</span>
                    {itemsExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  {itemsExpanded && ord.items && (
                    <div className="px-5 md:px-7 pb-4 space-y-2 border-t border-warm-gray/20">
                      {ord.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center text-xs text-charcoal py-2 border-b border-warm-gray/20 last:border-0">
                          <div>
                            <span className="font-semibold">{item.product_name}</span>
                            {item.variant_name && <span className="text-brass ml-1.5 font-medium">({item.variant_name})</span>}
                            <span className="text-mid-gray ml-1.5">× {item.quantity}</span>
                          </div>
                          <span className="font-bold shrink-0 ml-4">₹{Number(item.total_price).toLocaleString('en-IN')}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ── Footer Actions ── */}
                <div className="px-5 md:px-7 py-4 bg-porcelain/30 border-t border-warm-gray/30 flex flex-wrap items-center justify-between gap-3">
                  <p className="text-[11px] text-mid-gray">
                    Payment: <span className="font-semibold text-charcoal">{ord.payment_method === 'UPI_QR' ? 'UPI / QR' : 'Razorpay'}</span>
                    {ord.utr_number && <span className="text-mid-gray ml-2">UTR: {ord.utr_number}</span>}
                  </p>
                  
                  <div className="flex items-center gap-2">
                    {/* Cancellation Request Button */}
                    {canCancel && (
                      <button
                        onClick={() => openCancelModal(ord)}
                        className="inline-flex items-center gap-1.5 text-[11px] font-bold text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 rounded-xl px-3.5 py-2 transition-all"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Cancel &amp; Refund</span>
                      </button>
                    )}

                    <button
                      onClick={() => handleReorder(ord.id)}
                      className="inline-flex items-center gap-2 text-[11px] font-bold text-mid-gray hover:text-brass border border-warm-gray/50 hover:border-brass rounded-xl px-4 py-2 transition-all"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Reorder</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── CANCELLATION & REFUND BANK DETAILS MODAL ─── */}
      {cancellingOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-warm-gray/40 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">Order #{cancellingOrder.order_number}</span>
                <h3 className="font-brand text-2xl text-charcoal">Request Order Cancellation</h3>
              </div>
              <button onClick={() => setCancellingOrder(null)} className="text-mid-gray hover:text-charcoal p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCancelSubmit} className="space-y-4 text-xs">
              {/* Cancellation Reason */}
              <div>
                <label className="input-label">Reason for Cancellation *</label>
                <select
                  value={cancelReasonPreset}
                  onChange={(e) => setCancelReasonPreset(e.target.value)}
                  className="input-field mb-2"
                >
                  <option value="Ordered by mistake">Ordered by mistake</option>
                  <option value="Found a better price / alternative">Found a better price / alternative</option>
                  <option value="Shipping time is too long">Shipping time is too long</option>
                  <option value="Need to change delivery address">Need to change delivery address</option>
                  <option value="Other">Other reason</option>
                </select>
                
                {cancelReasonPreset === 'Other' && (
                  <textarea
                    rows={2}
                    placeholder="Please specify your cancellation reason…"
                    value={cancelReasonCustom}
                    onChange={(e) => setCancelReasonCustom(e.target.value)}
                    className="input-field resize-none"
                    required
                  />
                )}
              </div>

              {/* Bank Details for Refund Section */}
              <div className="bg-porcelain/60 border border-warm-gray/60 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-charcoal font-bold">
                  <Building2 className="w-4 h-4 text-brass" />
                  <span>Refund Bank Account / UPI Details</span>
                </div>
                <p className="text-[11px] text-mid-gray font-light">
                  Provide your bank account details or UPI ID below for direct refund transfer upon admin approval.
                </p>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1">Account Holder Name *</label>
                    <input
                      type="text"
                      placeholder="Name as in bank"
                      value={bankHolderName}
                      onChange={(e) => setBankHolderName(e.target.value)}
                      className="input-field bg-warm-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1">Bank Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC / SBI"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      className="input-field bg-warm-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1">Account Number *</label>
                    <input
                      type="text"
                      placeholder="Bank account number"
                      value={bankAccountNo}
                      onChange={(e) => setBankAccountNo(e.target.value)}
                      className="input-field bg-warm-white font-mono"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1">IFSC Code *</label>
                    <input
                      type="text"
                      placeholder="HDFC0001234"
                      value={bankIfsc}
                      onChange={(e) => setBankIfsc(e.target.value.toUpperCase())}
                      className="input-field bg-warm-white font-mono uppercase"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-mid-gray mb-1">UPI ID (Optional for fast refund)</label>
                  <input
                    type="text"
                    placeholder="name@upi / 9971118219@paytm"
                    value={bankUpiId}
                    onChange={(e) => setBankUpiId(e.target.value)}
                    className="input-field bg-warm-white font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submittingCancel}
                  className="flex-1 bg-rose-700 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider hover:bg-rose-800 transition-all shadow-md disabled:opacity-50"
                >
                  {submittingCancel ? 'Submitting…' : 'Submit Cancellation Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setCancellingOrder(null)}
                  className="px-5 border border-warm-gray/60 rounded-xl text-xs font-medium text-charcoal/70 hover:bg-porcelain transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderHistory;
