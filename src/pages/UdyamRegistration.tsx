import React, { useState } from 'react';
import { 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ExternalLink, 
  FileText, 
  ShieldCheck, 
  Info,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const UdyamRegistration: React.FC = () => {
  const { profile, showToast, t } = useApp();

  const [checklist, setChecklist] = useState({
    aadhaar_mobile_linked: true,
    pan_available: true,
    gstin_active: true,
    bank_account_verified: true,
    nic_code_mapped: true,
    investment_depreciation_calculated: true,
    employee_count_categorized: true,
  });

  const toggleCheck = (key: keyof typeof checklist) => {
    setChecklist(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      showToast('Checklist item updated.');
      return updated;
    });
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = Object.keys(checklist).length;
  const readinessPct = Math.round((completedCount / totalCount) * 100);

  // Classification thresholds and eligibility must be verified against current official rules.
  const currentCategory = 'Demo profile — classification not verified';

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-blue-800">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span><strong>ASSISTANCE & READINESS ONLY:</strong> UDYAM AI helps prepare all mandatory statutory information for Udyam Registration. Actual filing must be completed on the official portal (udyamregistration.gov.in) with Aadhaar OTP authentication.</span>
        </div>
        <span className="font-bold text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">DEMO CHECKLIST</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.udyam_reg')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Demo readiness checklist only. Classification and NIC code require verified investment, turnover and business-activity details.
          </p>
        </div>

        <a
          href="https://udyamregistration.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-all shadow-xs"
        >
          <span>Official Udyam Portal</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>

      {/* Classification & Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Enterprise Category</span>
          <div className="text-xl font-extrabold text-slate-900 mt-1">{currentCategory}</div>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">Based on Turnover (₹2.18 Cr) & Plant Investment</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preparation Status</span>
          <div className="text-xl font-extrabold text-emerald-600 mt-1">{readinessPct}% Ready</div>
          <p className="text-[11px] text-slate-500 mt-1">{completedCount} of {totalCount} mandatory fields verified</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Govt Portal Status</span>
          <div className="text-xl font-extrabold text-blue-600 mt-1">Pending Submission</div>
          <p className="text-[11px] text-slate-500 mt-1">Free portal registration with Aadhaar OTP</p>
        </div>
      </div>

      {/* Checklists & Pre-fill Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Requirements Checklist */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Mandatory Statutory Checklist</span>
            </h2>

            <div className="space-y-3">
              {[
                { id: 'aadhaar_mobile_linked' as const, label: 'Aadhaar Number of Proprietor / Partner (Mobile linked)', note: 'Required for e-OTP verification on portal' },
                { id: 'pan_available' as const, label: 'Business PAN linked to Income Tax Department database', note: 'Cross-verifies previous year tax turnover' },
                { id: 'gstin_active' as const, label: 'Active GSTIN registered in state of operation', note: `${profile.gstin} in ${profile.state}` },
                { id: 'bank_account_verified' as const, label: 'Active Commercial Bank Account & IFSC code', note: 'Current account with nationalized/private bank' },
                { id: 'nic_code_mapped' as const, label: 'National Industry Classification (NIC) Code identified', note: 'Select and verify the appropriate NIC code for the actual business activity' },
                { id: 'investment_depreciation_calculated' as const, label: 'Plant & Machinery Net Book Value (WDV from ITR)', note: 'Written Down Value <= ₹10 Crore for Small' },
                { id: 'employee_count_categorized' as const, label: 'Employee headcount breakdown (Male/Female/Other)', note: `${profile.employee_count} active employees recorded` },
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

        {/* Right Column: Pre-filled Business Profile Dossier */}
        <div className="lg:col-span-6 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Pre-filled Application Dossier</span>
            </h2>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Name of Enterprise:</span>
                <span className="font-bold text-slate-900">{profile.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Name of Entrepreneur / Owner:</span>
                <span className="font-bold text-slate-900">{profile.owner}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Constitution of Business:</span>
                <span className="font-bold text-slate-900">{profile.business_type}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Major Activity:</span>
                <span className="font-bold text-slate-900">Grocery / Retail (demo profile)</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">NIC 4-Digit Activity Code:</span>
                <span className="font-bold text-slate-900">Not mapped in this demo snapshot</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">State / Location:</span>
                <span className="font-bold text-slate-900">{profile.city}, {profile.state}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500">Estimated Annual Turnover:</span>
                <span className="font-bold text-slate-900">₹ {(profile.annual_revenue / 10000000).toFixed(2)} Crore</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500">Persons Employed:</span>
                <span className="font-bold text-slate-900">{profile.employee_count} Persons</span>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs text-slate-600 space-y-1">
              <p className="font-semibold text-slate-800">Next Steps to Register:</p>
              <p className="text-[11px]">1. Open <a href="https://udyamregistration.gov.in" target="_blank" rel="noreferrer" className="text-blue-600 underline">udyamregistration.gov.in</a>.</p>
              <p className="text-[11px]">2. Click on "For New Entrepreneurs who are not registered yet as MSME".</p>
              <p className="text-[11px]">3. Enter Aadhaar number and receive OTP on registered mobile.</p>
              <p className="text-[11px]">4. Copy the pre-filled values above to complete verification in under 5 minutes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
