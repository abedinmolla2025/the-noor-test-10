import React from "react";
import { cn } from "@/lib/utils";

export type OccasionType =
  | "eid"
  | "ramadan_start"
  | "laylatul_qadr"
  | "shab_e_barat"
  | "milad_un_nabi"
  | "islamic_new_year";

type Props = {
  id: string;
  occasionType: OccasionType;
  title: string;
  message: string;
  duaText?: string | null;
  containerClassName?: string | null;
};

function EidOrnaments() {
  return (
    <>
      {/* Moon + stars */}
      <svg
        className="occasion-ornament occasion-ornament-moon"
        viewBox="0 0 200 140"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="moonGlow" cx="40%" cy="35%" r="70%">
            <stop offset="0" stopColor="hsl(var(--occasion-gold) / 0.95)" />
            <stop offset="1" stopColor="hsl(var(--occasion-gold) / 0.15)" />
          </radialGradient>
        </defs>

        <g>
          <circle cx="78" cy="56" r="32" fill="url(#moonGlow)" />
          <circle cx="92" cy="52" r="30" fill="hsl(var(--occasion-sky) / 1)" />
        </g>

        <g className="occasion-stars">
          <circle cx="136" cy="36" r="2.4" fill="hsl(var(--occasion-gold) / 0.95)" />
          <circle cx="160" cy="58" r="1.7" fill="hsl(var(--occasion-gold) / 0.75)" />
          <circle cx="122" cy="72" r="1.5" fill="hsl(var(--occasion-gold) / 0.65)" />
          <circle cx="150" cy="28" r="1.2" fill="hsl(var(--occasion-gold) / 0.6)" />
        </g>
      </svg>

      {/* Mosque silhouette */}
      <svg
        className="occasion-ornament occasion-ornament-mosque"
        viewBox="0 0 600 180"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path
          d="M0 170H600V180H0z"
          fill="hsl(var(--occasion-ink) / 0.55)"
        />
        <path
          d="M0 170V150c32-8 52-24 72-40 18-14 34-26 56-28 32-4 56 18 78 38 12 10 24 20 38 24 20 6 36-2 56-18 18-14 34-28 56-30 30-4 54 16 76 34 18 14 34 28 56 30 26 2 44-10 64-22 18-10 34-18 52-18v60H0z"
          fill="hsl(var(--occasion-ink) / 0.40)"
        />
        <path
          d="M112 170V118c0-10 8-18 18-18h18c10 0 18 8 18 18v52h-54z"
          fill="hsl(var(--occasion-ink) / 0.50)"
        />
        <path
          d="M252 170V92c0-12 10-22 22-22h52c12 0 22 10 22 22v78h-96z"
          fill="hsl(var(--occasion-ink) / 0.52)"
        />
        <path
          d="M300 60c-18 14-28 28-28 44h56c0-16-10-30-28-44z"
          fill="hsl(var(--occasion-ink) / 0.62)"
        />
        <path
          d="M414 170V120c0-10 8-18 18-18h18c10 0 18 8 18 18v50h-54z"
          fill="hsl(var(--occasion-ink) / 0.48)"
        />
      </svg>
    </>
  );
}

function RamadanOrnaments() {
  return (
    <>
      {/* Hanging lanterns */}
      <svg className="occasion-ornament occasion-ornament-lanterns" viewBox="0 0 600 200" aria-hidden="true">
        <g className="occasion-lantern occasion-lantern-1">
          <path d="M140 0v52" stroke="hsl(var(--occasion-gold) / 0.65)" strokeWidth="3" />
          <path
            d="M118 88l22-22 22 22-6 62h-32z"
            fill="hsl(var(--occasion-gold) / 0.22)"
            stroke="hsl(var(--occasion-gold) / 0.55)"
            strokeWidth="2"
          />
          <circle cx="140" cy="112" r="10" fill="hsl(var(--occasion-gold) / 0.25)" />
        </g>
        <g className="occasion-lantern occasion-lantern-2">
          <path d="M300 0v62" stroke="hsl(var(--occasion-gold) / 0.65)" strokeWidth="3" />
          <path
            d="M276 104l24-24 24 24-7 72h-34z"
            fill="hsl(var(--occasion-gold) / 0.22)"
            stroke="hsl(var(--occasion-gold) / 0.55)"
            strokeWidth="2"
          />
          <circle cx="300" cy="132" r="11" fill="hsl(var(--occasion-gold) / 0.25)" />
        </g>
        <g className="occasion-lantern occasion-lantern-3">
          <path d="M460 0v48" stroke="hsl(var(--occasion-gold) / 0.65)" strokeWidth="3" />
          <path
            d="M438 82l22-22 22 22-6 60h-32z"
            fill="hsl(var(--occasion-gold) / 0.22)"
            stroke="hsl(var(--occasion-gold) / 0.55)"
            strokeWidth="2"
          />
          <circle cx="460" cy="106" r="10" fill="hsl(var(--occasion-gold) / 0.25)" />
        </g>
      </svg>

      {/* Crescent */}
      <svg className="occasion-ornament occasion-ornament-moon" viewBox="0 0 220 160" aria-hidden="true">
        <defs>
          <radialGradient id="ramMoon" cx="40%" cy="35%" r="75%">
            <stop offset="0" stopColor="hsl(var(--occasion-gold) / 0.85)" />
            <stop offset="1" stopColor="hsl(var(--occasion-gold) / 0.08)" />
          </radialGradient>
        </defs>
        <circle cx="92" cy="74" r="36" fill="url(#ramMoon)" />
        <circle cx="112" cy="66" r="34" fill="hsl(var(--occasion-sky) / 1)" />
      </svg>
    </>
  );
}

function NightOrnaments({ variant }: { variant: "qadr" | "hijri" | "barat" }) {
  return (
    <>
      <svg className="occasion-ornament occasion-ornament-stars" viewBox="0 0 600 240" aria-hidden="true">
        <g className="occasion-stars">
          {Array.from({ length: 22 }).map((_, i) => (
            <circle
              // deterministic layout
              key={i}
              cx={(i * 83) % 600}
              cy={((i * 47) % 180) + 10}
              r={(i % 3) + 1.1}
              fill="hsl(var(--occasion-gold) / 0.7)"
            />
          ))}
        </g>
      </svg>

      {(variant === "qadr" || variant === "barat") && (
        <svg
          className="occasion-ornament occasion-ornament-mosque"
          viewBox="0 0 600 180"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path d="M0 170H600V180H0z" fill="hsl(var(--occasion-ink) / 0.55)" />
          <path
            d="M60 170V118c0-12 10-22 22-22h40c12 0 22 10 22 22v52H60z"
            fill="hsl(var(--occasion-ink) / 0.46)"
          />
          <path
            d="M240 170V96c0-14 12-26 26-26h68c14 0 26 12 26 26v74H240z"
            fill="hsl(var(--occasion-ink) / 0.52)"
          />
          <path
            d="M300 58c-22 16-34 34-34 52h68c0-18-12-36-34-52z"
            fill="hsl(var(--occasion-ink) / 0.62)"
          />
          <path
            d="M454 170V118c0-12 10-22 22-22h40c12 0 22 10 22 22v52h-84z"
            fill="hsl(var(--occasion-ink) / 0.44)"
          />
        </svg>
      )}

      {variant === "hijri" && (
        <svg className="occasion-ornament occasion-ornament-horizon" viewBox="0 0 600 200" preserveAspectRatio="none" aria-hidden="true">
          <path
            d="M0 160c90-30 160-30 240 0s150 30 360 0v40H0z"
            fill="hsl(var(--occasion-gold) / 0.12)"
          />
        </svg>
      )}
    </>
  );
}

function MiladOrnaments() {
  return (
    <>
      {/* Gentle abstract roses (non-photo) */}
      <svg className="occasion-ornament occasion-ornament-roses" viewBox="0 0 600 220" aria-hidden="true">
        <g opacity="0.55">
          <path
            d="M90 160c18-40 60-62 92-36 22 18 18 52-10 72-30 22-64 10-82-36z"
            fill="hsl(var(--occasion-gold) / 0.16)"
          />
          <path
            d="M520 170c-24-44-70-58-96-28-18 22-8 54 24 68 32 14 60-2 72-40z"
            fill="hsl(var(--occasion-gold) / 0.14)"
          />
        </g>
      </svg>

      <svg className="occasion-ornament occasion-ornament-mosque" viewBox="0 0 600 180" preserveAspectRatio="none" aria-hidden="true">
        <path d="M0 170H600V180H0z" fill="hsl(var(--occasion-ink) / 0.55)" />
        <path
          d="M120 170V120c0-12 10-22 22-22h40c12 0 22 10 22 22v50h-84z"
          fill="hsl(var(--occasion-ink) / 0.46)"
        />
        <path
          d="M244 170V98c0-14 12-26 26-26h60c14 0 26 12 26 26v72H244z"
          fill="hsl(var(--occasion-ink) / 0.52)"
        />
        <path
          d="M300 62c-20 14-30 30-30 48h60c0-18-10-34-30-48z"
          fill="hsl(var(--occasion-ink) / 0.62)"
        />
        <path
          d="M444 170V120c0-12 10-22 22-22h40c12 0 22 10 22 22v50h-84z"
          fill="hsl(var(--occasion-ink) / 0.44)"
        />
      </svg>
    </>
  );
}

export function OccasionCard({
  id,
  occasionType,
  title,
  message,
  duaText,
  containerClassName,
}: Props) {
  return (
    <div
      className={cn(
        "occasion-card occasion-celebration relative w-full overflow-hidden",
        // global card rules (rounded 20px, glow border, pattern)
        "occasion-celebration-base",
        `occasion-type-${occasionType}`,
        containerClassName,
      )}
      data-occasion-id={id}
    >
      {/* Background layers */}
      <div className="occasion-theme-overlay pointer-events-none absolute inset-0" />
      <div className="occasion-pattern pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="occasion-rays pointer-events-none absolute inset-0" aria-hidden="true" />
      <div className="occasion-particles pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* Ornaments */}
      <div className="pointer-events-none absolute inset-0" aria-hidden="true">
        {occasionType === "eid" ? <EidOrnaments /> : null}
        {occasionType === "ramadan_start" ? <RamadanOrnaments /> : null}
        {occasionType === "laylatul_qadr" ? <NightOrnaments variant="qadr" /> : null}
        {occasionType === "shab_e_barat" ? <NightOrnaments variant="barat" /> : null}
        {occasionType === "islamic_new_year" ? <NightOrnaments variant="hijri" /> : null}
        {occasionType === "milad_un_nabi" ? <MiladOrnaments /> : null}
      </div>

      {/* Content (admin-controlled text) */}
      <div className="occasion-content relative z-10 p-4">
        <p className="occasion-title occasion-title-glow">{title}</p>
        <p className="occasion-message occasion-message-fade mt-1 line-clamp-2">{message}</p>
        {duaText ? <p className="occasion-dua mt-2 inline-flex rounded-full px-3 py-1">{duaText}</p> : null}
      </div>
    </div>
  );
}
