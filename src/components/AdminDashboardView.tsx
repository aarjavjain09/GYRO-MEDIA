import React, { useState } from "react";
import { 
  ShieldCheck, Lock, User, DollarSign, Clock, CheckCircle, 
  Settings, Briefcase, Mail, Edit, Plus, Trash2, Check, AlertCircle,
  TrendingUp, Save, Landmark, Layers, ChevronRight, FileText,
  Download, FileSpreadsheet, BarChart2, ArrowUpRight, ArrowDownRight,
  Calendar, Filter, PieChart, Layers3, FolderArchive, FileVideo,
  FileImage, Search, ArrowUpDown, RefreshCw, ExternalLink, Share2, Music
} from "lucide-react";
import { 
  ResponsiveContainer, BarChart, Bar, AreaChart, Area, XAxis, YAxis, 
  Tooltip, Legend, CartesianGrid, PieChart as RechartsPieChart, Pie, Cell 
} from "recharts";
import { Project, Service, Milestone, MilestoneStatus, MeetingSlot, Meeting, MeetingStatus } from "../types";
import AdminCalendarView from "./AdminCalendarView";

export interface TransferredFileItem {
  id: string;
  fileName: string;
  fileSize: string;
  fileType: 'video' | 'image' | 'raw' | 'audio' | 'document';
  clientName: string;
  clientEmail: string;
  projectName: string;
  projectId: string;
  uploadFormattedDate: string; // e.g. "Aug 10, 2026 • 11:24:15 PM"
  uploadTimestamp: number; // for chronological sorting
  transferMethod: 'V-Fast 7-Day Link' | 'Project Intake' | 'Escrow Asset Handoff';
  expiryDaysRemaining?: number;
  status: 'Active' | 'Purging Soon' | 'Archived';
}

interface AdminDashboardViewProps {
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
  onAddProject: (newProj: Project) => void;
  adminEmails: string[];
  onAddAdminEmail: (email: string) => void;
  onRemoveAdminEmail: (email: string) => void;
  currentUser: { name: string; email: string } | null;
  onOpenVFastModal?: () => void;
  slots: MeetingSlot[];
  meetings: Meeting[];
  onAddSlot: (slot: MeetingSlot) => void;
  onDeleteSlot: (slotId: string) => void;
  onBulkAddSlots: (slots: MeetingSlot[]) => void;
  onUpdateMeetingStatus: (meetingId: string, status: MeetingStatus) => void;
  onSendMeetingReminder: (meetingId: string, reminderType?: '24h_before' | '1h_before' | 'instant_manual') => void;
}

export default function AdminDashboardView({
  projects,
  onUpdateProject,
  onAddProject,
  adminEmails,
  onAddAdminEmail,
  onRemoveAdminEmail,
  currentUser,
  onOpenVFastModal,
  slots,
  meetings,
  onAddSlot,
  onDeleteSlot,
  onBulkAddSlots,
  onUpdateMeetingStatus,
  onSendMeetingReminder
}: AdminDashboardViewProps) {
  // Tabs inside Admin Console: 'projects' | 'calendar' | 'transfers' | 'analytics' | 'services' | 'escrow' | 'settings'
  const [activeSubTab, setActiveSubTab] = useState<'projects' | 'calendar' | 'transfers' | 'analytics' | 'services' | 'escrow' | 'settings'>('projects');
  
  // Transferred Files State (for Admin Console file log sorted by Date & Time)
  const [transferredFiles, setTransferredFiles] = useState<TransferredFileItem[]>([
    {
      id: "trf-001",
      fileName: "raw_wedding_highlights_camA_4k.mp4",
      fileSize: "2.4 GB",
      fileType: "video",
      clientName: "Aarjav Jain",
      clientEmail: "aarjavjainn@gmail.com",
      projectName: "Luxe Wedding Commercial Reel",
      projectId: "proj-101",
      uploadFormattedDate: "Aug 10, 2026 • 11:24:15 PM",
      uploadTimestamp: new Date("2026-08-10T23:24:15").getTime(),
      transferMethod: "V-Fast 7-Day Link",
      expiryDaysRemaining: 7,
      status: "Active"
    },
    {
      id: "trf-002",
      fileName: "cinematic_intro_drone_log_4k.mov",
      fileSize: "1.8 GB",
      fileType: "video",
      clientName: "Julian Vance",
      clientEmail: "julian@creame.studio",
      projectName: "Autumn Fashion Lookbook 2026",
      projectId: "proj-102",
      uploadFormattedDate: "Aug 10, 2026 • 09:15:30 PM",
      uploadTimestamp: new Date("2026-08-10T21:15:30").getTime(),
      transferMethod: "Project Intake",
      status: "Active"
    },
    {
      id: "trf-003",
      fileName: "product_shoot_raw_pack_001.arw",
      fileSize: "680 MB",
      fileType: "raw",
      clientName: "Elena Rostova",
      clientEmail: "elena@luxe.co",
      projectName: "Luxe Watch Campaign Shoot",
      projectId: "proj-103",
      uploadFormattedDate: "Aug 10, 2026 • 06:40:00 PM",
      uploadTimestamp: new Date("2026-08-10T18:40:00").getTime(),
      transferMethod: "V-Fast 7-Day Link",
      expiryDaysRemaining: 6,
      status: "Active"
    },
    {
      id: "trf-004",
      fileName: "studio_multitrack_ambiance_96k.wav",
      fileSize: "310 MB",
      fileType: "audio",
      clientName: "Marcus Thorne",
      clientEmail: "marcus@agency.org",
      projectName: "Sonic Brand Identity Suite",
      projectId: "proj-104",
      uploadFormattedDate: "Aug 09, 2026 • 02:10:45 PM",
      uploadTimestamp: new Date("2026-08-09T14:10:45").getTime(),
      transferMethod: "Escrow Asset Handoff",
      status: "Active"
    },
    {
      id: "trf-005",
      fileName: "ephemeral_broll_preview_pack.zip",
      fileSize: "4.2 GB",
      fileType: "video",
      clientName: "Aarjav Jain",
      clientEmail: "aarjavjainn@gmail.com",
      projectName: "High-Speed Commercial B-Roll",
      projectId: "proj-101",
      uploadFormattedDate: "Aug 08, 2026 • 10:05:20 PM",
      uploadTimestamp: new Date("2026-08-08T22:05:20").getTime(),
      transferMethod: "V-Fast 7-Day Link",
      expiryDaysRemaining: 5,
      status: "Active"
    },
    {
      id: "trf-006",
      fileName: "brand_launch_v1_color_graded.prores",
      fileSize: "3.1 GB",
      fileType: "video",
      clientName: "Sophia Chen",
      clientEmail: "sophia@design.io",
      projectName: "Tech Product Launch Keynote",
      projectId: "proj-105",
      uploadFormattedDate: "Aug 07, 2026 • 04:30:10 PM",
      uploadTimestamp: new Date("2026-08-07T16:30:10").getTime(),
      transferMethod: "Project Intake",
      status: "Archived"
    }
  ]);

  // Transferred Files Filter & Search States
  const [transferSearchQuery, setTransferSearchQuery] = useState("");
  const [transferFileTypeFilter, setTransferFileTypeFilter] = useState<string>("all");
  const [transferSortDirection, setTransferSortDirection] = useState<'desc' | 'asc'>('desc');
  const [fileActionNotice, setFileActionNotice] = useState("");

  // Filtered & sorted transferred files
  const filteredTransferredFiles = transferredFiles
    .filter((file) => {
      const matchesSearch = 
        file.fileName.toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
        file.clientName.toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
        file.clientEmail.toLowerCase().includes(transferSearchQuery.toLowerCase()) ||
        file.projectName.toLowerCase().includes(transferSearchQuery.toLowerCase());

      const matchesType = 
        transferFileTypeFilter === "all" ? true : file.fileType === transferFileTypeFilter;

      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (transferSortDirection === "desc") {
        return b.uploadTimestamp - a.uploadTimestamp; // Date and time descending (newest first)
      } else {
        return a.uploadTimestamp - b.uploadTimestamp; // Date and time ascending (oldest first)
      }
    });

  const handleCopyFileLink = (file: TransferredFileItem) => {
    const link = `https://studio.vfast.transfer/dl/${file.id}?token=usr_${file.clientEmail.split('@')[0]}`;
    navigator.clipboard?.writeText(link);
    setFileActionNotice(`Direct download link for "${file.fileName}" copied to admin clipboard!`);
    setTimeout(() => setFileActionNotice(""), 4000);
  };

  const handlePurgeFile = (fileId: string, fileName: string) => {
    setTransferredFiles(prev => prev.filter(f => f.id !== fileId));
    setFileActionNotice(`🗑️ File "${fileName}" has been purged from transfer log.`);
    setTimeout(() => setFileActionNotice(""), 4000);
  };

  const handleDownloadTransfersManifest = () => {
    const header = "File ID,File Name,File Size,Type,Client Name,Client Email,Project Name,Upload Date & Time,Transfer Method,Status\n";
    const rows = filteredTransferredFiles.map(f => 
      `"${f.id}","${f.fileName}","${f.fileSize}","${f.fileType}","${f.clientName}","${f.clientEmail}","${f.projectName}","${f.uploadFormattedDate}","${f.transferMethod}","${f.status}"`
    ).join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Admin_Transferred_Files_Manifest_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    setFileActionNotice("📥 Transferred files CSV manifest exported successfully!");
    setTimeout(() => setFileActionNotice(""), 4000);
  };
  
  // Analytics Sales Comparison chart controls
  const [chartTimeframe, setChartTimeframe] = useState<'weekly' | '6months' | 'categories'>('weekly');
  const [chartStyle, setChartStyle] = useState<'bar' | 'area'>('bar');
  
  // Service Sales Pie Chart controls
  const [pieDisplayUnit, setPieDisplayUnit] = useState<'percentage' | 'numbers'>('percentage');
  const [pieMetricType, setPieMetricType] = useState<'revenue' | 'count'>('revenue');
  
  // Selected project for editing
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [isEditingProject, setIsEditingProject] = useState(false);
  
  // Form states for project editing
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editDeadline, setEditDeadline] = useState("");
  const [editStatus, setEditStatus] = useState<Project["status"]>("active");
  const [editMilestones, setEditMilestones] = useState<Milestone[]>([]);
  const [editNotes, setEditNotes] = useState("");
  const [saveSuccessMessage, setSaveSuccessMessage] = useState("");

  // Filter state for project table
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // State for adding a new admin email
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailSuccess, setEmailSuccess] = useState("");

  // In-memory services price configuration (simulated admin controls)
  const [basePhotographyPrice, setBasePhotographyPrice] = useState(15000);
  const [baseVideographyPrice, setBaseVideographyPrice] = useState(25000);
  const [baseEditingPrice, setBaseEditingPrice] = useState(12000);
  const [pricesSavedMsg, setPricesSavedMsg] = useState("");

  // Dynamic calculations based on current projects
  const totalRevenue = projects.reduce((sum, p) => sum + p.totalPrice, 0);
  const activeJobs = projects.filter(p => p.status === "active").length;
  const reviewJobs = projects.filter(p => p.status === "review").length;
  const completedJobs = projects.filter(p => p.status === "completed").length;
  const averageDealSize = projects.length ? Math.round(totalRevenue / projects.length) : 0;

  // Select project to edit
  const handleSelectProjectForEdit = (proj: Project) => {
    setSelectedProjectId(proj.id);
    setEditName(proj.name);
    setEditPrice(proj.totalPrice);
    setEditDeadline(proj.deadline);
    setEditStatus(proj.status);
    setEditMilestones([...proj.milestones]);
    setEditNotes(proj.notes || "");
    setIsEditingProject(true);
    setSaveSuccessMessage("");
  };

  // Save project modifications
  const handleSaveProjectEdits = () => {
    if (!selectedProjectId) return;
    
    // Find original project to merge fields
    const original = projects.find(p => p.id === selectedProjectId);
    if (!original) return;

    // Determine current milestone index based on statuses
    // For simplicity, find the index of the first 'current' milestone
    let milestoneIndex = original.currentMilestoneIndex;
    const currentIdx = editMilestones.findIndex(m => m.status === "current");
    if (currentIdx !== -1) {
      milestoneIndex = currentIdx;
    } else {
      // If there is no current milestone, find first pending or set completed
      const allCompleted = editMilestones.every(m => m.status === "completed");
      if (allCompleted) {
        milestoneIndex = editMilestones.length;
      }
    }

    const updated: Project = {
      ...original,
      name: editName,
      totalPrice: Number(editPrice),
      deadline: editDeadline,
      status: editStatus,
      milestones: editMilestones,
      currentMilestoneIndex: milestoneIndex,
      notes: editNotes
    };

    onUpdateProject(updated);
    setSaveSuccessMessage("Project configurations successfully synced to workspace.");
    
    setTimeout(() => {
      setSaveSuccessMessage("");
      setIsEditingProject(false);
      setSelectedProjectId(null);
    }, 1800);
  };

  // Toggle single milestone status in form
  const handleToggleMilestoneStatus = (milestoneId: string, currentStatus: MilestoneStatus) => {
    const order: MilestoneStatus[] = ["pending", "current", "completed"];
    const nextStatus = order[(order.indexOf(currentStatus) + 1) % order.length];
    
    setEditMilestones(editMilestones.map(m => {
      if (m.id === milestoneId) {
        return {
          ...m,
          status: nextStatus,
          updatedAt: nextStatus === "completed" ? "Just Now" : undefined
        };
      }
      return m;
    }));
  };

  // Add customized mock project (creates instant client pipeline)
  const handleCreateMockProject = () => {
    const randomId = `proj-${Math.floor(100 + Math.random() * 900)}`;
    const randomInvoice = `INV-2026-${Math.floor(200 + Math.random() * 700)}`;
    const mockNames = ["Amara Vance", "Ethan Hunt", "Lucas Croft", "Elena Rostova", "Marcus Vance"];
    const mockEmails = ["amara@vancemedia.com", "ethan@imf.net", "lucas@tomb.org", "elena@rostova.com", "marcus@vance.com"];
    const mockServices = [
      { id: "photography", name: "Premium Editorial Shoot", price: 350 },
      { id: "videography", name: "4K Corporate Campaign", price: 800 },
      { id: "edits", name: "Commercial Social Cuts", price: 250 }
    ];
    
    const randIndex = Math.floor(Math.random() * mockNames.length);
    const selectedService = mockServices[Math.floor(Math.random() * mockServices.length)];

    const newProj: Project = {
      id: randomId,
      name: `Command Studio - ${selectedService.name}`,
      serviceId: selectedService.id,
      clientName: mockNames[randIndex],
      clientEmail: mockEmails[randIndex],
      status: "active",
      totalPrice: selectedService.price,
      deadline: "Express Turnaround (48h)",
      createdAt: new Date().toISOString(),
      invoiceId: randomInvoice,
      currentMilestoneIndex: 1,
      milestones: [
        { id: "m1", name: "Asset Setup", description: "Ingesting user content.", status: "completed", updatedAt: "Today" },
        { id: "m2", name: "Primary Edit", description: "Initial grading & rhythm cuts.", status: "current" },
        { id: "m3", name: "Color Optimization", description: "Applying bespoke premium LUTs.", status: "pending" },
        { id: "m4", name: "Final Master Delivery", description: "Release of secure high-res export.", status: "pending" }
      ],
      uploadedFiles: [{ name: "briefing-doc.docx", size: "320 KB" }]
    };

    onAddProject(newProj);
  };

  // Export all project data and studio analytics into an Excel-compatible CSV report
  const handleDownloadExcelReport = () => {
    // 1. Title & Metadata Headers
    const rows = [
      "CREAME STUDIO - PERFORMANCE & ESCROW FINANCIAL LEDGER",
      `Report Generated On: ${new Date().toLocaleString()}`,
      `Lead Operator Reference: ${currentUser?.email || "aarjavjainn@gmail.com"}`,
      "",
      "STUDIO PERFORMANCE METRICS (KPIs)",
      "KPI Name,Value,Fulfillment Status",
      `Total Secured Revenue Contract Value,₹${totalRevenue.toLocaleString('en-IN')},100% Locked in Escrow Trust`,
      `Active Project Ingests,${activeJobs} Live pipelines,Currently executing`,
      `Asset Reviews Pending,${reviewJobs} Awaiting Client,Action required`,
      `Successful Project Fulfillment Rate,${projects.length ? Math.round((completedJobs / projects.length) * 100) : 0}%,Archived successfully`,
      `Average Project Deal Value,₹${averageDealSize.toLocaleString('en-IN')},Mean client contract size`,
      `Total Workspace Projects Logged,${projects.length} Total records,Historical database size`,
      "",
      "STUDIO BASE PRICE CONFIGURATION COORDINATES (INR)",
      "Service Pipeline,Current Configured Rate (INR),Original Base Reference",
      `Photography Hourly,₹${basePhotographyPrice.toLocaleString('en-IN')},Originally ₹15,000 / hr`,
      `Videography Hourly,₹${baseVideographyPrice.toLocaleString('en-IN')},Originally ₹25,000 / hr`,
      `Post-Production Edits,₹${baseEditingPrice.toLocaleString('en-IN')},Originally ₹12,000 / flat`,
      "",
      "CLIENT PIPELINE RECORDS (INDIVIDUAL INGESTS LOGS)",
      "PROJECT ID,PROJECT NAME,CLIENT CONTACT,CLIENT EMAIL,FULFILLMENT PHASE,CONTRACT VALUE (INR),COMPLETED MILESTONES,TOTAL MILESTONES,PROGRESS PERCENT,TIMELINE / DEADLINE,INVOICE REFERENCE CODE,INGESTED TIMESTAMP"
    ];

    // 2. Map every project row
    projects.forEach(p => {
      const completedCount = p.milestones.filter(m => m.status === "completed").length;
      const totalCount = p.milestones.length;
      const progressPercent = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;
      
      // Escape dynamic string variables to prevent CSV parsing injection / layout brokenness
      const escapeField = (str: string) => {
        const clean = str.replace(/"/g, '""');
        return clean.includes(",") || clean.includes("\n") || clean.includes('"') ? `"${clean}"` : clean;
      };

      const id = escapeField(p.id);
      const name = escapeField(p.name);
      const client = escapeField(p.clientName);
      const email = escapeField(p.clientEmail);
      const status = escapeField(p.status.toUpperCase().replace("_", " "));
      const price = `$${p.totalPrice}`;
      const deadlineText = escapeField(p.deadline);
      const invoice = escapeField(p.invoiceId || "");
      const createdAt = escapeField(p.createdAt || "");

      rows.push(`${id},${name},${client},${email},${status},${price},${completedCount},${totalCount},${progressPercent}%,${deadlineText},${invoice},${createdAt}`);
    });

    // 3. Assemble and initiate the download flow
    const csvString = rows.join("\r\n");
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvString], { type: "text/csv;charset=utf-8;" }); // UTF-8 BOM for Microsoft Excel compliance
    const url = URL.createObjectURL(blob);
    
    const element = document.createElement("a");
    element.href = url;
    element.download = `Creame_Studio_Fulfillment_Ledger_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  // Add admin email to list
  const handleAddEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEmailError("");
    setEmailSuccess("");

    if (!newAdminEmail || !newAdminEmail.includes("@")) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (adminEmails.includes(newAdminEmail.toLowerCase().trim())) {
      setEmailError("This email is already registered as an admin.");
      return;
    }

    onAddAdminEmail(newAdminEmail.toLowerCase().trim());
    setEmailSuccess(`"${newAdminEmail}" successfully authorized as an administrator.`);
    setNewAdminEmail("");
  };

  // Filter projects list
  const filteredProjects = projects.filter(p => {
    if (statusFilter === "all") return true;
    return p.status === statusFilter;
  });

  // Save dynamic rates
  const handleSaveRates = () => {
    setPricesSavedMsg("Dynamic base rates authorized and applied.");
    setTimeout(() => setPricesSavedMsg(""), 3000);
  };

  // Comparative Sales Datasets (Previous Month vs Current Month)
  const weeklySalesData = [
    { period: "Week 1", previousMonth: 3200, currentMonth: 4100, label: "W1 Ingests" },
    { period: "Week 2", previousMonth: 3800, currentMonth: 4900, label: "W2 Production" },
    { period: "Week 3", previousMonth: 3100, currentMonth: 4250, label: "W3 Milestones" },
    { period: "Week 4", previousMonth: 4100, currentMonth: 5200, label: "W4 Deliveries" },
  ];

  const sixMonthTrendData = [
    { period: "Feb 2026", revenue: 9800, target: 10000 },
    { period: "Mar 2026", revenue: 11200, target: 11000 },
    { period: "Apr 2026", revenue: 12500, target: 12000 },
    { period: "May 2026", revenue: 13100, target: 13000 },
    { period: "Jun (Prev)", revenue: 14200, target: 14000 },
    { period: "Jul (Current)", revenue: Math.max(18450, totalRevenue), target: 16000 },
  ];

  const categorySalesData = [
    { category: "Photography", previousMonth: 5200, currentMonth: 6800 },
    { category: "Videography", previousMonth: 6100, currentMonth: 8400 },
    { category: "Post-Production", previousMonth: 2900, currentMonth: 3250 },
  ];

  // Calculated Sales Comparison Metrics
  const prevMonthTotal = 14200;
  const currMonthTotal = Math.max(18450, totalRevenue);
  const salesDelta = currMonthTotal - prevMonthTotal;
  const momPercentage = Math.round((salesDelta / prevMonthTotal) * 100);

  // Service Sales Distribution Dataset for Pie Chart
  const servicePieRawData = [
    { name: "Videography Production", revenue: 12400, count: 18, color: "#8C7456" },
    { name: "Photography Sessions", revenue: 8600, count: 14, color: "#3C352E" },
    { name: "Post-Production & Edits", revenue: 4250, count: 10, color: "#C2B29A" },
    { name: "Brand Visual Identity", revenue: 2750, count: 5, color: "#5C4E3D" },
  ];

  const totalPieRevenue = servicePieRawData.reduce((sum, item) => sum + item.revenue, 0);
  const totalPieCount = servicePieRawData.reduce((sum, item) => sum + item.count, 0);

  const pieChartData = servicePieRawData.map(item => {
    const rawVal = pieMetricType === 'revenue' ? item.revenue : item.count;
    const totalVal = pieMetricType === 'revenue' ? totalPieRevenue : totalPieCount;
    const pctShare = ((rawVal / totalVal) * 100).toFixed(1);

    return {
      name: item.name,
      value: rawVal,
      revenue: item.revenue,
      count: item.count,
      percentage: Number(pctShare),
      color: item.color
    };
  });

  const topSoldService = [...servicePieRawData].sort((a, b) => 
    pieMetricType === 'revenue' ? b.revenue - a.revenue : b.count - a.count
  )[0];

  return (
    <div className="space-y-8 animate-fadeIn" id="admin-dashboard-container">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#EBE4D8] pb-6">
        <div>
          <div className="flex items-center gap-2 text-red-700 font-bold text-xs uppercase tracking-widest">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Console (Secure Access)</span>
          </div>
          <h2 className="text-3xl font-serif text-[#3C352E] mt-1">Studio Administrator Hub</h2>
          <p className="text-xs text-[#8B7E70] mt-1">
            Master oversight for customer visual pipelines, milestones fulfillment, and secure financial escrow states.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onOpenVFastModal}
            className="px-3.5 py-2 bg-amber-100 hover:bg-amber-200 text-amber-900 border border-amber-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            title="Generate a 7-day auto-expiring V-Fast share link for client raw footages"
          >
            <Share2 className="w-3.5 h-3.5 text-amber-700" />
            <span>V-Fast Link</span>
          </button>
          <button
            onClick={handleDownloadExcelReport}
            className="px-4 py-2 bg-white hover:bg-[#FAF7F2] text-[#8C7456] border border-[#EBE4D8] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
            title="Download complete project records and KPIs in Excel spreadsheet format"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-[#8C7456]" />
            <span>Export Reports (Excel)</span>
          </button>
          <button
            onClick={handleCreateMockProject}
            className="px-4 py-2 bg-[#8C7456] hover:bg-[#705D44] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Simulate Client Order</span>
          </button>
        </div>
      </div>

      {/* OVERVIEW STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" id="admin-stats-grid">
        <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-5 space-y-1">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B7E70]">Total Project Value</span>
            <DollarSign className="w-4 h-4 text-[#8C7456]" />
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-serif font-bold text-[#3C352E]">₹{totalRevenue.toLocaleString()}</span>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">100% Escrow</span>
          </div>
          <p className="text-[10px] text-[#8B7E70]">Locked securely in studio escrow accounts</p>
        </div>

        <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-5 space-y-1">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B7E70]">Active Asset Pipelines</span>
            <Clock className="w-4 h-4 text-[#8C7456]" />
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-serif font-bold text-[#3C352E]">{activeJobs}</span>
            <span className="text-[10px] text-[#8C7456] font-mono ml-1">Jobs Live</span>
          </div>
          <p className="text-[10px] text-[#8B7E70]">{reviewJobs} projects pending client sign-off</p>
        </div>

        <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-5 space-y-1">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B7E70]">Fulfillment Rate</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-serif font-bold text-[#3C352E]">
              {projects.length ? Math.round((completedJobs / projects.length) * 100) : 0}%
            </span>
            <span className="text-[10px] text-emerald-600 font-mono ml-1">{completedJobs} Archival</span>
          </div>
          <p className="text-[10px] text-[#8B7E70]">Of all ingested client pipelines completed</p>
        </div>

        <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-5 space-y-1">
          <div className="flex justify-between items-center text-stone-400">
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8B7E70]">Avg Transaction Deal</span>
            <TrendingUp className="w-4 h-4 text-[#8C7456]" />
          </div>
          <div className="flex items-baseline gap-1 pt-1">
            <span className="text-2xl font-serif font-bold text-[#3C352E]">₹{averageDealSize}</span>
            <span className="text-[10px] text-[#8B7E70] font-mono ml-1">Per Project</span>
          </div>
          <p className="text-[10px] text-[#8B7E70]">Across {projects.length} verified studio briefs</p>
        </div>
      </div>

      {/* SALES COMPARISON GRAPH CARD */}
      <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-6 shadow-sm" id="sales-comparison-graph-card">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#FAF7F2] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#8C7456] font-bold text-xs uppercase tracking-widest">
              <BarChart2 className="w-4 h-4" />
              <span>Sales & Revenue Analytics</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3C352E] mt-1 flex items-center gap-3">
              <span>Previous Month vs. Current Month Comparison</span>
              <span className="inline-flex items-center gap-1 text-xs font-sans font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                <ArrowUpRight className="w-3.5 h-3.5" />
                +{momPercentage}% MoM Growth
              </span>
            </h3>
            <p className="text-xs text-[#8B7E70] mt-0.5">
              Detailed performance comparison between June (Previous) and July (Current) client bookings and escrow fulfillments.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Timeframe selector */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setChartTimeframe('weekly')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  chartTimeframe === 'weekly' ? "bg-white text-[#3C352E] shadow-xs font-semibold" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
              >
                Weekly (W1-W4)
              </button>
              <button
                onClick={() => setChartTimeframe('6months')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  chartTimeframe === '6months' ? "bg-white text-[#3C352E] shadow-xs font-semibold" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
              >
                6-Month Trend
              </button>
              <button
                onClick={() => setChartTimeframe('categories')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  chartTimeframe === 'categories' ? "bg-white text-[#3C352E] shadow-xs font-semibold" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
              >
                By Service
              </button>
            </div>

            {/* Style toggle */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setChartStyle('bar')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'bar' ? "bg-white text-[#3C352E] shadow-xs" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
                title="Bar Chart View"
              >
                <BarChart2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setChartStyle('area')}
                className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                  chartStyle === 'area' ? "bg-white text-[#3C352E] shadow-xs" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
                title="Area Trend View"
              >
                <TrendingUp className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* MOM METRICS HIGHLIGHT BAR */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#8B7E70] tracking-wider">Current Month Sales</span>
            <div className="text-lg font-serif font-bold text-[#3C352E]">₹{currMonthTotal.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-semibold">Jul 2026 Active Revenue</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#8B7E70] tracking-wider">Previous Month Sales</span>
            <div className="text-lg font-serif font-bold text-[#8B7E70]">₹{prevMonthTotal.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-stone-500">Jun 2026 Historical Benchmark</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#8B7E70] tracking-wider">Net Growth Delta</span>
            <div className="text-lg font-serif font-bold text-emerald-700">+₹{salesDelta.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-emerald-600 font-bold">+{momPercentage}% Increase</span>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#8B7E70] tracking-wider">Top Performing Sector</span>
            <div className="text-lg font-serif font-bold text-[#3C352E]">Videography</div>
            <span className="text-[10px] text-[#8C7456] font-semibold">₹8,400 Revenue Ingest</span>
          </div>
        </div>

        {/* RECHARTS CANVAS */}
        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            {chartTimeframe === 'weekly' ? (
              chartStyle === 'bar' ? (
                <BarChart data={weeklySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE4D8" />
                  <XAxis dataKey="period" tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} />
                  <YAxis tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                    contentStyle={{ backgroundColor: '#3C352E', borderColor: '#3C352E', borderRadius: '12px', color: '#FAF7F2', fontSize: '12px' }}
                    itemStyle={{ color: '#FAF7F2' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="previousMonth" name="Previous Month (June)" fill="#C2B29A" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="currentMonth" name="Current Month (July)" fill="#8C7456" radius={[6, 6, 0, 0]} />
                </BarChart>
              ) : (
                <AreaChart data={weeklySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C2B29A" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#C2B29A" stopOpacity={0.0}/>
                    </linearGradient>
                    <linearGradient id="colorCurr" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#8C7456" stopOpacity={0.5}/>
                      <stop offset="95%" stopColor="#8C7456" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE4D8" />
                  <XAxis dataKey="period" tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} />
                  <YAxis tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip 
                    formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                    contentStyle={{ backgroundColor: '#3C352E', borderColor: '#3C352E', borderRadius: '12px', color: '#FAF7F2', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Area type="monotone" dataKey="previousMonth" name="Previous Month (June)" stroke="#C2B29A" fillOpacity={1} fill="url(#colorPrev)" strokeWidth={2} />
                  <Area type="monotone" dataKey="currentMonth" name="Current Month (July)" stroke="#8C7456" fillOpacity={1} fill="url(#colorCurr)" strokeWidth={3} />
                </AreaChart>
              )
            ) : chartTimeframe === '6months' ? (
              <AreaChart data={sixMonthTrendData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8C7456" stopOpacity={0.5}/>
                    <stop offset="95%" stopColor="#8C7456" stopOpacity={0.0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE4D8" />
                <XAxis dataKey="period" tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} />
                <YAxis tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#3C352E', borderColor: '#3C352E', borderRadius: '12px', color: '#FAF7F2', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="revenue" name="Studio Revenue (₹)" stroke="#8C7456" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={3} />
                <Area type="monotone" dataKey="target" name="Quota Target (₹)" stroke="#2A9D8F" fillOpacity={0} strokeDasharray="4 4" strokeWidth={2} />
              </AreaChart>
            ) : (
              <BarChart data={categorySalesData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE4D8" />
                <XAxis dataKey="category" tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} />
                <YAxis tick={{ fill: '#8B7E70', fontSize: 11 }} axisLine={{ stroke: '#EBE4D8' }} tickFormatter={(v) => `₹${v}`} />
                <Tooltip 
                  formatter={(value: any) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Category Sales']}
                  contentStyle={{ backgroundColor: '#3C352E', borderColor: '#3C352E', borderRadius: '12px', color: '#FAF7F2', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="previousMonth" name="Previous Month (June)" fill="#C2B29A" radius={[6, 6, 0, 0]} />
                <Bar dataKey="currentMonth" name="Current Month (July)" fill="#3C352E" radius={[6, 6, 0, 0]} />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>
      </div>

      {/* MOST SOLD SERVICES PIE CHART CARD */}
      <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-6 shadow-sm" id="most-sold-services-pie-card">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-[#FAF7F2] pb-4">
          <div>
            <div className="flex items-center gap-2 text-[#8C7456] font-bold text-xs uppercase tracking-widest">
              <PieChart className="w-4 h-4" />
              <span>Service Sales Distribution</span>
            </div>
            <h3 className="text-xl font-serif font-bold text-[#3C352E] mt-1 flex flex-wrap items-center gap-3">
              <span>Which Service is Sold Most</span>
              <span className="inline-flex items-center gap-1 text-xs font-sans font-bold bg-[#FAF7F2] text-[#8C7456] border border-[#EBE4D8] px-2.5 py-0.5 rounded-full">
                👑 Top Sold: {topSoldService.name}
              </span>
            </h3>
            <p className="text-xs text-[#8B7E70] mt-0.5">
              Breakdown of client demand and revenue contributions across all active studio service packages.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Metric basis toggle (Revenue vs Bookings Volume) */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setPieMetricType('revenue')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  pieMetricType === 'revenue' ? "bg-white text-[#3C352E] shadow-xs font-semibold" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
              >
                Revenue (₹)
              </button>
              <button
                onClick={() => setPieMetricType('count')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
                  pieMetricType === 'count' ? "bg-white text-[#3C352E] shadow-xs font-semibold" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
              >
                Volume (Orders)
              </button>
            </div>

            {/* Display Unit Toggle: Percentage (%) vs Numbers */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] p-1 rounded-xl flex items-center gap-1 text-xs">
              <button
                onClick={() => setPieDisplayUnit('percentage')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pieDisplayUnit === 'percentage' ? "bg-[#3C352E] text-white font-semibold shadow-xs" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
                title="View sales in percentage share"
              >
                Percentage (%)
              </button>
              <button
                onClick={() => setPieDisplayUnit('numbers')}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  pieDisplayUnit === 'numbers' ? "bg-[#3C352E] text-white font-semibold shadow-xs" : "text-[#8B7E70] hover:text-[#3C352E]"
                }`}
                title="View sales in numerical values"
              >
                Numbers ({pieMetricType === 'revenue' ? '₹' : 'Qty'})
              </button>
            </div>
          </div>
        </div>

        {/* TOP METRIC HIGHLIGHT STRIP */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4">
          <div className="space-y-0.5 border-b md:border-b-0 md:border-r border-[#EBE4D8]/60 pb-3 md:pb-0 pr-0 md:pr-4">
            <span className="text-[10px] uppercase font-bold text-[#8B7E70] tracking-wider">#1 Top Selling Service</span>
            <div className="text-base font-serif font-bold text-[#3C352E]">{topSoldService.name}</div>
            <span className="text-[10px] text-[#8C7456] font-semibold">
              {pieDisplayUnit === 'percentage' 
                ? `${((topSoldService.revenue / totalPieRevenue) * 100).toFixed(1)}% Total Share`
                : `₹${topSoldService.revenue.toLocaleString('en-IN')} (${topSoldService.count} Bookings)`}
            </span>
          </div>

          <div className="space-y-0.5 border-b md:border-b-0 md:border-r border-[#EBE4D8]/60 pb-3 md:pb-0 pr-0 md:pr-4">
            <span className="text-[10px] uppercase font-bold text-[#8B7E70] tracking-wider">Total Sales Ingest</span>
            <div className="text-base font-serif font-bold text-[#3C352E]">₹{totalPieRevenue.toLocaleString('en-IN')}</div>
            <span className="text-[10px] text-stone-500">{totalPieCount} Fulfilled Client Packages</span>
          </div>

          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-[#8B7E70] tracking-wider">Display Mode Preference</span>
            <div className="text-base font-serif font-bold text-[#8C7456]">
              {pieDisplayUnit === 'percentage' ? "Percentage Share (%)" : "Numerical Values"}
            </div>
            <span className="text-[10px] text-stone-500">Currently showing {pieDisplayUnit} view</span>
          </div>
        </div>

        {/* PIE CHART AND LEGEND GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center pt-2">
          {/* RECHARTS PIE CANVAS */}
          <div className="lg:col-span-6 h-72 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <RechartsPieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index, name, value }) => {
                    const RADIAN = Math.PI / 180;
                    const radius = outerRadius + 18;
                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                    const labelText = pieDisplayUnit === 'percentage' 
                      ? `${(percent * 100).toFixed(1)}%`
                      : pieMetricType === 'revenue' 
                        ? `₹${Number(value).toLocaleString('en-IN')}` 
                        : `${value} orders`;

                    return (
                      <text 
                        x={x} 
                        y={y} 
                        fill="#3C352E" 
                        textAnchor={x > cx ? 'start' : 'end'} 
                        dominantBaseline="central"
                        fontSize="11"
                        fontWeight="700"
                      >
                        {labelText}
                      </text>
                    );
                  }}
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#FFFFFF" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: any, name: any, props: any) => {
                    const item = props.payload;
                    if (pieDisplayUnit === 'percentage') {
                      return [`${item.percentage}% Share (${pieMetricType === 'revenue' ? '₹' + item.revenue.toLocaleString('en-IN') : item.count + ' bookings'})`, item.name];
                    } else {
                      return [pieMetricType === 'revenue' ? `₹${item.revenue.toLocaleString('en-IN')} (${item.percentage}%)` : `${item.count} bookings (${item.percentage}%)`, item.name];
                    }
                  }}
                  contentStyle={{ backgroundColor: '#3C352E', borderColor: '#3C352E', borderRadius: '12px', color: '#FAF7F2', fontSize: '12px' }}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] uppercase font-bold text-[#8B7E70] block">Top Service</span>
              <span className="text-xs font-serif font-bold text-[#3C352E] block max-w-[90px] truncate">{topSoldService.name}</span>
            </div>
          </div>

          {/* LEGEND / BREAKDOWN TABLE */}
          <div className="lg:col-span-6 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7456] flex justify-between items-center">
              <span>Service Sales Breakdown</span>
              <span className="text-[10px] text-[#8B7E70] font-normal">Active Mode: {pieDisplayUnit === 'percentage' ? '%' : 'Numbers'}</span>
            </h4>
            <div className="space-y-2">
              {pieChartData.map((item, idx) => {
                const isTop = item.name === topSoldService.name;
                return (
                  <div 
                    key={idx} 
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
                      isTop ? "bg-[#FAF7F2] border-[#8C7456]/40 shadow-2xs" : "bg-white border-[#EBE4D8]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-3.5 h-3.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                      <div>
                        <div className="text-xs font-bold text-[#3C352E] flex items-center gap-1.5">
                          <span>{item.name}</span>
                          {isTop && (
                            <span className="text-[9px] uppercase font-extrabold bg-[#8C7456] text-white px-1.5 py-0.2 rounded-md">
                              Most Sold
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-[#8B7E70]">
                          {item.count} Client Packages Fulfilled
                        </span>
                      </div>
                    </div>

                    <div className="text-right font-mono">
                      {pieDisplayUnit === 'percentage' ? (
                        <div>
                          <span className="text-sm font-bold text-[#3C352E] block">{item.percentage}%</span>
                          <span className="text-[10px] text-[#8B7E70] block">₹{item.revenue.toLocaleString('en-IN')}</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-sm font-bold text-[#3C352E] block">
                            {pieMetricType === 'revenue' ? `₹${item.revenue.toLocaleString('en-IN')}` : `${item.count} orders`}
                          </span>
                          <span className="text-[10px] text-[#8B7E70] block">{item.percentage}% Share</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* SUB-TABS NAVIGATION */}
      <div className="flex border-b border-[#EBE4D8] overflow-x-auto" id="admin-subtabs">
        <button
          onClick={() => { setActiveSubTab('projects'); setIsEditingProject(false); }}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeSubTab === 'projects'
              ? "border-[#3C352E] text-[#3C352E]"
              : "border-transparent text-[#8B7E70] hover:text-[#3C352E]"
          }`}
        >
          Project Pipelines
        </button>
        <button
          onClick={() => { setActiveSubTab('calendar'); setIsEditingProject(false); }}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'calendar'
              ? "border-[#3C352E] text-[#3C352E] bg-amber-50/50"
              : "border-transparent text-[#8B7E70] hover:text-[#3C352E]"
          }`}
          id="btn-admin-tab-calendar"
        >
          <Calendar className="w-3.5 h-3.5 text-amber-800" />
          <span>Calendar & Meetings</span>
          <span className="bg-emerald-100 text-emerald-900 border border-emerald-300 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
            {meetings.filter(m => m.status === 'confirmed').length} Active
          </span>
        </button>
        <button
          onClick={() => { setActiveSubTab('transfers'); setIsEditingProject(false); }}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'transfers'
              ? "border-[#3C352E] text-[#3C352E] bg-amber-50/50"
              : "border-transparent text-[#8B7E70] hover:text-[#3C352E]"
          }`}
        >
          <FolderArchive className="w-3.5 h-3.5 text-amber-700" />
          <span>Transferred Files</span>
          <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[9px] font-mono px-1.5 py-0.2 rounded-full font-bold">
            {transferredFiles.length}
          </span>
        </button>
        <button
          onClick={() => { setActiveSubTab('analytics'); setIsEditingProject(false); }}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'analytics'
              ? "border-[#3C352E] text-[#3C352E]"
              : "border-transparent text-[#8B7E70] hover:text-[#3C352E]"
          }`}
        >
          <BarChart2 className="w-3.5 h-3.5" />
          <span>Sales & Analytics</span>
        </button>
        <button
          onClick={() => { setActiveSubTab('services'); setIsEditingProject(false); }}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'services'
              ? "border-[#3C352E] text-[#3C352E]"
              : "border-transparent text-[#8B7E70] hover:text-[#3C352E]"
          }`}
        >
          Services & Pricing
        </button>
        <button
          onClick={() => { setActiveSubTab('escrow'); setIsEditingProject(false); }}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'escrow'
              ? "border-[#3C352E] text-[#3C352E]"
              : "border-transparent text-[#8B7E70] hover:text-[#3C352E]"
          }`}
        >
          Escrow Audits
        </button>
        <button
          onClick={() => { setActiveSubTab('settings'); setIsEditingProject(false); }}
          className={`px-5 py-3 text-xs uppercase tracking-wider font-bold border-b-2 transition-all cursor-pointer ${
            activeSubTab === 'settings'
              ? "border-[#3C352E] text-[#3C352E]"
              : "border-transparent text-[#8B7E70] hover:text-[#3C352E]"
          }`}
        >
          Admin Access
        </button>
      </div>

      {/* TAB CONTENT: PROJECTS PIPELINE */}
      {activeSubTab === 'projects' && (
        <div className="space-y-6">
          {isEditingProject ? (
            /* PROJECT EDIT DRAWER */
            <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-6 shadow-sm animate-fadeIn" id="project-editor-panel">
              <div className="flex justify-between items-center border-b border-[#FAF7F2] pb-4">
                <div className="flex items-center gap-2">
                  <Edit className="w-4 h-4 text-[#8C7456]" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#3C352E]">
                    Inspect & Configure Pipeline: {selectedProjectId}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => { setIsEditingProject(false); setSelectedProjectId(null); }}
                  className="text-xs font-semibold text-[#8C7456] hover:underline cursor-pointer"
                >
                  Back to Pipelines List
                </button>
              </div>

              {saveSuccessMessage && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  <span>{saveSuccessMessage}</span>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
                {/* Core Specs form */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Project Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2.5 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Escrow Price ($)</label>
                      <input
                        type="number"
                        value={editPrice}
                        onChange={(e) => setEditPrice(Number(e.target.value))}
                        className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2.5 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456] font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Status Code</label>
                      <select
                        value={editStatus}
                        onChange={(e) => setEditStatus(e.target.value as Project["status"])}
                        className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2.5 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
                      >
                        <option value="pending_payment">Pending Payment</option>
                        <option value="active">Active Execution</option>
                        <option value="review">Under Review</option>
                        <option value="completed">Completed / Locked</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Deadline Info</label>
                    <input
                      type="text"
                      value={editDeadline}
                      onChange={(e) => setEditDeadline(e.target.value)}
                      className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2.5 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Director's Production Notes</label>
                    <textarea
                      rows={4}
                      value={editNotes}
                      onChange={(e) => setEditNotes(e.target.value)}
                      placeholder="Special creative filters, lens preferences or client timeline locks..."
                      className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-3 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
                    />
                  </div>
                </div>

                {/* Milestones Flow editor */}
                <div className="space-y-4">
                  <div>
                    <span className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">Ingest Milestones Flow</span>
                    <p className="text-[11px] text-[#8B7E70] mb-3">
                      Click any milestone capsule to toggle its phase: 
                      <span className="mx-1 px-1.5 py-0.5 bg-stone-100 text-[#8B7E70] rounded-sm text-[9px] font-mono">Pending</span> → 
                      <span className="mx-1 px-1.5 py-0.5 bg-yellow-50 text-yellow-700 rounded-sm text-[9px] font-mono">Current</span> → 
                      <span className="mx-1 px-1.5 py-0.5 bg-emerald-50 text-emerald-700 rounded-sm text-[9px] font-mono">Completed</span>
                    </p>
                  </div>

                  <div className="space-y-3">
                    {editMilestones.map((m, index) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => handleToggleMilestoneStatus(m.id, m.status)}
                        className="w-full text-left p-3 rounded-xl border border-[#EBE4D8] bg-[#FAF7F2] hover:bg-[#F4EFE6] transition-colors flex items-center justify-between cursor-pointer group"
                      >
                        <div className="space-y-1 pr-4">
                          <div className="flex items-center gap-2">
                            <span className="text-[9px] font-mono font-bold text-[#8C7456]">Step 0{index + 1}</span>
                            <span className="font-bold text-[#3C352E] text-xs">{m.name}</span>
                          </div>
                          <p className="text-[10px] text-[#8B7E70] leading-tight">{m.description}</p>
                        </div>

                        <div>
                          {m.status === "completed" && (
                            <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-md shrink-0">
                              Completed
                            </span>
                          )}
                          {m.status === "current" && (
                            <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-md shrink-0 animate-pulse">
                              Active Phase
                            </span>
                          )}
                          {m.status === "pending" && (
                            <span className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-[#8B7E70] border border-stone-200 rounded-md shrink-0">
                              Queued
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Actions footer */}
              <div className="pt-4 border-t border-[#FAF7F2] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => { setIsEditingProject(false); setSelectedProjectId(null); }}
                  className="px-4 py-2 bg-[#FAF7F2] border border-[#EBE4D8] hover:bg-[#F4EFE6] text-[#3C352E] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                >
                  Discard Changes
                </button>
                <button
                  type="button"
                  onClick={handleSaveProjectEdits}
                  className="px-5 py-2.5 bg-[#3C352E] hover:bg-[#25211D] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Authorize & Sync Updates</span>
                </button>
              </div>
            </div>
          ) : (
            /* PROJECT LIST TABLE */
            <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-6 shadow-xs">
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#3C352E]">
                  Ingested Workspace Pipelines ({filteredProjects.length})
                </h3>
                
                {/* Filter Controls */}
                <div className="flex gap-2 text-xs">
                  {["all", "pending_payment", "active", "review", "completed"].map((stat) => (
                    <button
                      key={stat}
                      onClick={() => setStatusFilter(stat)}
                      className={`px-3 py-1.5 rounded-lg border transition-all text-[11px] font-medium cursor-pointer ${
                        statusFilter === stat
                          ? "bg-[#3C352E] text-white border-[#3C352E]"
                          : "bg-white border-[#EBE4D8] text-[#8B7E70] hover:bg-[#FAF7F2]"
                      }`}
                    >
                      <span className="capitalize">{stat.replace("_", " ")}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Projects Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#8C7456] uppercase tracking-wider text-[10px] font-bold">
                      <th className="p-4">Project / ID</th>
                      <th className="p-4">Client Contact</th>
                      <th className="p-4">Fulfillment Phase</th>
                      <th className="p-4">Total Contract</th>
                      <th className="p-4">Milestone Progress</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F0] text-[#3C352E]">
                    {filteredProjects.map((p) => {
                      const completedCount = p.milestones.filter(m => m.status === "completed").length;
                      const totalCount = p.milestones.length;
                      
                      return (
                        <tr key={p.id} className="hover:bg-[#FAF7F2]/40 transition-colors">
                          <td className="p-4">
                            <div className="font-bold text-[#3C352E]">{p.name}</div>
                            <div className="font-mono text-[10px] text-[#8B7E70] mt-0.5">{p.id} • {p.invoiceId}</div>
                          </td>
                          <td className="p-4">
                            <div className="font-semibold">{p.clientName}</div>
                            <div className="text-[10px] text-[#8B7E70] font-mono mt-0.5">{p.clientEmail}</div>
                          </td>
                          <td className="p-4">
                            {p.status === "completed" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                                Completed & Disbursed
                              </span>
                            )}
                            {p.status === "review" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 animate-pulse">
                                Under Review
                              </span>
                            )}
                            {p.status === "active" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-blue-100 text-blue-800">
                                Active Production
                              </span>
                            )}
                            {p.status === "pending_payment" && (
                              <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600">
                                Escrow Pending
                              </span>
                            )}
                          </td>
                          <td className="p-4 font-bold text-[#8C7456]">₹{p.totalPrice}</td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-16 bg-stone-100 rounded-full h-1.5 overflow-hidden border border-stone-200">
                                <div 
                                  className="bg-[#8C7456] h-full transition-all duration-300" 
                                  style={{ width: `${totalCount ? (completedCount / totalCount) * 100 : 0}%` }}
                                ></div>
                              </div>
                              <span className="font-mono text-[10px] font-bold text-[#5C5348]">
                                {completedCount}/{totalCount}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-right">
                            <button
                              onClick={() => handleSelectProjectForEdit(p)}
                              className="px-2.5 py-1.5 bg-[#FAF7F2] hover:bg-[#8C7456] hover:text-white border border-[#EBE4D8] text-[#8C7456] font-bold uppercase rounded-lg transition-all text-[10px] tracking-wider cursor-pointer"
                            >
                              Configure
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredProjects.length === 0 && (
                      <tr>
                        <td colSpan={6} className="text-center p-8 text-stone-400 font-medium">
                          No ingested pipelines match the selected status filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: CALENDAR & CLIENT MEETINGS SCHEDULER */}
      {activeSubTab === 'calendar' && (
        <AdminCalendarView
          slots={slots}
          meetings={meetings}
          onAddSlot={onAddSlot}
          onDeleteSlot={onDeleteSlot}
          onBulkAddSlots={onBulkAddSlots}
          onUpdateMeetingStatus={onUpdateMeetingStatus}
          onSendMeetingReminder={onSendMeetingReminder}
        />
      )}

      {/* TAB CONTENT: TRANSFERRED FILES LOG (ADMIN CONSOLE ONLY) */}
      {activeSubTab === 'transfers' && (
        <div className="space-y-6 animate-fadeIn" id="transfers-subtab-view">
          
          {/* Action Notification banner */}
          {fileActionNotice && (
            <div className="p-3.5 bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold rounded-xl flex items-center justify-between shadow-2xs">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-700" />
                <span>{fileActionNotice}</span>
              </div>
              <button 
                onClick={() => setFileActionNotice("")}
                className="text-amber-800 hover:text-amber-950 font-bold text-xs cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* TRANSFERRED FILES OVERVIEW BANNER */}
          <div className="bg-gradient-to-r from-[#FAF6EE] to-[#F5ECE0] border border-[#EBE4D8] rounded-2xl p-6 space-y-4 shadow-2xs">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase rounded-full text-[9px] font-mono tracking-widest flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-amber-700" />
                    Admin Console Exclusive
                  </span>
                  <span className="text-[10px] text-[#8B7E70] font-mono">Real-Time Ingestion Tunnel</span>
                </div>
                <h3 className="text-xl font-serif font-bold text-[#3C352E]">
                  User Transferred Files & Raw Footages Log
                </h3>
                <p className="text-xs text-[#6B6155] max-w-2xl">
                  Centralized administrative ledger displaying every file uploaded by clients across project briefs and V-Fast 7-day expiring transfer tunnels. Sorted strictly by date and time of upload.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={onOpenVFastModal}
                  className="px-3.5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Share2 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Create V-Fast Share Link</span>
                </button>
                <button
                  type="button"
                  onClick={handleDownloadTransfersManifest}
                  className="px-3.5 py-2 bg-white border border-[#EBE4D8] hover:bg-[#FAF7F2] text-[#3C352E] font-bold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Export CSV Log</span>
                </button>
              </div>
            </div>

            {/* QUICK STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
              <div className="bg-white border border-[#EBE4D8] rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70]">Total Ingested Files</span>
                <div className="text-lg font-serif font-bold text-[#3C352E]">
                  {transferredFiles.length} Assets
                </div>
              </div>

              <div className="bg-white border border-[#EBE4D8] rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70]">Total Storage Volume</span>
                <div className="text-lg font-serif font-bold text-[#8C7456]">
                  12.49 GB
                </div>
              </div>

              <div className="bg-white border border-[#EBE4D8] rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70]">V-Fast 7-Day Expiring</span>
                <div className="text-lg font-serif font-bold text-amber-800 flex items-center gap-1.5">
                  <Share2 className="w-4 h-4 text-amber-600" />
                  <span>{transferredFiles.filter(f => f.transferMethod === "V-Fast 7-Day Link").length} Active Links</span>
                </div>
              </div>

              <div className="bg-white border border-[#EBE4D8] rounded-xl p-3.5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8B7E70]">Latest Upload Timestamp</span>
                <div className="text-xs font-mono font-bold text-[#3C352E] truncate pt-1">
                  {transferredFiles[0]?.uploadFormattedDate || "Aug 10, 2026 • 11:24 PM"}
                </div>
              </div>
            </div>
          </div>

          {/* FILTER & SEARCH CONTROLS BAR */}
          <div className="bg-white border border-[#EBE4D8] rounded-2xl p-5 space-y-4 shadow-xs">
            <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
              
              {/* Search input */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 text-[#8B7E70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search by file name, client email, or project..."
                  value={transferSearchQuery}
                  onChange={(e) => setTransferSearchQuery(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl pl-9 pr-4 py-2 text-xs text-[#3C352E] focus:outline-none focus:border-[#8C7456]"
                />
              </div>

              {/* Category Filter Pills & Chronological Sort toggle */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex border border-[#EBE4D8] bg-[#FAF7F2] rounded-xl p-1 text-[11px]">
                  {['all', 'video', 'raw', 'audio', 'image'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setTransferFileTypeFilter(type)}
                      className={`px-3 py-1.5 rounded-lg font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        transferFileTypeFilter === type
                          ? "bg-white text-[#3C352E] shadow-xs"
                          : "text-[#8B7E70] hover:text-[#3C352E]"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setTransferSortDirection(prev => prev === 'desc' ? 'asc' : 'desc')}
                  className="px-3.5 py-2 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EBE4D8] text-[#3C352E] rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0"
                  title="Toggle Chronological Upload Order"
                >
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#8C7456]" />
                  <span className="font-mono text-[10px] uppercase font-bold">
                    {transferSortDirection === 'desc' ? 'Date & Time ⬇️ (Newest First)' : 'Date & Time ⬆️ (Oldest First)'}
                  </span>
                </button>
              </div>

            </div>

            {/* TRANSFERRED FILES MAIN LOG TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#8C7456] uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-4">File / Asset Name</th>
                    <th className="p-4">Uploaded By (Client)</th>
                    <th className="p-4">Project Brief</th>
                    <th className="p-4">Size</th>
                    <th className="p-4 font-bold bg-amber-50/80 text-amber-950 border-x border-amber-200/60">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                        <span>Date & Time of Upload</span>
                      </div>
                    </th>
                    <th className="p-4">Transfer Mode / Retention</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EBE4D8]/60">
                  {filteredTransferredFiles.map((file) => (
                    <tr key={file.id} className="hover:bg-[#FAF7F2]/80 transition-colors group">
                      {/* File Name & Icon */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border ${
                            file.fileType === 'video' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                            file.fileType === 'raw' ? 'bg-amber-50 border-amber-200 text-amber-800' :
                            file.fileType === 'audio' ? 'bg-purple-50 border-purple-200 text-purple-700' :
                            'bg-emerald-50 border-emerald-200 text-emerald-700'
                          }`}>
                            {file.fileType === 'video' ? <FileVideo className="w-4 h-4" /> :
                             file.fileType === 'image' ? <FileImage className="w-4 h-4" /> :
                             file.fileType === 'audio' ? <Music className="w-4 h-4" /> :
                             <FileText className="w-4 h-4" />}
                          </div>
                          <div>
                            <span className="font-bold text-[#3C352E] block text-xs group-hover:text-[#8C7456] transition-colors">
                              {file.fileName}
                            </span>
                            <span className="text-[10px] text-[#8B7E70] font-mono">
                              ID: {file.id} • {file.fileType.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Client User Info */}
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-[#3C352E] block text-xs">{file.clientName}</span>
                          <span className="text-[10px] text-[#8C7456] font-mono bg-stone-100 px-1.5 py-0.5 rounded border border-stone-200 inline-block">
                            {file.clientEmail}
                          </span>
                        </div>
                      </td>

                      {/* Project Name */}
                      <td className="p-4">
                        <div>
                          <span className="font-medium text-[#3C352E] block text-xs">{file.projectName}</span>
                          <span className="text-[9px] text-[#8B7E70] font-mono">{file.projectId}</span>
                        </div>
                      </td>

                      {/* File Size */}
                      <td className="p-4 font-mono font-bold text-[#3C352E] text-xs">
                        {file.fileSize}
                      </td>

                      {/* UPLOAD DATE AND TIME (CRITICAL USER DEMAND) */}
                      <td className="p-4 bg-amber-50/50 border-x border-amber-100/80 font-mono text-xs text-[#3C352E] font-bold">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                          <span>{file.uploadFormattedDate}</span>
                        </div>
                      </td>

                      {/* Transfer Mode / Expiry status */}
                      <td className="p-4">
                        {file.transferMethod === "V-Fast 7-Day Link" ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 font-bold uppercase rounded-md text-[9px] font-mono">
                              <Share2 className="w-3 h-3 text-amber-700" />
                              V-Fast (7-Day Expiry)
                            </span>
                            <p className="text-[9px] text-[#8B7E70]">
                              Auto-purges in {file.expiryDaysRemaining ?? 7} days
                            </p>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-stone-100 text-[#5C5348] border border-stone-200 font-bold uppercase rounded-md text-[9px] font-mono">
                            <Lock className="w-3 h-3 text-[#8C7456]" />
                            {file.transferMethod}
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleCopyFileLink(file)}
                            className="p-1.5 bg-[#FAF7F2] hover:bg-amber-100 text-amber-900 border border-[#EBE4D8] rounded-lg transition-all cursor-pointer"
                            title="Copy Direct Ephemeral Share Link"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const a = document.createElement("a");
                              a.href = "#";
                              a.download = file.fileName;
                              setFileActionNotice(`📥 Initiating download for "${file.fileName}"...`);
                              setTimeout(() => setFileActionNotice(""), 3000);
                            }}
                            className="p-1.5 bg-[#FAF7F2] hover:bg-[#8C7456] hover:text-white border border-[#EBE4D8] text-[#8C7456] rounded-lg transition-all cursor-pointer"
                            title="Download File to Admin Storage"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handlePurgeFile(file.id, file.fileName)}
                            className="p-1.5 bg-white hover:bg-rose-50 border border-rose-200 text-rose-600 rounded-lg transition-all cursor-pointer"
                            title="Purge / Remove File from Transfer Log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredTransferredFiles.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-12 text-[#8B7E70] space-y-2">
                        <FolderArchive className="w-8 h-8 text-stone-300 mx-auto" />
                        <p className="font-bold text-xs text-[#3C352E]">No transferred files match your current filters.</p>
                        <button
                          onClick={() => { setTransferSearchQuery(""); setTransferFileTypeFilter("all"); }}
                          className="text-[11px] text-[#8C7456] underline font-bold cursor-pointer"
                        >
                          Clear search and type filters
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="pt-2 text-[10px] text-[#8B7E70] flex flex-col sm:flex-row items-center justify-between gap-2 border-t border-[#FAF7F2]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Showing {filteredTransferredFiles.length} of {transferredFiles.length} uploaded client files. Chronologically ordered by timestamp.</span>
              </div>
              <span className="font-mono text-[9px] text-[#8C7456] font-bold">
                Admin Console Access Granted • Logged as {currentUser?.email || "Admin"}
              </span>
            </div>

          </div>

        </div>
      )}

      {activeSubTab === 'analytics' && (
        <div className="space-y-6 animate-fadeIn" id="analytics-subtab-view">
          <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-[#FAF7F2] pb-4">
              <div>
                <h3 className="text-base font-serif font-bold text-[#3C352E]">
                  Comparative Revenue & Sales Audit Ledger
                </h3>
                <p className="text-xs text-[#8B7E70] mt-1">
                  Comprehensive performance breakdown contrasting current billing metrics against the previous month benchmark.
                </p>
              </div>
              <button
                onClick={handleDownloadExcelReport}
                className="px-4 py-2 bg-[#8C7456] text-white hover:bg-[#705D44] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Download Ledger (Excel)</span>
              </button>
            </div>

            {/* WEEKLY BREAKDOWN TABLE */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7456]">
                Weekly Ingest & Sales Comparison (June vs. July 2026)
              </h4>
              <div className="overflow-x-auto border border-[#EBE4D8] rounded-xl">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#8C7456] uppercase tracking-wider text-[10px] font-bold">
                      <th className="p-3.5">Time Period</th>
                      <th className="p-3.5">Previous Month (June)</th>
                      <th className="p-3.5">Current Month (July)</th>
                      <th className="p-3.5">Dollar Growth Delta</th>
                      <th className="p-3.5">Percentage Variance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#FAF7F0] text-[#3C352E]">
                    {weeklySalesData.map((row, idx) => {
                      const delta = row.currentMonth - row.previousMonth;
                      const pct = Math.round((delta / row.previousMonth) * 100);
                      return (
                        <tr key={idx} className="hover:bg-[#FAF7F2]/50 transition-colors">
                          <td className="p-3.5 font-semibold text-[#3C352E]">
                            {row.period} <span className="text-[10px] text-[#8B7E70] font-normal">({row.label})</span>
                          </td>
                          <td className="p-3.5 font-mono text-[#8B7E70]">${row.previousMonth.toLocaleString()}</td>
                          <td className="p-3.5 font-mono font-bold text-[#3C352E]">${row.currentMonth.toLocaleString()}</td>
                          <td className="p-3.5 font-mono font-bold text-emerald-700">+${delta.toLocaleString()}</td>
                          <td className="p-3.5">
                            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <ArrowUpRight className="w-3 h-3" />
                              +{pct}%
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    <tr className="bg-[#FAF7F2] font-bold border-t-2 border-[#EBE4D8] text-[#3C352E]">
                      <td className="p-3.5 uppercase tracking-wider text-[11px] text-[#8C7456]">TOTAL MONTHLY SALES</td>
                      <td className="p-3.5 font-mono text-[#8B7E70]">${prevMonthTotal.toLocaleString()}</td>
                      <td className="p-3.5 font-mono font-bold text-[#3C352E]">${currMonthTotal.toLocaleString()}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-700">+${salesDelta.toLocaleString()}</td>
                      <td className="p-3.5">
                        <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <ArrowUpRight className="w-3 h-3" />
                          +{momPercentage}% MoM
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* CATEGORY REVENUE DISTRIBUTION */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7456]">
                Revenue Sector Distribution
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {categorySalesData.map((cat, i) => {
                  const delta = cat.currentMonth - cat.previousMonth;
                  const pct = Math.round((delta / cat.previousMonth) * 100);
                  return (
                    <div key={i} className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-[#3C352E]">
                        <span>{cat.category}</span>
                        <span className="text-emerald-700 text-[10px] font-mono">+{pct}% MoM</span>
                      </div>
                      <div className="flex justify-between items-baseline pt-1">
                        <div>
                          <span className="text-[10px] text-[#8B7E70] uppercase font-mono block">Current</span>
                          <span className="text-base font-serif font-bold text-[#3C352E]">${cat.currentMonth.toLocaleString()}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-[#8B7E70] uppercase font-mono block">Prev Month</span>
                          <span className="text-xs font-mono text-[#8B7E70]">${cat.previousMonth.toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: SERVICES & PRICING */}
      {activeSubTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-6 shadow-xs">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#3C352E]">
                Dynamic Base Contract Modifiers
              </h3>
              <p className="text-xs text-[#8B7E70] mt-1">
                Updating these coordinates recalculates dynamic escrow contract values on client order forms.
              </p>
            </div>

            {pricesSavedMsg && (
              <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4" />
                <span>{pricesSavedMsg}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              <div className="p-5 border border-[#EBE4D8] bg-[#FAF7F2] rounded-xl space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7456]">Premium Photography</span>
                <div>
                  <label className="block text-[10px] text-[#8B7E70] mb-1 font-mono uppercase">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={basePhotographyPrice}
                    onChange={(e) => setBasePhotographyPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 font-bold font-mono text-xs text-[#3C352E]"
                  />
                </div>
                <p className="text-[10px] text-[#8B7E70]">Originally configured at ₹15,000 / hr</p>
              </div>

              <div className="p-5 border border-[#EBE4D8] bg-[#FAF7F2] rounded-xl space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7456]">Cinematic Videography</span>
                <div>
                  <label className="block text-[10px] text-[#8B7E70] mb-1 font-mono uppercase">Hourly Rate (₹)</label>
                  <input
                    type="number"
                    value={baseVideographyPrice}
                    onChange={(e) => setBaseVideographyPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 font-bold font-mono text-xs text-[#3C352E]"
                  />
                </div>
                <p className="text-[10px] text-[#8B7E70]">Originally configured at ₹25,000 / hr</p>
              </div>

              <div className="p-5 border border-[#EBE4D8] bg-[#FAF7F2] rounded-xl space-y-3">
                <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C7456]">Post-Production Edits</span>
                <div>
                  <label className="block text-[10px] text-[#8B7E70] mb-1 font-mono uppercase">Base Project Rate (₹)</label>
                  <input
                    type="number"
                    value={baseEditingPrice}
                    onChange={(e) => setBaseEditingPrice(Number(e.target.value))}
                    className="w-full bg-white border border-[#EBE4D8] rounded-lg px-3 py-2 font-bold font-mono text-xs text-[#3C352E]"
                  />
                </div>
                <p className="text-[10px] text-[#8B7E70]">Originally configured at ₹12,000 / flat</p>
              </div>
            </div>

            <div className="pt-4 border-t border-[#FAF7F2] flex justify-end">
              <button
                type="button"
                onClick={handleSaveRates}
                className="px-5 py-2.5 bg-[#3C352E] hover:bg-[#25211D] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
              >
                Sync Base Rates
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ESCROW AUDITS */}
      {activeSubTab === 'escrow' && (
        <div className="space-y-6">
          <div className="bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center gap-3">
              <Landmark className="w-5 h-5 text-[#8C7456]" />
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#3C352E]">
                  Secure Escrow Bank Accounts Audits
                </h3>
                <p className="text-xs text-[#8B7E70] mt-0.5">
                  Direct ledger showing visual contract vaults, active masked credentials, and cardholder authorization slips.
                </p>
              </div>
            </div>

            <div className="overflow-x-auto text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#FAF7F2] border-b border-[#EBE4D8] text-[#8C7456] uppercase tracking-wider text-[10px] font-bold">
                    <th className="p-4">Audit Trace / Invoice</th>
                    <th className="p-4">Customer Authorized</th>
                    <th className="p-4">Masked Card (Vault Secure)</th>
                    <th className="p-4">Authorized Escrow Capital</th>
                    <th className="p-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#FAF7F0] text-[#3C352E] font-mono text-[11px]">
                  {projects.map((p) => (
                    <tr key={p.id} className="hover:bg-[#FAF7F2]/30">
                      <td className="p-4 font-bold text-xs text-[#3C352E]">
                        TRC-ES-{Math.floor(100000 + Math.random() * 90000)}
                        <span className="block text-[9px] text-[#8B7E70] mt-0.5">{p.invoiceId || "INV-2026-X01"}</span>
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-[#3C352E] font-sans text-xs">{p.clientName}</div>
                        <div className="text-[10px] text-[#8B7E70] mt-0.5">{p.clientEmail}</div>
                      </td>
                      <td className="p-4">
                        <span className="bg-stone-100 px-2 py-1 rounded-md text-stone-700">
                          4022 •••• •••• {Math.floor(1000 + Math.random() * 9000)}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#8C7456] text-xs">₹{p.totalPrice.toFixed(2)}</td>
                      <td className="p-4">
                        {p.status === "completed" ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 font-sans">
                            Disbursed
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-[#FAF6EE] text-[#8C7456] border border-[#EBE4D8] font-sans animate-pulse">
                            Vaulted Locked
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT: ADMIN CONFIGURATION & SETTINGS */}
      {activeSubTab === 'settings' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Left Box: Authorized Emails list */}
            <div className="md:col-span-7 bg-white border border-[#EBE4D8] rounded-2xl p-6 space-y-5 shadow-xs">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#3C352E]">
                  Registered Administrator Passports
                </h3>
                <p className="text-xs text-[#8B7E70] mt-1">
                  Only client accounts authenticated with emails below will have the "Admin Console" panel render in the workspace.
                </p>
              </div>

              <div className="divide-y divide-[#FAF7F2] border border-[#EBE4D8] rounded-xl overflow-hidden text-xs">
                {adminEmails.map((email) => {
                  const isPrimaryUserEmail = email === "aarjavjainn@gmail.com";
                  return (
                    <div key={email} className="flex items-center justify-between p-3.5 bg-stone-50 hover:bg-stone-100/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#8C7456]" />
                        <span className="font-mono font-bold text-[#3C352E]">{email}</span>
                        {isPrimaryUserEmail && (
                          <span className="px-2 py-0.5 text-[8px] bg-red-50 text-red-700 border border-red-200 font-bold uppercase tracking-wider rounded-md">
                            Requested Admin Email
                          </span>
                        )}
                      </div>
                      
                      {!isPrimaryUserEmail && (
                        <button
                          type="button"
                          onClick={() => onRemoveAdminEmail(email)}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Revoke Admin Access"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Add Admin Email Form */}
              <form onSubmit={handleAddEmailSubmit} className="space-y-3 border-t border-[#FAF7F2] pt-4 text-xs">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#8C7456] mb-1">
                    Authorize New Administrator Email
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      placeholder="e.g. testing@creame.studio"
                      value={newAdminEmail}
                      onChange={(e) => setNewAdminEmail(e.target.value)}
                      className="flex-1 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2.5 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2.5 bg-[#8C7456] hover:bg-[#705D44] text-[#FAF7F2] font-semibold text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Authorize Passport
                    </button>
                  </div>
                </div>

                {emailError && (
                  <p className="text-[11px] text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{emailError}</span>
                  </p>
                )}
                {emailSuccess && (
                  <p className="text-[11px] text-emerald-600 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" />
                    <span>{emailSuccess}</span>
                  </p>
                )}
              </form>
            </div>

            {/* Right Box: Simulation Details */}
            <div className="md:col-span-5 bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-6 flex flex-col justify-between shadow-xs">
              <div className="space-y-4 text-xs">
                <div className="flex gap-2 items-center text-[#8C7456] font-bold uppercase tracking-wider">
                  <Lock className="w-4.5 h-4.5" />
                  <span>Interactive Verification</span>
                </div>
                
                <h4 className="text-sm font-medium text-[#3C352E]">Review & Testing Instructions</h4>
                <p className="text-xs text-[#6B6155] leading-relaxed">
                  We have secured the application by strictly restricting access to the specified administrator emails. 
                  When signed in as <strong className="text-[#3C352E]">aarjavjainn@gmail.com</strong>, the 
                  entire workspace layout adapts, opening a red-accented <strong>Admin Console</strong> navigation route.
                </p>

                <div className="bg-white border border-[#EBE4D8] rounded-xl p-4 text-xs space-y-2">
                  <div className="flex justify-between">
                    <span className="text-[#8B7E70]">Current Operator</span>
                    <span className="font-bold text-[#3C352E]">{currentUser?.email || "Signed Out"}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[#8B7E70]">Status ID</span>
                    {adminEmails.includes(currentUser?.email || "") ? (
                      <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold uppercase rounded-md text-[9px]">
                        Admin Approved
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 bg-stone-100 text-[#8B7E70] border border-stone-200 font-bold uppercase rounded-md text-[9px]">
                        General Client
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-[#EBE4D8]/60 text-[10px] text-[#8B7E70] leading-normal italic flex gap-1.5 items-start">
                <ShieldCheck className="w-4 h-4 text-[#8C7456] shrink-0 mt-0.5" />
                <span>Zero-knowledge client data tunnels active in Switzerland. All administrative controls are executed locally.</span>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
