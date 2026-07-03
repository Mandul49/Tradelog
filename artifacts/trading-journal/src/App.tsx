import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { useEffect } from "react";
import type { User } from "@supabase/supabase-js";
import Dashboard from "@/pages/Dashboard";
import Journal from "@/pages/Journal";
import LogTrade from "@/pages/LogTrade";
import AuthPage from "@/pages/AuthPage";
import ProfilePage from "@/pages/ProfilePage";
import { RulesPanel } from "@/components/RulesPanel";
import { useRules, useRulesState, RulesContext } from "@/hooks/useRules";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Activity, List, PlusCircle, LogOut } from "lucide-react";

function Nav({ user, onLogout }: { user: User; onLogout: () => void }) {
  const [location, setLocation] = useLocation();
  const { setIsPanelOpen } = useRules();

  const email = user.email ?? "";
  const displayName = (user.user_metadata?.display_name as string | undefined) ?? email.split("@")[0];
  const initials = displayName
    .split(/[\s._-]/)
    .map((p: string) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  return (
    <header className="border-b border-border bg-card sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2 text-primary font-bold text-lg tracking-tight">
            <Activity className="w-5 h-5" />
            <span>TRADE<span className="text-foreground">LOG</span></span>
          </div>

          <nav className="flex gap-1">
            <Link href="/">
              <span className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${location === "/" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                <Activity className="w-4 h-4" /> Dashboard
              </span>
            </Link>
            <Link href="/journal">
              <span className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${location === "/journal" ? "bg-secondary text-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                <List className="w-4 h-4" /> Journal
              </span>
            </Link>
            <Link href="/log">
              <span className={`px-4 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer flex items-center gap-2 ${location.startsWith("/log") ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"}`}>
                <PlusCircle className="w-4 h-4" /> Log Trade
              </span>
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsPanelOpen(true)}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md transition-colors border border-border"
          >
            <BookOpen className="w-4 h-4" /> Rules
          </button>

          <button
            onClick={() => setLocation("/profile")}
            title="Profile"
            className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              location === "/profile"
                ? "bg-primary text-primary-foreground ring-2 ring-primary ring-offset-2 ring-offset-background"
                : "bg-secondary text-foreground hover:bg-primary hover:text-primary-foreground"
            }`}
          >
            {initials}
          </button>

          <button
            onClick={onLogout}
            title="Log out"
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md transition-colors border border-border"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function AppShell({ user, onLogout }: { user: User; onLogout: () => void }) {
  const rulesState = useRulesState();
  return (
    <RulesContext.Provider value={rulesState}>
      <div className="min-h-screen bg-background text-foreground font-sans">
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Nav user={user} onLogout={onLogout} />
          <main className="max-w-7xl mx-auto px-4 py-8">
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/journal" component={Journal} />
              <Route path="/log" component={LogTrade} />
              <Route path="/log/:id" component={LogTrade} />
              <Route path="/profile">
                <ProfilePage />
              </Route>
              <Route>
                <div className="flex items-center justify-center h-[50vh]">
                  <h2 className="text-2xl text-muted-foreground">404 - Page Not Found</h2>
                </div>
              </Route>
            </Switch>
          </main>
          <RulesPanel />
        </WouterRouter>
      </div>
    </RulesContext.Provider>
  );
}

function App() {
  const { user, loading, logOut, signUp, logIn } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Activity className="w-8 h-8 text-primary animate-pulse" />
          <p className="text-sm">Loading TradeLog…</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <AuthPage signUp={signUp} logIn={logIn} />;
  }

  return <AppShell user={user} onLogout={logOut} />;
}

export default App;
