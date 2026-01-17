import { useEffect, useMemo, useState } from "react";
import { Carousel, CarouselContent, CarouselItem, type CarouselApi } from "@/components/ui/carousel";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOccasions } from "@/hooks/useOccasions";
import type { LayoutPlatform } from "@/lib/layout";
import { cn } from "@/lib/utils";

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

  const [api, setApi] = useState<CarouselApi | null>(null);
  const [active, setActive] = useState(0);
  const snapCount = api?.scrollSnapList().length ?? items.length ?? 0;

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

  if (!items.length) return null;

  return (
    <div className="w-full">
      <Carousel
        className="w-full"
        opts={{ align: "start", loop: true }}
        setApi={(a) => setApi(a)}
      >
        <CarouselContent className="-ml-3">
          {items.map((o) => (
            <CarouselItem key={o.id} className="pl-3">
              <div className="relative overflow-hidden rounded-2xl border border-border bg-card">
                {o.image_url ? (
                  <img
                    src={o.image_url}
                    alt={o.title}
                    loading="lazy"
                    className="h-44 w-full object-cover sm:h-52"
                  />
                ) : (
                  <div className="h-44 w-full bg-muted sm:h-52" />
                )}

                {/* Gradient overlay */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/25 via-transparent to-accent/20" />

                {/* Content */}
                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="font-semibold tracking-tight text-foreground text-lg sm:text-xl">
                    {o.title}
                  </p>
                  <p className="mt-1 text-sm text-foreground/90 line-clamp-2">{o.message}</p>
                  {o.dua_text ? (
                    <p className="mt-2 text-sm italic text-primary-foreground/90 bg-primary/20 inline-flex rounded-full px-3 py-1">
                      {o.dua_text}
                    </p>
                  ) : null}
                </div>
              </div>
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
