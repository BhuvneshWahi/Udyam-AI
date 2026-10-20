import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  X, 
  ArrowRight, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ShieldAlert, 
  Clock,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { notificationManager } from '../services/notificationManager';
import { BusinessNotification, NotificationSeverity } from '../types';

export const NotificationToastContainer: React.FC = () => {
  const [toasts, setToasts] = useState<BusinessNotification[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = notificationManager.subscribeToasts((currentToasts) => {
      setToasts(currentToasts);
    });
    return unsubscribe;
  }, []);

  if (toasts.length === 0) return null;

  const getSeverityIcon = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return <ShieldAlert className="w-5 h-5 text-red-600 shrink-0" />;
      case 'WARNING':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'SUCCESS':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'INFO':
      default:
        return <Info className="w-5 h-5 text-blue-600 shrink-0" />;
    }
  };

  const getSeverityStyles = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'CRITICAL':
        return {
          cardBg: 'bg-white border-red-300 shadow-xl shadow-red-500/10 ring-1 ring-red-400',
          badgeBg: 'bg-red-600 text-white',
          iconBg: 'bg-red-50',
          accentBar: 'bg-red-600'
        };
      case 'WARNING':
        return {
          cardBg: 'bg-white border-amber-300 shadow-lg shadow-amber-500/10 ring-1 ring-amber-300',
          badgeBg: 'bg-amber-500 text-slate-950 font-bold',
          iconBg: 'bg-amber-50',
          accentBar: 'bg-amber-500'
        };
      case 'SUCCESS':
        return {
          cardBg: 'bg-white border-emerald-300 shadow-lg shadow-emerald-500/10',
          badgeBg: 'bg-emerald-600 text-white',
          iconBg: 'bg-emerald-50',
          accentBar: 'bg-emerald-600'
        };
      case 'INFO':
      default:
        return {
          cardBg: 'bg-white border-blue-200 shadow-lg shadow-blue-500/10',
          badgeBg: 'bg-blue-600 text-white',
          iconBg: 'bg-blue-50',
          accentBar: 'bg-blue-600'
        };
    }
  };

  const handleAction = (toast: BusinessNotification) => {
    notificationManager.markAsRead(toast.id);
    notificationManager.dismissToast(toast.id);
    if (toast.actionUrl) {
      navigate(toast.actionUrl);
    }
  };

  const handleDismiss = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    notificationManager.dismissToast(id);
  };

  return (
    <div 
      className="fixed top-4 right-3 sm:right-5 z-50 flex flex-col space-y-2.5 max-w-sm sm:max-w-md w-full pointer-events-none"
      aria-live="polite"
      aria-label="Notification Toasts"
    >
      {toasts.map((toast) => {
        const styles = getSeverityStyles(toast.severity);
        return (
          <div
            key={toast.id}
            role="status"
            className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-3.5 sm:p-4 transition-all transform animate-in slide-in-from-top-3 sm:slide-in-from-right-4 fade-in duration-200 ${styles.cardBg}`}
          >
            {/* Left Accent Bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${styles.accentBar}`} />

            <div className="flex items-start justify-between gap-2.5">
              <div className="flex items-start space-x-3 min-w-0">
                <div className={`p-2 rounded-xl shrink-0 mt-0.5 ${styles.iconBg}`}>
                  {getSeverityIcon(toast.severity)}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className={`px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider ${styles.badgeBg}`}>
                      {toast.severity}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {toast.timestamp || 'Just now'}
                    </span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 mt-1 leading-snug">
                    {toast.title}
                  </h4>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {toast.message || toast.description}
                  </p>

                  {/* Optional Action Button */}
                  {toast.actionLabel && (
                    <div className="mt-2.5 flex items-center space-x-2">
                      <button
                        onClick={() => handleAction(toast)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl font-bold text-xs flex items-center space-x-1.5 transition-colors shadow-xs"
                      >
                        <span>{toast.actionLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={(e) => handleDismiss(toast.id, e)}
                className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors shrink-0"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
