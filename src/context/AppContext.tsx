import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  BusinessProfile, KPIs, Product, SalesTrend, DemandForecast, 
  ComplianceData, GovernmentScheme, SmartInsight, DailyAction, ChatMessage,
  BusinessNotification, NotificationSeverity
} from '../types';
import { apiService } from '../services/api';
import { notificationManager } from '../services/notificationManager';
import { SupportedLanguage, getTranslation } from '../i18n/translations';
import { 
  INITIAL_BUSINESS_PROFILE, INITIAL_KPIS, INITIAL_PRODUCTS, 
  INITIAL_SALES_TRENDS, INITIAL_DEMAND_FORECASTS, 
  INITIAL_COMPLIANCE, INITIAL_SCHEMES, INITIAL_SMART_INSIGHTS, 
  INITIAL_DAILY_ACTIONS 
} from '../data/mockData';

interface AppContextType {
  currentLanguage: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: string) => string;
  profile: BusinessProfile;
  kpis: KPIs;
  products: Product[];
  salesTrends: SalesTrend[];
  demandForecasts: DemandForecast[];
  compliance: ComplianceData;
  schemes: GovernmentScheme[];
  insights: SmartInsight[];
  actions: DailyAction[];
  chatHistory: ChatMessage[];
  isVoiceModalOpen: boolean;
  isDemoBannerVisible: boolean;
  activePrompt: string;
  toastMessage: string | null;

  // Responsive Sidebar States
  isMobileSidebarOpen: boolean;
  isDesktopCollapsed: boolean;

  // Refresh Engine
  isRefreshing: boolean;
  lastRefreshedAt: Date | null;
  refreshAllData: () => Promise<void>;

  // Notification Center
  notifications: BusinessNotification[];
  unreadNotifCount: number;
  isNotificationCenterOpen: boolean;
  setNotificationCenterOpen: (open: boolean) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  triggerTestNotification: (severity: NotificationSeverity) => void;

  // Auth & Multi-Tenant State
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  currentUser: any;
  currentBusiness: any;
  refreshAuthSession: () => Promise<void>;

  // Actions
  setVoiceModalOpen: (open: boolean) => void;
  setActivePrompt: (prompt: string) => void;
  showToast: (msg: string) => void;
  addChatMessage: (message: ChatMessage) => void;
  resetCopilotSession: () => void;
  resetDemoState: () => Promise<void>;
  updateProductStock: (productId: string, newStock: number) => void;

  setMobileSidebarOpen: (open: boolean) => void;
  setDesktopCollapsed: (collapsed: boolean | ((prev: boolean) => boolean)) => void;
  toggleDesktopSidebar: () => void;
  closeMobileSidebar: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [profile, setProfile] = useState<BusinessProfile>(INITIAL_BUSINESS_PROFILE);
  const [kpis, setKpis] = useState<KPIs>(INITIAL_KPIS);
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [salesTrends, setSalesTrends] = useState<SalesTrend[]>(INITIAL_SALES_TRENDS);
  const [demandForecasts, setDemandForecasts] = useState<DemandForecast[]>(INITIAL_DEMAND_FORECASTS);
  const [compliance, setCompliance] = useState<ComplianceData>(INITIAL_COMPLIANCE);
  const [schemes, setSchemes] = useState<GovernmentScheme[]>(INITIAL_SCHEMES);
  const [insights, setInsights] = useState<SmartInsight[]>(INITIAL_SMART_INSIGHTS);
  const [actions, setActions] = useState<DailyAction[]>(INITIAL_DAILY_ACTIONS);

  const [isVoiceModalOpen, setVoiceModalOpen] = useState(false);
  const [isDemoBannerVisible, setDemoBannerVisible] = useState(false);
  const [activePrompt, setActivePrompt] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Refresh status
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(new Date());

  // Notification State backed by persistent NotificationManager
  const [notifications, setNotifications] = useState<BusinessNotification[]>(notificationManager.getNotifications());
  const [isNotificationCenterOpen, setNotificationCenterOpen] = useState(false);

  // Auth & Multi-Tenant State
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any | null>(null);
  const [currentBusiness, setCurrentBusiness] = useState<any | null>(null);

  const refreshAuthSession = async () => {
    try {
      const [u, b] = await Promise.all([
        apiService.getCurrentUser(),
        apiService.getCurrentBusiness(),
      ]);
      setCurrentUser(u);
      setCurrentBusiness(b);
    } catch (e) {
      console.warn("Failed to load auth session:", e);
    }
  };

  useEffect(() => {
    refreshAuthSession();
  }, []);

  useEffect(() => {
    const unsub = notificationManager.subscribeNotifications((notifs) => {
      setNotifications(notifs.filter(n => !n.isDismissed));
    });
    return unsub;
  }, []);

  const unreadNotifCount = notifications.filter(n => !n.isRead && !n.isDismissed).length;

  const markNotificationAsRead = (id: string) => {
    notificationManager.markAsRead(id);
  };

  const markAllNotificationsAsRead = () => {
    notificationManager.markAllAsRead();
    showToast("All notifications marked as read.");
  };

  const triggerTestNotification = (severity: NotificationSeverity) => {
    notificationManager.triggerTestNotification(severity);
  };

  // Internationalization State
  const [currentLanguage, setCurrentLanguageState] = useState<SupportedLanguage>(() => {
    try {
      const saved = localStorage.getItem('udyam_lang') as SupportedLanguage;
      return saved || 'en';
    } catch (e) {
      return 'en';
    }
  });

  const setLanguage = (lang: SupportedLanguage) => {
    setCurrentLanguageState(lang);
    try {
      localStorage.setItem('udyam_lang', lang);
    } catch (e) {}
  };

  const t = (key: string) => getTranslation(currentLanguage, key);

  // Responsive Sidebar State
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDesktopCollapsed, setIsDesktopCollapsed] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('udyam_sidebar_collapsed');
      return saved ? JSON.parse(saved) : false;
    } catch (e) {
      return false;
    }
  });

  // Save desktop collapsed preference to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('udyam_sidebar_collapsed', JSON.stringify(isDesktopCollapsed));
    } catch (e) {}
  }, [isDesktopCollapsed]);

  // Handle Escape key to close mobile drawer or modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (isMobileSidebarOpen) setIsMobileSidebarOpen(false);
        if (isVoiceModalOpen) setVoiceModalOpen(false);
        if (isNotificationCenterOpen) setNotificationCenterOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMobileSidebarOpen, isVoiceModalOpen, isNotificationCenterOpen]);

  const INITIAL_CHAT_MESSAGE: ChatMessage = {
    id: 'welcome-msg',
    sender: 'assistant',
    timestamp: 'Just now',
    text: 'Namaste Rajesh Ji! Main UDYAM AI hoon, aapka MSME decision copilot. Aapke business Sharma General Store ke verified enterprise data ke aadhar par main sales, stockouts, cash flow, GST compliance aur statutory deadlines me madad kar sakta hoon.\n\nNiche diye gaye prompts par click karke direct grounded analysis paayein.'
  };

  // Chat History
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([INITIAL_CHAT_MESSAGE]);

  // Real Global Refresh function calling backend
  const refreshAllData = async () => {
    setIsRefreshing(true);
    try {
      const [summary, salesIntel, prod, forecast, comp, sch, ins, act] = await Promise.allSettled([
        apiService.getSummary(),
        apiService.getSalesIntelligence(),
        apiService.getProducts(),
        apiService.getForecast(),
        apiService.getCompliance(),
        apiService.getSchemes(),
        apiService.getInsights(),
        apiService.getActions()
      ]);

      let updatedKpis = kpis;
      let updatedProducts = products;
      let updatedCompliance = compliance;

      if (summary.status === 'fulfilled' && summary.value) {
        if (summary.value.kpis) {
          setKpis(summary.value.kpis);
          updatedKpis = summary.value.kpis;
        }
        if (summary.value.business_profile) setProfile(summary.value.business_profile);
      }
      if (salesIntel.status === 'fulfilled' && salesIntel.value?.sales_trends) {
        setSalesTrends(salesIntel.value.sales_trends);
      }
      if (prod.status === 'fulfilled' && prod.value && prod.value.length > 0) {
        setProducts(prod.value);
        updatedProducts = prod.value;
      }
      if (forecast.status === 'fulfilled' && forecast.value?.forecasts) {
        setDemandForecasts(forecast.value.forecasts);
      }
      if (comp.status === 'fulfilled' && comp.value) {
        setCompliance(comp.value);
        updatedCompliance = comp.value;
      }
      if (sch.status === 'fulfilled' && sch.value?.schemes) {
        setSchemes(sch.value.schemes);
      }
      if (ins.status === 'fulfilled' && ins.value) {
        setInsights(ins.value);
      }
      if (act.status === 'fulfilled' && act.value) {
        setActions(act.value);
      }

      // Check and trigger automated non-blocking notifications
      notificationManager.runAutomaticTriggers({
        kpis: updatedKpis,
        products: updatedProducts,
        compliance: updatedCompliance
      });

      setLastRefreshedAt(new Date());
      showToast("Business metrics and inventory live-refreshed.");
    } catch (err) {
      console.error("Refresh error:", err);
      showToast("Cached enterprise metrics active.");
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    refreshAllData();
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const addChatMessage = (msg: ChatMessage) => {
    setChatHistory((prev) => [...prev, msg]);
  };

  // Real Copilot Session Reset
  const resetCopilotSession = () => {
    setChatHistory([INITIAL_CHAT_MESSAGE]);
    setActivePrompt("");
    showToast("AI Copilot session cleared. Ready for new query.");
  };

  const resetDemoState = async () => {
    await apiService.resetDemoData();
    setProfile(INITIAL_BUSINESS_PROFILE);
    setKpis(INITIAL_KPIS);
    setProducts(INITIAL_PRODUCTS);
    setSalesTrends(INITIAL_SALES_TRENDS);
    setDemandForecasts(INITIAL_DEMAND_FORECASTS);
    setCompliance(INITIAL_COMPLIANCE);
    setSchemes(INITIAL_SCHEMES);
    setInsights(INITIAL_SMART_INSIGHTS);
    setActions(INITIAL_DAILY_ACTIONS);
    setChatHistory([INITIAL_CHAT_MESSAGE]);
    setLastRefreshedAt(new Date());
    showToast("Enterprise data reset to baseline state.");
  };

  const updateProductStock = (productId: string, newStock: number) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id === productId) {
          const days = Math.round((newStock / p.avg_daily_sales) * 10) / 10;
          let status: Product['status'] = 'Healthy';
          if (days < 3) status = 'Critical';
          else if (days < 7) status = 'Low';
          else if (days > 100) status = 'Overstocked';
          return { ...p, stock: newStock, days_remaining: days, status };
        }
        return p;
      });
      // Check triggers on updated stock
      notificationManager.runAutomaticTriggers({ products: updated, kpis, compliance });
      return updated;
    });
    showToast(`Stock updated for ${productId} to ${newStock} units.`);
  };

  const toggleDesktopSidebar = () => {
    setIsDesktopCollapsed(prev => !prev);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <AppContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        profile,
        kpis,
        products,
        salesTrends,
        demandForecasts,
        compliance,
        schemes,
        insights,
        actions,
        chatHistory,
        isVoiceModalOpen,
        isDemoBannerVisible,
        activePrompt,
        toastMessage,
        isMobileSidebarOpen,
        isDesktopCollapsed,
        isRefreshing,
        lastRefreshedAt,
        refreshAllData,
        notifications,
        unreadNotifCount,
        isNotificationCenterOpen,
        setNotificationCenterOpen,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        triggerTestNotification,
        setVoiceModalOpen,
        setActivePrompt,
        showToast,
        addChatMessage,
        resetCopilotSession,
        resetDemoState,
        updateProductStock,
        isAuthModalOpen,
        setAuthModalOpen,
        currentUser,
        currentBusiness,
        refreshAuthSession,
        setMobileSidebarOpen: setIsMobileSidebarOpen,
        setDesktopCollapsed: setIsDesktopCollapsed,
        toggleDesktopSidebar,
        closeMobileSidebar,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
