import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, 
  Calendar, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Plus,
  Search,
  Filter,
  RefreshCw,
  Info
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Reminder } from '../types';

export const SmartReminders: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useApp();
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: 'REM-001',
      title: 'GSTR-3B Filing Due',
      category: 'GST',
      due_date: '2026-10-20',
      days_remaining: 15,
      priority: 'High',
      status: 'UPCOMING',
      action: 'Prepare sales data and file GSTR-3B for September 2026'
    },
    {
      id: 'REM-002',
      title: 'ITR Filing Deadline',
      category: 'ITR',
      due_date: '2026-07-31',
      days_remaining: -85,
      priority: 'High',
      status: 'OVERDUE',
      action: 'File income tax return for FY 2025-26'
    },
    {
      id: 'REM-003',
      title: 'Insurance Renewal',
      category: 'Insurance',
      due_date: '2026-11-15',
      days_remaining: 41,
      priority: 'Medium',
      status: 'UPCOMING',
      action: 'Renew business insurance policy before expiry'
    },
    {
      id: 'REM-004',
      title: 'Digital Signature Renewal',
      category: 'Digital Signature',
      due_date: '2026-12-01',
      days_remaining: 57,
      priority: 'Medium',
      status: 'UPCOMING',
      action: 'Renew Class 3 DSC for GST filing'
    },
    {
      id: 'REM-005',
      title: 'GST Registration Verification',
      category: 'GST',
      due_date: '2026-10-05',
      days_remaining: 0,
      priority: 'High',
      status: 'DUE_SOON',
      action: 'Verify GST registration details on GST portal'
    },
    {
      id: 'REM-006',
      title: 'Udyam Certificate Renewal',
      category: 'Udyam',
      due_date: '2027-03-31',
      days_remaining: 187,
      priority: 'Low',
      status: 'UPCOMING',
      action: 'Update Udyam registration with latest financials'
    },
    {
      id: 'REM-007',
      title: 'PAN Verification',
      category: 'PAN',
      due_date: '2026-10-10',
      days_remaining: 5,
      priority: 'Medium',
      status: 'DUE_SOON',
      action: 'Verify PAN details are correct and linked to Aadhaar'
    },
    {
      id: 'REM-008',
      title: 'Customer Payment Follow-up (Illustrative)',
      category: 'Payment',
      due_date: '2026-10-15',
      days_remaining: 10,
      priority: 'High',
      status: 'UPCOMING',
      action: 'Customer ledger is not connected; verify any actual overdue payment before follow-up.'
    },
    {
      id: 'REM-009',
      title: 'Agreement Review - Supplier Contract',
      category: 'Agreement',
      due_date: '2026-10-25',
      days_remaining: 20,
      priority: 'Medium',
      status: 'UPCOMING',
      action: 'Supplier agreement terms are not included in the seeded data; verify the actual contract before renewal.'
    },
    {
      id: 'REM-010',
      title: 'Document Expiry - Trade License',
      category: 'Document',
      due_date: '2026-11-01',
      days_remaining: 27,
      priority: 'High',
      status: 'UPCOMING',
      action: 'Renew municipal trade license'
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'OVERDUE': return { color: 'red', icon: AlertTriangle, label: 'Overdue' };
      case 'DUE_SOON': return { color: 'amber', icon: Clock, label: 'Due Soon' };
      case 'UPCOMING': return { color: 'blue', icon: Calendar, label: 'Upcoming' };
      case 'COMPLETED': return { color: 'emerald', icon: CheckCircle2, label: 'Completed' };
      default: return { color: 'slate', icon: Bell, label: status };
    }
  };

  const getPriorityConfig = (priority: string) => {
    switch (priority) {
      case 'High': return { color: 'red' };
      case 'Medium': return { color: 'amber' };
      case 'Low': return { color: 'blue' };
      default: return { color: 'slate' };
    }
  };

  const filteredReminders = reminders.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || r.status === filterStatus;
    const matchesCategory = filterCategory === 'ALL' || r.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const markComplete = (id: string) => {
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, status: 'COMPLETED' } : r
    ));
    showToast('Reminder marked as complete');
  };

  const snoozeReminder = (id: string, days: number) => {
    const newDate = new Date();
    newDate.setDate(newDate.getDate() + days);
    setReminders(prev => prev.map(r => 
      r.id === id ? { ...r, due_date: newDate.toISOString().split('T')[0], days_remaining: days, status: 'UPCOMING' } : r
    ));
    showToast(`Reminder snoozed by ${days} days`);
  };

  const categories = ['ALL', ...Array.from(new Set(reminders.map(r => r.category)))];
  const statuses = ['ALL', 'OVERDUE', 'DUE_SOON', 'UPCOMING', 'COMPLETED'];

  const overdueCount = reminders.filter(r => r.status === 'OVERDUE').length;
  const dueSoonCount = reminders.filter(r => r.status === 'DUE_SOON').length;
  const upcomingCount = reminders.filter(r => r.status === 'UPCOMING').length;

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 max-w-7xl mx-auto overflow-x-hidden">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center space-x-2 flex-wrap gap-1">
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">Smart Reminders</h2>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded">
              Demo Session
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Compliance deadlines, document renewals, and payment follow-ups</p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/copilot?q=What%20reminders%20do%20I%20have%3F')}
            className="w-full sm:w-auto px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-1.5 shadow-sm transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Ask AI</span>
          </button>
        </div>
      </div>

      {/* Summary KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-red-50 border border-red-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-red-700 font-bold">Overdue</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-red-900 mt-1">{overdueCount}</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-amber-700 font-bold">Due Soon</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-amber-900 mt-1">{dueSoonCount}</p>
        </div>

        <div className="bg-blue-50 border border-blue-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-blue-700 font-bold">Upcoming</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-blue-900 mt-1">{upcomingCount}</p>
        </div>

        <div className="bg-emerald-50 border border-emerald-200 p-3.5 sm:p-4 rounded-xl shadow-xs">
          <span className="text-xs text-emerald-700 font-bold">Total</span>
          <p className="text-2xl sm:text-3xl font-extrabold text-emerald-900 mt-1">{reminders.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search reminders..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              {statuses.map(s => <option key={s} value={s}>{s === 'ALL' ? 'All Status' : s}</option>)}
            </select>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-xs"
            >
              {categories.map(c => <option key={c} value={c}>{c === 'ALL' ? 'All Categories' : c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Reminders List */}
      <div className="space-y-3">
        {filteredReminders.map((reminder) => {
          const statusConfig = getStatusConfig(reminder.status);
          const priorityConfig = getPriorityConfig(reminder.priority);
          const StatusIcon = statusConfig.icon;

          return (
            <div
              key={reminder.id}
              className={`bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all ${
                reminder.status === 'COMPLETED' ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`p-2 bg-${statusConfig.color}-100 rounded-lg`}>
                    <StatusIcon className={`w-4 h-4 text-${statusConfig.color}-600`} />
                  </div>
                  <div>
                    <span className={`text-[10px] font-bold uppercase tracking-wider text-${statusConfig.color}-700 bg-${statusConfig.color}-100 px-2 py-0.5 rounded`}>
                      {statusConfig.label}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">{reminder.category}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider text-${priorityConfig.color}-700 bg-${priorityConfig.color}-100 px-2 py-0.5 rounded`}>
                    {reminder.priority}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 text-sm">{reminder.title}</h4>
                <div className="flex items-center space-x-4 text-xs text-slate-600">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{reminder.due_date}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span className={reminder.days_remaining < 0 ? 'text-red-600 font-semibold' : ''}>
                      {reminder.days_remaining < 0 ? `${Math.abs(reminder.days_remaining)}d overdue` : `${reminder.days_remaining}d remaining`}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-slate-600">{reminder.action}</p>
              </div>

              {reminder.status !== 'COMPLETED' && (
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => markComplete(reminder.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-medium"
                  >
                    Mark Complete
                  </button>
                  <button
                    onClick={() => snoozeReminder(reminder.id, 7)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    Snooze 7d
                  </button>
                  <button
                    onClick={() => snoozeReminder(reminder.id, 30)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-medium"
                  >
                    Snooze 30d
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filteredReminders.length === 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-12 text-center">
          <Bell className="w-16 h-16 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-900 mb-2">No Reminders Found</h3>
          <p className="text-slate-600">Try adjusting your filters or search terms.</p>
        </div>
      )}

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start space-x-3">
        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-blue-900 font-semibold">Demo Session Reminders</p>
          <p className="text-[11px] text-blue-800 mt-1">
            These reminders are stored in demo session state only. In production, reminders would be persisted in a database with email/SMS notifications and calendar integration.
          </p>
        </div>
      </div>
    </div>
  );
};
