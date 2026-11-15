import React, { useState } from "react";
import { 
  Calendar as CalendarIcon, Clock, Video, User, Mail, Phone, 
  Sparkles, CheckCircle2, ShieldCheck, ChevronRight, ChevronLeft,
  Bell, AlertCircle, ArrowRight, ExternalLink, CalendarPlus, 
  MessageSquare, HelpCircle, Check, Send
} from "lucide-react";
import { MeetingSlot, Meeting, MeetingPlatform } from "../types";

interface ClientMeetingBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  availableSlots: MeetingSlot[];
  onBookMeeting: (meeting: Meeting) => void;
  currentUser?: { name: string; email: string } | null;
  preSelectedServiceId?: string;
  initialClientName?: string;
  initialClientEmail?: string;
  initialInterest?: 'photography' | 'videography' | 'edits' | 'custom';
}

export default function ClientMeetingBookingModal({
  isOpen,
  onClose,
  availableSlots,
  onBookMeeting,
  currentUser = null,
  preSelectedServiceId,
  initialClientName = "",
  initialClientEmail = "",
  initialInterest = "videography"
}: ClientMeetingBookingModalProps) {
  // Step state: 1 = pick slot & service, 2 = contact & details, 3 = confirmed
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Selected date & slot
  const openSlots = availableSlots.filter(s => !s.isBooked);
  
  // Available unique dates
  const uniqueDates = Array.from(new Set(openSlots.map(s => s.date))).sort();
  const [selectedDate, setSelectedDate] = useState<string>(uniqueDates[0] || "2026-08-14");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");

  // Determine initial service interest based on preSelectedServiceId
  const getInitialInterest = (): 'photography' | 'videography' | 'edits' | 'custom' => {
    if (preSelectedServiceId === 'photos' || preSelectedServiceId === 'photography') return 'photography';
    if (preSelectedServiceId === 'video' || preSelectedServiceId === 'videography') return 'videography';
    if (preSelectedServiceId === 'edits') return 'edits';
    if (preSelectedServiceId === 'custom') return 'custom';
    return initialInterest;
  };

  // Form Fields
  const [clientName, setClientName] = useState(currentUser?.name || initialClientName);
  const [clientEmail, setClientEmail] = useState(currentUser?.email || initialClientEmail);
  const [clientPhone, setClientPhone] = useState("+91 98765 43210");
  const [projectInterest, setProjectInterest] = useState<'photography' | 'videography' | 'edits' | 'custom'>(getInitialInterest());
  const [topic, setTopic] = useState("Brand Visual Campaign & Scope Discovery");
  const [notes, setNotes] = useState("");
  const [platform, setPlatform] = useState<MeetingPlatform>("google_meet");

  // Confirmed booking state
  const [confirmedMeeting, setConfirmedMeeting] = useState<Meeting | null>(null);
  const [testReminderSent, setTestReminderSent] = useState(false);

  if (!isOpen) return null;

  const slotsForSelectedDate = openSlots.filter(s => s.date === selectedDate);
  const selectedSlot = openSlots.find(s => s.id === selectedSlotId);

  const handleSelectSlot = (slot: MeetingSlot) => {
    setSelectedSlotId(slot.id);
  };

  const handleProceedToDetails = () => {
    if (!selectedSlot) return;
    setStep(2);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;

    const meetLink = `https://meet.google.com/mudit-${Math.random().toString(36).substring(2, 7)}`;

    const newMeetingData = {
      slotId: selectedSlot.id,
      date: selectedSlot.date,
      startTime: selectedSlot.startTime,
      endTime: selectedSlot.endTime,
      durationMinutes: selectedSlot.durationMinutes,
      clientName: clientName.trim() || "Client Partner",
      clientEmail: clientEmail.trim() || "client@brand.com",
      clientPhone: clientPhone.trim(),
      providerName: "Mudit Sachdeva (_illusionmaker)",
      topic: topic.trim() || "Creative Discovery Consultation",
      projectInterest,
      notes: notes.trim(),
      platform,
      meetingLink: meetLink
    };

    const completeMeeting: Meeting = {
      id: `meet-${Date.now()}`,
      ...newMeetingData,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      reminderSent: true,
      reminderLogs: [
        {
          id: `rem-init-${Date.now()}`,
          sentAt: new Date().toISOString(),
          type: 'booking_confirmation',
          recipient: newMeetingData.clientEmail,
          channel: 'both',
          messagePreview: `Confirmed: Discovery Session with Mudit Sachdeva on ${newMeetingData.date} at ${newMeetingData.startTime}.`
        }
      ]
    };

    onBookMeeting(completeMeeting);
    setConfirmedMeeting(completeMeeting);
    setStep(3);
  };

  const handleSendTestReminder = () => {
    setTestReminderSent(true);
    setTimeout(() => setTestReminderSent(false), 4000);
  };

  const handleDownloadICS = () => {
    if (!confirmedMeeting) return;
    const icsContent = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Creame Studio//Mudit Sachdeva Discovery Meetings//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${confirmedMeeting.id}@creame.studio
SUMMARY:${confirmedMeeting.topic} - Mudit Sachdeva & ${confirmedMeeting.clientName}
DESCRIPTION:Creative Discovery Session with Mudit Sachdeva (_illusionmaker).\\nClient: ${confirmedMeeting.clientName}\\nJoin Link: ${confirmedMeeting.meetingLink}\\nNotes: ${confirmedMeeting.notes || 'None'}
LOCATION:${confirmedMeeting.meetingLink}
STATUS:CONFIRMED
DTSTART:${confirmedMeeting.date.replace(/-/g, '')}T100000Z
DTEND:${confirmedMeeting.date.replace(/-/g, '')}T103000Z
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
    a.download = `Discovery-Mudit-Sachdeva-${confirmedMeeting.date}.ics`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-[#EBE4D8] max-w-2xl w-full shadow-2xl overflow-hidden animate-scaleUp my-8">
        
        {/* HEADER BAR */}
        <div className="bg-[#FAF7F2] border-b border-[#EBE4D8] p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-stone-400 hover:text-[#3C352E] p-1 rounded-full hover:bg-stone-200/50 transition-colors"
          >
            ✕
          </button>

          <div className="flex items-center gap-2 text-[#8C7456] font-bold text-[10px] uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pre-Booking Creative Consultation</span>
          </div>

          <h3 className="text-xl md:text-2xl font-serif font-bold text-[#3C352E] mt-1">
            Book a 1-on-1 Discovery Call with Mudit Sachdeva
          </h3>

          <p className="text-xs text-[#8B7E70] mt-1 leading-relaxed">
            Discuss your visual vision, project milestones, lighting moodboards, and turnaround expectations directly with the director before confirming your escrow payment.
          </p>

          {/* Stepper indicator */}
          <div className="flex items-center gap-2 mt-4 pt-3 border-t border-[#EBE4D8]/60 text-xs">
            <span className={`flex items-center gap-1 font-semibold ${step === 1 ? "text-[#3C352E]" : "text-emerald-700"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? "bg-[#3C352E] text-white" : "bg-emerald-100 text-emerald-800"}`}>
                {step > 1 ? "✓" : "1"}
              </span>
              <span>Select Time Slot</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

            <span className={`flex items-center gap-1 font-semibold ${step === 2 ? "text-[#3C352E]" : step === 3 ? "text-emerald-700" : "text-stone-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? "bg-[#3C352E] text-white" : step === 3 ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-600"}`}>
                {step === 3 ? "✓" : "2"}
              </span>
              <span>Project Details</span>
            </span>

            <ChevronRight className="w-3.5 h-3.5 text-stone-400" />

            <span className={`flex items-center gap-1 font-semibold ${step === 3 ? "text-[#3C352E]" : "text-stone-400"}`}>
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 3 ? "bg-emerald-600 text-white" : "bg-stone-200 text-stone-600"}`}>
                3
              </span>
              <span>Confirmed</span>
            </span>
          </div>
        </div>

        {/* STEP 1: SELECT AVAILABLE SLOT FROM ADMIN DASHBOARD */}
        {step === 1 && (
          <div className="p-6 space-y-6">
            
            {/* Service Director Profile Badge */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#3C352E] text-amber-200 flex items-center justify-center font-serif text-lg font-bold border-2 border-amber-300">
                  MS
                </div>
                <div>
                  <h4 className="text-sm font-serif font-bold text-[#3C352E]">
                    Mudit Sachdeva <span className="text-xs font-mono text-[#8C7456] font-normal">(@_illusionmaker)</span>
                  </h4>
                  <p className="text-[11px] text-[#8B7E70]">
                    7+ Years Exp • 1,000+ Brand Campaigns • 100+ Celebrities • Free 30-min Consultation
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 border border-emerald-300 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase">
                <CheckCircle2 className="w-3 h-3" />
                Live Slots Active
              </span>
            </div>

            {/* Date Picker Ribbon */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase text-[#8C7456] tracking-wider">
                1. Choose Date (Showing Open Studio Slots)
              </label>

              {uniqueDates.length === 0 ? (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                  No slots currently published. Please check back shortly or reach out via floating chat.
                </div>
              ) : (
                <div className="flex items-center gap-2 overflow-x-auto pb-2">
                  {uniqueDates.map(dateStr => {
                    const isSelected = selectedDate === dateStr;
                    const dateObj = new Date(dateStr + "T00:00:00");
                    const weekday = dateObj.toLocaleDateString(undefined, { weekday: 'short' });
                    const dayNum = dateObj.getDate();
                    const monthStr = dateObj.toLocaleDateString(undefined, { month: 'short' });
                    const slotsCount = openSlots.filter(s => s.date === dateStr).length;

                    return (
                      <button
                        key={dateStr}
                        type="button"
                        onClick={() => {
                          setSelectedDate(dateStr);
                          setSelectedSlotId("");
                        }}
                        className={`min-w-[85px] p-3 rounded-2xl border text-center transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#3C352E] text-white border-[#3C352E] shadow-sm"
                            : "bg-[#FAF7F2] hover:bg-[#EBE4D8]/60 text-[#3C352E] border-[#EBE4D8]"
                        }`}
                      >
                        <span className={`block text-[10px] font-bold uppercase ${isSelected ? "text-amber-300" : "text-[#8C7456]"}`}>
                          {weekday}
                        </span>
                        <span className="block text-base font-bold font-mono my-0.5">
                          {dayNum} {monthStr}
                        </span>
                        <span className={`text-[9px] block font-mono ${isSelected ? "text-emerald-300" : "text-emerald-700 font-semibold"}`}>
                          {slotsCount} open
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Time Slots Grid */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold uppercase text-[#8C7456] tracking-wider">
                2. Select Your Preferred Time Slot
              </label>

              {slotsForSelectedDate.length === 0 ? (
                <div className="p-4 bg-[#FAF7F2] border border-dashed border-[#EBE4D8] rounded-xl text-center text-xs text-[#8B7E70]">
                  No open slots left on this specific date. Please pick another date above.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {slotsForSelectedDate.map(slot => {
                    const isSelected = selectedSlotId === slot.id;
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => handleSelectSlot(slot)}
                        className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-[#FAF7F2] border-[#8C7456] ring-2 ring-[#8C7456]/40 shadow-xs"
                            : "bg-white hover:bg-[#FAF7F2]/60 border-[#EBE4D8] text-[#3C352E]"
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-mono font-bold text-sm text-[#3C352E]">
                            {slot.startTime} - {slot.endTime}
                          </span>
                          <span className="text-[10px] font-mono font-bold text-[#8C7456] bg-amber-100/70 border border-amber-300/60 px-2 py-0.5 rounded-full">
                            {slot.durationMinutes} mins
                          </span>
                        </div>
                        <span className="text-[11px] text-[#6B6155] font-medium truncate">
                          {slot.serviceType}
                        </span>
                        <div className="flex items-center gap-1 text-[10px] text-stone-500 mt-2 pt-2 border-t border-[#EBE4D8]/50">
                          <Video className="w-3 h-3 text-[#8C7456]" />
                          <span>Google Meet Video Link Provided</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 1 Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-[#EBE4D8]">
              <div className="text-xs text-[#8B7E70]">
                {selectedSlot ? (
                  <span>Selected: <strong className="text-[#3C352E]">{selectedSlot.date} at {selectedSlot.startTime}</strong></span>
                ) : (
                  <span>Please select a slot to continue</span>
                )}
              </div>

              <button
                type="button"
                disabled={!selectedSlot}
                onClick={handleProceedToDetails}
                className="px-5 py-2.5 bg-[#8C7456] hover:bg-[#705D44] disabled:opacity-40 disabled:pointer-events-none text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Continue to Project Details</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </div>
        )}

        {/* STEP 2: CLIENT CONTACT & PROJECT SCOPE */}
        {step === 2 && selectedSlot && (
          <form onSubmit={handleConfirmBooking} className="p-6 space-y-4 text-xs">
            
            {/* Slot Summary Pill */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-3.5 flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-[#8C7456] tracking-wider block">Meeting Reserved</span>
                <span className="text-xs font-bold text-[#3C352E]">
                  {selectedSlot.date} • {selectedSlot.startTime} - {selectedSlot.endTime} ({selectedSlot.durationMinutes} mins)
                </span>
              </div>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-[#8C7456] hover:underline font-semibold cursor-pointer"
              >
                Change Slot
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Your Full Name *</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="e.g. Aarjav Jain / Sophia Mercer"
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Email Address (For Google Meet & Calendar Invite) *</label>
                <input
                  type="email"
                  required
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  placeholder="client@brand.com"
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Phone Number (For WhatsApp / SMS Reminder)</label>
                <input
                  type="tel"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-mono focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Primary Service Interest</label>
                <select
                  value={projectInterest}
                  onChange={(e) => setProjectInterest(e.target.value as any)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden"
                >
                  <option value="videography">Videography & Commercial Films (From ₹10,000)</option>
                  <option value="photography">Editorial & Brand Photography (From ₹8,000)</option>
                  <option value="edits">Post-Production, Color & VFX (From ₹5,000)</option>
                  <option value="custom">Custom Enterprise / Celebrity Production</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Session Agenda / Topic</label>
              <input
                type="text"
                required
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Luxe Brand Campaign Discovery & Lighting Scheme"
                className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Project Notes / Questions for Mudit (Optional)</label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Share any references, Instagram/YouTube moodboard links, or deadline constraints..."
                className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden resize-none"
              />
            </div>

            {/* AUTOMATED REMINDER NOTICE */}
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl flex items-start gap-2.5">
              <Bell className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div className="text-[11px] leading-relaxed">
                <strong>Automated Meeting Reminder Policy:</strong> We will automatically dispatch a calendar invitation + SMS & Email reminders <strong>24 hours</strong> and <strong>1 hour</strong> prior to your session so you never miss the call.
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#EBE4D8]">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 text-xs font-semibold text-[#8C7456] hover:bg-[#FAF7F2] rounded-xl cursor-pointer"
              >
                Back
              </button>

              <button
                type="submit"
                className="px-6 py-2.5 bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-semibold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md"
              >
                <Check className="w-4 h-4 text-amber-300" />
                <span>Confirm & Add to Admin Calendar</span>
              </button>
            </div>

          </form>
        )}

        {/* STEP 3: BOOKING CONFIRMED & SYNCED */}
        {step === 3 && confirmedMeeting && (
          <div className="p-8 text-center space-y-5 animate-fadeIn">
            <div className="w-16 h-16 rounded-full bg-emerald-100 border-2 border-emerald-400 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <span className="text-xs font-bold uppercase tracking-widest text-[#8C7456]">Booking Confirmed & Synchronized</span>
              <h3 className="text-2xl font-serif font-bold text-[#3C352E]">
                Discovery Session Confirmed with Mudit Sachdeva
              </h3>
              <p className="text-xs text-[#8B7E70] max-w-md mx-auto">
                Your consultation has been booked and seamlessly scheduled onto the studio's admin master calendar.
              </p>
            </div>

            {/* Meeting Specs Card */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-5 text-left max-w-lg mx-auto space-y-3 shadow-2xs">
              <div className="flex justify-between items-start border-b border-[#EBE4D8]/80 pb-3">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#8C7456] tracking-wider">Scheduled Date & Time</span>
                  <div className="text-sm font-bold font-mono text-[#3C352E]">
                    {confirmedMeeting.date} • {confirmedMeeting.startTime} - {confirmedMeeting.endTime}
                  </div>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Confirmed
                </span>
              </div>

              <div className="space-y-1 text-xs">
                <div>
                  <span className="text-[#8B7E70] text-[11px]">Topic:</span> <strong className="text-[#3C352E]">{confirmedMeeting.topic}</strong>
                </div>
                <div>
                  <span className="text-[#8B7E70] text-[11px]">Client:</span> <span className="text-[#3C352E] font-medium">{confirmedMeeting.clientName} ({confirmedMeeting.clientEmail})</span>
                </div>
                <div>
                  <span className="text-[#8B7E70] text-[11px]">Provider:</span> <span className="text-[#3C352E] font-medium">{confirmedMeeting.providerName}</span>
                </div>
              </div>

              {/* Video Link */}
              <div className="bg-white border border-[#EBE4D8] rounded-xl p-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Video className="w-4 h-4 text-[#8C7456]" />
                  <span className="text-xs font-mono font-bold text-[#3C352E] truncate max-w-[200px] sm:max-w-xs">
                    {confirmedMeeting.meetingLink}
                  </span>
                </div>
                <a
                  href={confirmedMeeting.meetingLink}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-[#8C7456] hover:underline font-bold"
                >
                  Test Link
                </a>
              </div>
            </div>

            {/* Test Reminder Preview */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={handleDownloadICS}
                className="px-4 py-2.5 bg-white hover:bg-[#FAF7F2] text-[#8C7456] border border-[#EBE4D8] text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <CalendarPlus className="w-4 h-4" />
                <span>Add to Apple / Google Calendar (.ics)</span>
              </button>

              <button
                type="button"
                onClick={handleSendTestReminder}
                className="px-4 py-2.5 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 text-xs font-bold uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Send className="w-4 h-4 text-amber-800" />
                <span>{testReminderSent ? "✅ Reminder Sent to Email!" : "Send Test Reminder Now"}</span>
              </button>
            </div>

            <div className="pt-4 border-t border-[#EBE4D8]">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-semibold uppercase tracking-wider rounded-xl cursor-pointer"
              >
                Done & Return to Studio
              </button>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
