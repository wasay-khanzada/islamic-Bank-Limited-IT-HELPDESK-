import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Inbox, Search, UserPlus, Eye, Clock, Loader2,
  AlertCircle, ArrowUpDown, ShieldAlert,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ticketApi, Ticket as TicketType } from "@/api/ticketApi";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

/* ── Dark-mode token hook (matches DashboardPage) ──────── */
const useDarkTokens = (isDark: boolean) => ({
  bg:           isDark ? "#0f0720"       : "#ffffff",
  bgSubtle:     isDark ? "#160a2a"       : "#faf7ff",
  surface:      isDark ? "#1a0d30"       : "#ffffff",
  surfaceHover: isDark ? "#22103c"       : "rgba(243,233,251,0.45)",
  border:       isDark ? "rgba(139,92,192,0.18)" : "rgba(90,14,122,0.09)",
  borderStrong: isDark ? "rgba(139,92,192,0.30)" : "rgba(90,14,122,0.18)",
  borderHover:  isDark ? "rgba(139,92,192,0.45)" : "rgba(90,14,122,0.25)",
  text:         isDark ? "#e8d5f8"       : "#1a0630",
  textMuted:    isDark ? "#a78cc0"       : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"       : "#C3A8D8",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(90,14,122,0.06), 0 4px 16px rgba(90,14,122,0.04)",
  shadowLg:     isDark
    ? "0 2px 12px rgba(0,0,0,0.5), 0 1px 3px rgba(0,0,0,0.4)"
    : "0 2px 12px rgba(90,14,122,0.08), 0 1px 3px rgba(90,14,122,0.05)",
  inputBg:      isDark ? "#160a2a"       : "hsl(280 40% 97%)",
  inputBorder:  isDark ? "rgba(139,92,192,0.25)" : "hsl(280 20% 88%)",
  skeleton:     isDark ? "#1a0d30"       : "#f3eefb",
  headerGrad:   isDark
    ? "linear-gradient(135deg,rgba(243,233,251,0.05) 0%,rgba(255,255,255,0) 70%)"
    : "linear-gradient(135deg,rgba(243,233,251,0.7) 0%,rgba(255,255,255,0) 70%)",
  tableHead:    isDark ? "rgba(139,92,192,0.08)" : "rgba(242,242,242,0.6)",
});

/* ── Color Palette ─────────────────────────────────────── */
const C = {
  darkPurple:  "#5A0E7A",
  purple:      "#7B2CBF",
  green:       "#029F62",
  lightPurple: "#A06CD5",
  lavender:    "#CDB4DB",
  lightGray:   "#F2F2F2",
};

const norm = (v?: string) => v?.toLowerCase().replace(/_/g, "-") || "";

/* ── Priority config ───────────────────────────────────── */
const PRIORITY_WEIGHT: Record<string, number> = {
  critical: 0, urgent: 1, high: 2, medium: 3, low: 4,
};

interface PriorityCfgEntry {
  label: string;
  bg: string; text: string; border: string;
  darkBg: string; darkText: string; darkBorder: string;
  stripe: string; darkStripe: string;
}

const priorityCfg: Record<string, PriorityCfgEntry> = {
  critical: {
    label: "Critical",
    bg: "rgba(90,14,122,0.10)", text: "#5A0E7A", border: "rgba(90,14,122,0.25)",
    darkBg: "rgba(139,92,192,0.20)", darkText: "#e9d5ff", darkBorder: "rgba(139,92,192,0.45)",
    stripe: "#5A0E7A", darkStripe: "#9333ea",
  },
  urgent: {
    label: "Urgent",
    bg: "rgba(220,38,38,0.08)", text: "#b91c1c", border: "rgba(220,38,38,0.22)",
    darkBg: "rgba(239,68,68,0.15)", darkText: "#fca5a5", darkBorder: "rgba(239,68,68,0.35)",
    stripe: "#ef4444", darkStripe: "#f87171",
  },
  high: {
    label: "High",
    bg: "rgba(234,88,12,0.08)", text: "#c2410c", border: "rgba(234,88,12,0.22)",
    darkBg: "rgba(249,115,22,0.15)", darkText: "#fdba74", darkBorder: "rgba(249,115,22,0.35)",
    stripe: "#f97316", darkStripe: "#fb923c",
  },
  medium: {
    label: "Medium",
    bg: "rgba(123,44,191,0.08)", text: "#7B2CBF", border: "rgba(123,44,191,0.22)",
    darkBg: "rgba(167,139,250,0.15)", darkText: "#c4b5fd", darkBorder: "rgba(167,139,250,0.30)",
    stripe: "#7B2CBF", darkStripe: "#a78bfa",
  },
  low: {
    label: "Low",
    bg: "rgba(205,180,219,0.18)", text: "#8B5CF6", border: "rgba(205,180,219,0.40)",
    darkBg: "rgba(139,92,192,0.10)", darkText: "#a78bfa", darkBorder: "rgba(139,92,192,0.22)",
    stripe: "#CDB4DB", darkStripe: "#6b4e8a",
  },
};

const timeAgo = (d: string) => {
  if (!d) return "—";
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};

/* ── Check if a ticket is unassigned ──────────────────── */
const isUnassigned = (t: any): boolean => {
  // assigned_to is a numeric foreign key — falsy covers null, undefined, 0
  const noAgentId = !t.assigned_to && t.assigned_to !== 0;
  // assignedAgent is the hydrated object — null/undefined means unassigned
  const noAgentObj = t.assignedAgent == null;
  return noAgentId && noAgentObj;
};

/* ── Stat Card ─────────────────────────────────────────── */
const StatCard = ({
  label, value, icon: Icon, accent, isDark,
}: { label: string; value: number; icon: React.ElementType; accent: string; isDark: boolean }) => {
  const T = useDarkTokens(isDark);
  return (
    <div
      className="rounded-[14px] p-4 flex items-center gap-3 transition-colors duration-300"
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        borderTop: `3px solid ${accent}`,
      }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: `${accent}18` }}
      >
        <Icon className="h-5 w-5" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[1.6rem] font-extrabold leading-none" style={{ color: T.text }}>{value}</p>
        <p className="text-[11px] mt-0.5 font-medium" style={{ color: T.textMuted }}>{label}</p>
      </div>
    </div>
  );
};

/* ── Priority Pill ─────────────────────────────────────── */
const PriorityPill = ({ priority, isDark }: { priority: string; isDark: boolean }) => {
  const p = priorityCfg[norm(priority)] || priorityCfg.medium;
  return (
    <span
      className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{
        background: isDark ? p.darkBg : p.bg,
        color: isDark ? p.darkText : p.text,
        border: `1px solid ${isDark ? p.darkBorder : p.border}`,
      }}
    >
      {p.label}
    </span>
  );
};

/* ── Main Page ─────────────────────────────────────────── */
const TicketQueuePage = () => {
  const navigate     = useNavigate();
  const { user: me } = useAuth();
  const { isDark }   = useTheme();
  const T            = useDarkTokens(isDark);

  const [search, setSearch]         = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [prioFilter, setPrioFilter] = useState("all");
  const [tickets, setTickets]       = useState<TicketType[]>([]);
  const [loading, setLoading]       = useState(true);
  const [claimingId, setClaimingId] = useState<number | null>(null);

  useEffect(() => { fetchQueue(); }, []);

  const fetchQueue = async () => {
  try {
    setLoading(true);
    const list = await ticketApi.getAllTickets();

    // ← Add this temporarily to inspect the raw data
    console.log("All tickets from API:", list);
    console.log("Sample ticket fields:", list[0]);

    const unresolved = list.filter((t: any) => {
      const s = norm(t.status);
      const notClosed = !["resolved", "closed"].includes(s);
      const notAssigned = isUnassigned(t);
      console.log(`Ticket #${t.id} status=${t.status} assigned_to=${t.assigned_to} assignedAgent=`, t.assignedAgent, "→ notClosed:", notClosed, "notAssigned:", notAssigned);
      return notClosed && notAssigned;
    });
    // ...rest unchanged
      /* Sort: priority weight → created date (oldest first) */
      unresolved.sort((a: any, b: any) => {
        const pw =
          (PRIORITY_WEIGHT[norm(a.priority)] ?? 3) -
          (PRIORITY_WEIGHT[norm(b.priority)] ?? 3);
        if (pw !== 0) return pw;
        return (
          new Date(a.createdAt || a.created_at || 0).getTime() -
          new Date(b.createdAt || b.created_at || 0).getTime()
        );
      });

      setTickets(unresolved);
    } catch {
      toast.error("Failed to load ticket queue");
    } finally {
      setLoading(false);
    }
  };

  /* Claim = assign ticket to self */
  const handleClaim = async (e: React.MouseEvent, ticketId: number) => {
    e.stopPropagation();
    if (!me?.id) return;
    setClaimingId(ticketId);
    try {
      await ticketApi.assignTicket(ticketId, me.id);
      toast.success("Ticket claimed and assigned to you");
      fetchQueue();
    } catch {
      toast.error("Failed to claim ticket");
    } finally {
      setClaimingId(null);
    }
  };

  /* Unique departments */
  const depts = Array.from(
    new Set(tickets.map((t: any) => t.department?.name).filter(Boolean))
  ) as string[];

  /* Counts */
  const counts = {
    total:    tickets.length,
    urgent:   tickets.filter(t => ["urgent", "critical"].includes(norm(t.priority))).length,
    high:     tickets.filter(t => norm(t.priority) === "high").length,
    breached: tickets.filter((t: any) => {
      const d = t.slaDeadline || t.sla_deadline;
      return d && new Date() > new Date(d);
    }).length,
  };

  /* Filter */
  const filtered = tickets.filter((t: any) => {
    const subject = t.subject || t.title || "";
    const matchSearch = !search ||
      subject.toLowerCase().includes(search.toLowerCase()) ||
      String(t.id).includes(search);
    const matchDept = deptFilter === "all" || t.department?.name === deptFilter;
    const matchPrio = prioFilter === "all" || norm(t.priority) === prioFilter;
    return matchSearch && matchDept && matchPrio;
  });

  /* Queue position badge */
  const posBadge = (idx: number, isDark: boolean) => {
    if (idx === 0) return {
      bg: isDark ? "rgba(239,68,68,0.20)" : "rgba(220,38,38,0.08)",
      text: isDark ? "#fca5a5" : "#b91c1c",
      border: isDark ? "rgba(239,68,68,0.40)" : "rgba(220,38,38,0.25)",
    };
    if (idx <= 2) return {
      bg: isDark ? "rgba(249,115,22,0.18)" : "rgba(234,88,12,0.08)",
      text: isDark ? "#fdba74" : "#c2410c",
      border: isDark ? "rgba(249,115,22,0.35)" : "rgba(234,88,12,0.22)",
    };
    return {
      bg: isDark ? "rgba(139,92,192,0.12)" : "rgba(242,242,242,0.8)",
      text: isDark ? "#a78cc0" : "#6b7280",
      border: isDark ? "rgba(139,92,192,0.25)" : "rgba(209,213,219,0.8)",
    };
  };

  return (
    <div
      className="space-y-5 min-h-screen transition-colors duration-300"
      style={{ background: T.bgSubtle }}
    >
      {/* ── Header ── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1
            className="text-[1.5rem] font-bold tracking-tight"
            style={{ color: T.text }}
          >
            Ticket Queue
          </h1>
          <p className="text-[13px] mt-0.5" style={{ color: T.textMuted }}>
            Unresolved &amp; unassigned tickets — sorted by priority then age
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3 py-1.5 rounded-full"
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
          }}
        >
          <ArrowUpDown className="h-3.5 w-3.5" style={{ color: T.textMuted }} />
          <span className="text-[11px] font-medium" style={{ color: T.textMuted }}>
            Priority → Oldest first
          </span>
        </div>
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="In Queue"      value={counts.total}    icon={Inbox}       accent={C.purple}      isDark={isDark} />
        <StatCard label="Urgent / Critical" value={counts.urgent}   icon={AlertCircle} accent="#ef4444"       isDark={isDark} />
        <StatCard label="High Priority" value={counts.high}     icon={AlertCircle} accent="#f97316"       isDark={isDark} />
        <StatCard label="SLA Breached"  value={counts.breached} icon={ShieldAlert} accent="#e11d48"       isDark={isDark} />
      </div>

      {/* ── Filters ── */}
      <div
        className="flex flex-wrap gap-3 p-3 rounded-[14px]"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadow,
        }}
      >
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4"
            style={{ color: T.textMuted }}
          />
          <input
            placeholder="Search queue…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-[9px] text-[13px] outline-none transition-colors"
            style={{
              background: T.inputBg,
              border: `1px solid ${T.inputBorder}`,
              color: T.text,
            }}
            onFocus={e => (e.target.style.borderColor = isDark ? "rgba(139,92,192,0.55)" : "rgba(90,14,122,0.35)")}
            onBlur={e => (e.target.style.borderColor = T.inputBorder)}
          />
        </div>

        {/* Priority Select */}
        <Select value={prioFilter} onValueChange={setPrioFilter}>
          <SelectTrigger
            className="w-36 text-[13px] rounded-[9px]"
            style={{
              background: T.inputBg,
              border: `1px solid ${T.inputBorder}`,
              color: T.text,
            }}
          >
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Department Select */}
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger
            className="w-44 text-[13px] rounded-[9px]"
            style={{
              background: T.inputBg,
              border: `1px solid ${T.inputBorder}`,
              color: T.text,
            }}
          >
            <SelectValue placeholder="Department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Departments</SelectItem>
            {depts.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>

        <span
          className="text-[12px] font-medium self-center ml-auto hidden sm:block"
          style={{ color: T.textMuted }}
        >
          {filtered.length} ticket{filtered.length !== 1 ? "s" : ""} in queue
        </span>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-7 w-7 animate-spin" style={{ color: C.purple }} />
          <p className="text-[13px]" style={{ color: T.textMuted }}>Loading queue…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-[16px] py-20 text-center transition-colors duration-300"
          style={{
            background: T.surface,
            border: `1px solid ${T.border}`,
            boxShadow: T.shadow,
          }}
        >
          <div
            className="h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-3"
            style={{ background: isDark ? "rgba(139,92,192,0.12)" : "rgba(90,14,122,0.06)" }}
          >
            <Inbox className="h-6 w-6 opacity-40" style={{ color: isDark ? "#c4b5fd" : "#5A0E7A" }} />
          </div>
          <p className="text-[14px] font-semibold" style={{ color: T.text }}>Queue is empty</p>
          <p className="text-[13px] mt-1" style={{ color: T.textMuted }}>
            All tickets have been assigned or resolved
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((ticket: any, idx) => {
            const priority   = norm(ticket.priority);
            const pc         = priorityCfg[priority] || priorityCfg.medium;
            const pos        = posBadge(idx, isDark);
            const createdAt  = ticket.createdAt || ticket.created_at || "";
            const slaDate    = ticket.slaDeadline || ticket.sla_deadline
              ? new Date(ticket.slaDeadline || ticket.sla_deadline)
              : null;
            const now        = new Date();
            const slaBreached = slaDate && now > slaDate;
            const slaWarn     = slaDate && !slaBreached &&
              (slaDate.getTime() - now.getTime()) < 2 * 3600 * 1000;

            return (
              <div
                key={ticket.id}
                className="group rounded-[14px] overflow-hidden cursor-pointer transition-all duration-200"
                style={{
                  background: T.surface,
                  border: `1px solid ${T.border}`,
                  boxShadow: T.shadow,
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = T.borderHover;
                  (e.currentTarget as HTMLElement).style.boxShadow = T.shadowLg;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.borderColor = T.border;
                  (e.currentTarget as HTMLElement).style.boxShadow = T.shadow;
                }}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
              >
                {/* Priority accent bar at top */}
                <div
                  className="h-[3px] w-full"
                  style={{
                    background: `linear-gradient(90deg, ${isDark ? pc.darkStripe : pc.stripe}cc, transparent)`,
                  }}
                />

                <div className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Queue position */}
                    <div
                      className="h-8 w-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5"
                      style={{
                        background: pos.bg,
                        color: pos.text,
                        border: `1px solid ${pos.border}`,
                      }}
                    >
                      {idx + 1}
                    </div>

                    {/* Priority stripe */}
                    <div
                      className="w-[3px] self-stretch rounded-full shrink-0"
                      style={{ background: isDark ? pc.darkStripe : pc.stripe, opacity: 0.7 }}
                    />

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex items-center gap-2 flex-wrap">
                          {/* Ticket ID */}
                          <span
                            className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded"
                            style={{
                              background: isDark ? "rgba(139,92,192,0.15)" : "rgba(90,14,122,0.07)",
                              color: isDark ? "#c4b5fd" : C.purple,
                            }}
                          >
                            #{ticket.id}
                          </span>

                          <PriorityPill priority={priority} isDark={isDark} />

                          {ticket.department?.name && (
                            <span
                              className="text-[11px] font-medium px-2 py-0.5 rounded-full"
                              style={{
                                background: isDark ? "rgba(139,92,192,0.10)" : "rgba(90,14,122,0.05)",
                                color: T.textMuted,
                                border: `1px solid ${T.border}`,
                              }}
                            >
                              {ticket.department.name}
                            </span>
                          )}

                          {slaBreached && (
                            <span
                              className="flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: isDark ? "rgba(239,68,68,0.20)" : "rgba(220,38,38,0.10)",
                                color: isDark ? "#fca5a5" : "#b91c1c",
                                border: isDark ? "1px solid rgba(239,68,68,0.40)" : "1px solid rgba(220,38,38,0.25)",
                              }}
                            >
                              <ShieldAlert className="h-3 w-3" /> SLA Breached
                            </span>
                          )}
                          {slaWarn && !slaBreached && (
                            <span
                              className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                              style={{
                                background: isDark ? "rgba(245,158,11,0.18)" : "rgba(234,179,8,0.10)",
                                color: isDark ? "#fde68a" : "#92400e",
                                border: isDark ? "1px solid rgba(245,158,11,0.35)" : "1px solid rgba(234,179,8,0.25)",
                              }}
                            >
                              SLA Warning
                            </span>
                          )}
                        </div>

                        <span
                          className="text-[12px] flex items-center gap-1 shrink-0"
                          style={{ color: T.textMuted }}
                        >
                          <Clock className="h-3 w-3" /> {timeAgo(createdAt)}
                        </span>
                      </div>

                      {/* Subject */}
                      <p
                        className="font-semibold text-[14px] mt-2 line-clamp-1 transition-colors"
                        style={{ color: T.text }}
                      >
                        {ticket.subject || ticket.title}
                      </p>

                      {/* Meta */}
                      <div
                        className="flex items-center gap-3 mt-1.5 text-[12px] flex-wrap"
                        style={{ color: T.textMuted }}
                      >
                        <span>
                          By:{" "}
                          <span style={{ color: isDark ? "#c4b5fd" : "#5A0E7A" }}>
                            {ticket.creator?.name || ticket.user?.name || "Unknown"}
                          </span>
                        </span>
                        {ticket.category?.name && (
                          <>
                            <span>·</span>
                            <span>{ticket.category.name}</span>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div
                      className="flex items-center gap-2 shrink-0"
                      onClick={e => e.stopPropagation()}
                    >
                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-all"
                        style={{
                          background: "transparent",
                          border: `1px solid ${T.border}`,
                          color: T.textMuted,
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLElement).style.background = isDark
                            ? "rgba(139,92,192,0.12)" : "rgba(90,14,122,0.06)";
                          (e.currentTarget as HTMLElement).style.borderColor = T.borderStrong;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = "transparent";
                          (e.currentTarget as HTMLElement).style.borderColor = T.border;
                        }}
                        onClick={() => navigate(`/tickets/${ticket.id}`)}
                      >
                        <Eye className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">View</span>
                      </button>

                      <button
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-[12px] font-semibold transition-all"
                        disabled={claimingId === ticket.id}
                        style={{
                          background: C.purple,
                          color: "#fff",
                          border: "none",
                          opacity: claimingId === ticket.id ? 0.65 : 1,
                          boxShadow: isDark
                            ? "0 2px 8px rgba(123,44,191,0.35)"
                            : "0 2px 8px rgba(123,44,191,0.25)",
                        }}
                        onMouseEnter={e => {
                          if (claimingId !== ticket.id)
                            (e.currentTarget as HTMLElement).style.background = C.darkPurple;
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLElement).style.background = C.purple;
                        }}
                        onClick={(e) => handleClaim(e, ticket.id)}
                      >
                        {claimingId === ticket.id
                          ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          : <UserPlus className="h-3.5 w-3.5" />
                        }
                        <span className="hidden sm:inline">Claim</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TicketQueuePage;