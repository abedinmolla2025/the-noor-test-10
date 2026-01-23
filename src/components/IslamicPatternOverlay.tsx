import { useId } from "react";

import { cn } from "@/lib/utils";

type IslamicPatternOverlayProps = {
  className?: string;
  /** Defaults to 40 to match your SVG */
  tile?: number;
  /** ViewBox size. Defaults to 200 to match your SVG */
  size?: number;
};

/**
 * Exact geometric pattern from the user's SVG.
 * Uses `currentColor` so pages can tint it via semantic tokens.
 */
export function IslamicPatternOverlay({
  className,
  tile = 40,
  size = 200,
}: IslamicPatternOverlayProps) {
  const id = useId();
  const patternId = `islamicPattern-${id}`;

  return (
    <svg
      aria-hidden="true"
      className={cn("absolute inset-0 h-full w-full", className)}
      viewBox={`0 0 ${size} ${size}`}
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern id={patternId} width={tile} height={tile} patternUnits="userSpaceOnUse">
          <rect width={tile} height={tile} fill="transparent" />
          <path
            d={`M${tile / 2} 0 L${tile} ${tile / 2} L${tile / 2} ${tile} L0 ${tile / 2} Z`}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            opacity={1}
          />
          <circle
            cx={tile / 2}
            cy={tile / 2}
            r={6}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            opacity={1}
          />
        </pattern>
      </defs>

      <rect width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
