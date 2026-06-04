import { useState, useEffect } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Ticket, Search, Plus, Clock, CheckCircle2,
  AlertCircle, Loader2, PlusCircle, ShieldAlert, Eye,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { ticketApi, Ticket as TicketType } from "@/api/ticketApi";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

/* ── Dark token map ───────────────────────────────────── */
const useDT = (isDark: boolean) => ({
  bg:               isDark ? "#0f0720"                              : "#f9f7ff",
  surface:          isDark ? "#1a0d30"                              : "#ffffff",
  border:           isDark ? "rgba(139,92,192,0.18)"                : "rgba(91,30,122,0.09)",
  shadow:           isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(91,30,122,0.05)",
  shadowHov:        isDark
    ? "0 8px 24px rgba(0,0,0,0.45)"
    : "0 8px 24px rgba(91,30,122,0.13)",
  text:             isDark ? "#e8d5f8"                              : "#3d1052",
  textMuted:        isDark ? "#a78cc0"                              : "#9B59B6",
  textFaint:        isDark ? "#6b4e8a"                              : "#B89CC8",
  monoBg:           isDark ? "rgba(139,92,192,0.15)"                : "rgba(91,30,122,0.07)",
  monoText:         isDark ? "#c4b5fd"                              : "#7B2CBF",
  badgeBg:          isDark ? "rgba(139,92,192,0.15)"                : "rgba(91,30,122,0.07)",
  badgeText:        isDark ? "#c4b5fd"                              : "#5B1E7A",
  emptyBg:          isDark ? "rgba(139,92,192,0.08)"                : "rgba(91,30,122,0.06)",
  filterBg:         isDark ? "#160a2a"                              : "#ffffff",
  inputBg:          isDark ? "#160a2a"                              : "hsl(280 40% 97%)",
  inputBorder:      isDark ? "rgba(139,92,192,0.25)"                : "hsl(280 20% 88%)",
  inputFocusBorder: isDark ? "rgba(139,92,192,0.6)"                 : "rgba(91,30,122,0.40)",
  inputFocusShadow: isDark ? "0 0 0 3px rgba(139,92,192,0.15)"      : "0 0 0 3px rgba(91,30,122,0.08)",
  inputFocusBg:     isDark ? "#1a0d30"                              : "#fff",
  inputColor:       isDark ? "#e8d5f8"                              : "#3d1052",
  iconBg:           isDark ? "rgba(139,92,192,0.15)"                : "rgba(91,30,122,0.10)",
  iconColor:        isDark ? "#c4b5fd"                              : "#5B1E7A",
  iconBtn:          isDark ? "rgba(139,92,192,0.15)"                : "rgba(91,30,122,0.07)",
  iconBtnText:      isDark ? "#c4b5fd"                              : "#5B1E7A",
  statBg:           isDark ? "#1a0d30"                              : "#ffffff",
  statBorder:       isDark ? "rgba(139,92,192,0.18)"                : "rgba(91,30,122,0.09)",
  cardDot:          isDark ? "rgba(91,30,122,0.14)"                 : "#d4b8ee",
  agentColor:       isDark ? "#c4b5fd"                              : "#5B1E7A",
  unassignedColor:  isDark ? "#6b4e8a"                              : "#C4A8D8",
  slaBreached: {
    bg:     isDark ? "rgba(239,68,68,0.15)"    : "#FEE2E2",
    text:   isDark ? "#fca5a5"                 : "#DC2626",
    border: isDark ? "rgba(239,68,68,0.35)"    : "#FECACA",
  },
  slaWarn: {
    bg:     isDark ? "rgba(245,158,11,0.15)"   : "#FEF3C7",
    text:   isDark ? "#fcd34d"                 : "#D97706",
    border: isDark ? "rgba(245,158,11,0.35)"   : "#FDE68A",
  },
});

const norm = (v?: string) => v?.toLowerCase().replace(/_/g, "-") || "";

/* ── Status config ─────────────────────────────────────── */
const statusCfg: Record<string, {
  label: string; dot: string;
  bg: string; text: string; border: string;
  dBg: string; dText: string; dBorder: string; dDot: string;
  icon: React.ElementType;
}> = {
  open:          { label:"Open",        dot:"#5A0E7A", bg:"rgba(90,14,122,0.10)",   text:"#5A0E7A", border:"rgba(90,14,122,0.22)",   dBg:"rgba(139,92,192,0.18)", dText:"#c4b5fd", dBorder:"rgba(139,92,192,0.40)", dDot:"#a78bfa", icon:AlertCircle  },
  "in-progress": { label:"In Progress", dot:"#7B2CBF", bg:"rgba(123,44,191,0.10)",  text:"#7B2CBF", border:"rgba(123,44,191,0.22)",  dBg:"rgba(167,139,250,0.15)", dText:"#c4b5fd", dBorder:"rgba(167,139,250,0.30)", dDot:"#c4b5fd", icon:Clock        },
  resolved:      { label:"Resolved",    dot:"#A06CD5", bg:"rgba(160,108,213,0.10)", text:"#A06CD5", border:"rgba(160,108,213,0.22)", dBg:"rgba(196,181,253,0.12)", dText:"#ddd6fe", dBorder:"rgba(196,181,253,0.28)", dDot:"#ddd6fe", icon:CheckCircle2 },
  closed:        { label:"Closed",      dot:"#9CA3AF", bg:"rgba(205,180,219,0.18)", text:"#6B7280", border:"rgba(205,180,219,0.40)", dBg:"rgba(107,114,128,0.15)", dText:"#9ca3af", dBorder:"rgba(107,114,128,0.30)", dDot:"#9ca3af", icon:CheckCircle2 },
};

/* ── Priority config ───────────────────────────────────── */
const priorityCfg: Record<string, {
  label: string;
  bg: string; text: string; border: string; stripe: string;
  dBg: string; dText: string; dBorder: string; dStripe: string;
}> = {
  critical: { label:"Critical", bg:"#5A0E7A",                text:"#fff",    border:"#5A0E7A",                stripe:"#5A0E7A", dBg:"rgba(139,92,192,0.25)", dText:"#e9d5ff", dBorder:"rgba(139,92,192,0.45)", dStripe:"#7c3aed" },
  urgent:   { label:"Urgent",   bg:"#5A0E7A",                text:"#fff",    border:"#5A0E7A",                stripe:"#6B2A8A", dBg:"rgba(139,92,192,0.25)", dText:"#e9d5ff", dBorder:"rgba(139,92,192,0.45)", dStripe:"#7c3aed" },
  high:     { label:"High",     bg:"#7B2CBF",                text:"#fff",    border:"#7B2CBF",                stripe:"#7B2CBF", dBg:"rgba(123,44,191,0.25)", dText:"#d8b4fe", dBorder:"rgba(123,44,191,0.45)", dStripe:"#9333ea" },
  medium:   { label:"Medium",   bg:"rgba(160,108,213,0.18)", text:"#A06CD5", border:"rgba(160,108,213,0.35)", stripe:"#A06CD5", dBg:"rgba(160,108,213,0.18)", dText:"#c4b5fd", dBorder:"rgba(160,108,213,0.35)", dStripe:"#a855f7" },
  low:      { label:"Low",      bg:"rgba(205,180,219,0.22)", text:"#8B5CF6", border:"rgba(205,180,219,0.45)", stripe:"#CDB4DB", dBg:"rgba(139,92,192,0.12)", dText:"#a78bfa", dBorder:"rgba(139,92,192,0.25)", dStripe:"#6d28d9" },
};

const timeAgo = (d: string) => {
  const diff = Date.now() - new Date(d).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  return days === 1 ? "Yesterday"
    : days < 7 ? `${days}d ago`
    : new Date(d).toLocaleDateString("en-PK", { day: "numeric", month: "short" });
};

/* ── Mini Stat Card ────────────────────────────────────── */
const MiniStat = ({
  label, value, icon: Icon, accent, accentBg, accentBgDark, index = 0, isDark,
}: {
  label: string; value: number; icon: React.ElementType;
  accent: string; accentBg: string; accentBgDark: string; index?: number; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <div
      className="flex items-center gap-3 p-4 rounded-xl transition-colors duration-300"
      style={{
        background: T.statBg,
        border: `1px solid ${T.statBorder}`,
        boxShadow: T.shadow,
        borderTop: `2.5px solid ${accent}`,
        animation: `fadeUp 0.35s ease ${index * 60}ms both`,
      }}
    >
      <div
        className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-300"
        style={{ background: isDark ? accentBgDark : accentBg }}
      >
        <Icon className="h-4 w-4" style={{ color: accent }} />
      </div>
      <div>
        <p className="text-[1.6rem] font-bold leading-none tabular-nums transition-colors duration-300" style={{ color: T.text }}>{value}</p>
        <p className="text-[11px] font-medium mt-0.5 transition-colors duration-300" style={{ color: T.textMuted }}>{label}</p>
      </div>
    </div>
  );
};

/* ── Ticket Card ───────────────────────────────────────── */
const TicketCard = ({
  ticket, onClick, index = 0, isDark,
}: { ticket: any; onClick: () => void; index?: number; isDark: boolean }) => {
  const T = useDT(isDark);
  const status   = norm(ticket.status);
  const priority = norm(ticket.priority);
  const sc = statusCfg[status]     || statusCfg.open;
  const pc = priorityCfg[priority] || priorityCfg.medium;

  const sBg     = isDark ? sc.dBg     : sc.bg;
  const sText   = isDark ? sc.dText   : sc.text;
  const sBorder = isDark ? sc.dBorder : sc.border;
  const sDot    = isDark ? sc.dDot    : sc.dot;
  const pBg     = isDark ? pc.dBg     : pc.bg;
  const pText   = isDark ? pc.dText   : pc.text;
  const pBorder = isDark ? pc.dBorder : pc.border;
  const stripe  = isDark ? pc.dStripe : pc.stripe;

  const slaDate     = ticket.slaDeadline ? new Date(ticket.slaDeadline) : null;
  const now         = new Date();
  const slaBreached = slaDate && now > slaDate;
  const slaWarn     = slaDate && !slaBreached && (slaDate.getTime() - now.getTime()) < 2 * 3600 * 1000;

  return (
    <div
      className="ticket-card-mt group relative flex items-stretch rounded-xl overflow-hidden transition-colors duration-300"
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        cursor: "pointer",
        animation: `fadeUp 0.3s ease ${index * 50}ms both`,
      }}
      onClick={onClick}
      onMouseEnter={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = T.shadowHov;
        (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLElement).style.boxShadow = T.shadow;
        (e.currentTarget as HTMLElement).style.transform = "";
      }}
    >
      {/* Priority stripe */}
      <div className="w-[3px] self-stretch shrink-0" style={{ background: stripe }} />

      <div className="flex-1 min-w-0 px-4 py-3.5">
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            {/* ID badge */}
            <span
              className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded-md"
              style={{ background: T.monoBg, color: T.monoText }}
            >
              #{ticket.id}
            </span>

            {/* Status pill */}
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: sBg, color: sText, border: `1px solid ${sBorder}` }}
            >
              <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: sDot }} />
              {sc.label}
            </span>

            {/* Priority pill */}
            <span
              className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
              style={{ background: pBg, color: pText, border: `1px solid ${pBorder}` }}
            >
              {pc.label}
            </span>

            {slaBreached && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: T.slaBreached.bg, color: T.slaBreached.text, border: `1px solid ${T.slaBreached.border}` }}
              >
                <ShieldAlert className="h-3 w-3" /> SLA Breached
              </span>
            )}
            {slaWarn && !slaBreached && (
              <span
                className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: T.slaWarn.bg, color: T.slaWarn.text, border: `1px solid ${T.slaWarn.border}` }}
              >
                SLA Warning
              </span>
            )}
          </div>

          <span className="text-[11px] shrink-0 transition-colors duration-300" style={{ color: T.textMuted }}>
            {timeAgo(ticket.createdAt)}
          </span>
        </div>

        <p
          className="font-semibold text-[14px] mt-2 line-clamp-1 transition-colors duration-300"
          style={{ color: T.text }}
        >
          {ticket.subject || ticket.title}
        </p>

        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
          {ticket.category?.name && (
            <span className="text-[11px] transition-colors duration-300" style={{ color: T.textMuted }}>
              {ticket.category.name}
            </span>
          )}
          {ticket.department?.name && (
            <>
              <span style={{ color: T.cardDot }}>·</span>
              <span className="text-[11px] transition-colors duration-300" style={{ color: T.textMuted }}>
                {ticket.department.name}
              </span>
            </>
          )}
          {ticket.assignedAgent?.name ? (
            <>
              <span style={{ color: T.cardDot }}>·</span>
              <span className="text-[11px] font-medium transition-colors duration-300" style={{ color: T.agentColor }}>
                Agent: {ticket.assignedAgent.name}
              </span>
            </>
          ) : (
            <>
              <span style={{ color: T.cardDot }}>·</span>
              <span className="text-[11px] italic transition-colors duration-300" style={{ color: T.unassignedColor }}>
                Unassigned
              </span>
            </>
          )}
        </div>
      </div>

      {/* View button only */}
      <div
        className="flex items-center pr-3 shrink-0"
        onClick={e => e.stopPropagation()}
      >
        <button
          className="icon-btn-mt h-8 w-8 rounded-lg flex items-center justify-center transition-colors"
          style={{ color: T.textMuted }}
          onClick={onClick}
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
      </div>
    </div>
  );
};

/* ── Main ─────────────────────────────────────────────── */
const MyTicketsPage = () => {
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [search, setSearch]           = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tickets, setTickets]         = useState<TicketType[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await ticketApi.getMyTickets();
      const list = Array.isArray(res) ? res : (res as any)?.data ?? [];
      setTickets(list);
    } catch {
      toast.error("Failed to load your tickets");
    } finally {
      setLoading(false);
    }
  };

  const counts = {
    total:      tickets.length,
    open:       tickets.filter(t => norm(t.status) === "open").length,
    inProgress: tickets.filter(t => norm(t.status) === "in-progress").length,
    resolved:   tickets.filter(t => ["resolved","closed"].includes(norm(t.status))).length,
  };

  const filtered = tickets.filter((t: any) => {
    const subject = t.subject || t.title || "";
    return (
      (!search || subject.toLowerCase().includes(search.toLowerCase()) || String(t.id).includes(search)) &&
      (statusFilter === "all" || norm(t.status) === statusFilter)
    );
  });

  return (
    <div className="space-y-5 animate-fade-in transition-colors duration-300">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .ticket-card-mt { transition: box-shadow 0.18s ease, transform 0.18s ease, background 0.2s; }
        .new-ticket-btn-mt { transition: all 0.15s ease; }
        .new-ticket-btn-mt:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(91,30,122,0.35) !important; }
        .search-input-mt:focus { outline: none; }
        .icon-btn-mt { transition: all 0.15s ease; }
      `}</style>

      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div
              className="h-8 w-8 rounded-lg flex items-center justify-center transition-colors duration-300"
              style={{ background: T.iconBg }}
            >
              <Ticket className="h-4 w-4" style={{ color: T.iconColor }} />
            </div>
            <h1 className="text-[22px] font-bold tracking-tight transition-colors duration-300" style={{ color: T.text }}>
              My Tickets
            </h1>
          </div>
          <p className="text-[13px] pl-[42px] transition-colors duration-300" style={{ color: T.textMuted }}>
            Track your submitted support requests
          </p>
        </div>
        <Link
          to="/create-ticket"
          className="new-ticket-btn-mt flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white"
          style={{
            background: "linear-gradient(135deg, #5B1E7A, #7B3A9E)",
            boxShadow: "0 2px 8px rgba(91,30,122,0.28)",
          }}
        >
          <Plus className="h-4 w-4" /> New Ticket
        </Link>
      </div>

      {/* ── Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <MiniStat label="Total"       value={counts.total}      icon={Ticket}       accent={isDark?"#a78bfa":"#5B1E7A"} accentBg="rgba(91,30,122,0.10)"   accentBgDark="rgba(139,92,192,0.15)" index={0} isDark={isDark} />
        <MiniStat label="Open"        value={counts.open}       icon={AlertCircle}  accent={isDark?"#c084fc":"#5A0E7A"} accentBg="rgba(90,14,122,0.10)"   accentBgDark="rgba(139,92,192,0.12)" index={1} isDark={isDark} />
        <MiniStat label="In Progress" value={counts.inProgress} icon={Clock}        accent={isDark?"#a78bfa":"#7B2CBF"} accentBg="rgba(123,44,191,0.10)"  accentBgDark="rgba(123,44,191,0.15)" index={2} isDark={isDark} />
        <MiniStat label="Resolved"    value={counts.resolved}   icon={CheckCircle2} accent={isDark?"#86efac":"#10B981"} accentBg="rgba(160,108,213,0.10)" accentBgDark="rgba(16,185,129,0.15)"  index={3} isDark={isDark} />
      </div>

      {/* ── Filters ── */}
      <div
        className="flex flex-wrap gap-3 items-center p-4 rounded-xl transition-colors duration-300"
        style={{ background: T.filterBg, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
      >
        <div className="relative flex-1 min-w-[180px] max-w-sm">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: T.textMuted }}
          />
          <input
            className="search-input-mt w-full h-9 pl-9 pr-3 text-[13px] rounded-lg transition-all"
            style={{
              background: T.inputBg,
              border: `1.5px solid ${T.inputBorder}`,
              color: T.inputColor,
              fontFamily: "inherit",
            }}
            placeholder="Search by title or ID…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => {
              e.target.style.borderColor = T.inputFocusBorder;
              e.target.style.boxShadow   = T.inputFocusShadow;
              e.target.style.background  = T.inputFocusBg;
            }}
            onBlur={e => {
              e.target.style.borderColor = T.inputBorder;
              e.target.style.boxShadow   = "none";
              e.target.style.background  = T.inputBg;
            }}
          />
        </div>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger
            className="w-40 h-9 text-[13px] rounded-lg transition-colors duration-300"
            style={{ borderColor: T.border, background: T.surface, color: T.text }}
          >
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent style={{ background: T.surface, borderColor: T.border }}>
            {["all","open","in-progress","resolved","closed"].map(v => (
              <SelectItem key={v} value={v} style={{ color: T.text }}>
                {v === "all" ? "All Status" : v.charAt(0).toUpperCase() + v.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="ml-auto flex items-center gap-1.5">
          <span
            className="text-[12px] font-semibold px-2.5 py-1 rounded-lg transition-colors duration-300"
            style={{ background: T.badgeBg, color: T.badgeText }}
          >
            {filtered.length}
          </span>
          <span className="text-[12px] transition-colors duration-300" style={{ color: T.textFaint }}>
            ticket{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* ── Ticket list ── */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div
            className="h-12 w-12 rounded-full flex items-center justify-center transition-colors duration-300"
            style={{ background: T.emptyBg }}
          >
            <Loader2 className="h-5 w-5 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#7B2CBF" }} />
          </div>
          <p className="text-[13px] transition-colors duration-300" style={{ color: T.textMuted }}>Loading tickets…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-2xl py-24 text-center transition-colors duration-300"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <div
            className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center mb-4 transition-colors duration-300"
            style={{ background: T.emptyBg }}
          >
            <Ticket className="h-7 w-7 opacity-35" style={{ color: isDark ? "#c4b5fd" : "#5B1E7A" }} />
          </div>
          <p className="text-[15px] font-semibold transition-colors duration-300" style={{ color: T.text }}>
            {search || statusFilter !== "all" ? "No tickets match your filters" : "No tickets yet"}
          </p>
          <p className="text-[13px] mt-1 transition-colors duration-300" style={{ color: T.textMuted }}>
            {!search && statusFilter === "all"
              ? "Submit your first support request to get started"
              : "Try adjusting your filters"}
          </p>
          {!search && statusFilter === "all" && (
            <Link
              to="/create-ticket"
              className="inline-flex items-center gap-2 mt-5 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-white transition-all hover:opacity-90"
              style={{ background: "linear-gradient(135deg, #5B1E7A, #7B3A9E)" }}
            >
              <PlusCircle className="h-3.5 w-3.5" /> Create your first ticket
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((ticket, idx) => (
            <TicketCard
              key={(ticket as any).id}
              ticket={ticket}
              index={idx}
              isDark={isDark}
              onClick={() => navigate(`/tickets/${(ticket as any).id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default MyTicketsPage;