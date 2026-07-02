import { useState, useEffect, useCallback } from "react";
import { useLocation, useParams } from "wouter";
import { useTrades } from "@/hooks/useTrades";
import { useRules } from "@/hooks/useRules";
import { Trade } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RefreshCw } from "lucide-react";

// Read a trade directly from localStorage — synchronous, no timing issues
function loadTradeFromStorage(id: string | undefined): Trade | null {
  if (!id) return null;
  try {
    const raw = localStorage.getItem("trading-journal-trades");
    if (!raw) return null;
    const all: Trade[] = JSON.parse(raw);
    return all.find(t => t.id === id) ?? null;
  } catch {
    return null;
  }
}

// ── Deriv volatility markets ──────────────────────────────────────────────────
const DERIV_MARKETS: { group: string; items: string[] }[] = [
  {
    group: "Volatility Indices",
    items: [
      "Volatility 10 Index",
      "Volatility 25 Index",
      "Volatility 50 Index",
      "Volatility 75 Index",
      "Volatility 100 Index",
    ],
  },
  {
    group: "Volatility Indices (1s)",
    items: [
      "Volatility 10 (1s) Index",
      "Volatility 25 (1s) Index",
      "Volatility 50 (1s) Index",
      "Volatility 75 (1s) Index",
      "Volatility 100 (1s) Index",
    ],
  },
  {
    group: "Boom & Crash",
    items: [
      "Boom 300 Index",
      "Boom 500 Index",
      "Boom 1000 Index",
      "Crash 300 Index",
      "Crash 500 Index",
      "Crash 1000 Index",
    ],
  },
  {
    group: "Jump Indices",
    items: [
      "Jump 10 Index",
      "Jump 25 Index",
      "Jump 50 Index",
      "Jump 75 Index",
      "Jump 100 Index",
    ],
  },
  {
    group: "Range Break",
    items: ["Range Break 100 Index", "Range Break 200 Index"],
  },
  {
    group: "Other",
    items: ["Step Index"],
  },
];

const ALL_KNOWN_ASSETS = DERIV_MARKETS.flatMap(g => g.items);

// ─────────────────────────────────────────────────────────────────────────────

export default function LogTrade() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { addTrade, updateTrade } = useTrades();
  const { ruleLines, setIsPanelOpen } = useRules();

  // Load synchronously so form is pre-filled on first render — no useEffect race
  const isEdit = !!params.id;
  const existingTrade = useState(() => loadTradeFromStorage(params.id))[0];

  const [datetime, setDatetime] = useState(() => {
    if (existingTrade) return existingTrade.datetime.slice(0, 16);
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [asset, setAsset] = useState<string>(() => existingTrade?.asset ?? "Volatility 75 Index");
  const [customAsset, setCustomAsset] = useState(() => existingTrade?.customAsset ?? "");
  const [direction, setDirection] = useState<Trade["direction"]>(() => existingTrade?.direction ?? "buy");
  const [lotSize, setLotSize] = useState<string>(() => existingTrade ? (existingTrade.lotSize ?? 1).toString() : "1");
  const [originalBalance, setOriginalBalance] = useState<string>(() => existingTrade ? existingTrade.originalBalance.toString() : "");
  const [currentBalance, setCurrentBalance] = useState<string>(() => existingTrade ? existingTrade.currentBalance.toString() : "");
  const [entryPrice, setEntryPrice] = useState<string>(() => existingTrade?.entryPrice ? existingTrade.entryPrice.toString() : "");
  const [exitPrice, setExitPrice] = useState<string>(() => existingTrade?.exitPrice ? existingTrade.exitPrice.toString() : "");
  const [reasoning, setReasoning] = useState(() => existingTrade?.reasoning ?? "");
  const [reflection, setReflection] = useState(() => existingTrade?.reflection ?? "");
  const [tags, setTags] = useState(() => existingTrade ? existingTrade.tags.join(", ") : "");
  const [screenshot, setScreenshot] = useState<string | undefined>(() => existingTrade?.screenshot);
  const [rulesFollowed, setRulesFollowed] = useState<string[]>(() => existingTrade?.rulesFollowed ?? []);
  // Pre-existing trades: keep currentBalance as entered, don't auto-overwrite
  const [balanceManual, setBalanceManual] = useState(() => !!existingTrade);

  // ── Auto-calculate current balance ────────────────────────────────────────
  const computeCurrentBalance = useCallback(
    (origBal: string, entry: string, exit: string, lot: string, dir: Trade["direction"]) => {
      const o = parseFloat(origBal);
      const en = parseFloat(entry);
      const ex = parseFloat(exit);
      const ls = parseFloat(lot);
      if (!o || !en || !ex || !ls) return null;
      const pnl = dir === "buy"
        ? (ex - en) * ls
        : (en - ex) * ls;
      return (o + pnl).toFixed(2);
    },
    []
  );

  useEffect(() => {
    if (balanceManual) return;
    const result = computeCurrentBalance(originalBalance, entryPrice, exitPrice, lotSize, direction);
    if (result !== null) setCurrentBalance(result);
  }, [originalBalance, entryPrice, exitPrice, lotSize, direction, balanceManual, computeCurrentBalance]);

  // ── Derived P&L values for preview ────────────────────────────────────────
  const origNum = parseFloat(originalBalance) || 0;
  const currNum = parseFloat(currentBalance) || 0;
  const pnlAmount = origNum > 0 && currNum > 0 ? currNum - origNum : 0;
  const pnlPercent = origNum > 0 && currNum > 0 ? ((currNum - origNum) / origNum) * 100 : 0;
  const showPreview = originalBalance !== "" && currentBalance !== "";
  const isAutoCalcActive =
    !balanceManual &&
    originalBalance !== "" &&
    entryPrice !== "" &&
    exitPrice !== "" &&
    lotSize !== "";

  // ── Helpers ───────────────────────────────────────────────────────────────
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setScreenshot(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!originalBalance || !currentBalance) {
      alert("Original Balance and Current Balance are required.");
      return;
    }

    const trade: Trade = {
      id: isEdit ? existingTrade!.id : crypto.randomUUID(),
      datetime: new Date(datetime).toISOString(),
      asset,
      customAsset: asset === "Custom" ? customAsset : undefined,
      direction,
      lotSize: parseFloat(lotSize) || 1,
      originalBalance: origNum,
      currentBalance: currNum,
      entryPrice: parseFloat(entryPrice) || 0,
      exitPrice: parseFloat(exitPrice) || 0,
      pnlAmount,
      pnlPercent,
      result: pnlAmount >= 0 ? "win" : "loss",
      reasoning,
      reflection,
      screenshot,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      rulesFollowed,
    };

    if (isEdit) updateTrade(trade);
    else addTrade(trade);
    setLocation("/journal");
  };

  const toggleRule = (rule: string) => {
    setRulesFollowed(prev =>
      prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card className="bg-card border-border shadow-md">
        <CardHeader className="border-b border-border/50 pb-4">
          <CardTitle>{isEdit ? "Edit Trade" : "Log New Trade"}</CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* Row 1: Date · Asset · Direction */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date & Time</label>
                <Input
                  type="datetime-local"
                  value={datetime}
                  onChange={e => setDatetime(e.target.value)}
                  className="bg-input"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Market</label>
                <select
                  value={asset}
                  onChange={e => setAsset(e.target.value)}
                  className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none text-foreground"
                  data-testid="select-asset"
                >
                  {DERIV_MARKETS.map(group => (
                    <optgroup key={group.group} label={group.group}>
                      {group.items.map(item => (
                        <option key={item} value={item}>{item}</option>
                      ))}
                    </optgroup>
                  ))}
                  <optgroup label="Other">
                    <option value="Custom">Custom…</option>
                  </optgroup>
                </select>
                {asset === "Custom" && (
                  <Input
                    placeholder="Custom market name"
                    value={customAsset}
                    onChange={e => setCustomAsset(e.target.value)}
                    className="mt-2 bg-input"
                    required
                  />
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Direction</label>
                <div className="flex bg-input rounded-md p-1 border border-border">
                  <button
                    type="button"
                    data-testid="button-buy"
                    className={`flex-1 text-sm py-1.5 rounded transition-colors ${direction === "buy" ? "bg-success text-success-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setDirection("buy")}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    data-testid="button-sell"
                    className={`flex-1 text-sm py-1.5 rounded transition-colors ${direction === "sell" ? "bg-destructive text-destructive-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setDirection("sell")}
                  >
                    SELL
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: Entry · Exit · Lot Size · Original Balance */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Price ($)</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="Spot at entry"
                  value={entryPrice}
                  onChange={e => setEntryPrice(e.target.value)}
                  className="bg-input"
                  data-testid="input-entry-price"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exit Price ($)</label>
                <Input
                  type="number"
                  step="any"
                  placeholder="Spot at exit"
                  value={exitPrice}
                  onChange={e => setExitPrice(e.target.value)}
                  className="bg-input"
                  data-testid="input-exit-price"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Lot Size</label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="e.g. 1"
                  value={lotSize}
                  onChange={e => { setLotSize(e.target.value); setBalanceManual(false); }}
                  className="bg-input"
                  data-testid="input-lot-size"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Original Balance ($)</label>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Balance before trade"
                  value={originalBalance}
                  onChange={e => setOriginalBalance(e.target.value)}
                  className="bg-input"
                  data-testid="input-original-balance"
                  required
                />
              </div>
            </div>

            {/* Row 3: Current Balance (auto or manual) + P&L preview */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    Current Balance ($)
                    {isAutoCalcActive && (
                      <span className="ml-2 text-[10px] font-normal tracking-wide uppercase text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                        Auto
                      </span>
                    )}
                  </label>
                  {balanceManual && (
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors"
                      onClick={() => setBalanceManual(false)}
                    >
                      <RefreshCw className="w-3 h-3" />
                      Recalculate
                    </button>
                  )}
                </div>
                <Input
                  type="number"
                  step="any"
                  min="0"
                  placeholder="Balance after trade"
                  value={currentBalance}
                  onChange={e => { setCurrentBalance(e.target.value); setBalanceManual(true); }}
                  className={`bg-input ${isAutoCalcActive ? "text-primary" : ""}`}
                  data-testid="input-current-balance"
                  required
                />
              </div>

              <div className="space-y-2 md:pt-7">
                <div className="text-sm text-muted-foreground mb-1">P&L</div>
                <div className={`text-xl font-bold ${showPreview ? (pnlAmount >= 0 ? "text-success" : "text-destructive") : "text-muted-foreground"}`}>
                  {showPreview ? (
                    <>
                      {pnlAmount > 0 ? "+" : ""}${Math.abs(pnlAmount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-sm font-normal ml-2 opacity-80">
                        ({pnlPercent > 0 ? "+" : ""}{pnlPercent.toFixed(2)}%)
                      </span>
                    </>
                  ) : "—"}
                </div>
              </div>
            </div>

            {/* Text areas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reasoning (Why did I take this trade?)</label>
                <Textarea value={reasoning} onChange={e => setReasoning(e.target.value)} className="bg-input min-h-[80px]" data-testid="textarea-reasoning" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reflection (What would I do differently?)</label>
                <Textarea value={reflection} onChange={e => setReflection(e.target.value)} className="bg-input min-h-[80px]" data-testid="textarea-reflection" />
              </div>
            </div>

            {/* Rules checklist */}
            <div className="space-y-3 bg-secondary/20 p-4 rounded-lg border border-border">
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Which rules did you follow?</label>
                {ruleLines.length === 0 && (
                  <Button type="button" variant="link" size="sm" className="h-auto p-0 text-primary" onClick={() => setIsPanelOpen(true)}>
                    Add rules in panel →
                  </Button>
                )}
              </div>
              {ruleLines.length > 0 ? (
                <div className="space-y-2">
                  {ruleLines.map((rule, idx) => (
                    <label key={idx} className="flex items-start gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        className="mt-1 w-4 h-4 rounded border-border bg-input text-primary"
                        checked={rulesFollowed.includes(rule)}
                        onChange={() => toggleRule(rule)}
                      />
                      <span className="text-sm text-foreground group-hover:text-primary transition-colors">{rule}</span>
                    </label>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground italic">No trading rules configured.</p>
              )}
            </div>

            {/* Tags & screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. breakout, trend, news" className="bg-input" data-testid="input-tags" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Screenshot</label>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-input file:text-foreground file:bg-secondary file:border-0 file:rounded-md file:mr-4 file:px-3 file:py-1 cursor-pointer" data-testid="input-screenshot" />
                  {screenshot && (
                    <Button type="button" variant="destructive" size="sm" onClick={() => setScreenshot(undefined)}>Clear</Button>
                  )}
                </div>
                {screenshot && (
                  <div className="mt-2">
                    <img src={screenshot} alt="Preview" className="h-24 w-auto rounded border border-border object-cover" />
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-border/50 flex justify-end gap-4">
              <Button type="button" variant="ghost" onClick={() => setLocation("/journal")}>Cancel</Button>
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8" data-testid="button-submit">
                {isEdit ? "Update Trade" : "Log Trade"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
