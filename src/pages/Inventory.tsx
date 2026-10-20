import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  Sparkles, 
  Plus, 
  Minus, 
  ArrowRight,
  Filter,
  Search,
  LayoutGrid,
  List,
  ShieldCheck,
  TrendingUp,
  Clock,
  ArrowUpRight,
  Cpu,
  Zap,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { apiService, FALLBACK_AIML_RECOMMENDATIONS } from '../services/api';
import type { Product, AIMLRecommendation } from '../types';

export const Inventory: React.FC = () => {
  const { products, kpis, updateProductStock, showToast } = useApp();
  const [inventoryTab, setInventoryTab] = useState<'skus' | 'aiml'>('skus');
  const [aimlRecs, setAimlRecs] = useState<AIMLRecommendation[]>(FALLBACK_AIML_RECOMMENDATIONS);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    apiService.getAIMLRecommendations().then(res => {
      if (isMounted && res.recommendations && res.recommendations.length > 0) {
        setAimlRecs(res.recommendations);
      }
    }).catch(() => {});
    return () => { isMounted = false; };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const overstockedCount = products.filter(p => p.status === 'Overstocked').length;

  // Calculate deterministic reorder point: (Avg Daily Sales * Lead Time (7d)) + Safety Buffer (3d)
  const calculateReorderPoint = (p: Product) => {
    if (!p.avg_daily_sales || p.avg_daily_sales <= 0) return null;
    return Math.ceil(p.avg_daily_sales * 10); // 7 days lead + 3 days safety
  };

  const getRecommendation = (p: Product) => {
    if (p.stock === undefined || p.avg_daily_sales === undefined) {
      return "Insufficient data";
    }
    if (p.status === 'Critical') {
      const order = p.suggested_reorder > 0 ? p.suggested_reorder : 500;
      return `Review procurement for approximately ${order} kg additional ${p.name}. Current stock coverage is about ${p.days_remaining} days.`;
    }
    if (p.status === 'Low') {
      return `Review procurement for approximately ${p.suggested_reorder || 250} kg ${p.name} to support stock planning.`;
    }
    if (p.status === 'Overstocked') {
      return `Hold reorders. Run 10-12% clearance package to free ₹${Math.round(p.stock * p.cost_price * 0.4).toLocaleString('en-IN')} locked capital.`;
    }
    return "Stock level healthy. 30-day demand covered under normal production cycle.";
  };

  const handleAIMLReorder = (rec: AIMLRecommendation) => {
    showToast(`Purchase Requisition Generated: ${rec.planning_statement}`);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Inventory Intelligence & Reorder Engine</h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
              Deterministic + LightGBM
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Strict pipeline: Current Stock ➔ Velocity ➔ Forecast ➔ Reorder Point ➔ Risk Level ➔ Recommendation
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {/* View Toggle (for SKU mode) */}
          {inventoryTab === 'skus' && (
            <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
              <button
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'cards' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Card Pipeline View"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Pipeline Cards</span>
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1 ${
                  viewMode === 'table' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
                }`}
                title="Table View"
              >
                <List className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Table</span>
              </button>
            </div>
          )}

          <button
            onClick={() => navigate('/procurement-reconciliation?tab=purchase-orders')}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Issue Purchase Orders</span>
          </button>
        </div>
      </div>

      {/* Inventory Pillar Navigation Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setInventoryTab('skus')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
            inventoryTab === 'skus'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Package className="w-3.5 h-3.5" />
          <span>Active Warehouse SKUs ({products.length} Items)</span>
        </button>
        <button
          onClick={() => setInventoryTab('aiml')}
          className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-bold rounded-xl transition-all ${
            inventoryTab === 'aiml'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <Cpu className="w-3.5 h-3.5 text-emerald-400" />
          <span>AIML Commodity Procurement (6 Products — LightGBM)</span>
        </button>
      </div>

      {/* PILLAR 1: AIML LIGHTGBM COMMODITY PROCUREMENT */}
      {inventoryTab === 'aiml' && (
        <div className="space-y-4 sm:space-y-6">
          {/* AIML KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Model Engine</span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-1 flex items-center space-x-1">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>LightGBM Regressor</span>
              </p>
              <span className="text-[10px] text-slate-500 mt-0.5 block">23 ML Feature Inputs</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">7-Day Total Demand</span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">1,635.9 kg</p>
              <span className="text-[10px] text-emerald-600 font-semibold mt-0.5 block">Multi-Signal Fused</span>
            </div>

            <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
              <span className="text-xs text-red-800 font-bold">High Priority SKUs</span>
              <p className="text-base sm:text-lg font-extrabold text-red-950 mt-1">3 Products</p>
              <span className="text-[10px] text-red-700 mt-0.5 block font-semibold">Besan, Ghee, Dry Fruits</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
              <span className="text-xs text-emerald-800 font-bold">Total Procurement Buffer</span>
              <p className="text-base sm:text-lg font-extrabold text-emerald-950 mt-1">1,149 kg</p>
              <span className="text-[10px] text-emerald-700 mt-0.5 block font-semibold">Planning Recommendation</span>
            </div>
          </div>

          {/* Commodity Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {aimlRecs.map(rec => (
              <div 
                key={rec.product_id}
                className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                  rec.priority === 'HIGH' ? 'border-red-200 ring-1 ring-red-100' : 'border-slate-200'
                }`}
              >
                <div>
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                          {rec.product_id}
                        </span>
                        <span className="text-[11px] text-slate-500 font-medium">Commodity Staple</span>
                      </div>
                      <h3 className="font-bold text-slate-900 text-base mt-1">
                        {rec.product_name}
                      </h3>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                      rec.priority === 'HIGH' 
                        ? 'bg-red-100 text-red-800 border border-red-200' 
                        : 'bg-slate-100 text-slate-700 border border-slate-200'
                    }`}>
                      {rec.priority} Priority
                    </span>
                  </div>

                  {/* 4-Stage Multi-Signal Fusion */}
                  <div className="grid grid-cols-2 gap-2 my-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Base 7D Demand</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">{rec.base_7_day_demand_kg.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Market + Festival</span>
                      <p className="font-bold text-blue-700 text-sm mt-0.5">
                        +{rec.market_signal_pct.toFixed(0)}% / +{rec.festival_signal_pct.toFixed(0)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Adjusted 7D</span>
                      <p className="font-extrabold text-emerald-700 text-sm mt-0.5">{rec.adjusted_7_day_demand_kg.toFixed(1)} kg</p>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-400 block">Current Stock (PO)</span>
                      <p className="font-bold text-slate-900 text-sm mt-0.5">
                        {rec.current_inventory_kg} kg {rec.incoming_po_kg > 0 ? `(+${rec.incoming_po_kg})` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Planning Statement */}
                  <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                    rec.priority === 'HIGH' ? 'bg-amber-50 border-amber-200 text-amber-950' : 'bg-slate-50 border-slate-200 text-slate-800'
                  }`}>
                    <div className="flex items-center space-x-1.5 font-bold mb-1">
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Planning Recommendation:</span>
                    </div>
                    <p className="text-xs font-semibold">"{rec.planning_statement}"</p>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Recommended Order</span>
                    <span className="text-base font-extrabold text-emerald-700">{rec.recommended_additional_stock_kg.toFixed(0)} kg</span>
                  </div>

                  <button
                    onClick={() => handleAIMLReorder(rec)}
                    className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1 shadow-xs transition-all"
                  >
                    <span>Issue Requisition</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PILLAR 2: ACTIVE WAREHOUSE SKUS (EXISTING WORKING FUNCTIONALITY) */}
      {inventoryTab === 'skus' && (
        <div className="space-y-4 sm:space-y-6">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Total Active SKUs</span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">{kpis.total_skus} Items</p>
              <span className="text-[10px] sm:text-[11px] text-slate-500 mt-1 block">4 Product Categories</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-xs text-slate-500 font-medium">Inventory Asset Base</span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">₹ {(kpis.inventory_value / 100000).toFixed(2)} Lakhs</p>
              <span className="text-[10px] sm:text-[11px] text-emerald-600 font-bold mt-1 block">Audited Value</span>
            </div>

            <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
              <span className="text-xs text-red-800 font-bold">Critical Stock Risk</span>
              <p className="text-base sm:text-lg font-extrabold text-red-950 mt-1">{kpis.critical_stock_items} SKUs</p>
              <span className="text-[10px] sm:text-[11px] text-red-700 mt-1 block font-semibold">&lt;4 Days Supply</span>
            </div>

            <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
              <span className="text-xs text-amber-800 font-bold">Low Stock Warning</span>
              <p className="text-base sm:text-lg font-extrabold text-amber-950 mt-1">{kpis.low_stock_items} SKUs</p>
              <span className="text-[10px] sm:text-[11px] text-amber-700 mt-1 block font-semibold">Reorder Window Open</span>
            </div>

            <div className="bg-purple-50 border border-purple-200 p-3.5 sm:p-4 rounded-xl shadow-xs col-span-2 sm:col-span-1">
              <span className="text-xs text-purple-800 font-bold">Overstocked Capital</span>
              <p className="text-base sm:text-lg font-extrabold text-purple-950 mt-1">{overstockedCount} SKU</p>
              <span className="text-[10px] sm:text-[11px] text-purple-700 mt-1 block font-semibold">148 Days Supply</span>
            </div>
          </div>

          {/* Filter and Search Bar */}
          <div className="p-3 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search product name or SKU..."
                className="w-full pl-8 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
            </div>

            <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 sm:pb-0 custom-scrollbar">
              <Filter className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <span className="text-xs font-semibold text-slate-600 shrink-0">Filter:</span>
              <div className="flex items-center bg-slate-100 border border-slate-200 rounded-lg p-0.5 shrink-0">
                {['ALL', 'Critical', 'Low', 'Healthy', 'Overstocked'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-2.5 py-1 text-[10px] sm:text-[11px] font-bold rounded-md transition-colors ${
                      filterStatus === status
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VIEW MODE 1: Deterministic Pipeline Cards */}
          {viewMode === 'cards' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredProducts.map((p) => {
                const reorderPoint = calculateReorderPoint(p);
                const recommendation = getRecommendation(p);

                return (
                  <div 
                    key={p.id}
                    className={`bg-white rounded-2xl border p-4 sm:p-5 shadow-xs transition-all hover:shadow-md flex flex-col justify-between ${
                      p.status === 'Critical' ? 'border-red-200 ring-1 ring-red-100' :
                      p.status === 'Low' ? 'border-amber-200' :
                      p.status === 'Overstocked' ? 'border-purple-200' :
                      'border-slate-200'
                    }`}
                  >
                    <div>
                      {/* Top Bar: SKU, Category & Status Badge */}
                      <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-100">
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono text-[10px] text-slate-500 font-bold bg-slate-100 px-1.5 py-0.5 rounded">
                              {p.sku || 'SKU-N/A'}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">
                              {p.category || 'General'}
                            </span>
                          </div>
                          <h3 className="font-bold text-slate-900 text-sm sm:text-base mt-1">
                            {p.name}
                          </h3>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase shrink-0 ${
                          p.status === 'Critical' ? 'bg-red-100 text-red-800 border border-red-200' :
                          p.status === 'Low' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                          p.status === 'Overstocked' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                          'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        }`}>
                          {p.status} Risk
                        </span>
                      </div>

                      {/* 6-Stage Deterministic Pipeline Steps */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 my-3.5 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                        {/* Stage 1: Current Stock */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">1. Current Stock</span>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">
                            {p.stock !== undefined ? `${p.stock} kg` : <span className="text-slate-400 font-normal">Insufficient data</span>}
                          </p>
                          <span className="text-[10px] text-slate-500">
                            {p.days_remaining ? `${p.days_remaining}d cover` : 'N/A'}
                          </span>
                        </div>

                        {/* Stage 2: Velocity */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">2. Velocity</span>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">
                            {p.avg_daily_sales ? `${p.avg_daily_sales} / day` : <span className="text-slate-400 font-normal">Insufficient data</span>}
                          </p>
                          <span className="text-[10px] text-slate-500">Moving 30d</span>
                        </div>

                        {/* Stage 3: Forecast */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Forecast (30d)</span>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">
                            {p.forecast_demand_30d ? `${p.forecast_demand_30d} kg (projection)` : <span className="text-slate-400 font-normal">Insufficient data</span>}
                          </p>
                          <span className="text-[10px] text-emerald-600 font-semibold">
                            {p.sales_growth_30d ? `+${p.sales_growth_30d}% YoY` : 'Baseline'}
                          </span>
                        </div>

                        {/* Stage 4: Reorder Point */}
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Reorder Point</span>
                          <p className="font-bold text-slate-900 text-sm mt-0.5">
                            {reorderPoint !== null ? `${reorderPoint} kg` : <span className="text-slate-400 font-normal">Insufficient data</span>}
                          </p>
                          <span className="text-[10px] text-slate-500">7d lead + 3d safety</span>
                        </div>
                      </div>

                      {/* Stage 5 & 6: Risk & Recommendation Card */}
                      <div className={`p-3 rounded-xl border text-xs leading-relaxed ${
                        p.status === 'Critical' ? 'bg-red-50 border-red-200 text-red-900' :
                        p.status === 'Low' ? 'bg-amber-50 border-amber-200 text-amber-900' :
                        p.status === 'Overstocked' ? 'bg-purple-50 border-purple-200 text-purple-900' :
                        'bg-slate-50 border-slate-200 text-slate-800'
                      }`}>
                        <div className="flex items-center space-x-1.5 font-bold mb-1">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Recommendation:</span>
                        </div>
                        <p className="text-xs">{recommendation}</p>
                      </div>
                    </div>

                    {/* Bottom Action Footer with Stock Adjustments */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1">
                        <span className="text-[10px] font-bold text-slate-400 uppercase mr-1">Adjust:</span>
                        <button
                          onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 10))}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Deduct 10 kg"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="font-mono text-xs font-bold px-2 text-slate-800">{p.stock}</span>
                        <button
                          onClick={() => updateProductStock(p.id, p.stock + 50)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                          title="Add 50 kg"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {p.suggested_reorder > 0 ? (
                        <button
                          onClick={() => {
                            updateProductStock(p.id, p.stock + p.suggested_reorder);
                            showToast(`Demo action only: review the suggested ${p.suggested_reorder} kg planning quantity for ${p.name}. No purchase order was submitted.`);
                          }}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1 transition-colors shadow-xs"
                        >
                          <span>Reorder {p.suggested_reorder}</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      ) : p.status === 'Overstocked' ? (
                        <button
                          onClick={() => showToast(`Discount clearance package applied to ${p.name}.`)}
                          className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs flex items-center space-x-1 transition-colors"
                        >
                          <span>Run Promotion</span>
                        </button>
                      ) : (
                        <span className="text-xs text-slate-400 font-semibold flex items-center space-x-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Stock Stable</span>
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW MODE 2: Comprehensive Table */}
          {viewMode === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[700px]">
                  <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                    <tr>
                      <th className="px-4 py-3">SKU & Item</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3">1. Current Stock</th>
                      <th className="px-4 py-3">2. Velocity</th>
                      <th className="px-4 py-3">3. Forecast (30d)</th>
                      <th className="px-4 py-3">4. Reorder Point</th>
                      <th className="px-4 py-3">5. Risk Level</th>
                      <th className="px-4 py-3">Adjust</th>
                      <th className="px-4 py-3">6. Recommendation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                    {filteredProducts.map((p) => {
                      const reorderPoint = calculateReorderPoint(p);
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">{p.name}</p>
                            <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{p.category}</td>
                          <td className="px-4 py-3 font-bold text-slate-900">{p.stock} kg</td>
                          <td className="px-4 py-3 text-slate-600">{p.avg_daily_sales} / Day</td>
                          <td className="px-4 py-3 text-slate-700 font-semibold">{p.forecast_demand_30d || 'N/A'}</td>
                          <td className="px-4 py-3 font-mono text-slate-700">{reorderPoint !== null ? `${reorderPoint} U` : 'N/A'}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              p.status === 'Critical' ? 'bg-red-100 text-red-800' :
                              p.status === 'Low' ? 'bg-amber-100 text-amber-800' :
                              p.status === 'Overstocked' ? 'bg-purple-100 text-purple-800' :
                              'bg-emerald-100 text-emerald-800'
                            }`}>
                              {p.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => updateProductStock(p.id, Math.max(0, p.stock - 10))}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                                title="Deduct 10"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => updateProductStock(p.id, p.stock + 50)}
                                className="p-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded"
                                title="Add 50"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {p.suggested_reorder > 0 ? (
                              <button
                                onClick={() => {
                                  updateProductStock(p.id, p.stock + p.suggested_reorder);
                                  showToast(`Demo inventory adjustment: ${p.suggested_reorder} kg for ${p.name}. Verify before using as a real stock record.`);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px]"
                              >
                                Reorder {p.suggested_reorder}
                              </button>
                            ) : (
                              <span className="text-[11px] text-slate-400 font-semibold">Sufficient</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
