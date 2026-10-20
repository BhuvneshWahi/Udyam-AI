import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  BarChart3, 
  PieChart as PieIcon, 
  Users, 
  Sparkles, 
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  ChevronRight
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { useApp } from '../context/AppContext';

export const SalesBI: React.FC = () => {
  const { kpis, salesTrends, products } = useApp();
  const navigate = useNavigate();

  const aov = Math.round(kpis.monthly_revenue / kpis.monthly_orders);

  const categoryData = [
    { name: 'Electricals', value: 755220, color: '#2563EB', margin: '36.8%' },
    { name: 'Auto Parts', value: 607860, color: '#10B981', margin: '39.8%' },
    { name: 'Hardware', value: 331560, color: '#F59E0B', margin: '51.1%' },
    { name: 'Plumbing & Fittings', value: 147360, color: '#6366F1', margin: '36.3%' }
  ];

  const topProducts = [...products].sort((a, b) => b.selling_price * b.avg_daily_sales - a.selling_price * a.avg_daily_sales);
  const bottomProducts = [...products].sort((a, b) => a.sales_growth_30d - b.sales_growth_30d);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-slate-900">Sales & Business Intelligence</h2>
          <p className="text-xs text-slate-500 mt-0.5">Real-time revenue performance, margin analysis, and repeat client metrics</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/copilot?q=Kaunse%20products%20sabse%20zyada%20profit%20de%20rahe%20hain%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Profit Analysis</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Monthly Revenue</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(kpis.monthly_revenue / 100000).toFixed(2)} Lakhs</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +18.5% MoM
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Orders</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{kpis.monthly_orders}</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold flex items-center mt-1">
            <ArrowUpRight className="w-3 h-3 mr-0.5" /> +11.4% Growth
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Average Order Value</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {aov.toLocaleString('en-IN')}</p>
          <span className="text-[10px] sm:text-[11px] text-blue-600 font-bold mt-1 block">B2B Ticket Size</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Gross Profit</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(kpis.gross_profit / 100000).toFixed(2)} Lakhs</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-1 block">Healthy Return</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <span className="text-xs text-slate-500 font-medium">Profit Margin</span>
          <p className="text-base sm:text-lg font-bold text-emerald-600 mt-1">{kpis.profit_margin}%</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Target: &gt;30%</span>
        </div>
      </div>

      {/* AI Insight Highlight Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start space-x-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded">
              AI Sales Insight
            </span>
            <h4 className="font-bold text-xs sm:text-sm text-white mt-1">
              "Electricals generated 41.0% of revenue but Hardware yields significantly higher net margin (51.1% vs 36.8%)."
            </h4>
            <p className="text-xs text-slate-300 mt-0.5">
              Bundling Stainless Steel Fasteners M8 with electrical sub-assemblies will boost total profitability by 4.2%.
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/insights')}
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shrink-0 transition-all shadow-md"
        >
          <span>View Smart Insights</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue & Profit Bar Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 text-sm">Monthly Revenue vs Net Profit</h3>
            <span className="text-xs font-semibold text-slate-500">Apr - Sep 2026</span>
          </div>

          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(val: any) => [`₹ ${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Bar dataKey="revenue" name="Revenue" fill="#2563EB" radius={[4, 4, 0, 0]} />
                <Bar dataKey="profit" name="Profit" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Performance Donut */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Category Revenue & Margin</h3>
          
          <div className="h-44 sm:h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={70}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(val: any) => [`₹ ${Number(val).toLocaleString('en-IN')}`, 'Revenue']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 text-xs">
            {categoryData.map((c, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center space-x-2 truncate">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></div>
                  <span className="font-medium text-slate-700 truncate">{c.name}</span>
                </div>
                <div className="space-x-1.5 shrink-0">
                  <span className="font-bold text-slate-900">₹{(c.value/100000).toFixed(2)}L</span>
                  <span className="text-emerald-600 font-bold bg-emerald-50 px-1 py-0.5 rounded text-[11px]">{c.margin}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Product & Customer Analysis Tables */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">Top Revenue Generators</h4>
            <span className="text-xs text-emerald-600 font-bold">Highest Demand</span>
          </div>
          <div className="space-y-2">
            {topProducts.slice(0, 4).map((p, i) => (
              <div key={i} className="p-2.5 bg-slate-50 rounded-lg flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-slate-500">{p.category} • Margin: {p.margin_pct}%</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="font-bold text-slate-900">₹ {p.selling_price * p.avg_daily_sales * 30}</p>
                  <span className="text-[10px] text-emerald-600 font-bold">+{p.sales_growth_30d}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom / Slow Moving Products */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">Slow Moving SKUs</h4>
            <span className="text-xs text-amber-700 font-bold">Review Required</span>
          </div>
          <div className="space-y-2">
            {bottomProducts.slice(0, 4).map((p, i) => (
              <div key={i} className="p-2.5 bg-amber-50/40 border border-amber-200/60 rounded-lg flex items-center justify-between text-xs">
                <div className="min-w-0 pr-2">
                  <p className="font-bold text-slate-900 truncate">{p.name}</p>
                  <p className="text-[10px] text-amber-800">Supply: {p.days_remaining} Days</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-red-600 text-xs">{p.sales_growth_30d}%</span>
                  <button 
                    onClick={() => navigate('/inventory')}
                    className="text-[10px] text-blue-600 font-bold block hover:underline mt-0.5"
                  >
                    Clearance →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Retention Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3 md:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h4 className="font-bold text-slate-900 text-sm">B2B Customer Retention</h4>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">High Retention</span>
          </div>

          <div className="text-center py-1.5">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">Not verified</span>
            <p className="text-xs text-slate-500 font-medium">Customer history is not included in the verified demo snapshot</p>
          </div>

          <div className="space-y-2 pt-1 border-t border-slate-100 text-xs">
            <p className="font-bold text-slate-800">Top Accounts:</p>
            <div className="flex justify-between text-slate-700">
              <span className="truncate pr-2">Customer ledger unavailable</span>
              <strong className="text-slate-900 shrink-0">—</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="truncate pr-2">Customer ledger unavailable</span>
              <strong className="text-slate-900 shrink-0">—</strong>
            </div>
            <div className="flex justify-between text-slate-700">
              <span className="truncate pr-2">Customer ledger unavailable</span>
              <strong className="text-slate-900 shrink-0">—</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
