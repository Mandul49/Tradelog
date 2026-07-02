export interface Trade {
  id: string;              // uuid
  datetime: string;        // ISO string
  asset: string;           // Deriv market name or "Custom"
  customAsset?: string;    // only when asset === "Custom"
  direction: "buy" | "sell";
  lotSize: number;         // contract/lot size
  originalBalance: number; // account balance before trade (USD)
  currentBalance: number;  // account balance after trade (USD)
  entryPrice: number;
  exitPrice: number;
  pnlAmount: number;       // (exitPrice - entryPrice) * lotSize (buy) or reversed (sell)
  pnlPercent: number;      // (pnlAmount / originalBalance) * 100
  result: "win" | "loss";
  reasoning: string;
  reflection: string;
  screenshot?: string;
  tags: string[];
  rulesFollowed: string[];
}
