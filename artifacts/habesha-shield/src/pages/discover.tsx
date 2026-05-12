import { useState } from "react";
import { Link } from "wouter";
import { useListTracks, useListGenres } from "@workspace/api-client-react";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Search, Play, Filter } from "lucide-react";

export default function Discover() {
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState<string | undefined>();
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const { data: genres } = useListGenres();
  
  const { data: tracksData, isLoading } = useListTracks({
    search: debouncedSearch || undefined,
    genre,
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  return (
    <div className="space-y-8 pb-16">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Discover Music</h1>
          <p className="text-muted-foreground mt-1">Explore the vibrant sounds of Ethiopia.</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="flex w-full md:w-auto gap-2">
          <div className="relative flex-1 md:w-64">
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
          onClick={() => setGenre(undefined)}
          className="rounded-full"
        >
          All Genres
        </Button>
        {genres?.map((g) => (
          <Button
            key={g.id}
            variant={genre === g.id ? "default" : "outline"}
            onClick={() => setGenre(g.id)}
            className="rounded-full"
          >
            {g.name}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))
        ) : tracksData?.tracks?.length ? (
          tracksData.tracks.map((track) => (
            <Card key={track.id} className="overflow-hidden bg-card/50 hover:bg-card hover:border-primary/50 transition-colors">
              <div className="aspect-video bg-muted relative">
                {track.youtubeId ? (
                   <iframe 
                     className="w-full h-full"
                     src={`https://www.youtube.com/embed/${track.youtubeId}`} 
                     title={track.title}
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                     allowFullScreen 
                   />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-secondary/10">
                    <Play className="w-12 h-12 text-secondary/50" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <Link href={`/tracks/${track.id}`}>
                  <h3 className="font-semibold text-lg hover:text-primary transition-colors cursor-pointer truncate">{track.title}</h3>
                </Link>
                <Link href={`/artists/${track.artistId}`}>
                  <p className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer truncate">{track.artistName}</p>
                </Link>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span className="bg-primary/10 text-primary px-2 py-1 rounded-md">{track.genre}</span>
                  <span>{track.likesCount || 0} Likes</span>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground bg-card rounded-xl border border-dashed border-border/50">
            <Filter className="w-8 h-8 mx-auto mb-4 opacity-20" />
            <p className="text-lg font-medium">No tracks found</p>
            <p className="text-sm">Try adjusting your search or category filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
