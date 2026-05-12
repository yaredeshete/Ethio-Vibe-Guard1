import { Link, useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { Music2, Home, Compass, Users, MessageSquare, Settings, ShieldCheck, LogOut, LayoutDashboard, ShieldAlert } from "lucide-react";
import { Button } from "./ui/button";

export function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Home", icon: Home, show: !user },
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: !!user },
    { href: "/discover", label: "Discover", icon: Compass, show: true },
    { href: "/artists", label: "Artists", icon: Users, show: true },
    { href: "/community", label: "Community", icon: MessageSquare, show: true },
    { href: "/security", label: "Security", icon: ShieldCheck, show: true },
    { href: "/settings", label: "Settings", icon: Settings, show: !!user },
  ];

  const adminLinks = [
    { href: "/admin", label: "Admin", icon: ShieldAlert, show: user?.role === "admin" },
  ];

  return (
    <div className="w-64 h-full bg-card border-r flex flex-col p-4 flex-shrink-0">
      <div className="flex items-center gap-2 mb-8 px-2">
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
          <Music2 className="w-5 h-5 text-white" />
        </div>
        <span className="font-bold text-xl tracking-tight text-primary">EthioWave</span>
      </div>

      <nav className="flex-1 space-y-2">
        {links.filter((l) => l.show).map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link key={link.href} href={link.href}>
              <Button
                variant={isActive ? "secondary" : "ghost"}
                className={`w-full justify-start gap-3 ${isActive ? "bg-secondary/20 text-secondary" : ""}`}
              >
                <Icon className="w-5 h-5" />
                {link.label}
              </Button>
            </Link>
          );
        })}

        {user?.role === "admin" && (
          <div className="pt-6 mt-6 border-t border-border/50">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 px-4">Admin</p>
            {adminLinks.filter(l => l.show).map((link) => {
              const Icon = link.icon;
              const isActive = location.startsWith(link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start gap-3 ${isActive ? "bg-destructive/10 text-destructive" : ""}`}
                  >
                    <Icon className="w-5 h-5" />
                    {link.label}
                  </Button>
                </Link>
              );
            })}
          </div>
        )}
      </nav>

      {user ? (
        <div className="pt-4 border-t mt-auto">
          <div className="flex items-center gap-3 px-2 mb-4">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.displayName || user.username}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button variant="outline" className="w-full justify-start gap-3" onClick={logout}>
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      ) : (
        <div className="pt-4 border-t mt-auto space-y-2">
          <Link href="/login">
            <Button variant="outline" className="w-full">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button className="w-full">Create Account</Button>
          </Link>
        </div>
      )}
    </div>
  );
}
