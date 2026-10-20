import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FileText, 
  Plus, 
  Printer, 
  Download, 
  Sparkles,
  IndianRupee,
  CheckCircle2,
  Trash2,
  Package,
  Calendar,
  User,
  AlertTriangle
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateDocumentPDF } from '../utils/pdfGenerator';
import type { Product } from '../types';

interface PRItem {
  id: string;
  product_id: string;
  product_name: string;
  current_stock: number;
  requested_qty: number;
  estimated_unit_price: number;
  reason: string;
  urgency: 'Low' | 'Medium' | 'High' | 'Critical';
  subtotal: number;
}

interface PurchaseRequisition {
  pr_number: string;
  date: string;
  required_by: string;
  requested_by: string;
  department: string;
  items: PRItem[];
  justification: string;
  total_estimated_cost: number;
  status: 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED' | 'CONVERTED_TO_PO';
}

export const PurchaseRequisitions: React.FC = () => {
  const navigate = useNavigate();
  const { products, showToast, profile } = useApp();
  
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPR, setNewPR] = useState<PurchaseRequisition>({
    pr_number: `PR-${new Date().getFullYear()}-${String(requisitions.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    required_by: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    requested_by: '',
    department: '',
    items: [],
    justification: '',
    total_estimated_cost: 0,
    status: 'DRAFT'
  });

  const addItemToPR = () => {
    const newItem: PRItem = {
      id: `item-${Date.now()}`,
      product_id: '',
      product_name: '',
      current_stock: 0,
      requested_qty: 1,
      estimated_unit_price: 0,
      reason: '',
      urgency: 'Medium',
      subtotal: 0
    };
    setNewPR(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updatePRItem = (id: string, field: keyof PRItem, value: any) => {
    setNewPR(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          const subtotal = updated.requested_qty * updated.estimated_unit_price;
          return {
            ...updated,
            subtotal
          };
        }
        return item;
      })
    }));
  };

  const removePRItem = (id: string) => {
    setNewPR(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculatePRTotals = () => {
    const totalCost = newPR.items.reduce((sum, item) => sum + item.subtotal, 0);
    setNewPR(prev => ({
      ...prev,
      total_estimated_cost: totalCost
    }));
  };

  React.useEffect(() => {
    calculatePRTotals();
  }, [newPR.items]);

  const handleSavePR = () => {
    setRequisitions(prev => [...prev, newPR]);
    setShowCreateForm(false);
    showToast('Purchase Requisition created successfully');
    setNewPR({
      pr_number: `PR-${new Date().getFullYear()}-${String(requisitions.length + 2).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      required_by: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      requested_by: '',
      department: '',
      items: [],
      justification: '',
      total_estimated_cost: 0,
      status: 'DRAFT'
    });
  };

  const handleConvertToPO = (pr: PurchaseRequisition) => {
    setRequisitions(prev => prev.map(p => p.pr_number === pr.pr_number ? { ...p, status: 'CONVERTED_TO_PO' } : p));
    showToast(`Converted PR ${pr.pr_number} to Purchase Order!`);
    navigate('/purchase-orders');
  };

  const handleDownloadPR = (pr: PurchaseRequisition) => {
    generateDocumentPDF({
      docType: 'PURCHASE REQUISITION',
      docNumber: pr.pr_number,
      date: pr.date,
      dueDate: pr.required_by,
      buyerName: `${profile?.name || 'Sharma General Store'} (${pr.department})`,
      buyerAddress: `${profile?.city || 'Delhi'}, India`,
      sellerName: `Internal Requisitioner: ${pr.requested_by}`,
      items: pr.items.map(i => ({
        description: `${i.product_name} [${i.urgency} Urgency - ${i.reason}]`,
        quantity: i.requested_qty,
        unit_price: i.estimated_unit_price,
        subtotal: i.subtotal,
        total: i.subtotal
      })),
      subtotal: pr.total_estimated_cost,
      grandTotal: pr.total_estimated_cost,
      notes: pr.justification,
      terms: 'Internal MSME Material Purchase Requisition'
    });
    showToast(`Downloaded PR PDF for ${pr.pr_number}`);
  };

  const handleApprovePR = (prNumber: string) => {
    setRequisitions(prev => prev.map(p => p.pr_number === prNumber ? { ...p, status: 'APPROVED' } : p));
    showToast(`PR ${prNumber} Approved! Ready for PO conversion.`);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT': return { color: 'slate', label: 'Draft' };
      case 'PENDING_APPROVAL': return { color: 'amber', label: 'Pending Approval' };
      case 'APPROVED': return { color: 'emerald', label: 'Approved' };
      case 'REJECTED': return { color: 'red', label: 'Rejected' };
      case 'CONVERTED_TO_PO': return { color: 'blue', label: 'Converted to PO' };
      default: return { color: 'slate', label: status };
    }
  };

  const getUrgencyConfig = (urgency: string) => {
    switch (urgency) {
      case 'Critical': return { color: 'red' };
      case 'High': return { color: 'orange' };
      case 'Medium': return { color: 'amber' };
      case 'Low': return { color: 'blue' };
      default: return { color: 'slate' };
    }
  };

  if (showCreateForm) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm"
          >
            ← Back to PR List
          </button>
          <h2 className="text-lg font-bold text-slate-900">Create Purchase Requisition</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">PR Details</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">PR Number</label>
                <input
                  type="text"
                  value={newPR.pr_number}
                  onChange={(e) => setNewPR(prev => ({ ...prev, pr_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">PR Date</label>
                <input
                  type="date"
                  value={newPR.date}
                  onChange={(e) => setNewPR(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Required By</label>
                <input
                  type="date"
                  value={newPR.required_by}
                  onChange={(e) => setNewPR(prev => ({ ...prev, required_by: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Department</label>
                <select
                  value={newPR.department}
                  onChange={(e) => setNewPR(prev => ({ ...prev, department: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="">Select Department</option>
                  <option>Production</option>
                  <option>Inventory</option>
                  <option>Sales</option>
                  <option>Quality</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Requested By</label>
              <input
                type="text"
                value={newPR.requested_by}
                onChange={(e) => setNewPR(prev => ({ ...prev, requested_by: e.target.value }))}
                placeholder="Enter your name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Justification</label>
              <textarea
                value={newPR.justification}
                onChange={(e) => setNewPR(prev => ({ ...prev, justification: e.target.value }))}
                placeholder="Explain why this requisition is needed..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Requested Items</h3>
              <button
                onClick={addItemToPR}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {newPR.items.map((item) => {
                const urgencyConfig = getUrgencyConfig(item.urgency);
                return (
                  <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                    <div className="flex justify-between items-start">
                      <input
                        type="text"
                        value={item.product_name}
                        onChange={(e) => updatePRItem(item.id, 'product_name', e.target.value)}
                        placeholder="Product name"
                        className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                      />
                      <button
                        onClick={() => removePRItem(item.id)}
                        className="p-1 text-red-500 hover:text-red-700 ml-2"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-4 gap-2">
                      <div>
                        <label className="text-[10px] text-slate-500">Current Stock</label>
                        <input
                          type="number"
                          value={item.current_stock}
                          onChange={(e) => updatePRItem(item.id, 'current_stock', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Requested Qty</label>
                        <input
                          type="number"
                          value={item.requested_qty}
                          onChange={(e) => updatePRItem(item.id, 'requested_qty', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Est. Price</label>
                        <input
                          type="number"
                          value={item.estimated_unit_price}
                          onChange={(e) => updatePRItem(item.id, 'estimated_unit_price', parseFloat(e.target.value) || 0)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-500">Urgency</label>
                        <select
                          value={item.urgency}
                          onChange={(e) => updatePRItem(item.id, 'urgency', e.target.value)}
                          className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                        >
                          <option value="Low">Low</option>
                          <option value="Medium">Medium</option>
                          <option value="High">High</option>
                          <option value="Critical">Critical</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Reason</label>
                      <input
                        type="text"
                        value={item.reason}
                        onChange={(e) => updatePRItem(item.id, 'reason', e.target.value)}
                        placeholder="Why is this needed?"
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-slate-600">Subtotal:</span>
                      <span className="text-emerald-600">₹{item.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {newPR.items.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No items added. Click "Add Item" to start.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-[11px] text-emerald-600">Total Estimated Cost</p>
            <p className="text-2xl font-bold text-emerald-900">₹{newPR.total_estimated_cost.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSavePR}
            disabled={newPR.items.length === 0 || !newPR.requested_by || !newPR.department}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Submit for Approval
          </button>
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Purchase Indents (PI) & Requisitions (PR)</h2>
            <span className="bg-teal-100 text-teal-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Create, approve, and convert internal material purchase indents (PI) into official supplier Purchase Orders (PO)</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Indent / PR</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=Help%20me%20create%20a%20purchase%20requisition')}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-teal-50 border border-teal-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-teal-700 font-bold">Total PRs</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-teal-900 mt-1">{requisitions.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-amber-700 font-bold">Pending Approval</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
            {requisitions.filter(pr => pr.status === 'PENDING_APPROVAL').length}
          </p>
        </div>
        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">Critical Items</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">
            {requisitions.reduce((sum, pr) => sum + pr.items.filter(item => item.urgency === 'Critical').length, 0)}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Total Value</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            ₹{(requisitions.reduce((sum, pr) => sum + pr.total_estimated_cost, 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-semibold text-slate-700">PR Number</th>
                <th className="text-left py-3 font-semibold text-slate-700">Department</th>
                <th className="text-left py-3 font-semibold text-slate-700">Requested By</th>
                <th className="text-left py-3 font-semibold text-slate-700">Required By</th>
                <th className="text-right py-3 font-semibold text-slate-700">Est. Cost</th>
                <th className="text-center py-3 font-semibold text-slate-700">Status</th>
                <th className="text-center py-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No purchase requisitions are stored in the seeded demo. Forecast recommendations require review and do not automatically create a requisition.
                  </td>
                </tr>
              )}
              {requisitions.map((pr) => {
                const statusConfig = getStatusConfig(pr.status);
                const hasCriticalItem = pr.items.some(item => item.urgency === 'Critical');
                return (
                  <tr key={pr.pr_number} className="border-b hover:bg-slate-50">
                    <td className="py-3">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900">{pr.pr_number}</span>
                        {hasCriticalItem && <AlertTriangle className="w-4 h-4 text-red-500" />}
                      </div>
                    </td>
                    <td className="py-3 text-slate-600">{pr.department}</td>
                    <td className="py-3 text-slate-600">{pr.requested_by}</td>
                    <td className="py-3 text-slate-600">{pr.required_by}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">₹{pr.total_estimated_cost.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-${statusConfig.color}-700 bg-${statusConfig.color}-100 px-2 py-0.5 rounded`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleDownloadPR(pr)}
                          className="px-2 py-1 bg-slate-100 hover:bg-teal-50 text-teal-700 border border-slate-200 hover:border-teal-300 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                          title="Download PR PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                        {(pr.status === 'DRAFT' || pr.status === 'PENDING_APPROVAL') && (
                          <button
                            onClick={() => handleApprovePR(pr.pr_number)}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold transition-colors"
                          >
                            Approve
                          </button>
                        )}
                        {pr.status === 'APPROVED' && (
                          <button
                            onClick={() => handleConvertToPO(pr)}
                            className="px-2 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-[11px] font-semibold transition-colors"
                          >
                            Convert to PO
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-teal-50 border border-teal-200 rounded-xl p-4 flex items-start space-x-3">
        <FileText className="w-5 h-5 text-teal-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-teal-900 font-semibold">Demo Purchase Requisitions</p>
          <p className="text-[11px] text-teal-800 mt-1">
            Purchase requisitions are stored in demo session state only. In production, PRs would go through an approval workflow and integrate with ERP systems.
          </p>
        </div>
      </div>
    </div>
  );
};
