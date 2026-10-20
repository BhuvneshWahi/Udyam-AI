import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mic, X, Sparkles, Volume2, ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const VoiceModal: React.FC = () => {
  const { isVoiceModalOpen, setVoiceModalOpen } = useApp();
  const [language, setLanguage] = useState<'Hinglish' | 'Hindi' | 'English'>('Hinglish');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const navigate = useNavigate();

  if (!isVoiceModalOpen) return null;

  const sampleQueries = {
    Hinglish: [
      "Agle mahine kaunse products ka stock badhana chahiye?",
      "Mere sales kyu gir rahe hain?",
      "Meri next GST filing kab hai?",
      "Kaunse products sabse zyada profit de rahe hain?"
    ],
    Hindi: [
      "अगले महीने कौन से प्रोडक्ट का स्टॉक बढ़ाना चाहिए?",
      "मेरी जीएसटी फाइलिंग की तारीख क्या है?",
      "किस प्रोडक्ट में सबसे ज़्यादा मुनाफ़ा है?"
    ],
    English: [
      "Which products are at risk of stockout this month?",
      "What is my next GST filing due date?",
      "Show me top profit margin categories."
    ]
  };

  const handleSimulateListen = (queryText?: string) => {
    setIsListening(true);
    setTranscript('');
    const targetText = queryText || sampleQueries[language][0];
    
    let currentIdx = 0;
    const interval = setInterval(() => {
      setTranscript(targetText.slice(0, currentIdx + 1));
      currentIdx++;
      if (currentIdx >= targetText.length) {
        clearInterval(interval);
        setTimeout(() => {
          setIsListening(false);
        }, 500);
      }
    }, 30);
  };

  const handleExecuteVoiceQuery = () => {
    if (!transcript) return;
    setVoiceModalOpen(false);
    navigate(`/copilot?q=${encodeURIComponent(transcript)}`);
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white p-5 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
              <Mic className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-white">Udyam Voice Assistant</h3>
              <p className="text-[11px] text-slate-300">Speak in English, Hindi, or Hinglish</p>
            </div>
          </div>
          <button onClick={() => setVoiceModalOpen(false)} className="text-slate-400 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Language selector */}
          <div className="flex items-center justify-between mb-6 bg-slate-100 p-1 rounded-xl">
            {(['Hinglish', 'Hindi', 'English'] as const).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  language === lang
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Microphone Animation Area */}
          <div className="flex flex-col items-center justify-center py-6">
            <button
              onClick={() => handleSimulateListen()}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all ${
                isListening
                  ? 'bg-red-500 text-white mic-pulse scale-105'
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xl shadow-blue-500/25 hover:scale-105'
              }`}
            >
              <Mic className="w-8 h-8" />
            </button>
            <p className="text-xs font-bold text-slate-600 mt-4">
              {isListening ? 'Listening & Transcribing...' : 'Tap Mic or Select Suggested Query Below'}
            </p>
          </div>

          {/* Live Transcript Display Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 min-h-[70px] mb-4 flex items-center justify-center">
            {transcript ? (
              <p className="text-sm font-semibold text-slate-800 text-center italic">
                "{transcript}"
              </p>
            ) : (
              <p className="text-xs text-slate-400 text-center">
                Spoken audio will be transcribed here...
              </p>
            )}
          </div>

          {/* Quick Prompts list */}
          <div className="space-y-2 mb-6">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Suggested Voice Questions:</span>
            {sampleQueries[language].map((q, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTranscript(q);
                  handleSimulateListen(q);
                }}
                className="w-full text-left p-2.5 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-lg text-xs font-medium text-slate-700 hover:text-blue-700 transition-all flex items-center justify-between group"
              >
                <span className="truncate">{q}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-300 group-hover:text-blue-500 shrink-0 ml-2" />
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setVoiceModalOpen(false)}
              className="flex-1 py-2.5 border border-slate-300 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              disabled={!transcript}
              onClick={handleExecuteVoiceQuery}
              className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-md transition-all"
            >
              <span>Analyze Query</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
