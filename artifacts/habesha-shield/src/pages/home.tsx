import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { useGetTrendingTracks, useGetFeaturedArtists } from "@workspace/api-client-react";
import { Music2, Play, User as UserIcon, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { Card, CardContent } from "../components/ui/card";

export default function Home() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  if (user) {
    setLocation("/dashboard");
    return null;
  }

  const { data: trendingTracks, isLoading: loadingTracks } = useGetTrendingTracks();
  const { data: featuredArtists, isLoading: loadingArtists } = useGetFeaturedArtists();

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-primary/90 to-background border border-primary/20 p-8 md:p-16">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="flex items-center gap-3 text-accent mb-6">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Music2 className="w-6 h-6" />
            </div>
            <span className="font-bold text-2xl tracking-widest uppercase">EthioWave</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            The pulse of Ethiopian music.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl">
            Discover thousands of Ethiopian tracks, connect with legendary and rising artists, and celebrate our culture in one vibrant community.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Join EthioWave
              </Button>
            </Link>
            <Link href="/discover">
              <Button size="lg" variant="outline" className="text-white border-white/20 hover:bg-white/10">
                Explore Tracks
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Trending Tracks */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Trending Now</h2>
          <Link href="/discover">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {loadingTracks ? (
            Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))
          ) : Array.isArray(trendingTracks) && trendingTracks.slice(0, 6).map((track) => (
            <Link key={track.id} href={`/tracks/${track.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50 hover:bg-card group">
                <CardContent className="p-3 flex items-center gap-3">
                  <div className="w-14 h-14 rounded-lg bg-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden relative">
                    <img
                      src={`https://img.youtube.com/vi/${track.youtubeId}/mqdefault.jpg`}
                      alt={track.title}
                      className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                      <Play className="w-5 h-5 text-white fill-white" />
                    </div>
                  </div>
                  <div className="overflow-hidden flex-1 min-w-0">
                    <h3 className="font-semibold truncate text-sm group-hover:text-primary transition-colors">{track.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">{track.artistName}</p>
                    <p className="text-xs text-muted-foreground/60">{track.genre}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Artists */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold tracking-tight">Featured Artists</h2>
          <Link href="/artists">
            <Button variant="ghost" className="text-muted-foreground hover:text-foreground">
              View all <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {loadingArtists ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="aspect-square w-full rounded-full" />
            ))
          ) : Array.isArray(featuredArtists) && featuredArtists.slice(0, 4).map((artist) => (
            <Link key={artist.id} href={`/artists/${artist.id}`}>
              <div className="group cursor-pointer text-center space-y-3">
                <div className="aspect-square rounded-full overflow-hidden border-4 border-background group-hover:border-primary transition-colors bg-muted flex items-center justify-center">
                  {artist.avatar ? (
                    <img src={artist.avatar} alt={artist.displayName} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(artist.displayName)}&background=8B1A1A&color=fff&size=200`; }} />
                  ) : (
                    <UserIcon className="w-1/2 h-1/2 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors text-sm">{artist.displayName}</h3>
                  <p className="text-xs text-muted-foreground">{artist.genre}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stats section */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Artists", value: "50+" },
          { label: "Tracks", value: "500+" },
          { label: "Genres", value: "15+" },
          { label: "Community Members", value: "Growing" },
        ].map((stat) => (
          <div key={stat.label} className="rounded-xl border border-border bg-card/50 p-6 text-center">
            <p className="text-3xl font-bold text-primary">{stat.value}</p>
            <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
