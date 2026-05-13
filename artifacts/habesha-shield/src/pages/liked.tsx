import { useGetLikedTracks, useUnlikeTrack } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation } from "wouter";
import { useQueryClient } from "@tanstack/react-query";
import { Heart, Music2, LogIn } from "lucide-react";
import { TrackCard } from "../components/track-card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { toast } from "sonner";

export default function LikedSongs() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: likedTracks, isLoading, refetch } = useGetLikedTracks({
    query: { enabled: isAuthenticated } as any,
  });

  const handleLikeChange = () => {
    refetch();
    queryClient.invalidateQueries({ queryKey: ["/api/tracks/liked"] });
  };

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center py-32 text-center gap-6">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
          <Heart className="w-10 h-10 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold mb-2">Your Liked Songs</h2>
          <p className="text-muted-foreground max-w-sm">
            Sign in to see all the tracks you've liked across EthioWave. Your collection stays saved forever.
          </p>
        </div>
        <div className="flex gap-3">
          <Button onClick={() => setLocation("/login")} className="gap-2">
            <LogIn className="w-4 h-4" />
            Sign In
          </Button>
          <Button variant="outline" onClick={() => setLocation("/register")}>
            Create Account
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-destructive flex items-center justify-center flex-shrink-0">
          <Heart className="w-8 h-8 text-white fill-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Liked Songs</h1>
          <p className="text-muted-foreground">
            {isLoading
              ? "Loading your collection..."
              : `${likedTracks?.length ?? 0} ${likedTracks?.length === 1 ? "song" : "songs"} saved`}
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="aspect-video w-full rounded-xl" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : !likedTracks || likedTracks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
            <Music2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-1">No liked songs yet</h3>
            <p className="text-muted-foreground text-sm max-w-sm">
              Hit the heart icon on any track to save it here. Your collection syncs across all your devices.
            </p>
          </div>
          <Button onClick={() => setLocation("/discover")} variant="outline">
            Discover Music
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {likedTracks.map((track) => (
            <TrackCard
              key={track.id}
              track={{ ...track, isLiked: true }}
              onLikeChange={handleLikeChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
