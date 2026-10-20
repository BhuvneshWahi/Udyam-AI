import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingDown, 
  AlertTriangle, 
  DollarSign, 
  Package, 
  Clock, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Info,
  Target
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { ProfitLeak } from '../types';

export const ProfitLeaks: React.FC = () => {
  const navigate = useNavigate();
  const { products, kpis } = useApp();
  const [leaks, setLeaks] = useState<ProfitLeak[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectProfitLeaks();
  }, [products, kpis]);

  const detectProfitLeaks = () => {
    setLoading(true);
    const detectedLeaks: ProfitLeak[] = [];

    // Detect low-margin products
    const lowMarginProducts = products.filter(p => p.margin_pct < 30);
    if (lowMarginProducts.length > 0) {
      const totalImpact = lowMarginProducts.reduce((sum, p) => sum + (p.selling_price - p.cost_price) * p.avg_daily_sales * 30, 0);
      detectedLeaks.push({
        id: 'LEAK-001',
        type: 'LOW_MARGIN_SKU',
        title: 'Low-Margin Products',
        problem: `${lowMarginProducts.length} products have margins below 30%`,
        evidence: `Products: ${lowMarginProducts.map(p => p.name).join(', ')}`,
        estimated_impact_monthly: totalImpact,
        priority: 'High',
        recommended_action: 'Review pricing strategy or negotiate better supplier rates for low-margin SKUs'
      });
    }

    // Detect slow-moving inventory
    const slowMoving = products.filter(p => p.status === 'Overstocked' || p.days_remaining > 100);
    if (slowMoving.length > 0) {
      const inventoryValue = slowMoving.reduce((sum, p) => sum + (p.cost_price * p.stock), 0);
      detectedLeaks.push({
        id: 'LEAK-002',
        type: 'SLOW_MOVING_CASH_LOCK',
        title: 'Slow-Moving Inventory Cash Lock',
        problem: `${slowMoving.length} products have excess inventory tying up capital`,
        evidence: `Total inventory value locked: ₹${inventoryValue.toLocaleString('en-IN')}`,
        estimated_impact_monthly: inventoryValue * 0.02, // Opportunity cost at 2% monthly
        priority: 'High',
        recommended_action: 'Run clearance promotions or bundle slow-moving items with high-margin products'
      });
    }

    // Detect excessive discounts (simulated based on margin compression)
    const marginCompressionProducts = products.filter(p => p.margin_pct < 25 && p.sales_growth_30d > 0);
    if (marginCompressionProducts.length > 0) {
      detectedLeaks.push({
        id: 'LEAK-003',
        type: 'MARGIN_COMPRESSION',
        title: 'Margin Compression on Growing Products',
        problem: 'Growing products with low margins indicate possible excessive discounting',
        evidence: `${marginCompressionProducts.length} products showing sales growth but margins under 25%`,
        estimated_impact_monthly: marginCompressionProducts.reduce((sum, p) => sum + (p.selling_price * 0.05) * p.avg_daily_sales * 30, 0),
        priority: 'Medium',
        recommended_action: 'Review discount policies and negotiate better terms with customers'
      });
    }

    // Detect high-cost products with low turnover
    const highCostLowTurnover = products.filter(p => p.cost_price > 500 && p.avg_daily_sales < 5);
    if (highCostLowTurnover.length > 0) {
      detectedLeaks.push({
        id: 'LEAK-004',
        type: 'RISING_COSTS',
        title: 'High-Cost Low-Turnover Products',
        problem: 'Expensive products with low sales velocity',
        evidence: `${highCostLowTurnover.length} products cost >₹500 but sell <5 units/day`,
        estimated_impact_monthly: highCostLowTurnover.reduce((sum, p) => sum + (p.cost_price * p.stock * 0.01), 0),
        priority: 'Medium',
        recommended_action: 'Consider discontinuing or repricing high-cost low-velocity SKUs'
      });
    }

    // Detect critical stock risk (opportunity cost of lost sales)
    const criticalStock = products.filter(p => p.status === 'Critical');
    if (criticalStock.length > 0) {
      const lostSalesValue = criticalStock.reduce((sum, p) => sum + (p.selling_price * p.avg_daily_sales * 10), 0);
      detectedLeaks.push({
        id: 'LEAK-005',
        type: 'LOW_MARGIN_SKU',
        title: 'Stockout Opportunity Cost',
        problem: `${criticalStock.length} products at critical stock levels risking lost sales`,
        evidence: `Estimated lost sales over next 10 days: ₹${lostSalesValue.toLocaleString('en-IN')}`,
        estimated_impact_monthly: lostSalesValue * 3,
        priority: 'High',
        recommended_action: 'Immediate reorder for critical SKUs to prevent stockout-related revenue loss'
      });
    }

    setLeaks(detectedLeaks);
    setLoading(false);
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High': return { color: 'red', icon: AlertTriangle };
      case 'Medium': return { color: 'amber', icon: Clock };
      case 'Low': return { color: 'blue', icon: Info };
      default: return { color: 'slate', icon: Info };
    }
  };

  const totalImpact = leaks.reduce((sum, leak) => sum + leak.estimated_impact_monthly, 0);

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Profit Leak Detector</h2>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Identify margin compression, inventory inefficiencies, and revenue leaks</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={detectProfitLeaks}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh Analysis</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=How%20can%20I%20fix%20my%20profit%20leaks%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">Leaks Detected</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">{leaks.length}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-amber-700 font-bold">High Priority</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
            {leaks.filter(l => l.priority === 'High').length}
          </p>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-purple-700 font-bold">Monthly Impact</span>
          <p className="text-base sm:text-lg font-extrabold text-purple-900 mt-1">
            ₹{(totalImpact / 100000).toFixed(2)}L
          </p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Recoverable</span>
          <p className="text-base sm:text-lg font-extrabold text-emerald-900 mt-1">
            ~{((totalImpact / (kpis.monthly_revenue || 1)) * 100).toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Leak Cards */}
      <div className="space-y-3">
        {leaks.map((leak) => {
          const config = getPriorityConfig(leak.priority);
          const ConfigIcon = config.icon;

          return (
            <div
              key={leak.id}
              className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
                    <ConfigIcon className={`w-4 h-4 text-${config.color}-600`} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-${config.color}-700 bg-${config.color}-100 px-2 py-0.5 rounded`}>
                      {leak.priority} Priority
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">{leak.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-lg sm:text-xl font-extrabold text-red-600">
                    -₹{(leak.estimated_impact_monthly / 1000).toFixed(0)}K
                  </span>
                  <p className="text-[10px] text-slate-500">Monthly Impact</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{leak.title}</h4>
                  <p className="text-xs text-slate-600 mt-1">{leak.problem}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start space-x-2">
                    <Target className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Evidence</p>
                      <p className="text-[11px] text-slate-600 mt-1">{leak.evidence}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-900">Recommended Action</p>
                      <p className="text-[11px] text-emerald-800 mt-1">{leak.recommended_action}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {leaks.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-12 text-center">
          <Target className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-emerald-900 mb-2">No Profit Leaks Detected</h3>
          <p className="text-emerald-700">Your business is operating efficiently based on current data.</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 font-semibold">About Profit Leak Detection</p>
          <p className="text-[11px] text-blue-800 mt-1">
            This page uses illustrative profit-leak examples. The core demo does not include a verified product-level sales and cost ledger, so treat these outputs as UI examples, not financial findings.
          </p>
        </div>
      </div>
    </div>
  );
};
