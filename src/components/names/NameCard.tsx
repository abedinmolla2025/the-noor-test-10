import { cn } from "@/lib/utils";
import { ImageDown } from "lucide-react";

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
  const genderLabelRaw = (name.gender ?? "").trim();
  const genderLabel = (() => {
    const g = genderLabelRaw.toLowerCase();
    if (g === "male" || g === "m" || g === "boy") return "Boy";
    if (g === "female" || g === "f" || g === "girl") return "Girl";
    if (g === "unisex") return "Unisex";
    return genderLabelRaw;
  })();
  // Keep the right column perfectly aligned across cards by normalizing
  // the Arabic column width (Arabic glyphs vary a lot in natural width).
  const arabicText = name.title_arabic?.trim() || name.title;

  const origin = name.origin?.trim();
  const source = name.source?.trim();

  const genderTone = (() => {
    const g = genderLabel.toLowerCase();
    if (g === "boy") return "boy";
    if (g === "girl") return "girl";
    if (g === "unisex") return "unisex";
    return "neutral";
  })();

  const genderChipClass =
    genderTone === "boy"
      ? "bg-[hsl(var(--dua-boy)/0.18)] text-[hsl(var(--dua-boy))]"
      : genderTone === "girl"
        ? "bg-[hsl(var(--dua-girl)/0.18)] text-[hsl(var(--dua-girl))]"
        : genderTone === "unisex"
          ? "bg-[hsl(var(--dua-unisex)/0.22)] text-[hsl(var(--dua-unisex))]"
          : "bg-[hsl(var(--dua-fg)/0.08)] text-[hsl(var(--dua-fg-muted))]";

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        // Keep cards compact and list-friendly
        "dua-card relative w-full overflow-hidden text-left p-3 will-change-transform transition-all duration-300 ease-out",
        "border-[hsl(var(--dua-accent)/0.26)]",
        "hover:-translate-y-0.5 hover:shadow-card",
        // Subtle tap feedback (premium, calm)
        "active:translate-y-0 active:scale-[0.985]",
        className
      )}
      aria-label={`Open share preview for ${name.title}`}
    >
      {/* Two-layer background: base gradient (dua-card) + subtle geometric overlay */}
      <div className="pointer-events-none absolute inset-0 noor-islamic-pattern opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_22%_18%,hsl(var(--dua-accent)/0.06),transparent_58%),radial-gradient(620px_circle_at_86%_30%,hsl(var(--dua-fg)/0.05),transparent_62%)]" />
      {/* soft vignette like reference */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_22%_18%,transparent_35%,hsl(var(--dua-bg))_92%)]" />
      {/* Premium gold frame like reference */}
      <div className="pointer-events-none absolute inset-2 rounded-[calc(var(--radius)_+_0.5rem)] border border-[hsl(var(--dua-accent)/0.22)]" />
      <div className="pointer-events-none absolute inset-3 rounded-[calc(var(--radius)_+_0.45rem)] border border-[hsl(var(--dua-fg)/0.08)]" />

      <div className="relative flex gap-3">
        {/* Details (left) */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-[18px] font-semibold tracking-tight text-[hsl(var(--dua-fg))]">
            {name.title}
            {name.bn_name?.trim() ? (
              <span className="ml-2 font-bangla text-[15px] font-semibold text-[hsl(var(--dua-fg-muted))]">
                {name.bn_name}
              </span>
            ) : null}
          </p>

          {name.meaning_bn?.trim() ? (
            <p
              className={cn(
                // Primary meaning (BN) but height-constrained for list view
                "mt-1 font-bangla text-[15px] font-semibold leading-6 text-[hsl(var(--dua-fg))]",
                "whitespace-normal break-words",
                "[display:-webkit-box] [-webkit-line-clamp:2] [-webkit-box-orient:vertical] overflow-hidden"
              )}
            >
              <span className="mr-1 font-medium text-[hsl(var(--dua-accent))]">অর্থ:</span>
              {name.meaning_bn}
            </p>
          ) : null}

          {name.meaning_en?.trim() ? (
            <p className="mt-1 truncate text-xs leading-snug text-[hsl(var(--dua-fg-soft))]">
              <span className="mr-1 font-medium text-[hsl(var(--dua-accent))]">EN:</span>
              {name.meaning_en}
            </p>
          ) : null}

          {/* Meta + Share icon: single compact row */}
          <div className="mt-2 flex items-center justify-between gap-2">
            <div
              className={cn(
                "flex min-w-0 items-center gap-2",
                // allow many chips without adding height
                "overflow-x-auto whitespace-nowrap [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              )}
            >
              {genderLabel ? (
                <span
                  className={cn(
                    "shrink-0 rounded-full px-2.5 py-0.5 text-xs font-semibold",
                    genderChipClass
                  )}
                >
                  {genderTone === "boy" ? "👦 " : genderTone === "girl" ? "👧 " : genderTone === "unisex" ? "⚧️ " : ""}
                  {genderLabel}
                </span>
              ) : null}

              {origin ? (
                <span className="shrink-0 rounded-full bg-[hsl(var(--dua-fg)/0.08)] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--dua-fg-muted))]">
                  🌍 {origin}
                </span>
              ) : null}

              {source ? (
                <span className="shrink-0 rounded-full bg-[hsl(var(--dua-fg)/0.08)] px-2.5 py-0.5 text-xs font-medium text-[hsl(var(--dua-fg-muted))]">
                  📖 {source}
                </span>
              ) : null}
            </div>

            <span className="shrink-0" aria-hidden="true" title="Tap to generate PNG">
              <ImageDown className="h-4 w-4 text-[hsl(var(--dua-fg-soft))] opacity-40" />
            </span>
          </div>
        </div>

        {/* Arabic (right) */}
        <div className="shrink-0 w-[6.75rem] sm:w-[8rem] flex items-center justify-center">
          <p
            className={cn(
              // Prominent but height-constrained: never increases card height
              "font-arabic text-3xl sm:text-4xl font-bold leading-none text-[hsl(var(--dua-accent))]",
              "text-center whitespace-nowrap",
              // keep it visually tight even with tall glyphs
              "[line-height:1]"
            )}
          >
            {arabicText}
          </p>
        </div>
      </div>
    </button>
  );
}
