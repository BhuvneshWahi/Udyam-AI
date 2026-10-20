import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu,
  Search, 
  Mic, 
  Bell, 
  RefreshCw, 
  ShieldCheck, 
  ShieldAlert,
  Lock,
  ChevronLeft,
  ChevronRight,
  Globe,
  Check,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n/translations';
import { pwaManager, PwaState } from '../services/pwaManager';


export const Header: React.FC = () => {
  const { 
    profile, 
    isRefreshing,
    refreshAllData,
    unreadNotifCount,
    setNotificationCenterOpen,
    setVoiceModalOpen, 
    setMobileSidebarOpen, 
    isDesktopCollapsed, 
    toggleDesktopSidebar,
    currentLanguage,
    setLanguage,
    setAuthModalOpen,
    currentUser,
    currentBusiness,
    t
  } = useApp();

  const [isLangOpen, setLangOpen] = useState(false);
  const [isSearchOpenMobile, setSearchOpenMobile] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [pwaState, setPwaState] = useState<PwaState>(() => pwaManager.getState());
  const navigate = useNavigate();
  const location = useLocation();

  React.useEffect(() => {
    return pwaManager.subscribe((state) => {
      setPwaState(state);
    });
  }, []);


  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/copilot?q=${encodeURIComponent(searchInput)}`);
      setSearchInput('');
      setSearchOpenMobile(false);
    }
  };

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/': return t('nav.home');
      case '/copilot': return t('nav.copilot');
      case '/financial-health':
      case '/business-health': return t('nav.business_health');
      case '/market-intelligence': return t('nav.market_intel');
      case '/market-demand': return t('nav.market_demand');
      case '/festival-trends': return t('nav.festival_trends');
      case '/forecast': return t('nav.forecast');
      case '/inventory': return t('nav.inventory');
      case '/signals': return t('nav.signals');
      case '/financial-control':
      case '/finance': return t('nav.financial_control');
      case '/cash-flow': return t('nav.cash_flow');
      case '/customer-payments': return t('nav.customer_payments');
      case '/profit-leaks': return t('nav.profit_leaks');
      case '/procurement-reconciliation': return t('nav.procurement_reconciliation');
      case '/reconciliation': return t('nav.reconciliation');
      case '/e-invoice':
      case '/invoice-generator': return t('nav.e_invoice');
      case '/proforma-invoice': return t('nav.proforma');
      case '/purchase-orders': return t('nav.purchase_orders');
      case '/purchase-requisitions': return t('nav.purchase_reqs');
      case '/agreement-analysis': return t('nav.agreement_analysis');
      case '/document-assurance': return t('nav.doc_assurance');
      case '/compliance': return t('nav.compliance_hub');
      case '/gst-assistant': return t('nav.gst_assistant');
      case '/pan-verification': return t('nav.pan_verify');
      case '/udyam-registration': return t('nav.udyam_reg');
      case '/smart-reminders': return t('nav.smart_reminders');
      case '/schemes': return t('nav.schemes');
      case '/actions': return t('nav.actions');
      case '/action-plan': return t('nav.action_plan');
      case '/insights': return t('nav.insights');
      case '/upload': return t('nav.upload');
      case '/profile': return t('nav.profile');
      case '/voice': return t('nav.voice');
      default: return 'UDYAM AI';
    }
  };

  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === currentLanguage);

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shadow-xs">
      {/* Left Area: Mobile Hamburger + Desktop Title */}
      <div className="flex items-center space-x-3">
        {/* Mobile Hamburger Menu Toggle Button */}
        <button
          onClick={() => setMobileSidebarOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg md:hidden transition-colors"
          aria-label="Open mobile navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle Indicator */}
        <button
          onClick={toggleDesktopSidebar}
          className="hidden md:flex lg:hidden p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        {/* Page Title & Status */}
        <div className="flex items-center space-x-2">
          <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight truncate max-w-[170px] sm:max-w-none">
            {getPageTitle()}
          </h1>
          <span className="hidden xl:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <ShieldCheck className="w-3 h-3 mr-1 text-emerald-600" /> Sharma General Store
          </span>
        </div>
      </div>

      {/* Right Area: Controls & Search */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {/* Desktop Search Bar */}
        <form onSubmit={handleSearchSubmit} className="hidden lg:flex items-center relative">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder={t('common.search_placeholder')}
            className="w-52 xl:w-64 pl-9 pr-8 py-1.5 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
          <button
            type="button"
            onClick={() => setVoiceModalOpen(true)}
            className="absolute right-2 p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
            title="Voice Assistant"
          >
            <Mic className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Mobile Search Toggle Icon */}
        <button
          onClick={() => setSearchOpenMobile(!isSearchOpenMobile)}
          className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
          aria-label="Toggle mobile search bar"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Voice Trigger Button */}
        <button
          onClick={() => setVoiceModalOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg text-xs font-semibold hover:shadow-md transition-all active:scale-95"
          aria-label="Open voice assistant"
        >
          <Mic className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('common.voice')}</span>
        </button>

        {/* Global Notification Center Bell Button */}
        <button
          onClick={() => setNotificationCenterOpen(true)}
          className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors relative"
          aria-label="View notifications and statutory deadlines"
          title="Notification Center & Statutory Deadlines"
        >
          <Bell className="w-4 h-4" />
          {unreadNotifCount > 0 && (
            <span className="absolute top-1 right-1 min-w-[16px] h-4 px-1 bg-red-500 text-white rounded-full text-[9px] font-extrabold flex items-center justify-center animate-pulse">
              {unreadNotifCount}
            </span>
          )}
        </button>

        {/* 16-Language Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setLangOpen(!isLangOpen)}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 transition-colors"
            title="Switch Language (16 Indian Languages Supported)"
            aria-label="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate max-w-[70px] sm:max-w-none">{currentLangObj?.nativeName || 'English'}</span>
          </button>

          {isLangOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl border border-slate-200 py-2 z-50 text-xs animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                <span>Select Language</span>
                <span className="text-emerald-600 font-extrabold">16 Langs</span>
              </div>
              <div className="max-h-72 overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-slate-50 transition-colors ${
                      currentLanguage === lang.code ? 'font-bold text-emerald-600 bg-emerald-50/50' : 'text-slate-700'
                    }`}
                  >
                    <div>
                      <span className="font-semibold block">{lang.nativeName}</span>
                      <span className="text-[10px] text-slate-400">{lang.name}</span>
                    </div>
                    {currentLanguage === lang.code && (
                      <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 ml-2" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Install PWA Button (Hidden once installed) */}
        {!pwaState.isInstalled && (
          <button
            onClick={() => pwaManager.promptInstall()}
            className="flex items-center space-x-1.5 px-2.5 py-1.5 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 rounded-lg text-xs font-semibold border border-emerald-300 transition-all active:scale-95 shadow-2xs"
            title="Install UDYAM AI App to your device"
            aria-label="Install App"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="hidden sm:inline">{t('common.install_app')}</span>
          </button>
        )}

        {/* Global Refresh Button */}
        <button
          onClick={refreshAllData}
          disabled={isRefreshing}
          className="flex items-center space-x-1.5 px-2.5 py-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg text-xs font-semibold border border-slate-200 transition-colors disabled:opacity-60"
          title="Refresh All Business Metrics"
          aria-label="Refresh Business Data"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-emerald-600 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{isRefreshing ? 'Refreshing...' : t('common.refresh')}</span>
        </button>

        {/* Two-Level Security (MFA) Status Badge & Modal Trigger */}
        <button
          onClick={() => setAuthModalOpen(true)}
          className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all active:scale-95 ${
            currentUser?.mfa_enabled
              ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
          title="Two-Level Security (Supabase MFA / TOTP)"
          aria-label="Manage Two-Level Security"
        >
          {currentUser?.mfa_enabled ? (
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          ) : (
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 shrink-0" />
          )}
          <span className="hidden lg:inline">
            {currentUser?.mfa_enabled ? 'MFA: Active' : 'MFA: Setup'}
          </span>
          <span className="text-[10px] px-1 bg-white rounded font-mono font-bold text-slate-600 border border-slate-200">
            {currentBusiness?.role || 'OWNER'}
          </span>
        </button>

        {/* Business Profile Avatar */}
        <button 
          onClick={() => setAuthModalOpen(true)}
          className="flex items-center space-x-2 pl-1.5 sm:pl-2 border-l border-slate-200 hover:opacity-80 transition-opacity"
          aria-label="Manage Account and Multi-Tenant Access"
          title="Account & Multi-Tenant Access"
        >
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center border border-slate-700 shadow-xs shrink-0">
            {(currentUser?.full_name || profile.owner || 'RS').slice(0, 2).toUpperCase()}
          </div>
          <div className="hidden xl:block text-left">
            <p className="text-xs font-semibold text-slate-800 leading-tight">
              {currentUser?.full_name || profile.owner}
            </p>
            <p className="text-[10px] text-slate-500 leading-none">
              {currentBusiness?.name ? currentBusiness.name.slice(0, 18) : profile.city}
            </p>
          </div>
        </button>
      </div>

      {/* Mobile Expandable Search Bar */}
      {isSearchOpenMobile && (
        <div className="absolute top-16 left-0 right-0 bg-white border-b border-slate-200 p-3 lg:hidden shadow-md z-30 animate-in slide-in-from-top-2 duration-150">
          <form onSubmit={handleSearchSubmit} className="flex items-center space-x-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={t('common.search_placeholder')}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-100 border border-slate-200 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                autoFocus
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            </div>
            <button
              type="submit"
              className="px-3 py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold"
            >
              Ask
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
