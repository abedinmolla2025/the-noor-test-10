import * as React from "react";
import { Loader2 } from "lucide-react";

type PullToRefreshProps = {
  children: React.ReactNode;
  disabled?: boolean;
  thresholdPx?: number;
  maxPullPx?: number;
  onRefresh: () => Promise<void> | void;
};

/**
 * Mobile-only pull-to-refresh (best-effort).
 * - Triggers only when user is at the top of the page
 * - Uses touch events so it works inside the app shell too
 */
export function PullToRefresh({
  children,
  disabled,
  thresholdPx = 72,
  maxPullPx = 120,
  onRefresh,
}: PullToRefreshProps) {
  const startYRef = React.useRef<number | null>(null);
  const pullingRef = React.useRef(false);

  const [pullPx, setPullPx] = React.useState(0);
  const [refreshing, setRefreshing] = React.useState(false);

  const reset = React.useCallback(() => {
    startYRef.current = null;
    pullingRef.current = false;
    setPullPx(0);
  }, []);

  const atTop = () => {
    // Keep it conservative: only treat as "at top" when the page is truly at top.
    return (typeof window !== "undefined" ? window.scrollY : 0) <= 0;
  };

  const onTouchStart = (e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    if (!atTop()) return;
    startYRef.current = e.touches[0]?.clientY ?? null;
    pullingRef.current = true;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (disabled || refreshing) return;
    if (!pullingRef.current) return;

    const startY = startYRef.current;
    const currentY = e.touches[0]?.clientY;
    if (startY == null || currentY == null) return;

    const raw = currentY - startY;
    if (raw <= 0) {
      setPullPx(0);
      return;
    }

    // Only prevent native behavior while actually pulling down at top.
    if (atTop()) e.preventDefault();

    // Rubber-band easing.
    const eased = Math.min(maxPullPx, Math.round(raw * 0.55));
    setPullPx(eased);
  };

  const onTouchEnd = async () => {
    if (disabled || refreshing) {
      reset();
      return;
    }
    const shouldRefresh = pullPx >= thresholdPx;
    reset();

    if (!shouldRefresh) return;

    try {
      setRefreshing(true);
      await Promise.resolve(onRefresh());
    } finally {
      setRefreshing(false);
    }
  };

  const show = refreshing || pullPx > 0;
  const translateY = refreshing ? 56 : pullPx;

  return (
    <div
      className="relative"
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
      onTouchCancel={reset}
    >
      {/* Indicator */}
      <div
        className="pointer-events-none fixed left-0 right-0 top-0 z-50 flex justify-center"
        aria-hidden={!show}
      >
        <div
          className="mt-2 inline-flex items-center gap-2 rounded-full border border-border bg-background/80 px-3 py-2 text-xs text-foreground shadow-sm backdrop-blur"
          style={{
            transform: `translateY(${Math.max(0, Math.min(80, translateY))}px)`,
            opacity: show ? 1 : 0,
            transition: refreshing ? "transform 160ms ease, opacity 160ms ease" : "opacity 120ms ease",
            willChange: "transform",
          }}
        >
          {refreshing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>রিফ্রেশ হচ্ছে…</span>
            </>
          ) : (
            <span>{pullPx >= thresholdPx ? "ছাড়ুন রিফ্রেশ করতে" : "টেনে ধরুন রিফ্রেশ করতে"}</span>
          )}
        </div>
      </div>

      {children}
    </div>
  );
}
