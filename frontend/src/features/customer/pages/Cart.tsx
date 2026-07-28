import React, { useState } from 'react';
import { useCart } from '../../../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ShoppingCart,
  Plus,
  Minus,
  ArrowRight,
  ShieldCheck,
  Truck,
  Tag,
  Sparkles,
} from 'lucide-react';

export const Cart: React.FC = () => {
  const { cartItems, cartCount, subtotal, updateQuantity, removeFromCart, loading } = useCart();
  const navigate = useNavigate();

  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);

  const FREE_SHIPPING_THRESHOLD = 999;
  const missingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'KUDUCHEE10') {
      setDiscount(Math.round(subtotal * 0.1));
      toast.success('10% Kuduchee Welcome Discount applied!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const grandTotal = Math.max(0, subtotal - discount);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Updating Cart…</span>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 md:px-12 lg:px-16 py-6 md:py-12 animate-fadeIn font-sans">
      <div className="border-b border-warm-gray/40 pb-4 mb-5 md:mb-8">
        <h1 className="font-brand text-2xl md:text-4xl text-charcoal mb-1">Shopping Cart</h1>
        <p className="text-[13px] text-mid-gray font-light">Review your studio selections before checkout</p>
      </div>

      {cartItems.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-16 text-center shadow-sm">
          <ShoppingCart className="w-12 h-12 text-mid-gray/30 mx-auto mb-4" />
          <h3 className="font-brand text-2xl text-charcoal mb-2">Your Shopping Cart is Empty</h3>
          <p className="text-[13px] text-mid-gray font-light max-w-sm mx-auto mb-6">
            Explore our handcrafted stoneware collections and add items to your cart.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <span>Explore Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-12 gap-6 lg:gap-12 items-start">
          {/* Left Column: Cart Items List */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Free Shipping Progress Bar */}
            <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm space-y-3">
              <div className="flex items-center justify-between text-xs font-semibold text-charcoal">
                <span className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-brass" />
                  {missingForFreeShipping === 0 ? (
                    <span className="flex items-center gap-1.5 text-brass">
                      <Sparkles className="w-4 h-4 text-brass shrink-0" />
                      <span>You unlocked Free Express Shipping across India!</span>
                    </span>
                  ) : (
                    `Add ₹${missingForFreeShipping} more to unlock Free Delivery!`
                  )}
                </span>
                <span className="text-[10px] text-mid-gray uppercase tracking-wider">{Math.round(freeShippingProgress)}%</span>
              </div>
              <div className="w-full bg-porcelain rounded-full h-2 overflow-hidden border border-warm-gray/30">
                <div
                  className="bg-brass h-full transition-all duration-500 rounded-full"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>

            {/* Cart Table */}
            <div className="bg-warm-white border border-warm-gray/50 rounded-2xl overflow-hidden shadow-sm divide-y divide-warm-gray/30">
              {cartItems.map((item) => {
                const prod = item.product_details;
                if (!prod) return null;

                return (
                  <div key={item.id} className="p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-xl bg-porcelain border border-warm-gray/40 overflow-hidden shrink-0">
                        <img
                          src={prod.primary_image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80'}
                          alt={prod.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-mid-gray">{prod.category_name}</span>
                        <h3 className="font-brand text-base text-charcoal">{prod.name}</h3>
                        {item.variant_details && (
                          <span className="text-xs text-brass font-medium block">Option: {item.variant_details.name}</span>
                        )}
                        <span className="text-xs font-bold text-charcoal block sm:hidden">₹{item.unit_price}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 border-t sm:border-0 pt-3 sm:pt-0 border-warm-gray/30">
                      {/* Stepper */}
                      <div className="flex items-center border border-warm-gray/60 rounded-xl bg-porcelain/40 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-2 text-mid-gray hover:text-charcoal transition-colors"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="px-3 text-xs font-bold text-charcoal">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-2 text-mid-gray hover:text-charcoal transition-colors"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-base font-bold text-charcoal block">₹{item.total_price}</span>
                        <button
                          onClick={() => removeFromCart(item.id)}
                          className="text-[10px] text-mid-gray hover:text-error transition-colors underline"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Order Summary — below items on mobile, sidebar on desktop */}
          <div className="lg:col-span-4 space-y-4 lg:space-y-6">
            <div className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm space-y-6">
              <h3 className="font-brand text-xl text-charcoal border-b border-warm-gray/40 pb-4">Order Summary</h3>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between text-mid-gray">
                  <span>Subtotal ({cartCount} items)</span>
                  <span className="font-bold text-charcoal">₹{subtotal}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-success">
                    <span>Promo Discount (10%)</span>
                    <span className="font-bold">-₹{discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-mid-gray">
                  <span>Estimated Delivery</span>
                  <span className="font-semibold text-charcoal">
                    {missingForFreeShipping === 0 ? 'FREE' : '₹99'}
                  </span>
                </div>
              </div>

              {/* Promo Code Form */}
              <form onSubmit={handleApplyPromo} className="flex gap-2 pt-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-mid-gray absolute left-3 top-3" />
                  <input
                    type="text"
                    placeholder="KUDUCHEE10"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    className="w-full bg-porcelain/60 border border-warm-gray/40 rounded-xl pl-9 pr-3 py-2 text-xs uppercase text-charcoal focus:outline-none focus:border-brass"
                  />
                </div>
                <button
                  type="submit"
                  className="bg-charcoal text-warm-white text-[10px] font-semibold uppercase tracking-wider px-4 rounded-xl hover:bg-brass hover:text-charcoal transition-colors"
                >
                  Apply
                </button>
              </form>

              <div className="border-t border-warm-gray/40 pt-4 flex justify-between items-baseline">
                <div>
                  <span className="text-xs uppercase tracking-wider font-bold text-charcoal block">Total</span>
                  <span className="text-[10px] text-mid-gray font-light">Inclusive of all taxes</span>
                </div>
                <span className="font-brand text-3xl text-charcoal">
                  ₹{grandTotal + (missingForFreeShipping === 0 ? 0 : 99)}
                </span>
              </div>

              <button
                onClick={() => navigate('/checkout')}
                className="w-full btn-primary flex items-center justify-center gap-3 shadow-xl shadow-brass/15"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 bg-brass/10 border border-brass/20 rounded-xl flex items-center gap-3 text-xs text-charcoal">
              <ShieldCheck className="w-5 h-5 text-brass shrink-0" />
              <span className="font-light">Safe &amp; insured studio packaging guaranteed.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default Cart;
