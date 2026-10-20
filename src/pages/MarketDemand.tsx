import React, { useState } from 'react';
import { 
  TrendingUp, 
  Search, 
  BarChart3, 
  ArrowUpRight, 
  AlertTriangle, 
  CheckCircle2, 
  HelpCircle,
  ShieldAlert,
  Sparkles,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface MarketTrendItem {
  id: string;
  category: string;
  keyword: string;
  growth_pct: number;
  demand_level: 'High' | 'Rising' | 'Moderate' | 'Slow';
  signal_strength: 'STRONG_RISING' | 'MODERATE_RISING' | 'STABLE' | 'SLOW_MOVING';
  matched_products: string[];
  business_gap: string;
  recommendation: string;
}

const MARKET_DEMAND_DATA: MarketTrendItem[] = [
  {
    id: 'sig_001',
    category: 'Festive Grocery / Retail',
    keyword: 'Besan and ghee festive demand',
    growth_pct: 14.0,
    demand_level: 'High',
    signal_strength: 'STRONG_RISING',
    matched_products: ['Besan', 'Ghee'],
    business_gap: 'Seeded festive grocery signal is +14%; review current stock against the saved 7-day forecast.',
    recommendation: 'Review Besan and Ghee procurement against actual supplier lead times; no order is created automatically.'
  },
  {
    id: 'sig_002',
    category: 'Staples / Grocery Retail',
    keyword: 'Staples market signal',
    growth_pct: 3.0,
    demand_level: 'Moderate',
    signal_strength: 'STABLE',
    matched_products: ['Rice', 'Atta', 'Sugar'],
    business_gap: 'The seeded staples signal is +3%; this is a planning indicator, not a live market quote.',
    recommendation: 'Review the signal alongside current prices and actual sales before changing procurement.'
  },
  {
    id: 'sig_003',
    category: 'Festive Grocery / Retail',
    keyword: 'Dry fruits festive signal',
    growth_pct: 9.0,
    demand_level: 'Rising',
    signal_strength: 'MODERATE_RISING',
    matched_products: ['Dry Fruits'],
    business_gap: 'The seeded national festive grocery signal is +9%; it is not a real-time price feed.',
    recommendation: 'Review Dry Fruits stock and sourcing assumptions before the festive period.'
  }
];

export const MarketDemand: React.FC = () => {
  const { showToast, t } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  const categories = ['ALL', 'Festive Grocery / Retail', 'Staples / Grocery Retail'];

  const filtered = MARKET_DEMAND_DATA.filter(item => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch = item.keyword.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.matched_products.some(p => p.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-amber-700">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>DEMO MARKET INTELLIGENCE:</strong> These records mirror the seeded grocery market signals. Live Google Trends, mandi-price, and B2B portal APIs are not connected.</span>
        </div>
        <span className="font-bold text-[10px] bg-amber-200/50 px-2 py-0.5 rounded uppercase">DEMO DATA</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t('nav.market_demand')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Review seeded market/festival signals alongside the Sharma General Store grocery forecast; do not treat them as live market quotes.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search trend keyword or product name..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Trend Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  {item.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{item.keyword}</h3>
              </div>
              <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                item.growth_pct > 0 
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {item.growth_pct > 0 ? `+${item.growth_pct}%` : `${item.growth_pct}%`}
              </span>
            </div>

            {/* Matched Products */}
            <div className="text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100 space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Matched Enterprise Products:
              </span>
              <div className="flex flex-wrap gap-1 mt-1">
                {item.matched_products.map((p, idx) => (
                  <span key={idx} className="bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-medium">
                    {p}
                  </span>
                ))}
              </div>
            </div>

            {/* Market Gap */}
            <div className="text-xs text-slate-700">
              <strong className="text-slate-900">Demand Gap Analysis: </strong>
              <span>{item.business_gap}</span>
            </div>

            {/* AI Recommendation */}
            <div className="flex items-start space-x-2 text-xs bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/60 text-emerald-900">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong className="text-emerald-950">Actionable Suggestion: </strong>
                <span>{item.recommendation}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
