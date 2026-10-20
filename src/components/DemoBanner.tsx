import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Play, ChevronRight, X } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DemoBanner: React.FC = () => {
  const [isGuideOpen, setGuideOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const { isDemoBannerVisible } = useApp();

  if (!isDemoBannerVisible) return null;

  const demoSteps = [
    {
      title: "1. Executive Overview (Home)",
      desc: "Business Health, Revenue ₹18.42L (+18.5%), demand outlook, procurement alerts, and the Ask Udyam AI box.",
      path: "/",
      actionLabel: "View Overview"
    },
    {
      title: "2. Grounded AI Copilot",
      desc: "Ask 'Agle mahine kaunse products ka stock badhana chahiye?' and see grounded data tables & structured reasoning.",
      path: "/copilot?q=Agle%20mahine%20kaunse%20products%20ka%20stock%20badhana%20chahiye%3F",
      actionLabel: "Try AI Query"
    },
    {
      title: "3. Demand Forecasting & Inventory",
      desc: "Inspect seeded 7-day retail forecasts, inventory levels, and procurement recommendations.",
      path: "/forecast",
      actionLabel: "Inspect Forecast"
    },
    {
      title: "4. Compliance & Govt Schemes",
      desc: "Check GSTR-3B due on 01 October 2026 using the seeded demo reference date, plus grounded compliance guidance.",
      path: "/compliance",
      actionLabel: "View Compliance"
    },
    {
      title: "5. Voice Assistant Interaction",
      desc: "Simulate natural speech queries in Hinglish / Hindi with instant voice response synthesis.",
      path: "/voice",
      actionLabel: "Try Voice AI"
    }
  ];

  const handleStepClick = (idx: number) => {
    setCurrentStep(idx);
    navigate(demoSteps[idx].path);
  };

  return (
    <>
      <div className="bg-slate-900 text-white text-xs px-3 sm:px-6 py-1.5 sm:py-2 flex items-center justify-between border-b border-slate-800 shrink-0 overflow-hidden">
        <div className="flex items-center space-x-2 overflow-hidden py-0.5">
          <span className="flex items-center space-x-1 font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-500/30 text-[10px] sm:text-[11px] shrink-0">
            <Sparkles className="w-3 h-3 text-emerald-400" />
            <span>JUDGE DEMO MODE</span>
          </span>
          <span className="text-slate-300 font-medium truncate text-[11px] hidden md:inline">
            Demo Entity: <strong className="text-white">Sharma General Store</strong> (Delhi)
          </span>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={() => { setGuideOpen(true); setCurrentStep(0); }}
            className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 px-2.5 sm:px-3 py-1 rounded-md font-bold text-[10px] sm:text-[11px] transition-all shadow-xs"
          >
            <Play className="w-3 h-3 fill-current shrink-0" />
            <span>2-Min Guided Tour</span>
          </button>
        </div>
      </div>

      {/* Guided Tour Modal */}
      {isGuideOpen && (
        <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl overflow-hidden border border-slate-200 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
            <div className="bg-slate-900 text-white p-4 sm:p-5 flex items-center justify-between shrink-0">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="bg-emerald-500 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded">HACKATHON STORY</span>
                  <h3 className="font-bold text-sm sm:text-base text-white">UDYAM AI Demo Journey</h3>
                </div>
                <p className="text-xs text-slate-300 mt-1">Experience how Udyam AI transforms MSME decision-making in 5 steps.</p>
              </div>
              <button onClick={() => setGuideOpen(false)} className="text-slate-400 hover:text-white p-1">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6 overflow-y-auto flex-1">
              {/* Step indicator pills */}
              <div className="grid grid-cols-5 gap-1.5 mb-6">
                {demoSteps.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleStepClick(idx)}
                    className={`h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? 'bg-emerald-500 ring-2 ring-emerald-300 ring-offset-1'
                        : idx < currentStep
                        ? 'bg-emerald-200'
                        : 'bg-slate-200'
                    }`}
                    title={s.title}
                  />
                ))}
              </div>

              {/* Active Step Content */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 sm:p-5 mb-6">
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                  Step {currentStep + 1} of 5
                </span>
                <h4 className="text-base font-bold text-slate-900 mt-2">{demoSteps[currentStep].title}</h4>
                <p className="text-xs text-slate-600 leading-relaxed mt-1.5">{demoSteps[currentStep].desc}</p>
              </div>

              <div className="flex items-center justify-between">
                <button
                  disabled={currentStep === 0}
                  onClick={() => handleStepClick(currentStep - 1)}
                  className="px-3.5 py-2 border border-slate-300 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Previous
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => {
                      navigate(demoSteps[currentStep].path);
                      setGuideOpen(false);
                    }}
                    className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center space-x-1.5 shadow-sm"
                  >
                    <span>{demoSteps[currentStep].actionLabel}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {currentStep < demoSteps.length - 1 && (
                    <button
                      onClick={() => handleStepClick(currentStep + 1)}
                      className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold"
                    >
                      Next Step
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
