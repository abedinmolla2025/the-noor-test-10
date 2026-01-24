import { useEffect, useMemo, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOccasions } from "@/hooks/useOccasions";
import type { LayoutPlatform } from "@/lib/layout";
import { cn } from "@/lib/utils";
import { OccasionCard, type OccasionType } from "@/components/OccasionCard";

function sanitizeOccasionCardCss(input: string) {
  // Admin UI asks for *declarations only* (no selector / braces / @rules).
  // Users sometimes paste full CSS blocks with @keyframes or braces which can break the injected <style>.
  // Keep this intentionally conservative.
  let s = input ?? "";
  // Remove @rules blocks and single-line @rules.
  s = s.replace(/@[^;{]*;\s*/g, "");
  s = s.replace(/@[^{}]*\{[\s\S]*?\}\s*/g, "");
  // Drop any braces to prevent selector injection.
  s = s.replace(/[{}]/g, "");
  // Basic size limit.
  if (s.length > 4000) s = s.slice(0, 4000);
  return s.trim();
}

function Dots({ count, activeIndex, onSelect }: { count: number; activeIndex: number; onSelect: (idx: number) => void }) {
  if (count <= 1) return null;

  return (
    <div className="mt-3 flex items-center justify-center gap-2">
      {Array.from({ length: count }).map((_, idx) => (
        <button
          key={idx}
          type="button"
          aria-label={`Go to slide ${idx + 1}`}
          onClick={() => onSelect(idx)}
          className={cn(
            "h-2.5 w-2.5 rounded-full border border-border transition",
            idx === activeIndex ? "bg-primary" : "bg-muted",
          )}
        />
      ))}
    </div>
  );
}

export function OccasionCarousel({ platform }: { platform: LayoutPlatform }) {
  const effective = platform === "app" ? "app" : "web";
  const { data, isLoading } = useActiveOccasions(effective);

  const items = useMemo(() => data ?? [], [data]);

  const supported = useMemo(() => {
    const mapKeyToType = (key: string): OccasionType | null => {
      switch (key) {
        case "eid_fitr":
        case "eid_adha":
        case "eid":
          return "eid";
        case "ramadan_start":
          return "ramadan_start";
        case "laylatul_qadr":
          return "laylatul_qadr";
        case "shab_e_barat":
          return "shab_e_barat";
        case "milad_un_nabi":
          return "milad_un_nabi";
        case "islamic_new_year":
        case "hijri_new_year":
          return "islamic_new_year";
        default:
          return null;
      }
    };

    const getTypeFromClass = (className?: string | null): OccasionType | null => {
      if (!className) return null;
      const m = className.match(/\boccasion-type-([a-z_]+)\b/i);
      if (!m?.[1]) return null;
      return mapKeyToType(m[1].toLowerCase());
    };

    return items
      .map((o) => ({ o, type: getTypeFromClass(o.container_class_name) }))
      .filter((x): x is { o: (typeof items)[number]; type: OccasionType } => Boolean(x.type));
  }, [items]);

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [active, setActive] = useState(0);
  const snapCount = api?.scrollSnapList().length ?? supported.length ?? 0;

  useEffect(() => {
    if (!api) return;

    const onSelect = () => setActive(api.selectedScrollSnap());
    onSelect();

    api.on("select", onSelect);
    api.on("reInit", onSelect);

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    if ((api.scrollSnapList().length ?? 0) <= 1) return;

    const id = window.setInterval(() => {
      if (!api) return;
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, 6500);

    return () => window.clearInterval(id);
  }, [api]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-3">
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!supported.length) return null;

  return (
    <div className="w-full">
      <Carousel
        className="w-full"
        opts={{ align: "start", loop: true }}
        setApi={(a) => setApi(a)}
      >
        {/* Avoid negative margins here: the page uses overflow-x-hidden, which can clip the card on small screens. */}
        <CarouselContent className="ml-0 gap-3">
          {supported.map(({ o, type }) => (
            <CarouselItem key={o.id} className="pl-0">
              {o.card_css?.trim() ? (
                <style>
                  {`.occasion-card[data-occasion-id="${o.id}"]{${sanitizeOccasionCardCss(o.card_css)}}`}
                </style>
              ) : null}

              <OccasionCard
                id={o.id}
                occasionType={type}
                title={o.title}
                message={o.message}
                duaText={o.dua_text}
                containerClassName={cn(o.container_class_name)}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      <Dots
        count={snapCount}
        activeIndex={active}
        onSelect={(idx) => api?.scrollTo(idx)}
      />
    </div>
  );
}
