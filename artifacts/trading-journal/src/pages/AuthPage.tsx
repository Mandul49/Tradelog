import { useState } from "react";
import { Activity } from "lucide-react";

interface Props {
  signUp: (email: string, password: string) => { ok: boolean; error?: string };
  logIn: (email: string, password: string) => { ok: boolean; error?: string };
}

export default function AuthPage({ signUp, logIn }: Props) {
  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "signup") {
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      const res = signUp(email, password);
      if (!res.ok) { setError(res.error ?? "Error"); return; }
    } else {
      const res = logIn(email, password);
      if (!res.ok) { setError(res.error ?? "Error"); return; }
    }
  };

  const switchTab = (t: "login" | "signup") => {
    setTab(t);
    setError("");
    setEmail("");
    setPassword("");
    setConfirm("");
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <div className="flex flex-1 flex-col lg:flex-row">

        {/* ── Left panel: branding + about ── */}
        <div className="lg:w-1/2 flex flex-col justify-center px-10 py-16 lg:py-24 bg-card border-b lg:border-b-0 lg:border-r border-border">
          <div className="max-w-md mx-auto w-full">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold tracking-tight">
                TRADE<span className="text-primary">LOG</span>
              </span>
            </div>

            <h1 className="text-3xl font-bold mb-4 leading-snug">
              Your trading performance,<br />
              <span className="text-primary">tracked automatically.</span>
            </h1>

            <p className="text-muted-foreground text-sm leading-relaxed mb-8">
              TradeLog is a trading journal that automatically tracks and logs trades
              as they're entered. Each trade is recorded with key details — entry, exit,
              lot size, and outcome — so performance can be reviewed over time without
              manual data entry.
            </p>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  title: "Running Balance",
                  desc: "Calculates and updates your balance after every logged trade automatically.",
                },
                {
                  title: "Manual Deposits",
                  desc: "Supports deposit entries to keep your balance accurate alongside trading activity.",
                },
                {
                  title: "Performance Insights",
                  desc: "Win rate, reward-to-risk, and balance growth — all in one clear view.",
                },
              ].map(f => (
                <div key={f.title} className="flex gap-3 items-start">
                  <div className="mt-1 w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
                  <div>
                    <p className="text-sm font-semibold">{f.title}</p>
                    <p className="text-xs text-muted-foreground">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right panel: auth form ── */}
        <div className="lg:w-1/2 flex items-center justify-center px-8 py-16 lg:py-24">
          <div className="w-full max-w-sm">

            {/* Logo (mobile only) */}
            <div className="flex items-center gap-2 mb-8 lg:hidden">
              <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
                <Activity className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                TRADE<span className="text-primary">LOG</span>
              </span>
            </div>

            <h2 className="text-2xl font-bold mb-1">
              {tab === "login" ? "Welcome back" : "Create account"}
            </h2>
            <p className="text-muted-foreground text-sm mb-8">
              {tab === "login"
                ? "Sign in to your TradeLog account."
                : "Start tracking your trading performance."}
            </p>

            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-secondary/40 p-1 rounded-lg">
              {(["login", "signup"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => switchTab(t)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                    tab === t
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t === "login" ? "Log In" : "Sign Up"}
                </button>
              ))}
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  required
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1.5">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Min. 4 characters"
                  autoComplete={tab === "signup" ? "new-password" : "current-password"}
                  required
                  className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                />
              </div>

              {tab === "signup" && (
                <div>
                  <label className="block text-sm font-medium mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    placeholder="Repeat your password"
                    autoComplete="new-password"
                    required
                    className="w-full bg-secondary border border-border rounded-md px-3 py-2.5 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition"
                  />
                </div>
              )}

              {error && (
                <p className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full bg-primary text-primary-foreground rounded-md py-2.5 text-sm font-semibold hover:bg-primary/90 transition-colors mt-1"
              >
                {tab === "login" ? "Log In" : "Create Account"}
              </button>
            </form>

            <p className="text-xs text-muted-foreground text-center mt-6">
              {tab === "login" ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => switchTab(tab === "login" ? "signup" : "login")}
                className="text-primary hover:underline font-medium"
              >
                {tab === "login" ? "Sign up" : "Log in"}
              </button>
            </p>

            <p className="text-xs text-muted-foreground/50 text-center mt-4">
              Your data is stored locally on this device only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
