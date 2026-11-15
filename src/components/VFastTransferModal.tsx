import React, { useState } from "react";
import { Clock, Copy, Check, ExternalLink, Trash2, Download, ShieldCheck, Share2, FileVideo, FileImage, FileText, AlertCircle, RefreshCw } from "lucide-react";

interface VFastFile {
  name: string;
  size: string;
  type?: string;
}

interface VFastTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialFiles?: VFastFile[];
  projectName?: string;
}

export default function VFastTransferModal({
  isOpen,
  onClose,
  initialFiles = [],
  projectName = "Creative Media Package"
}: VFastTransferModalProps) {
  const [files, setFiles] = useState<VFastFile[]>(
    initialFiles.length > 0 
      ? initialFiles 
      : [
          { name: "A-Roll_Raw_4K_001.MOV", size: "4.2 GB", type: "video" },
          { name: "B-Roll_Drone_30fps.MOV", size: "2.8 GB", type: "video" },
          { name: "Color_Grade_LUT_Master.cube", size: "12 MB", type: "other" },
          { name: "Editorial_Selects_RAW_01.CR3", size: "48 MB", type: "image" }
        ]
  );

  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"generator" | "receiver_portal">("generator");
  const [generatedId] = useState(() => "vf-" + Math.random().toString(36).substring(2, 9));
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  if (!isOpen) return null;

  const createdDate = new Date();
  const expiryDate = new Date(createdDate.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days later
  const shareUrl = `https://vfast.creame.studio/transfer/${generatedId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSimulateAddFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setUploadProgress(0);
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev === null || prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 25;
        });
      }, 150);

      setTimeout(() => {
        const fileList: VFastFile[] = Array.from(e.target.files!).map((f: File) => ({
          name: f.name,
          size: (f.size / (1024 * 1024)).toFixed(1) + " MB",
          type: f.type.includes("image") ? "image" : f.type.includes("video") ? "video" : "other"
        }));
        setFiles((prev) => [...prev, ...fileList]);
        setUploadProgress(null);
      }, 800);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDownloadBundleZip = () => {
    const manifestText = `====================================================
BEIGE CREAME MEDIA - V-FAST EPHEMERAL TRANSFER MANIFEST
====================================================
Transfer ID    : ${generatedId}
Package Name   : ${projectName}
Created On     : ${createdDate.toLocaleString()}
Auto-Purge Date: ${expiryDate.toLocaleString()} (Strict 7-Day Expiry)
Status         : SECURED & ACTIVE

FILE INVENTORY (${files.length} ITEMS):
----------------------------------------------------
${files.map((f, i) => `${i + 1}. ${f.name} [${f.size}]`).join("\n")}

====================================================
EXPIRATION NOTICE:
This transfer link and all associated raw binary assets 
will be automatically and permanently wiped from both client
and studio servers on ${expiryDate.toLocaleDateString()}.
====================================================`;

    const blob = new Blob([manifestText], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `VFast-${generatedId}-${projectName.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" id="vfast-modal-overlay">
      <div className="bg-[#FDFBF7] border border-[#EBE4D8] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl p-6 md:p-8 space-y-6 relative" id="vfast-modal-card">
        
        {/* Top Header Badge */}
        <div className="flex justify-between items-start border-b border-[#F2ECE0] pb-5">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-900 text-[10px] font-bold uppercase tracking-wider">
              <Share2 className="w-3 h-3 text-amber-700" />
              <span>V-Fast Ephemeral Share Link</span>
            </div>
            <h3 className="text-xl md:text-2xl font-serif text-[#3C352E]">
              7-Day Auto-Expiring Transfer
            </h3>
            <p className="text-xs text-[#6B6155]">
              Share high-res raw footage & project bundles instantly without clogging server storage.
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#FAF7F2] border border-[#EBE4D8] text-[#8B7E70] hover:text-[#3C352E] flex items-center justify-center text-xs cursor-pointer hover:bg-stone-100 transition-all"
          >
            ✕
          </button>
        </div>

        {/* Tab Switcher: Link Generator vs Receiver Portal Simulation */}
        <div className="flex bg-[#FAF7F2] p-1 rounded-xl border border-[#EBE4D8] text-xs font-semibold">
          <button
            onClick={() => setActiveTab("generator")}
            className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "generator"
                ? "bg-[#3C352E] text-white shadow-xs"
                : "text-[#6B6155] hover:text-[#3C352E]"
            }`}
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>Link Creator & Files</span>
          </button>
          <button
            onClick={() => setActiveTab("receiver_portal")}
            className={`flex-1 py-2 px-3 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === "receiver_portal"
                ? "bg-[#3C352E] text-white shadow-xs"
                : "text-[#6B6155] hover:text-[#3C352E]"
            }`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Receiver View Portal</span>
          </button>
        </div>

        {/* TAB 1: GENERATOR VIEW */}
        {activeTab === "generator" && (
          <div className="space-y-5">
            {/* Share Link Banner */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-2xl p-4 space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[#3C352E] uppercase tracking-wider text-[10px]">Your Ephemeral Transfer Link</span>
                <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  7 Days Active
                </span>
              </div>

              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="flex-1 bg-white border border-[#EBE4D8] rounded-xl px-3.5 py-2.5 text-xs font-mono text-[#3C352E] select-all focus:outline-hidden"
                />
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-4 py-2.5 bg-[#8C7456] hover:bg-[#705D44] text-white rounded-xl text-xs font-semibold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              {/* Countdown Bar */}
              <div className="pt-2 border-t border-[#EBE4D8]/60 flex flex-col sm:flex-row justify-between text-[11px] text-[#6B6155] gap-2">
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#8C7456]" />
                  <span>Auto-Deletes on <strong className="text-[#3C352E]">{expiryDate.toLocaleDateString()} at {expiryDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
                </div>
                <span className="font-mono text-[10px] text-[#8C7456] font-bold">168 Hours Remaining</span>
              </div>
            </div>

            {/* File List in Transfer Package */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-xs">
                <h4 className="font-semibold text-[#3C352E] uppercase tracking-wider text-[10px]">
                  Files in this Transfer ({files.length})
                </h4>
                <label
                  htmlFor="vfast-add-files"
                  className="text-[10px] font-bold text-[#8C7456] hover:underline cursor-pointer flex items-center gap-1"
                >
                  + Add More Files
                  <input
                    type="file"
                    id="vfast-add-files"
                    multiple
                    className="hidden"
                    onChange={handleSimulateAddFile}
                  />
                </label>
              </div>

              {uploadProgress !== null && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 space-y-1">
                  <div className="flex justify-between text-[10px] font-bold text-amber-900">
                    <span>Packaging media files...</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-amber-200 h-1 rounded-full overflow-hidden">
                    <div className="bg-amber-800 h-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                  </div>
                </div>
              )}

              <div className="border border-[#EBE4D8] rounded-xl overflow-hidden bg-white divide-y divide-[#FAF7F0] max-h-48 overflow-y-auto">
                {files.map((file, idx) => (
                  <div key={idx} className="p-3 flex items-center justify-between text-xs hover:bg-[#FAF7F2] transition-colors">
                    <div className="flex items-center gap-2.5 truncate max-w-[80%]">
                      {file.type === "video" ? (
                        <FileVideo className="w-4 h-4 text-[#8C7456] shrink-0" />
                      ) : file.type === "image" ? (
                        <FileImage className="w-4 h-4 text-amber-700 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-stone-500 shrink-0" />
                      )}
                      <span className="font-mono font-medium text-[#3C352E] truncate">{file.name}</span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono text-[11px] text-[#8B7E70]">{file.size}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(idx)}
                        className="text-stone-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Automatic Deletion Policy Guarantee */}
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4 flex items-start gap-3 text-xs text-[#6B6155]">
              <ShieldCheck className="w-5 h-5 text-[#8C7456] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h5 className="font-bold text-[#3C352E] text-[11px]">7-Day Strict Ephemeral Rule</h5>
                <p className="text-[11px] leading-relaxed">
                  Both client and admin can download raw files within 7 days. At 168 hours mark, the URL invalidates and storage objects automatically self-destruct from both studio servers and client cache.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATED RECEIVER VIEW */}
        {activeTab === "receiver_portal" && (
          <div className="space-y-5 bg-white border border-[#EBE4D8] rounded-2xl p-5">
            <div className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl p-4 text-center space-y-2">
              <span className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#8C7456]">
                Recipient Transfer Download Portal
              </span>
              <h4 className="text-xl font-serif text-[#3C352E]">
                {projectName}
              </h4>
              <p className="text-xs text-[#8B7E70]">
                Sent via Creame Studio V-Fast • {files.length} Files Ready
              </p>

              <div className="inline-flex items-center gap-1 px-3 py-1 bg-amber-100 text-amber-900 border border-amber-200 rounded-full text-[10px] font-bold">
                <Clock className="w-3 h-3" />
                <span>Link self-destructs in 7 days ({expiryDate.toLocaleDateString()})</span>
              </div>
            </div>

            {/* Recipient file list */}
            <div className="space-y-2 text-xs">
              <h5 className="font-bold uppercase tracking-wider text-[10px] text-[#8C7456]">
                Package Contents
              </h5>
              <div className="border border-[#EBE4D8] rounded-xl divide-y divide-[#FAF7F0] overflow-hidden">
                {files.map((f, i) => (
                  <div key={i} className="p-3 flex justify-between items-center hover:bg-[#FAF7F2]">
                    <div className="font-mono text-[#3C352E] truncate max-w-[220px]">
                      {f.name}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[#8B7E70] text-[11px]">{f.size}</span>
                      <button
                        type="button"
                        onClick={handleDownloadBundleZip}
                        className="px-2.5 py-1 bg-[#FAF7F2] hover:bg-[#8C7456] hover:text-white border border-[#EBE4D8] text-[#8C7456] rounded-lg text-[10px] font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        <span>Download</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={handleDownloadBundleZip}
              className="w-full py-3 bg-[#8C7456] hover:bg-[#705D44] text-white font-semibold text-xs uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Download Entire Package (.ZIP)</span>
            </button>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="flex justify-between items-center pt-4 border-t border-[#F2ECE0]">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8B7E70]">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>V-Fast Powered</span>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDownloadBundleZip}
              className="px-4 py-2 border border-[#D8CDBA] hover:bg-[#FAF7F2] text-[#5C5348] text-xs font-medium uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Manifest</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 bg-[#3C352E] hover:bg-[#2A2520] text-white text-xs font-medium uppercase tracking-wider rounded-xl transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
