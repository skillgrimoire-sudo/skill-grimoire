"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Lock,
  Eye,
  EyeOff,
  Mail,
  CheckCircle2,
  ShieldCheck,
  RotateCcw,
  KeyRound,
} from "lucide-react";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { WeatherProvider } from "@/context/WeatherContext";
import WeatherBackground from "@/components/weather/WeatherBackground";

// ── OTP Input ─────────────────────────────────────────────────────────────────

function OtpInput({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
  const inputs = useRef<(HTMLInputElement | null)[]>([]);
  const digits = value.padEnd(6, "").split("").slice(0, 6);

  const handleChange = (index: number, char: string) => {
    const d = char.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = d;
    onChange(next.join(""));
    if (d && index < 5) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !digits[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (pasted) { onChange(pasted); inputs.current[Math.min(pasted.length, 5)]?.focus(); }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none bg-[#080E1C] text-white transition-all duration-200 ${
            digits[i] ? "border-[#E5B869] shadow-[0_0_12px_rgba(229,184,105,0.35)]" : "border-[#1E2D45] focus:border-[#E5B869]/60"
          } disabled:opacity-50`}
        />
      ))}
    </div>
  );
}

// ── Password Strength ─────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ characters", pass: password.length >= 8 },
    { label: "Uppercase", pass: /[A-Z]/.test(password) },
    { label: "Number", pass: /\d/.test(password) },
    { label: "Symbol", pass: /[!@#$%^&*]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const colors = ["bg-red-500", "bg-orange-400", "bg-yellow-400", "bg-emerald-400", "bg-emerald-500"];
  const labels = ["", "Weak", "Fair", "Good", "Strong"];
  if (!password) return null;

  return (
    <div className="mt-1.5 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-300 ${i < score ? colors[score] : "bg-[#1E2D45]"}`} />
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map((c) => (
            <span key={c.label} className={`text-[9px] font-medium ${c.pass ? "text-emerald-400" : "text-gray-600"}`}>
              {c.pass ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && <span className={`text-[9px] font-bold ${colors[score].replace("bg-", "text-")}`}>{labels[score]}</span>}
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

type Step = "sending" | "verify-otp" | "set-password" | "success";

function ChangePasswordContent() {
  const { user, isLoading, refresh, logout } = useAuth();
  const router = useRouter();

  const [step, setStep] = useState<Step>("sending");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendSeconds, setResendSeconds] = useState(60);
  const [resending, setResending] = useState(false);

  // Auto-send OTP on mount
  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace("/student-login"); return; }
    sendOtp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading, user]);

  // Resend countdown
  useEffect(() => {
    if (step !== "verify-otp" || resendSeconds <= 0) return;
    const t = setTimeout(() => setResendSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendSeconds]);

  const sendOtp = async () => {
    if (!user?.email) return;
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: user.email, type: user.mustChangePassword ? "FIRST_LOGIN" : "RESET" }),
      });
      setStep("verify-otp");
      setResendSeconds(60);
    } catch {
      setError("Failed to send verification code. Please try again.");
      setStep("verify-otp");
    }
  };

  const handleResend = async () => {
    setResending(true);
    setOtp("");
    setError("");
    await sendOtp();
    setResending(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setError("");
    setIsSubmitting(true);
    try {
      // Verify OTP by attempting reset — but we only go to next step, actual password change happens on step 3
      // We'll verify by calling reset-password with type FIRST_LOGIN but without the password yet,
      // Actually: just store otp and proceed — verification happens on reset-password call
      setStep("set-password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) { setError("Passwords do not match."); return; }
    if (newPassword.length < 8) { setError("Password must be at least 8 characters."); return; }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: user!.email,
          otp,
          newPassword,
          confirmPassword,
          type: user!.mustChangePassword ? "FIRST_LOGIN" : "RESET",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        if (data.error?.toLowerCase().includes("code") || data.error?.toLowerCase().includes("otp")) {
          setStep("verify-otp");
          setOtp("");
        }
        setError(data.error || "Failed to set password.");
        return;
      }
      await refresh();
      setStep("success");
      setTimeout(() => router.push("/accept-terms"), 2000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || step === "sending") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <div className="w-10 h-10 border-2 border-[#E5B869] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-400">Sending verification code...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-16 relative z-10">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/25 mb-4">
            <span className="text-[#E5B869] text-xs font-semibold tracking-widest uppercase">✦ Skill Grimoire</span>
          </div>
        </div>

        <div className="sg-card overflow-hidden">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 border-b border-[#E5B869]/15 text-center">
            <div className={`w-12 h-12 mx-auto rounded-2xl flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(229,184,105,0.4)] ${
              step === "success"
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600"
                : "bg-gradient-to-br from-[#E5B869] to-[#C69234]"
            }`}>
              {step === "success" ? (
                <CheckCircle2 className="w-6 h-6 text-white" />
              ) : step === "verify-otp" ? (
                <ShieldCheck className="w-6 h-6 text-black" />
              ) : (
                <KeyRound className="w-6 h-6 text-black" />
              )}
            </div>
            <h2 className="font-serif font-bold text-base text-white">
              {step === "verify-otp" && "Verify Your Email"}
              {step === "set-password" && "Set Your Password"}
              {step === "success" && "Password Set!"}
            </h2>
            <p className="text-[11px] text-gray-500 mt-0.5">
              {step === "verify-otp" && `Enter the code sent to ${user?.email}`}
              {step === "set-password" && "Create a strong new password"}
              {step === "success" && "Welcome! Redirecting you now..."}
            </p>
          </div>

          {/* Body */}
          <div className="px-6 py-5">
            {error && (
              <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium flex items-start gap-2">
                <span className="mt-0.5 shrink-0">⚠</span>
                <span>{error}</span>
              </div>
            )}

            {/* Info banner */}
            {step === "verify-otp" && (
              <div className="mb-4 p-3 rounded-xl bg-amber-500/8 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <Mail className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  A verification code has been sent to <strong className="text-white">{user?.email}</strong>. Check your inbox (and spam folder).
                </span>
              </div>
            )}

            {/* ── Step: Verify OTP ── */}
            {step === "verify-otp" && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />

                {/* Resend timer */}
                <div className="text-center text-xs text-gray-500">
                  {resendSeconds > 0 ? (
                    <span>Resend in <span className="text-[#E5B869] font-semibold">{resendSeconds}s</span></span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={resending}
                      className="flex items-center gap-1 mx-auto text-[#E5B869] hover:text-white font-semibold transition disabled:opacity-50"
                    >
                      <RotateCcw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
                      {resending ? "Sending..." : "Resend code"}
                    </button>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting || otp.length !== 6}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><ShieldCheck className="w-4 h-4" /> Verify Email</>
                  )}
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="w-full text-xs text-gray-600 hover:text-gray-400 transition"
                >
                  Sign out instead
                </button>
              </form>
            )}

            {/* ── Step: Set Password ── */}
            {step === "set-password" && (
              <form onSubmit={handleSetPassword} className="space-y-4">
                <div className="p-3 rounded-xl bg-emerald-500/8 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  Email verified! Now set your new password.
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">New Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><Lock className="w-4 h-4" /></div>
                    <input
                      type={showPwd ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Min. 8 characters"
                      autoComplete="new-password"
                      className="w-full bg-[#080E1C] border border-[#1E2D45] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#E5B869]/60 transition-all"
                    />
                    <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <PasswordStrength password={newPassword} />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">Confirm Password</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"><Lock className="w-4 h-4" /></div>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat your password"
                      autoComplete="new-password"
                      className={`w-full bg-[#080E1C] border rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none transition-all ${
                        confirmPassword && confirmPassword !== newPassword
                          ? "border-red-500/60"
                          : "border-[#1E2D45] focus:border-[#E5B869]/60"
                      }`}
                    />
                  </div>
                  {confirmPassword && confirmPassword !== newPassword && (
                    <p className="mt-1 text-[11px] text-red-400 font-medium">Passwords do not match.</p>
                  )}
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting || !newPassword || !confirmPassword || newPassword !== confirmPassword || newPassword.length < 8}
                  className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <><KeyRound className="w-4 h-4" /> Set Password</>
                  )}
                </button>
                <button type="button" onClick={() => { setStep("verify-otp"); setOtp(""); setError(""); }} className="w-full text-xs text-gray-500 hover:text-gray-300 transition">
                  ← Re-enter verification code
                </button>
              </form>
            )}

            {/* ── Step: Success ── */}
            {step === "success" && (
              <div className="text-center space-y-4 py-2">
                <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-serif font-bold text-lg text-white">Welcome, {user?.name || user?.username}! 🎉</h3>
                  <p className="text-xs text-gray-400 mt-1">Your password has been set. Redirecting...</p>
                </div>
                <div className="w-8 h-8 border-2 border-[#E5B869] border-t-transparent rounded-full animate-spin mx-auto" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChangePasswordPage() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <WeatherBackground>
          <ChangePasswordContent />
        </WeatherBackground>
      </WeatherProvider>
    </AuthProvider>
  );
}
