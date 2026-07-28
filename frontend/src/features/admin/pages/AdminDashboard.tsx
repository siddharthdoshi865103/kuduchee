import React, { useEffect, useState } from 'react';
import { orderService, type AnalyticsData, type OrderData } from '../../../services/orderService';
import { catalogService, type ProductData } from '../../../services/catalogService';
import {
  TrendingUp,
  ClipboardList,
  Clock,
  XCircle,
  ArrowUpRight,
  Package,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const AdminDashboard: React.FC = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [recentOrders, setRecentOrders] = useState<OrderData[]>([]);
  const [allOrders, setAllOrders] = useState<OrderData[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<ProductData[]>([]);
  const [loading, setLoading] = useState(true);

  // Chart interactivity state
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [anData, ordData, prodData] = await Promise.all([
          orderService.getAnalytics(),
          orderService.getOrders(),
          catalogService.getProducts(),
        ]);
        setAnalytics(anData);
        setAllOrders(ordData);
        setRecentOrders(ordData.slice(0, 5));
        
        // Low stock products: active and stock <= 5
        setLowStockProducts((prodData || []).filter((p: ProductData) => p.is_active && Number(p.stock_quantity) <= 5));
      } catch {
        // silent fallback
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const stats = [
    {
      name: 'Total Studio Revenue',
      value: `₹${analytics?.total_revenue ? analytics.total_revenue.toLocaleString('en-IN') : '0'}`,
      icon: TrendingUp,
      badge: 'Approved',
      badgeColor: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/20',
      subtitle: 'Verified customer sales',
    },
    {
      name: 'Total Orders',
      value: analytics?.total_orders || 0,
      icon: ClipboardList,
      badge: 'Lifetime',
      badgeColor: 'bg-indigo-500/10 text-indigo-700 border-indigo-500/20',
      subtitle: 'Customer checkouts',
    },
    {
      name: 'Pending Verification',
      value: analytics?.pending_verification || 0,
      icon: Clock,
      badge: analytics?.pending_verification ? 'Action Req.' : 'Clear',
      badgeColor: analytics?.pending_verification
        ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
        : 'bg-zinc-100 text-zinc-600 border-zinc-200',
      subtitle: 'Awaiting UTR check',
    },
    {
      name: 'Rejected Orders',
      value: analytics?.rejected || 0,
      icon: XCircle,
      badge: 'Failed UTR',
      badgeColor: 'bg-rose-500/10 text-rose-700 border-rose-500/20',
      subtitle: 'Payment unverified',
    },
  ];

  // Calculate past 7 days sales data points
  const getTrendData = () => {
    const trendPoints: { dateLabel: string; displayDate: string; amount: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const displayStr = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });

      // Sum orders placed on this date that are not rejected or cancelled
      const dayTotal = allOrders
        .filter((ord) => {
          const ordDate = ord.created_at.split('T')[0];
          return ordDate === dateStr && ord.status !== 'REJECTED' && ord.status !== 'CANCELLED';
        })
        .reduce((sum, ord) => sum + Number(ord.total_amount), 0);

      trendPoints.push({ dateLabel: dateStr, displayDate: displayStr, amount: dayTotal });
    }
    return trendPoints;
  };

  const trendData = getTrendData();
  const maxAmount = Math.max(...trendData.map((t) => t.amount), 5000);
  const chartHeight = 150;
  const chartWidth = 580;
  const paddingX = 40;
  const paddingY = 25;

  const points = trendData.map((t, idx) => {
    const x = paddingX + (idx * (chartWidth - paddingX * 2)) / (trendData.length - 1);
    const y = chartHeight - paddingY - (t.amount / maxAmount) * (chartHeight - paddingY * 2);
    return { x, y, ...t };
  });

  // SVG curved path builder
  const drawCurve = () => {
    if (points.length === 0) return '';
    let d = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + (p1.x - p0.x) / 2;
      const cpY1 = p0.y;
      const cpX2 = p0.x + (p1.x - p0.x) / 2;
      const cpY2 = p1.y;
      d += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    return d;
  };

  const pathD = drawCurve();
  const fillD = pathD ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingY} L ${points[0].x} ${chartHeight - paddingY} Z` : '';

  return (
    <div className="space-y-6 md:space-y-8 animate-fadeIn font-sans pb-12 text-charcoal">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-warm-gray/30 pb-5">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-brass block mb-1">
            Studio Overview &amp; Control
          </span>
          <h1 className="font-brand text-2xl md:text-3xl text-charcoal font-medium">Executive Dashboard</h1>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/products"
            className="px-4 py-2 bg-charcoal text-warm-white rounded-xl text-xs font-semibold hover:bg-brass hover:text-charcoal transition-all flex items-center gap-2 shadow-sm"
          >
            <Package className="w-3.5 h-3.5" />
            <span>Manage Products</span>
          </Link>
          <Link
            to="/admin/orders"
            className="px-4 py-2 bg-brass text-charcoal rounded-xl text-xs font-bold hover:bg-brass-hover transition-all flex items-center gap-2 shadow-sm"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Order Queue</span>
          </Link>
        </div>
      </div>

      {/* Analytics Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="bg-white border border-warm-gray/50 rounded-2xl p-5 shadow-xs hover:border-brass/40 transition-all duration-300 flex flex-col justify-between group"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-mid-gray/70">
                  {stat.name}
                </span>
                <span
                  className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${stat.badgeColor}`}
                >
                  {stat.badge}
                </span>
              </div>

              <div className="flex items-baseline justify-between pt-1">
                <div className="text-2xl md:text-3xl font-extrabold text-charcoal tracking-tight group-hover:text-brass transition-colors">
                  {loading ? '…' : stat.value}
                </div>
                <div className="w-9 h-9 rounded-xl bg-brass/10 text-brass flex items-center justify-center shrink-0">
                  <Icon className="w-4.5 h-4.5" />
                </div>
              </div>

              <span className="text-[10px] text-mid-gray/60 mt-3 pt-3 border-t border-warm-gray/30 block font-light">
                {stat.subtitle}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dynamic Graph & Low Stock Grid */}
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Weekly Revenue trend */}
        <div className="lg:col-span-8 bg-white border border-warm-gray/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between border-b border-warm-gray/25 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">Analytics</span>
                <h3 className="text-base font-bold text-charcoal">Weekly Revenue Trend</h3>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-mid-gray/60 block">Verified Orders Only</span>
              </div>
            </div>

            {loading ? (
              <div className="h-48 flex items-center justify-center text-xs text-mid-gray/50">Plotting sales timeline…</div>
            ) : (
              <div className="relative pt-4">
                {/* SVG Trend Line */}
                <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-auto overflow-visible">
                  <defs>
                    <linearGradient id="chart-glow" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#B19F53" stopOpacity="0.18" />
                      <stop offset="100%" stopColor="#B19F53" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>

                  {/* Grid Lines */}
                  <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="#EBE7DF" strokeDasharray="3,3" />
                  <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="#EBE7DF" strokeDasharray="3,3" />
                  <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="#EBE7DF" />

                  {/* Area fill */}
                  {fillD && <path d={fillD} fill="url(#chart-glow)" />}

                  {/* Curve Path */}
                  {pathD && <path d={pathD} fill="none" stroke="#B19F53" strokeWidth="2.5" strokeLinecap="round" />}

                  {/* Nodes */}
                  {points.map((p, idx) => (
                    <g key={idx} className="cursor-pointer">
                      <circle
                        cx={p.x}
                        cy={p.y}
                        r={hoveredIndex === idx ? 6 : 4}
                        fill={hoveredIndex === idx ? '#B19F53' : '#FFFFFF'}
                        stroke="#B19F53"
                        strokeWidth="2"
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                      />
                    </g>
                  ))}
                </svg>

                {/* Interactive Tooltip Overlay */}
                <div className="h-10 mt-2 flex items-center justify-between px-2 bg-porcelain/40 rounded-xl border border-warm-gray/30 text-xs">
                  {hoveredIndex !== null ? (
                    <>
                      <span className="font-semibold text-charcoal">{points[hoveredIndex].displayDate} Revenue:</span>
                      <span className="font-extrabold text-brass text-sm">₹{points[hoveredIndex].amount.toLocaleString('en-IN')}</span>
                    </>
                  ) : (
                    <span className="text-mid-gray/70 text-[11px] italic">Hover on dots to review daily analytics</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="lg:col-span-4 bg-white border border-warm-gray/50 rounded-2xl p-6 shadow-xs flex flex-col justify-between min-h-[300px]">
          <div>
            <div className="flex items-center justify-between border-b border-warm-gray/25 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-rose-500 block">Inventory</span>
                <h3 className="text-base font-bold text-charcoal">Low Stock Alerts</h3>
              </div>
              <span className="w-5 h-5 rounded-full bg-rose-500/10 text-rose-600 text-[10px] font-bold flex items-center justify-center">
                {lowStockProducts.length}
              </span>
            </div>

            {loading ? (
              <div className="py-12 text-center text-xs text-mid-gray/50">Auditing product stock logs…</div>
            ) : lowStockProducts.length === 0 ? (
              <div className="py-12 text-center text-xs text-mid-gray/50 flex flex-col items-center gap-2">
                <i className="fa-solid fa-circle-check text-emerald-500 text-xl" />
                <span>All active product stocks are stable!</span>
              </div>
            ) : (
              <div className="space-y-3 mt-4 overflow-y-auto max-h-[170px] pr-1">
                {lowStockProducts.map((p) => (
                  <div key={p.id} className="p-2.5 rounded-xl bg-rose-500/5 border border-rose-500/10 flex items-center justify-between text-xs">
                    <div className="min-w-0 pr-2">
                      <span className="font-bold text-charcoal block truncate">{p.name}</span>
                      <span className="text-[10px] text-mid-gray">MRP: ₹{p.mrp}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full font-extrabold text-[10px] border ${
                      Number(p.stock_quantity) === 0
                        ? 'bg-rose-500/20 text-rose-700 border-rose-500/30 animate-pulse'
                        : 'bg-amber-500/20 text-amber-700 border-amber-500/30'
                    }`}>
                      {Number(p.stock_quantity) === 0 ? 'Out of Stock' : `${p.stock_quantity} left`}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {lowStockProducts.length > 0 && (
            <Link
              to="/admin/products"
              className="w-full mt-3 py-2 bg-charcoal text-white hover:bg-brass hover:text-charcoal transition-all text-center rounded-xl text-xs font-bold block"
            >
              Update Stock Inventory
            </Link>
          )}
        </div>
      </div>

      {/* Action Banner for Pending Verifications */}
      {analytics && analytics.pending_verification > 0 && (
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Action Required: {analytics.pending_verification} Pending Order Verification(s)
              </h4>
              <p className="text-xs text-charcoal/80 mt-0.5 font-light">
                Customers have submitted UTR numbers. Review payment proofs to approve or reject orders.
              </p>
            </div>
          </div>
          <Link
            to="/admin/orders"
            className="bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-all shadow-sm shrink-0 flex items-center gap-1"
          >
            <span>Review Queue</span>
            <i className="fa-solid fa-arrow-right text-[10px]" />
          </Link>
        </div>
      )}

      {/* Top Products & Recent Orders Grid */}
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Top Selling Products */}
        <div className="lg:col-span-6 bg-white border border-warm-gray/50 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-warm-gray/30 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">Performance</span>
              <h3 className="text-base font-bold text-charcoal">Top Selling Products</h3>
            </div>
            <Sparkles className="w-4 h-4 text-brass" />
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-mid-gray/50">Loading performance analytics…</div>
          ) : !analytics?.top_products || analytics.top_products.length === 0 ? (
            <div className="py-8 text-center text-xs text-mid-gray/50">No product sales recorded yet.</div>
          ) : (
            <div className="divide-y divide-warm-gray/20 text-xs">
              {analytics.top_products.map((item, idx) => (
                <div key={idx} className="py-3.5 flex items-center justify-between hover:bg-porcelain/50 px-2 rounded-lg transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-brass/20 text-charcoal text-[10px] font-extrabold flex items-center justify-center shrink-0">
                      0{idx + 1}
                    </span>
                    <span className="font-semibold text-charcoal line-clamp-1">{item.product_name}</span>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-charcoal block">₹{item.total_sales}</span>
                    <span className="text-[10px] text-mid-gray/60">{item.total_sold} units sold</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Orders Overview */}
        <div className="lg:col-span-6 bg-white border border-warm-gray/50 rounded-2xl p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-warm-gray/30 pb-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-brass block">Recent Activity</span>
              <h3 className="text-base font-bold text-charcoal">Latest Customer Orders</h3>
            </div>
            <Link
              to="/admin/orders"
              className="text-xs font-bold uppercase tracking-wider text-brass hover:underline flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-xs text-mid-gray/50">Loading recent orders…</div>
          ) : recentOrders.length === 0 ? (
            <div className="py-8 text-center text-xs text-mid-gray/50">No customer orders placed yet.</div>
          ) : (
            <div className="divide-y divide-warm-gray/20 text-xs">
              {recentOrders.map((ord) => (
                <div key={ord.id} className="py-3.5 flex items-center justify-between hover:bg-porcelain/50 px-2 rounded-lg transition-colors">
                  <div>
                    <span className="font-mono font-bold text-charcoal block">#{ord.order_number}</span>
                    <span className="text-[10px] text-mid-gray/60">
                      {ord.customer_username || 'Guest'} · ₹{ord.total_amount}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                      ord.status === 'APPROVED' || ord.status === 'DELIVERED'
                        ? 'bg-emerald-500/10 text-emerald-800 border-emerald-500/20'
                        : ord.status === 'PENDING_VERIFICATION'
                        ? 'bg-amber-500/15 text-amber-800 border-amber-500/30'
                        : 'bg-rose-500/10 text-rose-800 border-rose-500/20'
                    }`}
                  >
                    {ord.status.replace(/_/g, ' ')}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default AdminDashboard;
