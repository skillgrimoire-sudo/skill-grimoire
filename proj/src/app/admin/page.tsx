"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Shield,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  KeyRound,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

type AdminAuthMode = "login" | "forgot-email" | "forgot-otp" | "forgot-new-pwd" | "forgot-success";

// ── 6-Digit OTP Input ─────────────────────────────────────────────────────────

function OtpInput({
  value,
  onChange,
  disabled,
}: {
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
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
    if (pasted) {
      onChange(pasted);
      inputs.current[Math.min(pasted.length, 5)]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center" onPaste={handlePaste}>
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={(el) => {
            inputs.current[i] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className={`w-10 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none bg-[#080E1C] text-white transition-all duration-200 ${
            digits[i]
              ? "border-[#E5B869] shadow-[0_0_12px_rgba(229,184,105,0.35)]"
              : "border-[#1E2D45] focus:border-[#E5B869]/60"
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        />
      ))}
    </div>
  );
}

// ── Resend Timer ──────────────────────────────────────────────────────────────

function ResendTimer({ email, onResend }: { email: string; onResend: () => void }) {
  const [seconds, setSeconds] = useState(60);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const handleResend = async () => {
    setResending(true);
    try {
      await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, type: "RESET" }),
      });
      setSeconds(60);
      onResend();
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="text-center text-xs text-gray-500">
      {seconds > 0 ? (
        <span>
          Resend code in <span className="text-[#E5B869] font-semibold">{seconds}s</span>
        </span>
      ) : (
        <button
          type="button"
          onClick={handleResend}
          disabled={resending}
          className="flex items-center gap-1 mx-auto text-[#E5B869] hover:text-white font-semibold transition disabled:opacity-50 cursor-pointer"
        >
          <RotateCcw className={`w-3 h-3 ${resending ? "animate-spin" : ""}`} />
          {resending ? "Sending..." : "Resend code"}
        </button>
      )}
    </div>
  );
}

// ── Password Strength ─────────────────────────────────────────────────────────

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "8+ chars", pass: password.length >= 8 },
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
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score] : "bg-[#1E2D45]"
            }`}
          />
        ))}
      </div>
      <div className="flex justify-between">
        <div className="flex gap-2 flex-wrap">
          {checks.map((c) => (
            <span
              key={c.label}
              className={`text-[9px] font-medium transition-colors ${
                c.pass ? "text-emerald-400" : "text-gray-600"
              }`}
            >
              {c.pass ? "✓" : "·"} {c.label}
            </span>
          ))}
        </div>
        {score > 0 && (
          <span className={`text-[9px] font-bold ${colors[score].replace("bg-", "text-")}`}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

// ── Main Admin Page ───────────────────────────────────────────────────────────

export default function AdminLoginPage() {
  const router = useRouter();

  // Mode state
  const [mode, setMode] = useState<AdminAuthMode>("login");

  // Login form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPwd, setShowPwd] = useState(false);

  // Forgot password flow state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPwd, setForgotNewPwd] = useState("");
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState("");
  const [showForgotPwd, setShowForgotPwd] = useState(false);
  const [showForgotConfirmPwd, setShowForgotConfirmPwd] = useState(false);

  // Status & error state
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearErrors = () => setError("");

  // ── Handle Login ────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    clearErrors();

    const loginEmail = email.trim();
    const loginPassword = password;

    if (!loginEmail || !loginPassword) {
      setError("Please enter your admin email and password.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: loginEmail, password: loginPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }
      if (data.user?.role !== "ADMIN") {
        setError("Access denied. This portal is for administrators only.");
        await fetch("/api/auth/logout", { method: "POST" });
        return;
      }
      window.location.href = "/admin/dashboard";
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Forgot: Send OTP ─────────────────────────────────────────────────
  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    const targetEmail = forgotEmail.trim();
    if (!targetEmail) {
      setError("Please enter your administrator email.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: targetEmail, type: "RESET" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to send reset code.");
        return;
      }
      setMode("forgot-otp");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Forgot: Verify OTP & Proceed ─────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();
    if (forgotOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp,
          type: "RESET",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Incorrect verification code.");
        return;
      }
      setMode("forgot-new-pwd");
    } catch {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Handle Forgot: Set New Password ─────────────────────────────────────────
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (forgotOtp.length !== 6 || !forgotNewPwd) {
      setError("Please fill in all fields.");
      return;
    }
    if (forgotNewPwd.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (forgotNewPwd !== forgotConfirmPwd) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail.trim(),
          otp: forgotOtp,
          newPassword: forgotNewPwd,
          confirmPassword: forgotConfirmPwd,
          type: "RESET",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to reset password.");
        return;
      }
      setMode("forgot-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchToLogin = () => {
    setMode("login");
    setError("");
    setForgotOtp("");
    setForgotNewPwd("");
    setForgotConfirmPwd("");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background:
          "radial-gradient(ellipse at 20% 50%, rgba(229,184,105,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(100,120,200,0.05) 0%, transparent 60%), #05080F",
        fontFamily: "'Inter', 'Segoe UI', sans-serif",
      }}
    >
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(229,184,105,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(229,184,105,0.5) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Brand header */}
        <div className="text-center mb-7">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-[#E5B869] to-[#C69234] flex items-center justify-center mb-4 shadow-[0_0_40px_rgba(229,184,105,0.4)]">
            <GraduationCap className="w-8 h-8 text-black" />
          </div>
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Skill Grimoire
          </h1>
          <div className="flex items-center justify-center gap-1.5 mt-1.5">
            <Shield className="w-3.5 h-3.5 text-[#E5B869]" />
            <span className="text-[#E5B869] text-xs font-semibold tracking-widest uppercase">Admin Portal</span>
          </div>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-[#E5B869]/20 bg-gradient-to-b from-[#0B1525]/90 to-[#080F1E]/90 backdrop-blur-sm p-7 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          {/* Titles by Mode */}
          {mode === "login" && (
            <div className="mb-6">
              <h2 className="text-base font-bold text-white mb-1">Administrator Login</h2>
              <p className="text-xs text-gray-500">Sign in to manage your institution</p>
            </div>
          )}

          {mode === "forgot-email" && (
            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/30 flex items-center justify-center mb-3 text-[#E5B869]">
                <KeyRound className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">Reset Password</h2>
              <p className="text-xs text-gray-400">Enter your admin email to receive a verification code</p>
            </div>
          )}

          {mode === "forgot-otp" && (
            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/30 flex items-center justify-center mb-3 text-[#E5B869]">
                <Shield className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">Enter Verification Code</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                We sent a 6-digit code to <span className="text-white font-medium">{forgotEmail}</span>
              </p>
            </div>
          )}

          {mode === "forgot-new-pwd" && (
            <div className="mb-6">
              <div className="w-10 h-10 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/30 flex items-center justify-center mb-3 text-[#E5B869]">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-base font-bold text-white mb-1">Set New Password</h2>
              <p className="text-xs text-gray-400">Create a new secure password for your admin account</p>
            </div>
          )}

          {mode === "forgot-success" && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h2 className="text-lg font-bold text-white mb-1.5" style={{ fontFamily: "Georgia, serif" }}>
                Password Reset!
              </h2>
              <p className="text-xs text-gray-400 mb-6">
                Your administrator password has been updated. You can now log in with your new credentials.
              </p>
              <button
                type="button"
                onClick={switchToLogin}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition cursor-pointer"
              >
                Back to Sign In
              </button>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ── Mode: Login ──────────────────────────────────────────────────── */}
          {mode === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="admin-email" className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                  Admin Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoComplete="email"
                    className="w-full bg-[#080E1C] border border-[#1E2D45] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#E5B869]/60 focus:shadow-[0_0_0_2px_rgba(229,184,105,0.12)] transition-all"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="admin-password" className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(email || "");
                      clearErrors();
                      setMode("forgot-email");
                    }}
                    className="text-[11px] text-[#E5B869] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    id="admin-password"
                    name="password"
                    type={showPwd ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    className="w-full bg-[#080E1C] border border-[#1E2D45] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#E5B869]/60 focus:shadow-[0_0_0_2px_rgba(229,184,105,0.12)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                  >
                    {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Sign In <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>
          )}

          {/* ── Mode: Forgot Step 1 (Enter Email) ────────────────────────────── */}
          {mode === "forgot-email" && (
            <form onSubmit={handleForgotSend} className="space-y-4">
              <div>
                <label htmlFor="forgot-email" className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                  Registered Admin Email
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="forgot-email"
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    placeholder="Enter your email"
                    autoFocus
                    className="w-full bg-[#080E1C] border border-[#1E2D45] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#E5B869]/60 focus:shadow-[0_0_0_2px_rgba(229,184,105,0.12)] transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !forgotEmail.trim()}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Send Verification Code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                type="button"
                onClick={switchToLogin}
                className="w-full flex items-center justify-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 transition py-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </form>
          )}

          {/* ── Mode: Forgot Step 2 (Enter OTP) ──────────────────────────────── */}
          {mode === "forgot-otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="py-2">
                <OtpInput value={forgotOtp} onChange={setForgotOtp} disabled={isSubmitting} />
              </div>

              <ResendTimer
                email={forgotEmail}
                onResend={() => {
                  setForgotOtp("");
                  clearErrors();
                }}
              />

              <button
                type="submit"
                disabled={isSubmitting || forgotOtp.length !== 6}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Verify Code <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  setMode("forgot-email");
                  clearErrors();
                }}
                className="w-full text-xs text-gray-500 hover:text-gray-300 transition py-1 cursor-pointer"
              >
                Change email address
              </button>
            </form>
          )}

          {/* ── Mode: Forgot Step 3 (Set New Password) ────────────────────────── */}
          {mode === "forgot-new-pwd" && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showForgotPwd ? "text" : "password"}
                    value={forgotNewPwd}
                    onChange={(e) => setForgotNewPwd(e.target.value)}
                    placeholder="Enter your password"
                    autoFocus
                    className="w-full bg-[#080E1C] border border-[#1E2D45] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#E5B869]/60 focus:shadow-[0_0_0_2px_rgba(229,184,105,0.12)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotPwd(!showForgotPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                  >
                    {showForgotPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <PasswordStrength password={forgotNewPwd} />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showForgotConfirmPwd ? "text" : "password"}
                    value={forgotConfirmPwd}
                    onChange={(e) => setForgotConfirmPwd(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full bg-[#080E1C] border border-[#1E2D45] rounded-xl pl-9 pr-10 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#E5B869]/60 focus:shadow-[0_0_0_2px_rgba(229,184,105,0.12)] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotConfirmPwd(!showForgotConfirmPwd)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                  >
                    {showForgotConfirmPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || !forgotNewPwd || !forgotConfirmPwd || forgotNewPwd.length < 8}
                className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSubmitting ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>Reset Password <ArrowRight className="w-4 h-4" /></>
                )}
              </button>

              <button
                type="button"
                onClick={switchToLogin}
                className="w-full text-xs text-gray-500 hover:text-gray-300 transition py-1 cursor-pointer"
              >
                Cancel
              </button>
            </form>
          )}

          {/* Student portal link */}
          {mode === "login" && (
            <div className="mt-5 pt-4 border-t border-white/5 text-center">
              <p className="text-[11px] text-gray-600">
                Student?{" "}
                <a href="/student-login" className="text-[#E5B869] hover:underline font-medium">
                  Go to Student Portal
                </a>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
