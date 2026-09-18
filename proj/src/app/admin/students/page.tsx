"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Users, Plus, Search, Trash2, Clock, CheckCircle, X, Mail,
  RefreshCw, AlertCircle, Upload, FileSpreadsheet, Download, BookOpen,
  User, Calendar, GraduationCap, Eye, EyeOff, Sparkles, Shield, ChevronRight, Edit,
} from "lucide-react";

interface Student {
  id: string;
  name: string | null;
  email: string;
  username: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  studentClass?: string | null;
  gender?: string | null;
  dateOfBirth?: string | null;
  createdAt: string;
  enrollments: { id: string; status: string; progressPercent: number }[];
}

function dobToPassword(dob: string): string {
  if (!dob) return "";
  const d = new Date(dob);
  if (isNaN(d.getTime())) return "";
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  return `${dd}${mm}${d.getFullYear()}`;
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 py-2 text-sm font-semibold rounded-xl transition-all ${
        active
          ? "bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] text-black shadow"
          : "text-gray-400 hover:text-white hover:bg-white/5"
      }`}
    >
      {children}
    </button>
  );
}

// ── Manual Tab ────────────────────────────────────────────────────────────────

function FieldGroup({ icon, label, children, hasValue }: { icon: React.ReactNode; label: string; children: React.ReactNode; hasValue?: boolean }) {
  const [focused, setFocused] = useState(false);
  return (
    <div
      style={{
        display: "flex", alignItems: "center",
        background: "#060C18", border: `1px solid ${focused ? "rgba(229,184,105,0.5)" : "#1E2D45"}`,
        borderRadius: 14, transition: "all 0.25s", overflow: "hidden",
        boxShadow: focused ? "0 0 0 3px rgba(229,184,105,0.08)" : "none",
      }}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
    >
      <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center", color: focused ? "#E5B869" : "#4a5e72", flexShrink: 0, transition: "color 0.25s" }}>
        {icon}
      </div>
      <div style={{ flex: 1, padding: "8px 0", minWidth: 0 }}>
        <label style={{ display: "block", fontSize: 9, fontWeight: 700, color: focused ? "#E5B869" : "#4a5e72", textTransform: "uppercase", letterSpacing: "0.08em", lineHeight: 1, marginBottom: 2, transition: "color 0.25s" }}>
          {label}
        </label>
        {children}
      </div>
      {hasValue && <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" style={{ marginRight: 12 }} />}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", background: "transparent", border: "none",
  fontSize: 13, color: "white", outline: "none",
  padding: 0, lineHeight: 1.4,
};

function ManualTab({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [studentClass, setStudentClass] = useState("");
  const [gender, setGender] = useState("");
  const [dob, setDob] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [createdStudent, setCreatedStudent] = useState<{ name: string; email: string; username: string } | null>(null);

  const derivedPassword = dobToPassword(dob);
  const filledSteps = [!!name, !!email, !!studentClass, !!dob, !!gender].filter(Boolean).length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !dob || !studentClass || !gender) {
      setError("Please fill in all fields to continue.");
      return;
    }
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, studentClass, gender, dateOfBirth: dob, sendEmail }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create student.");
        return;
      }
      setCreatedStudent(data.student);
      setSuccess(true);
      setTimeout(() => { onSuccess(); onClose(); }, 2800);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: "center", padding: "20px 0 8px", animation: "manualSlideIn 0.4s cubic-bezier(0.16,1,0.3,1)" }}>
        <div style={{ width: 72, height: 72, margin: "0 auto", borderRadius: 9999, position: "relative", background: "rgba(16,185,129,0.1)", border: "2px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", animation: "manualPulse 2s ease-in-out infinite" }}>
          <CheckCircle className="w-10 h-10 text-emerald-400" strokeWidth={1.5} />
        </div>
        <h3 className="text-xl font-bold text-white" style={{ fontFamily: "Georgia, serif", marginTop: 20 }}>
          Student Created Successfully!
        </h3>
        <p className="text-sm text-gray-400" style={{ marginTop: 4 }}>
          {createdStudent?.name || name} has been added to the system.
        </p>
        <div style={{ marginTop: 20, padding: "18px 20px", borderRadius: 16, background: "linear-gradient(135deg, #080F1C, #0D1525)", border: "1px solid rgba(229,184,105,0.2)", textAlign: "left" }}>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-4 h-4 text-[#E5B869]" />
            <span style={{ fontSize: 11, fontWeight: 700, color: "#E5B869", textTransform: "uppercase", letterSpacing: "0.15em" }}>Login Credentials</span>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Email</span>
              <span className="text-sm text-white font-medium">{email}</span>
            </div>
            {createdStudent?.username && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">Username</span>
                <span className="text-sm text-gray-300">@{createdStudent.username}</span>
              </div>
            )}
            <div className="h-px bg-gradient-to-r from-transparent via-[#1E2D45] to-transparent" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">Password</span>
              <code className="text-sm font-mono font-bold text-[#F5D075]" style={{ background: "rgba(229,184,105,0.1)", padding: "4px 12px", borderRadius: 8 }}>
                {derivedPassword}
              </code>
            </div>
          </div>
        </div>
        {sendEmail && (
          <div className="flex items-center gap-2" style={{ marginTop: 16, padding: "8px 16px", borderRadius: 12, background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.2)" }}>
            <Mail className="w-3.5 h-3.5 text-blue-400" />
            <span className="text-xs text-blue-300">Welcome email sent to {email}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Progress indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, height: 4, borderRadius: 999, background: "#0D1A2D", overflow: "hidden" }}>
          <div style={{ height: "100%", borderRadius: 999, background: "linear-gradient(90deg, #E5B869, #F5D075, #E5B869)", backgroundSize: "200% auto", animation: "manualShimmer 2s linear infinite", transition: "width 0.4s cubic-bezier(0.16,1,0.3,1)", width: `${(filledSteps / 5) * 100}%` }} />
        </div>
        <span style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", fontVariantNumeric: "tabular-nums" }}>
          {filledSteps}/5 fields
        </span>
      </div>

      {error && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 14px", borderRadius: 12, background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)", fontSize: 12, color: "#fca5a5" }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(239,68,68,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "#f87171", flexShrink: 0 }}>
            <AlertCircle className="w-4 h-4" />
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Form fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        <FieldGroup icon={<User className="w-4 h-4" />} label="Full Name" hasValue={!!name}>
          <input style={inputStyle} value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Arjun Sharma" autoFocus />
        </FieldGroup>

        <FieldGroup icon={<Mail className="w-4 h-4" />} label="Email Address" hasValue={!!email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)}>
          <input style={inputStyle} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="e.g. arjun@school.edu" />
        </FieldGroup>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          <FieldGroup icon={<GraduationCap className="w-4 h-4" />} label="Class / Batch" hasValue={!!studentClass}>
            <select style={inputStyle} value={studentClass} onChange={(e) => setStudentClass(e.target.value)} className="student-select">
              <option value="" disabled>Select Class</option>
              <option value="10th">10th</option>
              <option value="PU I">PU I</option>
              <option value="PU II">PU II</option>
              <option value="UG I">UG I</option>
              <option value="UG II">UG II</option>
              <option value="UG III">UG III</option>
              <option value="PG I">PG I</option>
              <option value="PG II">PG II</option>
              <option value="10th FC">10th FC</option>
              <option value="PUC FC">PUC FC</option>
              <option value="UG FC">UG FC</option>
              <option value="PG FC">PG FC</option>
            </select>
          </FieldGroup>
          <FieldGroup icon={<User className="w-4 h-4" />} label="Gender" hasValue={!!gender}>
            <select style={inputStyle} value={gender} onChange={(e) => setGender(e.target.value)} className="student-select">
              <option value="" disabled>Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          </FieldGroup>
          <FieldGroup icon={<Calendar className="w-4 h-4" />} label="Date of Birth" hasValue={!!dob}>
            <input style={{ ...inputStyle, colorScheme: "dark" }} type="date" value={dob} onChange={(e) => setDob(e.target.value)} max={new Date().toISOString().split("T")[0]} />
          </FieldGroup>
        </div>
      </div>

      {/* Password preview */}
      {derivedPassword && (
        <div style={{ padding: "14px 16px", borderRadius: 14, background: "linear-gradient(135deg, rgba(229,184,105,0.06), rgba(198,146,52,0.03))", border: "1px solid rgba(229,184,105,0.15)" }}>
          <div className="flex items-center gap-2.5">
            <div style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(229,184,105,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              <Shield className="w-4 h-4 text-[#E5B869]" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 10, fontWeight: 700, color: "#E5B869", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 2 }}>Auto-generated Password</p>
              <div className="flex items-center gap-2">
                <code style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "white" }}>
                  {showPassword ? derivedPassword : derivedPassword.replace(/./g, "\u2022")}
                </code>
                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", padding: 2, color: "#6b7280", transition: "color 0.2s" }}>
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          <p style={{ fontSize: 10, color: "#4a5e72", marginTop: 8, marginLeft: 42 }}>Derived from DOB in DDMMYYYY format. Student must change on first login.</p>
        </div>
      )}

      {/* Send email toggle */}
      <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "#060C18", border: "1px solid #1E2D45", cursor: "pointer", transition: "all 0.2s" }}>
        <div style={{ width: 36, height: 20, borderRadius: 999, background: sendEmail ? "#E5B869" : "#1E2D45", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
          <div style={{ width: 16, height: 16, borderRadius: 999, background: "white", position: "absolute", top: 2, left: 2, transition: "transform 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transform: sendEmail ? "translateX(16px)" : "none" }} />
        </div>
        <div style={{ flex: 1 }}>
          <p className="text-xs text-white font-medium">Send welcome email</p>
          <p style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>Student will receive their login credentials via email</p>
        </div>
        <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="sr-only" />
      </label>

      {/* Actions */}
      <div style={{ display: "flex", gap: 10, paddingTop: 4 }}>
        <button
          type="button"
          onClick={onClose}
          style={{ flex: 1, padding: 12, borderRadius: 14, fontSize: 13, fontWeight: 600, color: "#9ca3af", background: "transparent", border: "1px solid #1E2D45", cursor: "pointer", transition: "all 0.2s" }}
          onMouseOver={(e) => { e.currentTarget.style.borderColor = "#4a5e72"; e.currentTarget.style.color = "white"; }}
          onMouseOut={(e) => { e.currentTarget.style.borderColor = "#1E2D45"; e.currentTarget.style.color = "#9ca3af"; }}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || filledSteps < 5}
          style={{ flex: 1.5, padding: "12px 18px", borderRadius: 14, fontSize: 13, fontWeight: 700, color: "black", border: "none", cursor: (isSubmitting || filledSteps < 5) ? "not-allowed" : "pointer", background: "linear-gradient(135deg, #F5D075, #E5B869, #C69234)", boxShadow: "0 4px 20px rgba(229,184,105,0.3)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, transition: "all 0.25s", opacity: (isSubmitting || filledSteps < 5) ? 0.4 : 1 }}
          onMouseOver={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.filter = "brightness(1.1)"; e.currentTarget.style.boxShadow = "0 6px 24px rgba(229,184,105,0.4)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
          onMouseOut={(e) => { if (!e.currentTarget.disabled) { e.currentTarget.style.filter = "none"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(229,184,105,0.3)"; e.currentTarget.style.transform = "none"; } }}
        >
          {isSubmitting ? (
            <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Create Student</span>
              <ChevronRight className="w-3.5 h-3.5 ml-auto" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ── Excel Tab ─────────────────────────────────────────────────────────────────
interface ParsedRow {
  name: string; email: string; studentClass: string;
  dateOfBirth: string; dobDisplay: string; derivedPassword: string;
  _error?: string;
}

function ExcelTab({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [rows, setRows] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [result, setResult] = useState<{ created: number; skipped: number; errors: { row: number; name: string; reason: string }[] } | null>(null);

  const parseDate = (val: unknown): { iso: string; display: string } | null => {
    if (!val) return null;
    if (typeof val === "number") {
      const d = new Date(Math.round((val - 25569) * 86400 * 1000));
      if (!isNaN(d.getTime())) return { iso: d.toISOString().split("T")[0], display: d.toLocaleDateString("en-IN") };
    }
    const str = String(val).trim();
    const m = str.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/);
    if (m) {
      const d = new Date(`${m[3]}-${m[2].padStart(2,"0")}-${m[1].padStart(2,"0")}`);
      if (!isNaN(d.getTime())) return { iso: d.toISOString().split("T")[0], display: d.toLocaleDateString("en-IN") };
    }
    const d2 = new Date(str);
    if (!isNaN(d2.getTime())) return { iso: d2.toISOString().split("T")[0], display: d2.toLocaleDateString("en-IN") };
    return null;
  };

  const processFile = useCallback(async (file: File) => {
    setParseError(""); setRows([]); setFileName(file.name); setResult(null);

    if (file.name.endsWith(".csv")) {
      const text = await file.text();
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length < 2) { setParseError("CSV has no data rows."); return; }
      const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
      const ni = headers.findIndex((h) => h.includes("name"));
      const ei = headers.findIndex((h) => h.includes("email"));
      const ci = headers.findIndex((h) => h.includes("class") || h.includes("batch"));
      const di = headers.findIndex((h) => h.includes("dob") || h.includes("birth") || h.includes("date"));
      const parsed: ParsedRow[] = lines.slice(1).map((line) => {
        const cols = line.split(",").map((c) => c.trim());
        const name = ni >= 0 ? cols[ni] : "";
        const email = ei >= 0 ? cols[ei] : "";
        const studentClass = ci >= 0 ? cols[ci] : "";
        const rawDob = di >= 0 ? cols[di] : "";
        const pd = parseDate(rawDob);
        const dateOfBirth = pd?.iso || ""; const dobDisplay = pd?.display || rawDob;
        const derivedPassword = dobToPassword(dateOfBirth);
        return { name, email, studentClass, dateOfBirth, dobDisplay, derivedPassword, _error: (!name||!email||!derivedPassword) ? "Missing required fields" : undefined };
      });
      setRows(parsed); return;
    }

    try {
      const XLSX = await import("xlsx");
      const ab = await file.arrayBuffer();
      const wb = XLSX.read(ab, { type: "array", cellDates: true });
      const ws = wb.Sheets[wb.SheetNames[0]];
      const json: Record<string, unknown>[] = XLSX.utils.sheet_to_json(ws, { raw: false });
      const parsed: ParsedRow[] = json.map((row) => {
        const fc = (...keys: string[]) => { for (const k of Object.keys(row)) if (keys.some((key) => k.toLowerCase().includes(key))) return String(row[k]||"").trim(); return ""; };
        const name = fc("name"); const email = fc("email");
        const studentClass = fc("class","batch"); const rawDob = fc("dob","birth","date");
        const pd = parseDate(rawDob);
        const dateOfBirth = pd?.iso||""; const dobDisplay = pd?.display||rawDob;
        const derivedPassword = dobToPassword(dateOfBirth);
        return { name, email, studentClass, dateOfBirth, dobDisplay, derivedPassword, _error: (!name||!email||!derivedPassword) ? "Missing required fields" : undefined };
      });
      setRows(parsed);
    } catch { setParseError("Could not parse the file. Make sure it is a valid .xlsx or .csv."); }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, [processFile]);

  const validRows = rows.filter((r) => !r._error);

  const handleImport = async () => {
    if (!validRows.length) return;
    setIsImporting(true);
    try {
      const res = await fetch("/api/admin/students/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          students: validRows.map((r) => ({
            name: r.name,
            email: r.email,
            studentClass: r.studentClass,
            dateOfBirth: r.dateOfBirth,
          })),
          sendEmail,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setParseError(data.error||"Import failed."); return; }
      setResult(data); onSuccess();
    } finally { setIsImporting(false); }
  };

  const downloadSample = () => {
    const csv = "Name,Email,Class,DOB\nArjun Sharma,arjun@school.edu,10A,01/04/2010\nPriya Patel,priya@school.edu,10B,15/08/2009\n";
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href=url; a.download="students_template.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  if (result) {
    return (
      <div className="space-y-4">
        <div className="text-center py-6 space-y-3">
          <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-400" />
          </div>
          <p className="font-bold text-white text-lg">Import Complete!</p>
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="text-emerald-400 font-semibold">✓ {result.created} created</span>
            {result.skipped > 0 && <span className="text-amber-400 font-semibold">↷ {result.skipped} skipped</span>}
            {result.errors.length > 0 && <span className="text-red-400 font-semibold">✗ {result.errors.length} errors</span>}
          </div>
          {sendEmail && result.created > 0 && (
            <p className="text-xs text-gray-400">
              ✉ Welcome emails sent with login credentials
            </p>
          )}
        </div>
        {result.errors.length > 0 && (
          <div className="rounded-xl bg-red-500/8 border border-red-500/20 p-3 space-y-1">
            <p className="text-xs font-semibold text-red-400 mb-2">Errors:</p>
            {result.errors.map((e, i) => <p key={i} className="text-xs text-red-300">Row {e.row} — {e.name}: {e.reason}</p>)}
          </div>
        )}
        <button onClick={onClose} className="w-full py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 transition">Done</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <button onClick={downloadSample} className="flex items-center gap-2 text-xs text-[#E5B869] hover:underline">
        <Download className="w-3.5 h-3.5" /> Download sample CSV template
      </button>

      {!rows.length && (
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-10 cursor-pointer transition-all ${isDragging ? "border-[#E5B869] bg-[#E5B869]/5" : "border-[#1E2D45] hover:border-[#E5B869]/40"}`}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#E5B869]/10 border border-[#E5B869]/20 flex items-center justify-center">
            <FileSpreadsheet className="w-7 h-7 text-[#E5B869]" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-white">Drop your file here</p>
            <p className="text-xs text-gray-500 mt-1">or click to browse — .xlsx, .xls, .csv</p>
          </div>
          <input ref={fileRef} type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) processFile(f); }} />
        </div>
      )}

      {parseError && (
        <div className="px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />{parseError}
        </div>
      )}

      {rows.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400">
              <span className="font-bold text-white">{fileName}</span> — {rows.length} rows
              {rows.filter(r=>r._error).length > 0 && <span className="text-red-400 ml-2">({rows.filter(r=>r._error).length} invalid)</span>}
            </p>
            <button onClick={() => { setRows([]); setFileName(""); }} className="text-xs text-gray-500 hover:text-red-400 transition">✕ Clear</button>
          </div>
          <div className="rounded-xl border border-[#1E2D45] overflow-hidden max-h-52 overflow-y-auto">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-[#060C18]">
                <tr className="border-b border-[#1E2D45]">
                  {["#","Name","Email","Class","DOB","Password"].map((h) => (
                    <th key={h} className="text-left px-3 py-2 text-gray-500 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D45]/50">
                {rows.map((r, i) => (
                  <tr key={i} className={r._error ? "bg-red-500/5" : "hover:bg-white/2 transition"}>
                    <td className="px-3 py-2 text-gray-600">{i+1}</td>
                    <td className="px-3 py-2 text-white font-medium">{r.name || <span className="text-red-400">—</span>}</td>
                    <td className="px-3 py-2 text-gray-400">{r.email || <span className="text-red-400">—</span>}</td>
                    <td className="px-3 py-2 text-gray-400">{r.studentClass||"—"}</td>
                    <td className="px-3 py-2 text-gray-400">{r.dobDisplay || <span className="text-red-400">—</span>}</td>
                    <td className="px-3 py-2">{r.derivedPassword ? <code className="font-mono text-[#E5B869]">{r.derivedPassword}</code> : <span className="text-red-400">invalid DOB</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <label style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", borderRadius: 14, background: "#060C18", border: "1px solid #1E2D45", cursor: "pointer", transition: "all 0.2s" }}>
            <div style={{ width: 36, height: 20, borderRadius: 999, background: sendEmail ? "#E5B869" : "#1E2D45", position: "relative", transition: "background 0.25s", flexShrink: 0 }}>
              <div style={{ width: 16, height: 16, borderRadius: 999, background: "white", position: "absolute", top: 2, left: 2, transition: "transform 0.25s", boxShadow: "0 1px 3px rgba(0,0,0,0.3)", transform: sendEmail ? "translateX(16px)" : "none" }} />
            </div>
            <div style={{ flex: 1 }}>
              <p className="text-xs text-white font-medium">Send welcome email</p>
              <p style={{ fontSize: 10, color: "#6b7280", marginTop: 1 }}>Students will receive their login credentials via email</p>
            </div>
            <input type="checkbox" checked={sendEmail} onChange={(e) => setSendEmail(e.target.checked)} className="sr-only" />
          </label>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-[#1E2D45] hover:border-gray-500 transition">Cancel</button>
            <button onClick={handleImport} disabled={isImporting||!validRows.length} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_16px_rgba(229,184,105,0.3)] transition disabled:opacity-50 flex items-center justify-center gap-2">
              {isImporting ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><Upload className="w-4 h-4" />Import {validRows.length} Student{validRows.length!==1?"s":""}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Add Student Modal ─────────────────────────────────────────────────────────
function AddStudentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [tab, setTab] = useState<"manual"|"excel">("manual");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-lg max-h-[88vh] flex flex-col rounded-2xl bg-[#0B1525] border border-[#E5B869]/25 shadow-[0_25px_70px_rgba(0,0,0,0.7)] overflow-hidden my-auto" style={{ animation: "modalSlideIn 0.35s cubic-bezier(0.16,1,0.3,1)" }}>
        {/* Header with gradient accent line (Sticky) */}
        <div className="relative shrink-0 bg-[#0B1525]">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E5B869] to-transparent" />
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D45]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#E5B869]/20 to-[#C69234]/10 border border-[#E5B869]/25 flex items-center justify-center">
                <Users className="w-4 h-4 text-[#E5B869]" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Add Students</h3>
                <p className="text-[11px] text-gray-500 mt-0.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#E5B869]/50" />
                  Password auto-generated from Date of Birth
                </p>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tabs (Sticky) */}
        <div className="px-6 pt-3 pb-2 shrink-0 bg-[#0B1525]">
          <div className="flex gap-1.5 p-1 rounded-xl bg-[#060C18] border border-[#1E2D45]">
            <TabBtn active={tab==="manual"} onClick={() => setTab("manual")}>
              <span className="flex items-center justify-center gap-1.5"><User className="w-3.5 h-3.5" /> Manual Entry</span>
            </TabBtn>
            <TabBtn active={tab==="excel"} onClick={() => setTab("excel")}>
              <span className="flex items-center justify-center gap-1.5"><FileSpreadsheet className="w-3.5 h-3.5" /> Excel / CSV</span>
            </TabBtn>
          </div>
        </div>

        {/* Scrollable Tab Content */}
        <div className="px-6 py-4 overflow-y-auto flex-1 overscroll-contain">
          {tab==="manual" ? <ManualTab onClose={onClose} onSuccess={onSuccess} /> : <ExcelTab onClose={onClose} onSuccess={onSuccess} />}
        </div>
      </div>
      <style>{`
        .field-label{display:block;font-size:11px;font-weight:600;color:#6b7280;margin-bottom:6px;text-transform:uppercase;letter-spacing:0.05em}
        .field-input{width:100%;background:#060C18;border:1px solid #1E2D45;border-radius:12px;padding:10px 14px;font-size:14px;color:white;outline:none;transition:border-color 0.2s}
        .field-input:focus{border-color:rgba(229,184,105,0.6)}
        .field-input::-webkit-calendar-picker-indicator{filter:invert(0.6)}
        .student-select option { background: #0B1525; color: white; }

        @keyframes manualSlideIn {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes manualPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(16, 185, 129, 0); }
        }
        @keyframes manualShimmer {
          from { background-position: -200% center; }
          to { background-position: 200% center; }
        }
      `}</style>
    </div>
  );
}

// ── Delete Confirm Modal ──────────────────────────────────────────────────────
function DeleteConfirmModal({ student, onClose, onConfirm }: { student: Student; onClose: () => void; onConfirm: () => void }) {
  const [isDeleting, setIsDeleting] = useState(false);
  const handleDelete = async () => {
    setIsDeleting(true);
    await fetch(`/api/admin/students/${student.id}`, { method: "DELETE" });
    onConfirm(); onClose();
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl bg-[#0B1525] border border-red-500/20 shadow-[0_20px_60px_rgba(0,0,0,0.5)] p-6 text-center">
        <div className="w-12 h-12 mx-auto rounded-full bg-red-500/15 border border-red-500/30 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-base font-bold text-white mb-2">Delete Student?</h3>
        <p className="text-sm text-gray-400 mb-1">Are you sure you want to delete <strong className="text-white">{student.name||student.email}</strong>?</p>
        <p className="text-xs text-red-400 mb-5">This action cannot be undone. All enrollments will be deleted.</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-[#1E2D45] hover:border-gray-500 transition">Cancel</button>
          <button onClick={handleDelete} disabled={isDeleting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white bg-red-500/80 hover:bg-red-500 transition disabled:opacity-50 flex items-center justify-center gap-2">
            {isDeleting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Trash2 className="w-4 h-4" />Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Edit Student Modal ────────────────────────────────────────────────────────
function EditStudentModal({ student, onClose, onSuccess }: { student: Student; onClose: () => void; onSuccess: () => void }) {
  const [name, setName] = useState(student.name || "");
  const [email, setEmail] = useState(student.email);
  const [studentClass, setStudentClass] = useState(student.studentClass || "");
  const [gender, setGender] = useState(student.gender || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split("T")[0] : ""
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/students/${student.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, studentClass, gender, dateOfBirth }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update student.");
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm">
      <div className="w-full max-w-md max-h-[88vh] flex flex-col rounded-2xl bg-[#0B1525] border border-[#1E2D45] shadow-[0_25px_70px_rgba(0,0,0,0.7)] overflow-hidden my-auto">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E2D45] shrink-0 bg-[#0B1525]">
          <h3 className="text-base font-bold text-white font-serif">Edit Student</h3>
          <button onClick={onClose} className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition cursor-pointer"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="text-xs text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">{error}</div>}
            
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Full Name</label>
              <input value={name} onChange={e => setName(e.target.value)} required className="w-full bg-[#060C18] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#E5B869]/50 transition" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Email Address</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required className="w-full bg-[#060C18] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#E5B869]/50 transition" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Date of Birth</label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={e => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                style={{ colorScheme: "dark" }}
                className="w-full bg-[#060C18] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#E5B869]/50 transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Class</label>
              <select value={studentClass} onChange={e => setStudentClass(e.target.value)} className="w-full bg-[#060C18] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#E5B869]/50 transition">
                <option value="">Select Class</option>
                <option value="10th">10th</option>
                <option value="PU I">PU I</option>
                <option value="PU II">PU II</option>
                <option value="UG I">UG I</option>
                <option value="UG II">UG II</option>
                <option value="UG III">UG III</option>
                <option value="PG I">PG I</option>
                <option value="PG II">PG II</option>
                <option value="10th FC">10th FC</option>
                <option value="PUC FC">PUC FC</option>
                <option value="UG FC">UG FC</option>
                <option value="PG FC">PG FC</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Gender</label>
              <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-[#060C18] border border-[#1E2D45] rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#E5B869]/50 transition">
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>

            <div className="pt-4 flex gap-3">
              <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-gray-400 border border-[#1E2D45] hover:border-gray-500 transition">Cancel</button>
              <button type="submit" disabled={isSubmitting} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black bg-[#E5B869] hover:bg-[#F5D075] transition disabled:opacity-50">
                {isSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Student | null>(null);
  const [editTarget, setEditTarget] = useState<Student | null>(null);

  const fetchStudents = () => {
    setLoading(true);
    fetch("/api/admin/students").then((r) => r.json()).then((d) => { if (d.success) setStudents(d.students); }).finally(() => setLoading(false));
  };

  useEffect(() => { fetchStudents(); }, []);

  const filtered = students.filter((s) => [s.name, s.email, s.username, s.studentClass].some((v) => v?.toLowerCase().includes(search.toLowerCase())));

  const handleResetPassword = async (student: Student) => {
    if (!confirm(`Reset ${student.name||student.email}s password requirement?`)) return;
    await fetch(`/api/admin/students/${student.id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ resetPassword: true }) });
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>Students</h1>
          <p className="text-sm text-gray-500 mt-1">{students.length} student{students.length!==1?"s":""} registered</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_4px_16px_rgba(229,184,105,0.3)] transition">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or username..." className="w-full bg-[#0B1525] border border-[#1E2D45] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-gray-600 outline-none focus:border-[#E5B869]/40 transition" />
        </div>
        <button onClick={fetchStudents} className="p-2.5 rounded-xl bg-[#0B1525] border border-[#1E2D45] text-gray-400 hover:text-white hover:border-[#E5B869]/30 transition">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#E5B869]/8 border border-[#E5B869]/20">
        <BookOpen className="w-4 h-4 text-[#E5B869] shrink-0" />
        <p className="text-xs text-gray-300">
          Credentials are issued by the school/college. Initial password = student&apos;s <strong className="text-[#E5B869]">Date of Birth (DDMMYYYY)</strong>. Students must change it on first login.
        </p>
      </div>

      <div className="rounded-2xl border border-[#1E2D45] overflow-hidden bg-[#0B1525]">
        {loading ? (
          <div className="p-12 flex justify-center"><div className="w-8 h-8 border-2 border-[#E5B869] border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">{search ? "No students match your search." : "No students yet. Add your first student!"}</p>
            {!search && <button onClick={() => setShowAddModal(true)} className="mt-4 text-xs text-[#E5B869] hover:underline flex items-center gap-1 mx-auto"><Plus className="w-3 h-3" /> Add Student</button>}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px]">
              <thead>
                <tr className="border-b border-[#1E2D45]">
                  {["Student","Class","Username","Enrollments","Status","Joined","Actions"].map((h) => (
                    <th key={h} className="text-left px-4 py-3 text-[11px] text-gray-500 font-semibold uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#1E2D45]/50">
                {filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-white/2 transition">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#E5B869]/30 to-[#C69234]/20 flex items-center justify-center text-[#E5B869] text-xs font-bold shrink-0">
                          {(s.name||s.email)?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-white">{s.name||"—"}</div>
                          <div className="text-xs text-gray-500 flex items-center gap-1"><Mail className="w-2.5 h-2.5" /> {s.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">{s.studentClass || "—"}</td>
                    <td className="px-4 py-3.5 text-xs text-gray-400">@{s.username}</td>
                    <td className="px-4 py-3.5 text-sm text-gray-300">{s.enrollments.length}</td>
                    <td className="px-4 py-3.5">
                      {s.mustChangePassword
                        ? <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/20 whitespace-nowrap"><Clock className="w-2.5 h-2.5" /> Pending Setup</span>
                        : <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20"><CheckCircle className="w-2.5 h-2.5" /> Active</span>}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500 whitespace-nowrap">{new Date(s.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => setEditTarget(s)} title="Edit student" className="p-1.5 rounded-lg text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition"><Edit className="w-3.5 h-3.5" /></button>
                        <button onClick={() => handleResetPassword(s)} title="Reset password" className="p-1.5 rounded-lg text-gray-500 hover:text-amber-400 hover:bg-amber-500/10 transition"><RefreshCw className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeleteTarget(s)} title="Delete student" className="p-1.5 rounded-lg text-gray-500 hover:text-red-400 hover:bg-red-500/10 transition"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showAddModal && <AddStudentModal onClose={() => setShowAddModal(false)} onSuccess={fetchStudents} />}
      {editTarget && <EditStudentModal student={editTarget} onClose={() => setEditTarget(null)} onSuccess={fetchStudents} />}
      {deleteTarget && <DeleteConfirmModal student={deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={fetchStudents} />}
    </div>
  );
}
