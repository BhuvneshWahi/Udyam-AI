import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Calendar, 
  ArrowRight,
  ShieldAlert,
  CreditCard,
  Package,
  TrendingUp,
  FileText,
  Building,
  Check,
  Trash2,
  Settings,
  Sliders,
  Sparkles,
  Info,
  Laptop
} from 'lucide-react';
import { notificationManager } from '../services/notificationManager';
import { BusinessNotification, NotificationSeverity, NotificationPreferences } from '../types';
import { useApp } from '../context/AppContext';

export const NotificationCenter: React.FC = () => {
  const { 
    isNotificationCenterOpen, 
    setNotificationCenterOpen,
    t
  } = useApp();

  const [notifications, setNotifications] = useState<BusinessNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<'ALL' | 'UNREAD' | 'CRITICAL' | 'Compliance' | 'Payments' | 'Inventory' | 'Market' | 'Procurement'>('ALL');
  const [viewTab, setViewTab] = useState<'notifications' | 'settings'>('notifications');
  const [preferences, setPreferences] = useState<NotificationPreferences>(notificationManager.getPreferences());
  const [desktopPermStatus, setDesktopPermStatus] = useState<string>(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'unsupported'
  );

  const navigate = useNavigate();

  useEffect(() => {
    const unsub = notificationManager.subscribeNotifications((notifs) => {
      setNotifications(notifs);
    });
    return unsub;
  }, []);

  if (!isNotificationCenterOpen) return null;

  const unreadCount = notifications.filter(n => !n.isRead && !n.isDismissed).length;

  const filteredNotifications = notifications.filter(n => {
    if (n.isDismissed) return false;
    if (activeFilter === 'ALL') return true;
    if (activeFilter === 'UNREAD') return !n.isRead;
    if (activeFilter === 'CRITICAL') return n.severity === 'CRITICAL';
    if (activeFilter === 'Payments') return n.category === 'Payments' || n.category === 'Finance';
    return n.category === activeFilter;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Compliance': return ShieldAlert;
      case 'Payments':
      case 'Finance': return CreditCard;
      case 'Inventory': return Package;
      case 'Market': return TrendingUp;
      case 'Procurement': return Building;
      default: return AlertTriangle;
    }
  };

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-red-600 text-white uppercase tracking-wider animate-pulse">CRITICAL</span>;
      case 'WARNING':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-amber-500 text-slate-950 uppercase tracking-wider">WARNING</span>;
      case 'SUCCESS':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-emerald-600 text-white uppercase tracking-wider">SUCCESS</span>;
      case 'INFO':
      default:
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-extrabold bg-blue-600 text-white uppercase tracking-wider">INFO</span>;
    }
  };

  const getStageBadgeColor = (stage?: string) => {
    switch (stage) {
      case 'T+1': return 'bg-red-600 text-white font-extrabold';
      case 'T+0': return 'bg-red-500 text-white font-extrabold animate-pulse';
      case 'T-1': return 'bg-amber-500 text-slate-950 font-extrabold';
      case 'T-7': return 'bg-amber-100 text-amber-900 border border-amber-300 font-bold';
      case 'T-21': return 'bg-blue-100 text-blue-900 border border-blue-200 font-semibold';
      case 'T-30': return 'bg-slate-100 text-slate-700 border border-slate-200 font-medium';
      default: return 'bg-slate-100 text-slate-600 font-medium';
    }
  };

  const handleActionClick = (notif: BusinessNotification) => {
    notificationManager.markAsRead(notif.id);
    setNotificationCenterOpen(false);
    if (notif.actionUrl) {
      navigate(notif.actionUrl);
    }
  };

  const handleTogglePref = async (key: keyof NotificationPreferences) => {
    if (key === 'desktop_notifications') {
      if (!preferences.desktop_notifications) {
        const granted = await notificationManager.requestDesktopPermission();
        setDesktopPermStatus(granted ? 'granted' : 'denied');
        setPreferences(prev => ({ ...prev, desktop_notifications: granted }));
      } else {
        notificationManager.setPreferences({ desktop_notifications: false });
        setPreferences(prev => ({ ...prev, desktop_notifications: false }));
      }
    } else {
      const updated = !preferences[key];
      notificationManager.setPreferences({ [key]: updated });
      setPreferences(prev => ({ ...prev, [key]: updated }));
    }
  };

  const handleTriggerTest = (severity: NotificationSeverity) => {
    notificationManager.triggerTestNotification(severity);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-150"
        onClick={() => setNotificationCenterOpen(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside 
        className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50 border-l border-slate-200 animate-in slide-in-from-right duration-200"
        aria-label="Notification Center"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-xs">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                  {t('notif.title')}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-extrabold rounded-full">
                    {unreadCount}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500">Statutory calendar & real-time operational triggers</p>
            </div>
          </div>

          <div className="flex items-center space-x-1">
            <button
              onClick={() => setViewTab(prev => prev === 'notifications' ? 'settings' : 'notifications')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewTab === 'settings' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-200 hover:text-slate-800'
              }`}
              title="Notification Settings"
              aria-label="Notification Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setNotificationCenterOpen(false)}
              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-colors"
              aria-label="Close notification center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* View Mode: Notifications or Settings */}
        {viewTab === 'notifications' ? (
          <>
            {/* Filter Pills */}
            <div className="px-4 py-2.5 border-b border-slate-100 flex items-center space-x-1.5 overflow-x-auto bg-white shrink-0 custom-scrollbar">
              {(['ALL', 'UNREAD', 'CRITICAL', 'Compliance', 'Payments', 'Inventory', 'Market', 'Procurement'] as const).map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all shrink-0 ${
                    activeFilter === filter
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {filter === 'ALL' ? t('notif.all') : 
                   filter === 'UNREAD' ? 'Unread' :
                   filter === 'CRITICAL' ? 'Critical' : filter}
                </button>
              ))}
            </div>

            {/* Quick Actions Row */}
            <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between text-xs text-slate-500 shrink-0">
              <span className="text-[11px] font-semibold">
                Showing {filteredNotifications.length} alerts
              </span>
              <div className="flex items-center space-x-2">
                {unreadCount > 0 && (
                  <button
                    onClick={() => notificationManager.markAllAsRead()}
                    className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center space-x-1"
                  >
                    <Check className="w-3 h-3" />
                    <span>{t('notif.mark_read')}</span>
                  </button>
                )}
                {notifications.length > 0 && (
                  <button
                    onClick={() => notificationManager.clearAllNotifications()}
                    className="text-[11px] font-bold text-slate-400 hover:text-red-600 transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {filteredNotifications.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
                  <p className="text-sm font-bold text-slate-700">{t('notif.empty')}</p>
                  <p className="text-xs text-slate-400 mt-1">No alerts match the selected filter.</p>
                </div>
              ) : (
                filteredNotifications.map(notif => {
                  const Icon = getCategoryIcon(notif.category);
                  return (
                    <div
                      key={notif.id}
                      className={`p-3.5 rounded-2xl border transition-all ${
                        notif.isRead 
                          ? 'bg-white border-slate-200 opacity-80 hover:opacity-100' 
                          : notif.severity === 'CRITICAL'
                          ? 'bg-red-50/60 border-red-200 shadow-xs'
                          : notif.severity === 'WARNING'
                          ? 'bg-amber-50/50 border-amber-200 shadow-xs'
                          : 'bg-white border-slate-200 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start space-x-2.5 min-w-0">
                          <div className={`p-1.5 rounded-xl shrink-0 mt-0.5 ${
                            notif.severity === 'CRITICAL' ? 'bg-red-100 text-red-700' :
                            notif.severity === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                            notif.severity === 'SUCCESS' ? 'bg-emerald-100 text-emerald-700' :
                            'bg-slate-100 text-slate-700'
                          }`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                              {getSeverityBadge(notif.severity)}
                              {notif.stage && (
                                <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase tracking-wider ${getStageBadgeColor(notif.stage)}`}>
                                  {notif.stage}
                                </span>
                              )}
                              <span className="text-[10px] text-slate-400 font-medium">
                                {notif.timestamp}
                              </span>
                            </div>
                            <h4 className={`text-xs font-bold mt-1 ${notif.isRead ? 'text-slate-700' : 'text-slate-900'}`}>
                              {notif.title}
                            </h4>
                            <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                              {notif.message || notif.description}
                            </p>
                          </div>
                        </div>

                        {/* Right Action Icons */}
                        <div className="flex items-center space-x-1 shrink-0">
                          {!notif.isRead && (
                            <button
                              onClick={() => notificationManager.markAsRead(notif.id)}
                              className="p-1 text-slate-400 hover:text-emerald-600 rounded transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => notificationManager.deleteNotification(notif.id)}
                            className="p-1 text-slate-300 hover:text-red-500 rounded transition-colors"
                            title="Delete notification"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Footer CTA */}
                      {notif.actionLabel && (
                        <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-400 font-medium">
                            {notif.dueDate ? `Due: ${notif.dueDate}` : notif.category}
                          </span>
                          <button
                            onClick={() => handleActionClick(notif)}
                            className="px-2.5 py-1 bg-slate-900 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 transition-colors"
                          >
                            <span>{notif.actionLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Test Trigger Control (Safe Demo Mechanism) */}
            <div className="p-3 border-t border-slate-200 bg-slate-50 shrink-0">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] uppercase font-bold text-slate-500 flex items-center space-x-1">
                  <Sparkles className="w-3 h-3 text-emerald-600" />
                  <span>Test Pop-up Notification</span>
                </span>
                <span className="text-[9px] text-slate-400">Safe Demo</span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(['INFO', 'SUCCESS', 'WARNING', 'CRITICAL'] as NotificationSeverity[]).map(sev => (
                  <button
                    key={sev}
                    onClick={() => handleTriggerTest(sev)}
                    className={`py-1 rounded-lg text-[10px] font-extrabold uppercase transition-all shadow-2xs ${
                      sev === 'CRITICAL' ? 'bg-red-600 text-white hover:bg-red-700' :
                      sev === 'WARNING' ? 'bg-amber-500 text-slate-950 hover:bg-amber-600' :
                      sev === 'SUCCESS' ? 'bg-emerald-600 text-white hover:bg-emerald-700' :
                      'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {sev}
                  </button>
                ))}
              </div>
            </div>
          </>
        ) : (
          /* Settings / Preferences View */
          <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Notification Preferences</h4>
              <p className="text-xs text-slate-500 mt-0.5">Control which business alerts trigger in-app popups and notifications.</p>
            </div>

            <div className="space-y-3 divide-y divide-slate-100">
              {/* Category Toggles */}
              {[
                { key: 'compliance' as const, label: 'Statutory & GST Compliance Alerts', desc: 'GSTR-3B, GSTR-1, TDS, EPF deadlines & reminders' },
                { key: 'finance' as const, label: 'Financial & Cash Flow Alerts', desc: 'Overdue customer receivables, runway drops, profit leaks' },
                { key: 'inventory' as const, label: 'Inventory & Stockout Warnings', desc: 'Critical stock levels, lead-time warnings, reorder suggestions' },
                { key: 'market' as const, label: 'Market Demand & Festival Signals', desc: 'Category demand surges, festive spikes, opportunity radar' },
                { key: 'procurement' as const, label: 'Procurement & Purchase Requisitions', desc: 'Pending PR approvals, PO dispatches, 3-way match variances' },
                { key: 'ai_insights' as const, label: 'AI Business Insights', desc: 'Copilot grounded recommendations and anomaly notices' },
              ].map(({ key, label, desc }) => (
                <div key={key} className="pt-3 flex items-start justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">{label}</span>
                    <span className="text-[11px] text-slate-500">{desc}</span>
                  </div>
                  <button
                    onClick={() => handleTogglePref(key)}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                      preferences[key] ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    aria-label={`Toggle ${label}`}
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences[key] ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              ))}

              {/* Desktop Browser Notifications API */}
              <div className="pt-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center space-x-1.5">
                      <Laptop className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-bold text-slate-900">Desktop Web Notifications</span>
                    </div>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Show OS-level notifications for critical compliance and inventory alerts.
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-1 font-mono">
                      Browser Status: {desktopPermStatus}
                    </span>
                  </div>
                  <button
                    onClick={() => handleTogglePref('desktop_notifications')}
                    className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors shrink-0 ${
                      preferences.desktop_notifications ? 'bg-emerald-600' : 'bg-slate-300'
                    }`}
                    aria-label="Toggle Desktop Notifications"
                  >
                    <div className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                      preferences.desktop_notifications ? 'translate-x-5' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600">
              <span className="font-bold text-slate-800 block mb-0.5">Local Persistence Active</span>
              <p className="text-[11px] text-slate-500">
                Preferences and notification read states are securely stored in your browser's local cache.
              </p>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs shrink-0">
          <button
            onClick={() => {
              setNotificationCenterOpen(false);
              navigate('/compliance?tab=deadlines');
            }}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center space-x-1"
          >
            <span>{t('notif.view_all')}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
          <span className="text-[10px] text-slate-400 font-medium">UDYAM AI Notification Engine</span>
        </div>
      </aside>
    </div>
  );
};
