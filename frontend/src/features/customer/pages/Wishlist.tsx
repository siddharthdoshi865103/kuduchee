import React from 'react';
import { useWishlist } from '../../../context/WishlistContext';
import { useCart } from '../../../context/CartContext';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';

export const Wishlist: React.FC = () => {
  const { wishlistItems, toggleWishlist, loading } = useWishlist();
  const { addToCart } = useCart();

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Wishlist…</span>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-8 md:px-16 py-12 animate-fadeIn font-sans">
      <div className="border-b border-warm-gray/40 pb-6 mb-8">
        <h1 className="font-brand text-4xl text-charcoal mb-1">Saved Items</h1>
        <p className="text-[13px] text-mid-gray font-light">Your personal collection of saved studio ceramics</p>
      </div>

      {wishlistItems.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-16 text-center shadow-sm">
          <Heart className="w-12 h-12 text-mid-gray/30 mx-auto mb-4" />
          <h3 className="font-brand text-2xl text-charcoal mb-2">Your Wishlist is Empty</h3>
          <p className="text-[13px] text-mid-gray font-light max-w-sm mx-auto mb-6">
            Explore our studio collections and save items you love to view them later.
          </p>
          <Link to="/shop" className="btn-primary inline-flex items-center gap-2">
            <span>Explore Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
          {wishlistItems.map((item) => {
            const prod = item.product_details;
            if (!prod) return null;

            return (
              <div key={item.id} className="group bg-warm-white border border-warm-gray/40 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
                <div className="relative">
                  <div className="relative aspect-[4/5] bg-porcelain overflow-hidden rounded-t-2xl">
                    <button
                      onClick={() => toggleWishlist(prod.id)}
                      className="absolute top-3 left-3 z-10 w-8 h-8 bg-warm-white/95 hover:bg-error hover:text-white text-mid-gray rounded-full flex items-center justify-center transition-all shadow-xs"
                      title="Remove from Wishlist"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Floating Add to Cart circle button */}
                    <button
                      onClick={async () => {
                        await addToCart(prod.id);
                        await toggleWishlist(prod.id);
                      }}
                      className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-charcoal hover:bg-brass text-warm-white hover:text-charcoal flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 active:scale-95"
                      title="Move to Cart"
                    >
                      <ShoppingCart className="w-4 h-4" />
                    </button>

                    <img
                      src={prod.primary_image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80'}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                    />
                  </div>

                  <div className="p-3.5 md:p-5 space-y-1.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brass block">{prod.category_name}</span>
                    <Link to={`/product/${prod.slug}`} className="font-brand text-xs md:text-sm text-charcoal hover:text-brass transition-colors line-clamp-1 block leading-tight font-medium">
                      {prod.name}
                    </Link>

                    <div className="flex items-baseline gap-1.5 pt-0.5">
                      <span className="text-sm md:text-base font-extrabold text-charcoal">₹{prod.offer_price}</span>
                      {prod.mrp !== prod.offer_price && (
                        <span className="text-[10px] md:text-xs text-mid-gray/60 line-through">₹{prod.mrp}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
export default Wishlist;
