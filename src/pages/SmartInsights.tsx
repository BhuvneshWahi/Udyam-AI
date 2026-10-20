import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Sparkles, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const SmartInsights: React.FC = () => {
  const { insights, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const navigate = useNavigate();

  const filteredInsights = insights.filter(
    (ins) => selectedCategory === 'ALL' || ins.category === selectedCategory
  );

  const handleAction = (ins: any) => {
    if (ins.category === 'Risk' || ins.category === 'Inventory') {
      navigate('/inventory');
      showToast(`Navigated to inventory for: ${ins.title}`);
    } else if (ins.category === 'Profitability' || ins.category === 'Opportunity') {
      navigate('/sales');
      showToast(`Reviewing sales profitability for: ${ins.title}`);
    } else {
      navigate('/actions');
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Zap className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">AI Smart Insight Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Automated business intelligence synthesized from sales, stock, margins, and customer retention</p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 overflow-x-auto">
          {['ALL', 'Risk', 'Opportunity', 'Profitability', 'Inventory', 'Growth'].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 sm:px-3 sm:py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Insight Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {filteredInsights.map((ins) => (
          <div
            key={ins.id}
            className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs space-y-3.5 flex flex-col justify-between transition-all hover:shadow-md ${
              ins.priority === 'High' ? 'border-red-200' : ins.priority === 'Medium' ? 'border-amber-200' : 'border-slate-200'
            }`}
          >
            <div className="space-y-3">
              {/* Card Header Badges */}
              <div className="flex items-center justify-between">
                <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                  ins.category === 'Risk' ? 'bg-red-100 text-red-800' :
                  ins.category === 'Opportunity' ? 'bg-emerald-100 text-emerald-800' :
                  ins.category === 'Profitability' ? 'bg-blue-100 text-blue-800' :
                  ins.category === 'Inventory' ? 'bg-purple-100 text-purple-800' :
                  'bg-indigo-100 text-indigo-800'
                }`}>
                  {ins.category} Insight
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                  ins.priority === 'High' ? 'bg-red-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}>
                  {ins.priority} Priority
                </span>
              </div>

              {/* Title */}
              <h3 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">{ins.title}</h3>

              {/* Why it Matters */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Why it matters:</span>
                <p className="text-xs text-slate-700 font-medium leading-relaxed">{ins.why}</p>
              </div>

              {/* Supporting Data */}
              <div className="p-3 bg-slate-900 text-slate-200 rounded-xl space-y-1 border border-slate-800">
                <div className="flex items-center space-x-1.5 text-emerald-400 text-[10px] sm:text-[11px] font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>SUPPORTING EVIDENCE DATA</span>
                </div>
                <p className="text-xs text-white font-mono">{ins.supporting_data}</p>
              </div>

              {/* Recommended Action Box */}
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">Recommended Action:</span>
                <p className="text-xs font-bold text-emerald-950">{ins.action}</p>
              </div>
            </div>

            {/* Action Trigger Button */}
            <button
              onClick={() => handleAction(ins)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-xs"
            >
              <span>Execute Recommended Action</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
