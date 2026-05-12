import { useParams } from "wouter";
import { useGetUserProfile, useListTracks } from "@workspace/api-client-react";
import { Users, Music, UserCheck } from "lucide-react";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { TrackCard } from "../components/track-card";

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { data: profile, isLoading } = useGetUserProfile(username!);

  const { data: tracksData } = useListTracks(
    profile?.id ? { artistId: profile.id } : undefined,
    { query: { enabled: !!profile?.id } as any }
  );

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full rounded-2xl" />
        <Skeleton className="h-6 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-16">
        <p className="text-2xl font-bold">User not found</p>
        <p className="text-muted-foreground mt-2">@{username} doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/10 to-background border border-border p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent/50 bg-muted flex-shrink-0">
            {profile.avatar ? (
              <img src={profile.avatar} alt={profile.displayName ?? undefined} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                {(profile.displayName ?? profile.username ?? "?").charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold">{profile.displayName ?? profile.username}</h1>
              {profile.isVerified && (
                <Badge className="bg-accent text-accent-foreground gap-1">
                  <UserCheck className="w-3 h-3" /> Verified
                </Badge>
              )}
              {profile.role !== "user" && (
                <Badge variant="secondary" className="capitalize">{profile.role}</Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{profile.username}</p>
            {profile.bio && <p className="mt-3 text-sm max-w-xl">{profile.bio}</p>}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                <strong>{profile.followersCount ?? 0}</strong>
                <span className="text-muted-foreground">followers</span>
              </span>
              <span className="flex items-center gap-2">
                <Users className="w-4 h-4 text-secondary" />
                <strong>{profile.followingCount ?? 0}</strong>
                <span className="text-muted-foreground">following</span>
              </span>
              {profile.tracksCount !== undefined && (
                <span className="flex items-center gap-2">
                  <Music className="w-4 h-4 text-accent" />
                  <strong>{profile.tracksCount}</strong>
                  <span className="text-muted-foreground">tracks</span>
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {tracksData?.tracks && tracksData.tracks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold">Tracks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracksData.tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
