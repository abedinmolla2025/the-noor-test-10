import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { detectPlatform, getOrCreateAdSessionId, isAdminRoutePath } from "@/lib/ads";
import type { AdPlacement, AdPlatform } from "@/lib/ads";
import { useAdsForSlot } from "@/hooks/useAdsForSlot";

type AdSlotProps = {
  placement: AdPlacement;
  /** Optional override (useful for testing). */
  platform?: AdPlatform;
  /** For list pages: show only after N items. */
  itemIndex?: number;
  className?: string;
};

export function AdSlot({ placement, platform: platformProp, itemIndex, className }: AdSlotProps) {
  const location = useLocation();
  const sessionId = useMemo(() => getOrCreateAdSessionId(), []);

  const [platform, setPlatform] = useState<AdPlatform>(platformProp ?? "web");

  useEffect(() => {
    if (platformProp) {
      setPlatform(platformProp);
      return;
    }

    let cancelled = false;
    (async () => {
      const p = await detectPlatform();
      if (!cancelled) setPlatform(p);
    })();
    return () => {
      cancelled = true;
    };
  }, [platformProp]);

  const effectivePlatform = platformProp ?? platform;
  const isAdmin = isAdminRoutePath(location.pathname);

  const { data: ads } = useAdsForSlot({
    platform: effectivePlatform,
    placement,
    sessionId,
    limit: 1,
    enabled: !isAdmin,
  });

  const ad = ads?.[0];

  const impressionSentRef = useRef<string | null>(null);

  const blockedByIndex =
    typeof itemIndex === "number" &&
    typeof ad?.show_after_n_items === "number" &&
    itemIndex < ad.show_after_n_items;

  useEffect(() => {
    if (isAdmin) return;
    if (!ad) return;
    if (blockedByIndex) return;

    if (impressionSentRef.current === ad.id) return;
    impressionSentRef.current = ad.id;

    supabase
      .from("ad_events")
      .insert({
        ad_id: ad.id,
        event_type: "impression",
        platform: effectivePlatform,
        placement,
        session_id: sessionId,
      })
      .then(() => {
        // ignore
      });
  }, [ad, blockedByIndex, effectivePlatform, isAdmin, placement, sessionId]);

  if (isAdmin) return null;
  if (!ad || blockedByIndex) return null;

  const onClick = async () => {
    try {
      await supabase.from("ad_events").insert({
        ad_id: ad.id,
        event_type: "click",
        platform: effectivePlatform,
        placement,
        session_id: sessionId,
      });
    } catch {
      // ignore
    }

    if (ad.link_url) {
      window.open(ad.link_url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <Card className={className}>
      <div className="flex items-center gap-3 p-3">
        {ad.image_path ? (
          <img
            src={ad.image_path}
            alt={ad.title}
            loading="lazy"
            className="h-14 w-14 shrink-0 rounded-md object-cover"
          />
        ) : (
          <div className="h-14 w-14 shrink-0 rounded-md bg-muted" />
        )}

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold leading-tight text-foreground line-clamp-2">{ad.title}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">Sponsored</p>
        </div>

        <Button size="sm" onClick={onClick}>
          {ad.button_text ?? "Open"}
        </Button>
      </div>
    </Card>
  );
}

