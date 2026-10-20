import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  AlertTriangle, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Info,
  Zap
} from 'lucide-react';
import { apiService } from '../services/api';
import type { MarketSignal } from '../types';

export const MarketSignals: React.FC = () => {
  const navigate = useNavigate();
  const [signals, setSignals] = useState<MarketSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMarketSignals();
  }, []);

  const loadMarketSignals = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getMarketSignals();
      setSignals(response.signals || []);
    } catch (err) {
      setError('Failed to load market signals');
    } finally {
      setLoading(false);
    }
  };

  const getSignalConfig = (strength: string) => {
    switch (strength) {
      case 'STRONG_RISING':
        return { color: 'emerald', icon: TrendingUp, label: 'Strong Rising' };
      case 'MODERATE_RISING':
        return { color: 'green', icon: TrendingUp, label: 'Moderate Rising' };
      case 'STABLE':
        return { color: 'blue', icon: Activity, label: 'Stable' };
      case 'SLOW_MOVING':
        return { color: 'amber', icon: TrendingDown, label: 'Slow Moving' };
      case 'DECLINING':
        return { color: 'red', icon: TrendingDown, label: 'Declining' };
      default:
        return { color: 'slate', icon: Activity, label: strength };
    }
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-48 bg-slate-200 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Market Signals</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadMarketSignals}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (signals.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
          <Activity className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Market Signals Available</h3>
          <p className="text-slate-600">Market intelligence data is currently not available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Market Intelligence & Signals</h2>
            <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Market Signals
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Macro demand indicators, trend analysis, and market opportunity detection</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadMarketSignals}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=Market%20me%20kya%20opportunities%20hai%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Signal Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Rising Signals</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            {signals.filter(s => s.signal_strength.includes('RISING')).length}
          </p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-amber-700 font-bold">Slow Moving</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
            {signals.filter(s => s.signal_strength === 'SLOW_MOVING').length}
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-blue-700 font-bold">Stable</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">
            {signals.filter(s => s.signal_strength === 'STABLE').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">Declining</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">
            {signals.filter(s => s.signal_strength === 'DECLINING').length}
          </p>
        </div>
      </div>

      {/* Signal Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {signals.map((signal) => {
          const config = getSignalConfig(signal.signal_strength);
          const SignalIcon = config.icon;
          const isPositive = signal.trend_growth_30d_pct > 0;

          return (
            <div
              key={signal.signal_id}
              className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all`}
            >
              {/* Signal Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 bg-${config.color}-100 rounded-lg`}>
                    <SignalIcon className={`w-4 h-4 text-${config.color}-600`} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-${config.color}-700 bg-${config.color}-100 px-2 py-0.5 rounded`}>
                      {config.label}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{signal.source}</p>
                  </div>
                </div>
                <div className={`text-right`}>
                  <span className={`text-lg sm:text-xl font-extrabold ${isPositive ? 'text-emerald-600' : 'text-red-600'}`}>
                    {isPositive ? '+' : ''}{signal.trend_growth_30d_pct}%
                  </span>
                  <p className="text-[10px] text-slate-500">30d Growth</p>
                </div>
              </div>

              {/* Signal Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{signal.category}</h4>
                  <p className="text-xs text-slate-600 mt-1">{signal.trend_keyword}</p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start space-x-2">
                    <Zap className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-slate-700">Market vs Business Gap</p>
                      <p className="text-[11px] text-slate-600 mt-1">{signal.market_vs_business_gap}</p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-start space-x-2">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-blue-900">Recommendation</p>
                      <p className="text-[11px] text-blue-800 mt-1">{signal.recommendation}</p>
                    </div>
                  </div>
                </div>

                {signal.matched_products.length > 0 && (
                  <div>
                    <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                      Affected Products
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {signal.matched_products.map((productId) => (
                        <span
                          key={productId}
                          className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                        >
                          {productId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 font-semibold">About Market Signals</p>
          <p className="text-[11px] text-blue-800 mt-1">
            The core demo loads seeded grocery market signals. Live market-data sources, Google Trends and industry procurement feeds are not connected.
          </p>
        </div>
      </div>
    </div>
  );
};
