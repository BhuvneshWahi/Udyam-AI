import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  Info,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Compliance: React.FC = () => {
  const { compliance } = useApp();
  const [taxQuery, setTaxQuery] = useState('');
  const navigate = useNavigate();

  const handleTaxQuerySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (taxQuery.trim()) {
      navigate(`/copilot?q=${encodeURIComponent(taxQuery)}`);
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Prototype Compliance Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/30 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-amber-900 text-xs">
        <div className="flex items-start sm:items-center space-x-2">
          <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            <strong>Demo Compliance Workspace:</strong> Live GSTN sandbox registers for demo purposes; does not directly file returns with GST portal.
          </span>
        </div>
        <span className="bg-amber-200 text-amber-900 font-extrabold text-[10px] px-2 py-0.5 rounded shrink-0">
          PROTOTYPE DEMO
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">MSME Compliance Assistant & GST Ledger</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">
              GSTIN: {compliance.gstin}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Automated return deadline tracking, e-Way reconciliation, and Input Tax Credit (ITC) reconciliation</p>
        </div>

        <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold w-fit">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>GST Status: Fully Compliant</span>
        </div>
      </div>

      {/* Upcoming Filings Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {compliance.filings.map((f, i) => (
          <div
            key={i}
            className={`p-4 sm:p-5 rounded-2xl border shadow-xs space-y-3 flex flex-col justify-between transition-all ${
              f.status === 'Pending' ? 'bg-amber-50/70 border-amber-200' :
              f.status === 'Completed' ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="font-extrabold text-slate-900 text-base">{f.form}</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                  f.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                  f.status === 'Pending' ? 'bg-amber-200 text-amber-900' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {f.status}
                </span>
              </div>
              <p className="text-xs text-slate-600 font-medium">Period: {f.period}</p>
              <div className="flex items-center space-x-1 text-xs font-bold text-slate-900 mt-2">
                <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>Due: {f.due_date}</span>
                {f.days_left && (
                  <span className="text-amber-800 font-extrabold text-[11px] ml-1">({f.days_left} Days Left)</span>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <span className="text-slate-500">Est Tax Payable:</span>
              <strong className="text-slate-900">₹ {f.tax_amount.toLocaleString('en-IN')}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Reconciliation & Alerts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* E-Way & ITC Reconciliation Card */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Input Tax Credit (ITC) & E-Way Bill Reconciliation</h3>
          
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 text-xs">
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Matched Bills</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-600">{compliance.eway_reconciliation.matched_pct}%</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Unmatched Bills</span>
              <span className="text-base sm:text-lg font-extrabold text-amber-600">{compliance.eway_reconciliation.unmatched_bills}</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Eligible ITC</span>
              <span className="text-base sm:text-lg font-extrabold text-slate-900">₹ {(compliance.eway_reconciliation.itc_eligible/1000).toFixed(1)}K</span>
            </div>
            <div className="p-2.5 sm:p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 block text-[10px] font-bold uppercase">Claimed ITC</span>
              <span className="text-base sm:text-lg font-extrabold text-blue-600">₹ {(compliance.eway_reconciliation.itc_claimed/1000).toFixed(1)}K</span>
            </div>
          </div>

          {/* Compliance Alerts list */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-bold text-slate-800">Compliance Audit Alerts:</span>
            {compliance.alerts.map((alert, idx) => (
              <div key={idx} className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-medium flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{alert}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI Tax Compliance Quick Assistant */}
        <div className="bg-gradient-to-br from-slate-900 to-indigo-950 text-white rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Ask AI Compliance Assistant</h3>
            </div>
            <p className="text-xs text-slate-300">
              Get instant Hinglish answers regarding GSTR deadlines, tax liability calculations, and ITC rules.
            </p>

            <form onSubmit={handleTaxQuerySubmit} className="space-y-2">
              <input
                type="text"
                value={taxQuery}
                onChange={(e) => setTaxQuery(e.target.value)}
                placeholder="e.g. Meri next GST filing kab hai?"
                className="w-full px-3 py-2 text-xs bg-white/10 border border-white/20 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-400"
              />
              <button
                type="submit"
                className="w-full py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center space-x-1 transition-all"
              >
                <span>Ask GST Query</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>

          <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400">
            Prompt: <strong>"How to claim remaining ₹4,700 ITC credit?"</strong>
          </div>
        </div>
      </div>
    </div>
  );
};
