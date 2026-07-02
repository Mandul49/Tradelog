import { useState, useCallback } from "react";
import { Trade } from "@/types";

const TRADES_STORAGE_KEY = "trading-journal-trades";

function loadFromStorage(): Trade[] {
  try {
    const raw = localStorage.getItem(TRADES_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Trade[]) : [];
  } catch {
    return [];
  }
}

export function useTrades() {
  // Synchronous init — no async useEffect, no stale-closure window
  const [trades, setTrades] = useState<Trade[]>(loadFromStorage);

  const addTrade = useCallback((trade: Trade) => {
    setTrades(prev => {
      const next = [...prev, trade];
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateTrade = useCallback((updatedTrade: Trade) => {
    setTrades(prev => {
      const next = prev.map(t => (t.id === updatedTrade.id ? updatedTrade : t));
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const deleteTrade = useCallback((id: string) => {
    setTrades(prev => {
      const next = prev.filter(t => t.id !== id);
      localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { trades, addTrade, updateTrade, deleteTrade };
}
