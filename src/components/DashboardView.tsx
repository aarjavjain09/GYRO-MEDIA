import React, { useState } from "react";
import { 
  Plus, UploadCloud, Clock, Calendar, AlertCircle, 
  CheckCircle2, ArrowRight, ExternalLink, Video, Camera,
  CreditCard, Sparkles, TrendingUp, ChevronRight,
  CalendarCheck, ShieldCheck
} from "lucide-react";
import { Project, Meeting } from "../types";

interface DashboardViewProps {
  projects: Project[];
  currentUser: { name: string; email: string } | null;
  onNavigateToBooking: () => void;
  onNavigateToBookingWithService?: (serviceId: string) => void;
  onNavigateToProjects: () => void;
  onNavigateToFinancials: () => void;
  onOpenUploadModal: () => void;
  onOpenMeetingModal: () => void;
  upcomingMeeting?: Meeting | null;
  availableSlotsCount?: number;
  onSendMeetingReminder?: (meetingId: string) => void;
}

export default function DashboardView({
  projects,
  currentUser,
  onNavigateToBooking,
  onNavigateToBookingWithService,
  onNavigateToProjects,
  onNavigateToFinancials,
  onOpenUploadModal,
  onOpenMeetingModal,
  upcomingMeeting = null,
  availableSlotsCount = 8,
  onSendMeetingReminder
}: DashboardViewProps) {
  const [reminderNotice, setReminderNotice] = useState<string | null>(null);

  const userName = currentUser?.name?.split(" ")[0] || "Alex";

  const handleSendReminder = (meetId: string) => {
    if (onSendMeetingReminder) {
      onSendMeetingReminder(meetId);
      setReminderNotice("Meeting reminder notification sent to your email & calendar!");
      setTimeout(() => setReminderNotice(null), 4000);
    }
  };

  const handleDirectBook = (serviceId: string) => {
    if (onNavigateToBookingWithService) {
      onNavigateToBookingWithService(serviceId);
    } else {
      onNavigateToBooking();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" id="dashboard-view-root">
      
      {/* Top Reminder Notification Banner */}
      {reminderNotice && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{reminderNotice}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setReminderNotice(null)}
            className="text-emerald-700 hover:text-emerald-900 font-mono text-sm px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* WELCOME HEADER & TOP ACTIONS */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3C352E] tracking-tight">
            Welcome back, {userName}.
          </h1>
          <p className="text-xs text-[#6B6155] mt-0.5">
            Book shoot slots directly or manage active studio deliverables.
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            onClick={onOpenMeetingModal}
            className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#8C7456] border border-[#EBE4D8] text-[11px] sm:text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            id="btn-dash-schedule-meet"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>1-on-1 Call</span>
            <span className="bg-[#EBE4D8] text-[#8C7456] text-[8px] font-bold px-1.5 py-0.2 rounded-full font-mono">
              {availableSlotsCount}
            </span>
          </button>

          <button
            type="button"
            onClick={onOpenUploadModal}
            className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3C352E] border border-[#EBE4D8] text-[11px] sm:text-xs font-bold px-3 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            id="btn-dash-upload-assets"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#8C7456]" />
            <span>UPLOAD</span>
          </button>
        </div>
      </div>

      {/* DIRECT BOOKING SPOTLIGHT CARD */}
      <div className="bg-gradient-to-r from-[#FAF7F2] via-white to-[#FAF7F2] p-4 sm:p-5 rounded-2xl border border-[#EBE4D8] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#3C352E] text-amber-300 flex items-center justify-center shrink-0 shadow-xs">
            <CalendarCheck className="w-4 h-4 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs sm:text-sm font-bold text-[#3C352E]">Direct Shoot Slot Booking</h3>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase">
                Instant
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-[#6B6155] mt-0.5 max-w-2xl leading-snug">
              Lock your shoot date, time slot, and stage directly without waiting for a discovery call.
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2 shrink-0">
          <button
            type="button"
            onClick={() => handleDirectBook("photography")}
            className="bg-[#3C352E] hover:bg-[#25211D] text-white text-[11px] sm:text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <Camera className="w-3.5 h-3.5 text-amber-300" />
            <span>Photo Shoot</span>
          </button>

          <button
            type="button"
            onClick={() => handleDirectBook("videography")}
            className="bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EBE4D8] text-[#3C352E] text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Video className="w-3.5 h-3.5 text-[#8C7456]" />
            <span>Video Shoot</span>
          </button>
        </div>
      </div>

      {/* TWO-COLUMN DASHBOARD GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* LEFT COLUMN: ACTIVE PROJECTS & UPCOMING MILESTONES (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          
          {/* Active Projects Box */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-[#8C7456]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#3C352E]">Active Projects</h3>
              </div>
              <button
                type="button"
                onClick={onNavigateToProjects}
                className="text-xs text-[#8C7456] font-bold hover:underline cursor-pointer flex items-center gap-1"
              >
                <span>View All</span>
                <ChevronRight className="w-3 h-3" />
              </button>
            </div>

            {/* Project Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Card 1: Neon City Commercial */}
              <div 
                onClick={onNavigateToProjects}
                className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] hover:border-[#8C7456] transition-all cursor-pointer space-y-2.5 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#8C7456]">PRJ-2049</span>
                  <span className="bg-blue-100 text-blue-800 border border-blue-200 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
                    IN PROGRESS
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#3C352E] group-hover:text-[#8C7456] transition-colors">
                    Neon City Commercial
                  </h4>
                  <p className="text-[11px] text-[#8B7E70] line-clamp-2 mt-0.5 leading-snug">
                    Full CG environment build and motion tracking for automotive campaign.
                  </p>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8B7E70]">Render Progress</span>
                    <span className="font-bold text-[#3C352E]">65%</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EBE4D8] rounded-full overflow-hidden">
                    <div className="h-full bg-[#8C7456] rounded-full w-[65%]"></div>
                  </div>
                </div>
              </div>

              {/* Card 2: Echoes Feature Film */}
              <div 
                onClick={onNavigateToProjects}
                className="p-3.5 sm:p-4 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] hover:border-[#8C7456] transition-all cursor-pointer space-y-2.5 group shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] font-bold text-[#8C7456]">PRJ-2051</span>
                  <span className="bg-amber-100 text-amber-800 border border-amber-200 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded font-mono">
                    AWAITING REVIEW
                  </span>
                </div>

                <div>
                  <h4 className="text-xs font-bold text-[#3C352E] group-hover:text-[#8C7456] transition-colors">
                    Echoes Feature Film
                  </h4>
                  <p className="text-[11px] text-[#8B7E70] line-clamp-2 mt-0.5 leading-snug">
                    VFX sequence 04 review and color grading finalization.
                  </p>
                </div>

                <div className="space-y-1 pt-0.5">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#8B7E70]">Client Approval</span>
                    <span className="font-bold text-amber-800">Pending</span>
                  </div>
                  <div className="w-full h-1.5 bg-[#EBE4D8] rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full w-[85%]"></div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* Upcoming Milestones List */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C7456]" />
              <h3 className="text-xs sm:text-sm font-bold text-[#3C352E]">Upcoming Milestones</h3>
            </div>

            <div className="space-y-2.5 text-xs">
              
              {/* Item 1 */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-1 shrink-0"></div>
                <div className="flex-1">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#8B7E70] block">
                    TODAY, 14:00
                  </span>
                  <h4 className="font-bold text-[#3C352E] text-xs mt-0.5">
                    Director Review - Scene 42
                  </h4>
                  <p className="text-[11px] text-[#8B7E70]">
                    Stage B • 2 Hours
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] flex items-start gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-[#8C7456] mt-1 shrink-0"></div>
                <div className="flex-1">
                  <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#8B7E70] block">
                    TOMORROW, 09:00
                  </span>
                  <h4 className="font-bold text-[#3C352E] text-xs mt-0.5">
                    Asset Delivery: Audio Stems
                  </h4>
                  <p className="text-[11px] text-[#8B7E70]">
                    External Vendor • Dropbox Sync
                  </p>
                </div>
              </div>

              {/* Discovery Meeting Item (if confirmed) */}
              {upcomingMeeting && (
                <div className="p-3 rounded-xl bg-emerald-50/80 border border-emerald-200 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0 animate-pulse"></div>
                    <div>
                      <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-emerald-800 block">
                        CONFIRMED CALL • {upcomingMeeting.date} at {upcomingMeeting.startTime}
                      </span>
                      <h4 className="font-bold text-emerald-950 text-xs mt-0.5">
                        {upcomingMeeting.topic}
                      </h4>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Director Mudit Sachdeva • Google Meet ({upcomingMeeting.durationMinutes}m)
                      </p>
                    </div>
                  </div>

                  <a
                    href={upcomingMeeting.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold py-1.5 px-2.5 rounded-lg flex items-center gap-1 shrink-0 transition-colors shadow-2xs"
                  >
                    <Video className="w-3 h-3" />
                    <span>Join</span>
                  </a>
                </div>
              )}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: FINANCIALS & STORAGE ALLOCATION (5 Cols) */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-6">
          
          {/* Financials Card */}
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-3 sm:space-y-4">
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-2.5">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#8C7456]" />
                <h3 className="text-xs sm:text-sm font-bold text-[#3C352E]">Financials</h3>
              </div>
              <button
                type="button"
                onClick={onNavigateToFinancials}
                className="text-xs text-[#8C7456] font-bold hover:underline cursor-pointer"
              >
                Invoices
              </button>
            </div>

            <div>
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#8B7E70] block">
                OUTSTANDING BALANCE
              </span>
              <div className="text-xl sm:text-2xl font-serif font-bold text-[#3C352E] mt-0.5">
                ₹24,500.00
              </div>
            </div>

            <div className="space-y-2 pt-1.5 border-t border-[#EBE4D8]">
              <span className="font-mono text-[9px] font-bold uppercase tracking-wider text-[#8B7E70] block">
                RECENT INVOICES
              </span>

              <div className="space-y-2 text-xs">
                <div 
                  onClick={onNavigateToFinancials}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] hover:border-[#8C7456] cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-[#3C352E] block text-[11px]">INV-2023-089</span>
                    <span className="text-[10px] text-[#8B7E70]">Due Oct 15</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#3C352E] block text-[11px]">₹12,000</span>
                    <span className="text-[9px] font-bold text-amber-800 uppercase font-mono">Unpaid</span>
                  </div>
                </div>

                <div 
                  onClick={onNavigateToFinancials}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] hover:border-[#8C7456] cursor-pointer transition-colors"
                >
                  <div>
                    <span className="font-mono font-bold text-[#3C352E] block text-[11px]">INV-2023-088</span>
                    <span className="text-[10px] text-[#8B7E70]">Paid Oct 01</span>
                  </div>
                  <div className="text-right">
                    <span className="font-mono font-bold text-[#3C352E] block text-[11px]">₹8,500</span>
                    <span className="text-[9px] font-bold text-emerald-800 uppercase font-mono">Paid</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
