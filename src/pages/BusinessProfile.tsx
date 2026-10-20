import React from 'react';
import { 
  Sparkles
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const BusinessProfilePage: React.FC = () => {
  const { profile } = useApp();

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-5xl mx-auto overflow-x-hidden">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3 sm:space-x-4">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-emerald-500 text-slate-950 font-black text-lg sm:text-xl flex items-center justify-center border-2 border-emerald-400 shadow-md shrink-0">
            RS
          </div>
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-1">
              <h2 className="text-lg sm:text-xl font-extrabold text-white">{profile.name}</h2>
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/30">
                REGISTERED MSME
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">Proprietor: {profile.owner} • {profile.city}, {profile.state}</p>
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
          <span className="text-[10px] text-slate-400 font-bold block uppercase">GSTIN Registration</span>
          <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-400">{profile.gstin}</span>
        </div>
      </div>

      {/* Profile Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {/* Core Attributes */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm border-b border-slate-100 pb-2">Business Attributes</h3>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Business Classification:</span>
              <strong className="text-slate-900">{profile.business_type}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Industry Sector:</span>
              <strong className="text-slate-900">{profile.sector}</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Business Age:</span>
              <strong className="text-slate-900">{profile.business_age_years} Years Active</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Employee Count:</span>
              <strong className="text-slate-900">{profile.employee_count} Full-time Staff</strong>
            </div>

            <div className="flex justify-between py-1 border-b border-slate-100">
              <span className="text-slate-500 font-medium">Annual Turnover Range:</span>
              <strong className="text-emerald-700 font-extrabold">₹ 1.45 Crore (Micro Enterprise)</strong>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 font-medium">Preferred AI Language:</span>
              <strong className="text-blue-600 font-extrabold">{profile.preferred_language}</strong>
            </div>
          </div>
        </div>

        {/* AI Personalization Context Card */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-4 sm:p-5 border border-slate-800 shadow-md space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Sparkles className="w-5 h-5 shrink-0" />
              <span>AI Copilot Personalization Model</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed font-medium">
              Udyam AI continuously tailors its recommendations to your business footprint. Every forecast, reorder calculation, and government scheme match is evaluated against:
            </p>

            <div className="p-3 bg-slate-800 rounded-xl space-y-2 border border-slate-700 text-xs text-slate-200">
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <span><strong>B2B Auto Supplier Context:</strong> High velocity reorder thresholds tuned for tier-2 OEMs.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <span><strong>GST Monthly Schedule:</strong> Automated GSTR-3B tax credit reconciliation alerts.</span>
              </div>
              <div className="flex items-start space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0"></span>
                <span><strong>Government Grant Matching:</strong> Collateral-free CGTMSE loans and ZED certification subsidies.</span>
              </div>
            </div>
          </div>

          <div className="p-3 bg-emerald-950/60 border border-emerald-500/30 rounded-xl text-emerald-400 text-xs font-bold text-center mt-2">
            Personalization Active for Sharma General Store
          </div>
        </div>
      </div>
    </div>
  );
};
