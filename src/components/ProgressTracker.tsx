import React, { useState } from "react";
import { 
  Clock, CheckCircle, AlertCircle, FileText, ChevronRight, 
  Sparkles, RefreshCw, Download, Printer, User, Mail, Calendar, HelpCircle 
} from "lucide-react";
import { Project, Milestone } from "../types";

interface ProgressTrackerProps {
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
  isAdmin?: boolean;
}

export default function ProgressTracker({ projects, onUpdateProject, isAdmin = false }: ProgressTrackerProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "");
  const [showInvoiceModal, setShowInvoiceModal] = useState<boolean>(false);

  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  if (!activeProject) {
    return (
      <div className="text-center py-12 bg-[#FDFBF7] border border-[#EBE4D8] rounded-2xl p-6" id="empty-projects-container">
        <AlertCircle className="w-12 h-12 text-[#8C7456] mx-auto mb-3" />
        <h3 className="font-serif font-medium text-[#3C352E] text-lg">No Active Projects</h3>
        <p className="text-xs text-[#6B6155] mt-1">Book a service to begin automated project tracking.</p>
      </div>
    );
  }

  // Calculate percentage progress based on current milestone index
  const totalMilestones = activeProject.milestones.length;
  const currentIdx = activeProject.currentMilestoneIndex;
  const progressPercent = totalMilestones > 0 
    ? Math.round(((currentIdx + 1) / totalMilestones) * 100) 
    : 0;

  // Simulator helper: Advance the project to the next milestone
  const handleAdvanceMilestone = () => {
    if (currentIdx >= totalMilestones - 1) {
      alert("Project is already fully completed!");
      return;
    }

    const nextIdx = currentIdx + 1;
    const updatedMilestones = activeProject.milestones.map((m, idx) => {
      if (idx < nextIdx) {
        return { ...m, status: "completed" as const, updatedAt: new Date().toLocaleDateString() };
      } else if (idx === nextIdx) {
        return { ...m, status: "current" as const };
      } else {
        return { ...m, status: "pending" as const };
      }
    });

    const isFinished = nextIdx === totalMilestones - 1;

    const updatedProject: Project = {
      ...activeProject,
      currentMilestoneIndex: nextIdx,
      milestones: updatedMilestones,
      status: isFinished ? "completed" : "active"
    };

    onUpdateProject(updatedProject);
  };

  // Simulator helper: Reset project milestones for demo
  const handleResetMilestones = () => {
    const updatedMilestones = activeProject.milestones.map((m, idx) => {
      if (idx === 0) {
        return { ...m, status: "completed" as const, updatedAt: new Date().toLocaleDateString() };
      } else if (idx === 1) {
        return { ...m, status: "current" as const };
      } else {
        return { ...m, status: "pending" as const };
      }
    });

    const updatedProject: Project = {
      ...activeProject,
      currentMilestoneIndex: 1,
      milestones: updatedMilestones,
      status: "active"
    };

    onUpdateProject(updatedProject);
  };

  // Dynamic invoice breakdown data
  const baseRate = activeProject.serviceId === "edits" ? 150 : 250;
  const extraFees = activeProject.totalPrice - baseRate;

  // File download helper for invoice
  const handleDownloadInvoiceFile = (proj: Project) => {
    const invoiceText = `====================================================
BEIGE CREAME MEDIA STUDIO - OFFICIAL DIGITAL INVOICE
====================================================
Invoice ID     : ${proj.invoiceId || 'INV-2026-X92'}
Issued Date    : ${new Date(proj.createdAt || Date.now()).toLocaleDateString()}
Contract Ref   : ${proj.id}
Contract Status: ${proj.status.toUpperCase()}

BILLED TO:
Client Name    : ${proj.clientName || 'Valued Client'}
Client Email   : ${proj.clientEmail || 'client@example.com'}
Project Scope  : ${proj.name}

ISSUED BY:
Beige Creame Media Studio Inc.
3000 Ingress Avenue, Cloud Run
Support        : support@creame.studio

----------------------------------------------------
LINE ITEMS & SERVICES
----------------------------------------------------
Item           : ${proj.name} (${proj.serviceId.toUpperCase()})
Turnaround     : ${proj.deadline}
Package Total  : ₹${proj.totalPrice} INR

----------------------------------------------------
MILESTONES & ESCROW AUDIT
----------------------------------------------------
${proj.milestones ? proj.milestones.map((m, i) => `${i + 1}. [${m.status === 'completed' ? 'COMPLETED' : 'PENDING'}] ${m.name} - ${m.description || ''}`).join('\n') : 'Standard Escrow Verification'}

====================================================
TOTAL AMOUNT DUE / PAID : ₹${proj.totalPrice} INR
ESCROW STATUS          : SECURED & RELEASED
====================================================
Thank you for working with Beige Creame Media Studio!
For inquiries: support@creame.studio
`;

    const blob = new Blob([invoiceText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${proj.invoiceId || 'Invoice'}-${proj.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8" id="progress-tracker-container">
      {/* Left Column: Project Selector & Context Details */}
      <div className="space-y-6 lg:col-span-1">
        {/* Project Selector Box */}
        <div className="bg-[#FDFBF7] border border-[#EBE4D8] p-5 rounded-2xl space-y-4" id="project-selector-panel">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7456]">Active Contracts</h4>
          <div className="space-y-2">
            {projects.map(p => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                  p.id === activeProject.id
                    ? "bg-[#8C7456] border-[#8C7456] text-white shadow-xs"
                    : "bg-white border-[#F0E9DC] hover:border-[#D8CDBA] text-[#3C352E]"
                }`}
              >
                <div className="space-y-1">
                  <div className={`text-xs font-bold ${p.id === activeProject.id ? 'text-white' : 'text-[#3C352E]'}`}>
                    {p.name}
                  </div>
                  <div className={`text-[10px] ${p.id === activeProject.id ? 'text-[#F3EFE9]' : 'text-[#8B7E70]'}`}>
                    Contract ID: {p.id}
                  </div>
                </div>
                <ChevronRight className={`w-4 h-4 ${p.id === activeProject.id ? 'text-white' : 'text-[#8C7456]'}`} />
              </button>
            ))}
          </div>
        </div>

        {/* Selected Project Specs Card */}
        <div className="bg-[#FDFBF7] border border-[#EBE4D8] p-5 rounded-2xl space-y-4" id="project-specs-card">
          <div className="flex justify-between items-center pb-3 border-b border-[#F2ECE0]">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[#8C7456]">Project Details</h4>
            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
              activeProject.status === "completed" ? "bg-green-100 text-green-800" : "bg-[#FAF6EE] text-[#8C7456] border border-[#EBE4D8]"
            }`}>
              {activeProject.status}
            </span>
          </div>

          <div className="space-y-3.5 text-xs text-[#5C5348]">
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-[#8C7456] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] uppercase text-[#8B7E70] font-semibold">Client Name</span>
                <span className="font-medium text-[#3C352E]">{activeProject.clientName}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Mail className="w-4 h-4 text-[#8C7456] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] uppercase text-[#8B7E70] font-semibold">Email Contact</span>
                <span className="font-medium text-[#3C352E]">{activeProject.clientEmail}</span>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Calendar className="w-4 h-4 text-[#8C7456] shrink-0 mt-0.5" />
              <div>
                <span className="block text-[10px] uppercase text-[#8B7E70] font-semibold">Target Handoff Deadline</span>
                <span className="font-medium text-amber-800 font-mono">
                  {activeProject.deadline.includes("T") 
                    ? new Date(activeProject.deadline).toLocaleString() 
                    : activeProject.deadline}
                </span>
              </div>
            </div>

            {activeProject.uploadedFiles && activeProject.uploadedFiles.length > 0 && (
              <div className="pt-2 border-t border-[#F2ECE0] space-y-1.5">
                <span className="block text-[10px] uppercase text-[#8B7E70] font-semibold">Loaded Assets</span>
                <div className="max-h-24 overflow-y-auto space-y-1">
                  {activeProject.uploadedFiles.map((f, idx) => (
                    <div key={idx} className="bg-white p-2 border border-[#F2ECE0] rounded-lg text-[10px] text-[#3C352E] font-mono flex justify-between">
                      <span className="truncate max-w-[120px]">{f.name}</span>
                      <span className="text-[#8B7E70]">{f.size}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Automated Invoice Button */}
          <button
            onClick={() => setShowInvoiceModal(true)}
            className="w-full py-2.5 px-4 bg-white hover:bg-[#FAF7F2] border border-[#D8CDBA] text-[#8C7456] font-medium text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <FileText className="w-4 h-4" />
            View Digital Invoice
          </button>
        </div>
      </div>

      {/* Right 2 Columns: Milestone Tracker Timeline */}
      <div className="space-y-6 lg:col-span-2">
        <div className="bg-[#FDFBF7] border border-[#EBE4D8] rounded-2xl p-6 md:p-8 space-y-8" id="timeline-panel">
          {/* Timeline Header & Progress bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#F2ECE0] pb-6" id="timeline-header">
            <div>
              <span className="text-[10px] font-bold tracking-[0.15em] text-[#8C7456] uppercase">Bespoke Production Timeline</span>
              <h3 className="text-2xl font-serif text-[#3C352E] mt-0.5">{activeProject.name}</h3>
            </div>
            
            {/* Dynamic Progress Indicator */}
            <div className="flex items-center gap-3 bg-[#FAF7F2] border border-[#EBE4D8] px-4 py-2 rounded-xl shrink-0">
              <div className="text-right">
                <span className="block text-[9px] uppercase tracking-wider text-[#8B7E70] font-semibold">Assembly Progress</span>
                <span className="text-sm font-serif font-bold text-[#8C7456]">{progressPercent}% Completed</span>
              </div>
              <div className="relative w-12 h-12">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    className="text-[#EBE4D8]"
                    strokeWidth="3.5"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                  <path
                    className="text-[#8C7456]"
                    strokeDasharray={`${progressPercent}, 100`}
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    stroke="currentColor"
                    fill="none"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  />
                </svg>
              </div>
            </div>
          </div>

          {/* Stepper list */}
          <div className="relative pl-6 space-y-8 border-l border-[#EBE4D8] ml-3" id="timeline-stepper-list">
            {activeProject.milestones.map((milestone, idx) => {
              const isCompleted = milestone.status === "completed";
              const isCurrent = milestone.status === "current";

              return (
                <div key={milestone.id} className="relative" id={`milestone-step-${milestone.id}`}>
                  {/* Outer circle badge icon */}
                  <div className={`absolute -left-[37px] top-0.5 w-6 h-6 rounded-full flex items-center justify-center border transition-all ${
                    isCompleted 
                      ? "bg-[#8C7456] border-[#8C7456] text-white" 
                      : isCurrent 
                        ? "bg-[#FAF6EE] border-[#8C7456] text-[#8C7456] animate-pulse" 
                        : "bg-white border-[#EBE4D8] text-[#D8CDBA]"
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-3.5 h-3.5" />
                    ) : (
                      <span className="text-[10px] font-bold">{idx + 1}</span>
                    )}
                  </div>

                  {/* Content block */}
                  <div className="space-y-1">
                    <div className="flex flex-col md:flex-row md:items-center gap-2">
                      <h4 className={`text-sm font-medium ${isCompleted ? 'text-[#8B7E70] line-through' : 'text-[#3C352E]'}`}>
                        {milestone.name}
                      </h4>
                      {isCurrent && (
                        <span className="inline-flex items-center gap-1 text-[9px] font-bold px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-full uppercase tracking-wider">
                          <Clock className="w-2.5 h-2.5 animate-spin" /> In Progress
                        </span>
                      )}
                      {milestone.updatedAt && (
                        <span className="text-[10px] text-[#8B7E70] font-mono md:ml-auto">
                          Updated: {milestone.updatedAt}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#6B6155] leading-relaxed max-w-xl">
                      {milestone.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* SIMULATOR ADMIN TOOLBAR - Only visible to Admin accounts */}
        {isAdmin && (
          <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-5 space-y-4" id="simulator-admin-panel">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#8C7456]" />
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#3C352E]">Interactive Pipeline Simulator</h4>
            </div>
            <p className="text-[11px] text-[#6B6155] leading-relaxed">
              Since this is an interactive prototype, you can act as the **Beige Creame Media Director**. Click the controls below to advance the creative milestones. Watch how the timeline, visual progress, and digital invoice update automatically.
            </p>
            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={handleAdvanceMilestone}
                disabled={currentIdx >= totalMilestones - 1}
                className="py-2 px-3 bg-[#8C7456] hover:bg-[#705D44] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Advance to Next Milestone
              </button>
              <button
                onClick={handleResetMilestones}
                className="py-2 px-3 bg-white hover:bg-[#FAF7F2] border border-[#D8CDBA] text-[#8C7456] font-medium text-xs rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
              >
                Reset Demopipeline
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AUTOMATED INVOICE OVERLAY MODAL */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="invoice-modal-overlay">
          <div className="bg-[#FDFBF7] border border-[#EBE4D8] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-8 relative" id="invoice-sheet">
            
            {/* Elegant Header */}
            <div className="flex justify-between items-start pb-6 border-b border-[#F2ECE0]" id="invoice-head-section">
              <div className="space-y-1">
                <span className="text-[10px] font-bold tracking-[0.2em] text-[#8C7456] uppercase">Beige Creame Media Studio</span>
                <h3 className="text-2xl font-serif text-[#3C352E]">INVOICE</h3>
                <span className="block font-mono text-[11px] text-[#8B7E70] mt-1">Invoice ID: {activeProject.invoiceId}</span>
              </div>
              <div className="text-right text-xs text-[#6B6155] space-y-0.5">
                <p className="font-bold text-[#3C352E]">Date Generated</p>
                <p className="font-mono">{new Date(activeProject.createdAt).toLocaleDateString()}</p>
                <p className="font-bold text-[#3C352E] pt-2">Contract Status</p>
                <p className="uppercase tracking-wider font-semibold text-[#8C7456] text-[10px]">{activeProject.status}</p>
              </div>
            </div>

            {/* Billing Coordinates */}
            <div className="grid grid-cols-2 gap-6 text-xs text-[#6B6155]" id="invoice-coordinates">
              <div className="space-y-1">
                <h5 className="font-bold uppercase text-[#8C7456] tracking-wider text-[9px]">Billed To</h5>
                <p className="font-medium text-[#3C352E]">{activeProject.clientName}</p>
                <p>{activeProject.clientEmail}</p>
                <p className="italic mt-1">Project: {activeProject.name}</p>
              </div>
              <div className="space-y-1 text-right">
                <h5 className="font-bold uppercase text-[#8C7456] tracking-wider text-[9px]">Issued By</h5>
                <p className="font-medium text-[#3C352E]">Beige Creame Media Studio Inc.</p>
                <p>3000 Ingress Avenue, Cloud Run</p>
                <p>support@creame.studio</p>
              </div>
            </div>

            {/* Bill Table */}
            <div className="border border-[#EBE4D8] rounded-xl overflow-hidden" id="invoice-items-table">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#8C7456] font-semibold">
                    <th className="p-3">Creative Line Item</th>
                    <th className="p-3 text-right">Qty / Duration</th>
                    <th className="p-3 text-right">Rate</th>
                    <th className="p-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody className="text-[#5C5348] divide-y divide-[#F2ECE0]">
                  <tr>
                    <td className="p-3">
                      <span className="font-bold text-[#3C352E] block">
                        {activeProject.serviceId === "photography" ? "Professional photography session" : activeProject.serviceId === "videography" ? "Premium 4K Videography Capture" : "Post-production highlight editing"}
                      </span>
                      <span className="text-[10px] text-[#8B7E70]">Full-frame setup, standard edits included</span>
                    </td>
                    <td className="p-3 text-right">{activeProject.serviceId === "edits" ? "1 Project" : "3 Hours"}</td>
                    <td className="p-3 text-right">₹{baseRate}</td>
                    <td className="p-3 text-right">₹{baseRate}</td>
                  </tr>
                  {extraFees > 0 && (
                    <tr>
                      <td className="p-3">
                        <span className="font-bold text-[#3C352E] block">Custom Package Upgrades & Deadlines</span>
                        <span className="text-[10px] text-[#8B7E70]">Drone capture, advanced grading, and fast-track turnarounds</span>
                      </td>
                      <td className="p-3 text-right">1 Pack</td>
                      <td className="p-3 text-right">₹{extraFees}</td>
                      <td className="p-3 text-right">₹{extraFees}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Subtotal and fine print */}
            <div className="flex flex-col md:flex-row justify-between gap-6" id="invoice-summary-sheet">
              <div className="max-w-xs text-[10px] text-[#8B7E70] leading-relaxed">
                <p className="font-bold uppercase tracking-wider text-[#3C352E] mb-1">Escrow Conditions</p>
                This invoice has been compiled dynamically. Beige Creame Media utilizes zero-knowledge escrow validation. Final funds will clear automatically upon milestone approvals.
              </div>
              <div className="space-y-1.5 text-right shrink-0">
                <div className="flex justify-between gap-8 text-xs text-[#6B6155]">
                  <span>Subtotal:</span>
                  <span>₹{activeProject.totalPrice}</span>
                </div>
                <div className="flex justify-between gap-8 text-xs text-[#6B6155]">
                  <span>Tax (0%):</span>
                  <span>₹0.00</span>
                </div>
                <div className="flex justify-between gap-8 text-sm font-semibold text-[#3C352E] border-t border-[#EBE4D8] pt-2">
                  <span>Grand Total (INR):</span>
                  <span className="font-serif text-[#8C7456] text-lg">₹{activeProject.totalPrice}</span>
                </div>
              </div>
            </div>

            {/* Close / Action footer */}
            <div className="flex justify-end gap-2.5 pt-4 border-t border-[#F2ECE0]" id="invoice-modal-footer">
              <button
                type="button"
                onClick={() => window.print()}
                className="py-2 px-3.5 border border-[#D8CDBA] hover:bg-[#FAF7F2] text-[#5C5348] text-xs font-medium tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                Print / PDF
              </button>
              <button
                type="button"
                onClick={() => handleDownloadInvoiceFile(activeProject)}
                className="py-2 px-3.5 bg-[#8C7456] hover:bg-[#705D44] text-white text-xs font-medium tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                Download Invoice
              </button>
              <button
                type="button"
                onClick={() => setShowInvoiceModal(false)}
                className="py-2 px-4 border border-gray-300 text-gray-700 hover:bg-gray-100 text-xs font-medium tracking-wider uppercase rounded-xl transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
