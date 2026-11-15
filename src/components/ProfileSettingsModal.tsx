import React, { useState, useRef } from "react";
import { 
  User, Camera, Upload, Check, X, Sparkles, Image as ImageIcon, 
  RefreshCw, ShieldCheck, Mail
} from "lucide-react";

interface ProfileSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: { name: string; email: string; avatarUrl?: string } | null;
  onSaveProfile: (updated: { name: string; email: string; avatarUrl?: string }) => void;
}

const PRESET_AVATARS = [
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
];

export default function ProfileSettingsModal({
  isOpen,
  onClose,
  currentUser,
  onSaveProfile
}: ProfileSettingsModalProps) {
  const [name, setName] = useState(currentUser?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(currentUser?.avatarUrl || PRESET_AVATARS[0]);
  const [customUrlInput, setCustomUrlInput] = useState("");
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [uploadSuccessToast, setUploadSuccessToast] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  // Handle local file upload (converts safe image types to data URL preview)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMessage(null);
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      setErrorMessage("Only JPG, PNG, WEBP, or GIF images are allowed.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Please upload an image smaller than 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === "string" && event.target.result.startsWith("data:image/")) {
        setAvatarUrl(event.target.result);
        setUploadSuccessToast(true);
        setTimeout(() => setUploadSuccessToast(false), 2500);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCustomUrl = () => {
    setErrorMessage(null);
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    try {
      const parsed = new URL(trimmed);
      if (parsed.protocol !== "https:") {
        setErrorMessage("Only secure HTTPS (https://) image URLs are allowed.");
        return;
      }
      setAvatarUrl(parsed.toString());
      setCustomUrlInput("");
      setShowUrlInput(false);
      setUploadSuccessToast(true);
      setTimeout(() => setUploadSuccessToast(false), 2500);
    } catch {
      setErrorMessage("Please enter a valid https:// image URL.");
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser?.email) return;
    onSaveProfile({
      name: name.trim() || "Studio Member",
      email: currentUser.email,
      avatarUrl
    });
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn"
      id="profile-settings-overlay"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-3xl max-w-lg w-full shadow-2xl overflow-hidden relative p-6 sm:p-7 space-y-5"
        id="profile-settings-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EBE4D8]/80 pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-white border border-[#EBE4D8] flex items-center justify-center text-[#8C7456] shadow-2xs">
              <Camera className="w-4 h-4 text-[#8C7456]" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-[#3C352E]">Edit Profile & Avatar</h3>
              <p className="text-[11px] text-[#6B6155]">Change your studio profile photo, name, and details.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[#8B7E70] hover:bg-white hover:text-[#3C352E] border border-transparent hover:border-[#EBE4D8] transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {uploadSuccessToast && (
          <div className="p-2.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Profile avatar updated successfully!</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl flex items-center gap-2 animate-fadeIn">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Avatar Preview & Quick Actions */}
        <div className="bg-white p-4 sm:p-5 rounded-2xl border border-[#EBE4D8] shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            {/* Active Preview */}
            <div className="relative group shrink-0">
              <img 
                src={avatarUrl} 
                alt="Profile Preview" 
                className="w-20 h-20 sm:w-22 sm:h-22 rounded-2xl object-cover border-2 border-[#8C7456] shadow-sm"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer text-[10px] font-bold"
              >
                <Camera className="w-4 h-4 mb-0.5" />
                <span>Upload</span>
              </button>
            </div>

            {/* Upload Buttons */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div>
                <span className="text-xs font-bold text-[#3C352E] block font-mono uppercase tracking-wider">
                  Custom Studio Avatar
                </span>
                <p className="text-[11px] text-[#8B7E70]">
                  Supports JPG, PNG, WEBP, or direct image URL.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pt-1 justify-center sm:justify-start">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileUpload} 
                  accept="image/*" 
                  className="hidden" 
                />
                
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs transition-colors"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Photo</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowUrlInput(!showUrlInput)}
                  className="px-3 py-1.5 bg-[#FAF7F2] hover:bg-[#F4EFE6] border border-[#EBE4D8] text-[#3C352E] text-xs font-bold rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <ImageIcon className="w-3.5 h-3.5 text-[#8C7456]" />
                  <span>Paste URL</span>
                </button>
              </div>
            </div>
          </div>

          {/* Paste Image URL Input */}
          {showUrlInput && (
            <div className="pt-2 border-t border-[#EBE4D8]/80 flex gap-2">
              <input 
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={customUrlInput}
                onChange={(e) => setCustomUrlInput(e.target.value)}
                className="flex-1 px-3 py-1.5 bg-[#FAF7F2] border border-[#EBE4D8] rounded-xl text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
              />
              <button
                type="button"
                onClick={handleApplyCustomUrl}
                className="px-3 py-1.5 bg-[#8C7456] text-white rounded-xl text-xs font-bold hover:bg-[#786348] cursor-pointer"
              >
                Apply
              </button>
            </div>
          )}

          {/* Preset Studio Avatars */}
          <div className="pt-3 border-t border-[#EBE4D8]/80">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7456] block mb-2">
              Or pick from studio presets
            </span>
            <div className="grid grid-cols-6 gap-2">
              {PRESET_AVATARS.map((preset, idx) => {
                const isSelected = avatarUrl === preset;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setAvatarUrl(preset)}
                    className={`relative rounded-xl overflow-hidden border-2 transition-all cursor-pointer aspect-square ${
                      isSelected ? "border-[#8C7456] ring-2 ring-[#8C7456]/40 scale-105" : "border-transparent opacity-75 hover:opacity-100"
                    }`}
                  >
                    <img src={preset} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-[#8C7456]/30 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-white stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* User Info Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" id="profile-info-form">
          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7456]">
              Display Name
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-[#8B7E70] absolute left-3.5 top-2.5" />
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your Name"
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#EBE4D8] rounded-xl text-xs text-[#3C352E] focus:outline-hidden focus:border-[#8C7456]"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#8C7456] flex items-center justify-between">
              <span>Verified Email Address</span>
              <span className="text-[9px] text-[#8B7E70] font-normal">Locked</span>
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#8B7E70] absolute left-3.5 top-2.5" />
              <input 
                type="email"
                readOnly
                disabled
                value={currentUser?.email || ""}
                className="w-full pl-10 pr-3.5 py-2 bg-[#EBE4D8]/40 border border-[#EBE4D8] rounded-xl text-xs text-[#6B6155] cursor-not-allowed"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-white hover:bg-[#FAF7F2] border border-[#EBE4D8] text-[#3C352E] text-xs font-bold rounded-xl cursor-pointer transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 bg-[#3C352E] hover:bg-[#25211D] text-white text-xs font-bold rounded-xl cursor-pointer shadow-xs transition-colors"
            >
              Save Changes
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
