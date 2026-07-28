import React, { useEffect, useState } from 'react';
import { orderService, type OrderData, type OrderItemData } from '../../../services/orderService';
import toast from 'react-hot-toast';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Truck,
  ExternalLink,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';

export const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [search, setSearch] = useState('');

  // Modals State
  const [selectedOrder, setSelectedOrder] = useState<OrderData | null>(null);

  // Reject Modal State
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejecting, setRejecting] = useState(false);

  // Delivery Status Modal State
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [deliveryStatus, setDeliveryStatus] = useState<string>('PROCESSING');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierPartner, setCourierPartner] = useState('');
  const [trackingNotes, setTrackingNotes] = useState('');
  const [updatingDelivery, setUpdatingDelivery] = useState(false);

  // Proof Image Preview Modal State
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await orderService.getOrders();
      let filtered = data;

      if (statusFilter) {
        filtered = filtered.filter((o) => o.status === statusFilter);
      }
      if (search) {
        const q = search.toLowerCase();
        filtered = filtered.filter(
          (o) =>
            o.order_number.toLowerCase().includes(q) ||
            o.customer_username.toLowerCase().includes(q) ||
            o.utr_number.toLowerCase().includes(q)
        );
      }

      setOrders(filtered);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [statusFilter, search]);

  const handleApprove = async (orderId: number) => {
    try {
      await orderService.approveOrder(orderId);
      toast.success('Order & Payment Approved!');
      loadOrders();
    } catch {
      toast.error('Failed to approve order');
    }
  };

  const openRejectModal = (order: OrderData) => {
    setSelectedOrder(order);
    setRejectionReason('');
    setIsRejectModalOpen(true);
  };

  const handleConfirmReject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    if (!rejectionReason.trim()) {
      toast.error('A rejection reason is required to notify the customer.');
      return;
    }

    try {
      setRejecting(true);
      await orderService.rejectOrder(selectedOrder.id, rejectionReason.trim());
      toast.success('Order rejected and customer notified.');
      setIsRejectModalOpen(false);
      loadOrders();
    } catch {
      toast.error('Failed to reject order');
    } finally {
      setRejecting(false);
    }
  };

  const openDeliveryModal = (order: OrderData) => {
    setSelectedOrder(order);
    setDeliveryStatus(order.status === 'PENDING_VERIFICATION' ? 'APPROVED' : order.status);
    setTrackingNumber(order.tracking_number || '');
    setCourierPartner(order.courier_partner || '');
    setTrackingNotes(order.tracking_notes || '');
    setIsDeliveryModalOpen(true);
  };

  const handleConfirmDeliveryUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    try {
      setUpdatingDelivery(true);
      await orderService.updateDelivery(selectedOrder.id, {
        status: deliveryStatus,
        tracking_number: trackingNumber.trim(),
        courier_partner: courierPartner.trim(),
        tracking_notes: trackingNotes.trim(),
      });
      toast.success('Delivery status & tracking notes updated!');
      setIsDeliveryModalOpen(false);
      loadOrders();
    } catch {
      toast.error('Failed to update delivery');
    } finally {
      setUpdatingDelivery(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray/40 pb-6">
        <div>
          <h1 className="font-brand text-3xl text-charcoal mb-1">Order Workflow &amp; Verification</h1>
          <p className="text-[13px] text-mid-gray font-light">Verify UPI payment UTRs, approve orders &amp; update courier tracking</p>
        </div>
      </div>

      {/* Toolbar / Filters */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-warm-white p-4 rounded-2xl border border-warm-gray/50 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <div className="relative max-w-xs flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-mid-gray absolute left-3.5 top-3" />
            <input
              type="text"
              placeholder="Search by Order #, Username, UTR…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-porcelain/60 border border-warm-gray/40 rounded-xl pl-10 pr-4 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-porcelain/60 border border-warm-gray/40 rounded-xl px-3 py-2 text-xs text-charcoal focus:outline-none focus:border-brass"
          >
            <option value="">All Statuses</option>
            <option value="PENDING_VERIFICATION">Pending Verification</option>
            <option value="APPROVED">Approved</option>
            <option value="PROCESSING">Processing</option>
            <option value="SHIPPED">Shipped</option>
            <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
            <option value="DELIVERED">Delivered</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>

        <span className="text-[11px] text-mid-gray font-medium">Total: {orders.length} Orders</span>
      </div>

      {/* Orders List */}
      {loading ? (
        <div className="py-20 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Orders…</span>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-12 text-center shadow-sm">
          <ClipboardList className="w-10 h-10 text-mid-gray/30 mx-auto mb-3" />
          <h3 className="text-base font-bold text-charcoal mb-1">No Orders Match Filter</h3>
          <p className="text-[13px] text-mid-gray font-light">Customer orders will appear here for payment verification.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord) => (
            <div key={ord.id} className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-warm-gray/30 pb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray block">Order Number</span>
                  <span className="font-mono text-base font-bold text-charcoal">#{ord.order_number}</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray block">Customer</span>
                  <span className="font-semibold text-charcoal text-xs">{ord.customer_username} ({ord.customer_email})</span>
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray block">Total Amount</span>
                  <span className="font-bold text-charcoal text-base">₹{ord.total_amount}</span>
                </div>

                <div>
                  <span className="inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-brass/15 text-brass border border-brass/30">
                    {ord.status.replace('_', ' ')}
                  </span>
                </div>
              </div>

              {/* Payment Verification Box */}
              <div className="grid md:grid-cols-2 gap-4 bg-porcelain/40 p-4 rounded-xl border border-warm-gray/30 text-xs">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray block mb-1">Payment Method &amp; UTR</span>
                  <span className="font-semibold text-charcoal block">{ord.payment_method}</span>
                  {ord.utr_number ? (
                    <span className="font-mono text-brass font-bold text-sm block mt-0.5">UTR: {ord.utr_number}</span>
                  ) : (
                    <span className="text-mid-gray italic">No UTR submitted</span>
                  )}
                </div>

                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray block mb-1">Payment Proof Screenshot</span>
                  {ord.payment_proof_url ? (
                    <button
                      onClick={() => setPreviewImageUrl(ord.payment_proof_url)}
                      className="inline-flex items-center gap-1.5 text-brass font-bold hover:underline"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> Preview Payment Screenshot
                    </button>
                  ) : (
                    <span className="text-mid-gray italic">No screenshot URL provided</span>
                  )}
                </div>
              </div>

              {/* Rejection Reason Display if Rejected */}
              {ord.status === 'REJECTED' && ord.rejection_reason && (
                <div className="bg-error/10 border border-error/20 p-4 rounded-xl text-xs text-error font-medium flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold block uppercase tracking-wider text-[10px]">Admin Rejection Reason:</span>
                    <span>{ord.rejection_reason}</span>
                  </div>
                </div>
              )}

              {/* Tracking Information Display if Shipped/Out for Delivery */}
              {ord.tracking_number && (
                <div className="bg-purple-50 border border-purple-200 p-4 rounded-xl text-xs text-purple-900 flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-purple-700 block">Courier &amp; Tracking</span>
                    <span className="font-bold block">{ord.courier_partner || 'Standard Courier'} — #{ord.tracking_number}</span>
                    {ord.tracking_notes && <p className="text-[11px] text-purple-800 font-light mt-0.5">{ord.tracking_notes}</p>}
                  </div>
                </div>
              )}

              {/* Purchased Items List */}
              <div className="space-y-1 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray block mb-1">Purchased Items</span>
                {ord.items && ord.items.map((item: OrderItemData) => (
                  <div key={item.id} className="flex justify-between items-center text-charcoal">
                    <span>{item.product_name} {item.variant_name ? `(${item.variant_name})` : ''} &times; {item.quantity}</span>
                    <span className="font-bold">₹{item.total_price}</span>
                  </div>
                ))}
              </div>

              {/* Admin Action Buttons */}
              <div className="pt-3 border-t border-warm-gray/30 flex flex-wrap items-center justify-between gap-3">
                <div className="text-[11px] text-mid-gray">
                  Ship to: <strong className="text-charcoal">{ord.shipping_address_snapshot?.street_address}, {ord.shipping_address_snapshot?.city} ({ord.shipping_address_snapshot?.postal_code})</strong>
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs">
                  {ord.status === 'PENDING_VERIFICATION' && (
                    <>
                      <button
                        onClick={() => handleApprove(ord.id)}
                        className="bg-success text-white px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-success/90 transition-all flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" /> Approve Payment
                      </button>
                      <button
                        onClick={() => openRejectModal(ord)}
                        className="bg-error text-white px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-error/90 transition-all flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" /> Reject Payment
                      </button>
                    </>
                  )}

                  {ord.status !== 'REJECTED' && ord.status !== 'CANCELLED' && (
                    <button
                      onClick={() => openDeliveryModal(ord)}
                      className="bg-charcoal text-warm-white px-4 py-2 rounded-xl text-[11px] font-semibold uppercase tracking-wider hover:bg-brass hover:text-charcoal transition-all flex items-center gap-1.5"
                    >
                      <Truck className="w-3.5 h-3.5" /> Update Delivery / Tracking
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── REJECTION MODAL WITH REASON ─── */}
      {isRejectModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-md shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-warm-gray/40 pb-4">
              <h3 className="font-brand text-xl text-charcoal">Reject Order #{selectedOrder.order_number}</h3>
              <button onClick={() => setIsRejectModalOpen(false)} className="text-mid-gray hover:text-charcoal p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-4">
              <div>
                <label className="input-label">Rejection Reason *</label>
                <textarea
                  placeholder="e.g. Invalid UTR reference ID / Payment screenshot does not match order amount…"
                  rows={4}
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="input-field"
                  required
                />
                <span className="text-[10px] text-mid-gray mt-1 block">This reason will be displayed directly to the customer in their order dashboard.</span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={rejecting}
                  className="flex-1 bg-error text-white rounded-xl py-3 text-xs font-semibold hover:bg-error/90 transition-all shadow-sm disabled:opacity-50"
                >
                  {rejecting ? 'Rejecting…' : 'Confirm Rejection'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-5 border border-warm-gray/50 rounded-xl text-xs font-medium text-mid-gray hover:border-charcoal transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── DELIVERY STATUS & TRACKING MODAL ─── */}
      {isDeliveryModalOpen && selectedOrder && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-lg shadow-2xl p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-warm-gray/40 pb-4">
              <h3 className="font-brand text-xl text-charcoal">Delivery &amp; Tracking #{selectedOrder.order_number}</h3>
              <button onClick={() => setIsDeliveryModalOpen(false)} className="text-mid-gray hover:text-charcoal p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmDeliveryUpdate} className="space-y-4 text-xs">
              <div>
                <label className="input-label">Delivery Status *</label>
                <select
                  value={deliveryStatus}
                  onChange={(e) => setDeliveryStatus(e.target.value)}
                  className="input-field"
                >
                  <option value="APPROVED">Approved</option>
                  <option value="PROCESSING">Processing in Studio</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="OUT_FOR_DELIVERY">Out for Delivery</option>
                  <option value="DELIVERED">Delivered</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Courier Partner</label>
                  <input
                    type="text"
                    placeholder="e.g. BlueDart / Delhivery"
                    value={courierPartner}
                    onChange={(e) => setCourierPartner(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="input-label">Tracking AWB / Number</label>
                  <input
                    type="text"
                    placeholder="e.g. BD10982347"
                    value={trackingNumber}
                    onChange={(e) => setTrackingNumber(e.target.value)}
                    className="input-field font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Tracking Notes / Instructions</label>
                <textarea
                  placeholder="e.g. Package dispatched via BlueDart Air Express. Expected delivery in 3 days."
                  rows={3}
                  value={trackingNotes}
                  onChange={(e) => setTrackingNotes(e.target.value)}
                  className="input-field"
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-warm-gray/40">
                <button
                  type="submit"
                  disabled={updatingDelivery}
                  className="flex-1 bg-brass text-charcoal rounded-xl py-3 text-xs font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50"
                >
                  {updatingDelivery ? 'Saving…' : 'Update Delivery Details'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-5 border border-warm-gray/50 rounded-xl text-xs font-medium text-mid-gray hover:border-charcoal transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ─── PAYMENT PROOF PREVIEW MODAL ─── */}
      {previewImageUrl && (
        <div className="fixed inset-0 z-50 bg-charcoal/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl max-w-xl w-full p-6 space-y-4 text-center">
            <div className="flex justify-between items-center border-b border-warm-gray/40 pb-3">
              <h4 className="font-brand text-lg text-charcoal">Payment Screenshot Proof</h4>
              <button onClick={() => setPreviewImageUrl(null)} className="text-mid-gray hover:text-charcoal p-1">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto rounded-xl border bg-porcelain p-2">
              <img src={previewImageUrl} alt="Payment Screenshot" className="w-full h-auto object-contain mx-auto" />
            </div>
            <div className="pt-2 flex justify-end">
              <a href={previewImageUrl} target="_blank" rel="noopener noreferrer" className="btn-primary inline-flex items-center gap-2">
                <ExternalLink className="w-4 h-4" /> Open Full Image
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default AdminOrders;
