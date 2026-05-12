import { useState } from "react";
import { Link } from "wouter";
import { useListArtists } from "@workspace/api-client-react";
import { Users, Search, Music, UserCheck } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Skeleton } from "../components/ui/skeleton";

export default function Artists() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useListArtists({ search: search || undefined, page });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div>
          <h1 className="text-3xl font-bold">Artists</h1>
          <p className="text-muted-foreground mt-1">Discover talented Ethiopian musicians</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search artists..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      ) : data?.artists && data.artists.length > 0 ? (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {data.artists.map((artist) => (
              <Link key={artist.id} href={`/artists/${artist.id}`}>
                <Card className="group hover:border-primary/60 transition-all cursor-pointer overflow-hidden">
                  <div className="aspect-square bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                    {artist.avatar ? (
                      <img src={artist.avatar} alt={artist.displayName} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-primary/30 flex items-center justify-center text-3xl font-bold text-primary">
                        {artist.displayName?.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="overflow-hidden">
                        <h3 className="font-semibold truncate group-hover:text-primary transition-colors">
                          {artist.displayName}
                        </h3>
                        <p className="text-xs text-muted-foreground">@{artist.username}</p>
                      </div>
                      {artist.isVerified && (
                        <UserCheck className="w-4 h-4 text-accent flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="flex items-center gap-3 mt-3 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {artist.followersCount ?? 0}
                      </span>
                      <span className="flex items-center gap-1">
                        <Music className="w-3 h-3" />
                        {artist.tracksCount ?? 0}
                      </span>
                    </div>
                    {artist.genre && (
                      <Badge variant="secondary" className="mt-2 text-xs">{artist.genre}</Badge>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {data.totalPages && data.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
              <span className="px-4 py-2 text-sm text-muted-foreground">Page {page} of {data.totalPages}</span>
              <Button variant="outline" size="sm" disabled={page >= (data.totalPages ?? 1)} onClick={() => setPage(p => p + 1)}>Next</Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 text-muted-foreground">
          <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>No artists found</p>
        </div>
      )}
    </div>
  );
}
