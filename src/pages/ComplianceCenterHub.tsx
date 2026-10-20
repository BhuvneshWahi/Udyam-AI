import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  ShieldCheck, 
  FileCode, 
  UserCheck, 
  Building2, 
  Bell, 
  ShieldAlert,
  Calendar
} from 'lucide-react';
import { SmartReminders } from './SmartReminders';
import { GSTAssistant } from './GSTAssistant';
import { PANVerification } from './PANVerification';
import { UdyamRegistration } from './UdyamRegistration';
import { DocumentAssurance } from './DocumentAssurance';
import { useApp } from '../context/AppContext';

export const ComplianceCenterHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'deadlines';
  const { compliance, t } = useApp();

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
                  Compliance Center
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  GST & MSME Compliant
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Statutory filing calendar, GST checklists, PAN verification, and Udyam MSME certification assurance
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>GSTIN: {compliance.gstin} ({compliance.gst_status})</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('deadlines')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'deadlines'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('tabs.deadlines')}</span>
            </button>

            <button
              onClick={() => handleTabChange('gst')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'gst'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>{t('tabs.gst')}</span>
            </button>

            <button
              onClick={() => handleTabChange('pan')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'pan'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>{t('tabs.pan')}</span>
            </button>

            <button
              onClick={() => handleTabChange('udyam')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'udyam'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Building2 className="w-4 h-4" />
              <span>{t('tabs.udyam')}</span>
            </button>

            <button
              onClick={() => handleTabChange('doc_assurance')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'doc_assurance'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              <span>{t('tabs.doc_assurance')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'deadlines' && <SmartReminders />}
        {activeTab === 'gst' && <GSTAssistant />}
        {activeTab === 'pan' && <PANVerification />}
        {activeTab === 'udyam' && <UdyamRegistration />}
        {activeTab === 'doc_assurance' && <DocumentAssurance />}
      </div>
    </div>
  );
};
