import { useState } from "react";

const KEY = "trading-journal-opening-balance";

export function useOpeningBalance() {
  const [openingBalance, setOpeningBalance] = useState<number>(() => {
    const stored = localStorage.getItem(KEY);
    return stored ? parseFloat(stored) : 0;
  });

  const updateOpeningBalance = (val: number) => {
    setOpeningBalance(val);
    localStorage.setItem(KEY, val.toString());
  };

  return { openingBalance, updateOpeningBalance };
}
