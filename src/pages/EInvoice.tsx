import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileText, FileCheck, ShieldCheck } from 'lucide-react';
import { InvoiceGenerator } from './InvoiceGenerator';
import { ProformaInvoice } from './ProformaInvoice';
import { useApp } from '../context/AppContext';

export const EInvoice: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'tax-invoice';
  const { t } = useApp();

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-udyam-surface">
      {/* Consolidated E-Invoice Top Bar */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs px-4 sm:px-6 pt-4 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  E-Invoice Workspace
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  GST & E-Way Ready
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate GST-compliant B2B Tax Invoices, E-Way bills, and preliminary Proforma estimates
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>IRN Sandbox Mode Active</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-2 border-b border-slate-200 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('tax-invoice')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'tax-invoice'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>{t('tabs.tax_invoice')}</span>
            </button>

            <button
              onClick={() => handleTabChange('proforma')}
              className={`flex items-center space-x-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'proforma'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>{t('tabs.proforma')}</span>
            </button>
          </div>
        </div>
      </div>


      {/* Tab Content */}
      <div className="py-2">
        {activeTab === 'tax-invoice' ? (
          <InvoiceGenerator />
        ) : (
          <ProformaInvoice />
        )}
      </div>
    </div>
  );
};
