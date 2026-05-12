import { Link, useParams } from "wouter";
import { useGetArtist, useListTracks, useFollowUser, useUnfollowUser } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Music, Users, UserCheck, UserPlus, UserMinus, ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";
import { TrackCard } from "../components/track-card";
import { useState } from "react";

export default function ArtistDetail() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [following, setFollowing] = useState(false);

  const { data: artist, isLoading } = useGetArtist(id!);
  const { data: tracksData } = useListTracks({ artistId: id });
  const followMutation = useFollowUser();
  const unfollowMutation = useUnfollowUser();

  const handleFollow = async () => {
    if (!artist) return;
    if (following) {
      await unfollowMutation.mutateAsync({ id: artist.id });
      setFollowing(false);
    } else {
      await followMutation.mutateAsync({ id: artist.id });
      setFollowing(true);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-48 w-full rounded-xl" />
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="text-center py-16">
        <p className="text-muted-foreground">Artist not found.</p>
        <Link href="/artists"><Button variant="outline" className="mt-4">Back to Artists</Button></Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Link href="/artists">
        <Button variant="ghost" size="sm" className="gap-2">
          <ArrowLeft className="w-4 h-4" /> All Artists
        </Button>
      </Link>

      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/30 via-secondary/20 to-background border border-border p-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-accent/50 bg-muted flex-shrink-0">
            {artist.avatar ? (
              <img src={artist.avatar} alt={artist.displayName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-primary">
                {artist.displayName?.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-3xl font-bold">{artist.displayName}</h1>
              {artist.isVerified && (
                <Badge className="bg-accent text-accent-foreground gap-1">
                  <UserCheck className="w-3 h-3" /> Verified
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground">@{artist.username}</p>
            {artist.bio && <p className="mt-3 text-sm max-w-xl">{artist.bio}</p>}
            <div className="flex items-center gap-6 mt-4 text-sm">
              <span className="flex items-center gap-2"><Users className="w-4 h-4 text-primary" /><strong>{artist.followersCount ?? 0}</strong> followers</span>
              <span className="flex items-center gap-2"><Music className="w-4 h-4 text-secondary" /><strong>{artist.tracksCount ?? 0}</strong> tracks</span>
            </div>
          </div>
          {user && user.id !== artist.id && (
            <Button
              onClick={handleFollow}
              disabled={followMutation.isPending || unfollowMutation.isPending}
              variant={following ? "outline" : "default"}
              className="gap-2 flex-shrink-0"
            >
              {following ? <><UserMinus className="w-4 h-4" /> Unfollow</> : <><UserPlus className="w-4 h-4" /> Follow</>}
            </Button>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Tracks</h2>
        {tracksData?.tracks && tracksData.tracks.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracksData.tracks.map((track) => (
              <TrackCard key={track.id} track={track} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No tracks yet.</p>
        )}
      </div>
    </div>
  );
}
