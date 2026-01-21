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
      {/* Keep everything side-by-side; on small screens allow horizontal scroll instead of stacking */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[44rem] gap-3 md:min-w-0 md:grid-cols-[1.1fr_1fr_1fr_1.4fr] md:items-start">
          {/* Arabic */}
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">আরবি</p>
            <p className="font-arabic text-lg leading-[1.9] text-[hsl(var(--dua-fg))] md:text-xl">
              {arabicName}
            </p>
            {(genderLabel || category) && (
              <div className="mt-2 flex flex-wrap items-center gap-1">
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

          {/* English */}
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">English</p>
            <p className="truncate text-base font-semibold tracking-tight text-[hsl(var(--dua-fg))]">
              {englishName}
            </p>
          </div>

          {/* Bangla */}
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">বাংলা</p>
            <p className="truncate text-base text-[hsl(var(--dua-fg-muted))]">
              {banglaName || "—"}
            </p>
          </div>

          {/* Meaning */}
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">অর্থ</p>
            <p className="line-clamp-2 text-base leading-relaxed text-[hsl(var(--dua-fg-muted))]">
              {meaning || "—"}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
