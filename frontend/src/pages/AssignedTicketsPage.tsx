import { useState, useEffect } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  ClipboardList, Search, AlertCircle, CheckCircle2,
  Clock, Eye, Send, Loader2, ShieldAlert, Inbox, Filter,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ticketApi, Ticket as TicketType } from "@/api/ticketApi";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

/* ── Dark token map ───────────────────────────────────── */
const useDT = (isDark: boolean) => ({
  bg:               isDark ? "#0f0720"                        : "#f9f7ff",
  surface:          isDark ? "#1a0d30"                        : "#ffffff",
  surfaceHover:     isDark ? "rgba(139,92,192,0.08)"          : "rgba(243,233,251,0.45)",
  border:           isDark ? "rgba(139,92,192,0.18)"          : "rgba(91,30,122,0.09)",
  borderStrong:     isDark ? "rgba(139,92,192,0.30)"          : "rgba(91,30,122,0.18)",
  text:             isDark ? "#e8d5f8"                        : "#3d1052",
  textMuted:        isDark ? "#a78cc0"                        : "#9B59B6",
  textSub:          isDark ? "#c4b5fd"                        : "#6B7280",
  shadow:           isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(91,30,122,0.06), 0 4px 16px rgba(91,30,122,0.04)",
  inputBg:          isDark ? "#160a2a"                        : "hsl(280 35% 97%)",
  inputBorder:      isDark ? "rgba(139,92,192,0.25)"          : "hsl(280 18% 89%)",
  inputFocusBorder: isDark ? "rgba(139,92,192,0.6)"           : "rgba(91,30,122,0.45)",
  inputFocusShadow: isDark ? "0 0 0 3px rgba(139,92,192,0.15)" : "0 0 0 3px rgba(91,30,122,0.08)",
  inputFocusBg:     isDark ? "#1a0d30"                        : "#fff",
  monoBg:           isDark ? "rgba(139,92,192,0.15)"          : "rgba(91,30,122,0.07)",
  monoText:         isDark ? "#c4b5fd"                        : "#7B2CBF",
  badgeBg:          isDark ? "rgba(139,92,192,0.15)"          : "rgba(91,30,122,0.07)",
  badgeText:        isDark ? "#c4b5fd"                        : "#5B1E7A",
  emptyBg:          isDark ? "rgba(139,92,192,0.08)"          : "rgba(91,30,122,0.05)",
  statBorder:       isDark ? "rgba(139,92,192,0.18)"          : "rgba(91,30,122,0.09)",
  filterBg:         isDark ? "#160a2a"                        : "#ffffff",
  cardBg:           isDark ? "#1a0d30"                        : "#ffffff",
  cardBorder:       isDark ? "rgba(139,92,192,0.18)"          : "rgba(91,30,122,0.09)",
  cardShadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4)"
    : "0 1px 3px rgba(91,30,122,0.05)",
  stripeFallback:   isDark ? "#6b21a8"                        : "#CDB4DB",
  divider:          isDark ? "rgba(139,92,192,0.12)"          : "rgba(91,30,122,0.12)",
  filterLabel:      isDark ? "#a78cc0"                        : "#9B59B6",
  iconBtn:          isDark ? "rgba(139,92,192,0.15)"          : "rgba(91,30,122,0.07)",
  iconBtnText:      isDark ? "#c4b5fd"                        : "#5B1E7A",
  slaBreached:      { bg: isDark ? "rgba(239,68,68,0.15)"  : "#FEE2E2", text: isDark ? "#fca5a5" : "#DC2626", border: isDark ? "rgba(239,68,68,0.35)" : "#FECACA" },
  slaWarn:          { bg: isDark ? "rgba(245,158,11,0.15)" : "#FEF3C7", text: isDark ? "#fcd34d" : "#D97706", border: isDark ? "rgba(245,158,11,0.35)" : "#FDE68A" },
  timeColor:        isDark ? "#7c5fa0"                        : "#C4A8D8",
  metaColor:        isDark ? "#a78cc0"                        : "#9B59B6",
  metaDotColor:     isDark ? "#4a2a6a"                        : "#E0C8F0",
  reporterAccent:   isDark ? "#c4b5fd"                        : "#5B1E7A",
  titleHover:       isDark ? "#c4b5fd"                        : "#5B1E7A",
});

const norm = (v?: string) => v?.toLowerCase().replace(/_/g, "-") || "";

/* ── Status config ─────────────────────────────────────── */
const statusCfg: Record<string, {
  label: string; dot: string;
  bg: string; text: string; border: string;
  dBg: string; dText: string; dBorder: string;
}> = {
  open:          { label:"Open",        dot:"#8b5cf6", bg:"rgba(90,14,122,0.08)",   text:"#5A0E7A",  border:"rgba(90,14,122,0.18)",   dBg:"rgba(139,92,192,0.18)", dText:"#c4b5fd", dBorder:"rgba(139,92,192,0.35)" },
  "in-progress": { label:"In Progress", dot:"#a78bfa", bg:"rgba(123,44,191,0.08)",  text:"#7B2CBF",  border:"rgba(123,44,191,0.20)",  dBg:"rgba(167,139,250,0.15)", dText:"#c4b5fd", dBorder:"rgba(167,139,250,0.30)" },
  resolved:      { label:"Resolved",    dot:"#c4b5fd", bg:"rgba(160,108,213,0.08)", text:"#7B2CBF",  border:"rgba(160,108,213,0.20)", dBg:"rgba(196,181,253,0.12)", dText:"#ddd6fe", dBorder:"rgba(196,181,253,0.25)" },
  closed:        { label:"Closed",      dot:"#9CA3AF", bg:"rgba(156,163,175,0.08)", text:"#6B7280",  border:"rgba(156,163,175,0.20)", dBg:"rgba(107,114,128,0.15)", dText:"#9ca3af", dBorder:"rgba(107,114,128,0.30)" },
};

/* ── Priority config ───────────────────────────────────── */
const priorityCfg: Record<string, {
  label: string;
  bg: string; text: string; border: string; stripe: string;
  dBg: string; dText: string; dBorder: string; dStripe: string;
}> = {
  critical: { label:"Critical", bg:"#4A0E6A",                text:"#fff",    border:"#4A0E6A",                stripe:"#5A0E7A", dBg:"rgba(139,92,192,0.25)", dText:"#e9d5ff", dBorder:"rgba(139,92,192,0.45)", dStripe:"#7c3aed" },
  urgent:   { label:"Urgent",   bg:"#5A0E7A",                text:"#fff",    border:"#5A0E7A",                stripe:"#6B1E8A", dBg:"rgba(139,92,192,0.25)", dText:"#e9d5ff", dBorder:"rgba(139,92,192,0.45)", dStripe:"#7c3aed" },
  high:     { label:"High",     bg:"#7B2CBF",                text:"#fff",    border:"#7B2CBF",                stripe:"#7B2CBF", dBg:"rgba(123,44,191,0.25)", dText:"#d8b4fe", dBorder:"rgba(123,44,191,0.45)", dStripe:"#9333ea" },
  medium:   { label:"Medium",   bg:"rgba(160,108,213,0.15)", text:"#7B2CBF", border:"rgba(160,108,213,0.30)", stripe:"#A06CD5", dBg:"rgba(160,108,213,0.18)", dText:"#c4b5fd", dBorder:"rgba(160,108,213,0.35)", dStripe:"#a855f7" },
  low:      { label:"Low",      bg:"rgba(205,180,219,0.20)", text:"#7B5EA7", border:"rgba(205,180,219,0.40)", stripe:"#CDB4DB", dBg:"rgba(139,92,192,0.12)", dText:"#a78bfa", dBorder:"rgba(139,92,192,0.25)", dStripe:"#6d28d9" },
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "Yesterday" : `${days}d ago`;
};

/* ── Stat Card ─────────────────────────────────────────── */
const StatCard = ({
  label, value, icon: Icon, accent, accentBg, accentBgDark, index = 0, isDark,
}: {
  label: string; value: number; icon: React.ElementType;
  accent: string; accentBg: string; accentBgDark: string; index?: number; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <div
      className="flex items-center gap-3.5 p-4 rounded-xl transition-colors duration-300"
      style={{
        background: T.surface,
        border: `1px solid ${T.statBorder}`,
        boxShadow: T.shadow,
        borderTop: `3px solid ${accent}`,
        animation: `fadeSlideUp 0.35s ease ${index * 60}ms both`,
      }}
    >
      <div
        className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ background: isDark ? accentBgDark : accentBg }}
      >
        <Icon className="h-[18px] w-[18px]" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[1.8rem] font-bold leading-none tabular-nums transition-colors duration-300" style={{ color: T.text }}>
          {value}
        </p>
        <p className="text-[11px] font-medium mt-1 transition-colors duration-300" style={{ color: T.textMuted }}>{label}</p>
      </div>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────── */
const AssignedTicketsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [search, setSearch]                 = useState("");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [slaFilter, setSlaFilter]           = useState("all");
  const [tickets, setTickets]               = useState<TicketType[]>([]);
  const [loading, setLoading]               = useState(true);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await ticketApi.getAssignedTickets();
      const list = Array.isArray(data) ? data : (data as any)?.data ?? [];
      setTickets(list);
    } catch { toast.error("Failed to load assigned tickets"); }
    finally { setLoading(false); }
  };

  const counts = {
    total:      tickets.length,
    open:       tickets.filter(t => norm(t.status) === "open").length,
    inProgress: tickets.filter(t => norm(t.status) === "in-progress").length,
    resolved:   tickets.filter(t => norm(t.status) === "resolved").length,
  };

  const filtered = tickets.filter((t: any) => {
    const subject = t.subject || t.title || "";
    const now = new Date();
    const sla = t.slaDeadline ? new Date(t.slaDeadline) : null;
    const breached = sla && now > sla;
    return (
      (!search || subject.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)) &&
      (priorityFilter === "all" || norm(t.priority) === priorityFilter) &&
      (statusFilter === "all" || norm(t.status) === statusFilter) &&
      (slaFilter === "all" ||
        (slaFilter === "breaching" && breached) ||
        (slaFilter === "safe" && !breached))
    );
  });

  return (
    <div className="space-y-5 animate-fade-in transition-colors duration-300">
      <style>{`
        @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .t-card { transition: box-shadow 0.18s ease, transform 0.18s ease, background 0.2s; cursor: pointer; }
        .t-card:hover { transform: translateY(-1px); }
        .icon-btn-atp { transition: all 0.15s ease; }
        .search-input-atp:focus { outline: none; }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-300"
              style={{ background: isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.1)" }}>
              <ClipboardList className="h-4 w-4" style={{ color: isDark ? "#c4b5fd" : "#5B1E7A" }} />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight transition-colors duration-300" style={{ color: T.text }}>
              My Assigned Tickets
            </h1>
          </div>
          <p className="text-[13px] pl-[42px] transition-colors duration-300" style={{ color: T.textMuted }}>
            Resolve in order of priority · SLA deadlines shown inline
          </p>
        </div>
        <div
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[12px] font-semibold transition-colors duration-300"
          style={{ background: T.badgeBg, color: T.badgeText, border: `1px solid ${T.border}` }}
        >
          <ClipboardList className="h-3.5 w-3.5" />
          {counts.total} total
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard label="Total Assigned" value={counts.total}      icon={ClipboardList} accent={isDark?"#a78bfa":"#5B1E7A"} accentBg="rgba(91,30,122,0.09)"   accentBgDark="rgba(139,92,192,0.15)" index={0} isDark={isDark} />
        <StatCard label="Open"           value={counts.open}       icon={AlertCircle}   accent={isDark?"#c084fc":"#5A0E7A"} accentBg="rgba(90,14,122,0.09)"   accentBgDark="rgba(139,92,192,0.12)" index={1} isDark={isDark} />
        <StatCard label="In Progress"    value={counts.inProgress} icon={Clock}         accent={isDark?"#a78bfa":"#7B2CBF"} accentBg="rgba(123,44,191,0.09)"  accentBgDark="rgba(123,44,191,0.15)" index={2} isDark={isDark} />
        <StatCard label="Resolved"       value={counts.resolved}   icon={CheckCircle2}  accent={isDark?"#86efac":"#10B981"} accentBg="rgba(16,185,129,0.09)"  accentBgDark="rgba(16,185,129,0.15)" index={3} isDark={isDark} />
      </div>

      {/* ── Filters ── */}
      <div
        className="flex flex-wrap gap-2.5 items-center p-4 rounded-xl transition-colors duration-300"
        style={{ background: T.filterBg, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
      >
        <div className="flex items-center gap-2 text-[11px] font-semibold transition-colors duration-300" style={{ color: T.filterLabel }}>
          <Filter className="h-3.5 w-3.5" />
          Filter
        </div>
        <div className="w-px h-4 mx-1" style={{ background: T.divider }} />

        <div className="relative flex-1 min-w-[180px] max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: T.textMuted }} />
          <input
            className="search-input-atp w-full h-9 pl-9 pr-3 text-[13px] rounded-lg transition-all"
            style={{
              background: T.inputBg,
              border: `1.5px solid ${T.inputBorder}`,
              color: T.text,
              fontFamily: "inherit",
            }}
            placeholder="Search by title or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => {
              e.target.style.borderColor = T.inputFocusBorder;
              e.target.style.boxShadow = T.inputFocusShadow;
              e.target.style.background = T.inputFocusBg;
            }}
            onBlur={e => {
              e.target.style.borderColor = T.inputBorder;
              e.target.style.boxShadow = "none";
              e.target.style.background = T.inputBg;
            }}
          />
        </div>

        {[
          { value: statusFilter,   onChange: setStatusFilter,   ph: "Status",   opts: [["all","All Status"],["open","Open"],["in-progress","In Progress"],["resolved","Resolved"]] },
          { value: priorityFilter, onChange: setPriorityFilter, ph: "Priority", opts: [["all","All Priority"],["critical","Critical"],["urgent","Urgent"],["high","High"],["medium","Medium"],["low","Low"]] },
          { value: slaFilter,      onChange: setSlaFilter,      ph: "SLA",      opts: [["all","All SLA"],["breaching","Breaching"],["safe","Safe"]] },
        ].map((s, i) => (
          <Select key={i} value={s.value} onValueChange={s.onChange}>
            <SelectTrigger
              className="w-36 h-9 text-[13px] rounded-lg transition-colors duration-300"
              style={{ borderColor: T.border, background: T.surface, color: T.text }}
            >
              <SelectValue placeholder={s.ph} />
            </SelectTrigger>
            <SelectContent style={{ background: T.surface, borderColor: T.border }}>
              {s.opts.map(([v, l]) => (
                <SelectItem key={v} value={v} style={{ color: T.text }}>{l}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        ))}

        <div className="ml-auto flex items-center gap-1.5">
          <span className="text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors duration-300"
            style={{ background: T.badgeBg, color: T.badgeText }}>
            {filtered.length}
          </span>
          <span className="text-[12px] transition-colors duration-300" style={{ color: T.textMuted }}>
            ticket{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── List ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="h-12 w-12 rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ background: T.emptyBg }}>
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#7B2CBF" }} />
          </div>
          <p className="text-[13px] transition-colors duration-300" style={{ color: T.textMuted }}>Loading your tickets…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl py-24 text-center transition-colors duration-300"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-4"
            style={{ background: T.emptyBg }}>
            <Inbox className="h-7 w-7 opacity-40" style={{ color: isDark ? "#c4b5fd" : "#C4A8D8" }} />
          </div>
          <p className="text-[15px] font-semibold transition-colors duration-300" style={{ color: T.text }}>No tickets found</p>
          <p className="text-[13px] mt-1 transition-colors duration-300" style={{ color: T.textMuted }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket: any, idx) => {
            const status   = norm(ticket.status);
            const priority = norm(ticket.priority);
            const sc = statusCfg[status]   || statusCfg.open;
            const pc = priorityCfg[priority] || priorityCfg.medium;

            const slaDate     = ticket.slaDeadline ? new Date(ticket.slaDeadline) : null;
            const now         = new Date();
            const slaBreached = slaDate && now > slaDate;
            const slaWarn     = slaDate && !slaBreached && (slaDate.getTime() - now.getTime()) < 2 * 3600 * 1000;
            const stripe      = isDark ? pc.dStripe : pc.stripe;

            return (
              <div
                key={ticket.id}
                className="t-card group flex items-stretch rounded-xl overflow-hidden transition-colors duration-300"
                style={{
                  background: T.cardBg,
                  border: `1px solid ${T.cardBorder}`,
                  boxShadow: T.cardShadow,
                  animationDelay: `${idx * 40}ms`,
                }}
                onClick={() => navigate(`/tickets/${ticket.id}`)}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = isDark
                    ? "0 8px 24px rgba(0,0,0,0.4)"
                    : "0 8px 24px rgba(91,30,122,0.13)";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.boxShadow = T.cardShadow;
                }}
              >
                {/* Priority stripe */}
                <div className="w-[3px] shrink-0" style={{ background: stripe }} />

                {/* Content */}
                <div className="flex-1 min-w-0 px-4 py-3.5">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                      style={{ background: T.monoBg, color: T.monoText }}
                    >
                      #{ticket.id}
                    </span>

                    <span
                      className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: isDark ? sc.dBg : sc.bg,
                        color: isDark ? sc.dText : sc.text,
                        border: `1px solid ${isDark ? sc.dBorder : sc.border}`,
                      }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: sc.dot }} />
                      {sc.label}
                    </span>

                    <span
                      className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
                      style={{
                        background: isDark ? pc.dBg : pc.bg,
                        color: isDark ? pc.dText : pc.text,
                        border: `1px solid ${isDark ? pc.dBorder : pc.border}`,
                      }}
                    >
                      {pc.label}
                    </span>

                    {slaBreached && (
                      <span
                        className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: T.slaBreached.bg,
                          color: T.slaBreached.text,
                          border: `1px solid ${T.slaBreached.border}`,
                        }}
                      >
                        <ShieldAlert className="h-3 w-3" /> SLA Breached
                      </span>
                    )}
                    {slaWarn && !slaBreached && (
                      <span
                        className="inline-flex items-center text-[11px] font-bold px-2 py-0.5 rounded-full"
                        style={{
                          background: T.slaWarn.bg,
                          color: T.slaWarn.text,
                          border: `1px solid ${T.slaWarn.border}`,
                        }}
                      >
                        SLA Warning
                      </span>
                    )}

                    <span className="text-[11px] ml-auto" style={{ color: T.timeColor }}>
                      {timeAgo(ticket.createdAt)}
                    </span>
                  </div>

                  <p
                    className="font-semibold text-[14px] mt-2 line-clamp-1 transition-colors"
                    style={{ color: T.text }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.color = T.titleHover}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.color = T.text}
                  >
                    {ticket.subject || ticket.title}
                  </p>

                  <div
                    className="flex items-center gap-2 mt-1.5 flex-wrap text-[11px]"
                    style={{ color: T.metaColor }}
                  >
                    <span>
                      Reporter:{" "}
                      <span className="font-semibold" style={{ color: T.reporterAccent }}>
                        {ticket.creator?.name || ticket.user?.name || "Unknown"}
                      </span>
                    </span>
                    {ticket.category?.name && (
                      <>
                        <span style={{ color: T.metaDotColor }}>·</span>
                        <span>{ticket.category.name}</span>
                      </>
                    )}
                    {ticket.department?.name && (
                      <>
                        <span style={{ color: T.metaDotColor }}>·</span>
                        <span>{ticket.department.name}</span>
                      </>
                    )}
                    {slaDate && !slaBreached && (
                      <>
                        <span style={{ color: T.metaDotColor }}>·</span>
                        <span className={slaWarn ? "font-semibold" : ""} style={{ color: slaWarn ? T.slaWarn.text : undefined }}>
                          SLA: {slaDate.toLocaleDateString("en-PK", { day: "numeric", month: "short" })}
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Actions — View + Edit only */}
                <div
                  className="flex items-center gap-1.5 pr-3 shrink-0"
                  onClick={e => e.stopPropagation()}
                >
                  {/* View */}
                  <button
                    className="icon-btn-atp h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: T.textMuted }}
                    onClick={() => navigate(`/tickets/${ticket.id}`)}
                    title="View"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = T.iconBtn;
                      (e.currentTarget as HTMLElement).style.color = T.iconBtnText;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = T.textMuted;
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  {/* Edit */}
                  <button
                    className="icon-btn-atp h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
                    style={{ color: T.textMuted }}
                    onClick={() => navigate(`/tickets/${ticket.id}?edit=true`)}
                    title="Edit"
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = T.iconBtn;
                      (e.currentTarget as HTMLElement).style.color = T.iconBtnText;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = "transparent";
                      (e.currentTarget as HTMLElement).style.color = T.textMuted;
                    }}
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AssignedTicketsPage;