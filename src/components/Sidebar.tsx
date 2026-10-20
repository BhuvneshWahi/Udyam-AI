import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Bot, 
  TrendingUp, 
  Package, 
  ShieldCheck, 
  Building2, 
  CheckSquare, 
  Upload, 
  UserCheck,
  Sparkles,
  X,
  ChevronLeft,
  ChevronRight,
  Activity,
  BarChart3,
  FileText,
  FileSearch,
  Layers,
  CreditCard,
  Download
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pwaManager, PwaState } from '../services/pwaManager';


interface NavItem {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  badge?: string;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const { 
    kpis, 
    compliance, 
    isMobileSidebarOpen, 
    closeMobileSidebar, 
    isDesktopCollapsed, 
    toggleDesktopSidebar,
    t
  } = useApp();
  const location = useLocation();
  const [pwaState, setPwaState] = React.useState<PwaState>(() => pwaManager.getState());

  React.useEffect(() => {
    return pwaManager.subscribe((state) => {
      setPwaState(state);
    });
  }, []);

  // Close mobile sidebar automatically on location change
  React.useEffect(() => {
    closeMobileSidebar();
  }, [location.pathname]);


  const navItems: NavItem[] = [
    // 1. OVERVIEW
    { path: '/', label: t('nav.home'), icon: Home, group: t('group.overview') },
    { path: '/copilot', label: t('nav.copilot'), icon: Bot, group: t('group.overview'), highlight: true, badge: 'Llama 3.2' },

    // 2. BUSINESS INTELLIGENCE
    { path: '/financial-health', label: t('nav.business_health'), icon: Activity, group: t('group.bi') },
    { path: '/market-intelligence', label: t('nav.market_intel'), icon: BarChart3, group: t('group.bi'), badge: 'Signals' },
    { path: '/inventory', label: t('nav.inventory'), icon: Package, group: t('group.bi'), badge: kpis.low_stock_items > 0 ? `${kpis.low_stock_items} Alerts` : undefined },

    // 3. FINANCE & OPERATIONS
    { path: '/financial-control', label: t('nav.financial_control'), icon: CreditCard, group: t('group.finance'), badge: '₹1.4L Leak' },
    { path: '/procurement-reconciliation', label: t('nav.procurement_reconciliation'), icon: Layers, group: t('group.finance'), badge: 'PO / PR' },

    // 4. DOCUMENTS
    { path: '/e-invoice', label: t('nav.e_invoice'), icon: FileText, group: t('group.documents'), badge: 'GST Ready' },
    { path: '/agreement-analysis', label: t('nav.agreement_analysis'), icon: FileSearch, group: t('group.documents'), badge: 'AI' },
    { path: '/document-assurance', label: t('nav.doc_assurance'), icon: ShieldCheck, group: t('group.documents') },

    // 5. COMPLIANCE
    { path: '/compliance', label: t('nav.compliance_hub'), icon: ShieldCheck, group: t('group.compliance'), badge: compliance?.filings?.some(f => f.status === 'Pending') ? '1 Due' : undefined },
    { path: '/schemes', label: t('nav.schemes'), icon: Building2, group: t('group.compliance') },


    // 6. ACTIONS
    { path: '/actions', label: t('nav.action_plan'), icon: CheckSquare, group: t('group.actions'), badge: 'Prioritized' },

    // 7. DATA
    { path: '/upload', label: t('nav.upload'), icon: Upload, group: t('group.data') },
    { path: '/profile', label: t('nav.profile'), icon: UserCheck, group: t('group.data') },
  ];

  const renderNavLinks = (isMobile: boolean) => {
    let currentGroup = '';

    return navItems.map((item) => {
      const Icon = item.icon;
      const isNewGroup = item.group !== currentGroup;
      if (isNewGroup) {
        currentGroup = item.group;
      }

      return (
        <React.Fragment key={item.path}>
          {isNewGroup && (!isDesktopCollapsed || isMobile) && (
            <div className="pt-3 pb-1 px-3">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">
                {item.group}
              </span>
            </div>
          )}
          <NavLink
            to={item.path}
            onClick={isMobile ? closeMobileSidebar : undefined}
            title={isDesktopCollapsed && !isMobile ? item.label : undefined}
            className={({ isActive }) =>
              `flex items-center ${
                isDesktopCollapsed && !isMobile ? 'justify-center py-2.5 px-2' : 'justify-between px-3 py-2'
              } rounded-xl text-xs font-semibold transition-all duration-150 group ${
                isActive
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 font-bold'
                  : item.highlight
                  ? 'bg-slate-800/90 text-blue-400 hover:bg-slate-800 border border-blue-500/30 shadow-xs'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
              }`
            }
          >
            <div className="flex items-center space-x-2.5 min-w-0">
              <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${item.highlight ? 'text-blue-400' : ''}`} />
              {(!isDesktopCollapsed || isMobile) && (
                <span className="truncate">{item.label}</span>
              )}
            </div>
            {(!isDesktopCollapsed || isMobile) && item.badge && (
              <span className={`px-1.5 py-0.5 text-[9px] rounded font-bold shrink-0 ml-1.5 ${
                item.badge.includes('Alerts') || item.badge.includes('Due') || item.badge.includes('Critical') || item.badge.includes('Leak')
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                  : item.badge === 'Llama 3.2'
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}>
                {item.badge}
              </span>
            )}
          </NavLink>
        </React.Fragment>
      );
    });
  };

  return (
    <>
      {/* MOBILE OFF-CANVAS DRAWER (<768px) */}
      {isMobileSidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
            onClick={closeMobileSidebar}
            aria-hidden="true"
          />

          {/* Drawer Content */}
          <aside 
            className="relative w-72 max-w-[85vw] bg-slate-900 text-slate-300 flex flex-col h-full shadow-2xl border-r border-slate-800 z-50 animate-in slide-in-from-left duration-200"
            aria-label="Mobile Navigation Drawer"
          >
            {/* Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-emerald-500/20">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-white text-base tracking-tight">UDYAM</span>
                    <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">AI</span>
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">MSME Decision Copilot</p>
                </div>
              </div>

              <button
                onClick={closeMobileSidebar}
                className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
                aria-label="Close mobile navigation menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-0.5 custom-scrollbar">
              {renderNavLinks(true)}
            </nav>

            {/* Mobile Install Button */}
            {!pwaState.isInstalled && (
              <div className="p-3 border-t border-slate-800 bg-slate-950/40">
                <button
                  onClick={() => {
                    closeMobileSidebar();
                    pwaManager.promptInstall();
                  }}
                  className="w-full flex items-center justify-center space-x-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-md transition-colors"
                  aria-label="Install UDYAM AI App"
                >
                  <Download className="w-4 h-4 shrink-0" />
                  <span>{t('common.install_app')}</span>
                </button>
              </div>
            )}

            {/* Mobile Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-950/80 text-slate-400 text-xs shrink-0">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Enterprise</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              </div>
              <p className="font-bold text-slate-200 truncate">Sharma General Store</p>
              <p className="text-[11px] text-slate-500 truncate">Delhi • Grocery / Retail</p>
            </div>
          </aside>
        </div>
      )}

      {/* DESKTOP PERSISTENT SIDEBAR (>=768px) */}
      <aside 
        className={`hidden md:flex flex-col h-screen sticky top-0 bg-slate-900 text-slate-300 border-r border-slate-800 shrink-0 select-none z-30 transition-all duration-300 ${
          isDesktopCollapsed ? 'w-20' : 'w-64'
        }`}
        aria-label="Desktop Navigation Sidebar"
      >
        {/* Brand Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 shadow-lg shadow-emerald-500/20">
              <Sparkles className="w-5 h-5 text-white animate-pulse" />
            </div>
            {!isDesktopCollapsed && (
              <div className="transition-opacity duration-200">
                <div className="flex items-center space-x-1.5">
                  <span className="font-extrabold text-white text-lg tracking-tight">UDYAM</span>
                  <span className="bg-emerald-500 text-slate-950 text-[10px] font-black px-1.5 py-0.5 rounded tracking-wide uppercase">AI</span>
                </div>
                <p className="text-[11px] text-slate-400 font-medium">MSME Copilot</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle Button */}
          <button
            onClick={toggleDesktopSidebar}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            title={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-label={isDesktopCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isDesktopCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation Links Scroll Area */}
        <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 custom-scrollbar">
          {renderNavLinks(false)}
        </nav>

        {/* Desktop Install Button */}
        {!pwaState.isInstalled && !isDesktopCollapsed && (
          <div className="p-2 border-t border-slate-800 bg-slate-950/40 shrink-0">
            <button
              onClick={() => pwaManager.promptInstall()}
              className="w-full flex items-center justify-center space-x-2 py-1.5 px-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition-colors"
              title="Install UDYAM AI to desktop or home screen"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{t('common.install_app')}</span>
            </button>
          </div>
        )}
        {!pwaState.isInstalled && isDesktopCollapsed && (
          <div className="p-2 border-t border-slate-800 flex justify-center shrink-0">
            <button
              onClick={() => pwaManager.promptInstall()}
              className="p-2 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 border border-emerald-500/30 rounded-lg transition-colors"
              title="Install UDYAM AI App"
              aria-label="Install App"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Desktop Footer */}
        {!isDesktopCollapsed ? (
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-slate-400 text-xs shrink-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">Enterprise</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            </div>
            <p className="font-bold text-slate-200 truncate">Sharma General Store</p>
            <p className="text-[11px] text-slate-500 truncate">Delhi • Grocery / Retail</p>
          </div>
        ) : (
          <div className="p-3 border-t border-slate-800 bg-slate-950/60 text-center text-[10px] text-slate-400 font-bold shrink-0">
            MSME
          </div>
        )}

      </aside>
    </>
  );
};
