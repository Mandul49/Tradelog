import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { useTrades } from "@/hooks/useTrades";
import { useRules } from "@/hooks/useRules";
import { Trade } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default function LogTrade() {
  const params = useParams();
  const [, setLocation] = useLocation();
  const { trades, addTrade, updateTrade } = useTrades();
  const { ruleLines, setIsPanelOpen } = useRules();

  const isEdit = !!params.id;
  const existingTrade = isEdit ? trades.find(t => t.id === params.id) : null;

  const [datetime, setDatetime] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  });
  const [asset, setAsset] = useState<Trade["asset"]>("Vol 75");
  const [customAsset, setCustomAsset] = useState("");
  const [direction, setDirection] = useState<Trade["direction"]>("buy");
  const [stake, setStake] = useState<string>("");
  const [entryPrice, setEntryPrice] = useState<string>("");
  const [exitPrice, setExitPrice] = useState<string>("");
  const [reasoning, setReasoning] = useState("");
  const [reflection, setReflection] = useState("");
  const [tags, setTags] = useState("");
  const [screenshot, setScreenshot] = useState<string | undefined>();
  const [rulesFollowed, setRulesFollowed] = useState<string[]>([]);

  useEffect(() => {
    if (existingTrade) {
      setDatetime(existingTrade.datetime.slice(0, 16));
      setAsset(existingTrade.asset);
      setCustomAsset(existingTrade.customAsset || "");
      setDirection(existingTrade.direction);
      setStake(existingTrade.stake.toString());
      setEntryPrice(existingTrade.entryPrice.toString());
      setExitPrice(existingTrade.exitPrice.toString());
      setReasoning(existingTrade.reasoning);
      setReflection(existingTrade.reflection);
      setTags(existingTrade.tags.join(", "));
      setScreenshot(existingTrade.screenshot);
      setRulesFollowed(existingTrade.rulesFollowed || []);
    }
  }, [existingTrade]);

  // Calculations
  const stakeNum = parseFloat(stake) || 0;
  const entryNum = parseFloat(entryPrice) || 0;
  const exitNum = parseFloat(exitPrice) || 0;
  
  let pnlAmount = 0;
  let pnlPercent = 0;

  if (entryNum > 0) {
    if (direction === "buy") {
      pnlAmount = ((exitNum - entryNum) / entryNum) * stakeNum;
      pnlPercent = ((exitNum - entryNum) / entryNum) * 100;
    } else {
      pnlAmount = ((entryNum - exitNum) / entryNum) * stakeNum;
      pnlPercent = ((entryNum - exitNum) / entryNum) * 100;
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stake || !entryPrice || !exitPrice) {
      alert("Stake, Entry, and Exit prices are required.");
      return;
    }

    const trade: Trade = {
      id: isEdit ? existingTrade!.id : crypto.randomUUID(),
      datetime: new Date(datetime).toISOString(),
      asset,
      customAsset: asset === "Custom" ? customAsset : undefined,
      direction,
      stake: stakeNum,
      entryPrice: entryNum,
      exitPrice: exitNum,
      pnlAmount,
      pnlPercent,
      result: pnlAmount > 0 ? "win" : "loss",
      reasoning,
      reflection,
      screenshot,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      rulesFollowed
    };

    if (isEdit) {
      updateTrade(trade);
    } else {
      addTrade(trade);
    }
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
            
            {/* Top Row: Date, Asset, Direction */}
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
                <label className="text-sm font-medium">Asset</label>
                <select 
                  value={asset} 
                  onChange={e => setAsset(e.target.value as Trade["asset"])}
                  className="w-full bg-input border border-border rounded-md px-3 py-2 text-sm focus:border-primary outline-none"
                >
                  <option value="Vol 50">Vol 50</option>
                  <option value="Vol 75">Vol 75</option>
                  <option value="Vol 75 1s">Vol 75 1s</option>
                  <option value="Custom">Custom</option>
                </select>
                {asset === "Custom" && (
                  <Input 
                    placeholder="Custom asset name" 
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
                    className={`flex-1 text-sm py-1.5 rounded transition-colors ${direction === "buy" ? "bg-success text-success-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setDirection("buy")}
                  >
                    BUY
                  </button>
                  <button
                    type="button"
                    className={`flex-1 text-sm py-1.5 rounded transition-colors ${direction === "sell" ? "bg-destructive text-destructive-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}
                    onClick={() => setDirection("sell")}
                  >
                    SELL
                  </button>
                </div>
              </div>
            </div>

            {/* Financials Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
              <div className="space-y-2">
                <label className="text-sm font-medium">Stake (₦)</label>
                <Input type="number" step="any" min="0" value={stake} onChange={e => setStake(e.target.value)} className="bg-input" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Entry Price</label>
                <Input type="number" step="any" value={entryPrice} onChange={e => setEntryPrice(e.target.value)} className="bg-input" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Exit Price</label>
                <Input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)} className="bg-input" required />
              </div>
              <div className="space-y-2 md:pt-7">
                <div className="text-sm text-muted-foreground mb-1">Live P&L Preview</div>
                <div className={`text-lg font-bold ${(entryPrice && exitPrice && stake) ? (pnlAmount >= 0 ? "text-success" : "text-destructive") : "text-muted-foreground"}`}>
                  {(entryPrice && exitPrice && stake) ? (
                    <>
                      {pnlAmount > 0 ? "+" : ""}₦{pnlAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      <span className="text-sm font-normal ml-2 opacity-80">
                        ({pnlPercent > 0 ? "+" : ""}{pnlPercent.toFixed(2)}%)
                      </span>
                    </>
                  ) : "—"}
                </div>
              </div>
            </div>

            {/* Text Areas */}
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Reasoning (Why did I take this trade?)</label>
                <Textarea value={reasoning} onChange={e => setReasoning(e.target.value)} className="bg-input min-h-[80px]" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Reflection (What would I do differently?)</label>
                <Textarea value={reflection} onChange={e => setReflection(e.target.value)} className="bg-input min-h-[80px]" />
              </div>
            </div>

            {/* Rules Followed */}
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
                        className="mt-1 w-4 h-4 rounded border-border bg-input text-primary focus:ring-primary focus:ring-offset-background"
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

            {/* Extra Row: Tags, Screenshot */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tags (comma-separated)</label>
                <Input value={tags} onChange={e => setTags(e.target.value)} placeholder="e.g. breakout, trend, news" className="bg-input" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Screenshot</label>
                <div className="flex items-center gap-4">
                  <Input type="file" accept="image/*" onChange={handleImageUpload} className="bg-input file:text-foreground file:bg-secondary file:border-0 file:rounded-md file:mr-4 file:px-3 file:py-1 cursor-pointer" />
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
              <Button type="submit" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                {isEdit ? "Update Trade" : "Log Trade"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
