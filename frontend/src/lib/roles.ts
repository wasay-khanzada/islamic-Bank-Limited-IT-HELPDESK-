export type UserRole = "super_admin" | "admin" | "agent" | "user";

export interface NavItem {
  title: string;
  url:   string;
  icon:  string;
}

export const roleNavItems: Record<UserRole, NavItem[]> = {
  super_admin: [
    { title: "Dashboard",             url: "/dashboard",              icon: "LayoutDashboard" },
    { title: "All Tickets",           url: "/tickets",                icon: "Ticket"          },
    { title: "Registration Requests", url: "/registration-requests",  icon: "UserPlus"        },
    { title: "Departments",           url: "/departments",            icon: "Building2"       },
    { title: "Reports",               url: "/reports",                icon: "BarChart3"       },
    { title: "User Management",       url: "/users",                  icon: "Users"           },
    { title: "Audit Logs",            url: "/audit-logs",             icon: "ScrollText"      },
    { title: "Profile",               url: "/profile",                icon: "User"            },
  ],
  admin: [
    { title: "Dashboard",             url: "/dashboard",              icon: "LayoutDashboard" },
    { title: "All Tickets",           url: "/tickets",                icon: "Ticket"          },
    { title: "Registration Requests", url: "/registration-requests",  icon: "UserPlus"        },
    { title: "Departments",           url: "/departments",            icon: "Building2"       },
    { title: "Reports",               url: "/reports",                icon: "BarChart3"       },
    { title: "Profile",               url: "/profile",                icon: "User"            },
  ],
  agent: [
    { title: "Dashboard",             url: "/dashboard",              icon: "LayoutDashboard" },
    { title: "My Assigned Tickets",   url: "/assigned-tickets",       icon: "ClipboardList"   },
    { title: "Ticket Queue",          url: "/ticket-queue",           icon: "Inbox"           },
    { title: "Profile",               url: "/profile",                icon: "User"            },
  ],
  user: [
    { title: "Dashboard",             url: "/dashboard",              icon: "LayoutDashboard" },
    { title: "Create Ticket",         url: "/create-ticket",          icon: "PlusCircle"      },
    { title: "My Tickets",            url: "/my-tickets",             icon: "Ticket"          },
    { title: "Profile",               url: "/profile",                icon: "User"            },
  ],
};