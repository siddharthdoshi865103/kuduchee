import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { catalogService, type ProductData, type ProductVariantData } from '../../../services/catalogService';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  Star,
  Heart,
  ShoppingCart,
  ArrowLeft,
  Check,
  ShieldCheck,
  Truck,
  Sparkles,
  Plus,
  Minus,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Zap,
} from 'lucide-react';

interface ReviewData {
  id: number;
  username: string;
  user_first_name: string;
  rating: number;
  comment: string;
  is_verified_buyer: boolean;
  created_at: string;
}

export const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [product, setProduct] = useState<ProductData | null>(null);
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariantData | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  // Accordion Toggles
  const [openAccordion, setOpenAccordion] = useState<'details' | 'care' | 'shipping' | null>('details');

  // Review Form Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      if (!slug) return;
      try {
        setLoading(true);
        const prod = await catalogService.getProductBySlug(slug);
        if (prod) {
          setProduct(prod);
          setSelectedImage(prod.primary_image_url || '');
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }
          // Load reviews
          const res = await api.get(`/reviews/?product=${prod.id}`);
          setReviews(res.data.results || res.data);
        }
      } catch {
        toast.error('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center">
        <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <span className="text-xs font-medium text-mid-gray uppercase tracking-widest">Loading Product…</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-md mx-auto py-24 text-center px-6">
        <h2 className="font-brand text-3xl text-charcoal mb-2">Product Not Found</h2>
        <p className="text-[13px] text-mid-gray mb-6">The requested piece is no longer available in our collection.</p>
        <Link to="/shop" className="btn-primary">Return to Catalog</Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.offer_price || product.offer_price;
  const currentMrp = selectedVariant?.mrp || product.mrp;
  const currentStock = selectedVariant ? selectedVariant.stock_quantity : product.stock_quantity;
  const inWish = isInWishlist(product.id);

  const handleAddToCart = async () => {
    await addToCart(product.id, selectedVariant?.id || null, quantity);
  };

  const handleBuyNow = async () => {
    await addToCart(product.id, selectedVariant?.id || null, quantity);
    navigate('/checkout');
  };

  const handleAddReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim()) {
      toast.error('Please enter a review comment');
      return;
    }
    try {
      setSubmittingReview(true);
      await api.post('/reviews/', {
        product: product.id,
        rating: newRating,
        comment: newComment,
      });
      toast.success('Thank you! Your review has been published.');
      setIsReviewModalOpen(false);
      setNewComment('');
      // Reload reviews
      const res = await api.get(`/reviews/?product=${product.id}`);
      setReviews(res.data.results || res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Please sign in to write a review');
    } finally {
      setSubmittingReview(false);
    }
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 md:px-12 lg:px-16 py-8 md:py-12 animate-fadeIn font-sans">
      {/* Breadcrumb / Back Button */}
      <Link to="/shop" className="inline-flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.18em] text-mid-gray hover:text-brass transition-colors mb-6 md:mb-10">
        <ArrowLeft className="w-4 h-4" />
        Back to {product.category_name || 'Catalog'}
      </Link>

      <div className="grid lg:grid-cols-12 gap-6 md:gap-12 items-start">
        {/* Left Column: Image Gallery */}
        <div className="lg:col-span-5 space-y-3 md:space-y-4">
          <div className="relative aspect-square sm:aspect-[4/5] max-h-[480px] lg:max-h-[520px] w-full rounded-2xl md:rounded-3xl overflow-hidden bg-porcelain border border-warm-gray/40 shadow-xs">
            {product.badge && (
              <span className="absolute top-4 left-4 z-10 bg-brass text-charcoal text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm shadow-md">
                {product.badge}
              </span>
            )}
            <img
              src={selectedImage || product.primary_image_url}
              alt={product.name}
              className="w-full h-full object-cover transition-all duration-500"
            />
          </div>

          {/* Gallery Thumbnails */}
          {product.images && product.images.length > 0 && (
            <div className="flex items-center gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => setSelectedImage(product.primary_image_url)}
                className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                  selectedImage === product.primary_image_url ? 'border-brass ring-2 ring-brass/20' : 'border-warm-gray/50 opacity-70 hover:opacity-100'
                }`}
              >
                <img src={product.primary_image_url} alt="Thumbnail" className="w-full h-full object-cover" />
              </button>
              {product.images.map((img) => (
                <button
                  key={img.id}
                  onClick={() => setSelectedImage(img.image_url)}
                  className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    selectedImage === img.image_url ? 'border-brass ring-2 ring-brass/20' : 'border-warm-gray/50 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img.image_url} alt="Gallery" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Details & Actions */}
        <div className="lg:col-span-7 space-y-6 md:space-y-8">
          <div className="space-y-3">
            <span className="text-label">{product.category_name}</span>
            <h1 className="font-brand text-4xl text-charcoal leading-snug">{product.name}</h1>

            {/* Rating Stars & Reviews link */}
            <div className="flex items-center gap-2">
              <div className="flex text-brass">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-current" />
                ))}
              </div>
              <span className="text-xs font-semibold text-charcoal">{product.avg_rating || 5.0}</span>
              <span className="text-xs text-mid-gray">({reviews.length} customer reviews)</span>
            </div>

            {/* Pricing Display */}
            <div className="flex items-baseline gap-3 pt-2">
              <span className="font-brand text-3xl text-charcoal">₹{currentPrice}</span>
              {currentMrp !== currentPrice && (
                <span className="text-sm text-mid-gray line-through">₹{currentMrp}</span>
              )}
              {currentMrp !== currentPrice && (
                <span className="bg-brass/15 text-brass text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded">
                  Save ₹{Number(currentMrp) - Number(currentPrice)}
                </span>
              )}
            </div>
          </div>

          <p className="text-[13px] text-mid-gray font-light leading-relaxed border-t border-warm-gray/40 pt-4">
            {product.description || 'Handcrafted stoneware piece fired at 1280°C with organic mineral glazes.'}
          </p>

          {/* Variants Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="input-label">Select Option / Variant</label>
              <div className="flex flex-wrap gap-3">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                      selectedVariant?.id === v.id
                        ? 'bg-brass text-charcoal shadow-sm'
                        : 'bg-warm-white border border-warm-gray/50 text-mid-gray hover:text-charcoal'
                    }`}
                  >
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Level Pill */}
          <div>
            {currentStock === 0 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-error bg-error/10 border border-error/20 px-3 py-1 rounded-full uppercase tracking-wider">
                Out of Stock
              </span>
            ) : currentStock <= 5 ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full uppercase tracking-wider">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Only {currentStock} units left in studio batch</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-success bg-success/10 border border-success/20 px-3 py-1 rounded-full uppercase tracking-wider">
                <Check className="w-3.5 h-3.5" /> In Stock &amp; Ready to Ship
              </span>
            )}
          </div>

          {/* Quantity Stepper & Buttons */}
          <div className="space-y-3 pt-2">
            {/* Quantity + Wishlist row */}
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-warm-gray/60 rounded-xl bg-warm-white overflow-hidden shrink-0">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="p-3 text-mid-gray hover:text-charcoal transition-colors"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="px-4 text-xs font-bold text-charcoal min-w-[2rem] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(currentStock || 10, q + 1))}
                  className="p-3 text-mid-gray hover:text-charcoal transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              <span className="text-[11px] text-mid-gray">qty</span>
              <button
                onClick={() => toggleWishlist(product.id)}
                className={`ml-auto p-3 rounded-xl border transition-all ${
                  inWish
                    ? 'bg-brass/20 text-brass border-brass/40'
                    : 'border-warm-gray/60 text-mid-gray hover:text-brass'
                }`}
                title="Save to Wishlist"
              >
                <Heart className={`w-5 h-5 ${inWish ? 'fill-brass' : ''}`} />
              </button>
            </div>

            {/* CTA Buttons row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                disabled={currentStock === 0}
                className="btn-outline flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>
              <button
                onClick={handleBuyNow}
                disabled={currentStock === 0}
                className="btn-primary flex items-center justify-center gap-2 py-3.5 disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
              >
                <Zap className="w-4 h-4" />
                <span>Buy Now</span>
              </button>
            </div>
          </div>

          {/* Craft Pillars */}
          <div className="grid grid-cols-3 gap-4 border-y border-warm-gray/40 py-6 text-center text-[11px] text-mid-gray">
            <div className="space-y-1">
              <Sparkles className="w-4 h-4 text-brass mx-auto" />
              <span className="font-semibold text-charcoal block">Hand-Thrown</span>
              <span>Gujarat Studio</span>
            </div>
            <div className="space-y-1">
              <ShieldCheck className="w-4 h-4 text-brass mx-auto" />
              <span className="font-semibold text-charcoal block">100% Lead-Free</span>
              <span>Food Grade Glaze</span>
            </div>
            <div className="space-y-1">
              <Truck className="w-4 h-4 text-brass mx-auto" />
              <span className="font-semibold text-charcoal block">Eco Padded</span>
              <span>Insured Delivery</span>
            </div>
          </div>

          {/* Accordions */}
          <div className="space-y-3 text-xs divide-y divide-warm-gray/30">
            {/* Details */}
            <div className="pt-3">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'details' ? null : 'details')}
                className="w-full flex items-center justify-between font-bold text-charcoal py-2 text-left uppercase tracking-wider"
              >
                <span>Craft &amp; Materials</span>
                {openAccordion === 'details' ? <ChevronUp className="w-4 h-4 text-brass" /> : <ChevronDown className="w-4 h-4 text-mid-gray" />}
              </button>
              {openAccordion === 'details' && (
                <div className="py-3 text-mid-gray leading-relaxed font-light space-y-2">
                  <p>Fired in electric studio kilns at 1280°C for high thermal shock resistance.</p>
                  <p>Each piece exhibits subtle natural variations in texture and tone — making your item one-of-a-kind.</p>
                </div>
              )}
            </div>

            {/* Care */}
            <div className="pt-3">
              <button
                onClick={() => setOpenAccordion(openAccordion === 'care' ? null : 'care')}
                className="w-full flex items-center justify-between font-bold text-charcoal py-2 text-left uppercase tracking-wider"
              >
                <span>Care &amp; Maintenance</span>
                {openAccordion === 'care' ? <ChevronUp className="w-4 h-4 text-brass" /> : <ChevronDown className="w-4 h-4 text-mid-gray" />}
              </button>
              {openAccordion === 'care' && (
                <div className="py-3 text-mid-gray leading-relaxed font-light space-y-2">
                  <p>Dishwasher safe on gentle cycle. Microwave safe except for brass-detailed ranges.</p>
                  <p>Wash with soft sponge and gentle detergent to preserve glaze luster.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ═══ REVIEWS SECTION ═══ */}
      <section className="mt-24 border-t border-warm-gray/40 pt-16 space-y-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-label">Verified Customer Feedback</span>
            <h2 className="font-brand text-3xl text-charcoal">Customer Reviews ({reviews.length})</h2>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="btn-outline flex items-center gap-2 self-start sm:self-auto"
          >
            <span>Write a Review</span>
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-10 text-center">
            <Star className="w-8 h-8 text-mid-gray/30 mx-auto mb-3" />
            <p className="text-sm text-mid-gray font-medium">Be the first to review this studio piece</p>
            <button onClick={() => setIsReviewModalOpen(true)} className="text-xs font-bold text-brass uppercase tracking-widest mt-2 hover:underline">
              Share Your Thoughts →
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div key={rev.id} className="bg-warm-white border border-warm-gray/50 rounded-2xl p-6 shadow-sm space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex text-brass">
                    {Array.from({ length: rev.rating }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-[10px] text-mid-gray">{new Date(rev.created_at).toLocaleDateString()}</span>
                </div>
                <p className="text-xs text-charcoal/80 font-light italic leading-relaxed">"{rev.comment}"</p>
                <div className="text-[11px] font-bold text-charcoal">
                  {rev.user_first_name || rev.username}
                  {rev.is_verified_buyer && (
                    <span className="inline-flex items-center gap-1 ml-2 text-[9px] font-normal text-brass uppercase tracking-wider">
                      <CheckCircle2 className="w-3 h-3 text-brass shrink-0" />
                      <span>Verified Buyer</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Review Modal */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl w-full max-w-md shadow-2xl p-8 space-y-6">
            <h3 className="font-brand text-2xl text-charcoal">Write a Customer Review</h3>
            <form onSubmit={handleAddReview} className="space-y-4">
              <div>
                <label className="input-label">Your Rating</label>
                <div className="flex gap-2 text-brass">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                    >
                      <Star className={`w-6 h-6 ${star <= newRating ? 'fill-current' : 'text-warm-gray'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="input-label">Your Review *</label>
                <textarea
                  placeholder="Share details of your experience with this studio item…"
                  rows={4}
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-1 bg-brass text-charcoal rounded-xl py-3 text-xs font-semibold hover:bg-brass-hover transition-all shadow-sm disabled:opacity-50"
                >
                  {submittingReview ? 'Submitting…' : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={() => setIsReviewModalOpen(false)}
                  className="px-5 border border-warm-gray/50 rounded-xl text-xs font-medium text-mid-gray hover:border-charcoal transition-colors"
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
export default ProductDetail;
