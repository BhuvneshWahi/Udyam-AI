import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { NotificationCenter } from './components/NotificationCenter';
import { NotificationToastContainer } from './components/NotificationToastContainer';
import { VoiceModal } from './components/VoiceModal';
import { AuthModal } from './components/auth/AuthModal';
import { useApp } from './context/AppContext';

// Consolidated Destination Pages
import { Home } from './pages/Home';
import { AICopilot } from './pages/AICopilot';
import { FinancialHealth } from './pages/FinancialHealth';
import { MarketIntelligenceHub } from './pages/MarketIntelligenceHub';
import { Inventory } from './pages/Inventory';
import { FinancialControl } from './pages/FinancialControl';
import { ProcurementReconciliation } from './pages/ProcurementReconciliation';
import { EInvoice } from './pages/EInvoice';
import { AgreementAnalysisPage } from './pages/AgreementAnalysisPage';
import { DocumentAssurance } from './pages/DocumentAssurance';
import { ComplianceCenterHub } from './pages/ComplianceCenterHub';
import { GovernmentSchemes } from './pages/GovernmentSchemes';
import { ActionCenterHub } from './pages/ActionCenterHub';
import { UploadCenter } from './pages/UploadCenter';
import { BusinessProfilePage } from './pages/BusinessProfile';
import { SalesBI } from './pages/SalesBI';
import { VoiceAssistantPage } from './pages/VoiceAssistantPage';

export default function App() {
  const { toastMessage, isAuthModalOpen, setAuthModalOpen, refreshAuthSession } = useApp();

  return (
    <div className="flex h-screen bg-udyam-surface overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* Global Utilities Header */}
        <Header />

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto relative custom-scrollbar">
          <Routes>
            {/* 1. OVERVIEW */}
            <Route path="/" element={<Home />} />
            <Route path="/copilot" element={<AICopilot />} />

            {/* 2. BUSINESS INTELLIGENCE */}
            <Route path="/financial-health" element={<FinancialHealth />} />
            <Route path="/business-health" element={<FinancialHealth />} />
            <Route path="/sales" element={<SalesBI />} />
            <Route path="/market-intelligence" element={<MarketIntelligenceHub />} />
            <Route path="/inventory" element={<Inventory />} />

            {/* Old Market Intel Routes -> Redirect to Consolidated Tabs */}
            <Route path="/market-demand" element={<Navigate to="/market-intelligence?tab=demand" replace />} />
            <Route path="/signals" element={<Navigate to="/market-intelligence?tab=signals" replace />} />
            <Route path="/festival-trends" element={<Navigate to="/market-intelligence?tab=festivals" replace />} />
            <Route path="/forecast" element={<Navigate to="/market-intelligence?tab=forecast" replace />} />

            {/* 3. FINANCE & OPERATIONS */}
            <Route path="/financial-control" element={<FinancialControl />} />
            <Route path="/finance" element={<FinancialControl />} />
            <Route path="/procurement-reconciliation" element={<ProcurementReconciliation />} />

            {/* Old Finance Routes -> Redirect to Consolidated Tabs */}
            <Route path="/cash-flow" element={<Navigate to="/financial-control?tab=cash-flow" replace />} />
            <Route path="/customer-payments" element={<Navigate to="/financial-control?tab=customer-payments" replace />} />
            <Route path="/profit-leaks" element={<Navigate to="/financial-control?tab=profit-leaks" replace />} />
            <Route path="/profit-leak-detector" element={<Navigate to="/financial-control?tab=profit-leaks" replace />} />

            {/* Old Procurement Routes -> Redirect to Consolidated Tabs */}
            <Route path="/reconciliation" element={<Navigate to="/procurement-reconciliation?tab=reconciliation" replace />} />
            <Route path="/purchase-orders" element={<Navigate to="/procurement-reconciliation?tab=purchase-orders" replace />} />
            <Route path="/purchase-requisitions" element={<Navigate to="/procurement-reconciliation?tab=purchase-requisitions" replace />} />
            <Route path="/purchase-indent" element={<Navigate to="/procurement-reconciliation?tab=purchase-requisitions" replace />} />
            <Route path="/purchase-indent-pi" element={<Navigate to="/procurement-reconciliation?tab=purchase-requisitions" replace />} />
            <Route path="/purchase-request" element={<Navigate to="/procurement-reconciliation?tab=purchase-requisitions" replace />} />

            {/* 4. DOCUMENTS */}
            <Route path="/e-invoice" element={<EInvoice />} />
            <Route path="/agreement-analysis" element={<AgreementAnalysisPage />} />
            <Route path="/document-assurance" element={<DocumentAssurance />} />

            {/* Old Invoice Routes -> Redirect to E-Invoice */}
            <Route path="/invoice-generator" element={<Navigate to="/e-invoice?tab=tax-invoice" replace />} />
            <Route path="/proforma-invoice" element={<Navigate to="/e-invoice?tab=proforma" replace />} />

            {/* 5. COMPLIANCE */}
            <Route path="/compliance" element={<ComplianceCenterHub />} />
            <Route path="/schemes" element={<GovernmentSchemes />} />

            {/* Old Compliance Routes -> Redirect to Compliance Tabs */}
            <Route path="/gst-assistant" element={<Navigate to="/compliance?tab=gst" replace />} />
            <Route path="/pan-verification" element={<Navigate to="/compliance?tab=pan" replace />} />
            <Route path="/pan-assistant" element={<Navigate to="/compliance?tab=pan" replace />} />
            <Route path="/udyam-registration" element={<Navigate to="/compliance?tab=udyam" replace />} />
            <Route path="/udyam-assistant" element={<Navigate to="/compliance?tab=udyam" replace />} />
            <Route path="/smart-reminders" element={<Navigate to="/compliance?tab=deadlines" replace />} />

            {/* 6. ACTIONS */}
            <Route path="/actions" element={<ActionCenterHub />} />
            <Route path="/action-plan" element={<Navigate to="/actions?tab=action_plan" replace />} />
            <Route path="/insights" element={<Navigate to="/actions?tab=insights" replace />} />

            {/* 7. DATA */}
            <Route path="/upload" element={<UploadCenter />} />
            <Route path="/profile" element={<BusinessProfilePage />} />

            {/* AI Tools */}
            <Route path="/voice" element={<VoiceAssistantPage />} />
            <Route path="/voice-interface" element={<VoiceAssistantPage />} />

            {/* Catch-all redirect to Home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>

        {/* Global Notification Center Slideout Drawer */}
        <NotificationCenter />

        {/* Global Non-blocking Notification Toasts */}
        <NotificationToastContainer />

        {/* Global Floating Voice Assistant Modal */}
        <VoiceModal />

        {/* Supabase Multi-Tenant Auth & Two-Level Security (MFA) Modal */}
        <AuthModal 
          isOpen={isAuthModalOpen} 
          onClose={() => setAuthModalOpen(false)} 
          onSuccess={() => refreshAuthSession()} 
        />

        {/* Toast Notification Overlay */}
        {toastMessage && (
          <div className="fixed bottom-5 right-5 bg-slate-900 text-white text-xs font-bold px-4 py-3 rounded-xl shadow-2xl border border-slate-800 z-50 animate-in fade-in slide-in-from-bottom-2 duration-150 flex items-center space-x-2">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            <span>{toastMessage}</span>
          </div>
        )}
      </div>
    </div>
  );
}
