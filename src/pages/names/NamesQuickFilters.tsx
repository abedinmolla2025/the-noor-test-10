type FilterKey = "all" | "boy" | "girl" | "unisex" | "quranic" | "popular" | "short";

const FILTERS: ReadonlyArray<readonly [FilterKey, string]> = [
  ["all", "All"],
  ["boy", "Boy"],
  ["girl", "Girl"],
  ["unisex", "Unisex"],
] as const;

type Props = {
  active: FilterKey;
  onChange: (key: FilterKey) => void;
};

export function NamesQuickFilters({ active, onChange }: Props) {
  return (
    <div className="dua-surface p-2 shadow-soft">
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {FILTERS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            className={`dua-chip shrink-0 ${active === key ? "dua-chip-active" : ""}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}
