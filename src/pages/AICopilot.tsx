import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff,
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  TrendingUp, 
  Package, 
  ShieldCheck, 
  RefreshCw, 
  ChevronRight, 
  RotateCcw,
  Paperclip, 
  Camera, 
  FileText,
  MessageSquare,
  BarChart2,
  Table,
  HelpCircle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { ChatMessage, CopilotResponse } from '../types';

const CURATED_PROMPTS = [
  "Analyze my business",
  "What should I reorder?",
  "Why are sales falling?",
  "Where am I losing profit?",
  "Which payments need attention?",
  "What should I do today?",
  "Which products are performing best?",
  "Are there any important risks?"
];

export const AICopilot: React.FC = () => {
  const { 
    chatHistory, 
    addChatMessage, 
    resetCopilotSession, 
    profile, 
    kpis, 
    setVoiceModalOpen, 
    showToast,
    t 
  } = useApp();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [mobileTab, setMobileTab] = useState<'chat' | 'prompts' | 'context'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const initialQuery = searchParams.get('q');
  const consumedQueryRef = useRef<string | null>(null);

  useEffect(() => {
    if (initialQuery && consumedQueryRef.current !== initialQuery) {
      consumedQueryRef.current = initialQuery;
      void handleSend(initialQuery);
      // Consume the route query after sending it. This prevents a stale `?q=`
      // from being re-submitted when the page is refreshed or revisited.
      const nextParams = new URLSearchParams(searchParams);
      nextParams.delete('q');
      setSearchParams(nextParams, { replace: true });
    }
  }, [initialQuery]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isLoading]);

  // Web Speech API Voice Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      try {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-IN'; // Default to Indian English, handles Hinglish

        recognition.onstart = () => {
          setIsRecording(true);
          showToast("Listening... Speak your business question.");
        };

        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setInputText(transcript);
            handleSend(transcript);
          }
        };

        recognition.onerror = () => {
          setIsRecording(false);
          setVoiceModalOpen(true); // Fallback to voice modal
        };

        recognition.onend = () => {
          setIsRecording(false);
        };

        recognitionRef.current = recognition;
      } catch (err) {
        console.warn("Speech recognition initialization fallback");
      }
    }
  }, []);

  const toggleRecording = () => {
    if (recognitionRef.current) {
      if (isRecording) {
        recognitionRef.current.stop();
        setIsRecording(false);
      } else {
        try {
          recognitionRef.current.start();
        } catch (e) {
          setVoiceModalOpen(true);
        }
      }
    } else {
      setVoiceModalOpen(true);
    }
  };

  const handleSend = async (queryToSubmit?: string) => {
    const q = queryToSubmit || inputText;
    if (!q.trim() || isLoading) return;

    setInputText('');
    setMobileTab('chat');
    
    // Add user message
    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: q
    };
    addChatMessage(userMsg);
    setIsLoading(true);

    try {
      const response: CopilotResponse = await apiService.sendCopilotQuery(q);
      const assistantMsg: ChatMessage = {
        id: `asst-${Date.now()}`,
        sender: 'assistant',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        response
      };
      addChatMessage(assistantMsg);
    } catch (e) {
      console.error(e);
      showToast("Unable to reach Ollama AI engine. Check connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleActionClick = (actionType: string, target: string) => {
    if (actionType === 'NAVIGATE') {
      navigate(target);
    } else if (actionType === 'CREATE_PO') {
      showToast("Demo only: review the procurement suggestion in Forecast. No purchase order was created and stock was not changed.");
      navigate('/forecast');
    } else if (actionType === 'CREATE_PROMO') {
      showToast("Demo only: promotion execution is not connected, so no price or discount was changed.");
      navigate('/inventory');
    } else if (actionType === 'QUERY_COPILOT') {
      handleSend(target);
    } else {
      showToast(`Executed action: ${actionType} on ${target}`);
    }
  };

  const handleAttachFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    showToast(`Attached document: ${file.name}`);
    handleSend(`[DOCUMENT ATTACHMENT: ${file.name}] Analyze key terms, liabilities, payment clauses, and potential risks in this MSME document.`);
    if (attachmentInputRef.current) {
      attachmentInputRef.current.value = '';
    }
  };

  const handleSimulateCamera = () => {
    showToast("Captured document invoice_scan_01.jpg via camera");
    handleSend("[CAMERA SCAN: invoice_scan_01.jpg] Validate vendor GSTIN, invoice date, line item subtotal, and tax compliance.");
  };

  const isOnlySeedMessage = chatHistory.length <= 1;

  return (
    <div className="h-[calc(100vh-4rem)] flex flex-col xl:flex-row overflow-hidden bg-slate-100">
      {/* Mobile / Tablet Responsive Tab Switcher Header (<1280px) */}
      <div className="xl:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-1 w-full bg-slate-100 p-1 rounded-xl">
          <button
            onClick={() => setMobileTab('chat')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
              mobileTab === 'chat' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Chat</span>
          </button>
          <button
            onClick={() => setMobileTab('prompts')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
              mobileTab === 'prompts' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Prompts</span>
          </button>
          <button
            onClick={() => setMobileTab('context')}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg flex items-center justify-center space-x-1 transition-all ${
              mobileTab === 'context' ? 'bg-white text-emerald-700 shadow-xs' : 'text-slate-600'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5" />
            <span>Context</span>
          </button>
        </div>
      </div>

      {/* Left Sidebar: Curated Prompts & Session Control */}
      <div className={`${mobileTab === 'prompts' ? 'flex' : 'hidden'} xl:flex w-full xl:w-72 bg-white border-r border-slate-200 flex-col shrink-0 overflow-y-auto custom-scrollbar`}>
        <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="font-bold text-slate-800 text-xs sm:text-sm">UDYAM AI Copilot</h3>
              <p className="text-[10px] text-slate-500">Llama 3.2 3B Grounded</p>
            </div>
          </div>
          <button
            onClick={resetCopilotSession}
            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors flex items-center space-x-1"
            title="Reset Copilot Session"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="text-[11px] font-bold">Reset</span>
          </button>
        </div>

        {/* 8 Curated Grounded Prompts */}
        <div className="p-3 space-y-2 flex-1">
          <div className="flex items-center justify-between px-2 pt-1 pb-0.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Grounded Prompts</span>
            <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">8 Curated</span>
          </div>

          {CURATED_PROMPTS.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(prompt)}
              className="w-full text-left p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50/70 hover:bg-emerald-50/60 text-xs font-semibold text-slate-700 hover:text-emerald-800 transition-all flex items-start space-x-2 group"
            >
              <Sparkles className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
              <span className="leading-snug">{prompt}</span>
            </button>
          ))}
        </div>

        {/* AI Assurance Info Box */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-slate-600 text-xs">
          <div className="flex items-center space-x-1.5 text-slate-800 font-bold mb-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Deterministic Grounding</span>
          </div>
          <p className="text-[11px] text-slate-500 leading-tight">
            Queries synthesize ERP ledger, warehouse stockouts, GST filings, and festive intelligence.
          </p>
        </div>
      </div>

      {/* Center: Main Chat Feed */}
      <div className={`${mobileTab === 'chat' ? 'flex' : 'hidden'} xl:flex flex-1 flex-col h-full bg-slate-50 overflow-hidden min-w-0`}>
        {/* Chat Thread */}
        <div className="flex-1 overflow-y-auto p-3 sm:p-6 space-y-4 sm:space-y-6 custom-scrollbar">
          {/* Clean Empty State View when Session is Fresh */}
          {isOnlySeedMessage && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center max-w-2xl mx-auto my-4 animate-in fade-in duration-200">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Bot className="w-6 h-6" />
              </div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Ask UDYAM AI anything about your business.
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Powered by local Llama 3.2 with strict deterministic grounding against inventory, cash flow, customer payments, and statutory deadlines.
              </p>

              {/* Quick Prompt Pills in Empty State */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-5 text-left">
                {CURATED_PROMPTS.slice(0, 6).map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt)}
                    className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-400 bg-slate-50 hover:bg-emerald-50 text-xs font-semibold text-slate-700 hover:text-emerald-800 flex items-center justify-between transition-all"
                  >
                    <span>{prompt}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 ml-1" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Chat Messages */}
          {chatHistory.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'user' ? (
                <div className="bg-slate-900 text-white rounded-2xl rounded-tr-none px-3.5 py-2.5 sm:px-4 sm:py-3 max-w-[85%] sm:max-w-xl shadow-xs text-xs sm:text-sm">
                  <p className="font-medium leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] text-slate-400 block text-right mt-1">{msg.timestamp}</span>
                </div>
              ) : (
                <div className="max-w-3xl w-full bg-white border border-slate-200 rounded-2xl rounded-tl-none shadow-xs overflow-hidden">
                  {/* Assistant Header */}
                  <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white px-3.5 py-2 sm:px-4 sm:py-2.5 flex items-center justify-between flex-wrap gap-1">
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-emerald-500 flex items-center justify-center text-slate-950 font-black text-[10px] sm:text-xs shrink-0">
                        U
                      </div>
                      <span className="font-bold text-xs text-white">UDYAM AI Copilot</span>
                      {msg.response && (
                        <span className="bg-emerald-500/20 text-emerald-300 text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-0.5 rounded border border-emerald-500/30">
                          {msg.response.confidence_score}% Grounding Match
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400">{msg.timestamp}</span>
                  </div>

                  <div className="p-3.5 sm:p-5 space-y-3.5 sm:space-y-4 text-xs sm:text-sm text-slate-800">
                    {/* Text Answer */}
                    {msg.text && (
                      <div className="whitespace-pre-line leading-relaxed font-normal text-slate-700">
                        {msg.text}
                      </div>
                    )}

                    {/* Structured Copilot Response */}
                    {msg.response && (
                      <>
                        {/* Direct Answer */}
                        <div className="p-3 sm:p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl text-slate-900 leading-relaxed font-medium">
                          <p dangerouslySetInnerHTML={{ __html: msg.response.direct_answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}></p>
                        </div>

                        {/* Metric Summary Widgets */}
                        {msg.response.metrics_summary && msg.response.metrics_summary.length > 0 && (
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                            {msg.response.metrics_summary.map((m, i) => (
                              <div key={i} className="bg-slate-50 border border-slate-200 p-2 sm:p-2.5 rounded-lg text-center">
                                <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider block">{m.label}</span>
                                <span className="text-xs sm:text-sm font-extrabold text-slate-900">{m.value}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Grounded Data Table */}
                        {msg.response.structured_table && (
                          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                            <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 font-bold text-xs text-slate-700 flex items-center space-x-1.5">
                              <Table className="w-3.5 h-3.5" />
                              <span>Dataset Evidence:</span>
                            </div>
                            <div className="overflow-x-auto">
                              <table className="w-full text-left text-xs min-w-[450px]">
                                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                                  <tr>
                                    {msg.response.structured_table.headers.map((h, i) => (
                                      <th key={i} className="px-3 py-2 whitespace-nowrap">{h}</th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 font-medium">
                                  {msg.response.structured_table.rows.map((row, rIdx) => (
                                    <tr key={rIdx} className="hover:bg-slate-50">
                                      {Object.values(row).map((val: any, cIdx) => (
                                        <td key={cIdx} className="px-3 py-2 whitespace-nowrap">{String(val)}</td>
                                      ))}
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        )}

                        {/* Why / Strategic Rationale */}
                        {msg.response.why_recommendation && msg.response.why_recommendation.length > 0 && (
                          <div className="bg-slate-50 p-3 sm:p-4 rounded-xl border border-slate-200 space-y-1.5">
                            <span className="text-[10px] sm:text-xs font-bold text-slate-700 uppercase tracking-wider block">
                              Reasoning & Rationale:
                            </span>
                            <ul className="space-y-1 text-slate-600 text-xs">
                              {msg.response.why_recommendation.map((why, idx) => (
                                <li key={idx} className="flex items-start space-x-2">
                                  <span className="text-emerald-600 font-bold">•</span>
                                  <span>{why}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Direct Action Buttons */}
                        {msg.response.actions && msg.response.actions.length > 0 && (
                          <div className="pt-2 flex flex-wrap gap-2">
                            {msg.response.actions.map((act, idx) => (
                              <button
                                key={idx}
                                onClick={() => handleActionClick(act.action, act.target)}
                                className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-colors shadow-xs"
                              >
                                <span>{act.label}</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            ))}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none p-4 shadow-xs flex items-center space-x-3">
                <RefreshCw className="w-4 h-4 text-emerald-600 animate-spin" />
                <span className="text-xs font-semibold text-slate-600">
                  UDYAM AI is querying business databases & reasoning...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar with Embedded Voice and Attachment */}
        <div className="p-3 sm:p-4 bg-white border-t border-slate-200 shrink-0">
          <input
            type="file"
            ref={attachmentInputRef}
            onChange={handleAttachFile}
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.docx"
          />

          {isRecording && (
            <div className="max-w-4xl mx-auto mb-2 px-3 py-1.5 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between text-xs text-red-700 animate-pulse">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-red-600 animate-ping"></span>
                <span className="font-bold">Listening... Speak now</span>
              </div>
              <button
                onClick={toggleRecording}
                className="text-[11px] font-bold text-red-900 hover:underline"
              >
                Stop
              </button>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center space-x-2 max-w-4xl mx-auto"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask UDYAM AI about stockouts, cash flow, profit margins, GST, agreements..."
              className="flex-1 px-3 py-2.5 sm:px-4 sm:py-3 text-xs sm:text-sm bg-slate-100 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-slate-800 placeholder-slate-400 min-w-0"
            />

            {/* Document Attachment Button */}
            <button
              type="button"
              onClick={() => attachmentInputRef.current?.click()}
              className="p-2.5 sm:p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
              title="Attach Document / Agreement / Invoice"
            >
              <Paperclip className="w-4 h-4 text-slate-600" />
            </button>

            {/* Camera Scan Simulation Button */}
            <button
              type="button"
              onClick={handleSimulateCamera}
              className="p-2.5 sm:p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors shrink-0"
              title="Scan Document via Camera"
            >
              <Camera className="w-4 h-4 text-slate-600" />
            </button>

            {/* Voice Mic Toggle Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2.5 sm:p-3 rounded-xl transition-colors shrink-0 ${
                isRecording 
                  ? 'bg-red-500 text-white shadow-md animate-pulse' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
              title={isRecording ? "Stop Recording" : "Voice Input (Speech-to-Text)"}
            >
              {isRecording ? <MicOff className="w-4 h-4 text-white" /> : <Mic className="w-4 h-4 text-blue-600" />}
            </button>

            {/* Send Button */}
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white px-3.5 py-2.5 sm:px-5 sm:py-3 rounded-xl text-xs font-bold flex items-center space-x-1.5 shadow-md transition-all shrink-0"
            >
              <span className="hidden sm:inline">Ask</span>
              <Send className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Right Sidebar: Live Business Context Panel */}
      <div className={`${mobileTab === 'context' ? 'flex' : 'hidden'} xl:flex w-full xl:w-72 bg-white border-l border-slate-200 p-4 shrink-0 flex-col space-y-4 overflow-y-auto custom-scrollbar`}>
        <div className="pb-3 border-b border-slate-200">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">Live Context</span>
          <h4 className="font-bold text-slate-900 text-sm mt-0.5">{profile.name}</h4>
          <p className="text-[11px] text-slate-500">{profile.sector} • {profile.city}</p>
        </div>

        {/* Live Metrics */}
        <div className="space-y-2 text-xs">
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Monthly Rev:</span>
            <span className="font-bold text-slate-900">₹ {(kpis.monthly_revenue/100000).toFixed(2)}L</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Profit Margin:</span>
            <span className="font-bold text-emerald-600">{kpis.profit_margin}%</span>
          </div>
          <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 flex justify-between items-center">
            <span className="text-slate-600 font-medium">Low Stock SKUs:</span>
            <span className="font-bold text-red-600">{kpis.low_stock_items} Items</span>
          </div>
        </div>

        {/* Critical SKU Preview */}
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-1.5">
          <span className="text-[10px] font-bold text-red-800 uppercase tracking-wider">Top Stockout Risk</span>
          <p className="font-bold text-xs text-red-950 truncate">Besan</p>
          <p className="text-[11px] text-red-700">Stock: 21 kg | Adjusted Demand: ~255.8 kg</p>
          <button 
            onClick={() => handleSend("What should I reorder?")}
            className="w-full mt-1 text-[11px] font-bold bg-red-600 text-white py-1.5 rounded-lg text-center block hover:bg-red-700 transition-colors shadow-xs"
          >
            Review Procurement Plan
          </button>
        </div>
      </div>
    </div>
  );
};
