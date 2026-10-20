import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  CheckSquare, 
  Target, 
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { ActionPlan } from './ActionPlan';
import { ActionCenter } from './ActionCenter';
import { SmartInsights } from './SmartInsights';
import { useApp } from '../context/AppContext';

export const ActionCenterHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'action_plan';
  const { actions, t } = useApp();

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
                  Action Center Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Prioritized Execution
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic action matrix across inventory reorders, cash collections, GST filings, and festival buffers
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{actions.length} Pending High-Impact Actions</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('action_plan')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'action_plan'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>{t('tabs.action_plan')}</span>
            </button>

            <button
              onClick={() => handleTabChange('today')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'today'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <CheckSquare className="w-4 h-4" />
              <span>{t('tabs.today')} ({actions.length})</span>
            </button>

            <button
              onClick={() => handleTabChange('insights')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'insights'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{t('nav.insights')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'action_plan' && <ActionPlan />}
        {activeTab === 'today' && <ActionCenter />}
        {activeTab === 'insights' && <SmartInsights />}
      </div>
    </div>
  );
};
