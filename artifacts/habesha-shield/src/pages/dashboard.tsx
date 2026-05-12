import { useAuth } from "../contexts/AuthContext";
import { useGetDashboardSummary } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Skeleton } from "../components/ui/skeleton";
import { Heart, Users, Bell, Activity, Play } from "lucide-react";
import { Link } from "wouter";

export default function Dashboard() {
  const { user } = useAuth();
  
  const { data: summary, isLoading } = useGetDashboardSummary({
    query: {
      enabled: !!user,
    } as any,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Welcome, {user?.displayName || user?.username}</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening in your community.</p>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Liked Tracks</CardTitle>
              <Heart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.likedTracksCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Following</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.followingCount || 0}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Notifications</CardTitle>
              <Bell className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary?.notificationsCount || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid gap-8 md:grid-cols-2">
        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary" /> Recent Activity
          </h2>
          <Card>
            <CardContent className="p-0 divide-y divide-border">
              {isLoading ? (
                <div className="p-4 space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ) : summary?.recentActivity?.length ? (
                summary.recentActivity.map((activity) => (
                  <div key={activity.id} className="p-4 flex flex-col gap-1">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  No recent activity
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Play className="w-5 h-5 text-accent" /> Recommended for You
          </h2>
          <div className="grid gap-4">
            {isLoading ? (
              <>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-20 w-full" />
              </>
            ) : summary?.recommendedTracks?.length ? (
              summary.recommendedTracks.map((track) => (
                <Link key={track.id} href={`/tracks/${track.id}`}>
                  <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50 hover:bg-card">
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded bg-secondary/20 flex items-center justify-center flex-shrink-0">
                        <Play className="w-6 h-6 text-secondary" />
                      </div>
                      <div className="overflow-hidden">
                        <h3 className="font-medium truncate">{track.title}</h3>
                        <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))
            ) : (
              <Card>
                <CardContent className="p-8 text-center text-muted-foreground text-sm">
                  No recommendations yet
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
