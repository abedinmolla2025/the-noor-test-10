import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type OccasionDesignPreset = {
  id: "minimal" | "festive" | "editorial" | "playful";
  label: string;
  className: string;
  hint: string;
};

export const OCCASION_DESIGN_PRESETS: OccasionDesignPreset[] = [
  {
    id: "minimal",
    label: "Minimal",
    className: "occasion-theme-minimal occasion-tilt",
    hint: "Clean + subtle tilt",
  },
  {
    id: "festive",
    label: "Festive",
    className: "occasion-theme-festive occasion-shimmer occasion-glow",
    hint: "Gold shimmer + glow",
  },
  {
    id: "editorial",
    label: "Editorial",
    className: "occasion-theme-editorial occasion-tilt occasion-glow",
    hint: "Serif vibe + frame",
  },
  {
    id: "playful",
    label: "Playful",
    className: "occasion-theme-playful occasion-float occasion-shimmer",
    hint: "Float + confetti dots",
  },
];

function MiniThumb({ label, hint, className }: { label: string; hint: string; className: string }) {
  return (
    <div className={cn("occasion-card relative h-20 w-full overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="occasion-theme-overlay pointer-events-none absolute inset-0" />
      <div className="h-full w-full bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15" />

      <div className="absolute inset-x-0 bottom-0 p-2">
        <p className="occasion-title text-xs font-semibold text-foreground leading-none">{label}</p>
        <p className="mt-1 text-[10px] text-muted-foreground leading-none">{hint}</p>
      </div>
    </div>
  );
}

export function OccasionDesignPresetGallery({
  value,
  onApply,
}: {
  value: string;
  onApply: (presetClassName: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">Design preset gallery</p>
        <p className="mt-1 text-xs text-muted-foreground">থাম্বনেইলে ট্যাপ করলে theme + motion combo একসাথে apply হবে।</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OCCASION_DESIGN_PRESETS.map((p) => {
          const themeClass = `occasion-theme-${p.id}`;
          const active = new RegExp(`\\b${themeClass}\\b`).test(value);

          return (
            <Button
              key={p.id}
              type="button"
              variant="outline"
              className={cn("h-auto p-2", active && "ring-1 ring-ring")}
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
