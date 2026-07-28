import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { orderService, type OrderData } from '../../../services/orderService';
import { CheckCircle2, ArrowRight } from 'lucide-react';

export const OrderSuccess: React.FC = () => {
  const { order_id } = useParams<{ order_id: string }>();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    const fetchOrder = async () => {
      if (!order_id) return;
      try {
        const data = await orderService.getOrderById(order_id);
        setOrder(data);
      } catch {
        // silent fallback
      }
    };

    fetchOrder();
  }, [order_id]);

  return (
    <div className="max-w-2xl mx-auto px-6 py-20 text-center font-sans animate-fadeUp">
      <div className="w-20 h-20 bg-brass/10 border-2 border-brass/30 rounded-full flex items-center justify-center mx-auto mb-6 text-brass shadow-md">
        <CheckCircle2 className="w-10 h-10" />
      </div>

      <span className="text-label block mb-2">Order Confirmed</span>
      <h1 className="font-brand text-4xl text-charcoal mb-3">Thank You for Your Order</h1>
      <p className="text-[13px] text-mid-gray font-light max-w-md mx-auto mb-8">
        We have received your order reference <strong className="text-charcoal">#{order_id}</strong>. Our studio team is verifying your payment UTR.
      </p>

      {order && (
        <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 text-left shadow-sm space-y-4 mb-8 text-xs">
          <div className="flex justify-between items-center border-b border-warm-gray/30 pb-3">
            <div>
              <span className="text-mid-gray block">Status</span>
              <span className="font-bold text-brass uppercase tracking-wider">{order.status.replace('_', ' ')}</span>
            </div>
            <div className="text-right">
              <span className="text-mid-gray block">Total Paid</span>
              <span className="font-bold text-charcoal text-base">₹{order.total_amount}</span>
            </div>
          </div>

          <div>
            <span className="text-mid-gray block mb-1 font-bold uppercase tracking-wider text-[10px]">Shipping Address</span>
            <p className="text-charcoal">
              {order.shipping_address_snapshot?.street_address}, {order.shipping_address_snapshot?.city}, {order.shipping_address_snapshot?.state} — {order.shipping_address_snapshot?.postal_code}
            </p>
          </div>

          {order.utr_number && (
            <div>
              <span className="text-mid-gray block mb-1 font-bold uppercase tracking-wider text-[10px]">Submitted UTR / Ref</span>
              <span className="font-mono text-brass font-semibold">{order.utr_number}</span>
            </div>
          )}
        </div>
      )}

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link to="/orders" className="btn-primary inline-flex items-center gap-2">
          <span>Track Order Status</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-brass hover:underline">
          Return to Shop
        </Link>
      </div>
    </div>
  );
};
export default OrderSuccess;
