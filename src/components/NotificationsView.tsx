import React, { useState } from "react";
import { 
  Bell, CheckCircle2, Clock, Calendar, Sparkles, 
  CreditCard, UploadCloud, ArrowRight, Video, 
  Trash2, Check, Filter, ShieldCheck, MessageSquare
} from "lucide-react";

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  time: string;
  category: 'project' | 'booking' | 'call' | 'financial' | 'system';
  read: boolean;
  actionLabel?: string;
  actionTarget?: string;
  link?: string;
}

interface NotificationsViewProps {
  notifications: NotificationItem[];
  onMarkAllAsRead: () => void;
  onClearNotifications: () => void;
  onNotificationClick: (item: NotificationItem) => void;
  onNavigateToTab: (tab: 'dashboard' | 'projects' | 'booking' | 'financials' | 'calendar') => void;
}

export default function NotificationsView({
  notifications,
  onMarkAllAsRead,
  onClearNotifications,
  onNotificationClick,
  onNavigateToTab,
}: NotificationsViewProps) {
  const [filter, setFilter] = useState<'all' | 'unread' | 'project' | 'booking' | 'financial'>('all');

  const unreadCount = notifications.filter(n => !n.read).length;

  const filteredNotifications = notifications.filter(item => {
    if (filter === 'unread') return !item.read;
    if (filter === 'project') return item.category === 'project';
    if (filter === 'booking') return item.category === 'booking' || item.category === 'call';
    if (filter === 'financial') return item.category === 'financial';
    return true;
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'project':
        return <Sparkles className="w-4 h-4 text-[#8C7456]" />;
      case 'call':
        return <Video className="w-4 h-4 text-emerald-600" />;
      case 'booking':
        return <Calendar className="w-4 h-4 text-amber-600" />;
      case 'financial':
        return <CreditCard className="w-4 h-4 text-blue-600" />;
      default:
        return <Bell className="w-4 h-4 text-[#8C7456]" />;
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto" id="notifications-view-root">
      
      {/* HEADER CARD */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] text-[#8C7456] flex items-center justify-center">
              <Bell className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-serif font-bold text-[#3C352E] tracking-tight">
                Notifications & Activity
              </h1>
              <p className="text-xs text-[#6B6155] mt-0.5">
                Stay updated on milestones, shoot bookings, discovery calls, and invoices.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              type="button"
              onClick={onMarkAllAsRead}
              className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3C352E] border border-[#EBE4D8] text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Check className="w-3.5 h-3.5 text-[#8C7456]" />
              <span>Mark all read</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClearNotifications}
            className="bg-[#FAF7F2] hover:bg-rose-50 text-stone-600 hover:text-rose-700 border border-[#EBE4D8] hover:border-rose-200 text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Clear all activity history"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* FILTER TABS */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none" id="notifications-filter-tabs">
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'all'
              ? 'bg-[#3C352E] text-white shadow-xs'
              : 'bg-white text-[#6B6155] hover:text-[#3C352E] border border-[#EBE4D8]'
          }`}
        >
          <span>All Updates</span>
          <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full ${
            filter === 'all' ? 'bg-white/20 text-white' : 'bg-[#FAF7F2] text-[#8B7E70]'
          }`}>
            {notifications.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('unread')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'unread'
              ? 'bg-[#3C352E] text-white shadow-xs'
              : 'bg-white text-[#6B6155] hover:text-[#3C352E] border border-[#EBE4D8]'
          }`}
        >
          <span>Unread</span>
          {unreadCount > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
              {unreadCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setFilter('project')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'project'
              ? 'bg-[#3C352E] text-white shadow-xs'
              : 'bg-white text-[#6B6155] hover:text-[#3C352E] border border-[#EBE4D8]'
          }`}
        >
          <Sparkles className="w-3 h-3 text-[#8C7456]" />
          <span>Projects & Milestones</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('booking')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'booking'
              ? 'bg-[#3C352E] text-white shadow-xs'
              : 'bg-white text-[#6B6155] hover:text-[#3C352E] border border-[#EBE4D8]'
          }`}
        >
          <Calendar className="w-3 h-3 text-amber-600" />
          <span>Bookings & Calls</span>
        </button>

        <button
          type="button"
          onClick={() => setFilter('financial')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
            filter === 'financial'
              ? 'bg-[#3C352E] text-white shadow-xs'
              : 'bg-white text-[#6B6155] hover:text-[#3C352E] border border-[#EBE4D8]'
          }`}
        >
          <CreditCard className="w-3 h-3 text-blue-600" />
          <span>Finances</span>
        </button>
      </div>

      {/* NOTIFICATIONS LIST */}
      <div className="space-y-2.5">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl border border-[#EBE4D8] text-center space-y-3 shadow-xs">
            <div className="w-12 h-12 rounded-full bg-[#FAF7F2] border border-[#EBE4D8] text-[#8B7E70] flex items-center justify-center mx-auto">
              <Bell className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#3C352E]">No notifications found</h3>
              <p className="text-xs text-[#8B7E70] mt-1 max-w-sm mx-auto">
                You are completely up to date. New production milestones, call links, and invoices will appear here.
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigateToTab('dashboard')}
              className="bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5 mt-2"
            >
              <span>Back to Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          filteredNotifications.map((item) => (
            <div
              key={item.id}
              onClick={() => onNotificationClick(item)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs group ${
                item.read 
                  ? 'bg-white border-[#EBE4D8] hover:border-[#8C7456]' 
                  : 'bg-[#FAF7F2] border-[#DCD2C4] hover:border-[#8C7456] ring-1 ring-[#8C7456]/20'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${
                  item.read ? 'bg-[#FAF7F2] border-[#EBE4D8]' : 'bg-white border-[#DCD2C4] shadow-xs'
                }`}>
                  {getCategoryIcon(item.category)}
                </div>

                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <h4 className={`text-xs sm:text-sm font-bold ${item.read ? 'text-[#3C352E]' : 'text-[#3C352E] font-extrabold'}`}>
                      {item.title}
                    </h4>
                    {!item.read && (
                      <span className="w-2 h-2 rounded-full bg-[#8C7456] shrink-0 animate-pulse"></span>
                    )}
                  </div>
                  <p className="text-[11px] sm:text-xs text-[#6B6155] leading-snug">
                    {item.description}
                  </p>
                  <div className="flex items-center gap-2 pt-0.5">
                    <span className="font-mono text-[10px] text-[#8B7E70] flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {item.time}
                    </span>
                    <span className="text-[9px] uppercase font-mono px-1.5 py-0.2 rounded bg-[#EBE4D8] text-[#8C7456] font-bold">
                      {item.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Action button */}
              {item.actionLabel && (
                <div className="sm:self-center shrink-0 pt-1 sm:pt-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNotificationClick(item);
                    }}
                    className="w-full sm:w-auto bg-[#3C352E] group-hover:bg-[#25211D] text-white text-[11px] sm:text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <span>{item.actionLabel}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* FOOTER HELPER NOTICE */}
      <div className="bg-[#FAF7F2] p-4 rounded-2xl border border-[#EBE4D8] flex items-center justify-between gap-3 text-xs text-[#8B7E70]">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Real-time email and calendar syncing is active for your account.</span>
        </div>
        <button
          type="button"
          onClick={() => onNavigateToTab('dashboard')}
          className="text-[#8C7456] hover:underline font-bold font-mono text-[11px] shrink-0"
        >
          Return to Dashboard →
        </button>
      </div>

    </div>
  );
}
