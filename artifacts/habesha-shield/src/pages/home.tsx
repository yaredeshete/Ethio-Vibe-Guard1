import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { useGetTrendingTracks, useGetFeaturedArtists } from "@workspace/api-client-react";
import { Shield, Play, User as UserIcon, ArrowRight } from "lucide-react";
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
            <Shield className="w-8 h-8" />
            <span className="font-bold text-xl tracking-widest uppercase">HabeshaShield</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-white leading-tight">
            The secure heartbeat of Ethiopian music.
          </h1>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl">
            Discover, connect, and celebrate our culture in a space built for community and protected by cutting-edge security.
          </p>
          <div className="flex flex-wrap gap-4 pt-4">
            <Link href="/register">
              <Button size="lg" className="bg-accent text-accent-foreground hover:bg-accent/90">
                Join the Community
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loadingTracks ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))
          ) : Array.isArray(trendingTracks) && trendingTracks.slice(0, 6).map((track) => (
            <Link key={track.id} href={`/tracks/${track.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer bg-card/50 hover:bg-card">
                <CardContent className="p-4 flex items-center gap-4">
                  <div className="w-16 h-16 rounded-md bg-secondary/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {track.thumbnail ? (
                      <img src={track.thumbnail} alt={track.title} className="w-full h-full object-cover" />
                    ) : (
                      <Play className="w-8 h-8 text-secondary" />
                    )}
                  </div>
                  <div className="overflow-hidden">
                    <h3 className="font-semibold truncate">{track.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{track.artistName}</p>
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
                    <img src={artist.avatar} alt={artist.displayName} className="w-full h-full object-cover" />
                  ) : (
                    <UserIcon className="w-1/2 h-1/2 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium group-hover:text-primary transition-colors">{artist.displayName}</h3>
                  <p className="text-xs text-muted-foreground">{artist.genre}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Security highlight */}
      <section className="rounded-2xl border border-secondary/30 bg-secondary/5 p-8 flex flex-col md:flex-row items-center gap-8">
        <Shield className="w-16 h-16 text-secondary flex-shrink-0" />
        <div className="flex-1 text-center md:text-left">
          <h2 className="text-2xl font-bold">Built with security at its core</h2>
          <p className="text-muted-foreground mt-2">
            HabeshaShield protects the Ethiopian music community with JWT authentication, bcrypt encryption, rate limiting, and real-time security monitoring.
          </p>
        </div>
        <Link href="/security">
          <Button variant="outline" className="flex-shrink-0">Learn More</Button>
        </Link>
      </section>
    </div>
  );
}
