import { Switch, Route } from "wouter";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";

import Home from "./pages/home";
import Login from "./pages/login";
import Register from "./pages/register";
import Dashboard from "./pages/dashboard";
import Discover from "./pages/discover";
import Artists from "./pages/artists";
import ArtistDetail from "./pages/artist-detail";
import TrackDetail from "./pages/track-detail";
import Community from "./pages/community";
import DiscussionDetail from "./pages/discussion-detail";
import Security from "./pages/security";
import Profile from "./pages/profile";
import Settings from "./pages/settings";
import Admin from "./pages/admin";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="habesha-theme">
      <AuthProvider>
        <Layout>
          <Switch>
            <Route path="/" component={Home} />
            <Route path="/login" component={Login} />
            <Route path="/register" component={Register} />

            <Route path="/dashboard">
              <ProtectedRoute><Dashboard /></ProtectedRoute>
            </Route>

            <Route path="/discover" component={Discover} />
            <Route path="/artists" component={Artists} />
            <Route path="/artists/:id" component={ArtistDetail} />
            <Route path="/tracks/:id" component={TrackDetail} />
            <Route path="/community" component={Community} />
            <Route path="/community/:id" component={DiscussionDetail} />
            <Route path="/security" component={Security} />
            <Route path="/profile/:username" component={Profile} />

            <Route path="/settings">
              <ProtectedRoute><Settings /></ProtectedRoute>
            </Route>

            <Route path="/admin">
              <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
            </Route>
            <Route path="/admin/:any*">
              <ProtectedRoute adminOnly><Admin /></ProtectedRoute>
            </Route>

            <Route>
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="text-6xl font-bold text-muted-foreground/30">404</p>
                <p className="text-xl font-semibold mt-4">Page not found</p>
                <p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p>
              </div>
            </Route>
          </Switch>
        </Layout>
      </AuthProvider>
    </ThemeProvider>
  );
}
