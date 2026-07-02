import { useState, useMemo } from "react";
import { useTrades } from "@/hooks/useTrades";
import { useLocation } from "wouter";
import { Trade } from "@/types";
import { TradeDetailModal } from "@/components/TradeDetailModal";
import { Trash2, Edit, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Journal() {
  const { trades, deleteTrade } = useTrades();
  const [, setLocation] = useLocation();
  const [filterAsset, setFilterAsset] = useState<string>("All");
  const [filterResult, setFilterResult] = useState<string>("All");

  const [sortField, setSortField] = useState<keyof Trade | "">("datetime");
  const [sortDesc, setSortDesc] = useState(true);

  const [selectedTrade, setSelectedTrade] = useState<Trade | null>(null);

  const assets = useMemo(() => {
    const set = new Set<string>();
    trades.forEach(t => set.add(t.asset === "Custom" ? (t.customAsset || "Custom") : t.asset));
    return ["All", ...Array.from(set)];
  }, [trades]);

  const filteredAndSorted = useMemo(() => {
    let result = trades.filter(t => {
      const assetMatch = filterAsset === "All" || (t.asset === "Custom" ? t.customAsset === filterAsset : t.asset === filterAsset);
      const resultMatch = filterResult === "All" || t.result === filterResult.toLowerCase();
      return assetMatch && resultMatch;
    });

    if (sortField) {
      result.sort((a, b) => {
        let valA: string | number | boolean | string[] | undefined = a[sortField as keyof Trade];
        let valB: string | number | boolean | string[] | undefined = b[sortField as keyof Trade];

        if (sortField === "datetime") {
          valA = new Date(a.datetime).getTime();
          valB = new Date(b.datetime).getTime();
        }

        if (valA == null || valB == null) return 0;
        if (valA < valB) return sortDesc ? 1 : -1;
        if (valA > valB) return sortDesc ? -1 : 1;
        return 0;
      });
    }

    return result;
  }, [trades, filterAsset, filterResult, sortField, sortDesc]);

  const handleSort = (field: keyof Trade) => {
    if (sortField === field) {
      setSortDesc(!sortDesc);
    } else {
      setSortField(field);
      setSortDesc(true);
    }
  };

  const fmt = (n: number) =>
    `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-4">
      <div className="flex gap-4 items-center bg-card p-4 rounded-lg border border-border shadow-sm">
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground font-medium">Asset:</label>
          <select
            value={filterAsset}
            onChange={e => setFilterAsset(e.target.value)}
            className="bg-input border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary text-foreground"
            data-testid="filter-asset"
          >
            {assets.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-muted-foreground font-medium">Result:</label>
          <select
            value={filterResult}
            onChange={e => setFilterResult(e.target.value)}
            className="bg-input border border-border rounded px-3 py-1.5 text-sm outline-none focus:border-primary text-foreground"
            data-testid="filter-result"
          >
            <option value="All">All</option>
            <option value="Win">Win</option>
            <option value="Loss">Loss</option>
          </select>
        </div>
      </div>

      <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-secondary/50 text-muted-foreground uppercase text-xs">
              <tr>
                <th className="px-4 py-3 font-medium cursor-pointer hover:text-foreground" onClick={() => handleSort("datetime")}>
                  <div className="flex items-center gap-1">Date/Time <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-4 py-3 font-medium">Asset</th>
                <th className="px-4 py-3 font-medium">Dir</th>
                <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-foreground" onClick={() => handleSort("originalBalance")}>
                  <div className="flex items-center justify-end gap-1">Orig. Bal ($) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-foreground" onClick={() => handleSort("currentBalance")}>
                  <div className="flex items-center justify-end gap-1">Curr. Bal ($) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-4 py-3 font-medium text-right">Entry ($)</th>
                <th className="px-4 py-3 font-medium text-right">Exit ($)</th>
                <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-foreground" onClick={() => handleSort("pnlAmount")}>
                  <div className="flex items-center justify-end gap-1">P&L ($) <ArrowUpDown className="w-3 h-3" /></div>
                </th>
                <th className="px-4 py-3 font-medium text-right">P&L (%)</th>
                <th className="px-4 py-3 font-medium text-center">Result</th>
                <th className="px-4 py-3 font-medium">Tags</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSorted.length === 0 ? (
                <tr>
                  <td colSpan={12} className="px-4 py-8 text-center text-muted-foreground">
                    No trades match the filters.
                  </td>
                </tr>
              ) : filteredAndSorted.map(t => (
                <tr
                  key={t.id}
                  data-testid={`row-trade-${t.id}`}
                  className="border-b border-border/50 hover:bg-secondary/30 cursor-pointer transition-colors"
                  onClick={() => setSelectedTrade(t)}
                >
                  <td className="px-4 py-3">{new Date(t.datetime).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" })}</td>
                  <td className="px-4 py-3 font-medium">{t.asset === "Custom" ? t.customAsset : t.asset}</td>
                  <td className="px-4 py-3 uppercase text-xs">{t.direction}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{fmt(t.originalBalance)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{fmt(t.currentBalance)}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{t.entryPrice || "—"}</td>
                  <td className="px-4 py-3 text-right text-muted-foreground">{t.exitPrice || "—"}</td>
                  <td className={`px-4 py-3 text-right font-semibold ${t.pnlAmount >= 0 ? "text-success" : "text-destructive"}`}>
                    {t.pnlAmount > 0 ? "+" : "-"}{fmt(t.pnlAmount)}
                  </td>
                  <td className={`px-4 py-3 text-right ${t.pnlAmount >= 0 ? "text-success" : "text-destructive"}`}>
                    {t.pnlPercent > 0 ? "+" : ""}{t.pnlPercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`px-2 py-0.5 rounded text-xs font-bold tracking-wide ${t.result === "win" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                      {t.result.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {t.tags.slice(0, 2).map((tag, i) => (
                        <span key={i} className="bg-secondary text-secondary-foreground text-[10px] px-1.5 py-0.5 rounded truncate max-w-[80px]">
                          {tag}
                        </span>
                      ))}
                      {t.tags.length > 2 && <span className="text-xs text-muted-foreground">+{t.tags.length - 2}</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2" onClick={e => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground" onClick={() => setLocation(`/log/${t.id}`)} data-testid={`button-edit-${t.id}`}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" data-testid={`button-delete-${t.id}`} onClick={() => {
                        if (confirm("Delete this trade?")) deleteTrade(t.id);
                      }}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <TradeDetailModal
        trade={selectedTrade}
        open={!!selectedTrade}
        onOpenChange={(open) => !open && setSelectedTrade(null)}
      />
    </div>
  );
}
