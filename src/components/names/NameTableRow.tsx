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
        "dua-card w-full text-left p-2 transition-all hover:-translate-y-[1px] hover:shadow-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dua-accent)/0.45)] md:p-4",
        className,
      )}
    >
      {/* Keep everything side-by-side; on small screens allow horizontal scroll instead of stacking */}
      <div className="overflow-x-auto">
        <div className="grid min-w-[32rem] grid-cols-[1.1fr_1fr_1fr_1.4fr] items-start gap-1.5 md:min-w-0 md:gap-3">
          {/* Arabic */}
          <div className="min-w-0">
            <p className="sr-only">আরবি</p>
            <p className="hidden text-[11px] font-medium text-[hsl(var(--dua-fg-soft))] md:block">আরবি</p>
            <p className="font-arabic text-sm leading-[1.9] text-[hsl(var(--dua-fg))] md:text-xl">
              {arabicName}
            </p>
            {(genderLabel || category) && (
              <div className="mt-1 flex flex-wrap items-center gap-1 md:mt-2">
                {genderLabel ? (
                  <Badge
                    variant="outline"
                    className="px-1.5 py-0 text-[10px] border-[hsl(var(--dua-fg)/0.18)] text-[hsl(var(--dua-fg-muted))] md:px-2 md:py-0.5 md:text-[11px]"
                  >
                    {genderLabel}
                  </Badge>
                ) : null}
                {category ? (
                  <Badge
                    variant="secondary"
                    className="px-1.5 py-0 text-[10px] bg-[hsl(var(--dua-accent)/0.18)] text-[hsl(var(--dua-accent))] md:px-2 md:py-0.5 md:text-[11px]"
                  >
                    {category}
                  </Badge>
                ) : null}
              </div>
            )}
          </div>

          {/* English */}
          <div className="min-w-0">
            <p className="sr-only">English</p>
            <p className="hidden text-[11px] font-medium text-[hsl(var(--dua-fg-soft))] md:block">English</p>
            <p className="truncate text-xs font-semibold tracking-tight text-[hsl(var(--dua-fg))] md:text-base">
              {englishName}
            </p>
          </div>

          {/* Bangla */}
          <div className="min-w-0">
            <p className="sr-only">বাংলা</p>
            <p className="hidden text-[11px] font-medium text-[hsl(var(--dua-fg-soft))] md:block">বাংলা</p>
            <p className="truncate text-xs text-[hsl(var(--dua-fg-muted))] md:text-base">
              {banglaName || "—"}
            </p>
          </div>

          {/* Meaning */}
          <div className="min-w-0">
            <p className="sr-only">অর্থ</p>
            <p className="hidden text-[11px] font-medium text-[hsl(var(--dua-fg-soft))] md:block">অর্থ</p>
            <p className="line-clamp-1 text-xs leading-relaxed text-[hsl(var(--dua-fg-muted))] md:line-clamp-2 md:text-base">
              {meaning || "—"}
            </p>
          </div>
        </div>
      </div>
    </button>
  );
}
