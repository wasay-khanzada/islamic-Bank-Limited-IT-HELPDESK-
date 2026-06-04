import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const PlaceholderPage = ({ title, description }: { title: string; description: string }) => (
  <div className="animate-fade-in space-y-6">
    <Card>
      <CardHeader>
        <CardTitle className="font-heading">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">{description}</p>
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

export const AllTicketsPage = () => <PlaceholderPage title="All Tickets" description="View and manage all tickets across departments." />;
export const RegistrationsPage = () => <PlaceholderPage title="Registration Requests" description="Review and approve new employee registrations." />;
export const DepartmentsPage = () => <PlaceholderPage title="Departments" description="Manage organizational departments and teams." />;
export const ReportsPage = () => <PlaceholderPage title="Reports" description="Analytics and reporting dashboards." />;
export const UserManagementPage = () => <PlaceholderPage title="User Management" description="Manage users, roles, and permissions." />;
export const ProfilePage = () => <PlaceholderPage title="Profile" description="View and update your profile information." />;
export const AssignedTicketsPage = () => <PlaceholderPage title="My Assigned Tickets" description="Tickets currently assigned to you." />;
export const TicketQueuePage = () => <PlaceholderPage title="Ticket Queue" description="Unassigned tickets waiting for agents." />;
export const CreateTicketPage = () => <PlaceholderPage title="Create Ticket" description="Submit a new IT support request." />;
export const MyTicketsPage = () => <PlaceholderPage title="My Tickets" description="Track your submitted tickets." />;
