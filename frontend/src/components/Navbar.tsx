import { Bell, Search, Menu, LogOut, User, X, Ticket, Users, Loader2, Sun, Moon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { notificationApi, Notification } from "@/api/notificationApi";
import { ticketApi } from "@/api/ticketApi";
import { userApi } from "@/api/userApi";
import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

interface NavbarProps {
  title:       string;
  onMenuClick: () => void;
}

interface SearchResult {
  id:    number;
  label: string;
  sub:   string;
  type:  "ticket" | "user";
  url:   string;
}

const Navbar = ({ title, onMenuClick }: NavbarProps) => {
  const { user, logout }       = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate               = useNavigate();

  /* ── Notifications ── */
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount]     = useState(0);

  useEffect(() => { if (user) fetchNotifications(); }, [user]);

  const fetchNotifications = async () => {
    try {
      const data = await notificationApi.getNotifications();
      const list = data || [];
      const unread = list.filter((n: Notification) => !n.isRead);
      setNotifications(unread);
      setUnreadCount(unread.length);
    } catch { /* silent */ }
  };

  const markRead = async (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    setUnreadCount(prev => Math.max(0, prev - 1));
    try {
      await notificationApi.markAsRead(id);
    } catch {
      fetchNotifications();
    }
  };

  const markAllRead = async () => {
    if (notifications.length === 0) return;
    setNotifications([]);
    setUnreadCount(0);
    toast.success("All notifications marked as read");
    try {
      await notificationApi.markAllAsRead();
    } catch {
      fetchNotifications();
    }
  };

  /* ── Search ── */
  const [query, setQuery]           = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [results, setResults]       = useState<SearchResult[]>([]);
  const [searching, setSearching]   = useState(false);
  const searchRef                   = useRef<HTMLDivElement>(null);
  const debounceRef                 = useRef<ReturnType<typeof setTimeout>>();

  const isAdminOrSuper = user?.role === "admin" || user?.role === "super_admin";
  const isAgent        = user?.role === "agent";

  const runSearch = useCallback(async (q: string) => {
    if (!q.trim() || q.length < 2) { setResults([]); return; }
    setSearching(true);
    try {
      const hits: SearchResult[] = [];
      const ql = q.toLowerCase();

      try {
        let tickets: any[] = [];
        if (isAdminOrSuper)    tickets = await ticketApi.getAllTickets();
        else if (isAgent)      tickets = await ticketApi.getAssignedTickets();
        else                   tickets = await ticketApi.getMyTickets();

        const list = Array.isArray(tickets) ? tickets : (tickets as any)?.data ?? [];
        list
          .filter((t: any) => (t.subject || t.title || "").toLowerCase().includes(ql) || String(t.id).includes(q))
          .slice(0, 5)
          .forEach((t: any) => hits.push({
            id: t.id, type: "ticket",
            label: t.subject || t.title || `Ticket #${t.id}`,
            sub: `#${t.id} · ${t.status || "open"}`,
            url: `/tickets/${t.id}`,
          }));
      } catch { /* silent */ }

      if (isAdminOrSuper) {
        try {
          const res = await userApi.getAllUsers();
          (res.data || [])
            .filter((u: any) =>
              u.name?.toLowerCase().includes(ql) ||
              u.email?.toLowerCase().includes(ql) ||
              u.employeeId?.toLowerCase().includes(ql)
            )
            .slice(0, 4)
            .forEach((u: any) => hits.push({
              id: u.id, type: "user",
              label: u.name || u.email,
              sub: `${u.role} · ${u.email}`,
              url: "/users",
            }));
        } catch { /* silent */ }
      }

      setResults(hits);
    } finally {
      setSearching(false);
    }
  }, [isAdminOrSuper, isAgent]);

  useEffect(() => {
    clearTimeout(debounceRef.current);
    if (query.length >= 2) {
      debounceRef.current = setTimeout(() => runSearch(query), 350);
    } else {
      setResults([]);
    }
  }, [query, runSearch]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleResultClick = (r: SearchResult) => {
    navigate(r.url);
    setQuery("");
    setSearchOpen(false);
  };

  const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U";
  const roleLabel: Record<string, string> = {
    super_admin: "Super Admin", admin: "Admin", agent: "Agent", user: "User",
  };
  const roleColor: Record<string, string> = {
    super_admin: "#5B1E7A", admin: "#7B3A9E", agent: "#0F6E56", user: "#3B82F6",
  };

  /* ── Dark-aware style helpers ── */
  const navBg        = isDark
    ? "rgba(22, 10, 36, 0.92)"
    : "rgba(255,255,255,0.9)";
  const navBorder    = isDark
    ? "1px solid rgba(139,92,192,0.15)"
    : "1px solid rgba(91,30,122,0.08)";
  const hoverBg      = isDark ? "rgba(91,30,122,0.25)" : "#F3E9FB";
  const titleColor   = isDark ? "#e2d4f0" : "#3d1052";
  const subtitleColor= isDark ? "#a78cc0" : "#9B59B6";
  const searchBg     = isDark ? "hsl(270 22% 14%)" : "hsl(280 40% 97%)";
  const searchBorder = isDark ? "hsl(270 18% 25%)" : "hsl(280 20% 88%)";
  const searchColor  = isDark ? "#e2d4f0" : "#3d1052";
  const dropdownBg   = isDark ? "hsl(270 22% 11%)" : "#fff";
  const dropdownBorder = isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.1)";
  const itemColor    = isDark ? "#e2d4f0" : "#3d1052";
  const dividerColor = isDark ? "rgba(139,92,192,0.12)" : "rgba(91,30,122,0.07)";

  return (
    <header
      className="h-[3.75rem] flex items-center justify-between px-4 lg:px-6 shrink-0 gap-3 z-20 relative transition-colors duration-300"
      style={{
        background: navBg,
        backdropFilter: "blur(20px) saturate(1.6)",
        WebkitBackdropFilter: "blur(20px) saturate(1.6)",
        borderBottom: navBorder,
        boxShadow: isDark
          ? "0 1px 0 rgba(0,0,0,0.3), 0 2px 16px rgba(0,0,0,0.2)"
          : "0 1px 0 rgba(91,30,122,0.05), 0 2px 16px rgba(91,30,122,0.04)",
      }}
    >

      {/* ── Left: menu + page title ── */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          className="lg:hidden shrink-0 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-150"
          style={{ color: isDark ? "#c4a0e8" : "#5B1E7A" }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
          onClick={onMenuClick}
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="hidden sm:flex items-center gap-2.5 min-w-0">
          <span
            className="h-5 w-[3px] rounded-full shrink-0"
            style={{ background: "linear-gradient(to bottom, #5B1E7A, #C8973A)" }}
          />
          <h1
            className="text-[15px] font-semibold truncate tracking-tight transition-colors duration-300"
            style={{ color: titleColor }}
          >
            {title}
          </h1>
        </div>
      </div>

      {/* ── Center: Search ── */}
      <div ref={searchRef} className="relative flex-1 max-w-sm hidden md:block">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 pointer-events-none"
            style={{ color: isDark ? "#a78cc0" : "#9B59B6" }}
          />
          <input
            value={query}
            placeholder="Search tickets, users…"
            className="w-full h-9 pl-9 pr-8 text-[13px] rounded-[9px] transition-all duration-150 outline-none"
            style={{
              background: searchBg,
              border: `1.5px solid ${searchBorder}`,
              color: searchColor,
              fontFamily: "inherit",
            }}
            onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }}
            onFocus={e => {
              e.target.style.background = isDark ? "hsl(270 22% 16%)" : "#fff";
              e.target.style.borderColor = isDark ? "rgba(139,92,192,0.5)" : "rgba(91,30,122,0.45)";
              e.target.style.boxShadow = isDark
                ? "0 0 0 3px rgba(139,92,192,0.15)"
                : "0 0 0 3px rgba(91,30,122,0.10)";
              setSearchOpen(true);
            }}
            onBlur={e => {
              if (!query) {
                e.target.style.background = searchBg;
                e.target.style.borderColor = searchBorder;
                e.target.style.boxShadow = "none";
              }
            }}
          />
          {query && (
            <button
              className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center transition-all"
              style={{ color: subtitleColor }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
              onClick={() => { setQuery(""); setResults([]); }}
            >
              <X className="h-2.5 w-2.5" />
            </button>
          )}
        </div>

        {/* ── Search Results Panel ── */}
        {searchOpen && query.length >= 2 && (
          <div
            className="absolute top-full mt-2 left-0 right-0 rounded-[12px] overflow-hidden z-50 animate-fade-in"
            style={{
              background: dropdownBg,
              border: `1px solid ${dropdownBorder}`,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(91,30,122,0.14), 0 1px 4px rgba(0,0,0,0.06)",
            }}
          >
            {searching ? (
              <div className="flex items-center gap-2.5 px-4 py-3.5 text-[13px]" style={{ color: subtitleColor }}>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Searching…</span>
              </div>
            ) : results.length === 0 ? (
              <div className="px-4 py-4 text-[13px]" style={{ color: subtitleColor }}>
                No results found for <span className="font-medium" style={{ color: isDark ? "#c4a0e8" : "#5B1E7A" }}>"{query}"</span>
              </div>
            ) : (
              <div className="py-1.5 max-h-72 overflow-y-auto">
                {["ticket", "user"].map(type => {
                  const group = results.filter(r => r.type === type);
                  if (!group.length) return null;
                  return (
                    <div key={type}>
                      <div
                        className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.09em]"
                        style={{ color: isDark ? "rgba(167,140,192,0.6)" : "rgba(91,30,122,0.45)" }}
                      >
                        {type === "ticket" ? "Tickets" : "Users"}
                      </div>
                      {group.map((r, i) => (
                        <button
                          key={`${r.type}-${r.id}-${i}`}
                          onClick={() => handleResultClick(r)}
                          className="flex items-center gap-3 w-full px-3 py-2.5 text-left transition-all duration-100"
                          onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                          onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                        >
                          <div
                            className="h-7 w-7 rounded-[7px] flex items-center justify-center shrink-0"
                            style={{
                              backgroundColor: r.type === "ticket"
                                ? (isDark ? "rgba(139,92,192,0.2)" : "rgba(91,30,122,0.08)")
                                : (isDark ? "rgba(15,110,86,0.2)" : "rgba(15,110,86,0.08)"),
                              color: r.type === "ticket"
                                ? (isDark ? "#c4a0e8" : "#5B1E7A")
                                : "#0F6E56",
                            }}
                          >
                            {r.type === "ticket"
                              ? <Ticket className="h-3.5 w-3.5" />
                              : <Users className="h-3.5 w-3.5" />
                            }
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-medium truncate" style={{ color: itemColor }}>{r.label}</p>
                            <p className="text-[11px] truncate" style={{ color: subtitleColor }}>{r.sub}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Right actions ── */}
      <div className="flex items-center gap-1 shrink-0">

        {/* ── Dark / Light toggle ── */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle dark mode"
          title={isDark ? "Switch to light mode" : "Switch to dark mode"}
          className="relative h-9 w-[62px] rounded-[20px] flex items-center transition-all duration-300 shrink-0 overflow-hidden"
          style={{
            background: isDark
              ? "linear-gradient(135deg, #1e0a32 0%, #2d1050 100%)"
              : "linear-gradient(135deg, #e8d5f7 0%, #f3e9fb 100%)",
            border: isDark
              ? "1.5px solid rgba(139,92,192,0.3)"
              : "1.5px solid rgba(91,30,122,0.18)",
            boxShadow: isDark
              ? "inset 0 1px 3px rgba(0,0,0,0.4), 0 0 0 0px rgba(139,92,192,0)"
              : "inset 0 1px 3px rgba(91,30,122,0.08)",
            padding: "0 4px",
          }}
        >
          {/* Track icons */}
          <Sun
            className="absolute left-[7px] h-3 w-3 transition-all duration-300"
            style={{
              color: isDark ? "rgba(200,151,58,0.25)" : "#C8973A",
              opacity: isDark ? 0.3 : 1,
              transform: isDark ? "scale(0.8)" : "scale(1)",
            }}
          />
          <Moon
            className="absolute right-[7px] h-3 w-3 transition-all duration-300"
            style={{
              color: isDark ? "#c4a0e8" : "rgba(91,30,122,0.25)",
              opacity: isDark ? 1 : 0.3,
              transform: isDark ? "scale(1)" : "scale(0.8)",
            }}
          />
          {/* Thumb */}
          <span
            className="h-[22px] w-[22px] rounded-full flex items-center justify-center shadow-md transition-all duration-300"
            style={{
              background: isDark
                ? "linear-gradient(135deg, #7B3A9E 0%, #5B1E7A 100%)"
                : "linear-gradient(135deg, #fff 0%, #f3e9fb 100%)",
              boxShadow: isDark
                ? "0 2px 8px rgba(0,0,0,0.5), 0 0 0 1px rgba(139,92,192,0.4)"
                : "0 2px 6px rgba(91,30,122,0.2), 0 0 0 1px rgba(91,30,122,0.1)",
              transform: isDark ? "translateX(28px)" : "translateX(0px)",
              position: "relative",
              zIndex: 1,
            }}
          >
            {isDark
              ? <Moon className="h-2.5 w-2.5 text-white" />
              : <Sun className="h-2.5 w-2.5" style={{ color: "#C8973A" }} />
            }
          </span>
        </button>

        {/* Divider */}
        <span className="h-5 w-px mx-0.5" style={{ background: isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.1)" }} />

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="relative h-9 w-9 rounded-[9px] flex items-center justify-center transition-all duration-150"
              style={{ color: isDark ? "#c4a0e8" : "#5B1E7A" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
            >
              <Bell className="h-[18px] w-[18px]" />
              {unreadCount > 0 && (
                <span className="notif-dot badge-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-[340px] p-0 rounded-[14px] overflow-hidden"
            style={{
              background: dropdownBg,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(91,30,122,0.14), 0 1px 4px rgba(0,0,0,0.06)",
              border: `1px solid ${dropdownBorder}`,
            }}
          >
            {/* Panel header */}
            <div
              className="flex items-center justify-between px-4 py-3"
              style={{
                background: "linear-gradient(135deg, #5B1E7A 0%, #7B3A9E 100%)",
              }}
            >
              <div className="flex items-center gap-2">
                <Bell className="h-3.5 w-3.5 text-white/80" />
                <span className="text-[13px] font-semibold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span
                    className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
                    style={{ background: "#C8973A", color: "#fff" }}
                  >
                    {unreadCount}
                  </span>
                )}
              </div>
              {notifications.length > 0 && (
                <button
                  className="text-[11px] font-medium text-white/70 hover:text-white transition-colors"
                  onClick={e => { e.stopPropagation(); markAllRead(); }}
                >
                  Mark all read
                </button>
              )}
            </div>

            {notifications.length === 0 ? (
              <div className="px-4 py-10 text-center">
                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center mx-auto mb-3"
                  style={{ background: isDark ? "rgba(91,30,122,0.25)" : "#F3E9FB" }}
                >
                  <Bell className="h-4.5 w-4.5" style={{ color: isDark ? "#c4a0e8" : "#9B59B6" }} />
                </div>
                <p className="text-[13px] font-medium" style={{ color: isDark ? "#c4a0e8" : "#5B1E7A" }}>All caught up!</p>
                <p className="text-[12px] mt-0.5" style={{ color: subtitleColor }}>No new notifications</p>
              </div>
            ) : (
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.slice(0, 8).map((n) => (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 px-4 py-3 cursor-pointer transition-all duration-100 border-b last:border-0"
                    style={{ borderColor: dividerColor }}
                    onClick={e => {
                      e.stopPropagation();
                      markRead(n.id);
                      if (n.ticketId) navigate(`/tickets/${n.ticketId}`);
                    }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
                  >
                    <span className="h-2 w-2 rounded-full mt-[5px] shrink-0" style={{ background: "#C8973A" }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] leading-snug font-medium" style={{ color: itemColor }}>{n.message}</p>
                      <p className="text-[11px] mt-0.5" style={{ color: subtitleColor }}>
                        {new Date(n.createdAt).toLocaleString("en-PK")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Divider */}
        <span className="h-5 w-px mx-0.5" style={{ background: isDark ? "rgba(139,92,192,0.15)" : "rgba(91,30,122,0.1)" }} />

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-2.5 h-9 rounded-[9px] px-2 transition-all duration-150 focus-visible:outline-none"
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
            >
              <div
                className="h-7 w-7 rounded-full flex items-center justify-center text-white text-[11px] font-bold select-none shrink-0"
                style={{
                  background: "linear-gradient(135deg, #5B1E7A 0%, #9B59B6 100%)",
                  boxShadow: "0 0 0 2px rgba(91,30,122,0.2)",
                }}
              >
                {initials}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-[12.5px] font-semibold leading-none" style={{ color: titleColor }}>
                  {user?.name?.split(" ")[0]}
                </p>
                <p className="text-[10px] leading-none mt-0.5 capitalize" style={{ color: subtitleColor }}>
                  {roleLabel[user?.role || "user"]}
                </p>
              </div>
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align="end"
            className="w-56 p-0 rounded-[14px] overflow-hidden"
            style={{
              background: dropdownBg,
              boxShadow: isDark
                ? "0 4px 24px rgba(0,0,0,0.4), 0 1px 4px rgba(0,0,0,0.3)"
                : "0 4px 24px rgba(91,30,122,0.14), 0 1px 4px rgba(0,0,0,0.06)",
              border: `1px solid ${dropdownBorder}`,
            }}
          >
            <div
              className="px-3.5 py-3 flex items-center gap-3"
              style={{
                background: isDark
                  ? "linear-gradient(135deg, rgba(91,30,122,0.3) 0%, rgba(45,10,80,0.4) 100%)"
                  : "linear-gradient(135deg, #F3E9FB 0%, #ede0f9 100%)",
              }}
            >
              <div
                className="h-9 w-9 rounded-full flex items-center justify-center text-white text-[13px] font-bold shrink-0"
                style={{
                  background: "linear-gradient(135deg, #5B1E7A 0%, #9B59B6 100%)",
                  boxShadow: "0 0 0 2px rgba(91,30,122,0.2)",
                }}
              >
                {initials}
              </div>
              <div className="min-w-0">
                <p className="text-[13px] font-semibold truncate" style={{ color: isDark ? "#e2d4f0" : "#3d1052" }}>{user?.name}</p>
                <p className="text-[11px] truncate" style={{ color: subtitleColor }}>{user?.email}</p>
                <span
                  className="inline-flex items-center mt-0.5 text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded-full text-white"
                  style={{ background: roleColor[user?.role || "user"] || "#5B1E7A" }}
                >
                  {roleLabel[user?.role || "user"]}
                </span>
              </div>
            </div>

            <div className="py-1">
              <DropdownMenuItem
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] cursor-pointer transition-all"
                style={{ color: itemColor }}
                onClick={() => navigate("/profile")}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = hoverBg}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
              >
                <User className="h-3.5 w-3.5" style={{ color: isDark ? "#c4a0e8" : "#7B3A9E" }} />
                Profile & Settings
              </DropdownMenuItem>
            </div>

            <DropdownMenuSeparator className="my-0" style={{ background: dividerColor }} />

            <div className="py-1">
              <DropdownMenuItem
                onClick={logout}
                className="flex items-center gap-2.5 px-3.5 py-2.5 text-[13px] cursor-pointer transition-all"
                style={{ color: "#dc2626" }}
                onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = isDark ? "rgba(220,38,38,0.1)" : "#fef2f2"}
                onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = ""}
              >
                <LogOut className="h-3.5 w-3.5" />
                Sign out
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

      </div>
    </header>
  );
};

export default Navbar;