import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Info,
  FileText,
  IndianRupee
} from 'lucide-react';
import { apiService } from '../services/api';
import type { ReconciliationResult, ReconciliationMatch } from '../types';

export const Reconciliation: React.FC = () => {
  const navigate = useNavigate();
  const [reconciliationData, setReconciliationData] = useState<ReconciliationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadReconciliationData();
  }, []);

  const loadReconciliationData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await apiService.getReconciliation();
      setReconciliationData(data);
    } catch (err) {
      setError('Failed to load reconciliation data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'MATCHED':
        return { color: 'emerald', icon: CheckCircle2, label: 'Matched' };
      case 'REVIEW_REQUIRED':
        return { color: 'amber', icon: AlertTriangle, label: 'Review Required' };
      case 'MISMATCH':
        return { color: 'red', icon: XCircle, label: 'Mismatch' };
      case 'MISSING':
        return { color: 'slate', icon: Clock, label: 'Missing' };
      default:
        return { color: 'slate', icon: FileText, label: status };
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
          <div className="h-64 bg-slate-200 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !reconciliationData) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Reconciliation Data</h3>
          <p className="text-red-700 mb-4">{error || 'No data available'}</p>
          <button
            onClick={loadReconciliationData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { matches, summary } = reconciliationData;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">3-Way Reconciliation Engine</h2>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Reconciliation
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Bank statements, invoices, POs, PI, and GST register matching</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadReconciliationData}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=Meri%20reconciliation%20me%20kya%20issues%20hai%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-xs text-slate-500 font-medium">Total Records</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">{summary.total_records_processed}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Matched</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{summary.matched_records}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-amber-700 font-bold">Review Required</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{summary.review_required_records}</p>
        </div>

        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">Discrepancy</span>
          <p className="text-base sm:text-lg font-extrabold text-red-900 mt-1">₹ {summary.total_discrepancy_amount.toLocaleString('en-IN')}</p>
        </div>

        <div className={`p-3.5 sm:p-4 rounded-xl shadow-xs ${
          summary.overall_reconciliation_health_pct >= 80 ? 'bg-emerald-50 border-emerald-200' :
          summary.overall_reconciliation_health_pct >= 60 ? 'bg-amber-50 border-amber-200' :
          'bg-red-50 border-red-200'
        }`}>
          <span className={`text-xs font-bold ${
            summary.overall_reconciliation_health_pct >= 80 ? 'text-emerald-700' :
            summary.overall_reconciliation_health_pct >= 60 ? 'text-amber-700' :
            'text-red-700'
          }`}>
            Health Score
          </span>
          <p className={`text-2xl sm:text-3xl font-extrabold mt-1 ${
            summary.overall_reconciliation_health_pct >= 80 ? 'text-emerald-900' :
            summary.overall_reconciliation_health_pct >= 60 ? 'text-amber-900' :
            'text-red-900'
          }`}>
            {summary.overall_reconciliation_health_pct}%
          </p>
        </div>
      </div>

      {/* Reconciliation Matches */}
      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 text-sm">Reconciliation Matches</h3>
          <span className="text-xs text-slate-500">{matches.length} records processed</span>
        </div>

        <div className="space-y-3">
          {matches.map((match) => {
            const statusConfig = getStatusConfig(match.status);
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={match.id}
                className={`p-4 rounded-xl border ${
                  match.status === 'MATCHED' ? 'bg-emerald-50 border-emerald-200' :
                  match.status === 'REVIEW_REQUIRED' ? 'bg-amber-50 border-amber-200' :
                  match.status === 'MISMATCH' ? 'bg-red-50 border-red-200' :
                  'bg-slate-50 border-slate-200'
                }`}
              >
                {/* Match Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 bg-${statusConfig.color}-100 rounded-lg`}>
                      <StatusIcon className={`w-4 h-4 text-${statusConfig.color}-600`} />
                    </div>
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-${statusConfig.color}-700 bg-${statusConfig.color}-100 px-2 py-0.5 rounded`}>
                        {statusConfig.label}
                      </span>
                      <p className="text-xs text-slate-500 mt-1">{match.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-lg sm:text-xl font-extrabold ${
                      match.discrepancy === 0 ? 'text-emerald-600' :
                      'text-red-600'
                    }`}>
                      {match.discrepancy === 0 ? '₹ 0' : `₹ ${match.discrepancy.toLocaleString('en-IN')}`}
                    </span>
                    <p className="text-[10px] text-slate-500">Discrepancy</p>
                  </div>
                </div>

                {/* Match Details */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Source Document</p>
                    <p className="text-xs text-slate-900 font-medium">{match.source_doc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Target Document</p>
                    <p className="text-xs text-slate-900 font-medium">{match.target_doc}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Counterparty</p>
                    <p className="text-xs text-slate-900 font-medium">{match.counterparty}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Expected</p>
                      <p className="text-xs text-slate-900 font-medium">₹ {match.expected_amount.toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">Actual</p>
                      <p className="text-xs text-slate-900 font-medium">₹ {match.actual_amount.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                </div>

                {/* Evidence */}
                <div className={`p-3 rounded-lg border ${
                  match.status === 'MATCHED' ? 'bg-emerald-100 border-emerald-200' :
                  match.status === 'REVIEW_REQUIRED' ? 'bg-amber-100 border-amber-200' :
                  'bg-slate-100 border-slate-200'
                }`}>
                  <div className="flex items-start space-x-2">
                    <Info className={`w-4 h-4 ${
                      match.status === 'MATCHED' ? 'text-emerald-600' :
                      match.status === 'REVIEW_REQUIRED' ? 'text-amber-600' :
                      'text-slate-600'
                    } mt-0.5 shrink-0`} />
                    <div>
                      <p className={`text-xs font-semibold ${
                        match.status === 'MATCHED' ? 'text-emerald-900' :
                        match.status === 'REVIEW_REQUIRED' ? 'text-amber-900' :
                        'text-slate-900'
                      }`}>
                        Evidence
                      </p>
                      <p className={`text-[11px] ${
                        match.status === 'MATCHED' ? 'text-emerald-800' :
                        match.status === 'REVIEW_REQUIRED' ? 'text-amber-800' :
                        'text-slate-700'
                      } mt-1`}>
                        {match.evidence}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Confidence Score */}
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-slate-500">Match Confidence</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          match.confidence >= 0.9 ? 'bg-emerald-500' :
                          match.confidence >= 0.7 ? 'bg-amber-500' :
                          'bg-red-500'
                        }`}
                        style={{ width: `${match.confidence * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-slate-700">{(match.confidence * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 font-semibold">About Reconciliation</p>
          <p className="text-[11px] text-blue-800 mt-1">
            No verified bank/invoice/GST reconciliation ledgers are included in this repository snapshot, so the core demo does not assert any successful matches. Connect source ledgers and approved matching rules before using this workflow.
          </p>
        </div>
      </div>
    </div>
  );
};
