import { forwardRef } from "react";
import noorLogo from "@/assets/noor-logo.png";
import { cn } from "@/lib/utils";
import type { NameCardModel } from "./NameCard";

type Props = {
  name: NameCardModel;
  className?: string;
  appName?: string;
};

/**
 * 1080x1080 share square.
 * IMPORTANT: keep this node unscaled; scale with an outer wrapper for preview.
 */
export const NameShareSquare = forwardRef<HTMLDivElement, Props>(function NameShareSquare(
  { name, className, appName = "Noor" },
  ref
) {
  const arabic = name.title_arabic?.trim() || name.title;
  const en = name.title?.trim() || "";
  const bn = name.bn_name?.trim() || "";
  const meaningBn = name.meaning_bn?.trim() || "";
  const meaningEn = name.meaning_en?.trim() || "";

  return (
    <div
      ref={ref}
      className={cn(
        "relative isolate overflow-hidden rounded-[48px]",
        "h-[1080px] w-[1080px]",
        "border border-[hsl(var(--dua-accent)/0.26)]",
        className
      )}
      style={{
        background: "linear-gradient(135deg, hsl(var(--dua-card-from)), hsl(var(--dua-card-to)))",
      }}
    >
      {/* Two-layer background: base gradient + subtle geometric overlay (matches cards) */}
      <div className="pointer-events-none absolute inset-0 noor-islamic-pattern opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_22%_18%,hsl(var(--dua-accent)/0.10),transparent_58%),radial-gradient(620px_circle_at_86%_30%,hsl(var(--dua-fg)/0.05),transparent_62%)]" />
      {/* Vignette for legibility */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px circle at 50% 38%, transparent 34%, hsl(var(--dua-bg)) 78%)",
        }}
      />

      {/* Premium gold frame (like cards) */}
      <div className="pointer-events-none absolute inset-2 rounded-[calc(48px_+_0.5rem)] border border-[hsl(var(--dua-accent)/0.22)]" />
      <div className="pointer-events-none absolute inset-3 rounded-[calc(48px_+_0.45rem)] border border-[hsl(var(--dua-fg)/0.08)]" />

      <div className="relative flex h-full flex-col px-20 pb-20 pt-24">
        <div className="flex-1">
          <div className="text-center">
            <p className="font-arabic text-[132px] font-bold leading-[1.15] tracking-tight text-[hsl(var(--dua-fg))]">
              {arabic}
            </p>
            <p className="mt-6 text-[52px] font-semibold tracking-tight text-[hsl(var(--dua-fg))]">{en}</p>
            {bn ? (
              <p className="mt-3 font-bangla text-[56px] font-bold leading-tight text-[hsl(var(--dua-fg))]">
                {bn}
              </p>
            ) : null}
          </div>

          <div className="mx-auto mt-16 max-w-[860px] rounded-[40px] border border-[hsl(var(--dua-border))] bg-[hsl(var(--dua-surface))] p-14">
            <p className="text-[26px] font-semibold tracking-wide text-[hsl(var(--dua-accent))]">
              Islamic Name Meaning
            </p>
            {meaningBn ? (
              <p className="mt-4 font-bangla text-[54px] font-bold leading-[1.25] text-[hsl(var(--dua-fg))]">
                {meaningBn}
              </p>
            ) : (
              <p className="mt-4 text-[44px] font-semibold text-[hsl(var(--dua-fg-muted))]">—</p>
            )}
            {meaningEn ? (
              <p className="mt-8 text-[32px] leading-snug text-[hsl(var(--dua-fg-muted))]">{meaningEn}</p>
            ) : null}
          </div>
        </div>

        <div className="mt-12 flex items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* NOTE: Avoid raster images in canvas exports; some environments drop them.
                Use pure text branding so PNG export is always consistent. */}
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[hsl(var(--dua-fg)/0.08)]">
              <span className="text-[22px] font-bold tracking-tight text-[hsl(var(--dua-fg))]">
                {appName.slice(0, 1).toUpperCase()}
              </span>
            </div>
            <div>
              <p className="text-[26px] font-semibold text-[hsl(var(--dua-fg))]">{appName}</p>
              <p className="text-[22px] text-[hsl(var(--dua-fg-soft))]">Premium Islamic Names</p>
            </div>
          </div>
          <p className="text-[22px] text-[hsl(var(--dua-fg-soft))]">Share • Save • Remember</p>
        </div>
      </div>
    </div>
  );
});
