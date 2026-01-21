import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  arabicName: string;
  englishName: string;
  banglaName?: string;
  meaning?: string;
  category?: string;
  genderLabel?: string;
  onClick?: () => void;
  className?: string;
};

export default function NameTableRow({
  arabicName,
  englishName,
  banglaName,
  meaning,
  category,
  genderLabel,
  onClick,
  className,
}: Props) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "dua-card w-full text-left p-4 transition-all hover:-translate-y-[1px] hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dua-accent)/0.45)]",
        className,
      )}
    >
      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_1fr_1.2fr] sm:items-start">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">আরবি</p>
          <p className="truncate font-arabic text-xl leading-snug text-[hsl(var(--dua-fg))]">
            {arabicName}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">English</p>
          <p className="truncate text-base font-semibold tracking-tight text-[hsl(var(--dua-fg))]">
            {englishName}
          </p>
        </div>

        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">বাংলা</p>
          <p className="truncate text-base text-[hsl(var(--dua-fg-muted))]">
            {banglaName || "—"}
          </p>
        </div>

        <div className="min-w-0">
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">অর্থ</p>
            {(genderLabel || category) && (
              <div className="-mt-0.5 shrink-0 flex flex-wrap items-center justify-end gap-1">
                {genderLabel ? (
                  <Badge
                    variant="outline"
                    className="text-[11px] border-[hsl(var(--dua-fg)/0.18)] text-[hsl(var(--dua-fg-muted))]"
                  >
                    {genderLabel}
                  </Badge>
                ) : null}
                {category ? (
                  <Badge
                    variant="secondary"
                    className="text-[11px] bg-[hsl(var(--dua-accent)/0.18)] text-[hsl(var(--dua-accent))]"
                  >
                    {category}
                  </Badge>
                ) : null}
              </div>
            )}
          </div>
          <p className="line-clamp-2 text-base leading-relaxed text-[hsl(var(--dua-fg-muted))]">
            {meaning || "—"}
          </p>
        </div>
      </div>
    </button>
  );
}
