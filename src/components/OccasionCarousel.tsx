import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { useActiveOccasions } from "@/hooks/useOccasions";
import type { LayoutPlatform } from "@/lib/layout";
import { OccasionHtmlCard } from "@/components/OccasionHtmlCard";

export function OccasionCarousel({ platform }: { platform: LayoutPlatform }) {
  const effective = platform === "app" ? "app" : "web";
  const { data, isLoading } = useActiveOccasions(effective);

  const item = useMemo(() => (data ?? [])[0] ?? null, [data]);

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card p-3">
          <Skeleton className="h-40 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <OccasionHtmlCard
      occasionId={item.id}
      title={item.title}
      subtitle={(item as any).subtitle ?? item.message}
      htmlCode={(item as any).html_code}
      cssCode={(item as any).css_code ?? item.card_css}
      containerClassName={item.container_class_name}
    />
  );
}
