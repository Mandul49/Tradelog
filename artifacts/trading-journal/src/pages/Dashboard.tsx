import { useTrades } from "@/hooks/useTrades";
import { useRules } from "@/hooks/useRules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, CartesianGrid, Cell } from "recharts";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function Dashboard() {
  const { trades } = useTrades();
  const { ruleLines } = useRules();

  if (trades.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center">
        <h2 className="text-2xl font-semibold mb-2">No trades yet</h2>
        <p className="text-muted-foreground mb-6">Log your first trade to see your dashboard.</p>
        <Link href="/log" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium">
          Log Trade
        </Link>
      </div>
    );
  }

  const totalPnl = trades.reduce((sum, t) => sum + t.pnlAmount, 0);
  const wins = trades.filter(t => t.pnlAmount > 0).length;
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
  const avgPnl = trades.length > 0 ? totalPnl / trades.length : 0;

  // Best / Worst trades
  const bestTrade = [...trades].sort((a, b) => b.pnlAmount - a.pnlAmount)[0];
  const worstTrade = [...trades].sort((a, b) => a.pnlAmount - b.pnlAmount)[0];

  // PnL by Asset
  const pnlByAssetObj: Record<string, number> = {};
  trades.forEach(t => {
    const key = t.asset === "Custom" ? (t.customAsset || "Custom") : t.asset;
    pnlByAssetObj[key] = (pnlByAssetObj[key] || 0) + t.pnlAmount;
  });
  const pnlByAssetData = Object.entries(pnlByAssetObj).map(([name, pnl]) => ({ name, pnl }));

  // Cumulative Equity
  let cumulative = 0;
  const equityData = [...trades].sort((a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()).map((t, i) => {
    cumulative += t.pnlAmount;
    return {
      index: i + 1,
      date: new Date(t.datetime).toLocaleDateString(),
      equity: cumulative
    };
  });

  // Rules discipline
  const tradesAllRules = trades.filter(t => t.rulesFollowed?.length === ruleLines.length && ruleLines.length > 0);
  const tradesBrokenRules = trades.filter(t => (t.rulesFollowed?.length || 0) < ruleLines.length);
  
  const winRateAllRules = tradesAllRules.length > 0 
    ? (tradesAllRules.filter(t => t.pnlAmount > 0).length / tradesAllRules.length) * 100 
    : 0;
  const winRateBrokenRules = tradesBrokenRules.length > 0 
    ? (tradesBrokenRules.filter(t => t.pnlAmount > 0).length / tradesBrokenRules.length) * 100 
    : 0;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnl >= 0 ? "text-success" : "text-destructive"}`}>
              {totalPnl >= 0 ? "+" : ""}₦{totalPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{winRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Trades</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{trades.length}</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg P&L / Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgPnl >= 0 ? "text-success" : "text-destructive"}`}>
              {avgPnl >= 0 ? "+" : ""}₦{avgPnl.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Cumulative Equity</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={equityData}>
                <defs>
                  <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={cumulative >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={cumulative >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => `₦${v}`} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, "Equity"]}
                />
                <Area type="monotone" dataKey="equity" stroke={cumulative >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} fillOpacity={1} fill="url(#colorEquity)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">P&L by Asset</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={pnlByAssetData}>
                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                <RechartsTooltip 
                  cursor={{fill: "hsl(var(--muted))", opacity: 0.4}}
                  contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                  formatter={(value: number) => [`₦${value.toLocaleString()}`, "P&L"]}
                />
                <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                  {pnlByAssetData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Best Trade</CardTitle>
          </CardHeader>
          <CardContent>
            {bestTrade ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{new Date(bestTrade.datetime).toLocaleDateString()}</span>
                  <span className="font-medium text-success">+₦{bestTrade.pnlAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{bestTrade.asset === "Custom" ? bestTrade.customAsset : bestTrade.asset}</span>
                  <span className="uppercase text-xs tracking-wider border border-border px-2 py-1 rounded bg-secondary">{bestTrade.direction}</span>
                </div>
              </div>
            ) : <span className="text-muted-foreground">N/A</span>}
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Worst Trade</CardTitle>
          </CardHeader>
          <CardContent>
            {worstTrade ? (
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">{new Date(worstTrade.datetime).toLocaleDateString()}</span>
                  <span className="font-medium text-destructive">₦{worstTrade.pnlAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{worstTrade.asset === "Custom" ? worstTrade.customAsset : worstTrade.asset}</span>
                  <span className="uppercase text-xs tracking-wider border border-border px-2 py-1 rounded bg-secondary">{worstTrade.direction}</span>
                </div>
              </div>
            ) : <span className="text-muted-foreground">N/A</span>}
          </CardContent>
        </Card>
      </div>

      {ruleLines.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Discipline & Rules</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-secondary/50 p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Win Rate (All Rules Followed)</div>
                <div className="text-2xl font-bold">{winRateAllRules.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">{tradesAllRules.length} trades</div>
              </div>
              <div className="bg-secondary/50 p-4 rounded-lg border border-border">
                <div className="text-sm text-muted-foreground mb-1">Win Rate (Rules Broken)</div>
                <div className="text-2xl font-bold">{winRateBrokenRules.toFixed(1)}%</div>
                <div className="text-xs text-muted-foreground mt-1">{tradesBrokenRules.length} trades</div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-secondary/30">
                  <tr>
                    <th className="px-4 py-3 font-medium">Rule</th>
                    <th className="px-4 py-3 font-medium text-center">Followed</th>
                    <th className="px-4 py-3 font-medium text-right">WR When Followed</th>
                    <th className="px-4 py-3 font-medium text-right">WR When Broken</th>
                  </tr>
                </thead>
                <tbody>
                  {ruleLines.map((rule, idx) => {
                    const followed = trades.filter(t => t.rulesFollowed?.includes(rule));
                    const broken = trades.filter(t => !t.rulesFollowed?.includes(rule));
                    const wrFollowed = followed.length > 0 ? (followed.filter(t => t.pnlAmount > 0).length / followed.length) * 100 : 0;
                    const wrBroken = broken.length > 0 ? (broken.filter(t => t.pnlAmount > 0).length / broken.length) * 100 : 0;
                    
                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="px-4 py-3 text-foreground">{rule}</td>
                        <td className="px-4 py-3 text-center">{followed.length}</td>
                        <td className="px-4 py-3 text-right">{followed.length > 0 ? `${wrFollowed.toFixed(1)}%` : '-'}</td>
                        <td className="px-4 py-3 text-right">{broken.length > 0 ? `${wrBroken.toFixed(1)}%` : '-'}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
