// src/pages/DepartmentsPage.tsx
import { useState, useEffect, useCallback } from "react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Building2, Search, Users, Ticket,
  MoreHorizontal, Trash2, Loader2, TrendingUp,
} from "lucide-react";
import { departmentApi, Department } from "@/api/departmentApi";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

/* ─── dark token map ── */
const useDT = (isDark: boolean) => ({
  surface:      isDark ? "#1a0d30"                    : "#ffffff",
  surfaceHover: isDark ? "rgba(139,92,192,0.07)"      : "rgba(243,233,251,0.35)",
  border:       isDark ? "rgba(139,92,192,0.18)"      : "rgba(93,12,116,0.09)",
  text:         isDark ? "#e8d5f8"                    : "#3d1052",
  textMuted:    isDark ? "#a78cc0"                    : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"                    : "#C4A8D8",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(93,12,116,0.06), 0 4px 16px rgba(93,12,116,0.05)",
  cardHeader:   isDark ? "rgba(139,92,192,0.06)"      : "transparent",
  statCard:     isDark ? "#1a0d30"                    : "#ffffff",
  inputBg:      isDark ? "#160a2a"                    : "hsl(280 40% 97%)",
  inputBorder:  isDark ? "rgba(139,92,192,0.25)"      : "hsl(280 20% 88%)",
  monoBg:       isDark ? "rgba(139,92,192,0.12)"      : "rgba(91,30,122,0.06)",
  monoText:     isDark ? "#c4b5fd"                    : "#5B1E7A",
  progressBg:   isDark ? "rgba(139,92,192,0.12)"      : "rgba(93,12,116,0.07)",
  badgePurpleBg:isDark ? "rgba(112,29,136,0.18)"      : "rgba(112,29,136,0.08)",
  badgePurpleTx:isDark ? "#d8b4fe"                    : "#701D88",
  badgePurpleBd:isDark ? "rgba(139,92,192,0.3)"       : "rgba(112,29,136,0.25)",
  badgeLightBg: isDark ? "rgba(150,98,164,0.18)"      : "rgba(150,98,164,0.10)",
  badgeLightTx: isDark ? "#e9d5ff"                    : "#843698",
  badgeLightBd: isDark ? "rgba(150,98,164,0.35)"      : "rgba(150,98,164,0.28)",
  activeBg:     isDark ? "rgba(93,12,116,0.18)"       : "rgba(93,12,116,0.08)",
  activeTx:     isDark ? "#c4b5fd"                    : "#701D88",
  activeBd:     isDark ? "rgba(93,12,116,0.4)"        : "rgba(93,12,116,0.22)",
  activeDot:    isDark ? "#c4b5fd"                    : "#843698",
  emptyBg:      isDark ? "rgba(139,92,192,0.06)"      : "rgba(93,12,116,0.06)",
  dropdownBg:   isDark ? "#1a0d30"                    : "#ffffff",
  dropdownBd:   isDark ? "rgba(139,92,192,0.2)"       : "rgba(93,12,116,0.1)",
  dropShadow:   isDark ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 24px rgba(93,12,116,0.14)",
});

/* ─── accent cycle ── */
const accentCycle = [
  { top: "#5D0C74", glow: "rgba(93,12,116,0.14)",   iconBg: "rgba(93,12,116,0.10)",   iconColor: "#5D0C74" },
  { top: "#701D88", glow: "rgba(112,29,136,0.12)",   iconBg: "rgba(112,29,136,0.10)",  iconColor: "#701D88" },
  { top: "#843698", glow: "rgba(132,54,152,0.12)",   iconBg: "rgba(132,54,152,0.10)",  iconColor: "#843698" },
  { top: "#9662A4", glow: "rgba(150,98,164,0.12)",   iconBg: "rgba(150,98,164,0.10)",  iconColor: "#9662A4" },
  { top: "#C82BF5", glow: "rgba(200,43,245,0.10)",   iconBg: "rgba(200,43,245,0.08)",  iconColor: "#C82BF5" },
  { top: "#5D0C74", glow: "rgba(93,12,116,0.12)",    iconBg: "rgba(93,12,116,0.08)",   iconColor: "#5D0C74" },
];

/* ─── stat card ── */
const StatCard = ({
  title, value, icon: Icon, accent, accentBg, delay = 0, isDark,
}: {
  title: string; value: number; icon: React.ElementType;
  accent: string; accentBg: string; delay?: number; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div
        className="flex items-center gap-3 p-4 rounded-[12px] hover-lift transition-colors duration-300"
        style={{
          background: T.statCard,
          border: `1px solid ${T.border}`,
          boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(93,12,116,0.05)",
          borderTop: `2.5px solid ${accent}`,
        }}
      >
        <div className="h-9 w-9 rounded-[9px] flex items-center justify-center shrink-0"
          style={{ background: isDark ? `${accent}22` : accentBg }}>
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
        <div>
          <p className="text-[1.4rem] font-bold leading-none" style={{ color: T.text }}>{value}</p>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: T.textMuted }}>{title}</p>
        </div>
      </div>
    </div>
  );
};

/* ─── dept card ── */
const DeptCard = ({
  dept, idx, onDelete, isDark,
}: {
  dept: Department; idx: number;
  onDelete: (id: number) => void;
  isDark: boolean;
}) => {
  const T = useDT(isDark);
  const ac = accentCycle[idx % accentCycle.length];
  const initials = dept.name.split(" ").map(w => w[0]).join("").toUpperCase().slice(0, 2);

  const agentCount      = dept.agentCount      ?? 0;
  const openTickets     = dept.openTickets     ?? 0;
  const resolvedCount   = dept.resolvedCount   ?? 0;
  const resolvedAllTime = dept.resolvedAllTime ?? 0;
  const totalTickets    = dept.totalTickets ?? (openTickets + resolvedAllTime);

  const resolutionPct = totalTickets > 0
    ? Math.round((resolvedAllTime / totalTickets) * 100)
    : 0;

  return (
    <div
      className="group rounded-[14px] overflow-hidden transition-all duration-200 hover-lift animate-fade-in-up"
      style={{
        background: T.surface,
        border: `1px solid ${T.border}`,
        boxShadow: T.shadow,
        borderTop: `3px solid ${ac.top}`,
        animationDelay: `${idx * 50}ms`,
      }}
    >
      {/* Card header */}
      <div className="p-5 flex items-start justify-between"
        style={{ borderBottom: `1px solid ${T.border}`, background: T.cardHeader }}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0 text-white font-bold text-[12px]"
            style={{
              background: `linear-gradient(135deg, ${ac.top}, ${ac.top}cc)`,
              boxShadow: `0 2px 8px ${ac.glow}`,
            }}
          >
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="text-[14px] font-bold truncate" style={{ color: T.text }}>
              {dept.name}
            </h3>
            <p className="text-[11px] font-mono" style={{ color: T.textMuted }}>ID #{dept.id}</p>
          </div>
        </div>

        {/* ── Only Delete option ── */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="h-8 w-8 rounded-[7px] flex items-center justify-center transition-all opacity-0 group-hover:opacity-100"
              style={{ color: T.textMuted }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(139,92,192,0.15)" : "rgba(93,12,116,0.08)"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="rounded-[12px]"
            style={{ background: T.dropdownBg, boxShadow: T.dropShadow, border: `1px solid ${T.dropdownBd}` }}>
            <DropdownMenuItem
              className="gap-2 cursor-pointer text-[13px]"
              style={{ color: "#DC2626" }}
              onClick={() => onDelete(dept.id)}
            >
              <Trash2 className="h-3.5 w-3.5" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Card metrics */}
      <div className="p-5 space-y-3">
        {/* Agents */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-3.5 w-3.5" style={{ color: T.textMuted }} />
            <span className="text-[12px]" style={{ color: T.textMuted }}>Agents</span>
          </div>
          <span className="text-[13px] font-semibold" style={{ color: T.text }}>{agentCount}</span>
        </div>

        {/* Open Tickets */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-3.5 w-3.5" style={{ color: T.textMuted }} />
            <span className="text-[12px]" style={{ color: T.textMuted }}>Open Tickets</span>
          </div>
          <span
            className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: T.badgePurpleBg, color: T.badgePurpleTx, border: `1px solid ${T.badgePurpleBd}` }}
          >
            {openTickets}
          </span>
        </div>

        {/* Resolved */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" style={{ color: T.textMuted }} />
            <span className="text-[12px]" style={{ color: T.textMuted }}>Resolved (Month)</span>
          </div>
          <span
            className="text-[12px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: T.badgeLightBg, color: T.badgeLightTx, border: `1px solid ${T.badgeLightBd}` }}
          >
            {resolvedCount}
          </span>
        </div>

        {/* Status */}
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: T.textMuted }}>Status</span>
          <span
            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full"
            style={{ background: T.activeBg, color: T.activeTx, border: `1px solid ${T.activeBd}` }}
          >
            <span className="h-1.5 w-1.5 rounded-full" style={{ background: T.activeDot }} />
            active
          </span>
        </div>

        {/* Resolution progress */}
        <div className="pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold uppercase tracking-[0.07em]" style={{ color: T.textMuted }}>
              Resolution Rate
            </span>
            <span className="text-[11px] font-bold" style={{ color: ac.top }}>
              {resolutionPct}%
            </span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: T.progressBg }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${resolutionPct}%`, background: `linear-gradient(90deg, ${ac.top}, #9662A4)` }}
            />
          </div>
        </div>

        <p className="text-[10px] pt-1" style={{ color: T.textFaint }}>
          Created {new Date(dept.createdAt).toLocaleDateString("en-PK", {
            day: "numeric", month: "short", year: "numeric",
          })}
        </p>
      </div>
    </div>
  );
};

/* ─── main page ── */
const DepartmentsPage = () => {
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [search, setSearch]           = useState("");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading]         = useState(true);

  const fetchDepartments = useCallback(async () => {
    try {
      setLoading(true);
      const response = await departmentApi.getDepartments();
      if (response.success) setDepartments(response.data);
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to load departments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchDepartments(); }, [fetchDepartments]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this department? This cannot be undone.")) return;
    try {
      await departmentApi.deleteDepartment(id);
      setDepartments(prev => prev.filter(d => d.id !== id));
      toast.success("Department deleted");
    } catch (err: any) {
      toast.error(err?.response?.data?.message ?? "Failed to delete department");
    }
  };

  const visible          = departments.filter(d => d.name.trim().toLowerCase() !== "it");
  const filtered         = visible.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));
  const totalAgents      = visible.reduce((a, d) => a + (d.agentCount  ?? 0), 0);
  const totalOpenTickets = visible.reduce((a, d) => a + (d.openTickets ?? 0), 0);

  return (
    <div className="space-y-5 animate-fade-in" style={{ transition: "background 0.3s, color 0.3s" }}>

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: T.text }}>Departments</h1>
        <p className="text-[13px] mt-0.5" style={{ color: T.textMuted }}>
          Manage organizational departments and teams
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard title="Total Departments" value={visible.length}   icon={Building2} accent="#5D0C74" accentBg="rgba(93,12,116,0.10)"  delay={0}   isDark={isDark} />
        <StatCard title="Active"             value={visible.length}   icon={Users}     accent="#701D88" accentBg="rgba(112,29,136,0.10)" delay={60}  isDark={isDark} />
        <StatCard title="Total Agents"       value={totalAgents}      icon={Users}     accent="#843698" accentBg="rgba(132,54,152,0.10)" delay={120} isDark={isDark} />
        <StatCard title="Open Tickets"       value={totalOpenTickets} icon={Ticket}    accent="#9662A4" accentBg="rgba(150,98,164,0.10)" delay={180} isDark={isDark} />
      </div>

      {/* Search */}
      <div
        className="flex items-center gap-3 p-4 rounded-[12px] transition-colors duration-300"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(93,12,116,0.05)" }}
      >
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: T.textMuted }} />
          <input
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-[8px] outline-none transition-all"
            style={{
              background: T.inputBg,
              border: `1.5px solid ${T.inputBorder}`,
              color: T.text,
              fontFamily: "inherit",
            }}
            placeholder="Search departments…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={e => {
              e.target.style.borderColor = isDark ? "rgba(139,92,192,0.6)" : "rgba(93,12,116,0.45)";
              e.target.style.background = isDark ? "#1a0d30" : "#fff";
              e.target.style.boxShadow = isDark ? "0 0 0 3px rgba(139,92,192,0.12)" : "0 0 0 3px rgba(93,12,116,0.09)";
            }}
            onBlur={e => {
              e.target.style.borderColor = T.inputBorder;
              e.target.style.boxShadow = "none";
              if (!search) e.target.style.background = T.inputBg;
            }}
          />
        </div>
        <span className="text-[12px] font-medium ml-auto" style={{ color: T.textMuted }}>
          {filtered.length} dept{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="h-6 w-6 animate-spin" style={{ color: "#701D88" }} />
          <p className="text-[13px]" style={{ color: T.textMuted }}>Loading departments…</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="rounded-[14px] py-20 text-center transition-colors duration-300"
          style={{ background: T.surface, border: `1px solid ${T.border}` }}
        >
          <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-3"
            style={{ background: T.emptyBg }}>
            <Building2 className="h-6 w-6 opacity-40" style={{ color: "#5D0C74" }} />
          </div>
          <p className="text-[13px]" style={{ color: T.textMuted }}>
            {visible.length === 0 ? "No departments found" : "No departments match your search"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((dept, idx) => (
            <DeptCard
              key={dept.id}
              dept={dept}
              idx={idx}
              onDelete={handleDelete}
              isDark={isDark}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default DepartmentsPage;