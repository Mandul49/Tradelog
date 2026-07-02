import { useState, useEffect, useCallback } from "react";
import { Trade } from "@/types";

const TRADES_STORAGE_KEY = "trading-journal-trades";

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);

  useEffect(() => {
    const stored = localStorage.getItem(TRADES_STORAGE_KEY);
    if (stored) {
      try {
        setTrades(JSON.parse(stored));
      } catch (e) {
        console.error("Failed to parse trades from localStorage", e);
      }
    }
  }, []);

  const saveTrades = useCallback((newTrades: Trade[]) => {
    setTrades(newTrades);
    localStorage.setItem(TRADES_STORAGE_KEY, JSON.stringify(newTrades));
  }, []);

  const addTrade = useCallback((trade: Trade) => {
    saveTrades([...trades, trade]);
  }, [trades, saveTrades]);

  const updateTrade = useCallback((updatedTrade: Trade) => {
    saveTrades(trades.map(t => t.id === updatedTrade.id ? updatedTrade : t));
  }, [trades, saveTrades]);

  const deleteTrade = useCallback((id: string) => {
    saveTrades(trades.filter(t => t.id !== id));
  }, [trades, saveTrades]);

  return { trades, addTrade, updateTrade, deleteTrade };
}
