import React, { useState, useRef, useEffect } from "react";
import { MessageSquare, Sparkles, Send, RefreshCw, HelpCircle, ArrowRight, Sliders } from "lucide-react";
import { ChatMessage } from "../types";
import { sendChatMessage } from "../services/apiClient";

interface ChatPanelProps {
  onLoadCustomQuote: (quote: {
    serviceName: string;
    price: number;
    deadline: string;
    details: string;
  }) => void;
}

export default function ChatPanel({ onLoadCustomQuote }: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "msg-1",
      sender: "ai",
      text: "Hello! I am the AI Creative Coordinator for Mudit Sachdeva's studio (_illusionmaker). I am strictly trained to assist with our production services (Photography, Videography, Color Grading & VFX), app workflow features (Escrow, Invoicing, V-Fast uploads), and **how & where to book meeting consultation slots** in this application.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const [inputText, setInputText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;

    const userMsgText = inputText.trim();
    setInputText("");

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const lower = userMsgText.toLowerCase();

      // Ultra-fast instant response for frequent questions
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
            id: `msg-resp-${Date.now()}`,
            sender: "ai",
            text: "📅 **Where to Book a Meeting / Consultation Slot**:\n\n1. **Left Sidebar**: Under **'Discovery Calls'**, click **'Book Discovery Call'** or join your confirmed Google Meet.\n2. **Client Dashboard**: Click the top **'Book 1-on-1 Discovery Call'** banner.\n3. **Services Gallery**: Tap **'Schedule Pre-Booking Discovery Call'** before picking services.\n4. **Booking Form**: In Step 1, book a 30-min discovery session prior to checkout.\n5. **Director Calendar (Admin)**: Switch to 'Director' mode (top-right) to manage the Master Monthly Calendar matrix and publish slots.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 150);
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
            id: `msg-resp-${Date.now()}`,
            sender: "ai",
            text: "✨ **Core Studio & App Features**:\n\n• **Services**: Photography (₹250/hr), Cinematography (₹400/hr), and Video Edits (₹150/project) with custom cinema add-ons.\n• **Meeting Scheduler**: Book 30-min Google Meet calls with .ics calendar downloads and 24h/1h automated alerts.\n• **Escrow Protection**: 100% milestone-secured payment holding.\n• **V-Fast Raw Uploads**: 7-day expiring secure raw media upload portal.\n• **Milestone Tracker**: Real-time progress from moodboard to final 4K master.\n• **Smart Invoices**: Instant PDF/Printable tax invoices with CSV export.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 150);
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
            id: `msg-resp-${Date.now()}`,
            sender: "ai",
            text: "**Mudit Sachdeva** is our multidisciplinary visual director, photographer, cinematographer, VFX artist, and colourist (_illusionmaker).\n\nWith **7+ years of experience**, Mudit oversees complete creative control from concept to final frame—including conceptualization, mood development, lighting design, high-end shoot execution, and precision colour grading.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 150);
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
            id: `msg-resp-${Date.now()}`,
            sender: "ai",
            text: "🌟 **Mudit Sachdeva's Track Record & Past Work**:\n\n• **Scale**: 1,000+ Brands, 100+ Celebrities, 300+ Influencers, 500+ Events.\n• **Celebrities Directed/Shot**: Shraddha Kapoor, Ayushmann Khurrana, Sonam Bajwa, Harbhajan Singh, Rakul Preet Singh, 21 Savage, B Praak, King (New Life Tour), Bhagyashree, Mouni Roy.\n• **Brands**: Mercedes-Benz, Sony, KTM, ASICS, L'Oréal, The Times of India, Garnier, Myntra, Swiss Beauty, Bella Vita, Red FM 93.5, Le Creuset.",
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          };
          setMessages(prev => [...prev, aiMessage]);
          setIsLoading(false);
        }, 150);
        return;
      }

      // Query the server API with timeout controller
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const data = await sendChatMessage(
        [...messages, userMessage].map(m => ({
          sender: m.sender,
          text: m.text
        })),
        controller.signal
      );
      clearTimeout(timeoutId);

      const aiMessage: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: "ai",
        text: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        quoteOffer: data.quoteOffer
      };

      setMessages(prev => [...prev, aiMessage]);

    } catch (err) {
      console.error("Chat panel error:", err);
      // Fail gracefully with simulated fallback
      const aiMessageFallback: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: "ai",
        text: "I am strictly authorized to answer questions about Mudit Sachdeva's studio services, application features (Escrow, Invoicing, V-Fast uploads), and **where to locate and book meeting consultation slots** in this app. How can I help you today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessageFallback]);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper suggestion prompt pills
  const SUGGESTION_PROMPTS = [
    "Where can I book a meeting slot?",
    "What features does this app have?",
    "Who will provide the services?",
    "What is Mudit's past work and portfolio?"
  ];

  const handleSuggestionClick = (promptText: string) => {
    setInputText(promptText);
  };

  return (
    <div className="bg-[#FDFBF7] border border-[#EBE4D8] rounded-2xl overflow-hidden shadow-xs flex flex-col h-[600px]" id="chat-panel-container">
      {/* Panel Header */}
      <div className="bg-[#FAF7F2] border-b border-[#EBE4D8] px-5 py-4 flex items-center justify-between" id="chat-header">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full bg-[#8C7456] flex items-center justify-center text-white">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#3C352E]">Creame AI Assistant</h4>
            <span className="block text-[10px] text-[#8C7456] font-medium">Bespoke Sales Coordinator</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] bg-white border border-[#EBE4D8] px-2.5 py-1 rounded-full text-[#8C7456] font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          24/7 Concierge Online
        </div>
      </div>

      {/* Messages area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-5 space-y-4 bg-white/50" 
        id="chat-messages-container"
      >
        {messages.map((m) => {
          const isAi = m.sender === "ai";
          return (
            <div 
              key={m.id} 
              className={`flex flex-col ${isAi ? "items-start" : "items-end"} space-y-1`}
              id={`chat-bubble-${m.id}`}
            >
              <div 
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs md:text-sm leading-relaxed ${
                  isAi 
                    ? "bg-[#FAF7F2] border border-[#EBE4D8] text-[#3C352E] rounded-tl-none" 
                    : "bg-[#8C7456] text-white rounded-tr-none"
                }`}
              >
                <p className="whitespace-pre-line">{m.text}</p>

                {/* Custom Negotiated Offer Component Card */}
                {isAi && m.quoteOffer && (
                  <div className="mt-3 bg-white border border-[#EBE4D8] rounded-xl p-4 space-y-3 shadow-xs text-left text-xs text-[#3C352E]">
                    <div className="flex justify-between items-start border-b border-[#FAF7F2] pb-2">
                      <div>
                        <span className="text-[9px] font-bold tracking-wider text-[#8C7456] uppercase">Exclusive AI Quote</span>
                        <h5 className="font-serif font-bold text-sm text-[#3C352E] mt-0.5">{m.quoteOffer.serviceName}</h5>
                      </div>
                      <span className="text-lg font-serif font-bold text-[#8C7456]">${m.quoteOffer.price}</span>
                    </div>

                    <p className="text-[11px] text-[#6B6155] leading-relaxed">{m.quoteOffer.details}</p>

                    <div className="flex justify-between text-[10px] text-[#8B7E70] font-mono">
                      <span>Delivery Slot:</span>
                      <span>{m.quoteOffer.deadline}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => onLoadCustomQuote(m.quoteOffer!)}
                      className="w-full mt-1.5 py-2 bg-[#8C7456] hover:bg-[#705D44] text-white font-semibold text-[10px] tracking-wider uppercase rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      Apply & Book Quote
                    </button>
                  </div>
                )}
              </div>
              <span className="text-[9px] text-[#8B7E70] font-mono px-1">{m.timestamp}</span>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isLoading && (
          <div className="flex flex-col items-start space-y-1">
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8C7456] animate-bounce"></span>
              <span className="w-2 h-2 rounded-full bg-[#8C7456] animate-bounce [animation-delay:0.2s]"></span>
              <span className="w-2 h-2 rounded-full bg-[#8C7456] animate-bounce [animation-delay:0.4s]"></span>
            </div>
          </div>
        )}
      </div>

      {/* Suggestion Prompt Chips */}
      {messages.length === 1 && (
        <div className="px-5 py-2.5 bg-[#FAF7F2]/60 border-t border-[#F2ECE0] flex flex-wrap gap-1.5">
          {SUGGESTION_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSuggestionClick(p)}
              className="text-[10px] font-medium text-[#5C5348] hover:text-[#3C352E] bg-white hover:bg-[#FAF7F2] border border-[#EBE4D8] hover:border-[#D8CDBA] px-2.5 py-1 rounded-full transition-all cursor-pointer"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSendMessage} className="p-4 bg-[#FAF7F2] border-t border-[#EBE4D8] flex gap-2" id="chat-input-form">
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Ask about photo shoots, custom bundles or fast edits..."
          className="flex-1 bg-white border border-[#EBE4D8] rounded-xl px-4 py-2.5 text-xs md:text-sm text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
        />
        <button
          type="submit"
          disabled={!inputText.trim() || isLoading}
          className="w-11 h-11 bg-[#8C7456] hover:bg-[#705D44] disabled:bg-gray-300 disabled:cursor-not-allowed text-white flex items-center justify-center rounded-xl transition-all shadow-xs cursor-pointer"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
