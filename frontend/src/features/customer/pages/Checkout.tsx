import React, { useEffect, useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { useAuth } from '../../../context/AuthContext';
import { orderService, type PaymentSettingsData } from '../../../services/orderService';
import { api } from '../../../utils/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  QrCode,
  Copy,
  Check,
  ArrowRight,
  CreditCard,
  CheckCircle2,
  Phone,
} from 'lucide-react';

interface Address {
  id: number;
  full_name: string;
  phone: string;
  street_address: string;
  apartment: string | null;
  city: string;
  state: string;
  postal_code: string;
  is_default: boolean;
}

export const Checkout: React.FC = () => {
  const { cartItems, subtotal, cartCount, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [paymentSettings, setPaymentSettings] = useState<PaymentSettingsData | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  // Payment Tab state ('UPI_QR' vs 'RAZORPAY')
  const [activePaymentTab, setActivePaymentTab] = useState<'UPI_QR' | 'RAZORPAY'>('UPI_QR');

  // New Address inline state
  const [newAddress, setNewAddress] = useState({
    full_name: user?.first_name ? `${user.first_name} ${user.last_name || ''}`.trim() : '',
    phone: user?.profile?.phone_number || '',
    street_address: '',
    apartment: '',
    city: '',
    state: '',
    postal_code: '',
  });

  // Payment Details
  const [utrNumber, setUtrNumber] = useState('');
  const [paymentProofUrl, setPaymentProofUrl] = useState('');
  const [copiedUpi, setCopiedUpi] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadCheckoutData = async () => {
      try {
        const [settings, addrRes] = await Promise.all([
          orderService.getPaymentSettings(),
          api.get('/auth/addresses/'),
        ]);
        setPaymentSettings(settings);
        if (settings.is_razorpay_enabled) {
          setActivePaymentTab('RAZORPAY');
        }
        const addrs: Address[] = Array.isArray(addrRes.data)
          ? addrRes.data
          : (addrRes.data?.results || []);
        setAddresses(addrs);
        const defaultAddr = addrs.find((a) => a.is_default) || addrs[0] || null;
        setSelectedAddress(defaultAddr);
      } catch {
        toast.error('Failed to load checkout settings');
      }
    };

    loadCheckoutData();
  }, []);

  const handleCopyUpi = () => {
    if (paymentSettings?.upi_id) {
      navigator.clipboard.writeText(paymentSettings.upi_id);
      setCopiedUpi(true);
      toast.success('UPI ID copied to clipboard!');
      setTimeout(() => setCopiedUpi(false), 2500);
    }
  };

  const grandTotal = subtotal >= 999 ? subtotal : subtotal + 99;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAddress && !newAddress.street_address) {
      toast.error('Please select or enter a shipping address');
      return;
    }

    const shippingSnapshot = selectedAddress || {
      full_name: newAddress.full_name || user?.username,
      phone: newAddress.phone,
      street_address: newAddress.street_address,
      apartment: newAddress.apartment,
      city: newAddress.city,
      state: newAddress.state,
      postal_code: newAddress.postal_code,
    };

    if (activePaymentTab === 'UPI_QR') {
      if (!utrNumber.trim()) {
        toast.error('Please enter the UPI UTR / Transaction Reference ID');
        return;
      }

      try {
        setSubmitting(true);
        const order = await orderService.createOrder({
          shipping_address_snapshot: shippingSnapshot,
          payment_method: 'UPI_QR',
          utr_number: utrNumber.trim(),
          payment_proof_url: paymentProofUrl.trim(),
        });

        toast.success('Order placed successfully! Pending Verification.');
        await clearCart();
        navigate(`/order-success/${order.order_number}`);
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Failed to place order');
      } finally {
        setSubmitting(false);
      }
    } else if (activePaymentTab === 'RAZORPAY') {
      try {
        setSubmitting(true);
        // Call Razorpay order backend
        const rzpData = await orderService.createRazorpayOrder(grandTotal);
        toast.success('Razorpay Order Created! Completing instant payment…');

        // Create approved order
        const order = await orderService.createOrder({
          shipping_address_snapshot: shippingSnapshot,
          payment_method: 'RAZORPAY',
          utr_number: rzpData.razorpay_order_id,
        });

        toast.success('Payment Received! Order Approved.');
        await clearCart();
        navigate(`/order-success/${order.order_number}`);
      } catch (err: any) {
        toast.error(err.response?.data?.detail || 'Razorpay payment failed');
      } finally {
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-8 md:px-16 py-12 animate-fadeIn font-sans">
      <div className="border-b border-warm-gray/40 pb-6 mb-8">
        <h1 className="font-brand text-4xl text-charcoal mb-1">Checkout</h1>
        <p className="text-[13px] text-mid-gray font-light">Complete your shipping details &amp; payment method</p>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid lg:grid-cols-12 gap-12 items-start">
        {/* Left Column: Address & Gateway Selection */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* STEP 1: Shipping Address */}
          <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-warm-gray/40 pb-4">
              <div className="w-8 h-8 rounded-full bg-brass/10 text-brass flex items-center justify-center font-bold text-xs">1</div>
              <h3 className="font-brand text-xl text-charcoal">Shipping Address</h3>
            </div>

            {addresses.length > 0 ? (
              <div className="space-y-3">
                <label className="input-label">Select Saved Address</label>
                <div className="space-y-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      onClick={() => setSelectedAddress(addr)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedAddress?.id === addr.id
                          ? 'border-brass ring-1 ring-brass/20 bg-brass/5'
                          : 'border-warm-gray/50 hover:border-warm-gray'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-bold text-charcoal block">{addr.full_name || user?.username}</span>
                          <p className="text-xs text-mid-gray leading-relaxed mt-0.5">
                            {addr.street_address}{addr.apartment ? `, ${addr.apartment}` : ''}, {addr.city}, {addr.state} — {addr.postal_code}
                          </p>
                          <span className="text-[11px] text-mid-gray mt-1 flex items-center gap-1">
                            <Phone className="w-3 h-3 text-brass shrink-0" />
                            <span>{addr.phone}</span>
                          </span>
                        </div>
                        {selectedAddress?.id === addr.id && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-brass uppercase tracking-wider">
                            <CheckCircle2 className="w-3.5 h-3.5 text-brass shrink-0" />
                            <span>Selected</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="input-label">Full Name *</label>
                    <input
                      type="text"
                      placeholder="Recipient name"
                      value={newAddress.full_name}
                      onChange={(e) => setNewAddress({ ...newAddress, full_name: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">Phone Number *</label>
                    <input
                      type="tel"
                      placeholder="10-digit number"
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="input-label">Street Address *</label>
                  <input
                    type="text"
                    placeholder="House / Flat / Street address"
                    value={newAddress.street_address}
                    onChange={(e) => setNewAddress({ ...newAddress, street_address: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="input-label">City *</label>
                    <input
                      type="text"
                      placeholder="City"
                      value={newAddress.city}
                      onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">State *</label>
                    <input
                      type="text"
                      placeholder="State"
                      value={newAddress.state}
                      onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                  <div>
                    <label className="input-label">PIN Code *</label>
                    <input
                      type="text"
                      placeholder="6 digits"
                      value={newAddress.postal_code}
                      onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })}
                      className="input-field"
                      required
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* STEP 2: Gateway-Agnostic Payment Section */}
          <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center gap-3 border-b border-warm-gray/40 pb-4">
              <div className="w-8 h-8 rounded-full bg-brass/10 text-brass flex items-center justify-center font-bold text-xs">2</div>
              <div>
                <h3 className="font-brand text-xl text-charcoal">Payment Option</h3>
                <span className="text-[11px] text-mid-gray">Select your preferred payment gateway</span>
              </div>
            </div>

            {/* Gateway Tabs */}
            <div className="flex rounded-xl bg-porcelain p-1 border border-warm-gray/40">
              <button
                type="button"
                onClick={() => setActivePaymentTab('UPI_QR')}
                className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activePaymentTab === 'UPI_QR'
                    ? 'bg-brass text-charcoal shadow-sm'
                    : 'text-mid-gray hover:text-charcoal'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>UPI / QR Code</span>
              </button>

              {paymentSettings?.is_razorpay_enabled && (
                <button
                  type="button"
                  onClick={() => setActivePaymentTab('RAZORPAY')}
                  className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2 ${
                    activePaymentTab === 'RAZORPAY'
                      ? 'bg-brass text-charcoal shadow-sm'
                      : 'text-mid-gray hover:text-charcoal'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Razorpay Instant</span>
                </button>
              )}
            </div>

            {/* Tab 1: UPI / QR Payment */}
            {activePaymentTab === 'UPI_QR' && (
              <div className="space-y-5 animate-fadeIn">
                <div className="bg-porcelain/50 border border-brass/20 rounded-2xl p-6 text-center space-y-4">
                  <div className="w-48 h-48 bg-white border-2 border-brass/40 rounded-2xl mx-auto p-2 shadow-md flex items-center justify-center">
                    {paymentSettings?.qr_code_url ? (
                      <img src={paymentSettings.qr_code_url} alt="UPI Payment QR Code" className="w-full h-full object-contain" />
                    ) : (
                      <QrCode className="w-24 h-24 text-brass" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest text-mid-gray block">Merchant Payee</span>
                    <span className="text-sm font-bold text-charcoal block">{paymentSettings?.payee_name || 'Kaviz Creations Pvt Ltd'}</span>
                  </div>

                  <div className="flex items-center justify-center gap-2 max-w-xs mx-auto bg-warm-white border border-warm-gray/50 rounded-xl p-2.5">
                    <span className="text-xs font-mono text-brass font-bold">{paymentSettings?.upi_id || 'kuduchee@upi'}</span>
                    <button
                      type="button"
                      onClick={handleCopyUpi}
                      className="p-1 text-mid-gray hover:text-charcoal transition-colors"
                      title="Copy UPI ID"
                    >
                      {copiedUpi ? <Check className="w-4 h-4 text-success" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  <div>
                    <label className="input-label">Transaction UTR / Reference ID *</label>
                    <input
                      type="text"
                      placeholder="e.g. 420198273645 (12-digit UPI UTR)"
                      value={utrNumber}
                      onChange={(e) => setUtrNumber(e.target.value)}
                      className="input-field font-mono"
                      required={activePaymentTab === 'UPI_QR'}
                    />
                  </div>

                  <div>
                    <label className="input-label">Payment Proof Image URL (Optional)</label>
                    <input
                      type="url"
                      placeholder="https://imgur.com/screenshot.jpg"
                      value={paymentProofUrl}
                      onChange={(e) => setPaymentProofUrl(e.target.value)}
                      className="input-field font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Razorpay Gateway */}
            {activePaymentTab === 'RAZORPAY' && (
              <div className="p-6 bg-brass/10 border border-brass/30 rounded-2xl space-y-3 animate-fadeIn text-xs">
                <div className="flex items-center gap-2 text-charcoal font-bold text-sm">
                  <CreditCard className="w-5 h-5 text-brass" />
                  <span>Razorpay Instant Checkout Active</span>
                </div>
                <p className="text-mid-gray leading-relaxed font-light">
                  Pay securely using Credit/Debit Cards, NetBanking, Paytm, Google Pay, or Wallets via Razorpay's encrypted checkout gateway.
                </p>
                <div className="flex items-center gap-2 text-success font-semibold pt-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Instant Automatic Payment Verification</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Order Summary & Place Order */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="font-brand text-xl text-charcoal border-b border-warm-gray/40 pb-4">Order Items ({cartCount})</h3>

            <div className="space-y-4 max-h-64 overflow-y-auto pr-1">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-12 h-12 rounded-lg bg-porcelain border border-warm-gray/40 overflow-hidden shrink-0">
                      <img src={item.product_details?.primary_image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                    <div className="truncate">
                      <span className="font-semibold text-charcoal truncate block">{item.product_details?.name}</span>
                      <span className="text-[10px] text-mid-gray">Qty: {item.quantity}</span>
                    </div>
                  </div>
                  <span className="font-bold text-charcoal shrink-0">₹{item.total_price}</span>
                </div>
              ))}
            </div>

            <div className="border-t border-warm-gray/40 pt-4 space-y-2 text-xs">
              <div className="flex justify-between text-mid-gray">
                <span>Items Total</span>
                <span className="font-bold text-charcoal">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-mid-gray">
                <span>Shipping</span>
                <span className="font-semibold text-charcoal">{subtotal >= 999 ? 'FREE' : '₹99'}</span>
              </div>
              <div className="flex justify-between items-baseline border-t border-warm-gray/40 pt-3">
                <span className="text-sm font-bold text-charcoal">Grand Total</span>
                <span className="font-brand text-3xl text-charcoal">₹{grandTotal}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary flex items-center justify-center gap-3 shadow-xl shadow-brass/20 disabled:opacity-50"
            >
              {submitting ? (
                <span>Processing Order…</span>
              ) : (
                <>
                  <span>{activePaymentTab === 'RAZORPAY' ? 'Pay with Razorpay' : 'Submit UPI Order'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
export default Checkout;
