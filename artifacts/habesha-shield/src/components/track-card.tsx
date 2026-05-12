import { Link } from "wouter";
import { Heart, Play } from "lucide-react";
import { useLikeTrack, useUnlikeTrack, Track } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";

interface TrackCardProps {
  track: Track;
  onLikeChange?: () => void;
}

export function TrackCard({ track, onLikeChange }: TrackCardProps) {
  const { user } = useAuth();
  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (track.isLiked) {
      await unlikeMutation.mutateAsync({ id: track.id });
    } else {
      await likeMutation.mutateAsync({ id: track.id });
    }
    onLikeChange?.();
  };

  return (
    <Link href={`/tracks/${track.id}`}>
      <Card className="group hover:border-primary/50 transition-all cursor-pointer overflow-hidden">
        <div className="relative aspect-video bg-black">
          <img
            src={track.thumbnail ?? `https://img.youtube.com/vi/${track.youtubeId}/hqdefault.jpg`}
            alt={track.title}
            className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30">
            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
              <Play className="w-5 h-5 text-white fill-white" />
            </div>
          </div>
          {track.isTrending && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-accent text-accent-foreground text-xs">Trending</Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-2">
            <div className="overflow-hidden flex-1">
              <h3 className="font-semibold truncate group-hover:text-primary transition-colors">{track.title}</h3>
              <p className="text-sm text-muted-foreground truncate">{track.artistName}</p>
              <Badge variant="secondary" className="mt-1 text-xs">{track.genre}</Badge>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className={`flex-shrink-0 h-8 w-8 ${track.isLiked ? "text-destructive" : "text-muted-foreground"}`}
              onClick={handleLike}
              disabled={!user || likeMutation.isPending || unlikeMutation.isPending}
            >
              <Heart className={`w-4 h-4 ${track.isLiked ? "fill-current" : ""}`} />
              <span className="sr-only">Like</span>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{track.likesCount} likes · {track.commentsCount} comments</p>
        </CardContent>
      </Card>
    </Link>
  );
}
