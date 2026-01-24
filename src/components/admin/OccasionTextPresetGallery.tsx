import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type OccasionTextPreset = {
  id: "classic" | "gold_center" | "hero" | "dua_focus";
  label: string;
  className: string;
  hint: string;
};

export const OCCASION_TEXT_PRESETS: OccasionTextPreset[] = [
  {
    id: "classic",
    label: "Classic",
    className: "occasion-text-classic occasion-pos-left occasion-anim-enter",
    hint: "Clean left + soft enter",
  },
  {
    id: "gold_center",
    label: "Gold Center",
    className: "occasion-text-gold occasion-pos-center occasion-anim-fade",
    hint: "Gold title + centered",
  },
  {
    id: "hero",
    label: "Hero",
    className: "occasion-text-hero occasion-pos-left occasion-anim-pop",
    hint: "Big headline",
  },
  {
    id: "dua_focus",
    label: "Dua Focus",
    className: "occasion-text-dua occasion-pos-center occasion-anim-enter",
    hint: "Dua pill emphasized",
  },
];

function MiniThumb({ label, hint, className }: { label: string; hint: string; className: string }) {
  return (
    <div className={cn("occasion-card relative h-20 w-full overflow-hidden rounded-xl border border-border bg-card", className)}>
      <div className="occasion-theme-overlay pointer-events-none absolute inset-0" />
      <div className="h-full w-full bg-gradient-to-br from-primary/10 via-background to-accent/10" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/80 via-background/20 to-transparent" />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-accent/15" />

      <div className="occasion-content absolute inset-x-0 bottom-0 p-2">
        <p className="occasion-title text-xs font-semibold leading-none">{label}</p>
        <p className="occasion-message mt-1 text-[10px] leading-none">{hint}</p>
      </div>
    </div>
  );
}

export function OccasionTextPresetGallery({
  value,
  onApply,
}: {
  value: string;
  onApply: (presetClassName: string) => void;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-medium">Text preset gallery</p>
        <p className="mt-1 text-xs text-muted-foreground">Font + color + size + position + animation একসাথে apply হবে।</p>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {OCCASION_TEXT_PRESETS.map((p) => {
          const active = new RegExp(`\\boccasion-text-[^\\s]+\\b`).test(value) && new RegExp(`\\b${p.className.split(" ")[0]}\\b`).test(value);

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
