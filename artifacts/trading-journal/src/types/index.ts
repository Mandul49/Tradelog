export interface Trade {
  id: string;              // uuid
  datetime: string;        // ISO string
  asset: "Vol 50" | "Vol 75" | "Vol 75 1s" | "Custom";
  customAsset?: string;
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
