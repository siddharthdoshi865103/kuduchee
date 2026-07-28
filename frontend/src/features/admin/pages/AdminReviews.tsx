import React, { useEffect, useState, useCallback } from 'react';
import { api } from '../../../utils/api';
import toast from 'react-hot-toast';
import {
  Star,
  CheckCircle2,
  Trash2,
  Clock,
  MessageSquare,
  RefreshCw,
  Filter,
  ShieldCheck,
} from 'lucide-react';

interface ReviewData {
  id: number;
  product: number;
  product_name?: string;
  user: number;
  username: string;
  user_first_name: string;
  rating: number;
  comment: string;
  is_verified_buyer: boolean;
  is_approved: boolean;
  created_at: string;
}

type FilterTab = 'pending' | 'approved' | 'all';

export const AdminReviews: React.FC = () => {
  const [reviews, setReviews] = useState<ReviewData[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<FilterTab>('pending');

  const loadReviews = useCallback(async () => {
    try {
      setLoading(true);
      // Admin gets all reviews (approved + pending) — no is_approved filter means admin sees all
      const res = await api.get('/reviews/');
      const data: ReviewData[] = res.data.results || res.data;

      // Also fetch product names for each review
      const productIds = [...new Set(data.map((r) => r.product))];
      const productMap: Record<number, string> = {};

      await Promise.all(
        productIds.map(async (pid) => {
          try {
            const pRes = await api.get(`/products/${pid}/`);
            productMap[pid] = pRes.data.name;
          } catch {
            productMap[pid] = `Product #${pid}`;
          }
        })
      );

      const enriched = data.map((r) => ({
        ...r,
        product_name: productMap[r.product] || `Product #${r.product}`,
      }));

      setReviews(enriched);
    } catch {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleApprove = async (reviewId: number) => {
    try {
      setActionLoading(reviewId);
      await api.post(`/reviews/${reviewId}/approve/`);
      setReviews((prev) =>
        prev.map((r) => (r.id === reviewId ? { ...r, is_approved: true } : r))
      );
      toast.success('Review approved and is now visible on the product page');
    } catch {
      toast.error('Failed to approve review');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (reviewId: number) => {
    if (!window.confirm('Delete this review permanently? This cannot be undone.')) return;
    try {
      setActionLoading(reviewId);
      await api.post(`/reviews/${reviewId}/reject/`);
      setReviews((prev) => prev.filter((r) => r.id !== reviewId));
      toast.success('Review deleted');
    } catch {
      toast.error('Failed to delete review');
    } finally {
      setActionLoading(null);
    }
  };

  const filtered = reviews.filter((r) => {
    if (activeTab === 'pending')  return !r.is_approved;
    if (activeTab === 'approved') return r.is_approved;
    return true;
  });

  const pendingCount  = reviews.filter((r) => !r.is_approved).length;
  const approvedCount = reviews.filter((r) =>  r.is_approved).length;

  const TABS: { key: FilterTab; label: string; count: number }[] = [
    { key: 'pending',  label: 'Pending Approval', count: pendingCount },
    { key: 'approved', label: 'Published',         count: approvedCount },
    { key: 'all',      label: 'All Reviews',       count: reviews.length },
  ];

  return (
    <div className="space-y-6 animate-fadeIn font-sans">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-brand text-3xl text-charcoal">Review Moderation</h1>
          <p className="text-xs text-mid-gray mt-1">
            Approve reviews before they appear publicly on product pages
          </p>
        </div>
        <button
          onClick={loadReviews}
          disabled={loading}
          className="inline-flex items-center gap-2 text-xs font-semibold text-mid-gray hover:text-charcoal border border-warm-gray/50 rounded-xl px-4 py-2 transition-all"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
          <Clock className="w-5 h-5 text-amber-600 mx-auto mb-1" />
          <p className="font-brand text-2xl text-amber-700">{pendingCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-600">Awaiting Review</p>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-2xl p-4 text-center">
          <CheckCircle2 className="w-5 h-5 text-green-600 mx-auto mb-1" />
          <p className="font-brand text-2xl text-green-700">{approvedCount}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-green-600">Published</p>
        </div>
        <div className="bg-porcelain border border-warm-gray/50 rounded-2xl p-4 text-center">
          <MessageSquare className="w-5 h-5 text-mid-gray mx-auto mb-1" />
          <p className="font-brand text-2xl text-charcoal">{reviews.length}</p>
          <p className="text-[10px] font-bold uppercase tracking-wider text-mid-gray">Total Reviews</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 bg-porcelain/60 border border-warm-gray/40 rounded-xl p-1">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-white shadow-sm text-charcoal border border-warm-gray/30'
                : 'text-mid-gray hover:text-charcoal'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            {tab.label}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
              activeTab === tab.key ? 'bg-brass/15 text-brass' : 'bg-warm-gray/30 text-mid-gray'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-24 text-center">
          <div className="w-8 h-8 border-3 border-brass border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs text-mid-gray uppercase tracking-widest">Loading reviews…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-warm-white border border-dashed border-warm-gray rounded-2xl p-16 text-center">
          <MessageSquare className="w-10 h-10 text-mid-gray/30 mx-auto mb-3" />
          <p className="font-brand text-xl text-charcoal mb-1">No Reviews Here</p>
          <p className="text-xs text-mid-gray">
            {activeTab === 'pending'
              ? 'All reviews have been moderated.'
              : activeTab === 'approved'
              ? 'No reviews have been approved yet.'
              : 'No reviews submitted yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <div
              key={review.id}
              className={`bg-warm-white border rounded-2xl p-5 md:p-6 shadow-sm transition-all ${
                review.is_approved
                  ? 'border-green-200 bg-green-50/30'
                  : 'border-amber-200 bg-amber-50/30'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                {/* Left: Review Content */}
                <div className="flex-1 space-y-3">
                  {/* Header row */}
                  <div className="flex flex-wrap items-center gap-2">
                    {/* Status pill */}
                    {review.is_approved ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-green-700 bg-green-100 border border-green-200 px-2.5 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" />
                        Published
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 border border-amber-200 px-2.5 py-0.5 rounded-full">
                        <Clock className="w-3 h-3" />
                        Pending Approval
                      </span>
                    )}

                    {review.is_verified_buyer && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-brass uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        Verified Buyer
                      </span>
                    )}
                  </div>

                  {/* Product + user info */}
                  <div className="text-xs">
                    <p className="font-bold text-charcoal">{review.product_name}</p>
                    <p className="text-mid-gray">
                      by <span className="font-semibold">{review.user_first_name || review.username}</span>
                      <span className="text-mid-gray/60 ml-2">@{review.username}</span>
                      <span className="ml-2">·</span>
                      <span className="ml-2">{new Date(review.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                    </p>
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${i < review.rating ? 'fill-brass text-brass' : 'text-warm-gray'}`}
                      />
                    ))}
                    <span className="text-xs font-bold text-charcoal ml-1">{review.rating}/5</span>
                  </div>

                  {/* Review Comment */}
                  <p className="text-xs text-charcoal/80 font-light leading-relaxed italic bg-white border border-warm-gray/30 rounded-xl p-4">
                    "{review.comment}"
                  </p>
                </div>

                {/* Right: Action Buttons */}
                <div className="flex sm:flex-col gap-2 shrink-0">
                  {!review.is_approved && (
                    <button
                      onClick={() => handleApprove(review.id)}
                      disabled={actionLoading === review.id}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all disabled:opacity-50 shadow-sm"
                    >
                      {actionLoading === review.id ? (
                        <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      Approve
                    </button>
                  )}
                  <button
                    onClick={() => handleReject(review.id)}
                    disabled={actionLoading === review.id}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold uppercase tracking-wider px-4 py-2.5 rounded-xl transition-all disabled:opacity-50"
                  >
                    {actionLoading === review.id ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminReviews;
