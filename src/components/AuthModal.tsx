import React, { useState, useEffect } from "react";
import { 
  X, Lock, Mail, User, Sparkles, ShieldCheck, ArrowRight, 
  CheckCircle2, AlertCircle, Eye, EyeOff, KeyRound
} from "lucide-react";
import { AuthenticatedUser, authenticateWithEmail } from "../services/apiClient";

export type { AuthenticatedUser };

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: AuthenticatedUser) => void;
  initialMode?: 'signin' | 'signup';
}

export default function AuthModal({ 
  isOpen, 
  onClose, 
  onLoginSuccess,
  initialMode = 'signin' 
}: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot'>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMessage(null);
      setSuccessMessage(null);
    }
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (mode === 'forgot') {
      setSuccessMessage("For account recovery, please schedule a verified 1-on-1 Discovery Call or contact your studio administrator.");
      return;
    }

    if (mode === 'signup' && password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please check and re-enter.");
      return;
    }

    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters for strong security.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await authenticateWithEmail({
        action: mode === "signup" ? "signup" : "login",
        email: email.trim(),
        password,
        name: name.trim(),
      });

      if (!result.ok || !result.user) {
        setErrorMessage(result.error || "Authentication failed. Please check your credentials.");
        return;
      }

      setPassword("");
      setConfirmPassword("");
      onLoginSuccess(result.user);
      onClose();
    } catch {
      setErrorMessage("Connection error. Please verify the backend server is running and retry.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fadeIn" 
      id="auth-modal-overlay"
      onClick={onClose}
    >
      <div 
        className="bg-[#FAF7F2] border border-[#EBE4D8] rounded-3xl max-w-md w-full shadow-2xl overflow-hidden relative p-6 sm:p-8 space-y-5"
        id="auth-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button 
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 p-2 rounded-full text-[#8B7E70] hover:bg-white hover:text-[#3C352E] border border-transparent hover:border-[#EBE4D8] transition-all cursor-pointer"
          id="btn-close-auth"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pt-1">
          <div className="w-11 h-11 rounded-2xl bg-white border border-[#EBE4D8] shadow-xs flex items-center justify-center mx-auto text-[#8C7456]">
            <Sparkles className="w-5 h-5 text-[#8C7456]" />
          </div>
          <div>
            <h3 className="font-serif text-2xl font-bold text-[#3C352E] tracking-tight">
              {mode === 'signup' 
                ? "Create Studio Account" 
                : mode === 'forgot' 
                  ? "Account Recovery" 
                  : "Welcome to ProStudio"}
            </h3>
            <p className="text-xs text-[#6B6155] mt-0.5">
              {mode === 'signup' 
                ? "Create a password-protected studio account (8+ characters)." 
                : mode === 'forgot'
                  ? "Verify your identity with studio support to restore access."
                  : "Sign in securely via HTTPS with your verified studio credentials."}
            </p>
          </div>
        </div>

        {/* Mode Switcher Tabs */}
        {mode !== 'forgot' && (
          <div className="grid grid-cols-2 p-1 bg-[#EBE4D8]/60 rounded-xl text-xs font-bold font-mono">
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signin' 
                  ? 'bg-white text-[#3C352E] shadow-2xs' 
                  : 'text-[#6B6155] hover:text-[#3C352E]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setErrorMessage(null); }}
              className={`py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'signup' 
                  ? 'bg-white text-[#3C352E] shadow-2xs' 
                  : 'text-[#6B6155] hover:text-[#3C352E]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* Error / Success Notifications */}
        {errorMessage && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Email & Password Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-3" id="auth-email-form">
          {mode === 'signup' && (
            <div className="space-y-1" id="auth-name-group">
              <label className="text-[10px] font-bold text-[#8C7456] uppercase tracking-wider font-mono">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8B7E70]" />
                <input 
                  type="text"
                  required
                  placeholder="Your Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#EBE4D8] text-xs rounded-xl focus:outline-hidden focus:border-[#8C7456] text-[#3C352E] placeholder:text-[#8B7E70]/60"
                />
              </div>
            </div>
          )}

          <div className="space-y-1" id="auth-email-group">
            <label className="text-[10px] font-bold text-[#8C7456] uppercase tracking-wider font-mono">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8B7E70]" />
              <input 
                type="email"
                required
                placeholder="your.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#EBE4D8] text-xs rounded-xl focus:outline-hidden focus:border-[#8C7456] text-[#3C352E] placeholder:text-[#8B7E70]/60"
              />
            </div>
          </div>

          {mode !== 'forgot' && (
            <div className="space-y-1" id="auth-password-group">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-[#8C7456] uppercase tracking-wider font-mono">
                  Password
                </label>
                {mode === 'signin' && (
                  <button
                    type="button"
                    onClick={() => { setMode('forgot'); setErrorMessage(null); }}
                    className="text-[10px] text-[#8C7456] hover:underline cursor-pointer font-medium"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8B7E70]" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2 bg-white border border-[#EBE4D8] text-xs rounded-xl focus:outline-hidden focus:border-[#8C7456] text-[#3C352E] placeholder:text-[#8B7E70]/60 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-[#8B7E70] hover:text-[#3C352E] cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          )}

          {mode === 'signup' && (
            <div className="space-y-1" id="auth-confirm-password-group">
              <label className="text-[10px] font-bold text-[#8C7456] uppercase tracking-wider font-mono">
                Confirm Password
              </label>
              <div className="relative">
                <KeyRound className="absolute left-3.5 top-2.5 w-4 h-4 text-[#8B7E70]" />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2 bg-white border border-[#EBE4D8] text-xs rounded-xl focus:outline-hidden focus:border-[#8C7456] text-[#3C352E] placeholder:text-[#8B7E70]/60 font-mono"
                />
              </div>
            </div>
          )}

          {mode === 'signin' && (
            <div className="flex items-center gap-2 pt-0.5">
              <input
                type="checkbox"
                id="remember-me-checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-3.5 h-3.5 rounded border-[#EBE4D8] text-[#8C7456] focus:ring-[#8C7456] cursor-pointer accent-[#8C7456]"
              />
              <label htmlFor="remember-me-checkbox" className="text-[11px] text-[#6B6155] cursor-pointer select-none">
                Remember this device for 30 days
              </label>
            </div>
          )}

          {/* Action Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-2 py-2.5 bg-[#3C352E] hover:bg-[#25211D] disabled:bg-gray-400 text-white font-bold text-xs tracking-wider uppercase rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            id="btn-submit-auth"
          >
            {isLoading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>Authenticating...</span>
              </>
            ) : (
              <>
                <span>
                  {mode === 'signup' 
                    ? "Create Account" 
                    : mode === 'forgot' 
                      ? "View Recovery Info" 
                      : "Sign In"}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer toggles & info */}
        <div className="pt-2 border-t border-[#EBE4D8]/80 text-center space-y-2 text-xs">
          {mode === 'forgot' ? (
            <button
              type="button"
              onClick={() => { setMode('signin'); setErrorMessage(null); }}
              className="text-[#8C7456] hover:underline font-bold cursor-pointer"
            >
              ← Back to Sign In
            </button>
          ) : (
            <p className="text-[#6B6155]">
              {mode === 'signup' ? "Already registered with ProStudio? " : "Don't have an account yet? "}
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signup' ? 'signin' : 'signup');
                  setErrorMessage(null);
                }}
                className="font-bold text-[#8C7456] hover:underline cursor-pointer"
              >
                {mode === 'signup' ? "Sign In" : "Sign Up"}
              </button>
            </p>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8B7E70] pt-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>End-to-end encrypted session credentials</span>
          </div>
        </div>

      </div>
    </div>
  );
}
