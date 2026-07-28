import React, { useEffect, useState } from 'react';
import { orderService, type OrderData } from '../../../services/orderService';
import toast from 'react-hot-toast';
import {
  RotateCcw,
  Building2,
  CheckCircle2,
  XCircle,
  Search,
  Copy,
  X,
  CreditCard,
} from 'lucide-react';

export const AdminCancellations: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<'ALL' | 'PENDING' | 'PROCESSED' | 'DECLINED'>('PENDING');
  const [searchQuery, setSearchQuery] = useState('');

  // Refund Modal State
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);
  const [refundStatusChoice, setRefundStatusChoice] = useState<'REFUND_PROCESSED' | 'CANCELLED'>('REFUND_PROCESSED');
  const [refundRef, setRefundRef] = useState('');
  const [refundNotes, setRefundNotes] = useState('');
  const [submittingRefund, setSubmittingRefund] = useState(false);

  // Decline Modal State
  const [declineOrder, setDeclineOrder] = useState<OrderData | null>(null);
  const [declineReason, setDeclineReason] = useState('');
  const [submittingDecline, setSubmittingDecline] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      // Filter orders that have cancellation history or status
      const cancellationOrders = data.filter(
        (o) =>
          o.status === 'CANCEL_REQUESTED' ||
          o.status === 'CANCELLED' ||
          o.status === 'REFUND_PROCESSED' ||
          o.cancellation_reason
      );
      setOrders(cancellationOrders);
    } catch {
      toast.error('Failed to load cancellation requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`Copied ${label} to clipboard!`);
  };

  const handleApproveRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setSubmittingRefund(true);
      await orderService.approveCancelOrder(selectedOrder.id, {
        status: refundStatusChoice,
        refund_transaction_ref: refundRef,
        refund_notes: refundNotes,
      });
      toast.success('Order cancellation & refund status updated!');
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error('Failed to update refund status');
    } finally {
      setSubmittingRefund(false);
    }
  };

  const handleDeclineCancel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineOrder || !declineReason.trim()) {
      toast.error('Please enter a reason for declining cancellation.');
      return;
    }

    try {
      setSubmittingDecline(true);
      await orderService.rejectCancelOrder(declineOrder.id, declineReason.trim());
      toast.success('Cancellation request declined.');
      setDeclineOrder(null);
      fetchOrders();
    } catch {
      toast.error('Failed to decline cancellation request.');
    } finally {
      setSubmittingDecline(false);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    if (filterTab === 'PENDING' && ord.status !== 'CANCEL_REQUESTED') return false;
    if (filterTab === 'PROCESSED' && ord.status !== 'REFUND_PROCESSED' && ord.status !== 'CANCELLED') return false;
    if (filterTab === 'DECLINED' && !ord.status.includes('PROCESSING') && ord.rejection_reason?.includes('Declined')) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        ord.order_number.toLowerCase().includes(q) ||
        ord.customer_username.toLowerCase().includes(q) ||
        ord.cancellation_reason?.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray/40 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brass block mb-1">
            Studio Financial Management
          </span>
          <h1 className="font-brand text-2xl md:text-3xl text-charcoal">Order Cancellations &amp; Refunds</h1>
          <p className="text-xs text-mid-gray font-light mt-0.5">
            Review customer cancellation requests, bank account details &amp; issue refund reference IDs
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-warm-white p-4 rounded-2xl border border-warm-gray/60 shadow-xs">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1 sm:pb-0">
          {[
            { key: 'PENDING', label: 'Pending Approval', count: orders.filter((o) => o.status === 'CANCEL_REQUESTED').length },
            { key: 'PROCESSED', label: 'Refund Processed', count: orders.filter((o) => o.status === 'REFUND_PROCESSED' || o.status === 'CANCELLED').length },
            { key: 'ALL', label: 'All Requests', count: orders.length },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilterTab(tab.key as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap border ${
                filterTab === tab.key
                  ? 'bg-brass text-charcoal border-brass shadow-sm'
                  : 'bg-warm-white text-mid-gray border-warm-gray/50 hover:text-charcoal'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 text-mid-gray absolute left-3 top-3" />
          <input
            type="text"
            placeholder="Search order #, customer…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-porcelain/60 border border-warm-gray/40 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-brass"
          />
        </div>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Requests…</span>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-16 text-center shadow-xs">
          <RotateCcw className="w-10 h-10 text-mid-gray/30 mx-auto mb-3" />
          <h3 className="font-brand text-xl text-charcoal mb-1">No Cancellation Requests Found</h3>
          <p className="text-xs text-mid-gray font-light">There are no orders matching this filter query.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((ord) => {
            const isPending = ord.status === 'CANCEL_REQUESTED';
            const isProcessed = ord.status === 'REFUND_PROCESSED' || ord.status === 'CANCELLED';
            const bank = ord.refund_bank_details;

            return (
              <div
                key={ord.id}
                className="bg-warm-white border border-warm-gray/60 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-warm-gray/30 pb-4">
                  <div>
                    <span className="font-mono text-base font-bold text-charcoal">#{ord.order_number}</span>
                    <span className="text-xs text-mid-gray ml-3">
                      Customer: <strong>{ord.customer_username}</strong> ({ord.customer_email})
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-brand text-lg text-charcoal font-bold">
                      ₹{Number(ord.total_amount).toLocaleString('en-IN')}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border ${
                        isPending
                          ? 'bg-amber-500/15 text-amber-900 border-amber-500/30'
                          : isProcessed
                          ? 'bg-emerald-500/15 text-emerald-900 border-emerald-500/30'
                          : 'bg-zinc-100 text-zinc-700 border-zinc-300'
                      }`}
                    >
                      {ord.status.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>

                {/* Reason */}
                {ord.cancellation_reason && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-amber-800 block mb-0.5">
                      Reason for Cancellation:
                    </span>
                    <p className="font-light leading-relaxed">"{ord.cancellation_reason}"</p>
                  </div>
                )}

                {/* Bank / UPI Details Card */}
                {bank ? (
                  <div className="bg-porcelain/60 border border-warm-gray/50 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs font-bold text-charcoal">
                        <Building2 className="w-4 h-4 text-brass" />
                        <span>Customer Bank Account &amp; Refund Details</span>
                      </div>
                      <span className="text-[10px] text-mid-gray uppercase tracking-wider">Submitted by customer</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                      {bank.holder_name && (
                        <div className="bg-warm-white p-2.5 rounded-lg border border-warm-gray/30">
                          <span className="text-[9px] font-bold uppercase text-mid-gray block">Account Holder</span>
                          <span className="font-semibold text-charcoal">{bank.holder_name}</span>
                        </div>
                      )}
                      {bank.account_number && (
                        <div className="bg-warm-white p-2.5 rounded-lg border border-warm-gray/30 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-mid-gray block">Account No.</span>
                            <span className="font-mono font-bold text-charcoal">{bank.account_number}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bank.account_number!, 'Account Number')}
                            className="p-1 text-mid-gray hover:text-brass"
                            title="Copy Account Number"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {bank.ifsc_code && (
                        <div className="bg-warm-white p-2.5 rounded-lg border border-warm-gray/30 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-mid-gray block">IFSC Code</span>
                            <span className="font-mono font-bold text-charcoal uppercase">{bank.ifsc_code}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bank.ifsc_code!, 'IFSC Code')}
                            className="p-1 text-mid-gray hover:text-brass"
                            title="Copy IFSC Code"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                      {bank.upi_id && (
                        <div className="bg-warm-white p-2.5 rounded-lg border border-warm-gray/30 flex justify-between items-center">
                          <div>
                            <span className="text-[9px] font-bold uppercase text-brass block">UPI ID</span>
                            <span className="font-mono font-bold text-charcoal">{bank.upi_id}</span>
                          </div>
                          <button
                            onClick={() => copyToClipboard(bank.upi_id!, 'UPI ID')}
                            className="p-1 text-mid-gray hover:text-brass"
                            title="Copy UPI ID"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-mid-gray italic">No bank account details submitted by customer.</div>
                )}

                {/* Refund Reference if already processed */}
                {ord.refund_transaction_ref && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3.5 text-xs text-emerald-900 space-y-1">
                    <span className="font-bold uppercase tracking-wider text-[10px] text-emerald-700 block">
                      Refund Processed UTR / Transaction Ref:
                    </span>
                    <span className="font-mono font-bold text-sm text-emerald-800">{ord.refund_transaction_ref}</span>
                    {ord.refund_notes && <p className="text-emerald-700 font-light mt-1">{ord.refund_notes}</p>}
                  </div>
                )}

                {/* Admin Actions */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-warm-gray/30">
                  {isPending && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedOrder(ord);
                          setRefundRef('');
                          setRefundNotes('');
                          setRefundStatusChoice('REFUND_PROCESSED');
                        }}
                        className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Approve &amp; Process Refund</span>
                      </button>

                      <button
                        onClick={() => {
                          setDeclineOrder(ord);
                          setDeclineReason('');
                        }}
                        className="px-4 py-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold hover:bg-rose-100 transition-all flex items-center gap-1.5"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Decline Cancellation</span>
                      </button>
                    </>
                  )}

                  {isProcessed && (
                    <button
                      onClick={() => {
                        setSelectedOrder(ord);
                        setRefundRef(ord.refund_transaction_ref || '');
                        setRefundNotes(ord.refund_notes || '');
                      }}
                      className="px-3.5 py-1.5 border border-warm-gray/60 rounded-xl text-xs font-semibold text-mid-gray hover:text-charcoal transition-all flex items-center gap-1.5"
                    >
                      <CreditCard className="w-3.5 h-3.5" />
                      <span>Update Refund Details</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── APPROVE & PROCESS REFUND MODAL ─── */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-warm-gray/40 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">
                  Order #{selectedOrder.order_number}
                </span>
                <h3 className="font-brand text-2xl text-charcoal">Process Refund &amp; Cancel</h3>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="text-mid-gray hover:text-charcoal p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleApproveRefund} className="space-y-4 text-xs">
              <div className="bg-porcelain/60 p-4 rounded-2xl border border-warm-gray/40 space-y-1">
                <span className="font-bold text-charcoal block">Refund Amount: ₹{selectedOrder.total_amount}</span>
                <span className="text-[11px] text-mid-gray block">
                  Customer Account: {selectedOrder.refund_bank_details?.account_number || 'N/A'} (
                  {selectedOrder.refund_bank_details?.ifsc_code || 'N/A'})
                </span>
              </div>

              <div>
                <label className="input-label">Update Status</label>
                <select
                  value={refundStatusChoice}
                  onChange={(e) => setRefundStatusChoice(e.target.value as any)}
                  className="input-field"
                >
                  <option value="REFUND_PROCESSED">Refund Processed (Completed)</option>
                  <option value="CANCELLED">Cancelled (No Refund / Pending)</option>
                </select>
              </div>

              <div>
                <label className="input-label">Refund UTR / Transaction Reference ID *</label>
                <input
                  type="text"
                  placeholder="e.g. UTR1234567890"
                  value={refundRef}
                  onChange={(e) => setRefundRef(e.target.value)}
                  className="input-field font-mono"
                  required
                />
              </div>

              <div>
                <label className="input-label">Refund Notes for Customer</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Transferred ₹1299 to HDFC account ending in 4321 via IMPS."
                  value={refundNotes}
                  onChange={(e) => setRefundNotes(e.target.value)}
                  className="input-field resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submittingRefund}
                  className="flex-1 bg-emerald-700 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider hover:bg-emerald-800 transition-all shadow-md disabled:opacity-50"
                >
                  {submittingRefund ? 'Processing…' : 'Confirm & Process Refund'}
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-5 border border-warm-gray/60 rounded-xl text-xs font-medium text-charcoal/70 hover:bg-porcelain transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DECLINE CANCELLATION MODAL ─── */}
      {declineOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-3xl max-w-md w-full p-6 md:p-8 shadow-2xl space-y-5">
            <div className="flex justify-between items-center border-b border-warm-gray/40 pb-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">
                  Order #{declineOrder.order_number}
                </span>
                <h3 className="font-brand text-xl text-charcoal">Decline Cancellation</h3>
              </div>
              <button onClick={() => setDeclineOrder(null)} className="text-mid-gray hover:text-charcoal p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleDeclineCancel} className="space-y-4 text-xs">
              <div>
                <label className="input-label">Reason for Declining *</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Parcel has already been dispatched via Bluedart courier."
                  value={declineReason}
                  onChange={(e) => setDeclineReason(e.target.value)}
                  className="input-field resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="submit"
                  disabled={submittingDecline}
                  className="flex-1 bg-rose-700 text-white rounded-xl py-3 text-xs font-bold uppercase tracking-wider hover:bg-rose-800 transition-all shadow-md disabled:opacity-50"
                >
                  {submittingDecline ? 'Declining…' : 'Decline Request'}
                </button>
                <button
                  type="button"
                  onClick={() => setDeclineOrder(null)}
                  className="px-5 border border-warm-gray/60 rounded-xl text-xs font-medium text-charcoal/70 hover:bg-porcelain transition-colors"
                >
                  Close
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCancellations;
