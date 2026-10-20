import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  FileSpreadsheet, 
  ShoppingCart, 
  ClipboardList, 
  FileCheck,
  ShieldCheck
} from 'lucide-react';
import { Reconciliation } from './Reconciliation';
import { PurchaseOrders } from './PurchaseOrders';
import { PurchaseRequisitions } from './PurchaseRequisitions';
import { ProformaInvoice } from './ProformaInvoice';
import { useApp } from '../context/AppContext';

export const ProcurementReconciliation: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'reconciliation';
  const { t } = useApp();

  const handleTabChange = (tab: string) => {
    setSearchParams({ tab });
  };

  return (
    <div className="min-h-screen bg-udyam-surface">
      {/* Sticky Tab Header */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-xs px-4 sm:px-6 pt-4 pb-0">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3">
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Reconciliation & Procurement Workspace
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  3-Way Match & PO Engine
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Reconcile purchase invoices against E-Way bills & GSTR-2B, generate POs, and manage purchase indents
              </p>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Automated 3-Way Match Active</span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto custom-scrollbar">
            <button
              onClick={() => handleTabChange('reconciliation')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'reconciliation'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>{t('tabs.reconciliation')}</span>
            </button>

            <button
              onClick={() => handleTabChange('purchase-orders')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'purchase-orders'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span>{t('tabs.purchase_orders')}</span>
            </button>

            <button
              onClick={() => handleTabChange('purchase-requisitions')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
                activeTab === 'purchase-requisitions'
                  ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-lg'
                  : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50 rounded-t-lg'
              }`}
            >
              <ClipboardList className="w-4 h-4" />
              <span>{t('tabs.purchase_reqs')}</span>
            </button>

            <button
              onClick={() => handleTabChange('proforma')}
              className={`flex items-center space-x-2 px-3.5 py-2.5 text-xs font-bold border-b-2 transition-all shrink-0 ${
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

      {/* Tab Viewport */}
      <div>
        {activeTab === 'reconciliation' && <Reconciliation />}
        {activeTab === 'purchase-orders' && <PurchaseOrders />}
        {activeTab === 'purchase-requisitions' && <PurchaseRequisitions />}
        {activeTab === 'proforma' && <ProformaInvoice />}
      </div>
    </div>
  );
};
