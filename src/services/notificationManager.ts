import { 
  BusinessNotification, 
  NotificationPreferences, 
  NotificationSeverity, 
  NotificationType, 
  NotificationCategory 
} from '../types';

const STORAGE_KEY_NOTIFS = 'udyam_notifications_v3';
const STORAGE_KEY_PREFS = 'udyam_notification_prefs_v2';
const STORAGE_KEY_TRIGGERS = 'udyam_notification_triggers_v2';

export const DEFAULT_PREFERENCES: NotificationPreferences = {
  compliance: true,
  finance: true,
  inventory: true,
  market: true,
  procurement: true,
  ai_insights: true,
  desktop_notifications: false,
};

type ToastListener = (toasts: BusinessNotification[]) => void;
type NotifListListener = (notifications: BusinessNotification[]) => void;

class NotificationManager {
  private notifications: BusinessNotification[] = [];
  private activeToasts: BusinessNotification[] = [];
  private preferences: NotificationPreferences = DEFAULT_PREFERENCES;
  private triggers: Record<string, number> = {};

  private toastListeners: Set<ToastListener> = new Set();
  private notifListeners: Set<NotifListListener> = new Set();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const savedNotifs = localStorage.getItem(STORAGE_KEY_NOTIFS);
      if (savedNotifs) {
        this.notifications = JSON.parse(savedNotifs);
      } else {
        this.notifications = this.generateInitialSeedNotifications();
        this.saveNotifications();
      }

      const savedPrefs = localStorage.getItem(STORAGE_KEY_PREFS);
      if (savedPrefs) {
        this.preferences = { ...DEFAULT_PREFERENCES, ...JSON.parse(savedPrefs) };
      }

      const savedTriggers = localStorage.getItem(STORAGE_KEY_TRIGGERS);
      if (savedTriggers) {
        this.triggers = JSON.parse(savedTriggers);
      }
    } catch (e) {
      console.warn('Notification storage load error:', e);
      this.notifications = this.generateInitialSeedNotifications();
      this.preferences = DEFAULT_PREFERENCES;
    }
  }

  private saveNotifications() {
    try {
      localStorage.setItem(STORAGE_KEY_NOTIFS, JSON.stringify(this.notifications));
    } catch (e) {
      console.warn('Notification storage save error:', e);
    }
  }

  private savePreferences() {
    try {
      localStorage.setItem(STORAGE_KEY_PREFS, JSON.stringify(this.preferences));
    } catch (e) {}
  }

  private saveTriggers() {
    try {
      localStorage.setItem(STORAGE_KEY_TRIGGERS, JSON.stringify(this.triggers));
    } catch (e) {}
  }

  // Generate initial statutory & baseline notifications
  private generateInitialSeedNotifications(): BusinessNotification[] {
    const base = Date.parse('2026-09-26T09:00:00+05:30');
    return [
      { id:'notif_002', title:'Festive Market Signal', message:'Festive market/news signal is 14.0% with HIGH strength. This may warrant closer monitoring of demand and procurement.', description:'Festive market/news signal is 14.0% with HIGH strength.', type:'high_demand_signal', category:'Market', severity:'CRITICAL', stage:'T-7', actionLabel:'Open Market Radar', actionUrl:'/market-intelligence', timestamp:'Today', createdAt:base, isRead:false, isDismissed:false },
      { id:'notif_007', title:'Besan Procurement Review', message:'Purchase order po_001 for Besan (quantity: 20 kg) is expected in 3 days. Current status: PO_SENT.', description:'20 kg Besan PO expected in 3 days.', type:'pending_po', category:'Procurement', severity:'CRITICAL', stage:'T-7', actionLabel:'Review Procurement', actionUrl:'/procurement-reconciliation?tab=purchase-orders', timestamp:'Today', createdAt:base-300000, isRead:false, isDismissed:false },
      { id:'notif_001', title:'GSTR-3B Tax Due', message:'Seeded demo timeline (reference date: 26 September 2026): saved GSTR-3B task due date is 01 October 2026 (5 demo-relative days remaining). This is not a live GST portal status; verify actual filing details.', description:'GSTR-3B countdown is relative to the seeded demo date, not live filing status.', type:'gstr3b_deadline', category:'Compliance', severity:'WARNING', stage:'T-7', dueDate:'01 October 2026', actionLabel:'Open GST Assistant', actionUrl:'/compliance?tab=gst', timestamp:'Today', createdAt:base-600000, isRead:false, isDismissed:false },
      { id:'notif_003', title:'Dhanteras Festival Alert', message:'Dhanteras is 15 days away (2026-10-11).', description:'Dhanteras is 15 days away.', type:'festival_demand', category:'Market', severity:'WARNING', stage:'T-21', dueDate:'11 October 2026', actionLabel:'View Market Radar', actionUrl:'/market-intelligence?tab=festivals', timestamp:'Today', createdAt:base-900000, isRead:false, isDismissed:false },
      { id:'notif_004', title:'Festive Market Signal', message:'Dry fruits festive signal is +9.0%.', description:'Dry fruits festive signal is +9.0%.', type:'high_demand_signal', category:'Market', severity:'WARNING', stage:'T-21', actionLabel:'View Market Radar', actionUrl:'/market-intelligence', timestamp:'Today', createdAt:base-1200000, isRead:false, isDismissed:false },
      { id:'notif_005', title:'Diwali Festival Alert', message:'Diwali is 17 days away (2026-10-13).', description:'Diwali is 17 days away.', type:'festival_demand', category:'Market', severity:'INFO', stage:'T-21', dueDate:'13 October 2026', actionLabel:'View Market Radar', actionUrl:'/market-intelligence?tab=festivals', timestamp:'Today', createdAt:base-1500000, isRead:false, isDismissed:false },
      { id:'notif_006', title:'Staples Market Signal', message:'Staples demand roughly flat (+3.0%).', description:'Staples demand roughly flat (+3.0%).', type:'high_demand_signal', category:'Market', severity:'INFO', stage:'T-21', actionLabel:'View Market Radar', actionUrl:'/market-intelligence', timestamp:'Today', createdAt:base-1800000, isRead:false, isDismissed:false },
    ];
  }

  // Subscribe to Toast Updates
  public subscribeToasts(listener: ToastListener) {
    this.toastListeners.add(listener);
    listener([...this.activeToasts]);
    return () => {
      this.toastListeners.delete(listener);
    };
  }

  // Subscribe to Notification List Updates
  public subscribeNotifications(listener: NotifListListener) {
    this.notifListeners.add(listener);
    listener([...this.notifications]);
    return () => {
      this.notifListeners.delete(listener);
    };
  }

  private notifyToastListeners() {
    this.toastListeners.forEach(fn => fn([...this.activeToasts]));
  }

  private notifyNotifListeners() {
    this.notifListeners.forEach(fn => fn([...this.notifications]));
  }

  // Getters
  public getNotifications(): BusinessNotification[] {
    return this.notifications.filter(n => !n.isDismissed);
  }

  public getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead && !n.isDismissed).length;
  }

  public getPreferences(): NotificationPreferences {
    return { ...this.preferences };
  }

  public setPreferences(newPrefs: Partial<NotificationPreferences>) {
    this.preferences = { ...this.preferences, ...newPrefs };
    this.savePreferences();
  }

  // Check if a category is enabled in preferences
  private isCategoryEnabled(category: NotificationCategory): boolean {
    switch (category) {
      case 'Compliance': return this.preferences.compliance;
      case 'Finance':
      case 'Payments': return this.preferences.finance;
      case 'Inventory': return this.preferences.inventory;
      case 'Market': return this.preferences.market;
      case 'Procurement': return this.preferences.procurement;
      case 'AI': return this.preferences.ai_insights;
      default: return true;
    }
  }

  // Push new notification
  public pushNotification(notifData: Omit<BusinessNotification, 'id' | 'timestamp' | 'createdAt' | 'isRead' | 'isDismissed'> & { id?: string }, showToast = true) {
    if (!this.isCategoryEnabled(notifData.category)) {
      return null;
    }

    const id = notifData.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
    
    // Check if notification with same ID already exists
    const existingIndex = this.notifications.findIndex(n => n.id === id);
    const newNotif: BusinessNotification = {
      ...notifData,
      id,
      description: notifData.description || notifData.message,
      timestamp: 'Just now',
      createdAt: Date.now(),
      isRead: false,
      isDismissed: false
    };

    if (existingIndex >= 0) {
      this.notifications[existingIndex] = newNotif;
    } else {
      this.notifications = [newNotif, ...this.notifications];
    }
    this.saveNotifications();
    this.notifyNotifListeners();

    // Trigger Desktop Notification if permitted
    if (this.preferences.desktop_notifications) {
      this.sendDesktopNotification(newNotif.title, newNotif.message);
    }

    // Trigger Pop-up Toast
    if (showToast) {
      this.showToast(newNotif);
    }

    return newNotif;
  }

  // Show Toast
  public showToast(notif: BusinessNotification) {
    // Avoid duplicate toast in active toasts
    if (this.activeToasts.some(t => t.id === notif.id)) return;

    // Maximum 4 toasts visible simultaneously to avoid screen clutter
    if (this.activeToasts.length >= 4) {
      this.activeToasts.shift();
    }

    this.activeToasts = [...this.activeToasts, notif];
    this.notifyToastListeners();

    // Determine auto-dismiss timeout
    // Critical stays 10s, Warning 7s, others 5s
    const duration = notif.severity === 'CRITICAL' ? 10000 : notif.severity === 'WARNING' ? 7000 : 5000;

    setTimeout(() => {
      this.dismissToast(notif.id);
    }, duration);
  }

  // Dismiss Toast (does not delete from notification center)
  public dismissToast(id: string) {
    this.activeToasts = this.activeToasts.filter(t => t.id !== id);
    this.notifyToastListeners();
  }

  // Mark as Read
  public markAsRead(id: string) {
    this.notifications = this.notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
    this.saveNotifications();
    this.notifyNotifListeners();
  }

  // Mark All as Read
  public markAllAsRead() {
    this.notifications = this.notifications.map(n => ({ ...n, isRead: true }));
    this.saveNotifications();
    this.notifyNotifListeners();
  }

  // Delete / Dismiss a single notification from history
  public deleteNotification(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.saveNotifications();
    this.notifyNotifListeners();
    this.dismissToast(id);
  }

  // Clear all notifications
  public clearAllNotifications() {
    this.notifications = [];
    this.activeToasts = [];
    this.saveNotifications();
    this.notifyNotifListeners();
    this.notifyToastListeners();
  }

  // Web Notifications API Permission
  public async requestDesktopPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('Web Notifications API not supported in this browser.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      const granted = permission === 'granted';
      this.setPreferences({ desktop_notifications: granted });
      return granted;
    } catch (e) {
      console.error('Error requesting notification permission:', e);
      return false;
    }
  }

  // Send Browser OS Notification
  public sendDesktopNotification(title: string, body: string) {
    if (!('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    try {
      new Notification(`UDYAM AI — ${title}`, {
        body,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
      });
    } catch (e) {
      console.warn('Native notification failed:', e);
    }
  }

  // Test Notification Helper (for demonstration and test verification)
  public triggerTestNotification(severity: NotificationSeverity) {
    const testCases: Record<NotificationSeverity, { title: string; message: string; type: NotificationType; category: NotificationCategory; actionUrl: string; actionLabel: string }> = {
      INFO: {
        title: 'Market Signal Detected',
        message: 'Seeded festive grocery market signal is +14%; review demand and procurement.',
        type: 'high_demand_signal',
        category: 'Market',
        actionUrl: '/market-intelligence?tab=signals',
        actionLabel: 'View Signals'
      },
      SUCCESS: {
        title: 'Demo Notification Feed Available',
        message: 'Demo notification feed is available; this does not confirm live ledger or GST reconciliation.',
        type: 'compliance_alert',
        category: 'Compliance',
        actionUrl: '/procurement-reconciliation?tab=reconciliation',
        actionLabel: 'View Match'
      },
      WARNING: {
        title: 'GSTR-3B Filing Reminder',
        message: 'GSTR-3B is due on 01 October 2026 in the seeded demo scenario. Verify actual filing details.',
        type: 'compliance_alert',
        category: 'Compliance',
        actionUrl: '/financial-control?tab=cash-flow',
        actionLabel: 'Check Runway'
      },
      CRITICAL: {
        title: 'Besan Procurement Review',
        message: 'Besan has 21 kg seeded stock and 20 kg incoming. Review the forecast before deciding procurement.',
        type: 'low_inventory',
        category: 'Inventory',
        actionUrl: '/inventory',
        actionLabel: 'Review Stock'
      }
    };

    const data = testCases[severity];
    return this.pushNotification({
      title: data.title,
      message: data.message,
      type: data.type,
      category: data.category,
      severity,
      actionUrl: data.actionUrl,
      actionLabel: data.actionLabel
    }, true);
  }

  // Deduplicated Automatic Trigger Check based on existing application data
  public runAutomaticTriggers(contextData: {
    kpis?: any;
    products?: any[];
    compliance?: any;
  }) {
    const now = Date.now();
    const COOLDOWN_MS = 6 * 3600 * 1000; // 6 hours deduplication cooldown

    const shouldTrigger = (key: string): boolean => {
      const last = this.triggers[key];
      if (!last || (now - last) > COOLDOWN_MS) {
        this.triggers[key] = now;
        this.saveTriggers();
        return true;
      }
      return false;
    };

    // 1. Critical Inventory Check
    if (contextData.products) {
      const criticalProduct = contextData.products.find(p => p.status === 'Critical');
      if (criticalProduct && shouldTrigger(`inv_critical_${criticalProduct.id}`)) {
        this.pushNotification({
          id: `notif-stockout-${criticalProduct.id}`,
          title: `Stockout Warning: ${criticalProduct.name}`,
          message: `${criticalProduct.name} has only ${criticalProduct.stock} units left (${criticalProduct.days_remaining} days).`,
          type: 'low_inventory',
          category: 'Inventory',
          severity: 'CRITICAL',
          stage: 'T-1',
          actionLabel: `Reorder ${criticalProduct.suggested_reorder || 500} U`,
          actionUrl: '/inventory'
        }, true);
      }
    }

    // 2. Compliance Deadlines Check
    if (contextData.compliance?.filings) {
      const pendingFiling = contextData.compliance.filings.find((f: any) => f.status === 'Pending' || f.days_left <= 7);
      if (pendingFiling && shouldTrigger(`comp_filing_${pendingFiling.form}`)) {
        const isUrgent = pendingFiling.days_left <= 3;
        this.pushNotification({
          id: `notif-filing-${pendingFiling.form}`,
          title: `${pendingFiling.form} Statutory Deadline`,
          message: `${pendingFiling.form} is due on ${pendingFiling.due_date}. Estimated tax payable: ₹ ${(pendingFiling.tax_amount || 142000).toLocaleString('en-IN')}.`,
          type: 'gstr3b_deadline',
          category: 'Compliance',
          severity: isUrgent ? 'CRITICAL' : 'WARNING',
          stage: isUrgent ? 'T-1' : 'T-7',
          dueDate: pendingFiling.due_date,
          actionLabel: 'Open Assistant',
          actionUrl: '/compliance?tab=gst'
        }, true);
      }
    }
  }
}

export const notificationManager = new NotificationManager();
