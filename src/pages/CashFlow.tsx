import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Info,
  Calendar,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { apiService } from '../services/api';
import type { FinancialMetrics } from '../types';

export const CashFlow: React.FC = () => {
  const navigate = useNavigate();
  const [financialData, setFinancialData] = useState<FinancialMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCashFlowData();
  }, []);

  const loadCashFlowData = async () => {
    setLoading(true);
    try {
      const data = await apiService.getFinancialMetrics();
      setFinancialData(data);
    } catch (err) {
      console.log('Using demo cash flow data');
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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const data = financialData || {
    receivables: 345000,
    payables: 210000,
    inventory_value: 1485200,
    working_capital: 1620200,
    cash_conversion_cycle_days: 45.5,
    dio_days: 85.2,
    dso_days: 5.6,
    dpo_days: 45.3,
    monthly_revenue: 1842000,
    cogs: 1254560,
    operating_expenses: 257880
  };

  const receivables = [
    { customer: 'Illustrative Customer A', amount: 145000, due_date: '2026-10-15', days_overdue: 0, status: 'On Track' },
    { customer: 'Illustrative Customer B', amount: 85000, due_date: '2026-10-20', days_overdue: 0, status: 'On Track' },
    { customer: 'Illustrative Customer C', amount: 65000, due_date: '2026-10-05', days_overdue: 5, status: 'Overdue' },
    { customer: 'Illustrative Customer D', amount: 50000, due_date: '2026-10-25', days_overdue: 0, status: 'On Track' },
  ];

  const payables = [
    { supplier: 'Illustrative Supplier A', amount: 84000, due_date: '2026-10-10', days_overdue: 0, status: 'On Track' },
    { supplier: 'Illustrative Supplier B', amount: 62000, due_date: '2026-10-12', days_overdue: 0, status: 'On Track' },
    { supplier: 'Illustrative Supplier C', amount: 45000, due_date: '2026-10-08', days_overdue: 2, status: 'Overdue' },
    { supplier: 'Illustrative Supplier D', amount: 19000, due_date: '2026-10-15', days_overdue: 0, status: 'On Track' },
  ];

  const totalOverdueReceivables = receivables.filter(r => r.days_overdue > 0).reduce((sum, r) => sum + r.amount, 0);
  const totalOverduePayables = payables.filter(p => p.days_overdue > 0).reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Cash Flow & Receivables</h2>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Data
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Cash position, receivables tracking, and payment insights</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadCashFlowData}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=My%20cash%20flow%20status%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Cash Flow KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Receivables</span>
          <p className="text-base sm:text-lg font-extrabold text-emerald-900 mt-1">₹{(data.receivables / 1000).toFixed(0)}K</p>
          <span className="text-[10px] text-emerald-600 mt-1 block">Pending Payments</span>
        </div>

        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">Payables</span>
          <p className="text-base sm:text-lg font-extrabold text-red-900 mt-1">₹{(data.payables / 1000).toFixed(0)}K</p>
          <span className="text-[10px] text-red-600 mt-1 block">Supplier Dues</span>
        </div>

        <div className="bg-purple-50 border border-purple-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-purple-700 font-bold">Working Capital</span>
          <p className="text-base sm:text-lg font-extrabold text-purple-900 mt-1">₹{(data.working_capital / 100000).toFixed(2)}L</p>
          <span className="text-[10px] text-purple-600 mt-1 block">Net Position</span>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-blue-700 font-bold">Cash Cycle</span>
          <p className="text-base sm:text-lg font-extrabold text-blue-900 mt-1">{data.cash_conversion_cycle_days.toFixed(1)}d</p>
          <span className="text-[10px] text-blue-600 mt-1 block">Days</span>
        </div>
      </div>

      {/* Receivables */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Customer Receivables</h3>
          <span className="text-xs text-slate-500">{receivables.length} pending</span>
        </div>

        <div className="space-y-2">
          {receivables.map((receivable) => (
            <div
              key={receivable.customer}
              className={`p-3 rounded-lg border ${
                receivable.days_overdue > 0 ? 'bg-red-50 border-red-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{receivable.customer}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <p className="text-[10px] text-slate-600">Due: {receivable.due_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹{receivable.amount.toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] font-semibold ${
                    receivable.days_overdue > 0 ? 'text-red-600' : 'text-emerald-600'
                  }`}>
                    {receivable.status}
                    {receivable.days_overdue > 0 && ` (${receivable.days_overdue}d overdue)`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalOverdueReceivables > 0 && (
          <div className="p-3 bg-red-100 rounded-lg border border-red-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <p className="text-xs font-semibold text-red-900">Overdue Amount</p>
              </div>
              <p className="text-sm font-bold text-red-900">₹{totalOverdueReceivables.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Payables */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Supplier Payables</h3>
          <span className="text-xs text-slate-500">{payables.length} pending</span>
        </div>

        <div className="space-y-2">
          {payables.map((payable) => (
            <div
              key={payable.supplier}
              className={`p-3 rounded-lg border ${
                payable.days_overdue > 0 ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-900">{payable.supplier}</p>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="w-3 h-3 text-slate-500" />
                    <p className="text-[10px] text-slate-600">Due: {payable.due_date}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹{payable.amount.toLocaleString('en-IN')}</p>
                  <span className={`text-[10px] font-semibold ${
                    payable.days_overdue > 0 ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {payable.status}
                    {payable.days_overdue > 0 && ` (${payable.days_overdue}d overdue)`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {totalOverduePayables > 0 && (
          <div className="p-3 bg-amber-100 rounded-lg border border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <p className="text-xs font-semibold text-amber-900">Overdue Amount</p>
              </div>
              <p className="text-sm font-bold text-amber-900">₹{totalOverduePayables.toLocaleString('en-IN')}</p>
            </div>
          </div>
        )}
      </div>

      {/* Cash Conversion Cycle Breakdown */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <h3 className="font-bold text-slate-900 text-sm">Cash Conversion Cycle Breakdown</h3>
        
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium block">DIO</span>
            <p className="text-base font-bold text-slate-900">{data.dio_days.toFixed(1)}d</p>
            <span className="text-[10px] text-slate-500 block">Days Inventory Outstanding</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium block">DSO</span>
            <p className="text-base font-bold text-slate-900">{data.dso_days.toFixed(1)}d</p>
            <span className="text-[10px] text-slate-500 block">Days Sales Outstanding</span>
          </div>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[10px] text-slate-500 font-medium block">DPO</span>
            <p className="text-base font-bold text-slate-900">{data.dpo_days.toFixed(1)}d</p>
            <span className="text-[10px] text-slate-500 block">Days Payables Outstanding</span>
          </div>
        </div>

        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-blue-900">Net Cash Conversion Cycle</span>
            <span className="text-lg font-bold text-blue-900">{data.cash_conversion_cycle_days.toFixed(1)} days</span>
          </div>
          <p className="text-[11px] text-blue-800 mt-1">
            Time between paying suppliers and receiving cash from customers
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 font-semibold">Demo Cash Flow Data</p>
          <p className="text-[11px] text-blue-800 mt-1">
            Cash-flow figures on this page are illustrative fallback values, not a verified Sharma General Store ledger. Bank/accounting integrations are not connected in this repository snapshot.
          </p>
        </div>
      </div>
    </div>
  );
};
