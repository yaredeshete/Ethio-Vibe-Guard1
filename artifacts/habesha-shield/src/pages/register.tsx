import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../contexts/AuthContext";
import { useRegister } from "@workspace/api-client-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Music2, Eye, EyeOff, Check, X } from "lucide-react";
import { toast } from "sonner";

function PasswordStrength({ password }: { password: string }) {
  const checks = [
    { label: "At least 8 characters", ok: password.length >= 8 },
    { label: "Contains uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Contains lowercase letter", ok: /[a-z]/.test(password) },
    { label: "Contains a number", ok: /\d/.test(password) },
  ];

  if (!password) return null;

  const score = checks.filter((c) => c.ok).length;
  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong"][score];
  const strengthColor = ["", "text-destructive", "text-amber-500", "text-yellow-400", "text-green-500"][score];
  const barColors = ["bg-muted", "bg-destructive", "bg-amber-500", "bg-yellow-400", "bg-green-500"];

  return (
    <div className="space-y-2 mt-1">
      <div className="flex gap-1">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={`h-1 flex-1 rounded-full transition-colors ${n <= score ? barColors[score] : "bg-muted"}`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${strengthColor}`}>{strengthLabel}</p>
      <ul className="space-y-0.5">
        {checks.map((c) => (
          <li key={c.label} className={`text-xs flex items-center gap-1.5 ${c.ok ? "text-green-500" : "text-muted-foreground"}`}>
            {c.ok ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Register() {
  const [, setLocation] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const passwordsMatch = !confirmPassword || password === confirmPassword;
  const isPasswordStrong = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /\d/.test(password);
  const isUsernameValid = /^[a-zA-Z0-9_]{3,30}$/.test(username);

  const registerMutation = useRegister({
    mutation: {
      onSuccess: (data) => {
        setErrorMessage(null);
        login(data.token, data.user);
        toast.success("Account created! Welcome to EthioWave.");
        setLocation("/dashboard");
      },
      onError: (err: any) => {
        const msg =
          err?.response?.data?.error ||
          err?.message ||
          "Registration failed. Please try again.";
        setErrorMessage(msg);
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!passwordsMatch) {
      setErrorMessage("Passwords don't match.");
      return;
    }
    if (!isPasswordStrong) {
      setErrorMessage("Please choose a stronger password.");
      return;
    }
    if (!isUsernameValid) {
      setErrorMessage("Username must be 3–30 characters: letters, numbers, underscores only.");
      return;
    }

    registerMutation.mutate({
      data: {
        email: email.trim().toLowerCase(),
        username: username.trim(),
        password,
        displayName: displayName.trim() || undefined,
      },
    });
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12">
      <div className="w-full max-w-md space-y-8 p-8 border border-border/50 rounded-2xl bg-card shadow-xl">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center mb-2">
            <Music2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight">Join EthioWave</h1>
          <p className="text-sm text-muted-foreground">Discover and celebrate Ethiopian music</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
              required
              autoComplete="email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              type="text"
              placeholder="ethiomusic"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setErrorMessage(null); }}
              required
              autoComplete="username"
            />
            {username && !isUsernameValid && (
              <p className="text-xs text-destructive">3–30 characters: letters, numbers, underscores only</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">Display Name <span className="text-muted-foreground">(optional)</span></Label>
            <Input
              id="displayName"
              type="text"
              placeholder="Your Name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              autoComplete="name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                required
                autoComplete="new-password"
                className="pr-10"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowPassword((v) => !v)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirm ? "text" : "password"}
                placeholder="Repeat your password"
                value={confirmPassword}
                onChange={(e) => { setConfirmPassword(e.target.value); setErrorMessage(null); }}
                required
                autoComplete="new-password"
                className={`pr-10 ${confirmPassword && !passwordsMatch ? "border-destructive focus-visible:ring-destructive" : ""}`}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setShowConfirm((v) => !v)}
                tabIndex={-1}
              >
                {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-xs text-destructive">Passwords don't match</p>
            )}
          </div>

          {errorMessage && (
            <div className="rounded-lg bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
              {errorMessage}
            </div>
          )}

          <Button
            type="submit"
            className="w-full mt-2"
            disabled={
              registerMutation.isPending ||
              !email ||
              !username ||
              !password ||
              !confirmPassword ||
              !passwordsMatch
            }
          >
            {registerMutation.isPending ? "Creating Account..." : "Create Account"}
          </Button>
        </form>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Button variant="link" className="p-0 h-auto" onClick={() => setLocation("/login")}>
            Sign in
          </Button>
        </div>
      </div>
    </div>
  );
}
