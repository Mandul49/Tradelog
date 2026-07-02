export interface Trade {
  id: string;              // uuid
  datetime: string;        // ISO string
  asset: string;           // Deriv market name or "Custom"
  customAsset?: string;    // only when asset === "Custom"
  direction: "buy" | "sell";
  lotSize: number;
  entryPrice: number;
  exitPrice: number;
  pnlAmount: number;       // (exitPrice - entryPrice) * lotSize (buy) or reversed (sell)
  result: "win" | "loss";
  reasoning: string;
  reflection: string;
  screenshot?: string;
  tags: string[];
  rulesFollowed: string[];
}
