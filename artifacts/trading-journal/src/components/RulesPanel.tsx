import { useEffect, useState, useRef } from "react";
import { X } from "lucide-react";
import { useRules } from "@/hooks/useRules";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function RulesPanel() {
  const { rulesText, setRulesText, isPanelOpen, setIsPanelOpen } = useRules();
  const [localText, setLocalText] = useState(rulesText);
  const [showSaved, setShowSaved] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalText(rulesText);
  }, [rulesText]);

  useEffect(() => {
    if (localText !== rulesText) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        setRulesText(localText);
        setShowSaved(true);
        setTimeout(() => setShowSaved(false), 2000);
      }, 500);
    }
  }, [localText, rulesText, setRulesText]);

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[340px] bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="font-semibold text-foreground">Trading Plan & Rules</h2>
        <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
          <X className="w-4 h-4 text-foreground" />
        </Button>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <Textarea 
          className="flex-1 resize-none bg-input text-foreground border-border" 
          placeholder="Write your trading rules here. One rule per line..."
          value={localText}
          onChange={e => setLocalText(e.target.value)}
        />
        <div className="h-6 mt-2 flex items-center justify-end text-xs text-muted-foreground">
          {showSaved && <span className="text-success">Saved</span>}
        </div>
      </div>
    </div>
  );
}
