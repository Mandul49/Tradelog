import { useState, useCallback, useMemo } from "react";

const RULES_STORAGE_KEY = "trading-rules";
const PANEL_STORAGE_KEY = "rules-panel-open";

export function useRules() {
  // Synchronous init — consistent with useTrades, no useEffect needed
  const [rulesText, setRulesText] = useState<string>(
    () => localStorage.getItem(RULES_STORAGE_KEY) ?? ""
  );
  const [isPanelOpen, setIsPanelOpen] = useState<boolean>(
    () => localStorage.getItem(PANEL_STORAGE_KEY) === "true"
  );

  const handleSetRulesText = useCallback((text: string) => {
    setRulesText(text);
    localStorage.setItem(RULES_STORAGE_KEY, text);
  }, []);

  const handleSetPanelOpen = useCallback((open: boolean) => {
    setIsPanelOpen(open);
    localStorage.setItem(PANEL_STORAGE_KEY, open ? "true" : "false");
  }, []);

  const ruleLines = useMemo(
    () =>
      rulesText
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0),
    [rulesText]
  );

  return {
    rulesText,
    setRulesText: handleSetRulesText,
    ruleLines,
    isPanelOpen,
    setIsPanelOpen: handleSetPanelOpen,
  };
}
