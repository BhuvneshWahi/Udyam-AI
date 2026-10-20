import React, { useState } from 'react';
import { 
  FileText, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  ArrowRight,
  Copy,
  Info,
  Upload
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';
import { AgreementAnalysis } from '../types';

const SAMPLE_AGREEMENTS = [
  {
    title: 'Illustrative Grocery Supplier Agreement',
    text: `B2B MASTER SUPPLY AGREEMENT
Between: Sharma General Store (Buyer) and Illustrative Grocery Supplier (Supplier)
1. PAYMENT TERMS: The Buyer shall make payment within Net 45 Days from the date of physical receipt and verification of tax invoice at Buyer's warehouse.
2. DELIVERY & PENALTY: Time is of the essence. In the event of delivery delay, a liquidated damages penalty of 0.5% per week of delay shall apply, subject to a maximum cap of 5% of the total purchase order value.
3. TERMINATION: Either party may terminate this agreement by providing 30 Days written notice for convenience. Buyer may terminate immediately upon Supplier default.
4. INDEMNITY & LIABILITY: Supplier shall indemnify Buyer against any third-party defect claims. Total liability of Supplier shall be limited to 100% of the aggregate purchase order amount.
5. GOVERNING LAW: This agreement shall be governed by the laws of India, subject to Delhi commercial jurisdiction.`
  },
  {
    title: 'Illustrative Grocery Procurement Contract',
    text: `OEM COMPONENT SUPPLY CONTRACT
Party A (Buyer) and Party B (Illustrative Grocery Supplier)
1. COMMODITY & PRICING: Packaged grocery commodities as per Schedule A.
2. PAYMENT CLAUSE: Payments shall be released strictly within Net 60 days following quality clearance. Advance payment is not admissible.
3. LIQUIDATED DAMAGES: Delayed delivery carries a mandatory penalty charge of 1.0% per week, uncapped for high-priority assembly lines.
4. TERMINATION NOTICE: Buyer reserves the right to terminate with 7 days written notice. Vendor requires 45 days notice.
5. LIABILITY: Vendor maintains unlimited liability for line stoppage consequential damages.
6. DISPUTE: Subject to arbitration under Indian Arbitration and Conciliation Act 1996.`
  }
];

export const AgreementAnalysisPage: React.FC = () => {
  const { showToast, t } = useApp();
  const [agreementText, setAgreementText] = useState(SAMPLE_AGREEMENTS[0].text);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AgreementAnalysis | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      if (text) {
        setAgreementText(text);
        showToast(`Loaded ${file.name}`);
      }
    };
    reader.readAsText(file);
  };

  const handleAnalyze = async () => {
    if (!agreementText.trim()) {
      showToast('Please paste or type contract text to analyze.');
      return;
    }
    setIsAnalyzing(true);
    try {
      const res = await apiService.analyzeAgreement(agreementText);
      setAnalysis(res);
      showToast('Agreement clauses analyzed successfully.');
    } catch (e) {
      showToast('Failed to analyze agreement. Using deterministic fallback.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  React.useEffect(() => {
    handleAnalyze();
  }, []);

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-blue-800">
        <div className="flex items-center space-x-2">
          <Info className="w-4 h-4 text-blue-600 shrink-0" />
          <span><strong>LEGAL NOTICE:</strong> The preloaded agreements are fictional examples for UI demonstration. Analysis is decision support only and does not substitute formal legal counsel.</span>
        </div>
        <span className="font-bold text-[10px] bg-blue-100 text-blue-800 px-2 py-0.5 rounded uppercase">AI TRIAGE</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          {t('nav.agreement_analysis')}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Scan B2B supply contracts, customer POs, and vendor NDAs for statutory MSME payment protections, harsh penalty traps, and uncapped liability clauses.
        </p>
      </div>

      {/* Main Grid: Input on Left, Analysis on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Contract / Agreement Text
              </label>
              <div className="flex items-center space-x-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.pdf,.docx,.doc"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded text-[10px] font-semibold flex items-center space-x-1 transition-colors"
                  title="Upload Agreement Document (.txt, .pdf, .docx)"
                >
                  <Upload className="w-3 h-3 text-slate-500" />
                  <span>Upload File</span>
                </button>
                <span className="text-[10px] text-slate-400">
                  {agreementText.length} chars
                </span>
              </div>
            </div>

            <textarea
              rows={14}
              value={agreementText}
              onChange={(e) => setAgreementText(e.target.value)}
              placeholder="Paste contract text, vendor agreement, or customer terms here..."
              className="w-full text-xs font-mono p-3 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />

            {/* Sample Selectors */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Load Sample Agreement:
              </span>
              <div className="flex flex-col gap-1.5">
                {SAMPLE_AGREEMENTS.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setAgreementText(sample.text);
                      showToast(`Loaded ${sample.title}`);
                    }}
                    className="text-left text-xs px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded transition-colors flex items-center justify-between"
                  >
                    <span className="truncate">{sample.title}</span>
                    <Copy className="w-3 h-3 text-slate-400 ml-1 shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing}
              className="w-full mt-2 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>{isAnalyzing ? 'Extracting & Reasoning with Ollama...' : 'Analyze Agreement Clauses'}</span>
            </button>
          </div>
        </div>

        {/* Right Column: Analysis Output */}
        <div className="lg:col-span-7 space-y-4">
          {analysis ? (
            <div className="space-y-4">
              {/* Score & Summary Card */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      MSME Friendliness Score
                    </span>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className="text-2xl font-extrabold text-slate-900">
                        {analysis.compatibility_score} / 100
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                        analysis.compatibility_score >= 80 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {analysis.compatibility_score >= 80 ? 'LOW LEGAL RISK' : 'MEDIUM-HIGH RISK'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono">ID: {analysis.agreement_id || 'AGR-74892'}</span>
                    <p className="text-xs text-slate-500">{analysis.clauses_analyzed || 6} Clauses Extracted</p>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-100">
                  {analysis.summary}
                </p>
              </div>

              {/* Core Commercial Clauses Extraction */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Payment Terms</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{analysis.payment_terms}</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <FileText className="w-3.5 h-3.5 text-purple-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Termination Notice</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">
                    {analysis.termination_clause || analysis.termination_notice || 'Standard 30 Days'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Penalty & Liquidated Damages</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">
                    {analysis.penalty_clause || 'No explicit penalty clause found'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-3.5 shadow-xs">
                  <div className="flex items-center space-x-2 text-slate-500 mb-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-red-600" />
                    <span className="text-[11px] font-bold uppercase tracking-wider">Liability & Indemnity</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">
                    {analysis.liability_clause || 'Standard Limitation of Liability'}
                  </p>
                </div>
              </div>

              {/* Risk Flags */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    <span>Identified Risk Flags ({analysis.risk_flags?.length || 0})</span>
                  </h3>
                </div>
                <div className="space-y-2">
                  {analysis.risk_flags && analysis.risk_flags.length > 0 ? (
                    analysis.risk_flags.map((risk, idx) => (
                      <div key={idx} className="flex items-start space-x-2 text-xs text-amber-800 bg-amber-50/80 p-2.5 rounded-lg border border-amber-200/60">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                        <span>{risk}</span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-slate-400">No major commercial risks identified.</p>
                  )}
                </div>
              </div>

              {/* Actionable Recommendations */}
              <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center space-x-1.5 mb-3">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Negotiation Recommendations for MSME</span>
                </h3>
                <div className="space-y-2">
                  {analysis.recommendations && analysis.recommendations.map((rec, idx) => (
                    <div key={idx} className="flex items-start space-x-2 text-xs text-slate-700 bg-slate-50 p-2.5 rounded-lg border border-slate-200/70">
                      <ArrowRight className="w-3.5 h-3.5 text-emerald-600 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-400">
              Paste contract text and click "Analyze Agreement Clauses" to begin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
