import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  IndianRupee, 
  ShoppingBag, 
  Package, 
  AlertTriangle, 
  ArrowUpRight, 
  Sparkles, 
  Mic, 
  ChevronRight, 
  ArrowRight,
  BarChart3,
  ShieldAlert
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip 
} from 'recharts';
import { useApp } from '../context/AppContext';

export const Home: React.FC = () => {
  const { kpis, salesTrends, products, setVoiceModalOpen } = useApp();
  const [queryInput, setQueryInput] = useState('');
  const navigate = useNavigate();

  const handleQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (queryInput.trim()) {
      navigate(`/copilot?q=${encodeURIComponent(queryInput)}`);
    }
  };

  const handlePromptClick = (promptText: string) => {
    navigate(`/copilot?q=${encodeURIComponent(promptText)}`);
  };

  // Grounded top products from live store
  const bestSelling = products.find(p => p.id === 'PROD-101') || products[0];
  const highestMargin = products.find(p => p.id === 'PROD-105') || products[1];
  const slowMoving = products.find(p => p.id === 'PROD-103') || products[2];

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Top Banner / Hero Interaction Box */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-4 sm:p-6 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="max-w-3xl space-y-3 sm:space-y-4">
          <div className="inline-flex items-center space-x-2 bg-emerald-500/20 border border-emerald-500/30 px-2.5 py-1 rounded-full text-emerald-400 text-[10px] sm:text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>GROUNDED MSME AI COPILOT</span>
          </div>

          <h2 className="text-xl sm:text-2xl md:text-3xl font-extrabold tracking-tight leading-snug">
            Namaste Rajesh Ji, <span className="text-emerald-400 block sm:inline">What decision should Udyam AI help you make today?</span>
          </h2>

          <p className="text-xs text-slate-300 leading-relaxed">
            Sharma General Store is running at <strong>₹ 18.42 Lakhs monthly revenue (+18.5% YoY)</strong>. 
            However, 2 critical items face stockout risk in under 4 days.
          </p>

          {/* Prominent Search Input */}
          <form onSubmit={handleQuerySubmit} className="pt-1 sm:pt-2">
            <div className="relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={queryInput}
                  onChange={(e) => setQueryInput(e.target.value)}
                  placeholder="Ask Udyam AI anything about sales, stockouts, GST..."
                  className="w-full pl-3.5 pr-10 py-3 text-xs sm:text-sm bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:bg-slate-900/90 transition-all shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setVoiceModalOpen(true)}
                  className="absolute right-2 top-2 sm:top-2.5 p-1.5 text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  title="Voice Input"
                >
                  <Mic className="w-4 h-4 text-emerald-400" />
                </button>
              </div>
              <button
                type="submit"
                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold px-4 py-3 sm:py-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 transition-all shadow-md shrink-0"
              >
                <span>Ask AI</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Suggested Prompts */}
          <div className="pt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span className="text-[10px] sm:text-[11px] text-slate-400 font-semibold w-full sm:w-auto">Suggested Questions:</span>
            {[
              "Agle mahine kaunse products ka stock badhana chahiye?",
              "Mere sales kyu gir rahe hain?",
              "Kaunse products sabse zyada profit de rahe hain?",
              "Meri next GST filing kab hai?"
            ].map((prompt, i) => (
              <button
                key={i}
                onClick={() => handlePromptClick(prompt)}
                className="bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/40 text-slate-300 text-[10px] sm:text-[11px] font-medium px-2 py-1 rounded-lg transition-all text-left"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Today's Sales</span>
            <IndianRupee className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900">₹ {kpis.today_sales.toLocaleString('en-IN')}</p>
          <div className="flex items-center space-x-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{kpis.today_sales_change}% vs yesterday</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Monthly Revenue</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900">₹ {(kpis.monthly_revenue / 100000).toFixed(2)} Lakhs</p>
          <div className="flex items-center space-x-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{kpis.monthly_revenue_change}% MoM</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Gross Profit</span>
            <BarChart3 className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900">₹ {(kpis.gross_profit / 100000).toFixed(2)} Lakhs</p>
          <span className="inline-block text-[10px] sm:text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded mt-1">
            {kpis.profit_margin}% Margin
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Monthly Orders</span>
            <ShoppingBag className="w-3.5 h-3.5 text-indigo-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900">{kpis.monthly_orders}</p>
          <div className="flex items-center space-x-1 text-[10px] sm:text-[11px] text-emerald-600 font-semibold mt-1">
            <ArrowUpRight className="w-3 h-3" />
            <span>+{kpis.orders_change}% growth</span>
          </div>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-slate-500 text-xs mb-1">
            <span>Inventory Value</span>
            <Package className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <p className="text-base sm:text-lg font-bold text-slate-900">₹ {(kpis.inventory_value / 100000).toFixed(2)} Lakhs</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium mt-1 block truncate">
            {kpis.total_skus} Active SKUs
          </span>
        </div>

        <div className="bg-amber-50/70 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs hover:shadow-md transition-all">
          <div className="flex items-center justify-between text-amber-800 text-xs mb-1">
            <span className="font-bold">Low Stock Risk</span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
          </div>
          <p className="text-base sm:text-lg font-extrabold text-amber-900">{kpis.low_stock_items} SKUs</p>
          <button 
            onClick={() => navigate('/inventory')}
            className="text-[10px] sm:text-[11px] font-bold text-amber-700 hover:text-amber-900 underline mt-1 block"
          >
            Review Reorder List →
          </button>
        </div>
      </div>

      {/* Main Grid: Business Health Chart & AI Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Revenue & Profit Trends Chart */}
        <div className="lg:col-span-2 bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Business Growth & Profit Trends</h3>
              <p className="text-xs text-slate-500">6-Month Revenue vs Net Gross Profit performance</p>
            </div>
            <button 
              onClick={() => navigate('/sales')}
              className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Sales BI</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-56 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesTrends} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563EB" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#2563EB" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} tickFormatter={(v) => `₹${(v/100000).toFixed(1)}L`} />
                <Tooltip 
                  formatter={(val: any) => [`₹ ${Number(val).toLocaleString('en-IN')}`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#2563EB" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                <Area type="monotone" dataKey="profit" name="Gross Profit" stroke="#10B981" strokeWidth={2.5} fillOpacity={1} fill="url(#colorProfit)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time AI Alerts Sidebar Card */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <ShieldAlert className="w-4 h-4 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-sm">Grounded AI Alerts</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">Active</span>
            </div>

            <div className="space-y-3 mt-4">
              <div className="p-3 bg-red-50/80 border border-red-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-red-800 font-bold text-xs">
                  <span>Stockout Risk (2.3 Days)</span>
                  <span className="text-[10px] bg-red-200 text-red-900 px-1.5 py-0.5 rounded">High</span>
                </div>
                <p className="text-xs text-red-700 leading-tight">
                  7 products may stock out within 10 days. Product A stock down to 42 units.
                </p>
                <button 
                  onClick={() => navigate('/copilot?q=Agle%20mahine%20kaunse%20products%20ka%20stock%20badhana%20chahiye%3F')}
                  className="text-[11px] font-bold text-red-800 hover:text-red-950 underline pt-1 block"
                >
                  Ask Udyam AI to generate PO →
                </button>
              </div>

              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-emerald-900 font-bold text-xs">
                  <span>Demand Growth (+28.4%)</span>
                  <span className="text-[10px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded">Opportunity</span>
                </div>
                <p className="text-xs text-emerald-800 leading-tight">
                  Besan demand is trending up ahead of the festive season; review procurement against the 7-day forecast.
                </p>
              </div>

              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl space-y-1">
                <div className="flex items-center justify-between text-amber-900 font-bold text-xs">
                  <span>Overstock Capital Lock</span>
                  <span className="text-[10px] bg-amber-200 text-amber-900 px-1.5 py-0.5 rounded">Action</span>
                </div>
                <p className="text-xs text-amber-800 leading-tight">
                  Product C (PVC Pipes) has 148 days of idle supply. ₹ 1.24L tied up.
                </p>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/actions')}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-colors shadow-sm"
          >
            <span>View Today's Action Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Top Products Section */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Product Performance Breakdown</h3>
            <p className="text-xs text-slate-500">Best-selling, highest margin, and slow-moving highlights</p>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3.5 sm:p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                Best Selling
              </span>
              <span className="text-xs font-bold text-emerald-600">+{bestSelling.sales_growth_30d}%</span>
            </div>
            <p className="font-bold text-slate-900 text-sm truncate">{bestSelling.name}</p>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between"><span>Stock:</span> <strong className="text-slate-900">{bestSelling.stock} units</strong></div>
              <div className="flex justify-between"><span>30D Forecast:</span> <strong>{bestSelling.forecast_demand_30d} units</strong></div>
              <div className="flex justify-between"><span>Suggested Order:</span> <strong className="text-emerald-700 font-extrabold">{bestSelling.suggested_reorder} units</strong></div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 border border-slate-200 rounded-xl bg-slate-50/50 hover:bg-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                Highest Margin
              </span>
              <span className="text-xs font-bold text-blue-600">{highestMargin.margin_pct}% Margin</span>
            </div>
            <p className="font-bold text-slate-900 text-sm truncate">{highestMargin.name}</p>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between"><span>Cost / Selling:</span> <strong className="text-slate-900">₹{highestMargin.cost_price} / ₹{highestMargin.selling_price}</strong></div>
              <div className="flex justify-between"><span>Stock:</span> <strong>{highestMargin.stock} units</strong></div>
              <div className="flex justify-between"><span>Status:</span> <strong className="text-emerald-600 font-bold">Healthy Supply</strong></div>
            </div>
          </div>

          <div className="p-3.5 sm:p-4 border border-amber-200 rounded-xl bg-amber-50/30 hover:bg-white transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-100 px-2 py-0.5 rounded">
                Overstocked
              </span>
              <span className="text-xs font-bold text-amber-700">{slowMoving.sales_growth_30d}% Growth</span>
            </div>
            <p className="font-bold text-slate-900 text-sm truncate">{slowMoving.name}</p>
            <div className="mt-2 text-xs text-slate-600 space-y-1">
              <div className="flex justify-between"><span>Current Stock:</span> <strong className="text-slate-900">{slowMoving.stock} units</strong></div>
              <div className="flex justify-between"><span>Days Supply:</span> <strong className="text-amber-800 font-bold">{slowMoving.days_remaining} Days</strong></div>
              <div className="flex justify-between"><span>AI Advice:</span> <strong className="text-amber-700">Clearance Promotion</strong></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
