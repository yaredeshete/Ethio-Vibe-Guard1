import { Shield, AlertTriangle, Lock, Eye, Phone, CreditCard, UserX, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

const scamTypes = [
  {
    icon: CreditCard,
    title: "Fake Music Investment Schemes",
    severity: "high",
    description:
      "Scammers pose as music producers or investors promising large advances for signing rights. They ask for upfront \"processing fees\" before payments that never come.",
    howToSpot: [
      "Promises of unusually high returns or large upfront advances",
      "Requests for money transfers via untraceable methods",
      "Pressure to sign quickly without legal review",
      "Unverifiable contact information",
    ],
    whatToDo: "Never pay money to receive money. Consult a music attorney before signing anything. Verify the company through official registries.",
  },
  {
    icon: UserX,
    title: "Fake Artist Impersonation",
    severity: "high",
    description:
      "Fraudsters create fake social media profiles or websites pretending to be established Ethiopian artists to collect payments for fake merchandise, concerts, or collaborations.",
    howToSpot: [
      "Unverified accounts asking for direct payments",
      "Requests via DM for concert tickets or merchandise",
      "Urgency and pressure tactics ('limited slots!')",
      "Low follower counts or recently created profiles",
    ],
    whatToDo: "Always verify through official websites and verified social media accounts. Purchase only from official channels.",
  },
  {
    icon: Phone,
    title: "WhatsApp/Telegram Music Scams",
    severity: "medium",
    description:
      "Scam groups promise exclusive music collaborations, YouTube promotion, or streaming placements in exchange for payment or personal information.",
    howToSpot: [
      "Unsolicited messages about promotion opportunities",
      "Group chats demanding upfront payment",
      "Claims of guaranteed streams or chart positions",
      "Requests for login credentials to 'distribute' music",
    ],
    whatToDo: "Never share passwords or login credentials. Legitimate promoters do not operate via cold messages on messaging apps.",
  },
  {
    icon: Eye,
    title: "Phishing for Music Platform Credentials",
    severity: "medium",
    description:
      "Fake login pages mimicking music platforms like Spotify, YouTube, or local Ethiopian streaming services to steal account credentials.",
    howToSpot: [
      "URLs that look similar but have slight misspellings",
      "Emails claiming your account will be suspended",
      "Requests to verify payment information",
      "Pages that look slightly off compared to the real site",
    ],
    whatToDo: "Always check the URL carefully. Enable two-factor authentication. Use a password manager to avoid entering credentials on wrong sites.",
  },
  {
    icon: AlertTriangle,
    title: "Copyright Trolling",
    severity: "medium",
    description:
      "Malicious actors claim copyright on traditional Ethiopian music and file fraudulent takedowns or demand licensing fees from legitimate artists.",
    howToSpot: [
      "Claims on traditional or public domain music",
      "Demands for payment to 'clear' copyright",
      "Sudden Content ID claims on old uploads",
      "Vague or threatening emails about \"unauthorized use\"",
    ],
    whatToDo: "Document your original work thoroughly. Consult an intellectual property lawyer. Report fraudulent claims to platform support.",
  },
  {
    icon: Lock,
    title: "Account Takeover",
    severity: "high",
    description:
      "Hackers use stolen credentials, SIM swapping, or social engineering to take over artists' social media and streaming accounts to extort money.",
    howToSpot: [
      "Sudden logout from your accounts",
      "Unknown login notifications",
      "Followers receiving strange messages 'from you'",
      "Inability to reset your password via email",
    ],
    whatToDo: "Use unique strong passwords. Enable 2FA on all accounts. Never reuse passwords. Set up recovery email and phone on all platforms.",
  },
];

const severityColor: Record<string, string> = {
  high: "bg-destructive/10 text-destructive border-destructive/20",
  medium: "bg-accent/10 text-accent-foreground border-accent/20",
  low: "bg-secondary/10 text-secondary border-secondary/20",
};

export default function Security() {
  const [expanded, setExpanded] = useState<number | null>(null);

  return (
    <div className="space-y-10">
      {/* Hero */}
      <section className="rounded-2xl overflow-hidden bg-gradient-to-br from-destructive/20 via-background to-primary/10 border border-destructive/20 p-8">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-destructive/10 rounded-xl">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h1 className="text-3xl font-bold">Security Awareness Center</h1>
            <p className="text-muted-foreground mt-2 max-w-2xl">
              Protecting the Ethiopian music community from fraud, scams, and cyberthreats. 
              Knowledge is your first line of defense.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Scam Types Covered", value: "6" },
          { label: "Protection Tips", value: "24+" },
          { label: "Community Reports", value: "Active" },
          { label: "Platform Security", value: "256-bit" },
        ].map((stat) => (
          <Card key={stat.label} className="text-center">
            <CardContent className="p-4">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Scam Guide */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">Common Scams Targeting Ethiopian Artists</h2>
        <p className="text-muted-foreground">
          Click each type to learn how to identify and protect yourself.
        </p>
        <div className="space-y-3">
          {scamTypes.map((scam, i) => {
            const Icon = scam.icon;
            const isOpen = expanded === i;
            return (
              <Card
                key={i}
                className={`cursor-pointer transition-all border ${isOpen ? "border-primary/50" : "hover:border-primary/30"}`}
                onClick={() => setExpanded(isOpen ? null : i)}
              >
                <CardContent className="p-5">
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="p-2 bg-muted rounded-lg flex-shrink-0">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{scam.title}</h3>
                        <Badge variant="outline" className={`text-xs mt-1 ${severityColor[scam.severity]}`}>
                          {scam.severity.toUpperCase()} RISK
                        </Badge>
                      </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
                  </div>

                  {isOpen && (
                    <div className="mt-5 space-y-4 border-t pt-5">
                      <p className="text-sm text-muted-foreground">{scam.description}</p>

                      <div>
                        <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                          <AlertTriangle className="w-4 h-4 text-accent" /> How to spot it
                        </h4>
                        <ul className="space-y-1">
                          {scam.howToSpot.map((tip, j) => (
                            <li key={j} className="text-sm text-muted-foreground flex gap-2">
                              <span className="text-accent font-bold mt-0.5">·</span>{tip}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="rounded-lg bg-secondary/10 border border-secondary/20 p-4">
                        <h4 className="text-sm font-semibold mb-1 text-secondary flex items-center gap-2">
                          <Shield className="w-4 h-4" /> What to do
                        </h4>
                        <p className="text-sm text-muted-foreground">{scam.whatToDo}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Platform Security Features */}
      <section className="space-y-4">
        <h2 className="text-2xl font-bold">How HabeshaShield Protects You</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { title: "JWT Authentication", desc: "Cryptographically signed tokens ensure only you can access your account.", icon: Lock },
            { title: "Bcrypt Password Hashing", desc: "Your password is never stored — only a strong cryptographic hash.", icon: Shield },
            { title: "Rate Limiting", desc: "Automatic throttling prevents brute-force and credential stuffing attacks.", icon: AlertTriangle },
            { title: "Account Lockout", desc: "Accounts are temporarily locked after 5 failed login attempts.", icon: UserX },
            { title: "Security Audit Logs", desc: "All sensitive actions are logged and monitored for suspicious activity.", icon: Eye },
            { title: "XSS Protection", desc: "All user input is sanitized to prevent cross-site scripting attacks.", icon: CreditCard },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title} className="bg-card/60">
                <CardContent className="p-5 flex gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg flex-shrink-0 h-fit">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{feature.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{feature.desc}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Emergency Contact */}
      <Card className="border-destructive/30 bg-destructive/5">
        <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-4">
          <AlertTriangle className="w-8 h-8 text-destructive flex-shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <h3 className="font-semibold">Report a Scam or Suspicious Activity</h3>
            <p className="text-sm text-muted-foreground mt-1">
              If you've encountered a scam targeting Ethiopian music artists, report it to help protect the community.
            </p>
          </div>
          <Button variant="destructive" className="flex-shrink-0">Report Now</Button>
        </CardContent>
      </Card>
    </div>
  );
}
