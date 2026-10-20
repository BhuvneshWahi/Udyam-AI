import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  BarChart3, 
  Compass, 
  Zap, 
  Calendar, 
  LineChart,
  TrendingUp
} from 'lucide-react';
import { MarketSignals } from './MarketSignals';
import { MarketDemand } from './MarketDemand';
import { SignalDetector } from './SignalDetector';
import { FestivalTrends } from './FestivalTrends';
import { DemandForecast } from './DemandForecast';
import { useApp } from '../context/AppContext';

export const MarketIntelligenceHub: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';
  const { t } = useApp();

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
                  Market Intelligence Hub
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
                  Regional & Festival Trends
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Discover market opportunities, track rising category signals, prepare for festive peaks, and forecast demand
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Rajasthan & Western India Signals Active</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('overview')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'overview'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>{t('tabs.overview')}</span>
            </button>

            <button
              onClick={() => handleTabChange('demand')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'demand'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>{t('tabs.demand')}</span>
            </button>

            <button
              onClick={() => handleTabChange('signals')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'signals'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Zap className="w-4 h-4" />
              <span>{t('tabs.signals')}</span>
            </button>

            <button
              onClick={() => handleTabChange('festivals')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'festivals'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>{t('tabs.festivals')}</span>
            </button>

            <button
              onClick={() => handleTabChange('forecast')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'forecast'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <LineChart className="w-4 h-4" />
              <span>{t('tabs.forecast')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Viewport */}
      <div>
        {activeTab === 'overview' && <MarketSignals />}
        {activeTab === 'demand' && <MarketDemand />}
        {activeTab === 'signals' && <SignalDetector />}
        {activeTab === 'festivals' && <FestivalTrends />}
        {activeTab === 'forecast' && <DemandForecast />}
      </div>
    </div>
  );
};
