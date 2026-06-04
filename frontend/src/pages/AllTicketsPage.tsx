import { useState, useEffect } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Ticket, Search, Eye, Pencil, Trash2, Inbox,
  ChevronLeft, ChevronRight, Loader2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ticketApi, Ticket as TicketType } from "@/api/ticketApi";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { toast } from "sonner";

/* ── Dark token map ───────────────────────────────────── */
const useDT = (isDark: boolean) => ({
  surface:      isDark ? "#1a0d30" : "#ffffff",
  surfaceHover: isDark ? "rgba(139,92,192,0.08)" : "rgba(243,233,251,0.3)",
  filterBg:     isDark ? "#160a2a" : "#ffffff",
  border:       isDark ? "rgba(139,92,192,0.18)" : "rgba(91,30,122,0.09)",
  text:         isDark ? "#e8d5f8" : "#3d1052",
  textMuted:    isDark ? "#a78cc0" : "#9B59B6",
  textSub:      isDark ? "#c4b5fd" : "#6B7280",
  tableHead:    isDark ? "rgba(139,92,192,0.08)" : "rgba(243,233,251,0.5)",
  shadow:       isDark
    ? "0 1px 3px rgba(0,0,0,0.4), 0 4px 16px rgba(0,0,0,0.3)"
    : "0 1px 3px rgba(91,30,122,0.06), 0 4px 16px rgba(91,30,122,0.05)",
  monoBg:       isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.07)",
  monoText:     isDark ? "#c4b5fd" : "#7B3A9E",
  inputBg:      isDark ? "#160a2a" : "hsl(280 40% 97%)",
  inputBorder:  isDark ? "rgba(139,92,192,0.25)" : "hsl(280 20% 88%)",
  inputFocusBorder: isDark ? "rgba(139,92,192,0.6)" : "rgba(91,30,122,0.45)",
  inputFocusShadow: isDark ? "0 0 0 3px rgba(139,92,192,0.15)" : "0 0 0 3px rgba(91,30,122,0.09)",
  inputFocusBg: isDark ? "#1a0d30" : "#fff",
  emptyBg:      isDark ? "rgba(139,92,192,0.08)" : "rgba(91,30,122,0.06)",
  pagBg:        isDark ? "#1a0d30" : "#fff",
  pagBgHover:   isDark ? "rgba(139,92,192,0.12)" : "rgba(91,30,122,0.06)",
  pagText:      isDark ? "#c4b5fd" : "#5B1E7A",
  pagBorder:    isDark ? "rgba(139,92,192,0.25)" : "rgba(91,30,122,0.15)",
  badgeBg:      isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.07)",
  badgeText:    isDark ? "#c4b5fd" : "#5B1E7A",
});

const norm = (v?: string) => v?.toLowerCase().replace(/_/g, "-") || "";

/* ── Pills ────────────────────────────────────────────── */
const statusCfg: Record<string, any> = {
  open:          { label:"Open",        dot:"#8b5cf6", bg:"rgba(90,14,122,0.10)",   text:"#5A0E7A",  border:"rgba(90,14,122,0.22)",   dBg:"rgba(139,92,192,0.18)", dText:"#c4b5fd", dBorder:"rgba(139,92,192,0.35)" },
  "in-progress": { label:"In Progress", dot:"#a78bfa", bg:"rgba(123,44,191,0.10)",  text:"#7B2CBF",  border:"rgba(123,44,191,0.22)",  dBg:"rgba(167,139,250,0.15)", dText:"#c4b5fd", dBorder:"rgba(167,139,250,0.30)" },
  resolved:      { label:"Resolved",    dot:"#c4b5fd", bg:"rgba(160,108,213,0.10)", text:"#A06CD5",  border:"rgba(160,108,213,0.22)", dBg:"rgba(196,181,253,0.12)", dText:"#ddd6fe", dBorder:"rgba(196,181,253,0.25)" },
  closed:        { label:"Closed",      dot:"#9CA3AF", bg:"rgba(205,180,219,0.18)", text:"#6B7280",  border:"rgba(205,180,219,0.40)", dBg:"rgba(107,114,128,0.15)", dText:"#9ca3af", dBorder:"rgba(107,114,128,0.30)" },
};
const priorityCfg: Record<string, any> = {
  critical: { label:"Critical", bg:"#5A0E7A", text:"#fff", border:"#5A0E7A", stripe:"#5A0E7A", dBg:"rgba(139,92,192,0.25)", dText:"#e9d5ff", dBorder:"rgba(139,92,192,0.45)" },
  urgent:   { label:"Urgent",   bg:"#5A0E7A", text:"#fff", border:"#5A0E7A", stripe:"#5A0E7A", dBg:"rgba(139,92,192,0.25)", dText:"#e9d5ff", dBorder:"rgba(139,92,192,0.45)" },
  high:     { label:"High",     bg:"#7B2CBF", text:"#fff", border:"#7B2CBF", stripe:"#7B2CBF", dBg:"rgba(123,44,191,0.25)", dText:"#d8b4fe", dBorder:"rgba(123,44,191,0.45)" },
  medium:   { label:"Medium",   bg:"rgba(160,108,213,0.18)", text:"#A06CD5", border:"rgba(160,108,213,0.35)", stripe:"#A06CD5", dBg:"rgba(160,108,213,0.18)", dText:"#c4b5fd", dBorder:"rgba(160,108,213,0.35)" },
  low:      { label:"Low",      bg:"rgba(205,180,219,0.22)", text:"#8B5CF6", border:"rgba(205,180,219,0.45)", stripe:"#CDB4DB", dBg:"rgba(139,92,192,0.12)", dText:"#a78bfa", dBorder:"rgba(139,92,192,0.25)" },
};

const StatusPill = ({ status, isDark }: { status: string; isDark: boolean }) => {
  const s = statusCfg[norm(status)] || statusCfg.open;
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background:isDark?s.dBg:s.bg, color:isDark?s.dText:s.text, border:`1px solid ${isDark?s.dBorder:s.border}` }}>
      <span className="h-1.5 w-1.5 rounded-full shrink-0" style={{ background:s.dot }}/>{s.label}
    </span>
  );
};
const PriorityPill = ({ priority, isDark }: { priority: string; isDark: boolean }) => {
  const p = priorityCfg[norm(priority)] || priorityCfg.medium;
  return (
    <span className="inline-flex items-center text-[11px] font-semibold px-2.5 py-1 rounded-full"
      style={{ background:isDark?p.dBg:p.bg, color:isDark?p.dText:p.text, border:`1px solid ${isDark?p.dBorder:p.border}` }}>
      {p.label}
    </span>
  );
};

/* ── Main ─────────────────────────────────────────────── */
const AllTicketsPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const T = useDT(isDark);

  const [search, setSearch]                 = useState("");
  const [statusFilter, setStatusFilter]     = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [page, setPage]                     = useState(1);
  const [tickets, setTickets]               = useState<TicketType[]>([]);
  const [loading, setLoading]               = useState(true);

  const PER_PAGE  = 10;
  const isAdmin   = user?.role === "admin" || user?.role === "super_admin";
  const isAgent   = user?.role === "agent";
  const canEdit   = isAdmin || isAgent;
  const canDelete = isAdmin;

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      let res: TicketType[] = [];
      if (isAdmin)      res = await ticketApi.getAllTickets();
      else if (isAgent) res = await ticketApi.getAssignedTickets();
      else              res = await ticketApi.getMyTickets();
      setTickets(res || []);
    } catch {
      toast.error("Failed to load tickets");
    } finally {
      setLoading(false);
    }
  };

  const filtered = tickets.filter((t: any) => {
    const title    = t.subject || t.title || "";
    const reporter = t.creator?.name || t.user?.name || "";
    return (
      (!search || title.toLowerCase().includes(search.toLowerCase()) || reporter.toLowerCase().includes(search.toLowerCase())) &&
      (statusFilter   === "all" || norm(t.status)   === statusFilter) &&
      (priorityFilter === "all" || norm(t.priority) === priorityFilter)
    );
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated  = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleDelete = async (id: number) => {
    try {
      await ticketApi.deleteTicket(id);
      setTickets(prev => prev.filter(t => t.id !== id));
      toast.success("Ticket deleted");
    } catch {
      toast.error("Failed to delete ticket");
    }
  };

  const pageTitle = isAdmin ? "All System Tickets" : isAgent ? "My Assigned Tickets" : "My Tickets";
  const pageDesc  = isAdmin
    ? "View and manage all support tickets across the system"
    : isAgent ? "Tickets assigned to you"
    : "Tickets you have submitted";

  return (
    <div className="space-y-5 animate-fade-in">

      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight transition-colors duration-300" style={{ color: T.text }}>{pageTitle}</h1>
          <p className="text-[13px] mt-0.5 transition-colors duration-300" style={{ color: T.textMuted }}>{pageDesc}</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2 text-[12px] font-medium px-3 py-1.5 rounded-[8px]" style={{ background: T.badgeBg, color: T.badgeText }}>
            <Ticket className="h-3.5 w-3.5" />
            {filtered.length} ticket{filtered.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center p-4 rounded-[12px] transition-colors duration-300"
        style={{ background: T.filterBg, border:`1px solid ${T.border}`, boxShadow: isDark?"0 1px 4px rgba(0,0,0,0.3)":"0 1px 4px rgba(91,30,122,0.05)" }}>
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none" style={{ color: T.textMuted }} />
          <input
            className="w-full h-9 pl-9 pr-3 text-[13px] rounded-[8px] outline-none transition-all"
            style={{ background: T.inputBg, border:`1.5px solid ${T.inputBorder}`, color: T.text, fontFamily:"inherit" }}
            placeholder="Search by subject or reporter…"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            onFocus={e => {
              e.target.style.borderColor = T.inputFocusBorder;
              e.target.style.boxShadow = T.inputFocusShadow;
              e.target.style.background = T.inputFocusBg;
            }}
            onBlur={e => {
              e.target.style.borderColor = T.inputBorder;
              e.target.style.boxShadow = "none";
              if (!search) e.target.style.background = T.inputBg;
            }}
          />
        </div>
        <Select value={statusFilter} onValueChange={v => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-[13px]" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent style={{ background: T.surface, borderColor: T.border }}>
            {["all","open","in-progress","resolved","closed"].map(v => (
              <SelectItem key={v} value={v} style={{ color: T.text }}>{v==="all"?"All Status":v.charAt(0).toUpperCase()+v.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={v => { setPriorityFilter(v); setPage(1); }}>
          <SelectTrigger className="w-36 h-9 text-[13px]" style={{ borderColor: T.border, background: T.surface, color: T.text }}>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent style={{ background: T.surface, borderColor: T.border }}>
            {["all","critical","urgent","high","medium","low"].map(v => (
              <SelectItem key={v} value={v} style={{ color: T.text }}>{v==="all"?"All Priority":v.charAt(0).toUpperCase()+v.slice(1)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-[14px] overflow-hidden transition-colors duration-300"
        style={{ background: T.surface, border:`1px solid ${T.border}`, boxShadow: T.shadow }}>
        {loading ? (
          <div className="py-24 flex flex-col items-center gap-3">
            <Loader2 className="animate-spin h-6 w-6" style={{ color: "#7B3A9E" }} />
            <p className="text-[13px]" style={{ color: T.textMuted }}>Loading tickets…</p>
          </div>
        ) : paginated.length === 0 ? (
          <div className="py-24 text-center">
            <div className="h-14 w-14 rounded-full mx-auto flex items-center justify-center mb-3" style={{ background: T.emptyBg }}>
              <Inbox className="h-6 w-6 opacity-40" style={{ color: isDark?"#c4b5fd":"#5B1E7A" }} />
            </div>
            <p className="text-[13px]" style={{ color: T.textMuted }}>No tickets found</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr style={{ background: T.tableHead, borderBottom:`1px solid ${T.border}` }}>
                {["ID","Subject","Reporter","Priority","Status","Created","Actions"].map((h,i) => (
                  <th key={h}
                    className={`py-3 px-4 text-[10px] font-semibold uppercase tracking-[0.08em] ${
                      i === 6 ? "text-center" : "text-left"
                    } ${i===2?"hidden md:table-cell":i===3?"hidden sm:table-cell":i===5?"hidden lg:table-cell":""}`}
                    style={{ color: T.textMuted }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((t: any) => {
                const status   = norm(t.status);
                const priority = norm(t.priority);
                const pc = priorityCfg[priority] || priorityCfg.medium;
                return (
                  <tr key={t.id} className="group transition-colors cursor-pointer" style={{ borderBottom:`1px solid ${T.border}` }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = T.surfaceHover}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                    onClick={() => navigate(`/tickets/${t.id}`)}>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="w-1 h-8 rounded-full shrink-0" style={{ background: pc.stripe }}/>
                        <span className="font-mono text-[11px] font-bold px-1.5 py-0.5 rounded" style={{ background: T.monoBg, color: T.monoText }}>#{t.id}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 max-w-[180px]">
                      <p className="text-[13px] font-semibold truncate" style={{ color: T.text }}>{t.subject||t.title}</p>
                      {t.category?.name && <p className="text-[11px] truncate mt-0.5" style={{ color: T.textMuted }}>{t.category.name}</p>}
                    </td>
                    <td className="py-3.5 px-4 hidden md:table-cell text-[13px]" style={{ color: T.textSub }}>{t.creator?.name||t.user?.name||"—"}</td>
                    <td className="py-3.5 px-4 hidden sm:table-cell"><PriorityPill priority={priority} isDark={isDark}/></td>
                    <td className="py-3.5 px-4"><StatusPill status={status} isDark={isDark}/></td>
                    <td className="py-3.5 px-4 hidden lg:table-cell text-[12px]" style={{ color: T.textMuted }}>
                      {new Date(t.createdAt).toLocaleDateString("en-PK",{day:"numeric",month:"short",year:"numeric"})}
                    </td>
                    {/* ── Actions cell: centered, fixed width, stop row click ── */}
                    <td className="py-3.5 px-4" onClick={e => e.stopPropagation()}>
                      <div className="flex items-center justify-center gap-1">
                        <button title="View"
                          className="h-8 w-8 rounded-[7px] flex items-center justify-center transition-all"
                          style={{ color: isDark?"#c4b5fd":"#5B1E7A" }}
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark?"rgba(139,92,192,0.15)":"rgba(91,30,122,0.08)"}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                          onClick={() => navigate(`/tickets/${t.id}`)}>
                          <Eye className="h-4 w-4"/>
                        </button>
                        {canEdit && (
                          <button title="Edit"
                            className="h-8 w-8 rounded-[7px] flex items-center justify-center transition-all"
                            style={{ color: isDark?"#a78bfa":"#7B2CBF" }}
                            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark?"rgba(123,44,191,0.15)":"rgba(123,44,191,0.08)"}
                            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                            onClick={() => navigate(`/tickets/${t.id}?edit=true`)}>
                            <Pencil className="h-3.5 w-3.5"/>
                          </button>
                        )}
                        {canDelete && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <button title="Delete"
                                className="h-8 w-8 rounded-[7px] flex items-center justify-center transition-all"
                                style={{ color: "#DC2626" }}
                                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark?"rgba(239,68,68,0.12)":"rgba(239,68,68,0.08)"}
                                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}>
                                <Trash2 className="h-3.5 w-3.5"/>
                              </button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="rounded-[16px]"
                              style={{ background: T.surface, borderColor: T.border, color: T.text }}>
                              <AlertDialogHeader>
                                <AlertDialogTitle style={{ color: T.text }}>Delete ticket #{t.id}?</AlertDialogTitle>
                                <AlertDialogDescription style={{ color: T.textMuted }}>
                                  This action cannot be undone. The ticket and all associated data will be permanently removed.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel style={{ background: T.surface, borderColor: T.border, color: T.text }}>Cancel</AlertDialogCancel>
                                <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => handleDelete(t.id)}>Delete</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {!loading && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <span className="text-[12px]" style={{ color: T.textMuted }}>
            Page {page} of {totalPages} · {filtered.length} total
          </span>
          <div className="flex gap-2">
            {[
              { label:<ChevronLeft className="h-4 w-4"/>, disabled:page===1, onClick:()=>setPage(p=>p-1) },
              { label:<ChevronRight className="h-4 w-4"/>, disabled:page===totalPages, onClick:()=>setPage(p=>p+1) },
            ].map((btn,i) => (
              <button key={i} disabled={btn.disabled} onClick={btn.onClick}
                className="h-8 w-8 rounded-[8px] flex items-center justify-center transition-all disabled:opacity-40"
                style={{ border:`1px solid ${T.pagBorder}`, color:T.pagText, background:T.pagBg }}
                onMouseEnter={e => !btn.disabled&&((e.currentTarget as HTMLElement).style.background=T.pagBgHover)}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.background=T.pagBg)}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AllTicketsPage;