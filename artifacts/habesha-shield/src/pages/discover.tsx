import { useState } from "react";
import { Link } from "wouter";
import { useListTracks, useListGenres, useLikeTrack, useUnlikeTrack } from "@workspace/api-client-react";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Badge } from "../components/ui/badge";
import { Search, Play, Heart, Music, ExternalLink } from "lucide-react";

export default function Discover() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data: genres } = useListGenres();

  const { data: tracksData, isLoading, refetch } = useListTracks({
    search: debouncedSearch || undefined,
    genre,
    page,
  });

  const likeMutation = useLikeTrack();
  const unlikeMutation = useUnlikeTrack();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
    setPage(1);
  };

  const handleLike = async (e: React.MouseEvent, trackId: string, isLiked: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;
    if (isLiked) {
      await unlikeMutation.mutateAsync({ id: trackId });
    } else {
      await likeMutation.mutateAsync({ id: trackId });
    }
    refetch();
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Music</h1>
          <p className="text-muted-foreground mt-1">Explore the vibrant sounds of Ethiopia.</p>
        </div>

        <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search tracks or artists..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button type="submit" variant="secondary">Search</Button>
        </form>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant={!genre ? "default" : "outline"}
          onClick={() => { setGenre(undefined); setPage(1); }}
          className="rounded-full"
          size="sm"
        >
          All Genres
        </Button>
        {genres?.map((g) => (
          <Button
            key={g.id}
            variant={genre === g.name ? "default" : "outline"}
            onClick={() => { setGenre(g.name); setPage(1); }}
            className="rounded-full"
            size="sm"
          >
            {g.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {isLoading ? (
          Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-72 w-full rounded-xl" />
          ))
        ) : tracksData?.tracks?.length ? (
          tracksData.tracks.map((track) => (
            <Link key={track.id} href={`/tracks/${track.id}`}>
              <Card className="overflow-hidden bg-card/50 hover:bg-card hover:border-primary/50 transition-all cursor-pointer group h-full flex flex-col">
                {/* Thumbnail */}
                <div className="aspect-video bg-muted relative overflow-hidden flex-shrink-0">
                  <img
                    src={`https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`}
                    alt={track.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                    </div>
                  </div>
                  {track.isTrending && (
                    <div className="absolute top-2 left-2">
                      <Badge className="bg-accent text-accent-foreground text-xs font-semibold">🔥 Trending</Badge>
                    </div>
                  )}
                </div>

                <CardContent className="p-4 flex-1 flex flex-col gap-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="overflow-hidden flex-1">
                      <h3 className="font-semibold text-base group-hover:text-primary transition-colors truncate">{track.title}</h3>
                      <p className="text-sm text-muted-foreground truncate">{track.artistName}</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`flex-shrink-0 h-8 w-8 ${track.isLiked ? "text-red-500" : "text-muted-foreground"}`}
                      onClick={(e) => handleLike(e, track.id, !!track.isLiked)}
                      disabled={!user}
                    >
                      <Heart className={`w-4 h-4 ${track.isLiked ? "fill-current" : ""}`} />
                    </Button>
                  </div>

                  <div className="flex items-center justify-between mt-auto">
                    <Badge variant="secondary" className="text-xs">{track.genre}</Badge>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Heart className="w-3 h-3" /> {track.likesCount ?? 0}
                      </span>
                      <span
                        className="flex items-center gap-1 hover:text-primary transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          window.open(`https://www.youtube.com/watch?v=${track.youtubeId}`, "_blank");
                        }}
                      >
                        <ExternalLink className="w-3 h-3" /> YouTube
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed border-border/50">
            <Music className="w-8 h-8 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No tracks found</p>
            <p className="text-sm">Try adjusting your search or genre filter.</p>
          </div>
        )}
      </div>

      {tracksData?.totalPages && tracksData.totalPages > 1 && (
        <div className="flex justify-center gap-2 pt-4">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {tracksData.totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= (tracksData.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  );
}
