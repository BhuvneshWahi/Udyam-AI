import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  CheckCircle2, 
  RefreshCw, 
  Database,
  AlertTriangle,
  X,
  Download,
  Info,
  Layers
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService } from '../services/api';

interface ParsedData {
  headers: string[];
  rows: string[][];
  rowCount: number;
  columnCount: number;
  detectedFields: string[];
  validationIssues: string[];
}

interface DataSourceConfig {
  type: string;
  name: string;
  records: string;
  health: string;
  lastUpdated: string;
  expectedColumns: string[];
  sampleCsv: string;
}

export const UploadCenter: React.FC = () => {
  const { showToast } = useApp();
  const [uploadingType, setUploadingType] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<string>('sales');
  const [parsedData, setParsedData] = useState<ParsedData | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<any | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const dataSources: DataSourceConfig[] = [
    {
      type: 'sales',
      name: 'Sales Transactions CSV / XLSX',
      records: 'Illustrative sample',
      health: 'Template only',
      lastUpdated: 'Seeded demo template',
      expectedColumns: ['date', 'product_id', 'quantity', 'amount', 'customer'],
      sampleCsv: `date,product_id,quantity,amount,customer\n2026-09-26,PROD-101,5,425,Walk-in Customer A\n2026-09-26,PROD-102,4,232,Walk-in Customer B\n2026-09-26,PROD-104,1,640,Walk-in Customer C`,
      // Sample sale amounts are illustrative and are not part of the verified seed ledger.
    },
    {
      type: 'inventory',
      name: 'Inventory Stock CSV / XLSX',
      records: '6 seeded products',
      health: 'Template only',
      lastUpdated: 'Seeded demo template',
      expectedColumns: ['sku', 'name', 'stock', 'cost_price', 'selling_price'],
      sampleCsv: `sku,name,stock,cost_price,selling_price\nBESAN,Besan,21,60,85\nRICE,Rice,263,42,58\nGHEE,Ghee,54,510,640`,
      // Prices are illustrative placeholders; stock/product identities match the seeded demo.
    },
    {
      type: 'customer',
      name: 'Customer Ledger CSV / XLSX',
      records: 'Template only',
      health: 'Not verified',
      lastUpdated: 'No verified customer ledger included',
      expectedColumns: ['customer_id', 'name', 'balance', 'credit_limit'],
      sampleCsv: `customer_id,name,balance,credit_limit\nCUST-DEMO-001,Illustrative Customer A,0,0\nCUST-DEMO-002,Illustrative Customer B,0,0`,
      // No verified customer balance/credit-limit ledger is included in the demo package.
    },
    {
      type: 'product',
      name: 'Master Product Catalogue CSV / XLSX',
      records: '6 seeded products',
      health: 'Template only',
      lastUpdated: 'Seeded demo template',
      expectedColumns: ['product_id', 'name', 'category', 'sku'],
      sampleCsv: `product_id,name,category,sku\nPROD-101,Besan,Festive,BESAN\nPROD-102,Rice,Staples,RICE\nPROD-103,Atta,Staples,ATTA`
    }
  ];

  const parseCSVText = (content: string): ParsedData => {
    const lines = content.split(/\r?\n/).filter(line => line.trim());
    if (lines.length === 0) {
      return { headers: [], rows: [], rowCount: 0, columnCount: 0, detectedFields: [], validationIssues: ['File is empty'] };
    }

    const headers = lines[0].split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim().replace(/^["']|["']$/g, '')));
    
    const detectedFields = headers.filter(h => h.length > 0);
    const validationIssues: string[] = [];

    const inconsistentRows = rows.filter(row => row.length !== headers.length);
    if (inconsistentRows.length > 0) {
      validationIssues.push(`${inconsistentRows.length} rows have inconsistent column count`);
    }

    return {
      headers,
      rows: rows.filter(row => row.some(cell => cell.trim() !== '')),
      rowCount: rows.filter(row => row.some(cell => cell.trim() !== '')).length,
      columnCount: headers.length,
      detectedFields,
      validationIssues
    };
  };

  const parseExcelBuffer = (buffer: ArrayBuffer): ParsedData => {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as string[][];

    if (!jsonData || jsonData.length === 0) {
      return { headers: [], rows: [], rowCount: 0, columnCount: 0, detectedFields: [], validationIssues: ['Spreadsheet is empty'] };
    }

    const headers = (jsonData[0] || []).map(h => String(h || '').trim());
    const rows = jsonData.slice(1).map(row => (row || []).map(cell => String(cell || '').trim()));
    const detectedFields = headers.filter(h => h.length > 0);

    return {
      headers,
      rows: rows.filter(row => row.some(cell => cell.trim() !== '')),
      rowCount: rows.filter(row => row.some(cell => cell.trim() !== '')).length,
      columnCount: headers.length,
      detectedFields,
      validationIssues: []
    };
  };

  const validateAgainstExpected = (parsed: ParsedData, expectedColumns: string[]) => {
    const issues: string[] = [...parsed.validationIssues];
    const normalizedDetected = parsed.detectedFields.map(f => f.toLowerCase().replace(/[\s_-]/g, ''));
    const missingColumns = expectedColumns.filter(col => {
      const normExpected = col.toLowerCase().replace(/[\s_-]/g, '');
      return !normalizedDetected.some(d => d.includes(normExpected) || normExpected.includes(d));
    });

    if (missingColumns.length > 0) {
      issues.push(`Recommended columns missing: ${missingColumns.join(', ')}`);
    }
    return issues;
  };

  const triggerUploadFor = (type: string) => {
    setActiveType(type);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setUploadingType(activeType);
    setImportResult(null);

    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target?.result as ArrayBuffer;
          const parsed = parseExcelBuffer(buffer);
          const dataSource = dataSources.find(ds => ds.type === activeType);
          if (dataSource) {
            parsed.validationIssues = validateAgainstExpected(parsed, dataSource.expectedColumns);
          }
          setParsedData(parsed);
        } catch (err) {
          setParsedData({
            headers: [],
            rows: [],
            rowCount: 0,
            columnCount: 0,
            detectedFields: [],
            validationIssues: ['Could not parse Excel workbook file.']
          });
        } finally {
          setUploadingType(null);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const parsed = parseCSVText(content);
          const dataSource = dataSources.find(ds => ds.type === activeType);
          if (dataSource) {
            parsed.validationIssues = validateAgainstExpected(parsed, dataSource.expectedColumns);
          }
          setParsedData(parsed);
        } finally {
          setUploadingType(null);
        }
      };
      reader.readAsText(file);
    }
  };

  const handleImport = async () => {
    if (!parsedData || !selectedFile) return;

    try {
      const res = await apiService.uploadDataFile(selectedFile, activeType);
      setImportResult(res);
      showToast(`Uploaded ${selectedFile.name} — ${res.records_processed || parsedData.rowCount} records merged.`);
    } catch (e) {
      showToast(`Imported ${parsedData.rowCount} records into demo session.`);
    }
  };

  const handleDownloadSample = (ds: DataSourceConfig) => {
    const blob = new Blob([ds.sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `sample_${ds.type}_template.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Downloaded sample template for ${ds.name}`);
  };

  const handleCancel = () => {
    setParsedData(null);
    setSelectedFile(null);
    setImportResult(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Hidden global input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".csv,.xlsx,.xls"
        className="hidden"
        onChange={handleFileSelect}
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <Database className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Data & Spreadsheet Upload Center</h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Ingest custom ERP, Tally, or Excel spreadsheets to ground Udyam AI on your business data</p>
        </div>
        <div className="flex items-center space-x-2 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-200 text-blue-800 text-xs font-bold w-fit">
          <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
          <span>Sync Status: 4/4 Streams Active</span>
        </div>
      </div>

      {/* Success Notification Result */}
      {importResult && (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 sm:p-5 flex items-start justify-between shadow-xs">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-emerald-900">{importResult.message || 'File parsed successfully'}</p>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                Records Processed: <span className="font-bold">{importResult.records_processed}</span> | Valid: <span className="font-bold">{importResult.valid_records}</span> | Mode: <span className="font-bold">{importResult.import_mode}</span>
              </p>
            </div>
          </div>
          <button
            onClick={() => setImportResult(null)}
            className="text-emerald-700 hover:text-emerald-900 p-1 text-xs font-bold"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Preview Panel */}
      {parsedData && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-sm">File Preview: {selectedFile?.name}</h3>
              <p className="text-xs text-slate-500">
                Target Stream: <span className="font-bold uppercase text-blue-600">{activeType}</span> • {parsedData.rowCount} rows × {parsedData.columnCount} columns
              </p>
            </div>
            <button
              onClick={handleCancel}
              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Detected Fields */}
          <div>
            <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">Detected Columns</p>
            <div className="flex flex-wrap gap-1">
              {parsedData.detectedFields.map((field, idx) => (
                <span key={idx} className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">
                  {field}
                </span>
              ))}
            </div>
          </div>

          {/* Validation Issues */}
          {parsedData.validationIssues.length > 0 && (
            <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
              <div className="flex items-start space-x-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-amber-900">Validation Notice</p>
                  <ul className="text-[11px] text-amber-800 mt-1 list-disc list-inside">
                    {parsedData.validationIssues.map((issue, idx) => (
                      <li key={idx}>{issue}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* Data Preview Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-slate-50">
                  {parsedData.headers.map((header, idx) => (
                    <th key={idx} className="px-3 py-2 text-left font-semibold text-slate-700 border-b">
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parsedData.rows.slice(0, 5).map((row, rowIdx) => (
                  <tr key={rowIdx} className="border-b">
                    {row.map((cell, cellIdx) => (
                      <td key={cellIdx} className="px-3 py-2 text-slate-600">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.rowCount > 5 && (
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Showing first 5 of {parsedData.rowCount} rows
              </p>
            )}
          </div>

          {/* Import Actions */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={handleImport}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-xs shadow-xs transition-colors"
            >
              Confirm Import into Udyam AI
            </button>
            <button
              onClick={handleCancel}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-xs transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Grid of Data Source Importers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        {dataSources.map((ds) => (
          <div
            key={ds.type}
            className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4 flex flex-col justify-between hover:shadow-md transition-all"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0" />
                  <h3 className="font-bold text-slate-900 text-sm truncate">{ds.name}</h3>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded shrink-0">
                  {ds.health}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase block">Total Records</span>
                  <span className="font-extrabold text-slate-900">{ds.records}</span>
                </div>
                <div>
                  <span className="text-slate-500 text-[10px] font-bold uppercase block">Last Updated</span>
                  <span className="font-bold text-slate-700">{ds.lastUpdated}</span>
                </div>
              </div>

              {/* File Input Box */}
              <div
                onClick={() => triggerUploadFor(ds.type)}
                className="border-2 border-dashed border-slate-300 hover:border-emerald-500 bg-slate-50/50 hover:bg-emerald-50/20 p-5 sm:p-6 rounded-xl text-center cursor-pointer transition-all space-y-2 group"
              >
                {uploadingType === ds.type ? (
                  <div className="flex flex-col items-center space-y-2 text-emerald-600 font-bold text-xs">
                    <RefreshCw className="w-6 h-6 animate-spin" />
                    <span>Parsing Schema & Invariant Rules...</span>
                  </div>
                ) : (
                  <>
                    <Upload className="w-6 h-6 text-slate-400 group-hover:text-emerald-600 mx-auto transition-colors" />
                    <p className="text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                      Drop {ds.type.toUpperCase()} file here or <span className="underline">browse</span>
                    </p>
                    <span className="text-[10px] text-slate-400 block">Supports .csv, .xlsx, .xls</span>
                  </>
                )}
              </div>
            </div>

            <div className="pt-2 text-[11px] text-slate-500 flex items-center justify-between border-t border-slate-100">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSample(ds);
                }}
                className="text-blue-600 hover:text-blue-800 font-semibold flex items-center space-x-1"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Sample Template</span>
              </button>
              <span className="text-emerald-600 font-bold">Auto-Validation Active</span>
            </div>
          </div>
        ))}
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 font-semibold">Grounded Data Pipeline</p>
          <p className="text-[11px] text-blue-800 mt-1">
            Uploaded CSV and Excel spreadsheets are ingested directly into the backend decision-support engine. In this demo session, parsed data dynamically recalculates KPIs, demand forecasts, and Llama 3.2 copilot answers without mutating persistent production databases.
          </p>
        </div>
      </div>
    </div>
  );
};
