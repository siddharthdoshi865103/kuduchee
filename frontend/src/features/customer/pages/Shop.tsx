import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { catalogService, type ProductData, type CategoryData } from '../../../services/catalogService';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { SEO } from '../../../components/SEO';
import {
  Filter,
  Grid,
  List,
  Search,
  Heart,
  ShoppingCart,
  Star,
  SlidersHorizontal,
  TrendingUp,
  Clock,
  Crown,
  Sparkles,
  Award,
  Flame,
  Gem,
  ShieldCheck,
} from 'lucide-react';

/* ────────────────────────────────────────────────────────────
   SECTION THEME DEFINITIONS — Color Psychology
   ─────────────────────────────────────────────────────────── */

interface SectionTheme {
  heroTag: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBg: string;
  heroOverlay: string;
  heroImage: string;
  heroIcon: React.ReactNode;
  heroBadge: string;
  heroBadgeClass: string;
  cardBorder: string;
  cardHover: string;
  cardBadge: string;
  cardBadgeClass: string;
  btnClass: string;
  accentColor: string;
  pillActive: string;
  pillInactive: string;
  toolbarClass: string;
  gridBg: string;
}

const SECTION_THEMES: Record<string, SectionTheme> = {
  /* ── SHOP ALL: Warm neutral, welcoming, exploratory ──
     Psychology: Beige/ivory = safety, warmth, approachability.
     The user feels invited to browse without pressure. */
  '': {
    heroTag: 'EXPLORE COLLECTION',
    heroTitle: 'All Studio Ceramics',
    heroSubtitle: 'Browse our complete range of handcrafted porcelain, tableware, and artisan pottery pieces.',
    heroBg: 'bg-gradient-to-br from-[#F4EFEA] via-[#FAF8F5] to-[#E8E0D5]',
    heroOverlay: '',
    heroImage: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&q=80',
    heroIcon: <Search className="w-5 h-5" />,
    heroBadge: 'FULL CATALOG',
    heroBadgeClass: 'bg-charcoal/10 text-charcoal border-charcoal/20',
    cardBorder: 'border-warm-gray/50 shadow-sm hover:shadow-xl',
    cardHover: 'hover:border-brass/50',
    cardBadge: '',
    cardBadgeClass: 'bg-brass text-charcoal',
    btnClass: 'bg-charcoal text-warm-white hover:bg-brass hover:text-charcoal',
    accentColor: 'text-brass',
    pillActive: 'bg-brass text-charcoal border-brass',
    pillInactive: 'bg-warm-white text-mid-gray border-warm-gray/50 hover:border-charcoal hover:text-charcoal',
    toolbarClass: 'bg-warm-white border-warm-gray/50',
    gridBg: '',
  },

  /* ── BEST SELLERS: Warm amber & social proof ──
     Psychology: Orange/amber = enthusiasm, confidence, social validation.
     Triggers herd instinct — "others love this, I should too." */
  /* ── BEST SELLERS: Warm Terracotta Orange & Social Validation ── */
  'best-sellers': {
    heroTag: 'MOST LOVED BY COLLECTORS',
    heroTitle: 'Best Seller Collection',
    heroSubtitle: 'The pieces our customers keep coming back for. Handpicked favorites rated 5-stars by over 500+ collectors across India.',
    heroBg: 'bg-gradient-to-br from-[#2D2D2D] via-[#241E18] to-[#1A1510]',
    heroOverlay: 'bg-gradient-to-r from-[#D69151]/15 via-transparent to-[#C2B280]/10',
    heroImage: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=800&q=80',
    heroIcon: <TrendingUp className="w-5 h-5 text-[#D69151]" />,
    heroBadge: '500+ HAPPY COLLECTORS',
    heroBadgeClass: 'bg-[#D69151]/20 text-[#D69151] border-[#D69151]/40',
    cardBorder: 'border-[#D69151]/40 shadow-terracotta-glow',
    cardHover: 'hover:shadow-[0_8px_30px_-4px_rgba(214,145,81,0.35)] hover:border-[#D69151]',
    cardBadge: 'BEST SELLER',
    cardBadgeClass: 'bg-[#D69151] text-[#EFE8E2]',
    btnClass: 'btn-terracotta',
    accentColor: 'text-[#D69151]',
    pillActive: 'bg-[#D69151] text-[#EFE8E2] border-[#D69151]',
    pillInactive: 'bg-[#EFE8E2] text-[#767067] border-[#D8CEC4] hover:border-[#D69151] hover:text-[#D69151]',
    toolbarClass: 'bg-[#EFE8E2] border-[#D8CEC4]',
    gridBg: 'bg-gradient-to-b from-[#D69151]/10 to-transparent rounded-3xl p-4 md:p-6',
  },

  /* ── NEW ARRIVALS: Soft Sage Green & Studio Launches ── */
  'new-arrivals': {
    heroTag: 'FRESH FROM THE KILN',
    heroTitle: 'New Studio Arrivals',
    heroSubtitle: 'Freshly glazed pieces straight from the 1280°C Ahmedabad kiln. Be the first to own these new creations.',
    heroBg: 'bg-gradient-to-br from-[#2D2D2D] via-[#1E241C] to-[#121A12]',
    heroOverlay: 'bg-gradient-to-r from-[#A8BC8F]/15 via-transparent to-[#C2B280]/10',
    heroImage: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
    heroIcon: <Clock className="w-5 h-5 text-[#A8BC8F]" />,
    heroBadge: 'JUST LAUNCHED',
    heroBadgeClass: 'bg-[#A8BC8F]/20 text-[#A8BC8F] border-[#A8BC8F]/40',
    cardBorder: 'border-[#A8BC8F]/40 shadow-sage-glow',
    cardHover: 'hover:shadow-[0_8px_30px_-4px_rgba(168,188,143,0.35)] hover:border-[#A8BC8F]',
    cardBadge: 'NEW ARRIVAL',
    cardBadgeClass: 'bg-[#A8BC8F] text-[#2D2D2D]',
    btnClass: 'btn-sage',
    accentColor: 'text-[#A8BC8F]',
    pillActive: 'bg-[#A8BC8F] text-[#2D2D2D] border-[#A8BC8F]',
    pillInactive: 'bg-[#EFE8E2] text-[#767067] border-[#D8CEC4] hover:border-[#A8BC8F] hover:text-[#A8BC8F]',
    toolbarClass: 'bg-[#EFE8E2] border-[#D8CEC4]',
    gridBg: 'bg-gradient-to-b from-[#A8BC8F]/10 to-transparent rounded-3xl p-4 md:p-6',
  },

  /* ── EXCLUSIVE STORE: Deep Obsidian & Kuduchee Olive Gold ── */
  'exclusive': {
    heroTag: 'LIMITED EDITION MASTERPIECES',
    heroTitle: 'The Exclusive Store',
    heroSubtitle: 'Bespoke, limited-run clay masterpieces for the discerning collector. Each piece is numbered and comes with a certificate of authenticity.',
    heroBg: 'bg-gradient-to-br from-[#2D2D2D] via-[#1F1F1F] to-[#141414]',
    heroOverlay: 'bg-gradient-to-r from-[#C2B280]/15 via-transparent to-[#CEAA9D]/10',
    heroImage: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80',
    heroIcon: <Crown className="w-5 h-5 text-[#C2B280]" />,
    heroBadge: 'COLLECTOR\'S EDITION',
    heroBadgeClass: 'bg-[#C2B280]/20 text-[#C2B280] border-[#C2B280]/40',
    cardBorder: 'border-[#C2B280]/40 shadow-brass-glow',
    cardHover: 'hover:shadow-[0_12px_45px_-8px_rgba(194,178,128,0.4)] hover:border-[#C2B280]',
    cardBadge: 'EXCLUSIVE BATCH',
    cardBadgeClass: 'bg-[#C2B280] text-[#2D2D2D]',
    btnClass: 'btn-primary',
    accentColor: 'text-[#C2B280]',
    pillActive: 'bg-[#C2B280] text-[#2D2D2D] border-[#C2B280]',
    pillInactive: 'bg-[#2D2D2D] text-[#EFE8E2]/80 border-[#C2B280]/25 hover:border-[#C2B280] hover:text-[#C2B280]',
    toolbarClass: 'bg-[#2D2D2D] border-[#C2B280]/25 text-[#EFE8E2]',
    gridBg: 'bg-gradient-to-b from-[#2D2D2D]/40 to-transparent rounded-3xl p-4 md:p-6',
  },
};

export const Shop: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategorySlug = searchParams.get('category') || '';
  const selectedSubCategorySlug = searchParams.get('subcategory') || '';
  const initialSearch = searchParams.get('search') || '';
  const section = searchParams.get('section') || '';

  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();

  const [products, setProducts] = useState<ProductData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [ordering, setOrdering] = useState('-created_at');
  const [viewMode, setViewMode] = useState<'GRID' | 'LIST'>('GRID');
  const [addingId, setAddingId] = useState<number | null>(null);

  const theme = SECTION_THEMES[section] || SECTION_THEMES[''];

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setLoading(true);
        const [cats, prods] = await Promise.all([
          catalogService.getCategories(),
          catalogService.getProducts({
            category__slug: selectedCategorySlug || undefined,
            sub_category__slug: selectedSubCategorySlug || undefined,
            search: searchQuery || undefined,
            ordering: section === 'new-arrivals' ? '-created_at' : (ordering || undefined),
            badge: section === 'best-sellers' ? 'Best Seller' :
                   section === 'new-arrivals' ? 'New Arrival' :
                   section === 'exclusive' ? 'Exclusive' : undefined,
          }),
        ]);
        setCategories(cats);
        setProducts(prods);
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [selectedCategorySlug, selectedSubCategorySlug, searchQuery, ordering, section]);

  const handleCategorySelect = (slug: string) => {
    searchParams.delete('subcategory');
    if (slug === selectedCategorySlug) {
      searchParams.delete('category');
    } else {
      searchParams.set('category', slug);
    }
    setSearchParams(searchParams);
  };

  const handleSubCategorySelect = (subSlug: string) => {
    if (subSlug === selectedSubCategorySlug) {
      searchParams.delete('subcategory');
    } else {
      searchParams.set('subcategory', subSlug);
    }
    setSearchParams(searchParams);
  };

  const handleQuickAdd = async (e: React.MouseEvent, prodId: number) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      setAddingId(prodId);
      await addToCart(prodId, null, 1);
    } finally {
      setAddingId(null);
    }
  };

  const isExclusive = section === 'exclusive';
  const isBestSeller = section === 'best-sellers';
  const isNewArrivals = section === 'new-arrivals';
  const isSpecialSection = isExclusive || isBestSeller || isNewArrivals;

  return (
    <div className={`animate-fadeIn font-sans ${isExclusive ? 'bg-[#0A0907]' : ''}`}>
      <SEO
        title={
          isExclusive ? '✦ Exclusive Studio Collection — Kuduchee (Kudu Chee)' :
          isBestSeller ? 'Best Sellers Crockery & Porcelain — Kuduchee (Kudu Chee)' :
          isNewArrivals ? 'New Studio Arrivals — Kuduchee (Kudu Chee)' :
          'Shop Artisan Porcelain & Ceramic Tableware — Kuduchee (Kudu Chee)'
        }
        description="Explore Kuduchee (Kudu Chee) studio collection. Handcrafted 1280°C high-fired porcelain dinner sets, quarter plates, serving bowls & ceramic coffee mugs by Anil Panda."
        canonicalUrl="https://kuduchee.in/shop"
      />

      {/* ═══════════════════════════════════════════
          HERO BANNER — Unique per section
          ═══════════════════════════════════════════ */}
      {isSpecialSection ? (
        <div className={`relative overflow-hidden ${theme.heroBg}`}>
          {/* Background Image */}
          <div className="absolute inset-0 z-0">
            <img
              src={theme.heroImage}
              alt={theme.heroTitle}
              className="w-full h-full object-cover opacity-20 mix-blend-luminosity"
            />
            <div className={`absolute inset-0 ${theme.heroOverlay}`} />
          </div>

          {/* Ambient glow orbs */}
          {isBestSeller && (
            <>
              <div className="absolute top-0 right-1/4 w-72 h-72 rounded-full bg-amber-500/8 blur-[100px]" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-amber-600/5 blur-[120px]" />
            </>
          )}
          {isNewArrivals && (
            <>
              <div className="absolute top-0 left-1/3 w-72 h-72 rounded-full bg-emerald-500/8 blur-[100px]" />
              <div className="absolute bottom-0 right-1/3 w-96 h-96 rounded-full bg-teal-500/5 blur-[120px]" />
            </>
          )}
          {isExclusive && (
            <>
              <div className="absolute top-0 right-1/4 w-80 h-80 rounded-full bg-[#C2B267]/8 blur-[100px] animate-float" />
              <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full bg-[#B91C1C]/5 blur-[120px] animate-float" style={{ animationDelay: '-3s' }} />
            </>
          )}

          <div className="relative z-10 max-w-screen-xl mx-auto px-4 md:px-8 lg:px-16 pt-24 md:pt-32 pb-12 md:pb-20">
            <div className="max-w-2xl space-y-5">
              {/* Section Badge */}
              <div className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-[9px] font-extrabold uppercase tracking-[0.2em] border ${theme.heroBadgeClass}`}>
                {theme.heroIcon}
                <span>{theme.heroBadge}</span>
              </div>

              {/* Section Tag */}
              <span className={`block text-[10px] font-bold uppercase tracking-[0.3em] ${
                isBestSeller ? 'text-amber-400/70' :
                isNewArrivals ? 'text-emerald-400/70' :
                'text-[#C2B267]/70'
              }`}>
                {theme.heroTag}
              </span>

              {/* Title */}
              <h1 className={`font-brand text-4xl md:text-5xl lg:text-6xl tracking-tight leading-[1.1] ${
                isExclusive ? 'text-[#FAF8F5]' : 'text-white'
              }`}>
                {theme.heroTitle}
              </h1>

              {/* Subtitle */}
              <p className={`text-sm md:text-base leading-relaxed font-light max-w-lg ${
                isBestSeller ? 'text-amber-100/60' :
                isNewArrivals ? 'text-emerald-100/60' :
                'text-[#FAF8F5]/50'
              }`}>
                {theme.heroSubtitle}
              </p>

              {/* Trust Signals */}
              <div className={`flex flex-wrap items-center gap-4 pt-2 text-[10px] font-semibold uppercase tracking-wider ${
                isBestSeller ? 'text-amber-300/60' :
                isNewArrivals ? 'text-emerald-300/60' :
                'text-[#D4B892]/50'
              }`}>
                {isBestSeller && (
                  <>
                    <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5" /> Top Rated</span>
                    <span className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" /> Trending Now</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Studio Verified</span>
                  </>
                )}
                {isNewArrivals && (
                  <>
                    <span className="flex items-center gap-1.5"><Flame className="w-3.5 h-3.5" /> 1280°C Fired</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> This Week</span>
                    <span className="flex items-center gap-1.5"><Sparkles className="w-3.5 h-3.5" /> First Batch</span>
                  </>
                )}
                {isExclusive && (
                  <>
                    <span className="flex items-center gap-1.5"><Gem className="w-3.5 h-3.5" /> Numbered Pieces</span>
                    <span className="flex items-center gap-1.5"><Crown className="w-3.5 h-3.5" /> Certificate of Authenticity</span>
                    <span className="flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> Limited Run</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Bottom edge fade */}
          <div className={`absolute bottom-0 left-0 right-0 h-16 ${
            isExclusive ? 'bg-gradient-to-t from-[#0A0907]' :
            'bg-gradient-to-t from-[#FAF8F5]'
          }`} />
        </div>
      ) : (
        /* Default Shop header — simple warm banner */
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 lg:px-16 pt-6 md:pt-12">
          <div className="border-b border-warm-gray/40 pb-4 md:pb-6">
            <span className="text-label block mb-1">Explore Studio Ceramics</span>
            <h1 className="font-brand text-3xl md:text-4xl lg:text-5xl text-charcoal">{theme.heroTitle}</h1>
            <p className="text-xs text-mid-gray mt-1.5 font-light">{theme.heroSubtitle}</p>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════
          MAIN CONTENT AREA
          ═══════════════════════════════════════════ */}
      <div className={`max-w-screen-xl mx-auto px-4 md:px-8 lg:px-16 py-6 md:py-10 space-y-6 md:space-y-8 ${
        isExclusive ? 'text-[#FAF8F5]' : ''
      }`}>

        {/* ─── FACETED CATEGORIES & SUB-CATEGORIES FILTER ─── */}
        <div className="space-y-3">
          <div className="-mx-4 px-4 md:mx-0 md:px-0 overflow-x-auto scrollbar-hide">
            <div className="flex items-center gap-2 md:flex-wrap pb-1 md:pb-0" style={{ minWidth: 'max-content' }}>
              <button
                onClick={() => handleCategorySelect('')}
                className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                  !selectedCategorySlug ? theme.pillActive : theme.pillInactive
                }`}
              >
                All Items
              </button>

              {categories.map((cat) => {
                const isSelected = selectedCategorySlug === cat.slug;
                return (
                  <button
                    key={cat.id}
                    onClick={() => handleCategorySelect(cat.slug)}
                    className={`px-4 md:px-5 py-2 md:py-2.5 rounded-full text-[11px] md:text-xs font-bold uppercase tracking-wider transition-all border whitespace-nowrap cursor-pointer ${
                      isSelected ? theme.pillActive : theme.pillInactive
                    }`}
                  >
                    {cat.name} ({cat.product_count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* SubCategories Row */}
          {selectedCategorySlug && (() => {
            const activeCatObj = categories.find((c) => c.slug === selectedCategorySlug);
            const activeSubs = activeCatObj?.sub_categories || [];
            if (activeSubs.length === 0) return null;

            return (
              <div className="flex items-center gap-2 overflow-x-auto pb-1 pl-2 border-l-2 border-brass/60">
                <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray shrink-0">Series:</span>
                <button
                  onClick={() => handleSubCategorySelect('')}
                  className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all border whitespace-nowrap cursor-pointer ${
                    !selectedSubCategorySlug
                      ? 'bg-charcoal text-white border-charcoal'
                      : 'bg-porcelain text-mid-gray border-warm-gray/40 hover:border-charcoal hover:text-charcoal'
                  }`}
                >
                  All {activeCatObj?.name}
                </button>
                {activeSubs.map((sub) => {
                  const isSubSelected = selectedSubCategorySlug === sub.slug;
                  return (
                    <button
                      key={sub.id}
                      onClick={() => handleSubCategorySelect(sub.slug)}
                      className={`px-3 py-1 rounded-full text-[10px] font-semibold transition-all border whitespace-nowrap cursor-pointer ${
                        isSubSelected
                          ? 'bg-brass text-charcoal font-bold border-brass shadow-xs'
                          : 'bg-porcelain text-mid-gray border-warm-gray/40 hover:border-brass hover:text-charcoal'
                      }`}
                    >
                      {sub.name}
                    </button>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {/* ─── TOOLBAR (Search & Sorting) ─── */}
        <div className={`flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 md:p-4 rounded-2xl border shadow-sm ${theme.toolbarClass}`}>
          <div className="relative flex-1">
            <Search className={`w-4 h-4 absolute left-3.5 top-3 ${isExclusive ? 'text-[#D4B892]/50' : 'text-mid-gray'}`} />
            <input
              type="text"
              placeholder="Search porcelain, ceramic mugs, vases…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`w-full border rounded-xl pl-10 pr-4 py-2.5 text-xs focus:outline-none transition-all ${
                isExclusive
                  ? 'bg-white/5 border-[#C2B267]/20 text-[#FAF8F5] placeholder-[#D4B892]/30 focus:border-[#C2B267]/60'
                  : 'bg-porcelain/60 border-warm-gray/40 text-charcoal focus:border-brass'
              }`}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1 sm:flex-none">
              <SlidersHorizontal className={`w-4 h-4 shrink-0 ${isExclusive ? 'text-[#D4B892]/50' : 'text-mid-gray'}`} />
              <select
                value={ordering}
                onChange={(e) => setOrdering(e.target.value)}
                className={`border rounded-xl px-3 py-2 text-xs focus:outline-none flex-1 sm:flex-none ${
                  isExclusive
                    ? 'bg-white/5 border-[#C2B267]/20 text-[#FAF8F5] focus:border-[#C2B267]/60'
                    : 'bg-porcelain/60 border-warm-gray/40 text-charcoal focus:border-brass'
                }`}
              >
                <option value="-created_at">Newest Arrivals</option>
                <option value="offer_price">Price: Low to High</option>
                <option value="-offer_price">Price: High to Low</option>
              </select>
            </div>

            <div className={`hidden sm:flex border rounded-xl p-1 ${
              isExclusive ? 'border-[#C2B267]/20 bg-white/5' : 'border-warm-gray/40 bg-porcelain'
            }`}>
              <button
                onClick={() => setViewMode('GRID')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'GRID'
                    ? (isExclusive ? 'bg-[#C2B267] text-[#0A0907]' : 'bg-brass text-charcoal')
                    : (isExclusive ? 'text-[#D4B892]/50' : 'text-mid-gray')
                }`}
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('LIST')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'LIST'
                    ? (isExclusive ? 'bg-[#C2B267] text-[#0A0907]' : 'bg-brass text-charcoal')
                    : (isExclusive ? 'text-[#D4B892]/50' : 'text-mid-gray')
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* ─── PRODUCTS ─── */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
              <div key={n} className={`rounded-2xl p-3 md:p-4 border animate-pulse ${
                isExclusive ? 'bg-white/5 border-white/10' : 'bg-white border-warm-gray/40'
              }`}>
                <div className="aspect-square w-full rounded-xl bg-warm-gray/30 mb-4" />
                <div className="h-4 w-3/4 rounded bg-warm-gray/20 mb-2.5" />
                <div className="h-3.5 w-1/3 rounded bg-warm-gray/20" />
              </div>
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className={`border border-dashed rounded-2xl p-16 text-center shadow-sm ${
            isExclusive
              ? 'bg-white/5 border-[#C2B267]/20'
              : 'bg-warm-white border-warm-gray'
          }`}>
            <Filter className={`w-10 h-10 mx-auto mb-3 ${isExclusive ? 'text-[#D4B892]/30' : 'text-mid-gray/30'}`} />
            <h3 className={`font-brand text-2xl mb-1 ${isExclusive ? 'text-[#FAF8F5]' : 'text-charcoal'}`}>No Ceramics Found</h3>
            <p className={`text-[13px] font-light ${isExclusive ? 'text-[#D4B892]/50' : 'text-mid-gray'}`}>Try adjusting your category filter or search query.</p>
          </div>
        ) : (
          <div className={theme.gridBg}>
            <div className={viewMode === 'GRID' ? 'grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8' : 'space-y-6'}>
              {products.map((prod, index) => {
                const inWish = isInWishlist(prod.id);
                const isAdding = addingId === prod.id;

                if (viewMode === 'LIST') {
                  return (
                    <div key={prod.id} className={`border rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-center gap-6 transition-all ${
                      isExclusive
                        ? 'bg-white/5 border-[#C2B267]/30 hover:border-[#C2B267]/60'
                        : 'bg-warm-white border-warm-gray/50'
                    }`}>
                      <div className="w-36 h-36 bg-porcelain rounded-xl overflow-hidden shrink-0">
                        <img src={prod.primary_image_url} alt={prod.name} className="w-full h-full object-cover" />
                      </div>
                      <div className={`flex-1 space-y-2 text-center sm:text-left ${isExclusive ? 'text-[#FAF8F5]' : ''}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest block ${isExclusive ? 'text-[#D4B892]/60' : 'text-mid-gray'}`}>{prod.category_name}</span>
                        <Link to={`/product/${prod.slug}`} className={`font-brand text-xl transition-colors block ${
                          isExclusive ? 'text-[#FAF8F5] hover:text-[#C2B267]' : 'text-charcoal hover:text-brass'
                        }`}>
                          {prod.name}
                        </Link>
                        <p className={`text-xs font-light line-clamp-2 ${isExclusive ? 'text-[#D4B892]/50' : 'text-mid-gray'}`}>{prod.description}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-3 pt-1">
                          <span className={`text-lg font-bold ${isExclusive ? 'text-[#FAF8F5]' : 'text-charcoal'}`}>₹{prod.offer_price}</span>
                          {prod.mrp !== prod.offer_price && (
                            <span className={`text-xs line-through ${isExclusive ? 'text-[#D4B892]/40' : 'text-mid-gray'}`}>₹{prod.mrp}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex sm:flex-col gap-3 shrink-0">
                        <button
                          onClick={(e) => handleQuickAdd(e, prod.id)}
                          disabled={isAdding}
                          className={`text-xs flex items-center gap-2 py-3 px-6 rounded-xl font-bold uppercase tracking-wider transition-all ${theme.btnClass}`}
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>{isAdding ? 'Adding…' : 'Quick Add +'}</span>
                        </button>
                        <button
                          onClick={() => toggleWishlist(prod.id)}
                          className={`p-3 border rounded-xl flex items-center justify-center transition-all ${
                            inWish
                              ? (isExclusive ? 'border-[#C2B267] text-[#C2B267] bg-[#C2B267]/10' : 'border-brass text-brass bg-brass/10')
                              : (isExclusive ? 'border-[#C2B267]/20 text-[#D4B892]/50 hover:text-[#C2B267]' : 'border-warm-gray/50 text-mid-gray hover:text-brass')
                          }`}
                        >
                          <Heart className={`w-4 h-4 ${inWish ? (isExclusive ? 'fill-[#C2B267] text-[#C2B267]' : 'fill-brass text-brass') : ''}`} />
                        </button>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={prod.id}
                    className={`group border rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between ${theme.cardBorder} ${theme.cardHover} ${
                      isExclusive ? 'bg-[#0E0D0B]' : 'bg-warm-white'
                    }`}
                    style={isSpecialSection ? { animationDelay: `${index * 60}ms` } : undefined}
                  >
                    <div className="relative">
                      <div className={`relative aspect-[4/5] overflow-hidden rounded-t-2xl ${isExclusive ? 'bg-[#1A1814]' : 'bg-porcelain'}`}>
                        {/* Badge */}
                        {(prod.badge || isSpecialSection) && (
                          <span className={`absolute top-3 left-3 z-10 text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm ${theme.cardBadgeClass}`}>
                            {prod.badge || theme.cardBadge}
                          </span>
                        )}

                        {/* Heart Wishlist Toggle */}
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            toggleWishlist(prod.id);
                          }}
                          className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
                            inWish
                              ? (isExclusive ? 'bg-[#C2B267]/20 text-[#C2B267]' : 'bg-warm-white text-brass')
                              : (isExclusive ? 'bg-white/10 hover:bg-white/20 text-white/50 hover:text-[#C2B267]' : 'bg-warm-white/80 hover:bg-warm-white text-mid-gray hover:text-brass')
                          }`}
                          title={inWish ? 'Remove from Wishlist' : 'Save to Wishlist'}
                        >
                          <Heart className={`w-3.5 h-3.5 ${
                            inWish ? (isExclusive ? 'fill-[#C2B267] text-[#C2B267]' : 'fill-brass text-brass') : ''
                          }`} />
                        </button>

                        {/* Floating Quick Add Circle Button */}
                        <button
                          onClick={(e) => handleQuickAdd(e, prod.id)}
                          disabled={isAdding}
                          className={`absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 active:scale-95 disabled:opacity-50 ${
                            isExclusive 
                              ? 'bg-[#C2B267] hover:bg-[#D4B892] text-[#0A0907]' 
                              : 'bg-charcoal hover:bg-brass text-warm-white hover:text-charcoal'
                          }`}
                          title="Quick Add to Cart"
                        >
                          {isAdding ? (
                            <div className={`w-3.5 h-3.5 border-2 rounded-full animate-spin ${isExclusive ? 'border-[#0A0907] border-t-transparent' : 'border-warm-white border-t-transparent'}`} />
                          ) : (
                            <ShoppingCart className="w-4 h-4" />
                          )}
                        </button>

                        <Link to={`/product/${prod.slug}`}>
                          <img
                            src={prod.primary_image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80'}
                            alt={prod.name}
                            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700"
                          />
                        </Link>
                      </div>

                      <div className="p-3.5 md:p-5 space-y-1.5">
                        <span className={`text-[9px] font-bold uppercase tracking-widest block ${
                          isExclusive ? 'text-[#D4B892]/70' : 'text-brass'
                        }`}>{prod.category_name}</span>
                        <Link to={`/product/${prod.slug}`} className={`font-brand text-xs md:text-sm transition-colors line-clamp-1 block leading-tight font-medium ${
                          isExclusive ? 'text-[#FAF8F5] hover:text-[#C2B267]' : 'text-charcoal hover:text-brass'
                        }`}>
                          {prod.name}
                        </Link>

                        <div className={`flex items-center gap-1 text-[9px] ${theme.accentColor}`}>
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-2.5 h-2.5 ${
                              isExclusive ? 'fill-[#C2B267]' :
                              isBestSeller ? 'fill-amber-500' :
                              isNewArrivals ? 'fill-emerald-500' :
                              'fill-brass'
                            }`} />
                          ))}
                          <span className={`text-[9px] font-semibold ml-1 ${
                            isExclusive ? 'text-[#D4B892]/40' : 'text-mid-gray/70'
                          }`}>({prod.reviews_count || 12})</span>
                        </div>

                        <div className="flex items-baseline gap-1.5 pt-0.5">
                          <span className={`text-sm md:text-base font-extrabold ${isExclusive ? 'text-[#FAF8F5]' : 'text-charcoal'}`}>₹{prod.offer_price}</span>
                          {prod.mrp !== prod.offer_price && (
                            <span className={`text-[10px] md:text-xs line-through ${isExclusive ? 'text-[#D4B892]/40' : 'text-mid-gray/60'}`}>₹{prod.mrp}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
export default Shop;
