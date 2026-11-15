import React, { useState } from "react";
import { 
  Share2, UploadCloud, MoreVertical, Clock, MessageSquare, 
  Send, Sparkles, Check, Play, FileText, Grid, List, 
  ChevronRight, AlertCircle, Plus, Eye, Download, Video, Trash2
} from "lucide-react";
import { Project, Milestone } from "../types";

interface ProjectsViewProps {
  projects: Project[];
  onUpdateProject: (updated: Project) => void;
  onOpenUploadModal?: () => void;
  onOpenMeetingModal?: () => void;
}

interface AssetFile {
  id: string;
  name: string;
  type: 'video' | 'raw' | 'audio' | 'zip';
  duration?: string;
  size: string;
  date: string;
  status: 'Needs Revision' | 'Awaiting Review' | 'Approved' | 'In Progress';
  revisionCount?: number;
  thumbnailUrl: string;
  videoUrl?: string;
}

interface TimestampComment {
  id: string;
  author: string;
  role: 'client' | 'director' | 'ai';
  avatar?: string;
  timeAgo: string;
  timestampTag?: string; // e.g. "00:45", "01:12", "01:30"
  text: string;
}

export default function ProjectsView({
  projects,
  onUpdateProject,
  onOpenUploadModal,
  onOpenMeetingModal
}: ProjectsViewProps) {
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projects[0]?.id || "proj-101");
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState("");
  const [activeTimestampTag, setActiveTimestampTag] = useState<string | null>("01:15");
  const [isPlayingPreview, setIsPlayingPreview] = useState<string | null>(null);

  // Find active project
  const activeProject = projects.find(p => p.id === selectedProjectId) || projects[0];

  // Assets data for the active project (clean empty start or client uploaded)
  const [assets, setAssets] = useState<AssetFile[]>([]);

  // Mock Timestamped Comments
  const [comments, setComments] = useState<TimestampComment[]>([
    {
      id: "c-1",
      author: "SARAH JENKINS",
      role: "client",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      timeAgo: "2h ago",
      timestampTag: "00:45",
      text: "The color grading looks much better here, but can we warm up the skin tones just a touch in this specific shot?"
    },
    {
      id: "c-2",
      author: "SARAH JENKINS",
      role: "client",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80",
      timeAgo: "2h ago",
      timestampTag: "01:12",
      text: "Cut away to the wide shot slightly earlier, right before the model turns."
    },
    {
      id: "c-3",
      author: "LUMOS AI / CREAME AI",
      role: "ai",
      timeAgo: "1h ago",
      timestampTag: "01:30",
      text: "Audio levels on dialogue track drop below -12dB at 01:30. Recommend dynamic compression & normalization."
    }
  ]);

  // Project Milestones step list
  const milestoneSteps = [
    { key: "concept", label: "CONCEPT", date: "Oct 12", completed: true, active: false },
    { key: "production", label: "PRODUCTION", date: "Oct 28", completed: true, active: false },
    { key: "1st_edit", label: "1ST EDIT", date: "Nov 05", completed: false, active: true },
    { key: "color_grade", label: "COLOR GRADE", date: "Nov 15", completed: false, active: false },
    { key: "delivery", label: "DELIVERY", date: "Nov 20", completed: false, active: false }
  ];

  // Handle adding new comment
  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const newComment: TimestampComment = {
      id: `c-${Date.now()}`,
      author: "JULIAN MERCER",
      role: "client",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80",
      timeAgo: "Just now",
      timestampTag: activeTimestampTag || "01:00",
      text: commentInput.trim()
    };

    setComments(prev => [...prev, newComment]);
    setCommentInput("");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + " MB";
      const newAsset: AssetFile = {
        id: `asset-${Date.now()}`,
        name: file.name,
        type: file.name.endsWith(".zip") ? "zip" : "video",
        size: sizeStr,
        date: "Just now",
        duration: "01:30",
        status: "Awaiting Review",
        thumbnailUrl: "https://images.unsplash.com/photo-1518173946687-a4c8a383392e?w=600&auto=format&fit=crop&q=80"
      };
      setAssets(prev => [newAsset, ...prev]);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6" id="projects-view-root">
      
      {/* TOP PROJECT TITLE & ACTION BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full font-mono">
              IN PROGRESS
            </span>
            <span className="text-[11px] font-mono font-medium text-[#8B7E70]">
              PRJ-2023-089
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#3C352E] tracking-tight">
            {activeProject?.name || "Winter Collection Shoot"}
          </h1>
          <p className="text-xs text-[#6B6155] mt-0.5">
            Client: {activeProject?.clientName || "Alex Rivera"} • Deadline: Nov 20, 2026
          </p>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {onOpenMeetingModal && (
            <button
              onClick={onOpenMeetingModal}
              className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#8C7456] border border-[#EBE4D8] text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Review Call</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => alert("Shareable client review link copied to clipboard!")}
            className="bg-[#FAF7F2] hover:bg-[#F4EFE6] text-[#3C352E] border border-[#EBE4D8] text-[11px] sm:text-xs font-bold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Share2 className="w-3.5 h-3.5 text-[#8C7456]" />
            <span>Share</span>
          </button>
          <label
            htmlFor="project-asset-uploader"
            className="bg-[#3C352E] hover:bg-[#25211D] text-[#FAF7F2] text-[11px] sm:text-xs font-bold px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <UploadCloud className="w-3.5 h-3.5 text-[#FAF7F2]" />
            <span>Upload</span>
            <input 
              type="file" 
              id="project-asset-uploader" 
              className="hidden" 
              onChange={handleFileUpload} 
            />
          </label>
        </div>
      </div>

      {/* PROJECT MILESTONES STEPPER CARD */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs" id="project-milestones-card">
        <div className="flex items-center gap-2 mb-4 sm:mb-6">
          <Sparkles className="w-4 h-4 text-[#8C7456]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-[#3C352E]">Project Milestones</h3>
        </div>

        {/* Milestone Steps Bar */}
        <div className="relative flex items-center justify-between max-w-4xl mx-auto px-2 sm:px-4 py-1 overflow-x-auto">
          {/* Background Connecting Line */}
          <div className="absolute left-6 sm:left-8 right-6 sm:right-8 top-1/2 -translate-y-1/2 h-0.5 bg-[#EBE4D8] z-0"></div>
          {/* Active progress line up to 1st Edit */}
          <div className="absolute left-6 sm:left-8 w-1/2 top-1/2 -translate-y-1/2 h-0.5 bg-[#8C7456] z-0"></div>

          {milestoneSteps.map((step) => {
            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center text-center px-1">
                {step.completed ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-[#8C7456] text-white flex items-center justify-center shadow-xs">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                ) : step.active ? (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-4 border-[#8C7456] shadow-sm flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#8C7456] animate-pulse"></div>
                  </div>
                ) : (
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white border-2 border-[#DCD2C4] flex items-center justify-center">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#DCD2C4]"></div>
                  </div>
                )}

                <span className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-wider mt-1.5 sm:mt-2.5 ${step.active ? "text-[#8C7456]" : step.completed ? "text-[#3C352E]" : "text-[#8B7E70]"}`}>
                  {step.label}
                </span>
                <span className="text-[8px] sm:text-[9px] text-[#8B7E70] font-mono mt-0.5">{step.date}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* MAIN TWO-COLUMN WORKSPACE: ASSET GALLERY & FEEDBACK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* LEFT COLUMN: ASSET GALLERY (8 Cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EBE4D8] shadow-xs">
            
            {/* Gallery Header with Grid/List Toggle & Clear Action */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-[#8C7456]" />
                <h3 className="text-sm font-bold text-[#3C352E]">Asset Gallery</h3>
                <span className="text-xs text-[#8B7E70] font-mono">({assets.length} items)</span>
              </div>

              <div className="flex items-center gap-2">
                {assets.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      setAssets([]);
                      setSelectedAssetId(null);
                    }}
                    className="text-[11px] font-bold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-2.5 py-1 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear All</span>
                  </button>
                )}

                <div className="flex items-center gap-1 bg-[#FAF7F2] p-1 rounded-lg border border-[#EBE4D8]">
                  <button
                    type="button"
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'grid' ? 'bg-white text-[#3C352E] shadow-2xs font-bold' : 'text-[#8B7E70] hover:text-[#3C352E]'}`}
                  >
                    <Grid className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors cursor-pointer ${viewMode === 'list' ? 'bg-white text-[#3C352E] shadow-2xs font-bold' : 'text-[#8B7E70] hover:text-[#3C352E]'}`}
                  >
                    <List className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Drag and Drop Zone */}
            <label 
              htmlFor="gallery-dropzone"
              className="block border-2 border-dashed border-[#DCD2C4] hover:border-[#8C7456] rounded-xl p-6 text-center bg-[#FAF7F2] hover:bg-[#F4EFE6] transition-all cursor-pointer mb-6 group"
            >
              <UploadCloud className="w-8 h-8 text-[#8C7456] mx-auto mb-2 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-bold text-[#3C352E]">
                Drag and drop assets here
              </p>
              <p className="text-[10px] text-[#8B7E70] font-mono mt-1">
                or click to browse files (MP4, MOV, ZIP, ProRes)
              </p>
              <input 
                type="file" 
                id="gallery-dropzone" 
                className="hidden" 
                onChange={handleFileUpload} 
              />
            </label>

            {/* Asset Cards Grid or Empty State */}
            {assets.length === 0 ? (
              <div className="py-12 px-4 text-center rounded-xl bg-[#FAF7F2] border border-[#EBE4D8] space-y-2">
                <FileText className="w-8 h-8 text-[#8C7456]/60 mx-auto" />
                <p className="text-xs font-bold text-[#3C352E]">No assets in gallery</p>
                <p className="text-[11px] text-[#8B7E70] max-w-sm mx-auto">
                  Drag and drop footage or project archives above to populate the review gallery and invite timecoded feedback.
                </p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-4" : "space-y-3"}>
                {assets.map(asset => {
                  const isSelected = selectedAssetId === asset.id;
                  return (
                    <div
                      key={asset.id}
                      onClick={() => setSelectedAssetId(asset.id)}
                      className={`group bg-[#FAF7F2] border rounded-xl overflow-hidden cursor-pointer transition-all hover:shadow-md relative ${
                        isSelected ? "border-[#8C7456] ring-2 ring-[#8C7456]/20 bg-white" : "border-[#EBE4D8] hover:border-[#8C7456]/50"
                      }`}
                    >
                      {/* Video Thumbnail with overlay */}
                      <div className="relative aspect-video bg-[#25211D] overflow-hidden">
                        <img 
                          src={asset.thumbnailUrl} 
                          alt={asset.name} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 opacity-90"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>

                        {/* Duration pill */}
                        {asset.duration && (
                          <span className="absolute bottom-2 left-2 bg-black/70 text-white font-mono text-[9px] font-bold px-1.5 py-0.5 rounded">
                            {asset.duration}
                          </span>
                        )}

                        {/* Delete Asset Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setAssets(prev => prev.filter(a => a.id !== asset.id));
                            if (selectedAssetId === asset.id) setSelectedAssetId(null);
                          }}
                          className="absolute top-2 right-2 bg-black/60 hover:bg-rose-600 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-xs cursor-pointer"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>

                        {/* Play Hover Button */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 pointer-events-none">
                          <div className="w-10 h-10 rounded-full bg-white/90 text-[#3C352E] flex items-center justify-center shadow-lg">
                            <Play className="w-4 h-4 ml-0.5 fill-[#3C352E]" />
                          </div>
                        </div>
                      </div>

                      {/* Metadata footer */}
                      <div className="p-3.5 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-xs font-bold text-[#3C352E] truncate font-mono" title={asset.name}>
                            {asset.name}
                          </h4>
                          <span className="font-mono text-[10px] text-[#8B7E70]">{asset.size}</span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] text-[#8B7E70]">
                          <span className="font-mono">{asset.date}</span>
                          <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[8px] font-mono ${
                            asset.status === 'Needs Revision' 
                              ? 'bg-rose-100 text-rose-800 border border-rose-200' 
                              : asset.status === 'Awaiting Review'
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}>
                            ● {asset.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* RIGHT COLUMN: FEEDBACK & TIMESTAMPED COMMENTS (4 Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-[#EBE4D8] shadow-xs flex flex-col h-full min-h-[520px]">
            
            {/* Feedback Header */}
            <div className="flex items-center justify-between pb-3 border-b border-[#EBE4D8] mb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#8C7456]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#3C352E]">Feedback</h3>
              </div>
              <span className="bg-[#FAF7F2] border border-[#EBE4D8] text-[#8C7456] text-[10px] font-bold font-mono px-2 py-0.5 rounded-md">
                v2_Edit.mp4
              </span>
            </div>

            {/* Comment Stream */}
            <div className="space-y-3.5 flex-1 overflow-y-auto pr-1">
              {comments.map(c => {
                const isAi = c.role === 'ai';
                return (
                  <div 
                    key={c.id} 
                    className={`p-3 rounded-xl border text-xs space-y-1.5 transition-all ${
                      isAi 
                        ? 'bg-amber-50/70 border-amber-200/80 text-amber-950' 
                        : 'bg-[#FAF7F2] border-[#EBE4D8] text-[#3C352E]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {isAi ? (
                          <div className="w-5 h-5 rounded-full bg-[#8C7456] text-white flex items-center justify-center text-[9px] font-bold">
                            ✨
                          </div>
                        ) : (
                          <img 
                            src={c.avatar} 
                            alt={c.author} 
                            className="w-5 h-5 rounded-full object-cover border border-[#EBE4D8]"
                          />
                        )}
                        <span className="font-bold text-[10px] uppercase tracking-wider font-mono">
                          {c.author}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#8B7E70] font-mono">{c.timeAgo}</span>
                    </div>

                    {c.timestampTag && (
                      <div className="inline-flex items-center gap-1 bg-white border border-[#EBE4D8] text-[#8C7456] font-mono text-[9px] font-bold px-1.5 py-0.5 rounded cursor-pointer hover:border-[#8C7456]">
                        <Clock className="w-2.5 h-2.5" />
                        <span>{c.timestampTag}</span>
                      </div>
                    )}

                    <p className="text-[11px] leading-relaxed text-[#3C352E]">
                      {c.text}
                    </p>
                  </div>
                );
              })}
            </div>

            {/* Comment Input Footer with Timestamp insertion */}
            <form onSubmit={handleAddComment} className="pt-3 border-t border-[#EBE4D8] mt-3 space-y-2">
              <div className="flex items-center justify-between text-[10px] text-[#8B7E70]">
                <span>Add timestamped note</span>
                <button
                  type="button"
                  onClick={() => setActiveTimestampTag(activeTimestampTag === "01:15" ? "00:50" : "01:15")}
                  className="bg-[#FAF7F2] hover:bg-[#EBE4D8] text-[#8C7456] px-1.5 py-0.5 rounded font-mono font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Clock className="w-2.5 h-2.5" />
                  <span>{activeTimestampTag || "01:00"}</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={commentInput}
                  onChange={(e) => setCommentInput(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl px-3 py-2 text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
                />
                <button
                  type="submit"
                  disabled={!commentInput.trim()}
                  className="bg-[#3C352E] hover:bg-[#25211D] disabled:opacity-40 text-white p-2.5 rounded-xl cursor-pointer transition-all shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>

          </div>
        </div>

      </div>

    </div>
  );
}
