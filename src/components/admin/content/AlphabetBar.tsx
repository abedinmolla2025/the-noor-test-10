import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export function AlphabetBar({
  value,
  onChange,
  enabledCounts,
}: {
  value: string | null;
  onChange: (v: string | null) => void;
  enabledCounts: Record<string, number>; // e.g. { A: 12, B: 0 }
}) {
  return (
    <div
      className="-mx-1 flex w-[calc(100%+0.5rem)] gap-1 overflow-x-auto px-1 pb-1 [-webkit-overflow-scrolling:touch]"
      aria-label="Alphabet filter"
    >
      {LETTERS.map((l) => {
        const count = enabledCounts[l] ?? 0;
        const isActive = value === l;
        const isEnabled = count > 0;
        return (
          <Button
            key={l}
            type="button"
            size="sm"
            variant={isActive ? "secondary" : "ghost"}
            className={cn(
              "h-7 w-7 shrink-0 rounded-full p-0 text-[11px]",
              !isActive && "text-muted-foreground",
              !isEnabled && "opacity-40 pointer-events-none",
            )}
            onClick={() => onChange(isActive ? null : l)}
            aria-pressed={isActive}
            aria-disabled={!isEnabled}
            title={!isEnabled ? "No names" : undefined}
          >
            {l}
          </Button>
        );
      })}
    </div>
  );
}
