import { useState } from "react";
import { useTrades } from "@/hooks/useTrades";
import { useRules } from "@/hooks/useRules";
import { useOpeningBalance } from "@/hooks/useOpeningBalance";
import { computeRunningBalances } from "@/lib/runningBalance";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Area, AreaChart, CartesianGrid, Cell } from "recharts";
import { Link } from "wouter";
import { Pencil, Check } from "lucide-react";

export default function Dashboard() {
  const { trades } = useTrades();
  const { ruleLines } = useRules();
  const { openingBalance, updateOpeningBalance } = useOpeningBalance();

  const [editingOB, setEditingOB] = useState(false);
  const [obInput, setObInput] = useState(openingBalance.toString());

  const commitOB = () => {
    const val = parseFloat(obInput);
    if (!isNaN(val)) updateOpeningBalance(val);
    else setObInput(openingBalance.toString());
    setEditingOB(false);
  };

  const fmt = (n: number) =>
    `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  // ── Running balance chain ──────────────────────────────────────────────────
  const tradesWithBalance = computeRunningBalances(trades, openingBalance);

  // ── Stats ──────────────────────────────────────────────────────────────────
  const totalPnl = trades.reduce((sum, t) => sum + t.pnlAmount, 0);
  const wins = trades.filter(t => t.pnlAmount > 0).length;
  const winRate = trades.length > 0 ? (wins / trades.length) * 100 : 0;
  const avgPnl = trades.length > 0 ? totalPnl / trades.length : 0;
  const currentBalance = openingBalance + totalPnl;

  const bestTrade = [...trades].sort((a, b) => b.pnlAmount - a.pnlAmount)[0];
  const worstTrade = [...trades].sort((a, b) => a.pnlAmount - b.pnlAmount)[0];

  // ── P&L by asset ──────────────────────────────────────────────────────────
  const pnlByAssetObj: Record<string, number> = {};
  trades.forEach(t => {
    const key = t.asset === "Custom" ? (t.customAsset || "Custom") : t.asset;
    pnlByAssetObj[key] = (pnlByAssetObj[key] || 0) + t.pnlAmount;
  });
  const pnlByAssetData = Object.entries(pnlByAssetObj).map(([name, pnl]) => ({ name, pnl }));

  // ── Equity curve: starts at openingBalance, then plots balanceAfter ────────
  const equityData = [
    { index: 0, label: "Start", equity: openingBalance },
    ...tradesWithBalance.map((t, i) => ({
      index: i + 1,
      label: new Date(t.datetime).toLocaleDateString(),
      equity: t.balanceAfter,
    })),
  ];
  const finalEquity = equityData[equityData.length - 1]?.equity ?? openingBalance;

  // ── Rules discipline ───────────────────────────────────────────────────────
  const tradesAllRules = trades.filter(t => t.rulesFollowed?.length === ruleLines.length && ruleLines.length > 0);
  const tradesBrokenRules = trades.filter(t => (t.rulesFollowed?.length || 0) < ruleLines.length);
  const winRateAllRules = tradesAllRules.length > 0
    ? (tradesAllRules.filter(t => t.pnlAmount > 0).length / tradesAllRules.length) * 100 : 0;
  const winRateBrokenRules = tradesBrokenRules.length > 0
    ? (tradesBrokenRules.filter(t => t.pnlAmount > 0).length / tradesBrokenRules.length) * 100 : 0;

  return (
    <div className="space-y-6">

      {/* Opening Balance editor */}
      <div className="flex items-center gap-3 px-1">
        <span className="text-sm text-muted-foreground">Opening Balance:</span>
        {editingOB ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">$</span>
            <input
              autoFocus
              type="number"
              step="any"
              value={obInput}
              onChange={e => setObInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") commitOB(); if (e.key === "Escape") { setObInput(openingBalance.toString()); setEditingOB(false); } }}
              className="w-40 bg-input border border-primary rounded px-2 py-1 text-sm outline-none text-foreground"
              data-testid="input-opening-balance"
            />
            <button
              onClick={commitOB}
              className="text-success hover:text-success/80 transition-colors"
              data-testid="button-confirm-opening-balance"
            >
              <Check className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            className="flex items-center gap-1.5 text-sm font-semibold text-foreground hover:text-primary transition-colors group"
            onClick={() => { setObInput(openingBalance.toString()); setEditingOB(true); }}
            data-testid="button-edit-opening-balance"
          >
            {fmt(openingBalance)}
            <Pencil className="w-3 h-3 opacity-0 group-hover:opacity-60 transition-opacity" />
          </button>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Balance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentBalance >= openingBalance ? "text-success" : "text-destructive"}`} data-testid="stat-current-balance">
              {fmt(currentBalance)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total P&L</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalPnl >= 0 ? "text-success" : "text-destructive"}`} data-testid="stat-total-pnl">
              {totalPnl >= 0 ? "+" : "-"}{fmt(totalPnl)}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Win Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground" data-testid="stat-win-rate">{winRate.toFixed(1)}%</div>
            <div className="text-xs text-muted-foreground mt-1">{trades.length} trades</div>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg P&L / Trade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${avgPnl >= 0 ? "text-success" : "text-destructive"}`}>
              {avgPnl >= 0 ? "+" : "-"}{fmt(avgPnl)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Equity Curve</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {equityData.length <= 1 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                Log trades to see the curve
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={equityData}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={finalEquity >= openingBalance ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={finalEquity >= openingBalance ? "hsl(var(--success))" : "hsl(var(--destructive))"} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="index" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                  <RechartsTooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "Balance"]}
                    labelFormatter={(idx: number) => idx === 0 ? "Start" : equityData[idx]?.label ?? ""}
                  />
                  <Area type="monotone" dataKey="equity" stroke={finalEquity >= openingBalance ? "hsl(var(--success))" : "hsl(var(--destructive))"} fillOpacity={1} fill="url(#colorEquity)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">P&L by Asset</CardTitle>
          </CardHeader>
          <CardContent className="h-64">
            {pnlByAssetData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">No data yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={pnlByAssetData}>
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `$${v}`} />
                  <RechartsTooltip
                    cursor={{ fill: "hsl(var(--muted))", opacity: 0.4 }}
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    formatter={(value: number) => [`$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, "P&L"]}
                  />
                  <Bar dataKey="pnl" radius={[4, 4, 0, 0]}>
                    {pnlByAssetData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.pnl >= 0 ? "hsl(var(--success))" : "hsl(var(--destructive))"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Best / Worst */}
      {trades.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Best Trade</CardTitle></CardHeader>
            <CardContent>
              {bestTrade && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{new Date(bestTrade.datetime).toLocaleDateString()}</span>
                    <span className="font-medium text-success">+{fmt(bestTrade.pnlAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{bestTrade.asset === "Custom" ? bestTrade.customAsset : bestTrade.asset}</span>
                    <span className="uppercase text-xs tracking-wider border border-border px-2 py-1 rounded bg-secondary">{bestTrade.direction}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          <Card className="bg-card border-border">
            <CardHeader><CardTitle className="text-lg">Worst Trade</CardTitle></CardHeader>
            <CardContent>
              {worstTrade && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">{new Date(worstTrade.datetime).toLocaleDateString()}</span>
                    <span className="font-medium text-destructive">-{fmt(worstTrade.pnlAmount)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{worstTrade.asset === "Custom" ? worstTrade.customAsset : worstTrade.asset}</span>
                    <span className="uppercase text-xs tracking-wider border border-border px-2 py-1 rounded bg-secondary">{worstTrade.direction}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* No trades empty state */}
      {trades.length === 0 && (
        <div className="flex flex-col items-center justify-center h-40 text-center">
          <p className="text-muted-foreground mb-4">No trades logged yet.</p>
          <Link href="/log" className="bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 font-medium text-sm">
            Log Trade
          </Link>
        </div>
      )}

      {/* Rules discipline */}
      {ruleLines.length > 0 && trades.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader><CardTitle className="text-lg">Discipline & Rules</CardTitle></CardHeader>
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
                    const wrF = followed.length > 0 ? (followed.filter(t => t.pnlAmount > 0).length / followed.length) * 100 : 0;
                    const wrB = broken.length > 0 ? (broken.filter(t => t.pnlAmount > 0).length / broken.length) * 100 : 0;
                    return (
                      <tr key={idx} className="border-b border-border/50">
                        <td className="px-4 py-3 text-foreground">{rule}</td>
                        <td className="px-4 py-3 text-center">{followed.length}</td>
                        <td className="px-4 py-3 text-right">{followed.length > 0 ? `${wrF.toFixed(1)}%` : "-"}</td>
                        <td className="px-4 py-3 text-right">{broken.length > 0 ? `${wrB.toFixed(1)}%` : "-"}</td>
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
