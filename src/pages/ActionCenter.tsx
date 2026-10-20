import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CheckSquare, 
  Sparkles, 
  ArrowRight, 
  DollarSign
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ActionCenter: React.FC = () => {
  const { actions, updateProductStock, showToast } = useApp();
  const navigate = useNavigate();

  const handleExecuteAction = (act: any) => {
    if (act.action_type === 'PURCHASE_PLAN' && act.target_product) {
      updateProductStock(act.target_product, 542);
      showToast(`Action executed! Purchase order issued for ${act.title}.`);
    } else if (act.action_type === 'COMPLIANCE') {
      navigate('/compliance');
      showToast("Navigated to compliance assistant for GSTR-3B approval.");
    } else if (act.action_type === 'GOVT_SCHEME') {
      navigate('/schemes');
      showToast("Opened Government scheme discovery for ZED certification.");
    } else {
      navigate('/inventory');
      showToast("Clearance discount applied to overstocked SKUs.");
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <CheckSquare className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Action Center — What Should I Do Today?</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Udyam AI prioritized decision support feed ranked by financial urgency and business risk</p>
        </div>
        <div className="flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 text-emerald-800 text-xs font-bold w-fit">
          <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>5 Actions Pending Today</span>
        </div>
      </div>

      {/* Action Items List */}
      <div className="space-y-3 sm:space-y-4">
        {actions.map((act, index) => (
          <div
            key={act.id}
            className={`bg-white rounded-2xl p-4 sm:p-5 border shadow-xs transition-all hover:shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              act.priority === 'Critical' ? 'border-red-200 bg-red-50/20' :
              act.priority === 'High' ? 'border-amber-200 bg-amber-50/20' : 'border-slate-200'
            }`}
          >
            <div className="flex items-start space-x-3 sm:space-x-4">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5 ${
                act.priority === 'Critical' ? 'bg-red-600 text-white' :
                act.priority === 'High' ? 'bg-amber-500 text-white' : 'bg-slate-900 text-white'
              }`}>
                #{index + 1}
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                    act.priority === 'Critical' ? 'bg-red-100 text-red-800' :
                    act.priority === 'High' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {act.priority} Priority
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{act.title}</h3>
                </div>

                <p className="text-xs text-slate-600 font-medium leading-relaxed">
                  <strong>Why:</strong> {act.reason}
                </p>

                <div className="inline-flex items-center space-x-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                  <DollarSign className="w-3.5 h-3.5" />
                  <span>Business Impact: {act.impact}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => handleExecuteAction(act)}
              className="w-full md:w-auto px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 shrink-0 shadow-sm transition-all active:scale-95 text-center"
            >
              <span>Take Action Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
