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
        "dua-card w-full text-left p-2 will-change-transform transition-all duration-200 hover:animate-enter hover:-translate-y-[1px] hover:shadow-card hover:shadow-[0_18px_45px_-28px_hsl(var(--dua-accent)/0.55)] active:animate-enter active:translate-y-0 active:shadow-[0_14px_34px_-24px_hsl(var(--dua-accent)/0.50)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dua-accent)/0.45)] md:p-4",
        className,
      )}
    >
      {/* Ultra-compact 4-column layout on mobile: no horizontal scroll, strong truncation */}
      <div className="grid grid-cols-[1fr_1fr_1fr_1.15fr] items-start gap-1 md:grid-cols-[1.1fr_1fr_1fr_1.4fr] md:gap-3">
          {/* Arabic */}
          <div className="min-w-0">
            <p className="sr-only md:not-sr-only md:text-[11px] md:font-medium md:text-[hsl(var(--dua-fg-soft))]">আরবি</p>
            <p className="font-arabic text-[15px] font-semibold leading-[1.75] text-[hsl(var(--dua-fg))] md:text-xl">
              {arabicName}
            </p>
            {(genderLabel || category) && (
              <div className="mt-0.5 hidden flex-wrap items-center gap-1 md:mt-2 md:flex">
                {genderLabel ? (
                  <Badge
                    variant="outline"
                    className="text-[9px] border-[hsl(var(--dua-fg)/0.18)] px-1.5 py-0 text-[hsl(var(--dua-fg-muted))] md:px-2 md:py-0.5 md:text-[11px]"
                  >
                    {genderLabel}
                  </Badge>
                ) : null}
                {category ? (
                  <Badge
                    variant="secondary"
                    className="text-[9px] bg-[hsl(var(--dua-accent)/0.18)] px-1.5 py-0 text-[hsl(var(--dua-accent))] md:px-2 md:py-0.5 md:text-[11px]"
                  >
                    {category}
                  </Badge>
                ) : null}
              </div>
            )}
          </div>

          {/* English */}
          <div className="min-w-0">
            <p className="sr-only md:not-sr-only md:text-[11px] md:font-medium md:text-[hsl(var(--dua-fg-soft))]">English</p>
            <p className="truncate text-[12px] font-semibold leading-[1.4] tracking-tight text-[hsl(var(--dua-fg))] md:text-base">
              {englishName}
            </p>
          </div>

          {/* Bangla */}
          <div className="min-w-0">
            <p className="sr-only md:not-sr-only md:text-[11px] md:font-medium md:text-[hsl(var(--dua-fg-soft))]">বাংলা</p>
            <p className="truncate text-[12px] font-medium leading-[1.4] text-[hsl(var(--dua-fg-muted))] md:text-base">
              {banglaName || "—"}
            </p>
          </div>

          {/* Meaning */}
          <div className="min-w-0">
            <p className="sr-only md:not-sr-only md:text-[11px] md:font-medium md:text-[hsl(var(--dua-fg-soft))]">অর্থ</p>
            <p className="line-clamp-1 text-[12px] font-medium leading-[1.4] text-[hsl(var(--dua-fg-muted))] md:line-clamp-2 md:text-base">
              {meaning || "—"}
            </p>
          </div>
        </div>
    </button>
  );
}
