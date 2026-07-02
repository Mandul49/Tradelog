export interface Trade {
  id: string;              // uuid
  datetime: string;        // ISO string
  asset: "Vol 50" | "Vol 75" | "Vol 75 1s" | "Custom";
  customAsset?: string;
  direction: "buy" | "sell";
  stake: number;           // ₦ amount
  entryPrice: number;
  exitPrice: number;
  pnlAmount: number;
  pnlPercent: number;
  result: "win" | "loss";
  reasoning: string;
  reflection: string;
  screenshot?: string;
  tags: string[];
  rulesFollowed: string[];
}
