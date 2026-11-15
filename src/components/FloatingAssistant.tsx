import React, { useState, useRef, useEffect, useCallback } from "react";
import { Sparkles, Send, X, Move, GripVertical } from "lucide-react";
import { ChatMessage } from "../types";
import { sendChatMessage } from "../services/apiClient";

interface FloatingAssistantProps {
  onLoadCustomQuote: (quote: {
    serviceName: string;
    price: number;
    deadline: string;
    details: string;
  }) => void;
}

export default function FloatingAssistant({ onLoadCustomQuote }: FloatingAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "fmsg-1",
      sender: "ai",
      text: "Hello! I am the AI Coordinator for Mudit Sachdeva (_illusionmaker). Ask me about our app features, how & where to book meeting consultation slots, or explore our photography and videography services.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Position & Dragging state
  const [position, setPosition] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{
    startX: number;
    startY: number;
    startPosX: number;
    startPosY: number;
    hasMoved: boolean;
  }>({
    startX: 0,
    startY: 0,
    startPosX: 0,
    startPosY: 0,
    hasMoved: false,
  });

  // Initialize position on mount (bottom-right default)
  useEffect(() => {
    const updateDefaultPos = () => {
      const rightPadding = window.innerWidth < 768 ? 20 : 28;
      const bottomPadding = window.innerWidth < 768 ? 84 : 28;
      const defaultX = Math.max(16, window.innerWidth - 56 - rightPadding);
      const defaultY = Math.max(16, window.innerHeight - 56 - bottomPadding);
      
      setPosition(prev => {
        if (!prev) return { x: defaultX, y: defaultY };
        // Clamp existing position within new window bounds
        return {
          x: Math.min(Math.max(16, prev.x), window.innerWidth - 64),
          y: Math.min(Math.max(16, prev.y), window.innerHeight - 64)
        };
      });
    };

    updateDefaultPos();
    window.addEventListener("resize", updateDefaultPos);
    return () => window.removeEventListener("resize", updateDefaultPos);
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, isOpen]);

  // Pointer drag handlers (supports mouse and touch)
  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    // Only primary button
    if (e.button !== 0 && e.pointerType === "mouse") return;

    const currentX = position?.x ?? (window.innerWidth - 80);
    const currentY = position?.y ?? (window.innerHeight - 80);

    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPosX: currentX,
      startPosY: currentY,
      hasMoved: false,
    };

    setIsDragging(true);
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;

    // Movement threshold to distinguish drag from click
    if (Math.hypot(deltaX, deltaY) > 4) {
      dragRef.current.hasMoved = true;
    }

    const btnSize = 56;
    const minX = 12;
    const maxX = Math.max(minX, window.innerWidth - btnSize - 12);
    const minY = 12;
    const maxY = Math.max(minY, window.innerHeight - btnSize - 12);

    const newX = Math.min(Math.max(minX, dragRef.current.startPosX + deltaX), maxX);
    const newY = Math.min(Math.max(minY, dragRef.current.startPosY + deltaY), maxY);

    setPosition({ x: newX, y: newY });
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLElement>) => {
    if (!isDragging) return;
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {
      // ignore
    }
  };

  const handleFabClick = () => {
    // If was dragging, do not trigger open/close
    if (dragRef.current.hasMoved) {
      dragRef.current.hasMoved = false;
      return;
    }
    setIsOpen(prev => !prev);
  };

  const handleSendMessage = async (textToSend: string) => {
    if (!textToSend.trim() || isLoading) return;

    const userMsgText = textToSend.trim();
    setInputText("");

    const userMessage: ChatMessage = {
      id: `fmsg-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Direct responses for key queries to make it ultra-fast and reliable
      const lower = userMsgText.toLowerCase();

      if (
        lower.includes("where to book") ||
        lower.includes("book slot") ||
        lower.includes("booking slot") ||
        lower.includes("meeting slot") ||
        lower.includes("how to book call") ||
        lower.includes("schedule call") ||
        lower.includes("discovery call") ||
        lower.includes("where is meeting") ||
        lower.includes("location of meeting")
      ) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "📅 **Where to Book a Meeting / Consultation Slot**:\n\n1. **Left Sidebar**: Under **'Discovery Calls'**, click **'Book Discovery Call'** or join your confirmed Google Meet.\n2. **Client Dashboard**: Click the top **'Book 1-on-1 Discovery Call'** banner.\n3. **Services Gallery**: Tap **'Schedule Pre-Booking Discovery Call'** before picking services.\n4. **Booking Form**: In Step 1, book a 30-min discovery session prior to checkout.\n5. **Director Calendar (Admin)**: Switch to 'Director' mode (top-right) to manage the Master Monthly Calendar matrix and publish slots.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 500);
        return;
      }

      if (
        lower.includes("features") ||
        lower.includes("pdf") ||
        lower.includes("what can this app do") ||
        lower.includes("app feature")
      ) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "✨ **Core Studio & App Features**:\n\n• **Services**: Photography (₹250/hr), Cinematography (₹400/hr), and Video Edits (₹150/project) with custom cinema add-ons.\n• **Meeting Scheduler**: Book 30-min Google Meet calls with .ics calendar downloads and 24h/1h automated alerts.\n• **Escrow Protection**: 100% milestone-secured payment holding.\n• **V-Fast Raw Uploads**: 7-day expiring secure raw media upload portal.\n• **Milestone Tracker**: Real-time progress from moodboard to final 4K master.\n• **Smart Invoices**: Instant PDF/Printable tax invoices with CSV export.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 500);
        return;
      }

      if (
        lower.includes("who will provide") || 
        lower.includes("who provides") || 
        lower.includes("who is the photographer") || 
        lower.includes("who is the videographer") ||
        lower.includes("who is the director") ||
        lower.includes("who is mudit") ||
        lower.includes("about mudit")
      ) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "**Mudit Sachdeva** is our multidisciplinary visual director, photographer, cinematographer, VFX artist, and colourist (_illusionmaker).\n\nWith **7+ years of experience**, Mudit oversees complete creative control from concept to final frame—including conceptualization, mood development, lighting design, high-end shoot execution, and precision colour grading.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 600);
        return;
      }

      if (
        lower.includes("past work") || 
        lower.includes("portfolio") || 
        lower.includes("celebrities") || 
        lower.includes("celebrity") || 
        lower.includes("brands") || 
        lower.includes("clients")
      ) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "🌟 **Mudit Sachdeva's Track Record & Past Work**:\n\n• **Scale**: 1,000+ Brands, 100+ Celebrities, 300+ Influencers, 500+ Events.\n• **Celebrities Directed/Shot**: Shraddha Kapoor, Ayushmann Khurrana, Sonam Bajwa, Harbhajan Singh, Rakul Preet Singh, 21 Savage, B Praak, King (New Life Tour), Bhagyashree, Mouni Roy.\n• **Brands**: Mercedes-Benz, Sony, KTM, ASICS, L'Oréal, The Times of India, Garnier, Myntra, Swiss Beauty, Bella Vita, Red FM 93.5, Le Creuset.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 600);
        return;
      }

      if (
        lower.includes("contact") ||
        lower.includes("phone") ||
        lower.includes("number") ||
        lower.includes("email") ||
        lower.includes("whatsapp") ||
        lower.includes("instagram") ||
        lower.includes("social") ||
        lower.includes("reach") ||
        lower.includes("call mudit")
      ) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "To ensure dedicated scheduling, calendar synchronization, and project tracking, Mudit Sachdeva conducts all initial consultations and client discussions directly via our in-app **1-on-1 Discovery Calls (Google Meet)**.\n\n📅 **How to Schedule**:\n• Click **'Book Discovery Call'** in the **Discovery Calls** section on the left sidebar.\n• Or click the top **'Book 1-on-1 Discovery Call'** banner on your dashboard.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 500);
        return;
      }

      if (lower.includes("active projects")) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "You currently have 2 active projects: 'Soleil Fashion Editorial' (undergoing Color Correction) and 'Aura Brand Launch Film' (Audio, Grading & VFX). You can track their real-time milestones in your dashboard.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 600);
        return;
      }

      if (lower.includes("total revenue")) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "Your total revenue and contracted budget secured in Creame Escrow this month is ₹1,850.00. All payments are verified with PCI-DSS compliance.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 600);
        return;
      }

      if (lower.includes("bookings are unpaid")) {
        setTimeout(() => {
          const aiMessage: ChatMessage = {
            id: `fmsg-resp-${Date.now()}`,
            sender: "ai",
            text: "All of your bookings are fully secured under Creame Escrow. There are zero unpaid invoices or past-due contracts at this moment.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 600);
        return;
      }

      const data = await sendChatMessage(
        [...messages, userMessage].map(m => ({
          sender: m.sender,
          text: m.text
        }))
      );

      const aiMessage: ChatMessage = {
        id: `fmsg-${Date.now() + 1}`,
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quoteOffer: data.quoteOffer
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("Floating chat error:", err);
      const aiMessageFallback: ChatMessage = {
        id: `fmsg-err-${Date.now()}`,
        sender: "ai",
        text: "I am strictly configured to assist with Mudit Sachdeva's studio services, application features (Escrow, V-Fast uploads, Invoices), and **where to find & book meeting consultation slots** in this application. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessageFallback]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage(inputText);
  };

  const SUGGESTIONS = [
    "Where can I book a meeting slot?",
    "What features does this app have?",
    "Who will provide the services?",
    "What is Mudit's past work & portfolio?"
  ];

  // Dynamic window alignment calculation based on position on screen
  const posX = position?.x ?? (typeof window !== "undefined" ? window.innerWidth - 80 : 0);
  const posY = position?.y ?? (typeof window !== "undefined" ? window.innerHeight - 80 : 0);
  const isNearTop = posY < 540;
  const isNearLeft = posX < 380;

  return (
    <div 
      className="fixed z-50 select-none touch-none"
      style={{
        left: position ? `${position.x}px` : undefined,
        top: position ? `${position.y}px` : undefined,
        right: position ? undefined : "1.5rem",
        bottom: position ? undefined : "1.5rem",
      }}
      id="floating-assistant-root"
    >
      
      {/* COMPACT FLOATING CHAT WINDOW */}
      {isOpen && (
        <div 
          className={`absolute bg-[#FAF7F2] border border-[#EBE4D8] rounded-3xl shadow-2xl w-[320px] sm:w-[360px] md:w-[390px] h-[480px] sm:h-[520px] flex flex-col overflow-hidden animate-fadeIn select-text ${
            isNearTop 
              ? "top-16" 
              : "bottom-16"
          } ${
            isNearLeft 
              ? "left-0" 
              : "right-0"
          }`} 
          id="compact-chat-window"
        >
          {/* Header Panel (with drag handle) */}
          <div 
            className="bg-[#3C352E] px-4 sm:px-5 py-3.5 sm:py-4 flex items-center justify-between cursor-grab active:cursor-grabbing select-none" 
            id="compact-chat-header"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            title="Drag to reposition AI Assistant"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-white/20 bg-white/10 flex items-center justify-center text-white shrink-0">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#FAF7F2]">AI Coordinator</h4>
                  <span className="text-[9px] bg-white/15 text-stone-300 px-1.5 py-0.2 rounded font-mono hidden sm:inline-flex items-center gap-0.5">
                    <Move className="w-2.5 h-2.5" /> Moveable
                  </span>
                </div>
                <span className="block text-[10px] text-stone-300">Ask about projects & booking</span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-[10px] text-stone-300 font-semibold uppercase tracking-wider">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="hidden sm:inline">Online</span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-stone-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Message History list */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3 sm:space-y-4 bg-[#FAF7F2] text-xs text-[#3C352E]" 
            id="compact-messages-list"
          >
            {messages.map((m) => {
              const isAi = m.sender === "ai";
              return (
                <div key={m.id} className={`flex flex-col ${isAi ? "items-start" : "items-end"} space-y-1`}>
                  <div 
                    className={`max-w-[85%] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 leading-relaxed text-[11px] sm:text-[12px] ${
                      isAi 
                        ? "bg-[#E5D5C8] text-[#3C352E] rounded-tl-none border border-[#D8C7B9]" 
                        : "bg-[#3C352E] text-[#FAF7F2] rounded-tr-none"
                    }`}
                  >
                    <p className="whitespace-pre-line font-medium">{m.text}</p>

                    {/* Integrated Custom Offer Card */}
                    {isAi && m.quoteOffer && (
                      <div className="mt-3 bg-white border border-[#EBE4D8] rounded-xl p-3 space-y-2 text-left text-[11px] text-[#3C352E] shadow-xs">
                        <div className="flex justify-between items-center border-b border-[#FAF7F2] pb-1.5">
                          <span className="font-bold text-[#8C7456] text-[9px] uppercase tracking-wider">Bespoke Quote</span>
                          <span className="text-xs font-serif font-bold text-[#8C7456]">₹{m.quoteOffer.price}</span>
                        </div>
                        <p className="text-[10px] text-[#6B6155] leading-normal">{m.quoteOffer.details}</p>
                        <button
                          type="button"
                          onClick={() => {
                            onLoadCustomQuote(m.quoteOffer!);
                            setIsOpen(false);
                          }}
                          className="w-full py-1.5 bg-[#8C7456] hover:bg-[#705D44] text-white font-bold text-[9px] tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Apply & Book Quote
                        </button>
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] text-[#8B7E70] font-mono px-1">{m.timestamp}</span>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start">
                <div className="bg-[#E5D5C8] border border-[#D8C7B9] rounded-2xl rounded-tl-none px-4 py-2 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3C352E] animate-bounce"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3C352E] animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#3C352E] animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Suggestions Pills */}
          <div className="px-4 sm:px-5 py-2 bg-[#FAF7F2] flex flex-col items-start gap-1.5 border-t border-[#FAF6EE]">
            {SUGGESTIONS.map((p, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSendMessage(p)}
                className="text-[10px] sm:text-[11px] font-medium text-[#3C352E] bg-[#FAF7F2] border border-[#E1D5C9] hover:bg-[#E5D5C8]/50 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full transition-all cursor-pointer shadow-xs text-left w-fit block"
              >
                {p}
              </button>
            ))}
          </div>

          {/* Compact Form Input */}
          <form onSubmit={handleFormSubmit} className="p-3 sm:p-4 bg-[#FAF7F2] border-t border-[#EBE4D8] flex gap-2.5 sm:gap-3 items-center">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask coordinator..."
              className="flex-1 bg-white border border-[#EBE4D8] rounded-2xl px-3.5 sm:px-4 py-2.5 sm:py-3 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              className="w-10 h-10 sm:w-11 sm:h-11 bg-[#B3A394] hover:bg-[#9E8E7F] disabled:bg-stone-300 text-white flex items-center justify-center rounded-2xl transition-all cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}

      {/* FLOATING ACTION BUTTON (MOVEABLE / DRAGGABLE ANYWHERE) */}
      <div className="relative group">
        {isOpen ? (
          /* When Open: Close Button with Moveable Dragging */
          <button
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleFabClick}
            className={`w-13 h-13 sm:w-14 sm:h-14 bg-[#FAF7F2] hover:bg-[#EBE4D8] text-[#3C352E] rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-150 cursor-grab active:cursor-grabbing border border-[#EBE4D8] ${
              isDragging ? "scale-105 shadow-2xl cursor-grabbing ring-2 ring-[#8C7456]" : ""
            }`}
            id="fab-close-button"
            title="Drag to move, click to close"
          >
            <X className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        ) : (
          /* When Closed: Trigger Button with Moveable Dragging */
          <button
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onClick={handleFabClick}
            className={`w-13 h-13 sm:w-14 sm:h-14 bg-[#3C352E] hover:bg-[#2A2520] text-white rounded-full flex items-center justify-center shadow-lg hover:shadow-xl transition-shadow duration-150 cursor-grab active:cursor-grabbing border border-[#4E453D] relative ${
              isDragging ? "scale-105 shadow-2xl cursor-grabbing ring-2 ring-amber-300" : ""
            }`}
            id="fab-trigger-button"
            title="Drag anywhere on screen, click to chat"
          >
            <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            
            {/* Small drag affordance indicator dot */}
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-400 text-[#3C352E] flex items-center justify-center text-[8px] font-bold shadow-xs">
              <Move className="w-2.5 h-2.5" />
            </span>
          </button>
        )}
      </div>

    </div>
  );
}


