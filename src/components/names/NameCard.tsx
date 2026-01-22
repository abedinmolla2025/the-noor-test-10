import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export type NameCardModel = {
  id: string;
  title: string;
  title_arabic: string | null;
  bn_name?: string;
  meaning_bn?: string | null;
  meaning_en?: string | null;
  meaning_ar?: string | null;
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
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "dua-card relative w-full overflow-hidden text-left p-4 will-change-transform transition-all duration-300 ease-out",
        "hover:-translate-y-0.5 hover:shadow-card",
        "active:translate-y-0 active:scale-[0.99]",
        className
      )}
      aria-label={`Open share preview for ${name.title}`}
    >
      {/* Two-layer background: base gradient (dua-card) + subtle geometric overlay */}
      <div className="pointer-events-none absolute inset-0 noor-islamic-pattern opacity-[0.06]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(600px_circle_at_20%_10%,hsl(var(--dua-accent)/0.08),transparent_55%),radial-gradient(700px_circle_at_80%_20%,hsl(var(--dua-fg)/0.06),transparent_60%)]" />

      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="font-arabic text-2xl font-bold leading-[1.7] text-[hsl(var(--dua-fg))]">
              {name.title_arabic?.trim() || name.title}
            </p>
            <p className="mt-1 text-sm font-semibold tracking-tight text-[hsl(var(--dua-fg))]">
              {name.title}
              {name.bn_name?.trim() ? (
                <span className="ml-2 font-bangla font-semibold text-[hsl(var(--dua-fg-muted))]">
                  • {name.bn_name}
                </span>
              ) : null}
            </p>
          </div>
        </div>

        {name.meaning_bn?.trim() ? (
          <div className="rounded-2xl border border-[hsl(var(--dua-border))] bg-[hsl(var(--dua-surface))] p-3">
            <p className="text-[11px] font-medium text-[hsl(var(--dua-fg-soft))]">অর্থ (বাংলা)</p>
            <p className="mt-1 font-bangla text-[15px] font-semibold leading-relaxed text-[hsl(var(--dua-fg))]">
              {name.meaning_bn}
            </p>
            {name.meaning_en?.trim() ? (
              <p className="mt-2 text-sm text-[hsl(var(--dua-fg-muted))]">{name.meaning_en}</p>
            ) : null}
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-2">
          {name.category?.trim() ? (
            <Badge
              variant="secondary"
              className="bg-[hsl(var(--dua-accent)/0.18)] text-[hsl(var(--dua-accent))]"
            >
              {name.category}
            </Badge>
          ) : null}
          {name.origin?.trim() ? (
            <Badge
              variant="outline"
              className="border-[hsl(var(--dua-fg)/0.18)] bg-transparent text-[hsl(var(--dua-fg-muted))]"
            >
              {name.origin}
            </Badge>
          ) : null}
          {name.source?.trim() ? (
            <Badge
              variant="outline"
              className="border-[hsl(var(--dua-fg)/0.18)] bg-transparent text-[hsl(var(--dua-fg-muted))]"
            >
              {name.source}
            </Badge>
          ) : null}
        </div>
      </div>
    </button>
  );
}
