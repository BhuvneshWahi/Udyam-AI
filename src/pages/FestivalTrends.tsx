import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  TrendingUp, 
  Clock, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  RefreshCw,
  Info,
  AlertCircle
} from 'lucide-react';
import { apiService } from '../services/api';
import type { FestivalIntelligence } from '../types';

export const FestivalTrends: React.FC = () => {
  const navigate = useNavigate();
  const [festivals, setFestivals] = useState<FestivalIntelligence[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFestivalData();
  }, []);

  const loadFestivalData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiService.getFestivalIntelligence();
      setFestivals(response.festivals || []);
    } catch (err) {
      setError('Failed to load festival intelligence');
    } finally {
      setLoading(false);
    }
  };

  const getUrgencyColor = (daysRemaining: number) => {
    if (daysRemaining <= 30) return { color: 'red', label: 'Critical' };
    if (daysRemaining <= 60) return { color: 'amber', label: 'Upcoming' };
    if (daysRemaining <= 90) return { color: 'blue', label: 'Planning' };
    return { color: 'slate', label: 'Future' };
  };

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-56 bg-slate-200 rounded-xl"></div>
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
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-900 mb-2">Unable to Load Festival Intelligence</h3>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={loadFestivalData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (festivals.length === 0) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
          <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Festival Data Available</h3>
          <p className="text-slate-600">Festival intelligence data is currently not available.</p>
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
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Festival Trends & Demand Intelligence</h2>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Intelligence
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Upcoming festivals, expected demand surges, and inventory preparation timelines</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={loadFestivalData}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=Agle%20festivals%20me%20demand%20kya%20rahega%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Festival Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-purple-50 border border-purple-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-purple-700 font-bold">Upcoming Festivals</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-purple-900 mt-1">{festivals.length}</p>
        </div>
        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">Critical (≤30d)</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">
            {festivals.filter(f => f.days_remaining <= 30).length}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Avg Demand Lift</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            {(festivals.reduce((sum, f) => sum + f.historical_demand_lift_pct, 0) / festivals.length).toFixed(0)}%
          </p>
        </div>
        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-blue-700 font-bold">Max Lead Time</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">
            {Math.max(...festivals.map(f => f.lead_time_required_days))}d
          </p>
        </div>
      </div>

      {/* Festival Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {festivals.map((festival) => {
          const urgency = getUrgencyColor(festival.days_remaining);

          return (
            <div
              key={festival.id}
              className={`bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all`}
            >
              {/* Festival Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 bg-${urgency.color}-100 rounded-lg`}>
                    <Calendar className={`w-4 h-4 text-${urgency.color}-600`} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-${urgency.color}-700 bg-${urgency.color}-100 px-2 py-0.5 rounded`}>
                      {urgency.label}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{festival.region}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`text-lg sm:text-xl font-extrabold text-${urgency.color}-600`}>
                    {festival.days_remaining}d
                  </span>
                  <p className="text-[10px] text-slate-500">Remaining</p>
                </div>
              </div>

              {/* Festival Content */}
              <div className="space-y-3">
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{festival.name}</h4>
                  <div className="flex items-center space-x-2 mt-1">
                    <Clock className="w-3.5 h-3.5 text-slate-500" />
                    <p className="text-xs text-slate-600">{festival.date}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 bg-emerald-50 rounded-lg border border-emerald-200">
                    <p className="text-[10px] text-emerald-700 font-semibold">Demand Lift</p>
                    <p className="text-sm font-extrabold text-emerald-900">+{festival.historical_demand_lift_pct}%</p>
                  </div>
                  <div className="p-2 bg-blue-50 rounded-lg border border-blue-200">
                    <p className="text-[10px] text-blue-700 font-semibold">Lead Time</p>
                    <p className="text-sm font-extrabold text-blue-900">{festival.lead_time_required_days}d</p>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Relevant Categories
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {festival.business_categories.map((category) => (
                      <span
                        key={category}
                        className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <div className="flex items-start space-x-2">
                    <TrendingUp className="w-4 h-4 text-purple-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-purple-900">Recommendation</p>
                      <p className="text-[11px] text-purple-800 mt-1">{festival.recommendation}</p>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                    Trigger Schedule (Days Before)
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {festival.trigger_schedule.map((days) => (
                      <span
                        key={days}
                        className={`text-[10px] px-2 py-0.5 rounded font-medium ${
                          days <= 7 ? 'bg-red-100 text-red-700' :
                          days <= 14 ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}
                      >
                        T-{days}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Banner */}
      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-purple-900 font-semibold">About Festival Intelligence</p>
          <p className="text-[11px] text-purple-800 mt-1">
            The core demo uses seeded Dhanteras and Diwali calendar signals. Historical business-specific lift and live demand integrations are not verified in this repository snapshot.
          </p>
        </div>
      </div>
    </div>
  );
};
