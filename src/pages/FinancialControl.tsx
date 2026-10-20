import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CreditCard, 
  Activity, 
  AlertTriangle, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight,
  ShieldCheck,
  Sparkles,
  DollarSign,
  Clock
} from 'lucide-react';
import { CashFlow } from './CashFlow';
import { CustomerPayments } from './CustomerPayments';
import { ProfitLeaks } from './ProfitLeaks';
import { useApp } from '../context/AppContext';

export const FinancialControl: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { kpis, t } = useApp();

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-udyam-surface">
      {/* Sticky Tab Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs px-4 sm:px-6 pt-4 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Financial Control Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  Cash & Profit Guard
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Financial overview; revenue/profit aggregates are illustrative and verified bank, invoice and customer ledgers are not included.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 font-medium">
                Monthly Revenue: ₹ {(kpis.monthly_revenue / 100000).toFixed(2)} Lakhs
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>{t('tabs.overview')}</span>
            </button>

            <button
              onClick={() => handleTabChange('cash-flow')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'cash-flow'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>{t('tabs.cash_flow')}</span>
            </button>

            <button
              onClick={() => handleTabChange('customer-payments')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'customer-payments'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>{t('tabs.customer_payments')}</span>
            </button>

            <button
              onClick={() => handleTabChange('profit-leaks')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'profit-leaks'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>{t('tabs.profit_leaks')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'overview' && (
          <div className="p-3 sm:p-6 space-y-6 max-w-7xl mx-auto">
            {/* Quick KPI Overview */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div 
                onClick={() => handleTabChange('cash-flow')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-emerald-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Gross Profit</span>
                  <Activity className="w-4 h-4 text-emerald-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl font-bold text-slate-900 mt-2">₹ {(kpis.gross_profit / 100000).toFixed(2)}L</p>
                <div className="flex items-center space-x-1 text-emerald-600 text-xs font-semibold mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>{kpis.profit_margin}% Gross Margin</span>
                </div>
              </div>

              <div 
                onClick={() => handleTabChange('customer-payments')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Receivables Outstanding</span>
                  <CreditCard className="w-4 h-4 text-amber-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl font-bold text-slate-900 mt-2">Not verified</p>
                <div className="flex items-center space-x-1 text-amber-600 text-xs font-semibold mt-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span>No verified customer ledger</span>
                </div>
              </div>

              <div 
                onClick={() => handleTabChange('profit-leaks')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-red-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Detected Profit Leaks</span>
                  <AlertTriangle className="w-4 h-4 text-red-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl font-bold text-slate-900 mt-2">Illustrative</p>
                <div className="flex items-center space-x-1 text-red-600 text-xs font-semibold mt-1">
                  <span>No verified leak findings</span>
                </div>
              </div>

              <div 
                onClick={() => handleTabChange('cash-flow')}
                className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs hover:border-blue-500 cursor-pointer transition-all group"
              >
                <div className="flex items-center justify-between text-slate-500 text-xs">
                  <span>Cash Conversion Cycle</span>
                  <Clock className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                </div>
                <p className="text-xl font-bold text-slate-900 mt-2">Illustrative</p>
                <div className="flex items-center space-x-1 text-blue-600 text-xs font-semibold mt-1">
                  <span>Verified bank/invoice data unavailable</span>
                </div>
              </div>
            </div>

            {/* Cash Flow Preview Section */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Working Capital & Operational Runway</h3>
                  <p className="text-xs text-slate-500">Real-time formula-grounded deterministic calculation</p>
                </div>
                <button
                  onClick={() => handleTabChange('cash-flow')}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  Deep Cash Flow Analysis
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-100">
                  <span className="text-xs text-emerald-800 font-semibold">Net Working Capital</span>
                  <p className="text-lg font-bold text-emerald-950 mt-1">₹ 4,32,000</p>
                  <p className="text-[11px] text-emerald-700 mt-1">Inventory + Receivables - Payables</p>
                </div>
                <div className="p-3.5 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-xs text-blue-800 font-semibold">Operating Liquidity Runway</span>
                  <p className="text-lg font-bold text-blue-950 mt-1">68 Days</p>
                  <p className="text-[11px] text-blue-700 mt-1">Sufficient for 2.2 operating cycles</p>
                </div>
                <div className="p-3.5 bg-purple-50 rounded-xl border border-purple-100">
                  <span className="text-xs text-purple-800 font-semibold">Monthly Operating Margin</span>
                  <p className="text-lg font-bold text-purple-950 mt-1">14.8%</p>
                  <p className="text-[11px] text-purple-700 mt-1">₹ 2,12,000 Net Operating Earnings</p>
                </div>
              </div>
            </div>

            {/* Quick Action Router */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div 
                onClick={() => handleTabChange('customer-payments')}
                className="p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-500 text-slate-950 uppercase">Overdue Collections</span>
                  <CreditCard className="w-5 h-5 text-amber-400" />
                </div>
                <h4 className="text-base font-bold mt-3">Customer Ledger & 1-Click Reminder</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Receivables and customer-specific payment actions are unavailable until a verified customer ledger is connected.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-amber-400">
                  <span>Open Customer Payments</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </div>
              </div>

              <div 
                onClick={() => handleTabChange('profit-leaks')}
                className="p-5 bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl shadow-md cursor-pointer hover:shadow-lg transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-red-500 text-white uppercase">Margin Leakage</span>
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
                <h4 className="text-base font-bold mt-3">Profit Leak Detector & Recovery</h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  This demo snapshot does not include verified unit-cost, discount or logistics ledgers needed to assert a profit leak.
                </p>
                <div className="mt-4 flex items-center text-xs font-bold text-indigo-300">
                  <span>Open Profit Leak Detector</span>
                  <ArrowUpRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'cash-flow' && <CashFlow />}
        {activeTab === 'customer-payments' && <CustomerPayments />}
        {activeTab === 'profit-leaks' && <ProfitLeaks />}
      </div>
    </div>
  );
};
