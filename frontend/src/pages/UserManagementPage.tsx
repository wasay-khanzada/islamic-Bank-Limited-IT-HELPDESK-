import { useState, useEffect } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users, Search, Shield, UserCheck, UserX,
  MoreHorizontal, Trash2, Loader2,
} from "lucide-react";
import { userApi, PendingUser } from "@/api/userApi";
import { toast } from "sonner";
import { useTheme } from "@/context/ThemeContext";

/* ─── dark token map ── */
const useDT = (isDark: boolean) => ({
  surface:      isDark ? "#1a0d30"                    : "#ffffff",
  surfaceHover: isDark ? "rgba(139,92,192,0.07)"      : "rgba(93,12,116,0.03)",
  filterBg:     isDark ? "#160a2a"                    : "#ffffff",
  border:       isDark ? "rgba(139,92,192,0.18)"      : "rgba(93,12,116,0.09)",
  text:         isDark ? "#e8d5f8"                    : "#3d1052",
  textMuted:    isDark ? "#a78cc0"                    : "#9B59B6",
  textSub:      isDark ? "#c4b5fd"                    : "#6B7280",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(93,12,116,0.06), 0 4px 16px rgba(93,12,116,0.05)",
  tableHead:    isDark ? "rgba(139,92,192,0.06)"      : "rgba(93,12,116,0.04)",
  inputBg:      isDark ? "#160a2a"                    : "hsl(280 40% 97%)",
  inputBorder:  isDark ? "rgba(139,92,192,0.25)"      : "hsl(280 20% 88%)",
  monoBg:       isDark ? "rgba(139,92,192,0.15)"      : "",
  monoText:     isDark ? "#c4b5fd"                    : "#9B59B6",
  emptyBg:      isDark ? "rgba(139,92,192,0.06)"      : "rgba(93,12,116,0.06)",
  dropdownBg:   isDark ? "#1a0d30"                    : "#ffffff",
  dropdownBd:   isDark ? "rgba(139,92,192,0.2)"       : "rgba(93,12,116,0.1)",
  dropShadow:   isDark ? "0 4px 24px rgba(0,0,0,0.5)" : "0 4px 24px rgba(93,12,116,0.14)",
  btnHov:       isDark ? "rgba(139,92,192,0.12)"      : "rgba(93,12,116,0.08)",
});

/* ─── configs ── */
const roleCfg: Record<string, {
  label: string; bg: string; text: string; border: string;
  darkBg: string; darkText: string; darkBorder: string;
}> = {
  super_admin: { label: "Super Admin", bg: "#5D0C74",              text: "#fff",    border: "#5D0C74",              darkBg: "rgba(93,12,116,0.35)",     darkText: "#e9d5ff", darkBorder: "rgba(93,12,116,0.6)"   },
  admin:       { label: "Admin",       bg: "#701D88",              text: "#fff",    border: "#701D88",              darkBg: "rgba(112,29,136,0.35)",    darkText: "#e9d5ff", darkBorder: "rgba(112,29,136,0.55)" },
  agent:       { label: "Agent",       bg: "rgba(132,54,152,0.12)", text: "#701D88", border: "rgba(112,29,136,0.35)", darkBg: "rgba(132,54,152,0.2)",    darkText: "#d8b4fe", darkBorder: "rgba(132,54,152,0.4)"  },
  user:        { label: "User",        bg: "rgba(150,98,164,0.10)", text: "#843698", border: "rgba(150,98,164,0.35)", darkBg: "rgba(150,98,164,0.18)",   darkText: "#e9d5ff", darkBorder: "rgba(150,98,164,0.4)"  },
};

const statusCfg: Record<string, {
  bg: string; text: string; border: string; dot: string;
  darkBg: string; darkText: string; darkBorder: string; darkDot: string;
}> = {
  approved: { bg: "rgba(112,29,136,0.08)",  text: "#701D88", border: "rgba(112,29,136,0.30)", dot: "#843698", darkBg: "rgba(139,92,192,0.15)", darkText: "#c4b5fd", darkBorder: "rgba(139,92,192,0.30)", darkDot: "#c4b5fd" },
  pending:  { bg: "rgba(132,54,152,0.08)",  text: "#843698", border: "rgba(132,54,152,0.30)", dot: "#9662A4", darkBg: "rgba(132,54,152,0.18)", darkText: "#d8b4fe", darkBorder: "rgba(132,54,152,0.35)", darkDot: "#9662A4" },
  inactive: { bg: "rgba(150,98,164,0.08)",  text: "#9662A4", border: "rgba(150,98,164,0.30)", dot: "#9662A4", darkBg: "rgba(150,98,164,0.15)", darkText: "#e9d5ff", darkBorder: "rgba(150,98,164,0.35)", darkDot: "#9662A4" },
  rejected: { bg: "rgba(93,12,116,0.08)",   text: "#5D0C74", border: "rgba(93,12,116,0.25)",  dot: "#5D0C74", darkBg: "rgba(93,12,116,0.18)",  darkText: "#c4b5fd", darkBorder: "rgba(93,12,116,0.35)",  darkDot: "#7B3A9E" },
};

const avatarGradients = [
  "linear-gradient(135deg,#5D0C74,#843698)",
  "linear-gradient(135deg,#701D88,#9662A4)",
  "linear-gradient(135deg,#843698,#C82BF5)",
  "linear-gradient(135deg,#5D0C74,#9662A4)",
  "linear-gradient(135deg,#701D88,#843698)",
];

/* ─── stat card ── */
const StatCard = ({ title, value, icon: Icon, accent, accentBg, delay = 0, isDark }:
  { title: string; value: string; icon: React.ElementType; accent: string; accentBg: string; delay?: number; isDark: boolean }) => {
  const T = useDT(isDark);
  return (
    <div className="animate-fade-in-up" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center gap-3 p-4 rounded-[12px] hover-lift transition-colors duration-300"
        style={{
          background: T.surface,
          border: `1px solid ${T.border}`,
          boxShadow: isDark ? "0 1px 3px rgba(0,0,0,0.3)" : "0 1px 3px rgba(93,12,116,0.05)",
          borderTop: `2.5px solid ${accent}`,
        }}>
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

/* ─── main ── */
const UserManagementPage = () => {
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [users, setUsers]           = useState<PendingUser[]>([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getAllUsers();
      if (response.success) setUsers(response.data);
    } catch { toast.error("Failed to load users"); }
    finally { setLoading(false); }
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "all" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const stats = [
    { title: "Total Users", value: users.length.toString(),                                               icon: Users,     accent: "#5D0C74", accentBg: "rgba(93,12,116,0.10)"  },
    { title: "Active",      value: users.filter(u => u.status === "approved").length.toString(),           icon: UserCheck, accent: "#701D88", accentBg: "rgba(112,29,136,0.10)" },
    { title: "Inactive",    value: users.filter(u => u.status !== "approved").length.toString(),           icon: UserX,     accent: "#9662A4", accentBg: "rgba(150,98,164,0.10)" },
    { title: "Admins",      value: users.filter(u => u.role === "admin" || u.role === "super_admin").length.toString(), icon: Shield, accent: "#843698", accentBg: "rgba(132,54,152,0.10)" },
  ];

  return (
    <div className="space-y-5 animate-fade-in" style={{ transition: "background 0.3s, color 0.3s" }}>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight" style={{ color: T.text }}>User Management</h1>
          <p className="text-[13px] mt-0.5" style={{ color: T.textMuted }}>Manage users, roles, and permissions</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map((s, i) => <StatCard key={s.title} {...s} delay={i * 60} isDark={isDark} />)}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 p-4 rounded-[12px] transition-colors duration-300"
        style={{ background: T.filterBg, border: `1px solid ${T.border}`, boxShadow: isDark ? "0 1px 4px rgba(0,0,0,0.3)" : "0 1px 4px rgba(93,12,116,0.05)" }}>
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: T.textMuted }} />
          <input
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-[8px] outline-none transition-all"
            style={{ background: T.inputBg, border: `1.5px solid ${T.inputBorder}`, color: T.text, fontFamily: "inherit" }}
            placeholder="Search users…"
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
        <Select value={roleFilter} onValueChange={setRoleFilter}>
          <SelectTrigger className="w-40 h-9 text-[13px]"
            style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent style={{ background: T.surface, borderColor: T.border }}>
            {["all","super_admin","admin","agent","user"].map(v => (
              <SelectItem key={v} value={v} style={{ color: T.text }}>
                {v === "all" ? "All Roles" : v === "super_admin" ? "Super Admin" : v.charAt(0).toUpperCase() + v.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="text-[12px] font-medium self-center ml-auto" style={{ color: T.textMuted }}>
          {filtered.length} user{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Table */}
      <div className="rounded-[14px] overflow-hidden transition-colors duration-300"
        style={{ background: T.surface, border: `1px solid ${T.border}`, boxShadow: T.shadow }}>
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="h-6 w-6 animate-spin" style={{ color: isDark ? "#c4b5fd" : "#701D88" }} />
            <p className="text-[13px]" style={{ color: T.textMuted }}>Loading users…</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr style={{ background: T.tableHead, borderBottom: `1px solid ${T.border}` }}>
                    {["User", "Employee ID", "Department", "Role", "Status", "Actions"].map((h, i) => (
                      <th key={h}
                        className={`text-left py-3 px-4 text-[10px] font-semibold uppercase tracking-[0.08em] ${i === 1 ? "hidden md:table-cell" : i === 2 ? "hidden sm:table-cell" : ""}`}
                        style={{ color: T.textMuted }}>
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((user, idx) => {
                    const rcfg   = roleCfg[user.role] || roleCfg.user;
                    const sk     = (user.status || "").toLowerCase();
                    const scfg   = statusCfg[sk] || statusCfg.pending;
                    const grad   = avatarGradients[idx % avatarGradients.length];
                    const inits  = user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
                    return (
                      <tr
                        key={user.id}
                        className="group transition-colors animate-fade-in"
                        style={{ borderBottom: `1px solid ${T.border}`, animationDelay: `${idx * 30}ms` }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.surfaceHover}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                      >
                        {/* User */}
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold shrink-0"
                              style={{ background: grad }}>
                              {inits}
                            </div>
                            <div>
                              <p className="text-[13px] font-semibold" style={{ color: T.text }}>{user.name}</p>
                              <p className="text-[11px]" style={{ color: T.textMuted }}>{user.email}</p>
                            </div>
                          </div>
                        </td>

                        {/* Employee ID */}
                        <td className="py-3.5 px-4 hidden md:table-cell">
                          <span className="font-mono text-[12px]" style={{ color: T.monoText }}>{user.employeeId || "N/A"}</span>
                        </td>

                        {/* Department */}
                        <td className="py-3.5 px-4 hidden sm:table-cell text-[13px]" style={{ color: T.textSub }}>
                          {user.department?.name || "N/A"}
                        </td>

                        {/* Role */}
                        <td className="py-3.5 px-4">
                          <span
                            className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{
                              background: isDark ? rcfg.darkBg : rcfg.bg,
                              color: isDark ? rcfg.darkText : rcfg.text,
                              border: `1px solid ${isDark ? rcfg.darkBorder : rcfg.border}`,
                            }}
                          >
                            {rcfg.label}
                          </span>
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4">
                          <span
                            className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full"
                            style={{
                              background: isDark ? scfg.darkBg : scfg.bg,
                              color: isDark ? scfg.darkText : scfg.text,
                              border: `1px solid ${isDark ? scfg.darkBorder : scfg.border}`,
                            }}
                          >
                            <span className="h-1.5 w-1.5 rounded-full" style={{ background: isDark ? scfg.darkDot : scfg.dot }} />
                            {user.status}
                          </span>
                        </td>

                        {/* ── Actions: only Deactivate ── */}
                        <td className="py-3.5 px-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button
                                className="h-8 w-8 rounded-[7px] flex items-center justify-center transition-all"
                                style={{ color: T.textMuted }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.btnHov}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                              >
                                <MoreHorizontal className="h-4 w-4" />
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="rounded-[12px]"
                              style={{ background: T.dropdownBg, boxShadow: T.dropShadow, border: `1px solid ${T.dropdownBd}` }}>
                              <DropdownMenuItem className="gap-2 cursor-pointer text-[13px]" style={{ color: "#DC2626" }}>
                                <Trash2 className="h-3.5 w-3.5" /> Deactivate
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <Users className="h-10 w-10 mx-auto mb-3 opacity-20" style={{ color: "#5D0C74" }} />
                <p className="text-[13px]" style={{ color: T.textMuted }}>No users found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserManagementPage;