import React from "react";
import { Camera, Video, Sliders, Check, Clock, Shield, Calendar, Sparkles } from "lucide-react";
import { Service } from "../types";
import { SERVICES } from "../servicesData";

interface ServicesPanelProps {
  onSelectService: (serviceId: string) => void;
  onOpenMeetingModal?: (serviceId?: string) => void;
}

export default function ServicesPanel({ onSelectService, onOpenMeetingModal }: ServicesPanelProps) {
  // Helper to map icon names to Lucide icons
  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "Camera":
        return <Camera className="w-6 h-6 text-[#8C7456]" />;
      case "Video":
        return <Video className="w-6 h-6 text-[#8C7456]" />;
      case "Sliders":
        return <Sliders className="w-6 h-6 text-[#8C7456]" />;
      default:
        return <Camera className="w-6 h-6 text-[#8C7456]" />;
    }
  };

  return (
    <div className="space-y-8" id="services-panel-container">
      {/* Header section with sophisticated typography */}
      <div className="text-center max-w-2xl mx-auto space-y-3" id="services-header-box">
        <span className="text-xs font-semibold tracking-[0.2em] text-[#8C7456] uppercase">
          Artisanal Visual Media
        </span>
        <h2 className="text-3xl md:text-4xl font-sans font-medium tracking-tight text-[#3C352E]">
          Our Creative Disciplines
        </h2>
        <p className="text-[#6B6155] text-sm md:text-base leading-relaxed">
          We blend state-of-the-art capture with premium post-production color science, delivering custom photography, videography, and editing on demand.
        </p>

        {/* Talk to provider CTA */}
        {onOpenMeetingModal && (
          <div className="pt-2">
            <button
              onClick={() => onOpenMeetingModal()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-100/70 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-full text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer shadow-2xs"
            >
              <Calendar className="w-3.5 h-3.5 text-amber-800" />
              <span>Need a custom scope? Talk to Mudit Sachdeva (Free 30-min Call)</span>
            </button>
          </div>
        )}
      </div>

      {/* Grid of services cards with beige cream glassmorphism style */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="services-grid">
        {SERVICES.map((service) => (
          <div
            key={service.id}
            id={`service-card-${service.id}`}
            className="flex flex-col bg-[#FDFBF7] border border-[#EBE4D8] rounded-2xl shadow-xs hover:shadow-md hover:border-[#D8CDBA] transition-all duration-300 group"
          >
            {/* Card Header */}
            <div className="p-6 md:p-8 space-y-4 flex-1">
              <div className="w-12 h-12 rounded-xl bg-[#FAF6EE] border border-[#EBE4D8] flex items-center justify-center group-hover:bg-[#8C7456] group-hover:border-[#8C7456] transition-colors duration-300">
                <span className="group-hover:text-white transition-colors duration-300">
                  {renderIcon(service.icon)}
                </span>
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-medium text-[#3C352E] font-sans">
                  {service.name}
                </h3>
                <div className="flex items-baseline gap-1 pt-1">
                  <span className="text-2xl font-serif font-medium text-[#8C7456]">
                    ₹{service.basePrice.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#8B7E70]">
                    {service.id === "edits" ? "/project" : "/hour"}
                  </span>
                </div>
              </div>

              <p className="text-xs md:text-sm text-[#6B6155] leading-relaxed">
                {service.description}
              </p>

              {/* Service Features */}
              <div className="space-y-2.5 pt-4 border-t border-[#F2ECE0]">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7456]">
                  What's Included
                </h4>
                <ul className="space-y-2">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-[#5C5348]">
                      <Check className="w-4 h-4 text-[#8C7456] mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Card Action footer */}
            <div className="p-6 pt-0 mt-auto space-y-2">
              <button
                id={`btn-select-service-${service.id}`}
                onClick={() => onSelectService(service.id)}
                className="w-full py-3 px-4 rounded-xl font-bold text-xs tracking-wider uppercase bg-[#3C352E] hover:bg-[#25211D] text-[#FAF7F2] transition-all duration-200 cursor-pointer text-center shadow-xs flex items-center justify-center gap-2"
              >
                <span>Direct Book Slot</span>
              </button>

              {onOpenMeetingModal && (
                <button
                  type="button"
                  onClick={() => onOpenMeetingModal(service.id)}
                  className="w-full py-2 px-3 text-[11px] font-semibold text-[#8C7456] hover:text-[#3C352E] hover:bg-[#FAF7F2] rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer border border-transparent hover:border-[#EBE4D8]"
                >
                  <Calendar className="w-3.5 h-3.5 text-amber-700" />
                  <span>Optional: Book Discovery Call</span>
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Trust factors footer */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-5" id="services-trust-row">
        <div className="flex items-start gap-3 p-2">
          <Clock className="w-5 h-5 text-[#8C7456] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-[#3C352E] uppercase tracking-wider">Dynamic Fast Turnarounds</h4>
            <p className="text-[11px] text-[#6B6155] mt-0.5">Need a raw project finished in 24 hours? Select our express deadlines for urgent handoffs.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-2">
          <Sliders className="w-5 h-5 text-[#8C7456] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-[#3C352E] uppercase tracking-wider">Modular Custom Options</h4>
            <p className="text-[11px] text-[#6B6155] mt-0.5">Upload media assets, select second shooters, sound design, or drone additions on demand.</p>
          </div>
        </div>
        <div className="flex items-start gap-3 p-2">
          <Shield className="w-5 h-5 text-[#8C7456] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-semibold text-[#3C352E] uppercase tracking-wider">Secure Escrow Checkout</h4>
            <p className="text-[11px] text-[#6B6155] mt-0.5">Transactions are fully compiled, generating instant digital invoices with milestone protection.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
