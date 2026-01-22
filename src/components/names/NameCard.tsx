import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { UserRound } from "lucide-react";

export type NameCardModel = {
  id: string;
  title: string;
  title_arabic: string | null;
  bn_name?: string;
  meaning_bn?: string | null;
  meaning_en?: string | null;
  meaning_ar?: string | null;
  gender?: string | null;
  category?: string | null;
  origin?: string;
  source?: string;
};

type Props = {
  name: NameCardModel;
  onClick: () => void;
  className?: string;
};

export function NameCard({ name, onClick, className }: Props) {
  const genderLabel = (name.gender ?? "").trim();
  // Keep the right column perfectly aligned across cards by normalizing
  // the Arabic column width (Arabic glyphs vary a lot in natural width).
  const arabicText = name.title_arabic?.trim() || name.title;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "dua-card relative w-full overflow-hidden text-left p-5 will-change-transform transition-all duration-300 ease-out",
        "border-[hsl(var(--dua-accent)/0.26)]",
        "hover:-translate-y-0.5 hover:shadow-card",
        "active:translate-y-0 active:scale-[0.99]",
        className
      )}
      aria-label={`Open share preview for ${name.title}`}
    >
      {/* Two-layer background: base gradient (dua-card) + subtle geometric overlay */}
      <div className="pointer-events-none absolute inset-0 noor-islamic-pattern opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_22%_18%,hsl(var(--dua-accent)/0.10),transparent_58%),radial-gradient(620px_circle_at_86%_30%,hsl(var(--dua-fg)/0.05),transparent_62%)]" />
      {/* soft vignette like reference */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_22%_18%,transparent_35%,hsl(var(--dua-bg))_92%)]" />
      {/* Premium gold frame like reference */}
      <div className="pointer-events-none absolute inset-2 rounded-[calc(var(--radius)_+_0.5rem)] border border-[hsl(var(--dua-accent)/0.22)]" />
      <div className="pointer-events-none absolute inset-3 rounded-[calc(var(--radius)_+_0.45rem)] border border-[hsl(var(--dua-fg)/0.08)]" />

      <div className="relative flex gap-4">
        {/* Arabic (left) */}
        <div className="shrink-0 w-[7.5rem] sm:w-[9rem] flex items-center justify-center">
          <p
            className={cn(
              "font-arabic text-4xl sm:text-5xl font-bold leading-[1.1] text-[hsl(var(--dua-accent))]",
              "text-center whitespace-nowrap"
            )}
          >
            {arabicText}
          </p>
        </div>

        {/* Details (right) */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-2xl font-semibold tracking-tight text-[hsl(var(--dua-fg))]">
            {name.title}
            {name.bn_name?.trim() ? (
              <span className="ml-2 font-bangla text-lg text-[hsl(var(--dua-fg-muted))]">({name.bn_name})</span>
            ) : null}
          </p>

          {name.meaning_bn?.trim() ? (
            <p className="mt-2 truncate font-bangla text-base font-semibold text-[hsl(var(--dua-fg))]">
              <span className="mr-1 font-medium text-[hsl(var(--dua-accent))]">অর্থ (BN):</span>
              {name.meaning_bn}
            </p>
          ) : null}

          {name.meaning_en?.trim() ? (
            <p className="mt-1 truncate text-base text-[hsl(var(--dua-fg-muted))]">
              <span className="mr-1 font-medium text-[hsl(var(--dua-accent))]">Meaning:</span>
              {name.meaning_en}
            </p>
          ) : null}

          {genderLabel ? (
            <div className="mt-4 flex items-center gap-2">
              <Badge
                variant="secondary"
                className="gap-2 rounded-full bg-[hsl(var(--dua-accent)/0.20)] px-3 py-1 text-[hsl(var(--dua-accent))]"
              >
                <UserRound className="h-4 w-4" />
                {genderLabel}
              </Badge>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}
