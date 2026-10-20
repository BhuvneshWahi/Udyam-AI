import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  IndianRupee, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Info
} from 'lucide-react';
import { apiService } from '../services/api';
import type { FinancialMetrics } from '../types';

export const FinancialHealth: React.FC = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFinancialData();
  }, []);

  const loadFinancialData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getFinancialMetrics();
      setFinancialData(data);
    } catch (err) {
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !financialData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Financial Data</h3>
          <p className="text-red-700 mb-4">{error || 'No data available'}</p>
          <button
            onClick={loadFinancialData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const getHealthStatus = (netMargin: number) => {
    if (netMargin >= 20) return { status: 'Excellent', color: 'emerald', icon: CheckCircle2 };
    if (netMargin >= 15) return { status: 'Good', color: 'blue', icon: Activity };
    if (netMargin >= 10) return { status: 'Fair', color: 'amber', icon: Info };
    return { status: 'Attention', color: 'red', icon: AlertTriangle };
  };

  const health = getHealthStatus(financialData.net_margin_pct);
  const HealthIcon = health.icon;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Business & Financial Health</h2>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Real-time financial metrics, cash flow analysis, and business health indicators</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadFinancialData}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=Meri%20business%20ki%20financial%20health%20kaisi%20hai%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Health Score Card */}
      <div className={`bg-${health.color}-50 border border-${health.color}-200 p-4 sm:p-5 rounded-2xl shadow-xs`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className={`p-3 bg-${health.color}-100 rounded-xl`}>
              <HealthIcon className={`w-6 h-6 text-${health.color}-600`} />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Overall Financial Health</h3>
              <p className={`text-xs text-${health.color}-700 font-semibold`}>
                Net Margin: {financialData.net_margin_pct.toFixed(1)}%
              </p>
            </div>
          </div>
          <div className={`text-right`}>
            <span className={`text-2xl sm:text-3xl font-extrabold text-${health.color}-900`}>
              {health.status}
            </span>
            <p className={`text-[10px] sm:text-[11px] text-${health.color}-700 font-semibold mt-1`}>
              Based on current metrics
            </p>
          </div>
        </div>
      </div>

      {/* Revenue & Profit KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Monthly Revenue</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(financialData.monthly_revenue / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Gross Sales</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">COGS</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(financialData.cogs / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Cost of Goods</span>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Gross Profit</span>
          <p className="text-base sm:text-lg font-extrabold text-emerald-900 mt-1">₹ {(financialData.gross_profit / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-emerald-700 font-semibold mt-1 block">
            {financialData.gross_margin_pct.toFixed(1)}% Margin
          </span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Operating Expenses</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(financialData.operating_expenses / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">OpEx</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-blue-700 font-bold">Net Profit</span>
          <p className="text-base sm:text-lg font-extrabold text-blue-900 mt-1">₹ {(financialData.net_profit / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-blue-700 font-semibold mt-1 block">
            {financialData.net_margin_pct.toFixed(1)}% Margin
          </span>
        </div>
      </div>

      {/* Cash Flow & Working Capital */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Inventory Value</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(financialData.inventory_value / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Asset Base</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Receivables</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(financialData.receivables / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Pending Payments</span>
        </div>

        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Payables</span>
          <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(financialData.payables / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">Supplier Dues</span>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-3.5 sm:p-4 rounded-xl shadow-xs col-span-2 sm:col-span-2">
          <span className="text-xs text-purple-700 font-bold">Working Capital</span>
          <p className="text-base sm:text-lg font-extrabold text-purple-900 mt-1">₹ {(financialData.working_capital / 100000).toFixed(2)}L</p>
          <span className="text-[10px] sm:text-[11px] text-purple-700 font-semibold mt-1 block">
            (Inventory + Receivables) - Payables
          </span>
        </div>
      </div>

      {/* Cash Conversion Cycle */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Cash Conversion Cycle</h3>
            <p className="text-xs text-slate-500">Time between paying suppliers and receiving cash from customers</p>
          </div>
          <div className="text-right">
            <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {financialData.cash_conversion_cycle_days.toFixed(1)}
            </span>
            <p className="text-[10px] sm:text-[11px] text-slate-500 font-semibold mt-1">Days</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block">DIO</span>
            <p className="text-base sm:text-lg font-bold text-slate-900">{financialData.dio_days.toFixed(1)}d</p>
            <span className="text-[10px] text-slate-500 block">Days Inventory Outstanding</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block">DSO</span>
            <p className="text-base sm:text-lg font-bold text-slate-900">{financialData.dso_days.toFixed(1)}d</p>
            <span className="text-[10px] text-slate-500 block">Days Sales Outstanding</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <span className="text-[10px] sm:text-[11px] text-slate-500 font-medium block">DPO</span>
            <p className="text-base sm:text-lg font-bold text-slate-900">{financialData.dpo_days.toFixed(1)}d</p>
            <span className="text-[10px] text-slate-500 block">Days Payables Outstanding</span>
          </div>
        </div>
      </div>

      {/* Evidence Formulas */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600" />
          <h3 className="font-bold text-slate-900 text-sm">Calculation Evidence</h3>
        </div>
        <div className="space-y-2">
          {financialData.evidence_formula.map((formula, idx) => (
            <div key={idx} className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              <p className="text-xs text-slate-700 font-mono">{formula}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
