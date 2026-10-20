import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Mic, 
  Volume2, 
  Sparkles, 
  ArrowRight, 
  RefreshCw
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { CopilotResponse } from '../types';

export const VoiceAssistantPage: React.FC = () => {
  const { profile } = useApp();
  const [language, setLanguage] = useState<'Hinglish' | 'Hindi' | 'English'>('Hinglish');
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [voiceResult, setVoiceResult] = useState<CopilotResponse | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handleSimulateVoice = (queryText: string) => {
    setIsListening(true);
    setTranscript('');
    setVoiceResult(null);

    let currentIdx = 0;
    const interval = setInterval(() => {
      setTranscript(queryText.slice(0, currentIdx + 1));
      currentIdx++;
      if (currentIdx >= queryText.length) {
        clearInterval(interval);
        setTimeout(async () => {
          setIsListening(false);
          setIsProcessing(true);
          const res = await apiService.processVoiceInput(queryText, language);
          setVoiceResult(res.copilot_response);
          setIsProcessing(false);
        }, 400);
      }
    }, 25);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-4xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl p-4 sm:p-6 shadow-xl border border-slate-800 text-center space-y-3">
        <div className="inline-flex items-center space-x-2 bg-emerald-500/20 text-emerald-400 px-3 py-1 rounded-full text-xs font-bold border border-emerald-500/30">
          <Mic className="w-3.5 h-3.5" />
          <span>UDYAM MULTILINGUAL VOICE ENGINE</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-extrabold leading-snug">Speak to Udyam AI in Your Preferred Language</h2>
        <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
          Natural voice interface for MSME business owners. Ask about stock levels, profit margins, GST filings, or govt schemes.
        </p>

        {/* Language Selector */}
        <div className="flex items-center justify-center space-x-2 pt-2">
          {(['Hinglish', 'Hindi', 'English'] as const).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all ${
                language === lang
                  ? 'bg-emerald-500 text-slate-950 shadow-md'
                  : 'bg-white/10 hover:bg-white/20 text-white'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Mic Animation Container */}
      <div className="bg-white rounded-2xl p-5 sm:p-8 border border-slate-200 shadow-xs text-center space-y-5">
        <div className="flex justify-center">
          <button
            onClick={() => handleSimulateVoice("Agle mahine kaunse products ka stock badhana chahiye?")}
            className={`w-24 h-24 sm:w-28 sm:h-28 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isListening
                ? 'bg-red-500 text-white mic-pulse scale-105'
                : 'bg-gradient-to-tr from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-2xl shadow-blue-500/30 hover:scale-105'
            }`}
          >
            <Mic className="w-10 h-10 sm:w-12 sm:h-12" />
          </button>
        </div>

        <p className="text-xs font-bold text-slate-600">
          {isListening ? 'Listening to voice query...' : 'Tap Mic or Select Suggested Voice Query Below'}
        </p>

        {/* Speech Transcription Display Box */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 sm:p-4 min-h-[60px] flex items-center justify-center max-w-xl mx-auto">
          {transcript ? (
            <p className="text-xs sm:text-sm font-semibold text-slate-900 italic">
              "{transcript}"
            </p>
          ) : (
            <p className="text-xs text-slate-400">
              Live speech-to-text transcript will render here...
            </p>
          )}
        </div>

        {/* Sample Voice Queries */}
        <div className="pt-2">
          <span className="text-[10px] sm:text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">Try Speaking These Prompts:</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-2xl mx-auto">
            {[
              "Agle mahine kaunse products ka stock badhana chahiye?",
              "Mere sales kyu gir rahe hain?",
              "Meri next GST filing kab hai?",
              "Kaunse products sabse zyada profit de rahe hain?"
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSimulateVoice(q)}
                className="p-2.5 sm:p-3 bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-300 rounded-xl text-xs font-medium text-slate-800 hover:text-blue-700 text-left transition-all flex items-center justify-between group"
              >
                <span className="truncate">{q}</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-500 shrink-0 ml-2" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Processing State */}
      {isProcessing && (
        <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex items-center justify-center space-x-3 text-xs font-bold text-slate-700">
          <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>Analyzing speech audio & executing grounded query...</span>
        </div>
      )}

      {/* AI Voice Response Output Card */}
      {voiceResult && (
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-slate-200 shadow-md space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Volume2 className="w-5 h-5 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-sm">AI Voice Response</h3>
            </div>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded">Grounded Data</span>
          </div>

          <div className="p-3.5 sm:p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-slate-900 text-xs sm:text-sm leading-relaxed font-medium">
            <p dangerouslySetInnerHTML={{ __html: voiceResult.direct_answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
          </div>

          <button
            onClick={() => navigate(`/copilot?q=${encodeURIComponent(voiceResult.query)}`)}
            className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-xs transition-colors"
          >
            <span>Open Full AI Copilot Analysis Table</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
