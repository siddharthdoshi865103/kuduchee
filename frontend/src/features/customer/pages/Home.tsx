import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { catalogService, type ProductData } from '../../../services/catalogService';
import { siteService, type HeroBannerData, type SiteSettingsData } from '../../../services/siteService';
import { useCart } from '../../../context/CartContext';
import { useWishlist } from '../../../context/WishlistContext';
import { SEO } from '../../../components/SEO';
import toast from 'react-hot-toast';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  X,
  Heart,
  Star,
  ShoppingCart,
  MessageSquare,
  Camera,
} from 'lucide-react';

export const Home: React.FC = () => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const navigate = useNavigate();

  const [heroSlides, setHeroSlides] = useState<HeroBannerData[]>([]);
  const [siteSettings, setSiteSettings] = useState<SiteSettingsData | null>(null);
  const [currentSlide, setCurrentSlide] = useState(0);

  const [featuredProducts, setFeaturedProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingId, setAddingId] = useState<number | null>(null);

  // Discovery Quiz State
  const [quizOccasion, setQuizOccasion] = useState('ceremony');
  const [quizPalette, setQuizPalette] = useState('charcoal');
  const [quizResult, setQuizResult] = useState<ProductData | null>(null);

  // Newsletter Email State
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Customer Feedback Showcase & Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [reviewerName, setReviewerName] = useState('');
  const [reviewerCity, setReviewerCity] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const [customerReviews, setCustomerReviews] = useState([
    {
      id: 1,
      name: 'Ananya Sharma',
      city: 'Mumbai',
      rating: 5,
      comment: 'The glaze finish on the stoneware dinner set is absolute perfection. Elevates every dinner party!',
      product_name: 'Stoneware Dinner Set',
      date: '2 days ago',
    },
    {
      id: 2,
      name: 'Vikramaditya Roy',
      city: 'Bengaluru',
      rating: 5,
      comment: 'Fired to perfection! Packaging was so secure not even a scratch during express delivery.',
      product_name: 'Porcelain Ceremony Mug',
      date: '1 week ago',
    },
    {
      id: 3,
      name: 'Pooja Hegde',
      city: 'Delhi NCR',
      rating: 5,
      comment: 'Minimalist aesthetic with high craftsmanship. The antique brass tone complements our dining table wonderfully.',
      product_name: 'Handcrafted Ceramic Vase',
      date: '3 weeks ago',
    },
  ]);

  const DEFAULT_MULTIPLE_SLIDES: HeroBannerData[] = [
    {
      tagline: 'AUTUMN / WINTER STUDIO COLLECTION',
      title: 'Opulence Fired in Stoneware.',
      quote: 'Elegance is when the inside is as beautiful as the outside.',
      cta_text: 'DISCOVER COLLECTION',
      cta_link: '/shop',
      image_url: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1600&q=85',
      accent_badge: 'HANDCRAFTED BATCH 06 · LIMITED RUN',
      order: 0,
      is_active: true,
    },
    {
      tagline: 'CELEBRATION OF CRAFT',
      title: 'Artisan Dining & Ceremony Mugs.',
      quote: 'Fired at 1280°C for exceptional durability and timeless elegance.',
      cta_text: 'EXPLORE DINNERWARE',
      cta_link: '/shop?category=tableware-fine-dining',
      image_url: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=1600&q=85',
      accent_badge: 'PORCELAIN CEREMONY SERIES · BATCH 07',
      order: 1,
      is_active: true,
    },
    {
      tagline: 'HERITAGE HOME DECOR',
      title: 'Hand-Formed Gujarat Stoneware Vases.',
      quote: 'Architectural ceramics crafted with organic earthy glazes.',
      cta_text: 'VIEW HOME DECOR',
      cta_link: '/shop?category=home-decor-vases',
      image_url: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=1600&q=85',
      accent_badge: 'STUDIO ARTISAN PICK · BATCH 08',
      order: 2,
      is_active: true,
    },
    {
      tagline: 'ELEVATED TABLE EXPERIENCE',
      title: 'Minimalist Serveware & Platters.',
      quote: 'Designed in Ahmedabad for memory-making celebrations.',
      cta_text: 'DISCOVER PLATTERS',
      cta_link: '/shop',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=1600&q=85',
      accent_badge: 'BEST SELLER COLLECTION · BATCH 09',
      order: 3,
      is_active: true,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [banners, settings, prods] = await Promise.all([
          siteService.getHeroBanners(),
          siteService.getSiteSettings(),
          catalogService.getProducts({ is_featured: true }),
        ]);

        if (banners && banners.length >= 2) {
          setHeroSlides(banners);
        } else {
          setHeroSlides(DEFAULT_MULTIPLE_SLIDES);
        }

        setSiteSettings(settings);
        setFeaturedProducts(prods.slice(0, 8));

        // Set initial match result
        if (prods.length > 0) {
          setQuizResult(prods[0]);
        }
      } catch {
        setHeroSlides(DEFAULT_MULTIPLE_SLIDES);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Hero carousel auto-play interval
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [heroSlides]);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
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

  // Live match update when options change in the quiz
  useEffect(() => {
    if (featuredProducts.length === 0) return;
    let match = featuredProducts[0];
    
    if (quizPalette === 'charcoal') {
      match = featuredProducts.find(p => p.name.toLowerCase().includes('minimalist') || p.name.toLowerCase().includes('holder')) || featuredProducts[0];
    } else if (quizPalette === 'sage') {
      match = featuredProducts.find(p => p.name.toLowerCase().includes('ceramic') || p.name.toLowerCase().includes('vase')) || featuredProducts[0];
    } else {
      match = featuredProducts.find(p => p.name.toLowerCase().includes('porcelain') || p.name.toLowerCase().includes('mug')) || featuredProducts[0];
    }
    
    setQuizResult(match);
  }, [quizOccasion, quizPalette, featuredProducts]);

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quizResult) {
      navigate(`/product/${quizResult.slug}`);
    } else {
      navigate('/shop');
    }
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid email address');
      return;
    }
    setSubscribed(true);
    toast.success('Welcome to the Studio Circle! Code: STUDIO10 sent.');
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !reviewerName.trim()) {
      toast.error('Please enter your name and review comment.');
      return;
    }
    setSubmittingReview(true);
    setTimeout(() => {
      setCustomerReviews([
        {
          id: Date.now(),
          name: reviewerName,
          city: reviewerCity || 'Verified Buyer',
          rating: newRating,
          comment: newComment,
          product_name: 'Studio Stoneware',
          date: 'Just now',
        },
        ...customerReviews,
      ]);
      toast.success('Thank you! Your studio feedback has been published.');
      setIsReviewModalOpen(false);
      setNewComment('');
      setReviewerName('');
      setReviewerCity('');
      setSubmittingReview(false);
    }, 600);
  };

  const currentBanner = heroSlides[currentSlide] || heroSlides[0];
  const featuredHeroProduct = featuredProducts[currentSlide % Math.max(1, featuredProducts.length)] || featuredProducts[0] || null;

  const sanitizeBannerText = (str?: string, fallback: string = '') => {
    if (!str) return fallback;
    let text = str;
    if (text.includes('DISCOVER COLLECTIONVIEW COLLECTION')) text = 'DISCOVER COLLECTION';
    if (text.includes('COLLECTISCULPTURAL')) text = text.replace('COLLECTISCULPTURAL', 'COLLECTION · SCULPTURAL');
    return text;
  };

  return (
    <div className="animate-fadeIn space-y-16 md:space-y-24 font-sans bg-[#FDFCFA] text-charcoal">
      <SEO
        title="Kuduchee (Kudu Chee) — Handcrafted Stoneware & Ceramic Tableware | Anil Panda"
        description="Kuduchee (Kudu Chee) by Anil Panda & Kaviz Creations Private Limited — Premium 1280°C high-fired stoneware dinnerware, ceramic dinner sets, serving bowls & artisan mugs. Shop at kuduchee.in"
        canonicalUrl="https://kuduchee.in/"
        jsonLd={[
          {
            '@context': 'https://schema.org',
            '@type': 'Organization',
            'name': 'Kuduchee',
            'alternateName': ['Kudu Chee', 'Kuduchee Studio', 'Kaviz Creations Private Limited'],
            'url': 'https://kuduchee.in/',
            'logo': 'https://kuduchee.in/kuduchee-logo-dark.png',
            'founder': { '@type': 'Person', 'name': 'Anil Panda' },
            'contactPoint': {
              '@type': 'ContactPoint',
              'telephone': '+91-9971118219',
              'contactType': 'customer service',
              'email': 'anil.panda@kuduchee.com',
              'areaServed': 'IN',
              'availableLanguage': ['English', 'Hindi']
            },
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': '510 A, Sun West Bank, Ashram Road',
              'addressLocality': 'Ahmedabad',
              'addressRegion': 'Gujarat',
              'postalCode': '380009',
              'addressCountry': 'IN'
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'WebSite',
            'name': 'Kuduchee',
            'alternateName': 'Kudu Chee',
            'url': 'https://kuduchee.in/',
            'potentialAction': {
              '@type': 'SearchAction',
              'target': 'https://kuduchee.in/shop?search={search_term_string}',
              'query-input': 'required name=search_term_string'
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'LocalBusiness',
            'name': 'Kuduchee Studio',
            'alternateName': 'Kudu Chee',
            'image': 'https://kuduchee.in/kuduchee-logo.jpg',
            'url': 'https://kuduchee.in/',
            'telephone': '+91-9971118219',
            'email': 'anil.panda@kuduchee.com',
            'priceRange': '₹999 - ₹14999',
            'address': {
              '@type': 'PostalAddress',
              'streetAddress': '510 A, Sun West Bank, Ashram Road',
              'addressLocality': 'Ahmedabad',
              'addressRegion': 'Gujarat',
              'postalCode': '380009',
              'addressCountry': 'IN'
            }
          },
          {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            'mainEntity': [
              {
                '@type': 'Question',
                'name': 'What is Kuduchee (Kudu Chee)?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Kuduchee (Kudu Chee) is a premium Indian stoneware and ceramic tableware brand founded by Anil Panda under Kaviz Creations Private Limited. We create handcrafted 1280°C high-fired stoneware dinnerware, serving bowls, coffee mugs, and luxury home décor.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Who is the founder of Kuduchee?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Kuduchee (Kudu Chee) was founded by Anil Panda. The brand operates under Kaviz Creations Private Limited, headquartered at 510 A, Sun West Bank, Ashram Road, Ahmedabad, Gujarat 380009, India.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Is Kuduchee stoneware safe for daily use?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'Yes! All Kuduchee stoneware is fired at 1280°C in high-temperature kilns, making it dishwasher-safe, microwave-safe, scratch-resistant, and 100% lead-free. Our glazes are non-toxic and food-safe.'
                }
              },
              {
                '@type': 'Question',
                'name': 'Where can I buy Kuduchee products?',
                'acceptedAnswer': {
                  '@type': 'Answer',
                  'text': 'You can shop the complete Kuduchee collection at kuduchee.in. We offer free shipping across India, 100% damage replacement guarantee, and secure online payment options.'
                }
              }
            ]
          }
        ]}
      />
      
      {/* ─── EDITORIAL CINEMATIC HERO SLIDER ─── */}
      <section className="relative h-[95vh] md:h-[90vh] bg-[#171513] text-warm-white overflow-hidden flex items-center shadow-2xl">
        {/* Soft Left Ambient Spotlight */}
        <div className="absolute top-0 left-0 w-2/3 h-full bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-brass/15 via-transparent to-transparent pointer-events-none z-10" />

        {/* Sliding images background loop */}
        {heroSlides.map((slide, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              idx === currentSlide ? 'opacity-90 z-0' : 'opacity-0 z-0'
            }`}
          >
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-full object-cover object-center transform scale-100 group-hover:scale-105 transition-transform duration-[10000ms]"
            />
            {/* Elegant luxury vignette overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/60 to-black/30" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-transparent to-charcoal/50" />
          </div>
        ))}

        <div className="relative z-20 max-w-screen-xl mx-auto px-6 md:px-12 lg:px-16 w-full mt-8 md:mt-0">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Content Column */}
            <div key={currentSlide} className="lg:col-span-8 space-y-6 md:space-y-8 animate-fadeUp">
              
              <div className="inline-flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.25em] font-extrabold text-brass bg-brass/15 border border-brass/30 px-3.5 py-1 rounded-full backdrop-blur-md">
                  {sanitizeBannerText(currentBanner?.tagline, 'AUTUMN / WINTER STUDIO COLLECTION')}
                </span>
              </div>

              <h1 className="font-brand text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl font-normal leading-[1.1] tracking-tight max-w-3xl drop-shadow-xl text-warm-white">
                {currentBanner?.title || 'Opulence Fired in Stoneware.'}
              </h1>

              <p className="text-xs md:text-lg font-light text-warm-white/80 max-w-lg leading-relaxed font-sans">
                {currentBanner?.quote || siteSettings?.brand_quote || 'Elegance is when the inside is as beautiful as the outside.'}
              </p>

              {/* Minimalist CTA Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Link
                  to={currentBanner?.cta_link || '/shop'}
                  className="bg-brass text-charcoal hover:bg-warm-white hover:text-charcoal px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all duration-300 shadow-lg shadow-brass/10"
                >
                  <span>{sanitizeBannerText(currentBanner?.cta_text, 'DISCOVER COLLECTION')}</span>
                </Link>
                <Link
                  to="/shop"
                  className="text-warm-white hover:text-brass bg-white/5 border border-white/20 hover:border-brass/40 px-6 py-3.5 rounded-xl font-bold text-xs uppercase tracking-widest transition-all backdrop-blur-sm"
                >
                  EXPLORE CATALOG
                </Link>
              </div>

              {/* Status Indicator */}
              <div className="hidden sm:flex items-center gap-3 text-[10px] text-warm-white/60 tracking-widest uppercase font-bold pt-4">
                <span className="w-1.5 h-1.5 rounded-full bg-brass animate-pulse" />
                <span>KILN STATUS: ACTIVE BATCH 06</span>
                <span className="w-1 h-1 rounded-full bg-white/30" />
                <span>FREE PAN-INDIA DELIVERY</span>
              </div>

            </div>

            {/* Right Column — Editorial Featured Product Card */}
            {featuredHeroProduct && (
              <div key={`hero-product-${currentSlide}`} className="hidden lg:block lg:col-span-4 animate-fadeUp delay-100">
                <div className="bg-[#1C1A17]/85 border border-white/15 rounded-3xl p-5 shadow-[0_25px_60px_rgba(0,0,0,0.65)] backdrop-blur-xl space-y-4 text-warm-white relative overflow-hidden group">
                  
                  {/* Glossy shine element */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none" />

                  {/* Card Header Tag */}
                  <div className="flex justify-between items-center text-[9px] uppercase tracking-[0.2em] font-extrabold text-brass border-b border-white/10 pb-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-brass animate-pulse" />
                      Artisan Craft Match
                    </span>
                    <span className="bg-white/10 text-white px-2 py-0.5 rounded-full font-mono text-[9px]">
                      0{currentSlide + 1} / 0{heroSlides.length}
                    </span>
                  </div>

                  {/* Product Image */}
                  <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-charcoal/50 border border-white/10 shadow-inner">
                    <img
                      src={currentBanner?.image_url}
                      alt={featuredHeroProduct.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    
                    {/* Floating scarcity / psychological overlay badge */}
                    <span className="absolute bottom-3 left-3 bg-[#B19F53] text-charcoal text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg">
                      Batch 06: Only {24 - currentSlide * 3} Remaining
                    </span>
                  </div>

                  {/* Product Details */}
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-brass block">
                      {featuredHeroProduct.category_name || 'STUDIO STONEWARE'}
                    </span>
                    <h3 className="font-brand text-lg text-white group-hover:text-brass transition-colors line-clamp-1">
                      {featuredHeroProduct.name}
                    </h3>
                    <p className="text-[10px] text-white/60 line-clamp-1 font-light font-sans">
                      Hand-numbered studio collection with custom organic glaze.
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] uppercase tracking-wider text-white/50 block">Member Price</span>
                      <span className="text-base font-extrabold text-brass">₹{featuredHeroProduct.offer_price}</span>
                    </div>

                    <Link
                      to={`/product/${featuredHeroProduct.slug}`}
                      className="bg-brass/25 hover:bg-brass text-brass hover:text-charcoal border border-brass/45 px-4.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <span>Order Now</span>
                      <i className="fa-solid fa-arrow-right text-[10px]" />
                    </Link>
                  </div>

                </div>
              </div>
            )}

          </div>
        </div>

        {/* Minimalist Centered Slide Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center">
          <div className="bg-[#1C1A17]/90 backdrop-blur-md border border-white/10 px-5 py-2.5 rounded-full flex items-center gap-4 text-warm-white shadow-2xl">
            <button
              onClick={handlePrevSlide}
              className="text-warm-white/60 hover:text-brass transition-colors p-1"
              title="Previous"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 text-[10px] font-mono">
              <span className="text-brass font-bold">0{currentSlide + 1}</span>
              <div className="flex gap-1.5">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      i === currentSlide ? 'w-4 bg-brass' : 'w-1.5 bg-white/25 hover:bg-white/55'
                    }`}
                  />
                ))}
              </div>
              <span className="text-white/40">0{heroSlides.length}</span>
            </div>

            <button
              onClick={handleNextSlide}
              className="text-warm-white/60 hover:text-brass transition-colors p-1"
              title="Next"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* ─── TRUST PILLARS STRIP ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 animate-fadeIn">
        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide md:grid md:grid-cols-3 md:gap-8 md:overflow-x-visible p-5 bg-white border border-warm-gray/40 rounded-2xl shadow-xs">
          <div className="flex items-center gap-4 min-w-[240px] md:min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EB] text-brass flex items-center justify-center shrink-0">
              <i className="fa-solid fa-truck-fast text-base" />
            </div>
            <div>
              <h4 className="font-medium text-sm md:text-base text-charcoal tracking-wide">Pan-India Delivery</h4>
              <p className="text-[11px] md:text-xs text-mid-gray/80 font-light">Free shipping on orders above ₹999</p>
            </div>
          </div>

          <div className="flex items-center gap-4 min-w-[240px] md:min-w-0 md:border-x border-warm-gray/30 md:px-8">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EB] text-brass flex items-center justify-center shrink-0">
              <i className="fa-solid fa-shield-halved text-base" />
            </div>
            <div>
              <h4 className="font-medium text-sm md:text-base text-charcoal tracking-wide">100% Insured Transit</h4>
              <p className="text-[11px] md:text-xs text-mid-gray/80 font-light">Damage replacement guarantee</p>
            </div>
          </div>

          <div className="flex items-center gap-4 min-w-[240px] md:min-w-0">
            <div className="w-12 h-12 rounded-full bg-[#F5F2EB] text-brass flex items-center justify-center shrink-0">
              <i className="fa-solid fa-fire text-base" />
            </div>
            <div>
              <h4 className="font-medium text-sm md:text-base text-charcoal tracking-wide">1280°C High-Fired</h4>
              <p className="text-[11px] md:text-xs text-mid-gray/80 font-light">Exceptional strength &amp; scratch resistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CURATED COLLECTIONS — ASYMMETRIC DESIGNER GRID ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-8 md:space-y-12">
        <div className="text-center space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brass block">Curated for You</span>
          <h2 className="font-brand text-3xl md:text-5xl text-charcoal font-medium">Shop by Collection</h2>
          <p className="text-xs md:text-sm text-mid-gray/70 font-light max-w-md mx-auto">Explore our high-fired studio stoneware through distinct seasonal curations.</p>
        </div>

        {/* Asymmetric Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Main Large Column (Best Sellers) - spans 7 cols */}
          <Link
            to="/shop?section=best-sellers"
            className="lg:col-span-7 group relative overflow-hidden rounded-3xl aspect-[4/3] lg:aspect-[16/10] shadow-md hover:shadow-2xl transition-all duration-500 border border-warm-gray/20 block"
          >
            <img
              src="https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=1000&q=80"
              alt="Best Sellers"
              className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-[1200ms]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/90 via-charcoal/20 to-transparent" />
            
            <div className="absolute bottom-0 left-0 right-0 p-8 space-y-3 z-10">
              <span className="inline-flex items-center gap-1.5 bg-amber-500/20 text-amber-300 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-amber-500/35">
                <i className="fa-solid fa-arrow-trend-up text-[9px]" /> Trending Favorites
              </span>
              <h3 className="font-brand text-3xl md:text-4xl text-white group-hover:text-brass transition-colors">Best Sellers Collection</h3>
              <p className="text-xs text-white/70 font-light max-w-sm">Crafted for everyday utility and certified by 500+ collectors across the country.</p>
              <span className="inline-flex items-center gap-1.5 text-brass text-[11px] font-bold uppercase tracking-widest group-hover:translate-x-1.5 transition-all">
                Explore Collection <i className="fa-solid fa-arrow-right text-[10px]" />
              </span>
            </div>
          </Link>

          {/* Right Column containing 2 smaller stacked items - spans 5 cols */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            
            {/* New Arrivals Card */}
            <Link
              to="/shop?section=new-arrivals"
              className="group relative overflow-hidden rounded-3xl flex-1 min-h-[220px] shadow-md hover:shadow-xl transition-all duration-500 border border-warm-gray/20 block"
            >
              <img
                src="https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80"
                alt="New Arrivals"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-[1200ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A15]/95 via-[#0A1A15]/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 z-10">
                <span className="inline-flex items-center gap-1.5 bg-emerald-500/20 text-emerald-300 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-emerald-500/30">
                  <i className="fa-solid fa-sparkles text-[9px]" /> Just Fired
                </span>
                <h3 className="font-brand text-2xl text-white group-hover:text-emerald-300 transition-colors">New Arrivals</h3>
                <p className="text-[11px] text-white/60 font-light">Fresh stoneware designs straight from the kiln.</p>
              </div>
            </Link>

            {/* Exclusive Card */}
            <Link
              to="/shop?section=exclusive"
              className="group relative overflow-hidden rounded-3xl flex-1 min-h-[220px] shadow-md hover:shadow-xl transition-all duration-500 border border-warm-gray/20 block"
            >
              <img
                src="https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=800&q=80"
                alt="Exclusive Store"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-103 transition-transform duration-[1200ms]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/95 via-charcoal/30 to-transparent" />
              
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2 z-10">
                <span className="inline-flex items-center gap-1.5 bg-brass/25 text-[#FAF8F5] text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border border-brass/35">
                  <i className="fa-solid fa-crown text-[9px]" /> Limited Batches
                </span>
                <h3 className="font-brand text-2xl text-white group-hover:text-[#D4B892] transition-colors">Exclusive Edition</h3>
                <p className="text-[11px] text-white/60 font-light">Numbered art pieces with signed certificates.</p>
              </div>
            </Link>

          </div>
        </div>
      </section>

      {/* ─── KUDUCHEE STUDIO MANIFESTO (CINEMATIC PARALLAX SECTION) ─── */}
      <section className="bg-[#FAF8F4] border-y border-warm-gray/25 py-20 lg:py-28">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid lg:grid-cols-12 gap-12 items-center">
          
          {/* Editorial Text Column */}
          <div className="lg:col-span-6 space-y-6">
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brass block">Design Philosophy</span>
            <h2 className="font-brand text-3xl md:text-5xl text-charcoal leading-tight font-medium">
              We design memories, not just products.
            </h2>
            <p className="text-xs md:text-sm text-mid-gray/90 leading-relaxed font-light font-sans">
              At Kuduchee, we bridge ancient stoneware firing practices with contemporary lifestyles. Each ceramic item is carefully shaped from natural raw clays, coated in custom-formulated studio glazes, and vitrified at intense kiln temperatures for unmatched lifetime resilience.
            </p>

            <div className="border-l-2 border-brass pl-4 py-1 italic font-brand text-charcoal/80 text-sm md:text-base">
              "Indian dining is a ritual of sharing. Our plates and bowls are sized, contoured, and weighted to honor that sharing."
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-white p-4.5 rounded-2xl border border-warm-gray/30 shadow-2xs">
                <span className="font-brand text-[15px] font-semibold text-charcoal">The Deer</span>
                <p className="text-[10px] text-mid-gray/80 mt-1 leading-normal font-light">Elegance and organic calmness of form.</p>
              </div>
              <div className="bg-white p-4.5 rounded-2xl border border-warm-gray/30 shadow-2xs">
                <span className="font-brand text-[15px] font-semibold text-charcoal">The Squirrel</span>
                <p className="text-[10px] text-mid-gray/80 mt-1 leading-normal font-light">Playful detailing &amp; absolute utility.</p>
              </div>
            </div>
          </div>

          {/* Cinematic Side Image panel */}
          <div className="lg:col-span-6">
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-2xl border border-warm-gray/30 group">
              <img
                src="https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80"
                alt="Studio wheel clay working"
                className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-[#12100E]/70 flex flex-col justify-center items-center p-8 text-center text-warm-white">
                <span className="text-[9px] font-bold tracking-[0.3em] text-brass uppercase block mb-2">Our Manifesto</span>
                <h3 className="font-brand text-2xl md:text-3xl text-warm-white font-light italic leading-snug max-w-sm">
                  "We cannot change the food you eat. We can change the way you experience it."
                </h3>
                <Link
                  to="/about"
                  className="mt-6 px-5 py-2.5 bg-brass hover:bg-warm-white text-charcoal font-bold text-[10px] tracking-widest uppercase rounded-lg shadow-md transition-all duration-300"
                >
                  Read Studio Story
                </Link>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── DYNAMIC CONVERSATIONAL DISCOVERY ASSISTANT ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12">
        <div className="bg-gradient-to-br from-[#F6F3EC] via-white to-[#F6F3EC] border border-warm-gray/30 rounded-3xl p-6 md:p-10 lg:p-12 shadow-sm">
          
          <div className="flex items-center gap-4 border-b border-warm-gray/20 pb-6 mb-6">
            <div className="w-12 h-12 rounded-full bg-brass/10 text-brass flex items-center justify-center shrink-0 shadow-inner">
              <i className="fa-solid fa-sparkles text-lg" />
            </div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-brass block">Artisan Guide</span>
              <h3 className="font-brand text-2xl md:text-4xl text-charcoal font-medium">Find Your Perfect Stoneware</h3>
            </div>
          </div>

          <div className="grid lg:grid-cols-12 gap-8 items-center">
            
            {/* Interactive Form */}
            <form onSubmit={handleQuizSubmit} className="lg:col-span-7 space-y-6">
              
              {/* Option block 1 */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray/80 block">1. What is the main occasion?</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'daily', label: 'Everyday Family', icon: 'fa-house-chimney' },
                    { id: 'ceremony', label: 'Festive Dinners', icon: 'fa-glass-water' },
                    { id: 'gifting', label: 'Artisan Gifting', icon: 'fa-gift' },
                  ].map((occ) => (
                    <button
                      key={occ.id}
                      type="button"
                      onClick={() => setQuizOccasion(occ.id)}
                      className={`p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 ${
                        quizOccasion === occ.id
                          ? 'bg-charcoal text-warm-white border-charcoal shadow-md scale-102'
                          : 'bg-white text-charcoal border-warm-gray/40 hover:border-brass/40'
                      }`}
                    >
                      <i className={`fa-solid ${occ.icon} text-sm`} />
                      <span className="text-[10px] font-bold tracking-wide">{occ.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Option block 2 */}
              <div className="space-y-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray/80 block">2. Select Your Color Palette</span>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: 'charcoal', label: 'Charcoal & Gold', color: 'bg-[#282624] border-[#B19F53]' },
                    { id: 'porcelain', label: 'Ivory & Cream', color: 'bg-[#FAF8F5] border-warm-gray/40' },
                    { id: 'sage', label: 'Sage Stoneware', color: 'bg-[#768478] border-[#768478]/40' },
                  ].map((pal) => (
                    <button
                      key={pal.id}
                      type="button"
                      onClick={() => setQuizPalette(pal.id)}
                      className={`p-3.5 rounded-2xl border text-center transition-all duration-300 flex flex-col items-center gap-2 ${
                        quizPalette === pal.id
                          ? 'bg-charcoal text-warm-white border-charcoal shadow-md scale-102'
                          : 'bg-white text-charcoal border-warm-gray/40 hover:border-brass/40'
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${pal.color} border shadow-inner`} />
                      <span className="text-[10px] font-bold tracking-wide">{pal.label}</span>
                    </button>
                  ))}
                </div>
              </div>

            </form>

            {/* Live Recommendation Output Card */}
            <div className="lg:col-span-5 bg-white p-5 rounded-3xl border border-brass/25 shadow-xl flex flex-col justify-between min-h-[290px] relative overflow-hidden animate-fadeIn">
              <div className="absolute top-2 right-4 text-[9px] font-extrabold uppercase tracking-widest text-brass">
                Live Studio Match
              </div>

              {quizResult ? (
                <>
                  <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-xl overflow-hidden bg-porcelain border border-warm-gray/20">
                      <img
                        src={quizResult.primary_image_url || 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80'}
                        alt={quizResult.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-[9px] font-bold tracking-widest text-brass uppercase block">{quizResult.category_name}</span>
                      <h4 className="font-brand text-lg text-charcoal line-clamp-1">{quizResult.name}</h4>
                      <span className="text-xs font-bold text-charcoal mt-1 block">₹{quizResult.offer_price}</span>
                    </div>
                  </div>

                  <Link
                    to={`/product/${quizResult.slug}`}
                    className="w-full mt-4 py-2.5 bg-charcoal hover:bg-brass text-white hover:text-charcoal text-center text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors block"
                  >
                    View Details &amp; Order
                  </Link>
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-xs text-mid-gray/50 italic">
                  Select preferences to match ceramics…
                </div>
              )}
            </div>

          </div>

        </div>
      </section>

      {/* ─── FEATURED PRODUCTS CATALOG GRID ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-8 md:space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-warm-gray/30 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brass block">Artisan Favorites</span>
            <h2 className="font-brand text-3xl md:text-5xl text-charcoal font-medium">Featured Tableware</h2>
          </div>
          <Link to="/shop" className="text-xs font-bold uppercase tracking-wider text-brass hover:underline flex items-center gap-2 mt-2 sm:mt-0">
            <span>Explore Entire Shop ({featuredProducts.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 lg:gap-8">
            {[1, 2, 3, 4].map((n) => (
              <div key={n} className="bg-warm-white border border-warm-gray/45 rounded-2xl p-4 animate-pulse">
                <div className="aspect-[4/5] w-full rounded-xl bg-warm-gray/30 mb-4" />
                <div className="h-4 w-3/4 rounded bg-warm-gray/20 mb-2.5" />
                <div className="h-3.5 w-1/3 rounded bg-warm-gray/20" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8">
            {featuredProducts.map((prod) => {
              const inWish = isInWishlist(prod.id);
              const isAdding = addingId === prod.id;

              return (
                <div key={prod.id} className="group bg-white border border-warm-gray/40 rounded-2xl overflow-hidden shadow-2xs hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between">
                  <div className="relative">
                    
                    {/* Image Container */}
                    <div className="relative aspect-[4/5] bg-porcelain overflow-hidden rounded-t-2xl">
                      {prod.badge && (
                        <span className="absolute top-3 left-3 z-10 bg-brass text-charcoal text-[9px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-xs">
                          {prod.badge}
                        </span>
                      )}

                      {/* Heart Wishlist Toggle Button */}
                      <button
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleWishlist(prod.id);
                        }}
                        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-xs ${
                          inWish
                            ? 'bg-warm-white text-brass fill-brass'
                            : 'bg-warm-white/80 hover:bg-warm-white text-mid-gray hover:text-brass'
                        }`}
                        title={inWish ? 'Remove from Wishlist' : 'Save to Wishlist'}
                      >
                        <Heart className={`w-3.5 h-3.5 ${inWish ? 'fill-brass text-brass' : ''}`} />
                      </button>

                      {/* Floating Quick Add Circle Button */}
                      <button
                        onClick={(e) => handleQuickAdd(e, prod.id)}
                        disabled={isAdding}
                        className="absolute bottom-3 right-3 z-10 w-9 h-9 rounded-full bg-charcoal hover:bg-brass text-warm-white hover:text-charcoal flex items-center justify-center transition-all duration-300 shadow-md hover:scale-110 active:scale-95 disabled:opacity-50"
                        title="Quick Add to Cart"
                      >
                        {isAdding ? (
                          <div className="w-3.5 h-3.5 border-2 border-warm-white border-t-transparent rounded-full animate-spin" />
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

                    {/* Content Details */}
                    <div className="p-4 space-y-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-brass block">{prod.category_name}</span>
                      <Link to={`/product/${prod.slug}`} className="font-brand text-sm text-charcoal hover:text-brass transition-colors line-clamp-1 block font-medium leading-tight">
                        {prod.name}
                      </Link>

                      <div className="flex items-center gap-1 text-brass text-[9px] py-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-2.5 h-2.5 fill-brass" />
                        ))}
                        <span className="text-[9px] text-mid-gray/70 font-semibold ml-1">({prod.reviews_count || 12})</span>
                      </div>

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
      </section>

      {/* ─── EDITORIAL CUSTOMER STORIES & REVIEWS ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-8 md:space-y-12">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-warm-gray/30 pb-4">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brass block font-sans">Noritake Inspired Social Proof</span>
            <h2 className="font-brand text-3xl md:text-5xl text-charcoal font-medium">Customer Stories &amp; Reviews</h2>
          </div>
          <button
            onClick={() => setIsReviewModalOpen(true)}
            className="px-5 py-2.5 border border-charcoal/20 hover:border-brass/60 rounded-xl text-xs font-bold uppercase tracking-widest text-charcoal hover:text-brass bg-white transition-all shadow-2xs mt-2 sm:mt-0 flex items-center gap-2"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Share Your Experience</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {customerReviews.map((rev) => (
            <div key={rev.id} className="bg-white border border-warm-gray/40 rounded-2xl p-6 shadow-2xs space-y-4 flex flex-col justify-between hover:border-brass/30 transition-colors">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-0.5 text-brass">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-brass" />
                    ))}
                  </div>
                  <span className="text-[10px] text-mid-gray/70 font-semibold">{rev.date}</span>
                </div>
                <p className="text-xs md:text-sm text-charcoal leading-relaxed font-light italic">"{rev.comment}"</p>
              </div>

              <div className="pt-3 border-t border-warm-gray/25 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-charcoal block">{rev.name}</span>
                  <span className="text-[10px] text-mid-gray/80">{rev.city}</span>
                </div>
                <span className="text-[9px] font-bold text-emerald-700 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Verified Buyer
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── JOIN THE STUDIO CIRCLE (PREMIUM NEWSLETTER) ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 pb-6">
        <div className="bg-gradient-to-br from-[#1E1C18] to-[#12100E] text-warm-white border border-brass/20 rounded-3xl p-8 md:p-12 lg:p-16 text-center space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-32 h-32 bg-brass/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-32 h-32 bg-brass/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="max-w-md mx-auto space-y-3">
            <span className="text-[9px] font-bold tracking-[0.3em] text-brass uppercase block">Studio Circle</span>
            <h2 className="font-brand text-3xl md:text-5xl text-white font-medium">Join the Batch Releases</h2>
            <p className="text-xs md:text-sm text-warm-white/70 font-light font-sans">
              Subscribe to receive exclusive access to new kiln batch releases, limited-edition designs, and 10% off your first stoneware order.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="max-w-md mx-auto flex flex-col sm:flex-row gap-3 pt-3">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 px-5 py-3.5 bg-white/10 border border-white/20 focus:border-brass rounded-xl text-warm-white text-xs placeholder:text-warm-white/40 focus:outline-none transition-colors"
              required
              disabled={subscribed}
            />
            <button
              type="submit"
              className="px-6 py-3.5 bg-brass hover:bg-warm-white text-charcoal font-bold text-xs uppercase tracking-widest rounded-xl transition-all duration-300 whitespace-nowrap shadow-lg shadow-brass/5"
              disabled={subscribed}
            >
              {subscribed ? 'Subscribed' : 'Join Circle'}
            </button>
          </form>

          {subscribed && (
            <p className="text-[11px] text-brass font-bold animate-pulse">
              Welcome! Use code <span className="font-mono underline">STUDIO10</span> on checkout for 10% off your order.
            </p>
          )}
        </div>
      </section>

      {/* ─── SHOP @KUDUCHEE INSTAGRAM FEED ─── */}
      <section className="max-w-screen-xl mx-auto px-6 md:px-12 space-y-6 pb-12 animate-fadeIn">
        <div className="text-center space-y-1.5">
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-brass block">Social Media</span>
          <h2 className="font-brand text-2xl md:text-3xl text-charcoal">Shop @kuduchee.official</h2>
          <p className="text-xs text-mid-gray/70 font-light">Tag #KuducheeHome on Instagram to share your dinnerware styling.</p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            'https://images.unsplash.com/photo-1610701596007-11502861dcfa?w=600&q=80',
            'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=600&q=80',
            'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80',
            'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&q=80',
          ].map((img, idx) => (
            <a
              key={idx}
              href="https://instagram.com"
              target="_blank"
              rel="noopener noreferrer"
              className="group relative aspect-square rounded-2xl overflow-hidden bg-porcelain border border-warm-gray/20 block shadow-2xs hover:shadow-md transition-shadow"
            >
              <img src={img} alt="Instagram Post" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[800ms]" />
              <div className="absolute inset-0 bg-charcoal/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-warm-white">
                <Camera className="w-7 h-7" />
              </div>
            </a>
          ))}
        </div>
      </section>

      {/* ─── USER FEEDBACK MODAL ─── */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-charcoal/60 backdrop-blur-xs flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-warm-white border border-warm-gray/60 rounded-2xl max-w-md w-full p-8 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-warm-gray/40 pb-4">
              <h3 className="font-brand text-xl text-charcoal">Submit Studio Feedback</h3>
              <button onClick={() => setIsReviewModalOpen(false)} className="text-mid-gray hover:text-charcoal p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <label className="input-label">Overall Rating</label>
                <div className="flex items-center gap-2 text-brass py-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewRating(star)}
                      className="p-1 hover:scale-125 transition-transform"
                    >
                      <Star className={`w-5 h-5 ${star <= newRating ? 'fill-brass text-brass' : 'text-warm-gray'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="input-label">Your Name *</label>
                  <input
                    type="text"
                    placeholder="Full name"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="input-label">City / Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Mumbai"
                    value={reviewerCity}
                    onChange={(e) => setReviewerCity(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="input-label">Your Experience &amp; Feedback *</label>
                <textarea
                  rows={4}
                  placeholder="Share your thoughts on design, glaze quality, packaging or delivery…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="input-field"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={submittingReview}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                <span>{submittingReview ? 'Submitting…' : 'Submit Feedback'}</span>
              </button>
            </form>
          </div>
        </div>
      {/* ─── SEO-RICH CONTENT FOR GOOGLE INDEXING ─── */}
      <section className="bg-porcelain/30 border-t border-warm-gray/30 py-16 px-6 md:px-12" aria-label="About Kuduchee Studio">
        <div className="max-w-screen-xl mx-auto space-y-8">
          <h2 className="font-brand text-2xl md:text-3xl text-charcoal">Kuduchee (Kudu Chee) — India's Artisan Stoneware Studio by Anil Panda</h2>
          <div className="grid md:grid-cols-2 gap-8 text-xs md:text-sm text-mid-gray font-light leading-relaxed">
            <div className="space-y-4">
              <p>
                <strong>Kuduchee</strong> (also known as <strong>Kudu Chee</strong>) is a premium Indian lifestyle and homeware brand founded by <strong>Anil Panda</strong> under <strong>Kaviz Creations Private Limited</strong>. Every piece in our collection is handcrafted from natural clay and fired at <strong>1280°C</strong> in high-temperature kilns, making our stoneware exceptionally durable, scratch-resistant, and 100% food-safe.
              </p>
              <p>
                At <strong>kuduchee.in</strong>, we offer a curated range of <strong>stoneware dinner sets</strong>, <strong>ceramic quarter plates</strong>, <strong>artisan serving bowls</strong>, <strong>handcrafted coffee mugs</strong>, and <strong>luxury tableware</strong> designed for the modern Indian home. Our designs blend contemporary minimalism with traditional Indian craftsmanship.
              </p>
              <p>
                We believe that every meal deserves a beautiful setting. Our tagline — <em>"Serve What You Deserve"</em> — reflects our commitment to transforming everyday dining into a memorable experience through thoughtfully designed ceramics.
              </p>
            </div>
            <div className="space-y-4">
              <p>
                The name <strong>Kuduchee</strong> is inspired by the grace of the deer and the curiosity of the squirrel — two creatures that embody the brand's philosophy of elegance and attention to detail. Based in <strong>Ahmedabad, Gujarat</strong>, our studio serves customers across India with free shipping, damage replacement guarantee, and certificate of authenticity on exclusive pieces.
              </p>
              <p>
                Whether you're looking for the perfect <strong>ceramic dinner set</strong> for your home, a unique <strong>stoneware gift set</strong> for a loved one, or collector-grade <strong>exclusive pottery</strong>, Kuduchee offers handcrafted pieces that stand the test of time. All our glazes are <strong>lead-free</strong> and <strong>non-toxic</strong>, ensuring safe and healthy dining.
              </p>
              <p>
                Explore our collections: <strong>Best Sellers</strong>, <strong>New Arrivals</strong>, and the <strong>Exclusive Store</strong> — limited-edition masterpieces for the discerning collector. Visit <strong>kuduchee.in</strong> or contact us at <strong>anil.panda@kuduchee.com</strong> | <strong>+91 9971118219</strong>.
              </p>
            </div>
          </div>

          {/* FAQ Schema Content */}
          <details className="border border-warm-gray/40 rounded-2xl p-4 cursor-pointer">
            <summary className="font-semibold text-charcoal text-sm">What is Kuduchee (Kudu Chee)?</summary>
            <p className="text-xs text-mid-gray font-light mt-2 leading-relaxed">Kuduchee (Kudu Chee) is a premium Indian stoneware and ceramic tableware brand founded by Anil Panda under Kaviz Creations Private Limited. We create handcrafted 1280°C high-fired stoneware dinnerware, serving bowls, coffee mugs, and luxury home décor.</p>
          </details>
          <details className="border border-warm-gray/40 rounded-2xl p-4 cursor-pointer">
            <summary className="font-semibold text-charcoal text-sm">Who is the founder of Kuduchee?</summary>
            <p className="text-xs text-mid-gray font-light mt-2 leading-relaxed">Kuduchee (Kudu Chee) was founded by Anil Panda. The brand operates under Kaviz Creations Private Limited, headquartered at 510 A, Sun West Bank, Ashram Road, Ahmedabad, Gujarat 380009, India.</p>
          </details>
          <details className="border border-warm-gray/40 rounded-2xl p-4 cursor-pointer">
            <summary className="font-semibold text-charcoal text-sm">Is Kuduchee stoneware safe for daily use?</summary>
            <p className="text-xs text-mid-gray font-light mt-2 leading-relaxed">Yes! All Kuduchee stoneware is fired at 1280°C in high-temperature kilns, making it dishwasher-safe, microwave-safe, scratch-resistant, and 100% lead-free. Our glazes are non-toxic and food-safe, certified for everyday dining.</p>
          </details>
          <details className="border border-warm-gray/40 rounded-2xl p-4 cursor-pointer">
            <summary className="font-semibold text-charcoal text-sm">Where can I buy Kuduchee products?</summary>
            <p className="text-xs text-mid-gray font-light mt-2 leading-relaxed">You can shop the complete Kuduchee collection at kuduchee.in. We offer free shipping across India, 100% damage replacement guarantee, and secure online payment options including UPI, credit/debit cards, and net banking.</p>
          </details>
        </div>
      </section>
      )}
    </div>
  );
};
export default Home;
