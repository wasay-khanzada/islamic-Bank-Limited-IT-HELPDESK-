import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Search, UserPlus, Check, X, Inbox, Loader2 } from "lucide-react";
import { userApi, PendingUser } from "@/api/userApi";
import { toast } from "sonner";

const roleConfig: Record<string, { className: string }> = {
  user: { className: "bg-info/10 text-info border-info/20" },
  agent: { className: "bg-primary/10 text-primary border-primary/20" },
  admin: { className: "bg-gold/10 text-gold border-gold/20" },
  super_admin: { className: "bg-gold/10 text-gold border-gold/20" },
};

const Avatar = ({ name }: { name: string }) => {
  const initials = name.split(" ").map(n => n[0]).join("").slice(0, 2);
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold shrink-0">
      {initials}
    </div>
  );
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return `${diffDays} days ago`;
  return date.toLocaleDateString();
};

const RegistrationsPage = () => {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoading(true);
      const response = await userApi.getPendingUsers();
      if (response.success) {
        setPendingUsers(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending users:", error);
      toast.error("Failed to load pending users");
    } finally {
      setLoading(false);
    }
  };

  const filtered = pendingUsers.filter(r =>
    !search || r.name.toLowerCase().includes(search.toLowerCase()) || r.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleSelect = (id: number) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(r => r.id)));
    }
  };

  const handleApprove = async (userId: number) => {
    try {
      setActionLoading(prev => new Set(prev).add(userId));
      await userApi.approveUser(userId);
      toast.success("User approved successfully");
      await fetchPendingUsers();
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } catch (error) {
      console.error("Failed to approve user:", error);
      toast.error("Failed to approve user");
    } finally {
      setActionLoading(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleReject = async (userId: number) => {
    try {
      setActionLoading(prev => new Set(prev).add(userId));
      await userApi.rejectUser(userId);
      toast.success("User rejected successfully");
      await fetchPendingUsers();
      setSelected(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    } catch (error) {
      console.error("Failed to reject user:", error);
      toast.error("Failed to reject user");
    } finally {
      setActionLoading(prev => {
        const next = new Set(prev);
        next.delete(userId);
        return next;
      });
    }
  };

  const handleBulkApprove = async () => {
    try {
      setActionLoading(prev => new Set([...prev, ...selected]));
      await Promise.all(Array.from(selected).map(id => userApi.approveUser(id)));
      toast.success(`${selected.size} users approved successfully`);
      await fetchPendingUsers();
      setSelected(new Set());
    } catch (error) {
      console.error("Failed to bulk approve users:", error);
      toast.error("Failed to approve some users");
    } finally {
      setActionLoading(new Set());
    }
  };

  const handleBulkReject = async () => {
    try {
      setActionLoading(prev => new Set([...prev, ...selected]));
      await Promise.all(Array.from(selected).map(id => userApi.rejectUser(id)));
      toast.success(`${selected.size} users rejected successfully`);
      await fetchPendingUsers();
      setSelected(new Set());
    } catch (error) {
      console.error("Failed to bulk reject users:", error);
      toast.error("Failed to reject some users");
    } finally {
      setActionLoading(new Set());
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight font-heading">Employee Registration</h1>
          <p className="text-sm text-muted-foreground mt-1">Review and approve new registration requests.</p>
        </div>
        <Badge variant="outline" className="text-sm font-medium gap-1.5 px-3 py-1.5 border-primary/30 text-primary">
          <UserPlus className="w-3.5 h-3.5" />
          {pendingUsers.length} Pending
        </Badge>
      </div>

      {/* Search & Bulk */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input placeholder="Search by name or email..." className="pl-9 h-9 text-sm" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
            {selected.size > 0 && (
              <div className="flex items-center gap-2 ml-auto">
                <span className="text-xs text-muted-foreground">{selected.size} selected</span>
                <Button 
                  size="sm" 
                  className="h-8 gap-1.5 bg-success hover:bg-success/90 text-success-foreground"
                  onClick={handleBulkApprove}
                  disabled={actionLoading.size > 0}
                >
                  {actionLoading.size > 0 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                  {actionLoading.size > 0 ? '...' : 'Approve All'}
                </Button>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="h-8 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/10"
                  onClick={handleBulkReject}
                  disabled={actionLoading.size > 0}
                >
                  {actionLoading.size > 0 ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                  {actionLoading.size > 0 ? '...' : 'Reject All'}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Requests List */}
      <Card className="border-0 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="w-7 h-7 text-muted-foreground animate-spin mb-4" />
            <p className="text-muted-foreground">Loading pending requests...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
              <Inbox className="w-7 h-7 text-muted-foreground" />
            </div>
            <p className="font-medium">No pending requests</p>
            <p className="text-sm text-muted-foreground mt-1">All registration requests have been processed.</p>
          </div>
        ) : (
          <div>
            {/* Select All Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b bg-muted/30">
              <Checkbox
                checked={selected.size === filtered.length && filtered.length > 0}
                onCheckedChange={toggleAll}
              />
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Select All</span>
            </div>

            {filtered.map((req, i) => {
              const rc = roleConfig[req.role];
              return (
                <div
                  key={req.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 px-5 py-4 transition-colors hover:bg-muted/30 ${
                    i < filtered.length - 1 ? "border-b" : ""
                  }`}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <Checkbox
                      checked={selected.has(req.id)}
                      onCheckedChange={() => toggleSelect(req.id)}
                    />
                    <Avatar name={req.name} />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{req.name}</p>
                      <Badge variant="outline" className={`text-[10px] font-semibold uppercase border ${rc.className}`}>
                        {req.role}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{req.email} · {req.employeeId}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary" className="text-[11px] font-normal">Dept ID: {req.departmentId || 'N/A'}</Badge>
                      <Badge variant="secondary" className="text-[11px] font-normal">{req.branchCode || 'N/A'}</Badge>
                      <Badge variant="secondary" className="text-[11px] font-normal">{req.designation || 'N/A'}</Badge>
                    </div>
                  </div>

                  {/* Time + Actions */}
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-muted-foreground hidden md:block">{formatDate(req.createdAt)}</span>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          className="h-8 px-3 gap-1.5 bg-success hover:bg-success/90 text-success-foreground text-xs"
                          onClick={() => handleApprove(req.id)}
                          disabled={actionLoading.has(req.id)}
                        >
                          {actionLoading.has(req.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                          {actionLoading.has(req.id) ? '...' : 'Approve'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Approve this request</TooltipContent>
                    </Tooltip>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-8 px-3 gap-1.5 text-destructive border-destructive/30 hover:bg-destructive/5 text-xs"
                          onClick={() => handleReject(req.id)}
                          disabled={actionLoading.has(req.id)}
                        >
                          {actionLoading.has(req.id) ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          {actionLoading.has(req.id) ? '...' : 'Reject'}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Reject this request</TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default RegistrationsPage;