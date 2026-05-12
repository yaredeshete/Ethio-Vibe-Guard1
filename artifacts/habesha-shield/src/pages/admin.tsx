import { useState } from "react";
import {
  useGetAdminAnalytics,
  useAdminListUsers,
  useListReports,
  useListSecurityAlerts,
  useListAuditLogs,
  useAdminUpdateUser,
  useResolveReport,
} from "@workspace/api-client-react";
import {
  Users, Music, MessageSquare, TrendingUp, ShieldAlert, FileWarning,
  BarChart2, UserCog, CheckCircle, XCircle, Ban, Unlock
} from "lucide-react";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../components/ui/tabs";

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number | string; icon: any; color: string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${color}`}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm text-muted-foreground">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Admin() {
  const [userPage, setUserPage] = useState(1);
  const [auditPage, setAuditPage] = useState(1);

  const { data: analytics, isLoading: analyticsLoading } = useGetAdminAnalytics();
  const { data: usersData, refetch: refetchUsers } = useAdminListUsers({ page: userPage });
  const { data: reports, refetch: refetchReports } = useListReports();
  const { data: alerts } = useListSecurityAlerts();
  const { data: auditData } = useListAuditLogs({ page: auditPage });

  const updateUserMutation = useAdminUpdateUser();
  const resolveReportMutation = useResolveReport();

  const handleBanUser = async (id: string, isBanned: boolean) => {
    await updateUserMutation.mutateAsync({ id, data: { isBanned: !isBanned } });
    refetchUsers();
  };

  const handleResolveReport = async (id: string, action: "resolve" | "dismiss") => {
    await resolveReportMutation.mutateAsync({ id, data: { action } });
    refetchReports();
  };

  const severityBadge: Record<string, string> = {
    low: "bg-secondary/20 text-secondary",
    medium: "bg-accent/20 text-accent-foreground",
    high: "bg-destructive/20 text-destructive",
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Platform oversight and management</p>
      </div>

      {analyticsLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      ) : analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard label="Total Users" value={analytics.totalUsers ?? 0} icon={Users} color="bg-primary/10 text-primary" />
          <StatCard label="Artists" value={analytics.totalArtists ?? 0} icon={Music} color="bg-secondary/10 text-secondary" />
          <StatCard label="Tracks" value={analytics.totalTracks ?? 0} icon={TrendingUp} color="bg-accent/10 text-accent-foreground" />
          <StatCard label="Discussions" value={analytics.totalDiscussions ?? 0} icon={MessageSquare} color="bg-primary/10 text-primary" />
          <StatCard label="New This Week" value={analytics.newUsersThisWeek ?? 0} icon={UserCog} color="bg-secondary/10 text-secondary" />
          <StatCard label="Active Today" value={analytics.activeUsersToday ?? 0} icon={BarChart2} color="bg-accent/10 text-accent-foreground" />
          <StatCard label="Pending Reports" value={analytics.pendingReports ?? 0} icon={FileWarning} color="bg-destructive/10 text-destructive" />
          <StatCard label="Security Alerts" value={analytics.unresolvedAlerts ?? 0} icon={ShieldAlert} color="bg-destructive/10 text-destructive" />
        </div>
      )}

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
          <TabsTrigger value="security">Security Alerts</TabsTrigger>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="space-y-4 pt-4">
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">Role</th>
                  <th className="text-left p-3 font-medium">Status</th>
                  <th className="text-left p-3 font-medium">Joined</th>
                  <th className="text-right p-3 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {usersData?.users?.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-muted/30 transition-colors">
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                          {u.username?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{u.displayName ?? u.username}</p>
                          <p className="text-xs text-muted-foreground">@{u.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><Badge variant="outline" className="capitalize">{u.role}</Badge></td>
                    <td className="p-3">
                      {u.isBanned ? (
                        <Badge className="bg-destructive/10 text-destructive">Banned</Badge>
                      ) : u.isVerified ? (
                        <Badge className="bg-secondary/10 text-secondary">Verified</Badge>
                      ) : (
                        <Badge variant="secondary">Active</Badge>
                      )}
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost" size="sm"
                        className={`gap-1 ${u.isBanned ? "text-secondary hover:text-secondary" : "text-destructive hover:text-destructive"}`}
                        onClick={() => handleBanUser(u.id, !!u.isBanned)}
                        disabled={updateUserMutation.isPending}
                      >
                        {u.isBanned ? <><Unlock className="w-3 h-3" /> Unban</> : <><Ban className="w-3 h-3" /> Ban</>}
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {usersData?.totalPages && usersData.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={userPage === 1} onClick={() => setUserPage(p => p - 1)}>Prev</Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">{userPage}/{usersData.totalPages}</span>
              <Button variant="outline" size="sm" disabled={userPage >= (usersData.totalPages ?? 1)} onClick={() => setUserPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </TabsContent>

        <TabsContent value="reports" className="space-y-4 pt-4">
          {reports && reports.length > 0 ? (
            <div className="space-y-3">
              {reports.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4 flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="capitalize">{r.targetType}</Badge>
                        <Badge className={r.status === "pending" ? "bg-accent/20 text-accent-foreground" : r.status === "resolved" ? "bg-secondary/20 text-secondary" : "bg-muted text-muted-foreground"}>
                          {r.status}
                        </Badge>
                      </div>
                      <p className="font-medium text-sm">{r.reason}</p>
                      {r.details && <p className="text-xs text-muted-foreground mt-1">{r.details}</p>}
                      <p className="text-xs text-muted-foreground mt-2">
                        Reported by {r.reporterName} · {new Date(r.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    {r.status === "pending" && (
                      <div className="flex gap-2 flex-shrink-0">
                        <Button size="sm" variant="outline" className="gap-1 text-secondary hover:text-secondary"
                          onClick={() => handleResolveReport(r.id, "resolve")}
                          disabled={resolveReportMutation.isPending}>
                          <CheckCircle className="w-3 h-3" /> Resolve
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1 text-muted-foreground"
                          onClick={() => handleResolveReport(r.id, "dismiss")}
                          disabled={resolveReportMutation.isPending}>
                          <XCircle className="w-3 h-3" /> Dismiss
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <p className="text-center text-muted-foreground py-12">No reports</p>}
        </TabsContent>

        <TabsContent value="security" className="space-y-4 pt-4">
          {alerts && alerts.length > 0 ? (
            <div className="space-y-3">
              {alerts.map((a) => (
                <Card key={a.id} className={a.isResolved ? "opacity-60" : ""}>
                  <CardContent className="p-4 flex items-start gap-4">
                    <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${a.severity === "high" ? "text-destructive" : a.severity === "medium" ? "text-accent" : "text-muted-foreground"}`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <Badge className={severityBadge[a.severity ?? "low"]}>{a.severity?.toUpperCase()}</Badge>
                        <Badge variant="outline" className="text-xs capitalize">{a.type?.replace(/_/g, " ")}</Badge>
                        {a.isResolved && <Badge className="bg-secondary/10 text-secondary text-xs">Resolved</Badge>}
                      </div>
                      <p className="text-sm mt-1">{a.message}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        IP: {a.ipAddress ?? "—"} {a.username && `· @${a.username}`} · {new Date(a.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : <p className="text-center text-muted-foreground py-12">No security alerts</p>}
        </TabsContent>

        <TabsContent value="audit" className="space-y-4 pt-4">
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left p-3 font-medium">Action</th>
                  <th className="text-left p-3 font-medium">User</th>
                  <th className="text-left p-3 font-medium">IP</th>
                  <th className="text-left p-3 font-medium">Details</th>
                  <th className="text-left p-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {auditData?.logs?.map((l) => (
                  <tr key={l.id} className="border-t hover:bg-muted/20 transition-colors">
                    <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{l.action}</code></td>
                    <td className="p-3 text-muted-foreground text-xs">{l.username ?? "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs">{l.ipAddress ?? "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs max-w-[200px] truncate">{l.details ?? "—"}</td>
                    <td className="p-3 text-muted-foreground text-xs whitespace-nowrap">{new Date(l.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {auditData?.totalPages && auditData.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={auditPage === 1} onClick={() => setAuditPage(p => p - 1)}>Prev</Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">{auditPage}/{auditData.totalPages}</span>
              <Button variant="outline" size="sm" disabled={auditPage >= (auditData.totalPages ?? 1)} onClick={() => setAuditPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
