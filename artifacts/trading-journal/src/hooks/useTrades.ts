import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { Trade } from "@/types";

type DbRow = Record<string, unknown>;

function rowToTrade(row: DbRow): Trade {
  return {
    id: row.id as string,
    datetime: row.datetime as string,
    asset: row.asset as string,
    customAsset: (row.custom_asset as string | null) ?? undefined,
    direction: row.direction as "buy" | "sell",
    lotSize: Number(row.lot_size),
    entryPrice: Number(row.entry_price),
    exitPrice: Number(row.exit_price),
    pnlAmount: Number(row.pnl_amount),
    result: row.result as "win" | "loss",
    reasoning: (row.reasoning as string) ?? "",
    reflection: (row.reflection as string) ?? "",
    screenshot: (row.screenshot as string | null) ?? undefined,
    tags: (row.tags as string[]) ?? [],
    rulesFollowed: (row.rules_followed as string[]) ?? [],
  };
}

function tradeToRow(trade: Trade, userId: string) {
  return {
    id: trade.id,
    user_id: userId,
    datetime: trade.datetime,
    asset: trade.asset,
    custom_asset: trade.customAsset ?? null,
    direction: trade.direction,
    lot_size: trade.lotSize,
    entry_price: trade.entryPrice,
    exit_price: trade.exitPrice,
    pnl_amount: trade.pnlAmount,
    result: trade.result,
    reasoning: trade.reasoning,
    reflection: trade.reflection,
    screenshot: trade.screenshot ?? null,
    tags: trade.tags,
    rules_followed: trade.rulesFollowed,
  };
}

export function useTrades() {
  const [trades, setTrades] = useState<Trade[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) { setLoading(false); return; }

      const { data, error } = await supabase
        .from("trades")
        .select("*")
        .order("datetime", { ascending: true });

      if (!cancelled) {
        if (!error && data) setTrades((data as DbRow[]).map(rowToTrade));
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  const addTrade = useCallback(async (trade: Trade): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from("trades").insert(tradeToRow(trade, user.id));
    if (error) { console.error("addTrade:", error.message); return false; }

    setTrades(prev => [...prev, trade]);
    return true;
  }, []);

  const updateTrade = useCallback(async (updatedTrade: Trade): Promise<boolean> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from("trades")
      .update(tradeToRow(updatedTrade, user.id))
      .eq("id", updatedTrade.id);

    if (error) { console.error("updateTrade:", error.message); return false; }

    setTrades(prev => prev.map(t => t.id === updatedTrade.id ? updatedTrade : t));
    return true;
  }, []);

  const deleteTrade = useCallback(async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("trades").delete().eq("id", id);
    if (error) { console.error("deleteTrade:", error.message); return false; }

    setTrades(prev => prev.filter(t => t.id !== id));
    return true;
  }, []);

  return { trades, loading, addTrade, updateTrade, deleteTrade };
}
