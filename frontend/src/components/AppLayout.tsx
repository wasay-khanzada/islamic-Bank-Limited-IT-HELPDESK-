import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Navbar from "@/components/Navbar";
import { useTheme } from "@/context/ThemeContext";

const pageTitles: Record<string, string> = {
  "/dashboard":              "Dashboard",
  "/tickets":                "All Tickets",
  "/registrations":          "Registrations",
  "/registration-requests":  "Registration Requests",
  "/departments":            "Departments",
  "/assets":                 "Assets",
  "/reports":                "Reports",
  "/users":                  "User Management",
  "/profile":                "Profile",
  "/assigned-tickets":       "My Assigned Tickets",
  "/ticket-queue":           "Ticket Queue",
  "/create-ticket":          "Create Ticket",
  "/my-tickets":             "My Tickets",
  "/audit-logs":             "Audit Logs",
};

const AppLayout = () => {
  const [collapsed, setCollapsed]   = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { isDark } = useTheme();

  const title =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith("/tickets/") ? "Ticket Details" : "Dashboard");

  return (
    <div
      className="h-screen w-screen flex overflow-hidden transition-colors duration-300"
      style={{ background: isDark ? "hsl(270 25% 8%)" : "hsl(240 6% 97%)" }}
    >

      {/* ── Mobile overlay ── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          style={{
            background: isDark
              ? "rgba(8,2,16,0.6)"
              : "rgba(30,6,50,0.35)",
            backdropFilter: "blur(2px)",
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile sidebar ── */}
      <div
        className={`
          fixed inset-y-0 left-0 z-50 lg:hidden
          transform transition-transform duration-300 ease-in-out
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <AppSidebar
          collapsed={false}
          onToggle={() => {}}
          onMobileClose={() => setMobileOpen(false)}
        />
      </div>

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex shrink-0 h-screen">
        <AppSidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed((c) => !c)}
        />
      </div>

      {/* ── Main panel ── */}
      <div className="flex flex-col flex-1 min-w-0 h-screen overflow-hidden">

        {/* Sticky frosted navbar */}
        <Navbar title={title} onMenuClick={() => setMobileOpen(true)} />

        {/* Scrollable page content */}
        <main
          className="flex-1 overflow-y-auto overflow-x-hidden transition-colors duration-300"
          style={{
            padding: "1.5rem",
            background: isDark
              ? `linear-gradient(180deg, rgba(91,30,122,0.08) 0%, transparent 120px), hsl(270 25% 8%)`
              : `linear-gradient(180deg, rgba(243,233,251,0.35) 0%, transparent 120px), hsl(240 6% 97%)`,
          }}
        >
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AppLayout;