import { Trade } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";

export function TradeDetailModal({ trade, open, onOpenChange }: { trade: Trade | null; open: boolean; onOpenChange: (open: boolean) => void }) {
  if (!trade) return null;

  const fmt = (n: number) =>
    `$${Math.abs(n).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-card border-border text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Trade Details</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4 text-sm mt-4">
          <div>
            <div className="text-muted-foreground">Date / Time</div>
            <div>{new Date(trade.datetime).toLocaleString()}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Asset</div>
            <div>{trade.asset === "Custom" ? trade.customAsset : trade.asset}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Direction</div>
            <div className="capitalize">{trade.direction}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Result</div>
            <Badge variant={trade.result === "win" ? "default" : "destructive"} className={trade.result === "win" ? "bg-success hover:bg-success text-success-foreground" : ""}>
              {trade.result.toUpperCase()}
            </Badge>
          </div>
          <div>
            <div className="text-muted-foreground">Original Balance</div>
            <div>{fmt(trade.originalBalance)}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Current Balance</div>
            <div className={trade.currentBalance >= trade.originalBalance ? "text-success font-semibold" : "text-destructive font-semibold"}>
              {fmt(trade.currentBalance)}
            </div>
          </div>
          <div>
            <div className="text-muted-foreground">Entry Price</div>
            <div>{trade.entryPrice ? `$${trade.entryPrice}` : "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Exit Price</div>
            <div>{trade.exitPrice ? `$${trade.exitPrice}` : "—"}</div>
          </div>
          <div>
            <div className="text-muted-foreground">Lot Size</div>
            <div>{trade.lotSize ?? "—"}</div>
          </div>
          <div className="col-span-2">
            <div className="text-muted-foreground">P&L</div>
            <div className={`font-semibold ${trade.pnlAmount >= 0 ? "text-success" : "text-destructive"}`}>
              {trade.pnlAmount > 0 ? "+" : "-"}{fmt(trade.pnlAmount)} ({trade.pnlPercent > 0 ? "+" : ""}{trade.pnlPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          <div>
            <div className="text-muted-foreground text-sm mb-1">Reasoning</div>
            <div className="bg-input p-3 rounded-md text-sm border border-border">{trade.reasoning || "None"}</div>
          </div>
          <div>
            <div className="text-muted-foreground text-sm mb-1">Reflection</div>
            <div className="bg-input p-3 rounded-md text-sm border border-border">{trade.reflection || "None"}</div>
          </div>

          {trade.rulesFollowed && trade.rulesFollowed.length > 0 && (
            <div>
              <div className="text-muted-foreground text-sm mb-1">Rules Followed</div>
              <ul className="list-disc pl-5 text-sm space-y-1">
                {trade.rulesFollowed.map((r, i) => <li key={i}>{r}</li>)}
              </ul>
            </div>
          )}

          {trade.tags && trade.tags.length > 0 && (
            <div>
              <div className="text-muted-foreground text-sm mb-1">Tags</div>
              <div className="flex gap-2 flex-wrap">
                {trade.tags.map((tag, i) => <Badge key={i} variant="secondary" className="bg-secondary text-secondary-foreground">{tag}</Badge>)}
              </div>
            </div>
          )}

          {trade.screenshot && (
            <div>
              <div className="text-muted-foreground text-sm mb-1">Screenshot</div>
              <img src={trade.screenshot} alt="Trade Screenshot" className="max-w-full h-auto rounded-md border border-border" />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
