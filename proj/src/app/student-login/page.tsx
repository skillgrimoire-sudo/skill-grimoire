"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  RotateCcw,
  CheckCircle2,
  KeyRound,
} from "lucide-react";
import { WeatherProvider } from "@/context/WeatherContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import WeatherBackground from "@/components/weather/WeatherBackground";

// ── Types ─────────────────────────────────────────────────────────────────────

type PageMode = "login" | "forgot-step1" | "forgot-step2" | "forgot-step3" | "forgot-success";

// ── OTP Input ─────────────────────────────────────────────────────────────────

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
          ref={(el) => { inputs.current[i] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digits[i] || ""}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          disabled={disabled}
          className={`
            w-10 h-12 text-center text-lg font-bold rounded-xl border-2 outline-none
            bg-[#080E1C] text-white transition-all duration-200
            ${digits[i]
              ? "border-[#E5B869] shadow-[0_0_12px_rgba(229,184,105,0.35)]"
              : "border-[#1E2D45] focus:border-[#E5B869]/60"
            }
            disabled:opacity-50 disabled:cursor-not-allowed
          `}
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
        <span>Resend code in <span className="text-[#E5B869] font-semibold">{seconds}s</span></span>
      ) : (
        <button
          onClick={handleResend}
          disabled={resending}
          className="flex items-center gap-1 mx-auto text-[#E5B869] hover:text-white font-semibold transition disabled:opacity-50"
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
            <span key={c.label} className={`text-[9px] font-medium transition-colors ${c.pass ? "text-emerald-400" : "text-gray-600"}`}>
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

// ── Input Field ───────────────────────────────────────────────────────────────

function InputField({
  id, label, type, value, onChange, placeholder, icon, suffix, error, autoComplete,
}: {
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  icon: React.ReactNode;
  suffix?: React.ReactNode;
  error?: string;
  autoComplete?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-[11px] font-semibold text-gray-400 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          name={id.replace("login-", "").replace("forgot-", "")}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder || ""}
          autoComplete={autoComplete}
          className={`
            w-full bg-[#080E1C] border rounded-xl pl-9 ${suffix ? "pr-10" : "pr-4"} py-2.5
            text-sm text-white placeholder-gray-600 outline-none transition-all duration-200
            ${error
              ? "border-red-500/60 focus:border-red-500"
              : "border-[#1E2D45] focus:border-[#E5B869]/60 focus:shadow-[0_0_0_2px_rgba(229,184,105,0.12)]"
            }
          `}
        />
        {suffix && <div className="absolute right-3 top-1/2 -translate-y-1/2">{suffix}</div>}
      </div>
      {error && <p className="mt-1 text-[11px] text-red-400 font-medium">{error}</p>}
    </div>
  );
}

// ── Main Auth Card ────────────────────────────────────────────────────────────

function AuthCard() {
  const { refresh } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<PageMode>("login");

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPwd, setShowLoginPwd] = useState(false);

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotOtp, setForgotOtp] = useState("");
  const [forgotNewPwd, setForgotNewPwd] = useState("");
  const [forgotConfirmPwd, setForgotConfirmPwd] = useState("");
  const [showForgotPwd, setShowForgotPwd] = useState(false);

  // Shared
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const clearErrors = () => setError("");

  // ── Password Login ──────────────────────────────────────────────────────────
  const handlePasswordLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const emailNode = document.getElementById("login-email") as HTMLInputElement | null;
    const pwdNode = document.getElementById("login-password") as HTMLInputElement | null;
    
    const email = loginEmail || emailNode?.value || formData.get("email")?.toString() || "";
    const password = loginPassword || pwdNode?.value || formData.get("password")?.toString() || "";
    
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    clearErrors();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, password: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Login failed."); return; }

      await refresh();

      // Redirect admin to admin panel
      if (data.isAdmin || data.user?.role === "ADMIN") {
        window.location.href = "/admin/dashboard";
        return;
      }

      // First-time login → change password
      if (data.mustChangePassword) {
        window.location.href = "/change-password";
        return;
      }

      // Terms not yet accepted → accept terms page
      if (!data.termsAccepted) {
        window.location.href = "/accept-terms";
        return;
      }

      window.location.href = "/";
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot: Send OTP ────────────────────────────────────────────────────────
  const handleForgotSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) return;
    clearErrors();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail, type: "RESET" }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Failed to send code."); return; }
      setMode("forgot-step2");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot: Verify OTP ──────────────────────────────────────────────────────
  const handleForgotVerifyOtp = async () => {
    if (forgotOtp.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }
    clearErrors();
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
        setError(data.error || "Incorrect verification code. Please try again.");
        return;
      }
      setMode("forgot-step3");
    } catch {
      setError("Failed to verify code. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Forgot: Reset Password ──────────────────────────────────────────────────
  const handleForgotReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (forgotOtp.length !== 6 || !forgotNewPwd) return;
    if (forgotNewPwd !== forgotConfirmPwd) { setError("Passwords do not match."); return; }
    clearErrors();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword: forgotNewPwd,
          confirmPassword: forgotConfirmPwd,
          type: "RESET",
        }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "Reset failed."); return; }
      setMode("forgot-success");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToLogin = () => {
    setMode("login");
    setForgotEmail("");
    setForgotOtp("");
    setForgotNewPwd("");
    setForgotConfirmPwd("");
    clearErrors();
  };

  return (
    <div className="sg-card overflow-hidden">
      {/* ── Header ── */}
      <div className="relative px-6 pt-6 pb-4 border-b border-[#E5B869]/15 text-center">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-br from-[#E5B869] to-[#C69234] flex items-center justify-center mb-3 shadow-[0_0_24px_rgba(229,184,105,0.4)]">
          {mode === "login" ? (
            <GraduationCap className="w-6 h-6 text-black" />
          ) : mode === "forgot-success" ? (
            <CheckCircle2 className="w-6 h-6 text-black" />
          ) : (
            <KeyRound className="w-6 h-6 text-black" />
          )}
        </div>
        <h2 className="font-serif font-bold text-base text-white">
          {mode === "login" && "Student Portal"}
          {(mode === "forgot-step1" || mode === "forgot-step2" || mode === "forgot-step3") && "Reset Password"}
          {mode === "forgot-success" && "Password Reset!"}
        </h2>
        <p className="text-[11px] text-gray-500 mt-0.5">
          {mode === "login" && "Sign in to access your learning dashboard"}
          {mode === "forgot-step1" && "Enter your email to receive a reset code"}
          {mode === "forgot-step2" && "Enter the 6-digit code sent to your email"}
          {mode === "forgot-step3" && "Create your new password"}
          {mode === "forgot-success" && "You can now sign in with your new password"}
        </p>
      </div>

      {/* ── Body ── */}
      <div className="px-6 py-5">

        {/* Error banner */}
        {error && (
          <div className="mb-4 px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 font-medium flex items-start gap-2">
            <span className="mt-0.5 shrink-0">⚠</span>
            <span>{error}</span>
          </div>
        )}

        {/* ══ MODE: LOGIN ══ */}
        {mode === "login" && (
          <form onSubmit={handlePasswordLogin} className="space-y-4">
            <InputField
              id="login-email"
              label="Email"
              type="email"
              value={loginEmail}
              onChange={setLoginEmail}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            <div>
              <InputField
                id="login-password"
                label="Password"
                type={showLoginPwd ? "text" : "password"}
                value={loginPassword}
                onChange={setLoginPassword}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="current-password"
                suffix={
                  <button
                    type="button"
                    onClick={() => setShowLoginPwd(!showLoginPwd)}
                    className="text-gray-500 hover:text-gray-300 transition"
                  >
                    {showLoginPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <div className="flex justify-end mt-1.5">
                <button
                  type="button"
                  onClick={() => { setMode("forgot-step1"); clearErrors(); }}
                  className="text-[11px] text-[#E5B869] hover:text-white font-medium transition"
                >
                  Forgot password?
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Sign In <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>
        )}

        {/* ══ MODE: FORGOT — Step 1: Enter email ══ */}
        {mode === "forgot-step1" && (
          <form onSubmit={handleForgotSend} className="space-y-4">
            <div className="p-3 rounded-xl bg-blue-500/8 border border-blue-500/20 text-xs text-blue-300 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-blue-400" />
              <span>We&apos;ll send a 6-digit code to your registered email address.</span>
            </div>
            <InputField
              id="forgot-email"
              label="Registered Email"
              type="email"
              value={forgotEmail}
              onChange={setForgotEmail}
              icon={<Mail className="w-4 h-4" />}
              autoComplete="email"
            />
            <button
              type="submit"
              disabled={isSubmitting || !forgotEmail}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Send Reset Code"}
            </button>
            <button type="button" onClick={goToLogin} className="w-full text-xs text-gray-500 hover:text-gray-300 transition">
              ← Back to login
            </button>
          </form>
        )}

        {/* ══ MODE: FORGOT — Step 2: Enter OTP ══ */}
        {mode === "forgot-step2" && (
          <div className="space-y-5">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-full bg-[#E5B869]/15 border border-[#E5B869]/30 flex items-center justify-center">
                <Mail className="w-5 h-5 text-[#E5B869]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">Check your inbox</p>
                <p className="text-xs text-gray-400 mt-0.5">Code sent to <span className="text-white font-medium">{forgotEmail}</span></p>
              </div>
            </div>
            <OtpInput value={forgotOtp} onChange={setForgotOtp} disabled={isSubmitting} />
            <ResendTimer email={forgotEmail} onResend={() => { setForgotOtp(""); clearErrors(); }} />
            <button
              type="button"
              onClick={handleForgotVerifyOtp}
              disabled={isSubmitting || forgotOtp.length !== 6}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : (
                <>Verify Code <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
            <button type="button" onClick={() => setMode("forgot-step1")} className="w-full text-xs text-gray-500 hover:text-gray-300 transition">
              ← Change email
            </button>
          </div>
        )}

        {/* ══ MODE: FORGOT — Step 3: New Password ══ */}
        {mode === "forgot-step3" && (
          <form onSubmit={handleForgotReset} className="space-y-4">
            <div>
              <InputField
                id="forgot-new-pwd"
                label="New Password"
                type={showForgotPwd ? "text" : "password"}
                value={forgotNewPwd}
                onChange={setForgotNewPwd}
                icon={<Lock className="w-4 h-4" />}
                autoComplete="new-password"
                suffix={
                  <button type="button" onClick={() => setShowForgotPwd(!showForgotPwd)} className="text-gray-500 hover:text-gray-300 transition">
                    {showForgotPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
              />
              <PasswordStrength password={forgotNewPwd} />
            </div>
            <InputField
              id="forgot-confirm-pwd"
              label="Confirm New Password"
              type="password"
              value={forgotConfirmPwd}
              onChange={setForgotConfirmPwd}
              icon={<Lock className="w-4 h-4" />}
              autoComplete="new-password"
            />
            <button
              type="submit"
              disabled={isSubmitting || !forgotNewPwd || !forgotConfirmPwd || forgotNewPwd.length < 8}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : "Reset Password"}
            </button>
          </form>
        )}

        {/* ══ MODE: FORGOT — Success ══ */}
        {mode === "forgot-success" && (
          <div className="text-center space-y-4 py-2">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-serif font-bold text-lg text-white">Password Reset!</h3>
              <p className="text-xs text-gray-400 mt-1">Your password has been updated successfully.</p>
            </div>
            <div className="p-3 rounded-xl bg-[#E5B869]/8 border border-[#E5B869]/20 text-xs text-gray-300">
              You can now sign in with your new password.
            </div>
            <button
              onClick={goToLogin}
              className="w-full py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_20px_rgba(229,184,105,0.35)] transition-all flex items-center justify-center gap-2"
            >
              Sign In Now <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Page Wrapper ──────────────────────────────────────────────────────────────

function StudentLoginPage() {
  return (
    <WeatherBackground>
      <div className="min-h-screen flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-sm">
          {/* Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/25 mb-4">
              <span className="text-[#E5B869] text-xs font-semibold tracking-widest uppercase">✦ Skill Grimoire</span>
            </div>
            <p className="text-gray-500 text-xs">Institutional Learning Platform</p>
          </div>
          <AuthCard />
        </div>
      </div>
    </WeatherBackground>
  );
}

export default function StudentLoginPageWrapper() {
  return (
    <AuthProvider>
      <WeatherProvider>
        <StudentLoginPage />
      </WeatherProvider>
    </AuthProvider>
  );
}
