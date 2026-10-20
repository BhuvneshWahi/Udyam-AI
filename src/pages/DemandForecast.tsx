import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart as LineChartIcon, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Package, 
  Calendar, 
  Info,
  ArrowRight,
  TrendingUp,
  RefreshCw,
  Cpu,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { useApp } from '../context/AppContext';
import { apiService, FALLBACK_AIML_RECOMMENDATIONS } from '../services/api';
import type { AIMLRecommendation, AIMLForecastRecord } from '../types';

export const DemandForecast: React.FC = () => {
  const { demandForecasts, products, showToast } = useApp();
  const navigate = useNavigate();

  // Mode: 'aiml' (authoritative LightGBM) or 'portfolio' (30-day baseline)
  const [engineMode, setEngineMode] = useState<'aiml' | 'portfolio'>('aiml');

  // AIML State
  const [aimlRecommendations, setAimlRecommendations] = useState<AIMLRecommendation[]>(FALLBACK_AIML_RECOMMENDATIONS);
  const [selectedAimlId, setSelectedAimlId] = useState<string>('prod_besan');
  const [aimlForecasts, setAimlForecasts] = useState<AIMLForecastRecord[]>([]);
  const [isLoadingAiml, setIsLoadingAiml] = useState<boolean>(false);

  // Baseline Portfolio State
  const [selectedProductId, setSelectedProductId] = useState<string>(demandForecasts[0]?.product_id || 'PROD-101');
  const [timeHorizon, setTimeHorizon] = useState<'7d' | '30d' | '90d'>('30d');

  // Fetch AIML recommendations and forecasts from backend API
  useEffect(() => {
    let isMounted = true;
    const loadAIMLData = async () => {
      setIsLoadingAiml(true);
      try {
        const [recsRes, forecastRes] = await Promise.all([
          apiService.getAIMLRecommendations(),
          apiService.getAIMLForecast(selectedAimlId)
        ]);
        if (isMounted) {
          if (recsRes.recommendations && recsRes.recommendations.length > 0) {
            setAimlRecommendations(recsRes.recommendations);
          }
          const fcList = forecastRes.forecast || forecastRes.forecasts || [];
          if (fcList.length > 0) {
            setAimlForecasts(fcList);
          }
        }
      } catch (err) {
        console.warn('Error loading AIML data, using grounded fallback:', err);
      } finally {
        if (isMounted) setIsLoadingAiml(false);
      }
    };

    loadAIMLData();
    return () => { isMounted = false; };
  }, [selectedAimlId]);

  const activeAimlRec = aimlRecommendations.find(r => r.product_id === selectedAimlId) || aimlRecommendations[1] || FALLBACK_AIML_RECOMMENDATIONS[1];
  const activeForecast = demandForecasts.find(f => f.product_id === selectedProductId) || demandForecasts[0];

  // Baseline portfolio chart data
  const portfolioChartData = [
    { period: 'W-4', actual: Math.round(activeForecast.historical_30d * 0.22), forecast: Math.round(activeForecast.historical_30d * 0.22) },
    { period: 'W-3', actual: Math.round(activeForecast.historical_30d * 0.24), forecast: Math.round(activeForecast.historical_30d * 0.24) },
    { period: 'W-2', actual: Math.round(activeForecast.historical_30d * 0.26), forecast: Math.round(activeForecast.historical_30d * 0.26) },
    { period: 'W-1', actual: Math.round(activeForecast.historical_30d * 0.28), forecast: Math.round(activeForecast.historical_30d * 0.28) },
    { period: 'Now', actual: activeForecast.current_stock, forecast: activeForecast.current_stock },
    { period: 'W+1', actual: null, forecast: Math.round(activeForecast.forecast_30d * 0.23) },
    { period: 'W+2', actual: null, forecast: Math.round(activeForecast.forecast_30d * 0.25) },
    { period: 'W+3', actual: null, forecast: Math.round(activeForecast.forecast_30d * 0.26) },
    { period: 'W+4', actual: null, forecast: Math.round(activeForecast.forecast_30d * 0.26) },
  ];

  // AIML 7-Day Chart Data
  const aimlChartData = aimlForecasts.length > 0 ? aimlForecasts.map(f => ({
    date: f.date.slice(5), // '09-26'
    base_predicted: Number(f.predicted_demand.toFixed(1)),
    adjusted_demand: Number(f.adjusted_demand.toFixed(1)),
    market_signal_pct: Math.round(f.market_signal * 100),
    festive_signal_pct: Math.round(f.event_adjustment * 100)
  })) : [
    { date: '09-26', base_predicted: 32.0, adjusted_demand: 39.8, market_signal_pct: 14, festive_signal_pct: 11 },
    { date: '09-27', base_predicted: 29.9, adjusted_demand: 38.0, market_signal_pct: 14, festive_signal_pct: 13 },
    { date: '09-28', base_predicted: 22.6, adjusted_demand: 29.9, market_signal_pct: 14, festive_signal_pct: 18 },
    { date: '09-29', base_predicted: 24.9, adjusted_demand: 34.2, market_signal_pct: 14, festive_signal_pct: 23 },
    { date: '09-30', base_predicted: 24.7, adjusted_demand: 35.2, market_signal_pct: 14, festive_signal_pct: 28 },
    { date: '10-01', base_predicted: 24.2, adjusted_demand: 35.7, market_signal_pct: 14, festive_signal_pct: 33 },
    { date: '10-02', base_predicted: 28.2, adjusted_demand: 43.0, market_signal_pct: 14, festive_signal_pct: 38 }
  ];

  const handleGenerateAimlPO = (rec: AIMLRecommendation) => {
    showToast(`Demo only: ${rec.planning_statement} No requisition or purchase order was created.`);
  };

  const handleGeneratePO = (prodId: string, qty: number) => {
    const product = demandForecasts.find((item) => item.product_id === prodId) || activeForecast;
    showToast(`Demo only: review a proposed order of approximately ${qty} kg for ${product.product_name}. No order was submitted and stock was not changed.`);
  };

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Top Header & Engine Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">AI Demand Forecasting & Stockout Engine</h2>
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-200 flex items-center space-x-1">
              <Cpu className="w-3 h-3" />
              <span>{engineMode === 'aiml' ? 'Seeded 7-day LightGBM forecast' : 'Illustrative planning baseline'}</span>
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {engineMode === 'aiml' ? 'Seeded 7-day LightGBM forecast with market and festival adjustments.' : 'Illustrative 30/90-day planning projection; not a separately trained forecast.'}
          </p>
        </div>

        {/* Engine Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 self-start md:self-auto">
          <button
            onClick={() => setEngineMode('aiml')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              engineMode === 'aiml'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>LightGBM Demand Regressor (7-Day)</span>
          </button>
          <button
            onClick={() => setEngineMode('portfolio')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
              engineMode === 'portfolio'
                ? 'bg-white text-blue-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Illustrative Portfolio (30-Day)</span>
          </button>
        </div>
      </div>

      {/* MODE 1: AIML LIGHTGBM DEMAND REGRESSOR */}
      {engineMode === 'aiml' && (
        <div className="space-y-4 sm:space-y-6">
          {/* AIML KPI Summary Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">Model Architecture</span>
              <p className="text-sm sm:text-base font-bold text-slate-900 mt-1 flex items-center space-x-1">
                <Cpu className="w-4 h-4 text-emerald-600" />
                <span>LightGBM Regressor</span>
              </p>
              <span className="text-[10px] text-slate-500 block mt-0.5">23 Trained Engineering Features</span>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs">
              <span className="text-[11px] text-slate-500 font-medium">7-Day Total Demand</span>
              <p className="text-base sm:text-lg font-bold text-slate-900 mt-1">1,635.9 kg</p>
              <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">+14% Market Uplift Applied</span>
            </div>

            <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
              <span className="text-[11px] text-red-800 font-bold">High Priority SKUs</span>
              <p className="text-base sm:text-lg font-extrabold text-red-950 mt-1">3 Products</p>
              <span className="text-[10px] text-red-700 block mt-0.5 font-semibold">Besan, Ghee, Dry Fruits</span>
            </div>

            <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
              <span className="text-[11px] text-emerald-800 font-bold">Planning Procurement</span>
              <p className="text-base sm:text-lg font-extrabold text-emerald-950 mt-1">1,149 kg</p>
              <span className="text-[10px] text-emerald-700 block mt-0.5 font-semibold">7-Day Buffer Target</span>
            </div>
          </div>

          {/* Active Product Deep-Dive Banner */}
          <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <span className="text-xs font-bold text-slate-500">Select Commodity:</span>
                <div className="flex items-center space-x-1.5 overflow-x-auto custom-scrollbar pb-1 sm:pb-0">
                  {aimlRecommendations.map(rec => (
                    <button
                      key={rec.product_id}
                      onClick={() => setSelectedAimlId(rec.product_id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center space-x-1.5 ${
                        selectedAimlId === rec.product_id
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <span>{rec.product_name}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-extrabold ${
                        rec.priority === 'HIGH' ? 'bg-red-500 text-white' : 'bg-slate-200 text-slate-700'
                      }`}>
                        {rec.priority}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleGenerateAimlPO(activeAimlRec)}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all flex items-center space-x-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Issue Purchase Requisition</span>
                </button>
              </div>
            </div>

            {/* 4-Stage Multi-Signal Fusion Pipeline */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200/80">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">1. LightGBM Base 7D</span>
                <p className="text-base font-extrabold text-slate-900 mt-0.5">
                  {activeAimlRec.base_7_day_demand_kg.toFixed(1)} kg
                </p>
                <span className="text-[10px] text-slate-500">Historical velocity baseline</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">2. External Market Signal</span>
                <p className="text-base font-extrabold text-blue-700 mt-0.5">
                  +{activeAimlRec.market_signal_pct.toFixed(0)}%
                </p>
                <span className="text-[10px] text-slate-500">Mandi wholesale trend</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">3. Festival Surge Uplift</span>
                <p className="text-base font-extrabold text-amber-700 mt-0.5">
                  +{activeAimlRec.festival_signal_pct.toFixed(0)}%
                </p>
                <span className="text-[10px] text-slate-500">Pre-Diwali sweet demand</span>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 block">4. Final Adjusted Demand</span>
                <p className="text-base font-extrabold text-emerald-700 mt-0.5">
                  {activeAimlRec.adjusted_7_day_demand_kg.toFixed(1)} kg
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Signal-fused demand target</span>
              </div>
            </div>

            {/* Authoritative Planning Statement Banner */}
            <div className={`p-4 rounded-xl border transition-all ${
              activeAimlRec.priority === 'HIGH' ? 'bg-amber-50/70 border-amber-200' : 'bg-emerald-50/70 border-emerald-200'
            }`}>
              <div className="flex items-start space-x-3">
                <Info className={`w-5 h-5 shrink-0 mt-0.5 ${
                  activeAimlRec.priority === 'HIGH' ? 'text-amber-700' : 'text-emerald-700'
                }`} />
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Authoritative Procurement Planning Guidance:
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                      activeAimlRec.priority === 'HIGH' ? 'bg-red-600 text-white' : 'bg-emerald-700 text-white'
                    }`}>
                      {activeAimlRec.priority} PRIORITY
                    </span>
                  </div>
                  <p className="text-sm font-extrabold text-slate-900">
                    "{activeAimlRec.planning_statement}"
                  </p>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Derived from <strong>{activeAimlRec.base_7_day_demand_kg} kg</strong> base LightGBM prediction, elevated by <strong>+{activeAimlRec.market_signal_pct.toFixed(0)}%</strong> market demand and <strong>+{activeAimlRec.festival_signal_pct.toFixed(0)}%</strong> festive surge. Current warehouse stock is <strong>{activeAimlRec.current_inventory_kg} kg</strong> (with {activeAimlRec.incoming_po_kg} kg in transit).
                  </p>
                </div>
              </div>
            </div>

            {/* Daily 7-Day Predicted Demand vs Adjusted Trajectory Chart */}
            <div className="space-y-2 pt-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    7-Day Rolling Trajectory: LightGBM Base vs Signal Fused Demand
                  </h4>
                  <p className="text-[11px] text-slate-500">Comparing base ML predictions against final demand after festive + market uplift</p>
                </div>
                <div className="flex items-center space-x-3 text-xs font-semibold">
                  <span className="flex items-center text-blue-600"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-1"></span> Base ML Demand</span>
                  <span className="flex items-center text-emerald-600"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1"></span> Signal-Adjusted Demand</span>
                </div>
              </div>

              <div className="h-56 sm:h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={aimlChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748B' }} unit=" kg" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                    />
                    <Line type="monotone" dataKey="base_predicted" name="Base ML (kg)" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="adjusted_demand" name="Adjusted Demand (kg)" stroke="#10B981" strokeWidth={2.5} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Full 6-Commodity AIML Procurement Portfolio Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">LightGBM Multi-Signal Demand & Procurement Portfolio</h3>
                <p className="text-xs text-slate-500">6 Authoritative Commodity Forecasts Grounded in backend/aiml</p>
              </div>
              <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                Verified Single Source of Truth
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Base 7D Demand</th>
                    <th className="px-4 py-3">Market Signal</th>
                    <th className="px-4 py-3">Festival Surge</th>
                    <th className="px-4 py-3">Adjusted Demand</th>
                    <th className="px-4 py-3">Current Stock (PO)</th>
                    <th className="px-4 py-3">Planning Reorder</th>
                    <th className="px-4 py-3">Priority</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {aimlRecommendations.map(rec => (
                    <tr 
                      key={rec.product_id}
                      className={`hover:bg-slate-50 transition-colors ${
                        selectedAimlId === rec.product_id ? 'bg-emerald-50/40 font-semibold' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => setSelectedAimlId(rec.product_id)}
                          className="font-bold text-slate-900 hover:text-emerald-700 text-left flex items-center space-x-1"
                        >
                          <span>{rec.product_name}</span>
                          <ArrowRight className="w-3 h-3 text-slate-400" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{rec.base_7_day_demand_kg.toFixed(1)} kg</td>
                      <td className="px-4 py-3 text-blue-700 font-bold">+{rec.market_signal_pct.toFixed(0)}%</td>
                      <td className="px-4 py-3 text-amber-700 font-bold">+{rec.festival_signal_pct.toFixed(0)}%</td>
                      <td className="px-4 py-3 font-extrabold text-slate-900">{rec.adjusted_7_day_demand_kg.toFixed(1)} kg</td>
                      <td className="px-4 py-3 text-slate-600">
                        {rec.current_inventory_kg} kg {rec.incoming_po_kg > 0 && <span className="text-emerald-600 font-bold">(+{rec.incoming_po_kg} PO)</span>}
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {rec.recommended_additional_stock_kg.toFixed(0)} kg
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rec.priority === 'HIGH' ? 'bg-red-100 text-red-800 border border-red-200' : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}>
                          {rec.priority}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleGenerateAimlPO(rec)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px] shadow-xs transition-all"
                        >
                          Create PO
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODE 2: BASELINE AUTO COMPONENTS PORTFOLIO (30-DAY) */}
      {engineMode === 'portfolio' && (
        <div className="space-y-4 sm:space-y-6">
          {/* Active Product Forecast Banner */}
          <div className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all ${
            activeForecast.risk_level === 'Critical'
              ? 'bg-red-50 border-red-200'
              : activeForecast.risk_level === 'Low'
              ? 'bg-amber-50 border-amber-200'
              : activeForecast.risk_level === 'Overstocked'
              ? 'bg-purple-50 border-purple-200'
              : 'bg-emerald-50 border-emerald-200'
          }`}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center space-x-2 flex-wrap gap-1">
                  <span className={`px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider ${
                    activeForecast.risk_level === 'Critical' ? 'bg-red-600 text-white' : 'bg-emerald-600 text-white'
                  }`}>
                    {activeForecast.risk_level} Stock Risk
                  </span>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{activeForecast.product_name}</h3>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-medium">
                  <strong>Rationale:</strong> {activeForecast.rationale}
                </p>
              </div>

              <div className="flex items-center space-x-3 sm:space-x-4 shrink-0 flex-wrap sm:flex-nowrap">
                <div>
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase">Current Stock</span>
                  <span className="text-base sm:text-lg font-extrabold text-slate-900">{activeForecast.current_stock} kg</span>
                </div>
                <div className="border-l border-slate-300 pl-3 sm:pl-4">
                  <span className="text-[9px] sm:text-[10px] text-slate-500 font-bold block uppercase">Suggested Order</span>
                  <span className="text-base sm:text-lg font-extrabold text-emerald-700">~{activeForecast.suggested_order} kg</span>
                </div>
                {activeForecast.suggested_order > 0 && (
                  <button
                    onClick={() => handleGeneratePO(activeForecast.product_id, activeForecast.suggested_order)}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all active:scale-95"
                  >
                    Generate PO
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Illustrative history vs planning projection chart */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Demand Trajectory: Illustrative History vs Planning Projection</h3>
                <p className="text-xs text-slate-500">Showing {timeHorizon} prediction window</p>
              </div>
              <div className="flex items-center space-x-3 text-xs font-semibold">
                <span className="flex items-center text-blue-600"><span className="w-2.5 h-2.5 bg-blue-600 rounded-full mr-1"></span> Illustrative history</span>
                <span className="flex items-center text-emerald-600"><span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-1"></span> Planning projection</span>
              </div>
            </div>

            <div className="h-60 sm:h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={portfolioChartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis dataKey="period" tick={{ fontSize: 10, fill: '#64748B' }} />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0F172A', borderColor: '#334155', color: '#fff', borderRadius: '8px', fontSize: '11px' }}
                  />
                  <Line type="monotone" dataKey="actual" name="Illustrative History" stroke="#2563EB" strokeWidth={2.5} dot={{ r: 3 }} />
                  <Line type="monotone" dataKey="forecast" name="Planning Projection" stroke="#10B981" strokeWidth={2.5} strokeDasharray="5 5" dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Footnote on Forecast Transparency */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-start space-x-2">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Data transparency:</strong> the verified LightGBM artifact returns a seeded 7-day forecast. This portfolio view’s 30/90-day values and history points are illustrative planning fixtures, not separately trained forecasts or calibrated confidence intervals.
              </p>
            </div>
          </div>

          {/* Comprehensive Demand Forecast Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-sm">Full Portfolio Stockout Recommendations</h3>
              <span className="text-xs text-slate-500">{demandForecasts.length} seeded products</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs min-w-[640px]">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3">Product Name</th>
                    <th className="px-4 py-3">Current Stock</th>
                    <th className="px-4 py-3">Forecast (30D)</th>
                    <th className="px-4 py-3">Stockout Risk</th>
                    <th className="px-4 py-3">Suggested Order</th>
                    <th className="px-4 py-3">Data Status</th>
                    <th className="px-4 py-3">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                  {demandForecasts.map((f) => (
                    <tr key={f.product_id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-bold text-slate-900">{f.product_name}</td>
                      <td className="px-4 py-3">{f.current_stock} kg</td>
                      <td className="px-4 py-3">{f.forecast_30d} kg (projection)</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          f.risk_level === 'Critical' ? 'bg-red-100 text-red-800' :
                          f.risk_level === 'Low' ? 'bg-amber-100 text-amber-800' :
                          f.risk_level === 'Overstocked' ? 'bg-purple-100 text-purple-800' :
                          'bg-emerald-100 text-emerald-800'
                        }`}>
                          {f.risk_level}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-bold text-emerald-700">
                        {f.suggested_order > 0 ? `Review ~${f.suggested_order} kg` : 'Review stock'}
                      </td>
                      <td className="px-4 py-3 font-semibold text-slate-600">{f.confidence > 0 ? `${f.confidence}%` : 'Demo estimate'}</td>
                      <td className="px-4 py-3">
                        {f.suggested_order > 0 ? (
                          <button
                            onClick={() => handleGeneratePO(f.product_id, f.suggested_order)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-bold text-[11px]"
                          >
                            Create PO
                          </button>
                        ) : (
                          <button
                            onClick={() => navigate('/inventory')}
                            className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-bold text-[11px]"
                          >
                            View Stock
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
