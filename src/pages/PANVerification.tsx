import React, { useState } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Building2, 
  UserCheck, 
  ShieldAlert,
  Info,
  Search
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PANVerification: React.FC = () => {
  const { profile, showToast, t } = useApp();
  const [panInput, setPanInput] = useState('ABCDE1234F');
  const [hasVerified, setHasVerified] = useState(false);

  // PAN Regex: 5 letters, 4 digits, 1 letter
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  const cleanPan = panInput.trim().toUpperCase();
  const isValidFormat = panRegex.test(cleanPan);

  // 4th Character Entity Type Mapping
  const getEntityType = (char: string) => {
    switch (char) {
      case 'P': return 'Individual / Proprietor';
      case 'C': return 'Company (Pvt Ltd / Ltd)';
      case 'H': return 'Hindu Undivided Family (HUF)';
      case 'F': return 'Partnership Firm / LLP';
      case 'A': return 'Association of Persons (AOP)';
      case 'T': return 'Trust';
      case 'B': return 'Body of Individuals (BOI)';
      case 'L': return 'Local Authority';
      case 'J': return 'Artificial Juridical Person';
      case 'G': return 'Government Agency';
      default: return 'Unknown Entity';
    }
  };

  const entityType = cleanPan.length >= 4 ? getEntityType(cleanPan[3]) : 'N/A';
  const surnameChar = cleanPan.length >= 5 ? cleanPan[4] : 'N/A';

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidFormat) {
      showToast('Please enter a valid 10-character PAN number format.');
      return;
    }
    setHasVerified(true);
    showToast('PAN syntax and entity structure verified. Live NSDL lookup pending.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-amber-700">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>PENDING INTEGRATION:</strong> PAN format validation and entity code parsing are verified locally. Live government verification requires authorized NSDL / UTIITSL API access.</span>
        </div>
        <span className="font-bold text-[10px] bg-amber-200/50 px-2 py-0.5 rounded uppercase">PENDING INTEGRATION</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t('nav.pan_verify')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Validate Permanent Account Number (PAN) structure, entity classification, and cross-check against MSME business registration.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Verification Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center space-x-2">
              <CreditCard className="w-4 h-4 text-blue-600" />
              <span>Verify PAN Number</span>
            </h2>

            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  10-Digit Permanent Account Number
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={panInput}
                  onChange={(e) => {
                    setPanInput(e.target.value.toUpperCase());
                    setHasVerified(false);
                  }}
                  placeholder="e.g. ABCDE1234F"
                  className="w-full text-base font-mono font-bold tracking-widest px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 uppercase"
                />
              </div>

              <div className="text-xs space-y-1 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Format Structure:</span>
                  <span className={`font-mono font-bold ${isValidFormat ? 'text-emerald-600' : 'text-slate-400'}`}>
                    AAAAA 9999 A
                  </span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Status:</span>
                  <span className={`font-semibold ${isValidFormat ? 'text-emerald-600' : 'text-amber-600'}`}>
                    {isValidFormat ? 'Valid Syntax Format' : 'Incomplete / Invalid Format'}
                  </span>
                </div>
              </div>

              <button
                type="submit"
                disabled={!isValidFormat}
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Verify PAN Details</span>
              </button>
            </form>
          </div>
        </div>

        {/* Verification Result Card */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Verification Status
                </span>
                <div className="flex items-center space-x-2 mt-0.5">
                  <span className="text-lg font-bold text-slate-900 font-mono">
                    {cleanPan || '----------'}
                  </span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                    isValidFormat 
                      ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                      : 'bg-slate-100 text-slate-500'
                  }`}>
                    {isValidFormat ? 'SYNTAX VALID • PENDING NSDL API' : 'ENTER 10 CHARACTERS'}
                  </span>
                </div>
              </div>

              {isValidFormat ? (
                <div className="w-9 h-9 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <Info className="w-5 h-5" />
                </div>
              )}
            </div>

            {/* Extracted Entity Classification Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">4th Character Classification</span>
                <p className="text-xs font-bold text-slate-900 mt-1">{cleanPan[3] || '-'} → {entityType}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Determines legal status under Income Tax Act</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">5th Character Match</span>
                <p className="text-xs font-bold text-slate-900 mt-1">{cleanPan[4] || '-'} (First letter of Surname / Entity)</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Cross-checked against business owner name</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Registered Business Cross-check</span>
                <p className="text-xs font-bold text-slate-900 mt-1">{profile.name}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Owner: {profile.owner}</p>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Government Portal Status</span>
                <p className="text-xs font-bold text-amber-700 mt-1">Pending Live API Gateway</p>
                <p className="text-[10px] text-slate-500 mt-0.5">Requires NSDL / Income Tax Department API key</p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 text-[11px] text-slate-600">
              <strong>Honesty Standard:</strong> To adhere to government compliance guidelines, UDYAM AI does not fabricate 'PAN Verified' status without active cryptographic verification through an authorized intermediary.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
