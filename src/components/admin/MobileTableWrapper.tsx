import * as React from "react";

import { cn } from "@/lib/utils";

type MobileTableWrapperProps = {
  /** The table element (usually <Table ... />) */
  children: React.ReactNode;

  /** Optional helper text shown on small screens */
  helperText?: string;

  /** Extra classes for the outer container */
  className?: string;

  /** Extra classes for the scroll container */
  scrollClassName?: string;

  /** Extra classes for the gradients */
  gradientClassName?: string;

  /** Hide gradients (still keeps overflow-x-auto) */
  showGradients?: boolean;

  /** Hide helper text */
  showHelperText?: boolean;
};

export function MobileTableWrapper({
  children,
  helperText = "Swipe horizontally to see all columns.",
  className,
  scrollClassName,
  gradientClassName,
  showGradients = true,
  showHelperText = true,
}: MobileTableWrapperProps) {
  const scrollRef = React.useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(false);

  const computeEdges = React.useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;

    const maxScrollLeft = el.scrollWidth - el.clientWidth;
    // allow tiny rounding differences
    const left = el.scrollLeft > 1;
    const right = el.scrollLeft < maxScrollLeft - 1;

    setCanScrollLeft(left);
    setCanScrollRight(right);
  }, []);

  React.useEffect(() => {
    computeEdges();

    const el = scrollRef.current;
    if (!el) return;

    const onScroll = () => computeEdges();
    el.addEventListener("scroll", onScroll, { passive: true });

    // Recompute when content size changes (columns, fonts, viewport)
    const ro = new ResizeObserver(() => computeEdges());
    ro.observe(el);

    // Also observe the table content if possible
    const firstChild = el.firstElementChild;
    if (firstChild) ro.observe(firstChild);

    return () => {
      el.removeEventListener("scroll", onScroll);
      ro.disconnect();
    };
  }, [computeEdges]);

  return (
    <div className={cn("space-y-1", className)}>
      <div className="relative -mx-4 sm:mx-0">
        <div
          ref={scrollRef}
          className={cn("overflow-x-auto pb-2", scrollClassName)}
        >
          {children}
        </div>

        {showGradients && (
          <>
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 left-0 w-6 bg-gradient-to-r from-background to-transparent transition-opacity sm:hidden",
                canScrollLeft ? "opacity-100" : "opacity-0",
                gradientClassName,
              )}
              aria-hidden="true"
            />
            <div
              className={cn(
                "pointer-events-none absolute inset-y-0 right-0 w-6 bg-gradient-to-l from-background to-transparent transition-opacity sm:hidden",
                canScrollRight ? "opacity-100" : "opacity-0",
                gradientClassName,
              )}
              aria-hidden="true"
            />
          </>
        )}
      </div>

      {showHelperText && (
        <p className="text-[11px] text-muted-foreground sm:hidden">{helperText}</p>
      )}
    </div>
  );
}
