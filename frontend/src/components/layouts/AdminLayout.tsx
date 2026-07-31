import React, { useState } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard',            path: '/admin/dashboard',     faIcon: 'fa-solid fa-chart-line' },
    { label: 'Products',             path: '/admin/products',      faIcon: 'fa-solid fa-box' },
    { label: 'Categories',           path: '/admin/categories',    faIcon: 'fa-solid fa-folder-tree' },
    { label: 'Orders Workflow',      path: '/admin/orders',        faIcon: 'fa-solid fa-receipt' },
    { label: 'Cancellations & Refunds', path: '/admin/cancellations', faIcon: 'fa-solid fa-rotate-left' },
    { label: 'Reviews',              path: '/admin/reviews',       faIcon: 'fa-solid fa-star' },
    { label: 'User Accounts',        path: '/admin/users',         faIcon: 'fa-solid fa-users' },
    { label: 'Hero & Store Settings',path: '/admin/settings',      faIcon: 'fa-solid fa-sliders' },
  ];

  // Short labels for mobile bottom tab bar
  const mobileTabItems = [
    { label: 'Home',     path: '/admin/dashboard',  faIcon: 'fa-solid fa-chart-line' },
    { label: 'Products', path: '/admin/products',   faIcon: 'fa-solid fa-box' },
    { label: 'Orders',   path: '/admin/orders',     faIcon: 'fa-solid fa-receipt' },
    { label: 'Settings', path: '/admin/settings',   faIcon: 'fa-solid fa-sliders' },
  ];

  const currentPageLabel = location.pathname.replace('/admin/', '').replace(/-/g, ' ') || 'Dashboard';

  const SidebarContent = () => (
    <>
      {/* Brand Header */}
      <div className="px-6 py-5 border-b border-warm-gray/30">
        <Link to="/admin/dashboard" className="block" onClick={() => setSidebarOpen(false)}>
          <img src="/kuduchee-logo-dark.png" alt="Kuduchee Admin" className="h-10 w-auto object-contain mb-1" />
          <span className="text-[9px] uppercase tracking-[0.3em] text-brass font-bold block">Studio Admin Console</span>
        </Link>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
          return (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setSidebarOpen(false)}
              className={`group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative overflow-hidden ${
                isActive
                  ? 'bg-brass text-charcoal shadow-sm font-bold'
                  : 'text-charcoal/60 hover:text-charcoal hover:bg-charcoal/5'
              }`}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-charcoal/30 rounded-r-full" />
              )}
              <i className={`${item.faIcon} w-4 shrink-0 text-center text-[12px] ${isActive ? 'text-charcoal' : 'text-charcoal/40 group-hover:text-charcoal'}`} />
              <span>{item.label}</span>
              {isActive && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-charcoal/20" />}
            </Link>
          );
        })}

        {/* Divider */}
        <div className="pt-3 border-t border-warm-gray/30 mt-3 space-y-0.5">
          <a
            href="http://localhost:8000/admin/"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-brass hover:bg-brass/10 transition-all"
          >
            <i className="fa-solid fa-database w-4 text-brass/75 text-center" />
            <span>Django Native Admin</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[9px] ml-auto opacity-60" />
          </a>

          <Link
            to="/"
            target="_blank"
            onClick={() => setSidebarOpen(false)}
            className="group flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold text-charcoal/50 hover:text-charcoal hover:bg-charcoal/5 transition-all"
          >
            <i className="fa-solid fa-store w-4 text-charcoal/40 group-hover:text-charcoal text-center" />
            <span>View Customer Store</span>
            <i className="fa-solid fa-arrow-up-right-from-square text-[9px] ml-auto opacity-40" />
          </Link>
        </div>
      </nav>

      {/* Footer Admin Profile */}
      <div className="p-4 border-t border-warm-gray/30 bg-porcelain/40">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-charcoal text-warm-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
            {user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-bold text-charcoal block truncate">{user?.username}</span>
            <span className="text-[10px] text-brass uppercase tracking-wider block font-semibold">Administrator</span>
          </div>
          <button
            onClick={() => { logout(); navigate('/admin/login'); }}
            className="p-2 text-charcoal/40 hover:text-red-500 transition-colors rounded-lg hover:bg-charcoal/5 shrink-0"
            title="Sign Out"
          >
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </div>
    </>
  );

  return (
    <div className="h-screen overflow-hidden bg-[#F9F6F0] flex font-sans text-charcoal">

      {/* ─── DESKTOP SIDEBAR (hidden on mobile) ─── */}
      <aside className="hidden lg:flex w-64 bg-white text-charcoal flex-col shrink-0 border-r border-warm-gray/50 shadow-sm h-full">
        <SidebarContent />
      </aside>

      {/* ─── MOBILE SIDEBAR OVERLAY ─── */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ─── MOBILE SLIDE-IN DRAWER ─── */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-72 bg-white flex flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Close button inside drawer */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 text-charcoal/50 hover:text-charcoal rounded-lg hover:bg-charcoal/5 z-10"
        >
          <i className="fa-solid fa-xmark text-lg" />
        </button>
        <SidebarContent />
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#F9F6F0] h-full overflow-hidden">

        {/* Top Header */}
        <header className="h-14 bg-white border-b border-warm-gray/40 px-4 md:px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-charcoal/5 text-charcoal/60 hover:text-charcoal transition-colors"
            >
              <i className="fa-solid fa-bars text-base" />
            </button>

            {/* Breadcrumb */}
            <div className="flex items-center gap-2">
              <span className="hidden sm:block text-[11px] uppercase tracking-widest text-mid-gray font-bold">Kuduchee 2.0</span>
              <span className="hidden sm:block text-warm-gray">/</span>
              <span className="text-xs font-semibold text-charcoal capitalize">{currentPageLabel}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <a
              href="http://localhost:8000/admin/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 bg-brass/10 border border-brass/30 text-charcoal rounded-xl text-[11px] font-bold hover:bg-brass transition-all"
            >
              <i className="fa-solid fa-database text-brass" />
              <span>Django Admin</span>
            </a>

            {/* Live Badge */}
            <div className="flex items-center gap-2 bg-[#F9F6F0] px-3 py-1.5 rounded-full border border-warm-gray/45">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-[11px] font-bold text-charcoal hidden xs:block">{user?.username}</span>
            </div>

            {/* Mobile logout button in header */}
            <button
              onClick={() => { logout(); navigate('/admin/login'); }}
              className="lg:hidden p-2 text-charcoal/40 hover:text-red-500 transition-colors rounded-lg hover:bg-charcoal/5"
              title="Sign Out"
            >
              <i className="fa-solid fa-right-from-bracket" />
            </button>
          </div>
        </header>

        {/* Page Body — extra bottom padding on mobile for tab bar */}
        <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto scrollbar-hide pb-20 lg:pb-8">
          <Outlet />
        </main>

        {/* ─── MOBILE BOTTOM TAB BAR ─── */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-warm-gray/40 flex items-stretch shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          {mobileTabItems.map((item) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + '/');
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-center transition-colors ${
                  isActive ? 'text-brass' : 'text-charcoal/40 hover:text-charcoal'
                }`}
              >
                <i className={`${item.faIcon} text-base`} />
                <span className="text-[9px] font-bold uppercase tracking-wider">{item.label}</span>
                {isActive && <span className="absolute top-0 w-8 h-[2px] bg-brass rounded-b-full" />}
              </Link>
            );
          })}
          {/* More button to open sidebar drawer */}
          <button
            onClick={() => setSidebarOpen(true)}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-charcoal/40 hover:text-charcoal transition-colors"
          >
            <i className="fa-solid fa-ellipsis text-base" />
            <span className="text-[9px] font-bold uppercase tracking-wider">More</span>
          </button>
        </nav>

      </div>
    </div>
  );
};

export default AdminLayout;
