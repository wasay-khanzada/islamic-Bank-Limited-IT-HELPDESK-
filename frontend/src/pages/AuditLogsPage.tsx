// src/pages/AuditLogsPage.tsx
import { useState, useEffect, useCallback } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  FileText, Search, Clock, User, Loader2,
  PlusCircle, RefreshCcw, UserCheck, Activity,
  MessageSquare, XCircle, LogIn, Shield, Trash2, Edit2,
} from "lucide-react";
import { auditApi, AuditLog } from "@/api/auditApi";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

/* ─── dark token map ── */
const useDT = (isDark: boolean) => ({
  surface:      isDark ? "#1a0d30"                    : "#ffffff",
  surfaceHover: isDark ? "rgba(139,92,192,0.07)"      : "rgba(243,233,251,0.2)",
  filterBg:     isDark ? "#160a2a"                    : "#ffffff",
  border:       isDark ? "rgba(139,92,192,0.18)"      : "rgba(91,30,122,0.09)",
  text:         isDark ? "#e8d5f8"                    : "#3d1052",
  textMuted:    isDark ? "#a78cc0"                    : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"                    : "#B07FD0",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(91,30,122,0.06), 0 4px 16px rgba(91,30,122,0.05)",
  timelineHead: isDark ? "rgba(139,92,192,0.08)"      : "rgba(243,233,251,0.4)",
  timelineIcon: isDark ? "#c4b5fd"                    : "#7B3A9E",
  timelineLabel:isDark ? "#c4b5fd"                    : "#7B3A9E",
  timelineLine: isDark ? "rgba(139,92,192,0.12)"      : "rgba(91,30,122,0.08)",
  statBg:       isDark ? "#1a0d30"                    : "#ffffff",
  statBorder:   isDark ? "rgba(139,92,192,0.18)"      : "rgba(91,30,122,0.09)",
  statTop:      isDark ? "#7B3A9E"                    : "#5B1E7A",
  statIcon:     isDark ? "rgba(139,92,192,0.12)"      : "rgba(91,30,122,0.08)",
  statIconColor:isDark ? "#c4b5fd"                    : "#5B1E7A",
  inputBg:      isDark ? "#160a2a"                    : "transparent",
  inputBorder:  isDark ? "rgba(139,92,192,0.2)"       : "rgba(91,30,122,0.09)",
  refreshBg:    isDark ? "rgba(139,92,192,0.1)"       : "rgba(91,30,122,0.07)",
  refreshBd:    isDark ? "rgba(139,92,192,0.2)"       : "rgba(91,30,122,0.12)",
  refreshTx:    isDark ? "#c4b5fd"                    : "#5B1E7A",
  countBg:      isDark ? "rgba(139,92,192,0.1)"       : "rgba(91,30,122,0.07)",
  countTx:      isDark ? "#c4b5fd"                    : "#5B1E7A",
  emptyBg:      isDark ? "rgba(139,92,192,0.06)"      : "rgba(91,30,122,0.06)",
  selectBg:     isDark ? "#160a2a"                    : "transparent",
});

/* ─── date helper ── */
const formatDate = (ds: string) => {
  const date      = new Date(ds);
  const now       = new Date();
  const diffMins  = Math.floor((now.getTime() - date.getTime()) / 60_000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays  = Math.floor(diffHours / 24);
  if (diffMins  < 1)   return "Just now";
  if (diffMins  < 60)  return `${diffMins} min ago`;
  if (diffHours < 24)  return `${diffHours}h ago`;
  if (diffDays  === 1) return "Yesterday";
  if (diffDays  < 7)   return `${diffDays}d ago`;
  return date.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" });
};

/* ─── action config ── */
type ActionCfg = {
  label: string; bg: string; text: string; border: string; icon: React.ElementType;
  darkBg: string; darkText: string; darkBorder: string;
};

const cfgMap: { match: string | RegExp; cfg: ActionCfg }[] = [
  { match: /assign/i,          cfg: { label: "Assigned",       bg: "rgba(91,30,122,0.10)", text: "#5B1E7A", border: "rgba(91,30,122,0.25)", icon: UserCheck,     darkBg: "rgba(139,92,192,0.18)", darkText: "#c4b5fd", darkBorder: "rgba(139,92,192,0.35)" } },
  { match: /comment/i,         cfg: { label: "Commented",      bg: "rgba(91,30,122,0.07)", text: "#7B3A9E", border: "rgba(91,30,122,0.18)", icon: MessageSquare, darkBg: "rgba(139,92,192,0.12)", darkText: "#d8b4fe", darkBorder: "rgba(139,92,192,0.25)" } },
  { match: /delete/i,          cfg: { label: "Deleted",        bg: "rgba(91,30,122,0.12)", text: "#3d1052", border: "rgba(91,30,122,0.30)", icon: Trash2,        darkBg: "rgba(139,92,192,0.20)", darkText: "#e9d5ff", darkBorder: "rgba(139,92,192,0.40)" } },
  { match: /resolv/i,          cfg: { label: "Resolved",       bg: "rgba(91,30,122,0.08)", text: "#5B1E7A", border: "rgba(91,30,122,0.20)", icon: FileText,      darkBg: "rgba(139,92,192,0.15)", darkText: "#c4b5fd", darkBorder: "rgba(139,92,192,0.30)" } },
  { match: /close/i,           cfg: { label: "Closed",         bg: "rgba(91,30,122,0.06)", text: "#7B3A9E", border: "rgba(91,30,122,0.15)", icon: XCircle,       darkBg: "rgba(139,92,192,0.10)", darkText: "#d8b4fe", darkBorder: "rgba(139,92,192,0.22)" } },
  { match: /status/i,          cfg: { label: "Status Changed", bg: "rgba(91,30,122,0.10)", text: "#5B1E7A", border: "rgba(91,30,122,0.25)", icon: RefreshCcw,    darkBg: "rgba(139,92,192,0.18)", darkText: "#c4b5fd", darkBorder: "rgba(139,92,192,0.35)" } },
  { match: /update/i,          cfg: { label: "Updated",        bg: "rgba(91,30,122,0.08)", text: "#5B1E7A", border: "rgba(91,30,122,0.20)", icon: Edit2,         darkBg: "rgba(139,92,192,0.15)", darkText: "#c4b5fd", darkBorder: "rgba(139,92,192,0.30)" } },
  { match: /creat|open/i,      cfg: { label: "Created",        bg: "rgba(91,30,122,0.10)", text: "#3d1052", border: "rgba(91,30,122,0.25)", icon: PlusCircle,    darkBg: "rgba(139,92,192,0.18)", darkText: "#e9d5ff", darkBorder: "rgba(139,92,192,0.35)" } },
  { match: /login/i,           cfg: { label: "Login",          bg: "rgba(91,30,122,0.07)", text: "#7B3A9E", border: "rgba(91,30,122,0.18)", icon: LogIn,         darkBg: "rgba(139,92,192,0.12)", darkText: "#d8b4fe", darkBorder: "rgba(139,92,192,0.25)" } },
  { match: /permission|role/i, cfg: { label: "Permission",     bg: "rgba(91,30,122,0.10)", text: "#5B1E7A", border: "rgba(91,30,122,0.25)", icon: Shield,        darkBg: "rgba(139,92,192,0.18)", darkText: "#c4b5fd", darkBorder: "rgba(139,92,192,0.35)" } },
];

const fallbackCfg: ActionCfg = {
  label: "Action", bg: "rgba(91,30,122,0.07)", text: "#5B1E7A", border: "rgba(91,30,122,0.15)", icon: Activity,
  darkBg: "rgba(139,92,192,0.12)", darkText: "#c4b5fd", darkBorder: "rgba(139,92,192,0.22)",
};

function classifyAction(action: string): ActionCfg {
  for (const { match, cfg } of cfgMap) {
    if (typeof match === "string" ? action.includes(match) : match.test(action)) return cfg;
  }
  return fallbackCfg;
}

const FILTER_OPTIONS = [
  { value: "all",     label: "All Actions"    },
  { value: "assign",  label: "Assigned"       },
  { value: "comment", label: "Commented"      },
  { value: "delete",  label: "Deleted"        },
  { value: "resolv",  label: "Resolved"       },
  { value: "close",   label: "Closed"         },
  { value: "status",  label: "Status Changed" },
  { value: "update",  label: "Updated"        },
  { value: "creat",   label: "Created"        },
  { value: "login",   label: "Login"          },
];

/* ─── stat card ── */
const StatCard = ({ title, value, icon: Icon, delay = 0, isDark }:
  { title: string; value: number; icon: React.ElementType; delay?: number; isDark: boolean }) => {
  const T = useDT(isDark);
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div
        className="flex items-center gap-3 p-4 rounded-[12px] hover-lift transition-colors duration-300"
        style={{
          background: T.statBg,
          border: `1px solid ${T.statBorder}`,
          boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(91,30,122,0.05)",
          borderTop: `2.5px solid ${T.statTop}`,
        }}
      >
        <div className="h-9 w-9 rounded-[9px] flex items-center justify-center shrink-0" style={{ background: T.statIcon }}>
          <Icon className="h-4 w-4" style={{ color: T.statIconColor }} />
        </div>
        <div>
          <p className="text-[1.4rem] font-bold leading-none" style={{ color: T.text }}>{value}</p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T.textMuted }}>{title}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── main ── */
const AuditLogsPage = () => {
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [search,       setSearch]       = useState("");
  const [actionFilter, setActionFilter] = useState("all");
  const [auditLogs,    setAuditLogs]    = useState<AuditLog[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [refreshing,   setRefreshing]   = useState(false);

  const fetchAuditLogs = useCallback(async (silent = false) => {
    try {
      silent ? setRefreshing(true) : setLoading(true);
      const data = await auditApi.getAllAuditLogs();
      setAuditLogs(data);
    } catch {}
    finally { setLoading(false); setRefreshing(false); }
  }, []);

  useEffect(() => { fetchAuditLogs(); }, [fetchAuditLogs]);

  const filtered = auditLogs.filter(log => {
    const action = (log.action ?? "").toLowerCase();
    const q      = search.toLowerCase();
    const matchSearch =
      action.includes(q) ||
      (log.user?.name  ?? "").toLowerCase().includes(q) ||
      (log.user?.email ?? "").toLowerCase().includes(q) ||
      (log.ticket?.subject ?? "").toLowerCase().includes(q);
    const matchFilter = actionFilter === "all" || action.includes(actionFilter);
    return matchSearch && matchFilter;
  });

  const todayCount  = auditLogs.filter(l => new Date(l.createdAt).toDateString() === new Date().toDateString()).length;
  const activeUsers = new Set(auditLogs.map(l => l.userId)).size;

  return (
    <div className="space-y-5 animate-fade-in" style={{ transition: "background 0.3s, color 0.3s" }}>

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: T.text }}>Audit Logs</h1>
          <p className="text-[13px] mt-0.5" style={{ color: T.textMuted }}>Track all system actions and changes</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchAuditLogs(true)}
            disabled={refreshing || loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all disabled:opacity-50"
            style={{ background: T.refreshBg, color: T.refreshTx, border: `1px solid ${T.refreshBd}` }}
          >
            <RefreshCcw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </button>
          {!loading && (
            <div
              className="flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-[8px]"
              style={{ background: T.countBg, color: T.countTx }}
            >
              <Activity className="h-3.5 w-3.5" />
              {filtered.length} log{filtered.length !== 1 ? "s" : ""}
            </div>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Actions" value={auditLogs.length} icon={FileText} delay={0}   isDark={isDark} />
        <StatCard title="Today"         value={todayCount}       icon={Clock}    delay={60}  isDark={isDark} />
        <StatCard title="Filtered"      value={filtered.length}  icon={Activity} delay={120} isDark={isDark} />
        <StatCard title="Users Active"  value={activeUsers}      icon={User}     delay={180} isDark={isDark} />
      </div>

      {/* Search / Filter */}
      <div
        className="flex flex-col sm:flex-row gap-3 rounded-[14px] overflow-hidden transition-colors duration-300"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(91,30,122,0.05)" }}
      >
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" style={{ color: T.textMuted }} />
          <input
            className="w-full h-11 pl-11 pr-4 text-[13px] outline-none bg-transparent"
            style={{ color: T.text, fontFamily: "inherit", borderRight: `1px solid ${T.inputBorder}` }}
            placeholder="Search by action, user, or ticket…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex items-center px-3">
          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger
              className="w-44 h-9 text-[13px] border-0 shadow-none focus:ring-0"
              style={{ color: T.refreshTx, fontWeight: 500 }}
            >
              <SelectValue placeholder="All Actions" />
            </SelectTrigger>
            <SelectContent style={{ background: T.surface, borderColor: T.border }}>
              {FILTER_OPTIONS.map(o => (
                <SelectItem key={o.value} value={o.value} style={{ color: T.text }}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Timeline */}
      <div
        className="rounded-[14px] overflow-hidden transition-colors duration-300"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
      >
        <div
          className="px-5 py-3 flex items-center gap-2"
          style={{ borderBottom: `1px solid ${T.border}`, background: T.timelineHead }}
        >
          <Activity className="h-3.5 w-3.5" style={{ color: T.timelineIcon }} />
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em]" style={{ color: T.timelineLabel }}>
            Activity Timeline
          </span>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#7B3A9E" }} />
            <p className="text-[13px]" style={{ color: T.textMuted }}>Loading audit logs…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-24 text-center">
            <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: T.emptyBg }}>
              <FileText className="h-6 w-6 opacity-40" style={{ color: isDark ? "#c4b5fd" : "#5B1E7A" }} />
            </div>
            <p className="text-[13px]" style={{ color: T.textMuted }}>
              {auditLogs.length === 0 ? "No audit logs found" : "No logs match your search"}
            </p>
          </div>
        ) : (
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[42px] top-0 bottom-0 w-px" style={{ background: T.timelineLine }} />

            {filtered.map((log, idx) => {
              const cfg     = classifyAction(log.action ?? "");
              const LogIcon = cfg.icon;
              const parts: string[] = [];
              if (log.user?.name)      parts.push(`by ${log.user.name}`);
              if (log.ticket?.subject) parts.push(log.ticket.subject);
              const subtitle = parts.join(" · ");

              return (
                <div
                  key={log.id}
                  className="relative flex items-start gap-4 px-5 py-4 transition-all animate-fade-in"
                  style={{
                    borderBottom: idx < filtered.length - 1 ? `1px solid ${T.border}` : "none",
                    animationDelay: `${Math.min(idx * 30, 300)}ms`,
                  }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.surfaceHover}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                >
                  {/* Icon */}
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 z-10"
                    style={{
                      background: isDark ? cfg.darkBg : cfg.bg,
                      border: `1.5px solid ${isDark ? cfg.darkBorder : cfg.border}`,
                    }}
                  >
                    <LogIcon className="h-4 w-4" style={{ color: isDark ? cfg.darkText : cfg.text }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 pt-0.5">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[13px] font-semibold" style={{ color: T.text }}>
                          {log.action}
                        </span>
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wide"
                          style={{
                            background: isDark ? cfg.darkBg : cfg.bg,
                            color: isDark ? cfg.darkText : cfg.text,
                            border: `1px solid ${isDark ? cfg.darkBorder : cfg.border}`,
                          }}
                        >
                          {cfg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0" style={{ color: T.textMuted }}>
                        <Clock className="h-3 w-3" />
                        <span className="text-[11px]">{formatDate(log.createdAt)}</span>
                      </div>
                    </div>

                    {subtitle && (
                      <p className="text-[12px] mt-0.5 truncate" style={{ color: T.textMuted }}>{subtitle}</p>
                    )}

                    {log.user?.email && (
                      <p className="text-[11px] mt-0.5" style={{ color: T.textFaint }}>{log.user.email}</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogsPage;