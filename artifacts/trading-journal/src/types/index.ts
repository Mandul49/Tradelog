export interface Trade {
  id: string;              // uuid
  datetime: string;        // ISO string
  asset: string;           // Deriv market name or "Custom"
  customAsset?: string;    // only when asset === "Custom"
  direction: "buy" | "sell";
  originalBalance: number; // account balance before trade (USD)
  currentBalance: number;  // account balance after trade (USD)
  entryPrice: number;
  exitPrice: number;
  pnlAmount: number;       // currentBalance - originalBalance
  pnlPercent: number;      // (pnlAmount / originalBalance) * 100
  result: "win" | "loss";
  reasoning: string;
  reflection: string;
  screenshot?: string;
  tags: string[];
  rulesFollowed: string[];
}
