import { useState, useCallback } from "react";
import { Trade } from "@/types";

const KEY = "trading-journal-trades";

/** Always read the freshest copy straight from localStorage */
function readStorage(): Trade[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Trade[]) : [];
  } catch {
    return [];
  }
}

/** Write synchronously — must complete before any navigation */
function writeStorage(trades: Trade[]): void {
  localStorage.setItem(KEY, JSON.stringify(trades));
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>(readStorage);

  const addTrade = useCallback((trade: Trade) => {
    // 1. Read freshest state (avoids stale closure)
    // 2. Write SYNCHRONOUSLY before any navigation happens
    // 3. Then update React state for immediate UI
    const next = [...readStorage(), trade];
    writeStorage(next);
    setTrades(next);
  }, []);

  const updateTrade = useCallback((updatedTrade: Trade) => {
    const next = readStorage().map(t =>
      t.id === updatedTrade.id ? updatedTrade : t
    );
    writeStorage(next);
    setTrades(next);
  }, []);

  const deleteTrade = useCallback((id: string) => {
    const next = readStorage().filter(t => t.id !== id);
    writeStorage(next);
    setTrades(next);
  }, []);

  return { trades, addTrade, updateTrade, deleteTrade };
}
