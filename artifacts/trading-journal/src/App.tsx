import { Switch, Route, Router as WouterRouter, Link, useLocation } from "wouter";
import { useEffect } from "react";
import Dashboard from "@/pages/Dashboard";
import Journal from "@/pages/Journal";
import LogTrade from "@/pages/LogTrade";
import AuthPage from "@/pages/AuthPage";
import { RulesPanel } from "@/components/RulesPanel";
import { useRules } from "@/hooks/useRules";
import { useAuth } from "@/hooks/useAuth";
import { BookOpen, Activity, List, PlusCircle, LogOut } from "lucide-react";

function Nav({ onLogout }: { onLogout: () => void }) {
  const [location] = useLocation();
  const { setIsPanelOpen } = useRules();

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
            onClick={onLogout}
            className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-destructive bg-secondary/50 hover:bg-secondary px-3 py-1.5 rounded-md transition-colors border border-border"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

function AppShell({ onLogout }: { onLogout: () => void }) {
  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
        <Nav onLogout={onLogout} />
        <main className="max-w-7xl mx-auto px-4 py-8">
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/journal" component={Journal} />
            <Route path="/log" component={LogTrade} />
            <Route path="/log/:id" component={LogTrade} />
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
  );
}

function App() {
  const { currentUser, logOut } = useAuth();

  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  if (!currentUser) {
    return <AuthPage onAuth={() => {}} />;
  }

  return <AppShell onLogout={logOut} />;
}

export default App;
