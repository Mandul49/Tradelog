import { useState, useRef, useEffect, KeyboardEvent } from "react";
import { X, Plus, Trash2, GripVertical, Check, Pencil } from "lucide-react";
import { useRules } from "@/hooks/useRules";
import { Button } from "@/components/ui/button";

export function RulesPanel() {
  const { ruleLines, setRulesText, isPanelOpen, setIsPanelOpen } = useRules();

  // Local copy so edits are instant; sync back to hook (and localStorage) on every change
  const [rules, setRules] = useState<string[]>(ruleLines);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const [addingNew, setAddingNew] = useState(false);
  const [newValue, setNewValue] = useState("");
  const editRef = useRef<HTMLInputElement>(null);
  const addRef = useRef<HTMLInputElement>(null);

  // Keep local list in sync when panel opens (picks up external changes)
  useEffect(() => {
    if (isPanelOpen) setRules(ruleLines);
  }, [isPanelOpen]); // eslint-disable-line react-hooks/exhaustive-deps

  const persist = (updated: string[]) => {
    setRules(updated);
    setRulesText(updated.join("\n"));
  };

  // ── Edit existing ──────────────────────────────────────────────────────────
  const startEdit = (index: number) => {
    setEditingIndex(index);
    setEditValue(rules[index]);
    setTimeout(() => editRef.current?.focus(), 0);
  };

  const commitEdit = () => {
    if (editingIndex === null) return;
    const trimmed = editValue.trim();
    if (trimmed) {
      const updated = rules.map((r, i) => (i === editingIndex ? trimmed : r));
      persist(updated);
    } else {
      // Empty string = delete
      persist(rules.filter((_, i) => i !== editingIndex));
    }
    setEditingIndex(null);
    setEditValue("");
  };

  const cancelEdit = () => {
    setEditingIndex(null);
    setEditValue("");
  };

  const handleEditKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitEdit();
    if (e.key === "Escape") cancelEdit();
  };

  // ── Add new ────────────────────────────────────────────────────────────────
  const startAdd = () => {
    setAddingNew(true);
    setNewValue("");
    setTimeout(() => addRef.current?.focus(), 0);
  };

  const commitAdd = () => {
    const trimmed = newValue.trim();
    if (trimmed) persist([...rules, trimmed]);
    setAddingNew(false);
    setNewValue("");
  };

  const cancelAdd = () => {
    setAddingNew(false);
    setNewValue("");
  };

  const handleAddKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") commitAdd();
    if (e.key === "Escape") cancelAdd();
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const deleteRule = (index: number) => {
    persist(rules.filter((_, i) => i !== index));
    if (editingIndex === index) cancelEdit();
  };

  if (!isPanelOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[360px] bg-card border-l border-border shadow-2xl z-50 flex flex-col">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0">
        <div>
          <h2 className="font-semibold text-foreground text-base">Trading Rules</h2>
          <p className="text-xs text-muted-foreground mt-0.5">{rules.length} rule{rules.length !== 1 ? "s" : ""}</p>
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsPanelOpen(false)}>
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Rule list */}
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {rules.length === 0 && !addingNew && (
          <div className="flex flex-col items-center justify-center h-32 text-center">
            <p className="text-muted-foreground text-sm">No rules yet.</p>
            <p className="text-muted-foreground text-xs mt-1">Click "Add Rule" to get started.</p>
          </div>
        )}

        {rules.map((rule, i) => (
          <div
            key={i}
            className={`group flex items-start gap-2 rounded-lg border px-3 py-2.5 transition-colors ${
              editingIndex === i
                ? "border-primary bg-secondary/30"
                : "border-border bg-secondary/20 hover:border-border/80 hover:bg-secondary/30"
            }`}
          >
            {/* Index badge */}
            <span className="mt-0.5 w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
              {i + 1}
            </span>

            {editingIndex === i ? (
              /* Inline edit */
              <div className="flex-1 flex items-center gap-2">
                <input
                  ref={editRef}
                  value={editValue}
                  onChange={e => setEditValue(e.target.value)}
                  onKeyDown={handleEditKey}
                  onBlur={commitEdit}
                  className="flex-1 bg-transparent text-sm text-foreground outline-none border-b border-primary pb-0.5"
                  data-testid={`input-edit-rule-${i}`}
                />
                <button onClick={commitEdit} className="text-success hover:text-success/80 shrink-0">
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Display */
              <>
                <span
                  className="flex-1 text-sm text-foreground leading-snug cursor-pointer"
                  onClick={() => startEdit(i)}
                  data-testid={`rule-item-${i}`}
                >
                  {rule}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                  <button
                    onClick={() => startEdit(i)}
                    className="text-muted-foreground hover:text-foreground p-0.5 rounded transition-colors"
                    title="Edit rule"
                    data-testid={`button-edit-rule-${i}`}
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => deleteRule(i)}
                    className="text-muted-foreground hover:text-destructive p-0.5 rounded transition-colors"
                    title="Delete rule"
                    data-testid={`button-delete-rule-${i}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </>
            )}
          </div>
        ))}

        {/* New rule input */}
        {addingNew && (
          <div className="flex items-center gap-2 rounded-lg border border-primary bg-secondary/30 px-3 py-2.5">
            <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center shrink-0">
              {rules.length + 1}
            </span>
            <input
              ref={addRef}
              value={newValue}
              onChange={e => setNewValue(e.target.value)}
              onKeyDown={handleAddKey}
              onBlur={commitAdd}
              placeholder="Type rule and press Enter…"
              className="flex-1 bg-transparent text-sm text-foreground outline-none border-b border-primary pb-0.5 placeholder:text-muted-foreground"
              data-testid="input-new-rule"
            />
            <button onClick={commitAdd} className="text-success hover:text-success/80 shrink-0">
              <Check className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-border shrink-0">
        <button
          onClick={startAdd}
          disabled={addingNew}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary hover:bg-secondary/30 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          data-testid="button-add-rule"
        >
          <Plus className="w-4 h-4" />
          Add Rule
        </button>
      </div>
    </div>
  );
}
