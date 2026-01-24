import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type OccasionClassPreset = {
  id: string;
  label: string;
  className: string;
  hint?: string;
};

const PRESETS: OccasionClassPreset[] = [
  { id: "float", label: "Float", className: "occasion-float", hint: "Subtle lift" },
  { id: "shimmer", label: "Shimmer", className: "occasion-shimmer", hint: "Gold sweep" },
  { id: "tilt", label: "Tilt", className: "occasion-tilt", hint: "Printed feel" },
  { id: "glow", label: "Glow", className: "occasion-glow", hint: "Soft border" },
  {
    id: "premium",
    label: "Premium",
    className: "occasion-glow occasion-shimmer",
    hint: "Glow + shimmer",
  },
  {
    id: "hero",
    label: "Hero",
    className: "occasion-float occasion-tilt occasion-glow",
    hint: "Float + tilt + glow",
  },
];

function MiniThumb({ label, hint, className }: { label: string; hint?: string; className: string }) {
  return (
    <div
      className={cn(
        "relative h-20 w-full overflow-hidden rounded-xl border border-border bg-card",
        "occasion-card",
        className,
      )}
    >
      {/* Banner */}
      <div className="h-full w-full bg-gradient-to-br from-primary/10 via-background to-accent/10" />

      {/* Overlays (same vibe as real card) */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15" />

      {/* Label */}
      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="text-xs font-semibold text-foreground leading-none">{label}</p>
        {hint ? <p className="mt-1 text-[10px] text-muted-foreground leading-none">{hint}</p> : null}
      </div>
    </div>
  );
}

export function OccasionPresetGallery({
  value,
  onApply,
}: {
  value: string;
  onApply: (presetClassName: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <p className="text-sm font-medium">Preset gallery</p>
          <p className="mt-1 text-xs text-muted-foreground">
            থাম্বনেইলে ট্যাপ করলে className-এ যোগ হবে (multiple select possible)।
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {PRESETS.map((p) => {
          const active = p.className
            .split(/\s+/)
            .filter(Boolean)
            .every((c) => new RegExp(`\\b${c}\\b`).test(value));

          return (
            <Button
              key={p.id}
              type="button"
              variant="outline"
              className={cn(
                "h-auto p-2 text-left",
                active && "ring-1 ring-ring",
              )}
              onClick={() => onApply(p.className)}
            >
              <div className="w-full">
                <MiniThumb label={p.label} hint={p.hint} className={p.className} />
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}
