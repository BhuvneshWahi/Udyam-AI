import React, { useState } from 'react';
import { 
  CheckSquare, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  TrendingUp, 
  Package, 
  ShieldCheck, 
  DollarSign, 
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle2
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ActionPlanItem {
  id: string;
  horizon: 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  source: 'Inventory' | 'Finance' | 'Compliance' | 'Market' | 'Festival' | 'Reconciliation';
  title: string;
  reason: string;
  recommended_action: string;
  affected_area: string;
  impact: string;
  completed?: boolean;
}

const INITIAL_ACTIONS: ActionPlanItem[] = [
  {
    id: 'ACT-01',
    horizon: 'TODAY',
    priority: 'Critical',
    source: 'Inventory',
    title: 'Review Besan procurement before festive demand',
    reason: 'Seeded stock is 21 kg, 20 kg is incoming, and adjusted 7-day demand is about 255.8 kg.',
    recommended_action: 'Review the recommendation for approximately 266 kg additional Besan against actual supplier lead time and stock records.',
    affected_area: 'Sharma General Store · Besan',
    impact: 'Supports earlier stock planning; no purchase order is submitted automatically.',
    completed: false
  },
  {
    id: 'ACT-02',
    horizon: 'THIS_WEEK',
    priority: 'High',
    source: 'Compliance',
    title: 'Verify GSTR-3B filing status',
    reason: 'The seeded compliance task is marked pending with a due date of 01 October 2026.',
    recommended_action: 'Check the actual GST portal and business records before filing or paying.',
    affected_area: 'GSTR-3B · Demo reference date 26 September 2026',
    impact: 'Makes the demo deadline visible; actual filing status is not live-verified.',
    completed: false
  },
  {
    id: 'ACT-03',
    horizon: 'THIS_WEEK',
    priority: 'High',
    source: 'Market',
    title: 'Review Ghee and Dry Fruits stock signals',
    reason: 'Seeded demand adjustments are +14% for Ghee and +9% for the festive grocery signal.',
    recommended_action: 'Compare the signals with current physical stock, supplier lead times and actual sales before placing orders.',
    affected_area: 'Ghee · Dry Fruits · Grocery/Retail',
    impact: 'Improves planning discipline without treating market indicators as live quotes.',
    completed: false
  },
  {
    id: 'ACT-04',
    horizon: 'THIS_WEEK',
    priority: 'Medium',
    source: 'Festival',
    title: 'Prepare for Dhanteras and Diwali',
    reason: 'The seeded calendar lists Dhanteras on 11 October 2026 and Diwali on 13 October 2026.',
    recommended_action: 'Review shelf availability and vendor lead times for relevant grocery products.',
    affected_area: 'Sharma General Store · Delhi',
    impact: 'Helps the owner plan around the seeded festive calendar.',
    completed: false
  }
];

export const ActionPlan: React.FC = () => {
  const { showToast, t } = useApp();
  const [horizon, setHorizon] = useState<'TODAY' | 'THIS_WEEK' | 'THIS_MONTH'>('TODAY');
  const [actions, setActions] = useState<ActionPlanItem[]>(INITIAL_ACTIONS);
  const [selectedSource, setSelectedSource] = useState<string>('ALL');

  const toggleAction = (id: string) => {
    setActions(prev => prev.map(a => {
      if (a.id === id) {
        const next = !a.completed;
        showToast(next ? `Marked action as completed.` : `Reopened action item.`);
        return { ...a, completed: next };
      }
      return a;
    }));
  };

  const filtered = actions.filter(a => {
    const matchesHorizon = a.horizon === horizon;
    const matchesSource = selectedSource === 'ALL' || a.source === selectedSource;
    return matchesHorizon && matchesSource;
  });

  const sources = ['ALL', 'Inventory', 'Finance', 'Compliance', 'Market', 'Festival', 'Reconciliation'];

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.action_plan')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Action suggestions derived from the seeded grocery, forecast, market, event and compliance demo data. Completion toggles are local demo state.
          </p>
        </div>

        {/* Horizon Switcher Tabs */}
        <div className="flex items-center p-1 bg-slate-200/80 rounded-xl">
          {(['TODAY', 'THIS_WEEK', 'THIS_MONTH'] as const).map((h) => (
            <button
              key={h}
              onClick={() => setHorizon(h)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                horizon === h 
                  ? 'bg-white text-slate-900 shadow-xs' 
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {h === 'TODAY' ? 'Today (Urgent)' : h === 'THIS_WEEK' ? 'This Week' : 'This Month'}
            </button>
          ))}
        </div>
      </div>

      {/* Filter by Source */}
      <div className="flex flex-wrap items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-3 shadow-xs">
        <span className="text-xs text-slate-400 font-bold uppercase tracking-wider mr-2">Filter Source:</span>
        {sources.map((s) => (
          <button
            key={s}
            onClick={() => setSelectedSource(s)}
            className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
              selectedSource === s 
                ? 'bg-slate-900 text-white' 
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Action Items List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
            No active action items for the selected filter.
          </div>
        ) : (
          filtered.map((item) => (
            <div 
              key={item.id}
              className={`bg-white border rounded-xl p-5 shadow-xs transition-all ${
                item.completed ? 'border-slate-200 opacity-60 bg-slate-50' : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3.5">
                  <input
                    type="checkbox"
                    checked={item.completed}
                    onChange={() => toggleAction(item.id)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  />
                  <div className="space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        item.priority === 'Critical' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : item.priority === 'High'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}>
                        {item.priority}
                      </span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        {item.source}
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {item.affected_area}
                      </span>
                    </div>

                    <h3 className={`text-sm font-bold ${item.completed ? 'line-through text-slate-500' : 'text-slate-900'}`}>
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600">
                      <strong className="text-slate-700">Evidence / Root Cause:</strong> {item.reason}
                    </p>

                    <div className="flex items-start space-x-2 text-xs bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-slate-900">Recommended Action: </span>
                        <span className="text-slate-700">{item.recommended_action}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0 hidden sm:block">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Estimated Impact</span>
                  <p className="text-xs font-bold text-emerald-700 mt-0.5">{item.impact}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
