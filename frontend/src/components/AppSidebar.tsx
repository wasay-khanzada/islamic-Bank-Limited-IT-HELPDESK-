import React from "react";
import { useLocation, Link } from "react-router-dom";
import {
  LayoutDashboard, Ticket, UserPlus, Building2, BarChart3,
  User, ClipboardList, Inbox, PlusCircle, Users,
  ChevronLeft, ChevronRight, ScrollText,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { roleNavItems, type UserRole } from "@/lib/roles";
import islamicLogo from "@/assets/islamic-logo.png";

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard, Ticket, UserPlus, Building2, BarChart3,
  User, ClipboardList, Inbox, PlusCircle, Users, ScrollText,
};

interface AppSidebarProps {
  collapsed:      boolean;
  onToggle:       () => void;
  onMobileClose?: () => void;
}

const AppSidebar = ({ collapsed, onToggle, onMobileClose }: AppSidebarProps) => {
  const location = useLocation();
  const { user }  = useAuth();
  const role      = user?.role as UserRole | undefined;
  const items     = roleNavItems[role ?? "user"] || roleNavItems.user;

  return (
    <aside
      className={cn(
        "h-full flex flex-col transition-[width] duration-300 ease-in-out overflow-hidden relative",
        collapsed ? "w-[4.5rem]" : "w-[15rem]"
      )}
      style={{
        background: "linear-gradient(175deg, #4a1664 0%, #5B1E7A 40%, #4e1a6e 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "4px 0 32px rgba(30,6,50,0.22)",
      }}
    >
      {/* Subtle noise/texture overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Top glow accent */}
      <div
        className="pointer-events-none absolute top-0 left-0 right-0 h-32 opacity-30"
        style={{
          background: "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(155,89,182,0.6) 0%, transparent 100%)",
        }}
      />

      {/* ── Logo / Header ── */}
      <div
        className={cn(
          "relative flex items-center gap-3 shrink-0 select-none z-10",
          "h-[3.75rem]",
          collapsed ? "justify-center px-0" : "px-4"
        )}
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        {/* Logo mark with glow */}
        <div
          className="shrink-0 rounded-[10px] overflow-hidden"
          style={{
            boxShadow: "0 0 0 1.5px rgba(200,151,58,0.4), 0 2px 12px rgba(200,151,58,0.2)",
          }}
        >
          <img
            src={islamicLogo}
            alt="islamic"
            className={cn(
              "object-cover transition-all duration-300",
              collapsed ? "h-8 w-8" : "h-12 w-12"
            )}
          />
        </div>

        {!collapsed && (
          <div className="overflow-hidden leading-tight animate-fade-in">
            <p className="text-[13.5px] font-bold text-white tracking-tight truncate">
              islamic Bank Limited
            </p>
            <p
              className="text-[10.5px] font-medium truncate tracking-wide uppercase"
              style={{ color: "rgba(200,151,58,0.85)", letterSpacing: "0.07em" }}
            >
              IT HelpDesk System
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="relative flex-1 py-4 px-2.5 space-y-0.5 overflow-y-auto overflow-x-hidden z-10">

        {/* Section label */}
        {!collapsed && (
          <p
            className="px-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.1em]"
            style={{ color: "rgba(212,184,238,0.4)" }}
          >
            Navigation
          </p>
        )}

        {items.map((item, idx) => {
          const Icon = iconMap[item.icon] || LayoutDashboard;
          const isActive =
            location.pathname === item.url ||
            (item.url !== "/dashboard" &&
              item.url.length > 1 &&
              location.pathname.startsWith(item.url));

          return (
            <Link
              key={item.url}
              to={item.url}
              onClick={onMobileClose}
              title={collapsed ? item.title : undefined}
              className={cn(
                "sidebar-item relative flex items-center gap-3 rounded-[10px] text-[13px] font-medium",
                "focus-visible:outline-none select-none group",
                collapsed ? "justify-center px-0 py-2.5 w-full" : "px-3 py-2.5",
                isActive ? "active" : ""
              )}
              style={
                isActive
                  ? {
                      background: "linear-gradient(135deg, rgba(200,151,58,0.18) 0%, rgba(200,151,58,0.08) 100%)",
                      color: "#fff",
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 1px 4px rgba(0,0,0,0.1)",
                      borderLeft: "3px solid #C8973A",
                      paddingLeft: collapsed ? undefined : "calc(0.75rem - 3px)",
                    }
                  : {
                      color: "rgba(212,184,238,0.75)",
                      borderLeft: "3px solid transparent",
                    }
              }
              onMouseEnter={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "rgba(255,255,255,0.07)";
                  el.style.color = "#fff";
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  const el = e.currentTarget as HTMLElement;
                  el.style.background = "";
                  el.style.color = "rgba(212,184,238,0.75)";
                }
              }}
            >
              {/* Icon container */}
              <span
                className={cn(
                  "shrink-0 flex items-center justify-center rounded-[7px] transition-all duration-150",
                  isActive ? "w-[26px] h-[26px]" : "w-[26px] h-[26px]"
                )}
                style={
                  isActive
                    ? { background: "rgba(200,151,58,0.22)", color: "#C8973A" }
                    : { color: "inherit" }
                }
              >
                <Icon
                  className={cn(
                    "transition-all duration-150",
                    isActive ? "h-[15px] w-[15px]" : "h-[16px] w-[16px] group-hover:scale-105"
                  )}
                />
              </span>

              {!collapsed && (
                <span className="truncate">{item.title}</span>
              )}

              {/* Active indicator dot (collapsed mode) */}
              {collapsed && isActive && (
                <span
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 h-1.5 w-1.5 rounded-full"
                  style={{ background: "#C8973A" }}
                />
              )}
            </Link>
          );
        })}
      </nav>

      {/* ── User quick-info (expanded only) ── */}
      {!collapsed && user && (
        <div
          className="relative z-10 mx-2.5 mb-2 rounded-[10px] p-2.5 flex items-center gap-2.5"
          style={{
            background: "rgba(0,0,0,0.18)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <div
            className="h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
            style={{
              background: "linear-gradient(135deg, #C8973A, #e4b85a)",
              boxShadow: "0 0 0 2px rgba(200,151,58,0.3)",
            }}
          >
            {user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2) || "U"}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-[12px] font-semibold text-white truncate">{user?.name}</p>
            <p className="text-[10px] capitalize truncate" style={{ color: "rgba(200,151,58,0.7)" }}>
              {user?.role?.replace("_", " ")}
            </p>
          </div>
        </div>
      )}

      {/* ── Collapse toggle ── */}
      <div
        className="relative z-10 p-2.5 shrink-0"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
      >
        <button
          onClick={onToggle}
          className={cn(
            "flex items-center gap-2.5 w-full rounded-[8px] text-xs font-medium py-2",
            "transition-all duration-150 group/toggle",
            collapsed ? "justify-center px-0" : "px-3"
          )}
          style={{ color: "rgba(212,184,238,0.45)" }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.06)";
            (e.currentTarget as HTMLElement).style.color = "rgba(212,184,238,0.85)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLElement).style.background = "";
            (e.currentTarget as HTMLElement).style.color = "rgba(212,184,238,0.45)";
          }}
        >
          {collapsed
            ? <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/toggle:translate-x-0.5" />
            : (
              <>
                <ChevronLeft className="h-3.5 w-3.5 transition-transform group-hover/toggle:-translate-x-0.5" />
                <span className="tracking-wide">Collapse Sidebar</span>
              </>
            )
          }
        </button>
      </div>
    </aside>
  );
};

export default AppSidebar;