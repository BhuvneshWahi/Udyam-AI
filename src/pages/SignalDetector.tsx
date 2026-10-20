import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Activity, 
  Sparkles, 
  RefreshCw,
  Info,
  Zap,
  Package,
  DollarSign,
  FileText,
  Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { BusinessSignal } from '../types';

export const SignalDetector: React.FC = () => {
  const navigate = useNavigate();
  const { products, kpis, compliance } = useApp();
  const [signals, setSignals] = useState<BusinessSignal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    detectSignals();
  }, [products, kpis, compliance]);

  const detectSignals = () => {
    setLoading(true);
    const detectedSignals: BusinessSignal[] = [];

    // Safe array access
    const productList = products || [];
    const filingList = compliance?.filings || [];

    // Demand rising signals
    const risingDemand = productList.filter(p => p.sales_growth_30d > 20);
    if (risingDemand.length > 0) {
      detectedSignals.push({
        id: 'SIG-DEMAND-001',
        type: 'OPPORTUNITY',
        title: 'DEMAND_RISING',
        evidence: `${risingDemand.length} products showing >20% sales growth`,
        impact: 'Revenue increase opportunity',
        priority: 'High',
        signal: 'DEMAND_RISING',
        severity: 'High',
        source: 'Sales',
        affected_area: 'Products',
        explanation: `${risingDemand.length} products showing >20% sales growth in last 30 days`,
        recommended_action: 'Review inventory levels and consider increasing stock for high-demand products',
        affected_items: risingDemand.map(p => p.name)
      });
    }

    // Demand falling signals
    const fallingDemand = productList.filter(p => p.sales_growth_30d < -10);
    if (fallingDemand.length > 0) {
      detectedSignals.push({
        id: 'SIG-DEMAND-002',
        type: 'RISK',
        title: 'DEMAND_FALLING',
        evidence: `${fallingDemand.length} products showing >10% sales decline`,
        impact: 'Revenue at risk',
        priority: 'Medium',
        signal: 'DEMAND_FALLING',
        severity: 'Medium',
        source: 'Sales',
        affected_area: 'Products',
        explanation: `${fallingDemand.length} products showing >10% sales decline in last 30 days`,
        recommended_action: 'Investigate market conditions and consider promotional activities or product review',
        affected_items: fallingDemand.map(p => p.name)
      });
    }

    // Stockout risk signals
    const stockoutRisk = productList.filter(p => p.status === 'Critical');
    if (stockoutRisk.length > 0) {
      detectedSignals.push({
        id: 'SIG-STOCK-001',
        type: 'RISK',
        title: 'STOCKOUT_RISK',
        evidence: `${stockoutRisk.length} products at critical stock`,
        impact: 'Revenue loss risk',
        priority: 'High',
        signal: 'STOCKOUT_RISK',
        severity: 'High',
        source: 'Inventory',
        affected_area: 'Inventory',
        explanation: `${stockoutRisk.length} products at critical stock levels (<4 days supply)`,
        recommended_action: 'Immediate reorder required to prevent stockout and revenue loss',
        affected_items: stockoutRisk.map(p => p.name)
      });
    }

    // Excess inventory signals
    const excessInventory = productList.filter(p => p.status === 'Overstocked');
    if (excessInventory.length > 0) {
      detectedSignals.push({
        id: 'SIG-INV-001',
        type: 'RISK',
        title: 'EXCESS_INVENTORY',
        evidence: `${excessInventory.length} products overstocked`,
        impact: 'Working capital locked',
        priority: 'Medium',
        signal: 'EXCESS_INVENTORY',
        severity: 'Medium',
        source: 'Inventory',
        affected_area: 'Working Capital',
        explanation: `${excessInventory.length} products overstocked (>100 days supply)`,
        recommended_action: 'Run clearance promotions or bundle with high-margin products to free working capital',
        affected_items: excessInventory.map(p => p.name)
      });
    }

    // Compliance deadline signals
    const pendingFilings = filingList.filter(f => f.status === 'Pending');
    if (pendingFilings.length > 0) {
      detectedSignals.push({
        id: 'SIG-COMP-001',
        type: 'ALERT',
        title: 'COMPLIANCE_DEADLINE',

        evidence: `${pendingFilings.length} filings pending`,
        impact: 'Penalty risk',
        priority: 'High',
        signal: 'COMPLIANCE_DEADLINE',
        severity: 'High',
        source: 'Compliance',
        affected_area: 'Regulatory',
        explanation: `${pendingFilings.length} compliance filings pending`,
        recommended_action: 'Complete pending GST and regulatory filings to avoid penalties',
        affected_items: pendingFilings.map(f => 'Compliance Filing')
      });
    }

    // Payment-delay and reconciliation signals are intentionally omitted here:
    // the verified demo package does not include customer/invoice/bank/GST ledgers.

    // The canonical festival and market signals are displayed on their dedicated
    // pages; do not fabricate a business-specific lift from a generic calendar.

    setSignals(detectedSignals);
    setLoading(false);
  };

  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'High': return { color: 'red', icon: AlertTriangle };
      case 'Medium': return { color: 'amber', icon: Activity };
      case 'Low': return { color: 'blue', icon: Info };
      default: return { color: 'slate', icon: Activity };
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'DEMAND_RISING': return TrendingUp;
      case 'DEMAND_FALLING': return TrendingDown;
      case 'STOCKOUT_RISK': return Package;
      case 'MARGIN_PRESSURE': return DollarSign;
      case 'EXCESS_INVENTORY': return Package;
      case 'COMPLIANCE_DEADLINE': return FileText;
            default: return Zap;
    }
  };

  const highSeverityCount = signals.filter(s => s.severity === 'High').length;
  const mediumSeverityCount = signals.filter(s => s.severity === 'Medium').length;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Business Signal Detector</h2>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Analysis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Aggregate signals from finance, inventory, sales, and compliance</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={detectSignals}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=What%20signals%20should%20I%20pay%20attention%20to%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-purple-50 border border-purple-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-purple-700 font-bold">Total Signals</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-1">{signals.length}</p>
        </div>

        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">High Severity</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">{highSeverityCount}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-amber-700 font-bold">Medium Severity</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{mediumSeverityCount}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-blue-700 font-bold">Sources</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">
            {new Set(signals.map(s => s.source)).size}
          </p>
        </div>
      </div>

      {/* Signal Cards */}
      <div className="space-y-3">
        {signals.map((signal) => {
          const severityConfig = getSeverityConfig(signal.severity || signal.priority);
          const SeverityIcon = severityConfig.icon;
          const SignalIcon = getSignalIcon(signal.signal || signal.title);

          return (
            <div
              key={signal.id}
              className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 bg-${severityConfig.color}-100 rounded-lg`}>
                    <SeverityIcon className={`w-4 h-4 text-${severityConfig.color}-600`} />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <SignalIcon className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-bold text-slate-900">{signal.signal}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 mt-1">{signal.source}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold uppercase tracking-wider text-${severityConfig.color}-700 bg-${severityConfig.color}-100 px-2 py-0.5 rounded`}>
                  {signal.severity || signal.priority} Severity
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <p className="text-xs text-slate-600">{signal.explanation || signal.evidence}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Recommended Action</p>
                      <p className="text-[11px] text-slate-600 mt-1">{signal.recommended_action || signal.impact}</p>
                    </div>
                  </div>
                </div>

                {signal.affected_items && signal.affected_items.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Affected: {signal.affected_area || 'Multiple Areas'}
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {signal.affected_items.slice(0, 3).map((item, idx) => (
                        <span
                          key={idx}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {item}
                        </span>
                      ))}
                      {signal.affected_items.length > 3 && (
                        <span className="text-[10px] text-slate-500">
                          +{signal.affected_items.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {signals.length === 0 && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-12 text-center">
          <Activity className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-emerald-900 mb-2">No Signals Detected</h3>
          <p className="text-emerald-700">Your business is operating smoothly based on current data.</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 font-semibold">Demo Signal Detection</p>
          <p className="text-[11px] text-blue-800 mt-1">
            This page includes illustrative signal examples. The verified core demo uses seeded grocery market signals; live ERP/POS/accounting integrations are not connected.
          </p>
        </div>
      </div>
    </div>
  );
};
