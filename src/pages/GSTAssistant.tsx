import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  FileText, 
  Bot, 
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export const GSTAssistant: React.FC = () => {
  const { compliance, profile, showToast, t } = useApp();
  const navigate = useNavigate();

  const [checklist, setChecklist] = useState({
    gstr1_b2b_invoices: true,
    gstr1_hsn_summary: true,
    gstr1_credit_notes: true,
    gstr3b_itc_eligible: true,
    gstr3b_reverse_charge: false,
    gstr3b_tax_computed: true,
    itc_2b_reconciled: false,
    eway_bills_closed: true
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => {
      const next = { ...prev, [key]: !prev[key] };
      showToast(`Updated checklist item.`);
      return next;
    });
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalChecklist = Object.keys(checklist).length;
  const readinessPct = Math.round((completedCount / totalChecklist) * 100);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-amber-700">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>PENDING GSP/ASP INTEGRATION:</strong> GST filing checklist and verification are calculated locally. Direct filing to GSTN portal requires authorized GSP/ASP API gateway.</span>
        </div>
        <span className="font-bold text-[10px] bg-amber-200/50 px-2 py-0.5 rounded uppercase">PENDING INTEGRATION</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.gst_assistant')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            GSTIN: <span className="font-mono font-bold text-slate-700">{compliance.gstin}</span> • {profile.business_type} • State: {profile.state}
          </p>
        </div>

        <button
          onClick={() => navigate('/copilot?q=What%20is%20my%20GST%20compliance%20status%20and%20ITC%20reconciliation%20readiness%3F')}
          className="inline-flex items-center space-x-2 px-3 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          <Bot className="w-4 h-4 text-emerald-400" />
          <span>Ask Copilot GST Questions</span>
        </button>
      </div>

      {/* Filing Schedule & Readiness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overall Filing Readiness</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">{readinessPct}%</div>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount} of {totalChecklist} statutory items prepared</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">GSTR-1 (Outward Supplies)</span>
            <Calendar className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-blue-700">11th Oct 2026</div>
          <p className="text-[11px] text-slate-500 mt-1">Period: September 2026 • Monthly filer</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">GSTR-3B (Summary & Tax)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700">20th Oct 2026</div>
          <p className="text-[11px] text-slate-500 mt-1">Estimated Tax: ₹ {(142000).toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* Detailed Checklists */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* GSTR-1 Checklist */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">GSTR-1 Return Preparation</h2>
              <p className="text-[11px] text-slate-500">Summary of outward taxable supplies to registered & unregistered buyers.</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded">
              DUE IN 16 DAYS
            </span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'gstr1_b2b_invoices' as const, label: 'All B2B tax invoices with customer GSTIN uploaded', note: '142 tax invoices issued this month' },
              { id: 'gstr1_hsn_summary' as const, label: 'HSN 6-digit code summary verified with correct tax slabs', note: 'Chapters 85, 74, 39 mapped' },
              { id: 'gstr1_credit_notes' as const, label: 'Credit/Debit notes issued during tax period reconciled', note: '2 credit notes valued at ₹ 14,200' },
              { id: 'eway_bills_closed' as const, label: 'E-Way bill numbers tagged to corresponding tax invoices', note: '100% matched with Part-B vehicle logs' }
            ].map((item) => (
              <div 
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox" 
                  checked={checklist[item.id]} 
                  onChange={() => {}} 
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <p className={`font-semibold ${checklist[item.id] ? 'text-slate-900' : 'text-slate-600'}`}>{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GSTR-3B & ITC Reconciliation */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-slate-900">GSTR-3B Tax Computation & ITC</h2>
              <p className="text-[11px] text-slate-500">Net tax payable computation against eligible Input Tax Credit (GSTR-2B).</p>
            </div>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 rounded">
              DUE IN 25 DAYS
            </span>
          </div>

          <div className="space-y-3">
            {[
              { id: 'gstr3b_itc_eligible' as const, label: 'Eligible ITC claimed matches auto-drafted GSTR-2B', note: '₹ 1,84,500 eligible credit identified' },
              { id: 'itc_2b_reconciled' as const, label: 'Vendor missing invoices flagged in reconciliation engine', note: '3 vendor invoices missing from 2B (₹ 24,000 credit at risk)' },
              { id: 'gstr3b_reverse_charge' as const, label: 'Reverse Charge Mechanism (RCM) liabilities declared', note: 'Freight / Legal payments reviewed' },
              { id: 'gstr3b_tax_computed' as const, label: 'Cash ledger balance sufficient for net cash tax outflow', note: 'Balance checked vs ₹ 1,42,000 net payable' }
            ].map((item) => (
              <div 
                key={item.id}
                onClick={() => toggleCheck(item.id)}
                className="flex items-start space-x-3 p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
              >
                <input 
                  type="checkbox" 
                  checked={checklist[item.id]} 
                  onChange={() => {}} 
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="text-xs">
                  <p className={`font-semibold ${checklist[item.id] ? 'text-slate-900' : 'text-slate-600'}`}>{item.label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
