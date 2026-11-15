import React, { useState, useEffect } from "react";
import { 
  LayoutDashboard, Video, Calendar, CreditCard, Settings, 
  Search, Bell, MessageSquare, Menu, X, ShieldCheck, 
  CalendarPlus, UploadCloud, ChevronDown, Check, User, 
  Sliders, ExternalLink, Clock, CalendarCheck, Camera,
  LogIn, LogOut, UserPlus
} from "lucide-react";
import DashboardView from "./components/DashboardView";
import ProjectsView from "./components/ProjectsView";
import BookingForm from "./components/BookingForm";
import FinancialsView from "./components/FinancialsView";
import AdminDashboardView from "./components/AdminDashboardView";
import AdminCalendarView from "./components/AdminCalendarView";
import ClientMeetingBookingModal from "./components/ClientMeetingBookingModal";
import VFastTransferModal from "./components/VFastTransferModal";
import FloatingAssistant from "./components/FloatingAssistant";
import AuthModal from "./components/AuthModal";
import ProfileSettingsModal from "./components/ProfileSettingsModal";
import NotificationsView, { NotificationItem } from "./components/NotificationsView";
import { INITIAL_PROJECTS, INITIAL_MEETING_SLOTS, INITIAL_BOOKED_MEETINGS } from "./servicesData";
import { Project, MeetingSlot, Meeting, MeetingStatus } from "./types";
import {
  AuthenticatedUser,
  fetchSession,
  logoutSession,
  updateSessionProfile,
} from "./services/apiClient";

export default function App() {
  // Navigation tabs: 'dashboard' | 'projects' | 'booking' | 'financials' | 'calendar' | 'admin' | 'settings' | 'notifications'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'projects' | 'booking' | 'financials' | 'calendar' | 'admin' | 'settings' | 'notifications'>('dashboard');
  
  // App-wide state of projects
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  
  // Meeting calendar & appointment slots state
  const [meetingSlots, setMeetingSlots] = useState<MeetingSlot[]>(INITIAL_MEETING_SLOTS);
  const [bookedMeetings, setBookedMeetings] = useState<Meeting[]>(INITIAL_BOOKED_MEETINGS);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [meetingModalServiceId, setMeetingModalServiceId] = useState<string | undefined>(undefined);
  
  // Sidebar state for mobile responsiveness
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);

  // Search filter query
  const [searchQuery, setSearchQuery] = useState("");

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    { 
      id: "n1", 
      title: "New Milestone Approved", 
      description: "Winter Collection shoot 'Raw Footage Selection' marked complete by Director Mudit.",
      time: "10m ago", 
      category: "project",
      read: false,
      actionLabel: "View Project",
      actionTarget: "projects"
    },
    { 
      id: "n2", 
      title: "Custom Direct Booking Confirmed", 
      description: "Direct shoot slot reserved for Sony FX6 Package on Stage A.",
      time: "1h ago", 
      category: "booking",
      read: false,
      actionLabel: "View Booking",
      actionTarget: "booking"
    },
    { 
      id: "n3", 
      title: "Discovery Call Scheduled", 
      description: "1-on-1 Creative Briefing with Director Mudit confirmed for tomorrow at 2:00 PM.",
      time: "3h ago", 
      category: "call",
      read: true,
      actionLabel: "View Schedule",
      actionTarget: "calendar"
    },
    { 
      id: "n4", 
      title: "New Invoice Available: INV-2023-089", 
      description: "Invoice for ₹12,000 generated with escrow milestone protections.",
      time: "1d ago", 
      category: "financial",
      read: true,
      actionLabel: "Pay Invoice",
      actionTarget: "financials"
    }
  ]);

  // Auth state hydrated strictly from server-signed HttpOnly session cookie
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [authModalInitialMode, setAuthModalInitialMode] = useState<'signin' | 'signup'>('signin');
  const [isVFastModalOpen, setIsVFastModalOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    try {
      localStorage.removeItem("prostudio_current_user");
    } catch {
      // Ignore storage errors
    }
    let cancelled = false;
    fetchSession()
      .then((user) => {
        if (!cancelled && user) {
          setCurrentUser(user);
        }
      })
      .catch(() => {
        // Ignore offline/network check on initial load
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSetCurrentUser = (user: AuthenticatedUser | null) => {
    setCurrentUser(user);
  };

  const handleSignOut = async () => {
    try {
      await logoutSession();
    } catch {
      // Clear local state regardless
    }
    setCurrentUser(null);
    if (activeTab === "admin") {
      setActiveTab("dashboard");
    }
  };

  const handleSaveProfile = async (updated: { name: string; email: string; avatarUrl?: string }) => {
    try {
      const updatedUser = await updateSessionProfile({
        name: updated.name,
        avatarUrl: updated.avatarUrl,
      });
      if (updatedUser) {
        setCurrentUser(updatedUser);
        return;
      }
    } catch {
      // Fallback to updating display name/avatar in current session state only (never email/role)
    }
    if (currentUser) {
      setCurrentUser({
        ...currentUser,
        name: updated.name,
        avatarUrl: updated.avatarUrl,
      });
    }
  };

  // Pre-filled quote for negotiation
  const [preFilledQuote, setPreFilledQuote] = useState<{
    serviceName: string;
    price: number;
    deadline: string;
    details: string;
  } | null>(null);

  // Direct Booking initial selection (e.g. photography vs videography)
  const [bookingInitialService, setBookingInitialService] = useState<string>("photography");

  const handleStartDirectBooking = (serviceId: string = "photography") => {
    setBookingInitialService(serviceId);
    setPreFilledQuote(null);
    setActiveTab("booking");
  };

  // Admin emails display list (authorization itself is enforced server-side via signed cookie role)
  const [adminEmails, setAdminEmails] = useState<string[]>([
    "aarjavjainn@gmail.com"
  ]);

  const handleAddAdminEmail = (email: string) => {
    setAdminEmails((prev) => [...prev, email.toLowerCase().trim()]);
  };

  const handleRemoveAdminEmail = (email: string) => {
    setAdminEmails((prev) => prev.filter((e) => e !== email.toLowerCase().trim()));
  };

  const isAdmin = currentUser?.role === "admin";

  // Meeting Calendar & Reminder handlers
  const handleAddSlot = (newSlot: MeetingSlot) => {
    setMeetingSlots(prev => [...prev, newSlot]);
  };

  const handleDeleteSlot = (slotId: string) => {
    setMeetingSlots(prev => prev.filter(s => s.id !== slotId));
  };

  const handleBulkAddSlots = (newSlots: MeetingSlot[]) => {
    setMeetingSlots(prev => [...prev, ...newSlots]);
  };

  const handleUpdateMeetingStatus = (meetingId: string, status: MeetingStatus) => {
    setBookedMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status } : m));
    if (status === 'cancelled') {
      setMeetingSlots(prev => prev.map(s => s.meetingId === meetingId ? { ...s, isBooked: false, meetingId: undefined } : s));
    }
  };

  const handleSendMeetingReminder = (meetingId: string, reminderType: '24h_before' | '1h_before' | 'instant_manual' = 'instant_manual') => {
    setBookedMeetings(prev => prev.map(m => {
      if (m.id === meetingId) {
        const newLog = {
          id: `log-${Date.now()}`,
          sentAt: new Date().toISOString(),
          type: reminderType,
          channel: 'email' as const,
          recipient: m.clientEmail,
          status: 'sent' as const
        };
        return {
          ...m,
          reminderLogs: [...(m.reminderLogs || []), newLog]
        };
      }
      return m;
    }));
  };

  const handleBookMeeting = (meeting: Meeting) => {
    setBookedMeetings(prev => [meeting, ...prev]);
    setMeetingSlots(prev => prev.map(s => s.id === meeting.slotId ? { ...s, isBooked: true, meetingId: meeting.id } : s));
  };

  const handleOpenMeetingModal = (serviceId?: string) => {
    setMeetingModalServiceId(serviceId);
    setIsMeetingModalOpen(true);
  };

  const upcomingClientMeeting = currentUser
    ? bookedMeetings.find(m => m.clientEmail.toLowerCase() === currentUser.email.toLowerCase() && m.status === 'confirmed') || null
    : null;
  const availableSlotsCount = meetingSlots.filter(s => !s.isBooked).length;

  const handleBookingComplete = (newProject: Project) => {
    setProjects(prev => [newProject, ...prev]);
    setActiveTab("projects");
  };

  const handleUpdateProject = (updated: Project) => {
    setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const handleLoadCustomQuote = (quote: {
    serviceName: string;
    price: number;
    deadline: string;
    details: string;
  }) => {
    setPreFilledQuote(quote);
    setActiveTab("booking");
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    if (item.actionTarget) {
      if (
        item.actionTarget === 'projects' || 
        item.actionTarget === 'booking' || 
        item.actionTarget === 'financials' || 
        item.actionTarget === 'calendar' || 
        item.actionTarget === 'dashboard'
      ) {
        setActiveTab(item.actionTarget as any);
      }
    }
  };

  const handleMarkAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearNotifications = () => {
    setNotifications([]);
  };

  const unreadNotificationsCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C352E] font-sans flex flex-col md:flex-row antialiased selection:bg-[#8C7456] selection:text-white" id="prostudio-app-root">
      
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-3.5 py-2.5 bg-white border-b border-[#EBE4D8] sticky top-0 z-40 shadow-2xs">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="p-1.5 rounded-lg border border-[#EBE4D8] bg-[#FAF7F2] text-[#3C352E] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={() => { setActiveTab("dashboard"); setMobileSidebarOpen(false); }}
            className="flex items-center gap-2 text-left cursor-pointer hover:opacity-85 transition-opacity"
            title="Return to Dashboard"
            id="mobile-header-logo-button"
          >
            <div className="w-7 h-7 rounded-lg bg-[#3C352E] flex items-center justify-center text-white font-bold shadow-xs">
              <Video className="w-3.5 h-3.5 text-[#FAF7F2]" />
            </div>
            <div>
              <span className="font-serif font-bold text-xs text-[#3C352E] tracking-tight block leading-tight">
                ProStudio
              </span>
              <span className="text-[7px] font-bold uppercase tracking-widest text-[#8C7456] font-mono block leading-none">
                PRODUCTION SUITE
              </span>
            </div>
          </button>
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleStartDirectBooking("photography")}
            className="bg-[#3C352E] text-white text-[10px] font-bold px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer font-mono"
          >
            <CalendarCheck className="w-3 h-3 text-amber-300" />
            <span>Book</span>
          </button>
        </div>
      </div>

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside 
        className={`fixed md:sticky top-0 left-0 h-screen w-64 bg-white border-r border-[#EBE4D8] z-50 flex flex-col justify-between p-5 transition-transform duration-200 ease-in-out ${
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        id="prostudio-sidebar"
      >
        {/* Top Brand Logo */}
        <div className="space-y-6">
          <button 
            type="button"
            onClick={() => { setActiveTab("dashboard"); setMobileSidebarOpen(false); }}
            className="flex items-center gap-3 px-2 py-1 text-left cursor-pointer hover:opacity-85 transition-opacity w-full"
            title="Return to Dashboard"
            id="sidebar-logo-button"
          >
            <div className="w-9 h-9 rounded-xl bg-[#3C352E] flex items-center justify-center text-white font-bold shadow-sm">
              <Video className="w-5 h-5 text-[#FAF7F2]" />
            </div>
            <div>
              <span className="font-serif font-bold text-base text-[#3C352E] tracking-tight block">
                ProStudio
              </span>
              <span className="text-[8px] font-bold uppercase tracking-widest text-[#8C7456] font-mono block">
                PRODUCTION SUITE
              </span>
            </div>
          </button>

          {/* Navigation Links */}
          <nav className="space-y-1.5" id="sidebar-nav-links">
            <button
              onClick={() => { setActiveTab("dashboard"); setMobileSidebarOpen(false); }}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "dashboard"
                  ? "bg-[#3C352E] text-white font-bold shadow-xs"
                  : "text-[#6B6155] hover:bg-[#FAF7F2] hover:text-[#3C352E]"
              }`}
              id="nav-dashboard"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => { setActiveTab("projects"); setMobileSidebarOpen(false); }}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "projects"
                  ? "bg-[#3C352E] text-white font-bold shadow-xs"
                  : "text-[#6B6155] hover:bg-[#FAF7F2] hover:text-[#3C352E]"
              }`}
              id="nav-projects"
            >
              <Video className="w-4 h-4" />
              <span>Projects</span>
            </button>

            <button
              onClick={() => { handleStartDirectBooking("photography"); setMobileSidebarOpen(false); }}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "booking"
                  ? "bg-[#3C352E] text-white font-bold shadow-xs"
                  : "text-[#6B6155] hover:bg-[#FAF7F2] hover:text-[#3C352E]"
              }`}
              id="nav-booking"
            >
              <div className="flex items-center gap-3">
                <CalendarCheck className="w-4 h-4 text-[#8C7456]" />
                <span>Direct Booking</span>
              </div>
              <span className={`text-[8px] font-mono uppercase px-1.5 py-0.2 rounded font-bold ${
                activeTab === "booking" ? "bg-emerald-800 text-white" : "bg-emerald-100 text-emerald-800"
              }`}>
                Instant
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("financials"); setMobileSidebarOpen(false); }}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center gap-3 cursor-pointer ${
                activeTab === "financials"
                  ? "bg-[#3C352E] text-white font-bold shadow-xs"
                  : "text-[#6B6155] hover:bg-[#FAF7F2] hover:text-[#3C352E]"
              }`}
              id="nav-financials"
            >
              <CreditCard className="w-4 h-4" />
              <span>Finances</span>
            </button>

            <button
              onClick={() => { setActiveTab("calendar"); setMobileSidebarOpen(false); }}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "calendar"
                  ? "bg-[#3C352E] text-white font-bold shadow-xs"
                  : "text-[#6B6155] hover:bg-[#FAF7F2] hover:text-[#3C352E]"
              }`}
              id="nav-calendar"
            >
              <div className="flex items-center gap-3">
                <CalendarPlus className="w-4 h-4" />
                <span>Discovery Calls</span>
              </div>
              <span className="bg-[#EBE4D8] text-[#8C7456] text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                {availableSlotsCount}
              </span>
            </button>

            <button
              onClick={() => { setActiveTab("notifications"); setMobileSidebarOpen(false); }}
              className={`w-full text-left py-2.5 px-3.5 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center justify-between cursor-pointer ${
                activeTab === "notifications"
                  ? "bg-[#3C352E] text-white font-bold shadow-xs"
                  : "text-[#6B6155] hover:bg-[#FAF7F2] hover:text-[#3C352E]"
              }`}
              id="nav-notifications"
            >
              <div className="flex items-center gap-3">
                <Bell className="w-4 h-4" />
                <span>Notifications</span>
              </div>
              {unreadNotificationsCount > 0 && (
                <span className="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full font-mono">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>

            {isAdmin && (
              <button
                onClick={() => { setActiveTab("admin"); setMobileSidebarOpen(false); }}
                className={`w-full text-left py-2.5 px-3.5 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === "admin"
                    ? "bg-[#8C7456] text-white font-bold shadow-xs"
                    : "text-[#8C7456] bg-amber-50/80 hover:bg-[#FAF7F2] border border-amber-200/60"
                }`}
                id="nav-admin"
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Admin Console</span>
                </div>
                <span className="bg-amber-800 text-white text-[8px] font-mono uppercase px-1.5 py-0.2 rounded">
                  Admin
                </span>
              </button>
            )}
          </nav>

          {/* DEDICATED PRE-BOOKING DISCOVERY CALL MINI-CARD */}
          <div className="p-3.5 rounded-2xl bg-[#FAF7F2] border border-[#EBE4D8] space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-bold uppercase tracking-wider text-[#8B7E70] font-mono">
                1-on-1 Consultation
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </div>

            <p className="text-[11px] font-bold text-[#3C352E] leading-snug">
              Director Mudit Sachdeva
            </p>
            <p className="text-[10px] text-[#6B6155]">
              Google Meet Discovery & Creative Planning
            </p>

            <button
              onClick={() => handleOpenMeetingModal()}
              className="w-full py-2 bg-[#3C352E] hover:bg-[#25211D] text-[#FAF7F2] text-[10px] font-bold rounded-lg cursor-pointer transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
            >
              <Calendar className="w-3 h-3 text-[#FAF7F2]" />
              <span>Book Discovery Call</span>
            </button>
          </div>
        </div>

        {/* Bottom Settings & User Area */}
        <div className="pt-4 border-t border-[#EBE4D8] space-y-2">
          <button
            onClick={() => { setActiveTab("settings"); setMobileSidebarOpen(false); }}
            className={`w-full text-left py-2 px-3 rounded-xl font-medium text-xs tracking-wide transition-all flex items-center gap-3 cursor-pointer ${
              activeTab === "settings"
                ? "bg-[#FAF7F2] text-[#3C352E] font-bold"
                : "text-[#6B6155] hover:bg-[#FAF7F2] hover:text-[#3C352E]"
            }`}
            id="nav-settings"
          >
            <Settings className="w-4 h-4 text-[#8C7456]" />
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* MAIN VIEW AREA */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* TOP APP HEADER BAR */}
        <header className="bg-white border-b border-[#EBE4D8] px-6 py-3.5 sticky top-0 z-30 flex items-center justify-between gap-4">
          
          {/* Global Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8B7E70] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, assets, or invoices..."
              className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3C352E] placeholder-[#8B7E70] focus:outline-hidden focus:border-[#8C7456]"
              id="top-search-input"
            />
          </div>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3">
            
            {/* Quick 1-on-1 Meeting Booking Button */}
            <button
              onClick={() => handleOpenMeetingModal()}
              className="hidden sm:flex items-center gap-1.5 bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#8C7456] border border-[#EBE4D8] text-xs font-bold px-3 py-1.5 rounded-xl cursor-pointer transition-colors shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Call</span>
            </button>

            {/* Notifications Bell Button -> opens full Notifications page */}
            <button
              type="button"
              onClick={() => {
                setActiveTab("notifications");
                setShowUserMenu(false);
              }}
              className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                activeTab === "notifications"
                  ? "bg-[#3C352E] border-[#3C352E] text-white shadow-xs"
                  : "bg-[#FAF7F2] border-[#EBE4D8] text-[#6B6155] hover:text-[#3C352E] hover:bg-[#F4EFE6]"
              }`}
              title="Notifications & Activity"
              id="header-notification-button"
            >
              <Bell className="w-4 h-4" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
              )}
            </button>

            {/* Messages Drawer Trigger */}
            <button
              type="button"
              onClick={() => handleLoadCustomQuote({ serviceName: "Custom Campaign", price: 2500, deadline: "Standard", details: "Direct AI Chat" })}
              className="p-2 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] text-[#6B6155] hover:text-[#3C352E] cursor-pointer"
              title="Open Production Chat"
            >
              <MessageSquare className="w-4 h-4" />
            </button>

            {/* User Avatar & Role Switcher */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-[#FAF7F2] cursor-pointer transition-colors"
                id="user-profile-menu-button"
              >
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-8 h-8 rounded-full object-cover border border-[#EBE4D8]"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[#3C352E] text-white flex items-center justify-center font-mono font-bold text-xs border border-[#EBE4D8]">
                    {currentUser?.name?.charAt(0) || "U"}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-72 bg-white border border-[#EBE4D8] rounded-2xl shadow-xl p-3 z-50 space-y-2.5 animate-fade-in" id="user-menu-dropdown">
                  <div className="pb-2 border-b border-[#EBE4D8] flex items-center gap-2.5">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-9 h-9 rounded-full object-cover border border-[#EBE4D8]"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#3C352E] text-white flex items-center justify-center font-mono font-bold text-xs">
                        {currentUser?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div className="overflow-hidden">
                      <p className="font-bold text-xs text-[#3C352E] truncate">{currentUser?.name || "Guest Account"}</p>
                      <p className="text-[10px] text-[#8B7E70] font-mono truncate">{currentUser?.email || "No email linked"}</p>
                      <span className="inline-block mt-0.5 bg-[#FAF7F2] border border-[#EBE4D8] text-[#8C7456] text-[8px] font-bold font-mono uppercase px-1.5 py-0.2 rounded">
                        {isAdmin ? "Director / Admin" : "Client Account"}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    {/* Edit Profile / Change Avatar */}
                    {currentUser && (
                      <button
                        onClick={() => {
                          setIsProfileModalOpen(true);
                          setShowUserMenu(false);
                        }}
                        className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] text-[11px] font-semibold text-[#3C352E] flex items-center justify-between cursor-pointer border border-transparent hover:border-[#EBE4D8]"
                        id="menu-btn-edit-profile"
                      >
                        <div className="flex items-center gap-2">
                          <Camera className="w-3.5 h-3.5 text-[#8C7456]" />
                          <span>Edit Profile & Avatar</span>
                        </div>
                        <span className="text-[9px] font-mono uppercase font-bold text-[#8C7456] bg-[#FAF7F2] px-1.5 py-0.5 rounded border border-[#EBE4D8]">
                          Custom
                        </span>
                      </button>
                    )}

                    {/* Sign in / Sign up with Google/Apple Modal Triggers */}
                    <button
                      onClick={() => {
                        setAuthModalInitialMode('signin');
                        setIsAuthModalOpen(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[11px] font-bold text-[#3C352E] flex items-center justify-between cursor-pointer border border-[#EBE4D8]"
                      id="menu-btn-signin"
                    >
                      <div className="flex items-center gap-2">
                        <LogIn className="w-3.5 h-3.5 text-[#8C7456]" />
                        <span>Sign In (Google / Apple / Email)</span>
                      </div>
                      <ChevronDown className="w-3 h-3 text-[#8B7E70] -rotate-90" />
                    </button>

                    <button
                      onClick={() => {
                        setAuthModalInitialMode('signup');
                        setIsAuthModalOpen(true);
                        setShowUserMenu(false);
                      }}
                      className="w-full text-left p-2 rounded-xl hover:bg-[#FAF7F2] text-[11px] font-medium text-[#6B6155] hover:text-[#3C352E] flex items-center gap-2 cursor-pointer"
                      id="menu-btn-signup"
                    >
                      <UserPlus className="w-3.5 h-3.5 text-[#8B7E70]" />
                      <span>Create New Studio Account</span>
                    </button>

                    {currentUser && (
                      <div className="pt-1 border-t border-[#EBE4D8]/60">
                        <button
                          onClick={() => {
                            handleSignOut();
                            setShowUserMenu(false);
                            setIsAuthModalOpen(true);
                          }}
                          className="w-full text-left p-2 rounded-lg hover:bg-rose-50 text-[11px] text-rose-700 font-bold flex items-center gap-2 cursor-pointer"
                          id="menu-btn-signout"
                        >
                          <LogOut className="w-3.5 h-3.5" />
                          <span>Sign Out</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

          </div>
        </header>

        {/* MAIN BODY VIEW CONTENT */}
        <main className="flex-1 p-3.5 sm:p-5 md:p-8 max-w-7xl w-full mx-auto pb-20 md:pb-8">
          
          {/* TAB 1: DASHBOARD VIEW (Screenshot 1) */}
          {activeTab === "dashboard" && (
            <DashboardView
              projects={projects}
              currentUser={currentUser}
              onNavigateToBooking={() => handleStartDirectBooking("photography")}
              onNavigateToBookingWithService={(svc) => handleStartDirectBooking(svc)}
              onNavigateToProjects={() => setActiveTab("projects")}
              onNavigateToFinancials={() => setActiveTab("financials")}
              onOpenUploadModal={() => setIsVFastModalOpen(true)}
              onOpenMeetingModal={() => handleOpenMeetingModal()}
              upcomingMeeting={upcomingClientMeeting}
              availableSlotsCount={availableSlotsCount}
              onSendMeetingReminder={handleSendMeetingReminder}
            />
          )}

          {/* TAB 2: PROJECTS VIEW (Screenshot 3) */}
          {activeTab === "projects" && (
            <ProjectsView
              projects={projects}
              onUpdateProject={handleUpdateProject}
              onOpenUploadModal={() => setIsVFastModalOpen(true)}
              onOpenMeetingModal={() => handleOpenMeetingModal()}
            />
          )}

          {/* TAB 3: BOOKING VIEW (Screenshot 2) */}
          {activeTab === "booking" && (
            <BookingForm
              initialServiceId={bookingInitialService}
              preFilledQuote={preFilledQuote}
              onBookingComplete={handleBookingComplete}
              onOpenMeetingModal={(svc) => handleOpenMeetingModal(svc)}
              availableSlotsCount={availableSlotsCount}
            />
          )}

          {/* TAB 4: FINANCIALS VIEW (Screenshot 4) */}
          {activeTab === "financials" && (
            <FinancialsView
              projects={projects}
              onOpenNewInvoiceModal={() => setActiveTab("booking")}
              onPayInvoice={(invId, amt) => console.log("Paid", invId, amt)}
            />
          )}

          {/* TAB 5: CALENDAR & DISCOVERY CALLS VIEW */}
          {activeTab === "calendar" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE4D8] shadow-xs">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3C352E] tracking-tight">
                    Discovery Calls & Studio Calendar
                  </h1>
                  <p className="text-xs text-[#6B6155] mt-1">
                    Book and synchronize 1-on-1 Google Meet sessions with Director Mudit Sachdeva.
                  </p>
                </div>

                <button
                  onClick={() => handleOpenMeetingModal()}
                  className="bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-bold px-4 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <CalendarPlus className="w-4 h-4 text-[#FAF7F2]" />
                  <span>Schedule New Call</span>
                </button>
              </div>

              {isAdmin ? (
                <AdminCalendarView
                  slots={meetingSlots}
                  meetings={bookedMeetings}
                  onAddSlot={handleAddSlot}
                  onDeleteSlot={handleDeleteSlot}
                  onBulkAddSlots={handleBulkAddSlots}
                  onUpdateMeetingStatus={handleUpdateMeetingStatus}
                  onSendMeetingReminder={handleSendMeetingReminder}
                />
              ) : (
                <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#EBE4D8] pb-4">
                    <div>
                      <h2 className="text-lg font-serif font-bold text-[#3C352E]">
                        Your Private Discovery Call Schedule
                      </h2>
                      <p className="text-xs text-[#6B6155] mt-0.5">
                        {availableSlotsCount} open 1-on-1 consultation slots available with Director Mudit Sachdeva.
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenMeetingModal()}
                      className="px-4 py-2.5 bg-[#8C7456] hover:bg-[#766147] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                    >
                      View & Reserve Open Slots
                    </button>
                  </div>

                  {upcomingClientMeeting ? (
                    <div className="p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] font-mono uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                          Confirmed Session
                        </span>
                        <p className="text-sm font-bold text-[#3C352E]">{upcomingClientMeeting.topic}</p>
                        <p className="text-xs text-[#6B6155] font-mono">
                          {upcomingClientMeeting.date} • {upcomingClientMeeting.startTime} ({upcomingClientMeeting.durationMinutes} min)
                        </p>
                      </div>
                      <a
                        href={upcomingClientMeeting.meetingLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-[#3C352E] text-white text-xs font-bold rounded-xl inline-flex items-center gap-1.5"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Join Google Meet</span>
                      </a>
                    </div>
                  ) : (
                    <p className="text-xs text-[#8B7E70]">
                      You have no active discovery calls scheduled yet. Click "View & Reserve Open Slots" to book a private session.
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: ADMIN CONSOLE */}
          {activeTab === "admin" && (
            isAdmin ? (
              <AdminDashboardView
                projects={projects}
                onUpdateProject={handleUpdateProject}
                onAddProject={(p) => setProjects(prev => [p, ...prev])}
                adminEmails={adminEmails}
                onAddAdminEmail={handleAddAdminEmail}
                onRemoveAdminEmail={handleRemoveAdminEmail}
                currentUser={currentUser}
                onOpenVFastModal={() => setIsVFastModalOpen(true)}
                slots={meetingSlots}
                meetings={bookedMeetings}
                onAddSlot={handleAddSlot}
                onDeleteSlot={handleDeleteSlot}
                onBulkAddSlots={handleBulkAddSlots}
                onUpdateMeetingStatus={handleUpdateMeetingStatus}
                onSendMeetingReminder={handleSendMeetingReminder}
              />
            ) : (
              <div className="bg-white border border-[#EBE4D8] rounded-3xl p-8 sm:p-12 text-center max-w-xl mx-auto space-y-4 shadow-sm" id="admin-access-restricted">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-[#8C7456] flex items-center justify-center mx-auto">
                  <ShieldCheck className="w-7 h-7 text-[#8C7456]" />
                </div>
                <div className="space-y-1.5">
                  <h3 className="text-xl font-serif font-bold text-[#3C352E]">
                    Director & Admin Access Only
                  </h3>
                  <p className="text-xs text-[#6B6155] leading-relaxed">
                    This section is restricted to authorized studio directors and administrators. Please sign in with an authorized director account to access studio management and client rates.
                  </p>
                </div>
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={() => {
                      setAuthModalInitialMode('signin');
                      setIsAuthModalOpen(true);
                    }}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs"
                  >
                    Sign In with Admin Account
                  </button>
                  <button
                    onClick={() => setActiveTab('dashboard')}
                    className="w-full sm:w-auto px-5 py-2.5 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EBE4D8] text-[#3C352E] text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Return to Client Dashboard
                  </button>
                </div>
              </div>
            )
          )}

          {/* TAB 7: SETTINGS VIEW */}
          {activeTab === "settings" && (
            <div className="bg-white p-6 rounded-2xl border border-[#EBE4D8] shadow-xs max-w-2xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-serif font-bold text-[#3C352E]">Studio & Workspace Settings</h2>
                <p className="text-xs text-[#8B7E70] mt-1">Configure your rendering engines, cloud sync, and discovery calendar preferences.</p>
              </div>

              <div className="space-y-4 text-xs">
                {/* Profile & Avatar Customizer */}
                <div className="flex items-center justify-between p-4 bg-[#FAF7F2] rounded-2xl border border-[#EBE4D8]">
                  <div className="flex items-center gap-3">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-xl object-cover border border-[#EBE4D8] shadow-2xs"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-[#3C352E] text-white flex items-center justify-center font-mono font-bold text-sm">
                        {currentUser?.name?.charAt(0) || "U"}
                      </div>
                    )}
                    <div>
                      <span className="font-bold text-sm text-[#3C352E] block">{currentUser?.name || "Studio Member"}</span>
                      <span className="text-[11px] text-[#8B7E70] font-mono">{currentUser?.email || "No email"}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsProfileModalOpen(true)}
                    className="bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-bold px-3.5 py-2 rounded-xl cursor-pointer shadow-2xs flex items-center gap-1.5 transition-colors"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Change Avatar</span>
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE4D8]">
                  <div>
                    <span className="font-bold text-[#3C352E] block">Color Palette</span>
                    <span className="text-[11px] text-[#8B7E70]">Luxe Beige Cream Studio Palette Active</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                    Default
                  </span>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE4D8]">
                  <div>
                    <span className="font-bold text-[#3C352E] block">V-Fast Cloud Transfer Engine</span>
                    <span className="text-[11px] text-[#8B7E70]">High-speed chunked upload for ProRes & 8K raw files</span>
                  </div>
                  <button
                    onClick={() => setIsVFastModalOpen(true)}
                    className="bg-[#3C352E] text-white text-[10px] font-bold px-3 py-1.5 rounded-lg cursor-pointer"
                  >
                    Open Engine
                  </button>
                </div>

                <div className="flex items-center justify-between p-3.5 bg-[#FAF7F2] rounded-xl border border-[#EBE4D8]">
                  <div>
                    <span className="font-bold text-[#3C352E] block">Google Meet 1-on-1 Sync</span>
                    <span className="text-[11px] text-[#8B7E70]">Automatic calendar invite dispatch with zero-friction video links</span>
                  </div>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono px-2 py-0.5 rounded">
                    Enabled
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: NOTIFICATIONS & ACTIVITY CENTER */}
          {activeTab === "notifications" && (
            <NotificationsView
              notifications={notifications}
              onMarkAllAsRead={handleMarkAllNotificationsRead}
              onClearNotifications={handleClearNotifications}
              onNotificationClick={handleNotificationClick}
              onNavigateToTab={(tab) => setActiveTab(tab)}
            />
          )}

        </main>

        {/* FOOTER */}
        <footer className="bg-white border-t border-[#EBE4D8] py-4 px-4 md:px-8 text-center text-xs text-[#8B7E70] hidden sm:block" id="app-footer">
          <p>ProStudio © 2026. Handcrafted visual arts & production suite directed by Mudit Sachdeva.</p>
        </footer>

      </div>

      {/* MOBILE BOTTOM NAVIGATION BAR (Instant 1-Tap Switching) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EBE4D8] px-2 py-1.5 flex items-center justify-around shadow-lg" id="mobile-bottom-nav">
        <button
          onClick={() => setActiveTab("dashboard")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === "dashboard" ? "text-[#3C352E] font-bold" : "text-[#8B7E70]"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Dash</span>
        </button>

        <button
          onClick={() => setActiveTab("projects")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === "projects" ? "text-[#3C352E] font-bold" : "text-[#8B7E70]"
          }`}
        >
          <Video className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Projects</span>
        </button>

        <button
          onClick={() => handleStartDirectBooking("photography")}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-xl transition-all ${
            activeTab === "booking" 
              ? "bg-[#3C352E] text-amber-300 font-bold shadow-xs scale-105" 
              : "bg-[#FAF7F2] text-[#8C7456] border border-[#EBE4D8]"
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span className="text-[9px] font-bold">Book</span>
        </button>

        <button
          onClick={() => setActiveTab("financials")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === "financials" ? "text-[#3C352E] font-bold" : "text-[#8B7E70]"
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium">Finance</span>
        </button>

        <button
          onClick={() => setActiveTab("calendar")}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors ${
            activeTab === "calendar" ? "text-[#3C352E] font-bold" : "text-[#8B7E70]"
          }`}
        >
          <CalendarPlus className="w-4 h-4" />
          <span className="text-[9px] mt-0.5 font-medium whitespace-nowrap">Discovery Call</span>
        </button>
      </nav>

      {/* MODALS */}
      <ProfileSettingsModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentUser={currentUser}
        onSaveProfile={handleSaveProfile}
      />

      <AuthModal 
        isOpen={isAuthModalOpen}
        initialMode={authModalInitialMode}
        onClose={() => setIsAuthModalOpen(false)}
        onLoginSuccess={(user) => handleSetCurrentUser(user)}
      />

      <VFastTransferModal 
        isOpen={isVFastModalOpen}
        onClose={() => setIsVFastModalOpen(false)}
        initialFiles={[]}
      />

      <ClientMeetingBookingModal 
        isOpen={isMeetingModalOpen}
        onClose={() => setIsMeetingModalOpen(false)}
        availableSlots={meetingSlots.filter(s => !s.isBooked)}
        onBookMeeting={handleBookMeeting}
        currentUser={currentUser}
        preSelectedServiceId={meetingModalServiceId}
      />

      <FloatingAssistant 
        onLoadCustomQuote={handleLoadCustomQuote}
      />
    </div>
  );
}
