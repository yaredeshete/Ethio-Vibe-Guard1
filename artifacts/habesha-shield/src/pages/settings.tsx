import { useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useUpdateProfile } from "@workspace/api-client-react";
import { useTheme } from "../contexts/ThemeContext";
import { Save, Sun, Moon, Monitor } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";

export default function Settings() {
  const { user, refetchUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const updateMutation = useUpdateProfile();

  const [displayName, setDisplayName] = useState(user?.displayName ?? "");
  const [bio, setBio] = useState(user?.bio ?? "");
  const [avatar, setAvatar] = useState(user?.avatar ?? "");
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    const data: Record<string, string> = {};
    if (displayName !== user?.displayName) data.displayName = displayName;
    if (bio !== (user?.bio ?? "")) data.bio = bio;
    if (avatar !== (user?.avatar ?? "")) data.avatar = avatar;

    if (Object.keys(data).length === 0) return;

    await updateMutation.mutateAsync({ data });
    await (refetchUser as any)?.();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (!user) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your profile and preferences</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 rounded-full overflow-hidden bg-primary/20 flex items-center justify-center text-2xl font-bold text-primary flex-shrink-0">
              {avatar ? (
                <img src={avatar} alt={displayName} className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
              ) : (
                user.username.charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium">Avatar URL</label>
              <Input
                placeholder="https://example.com/avatar.jpg"
                value={avatar}
                onChange={(e) => setAvatar(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Username</label>
              <Input value={user.username} disabled className="mt-1 opacity-60" />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input value={user.email} disabled className="mt-1 opacity-60" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Display Name</label>
            <Input
              placeholder="Your display name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="mt-1"
              maxLength={50}
            />
          </div>

          <div>
            <label className="text-sm font-medium">Bio</label>
            <Textarea
              placeholder="Tell the community about yourself..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="mt-1"
              rows={3}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground mt-1">{bio.length}/500</p>
          </div>

          <Button onClick={handleSave} disabled={updateMutation.isPending} className="gap-2">
            <Save className="w-4 h-4" />
            {saved ? "Saved!" : updateMutation.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-4">Choose your preferred theme</p>
          <div className="flex gap-3">
            {[
              { value: "light", icon: Sun, label: "Light" },
              { value: "dark", icon: Moon, label: "Dark" },
              { value: "system", icon: Monitor, label: "System" },
            ].map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={theme === value ? "default" : "outline"}
                className="gap-2 flex-1"
                onClick={() => setTheme(value as "light" | "dark" | "system")}
              >
                <Icon className="w-4 h-4" /> {label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="capitalize font-medium">{user.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Verified</span>
            <span className="font-medium">{user.isVerified ? "Yes" : "No"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
