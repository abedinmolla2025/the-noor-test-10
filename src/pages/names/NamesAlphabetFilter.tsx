type Props = {
  activeLetter: string | null;
  /** Map of letter -> number of matches for current (non-alphabet) filters */
  counts: Record<string, number>;
  onChange: (letter: string | null) => void;
};

const LETTERS = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));

export function NamesAlphabetFilter({ activeLetter, counts, onChange }: Props) {
  return (
    <div className="dua-surface px-2 py-1.5 shadow-soft">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {LETTERS.map((l) => {
          const n = counts[l] ?? 0;
          const isActive = activeLetter === l;
          const isDisabled = n === 0;

          return (
            <button
              key={l}
              type="button"
              disabled={isDisabled}
              onClick={() => onChange(isActive ? null : l)}
              className={
                "h-8 w-8 shrink-0 rounded-full border text-[11px] font-semibold leading-none transition-colors " +
                (isDisabled
                  ? "border-[hsl(var(--dua-border))] text-[hsl(var(--dua-fg-soft))] opacity-35"
                  : isActive
                    ? "border-[hsl(var(--dua-accent)/0.40)] bg-[hsl(var(--dua-accent)/0.22)] text-[hsl(var(--dua-bg))]"
                    : "border-[hsl(var(--dua-border))] bg-[hsl(var(--dua-header)/0.35)] text-[hsl(var(--dua-fg-soft))] hover:bg-[hsl(var(--dua-header)/0.55)]")
              }
              aria-pressed={isActive}
              aria-label={`Filter by letter ${l}`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
