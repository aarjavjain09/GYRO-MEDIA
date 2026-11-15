import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Clock, User, Mail, Phone, Video, 
  Plus, Trash2, CheckCircle2, AlertCircle, Bell, Send, 
  ExternalLink, Download, Search, Filter, ChevronLeft, 
  ChevronRight, Sparkles, ShieldCheck, Check, CalendarRange, 
  MessageSquare, Radio, Share2, Printer, RefreshCw
} from "lucide-react";
import { MeetingSlot, Meeting, MeetingStatus, MeetingPlatform } from "../types";

interface AdminCalendarViewProps {
  slots: MeetingSlot[];
  meetings: Meeting[];
  onAddSlot: (slot: MeetingSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onBulkAddSlots: (newSlots: MeetingSlot[]) => void;
  onUpdateMeetingStatus: (meetingId: string, status: MeetingStatus) => void;
  onSendMeetingReminder: (meetingId: string, reminderType?: '24h_before' | '1h_before' | 'instant_manual') => void;
  onBookMeetingAsAdmin?: (slot: MeetingSlot, clientName: string, clientEmail: string, clientPhone: string, topic: string) => void;
}

export default function AdminCalendarView({
  slots,
  meetings,
  onAddSlot,
  onDeleteSlot,
  onBulkAddSlots,
  onUpdateMeetingStatus,
  onSendMeetingReminder
}: AdminCalendarViewProps) {
  // Calendar View Mode: 'month' | 'week' | 'list'
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'list'>('month');

  // Selected date filter (Defaults to August 14, 2026)
  const [selectedDate, setSelectedDate] = useState<string>("2026-08-14");
  
  // Current calendar month view (August 2026)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonthIndex, setCurrentMonthIndex] = useState<number>(7); // 0-indexed: 7 = August

  // Status and search filters for meetings list
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Modal / Drawer state for adding a single slot
  const [isAddSlotModalOpen, setIsAddSlotModalOpen] = useState(false);
  const [newSlotDate, setNewSlotDate] = useState(selectedDate || "2026-08-15");
  const [newSlotStartTime, setNewSlotStartTime] = useState("11:00 AM");
  const [newSlotDuration, setNewSlotDuration] = useState<number>(30);
  const [newSlotServiceType, setNewSlotServiceType] = useState("Creative Discovery Call");
  const [newSlotPlatform, setNewSlotPlatform] = useState<MeetingPlatform>("google_meet");

  // Toast / notification feedback
  const [feedbackNotice, setFeedbackNotice] = useState<string>("");

  const triggerFeedback = (msg: string) => {
    setFeedbackNotice(msg);
    setTimeout(() => setFeedbackNotice(""), 4500);
  };

  // Month navigation helpers
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const handlePrevMonth = () => {
    if (currentMonthIndex === 0) {
      setCurrentMonthIndex(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonthIndex(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonthIndex === 11) {
      setCurrentMonthIndex(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonthIndex(prev => prev + 1);
    }
  };

  // Calendar days generation
  const daysInCurrentMonth = new Date(currentYear, currentMonthIndex + 1, 0).getDate();
  const firstDayOfWeek = new Date(currentYear, currentMonthIndex, 1).getDay(); // 0 = Sunday

  // Helper to format ISO date string "YYYY-MM-DD"
  const formatDateKey = (year: number, monthIdx: number, day: number) => {
    const m = String(monthIdx + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  // Quick helper: calculate end time given start time string like "10:00 AM" and duration minutes
  const calculateEndTime = (startStr: string, minutes: number): string => {
    try {
      const [timePart, meridiem] = startStr.trim().split(" ");
      let [h, m] = timePart.split(":").map(Number);
      if (meridiem?.toUpperCase() === "PM" && h !== 12) h += 12;
      if (meridiem?.toUpperCase() === "AM" && h === 12) h = 0;

      const totalMins = h * 60 + m + minutes;
      let newH = Math.floor(totalMins / 60) % 24;
      const newM = totalMins % 60;
      const newMeridiem = newH >= 12 ? "PM" : "AM";
      if (newH > 12) newH -= 12;
      if (newH === 0) newH = 12;

      return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')} ${newMeridiem}`;
    } catch {
      return "11:30 AM";
    }
  };

  // Handle Add Single Slot
  const handleCreateSlot = (e: React.FormEvent) => {
    e.preventDefault();
    const generatedId = `slot-${Date.now()}`;
    const calculatedEndTime = calculateEndTime(newSlotStartTime, newSlotDuration);

    const slot: MeetingSlot = {
      id: generatedId,
      date: newSlotDate,
      startTime: newSlotStartTime,
      endTime: calculatedEndTime,
      durationMinutes: newSlotDuration,
      providerName: "Mudit Sachdeva (_illusionmaker)",
      serviceType: newSlotServiceType,
      isBooked: false,
      platform: newSlotPlatform
    };

    onAddSlot(slot);
    setIsAddSlotModalOpen(false);
    triggerFeedback(`✅ New available slot for ${newSlotDate} at ${newSlotStartTime} added to client portal.`);
  };

  // Handle Quick Bulk Generation for current week
  const handleBulkGenerateWeekSlots = () => {
    const datesToPopulate = [
      "2026-08-19",
      "2026-08-20",
      "2026-08-21",
      "2026-08-22",
      "2026-08-23"
    ];

    const standardTimes = [
      { start: "11:00 AM", end: "11:30 AM", type: "Creative Discovery Call" },
      { start: "02:30 PM", end: "03:00 PM", type: "Commercial Shoot Consultation" },
      { start: "04:30 PM", end: "05:15 PM", type: "VFX & High-End Colour Grading Briefing" }
    ];

    const generated: MeetingSlot[] = [];
    datesToPopulate.forEach((dt) => {
      standardTimes.forEach((t, i) => {
        generated.push({
          id: `bulk-slot-${dt}-${i}-${Math.floor(Math.random() * 1000)}`,
          date: dt,
          startTime: t.start,
          endTime: t.end,
          durationMinutes: 30,
          providerName: "Mudit Sachdeva (_illusionmaker)",
          serviceType: t.type,
          isBooked: false,
          platform: "google_meet"
        });
      });
    });

    onBulkAddSlots(generated);
    triggerFeedback(`Generated ${generated.length} fresh open slots for Aug 19 - Aug 23!`);
  };

  // Filtered meetings
  const filteredMeetings = meetings.filter(m => {
    const matchesSearch = 
      m.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.clientEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.date.includes(searchQuery);

    const matchesStatus = statusFilter === "all" ? true : m.status === statusFilter;
    const matchesDate = viewMode === "list" ? true : (selectedDate ? m.date === selectedDate : true);

    return matchesSearch && matchesStatus && (viewMode === 'list' || matchesDate);
  });

  // Slots for the selected date
  const selectedDateSlots = slots.filter(s => s.date === selectedDate);
  const selectedDateMeetings = meetings.filter(m => m.date === selectedDate);

  // Helper to export iCalendar .ics file
  const handleExportICS = (meeting: Meeting) => {
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Creame Studio//Mudit Sachdeva Discovery Meetings//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${meeting.id}@creame.studio
SUMMARY:${meeting.topic} - Mudit Sachdeva & ${meeting.clientName}
DESCRIPTION:Creative Discovery Session with Mudit Sachdeva (_illusionmaker).\\nClient: ${meeting.clientName} (${meeting.clientEmail})\\nJoin Link: ${meeting.meetingLink}\\nNotes: ${meeting.notes || 'None'}
LOCATION:${meeting.meetingLink}
STATUS:CONFIRMED
DTSTART:${meeting.date.replace(/-/g, '')}T100000Z
DTEND:${meeting.date.replace(/-/g, '')}T103000Z
BEGIN:VALARM
TRIGGER:-PT24H
ACTION:DISPLAY
DESCRIPTION:Reminder: Discovery Call with Mudit Sachdeva in 24 hours
END:VALARM
BEGIN:VALARM
TRIGGER:-PT1H
ACTION:DISPLAY
DESCRIPTION:Reminder: Discovery Call with Mudit Sachdeva in 1 hour
END:VALARM
END:VEVENT
END:VCALENDAR`;

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Meeting-${meeting.clientName.replace(/\s+/g, '_')}-${meeting.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    triggerFeedback(`📅 Calendar invite (.ics) downloaded for ${meeting.clientName}!`);
  };

  // Helper to export CSV schedule
  const handleExportScheduleCSV = () => {
    const headers = "Meeting ID,Date,Time,Duration,Client Name,Client Email,Phone,Topic,Service Interest,Platform,Link,Status,Reminder Dispatched\n";
    const rows = meetings.map(m => 
      `"${m.id}","${m.date}","${m.startTime} - ${m.endTime}","${m.durationMinutes} mins","${m.clientName}","${m.clientEmail}","${m.clientPhone || ''}","${m.topic}","${m.projectInterest}","${m.platform}","${m.meetingLink}","${m.status}","${m.reminderSent ? 'YES' : 'NO'}"`
    ).join("\n");

    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Mudit_Sachdeva_Meetings_Schedule_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    triggerFeedback("📥 Complete client meetings roster exported to CSV.");
  };

  return (
    <div className="space-y-6 animate-fadeIn" id="admin-calendar-view-container">
      
      {/* TOAST FEEDBACK NOTIFICATION */}
      {feedbackNotice && (
        <div className="p-3.5 bg-[#3C352E] text-[#FAF7F2] rounded-xl border border-amber-400/30 text-xs flex items-center justify-between shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="font-medium">{feedbackNotice}</span>
          </div>
          <button 
            onClick={() => setFeedbackNotice("")}
            className="text-stone-400 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* TOP CONTROLS & HEADER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white border border-[#EBE4D8] rounded-2xl p-5 shadow-xs">
        <div>
          <div className="flex items-center gap-2 text-[#8C7456] font-bold text-xs uppercase tracking-widest">
            <CalendarIcon className="w-4 h-4" />
            <span>Service Provider Schedule & Calendar</span>
          </div>
          <h3 className="text-2xl font-serif font-bold text-[#3C352E] mt-1 flex items-center gap-3">
            <span>Mudit Sachdeva's Discovery Schedule</span>
            <span className="text-xs font-sans font-bold bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-0.5 rounded-full">
              {meetings.filter(m => m.status === 'confirmed').length} Active Client Calls
            </span>
          </h3>
          <p className="text-xs text-[#8B7E70] mt-0.5">
            Manage open consultation slots for pre-booking clients, synchronize real-time client reservations, and automate meeting reminders.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsAddSlotModalOpen(true)}
            className="px-3.5 py-2 bg-[#3C352E] hover:bg-[#27221E] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            id="btn-admin-add-slot"
          >
            <Plus className="w-3.5 h-3.5 text-amber-300" />
            <span>Add Available Slot</span>
          </button>

          <button
            onClick={handleBulkGenerateWeekSlots}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-[#8C7456] border border-amber-200 text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
            title="Generate 3 daily open slots for upcoming dates"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-700" />
            <span>Auto-Generate Week Slots</span>
          </button>

          <button
            onClick={handleExportScheduleCSV}
            className="px-3 py-2 bg-white hover:bg-[#FAF7F2] text-[#8C7456] border border-[#EBE4D8] text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Export full bookings roster to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Roster</span>
          </button>
        </div>
      </div>

      {/* AUTOMATED REMINDER DISPATCH ENGINE STATUS BANNER */}
      <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center text-amber-800 shrink-0">
            <Bell className="w-4.5 h-4.5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3C352E]">
                Automated Client Meeting Reminder Engine
              </h4>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full font-mono">
                Active • 24h & 1h Triggers
              </span>
            </div>
            <p className="text-[11px] text-[#6B6155] mt-0.5 leading-relaxed">
              When clients book a consultation slot before hiring Mudit, reminders are auto-queued. You can also trigger an immediate manual reminder with 1-click below.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <span className="bg-white border border-[#EBE4D8] text-[#8C7456] px-3 py-1.5 rounded-lg font-bold">
            {meetings.reduce((acc, m) => acc + (m.reminderLogs?.length || 0), 0)} Reminders Dispatched
          </span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN CALENDAR & SLOTS LAYOUT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: MONTHLY CALENDAR GRID & DAY SELECTOR */}
        <div className="lg:col-span-7 bg-white border border-[#EBE4D8] rounded-2xl p-5 sm:p-6 shadow-xs space-y-4" id="calendar-grid-card">
          
          {/* Calendar Month Header */}
          <div className="flex items-center justify-between border-b border-[#EBE4D8]/60 pb-3.5">
            <div className="flex items-center gap-2.5">
              <h4 className="text-base sm:text-lg font-serif font-bold text-[#3C352E]">
                {monthNames[currentMonthIndex]} {currentYear}
              </h4>
              <span className="text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 bg-[#FAF7F2] border border-[#EBE4D8] text-[#8C7456] rounded-md">
                Studio Calendar
              </span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 hover:bg-[#FAF7F2] border border-[#EBE4D8] text-[#3C352E] rounded-lg transition-colors cursor-pointer"
                title="Previous Month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setCurrentYear(2026);
                  setCurrentMonthIndex(7);
                  setSelectedDate("2026-08-14");
                }}
                className="px-2.5 py-1 text-[11px] font-bold text-[#8C7456] hover:bg-[#FAF7F2] border border-[#EBE4D8] rounded-lg transition-colors cursor-pointer font-mono"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 hover:bg-[#FAF7F2] border border-[#EBE4D8] text-[#3C352E] rounded-lg transition-colors cursor-pointer"
                title="Next Month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Labels Header */}
          <div className="grid grid-cols-7 gap-1.5 text-center font-mono text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] py-1 border-b border-[#FAF7F2]">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Calendar Days Matrix */}
          <div className="grid grid-cols-7 gap-1.5 pt-1">
            {/* Empty offset padding for days before month starts */}
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div 
                key={`empty-${i}`} 
                className="min-h-[64px] sm:min-h-[72px] rounded-xl bg-[#FAF7F2]/30 border border-dashed border-[#EBE4D8]/50"
              />
            ))}

            {/* Actual Month Days */}
            {Array.from({ length: daysInCurrentMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateKey = formatDateKey(currentYear, currentMonthIndex, dayNum);
              const isSelected = selectedDate === dateKey;
              const isToday = dateKey === "2026-08-14";

              const daySlots = slots.filter(s => s.date === dateKey);
              const availableCount = daySlots.filter(s => !s.isBooked).length;
              const bookedMeetingsCount = meetings.filter(m => m.date === dateKey && m.status === 'confirmed').length;
              const hasActivity = bookedMeetingsCount > 0 || availableCount > 0;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => setSelectedDate(dateKey)}
                  className={`min-h-[68px] sm:min-h-[76px] p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer relative overflow-hidden group ${
                    isSelected
                      ? "bg-[#3C352E] text-white border-[#3C352E] shadow-sm ring-2 ring-[#8C7456]"
                      : isToday
                        ? "bg-[#FFFBF2] border-amber-400 ring-2 ring-amber-400/40 text-[#3C352E] hover:bg-[#FFF8E7]"
                        : hasActivity
                          ? "bg-white hover:bg-[#FAF7F2] border-[#EBE4D8] text-[#3C352E] hover:border-[#8C7456]/50"
                          : "bg-[#FAF7F2]/50 hover:bg-[#FAF7F2] border-[#EBE4D8]/60 text-[#6B6155]"
                  }`}
                >
                  {/* Day number top row */}
                  <div className="flex justify-between items-center w-full">
                    <div className="flex items-center gap-1">
                      <span className={`text-xs sm:text-sm font-mono font-bold leading-none ${
                        isSelected 
                          ? "text-amber-300" 
                          : isToday 
                            ? "text-[#3C352E] font-extrabold" 
                            : "text-[#3C352E]"
                      }`}>
                        {dayNum}
                      </span>
                      {isToday && !isSelected && (
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                      )}
                    </div>
                    {isToday && (
                      <span className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded-md leading-none tracking-wider shadow-2xs ${
                        isSelected 
                          ? "bg-amber-400 text-[#2A231C] font-extrabold" 
                          : "bg-[#3C352E] text-white font-bold"
                      }`}>
                        Today
                      </span>
                    )}
                  </div>

                  {/* Day activity pills - Clean & Minimal */}
                  <div className="w-full space-y-1 mt-1">
                    {bookedMeetingsCount > 0 && (
                      <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 leading-tight ${
                        isSelected 
                          ? "bg-emerald-500/25 text-emerald-200 border border-emerald-400/30" 
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                        <span className="truncate">{bookedMeetingsCount} Call{bookedMeetingsCount > 1 ? 's' : ''}</span>
                      </div>
                    )}
                    {availableCount > 0 && (
                      <div className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-md truncate flex items-center gap-1 leading-tight ${
                        isSelected
                          ? "bg-amber-400/20 text-amber-200 border border-amber-300/30"
                          : "bg-[#FAF7F2] text-[#8C7456] border border-[#EBE4D8]"
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0"></span>
                        <span className="truncate">{availableCount} Open</span>
                      </div>
                    )}
                    {!hasActivity && !isSelected && (
                      <div className="h-2"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Legend and summary strip */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-[#EBE4D8]/60 text-xs text-[#6B6155]">
            <div className="flex items-center gap-3.5 text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[#3C352E] font-medium">Booked Call</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span className="text-[#3C352E] font-medium">Open Slot</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#3C352E]"></span>
                <span className="text-[#3C352E] font-medium">Selected Date</span>
              </div>
            </div>

            <div className="font-mono text-[11px] text-[#8C7456] bg-[#FAF7F2] px-2.5 py-1 rounded-lg border border-[#EBE4D8]">
              Selected: <strong className="text-[#3C352E]">{selectedDate}</strong>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SELECTED DAY SCHEDULE & AVAILABLE SLOTS MANAGER */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* DAY SCHEDULE CARD */}
          <div className="bg-white border border-[#EBE4D8] rounded-2xl p-5 shadow-xs space-y-4" id="day-schedule-card">
            <div className="flex justify-between items-center border-b border-[#FAF7F2] pb-3">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7456]">Schedule Breakdown</span>
                <h4 className="text-base font-serif font-bold text-[#3C352E]">
                  {new Date(selectedDate + "T00:00:00").toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}
                </h4>
              </div>

              <button
                onClick={() => {
                  setNewSlotDate(selectedDate);
                  setIsAddSlotModalOpen(true);
                }}
                className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#8C7456] hover:text-white border border-[#EBE4D8] text-[#8C7456] text-xs font-semibold uppercase tracking-wider rounded-xl transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Slot</span>
              </button>
            </div>

            {/* Booked Meetings for this Date */}
            <div className="space-y-3">
              <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#3C352E] flex items-center justify-between">
                <span>Confirmed Meetings ({selectedDateMeetings.length})</span>
                <span className="text-[10px] text-emerald-700 font-mono">Real-Time Client Ingest</span>
              </h5>

              {selectedDateMeetings.length === 0 ? (
                <div className="bg-[#FAF7F2] border border-dashed border-[#EBE4D8] rounded-xl p-4 text-center text-xs text-[#8B7E70]">
                  No client meetings booked yet for this day.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {selectedDateMeetings.map(meeting => (
                    <div 
                      key={meeting.id}
                      className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-3.5 space-y-2.5 shadow-2xs hover:border-[#8C7456] transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-[#3C352E] text-white flex items-center justify-center font-bold text-xs uppercase">
                            {meeting.clientName.charAt(0)}
                          </div>
                          <div>
                            <h6 className="text-xs font-bold text-[#3C352E]">{meeting.clientName}</h6>
                            <span className="text-[10px] text-[#8B7E70] block">{meeting.clientEmail}</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {meeting.status}
                        </span>
                      </div>

                      <div className="bg-white border border-[#EBE4D8] rounded-lg p-2 text-xs space-y-1">
                        <div className="flex justify-between font-mono text-[11px]">
                          <span className="font-bold text-[#8C7456]">{meeting.startTime} - {meeting.endTime}</span>
                          <span className="text-stone-500">({meeting.durationMinutes} mins)</span>
                        </div>
                        <div className="font-semibold text-[#3C352E] text-[11px] truncate">
                          📌 {meeting.topic}
                        </div>
                        {meeting.notes && (
                          <p className="text-[10px] text-[#6B6155] italic truncate">
                            Note: "{meeting.notes}"
                          </p>
                        )}
                      </div>

                      {/* Reminder & Actions strip */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#EBE4D8]/60 text-xs">
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              onSendMeetingReminder(meeting.id, 'instant_manual');
                              triggerFeedback(`🔔 Meeting reminder email & SMS sent to ${meeting.clientEmail}!`);
                            }}
                            className="px-2.5 py-1 bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-[10px] uppercase rounded-lg border border-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                            title="Dispatch email & SMS reminder to client now"
                          >
                            <Send className="w-3 h-3 text-amber-800" />
                            <span>Send Reminder</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleExportICS(meeting)}
                            className="p-1 hover:bg-white text-[#8C7456] rounded-md transition-colors cursor-pointer"
                            title="Download Calendar Invite (.ics)"
                          >
                            <CalendarIcon className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <a
                          href={meeting.meetingLink}
                          target="_blank"
                          rel="noreferrer"
                          className="px-2.5 py-1 bg-[#3C352E] hover:bg-[#25211D] text-white text-[10px] font-bold uppercase rounded-lg transition-colors flex items-center gap-1"
                        >
                          <Video className="w-3 h-3 text-amber-300" />
                          <span>Join Meet</span>
                        </a>
                      </div>

                      {/* Reminder Logs Indicator */}
                      {meeting.reminderLogs && meeting.reminderLogs.length > 0 && (
                        <div className="text-[9px] text-emerald-700 font-mono flex items-center gap-1 pt-0.5">
                          <Check className="w-3 h-3 text-emerald-600" />
                          <span>Last reminder sent: {new Date(meeting.reminderLogs[meeting.reminderLogs.length - 1].sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Open Slots available for Client Booking on this Date */}
            <div className="space-y-3 pt-2 border-t border-[#FAF7F0]">
              <div className="flex justify-between items-center">
                <h5 className="text-[11px] font-bold uppercase tracking-wider text-[#8C7456]">
                  Available Slots for Clients ({selectedDateSlots.filter(s => !s.isBooked).length})
                </h5>
                <span className="text-[10px] text-[#8B7E70]">Visible on Client Portal</span>
              </div>

              {selectedDateSlots.length === 0 ? (
                <div className="bg-[#FAF7F2] border border-dashed border-[#EBE4D8] rounded-xl p-4 text-center text-xs text-[#8B7E70]">
                  No slots configured for this date. Click "Add Slot" to open availability.
                </div>
              ) : (
                <div className="space-y-2">
                  {selectedDateSlots.map(slot => (
                    <div 
                      key={slot.id}
                      className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                        slot.isBooked
                          ? "bg-stone-50 border-stone-200 text-stone-400 opacity-60"
                          : "bg-amber-50/50 border-amber-200/80 text-[#3C352E]"
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-xs text-[#3C352E]">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-[10px] text-stone-500 font-mono">({slot.durationMinutes}m)</span>
                          {slot.isBooked ? (
                            <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 bg-stone-200 text-stone-700 rounded-sm">
                              Reserved
                            </span>
                          ) : (
                            <span className="text-[8px] uppercase font-bold px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded-sm">
                              Open for Clients
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8B7E70] block">{slot.serviceType}</span>
                      </div>

                      {!slot.isBooked && (
                        <button
                          type="button"
                          onClick={() => {
                            onDeleteSlot(slot.id);
                            triggerFeedback(`Slot for ${slot.startTime} removed.`);
                          }}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors cursor-pointer"
                          title="Remove open slot"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {/* COMPREHENSIVE ALL CLIENT MEETINGS ROSTER TABLE */}
      <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 shadow-xs space-y-4" id="all-meetings-roster-card">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-[#FAF7F2] pb-4">
          <div>
            <h4 className="text-lg font-serif font-bold text-[#3C352E]">
              Master Client Meetings & Consultations Log
            </h4>
            <p className="text-xs text-[#8B7E70]">
              Complete archive of clients who booked discovery sessions with Mudit Sachdeva before placing their production orders.
            </p>
          </div>

          {/* Search and status filter */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Search client, email or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl pl-8 pr-3 py-1.5 text-xs text-[#3C352E] w-56 focus:outline-hidden focus:border-[#8C7456]"
              />
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2.5" />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-1.5 text-xs text-[#3C352E] focus:outline-hidden font-medium"
            >
              <option value="all">All Statuses</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs md:text-sm">
            <thead>
              <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#8C7456] uppercase tracking-wider text-[10px] font-bold">
                <th className="p-3.5">Date & Time</th>
                <th className="p-3.5">Client & Contact</th>
                <th className="p-3.5">Discussion Topic / Scope</th>
                <th className="p-3.5">Service Interest</th>
                <th className="p-3.5">Platform</th>
                <th className="p-3.5">Reminders</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FAF7F0] text-[#3C352E]">
              {filteredMeetings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-xs text-[#8B7E70]">
                    No client meetings match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredMeetings.map((m) => (
                  <tr key={m.id} className="hover:bg-[#FAF7F2]/50 transition-colors">
                    <td className="p-3.5">
                      <div className="font-mono font-bold text-xs text-[#3C352E]">{m.date}</div>
                      <div className="text-[11px] text-[#8C7456] font-mono">{m.startTime} - {m.endTime}</div>
                    </td>
                    <td className="p-3.5">
                      <div className="font-semibold text-xs text-[#3C352E]">{m.clientName}</div>
                      <div className="text-[11px] text-[#8B7E70]">{m.clientEmail}</div>
                      {m.clientPhone && <div className="text-[10px] text-stone-500 font-mono">{m.clientPhone}</div>}
                    </td>
                    <td className="p-3.5 max-w-xs">
                      <div className="font-medium text-xs text-[#3C352E] truncate">{m.topic}</div>
                      {m.notes && <p className="text-[10px] text-[#8B7E70] italic truncate">"{m.notes}"</p>}
                    </td>
                    <td className="p-3.5">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                        {m.projectInterest}
                      </span>
                    </td>
                    <td className="p-3.5">
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#8C7456]">
                        <Video className="w-3.5 h-3.5" />
                        <span className="capitalize">{m.platform.replace('_', ' ')}</span>
                      </span>
                    </td>
                    <td className="p-3.5">
                      {m.reminderSent ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          <Check className="w-3 h-3" />
                          <span>Dispatched</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          Scheduled (24h/1h)
                        </span>
                      )}
                    </td>
                    <td className="p-3.5">
                      <select
                        value={m.status}
                        onChange={(e) => {
                          onUpdateMeetingStatus(m.id, e.target.value as MeetingStatus);
                          triggerFeedback(`Status for ${m.clientName}'s meeting changed to ${e.target.value}.`);
                        }}
                        className={`text-[10px] font-bold uppercase rounded-lg px-2 py-1 border transition-colors cursor-pointer ${
                          m.status === 'confirmed'
                            ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                            : m.status === 'completed'
                              ? "bg-stone-100 text-stone-700 border-stone-200"
                              : "bg-red-50 text-red-700 border-red-200"
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-3.5 text-right space-x-1.5">
                      <button
                        type="button"
                        onClick={() => {
                          onSendMeetingReminder(m.id, 'instant_manual');
                          triggerFeedback(`📢 Notification & reminder dispatched to ${m.clientEmail}!`);
                        }}
                        className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                        title="Send immediate reminder"
                      >
                        <Bell className="w-3 h-3" />
                        <span className="hidden md:inline">Remind</span>
                      </button>

                      <a
                        href={m.meetingLink}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 bg-[#3C352E] hover:bg-[#25211D] text-white rounded-lg transition-colors cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold"
                        title="Join video conference"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span className="hidden md:inline">Join</span>
                      </a>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: ADD SINGLE AVAILABLE SLOT */}
      {isAddSlotModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#EBE4D8] p-6 max-w-md w-full shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex justify-between items-center border-b border-[#FAF7F2] pb-3">
              <div className="flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-[#8C7456]" />
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#3C352E]">
                  Create Open Consultation Slot
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setIsAddSlotModalOpen(false)}
                className="text-stone-400 hover:text-[#3C352E]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Date</label>
                <input
                  type="date"
                  value={newSlotDate}
                  onChange={(e) => setNewSlotDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-mono focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Start Time</label>
                  <select
                    value={newSlotStartTime}
                    onChange={(e) => setNewSlotStartTime(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-mono focus:outline-hidden"
                  >
                    <option value="09:00 AM">09:00 AM</option>
                    <option value="10:00 AM">10:00 AM</option>
                    <option value="10:30 AM">10:30 AM</option>
                    <option value="11:00 AM">11:00 AM</option>
                    <option value="11:30 AM">11:30 AM</option>
                    <option value="01:00 PM">01:00 PM</option>
                    <option value="02:00 PM">02:00 PM</option>
                    <option value="02:30 PM">02:30 PM</option>
                    <option value="03:30 PM">03:30 PM</option>
                    <option value="04:30 PM">04:30 PM</option>
                    <option value="05:30 PM">05:30 PM</option>
                    <option value="06:30 PM">06:30 PM</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Duration</label>
                  <select
                    value={newSlotDuration}
                    onChange={(e) => setNewSlotDuration(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden"
                  >
                    <option value={15}>15 Minutes</option>
                    <option value={30}>30 Minutes</option>
                    <option value={45}>45 Minutes</option>
                    <option value={60}>60 Minutes</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Meeting Purpose / Service Type</label>
                <input
                  type="text"
                  value={newSlotServiceType}
                  onChange={(e) => setNewSlotServiceType(e.target.value)}
                  placeholder="e.g. Creative Discovery Call"
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Preferred Meeting Platform</label>
                <select
                  value={newSlotPlatform}
                  onChange={(e) => setNewSlotPlatform(e.target.value as MeetingPlatform)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden"
                >
                  <option value="google_meet">Google Meet (Recommended)</option>
                  <option value="zoom">Zoom</option>
                  <option value="phone">Phone / WhatsApp Audio</option>
                  <option value="in_person">In-Person Studio Visit</option>
                </select>
              </div>

              <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-3 text-[11px] text-[#6B6155] space-y-1">
                <span className="font-bold text-[#3C352E] block">Service Provider:</span>
                <span>Mudit Sachdeva (_illusionmaker) • Visual Director</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#FAF7F2]">
                <button
                  type="button"
                  onClick={() => setIsAddSlotModalOpen(false)}
                  className="px-3 py-2 text-xs font-semibold text-[#8C7456] hover:bg-[#FAF7F2] rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
                >
                  Save & Publish Slot
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
