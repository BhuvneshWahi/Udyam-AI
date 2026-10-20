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
  Trash2
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Invoice, InvoiceItem } from '../types';
import { generateDocumentPDF } from '../utils/pdfGenerator';

export const ProformaInvoice: React.FC = () => {
  const navigate = useNavigate();
  const { profile, showToast } = useApp();
  
  const [invoice, setInvoice] = useState<Invoice>({
    invoice_number: `PROF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9999)).padStart(4, '0')}`,
    date: new Date().toISOString().split('T')[0],
    due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    customer_name: '',
    customer_gstin: '',
    customer_address: '',
    items: [],
    payment_terms: 'Advance Payment Required',
    notes: 'This is a proforma invoice. Final invoice will be issued upon order confirmation.',
    subtotal: 0,
    total_discount: 0,
    total_gst: 0,
    grand_total: 0,
    status: 'DRAFT'
  });

  const [showPreview, setShowPreview] = useState(false);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: `item-${Date.now()}`,
      description: '',
      quantity: 1,
      unit_price: 0,
      discount_pct: 0,
      gst_rate: 18,
      subtotal: 0,
      gst_amount: 0,
      total: 0
    };
    setInvoice(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.map(item => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          const subtotal = updated.quantity * updated.unit_price;
          const discountAmount = subtotal * (updated.discount_pct / 100);
          const afterDiscount = subtotal - discountAmount;
          const gst_amount = afterDiscount * (updated.gst_rate / 100);
          return {
            ...updated,
            subtotal,
            gst_amount,
            total: afterDiscount + gst_amount
          };
        }
        return item;
      })
    }));
  };

  const removeItem = (id: string) => {
    setInvoice(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== id)
    }));
  };

  const calculateTotals = () => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalDiscount = invoice.items.reduce((sum, item) => sum + (item.subtotal * (item.discount_pct / 100)), 0);
    const totalGst = invoice.items.reduce((sum, item) => sum + item.gst_amount, 0);
    const grandTotal = subtotal - totalDiscount + totalGst;

    setInvoice(prev => ({
      ...prev,
      subtotal,
      total_discount: totalDiscount,
      total_gst: totalGst,
      grand_total: grandTotal
    }));
  };

  React.useEffect(() => {
    calculateTotals();
  }, [invoice.items]);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    generateDocumentPDF({
      docType: 'PROFORMA INVOICE',
      docNumber: invoice.invoice_number,
      date: invoice.date,
      dueDate: invoice.due_date,
      buyerName: invoice.customer_name || 'Valued Customer',
      buyerAddress: invoice.customer_address,
      buyerGstin: invoice.customer_gstin,
      sellerName: profile.name,
      sellerAddress: `${profile.city}, ${profile.state}`,
      sellerGstin: profile.gstin,
      items: invoice.items,
      subtotal: invoice.subtotal,
      totalDiscount: invoice.total_discount,
      totalGst: invoice.total_gst,
      grandTotal: invoice.grand_total,
      notes: invoice.notes,
      terms: invoice.payment_terms
    });
    showToast(`PDF generated & downloaded: ${invoice.invoice_number}.pdf`);
  };

  const handleSave = () => {
    try {
      const existing = JSON.parse(localStorage.getItem('udyam_saved_proformas') || '[]');
      existing.unshift(invoice);
      localStorage.setItem('udyam_saved_proformas', JSON.stringify(existing.slice(0, 20)));
      showToast(`Proforma invoice ${invoice.invoice_number} saved to demo session.`);
    } catch (e) {
      showToast('Proforma invoice saved as draft (demo session)');
    }
  };

  const convertToInvoice = () => {
    showToast('Converting proforma to final invoice...');
    navigate('/invoice-generator');
  };

  if (showPreview) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-4xl mx-auto">
          <div className="flex justify-between items-start mb-8 border-b pb-6">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">PROFORMA INVOICE</h1>
              <p className="text-slate-600 mt-1">{invoice.invoice_number}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-slate-900">{profile.name}</p>
              <p className="text-sm text-slate-600">{profile.gstin}</p>
              <p className="text-sm text-slate-600">{profile.city}, {profile.state}</p>
            </div>
          </div>

          <div className="mb-8">
            <h3 className="font-semibold text-slate-900 mb-2">Bill To:</h3>
            <p className="font-semibold text-slate-900">{invoice.customer_name || 'Customer Name'}</p>
            {invoice.customer_gstin && <p className="text-sm text-slate-600">GSTIN: {invoice.customer_gstin}</p>}
            {invoice.customer_address && <p className="text-sm text-slate-600">{invoice.customer_address}</p>}
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8 text-sm">
            <div>
              <p className="text-slate-500">Proforma Date</p>
              <p className="font-semibold">{invoice.date}</p>
            </div>
            <div>
              <p className="text-slate-500">Valid Until</p>
              <p className="font-semibold">{invoice.due_date}</p>
            </div>
            <div>
              <p className="text-slate-500">Payment Terms</p>
              <p className="font-semibold">{invoice.payment_terms}</p>
            </div>
          </div>

          <table className="w-full mb-8">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-sm font-semibold text-slate-700">Description</th>
                <th className="text-right py-2 text-sm font-semibold text-slate-700">Qty</th>
                <th className="text-right py-2 text-sm font-semibold text-slate-700">Price</th>
                <th className="text-right py-2 text-sm font-semibold text-slate-700">GST%</th>
                <th className="text-right py-2 text-sm font-semibold text-slate-700">Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="py-3 text-sm">{item.description || 'Item'}</td>
                  <td className="py-3 text-sm text-right">{item.quantity}</td>
                  <td className="py-3 text-sm text-right">₹{item.unit_price.toFixed(2)}</td>
                  <td className="py-3 text-sm text-right">{item.gst_rate}%</td>
                  <td className="py-3 text-sm text-right font-semibold">₹{item.total.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Subtotal</span>
                <span className="font-semibold">₹{invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">Discount</span>
                <span className="font-semibold text-red-600">-₹{invoice.total_discount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-600">GST</span>
                <span className="font-semibold">₹{invoice.total_gst.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-3 border-t font-bold text-lg">
                <span>Grand Total</span>
                <span className="text-emerald-600">₹{invoice.grand_total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <div className="mt-8 pt-6 border-t">
              <h3 className="font-semibold text-slate-900 mb-2">Notes</h3>
              <p className="text-sm text-slate-600">{invoice.notes}</p>
            </div>
          )}

          <div className="mt-8 pt-6 border-t flex gap-3">
            <button
              onClick={() => setShowPreview(false)}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium"
            >
              Edit
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={convertToInvoice}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium"
            >
              Convert to Invoice
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Proforma Invoice</h2>
            <span className="bg-purple-100 text-purple-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Create preliminary invoices for customer approval before final billing</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/copilot?q=Help%20me%20create%20a%20proforma%20invoice')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm">Proforma Details</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Proforma Number</label>
              <input
                type="text"
                value={invoice.invoice_number}
                onChange={(e) => setInvoice(prev => ({ ...prev, invoice_number: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Proforma Date</label>
              <input
                type="date"
                value={invoice.date}
                onChange={(e) => setInvoice(prev => ({ ...prev, date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Valid Until</label>
              <input
                type="date"
                value={invoice.due_date}
                onChange={(e) => setInvoice(prev => ({ ...prev, due_date: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">Payment Terms</label>
              <select
                value={invoice.payment_terms}
                onChange={(e) => setInvoice(prev => ({ ...prev, payment_terms: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              >
                <option>Advance Payment Required</option>
                <option>50% Advance, 50% on Delivery</option>
                <option>Net 30 Days</option>
                <option>Letter of Credit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Customer Name</label>
            <input
              type="text"
              value={invoice.customer_name}
              onChange={(e) => setInvoice(prev => ({ ...prev, customer_name: e.target.value }))}
              placeholder="Enter customer name"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Customer GSTIN</label>
            <input
              type="text"
              value={invoice.customer_gstin}
              onChange={(e) => setInvoice(prev => ({ ...prev, customer_gstin: e.target.value }))}
              placeholder="27AAACA1234B1Z5"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Customer Address</label>
            <textarea
              value={invoice.customer_address}
              onChange={(e) => setInvoice(prev => ({ ...prev, customer_address: e.target.value }))}
              placeholder="Enter customer address"
              rows={2}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs resize-none"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-600 block mb-1">Notes</label>
            <textarea
              value={invoice.notes}
              onChange={(e) => setInvoice(prev => ({ ...prev, notes: e.target.value }))}
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
              onClick={addItem}
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              Add Item
            </button>
          </div>

          <div className="space-y-3">
            {invoice.items.map((item) => (
              <div key={item.id} className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <div className="flex justify-between items-start">
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                    placeholder="Item description"
                    className="flex-1 px-2 py-1.5 border border-slate-300 rounded text-xs"
                  />
                  <button
                    onClick={() => removeItem(item.id)}
                    className="p-1 text-red-500 hover:text-red-700 ml-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="grid grid-cols-4 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500">Qty</label>
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Price</label>
                    <input
                      type="number"
                      value={item.unit_price}
                      onChange={(e) => updateItem(item.id, 'unit_price', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">Discount %</label>
                    <input
                      type="number"
                      value={item.discount_pct}
                      onChange={(e) => updateItem(item.id, 'discount_pct', parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1 border border-slate-300 rounded text-xs"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500">GST %</label>
                    <select
                      value={item.gst_rate}
                      onChange={(e) => updateItem(item.id, 'gst_rate', parseFloat(e.target.value))}
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

          {invoice.items.length === 0 && (
            <div className="text-center py-8 text-slate-400 text-sm">
              No items added. Click "Add Item" to start.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-slate-50 rounded-lg">
            <p className="text-[11px] text-slate-500">Subtotal</p>
            <p className="text-lg font-bold text-slate-900">₹{invoice.subtotal.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-red-50 rounded-lg">
            <p className="text-[11px] text-red-600">Discount</p>
            <p className="text-lg font-bold text-red-900">-₹{invoice.total_discount.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-[11px] text-blue-600">GST</p>
            <p className="text-lg font-bold text-blue-900">₹{invoice.total_gst.toFixed(2)}</p>
          </div>
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-[11px] text-emerald-600">Grand Total</p>
            <p className="text-lg font-bold text-emerald-900">₹{invoice.grand_total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium text-sm flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4" />
          Save Draft
        </button>
        <button
          onClick={() => setShowPreview(true)}
          disabled={invoice.items.length === 0}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <FileText className="w-4 h-4" />
          Preview Proforma
        </button>
      </div>

      <div className="bg-purple-50 border border-purple-200 rounded-xl p-4 flex items-start space-x-3">
        <FileText className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-purple-900 font-semibold">Demo Proforma Invoice</p>
          <p className="text-[11px] text-purple-800 mt-1">
            This is a demo proforma invoice generator. In production, proforma invoices would be saved to a database and integrated with order management systems.
          </p>
        </div>
      </div>
    </div>
  );
};
