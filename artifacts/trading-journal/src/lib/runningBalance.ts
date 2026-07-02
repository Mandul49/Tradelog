import { Trade } from "@/types";

export interface TradeWithBalance extends Trade {
  balanceBefore: number;
  balanceAfter: number;
  pnlPercent: number;
}

/**
 * Sorts trades chronologically and threads the running balance chain.
 * balanceBefore[0] = openingBalance
 * balanceAfter[i]  = balanceBefore[i] + pnlAmount[i]
 * balanceBefore[i] = balanceAfter[i-1]
 * pnlPercent[i]    = (pnlAmount[i] / balanceBefore[i]) * 100
 */
export function computeRunningBalances(
  trades: Trade[],
  openingBalance: number
): TradeWithBalance[] {
  const sorted = [...trades].sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime()
  );
  let running = openingBalance;
  return sorted.map(trade => {
    const balanceBefore = running;
    const balanceAfter = running + trade.pnlAmount;
    const pnlPercent = balanceBefore !== 0 ? (trade.pnlAmount / balanceBefore) * 100 : 0;
    running = balanceAfter;
    return { ...trade, balanceBefore, balanceAfter, pnlPercent };
  });
}

export interface BalanceEntry {
  balanceBefore: number;
  balanceAfter: number;
  pnlPercent: number;
}

/**
 * Returns a map from trade ID → { balanceBefore, balanceAfter, pnlPercent }
 * for quick lookup when rendering a non-chronologically-sorted table.
 */
export function buildBalanceMap(
  trades: Trade[],
  openingBalance: number
): Map<string, BalanceEntry> {
  const withBalances = computeRunningBalances(trades, openingBalance);
  return new Map(
    withBalances.map(t => [
      t.id,
      { balanceBefore: t.balanceBefore, balanceAfter: t.balanceAfter, pnlPercent: t.pnlPercent },
    ])
  );
}
