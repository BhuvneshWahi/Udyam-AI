import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Sparkles, 
  ArrowRight, 
  Filter, 
  Award,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const GovernmentSchemes: React.FC = () => {
  const { schemes, profile, showToast } = useApp();
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const navigate = useNavigate();

  const filteredSchemes = schemes.filter(
    (s) => selectedSector === 'ALL' || s.sector.toLowerCase().includes(selectedSector.toLowerCase()) || s.sector.includes('All')
  );

  const handleApplyScheme = (schemeName: string) => {
    showToast(`Demo only: ${schemeName} application is not connected. Verify current eligibility and terms on official portals.`);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Disclaimer Banner */}
      <div className="bg-blue-50 border border-blue-200 p-3 sm:p-3.5 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-blue-900 text-xs">
        <div className="flex items-start sm:items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
          <span className="leading-relaxed">
            <strong>Prototype reference mode:</strong> This repository snapshot does not verify scheme eligibility for <strong>{profile.name}</strong>. Confirm current rules, limits and eligibility on official portals before applying.
          </span>
        </div>
        <span className="bg-blue-200 text-blue-900 font-extrabold text-[10px] px-2 py-0.5 rounded shrink-0">
          VERIFY OFFICIAL RULES
        </span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Building2 className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Government Scheme & Subsidy Discovery</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Scheme reference view only. Verified eligibility matching and financial structuring are not yet implemented.</p>
        </div>

        {/* Sector Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <select
            value={selectedSector}
            onChange={(e) => setSelectedSector(e.target.value)}
            className="px-3 py-1.5 bg-slate-100 border border-slate-300 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="ALL">All Sectors</option>
            <option value="Staples">Staples</option>
            <option value="Festive">Festive / Seasonal</option>
            <option value="Retail">Retail</option>
          </select>
        </div>
      </div>

      {/* Schemes Grid */}
      {filteredSchemes.length === 0 ? (
        <div className="bg-white rounded-2xl border border-dashed border-slate-300 p-6 sm:p-10 text-center space-y-2">
          <Info className="w-6 h-6 text-amber-600 mx-auto" />
          <h3 className="font-bold text-slate-900">No verified scheme matches in this snapshot</h3>
          <p className="text-sm text-slate-600 max-w-2xl mx-auto">Scheme matching, current eligibility checks, financial structuring and application routing are not implemented as verified flows in this repository version. Check current government guidance before making a funding decision.</p>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {filteredSchemes.map((sch) => (
          <div
            key={sch.id}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-3.5 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              {/* Header Badges */}
              <div className="flex items-center justify-between flex-wrap gap-1">
                <span className="text-[10px] sm:text-[11px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded">
                  {sch.provider}
                </span>
                <span className="bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>{sch.eligibility_match > 0 ? `${sch.eligibility_match}% demo match` : sch.status}</span>
                </span>
              </div>

              {/* Title & Max Benefit */}
              <div>
                <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{sch.name}</h3>
                <div className="mt-1 flex items-center space-x-1 text-emerald-700 font-bold text-xs bg-emerald-50 px-2 py-1 rounded-lg w-fit">
                  <Award className="w-4 h-4 shrink-0" />
                  <span>Max Benefit: {sch.max_benefit}</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {sch.description}
              </p>

              {/* Why Udyam Recommends */}
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1 border border-slate-800">
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                  WHY UDYAM AI RECOMMENDS THIS:
                </span>
                <p className="text-xs text-white font-medium leading-normal">
                  {sch.why_recommended}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-2 pt-2 border-t border-slate-100">
              <button
                onClick={() => navigate(`/copilot?q=Tell%20me%20more%20about%20${encodeURIComponent(sch.name)}`)}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors text-center"
              >
                Ask Copilot Details
              </button>
              <button
                onClick={() => handleApplyScheme(sch.name)}
                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shadow-sm transition-all text-center"
              >
                <span>Check Requirements</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
      )}
    </div>
  );
};
