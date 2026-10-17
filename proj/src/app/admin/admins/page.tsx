"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Shield,
  Plus,
  Search,
  Trash2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  X,
  Mail,
  User,
  KeyRound,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  Copy,
  Check,
  Calendar,
} from "lucide-react";

interface AdminRecord {
  id: string;
  name: string | null;
  email: string;
  username: string;
  emailVerified: boolean;
  mustChangePassword: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function AdminsManagementPage() {
  const [admins, setAdmins] = useState<AdminRecord[]>([]);
  const [currentAdminId, setCurrentAdminId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Secret token gate state
  const [secretKey, setSecretKey] = useState<string>("");
  const [editingKey, setEditingKey] = useState<string>("");
  const [isEditingKey, setIsEditingKey] = useState<boolean>(false);
  const [savingKey, setSavingKey] = useState<boolean>(false);
  const [showSecretKey, setShowSecretKey] = useState<boolean>(false);
  const [copiedKeyUrl, setCopiedKeyUrl] = useState<boolean>(false);
  const [copiedRawKey, setCopiedRawKey] = useState<boolean>(false);

  // Form state
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchAdmins = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/admins");
      const data = await res.json();
      if (data.success) {
        setAdmins(data.admins || []);
        if (data.currentAdminId) setCurrentAdminId(data.currentAdminId);
      } else {
        setActionError(data.error || "Failed to load administrators.");
      }
    } catch {
      setActionError("Network error while loading administrators.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSecretKey = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/secret-key");
      const data = await res.json();
      if (data.success && data.secretKey) {
        setSecretKey(data.secretKey);
        setEditingKey(data.secretKey);
      }
    } catch {
      // silent fail or handled by page
    }
  }, []);

  useEffect(() => {
    fetchAdmins();
    fetchSecretKey();
  }, [fetchAdmins, fetchSecretKey]);

  const handleSaveSecretKey = async () => {
    if (!editingKey.trim()) {
      setActionError("Secret key cannot be empty.");
      return;
    }
    setSavingKey(true);
    setActionError(null);
    try {
      const res = await fetch("/api/admin/secret-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secretKey: editingKey.trim() }),
      });
      const data = await res.json();
      if (data.success) {
        setSecretKey(data.secretKey);
        setIsEditingKey(false);
        setActionSuccess("Admin Portal Secret Key updated successfully! Access via the new link.");
      } else {
        setActionError(data.error || "Failed to update secret key.");
      }
    } catch {
      setActionError("Network error while saving secret key.");
    } finally {
      setSavingKey(false);
    }
  };

  const generateRandomSecretKey = () => {
    const chars = "abcdefghjkmnpqrstuvwxyz23456789";
    let rand = "";
    for (let i = 0; i < 16; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    const newKey = `sg-portal-${rand}`;
    setEditingKey(newKey);
    setIsEditingKey(true);
  };

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*";
    let pass = "";
    for (let i = 0; i < 12; i++) {
      pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormPassword(pass);
  };

  const handleOpenModal = () => {
    setFormName("");
    setFormEmail("");
    setFormUsername("");
    setFormPassword("");
    setFormError(null);
    setShowPassword(false);
    setShowAddModal(true);
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!formEmail.trim()) {
      setFormError("Email is required.");
      return;
    }
    if (!formUsername.trim()) {
      setFormError("Username is required.");
      return;
    }
    if (!formPassword || formPassword.length < 6) {
      setFormError("Password must be at least 6 characters long.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formName.trim(),
          email: formEmail.trim(),
          username: formUsername.trim(),
          password: formPassword,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(`Admin "${data.admin.name || data.admin.username}" created successfully.`);
        setShowAddModal(false);
        fetchAdmins();
      } else {
        setFormError(data.error || "Failed to create administrator.");
      }
    } catch {
      setFormError("An unexpected network error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAdmin = async (id: string) => {
    setIsDeleting(true);
    setActionError(null);
    try {
      const res = await fetch(`/api/admin/admins/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setActionSuccess(data.message || "Administrator removed successfully.");
        setDeleteConfirmId(null);
        fetchAdmins();
      } else {
        setActionError(data.error || "Failed to remove administrator.");
      }
    } catch {
      setActionError("Network error while removing administrator.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCopy = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  // Filtered admin records
  const filteredAdmins = admins.filter((a) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      (a.name && a.name.toLowerCase().includes(q)) ||
      a.email.toLowerCase().includes(q) ||
      a.username.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* ── Top Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/25 text-[#E5B869] text-xs font-bold tracking-widest uppercase mb-2">
            <Shield className="w-3.5 h-3.5" />
            <span>Platform Security</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: "Georgia, serif" }}>
            Admin Team & Access
          </h1>
          <p className="text-sm text-gray-400 mt-1">
            Manage system administrators, verify access credentials, and onboard authorized personnel.
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:scale-105 active:scale-95 transition-all shadow-[0_4px_20px_rgba(229,184,105,0.3)] cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Administrator</span>
        </button>
      </div>

      {/* ── Alerts ── */}
      {actionSuccess && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-sm">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-emerald-400/60 hover:text-emerald-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {actionError && (
        <div className="flex items-center justify-between p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{actionError}</span>
          </div>
          <button onClick={() => setActionError(null)} className="text-rose-400/60 hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Summary Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Admins */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1627]/50 to-[#080F1E] border border-[#E5B869]/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Total Administrators</div>
            <div className="text-3xl font-bold text-white mt-1">
              {loading ? "—" : admins.length}
            </div>
            <div className="text-[11px] text-[#E5B869] mt-0.5 font-medium">Full System Authority</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-[#E5B869]/10 border border-[#E5B869]/25 flex items-center justify-center text-[#E5B869]">
            <Shield className="w-6 h-6" />
          </div>
        </div>

        {/* Active & Verified */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1627]/50 to-[#080F1E] border border-[#E5B869]/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Verified Accounts</div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">
              {loading ? "—" : admins.filter((a) => a.emailVerified).length}
            </div>
            <div className="text-[11px] text-emerald-400/70 mt-0.5 font-medium">Authentication Active</div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400">
            <CheckCircle className="w-6 h-6" />
          </div>
        </div>

        {/* Current Active Session */}
        <div className="p-5 rounded-2xl bg-gradient-to-br from-[#0e1627]/50 to-[#080F1E] border border-[#E5B869]/20 shadow-[0_4px_20px_rgba(0,0,0,0.2)] flex items-center justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Current Session</div>
            <div className="text-sm font-bold text-white truncate max-w-[170px] mt-1">
              {admins.find((a) => a.id === currentAdminId)?.name || "Logged In Admin"}
            </div>
            <div className="text-[11px] text-gray-400 truncate max-w-[170px]">
              {admins.find((a) => a.id === currentAdminId)?.email || "Superuser"}
            </div>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#E5B869] to-[#C69234] flex items-center justify-center text-black font-bold">
            {(admins.find((a) => a.id === currentAdminId)?.name?.[0] || "A").toUpperCase()}
          </div>
        </div>
      </div>

      {/* ── Admin Portal Secret Access Key Card ── */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-[#0B1525] to-[#060C18] border border-[#E5B869]/30 shadow-[0_4px_30px_rgba(229,184,105,0.08)] space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E5B869]/10 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/30 flex items-center justify-center text-[#E5B869] shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-white flex items-center gap-2">
                <span>Secret Admin Portal Gate</span>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  Active Protection
                </span>
              </div>
              <p className="text-xs text-gray-400 mt-0.5">
                The public <code className="text-[#E5B869] font-mono">/admin</code> URL is hidden and returns <span className="text-rose-400 font-semibold">404 Not Found</span> to anyone without this secret key.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!isEditingKey ? (
              <button
                type="button"
                onClick={() => {
                  setEditingKey(secretKey);
                  setIsEditingKey(true);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-white bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer"
              >
                Change Key
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setEditingKey(secretKey);
                  setIsEditingKey(false);
                }}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 transition cursor-pointer"
              >
                Cancel
              </button>
            )}
            <button
              type="button"
              onClick={generateRandomSecretKey}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold text-black bg-[#E5B869] hover:brightness-110 transition cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Regenerate Key</span>
            </button>
          </div>
        </div>

        {/* Secret Key Input / Display */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
          {/* Secret Key */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide flex items-center justify-between">
              <span>Secret Gate Key</span>
              <span className="text-[10px] text-gray-500 lowercase">saved in database</span>
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showSecretKey ? "text" : "password"}
                  value={isEditingKey ? editingKey : secretKey}
                  onChange={(e) => setEditingKey(e.target.value)}
                  readOnly={!isEditingKey}
                  placeholder="Secret key..."
                  className={`w-full bg-[#080E1C] border ${isEditingKey ? "border-[#E5B869] shadow-[0_0_12px_rgba(229,184,105,0.2)]" : "border-[#1E2D45]"} rounded-xl pl-3 pr-10 py-2 text-xs font-mono text-white outline-none`}
                />
                <button
                  type="button"
                  onClick={() => setShowSecretKey(!showSecretKey)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition cursor-pointer"
                >
                  {showSecretKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isEditingKey ? (
                <button
                  type="button"
                  onClick={handleSaveSecretKey}
                  disabled={savingKey || !editingKey.trim()}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#F5D075] to-[#E5B869] hover:brightness-110 disabled:opacity-50 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {savingKey ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  <span>Save</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(secretKey);
                    setCopiedRawKey(true);
                    setTimeout(() => setCopiedRawKey(false), 2000);
                  }}
                  className="px-3 py-2 rounded-xl text-xs font-medium text-gray-300 bg-white/5 hover:bg-white/10 border border-white/10 transition cursor-pointer flex items-center gap-1.5 shrink-0"
                >
                  {copiedRawKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRawKey ? "Copied" : "Copy"}</span>
                </button>
              )}
            </div>
          </div>

          {/* Secret Portal URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
              Direct Admin Access Link
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                readOnly
                value={typeof window !== "undefined" ? `${window.location.origin}/admin?key=${secretKey}` : `/admin?key=${secretKey}`}
                className="flex-1 bg-[#080E1C] border border-[#1E2D45] rounded-xl px-3 py-2 text-xs font-mono text-[#E5B869] truncate outline-none select-all"
              />
              <button
                type="button"
                onClick={() => {
                  const url = `${window.location.origin}/admin?key=${secretKey}`;
                  navigator.clipboard.writeText(url);
                  setCopiedKeyUrl(true);
                  setTimeout(() => setCopiedKeyUrl(false), 2000);
                }}
                className="px-3.5 py-2 rounded-xl text-xs font-bold text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:brightness-110 shadow-[0_2px_12px_rgba(229,184,105,0.25)] transition cursor-pointer flex items-center gap-1.5 shrink-0"
              >
                {copiedKeyUrl ? <Check className="w-3.5 h-3.5 text-black" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKeyUrl ? "Link Copied!" : "Copy Portal Link"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between p-3 rounded-2xl bg-[#080F1E] border border-[#E5B869]/15">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search administrators by name, email, or username..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#060C18] border border-white/5 rounded-xl text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#E5B869]/50 transition-colors"
          />
        </div>

        <button
          onClick={fetchAdmins}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-medium transition cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Administrators Grid / Table ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 border-2 border-[#E5B869] border-t-transparent rounded-full animate-spin" />
          <span className="text-xs text-gray-400">Loading administrator directory...</span>
        </div>
      ) : filteredAdmins.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-[#080F1E]/50 border border-white/5">
          <Shield className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-white">No administrators found</h3>
          <p className="text-xs text-gray-500 mt-1 max-w-sm mx-auto">
            {searchQuery ? "No admin records matched your search query." : "No administrators registered yet."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredAdmins.map((adm) => {
            const isSelf = adm.id === currentAdminId;
            const formattedDate = new Date(adm.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            });

            return (
              <div
                key={adm.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl bg-gradient-to-br from-[#0B1220] to-[#060A14] border transition-all duration-300 hover:-translate-y-1 shadow-[0_4px_20px_rgba(0,0,0,0.25)] ${
                  isSelf ? "border-[#E5B869]/50 shadow-[0_0_20px_rgba(229,184,105,0.15)]" : "border-[#E5B869]/20 hover:border-[#E5B869]/40"
                }`}
              >
                <div>
                  {/* Top badges */}
                  <div className="flex items-center justify-between gap-2 mb-4">
                    <span className="text-[10px] font-bold text-[#E5B869] tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#E5B869]/10 border border-[#E5B869]/25 flex items-center gap-1">
                      <Shield className="w-3 h-3" />
                      <span>ADMIN</span>
                    </span>

                    {isSelf ? (
                      <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 px-2.5 py-0.5 rounded-full">
                        You (Active)
                      </span>
                    ) : (
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-gray-500" />
                        <span>{formattedDate}</span>
                      </span>
                    )}
                  </div>

                  {/* Monogram Avatar & Name */}
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1E2D45] to-[#0A101C] border border-[#E5B869]/35 flex items-center justify-center text-lg font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D6] via-[#F5D075] to-[#D4A043] shrink-0 shadow-[0_0_15px_rgba(229,184,105,0.2)]">
                      {(adm.name?.[0] || adm.username[0] || "A").toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-base font-bold text-white truncate" title={adm.name || adm.username}>
                        {adm.name || "Administrator"}
                      </h3>
                      <div className="text-xs text-[#E5B869]/80 font-medium truncate">
                        @{adm.username}
                      </div>
                    </div>
                  </div>

                  {/* Email with copy button */}
                  <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-black/40 border border-white/5 mb-4">
                    <div className="flex items-center gap-2 min-w-0">
                      <Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="text-xs text-gray-300 truncate" title={adm.email}>
                        {adm.email}
                      </span>
                    </div>
                    <button
                      onClick={() => handleCopy(adm.email)}
                      className="p-1 rounded-md text-gray-400 hover:text-[#E5B869] transition shrink-0 cursor-pointer"
                      title="Copy email"
                    >
                      {copiedEmail === adm.email ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Footer Action */}
                <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">
                    ID: <span className="font-mono text-gray-400">{adm.id.slice(0, 8)}...</span>
                  </span>

                  {isSelf ? (
                    <span className="text-[11px] text-gray-500 italic">Self protected</span>
                  ) : deleteConfirmId === adm.id ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleDeleteAdmin(adm.id)}
                        disabled={isDeleting}
                        className="px-2.5 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white text-xs font-semibold transition cursor-pointer"
                      >
                        {isDeleting ? "..." : "Confirm"}
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-gray-300 text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setDeleteConfirmId(adm.id)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs text-rose-400/80 hover:text-rose-300 hover:bg-rose-500/10 transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Add Administrator Modal ── */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl bg-[#0B1220] border border-[#E5B869]/30 p-6 sm:p-7 shadow-[0_10px_40px_rgba(0,0,0,0.8)]">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#E5B869]/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#E5B869]/10 border border-[#E5B869]/25 flex items-center justify-center text-[#E5B869]">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Add Administrator</h3>
                  <p className="text-xs text-gray-400">Grant administrative access to platform</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Error Alert */}
            {formError && (
              <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateAdmin} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    placeholder="e.g. Jane Doe"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#060C18] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/50 transition"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    placeholder="e.g. admin@skillgrimoire.com"
                    value={formEmail}
                    onChange={(e) => {
                      setFormEmail(e.target.value);
                      if (!formUsername && e.target.value.includes("@")) {
                        setFormUsername(e.target.value.split("@")[0].toLowerCase().replace(/[^a-z0-9_]/g, ""));
                      }
                    }}
                    className="w-full pl-9 pr-3 py-2 bg-[#060C18] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/50 transition"
                  />
                </div>
              </div>

              {/* Username */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                  Username
                </label>
                <div className="relative">
                  <span className="text-gray-500 text-xs font-mono absolute left-3 top-1/2 -translate-y-1/2">@</span>
                  <input
                    type="text"
                    required
                    placeholder="username"
                    value={formUsername}
                    onChange={(e) => setFormUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    className="w-full pl-9 pr-3 py-2 bg-[#060C18] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/50 transition font-mono"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] text-[#E5B869] hover:underline flex items-center gap-1 cursor-pointer font-medium"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Secure</span>
                  </button>
                </div>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    minLength={6}
                    placeholder="Min 6 characters"
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className="w-full pl-9 pr-10 py-2 bg-[#060C18] border border-white/10 rounded-xl text-sm text-white placeholder-gray-600 focus:outline-none focus:border-[#E5B869]/50 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Info notice */}
              <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-[11px] text-gray-400 leading-relaxed flex items-start gap-2">
                <Lock className="w-3.5 h-3.5 text-[#E5B869] shrink-0 mt-0.5" />
                <span>
                  The new administrator will receive immediate access to the Skill Grimoire Admin Console. Share these credentials securely.
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl text-sm text-gray-400 hover:text-white transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-bold text-sm text-black bg-gradient-to-r from-[#F5D075] via-[#E5B869] to-[#C69234] hover:scale-105 active:scale-95 transition shadow-[0_4px_20px_rgba(229,184,105,0.3)] disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Save Administrator</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
