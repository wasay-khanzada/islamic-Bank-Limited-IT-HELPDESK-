import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { PrivateRoute } from "@/components/PrivateRoute";
import AppLayout from "@/components/AppLayout";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import DashboardPage from "@/pages/DashboardPage";
import AllTicketsPage from "@/pages/AllTicketsPage";
import RegistrationsPage from "@/pages/RegistrationsPage";
import RegistrationRequestsPage from "@/pages/RegistrationRequestsPage";
import DepartmentsPage from "@/pages/DepartmentsPage";
import AssetsPage from "@/pages/AssetsPage";
import ReportsPage from "@/pages/ReportsPage";
import UserManagementPage from "@/pages/UserManagementPage";
import ProfilePage from "@/pages/ProfilePage";
import AssignedTicketsPage from "@/pages/AssignedTicketsPage";
import TicketQueuePage from "@/pages/TicketQueuePage";
import CreateTicketPage from "@/pages/CreateTicketPage";
import MyTicketsPage from "@/pages/MyTicketsPage";
import TicketDetailPage from "@/pages/TicketDetailPage";
import AuditLogsPage from "@/pages/AuditLogsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />

              {/* Root always → dashboard (role-based content handled inside DashboardPage) */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />

              <Route element={<AppLayout />}>

                {/* Dashboard — every authenticated role lands here */}
                <Route
                  path="/dashboard"
                  element={
                    <PrivateRoute>
                      <DashboardPage />
                    </PrivateRoute>
                  }
                />

                {/* Admin / super_admin only */}
                <Route path="/tickets" element={<PrivateRoute allowedRoles={["super_admin","admin"]}><AllTicketsPage /></PrivateRoute>} />
                <Route path="/registrations" element={<PrivateRoute allowedRoles={["super_admin","admin"]}><RegistrationsPage /></PrivateRoute>} />
                <Route path="/registration-requests" element={<PrivateRoute allowedRoles={["super_admin","admin"]}><RegistrationRequestsPage /></PrivateRoute>} />
                <Route path="/departments" element={<PrivateRoute allowedRoles={["super_admin","admin"]}><DepartmentsPage /></PrivateRoute>} />
                <Route path="/assets" element={<PrivateRoute allowedRoles={["super_admin","admin"]}><AssetsPage /></PrivateRoute>} />
                <Route path="/reports" element={<PrivateRoute allowedRoles={["super_admin","admin"]}><ReportsPage /></PrivateRoute>} />

                {/* super_admin only */}
                <Route path="/users" element={<PrivateRoute allowedRoles={["super_admin"]}><UserManagementPage /></PrivateRoute>} />
                <Route path="/audit-logs" element={<PrivateRoute allowedRoles={["super_admin"]}><AuditLogsPage /></PrivateRoute>} />

                {/* Agent + admin */}
                <Route path="/assigned-tickets" element={<PrivateRoute allowedRoles={["agent","admin","super_admin"]}><AssignedTicketsPage /></PrivateRoute>} />
                <Route path="/ticket-queue" element={<PrivateRoute allowedRoles={["agent","admin","super_admin"]}><TicketQueuePage /></PrivateRoute>} />

                {/* All authenticated */}
                <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
                <Route path="/create-ticket" element={<PrivateRoute allowedRoles={["user","agent","admin","super_admin"]}><CreateTicketPage /></PrivateRoute>} />
                <Route path="/my-tickets" element={<PrivateRoute><MyTicketsPage /></PrivateRoute>} />
                <Route path="/tickets/:id" element={<PrivateRoute><TicketDetailPage /></PrivateRoute>} />

              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;