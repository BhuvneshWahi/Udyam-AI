import React, { useState } from 'react';
import { 
  CreditCard, 
  AlertTriangle, 
  Clock, 
  TrendingDown, 
  Send, 
  CheckCircle2, 
  Building2, 
  Search,
  Filter,
  ShieldAlert,
  ArrowUpRight
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface CustomerLedgerItem {
  id: string;
  name: string;
  gstin: string;
  total_billed: number;
  outstanding: number;
  due_date: string;
  overdue_days: number;
  risk_level: 'High' | 'Medium' | 'Low';
  status: 'OVERDUE' | 'DUE_SOON' | 'CURRENT';
  contact: string;
  payment_terms: string;
}

const INITIAL_CUSTOMERS: CustomerLedgerItem[] = [];

export const CustomerPayments: React.FC = () => {
  const { showToast, t } = useApp();
  const [customers, setCustomers] = useState<CustomerLedgerItem[]>(INITIAL_CUSTOMERS);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLedgerItem | null>(null);

  const totalReceivables = customers.reduce((sum, c) => sum + c.outstanding, 0);
  const overdueTotal = customers.filter(c => c.status === 'OVERDUE').reduce((sum, c) => sum + c.outstanding, 0);
  const highRiskCount = customers.filter(c => c.risk_level === 'High').length;

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          c.gstin.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'ALL' || c.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleSendReminder = (customer: CustomerLedgerItem) => {
    showToast(`Payment reminder dispatch simulated for ${customer.name} (₹ ${(customer.outstanding).toLocaleString('en-IN')})`);
  };

  const handleMarkPaid = (id: string) => {
    setCustomers(prev => prev.map(c => c.id === id ? { ...c, outstanding: 0, status: 'CURRENT', risk_level: 'Low' } : c));
    showToast('Customer payment marked as settled in demo session.');
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* Disclaimer Banner */}
      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 sm:p-4 flex items-center justify-between text-xs text-amber-700">
        <div className="flex items-center space-x-2">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span><strong>REPRESENTATIVE DEMO LEDGER:</strong> Live bank statement reconciliation and automated WhatsApp payment nudges require production banking API / WhatsApp Business API integration.</span>
        </div>
        <span className="font-bold uppercase tracking-wider text-[10px] bg-amber-200/50 px-2 py-0.5 rounded">DEMO MODE</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {t('nav.customer_payments')}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor accounts receivable, aging buckets, overdue collections, and customer credit concentration.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Receivables</span>
            <CreditCard className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">₹ {(totalReceivables / 100000).toFixed(2)} Lakh</div>
          <p className="text-[11px] text-slate-500 mt-1">Across {customers.length} active business counterparties</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Overdue Amount</span>
            <AlertTriangle className="w-4 h-4 text-red-600" />
          </div>
          <div className="text-2xl font-extrabold text-red-600">₹ {(overdueTotal / 100000).toFixed(2)} Lakh</div>
          <p className="text-[11px] text-red-600 font-medium mt-1">Requires immediate follow-up escalation</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">Days Sales Outstanding (DSO)</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">43.2 Days</div>
          <p className="text-[11px] text-amber-600 font-medium mt-1">13.2 days higher than Net 30 benchmark</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-semibold uppercase tracking-wider">High Risk Debtors</span>
            <TrendingDown className="w-4 h-4 text-purple-600" />
          </div>
          <div className="text-2xl font-extrabold text-purple-700">{highRiskCount} Clients</div>
          <p className="text-[11px] text-slate-500 mt-1">Accounts with &gt; 10 days payment delay</p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name or GSTIN..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-xs text-slate-500 font-medium">Filter:</span>
          {(['ALL', 'OVERDUE', 'DUE_SOON', 'CURRENT'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 text-xs rounded-lg font-semibold transition-colors ${
                filterStatus === st 
                  ? 'bg-slate-900 text-white' 
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Customer Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Customer Accounts Receivable Ledger</h2>
            <p className="text-[11px] text-slate-500">No verified customer receivables ledger is included in this demo snapshot.</p>
          </div>
          <span className="text-xs text-slate-400">{filteredCustomers.length} Records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200 text-[10px]">
              <tr>
                <th className="px-4 py-3">Customer / GSTIN</th>
                <th className="px-4 py-3">Credit Terms</th>
                <th className="px-4 py-3">Total Invoiced</th>
                <th className="px-4 py-3">Outstanding</th>
                <th className="px-4 py-3">Due Date</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-400">
                    No verified customer records are included. Connect or upload a real ledger before using receivables actions.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-bold text-slate-900">{cust.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{cust.gstin}</div>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-600">
                      {cust.payment_terms}
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-700">
                      ₹ {(cust.total_billed).toLocaleString('en-IN')}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`font-extrabold ${cust.outstanding > 0 ? 'text-slate-900' : 'text-emerald-600'}`}>
                        ₹ {(cust.outstanding).toLocaleString('en-IN')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <div>{cust.due_date}</div>
                      {cust.overdue_days > 0 && (
                        <span className="text-[10px] text-red-600 font-bold">
                          {cust.overdue_days} days overdue
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        cust.status === 'OVERDUE' 
                          ? 'bg-red-50 text-red-700 border border-red-200' 
                          : cust.status === 'DUE_SOON'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}>
                        {cust.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      {cust.outstanding > 0 && (
                        <>
                          <button
                            onClick={() => handleSendReminder(cust)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded text-[11px] font-bold transition-colors"
                            title="Simulate WhatsApp/Email reminder"
                          >
                            <Send className="w-3 h-3" />
                            <span>Remind</span>
                          </button>
                          <button
                            onClick={() => handleMarkPaid(cust.id)}
                            className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded text-[11px] font-bold transition-colors"
                            title="Mark as paid"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Settle</span>
                          </button>
                        </>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
