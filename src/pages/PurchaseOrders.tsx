import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Plus, 
  Printer, 
  Download, 
  Sparkles,
  IndianRupee,
  CheckCircle2,
  Trash2,
  Package,
  Calendar,
  Building2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateDocumentPDF } from '../utils/pdfGenerator';
import type { Product } from '../types';

interface POItem {
  id: string;
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  gst_rate: number;
  subtotal: number;
  gst_amount: number;
  total: number;
}

interface PurchaseOrder {
  po_number: string;
  date: string;
  expected_delivery: string;
  supplier_name: string;
  supplier_gstin: string;
  supplier_address: string;
  items: POItem[];
  payment_terms: string;
  notes: string;
  subtotal: number;
  total_gst: number;
  grand_total: number;
  status: 'DRAFT' | 'SENT' | 'ACKNOWLEDGED' | 'PARTIAL' | 'RECEIVED' | 'CANCELLED';
}

export const PurchaseOrders: React.FC = () => {
  const navigate = useNavigate();
  const { products, showToast, profile } = useApp();
  
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([
    {
      po_number: 'po_001',
      date: '2026-09-26',
      expected_delivery: '2026-09-29',
      supplier_name: 'Seeded supplier sup_001 (placeholder)',
      supplier_gstin: 'DEMO-NOT-A-REAL-GSTIN',
      supplier_address: 'Supplier address not included in verified demo data',
      items: [
        { id: '1', product_id: 'PROD-101', product_name: 'Besan', quantity: 20, unit_price: 0, gst_rate: 0, subtotal: 0, gst_amount: 0, total: 0 }
      ],
      payment_terms: 'Not provided in seeded data',
      notes: 'The seeded source confirms product, quantity, status and expected date only. Supplier identity, price, tax and payment terms must be verified before generating or sending a real order.',
      subtotal: 0,
      total_gst: 0,
      grand_total: 0,
      status: 'SENT'
    }
  ]);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPO, setNewPO] = useState<PurchaseOrder>({
    po_number: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 1).padStart(3, '0')}`,
    date: new Date().toISOString().split('T')[0],
    expected_delivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    supplier_name: '',
    supplier_gstin: '',
    supplier_address: '',
    items: [],
    payment_terms: 'Net 30 Days',
    notes: '',
    subtotal: 0,
    total_gst: 0,
    grand_total: 0,
    status: 'DRAFT'
  });

  const addItemToPO = () => {
    const newItem: POItem = {
      id: `item-${Date.now()}`,
      product_id: '',
      product_name: '',
      quantity: 1,
      unit_price: 0,
      gst_rate: 18,
      subtotal: 0,
      gst_amount: 0,
      total: 0
    };
    setNewPO(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updatePOItem = (id: string, field: keyof POItem, value: any) => {
    setNewPO(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          const subtotal = updated.quantity * updated.unit_price;
          const gst_amount = subtotal * (updated.gst_rate / 100);
          return {
            ...updated,
            subtotal,
            gst_amount,
            total: subtotal + gst_amount
          };
        }
        return item;
      })
    }));
  };

  const removePOItem = (id: string) => {
    setNewPO(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculatePOTotals = () => {
    const subtotal = newPO.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalGst = newPO.items.reduce((sum, item) => sum + item.gst_amount, 0);
    const grandTotal = subtotal + totalGst;

    setNewPO(prev => ({
      ...prev,
      subtotal,
      total_gst: totalGst,
      grand_total: grandTotal
    }));
  };

  React.useEffect(() => {
    calculatePOTotals();
  }, [newPO.items]);

  const handleSavePO = () => {
    setPurchaseOrders(prev => [...prev, newPO]);
    setShowCreateForm(false);
    showToast('Purchase Order created successfully');
    setNewPO({
      po_number: `PO-${new Date().getFullYear()}-${String(purchaseOrders.length + 2).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      expected_delivery: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      supplier_name: '',
      supplier_gstin: '',
      supplier_address: '',
      items: [],
      payment_terms: 'Net 30 Days',
      notes: '',
      subtotal: 0,
      total_gst: 0,
      grand_total: 0,
      status: 'DRAFT'
    });
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'DRAFT': return { color: 'slate', label: 'Draft' };
      case 'SENT': return { color: 'blue', label: 'Sent' };
      case 'ACKNOWLEDGED': return { color: 'purple', label: 'Acknowledged' };
      case 'PARTIAL': return { color: 'amber', label: 'Partial' };
      case 'RECEIVED': return { color: 'emerald', label: 'Received' };
      case 'CANCELLED': return { color: 'red', label: 'Cancelled' };
      default: return { color: 'slate', label: status };
    }
  };

  const handleDownloadPO = (po: PurchaseOrder) => {
    generateDocumentPDF({
      docType: 'PURCHASE ORDER',
      docNumber: po.po_number,
      date: po.date,
      dueDate: po.expected_delivery,
      buyerName: profile?.name || 'Sharma General Store',
      buyerAddress: `${profile?.city || 'Delhi'}, India`,
      buyerGstin: profile?.gstin || 'DEMO-NOT-A-REAL-GSTIN',
      sellerName: po.supplier_name,
      sellerAddress: po.supplier_address,
      sellerGstin: po.supplier_gstin,
      items: po.items.map(i => ({
        description: i.product_name,
        quantity: i.quantity,
        unit_price: i.unit_price,
        subtotal: i.subtotal,
        gst_rate: i.gst_rate,
        gst_amount: i.gst_amount,
        total: i.total
      })),
      subtotal: po.subtotal,
      totalGst: po.total_gst,
      grandTotal: po.grand_total,
      notes: po.notes,
      terms: po.payment_terms
    });
    showToast(`Generated a demo PDF for ${po.po_number}. Verify supplier, prices and tax details before operational use.`);
  };

  const handleUpdateStatus = (poNumber: string, nextStatus: PurchaseOrder['status']) => {
    setPurchaseOrders(prev => prev.map(p => p.po_number === poNumber ? { ...p, status: nextStatus } : p));
    showToast(`PO ${poNumber} updated to ${nextStatus}`);
  };

  if (showCreateForm) {
    return (
      <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setShowCreateForm(false)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm"
          >
            ← Back to PO List
          </button>
          <h2 className="text-lg font-bold text-slate-900">Create Purchase Order</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 text-sm">PO Details</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">PO Number</label>
                <input
                  type="text"
                  value={newPO.po_number}
                  onChange={(e) => setNewPO(prev => ({ ...prev, po_number: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">PO Date</label>
                <input
                  type="date"
                  value={newPO.date}
                  onChange={(e) => setNewPO(prev => ({ ...prev, date: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Expected Delivery</label>
                <input
                  type="date"
                  value={newPO.expected_delivery}
                  onChange={(e) => setNewPO(prev => ({ ...prev, expected_delivery: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">Payment Terms</label>
                <select
                  value={newPO.payment_terms}
                  onChange={(e) => setNewPO(prev => ({ ...prev, payment_terms: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option>Net 30 Days</option>
                  <option>Net 45 Days</option>
                  <option>50% Advance, 50% on Delivery</option>
                  <option>100% Advance</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Supplier Name</label>
              <input
                type="text"
                value={newPO.supplier_name}
                onChange={(e) => setNewPO(prev => ({ ...prev, supplier_name: e.target.value }))}
                placeholder="Enter supplier name"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Supplier GSTIN</label>
              <input
                type="text"
                value={newPO.supplier_gstin}
                onChange={(e) => setNewPO(prev => ({ ...prev, supplier_gstin: e.target.value }))}
                placeholder="27AAACA1234B1Z5"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Supplier Address</label>
              <textarea
                value={newPO.supplier_address}
                onChange={(e) => setNewPO(prev => ({ ...prev, supplier_address: e.target.value }))}
                placeholder="Enter supplier address"
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Notes</label>
              <textarea
                value={newPO.notes}
                onChange={(e) => setNewPO(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Additional notes..."
                rows={2}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none"
              />
            </div>
          </div>

          <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Line Items</h3>
              <button
                onClick={addItemToPO}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Item
              </button>
            </div>

            <div className="space-y-3">
              {newPO.items.map((item) => (
                <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                  <div className="flex justify-between items-start">
                    <input
                      type="text"
                      value={item.product_name}
                      onChange={(e) => updatePOItem(item.id, 'product_name', e.target.value)}
                      placeholder="Product name"
                      className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                    />
                    <button
                      onClick={() => removePOItem(item.id)}
                      className="p-1 text-red-500 hover:text-red-700 ml-2"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="text-[10px] text-slate-500">Qty</label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => updatePOItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">Price</label>
                      <input
                        type="number"
                        value={item.unit_price}
                        onChange={(e) => updatePOItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-slate-500">GST %</label>
                      <select
                        value={item.gst_rate}
                        onChange={(e) => updatePOItem(item.id, 'gst_rate', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                      >
                        <option value={0}>0%</option>
                        <option value={5}>5%</option>
                        <option value={12}>12%</option>
                        <option value={18}>18%</option>
                        <option value={28}>28%</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-600">Item Total:</span>
                    <span className="text-emerald-600">₹{item.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>

            {newPO.items.length === 0 && (
              <div className="text-center py-8 text-slate-400 text-sm">
                No items added. Click "Add Item" to start.
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
          <div className="grid grid-cols-3 gap-4">
            <div className="p-3 bg-slate-50 rounded-lg">
              <p className="text-[11px] text-slate-500">Subtotal</p>
              <p className="text-lg font-bold text-slate-900">₹{newPO.subtotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-blue-50 rounded-lg">
              <p className="text-[11px] text-blue-600">GST</p>
              <p className="text-lg font-bold text-blue-900">₹{newPO.total_gst.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-lg">
              <p className="text-[11px] text-emerald-600">Grand Total</p>
              <p className="text-lg font-bold text-emerald-900">₹{newPO.grand_total.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleSavePO}
            disabled={newPO.items.length === 0 || !newPO.supplier_name}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <CheckCircle2 className="w-4 h-4" />
            Save Purchase Order
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
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Purchase Orders</h2>
            <span className="bg-orange-100 text-orange-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Manage supplier purchase orders and track delivery status</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCreateForm(true)}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create PO</span>
          </button>
          <button
            onClick={() => navigate('/copilot?q=Help%20me%20create%20a%20purchase%20order')}
            className="w-full sm:w-auto px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-blue-700 font-bold">Total POs</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">{purchaseOrders.length}</p>
        </div>
        <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-amber-700 font-bold">Pending</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">
            {purchaseOrders.filter(po => po.status === 'SENT' || po.status === 'ACKNOWLEDGED').length}
          </p>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Total Value</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">
            ₹{(purchaseOrders.reduce((sum, po) => sum + po.grand_total, 0) / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 font-semibold text-slate-700">PO Number</th>
                <th className="text-left py-3 font-semibold text-slate-700">Supplier</th>
                <th className="text-left py-3 font-semibold text-slate-700">Date</th>
                <th className="text-left py-3 font-semibold text-slate-700">Expected Delivery</th>
                <th className="text-right py-3 font-semibold text-slate-700">Amount</th>
                <th className="text-center py-3 font-semibold text-slate-700">Status</th>
                <th className="text-center py-3 font-semibold text-slate-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => {
                const statusConfig = getStatusConfig(po.status);
                return (
                  <tr key={po.po_number} className="border-b hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-900">{po.po_number}</td>
                    <td className="py-3 text-slate-600">{po.supplier_name}</td>
                    <td className="py-3 text-slate-600">{po.date}</td>
                    <td className="py-3 text-slate-600">{po.expected_delivery}</td>
                    <td className="py-3 text-right font-semibold text-slate-900">₹{po.grand_total.toFixed(2)}</td>
                    <td className="py-3 text-center">
                      <span className={`text-[10px] font-bold uppercase tracking-wider text-${statusConfig.color}-700 bg-${statusConfig.color}-100 px-2 py-0.5 rounded`}>
                        {statusConfig.label}
                      </span>
                    </td>
                    <td className="py-3 text-center">
                      <div className="flex items-center justify-center space-x-1.5">
                        <button
                          onClick={() => handleDownloadPO(po)}
                          className="px-2 py-1 bg-slate-100 hover:bg-blue-50 text-blue-700 border border-slate-200 hover:border-blue-300 rounded text-[11px] font-semibold flex items-center space-x-1 transition-colors"
                          title="Download PO PDF"
                        >
                          <Download className="w-3 h-3" />
                          <span>PDF</span>
                        </button>
                        {po.status === 'DRAFT' && (
                          <button
                            onClick={() => handleUpdateStatus(po.po_number, 'SENT')}
                            className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[11px] font-semibold transition-colors"
                          >
                            Send
                          </button>
                        )}
                        {po.status === 'SENT' && (
                          <button
                            onClick={() => handleUpdateStatus(po.po_number, 'RECEIVED')}
                            className="px-2 py-1 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-[11px] font-semibold transition-colors"
                          >
                            Receive
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

      <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex items-start space-x-3">
        <ShoppingCart className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-orange-900 font-semibold">Demo Purchase Orders</p>
          <p className="text-[11px] text-orange-800 mt-1">
            Only the seeded Besan PO quantity/status/date are supplied. Supplier identity, price, tax and payment details are not verified; this page stores edits in local demo state only.
          </p>
        </div>
      </div>
    </div>
  );
};
