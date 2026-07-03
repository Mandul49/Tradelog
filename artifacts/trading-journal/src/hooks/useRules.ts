import { useState, useCallback, useMemo, useContext, createContext } from "react";

const RULES_STORAGE_KEY = "trading-rules";

interface RulesContextValue {
  rulesText: string;
  setRulesText: (text: string) => void;
  ruleLines: string[];
  isPanelOpen: boolean;
  setIsPanelOpen: (open: boolean) => void;
}

export const RulesContext = createContext<RulesContextValue | null>(null);

export function useRulesState(): RulesContextValue {
  const [rulesText, setRulesTextState] = useState<string>(
    () => localStorage.getItem(RULES_STORAGE_KEY) ?? ""
  );
  const [isPanelOpen, setIsPanelOpenState] = useState(false);

  const setRulesText = useCallback((text: string) => {
    setRulesTextState(text);
    localStorage.setItem(RULES_STORAGE_KEY, text);
  }, []);

  const setIsPanelOpen = useCallback((open: boolean) => {
    setIsPanelOpenState(open);
  }, []);

  const ruleLines = useMemo(
    () =>
      rulesText
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0),
    [rulesText]
  );

  return { rulesText, setRulesText, ruleLines, isPanelOpen, setIsPanelOpen };
}

export function useRules(): RulesContextValue {
  const ctx = useContext(RulesContext);
  if (!ctx) throw new Error("useRules must be used inside RulesProvider");
  return ctx;
}
