import React, { useState, useMemo, useRef, useEffect } from "react";
import { 
  Video, Camera, Sliders, Check, Sparkles, Send, 
  MoreHorizontal, Clock, ArrowRight, ShieldCheck, 
  Calendar, FileText, CheckCircle2, Bookmark, CreditCard,
  QrCode, Lock, ChevronRight, X, AlertCircle,
  Download, Building, Smartphone
} from "lucide-react";
import { Project } from "../types";

interface BookingFormProps {
  initialServiceId?: string;
  preFilledQuote?: {
    serviceName: string;
    price: number;
    deadline: string;
    details: string;
  } | null;
  onBookingComplete: (project: Project) => void;
  onCancel?: () => void;
  onOpenMeetingModal?: (interest?: 'photography' | 'videography' | 'edits' | 'custom') => void;
  availableSlotsCount?: number;
}

interface BreakdownItem {
  name: string;
  category: string;
  amount: number;
  badge?: string;
}

export default function BookingForm({
  initialServiceId = "photography",
  preFilledQuote = null,
  onBookingComplete,
  onCancel,
  onOpenMeetingModal,
  availableSlotsCount = 8
}: BookingFormProps) {
  // Production Type: 'video' | 'photo' | 'post'
  const [productionType, setProductionType] = useState<'video' | 'photo' | 'post'>(
    initialServiceId === 'photography' || initialServiceId === 'photo' ? 'photo' : initialServiceId === 'edits' ? 'post' : 'video'
  );
  
  const [projectName, setProjectName] = useState(
    initialServiceId === 'photography' || initialServiceId === 'photo' ? "High-End Editorial Photo Shoot" : "Q3 Brand Campaign"
  );
  const [clientCompany, setClientCompany] = useState("Direct Private Client");
  const [clientEmail, setClientEmail] = useState("client@company.com");
  const [shootDurationDays, setShootDurationDays] = useState(1);
  const [shootDate, setShootDate] = useState("2026-08-28");
  const [shootTimeSlot, setShootTimeSlot] = useState("Morning Session (09:00 AM - 01:00 PM)");
  
  // Gear state
  const [selectedCameraPkg, setSelectedCameraPkg] = useState<string>(
    initialServiceId === 'photography' || initialServiceId === 'photo' 
      ? "Sony A7R V (61MP) + G-Master Primes" 
      : "ARRI Alexa Mini + Prime Cine Lenses"
  );
  const [selectedStudioStage, setSelectedStudioStage] = useState("Studio Stage A (Luxe White Cyclorama)");
  const [selectedTurnaround, setSelectedTurnaround] = useState("Standard (7 Days)");
  const [selectedAddons, setSelectedAddons] = useState<string[]>(["High-End Retouching (25 Masters)"]);
  const [promoCode, setPromoCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [promoAppliedMsg, setPromoAppliedMsg] = useState<string | null>(null);

  const [draftSavedToast, setDraftSavedToast] = useState(false);

  // Payment Gateway Modal State
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'card' | 'netbanking' | 'escrow'>('upi');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paidProject, setPaidProject] = useState<Project | null>(null);

  // AI Assistant Chat State (Optional for questions or customized scope negotiation)
  const [chatInput, setChatInput] = useState("");
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [showAiChat, setShowAiChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<{
    id: string;
    sender: 'user' | 'ai';
    text: string;
  }[]>([
    {
      id: "ai-init",
      sender: "ai",
      text: "Direct Booking Active: Your payment preview updates live as you customize camera optics, duration, and studio stages. When you're ready, click 'Proceed to Payment Gateway' to instantly secure your slot."
    }
  ]);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages, isAiTyping]);

  // Adjust default gear when switching production type
  const handleProductionTypeChange = (type: 'photo' | 'video' | 'post') => {
    setProductionType(type);
    if (type === 'photo') {
      setSelectedCameraPkg("Sony A7R V (61MP) + G-Master Primes");
      setProjectName("High-End Editorial Photo Shoot");
    } else if (type === 'video') {
      setSelectedCameraPkg("ARRI Alexa Mini + Prime Cine Lenses");
      setProjectName("Q3 Brand Commercial Shoot");
    } else {
      setSelectedCameraPkg("High-End Color & Finishing Suite");
      setProjectName("Master Post-Production Grade");
    }
  };

  // REACTIVE REAL-TIME PAYMENT BREAKDOWN CALCULATION
  const calculation = useMemo(() => {
    const items: BreakdownItem[] = [];

    // 1. Studio Stage Rate
    let studioRatePerDay = 0;
    if (productionType !== 'post') {
      if (selectedStudioStage.includes("Luxe White Cyclorama")) studioRatePerDay = 20000;
      else if (selectedStudioStage.includes("Lifestyle & Editorial")) studioRatePerDay = 25000;
      else if (selectedStudioStage.includes("Soundstage Stage C")) studioRatePerDay = 35000;
      else studioRatePerDay = 15000; // On-Location

      const studioTotal = studioRatePerDay * shootDurationDays;
      items.push({
        name: `${selectedStudioStage.split('(')[0].trim()} (${shootDurationDays} Day${shootDurationDays > 1 ? 's' : ''})`,
        category: "Studio Stage",
        amount: studioTotal,
        badge: `₹${studioRatePerDay.toLocaleString('en-IN')}/day`
      });
    }

    // 2. Camera & Optics Rate (Live calculated based on exact selection)
    let cameraRatePerDay = 0;
    if (productionType !== 'post') {
      if (selectedCameraPkg.includes("ARRI Alexa")) cameraRatePerDay = 45000;
      else if (selectedCameraPkg.includes("RED V-Raptor")) cameraRatePerDay = 38000;
      else if (selectedCameraPkg.includes("Hasselblad")) cameraRatePerDay = 35000;
      else if (selectedCameraPkg.includes("Sony FX6")) cameraRatePerDay = 25000;
      else if (selectedCameraPkg.includes("Sony A7R V")) cameraRatePerDay = 20000;
      else if (selectedCameraPkg.includes("Canon R5 C")) cameraRatePerDay = 18000;
      else cameraRatePerDay = 15000;

      const cameraTotal = cameraRatePerDay * shootDurationDays;
      items.push({
        name: `${selectedCameraPkg} (${shootDurationDays} Day${shootDurationDays > 1 ? 's' : ''})`,
        category: "Camera & Optics",
        amount: cameraTotal,
        badge: `₹${cameraRatePerDay.toLocaleString('en-IN')}/day`
      });
    }

    // 3. Crew & Directing Labor
    let laborRatePerDay = 0;
    if (productionType === 'photo') {
      laborRatePerDay = 25000; // Lead Commercial Photographer & Lighting Assist
      items.push({
        name: `Lead Commercial Photographer & Lighting Crew (${shootDurationDays} Day${shootDurationDays > 1 ? 's' : ''})`,
        category: "Production Crew",
        amount: laborRatePerDay * shootDurationDays,
        badge: "Director Mudit & Team"
      });
    } else if (productionType === 'video') {
      laborRatePerDay = 40000; // Director of Photography, Gaffer & Sound
      items.push({
        name: `Director of Photography & Cinema Sound Crew (${shootDurationDays} Day${shootDurationDays > 1 ? 's' : ''})`,
        category: "Production Crew",
        amount: laborRatePerDay * shootDurationDays,
        badge: "Cinema Unit"
      });
    } else {
      laborRatePerDay = 28000;
      items.push({
        name: `Senior Colorist & Master Post-Production Engineer`,
        category: "Post Crew",
        amount: laborRatePerDay,
        badge: "DaVinci Resolve Studio"
      });
    }

    // 4. Turnaround & Delivery
    let turnaroundCost = 0;
    if (selectedTurnaround.includes("Rush Priority")) {
      turnaroundCost = 15000;
      items.push({
        name: "Rush Priority Delivery (72-Hour Turnaround)",
        category: "Post Delivery",
        amount: turnaroundCost,
        badge: "Rush Expedited"
      });
    } else if (selectedTurnaround.includes("Express Next-Day")) {
      turnaroundCost = 30000;
      items.push({
        name: "Express Next-Day Delivery (24-Hour Master)",
        category: "Post Delivery",
        amount: turnaroundCost,
        badge: "Next-Day Priority"
      });
    } else {
      turnaroundCost = 10000;
      items.push({
        name: productionType === 'photo' ? "Standard Commercial Retouching (7 Days)" : "Standard 4K ProRes Master Grade (7 Days)",
        category: "Post Delivery",
        amount: turnaroundCost,
        badge: "Standard"
      });
    }

    // 5. Selected Addons
    selectedAddons.forEach(addon => {
      let addonPrice = 10000;
      if (addon.includes("Drone")) addonPrice = 15000;
      if (addon.includes("Makeup")) addonPrice = 12000;
      if (addon.includes("Retouching (50")) addonPrice = 18000;
      items.push({
        name: addon,
        category: "Addon",
        amount: addonPrice,
        badge: "Addon Option"
      });
    });

    const subtotal = items.reduce((acc, curr) => acc + curr.amount, 0);
    const discountAmount = Math.round((subtotal * discountPercent) / 100);
    const total = Math.max(0, subtotal - discountAmount);

    return {
      items,
      subtotal,
      discountAmount,
      total
    };
  }, [productionType, selectedCameraPkg, shootDurationDays, selectedStudioStage, selectedTurnaround, selectedAddons, discountPercent]);

  const toggleAddon = (addonName: string) => {
    setSelectedAddons(prev => 
      prev.includes(addonName) ? prev.filter(a => a !== addonName) : [...prev, addonName]
    );
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (code === "DIRECT10" || code === "LUMOS10" || code === "CREAME10") {
      setDiscountPercent(10);
      setPromoAppliedMsg("10% Direct Booking optimization discount applied!");
    } else if (code === "VIP15") {
      setDiscountPercent(15);
      setPromoAppliedMsg("15% VIP Director Studio discount applied!");
    } else {
      setPromoAppliedMsg("Invalid promo code. Try 'DIRECT10' for 10% instant discount.");
    }
  };

  const handleSaveDraft = () => {
    setDraftSavedToast(true);
    setTimeout(() => setDraftSavedToast(false), 4000);
  };

  // DIRECT PAYMENT GATEWAY TRIGGER
  const handleProceedToPayment = () => {
    setIsPaymentModalOpen(true);
  };

  const handleExecutePayment = () => {
    setIsProcessingPayment(true);
    
    // Simulate secure 3D Secure / UPI payment authorization
    setTimeout(() => {
      setIsProcessingPayment(false);
      setPaymentSuccess(true);

      const newProj: Project = {
        id: `PRJ-${Math.floor(2000 + Math.random() * 800)}`,
        name: `${projectName} (${shootDate})`,
        serviceId: productionType === 'video' ? 'videography' : productionType === 'photo' ? 'photography' : 'edits',
        clientName: clientCompany,
        clientEmail: clientEmail,
        status: "active",
        totalPrice: calculation.total,
        deadline: `${shootDate}T18:00`,
        createdAt: new Date().toISOString(),
        invoiceId: `INV-2026-${Math.floor(100 + Math.random() * 899)}`,
        currentMilestoneIndex: 0,
        milestones: [
          { id: "m1", name: "Direct Booking Confirmed & Paid", description: `Slot locked for ${shootDate} (${shootTimeSlot}). Escrow authorized.`, status: "completed" },
          { id: "m2", name: productionType === 'photo' ? "Photo Shoot Session" : "Production Shoot", description: `Studio ${selectedStudioStage} ready with ${selectedCameraPkg}.`, status: "current" },
          { id: "m3", name: productionType === 'photo' ? "Selects & Proofs Gallery" : "1st Assembly Edit", description: "Raw proofs dispatched for high-res selection.", status: "pending" },
          { id: "m4", name: productionType === 'photo' ? "High-End Retouching" : "Color Grade & Sound FX", description: "Commercial retouching and tone curves applied.", status: "pending" },
          { id: "m5", name: "Final Master Delivery", description: "Full resolution commercial master package delivered.", status: "pending" }
        ]
      };

      setPaidProject(newProj);
    }, 1500);
  };

  const handleFinishAndRedirect = () => {
    if (paidProject) {
      setIsPaymentModalOpen(false);
      onBookingComplete(paidProject);
    }
  };

  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isAiTyping) return;

    const userText = chatInput.trim();
    setChatInput("");

    setChatMessages(prev => [...prev, {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: userText
    }]);
    setIsAiTyping(true);

    const lower = userText.toLowerCase();
    let reply = "";

    if (lower.includes("discount") || lower.includes("budget") || lower.includes("promo") || lower.includes("offer")) {
      setDiscountPercent(10);
      reply = `I have applied a direct 10% studio optimization discount of -₹${Math.round(calculation.subtotal * 0.1).toLocaleString('en-IN')}. Your payment preview has updated automatically!`;
    } else if (lower.includes("camera") || lower.includes("gear") || lower.includes("lens")) {
      reply = `Current gear is set to ${selectedCameraPkg}. You can switch to Hasselblad Medium Format or Sony A7R V directly from the dropdown to compare pricing instantly.`;
    } else {
      reply = `I've noted your request for '${userText}'. Your slot on ${shootDate} is open. Proceed directly to the payment gateway below to secure it.`;
    }

    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: reply
      }]);
      setIsAiTyping(false);
    }, 600);
  };

  return (
    <div className="space-y-4 sm:space-y-6 pb-16 lg:pb-0" id="booking-view-root">
      
      {/* Toast Notice */}
      {draftSavedToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-2.5 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Direct booking draft saved securely in your studio workspace.</span>
          </div>
          <button 
            type="button" 
            onClick={() => setDraftSavedToast(false)}
            className="text-emerald-700 hover:text-emerald-900 font-mono text-sm px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* DIRECT BOOKING BANNER & HEADER */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-3 sm:space-y-4">
        
        {/* Instant Direct Booking Badge */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3.5 py-2">
          <div className="flex items-center gap-2 text-xs font-bold text-[#8C7456]">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="uppercase tracking-wider font-mono text-[11px] sm:text-xs">Direct Instant Booking</span>
            <span className="text-[#8B7E70] font-normal hidden md:inline">• Live Gear Pricing & Direct Gateway</span>
          </div>

          <div className="flex items-center gap-1.5 text-[10px] sm:text-[11px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>100% Escrow Guaranteed</span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-0.5">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3C352E] tracking-tight">
              {productionType === 'photo' ? "Direct Photo Shoot Slot Booking" : "Direct Production Booking"}
            </h1>
            <p className="text-xs text-[#6B6155] mt-0.5">
              Select date, studio stage, and scope. Payment preview updates automatically in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenMeetingModal && (
              <button
                type="button"
                onClick={() => onOpenMeetingModal(productionType === 'video' ? 'videography' : productionType === 'photo' ? 'photography' : 'edits')}
                className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#8C7456] border border-[#EBE4D8] text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
                title="Optional: Talk to Director Mudit first"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Discovery Call ({availableSlotsCount})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleSaveDraft}
              className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3C352E] border border-[#EBE4D8] text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5 text-[#8C7456]" />
              <span>DRAFT</span>
            </button>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN GRID: CONFIGURATION (Left) vs LIVE PAYMENT PREVIEW & GATEWAY (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* LEFT COLUMN: GEAR & SCOPE SPECIFICATIONS (7 Cols) */}
        <div className="lg:col-span-7 space-y-4 sm:space-y-6">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-4 sm:space-y-5">
            
            <div className="flex items-center justify-between border-b border-[#EBE4D8] pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#8C7456]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3C352E]">1. Shoot Specifications & Slot</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-bold">
                Live Pricing Synced
              </span>
            </div>

            {/* PRODUCTION TYPE TABS (PHOTO, VIDEO, POST) */}
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-2 font-mono">
                SELECT PRODUCTION TYPE
              </label>

              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  id="btn-prod-photo"
                  onClick={() => handleProductionTypeChange('photo')}
                  className={`py-3.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    productionType === 'photo'
                      ? 'bg-[#3C352E] border-[#3C352E] text-[#FAF7F2] font-bold shadow-xs'
                      : 'bg-[#FAF7F2] border-[#EBE4D8] text-[#8B7E70] hover:bg-[#F4EFE6] hover:text-[#3C352E]'
                  }`}
                >
                  <Camera className={`w-5 h-5 ${productionType === 'photo' ? 'text-[#FAF7F2]' : 'text-[#8C7456]'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">PHOTO SHOOT</span>
                  <span className={`text-[9px] ${productionType === 'photo' ? 'text-amber-200' : 'text-emerald-600'} font-bold`}>Instant Slot</span>
                </button>

                <button
                  type="button"
                  id="btn-prod-video"
                  onClick={() => handleProductionTypeChange('video')}
                  className={`py-3.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    productionType === 'video'
                      ? 'bg-[#3C352E] border-[#3C352E] text-[#FAF7F2] font-bold shadow-xs'
                      : 'bg-[#FAF7F2] border-[#EBE4D8] text-[#8B7E70] hover:bg-[#F4EFE6] hover:text-[#3C352E]'
                  }`}
                >
                  <Video className={`w-5 h-5 ${productionType === 'video' ? 'text-[#FAF7F2]' : 'text-[#8C7456]'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">VIDEO SHOOT</span>
                  <span className={`text-[9px] ${productionType === 'video' ? 'text-amber-200' : 'text-emerald-600'} font-bold`}>Instant Slot</span>
                </button>

                <button
                  type="button"
                  id="btn-prod-post"
                  onClick={() => handleProductionTypeChange('post')}
                  className={`py-3.5 px-3 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    productionType === 'post'
                      ? 'bg-[#3C352E] border-[#3C352E] text-[#FAF7F2] font-bold shadow-xs'
                      : 'bg-[#FAF7F2] border-[#EBE4D8] text-[#8B7E70] hover:bg-[#F4EFE6] hover:text-[#3C352E]'
                  }`}
                >
                  <Sliders className={`w-5 h-5 ${productionType === 'post' ? 'text-[#FAF7F2]' : 'text-[#8C7456]'}`} />
                  <span className="text-xs font-bold uppercase tracking-wider font-mono">POST ONLY</span>
                  <span className={`text-[9px] ${productionType === 'post' ? 'text-amber-200' : 'text-emerald-600'} font-bold`}>Instant Ingest</span>
                </button>
              </div>
            </div>

            {/* DIRECT DATE & TIME SLOT PICKER */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-[#3C352E]">
                <Calendar className="w-4 h-4 text-[#8C7456]" />
                <span className="uppercase tracking-wider">Select Shoot Date & Slot (Instant Lock)</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-1 font-mono">
                    SHOOT DATE
                  </label>
                  <input
                    type="date"
                    value={shootDate}
                    onChange={(e) => setShootDate(e.target.value)}
                    min="2026-08-23"
                    className="w-full bg-white border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-medium focus:outline-hidden focus:border-[#8C7456]"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-1 font-mono">
                    SHOOT TIME WINDOW
                  </label>
                  <select
                    value={shootTimeSlot}
                    onChange={(e) => setShootTimeSlot(e.target.value)}
                    className="w-full bg-white border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-medium focus:outline-hidden focus:border-[#8C7456]"
                  >
                    <option value="Morning Session (09:00 AM - 01:00 PM)">Morning Session (09:00 AM - 01:00 PM)</option>
                    <option value="Afternoon Session (02:00 PM - 06:00 PM)">Afternoon Session (02:00 PM - 06:00 PM)</option>
                    <option value="Golden Hour / Sunset (04:00 PM - 08:00 PM)">Golden Hour / Sunset (04:00 PM - 08:00 PM)</option>
                    <option value="Full Day Intensive (09:00 AM - 06:00 PM)">Full Day Intensive (09:00 AM - 06:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Project Title & Client Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-1.5 font-mono">
                  PROJECT / CAMPAIGN TITLE
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="e.g. Autumn Lookbook 2026"
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3.5 py-2.5 text-xs text-[#3C352E] font-medium focus:outline-hidden focus:border-[#8C7456]"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-1.5 font-mono">
                  CLIENT ACCOUNT / BRAND
                </label>
                <select
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3.5 py-2.5 text-xs text-[#3C352E] font-medium focus:outline-hidden focus:border-[#8C7456]"
                >
                  <option value="Direct Private Client">Direct Private Client (Single Slot)</option>
                  <option value="Acme Corp Global">Acme Corp Global</option>
                  <option value="Global Tech Media">Global Tech Media</option>
                  <option value="Soleil Magazine">Soleil Magazine</option>
                </select>
              </div>
            </div>

            {/* STUDIO & DURATION PARAMETERS CONFIGURATION */}
            <div className="space-y-4 pt-3 border-t border-[#EBE4D8]">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#8C7456]" />
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#3C352E]">2. Studio Stage & Duration Configuration</h4>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-1 font-mono">
                    SHOOT DURATION (DAYS)
                  </label>
                  <select
                    id="select-duration-days"
                    value={shootDurationDays}
                    onChange={(e) => setShootDurationDays(Number(e.target.value))}
                    className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-medium focus:outline-hidden focus:border-[#8C7456]"
                  >
                    <option value={1}>1 Day (Standard Shoot Slot)</option>
                    <option value={2}>2 Days (Multi-Day Production)</option>
                    <option value={3}>3 Days (Comprehensive Series)</option>
                    <option value={5}>5 Days (Sprint Campaign)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-1 font-mono">
                    STUDIO STAGE / LOCATION
                  </label>
                  <select
                    id="select-studio-stage"
                    value={selectedStudioStage}
                    onChange={(e) => setSelectedStudioStage(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-medium focus:outline-hidden focus:border-[#8C7456]"
                  >
                    <option value="Studio Stage A (Luxe White Cyclorama)">Studio Stage A (Luxe White Cyclorama - ₹20,000/day)</option>
                    <option value="Studio Stage B (Lifestyle & Editorial Set)">Studio Stage B (Lifestyle & Editorial Set - ₹25,000/day)</option>
                    <option value="Soundstage Stage C (Acoustic Studio)">Soundstage Stage C (Acoustic Studio - ₹35,000/day)</option>
                    <option value="On-Location External">On-Location External Client Set (₹15,000/day)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-1 font-mono">
                    DELIVERY TURNAROUND
                  </label>
                  <select
                    id="select-turnaround"
                    value={selectedTurnaround}
                    onChange={(e) => setSelectedTurnaround(e.target.value)}
                    className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-medium focus:outline-hidden focus:border-[#8C7456]"
                  >
                    <option value="Standard (7 Days)">Standard Delivery (7 Days)</option>
                    <option value="Rush Priority (72 Hours)">Rush Priority (72 Hours +₹15,000)</option>
                    <option value="Express Next-Day (24 Hours)">Express Next-Day (24 Hours +₹30,000)</option>
                  </select>
                </div>
              </div>

              {/* Addons Selection */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-2 font-mono">
                  OPTIONAL ADD-ONS (INSTANT ADD)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {[
                    { name: "Lead Drone Operator (4K Aerial)", price: 15000 },
                    { name: "Hair & Makeup Artist on Set", price: 12000 },
                    { name: "High-End Retouching (50 Masters)", price: 18000 },
                    { name: "Behind-the-Scenes (BTS) Reel Crew", price: 10000 },
                  ].map((addon) => {
                    const isSelected = selectedAddons.includes(addon.name);
                    return (
                      <button
                        key={addon.name}
                        type="button"
                        onClick={() => toggleAddon(addon.name)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isSelected 
                            ? 'bg-[#3C352E] border-[#3C352E] text-white shadow-2xs font-semibold' 
                            : 'bg-[#FAF7F2] border-[#EBE4D8] text-[#3C352E] hover:bg-[#F4EFE6]'
                        }`}
                      >
                        <span className="truncate">{addon.name}</span>
                        <span className={`font-mono text-[11px] font-bold ml-2 ${isSelected ? 'text-amber-200' : 'text-[#8C7456]'}`}>
                          +₹{addon.price.toLocaleString('en-IN')}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* PRE-BOOKING DISCOVERY CALL OPTION */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#EBE4D8] flex items-center justify-center text-[#8C7456] shrink-0 font-bold">
                  🗓️
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#3C352E]">Want a 1-on-1 Creative Consultation first?</h4>
                  <p className="text-[11px] text-[#6B6155]">
                    You can proceed to payment right now, or schedule an optional 30-min Google Meet session with Director Mudit Sachdeva.
                  </p>
                </div>
              </div>

              {onOpenMeetingModal && (
                <button
                  type="button"
                  onClick={() => onOpenMeetingModal(productionType === 'video' ? 'videography' : productionType === 'photo' ? 'photography' : 'edits')}
                  className="bg-[#3C352E] hover:bg-[#25211D] text-white text-[11px] font-bold px-3 py-1.5 rounded-lg whitespace-nowrap cursor-pointer transition-colors shadow-2xs"
                >
                  Book Discovery Call
                </button>
              )}
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: LIVE PAYMENT BREAKDOWN & DIRECT PAYMENT GATEWAY (5 Cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs flex flex-col justify-between">
            
            <div>
              {/* Payment Preview Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D8] mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-[#3C352E] text-amber-300 flex items-center justify-center text-xs font-bold shadow-2xs">
                    <CreditCard className="w-4 h-4 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-[#3C352E]">Live Payment Preview</h3>
                    <span className="text-[9px] text-[#8B7E70] font-mono">Updates automatically with gear</span>
                  </div>
                </div>

                <span className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  LIVE
                </span>
              </div>

              {/* Itemized Breakdown Table (Reactively calculated) */}
              <div className="bg-[#FAF7F2] rounded-xl border border-[#EBE4D8] overflow-hidden mb-4">
                <div className="bg-[#F4EFE6] px-3.5 py-2 border-b border-[#EBE4D8] flex items-center justify-between text-[10px] font-bold uppercase font-mono text-[#8B7E70]">
                  <span>ITEMIZED SCOPE & GEAR</span>
                  <span>EST (INR)</span>
                </div>

                <div className="divide-y divide-[#EBE4D8]/70 text-xs">
                  {calculation.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex items-start justify-between gap-3 hover:bg-white/60 transition-colors">
                      <div>
                        <p className="font-semibold text-[#3C352E] text-xs leading-snug">{item.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] text-[#8B7E70] uppercase font-mono">{item.category}</span>
                          {item.badge && (
                            <span className="text-[9px] bg-amber-50 text-amber-800 border border-amber-200/80 px-1.5 py-0.2 rounded font-mono">
                              {item.badge}
                            </span>
                          )}
                        </div>
                      </div>
                      <span className="font-mono font-bold text-[#3C352E] text-xs whitespace-nowrap">
                        ₹{item.amount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}

                  {/* Subtotal */}
                  <div className="px-3.5 py-2 flex items-center justify-between text-xs bg-white/40">
                    <span className="text-[#8B7E70] font-medium">Subtotal Base</span>
                    <span className="font-mono font-semibold text-[#3C352E]">
                      ₹{calculation.subtotal.toLocaleString('en-IN')}
                    </span>
                  </div>

                  {/* Discount row if applicable */}
                  {calculation.discountAmount > 0 && (
                    <div className="px-3.5 py-2 flex items-center justify-between text-xs bg-emerald-50 text-emerald-800">
                      <span className="font-medium flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Direct Booking Discount ({discountPercent}%)</span>
                      </span>
                      <span className="font-mono font-bold">
                        -₹{calculation.discountAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  )}

                  {/* Total Payment Due */}
                  <div className="px-3.5 py-3.5 bg-[#3C352E] text-white flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-amber-300 font-bold block">
                        TOTAL AMOUNT DUE (INR)
                      </span>
                      <span className="text-[10px] text-[#D8CFBC] font-sans">
                        Includes GST & 100% Escrow Guarantee
                      </span>
                    </div>
                    <span className="text-xl font-mono font-bold text-amber-200">
                      ₹{calculation.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Promo code (e.g. DIRECT10)"
                  className="flex-1 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] uppercase font-mono focus:outline-hidden focus:border-[#8C7456]"
                />
                <button
                  type="submit"
                  className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3C352E] border border-[#EBE4D8] px-3 py-2 text-xs font-bold rounded-xl cursor-pointer transition-colors shadow-2xs font-mono"
                >
                  APPLY
                </button>
              </form>

              {promoAppliedMsg && (
                <p className="text-[11px] text-emerald-700 bg-emerald-50 border border-emerald-200 p-2 rounded-lg mb-4 font-medium">
                  {promoAppliedMsg}
                </p>
              )}
            </div>

            {/* DIRECT PAYMENT GATEWAY BUTTON (Replaces ambiguous accept offer button) */}
            <div className="pt-2 space-y-3">
              <button
                type="button"
                id="btn-proceed-to-payment"
                onClick={handleProceedToPayment}
                className="w-full py-4 px-4 bg-[#3C352E] hover:bg-[#25211D] text-[#FAF7F2] font-bold text-sm rounded-xl flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-md hover:shadow-lg active:scale-[0.99]"
              >
                <CreditCard className="w-5 h-5 text-amber-300" />
                <span className="tracking-wide uppercase font-mono">
                  PROCEED TO PAYMENT GATEWAY (₹{calculation.total.toLocaleString('en-IN')})
                </span>
              </button>

              <div className="flex items-center justify-center gap-3 text-[10px] text-[#8B7E70] font-mono">
                <span className="flex items-center gap-1">
                  <Lock className="w-3 h-3 text-emerald-600" /> 256-Bit SSL Encrypted
                </span>
                <span>•</span>
                <span>Instant UPI & Card Checkout</span>
              </div>

              {/* Optional Creame AI Toggle */}
              <div className="pt-2 border-t border-[#EBE4D8]/80">
                <button
                  type="button"
                  onClick={() => setShowAiChat(!showAiChat)}
                  className="w-full text-center text-xs font-semibold text-[#8C7456] hover:text-[#3C352E] py-1 flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{showAiChat ? "Hide AI Assistant" : "Ask Creame AI Assistant a Question"}</span>
                </button>

                {showAiChat && (
                  <div className="mt-3 p-3 bg-[#FAF7F2] rounded-xl border border-[#EBE4D8] space-y-2.5">
                    <div ref={chatContainerRef} className="max-h-36 overflow-y-auto space-y-2 pr-1 text-xs">
                      {chatMessages.map(msg => (
                        <div key={msg.id} className={msg.sender === 'ai' ? 'text-[#3C352E]' : 'text-right text-[#8C7456] font-semibold'}>
                          <span className="text-[10px] font-mono text-[#8B7E70] block">
                            {msg.sender === 'ai' ? 'Creame AI:' : 'You:'}
                          </span>
                          <p className="text-[11px] leading-relaxed">{msg.text}</p>
                        </div>
                      ))}
                      {isAiTyping && <p className="text-[10px] text-[#8B7E70] italic">AI is typing...</p>}
                    </div>

                    <form onSubmit={handleSendChat} className="flex gap-2">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="e.g. Can I get a 10% discount?"
                        className="flex-1 bg-white border border-[#EBE4D8] rounded-lg px-2.5 py-1.5 text-xs text-[#3C352E] focus:outline-hidden"
                      />
                      <button
                        type="submit"
                        disabled={!chatInput.trim() || isAiTyping}
                        className="bg-[#3C352E] text-white p-2 rounded-lg text-xs cursor-pointer"
                      >
                        <Send className="w-3 h-3" />
                      </button>
                    </form>
                  </div>
                )}
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* MOBILE FLOATING STICKY CHECKOUT BAR (Eliminates excessive scrolling on phones) */}
      <div className="lg:hidden fixed bottom-14 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EBE4D8] p-3 px-4 flex items-center justify-between shadow-xl" id="mobile-floating-checkout-bar">
        <div>
          <span className="text-[9px] uppercase font-mono text-[#8B7E70] block leading-none">Total Amount Due</span>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="text-base font-mono font-bold text-[#3C352E]">₹{calculation.total.toLocaleString('en-IN')}</span>
            <span className="text-[8px] bg-emerald-100 text-emerald-800 font-mono font-bold px-1.5 py-0.2 rounded">Escrow</span>
          </div>
        </div>
        <button
          type="button"
          id="btn-mobile-quick-pay"
          onClick={handleProceedToPayment}
          className="py-2.5 px-4 bg-[#3C352E] hover:bg-[#25211D] active:scale-95 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md cursor-pointer font-mono"
        >
          <CreditCard className="w-3.5 h-3.5 text-amber-300" />
          <span>PAY ₹{calculation.total.toLocaleString('en-IN')}</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* SECURE DIRECT PAYMENT GATEWAY MODAL                                       */}
      {/* ========================================================================= */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl border border-[#EBE4D8] shadow-2xl max-w-xl w-full overflow-hidden animate-scale-up">
            
            {/* Modal Header */}
            <div className="bg-[#3C352E] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-serif font-bold text-[#FAF7F2]">Direct Payment Gateway</h3>
                  <p className="text-xs text-[#D8CFBC] font-mono">Creame Studios Secure Escrow Authorization</p>
                </div>
              </div>

              {!isProcessingPayment && (
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {paymentSuccess ? (
              /* SUCCESS RECEIPT STATE */
              <div className="p-6 text-center space-y-5">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                  <CheckCircle2 className="w-10 h-10" />
                </div>

                <div>
                  <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                    PAYMENT SUCCESSFUL & SLOT SECURED
                  </span>
                  <h2 className="text-2xl font-serif font-bold text-[#3C352E] mt-3">
                    ₹{calculation.total.toLocaleString('en-IN')} Authorized
                  </h2>
                  <p className="text-xs text-[#6B6155] mt-1 max-w-md mx-auto">
                    Your direct booking for <strong>{projectName}</strong> on <strong>{shootDate}</strong> ({shootTimeSlot}) is confirmed. Escrow is locked with 100% money-back guarantee.
                  </p>
                </div>

                {/* Receipt Card */}
                <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 text-left font-mono text-xs space-y-2">
                  <div className="flex justify-between border-b border-[#EBE4D8] pb-2 text-[11px]">
                    <span className="text-[#8B7E70]">TRANSACTION ID</span>
                    <span className="font-bold text-[#3C352E]">TXN_{Math.floor(10000000 + Math.random() * 90000000)}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8B7E70]">STUDIO / CAMERA</span>
                    <span className="font-bold text-[#3C352E] truncate max-w-[240px]">{selectedCameraPkg}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#8B7E70]">STAGE & DATE</span>
                    <span className="font-bold text-[#3C352E]">{shootDate} • {selectedStudioStage.split('(')[0]}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#EBE4D8] text-xs font-bold text-emerald-700">
                    <span>ESCROW STATUS</span>
                    <span>LOCKED & ACTIVE</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    type="button"
                    onClick={handleFinishAndRedirect}
                    className="flex-1 py-3 px-4 bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
                  >
                    GO TO PROJECT DASHBOARD
                  </button>
                  <button
                    type="button"
                    onClick={() => alert("Invoice PDF receipt downloaded.")}
                    className="py-3 px-4 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EBE4D8] text-[#3C352E] text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4 text-[#8C7456]" />
                    <span>DOWNLOAD RECEIPT</span>
                  </button>
                </div>
              </div>
            ) : (
              /* ACTIVE CHECKOUT TABS */
              <div className="p-6 space-y-5">
                
                {/* Shoot & Total Summary Pill */}
                <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase font-mono text-[#8B7E70] block">Direct Shoot Slot</span>
                    <h4 className="text-xs font-bold text-[#3C352E]">{projectName}</h4>
                    <p className="text-[11px] text-[#6B6155]">{shootDate} • {shootTimeSlot.split('(')[0]}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-mono text-[#8B7E70] block">Total Payable</span>
                    <span className="text-lg font-mono font-bold text-[#3C352E]">
                      ₹{calculation.total.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] mb-2 font-mono">
                    CHOOSE PAYMENT METHOD
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {[
                      { id: 'upi', name: 'UPI / QR', icon: QrCode },
                      { id: 'card', name: 'Card', icon: CreditCard },
                      { id: 'netbanking', name: 'NetBanking', icon: Building },
                      { id: 'escrow', name: 'Escrow Wire', icon: ShieldCheck },
                    ].map(tab => {
                      const Icon = tab.icon;
                      const isSel = paymentMethod === tab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setPaymentMethod(tab.id as any)}
                          className={`py-2.5 px-2 rounded-xl border flex flex-col items-center justify-center gap-1 text-[11px] font-semibold transition-all cursor-pointer ${
                            isSel 
                              ? 'bg-[#3C352E] border-[#3C352E] text-white shadow-xs font-bold' 
                              : 'bg-[#FAF7F2] border-[#EBE4D8] text-[#6B6155] hover:bg-[#F4EFE6]'
                          }`}
                        >
                          <Icon className={`w-4 h-4 ${isSel ? 'text-amber-300' : 'text-[#8C7456]'}`} />
                          <span className="truncate">{tab.name}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* PAYMENT METHOD DETAILS */}
                {paymentMethod === 'upi' && (
                  <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 text-center space-y-3">
                    <div className="w-32 h-32 bg-white p-2 rounded-xl border border-[#EBE4D8] mx-auto flex items-center justify-center shadow-xs">
                      {/* Realistic simulated QR code */}
                      <div className="w-full h-full bg-[#FAF7F2] rounded border-2 border-dashed border-[#8C7456]/40 flex flex-col items-center justify-center gap-1">
                        <QrCode className="w-12 h-12 text-[#3C352E]" />
                        <span className="text-[8px] font-mono text-[#8C7456] font-bold">SCAN TO PAY</span>
                      </div>
                    </div>

                    <div>
                      <p className="text-xs font-bold text-[#3C352E]">Scan with Any UPI App</p>
                      <p className="text-[11px] text-[#6B6155]">Google Pay, PhonePe, Paytm, BHIM, Cred</p>
                    </div>

                    <div className="flex items-center gap-2 max-w-xs mx-auto">
                      <input
                        type="text"
                        defaultValue="client@okhdfcbank"
                        className="w-full bg-white border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-mono focus:outline-hidden"
                        placeholder="Enter UPI VPA ID"
                      />
                      <button
                        type="button"
                        className="bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EBE4D8] text-xs font-bold px-3 py-2 rounded-xl text-[#8C7456] font-mono"
                      >
                        VERIFY
                      </button>
                    </div>
                  </div>
                )}

                {paymentMethod === 'card' && (
                  <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 space-y-3 text-left">
                    <div>
                      <label className="block text-[10px] font-bold uppercase font-mono text-[#8B7E70] mb-1">
                        CARD NUMBER
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          defaultValue="4532 •••• •••• 8821"
                          className="w-full bg-white border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs font-mono text-[#3C352E]"
                        />
                        <span className="absolute right-3 top-2.5 text-[10px] font-bold text-[#8C7456] font-mono">VISA / MC</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold uppercase font-mono text-[#8B7E70] mb-1">
                          VALID THRU
                        </label>
                        <input
                          type="text"
                          defaultValue="08/29"
                          className="w-full bg-white border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs font-mono text-[#3C352E]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase font-mono text-[#8B7E70] mb-1">
                          CVV / CVC
                        </label>
                        <input
                          type="password"
                          defaultValue="•••"
                          className="w-full bg-white border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs font-mono text-[#3C352E]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 space-y-2">
                    <label className="block text-[10px] font-bold uppercase font-mono text-[#8B7E70] mb-1">
                      SELECT PRIMARY BANK
                    </label>
                    <select className="w-full bg-white border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] font-medium">
                      <option>HDFC Bank Corporate</option>
                      <option>ICICI Bank Commercial</option>
                      <option>State Bank of India</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                    </select>
                  </div>
                )}

                {paymentMethod === 'escrow' && (
                  <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 text-xs text-[#6B6155] space-y-2">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>100% Studio Escrow Protection Active</span>
                    </div>
                    <p className="text-[11px] leading-relaxed">
                      Funds are held securely in Creame Studios Escrow and are only released upon shoot completion and high-res master proof delivery.
                    </p>
                  </div>
                )}

                {/* Modal Action CTA */}
                <button
                  type="button"
                  id="btn-confirm-payment-authorization"
                  onClick={handleExecutePayment}
                  disabled={isProcessingPayment}
                  className="w-full py-4 px-4 bg-[#3C352E] hover:bg-[#25211D] disabled:opacity-60 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md"
                >
                  {isProcessingPayment ? (
                    <>
                      <span className="w-4 h-4 border-2 border-amber-300 border-t-transparent rounded-full animate-spin"></span>
                      <span>AUTHORIZING PAYMENT & SECURING SLOT...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4 text-amber-300" />
                      <span>AUTHORIZE ₹{calculation.total.toLocaleString('en-IN')} & LOCK SLOT</span>
                    </>
                  )}
                </button>

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
