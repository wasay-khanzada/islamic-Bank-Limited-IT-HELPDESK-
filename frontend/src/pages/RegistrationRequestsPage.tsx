import { useState, useEffect } from "react";
import { Loader2, Check, X, UserPlus, Clock, Shield } from "lucide-react";
import { adminApi, RegistrationRequest } from "@/api/adminApi";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
};

const useDT = (isDark: boolean) => ({
  bg:           isDark ? "#0f0720"                    : "#ffffff",
  surface:      isDark ? "#1a0d30"                    : "#ffffff",
  border:       isDark ? "rgba(139,92,192,0.18)"      : "rgba(91,30,122,0.1)",
  borderStrong: isDark ? "rgba(139,92,192,0.30)"      : "rgba(91,30,122,0.18)",
  text:         isDark ? "#e8d5f8"                    : "#3d1052",
  textMuted:    isDark ? "#a78cc0"                    : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"                    : "#C4A8D8",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(91,30,122,0.06), 0 8px 24px rgba(91,30,122,0.06)",
  tableHead:    isDark ? "rgba(139,92,192,0.08)"      : "rgba(243,233,251,0.45)",
  rowHover:     isDark ? "rgba(139,92,192,0.06)"      : "rgba(243,233,251,0.35)",
  footer:       isDark ? "rgba(139,92,192,0.05)"      : "rgba(243,233,251,0.2)",
  monoBg:       isDark ? "rgba(139,92,192,0.15)"      : "rgba(91,30,122,0.06)",
  monoText:     isDark ? "#c4b5fd"                    : "#5B1E7A",
  monoTextFaint:isDark ? "rgba(139,92,192,0.4)"       : "#C4A8D8",
});

const roleCfg: Record<string, { label: string; bg: string; text: string; dot: string; darkBg: string; darkText: string; darkDot: string }> = {
  user:        { label: "User",        bg: "rgba(107,114,128,0.1)",  text: "#4B5563", dot: "#9CA3AF", darkBg: "rgba(107,114,128,0.15)", darkText: "#9ca3af", darkDot: "#9CA3AF" },
  agent:       { label: "Agent",       bg: "rgba(59,130,246,0.1)",   text: "#1D4ED8", dot: "#3B82F6", darkBg: "rgba(59,130,246,0.15)",  darkText: "#93c5fd", darkDot: "#3B82F6" },
  admin:       { label: "Admin",       bg: "rgba(200,151,58,0.12)",  text: "#92400E", dot: "#C8973A", darkBg: "rgba(200,151,58,0.15)",  darkText: "#fcd34d", darkDot: "#C8973A" },
  super_admin: { label: "Super Admin", bg: "rgba(91,30,122,0.12)",   text: "#5B1E7A", dot: "#7B3A9E", darkBg: "rgba(139,92,192,0.18)", darkText: "#c4b5fd", darkDot: "#9B59B6" },
};

const getInitials = (name: string) =>
  name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

const avatarColors = [
  "linear-gradient(135deg,#5B1E7A,#7B3A9E)",
  "linear-gradient(135deg,#7B3A9E,#9B59B6)",
  "linear-gradient(135deg,#4A0E6A,#6B2A8A)",
];

const COL_WIDTHS = {
  name:       200,
  email:      220,
  role:       110,
  employeeId: 120,
  requested:  130,
  actions:    160,
};

const RegistrationRequestsPage = () => {
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [requests, setRequests] = useState<RegistrationRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<number | null>(null);
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);

  useEffect(() => { fetchRequests(); }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getRegistrationRequests();
      setRequests(data);
    } catch { toast.error("Failed to load registration requests"); }
    finally { setLoading(false); }
  };

  const handleApprove = async (id: number) => {
    setActionId(id);
    try {
      await adminApi.approveRegistration(id);
      toast.success("User approved successfully");
      fetchRequests();
    } catch {}
    finally { setActionId(null); }
  };

  const handleReject = async (id: number) => {
    setActionId(id);
    try {
      await adminApi.rejectRegistration(id);
      toast.success("User rejected successfully");
      fetchRequests();
    } catch {}
    finally { setActionId(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in" style={{ transition: "background 0.3s, color 0.3s" }}>
      <style>{`
        @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .req-row { animation: fadeSlideIn 0.3s ease both; }
        .approve-btn { transition: all 0.15s ease; }
        .approve-btn:hover:not(:disabled) { background: #792da1 !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(121,45,161,0.4) !important; }
        .reject-btn { transition: all 0.15s ease; }
        .reject-btn:hover:not(:disabled) { background: #4e1c68ff !important; transform: translateY(-1px); box-shadow: 0 4px 12px rgba(78,28,104,0.4) !important; }
        .action-btn:active:not(:disabled) { transform: translateY(0) !important; }
        .reg-table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        .reg-table th {
          padding: 10px 16px;
          text-align: left;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          white-space: nowrap;
        }
        .reg-table th.th-actions { text-align: right; }
        .reg-table td {
          padding: 14px 16px;
          vertical-align: middle;
        }
        .reg-table td.td-actions { text-align: right; }
      `}</style>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center"
              style={{ background: isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.1)" }}>
              <Shield className="h-4 w-4" style={{ color: isDark ? "#c4b5fd" : "#5B1E7A" }} />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight" style={{ color: T.text }}>
              Registration Requests
            </h1>
          </div>
          <p className="text-[13px] pl-[42px]" style={{ color: T.textMuted }}>
            Review and manage pending user registrations
          </p>
        </div>

        {!loading && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl"
            style={{
              background: requests.length > 0
                ? isDark ? "rgba(139,92,192,0.15)" : "rgba(208,95,253,0.1)"
                : isDark ? "rgba(16,185,129,0.1)" : "rgba(16,185,129,0.08)",
              border: `1px solid ${requests.length > 0
                ? isDark ? "rgba(139,92,192,0.3)" : "rgba(233,80,220,0.25)"
                : isDark ? "rgba(16,185,129,0.25)" : "rgba(16,185,129,0.2)"}`,
            }}
          >
            <div className="h-2 w-2 rounded-full"
              style={{
                background: requests.length > 0 ? "#be47fdff" : "#10B981",
                boxShadow: requests.length > 0 ? "0 0 6px rgba(190,71,253,0.5)" : "0 0 6px rgba(16,185,129,0.5)",
              }}
            />
            <span className="text-[13px] font-semibold"
              style={{ color: requests.length > 0 ? (isDark ? "#c4b5fd" : "#6a298dff") : (isDark ? "#34d399" : "#065F46") }}>
              {requests.length > 0 ? `${requests.length} pending` : "All clear"}
            </span>
          </div>
        )}
      </div>

      {/* Table card */}
      <div
        className="rounded-2xl overflow-hidden transition-colors duration-300"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
      >
        {loading ? (
          <div className="flex flex-col items-center justify-center py-28 gap-3">
            <div className="h-10 w-10 rounded-full flex items-center justify-center"
              style={{ background: isDark ? "rgba(139,92,192,0.12)" : "rgba(91,30,122,0.07)" }}>
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#7B3A9E" }} />
            </div>
            <p className="text-[13px]" style={{ color: T.textMuted }}>Loading requests…</p>
          </div>
        ) : requests.length === 0 ? (
          <div className="py-28 text-center">
            <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
              style={{ background: isDark ? "rgba(139,92,192,0.1)" : "rgba(91,30,122,0.06)" }}>
              <UserPlus className="h-7 w-7" style={{ color: isDark ? "rgba(139,92,192,0.5)" : "#C4A8D8" }} />
            </div>
            <p className="text-[15px] font-semibold" style={{ color: T.text }}>All caught up!</p>
            <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>No pending registration requests</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="reg-table">
              <colgroup>
                <col style={{ width: COL_WIDTHS.name }} />
                <col style={{ width: COL_WIDTHS.email }} />
                <col style={{ width: COL_WIDTHS.role }} />
                <col style={{ width: COL_WIDTHS.employeeId }} />
                <col style={{ width: COL_WIDTHS.requested }} />
                <col style={{ width: COL_WIDTHS.actions }} />
              </colgroup>
              <thead>
                <tr style={{
                  background: T.tableHead,
                  borderBottom: `1px solid ${T.border}`,
                }}>
                  {["Name","Email","Role","Employee ID","Requested","Actions"].map((h, i) => (
                    <th key={h}
                      className={i === 5 ? "th-actions" : ""}
                      style={{ color: isDark ? "#a78cc0" : "#9B59B6" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {requests.map((req, idx) => {
                  const cfg = roleCfg[req.role] || roleCfg.user;
                  const isHovered = hoveredRow === req.id;
                  const isActing = actionId === req.id;

                  return (
                    <tr
                      key={req.id}
                      className="req-row"
                      style={{
                        background: isHovered ? T.rowHover : "transparent",
                        transition: "background 0.15s ease",
                        animationDelay: `${idx * 50}ms`,
                        borderBottom: `1px solid ${T.border}`,
                      }}
                      onMouseEnter={() => setHoveredRow(req.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                    >
                      {/* Name */}
                      <td>
                        <div className="flex items-center gap-3">
                          <div
                            className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-[11px] font-bold shrink-0 select-none"
                            style={{ background: avatarColors[idx % avatarColors.length] }}
                          >
                            {getInitials(req.name)}
                          </div>
                          <p className="text-[13px] font-semibold leading-tight truncate" style={{ color: T.text }}>
                            {req.name}
                          </p>
                        </div>
                      </td>

                      {/* Email */}
                      <td>
                        <span className="text-[13px] truncate block" style={{ color: isDark ? "#a78cc0" : "#6B7280" }}>
                          {req.email}
                        </span>
                      </td>

                      {/* Role */}
                      <td>
                        <span
                          className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                          style={{
                            background: isDark ? cfg.darkBg : cfg.bg,
                            color: isDark ? cfg.darkText : cfg.text,
                          }}
                        >
                          <span className="h-1.5 w-1.5 rounded-full shrink-0"
                            style={{ background: isDark ? cfg.darkDot : cfg.dot }} />
                          {cfg.label}
                        </span>
                      </td>

                      {/* Employee ID */}
                      <td>
                        <span
                          className="font-mono text-[12px] px-2 py-0.5 rounded-md"
                          style={{
                            background: T.monoBg,
                            color: req.employeeId ? T.monoText : T.monoTextFaint,
                          }}
                        >
                          {req.employeeId || "N/A"}
                        </span>
                      </td>

                      {/* Requested */}
                      <td>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3 w-3 shrink-0" style={{ color: "#C8973A" }} />
                          <span className="text-[12px]" style={{ color: T.textMuted }}>
                            {formatDate(req.createdAt)}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="td-actions">
                        <div className="flex items-center gap-2 justify-end">
                          <button
                            className="approve-btn action-btn flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: "#be47fdff",
                              boxShadow: "0 2px 6px rgba(190,71,253,0.3)",
                            }}
                            disabled={isActing}
                            onClick={() => handleApprove(req.id)}
                          >
                            {isActing
                              ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              : <Check className="h-3.5 w-3.5" />
                            }
                            Approve
                          </button>
                          <button
                            className="reject-btn action-btn flex items-center gap-1.5 h-8 px-3.5 rounded-lg text-[12px] font-semibold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                            style={{
                              background: "#6a298dff",
                              boxShadow: "0 2px 6px rgba(106,41,141,0.3)",
                            }}
                            disabled={isActing}
                            onClick={() => handleReject(req.id)}
                          >
                            <X className="h-3.5 w-3.5" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            {/* Footer */}
            <div
              className="px-5 py-3 flex items-center justify-between"
              style={{ borderTop: `1px solid ${T.border}`, background: T.footer }}
            >
              <span className="text-[11px]" style={{ color: T.textFaint }}>
                {requests.length} request{requests.length !== 1 ? "s" : ""} pending review
              </span>
              <span className="text-[11px]" style={{ color: T.textFaint }}>
                islamic Bank · IT Help Desk
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RegistrationRequestsPage;