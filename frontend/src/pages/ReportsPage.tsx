// src/pages/ReportsPage.tsx
import { useState, useEffect } from "react";
import {
  BarChart3, TrendingUp, TrendingDown, Clock, CheckCircle2,
  Users, ArrowUpRight, ArrowDownRight, Star, Loader2,
} from "lucide-react";
import { departmentApi } from "@/api/departmentApi";
import { ticketApi } from "@/api/ticketApi";
import { userApi } from "@/api/userApi";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

/* ─── dark token map ── */
const useDT = (isDark: boolean) => ({
  surface:      isDark ? "#1a0d30"                    : "#ffffff",
  surfaceHover: isDark ? "rgba(139,92,192,0.08)"      : "",
  border:       isDark ? "rgba(139,92,192,0.18)"      : "rgba(91,30,122,0.09)",
  text:         isDark ? "#e8d5f8"                    : "#3d1052",
  textMuted:    isDark ? "#a78cc0"                    : "#9B59B6",
  textFaint:    isDark ? "#6b4e8a"                    : "#9B59B6",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(91,30,122,0.06), 0 4px 16px rgba(91,30,122,0.05)",
  sectionHead:  isDark ? "rgba(139,92,192,0.08)"      : "rgba(243,233,251,0.4)",
  tableThead:   isDark ? "rgba(139,92,192,0.08)"      : "rgba(243,233,251,0.4)",
  tableRow:     isDark ? "rgba(139,92,192,0.06)"      : "rgba(243,233,251,0.3)",
  progressBg:   isDark ? "rgba(91,30,122,0.18)"       : "rgba(91,30,122,0.08)",
  agentItemHov: isDark ? "rgba(93,12,116,0.12)"       : "rgba(93,12,116,0.04)",
  agentItemBd:  isDark ? "rgba(139,92,192,0.18)"      : "transparent",
  ratingBg:     isDark ? "rgba(112,29,136,0.18)"      : "rgba(112,29,136,0.08)",
  ratingBd:     isDark ? "rgba(139,92,192,0.3)"       : "rgba(112,29,136,0.22)",
  ratingTx:     isDark ? "#d8b4fe"                    : "#843698",
  ratingNum:    isDark ? "#c4b5fd"                    : "#5D0C74",
  barBg:        isDark ? "rgba(91,30,122,0.18)"       : "rgba(91,30,122,0.07)",
  barOpen:      isDark ? "rgba(139,92,192,0.15)"      : "rgba(91,30,122,0.07)",
  barClosed:    isDark ? "rgba(16,185,129,0.12)"      : "rgba(16,185,129,0.08)",
  emptyBg:      isDark ? "rgba(139,92,192,0.06)"      : "rgba(91,30,122,0.06)",
});

/* ─── static data ── */
const kpis = [
  { title: "Avg. Resolution Time", value: "4.2 hrs",  change: "-12%",  up: false, icon: Clock,       accent: "#5B1E7A", accentBg: "rgba(91,30,122,0.1)"  },
  { title: "First Response Time",  value: "18 min",   change: "-8%",   up: false, icon: TrendingDown, accent: "#3B82F6", accentBg: "rgba(59,130,246,0.1)" },
  { title: "Customer Satisfaction",value: "94.5%",    change: "+2.1%", up: true,  icon: TrendingUp,   accent: "#10B981", accentBg: "rgba(16,185,129,0.1)" },
  { title: "SLA Compliance",       value: "97.2%",    change: "+0.5%", up: true,  icon: CheckCircle2, accent: "#C8973A", accentBg: "rgba(200,151,58,0.1)" },
];

const ticketTrends = [
  { month: "Jan", opened: 180, closed: 165 },
  { month: "Feb", opened: 200, closed: 190 },
  { month: "Mar", opened: 220, closed: 210 },
  { month: "Apr", opened: 195, closed: 205 },
  { month: "May", opened: 240, closed: 230 },
  { month: "Jun", opened: 210, closed: 225 },
];

const agentGradients = [
  "linear-gradient(135deg,#5D0C74,#843698)",
  "linear-gradient(135deg,#701D88,#9662A4)",
  "linear-gradient(135deg,#843698,#C82BF5)",
  "linear-gradient(135deg,#5D0C74,#9662A4)",
  "linear-gradient(135deg,#701D88,#843698)",
];

const MAX_TREND = 250;
const NON_IT_KEYWORDS = ["branch banking", "finance", "operations", "hr", "human resource"];

/* ─── helpers ── */
const extractArray = (res: any): any[] => {
  if (Array.isArray(res)) return res;
  if (Array.isArray(res?.data)) return res.data;
  if (Array.isArray(res?.tickets)) return res.tickets;
  if (Array.isArray(res?.users)) return res.users;
  if (Array.isArray(res?.agents)) return res.agents;
  if (Array.isArray(res?.departments)) return res.departments;
  return [];
};
const ticketDeptIds  = (t: any): string[] => [t.departmentId, t.department_id, t.department?.id, t.dept_id, t.deptId].filter(v => v != null).map(String);
const ticketAgentIds = (t: any): string[] => [t.assignedTo, t.assigned_to, t.agentId, t.agent_id, t.agent?.id, t.assignee?.id, t.assigneeId].filter(v => v != null).map(String);
const ticketCreatorId = (t: any): string => String(t.createdBy ?? t.created_by ?? t.userId ?? t.user_id ?? t.user?.id ?? "");
const isResolved = (t: any) => ["resolved", "closed", "done", "completed"].includes((t.status ?? "").toLowerCase());

/* ─── KPI card ── */
const KpiCard = ({
  title, value, change, up, icon: Icon, accent, accentBg, delay = 0, isDark,
}: {
  title: string; value: string; change: string; up: boolean;
  icon: React.ElementType; accent: string; accentBg: string; delay?: number; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div
        className="rounded-[14px] p-5 hover-lift transition-colors duration-300"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadow,
          borderTop: `3px solid ${accent}`,
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.07em]" style={{ color: T.textMuted }}>{title}</p>
            <p className="text-[1.75rem] font-bold mt-1 leading-none" style={{ color: T.text }}>{value}</p>
          </div>
          <div className="h-10 w-10 rounded-[10px] flex items-center justify-center shrink-0"
            style={{ background: isDark ? `${accent}22` : accentBg }}>
            <Icon className="h-5 w-5" style={{ color: accent }} />
          </div>
        </div>
        <div className="flex items-center gap-1.5 mt-3">
          <span className="h-5 w-5 rounded-full flex items-center justify-center" style={{ background: "rgba(16,185,129,0.1)" }}>
            {up
              ? <ArrowUpRight className="h-3 w-3" style={{ color: "#10B981" }} />
              : <ArrowDownRight className="h-3 w-3" style={{ color: "#10B981" }} />}
          </span>
          <span className="text-[12px] font-semibold" style={{ color: "#10B981" }}>{change}</span>
          <span className="text-[11px]" style={{ color: T.textMuted }}>vs last month</span>
        </div>
      </div>
    </div>
  );
};

/* ─── Section card ── */
const SectionCard = ({
  title, icon: Icon, children, className = "", isDark,
}: {
  title: string; icon?: React.ElementType; children: React.ReactNode; className?: string; isDark: boolean;
}) => {
  const T = useDT(isDark);
  return (
    <div
      className={`rounded-[14px] overflow-hidden transition-colors duration-300 ${className}`}
      style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}
    >
      <div
        className="px-5 py-4 flex items-center gap-2.5"
        style={{ borderBottom: `1px solid ${T.border}`, background: T.sectionHead }}
      >
        {Icon && <Icon className="h-4 w-4" style={{ color: isDark ? "#c4b5fd" : "#7B3A9E" }} />}
        <h2 className="text-[14px] font-semibold" style={{ color: T.text }}>{title}</h2>
      </div>
      {children}
    </div>
  );
};

/* ─── main ── */
const ReportsPage = () => {
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [departments, setDepartments] = useState<any[]>([]);
  const [tickets, setTickets]         = useState<any[]>([]);
  const [allUsers, setAllUsers]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [deptRes, ticketRes, userRes] = await Promise.allSettled([
        departmentApi.getDepartments(),
        ticketApi.getAllTickets ? ticketApi.getAllTickets() : ticketApi.getTickets(),
        userApi.getAllUsers(),
      ]);
      if (deptRes.status   === "fulfilled") setDepartments(extractArray(deptRes.value));
      if (ticketRes.status === "fulfilled") setTickets(extractArray(ticketRes.value));
      if (userRes.status   === "fulfilled") setAllUsers(extractArray(userRes.value));
    } catch {
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const userDeptMap = new Map<string, string>();
  allUsers.forEach(u => {
    const uid    = String(u.id ?? u._id ?? "");
    const deptId = String(u.departmentId ?? u.department_id ?? u.department?.id ?? "");
    if (uid && deptId) userDeptMap.set(uid, deptId);
  });

  const deptPerformance = departments
    .filter(dept => {
      const name = (dept.name ?? "").toLowerCase();
      return NON_IT_KEYWORDS.some(kw => name.includes(kw));
    })
    .map(dept => {
      const deptId = String(dept.id ?? dept._id);
      const deptTickets = tickets.filter(t => {
        if (ticketDeptIds(t).includes(deptId)) return true;
        const creatorDept = userDeptMap.get(ticketCreatorId(t));
        return creatorDept === deptId;
      });
      const total    = deptTickets.length;
      const resolved = deptTickets.filter(isResolved).length;
      const rate     = total > 0 ? Math.round((resolved / total) * 100) : 0;
      return { name: dept.name ?? "Unknown", tickets: total, resolved, rate };
    });

  const agentUsers = allUsers.filter(u => {
    const role = (u.role ?? "").toLowerCase();
    return ["agent", "it", "support", "staff", "helpdesk"].some(r => role.includes(r));
  });
  const agentPool = agentUsers.length > 0 ? agentUsers : allUsers;
  const scoredAgents = agentPool.map(agent => {
    const agentId = String(agent.id ?? agent._id);
    const agentTickets = tickets.filter(t => ticketAgentIds(t).includes(agentId));
    const resolved = agentTickets.filter(isResolved).length;
    return {
      name: agent.name ?? agent.username ?? agent.fullName ?? agent.full_name ?? "Agent",
      resolved, total: agentTickets.length,
    };
  }).sort((a, b) => b.resolved - a.resolved);
  const maxResolved = Math.max(...scoredAgents.map(a => a.resolved), 1);
  const topAgents = scoredAgents.slice(0, Math.max(4, scoredAgents.filter(a => a.resolved > 0).length)).map(a => ({
    ...a,
    rating: a.resolved > 0
      ? Math.min(Math.round(((a.resolved / maxResolved) * 1.5 + 3.5) * 10) / 10, 5.0)
      : 3.5,
  }));

  return (
    <div className="space-y-5 animate-fade-in" style={{ transition: "background 0.3s, color 0.3s" }}>

      {/* Header */}
      <div>
        <h1 className="text-[22px] font-bold tracking-tight" style={{ color: T.text }}>Reports & Analytics</h1>
        <p className="text-[13px] mt-0.5" style={{ color: T.textMuted }}>Performance metrics and helpdesk analytics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k, i) => <KpiCard key={k.title} {...k} delay={i * 60} isDark={isDark} />)}
      </div>

      {/* Monthly Ticket Trends */}
      <SectionCard title="Monthly Ticket Trends" icon={BarChart3} isDark={isDark}>
        <div className="p-5 space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: isDark ? "#9B59B6" : "#5B1E7A" }} />
              <span className="text-[11px] font-medium" style={{ color: T.textMuted }}>Opened</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2.5 w-2.5 rounded-full" style={{ background: "#10B981" }} />
              <span className="text-[11px] font-medium" style={{ color: T.textMuted }}>Closed</span>
            </div>
          </div>
          {ticketTrends.map((t, idx) => (
            <div key={t.month} className="animate-fade-in" style={{ animationDelay: `${idx * 50}ms` }}>
              <div className="flex items-center gap-3">
                <span className="text-[12px] font-semibold w-8 shrink-0" style={{ color: T.text }}>{t.month}</span>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: T.barBg }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(t.opened / MAX_TREND) * 100}%`, background: isDark ? "linear-gradient(90deg,#7B3A9E,#9B59B6)" : "linear-gradient(90deg,#5B1E7A,#7B3A9E)" }} />
                  </div>
                  <span className="text-[11px] font-semibold w-8 text-right" style={{ color: isDark ? "#c4b5fd" : "#5B1E7A" }}>{t.opened}</span>
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="flex-1 h-5 rounded-full overflow-hidden" style={{ background: "rgba(16,185,129,0.08)" }}>
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(t.closed / MAX_TREND) * 100}%`, background: "linear-gradient(90deg,#047857,#10B981)" }} />
                  </div>
                  <span className="text-[11px] font-semibold w-8 text-right" style={{ color: "#10B981" }}>{t.closed}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Bottom row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Department Performance */}
        <SectionCard title="Department Performance" isDark={isDark}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#7B3A9E" }} />
              <span className="text-[13px]" style={{ color: T.textMuted }}>Loading…</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: T.tableThead, borderBottom: `1px solid ${T.border}` }}>
                    {["Department", "Tickets", "Resolved", "Rate"].map(h => (
                      <th
                        key={h}
                        className={`py-2.5 px-4 text-[10px] font-semibold uppercase tracking-[0.07em] ${h === "Department" ? "text-left" : "text-right"}`}
                        style={{ color: T.textMuted }}
                      >{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {deptPerformance.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-10 text-center text-[13px]" style={{ color: T.textMuted }}>
                        {departments.length === 0 ? "No departments found" : "No matching tickets found"}
                      </td>
                    </tr>
                  ) : deptPerformance.map(d => (
                    <tr
                      key={d.name}
                      style={{ borderBottom: `1px solid ${T.border}` }}
                      onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.tableRow}
                      onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                    >
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background: isDark ? "#9B59B6" : "#5B1E7A" }} />
                          <span className="text-[13px] font-semibold" style={{ color: T.text }}>{d.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right text-[13px]" style={{ color: T.textMuted }}>{d.tickets}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-[13px] font-semibold" style={{ color: "#10B981" }}>{d.resolved}</span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          <div className="w-14 h-1.5 rounded-full overflow-hidden" style={{ background: T.progressBg }}>
                            <div className="h-full rounded-full" style={{ width: `${d.rate}%`, background: "linear-gradient(90deg,#5B1E7A,#10B981)" }} />
                          </div>
                          <span className="text-[11px] font-semibold" style={{ color: isDark ? "#c4b5fd" : "#5B1E7A" }}>{d.rate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </SectionCard>

        {/* Top Performing Agents */}
        <SectionCard title="Top Performing Agents" icon={Users} isDark={isDark}>
          {loading ? (
            <div className="flex items-center justify-center py-16 gap-2">
              <Loader2 className="h-5 w-5 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#701D88" }} />
              <span className="text-[13px]" style={{ color: T.textMuted }}>Loading…</span>
            </div>
          ) : topAgents.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-[13px]" style={{ color: T.textMuted }}>
                {allUsers.length === 0 ? "No users found" : "No agent data available"}
              </p>
            </div>
          ) : (
            <div className="p-4 space-y-2">
              {topAgents.map((agent, i) => (
                <div
                  key={`${agent.name}-${i}`}
                  className="flex items-center gap-3 p-3 rounded-[10px] transition-all cursor-default animate-fade-in"
                  style={{ animationDelay: `${i * 60}ms`, border: `1px solid ${T.agentItemBd}` }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.agentItemHov}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                >
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                    style={{
                      background: agentGradients[i % agentGradients.length],
                      boxShadow: "0 2px 8px rgba(93,12,116,0.20)",
                    }}
                  >
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold truncate" style={{ color: T.text }}>{agent.name}</p>
                    <p className="text-[11px]" style={{ color: T.textMuted }}>
                      {agent.resolved} resolved · {agent.total} total
                    </p>
                  </div>
                  <div
                    className="flex items-center gap-1 shrink-0 px-2.5 py-1 rounded-full"
                    style={{ background: T.ratingBg, border: `1px solid ${T.ratingBd}` }}
                  >
                    <Star className="h-3 w-3 fill-current" style={{ color: T.ratingTx }} />
                    <span className="text-[12px] font-bold" style={{ color: T.ratingNum }}>{agent.rating.toFixed(1)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </div>
  );
};

export default ReportsPage;