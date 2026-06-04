import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Mail, Building2, Hash, Shield, Edit2, Lock, Palette, Loader2,
  User, Briefcase, GitBranch, Phone, Calendar, ChevronRight, Eye, EyeOff,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/api/authApi";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

/* ─── dark token map ── */
const useDT = (isDark: boolean) => ({
  surface:      isDark ? "#1a0d30"                    : "#ffffff",
  surfaceSub:   isDark ? "#160a2a"                    : "rgba(243,233,251,0.35)",
  border:       isDark ? "rgba(139,92,192,0.18)"      : "rgba(91,30,122,0.09)",
  text:         isDark ? "#e8d5f8"                    : "#1a0630",
  textMuted:    isDark ? "#a78cc0"                    : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"                    : "#C4B5D4",
  shadow:       isDark
    ? "0 1px 4px rgba(0,0,0,0.4), 0 8px 32px rgba(0,0,0,0.3)"
    : "0 1px 4px rgba(91,30,122,0.07), 0 8px 32px rgba(91,30,122,0.06)",
  infoRowBorder:isDark ? "rgba(139,92,192,0.08)"      : "rgba(91,30,122,0.05)",
  infoIconBg:   isDark ? "rgba(139,92,192,0.1)"       : "rgba(91,30,122,0.06)",
  infoIconColor:isDark ? "#c4b5fd"                    : "#7B3A9E",
  chipBg:       isDark ? "rgba(139,92,192,0.12)"      : "rgba(91,30,122,0.06)",
  chipColor:    isDark ? "#c4b5fd"                    : "#7B3A9E",
  chipBorder:   isDark ? "rgba(139,92,192,0.22)"      : "rgba(91,30,122,0.1)",
  settingHov:   isDark ? "rgba(139,92,192,0.06)"      : "rgba(91,30,122,0.04)",
  signedInBg:   isDark
    ? "linear-gradient(135deg,rgba(91,30,122,0.15) 0%,rgba(200,151,58,0.08) 100%)"
    : "linear-gradient(135deg,rgba(91,30,122,0.05) 0%,rgba(200,151,58,0.05) 100%)",
  signedInBd:   isDark ? "rgba(139,92,192,0.15)"      : "rgba(91,30,122,0.08)",
  inputBg:      isDark ? "#160a2a"                    : "hsl(280 40% 97%)",
  inputBorder:  isDark ? "rgba(139,92,192,0.25)"      : "hsl(280 20% 88%)",
  dialogBg:     isDark ? "#1a0d30"                    : "#ffffff",
  dialogBorder: isDark ? "rgba(139,92,192,0.2)"       : "rgba(91,30,122,0.12)",
  dialogShadow: isDark ? "0 8px 40px rgba(0,0,0,0.6)" : "0 8px 40px rgba(91,30,122,0.2)",
  noteBg:       isDark ? "rgba(139,92,192,0.08)"      : "rgba(91,30,122,0.05)",
  noteTx:       isDark ? "#a78cc0"                    : "#9B59B6",
  cancelBg:     isDark ? "rgba(139,92,192,0.08)"      : "",
  cancelBd:     isDark ? "rgba(139,92,192,0.25)"      : "rgba(91,30,122,0.2)",
  cancelTx:     isDark ? "#c4b5fd"                    : "#5B1E7A",
  labelTx:      isDark ? "#e8d5f8"                    : "#3d1052",
  labelStar:    "#EF4444",
  chevron:      isDark ? "rgba(139,92,192,0.5)"       : "#C4B5D4",
});

/* ─── role config ── */
const roleCfg: Record<string, { label: string; bg: string; text: string; border: string; darkBg: string; darkText: string; darkBorder: string }> = {
  super_admin: { label: "Super Admin", bg: "rgba(91,30,122,0.12)",  text: "#5B1E7A", border: "rgba(91,30,122,0.25)",  darkBg: "rgba(139,92,192,0.22)", darkText: "#e9d5ff", darkBorder: "rgba(139,92,192,0.4)"  },
  admin:       { label: "Admin",       bg: "rgba(200,151,58,0.15)", text: "#92400E", border: "rgba(200,151,58,0.3)",  darkBg: "rgba(200,151,58,0.15)", darkText: "#fcd34d", darkBorder: "rgba(200,151,58,0.3)"  },
  agent:       { label: "Agent",       bg: "rgba(59,130,246,0.1)",  text: "#1D4ED8", border: "rgba(59,130,246,0.2)",  darkBg: "rgba(59,130,246,0.15)", darkText: "#93c5fd", darkBorder: "rgba(59,130,246,0.3)"  },
  user:        { label: "User",        bg: "rgba(107,114,128,0.1)", text: "#4B5563", border: "rgba(107,114,128,0.2)", darkBg: "rgba(107,114,128,0.18)", darkText: "#d1d5db", darkBorder: "rgba(107,114,128,0.35)" },
};

const roleGradient: Record<string, string> = {
  super_admin: "linear-gradient(135deg,#4a1664 0%,#5B1E7A 50%,#7B3A9E 100%)",
  admin:       "linear-gradient(135deg,#78350F 0%,#C8973A 60%,#e4b85a 100%)",
  agent:       "linear-gradient(135deg,#1E40AF 0%,#3B82F6 60%,#60A5FA 100%)",
  user:        "linear-gradient(135deg,#4a1664 0%,#5B1E7A 50%,#7B3A9E 100%)",
};

/* ─── info row ── */
const InfoRow = ({ icon: Icon, label, value, isDark }: {
  icon: React.ElementType; label: string; value?: string | number | null; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <div className="flex items-center gap-3 py-3.5" style={{ borderBottom: `1px solid ${T.infoRowBorder}` }}>
      <div className="h-8 w-8 rounded-[8px] flex items-center justify-center shrink-0" style={{ background: T.infoIconBg }}>
        <Icon className="h-3.5 w-3.5" style={{ color: T.infoIconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold uppercase tracking-[0.08em]" style={{ color: T.textMuted }}>{label}</p>
        <p className="text-[13px] font-medium mt-0.5" style={{ color: value ? T.text : T.textFaint }}>{value || "—"}</p>
      </div>
    </div>
  );
};

/* ─── setting row ── */
const SettingRow = ({ icon: Icon, iconBg, iconColor, title, desc, onClick, isDark }: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; desc: string; onClick?: () => void; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-3.5 rounded-[10px] text-left transition-colors"
      style={{ background: "transparent" }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = T.settingHov)}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "transparent")}>
      <div className="h-9 w-9 rounded-[9px] flex items-center justify-center shrink-0"
        style={{ background: isDark ? `${iconColor}22` : iconBg }}>
        <Icon className="h-4 w-4" style={{ color: iconColor }} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold" style={{ color: T.text }}>{title}</p>
        <p className="text-[11px]" style={{ color: T.textMuted }}>{desc}</p>
      </div>
      <ChevronRight className="h-4 w-4 shrink-0" style={{ color: T.chevron }} />
    </button>
  );
};

/* ─── styled input ── */
const StyledInput = ({ id, value, onChange, placeholder, disabled, type = "text", isDark }: {
  id?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; disabled?: boolean; type?: string; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <input id={id} value={value} onChange={e => onChange(e.target.value)}
      placeholder={placeholder} disabled={disabled} type={type}
      className="w-full h-9 px-3 text-[13px] rounded-[9px] outline-none transition-all disabled:opacity-50"
      style={{ background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.text, fontFamily: "inherit" }}
      onFocus={e => {
        e.target.style.borderColor = isDark ? "rgba(139,92,192,0.6)" : "rgba(91,30,122,0.45)";
        e.target.style.background = isDark ? "#1a0d30" : "#fff";
        e.target.style.boxShadow = isDark ? "0 0 0 3px rgba(139,92,192,0.12)" : "0 0 0 3px rgba(91,30,122,0.09)";
      }}
      onBlur={e => {
        e.target.style.borderColor = T.inputBorder;
        e.target.style.boxShadow = "none";
        if (!value) e.target.style.background = T.inputBg;
      }}
    />
  );
};

/* ─── password input ── */
const PasswordInput = ({ id, value, onChange, placeholder, isDark }: {
  id?: string; value: string; onChange: (v: string) => void; placeholder?: string; isDark: boolean;
}) => {
  const T = useDT(isDark);
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        id={id} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} type={show ? "text" : "password"}
        className="w-full h-9 pl-3 pr-9 text-[13px] rounded-[9px] outline-none transition-all"
        style={{ background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.text, fontFamily: "inherit" }}
        onFocus={e => {
          e.target.style.borderColor = isDark ? "rgba(139,92,192,0.6)" : "rgba(91,30,122,0.45)";
          e.target.style.background = isDark ? "#1a0d30" : "#fff";
          e.target.style.boxShadow = isDark ? "0 0 0 3px rgba(139,92,192,0.12)" : "0 0 0 3px rgba(91,30,122,0.09)";
        }}
        onBlur={e => {
          e.target.style.borderColor = T.inputBorder;
          e.target.style.boxShadow = "none";
          if (!value) e.target.style.background = T.inputBg;
        }}
      />
      <button
        type="button"
        onClick={() => setShow(s => !s)}
        className="absolute right-2.5 top-1/2 -translate-y-1/2 transition-opacity hover:opacity-70"
        style={{ color: T.textMuted }}
        tabIndex={-1}
      >
        {show ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
      </button>
    </div>
  );
};

/* ─── main ── */
const ProfilePage = () => {
  const { user: authUser } = useAuth();
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [profile, setProfile] = useState<any>(authUser);
  const [loading, setLoading] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving]     = useState(false);
  const [editForm, setEditForm] = useState({ name: "", designation: "", branchCode: "", department: "" });

  const [pwOpen, setPwOpen]     = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwForm, setPwForm]     = useState({ current: "", newPw: "", confirm: "" });

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    try { const data = await authApi.getProfile(); setProfile(data); }
    catch { toast.error("Failed to load profile"); }
    finally { setLoading(false); }
  };

  const openEdit = () => {
    setEditForm({
      name:        profile?.name        || "",
      designation: profile?.designation || "",
      branchCode:  profile?.branchCode  || "",
      department:  profile?.department?.name || profile?.departmentId?.toString() || "",
    });
    setEditOpen(true);
  };

  const handleSave = async () => {
    if (!editForm.name.trim()) { toast.error("Name is required"); return; }
    setSaving(true);
    try {
      const updated = await authApi.updateProfile({
        name: editForm.name, designation: editForm.designation || undefined,
        branchCode: editForm.branchCode || undefined, department: editForm.department || undefined,
      });
      setProfile((prev: any) => ({ ...prev, ...updated, ...editForm }));
      toast.success("Profile updated successfully");
      setEditOpen(false);
    } catch { toast.error("Failed to update profile"); }
    finally { setSaving(false); }
  };

  const openChangePassword = () => { setPwForm({ current: "", newPw: "", confirm: "" }); setPwOpen(true); };

  const handleChangePassword = async () => {
    if (!pwForm.current.trim()) { toast.error("Current password is required"); return; }
    if (!pwForm.newPw.trim())   { toast.error("New password is required");     return; }
    if (pwForm.newPw !== pwForm.confirm) { toast.error("Passwords do not match"); return; }
    if (pwForm.newPw.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setPwSaving(true);
    try {
      await authApi.changePassword({ currentPassword: pwForm.current, newPassword: pwForm.newPw });
      toast.success("Password changed successfully");
      setPwOpen(false);
    } catch { toast.error("Failed to change password"); }
    finally { setPwSaving(false); }
  };

  const initials    = profile?.name?.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const role        = profile?.role || authUser?.role || "user";
  const rcfg        = roleCfg[role]     || roleCfg.user;
  const grad        = roleGradient[role] || roleGradient.user;
  const joinedAt    = profile?.createdAt || profile?.created_at;
  const joinedLabel = joinedAt
    ? new Date(joinedAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const AVATAR_SIZE = 80;
  const AVATAR_HANG = AVATAR_SIZE / 2;
  const CONTENT_PT  = AVATAR_HANG + 12;

  return (
    <div className="space-y-5" style={{ transition: "background 0.3s, color 0.3s" }}>

      {/* Page header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: T.text }}>Profile</h1>
        <p className="text-[13px] mt-0.5" style={{ color: T.textMuted }}>Manage your account information and settings</p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#7B3A9E" }} />
          <p className="text-[13px]" style={{ color: T.textMuted }}>Loading profile…</p>
        </div>
      ) : (
        <>
          {/* ── HERO CARD ── */}
          <div
            className="rounded-[16px] w-full transition-colors duration-300"
            style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
          >
            {/* Banner */}
            <div className="relative w-full rounded-t-[16px]" style={{ height: 130, background: grad }}>
  <div className="pointer-events-none absolute top-0 right-0 h-36 w-36 rounded-full opacity-15"
    style={{ background: "radial-gradient(circle, white, transparent)" }} />

              <button
                onClick={openEdit}
                className="absolute top-4 right-4 flex items-center gap-1.5 h-8 px-3.5 rounded-[8px] text-[12px] font-semibold"
                style={{
                  background: "rgba(255,255,255,0.18)",
                  border: "1px solid rgba(255,255,255,0.35)",
                  color: "#fff",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.28)")}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)")}
              >
                <Edit2 className="h-3.5 w-3.5" /> Edit Profile
              </button>

              <div
                className="absolute left-6 flex items-center justify-center text-white font-bold select-none"
                style={{
                  bottom: -AVATAR_HANG, width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: 16,
                  fontSize: "1.5rem", background: grad, zIndex: 10,
                  boxShadow: isDark
                    ? "0 0 0 4px #1a0d30, 0 0 0 5.5px rgba(139,92,192,0.3), 0 6px 20px rgba(0,0,0,0.4)"
                    : "0 0 0 4px #fff, 0 0 0 5.5px rgba(91,30,122,0.18), 0 6px 20px rgba(91,30,122,0.25)",
                }}
              >
                {initials}
              </div>
            </div>

            {/* Content */}
            <div className="px-6 pb-6" style={{ paddingTop: CONTENT_PT }}>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h2 className="text-[20px] font-bold" style={{ color: T.text }}>
                  {profile?.name || "User"}
                </h2>
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                  style={{
                    background: isDark ? rcfg.darkBg : rcfg.bg,
                    color: isDark ? rcfg.darkText : rcfg.text,
                    border: `1px solid ${isDark ? rcfg.darkBorder : rcfg.border}`,
                  }}>
                  {rcfg.label}
                </span>
                {profile?.status === "active" && (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: "#10B981" }}>
                    <span className="h-1.5 w-1.5 rounded-full bg-green-400 animate-pulse" /> Active
                  </span>
                )}
              </div>

              <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>{profile?.email}</p>

              <div className="flex flex-wrap gap-2 mt-3">
                {[
                  { show: profile?.designation,  icon: Briefcase, label: profile?.designation },
                  { show: profile?.employeeId,   icon: Hash,      label: `ID ${profile?.employeeId}` },
                  { show: profile?.branchCode,   icon: GitBranch, label: `Branch ${profile?.branchCode}` },
                  { show: joinedLabel,            icon: Calendar,  label: `Joined ${joinedLabel}` },
                ].filter(c => c.show).map((c, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1 rounded-full"
                    style={{ background: T.chipBg, color: T.chipColor, border: `1px solid ${T.chipBorder}` }}>
                    <c.icon className="h-3 w-3" /> {c.label}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ── TWO-COLUMN GRID ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 w-full items-start">

            {/* Personal Information */}
            <div className="rounded-[14px] transition-colors duration-300"
              style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(91,30,122,0.05)" }}>
              <div className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceSub }}>
                <h3 className="text-[13px] font-semibold" style={{ color: T.text }}>Personal Information</h3>
                <button onClick={openEdit} className="text-[12px] font-medium hover:opacity-70 transition-opacity"
                  style={{ color: isDark ? "#c4b5fd" : "#7B3A9E" }}>Edit</button>
              </div>
              <div className="px-5">
                <InfoRow icon={User}      label="Full Name"   value={profile?.name}        isDark={isDark} />
                <InfoRow icon={Mail}      label="Email"       value={profile?.email}       isDark={isDark} />
                {profile?.phone && <InfoRow icon={Phone} label="Phone" value={profile.phone} isDark={isDark} />}
                <InfoRow icon={Hash}      label="Employee ID" value={profile?.employeeId}  isDark={isDark} />
                <InfoRow icon={Briefcase} label="Designation" value={profile?.designation} isDark={isDark} />
                <InfoRow icon={Building2} label="Department"
                  value={profile?.department?.name || (profile?.departmentId ? `Dept. ${profile.departmentId}` : null)}
                  isDark={isDark} />
                <InfoRow icon={GitBranch} label="Branch Code" value={profile?.branchCode}  isDark={isDark} />
                {profile?.organization && <InfoRow icon={Building2} label="Organization" value={profile.organization} isDark={isDark} />}
              </div>
            </div>

            {/* Account Settings */}
            <div className="rounded-[14px] transition-colors duration-300"
              style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(91,30,122,0.05)" }}>
              <div className="px-5 py-4" style={{ borderBottom: `1px solid ${T.border}`, background: T.surfaceSub }}>
                <h3 className="text-[13px] font-semibold" style={{ color: T.text }}>Account Settings</h3>
              </div>

              <div className="p-3 space-y-0.5">
                <SettingRow
                  icon={Lock} iconBg="rgba(91,30,122,0.1)" iconColor="#5B1E7A"
                  title="Change Password" desc="Update your account password"
                  onClick={openChangePassword} isDark={isDark}
                />
              </div>

              <div className="mx-4" style={{ borderTop: `1px solid ${T.border}` }} />

              {/* Signed-in-as */}
              <div className="p-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] mb-3" style={{ color: T.textMuted }}>
                  Signed in as
                </p>
                <div className="flex items-center gap-3 p-3 rounded-[12px]"
                  style={{ background: T.signedInBg, border: `1px solid ${T.signedInBd}` }}>
                  <div className="h-10 w-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                    style={{ background: grad, boxShadow: "0 2px 8px rgba(91,30,122,0.2)" }}>
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: T.text }}>{profile?.name}</p>
                    <p className="text-[11px] truncate" style={{ color: T.textMuted }}>{profile?.email}</p>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    style={{
                      background: isDark ? rcfg.darkBg : rcfg.bg,
                      color: isDark ? rcfg.darkText : rcfg.text,
                      border: `1px solid ${isDark ? rcfg.darkBorder : rcfg.border}`,
                    }}>
                    {rcfg.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Edit Profile Dialog ── */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md rounded-[16px]"
          style={{ background: T.dialogBg, boxShadow: T.dialogShadow, border: `1px solid ${T.dialogBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: T.text }}>Edit Profile</DialogTitle>
            <DialogDescription style={{ color: T.textMuted }}>Update your personal information below.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { id: "edit-name",        label: "Full Name",    key: "name",        placeholder: "Your full name",          required: true  },
              { id: "edit-designation", label: "Designation",  key: "designation", placeholder: "e.g. Software Engineer",  required: false },
              { id: "edit-department",  label: "Department",   key: "department",  placeholder: "e.g. Engineering",        required: false },
              { id: "edit-branch",      label: "Branch Code",  key: "branchCode",  placeholder: "e.g. KHI-001",           required: false },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <label className="text-[12px] font-semibold block" style={{ color: T.labelTx }}>
                  {f.label} {f.required && <span style={{ color: T.labelStar }}>*</span>}
                </label>
                <StyledInput
                  id={f.id}
                  value={editForm[f.key as keyof typeof editForm]}
                  onChange={v => setEditForm(fm => ({ ...fm, [f.key]: v }))}
                  placeholder={f.placeholder}
                  isDark={isDark}
                />
              </div>
            ))}
            <p className="text-[11px] p-3 rounded-[8px]" style={{ background: T.noteBg, color: T.noteTx }}>
              Email and Employee ID cannot be changed. Contact admin for assistance.
            </p>
          </div>
          <DialogFooter>
            <button onClick={() => setEditOpen(false)} disabled={saving}
              className="h-9 px-4 rounded-[9px] text-[13px] font-medium transition-all disabled:opacity-50"
              style={{ background: T.cancelBg, border: `1px solid ${T.cancelBd}`, color: T.cancelTx }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.06)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = T.cancelBg || "")}>
              Cancel
            </button>
            <button onClick={handleSave} disabled={saving}
              className="h-9 px-5 rounded-[9px] text-[13px] font-semibold text-white flex items-center gap-2 disabled:opacity-60 min-w-[120px] justify-center"
              style={{ background: "linear-gradient(135deg,#5B1E7A,#7B3A9E)", boxShadow: "0 2px 8px rgba(91,30,122,0.3)" }}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Change Password Dialog ── */}
      <Dialog open={pwOpen} onOpenChange={setPwOpen}>
        <DialogContent className="sm:max-w-md rounded-[16px]"
          style={{ background: T.dialogBg, boxShadow: T.dialogShadow, border: `1px solid ${T.dialogBorder}` }}>
          <DialogHeader>
            <DialogTitle style={{ color: T.text }}>Change Password</DialogTitle>
            <DialogDescription style={{ color: T.textMuted }}>Enter your current password and choose a new one.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {[
              { id: "pw-current", label: "Current Password", key: "current", placeholder: "Enter current password" },
              { id: "pw-new",     label: "New Password",     key: "newPw",   placeholder: "Enter new password"     },
              { id: "pw-confirm", label: "Confirm Password", key: "confirm", placeholder: "Confirm new password"   },
            ].map(f => (
              <div key={f.id} className="space-y-1.5">
                <label className="text-[12px] font-semibold block" style={{ color: T.labelTx }}>
                  {f.label} <span style={{ color: T.labelStar }}>*</span>
                </label>
                <PasswordInput
                  id={f.id}
                  value={pwForm[f.key as keyof typeof pwForm]}
                  onChange={v => setPwForm(fm => ({ ...fm, [f.key]: v }))}
                  placeholder={f.placeholder}
                  isDark={isDark}
                />
              </div>
            ))}
            <p className="text-[11px] p-3 rounded-[8px]" style={{ background: T.noteBg, color: T.noteTx }}>
              Password must be at least 6 characters long.
            </p>
          </div>
          <DialogFooter>
            <button onClick={() => setPwOpen(false)} disabled={pwSaving}
              className="h-9 px-4 rounded-[9px] text-[13px] font-medium transition-all disabled:opacity-50"
              style={{ background: T.cancelBg, border: `1px solid ${T.cancelBd}`, color: T.cancelTx }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.background = isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.06)")}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background = T.cancelBg || "")}>
              Cancel
            </button>
            <button onClick={handleChangePassword} disabled={pwSaving}
              className="h-9 px-5 rounded-[9px] text-[13px] font-semibold text-white flex items-center gap-2 disabled:opacity-60 min-w-[140px] justify-center"
              style={{ background: "linear-gradient(135deg,#5B1E7A,#7B3A9E)", boxShadow: "0 2px 8px rgba(91,30,122,0.3)" }}>
              {pwSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              {pwSaving ? "Updating…" : "Update Password"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilePage;