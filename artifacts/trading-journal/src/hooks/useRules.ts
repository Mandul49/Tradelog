import { useState, useEffect, useCallback, useMemo } from "react";

const RULES_STORAGE_KEY = "trading-rules";
const PANEL_STORAGE_KEY = "rules-panel-open";

export function useRules() {
  const [rulesText, setRulesText] = useState("");
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  useEffect(() => {
    const storedRules = localStorage.getItem(RULES_STORAGE_KEY);
    if (storedRules) {
      setRulesText(storedRules);
    }

    const storedPanel = localStorage.getItem(PANEL_STORAGE_KEY);
    if (storedPanel === "true") {
      setIsPanelOpen(true);
    }
  }, []);

  const handleSetRulesText = useCallback((text: string) => {
    setRulesText(text);
    localStorage.setItem(RULES_STORAGE_KEY, text);
  }, []);

  const handleSetPanelOpen = useCallback((open: boolean) => {
    setIsPanelOpen(open);
    localStorage.setItem(PANEL_STORAGE_KEY, open ? "true" : "false");
  }, []);

  const ruleLines = useMemo(() => {
    return rulesText
      .split("\n")
      .map(line => line.trim())
      .filter(line => line.length > 0);
  }, [rulesText]);

  return {
    rulesText,
    setRulesText: handleSetRulesText,
    ruleLines,
    isPanelOpen,
    setIsPanelOpen: handleSetPanelOpen
  };
}
