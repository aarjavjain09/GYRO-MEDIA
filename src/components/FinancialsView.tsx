import React, { useState, useEffect } from "react";
import { 
  Filter, Plus, Download, CreditCard, ShieldCheck, 
  MoreVertical, CheckCircle2, Clock, AlertTriangle, 
  Sparkles, DollarSign, TrendingUp, Calendar, Users, 
  Video, Sliders, Camera, Landmark, Eye, Check
} from "lucide-react";
import { Project } from "../types";

interface FinancialsViewProps {
  projects: Project[];
  onOpenNewInvoiceModal?: () => void;
  onPayInvoice?: (invoiceId: string, amount: number) => void;
}

interface InvoiceItem {
  id: string;
  invoiceId: string;
  client: string;
  projectName: string;
  date: string;
  dueDate: string;
  amount: number;
  status: 'Overdue' | 'Pending' | 'Paid';
  breakdown: {
    crew: number;
    gear: number;
    studio: number;
    post: number;
    aiDiscount: number;
    subtotal: number;
    tax: number;
    total: number;
  };
}

export default function FinancialsView({
  projects,
  onOpenNewInvoiceModal,
  onPayInvoice
}: FinancialsViewProps) {
  const [filterStatus, setFilterStatus] = useState<'all' | 'Paid' | 'Pending' | 'Overdue'>('all');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>("INV-2023-042");
  const [isProcessingPayment, setIsProcessingPayment] = useState<boolean>(false);
  const [paymentSuccessToast, setPaymentSuccessToast] = useState<string | null>(null);

  // Invoices dataset matching Screenshot 4
  const [invoices, setInvoices] = useState<InvoiceItem[]>([
    {
      id: "inv-1",
      invoiceId: "INV-2023-041",
      client: "Acme Corp",
      projectName: "Q4 Commercial Campaign",
      date: "Oct 12, 2023",
      dueDate: "Oct 26, 2023",
      amount: 45000,
      status: "Overdue",
      breakdown: {
        crew: 18000,
        gear: 12500,
        studio: 8500,
        post: 7500,
        aiDiscount: 1500,
        subtotal: 45000,
        tax: 0,
        total: 45000
      }
    },
    {
      id: "inv-2",
      invoiceId: "INV-2023-042",
      client: "Global Tech",
      projectName: "Product Launch Video",
      date: "Oct 15, 2023",
      dueDate: "Oct 30, 2023",
      amount: 28500,
      status: "Pending",
      breakdown: {
        crew: 12000,
        gear: 8500,
        studio: 5000,
        post: 4000,
        aiDiscount: 1000,
        subtotal: 28500,
        tax: 0,
        total: 28500
      }
    },
    {
      id: "inv-3",
      invoiceId: "INV-2023-039",
      client: "Neon Studios",
      projectName: "VFX Pipeline Setup",
      date: "Oct 05, 2023",
      dueDate: "Oct 19, 2023",
      amount: 12000,
      status: "Paid",
      breakdown: {
        crew: 5000,
        gear: 3000,
        studio: 2000,
        post: 2500,
        aiDiscount: 500,
        subtotal: 12000,
        tax: 0,
        total: 12000
      }
    },
    {
      id: "inv-4",
      invoiceId: "INV-2023-040",
      client: "Starlight Media",
      projectName: "Sound Design EP01",
      date: "Oct 08, 2023",
      dueDate: "Oct 22, 2023",
      amount: 8750,
      status: "Paid",
      breakdown: {
        crew: 3500,
        gear: 2000,
        studio: 1500,
        post: 2000,
        aiDiscount: 250,
        subtotal: 8750,
        tax: 0,
        total: 8750
      }
    }
  ]);

  // Sync projects into invoices
  useEffect(() => {
    if (projects && projects.length > 0) {
      setInvoices(prev => {
        const existingIds = new Set(prev.map(i => i.invoiceId));
        const newInvs: InvoiceItem[] = [];

        projects.forEach(p => {
          if (p.invoiceId && !existingIds.has(p.invoiceId)) {
            newInvs.push({
              id: `inv-${p.id}`,
              invoiceId: p.invoiceId,
              client: p.clientName || "Direct Private Client",
              projectName: p.name,
              date: "Aug 22, 2026",
              dueDate: p.deadline ? p.deadline.split('T')[0] : "Aug 30, 2026",
              amount: p.totalPrice,
              status: p.status === 'active' || p.status === 'completed' ? 'Paid' : 'Pending',
              breakdown: {
                crew: Math.round(p.totalPrice * 0.4),
                gear: Math.round(p.totalPrice * 0.3),
                studio: Math.round(p.totalPrice * 0.2),
                post: Math.round(p.totalPrice * 0.1),
                aiDiscount: 0,
                subtotal: p.totalPrice,
                tax: 0,
                total: p.totalPrice
              }
            });
          }
        });

        if (newInvs.length > 0) {
          return [...newInvs, ...prev];
        }
        return prev;
      });
    }
  }, [projects]);

  const activeInvoice = invoices.find(inv => inv.invoiceId === selectedInvoiceId) || invoices[0] || invoices[1];

  const filteredInvoices = invoices.filter(inv => {
    if (filterStatus === 'all') return true;
    return inv.status === filterStatus;
  });

  const handlePayNow = (inv: InvoiceItem) => {
    setIsProcessingPayment(true);
    setTimeout(() => {
      setInvoices(prev => prev.map(item => item.invoiceId === inv.invoiceId ? { ...item, status: 'Paid' } : item));
      setIsProcessingPayment(false);
      setPaymentSuccessToast(`Payment of ₹${inv.amount.toLocaleString('en-IN')} for ${inv.invoiceId} successfully authorized through Escrow!`);
      setTimeout(() => setPaymentSuccessToast(null), 5000);
      if (onPayInvoice) {
        onPayInvoice(inv.invoiceId, inv.amount);
      }
    }, 1200);
  };

  const handleDownloadPDF = (inv: InvoiceItem) => {
    const text = `
=====================================================
PROSTUDIO / BEIGE CREAME PRODUCTION SUITE INVOICE
=====================================================
Invoice Reference : ${inv.invoiceId}
Client Account    : ${inv.client}
Project Scope     : ${inv.projectName}
Date Issued       : ${inv.date}
Payment Due Date  : ${inv.dueDate}
Status            : ${inv.status.toUpperCase()}

ITEMIZED PRODUCTION COSTS (INR):
-----------------------------------------------------
1. Crew (Director, DOP, Gaffer)    : ₹${inv.breakdown.crew.toLocaleString('en-IN')}.00
2. Gear Rental (ARRI Alexa, Lenses): ₹${inv.breakdown.gear.toLocaleString('en-IN')}.00
3. Studio Rental (Stage A - 2 Days): ₹${inv.breakdown.studio.toLocaleString('en-IN')}.00
4. Post-Production (Editing, Color): ₹${inv.breakdown.post.toLocaleString('en-IN')}.00
-----------------------------------------------------
AI Negotiator Discount Applied     : -₹${inv.breakdown.aiDiscount.toLocaleString('en-IN')}.00
-----------------------------------------------------
Subtotal                           : ₹${inv.breakdown.subtotal.toLocaleString('en-IN')}.00
Tax (0%)                           : ₹0.00
=====================================================
TOTAL BALANCE                      : ₹${inv.breakdown.total.toLocaleString('en-IN')}.00
=====================================================
Authorized Escrow Gateway • ProStudio Cloud Run
`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${inv.invoiceId}-Statement.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-6" id="financials-view-root">
      
      {/* Toast Notice */}
      {paymentSuccessToast && (
        <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 px-4 py-3 rounded-xl flex items-center justify-between text-xs font-semibold shadow-sm animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{paymentSuccessToast}</span>
          </div>
          <button 
            type="button" 
            onClick={() => setPaymentSuccessToast(null)}
            className="text-emerald-700 hover:text-emerald-900 font-mono text-sm px-2 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-[#EBE4D8] shadow-xs">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#3C352E] tracking-tight">
            Financials & Automated Invoices
          </h1>
          <p className="text-xs text-[#6B6155] mt-1">
            Manage billing, track expenditures, and review detailed invoice breakdowns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                const next = filterStatus === 'all' ? 'Pending' : filterStatus === 'Pending' ? 'Paid' : filterStatus === 'Paid' ? 'Overdue' : 'all';
                setFilterStatus(next);
              }}
              className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3C352E] border border-[#EBE4D8] text-xs font-bold px-3.5 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Filter className="w-3.5 h-3.5 text-[#8C7456]" />
              <span>Filter: {filterStatus.toUpperCase()}</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              const newId = `INV-2023-0${Math.floor(10 + Math.random() * 89)}`;
              const newInv: InvoiceItem = {
                id: `inv-${Date.now()}`,
                invoiceId: newId,
                client: "Luxe Media Corp",
                projectName: "Campaign Teaser & Retouch",
                date: "Nov 01, 2023",
                dueDate: "Nov 15, 2023",
                amount: 14500,
                status: "Pending",
                breakdown: {
                  crew: 6000,
                  gear: 4000,
                  studio: 2500,
                  post: 2500,
                  aiDiscount: 500,
                  subtotal: 14500,
                  tax: 0,
                  total: 14500
                }
              };
              setInvoices(prev => [newInv, ...prev]);
              setSelectedInvoiceId(newId);
            }}
            className="bg-[#3C352E] hover:bg-[#25211D] text-[#FAF7F2] text-xs font-bold px-4 py-2 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4 text-[#FAF7F2]" />
            <span>+ New Invoice</span>
          </button>
        </div>
      </div>

      {/* 3 TOP KPI STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Card 1: Total Outstanding */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70]">
            Total Outstanding
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#3C352E]">
              ₹1,24,500
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+12% vs last month</span>
          </p>
        </div>

        {/* Card 2: Paid This Month */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70]">
            Paid This Month
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#3C352E]">
              ₹86,200
            </span>
          </div>
          <p className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            <span>+5% vs last month</span>
          </p>
        </div>

        {/* Card 3: AI Savings */}
        <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70]">
            AI Savings
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-serif font-bold text-[#8C7456]">
              ₹12,450
            </span>
          </div>
          <p className="text-[11px] text-[#8C7456] font-medium flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            <span>Via automated negotiation</span>
          </p>
        </div>

      </div>

      {/* MAIN TWO-COLUMN SPLIT: RECENT INVOICES TABLE & INVOICE DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: RECENT INVOICES TABLE (7 Cols) */}
        <div className="lg:col-span-7">
          <div className="bg-white rounded-2xl border border-[#EBE4D8] shadow-xs overflow-hidden">
            
            <div className="p-5 border-b border-[#EBE4D8] flex items-center justify-between">
              <h3 className="text-sm font-bold text-[#3C352E]">Recent Invoices</h3>
              <button 
                type="button" 
                onClick={() => setFilterStatus('all')}
                className="text-xs text-[#8C7456] font-bold hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#FAF7F2] text-[#8B7E70] uppercase font-mono text-[9px] border-b border-[#EBE4D8]">
                  <tr>
                    <th className="py-3 px-4">Invoice ID</th>
                    <th className="py-3 px-4">Client / Project</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4D8]/80 text-[#3C352E]">
                  {filteredInvoices.map(inv => {
                    const isSelected = activeInvoice.invoiceId === inv.invoiceId;
                    return (
                      <tr 
                        key={inv.id}
                        onClick={() => setSelectedInvoiceId(inv.invoiceId)}
                        className={`hover:bg-[#FAF7F2] transition-colors cursor-pointer ${
                          isSelected ? "bg-[#FAF7F2] font-semibold" : ""
                        }`}
                      >
                        <td className="py-3.5 px-4 font-mono font-bold text-[#8C7456]">
                          {inv.invoiceId}
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-[#3C352E]">{inv.client}</div>
                          <div className="text-[10px] text-[#8B7E70] truncate max-w-[140px]">{inv.projectName}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#8B7E70] text-[11px]">
                          {inv.date}
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#3C352E]">
                          ₹{inv.amount.toLocaleString('en-IN')}.00
                        </td>
                        <td className="py-3.5 px-4">
                          <span className={`inline-block px-2.5 py-0.5 rounded-md font-bold uppercase text-[9px] font-mono ${
                            inv.status === 'Overdue' 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                              : inv.status === 'Pending'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-3 text-right">
                          <button 
                            type="button" 
                            onClick={(e) => { e.stopPropagation(); handleDownloadPDF(inv); }}
                            className="p-1.5 hover:bg-[#EBE4D8] rounded-lg text-[#8B7E70] hover:text-[#3C352E]"
                            title="Download Statement"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

          </div>
        </div>

        {/* RIGHT COLUMN: INVOICE DETAILS PANEL (5 Cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white p-6 rounded-2xl border border-[#EBE4D8] shadow-xs space-y-5">
            
            {/* Detail Header */}
            <div className="flex items-start justify-between border-b border-[#EBE4D8] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#3C352E]">Invoice Details</h3>
                <p className="text-xs font-bold text-[#8C7456] mt-0.5">{activeInvoice.client}</p>
                <p className="text-[11px] text-[#8B7E70]">{activeInvoice.projectName}</p>
              </div>

              <div className="text-right">
                <span className="font-mono text-xs font-bold text-[#3C352E] block">{activeInvoice.invoiceId}</span>
                <span className="text-[9px] uppercase tracking-wider text-[#8B7E70] block font-mono mt-0.5">
                  Due: {activeInvoice.dueDate}
                </span>
                <span className={`inline-block mt-1 px-2 py-0.5 rounded text-[8px] font-bold font-mono uppercase ${
                  activeInvoice.status === 'Paid' ? 'bg-emerald-100 text-emerald-800' : activeInvoice.status === 'Pending' ? 'bg-amber-100 text-amber-800' : 'bg-rose-100 text-rose-800'
                }`}>
                  {activeInvoice.status}
                </span>
              </div>
            </div>

            {/* Itemized Production Costs */}
            <div className="space-y-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70] block font-mono">
                Itemized Production Costs (INR)
              </span>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8]">
                  <div className="flex items-center gap-2">
                    <Users className="w-3.5 h-3.5 text-[#8C7456]" />
                    <span className="font-medium text-[#3C352E]">Crew (Director, DOP, Gaffer)</span>
                  </div>
                  <span className="font-mono font-bold text-[#3C352E]">₹{activeInvoice.breakdown.crew.toLocaleString('en-IN')}.00</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8]">
                  <div className="flex items-center gap-2">
                    <Camera className="w-3.5 h-3.5 text-[#8C7456]" />
                    <span className="font-medium text-[#3C352E]">Gear Rental (ARRI Alexa, Lenses)</span>
                  </div>
                  <span className="font-mono font-bold text-[#3C352E]">₹{activeInvoice.breakdown.gear.toLocaleString('en-IN')}.00</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8]">
                  <div className="flex items-center gap-2">
                    <Video className="w-3.5 h-3.5 text-[#8C7456]" />
                    <span className="font-medium text-[#3C352E]">Studio Rental (Stage A - 2 Days)</span>
                  </div>
                  <span className="font-mono font-bold text-[#3C352E]">₹{activeInvoice.breakdown.studio.toLocaleString('en-IN')}.00</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#FAF7F2] border border-[#EBE4D8]">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#8C7456]" />
                    <span className="font-medium text-[#3C352E]">Post-Production (Editing, Color)</span>
                  </div>
                  <span className="font-mono font-bold text-[#3C352E]">₹{activeInvoice.breakdown.post.toLocaleString('en-IN')}.00</span>
                </div>

                {/* AI Negotiator Discount Banner */}
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-950">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-[#8C7456]" />
                    <span className="font-bold">AI Negotiator Discount applied</span>
                  </div>
                  <span className="font-mono font-bold text-rose-700">-₹{activeInvoice.breakdown.aiDiscount.toLocaleString('en-IN')}.00</span>
                </div>
              </div>
            </div>

            {/* Calculations & Total */}
            <div className="space-y-1.5 pt-3 border-t border-[#EBE4D8] text-xs">
              <div className="flex justify-between text-[#8B7E70]">
                <span>Subtotal</span>
                <span className="font-mono font-medium text-[#3C352E]">₹{activeInvoice.breakdown.subtotal.toLocaleString('en-IN')}.00</span>
              </div>
              <div className="flex justify-between text-[#8B7E70]">
                <span>Tax (0%)</span>
                <span className="font-mono font-medium text-[#3C352E]">₹0.00</span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#EBE4D8]">
                <span className="font-bold text-sm text-[#3C352E] uppercase">Total</span>
                <span className="text-xl font-serif font-bold text-[#8C7456]">
                  ₹{activeInvoice.breakdown.total.toLocaleString('en-IN')}.00
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => handleDownloadPDF(activeInvoice)}
                className="w-full py-2.5 px-3 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EBE4D8] text-[#3C352E] font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-[#8C7456]" />
                <span>Download PDF</span>
              </button>

              <button
                type="button"
                onClick={() => handlePayNow(activeInvoice)}
                disabled={activeInvoice.status === 'Paid' || isProcessingPayment}
                className="w-full py-2.5 px-3 bg-[#3C352E] hover:bg-[#25211D] disabled:bg-emerald-700 disabled:opacity-90 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-xs"
              >
                {isProcessingPayment ? (
                  <span className="animate-pulse">Authorizing...</span>
                ) : activeInvoice.status === 'Paid' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                    <span>Paid in Full</span>
                  </>
                ) : (
                  <>
                    <CreditCard className="w-3.5 h-3.5 text-white" />
                    <span>Pay Now</span>
                  </>
                )}
              </button>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
