import React, { useEffect, useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { AuthRedirectModal } from './AuthRedirectModal';
import {
  ShoppingBag,
  Heart,
  Search,
  ChevronDown,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Home as HomeIcon,
  LayoutGrid,
  Info,
  PhoneCall,
} from 'lucide-react';

export const StorefrontLayout: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const { cartCount, showAuthModal, setShowAuthModal } = useCart();
  const { wishlistCount } = useWishlist();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = () => setProfileDropdownOpen(false);
    if (profileDropdownOpen) {
      document.addEventListener('click', handleClick);
    }
    return () => document.removeEventListener('click', handleClick);
  }, [profileDropdownOpen]);

  const mobileNavItems = [
    { label: 'Home', path: '/', icon: HomeIcon, badge: 0, exact: true },
    { label: 'Shop', path: '/shop', icon: LayoutGrid, badge: 0, exact: false },
    { label: 'Cart', path: '/cart', icon: ShoppingBag, badge: cartCount, exact: false },
    { label: 'About', path: '/about', icon: Info, badge: 0, exact: false },
    { label: 'Contact', path: '/contact', icon: PhoneCall, badge: 0, exact: false },
  ];

  const isNavActive = (path: string, exact = false) => {
    const currentPath = location.pathname;
    const currentSearch = location.search;
    if (exact) {
      return currentPath === path && currentSearch === '';
    }
    if (path.includes('?')) {
      const [basePath, searchPart] = path.split('?');
      return currentPath === basePath && currentSearch.includes(searchPart);
    }
    return currentPath === path && (path === '/shop' ? currentSearch === '' : true);
  };

  const getNavLinkClass = (path: string, exact = false, activeStyle = 'bg-charcoal text-warm-white shadow-md shadow-charcoal/20') => {
    const isActive = isNavActive(path, exact);
    return `relative px-3.5 py-1.5 rounded-full text-[11px] font-space uppercase tracking-[0.16em] transition-all duration-300 flex items-center gap-1.5 font-semibold ${
      isActive
        ? `${activeStyle} scale-[1.02]`
        : 'text-charcoal/70 hover:text-charcoal hover:bg-charcoal/5 hover:scale-[1.02]'
    }`;
  };

  const isHome = location.pathname === '/';

  return (
    <div className={`min-h-screen ${isHome ? 'bg-[#171513]' : 'bg-warm-white'} flex flex-col font-space text-charcoal selection:bg-brass selection:text-charcoal relative`}>

      {/* ─── 3 FLOATING ISLANDS NAVBAR ─── */}
      <header className={`sticky top-0 z-40 w-full px-3 md:px-8 py-3 md:py-4 pointer-events-none transition-all duration-300 font-space ${
        isHome ? 'mb-[-80px] md:mb-[-90px]' : ''
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 md:gap-4 pointer-events-none">

            {/* 1. Left Island: Brand Logo */}
            <div className="pointer-events-auto shrink-0 bg-warm-white/95 backdrop-blur-xl border border-warm-gray/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-4 md:px-6 py-2 md:py-2.5 flex items-center transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] hover:border-brass/60 hover:-translate-y-0.5">
              <Link
                to="/"
                className="group flex items-center"
              >
                <img
                  src="/kuduchee-logo-dark.png"
                  alt="Kuduchee"
                  className="h-7 md:h-10 w-auto object-contain group-hover:scale-105 transition-transform duration-300"
                />
              </Link>
            </div>

            {/* 2. Middle Island: Enhanced Navigation Links (Desktop) */}
            <nav className="hidden lg:flex pointer-events-auto items-center gap-1 bg-warm-white/95 backdrop-blur-xl border border-warm-gray/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full p-1.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] hover:border-brass/60">
              <Link to="/" className={getNavLinkClass('/', true)}>
                <span>Home</span>
              </Link>

              <Link to="/shop" className={getNavLinkClass('/shop')}>
                <span>Shop</span>
              </Link>

              <Link
                to="/shop?section=best-sellers"
                className={getNavLinkClass('/shop?section=best-sellers', false, 'bg-amber-600 text-white shadow-md shadow-amber-600/30')}
              >
                <span>Best Sellers</span>
              </Link>

              <Link
                to="/shop?section=new-arrivals"
                className={getNavLinkClass('/shop?section=new-arrivals', false, 'bg-emerald-700 text-white shadow-md shadow-emerald-700/30')}
              >
                <span>New Arrivals</span>
              </Link>

              <Link
                to="/shop?section=exclusive"
                className={getNavLinkClass('/shop?section=exclusive', false, 'bg-gradient-to-r from-[#2D2D2D] to-[#1a1a1a] text-[#E5D79B] border border-[#C2B267]/40 shadow-md shadow-black/40')}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C2B267] animate-pulse" />
                <span>Exclusive</span>
              </Link>

              <Link to="/contact" className={getNavLinkClass('/contact')}>
                <span>Contact</span>
              </Link>

              <Link to="/about" className={getNavLinkClass('/about')}>
                <span>About</span>
              </Link>
            </nav>

            {/* 3. Right Island: Actions (Search, Wishlist, Cart, Sign In / Profile) */}
            <div className="pointer-events-auto shrink-0 bg-warm-white/95 backdrop-blur-xl border border-warm-gray/60 shadow-[0_8px_30px_rgb(0,0,0,0.12)] rounded-full px-3 md:px-4 py-1.5 md:py-2 flex items-center gap-1.5 md:gap-2.5 transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.18)] hover:border-brass/60 hover:-translate-y-0.5">

            {/* Search */}
            <Link to="/shop" className="p-2 text-charcoal/80 hover:text-brass hover:bg-charcoal/5 rounded-full transition-all" title="Search catalog">
              <Search className="w-4 h-4 md:w-5 md:h-5" />
            </Link>

            {/* Wishlist Counter (Desktop only) */}
            <Link to="/wishlist" className="hidden md:flex relative p-2 text-charcoal/80 hover:text-brass hover:bg-charcoal/5 rounded-full transition-all" title="Saved Wishlist">
              <Heart className="w-4 h-4 md:w-5 md:h-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brass text-charcoal text-[9px] font-extrabold rounded-full flex items-center justify-center border border-warm-white shadow-sm animate-scaleIn">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Shopping Cart Counter (Desktop) */}
            <Link to="/cart" className="hidden md:flex relative p-2 text-charcoal/80 hover:text-brass hover:bg-charcoal/5 rounded-full transition-all" title="Shopping Cart">
              <ShoppingBag className="w-4 h-4 md:w-5 md:h-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-brass text-charcoal text-[9px] font-extrabold rounded-full flex items-center justify-center border border-warm-white shadow-sm animate-scaleIn">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Mobile: Cart icon with badge */}
            <Link to="/cart" className="md:hidden relative p-1.5 text-charcoal hover:text-brass transition-colors" title="Cart">
              <ShoppingBag className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-brass text-charcoal text-[8px] font-bold rounded-full flex items-center justify-center border border-warm-white shadow-sm">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Profile Dropdown / Sign In */}
            <div className="relative pl-1">
              {isAuthenticated ? (
                <button
                  onClick={(e) => { e.stopPropagation(); setProfileDropdownOpen(!profileDropdownOpen); }}
                  className="flex items-center gap-1 p-0.5 rounded-full hover:bg-charcoal/5 transition-colors text-xs font-semibold text-charcoal"
                >
                  <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-charcoal text-warm-white border border-brass/45 flex items-center justify-center font-bold text-xs shadow-md">
                    {user?.username?.[0]?.toUpperCase()}
                  </div>
                  <ChevronDown className={`w-3.5 h-3.5 text-charcoal/60 transition-transform duration-200 ${profileDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
              ) : (
                <Link to="/login" className="text-[9px] md:text-[10px] py-1.5 md:py-2 px-3 md:px-4 bg-charcoal text-warm-white font-extrabold uppercase tracking-widest rounded-full hover:bg-brass hover:text-charcoal transition-all shadow-sm active:scale-95 block">
                  Sign In
                </Link>
              )}

              {profileDropdownOpen && isAuthenticated && (
                <div
                  className="absolute right-0 mt-3 w-52 bg-warm-white border border-warm-gray/60 rounded-2xl shadow-2xl py-2 z-50 text-xs animate-fadeIn"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="px-4 py-3 border-b border-warm-gray/30">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-full bg-charcoal text-warm-white border border-brass/35 flex items-center justify-center font-bold text-sm shrink-0">
                        {user?.username?.[0]?.toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <span className="font-bold text-charcoal block truncate">{user?.username}</span>
                        <span className="text-[10px] text-mid-gray block truncate">{user?.email}</span>
                      </div>
                    </div>
                  </div>
                  <Link to="/orders" onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-porcelain text-charcoal font-medium transition-colors">
                    My Orders &amp; Track
                  </Link>
                  <Link to="/profile" onClick={() => setProfileDropdownOpen(false)}
                    className="flex items-center gap-2 px-4 py-2.5 hover:bg-porcelain text-charcoal font-medium transition-colors">
                    Account Profile
                  </Link>
                  <button
                    onClick={() => { setProfileDropdownOpen(false); logout(); navigate('/'); }}
                    className="w-full text-left px-4 py-2.5 hover:bg-error/10 text-error font-medium border-t border-warm-gray/30 mt-1 transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </header>

      {/* ─── MAIN PAGE OUTLET ─── */}
      <main className="flex-1 pb-[100px] md:pb-0 bg-warm-white">
        <Outlet />
      </main>

      {/* ─── FLOATING WHATSAPP SUPPORT BUTTON ─── */}
      <a
        href="https://wa.me/919599652190?text=Hello%20Kuduchee%20Studio!%20I%20have%20a%20question%20about%20your%20porcelain%20collection."
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-[116px] md:bottom-8 right-4 md:right-8 z-50 bg-[#25D366] text-white w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg shadow-[#25D366]/30 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
        title="Chat on WhatsApp with Kuduchee Studio"
      >
        {/* Pulsing ring animation */}
        <span className="absolute inset-0 rounded-full bg-[#25D366] opacity-25 animate-ping group-hover:animate-none" />

        {/* Centered WhatsApp icon */}
        <i className="fa-brands fa-whatsapp text-2xl md:text-3xl relative z-10" />

        {/* Premium desktop hover tooltip */}
        <span className="hidden md:block absolute right-full mr-3 bg-charcoal text-warm-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg shadow-xl opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          Studio Assistance
        </span>
      </a>

      {/* ─── MOBILE SUB-DOCK COLLECTIONS NAVIGATION ─── */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-warm-gray/40 shadow-[0_-2px_10px_rgba(0,0,0,0.03)] h-9 flex items-center justify-around px-2">
        <Link
          to="/shop"
          className={`text-[8.5px] font-bold uppercase tracking-wider relative py-1 transition-colors ${isNavActive('/shop') && !location.search.includes('section=') ? 'text-brass' : 'text-charcoal/60'
            }`}
        >
          <span>Shop All</span>
          {isNavActive('/shop') && !location.search.includes('section=') && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-brass animate-scaleIn" />
          )}
        </Link>
        <div className="w-[1px] h-3 bg-warm-gray/50" />
        <Link
          to="/shop?section=best-sellers"
          className={`text-[8.5px] font-bold uppercase tracking-wider relative py-1 transition-colors ${isNavActive('/shop?section=best-sellers') ? 'text-amber-600' : 'text-charcoal/60'
            }`}
        >
          <span>Best Sellers</span>
          {isNavActive('/shop?section=best-sellers') && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-amber-600 animate-scaleIn" />
          )}
        </Link>
        <div className="w-[1px] h-3 bg-warm-gray/50" />
        <Link
          to="/shop?section=new-arrivals"
          className={`text-[8.5px] font-bold uppercase tracking-wider relative py-1 transition-colors ${isNavActive('/shop?section=new-arrivals') ? 'text-emerald-600' : 'text-charcoal/60'
            }`}
        >
          <span>New Arrivals</span>
          {isNavActive('/shop?section=new-arrivals') && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-emerald-600 animate-scaleIn" />
          )}
        </Link>
        <div className="w-[1px] h-3 bg-warm-gray/50" />
        <Link
          to="/shop?section=exclusive"
          className={`text-[8.5px] font-bold uppercase tracking-wider relative py-1 transition-colors flex items-center gap-0.5 ${isNavActive('/shop?section=exclusive') ? 'text-[#C2B267]' : 'text-charcoal/60'
            }`}
        >
          <Sparkles className="w-2.5 h-2.5 text-[#C2B267]" />
          <span>Exclusive</span>
          {isNavActive('/shop?section=exclusive') && (
            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#C2B267] animate-scaleIn" />
          )}
        </Link>
      </div>

      {/* ─── MOBILE BOTTOM APP NAVIGATION ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-warm-white border-t border-warm-gray/40 shadow-[0_-4px_24px_rgba(26,24,20,0.1)]">
        <div className="grid grid-cols-5 h-16">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const active = isNavActive(item.path, item.exact);
            return (
              <Link
                key={item.path}
                to={item.path}
                className="flex flex-col items-center justify-center gap-1 relative"
              >
                {/* Active top indicator bar */}
                {active && (
                  <span className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] bg-brass rounded-b-full" />
                )}

                {/* Icon with badge */}
                <div className={`relative transition-all duration-200 ${active ? 'scale-110 -translate-y-0.5' : ''}`}>
                  <Icon
                    className={`w-[22px] h-[22px] transition-colors ${active ? 'text-brass' : 'text-charcoal/40'}`}
                    strokeWidth={active ? 2.5 : 1.75}
                  />
                  {item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 min-w-[15px] h-[15px] bg-brass text-charcoal text-[7px] font-extrabold rounded-full flex items-center justify-center px-[2px] border-[1.5px] border-warm-white shadow-sm">
                      {item.badge > 9 ? '9+' : item.badge}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className={`text-[9px] font-bold uppercase tracking-wide leading-none transition-colors ${active ? 'text-brass' : 'text-charcoal/35'}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* ─── FOOTER ─── */}
      <footer className="bg-charcoal text-warm-white border-t border-brass/20 pt-12 md:pt-16 pb-12 font-sans">
        <div className="max-w-screen-xl mx-auto px-6 md:px-12 grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12 border-b border-warm-white/10 pb-10 md:pb-12">

          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <img src="/kuduchee-logo-transparent.png" alt="Kuduchee" className="h-12 w-auto object-contain" />
            <p className="text-xs text-warm-white/70 leading-relaxed font-light">
              Designing Experiences Around Every Meal. Thoughtful homeware inspired by Indian traditions &amp; contemporary living.
            </p>
            <span className="text-[11px] text-brass italic font-brand block">
              "Serve What You Deserve."
            </span>
            <div className="flex items-center gap-3 pt-1">
              <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-warm-white/10 hover:bg-brass hover:text-charcoal flex items-center justify-center transition-all text-sm" title="Instagram">
                <i className="fa-brands fa-instagram" />
              </a>
              <a href="https://wa.me/919599652190" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-warm-white/10 hover:bg-brass hover:text-charcoal flex items-center justify-center transition-all text-sm" title="WhatsApp">
                <i className="fa-brands fa-whatsapp" />
              </a>
              <a href="https://pinterest.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-warm-white/10 hover:bg-brass hover:text-charcoal flex items-center justify-center transition-all text-sm" title="Pinterest">
                <i className="fa-brands fa-pinterest" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-warm-white/10 hover:bg-brass hover:text-charcoal flex items-center justify-center transition-all text-sm" title="Facebook">
                <i className="fa-brands fa-facebook" />
              </a>
            </div>
          </div>

          {/* Studio Collections */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-brass text-[11px]">Studio Collections</h4>
            <ul className="space-y-2 text-warm-white/70 font-light">
              <li><Link to="/shop" className="hover:text-warm-white transition-colors">All Products</Link></li>
              <li><Link to="/shop?section=best-sellers" className="hover:text-warm-white transition-colors">Best Seller Collection</Link></li>
              <li><Link to="/shop?section=new-arrivals" className="hover:text-warm-white transition-colors">New Studio Arrivals</Link></li>
              <li><Link to="/shop?section=exclusive" className="hover:text-warm-white transition-colors flex items-center gap-1.5">✦ Exclusive Store</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div className="space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-brass text-[11px]">Customer Care &amp; Support</h4>
            <ul className="space-y-2 text-warm-white/70 font-light">
              <li><Link to="/about" className="hover:text-warm-white transition-colors">Our Brand Ideology</Link></li>
              <li><Link to="/contact" className="hover:text-warm-white transition-colors">Contact Us &amp; Maps</Link></li>
              <li><Link to="/orders" className="hover:text-warm-white transition-colors">Track Order Status</Link></li>
              <li><Link to="/cart" className="hover:text-warm-white transition-colors">Insured Shipping &amp; Delivery</Link></li>
              <li>
                <a href="https://wa.me/919599652190" target="_blank" rel="noopener noreferrer"
                  className="hover:text-warm-white transition-colors">WhatsApp Studio Representative</a>
              </li>
            </ul>
          </div>

          {/* Entity Info */}
          <div className="col-span-2 md:col-span-1 space-y-3 text-xs">
            <h4 className="font-bold uppercase tracking-wider text-brass text-[11px]">Corporate Headquarters</h4>
            <div className="text-warm-white/70 leading-relaxed font-light space-y-1">
              <p className="font-medium text-warm-white">Kaviz Creations Private Limited</p>
              <p className="flex items-start gap-1.5 pt-0.5">
                <MapPin className="w-3.5 h-3.5 text-brass shrink-0 mt-0.5" />
                <span>510 A, Sun West Bank, Ashram Road, Ahmedabad, Gujarat 380009</span>
              </p>
              <p className="text-[10px] font-mono font-bold text-brass pt-0.5">GSTIN: 24AAICK1328G1ZT</p>
              <p className="flex items-center gap-1.5 pt-1">
                <Phone className="w-3 h-3 text-brass shrink-0" /><span>+91 9599652190</span>
              </p>
              <p className="flex items-center gap-1.5">
                <Mail className="w-3 h-3 text-brass shrink-0" /><span>info@kuduchee.in</span>
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-screen-xl mx-auto px-6 md:px-12 pt-6 md:pt-8 flex flex-col sm:flex-row justify-between items-center text-[11px] text-warm-white/50">
          <p>© {new Date().getFullYear()} Kuduchee (Kaviz Creations Private Limited). All rights reserved.</p>
          <div className="flex items-center gap-4 md:gap-6 mt-3 sm:mt-0">
            <span>UPI / QR Code &amp; Razorpay Ready</span>
            <span>Made with Care in India</span>
          </div>
        </div>
      </footer>
      {showAuthModal && <AuthRedirectModal onClose={() => setShowAuthModal(false)} />}
    </div>
  );
};
export default StorefrontLayout;

