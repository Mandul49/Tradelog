import { Trade } from "@/types";

export interface TradeWithBalance extends Trade {
  balanceBefore: number;
  balanceAfter: number;
}

/**
 * Sorts trades chronologically and threads the running balance chain.
 * balanceBefore[0] = openingBalance
 * balanceAfter[i]  = balanceBefore[i] + pnlAmount[i]
 * balanceBefore[i] = balanceAfter[i-1]
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
    running = balanceAfter;
    return { ...trade, balanceBefore, balanceAfter };
  });
}

/**
 * Returns a map from trade ID → { balanceBefore, balanceAfter }
 * for quick lookup when rendering a non-chronologically-sorted table.
 */
export function buildBalanceMap(
  trades: Trade[],
  openingBalance: number
): Map<string, { balanceBefore: number; balanceAfter: number }> {
  const withBalances = computeRunningBalances(trades, openingBalance);
  return new Map(withBalances.map(t => [t.id, { balanceBefore: t.balanceBefore, balanceAfter: t.balanceAfter }]));
}
