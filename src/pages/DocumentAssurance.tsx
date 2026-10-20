import React, { useState } from 'react';
import { 
  FileCheck, 
  Upload, 
  ShieldCheck, 
  Clock, 
  AlertTriangle, 
  FileText, 
  Filter, 
  Search, 
  CheckCircle2, 
  X,
  ShieldAlert,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface AssuranceDoc {
  id: string;
  filename: string;
  type: string;
  size_kb: number;
  upload_date: string;
  category: 'GST' | 'PAN' | 'UDYAM' | 'Insurance' | 'DSC' | 'Invoice' | 'Agreement' | 'Bank' | 'Other';
  expiry_date?: string;
  completeness_pct: number;
  review_status: 'VERIFIED' | 'UNDER_REVIEW' | 'EXPIRY_DUE' | 'ADVANCED_ANALYSIS_PENDING';
  notes: string;
}

const INITIAL_DOCS: AssuranceDoc[] = [
  {
    id: 'DOC-01',
    filename: 'Udyam_Registration_Certificate_2026.pdf',
    type: 'application/pdf',
    size_kb: 420,
    upload_date: '2026-08-15',
    category: 'UDYAM',
    expiry_date: 'Perpetual',
    completeness_pct: 100,
    review_status: 'VERIFIED',
    notes: 'UDYAM-MH-12-0049281 verified active'
  },
  {
    id: 'DOC-02',
    filename: 'Factory_Fire_Commercial_Insurance_Policy.pdf',
    type: 'application/pdf',
    size_kb: 1250,
    upload_date: '2026-01-10',
    category: 'Insurance',
    expiry_date: '2026-10-15',
    completeness_pct: 100,
    review_status: 'EXPIRY_DUE',
    notes: 'Premium renewal due in 20 days'
  },
  {
    id: 'DOC-03',
    filename: 'Class_3_Digital_Signature_Certificate_Token.cer',
    type: 'application/x-x509-ca-cert',
    size_kb: 14,
    upload_date: '2025-11-20',
    category: 'DSC',
    expiry_date: '2026-11-20',
    completeness_pct: 100,
    review_status: 'VERIFIED',
    notes: 'Valid for ROC & GST e-filing'
  },
  {
    id: 'DOC-04',
    filename: 'Tata_Ancillary_Master_Supply_Agreement.pdf',
    type: 'application/pdf',
    size_kb: 890,
    upload_date: '2026-09-02',
    category: 'Agreement',
    expiry_date: '2027-09-01',
    completeness_pct: 95,
    review_status: 'VERIFIED',
    notes: 'Triage complete; Net 45 payment terms flagged'
  },
  {
    id: 'DOC-05',
    filename: 'Current_Account_Bank_Statement_Q2.xlsx',
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    size_kb: 512,
    upload_date: '2026-09-24',
    category: 'Bank',
    expiry_date: 'N/A',
    completeness_pct: 80,
    review_status: 'ADVANCED_ANALYSIS_PENDING',
    notes: 'Document received • Advanced OCR/bank reconciliation pending'
  }
];

export const DocumentAssurance: React.FC = () => {
  const { showToast, t } = useApp();
  const [docs, setDocs] = useState<AssuranceDoc[]>(INITIAL_DOCS);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['ALL', 'GST', 'PAN', 'UDYAM', 'Insurance', 'DSC', 'Invoice', 'Agreement', 'Bank', 'Other'];

  const filteredDocs = docs.filter(d => {
    const matchesCat = selectedCategory === 'ALL' || d.category === selectedCategory;
    const matchesSearch = d.filename.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          d.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    setIsUploading(true);

    setTimeout(() => {
      const newDoc: AssuranceDoc = {
        id: `DOC-0${docs.length + 1}`,
        filename: file.name,
        type: file.type || 'application/octet-stream',
        size_kb: Math.round(file.size / 1024),
        upload_date: new Date().toISOString().split('T')[0],
        category: 'Other',
        expiry_date: 'Under Review',
        completeness_pct: 85,
        review_status: 'ADVANCED_ANALYSIS_PENDING',
        notes: 'Document received • Advanced OCR analysis pending'
      };

      setDocs(prev => [newDoc, ...prev]);
      setIsUploading(false);
      showToast(`Document ${file.name} received into demo assurance vault.`);
    }, 600);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-amber-700">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>HONEST DOCUMENT ASSURANCE:</strong> UDYAM AI securely logs documents in your session vault. Deep OCR text extraction and automated digital signature validation require production OCR gateway.</span>
        </div>
        <span className="font-bold text-[10px] bg-amber-200/50 px-2 py-0.5 rounded uppercase">ASSURANCE ENGINE</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.doc_assurance')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Centralized compliance assurance vault for GST, PAN, Udyam, Insurance policies, and commercial agreements.
          </p>
        </div>

        {/* Upload Button */}
        <label className="inline-flex items-center space-x-2 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold transition-all shadow-xs cursor-pointer">
          <Upload className="w-4 h-4 text-emerald-400" />
          <span>Upload Statutory Document</span>
          <input type="file" onChange={handleFileUpload} className="hidden" />
        </label>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Documents</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">{docs.length} Files</div>
          <p className="text-[11px] text-slate-500 mt-1">Stored in active demo session</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Assurance Verified</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            {docs.filter(d => d.review_status === 'VERIFIED').length} Files
          </div>
          <p className="text-[11px] text-emerald-600 mt-1">Valid format & validity confirmed</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Renewals Due Soon</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">
            {docs.filter(d => d.review_status === 'EXPIRY_DUE').length} Action
          </div>
          <p className="text-[11px] text-amber-600 mt-1">Factory Insurance expiring in 20 days</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Analysis Pending</span>
          <div className="text-2xl font-extrabold text-purple-600 mt-1">
            {docs.filter(d => d.review_status === 'ADVANCED_ANALYSIS_PENDING').length} File
          </div>
          <p className="text-[11px] text-slate-500 mt-1">Advanced OCR / parsing pending</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search documents by name or notes..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                selectedCategory === cat 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Document Vault & Verification Ledger</h2>
          <span className="text-xs text-slate-400">{filteredDocs.length} Documents</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">Document File / ID</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Size / Date</th>
                <th className="px-4 py-3">Validity Expiry</th>
                <th className="px-4 py-3">Completeness</th>
                <th className="px-4 py-3">Review Status</th>
                <th className="px-4 py-3">Verification Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocs.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900 flex items-center space-x-1.5">
                      <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate max-w-xs">{doc.filename}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">{doc.id}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                      {doc.category}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    <div>{doc.size_kb} KB</div>
                    <div className="text-[10px] text-slate-400">{doc.upload_date}</div>
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700">
                    {doc.expiry_date || 'N/A'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                        <div 
                          className="bg-emerald-500 h-1.5 rounded-full" 
                          style={{ width: `${doc.completeness_pct}%` }} 
                        />
                      </div>
                      <span className="text-[11px] font-bold text-slate-700">{doc.completeness_pct}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      doc.review_status === 'VERIFIED'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : doc.review_status === 'EXPIRY_DUE'
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-purple-50 text-purple-700 border border-purple-200'
                    }`}>
                      {doc.review_status === 'ADVANCED_ANALYSIS_PENDING' ? 'OCR PENDING' : doc.review_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-slate-600 max-w-xs truncate">
                    {doc.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
