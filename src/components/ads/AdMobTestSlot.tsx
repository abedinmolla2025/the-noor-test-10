import { useEffect, useMemo, useRef } from "react";
import { Capacitor } from "@capacitor/core";
import { Card } from "@/components/ui/card";
import type { AdPlacement } from "@/lib/ads";
import { getTestAdUnitIdForPlacement, type AdMobFormat } from "@/lib/admobTestIds";

type Props = {
  placement: AdPlacement;
  format?: AdMobFormat;
  className?: string;
};

/**
 * Native-only AdMob TEST ads for safe pre-publish testing.
 * Renders a small placeholder in the DOM; actual ads are shown by the native plugin.
 */
export function AdMobTestSlot({ placement, format, className }: Props) {
  const isNative = Capacitor.isNativePlatform();

  const resolvedFormat: AdMobFormat = useMemo(() => {
    if (format) return format;
    return placement === "app_interstitial" ? "interstitial" : "banner";
  }, [format, placement]);

  const adUnitId = useMemo(
    () => getTestAdUnitIdForPlacement(placement, resolvedFormat),
    [placement, resolvedFormat],
  );

  const bannerRef = useRef<any>(null);

  useEffect(() => {
    if (!isNative) return;

    let cancelled = false;

    (async () => {
      try {
        const mod = await import("@admob-plus/capacitor");
        if (cancelled) return;

        const { AdMobPlus, BannerAd, InterstitialAd, RewardedAd } = mod as any;

        // Safe to call multiple times.
        await AdMobPlus.start();

        if (resolvedFormat === "banner") {
          const banner = new BannerAd({ adUnitId });
          bannerRef.current = banner;
          await banner.show();
        } else if (resolvedFormat === "interstitial") {
          const interstitial = new InterstitialAd({ adUnitId });
          await interstitial.load();
          await interstitial.show();
        } else if (resolvedFormat === "rewarded") {
          const rewarded = new RewardedAd({ adUnitId });
          await rewarded.load();
          await rewarded.show();
        }
      } catch {
        // If plugin isn't available (e.g. web preview), silently ignore.
      }
    })();

    return () => {
      cancelled = true;
      (async () => {
        try {
          const banner = bannerRef.current;
          if (banner && typeof banner.hide === "function") await banner.hide();
          bannerRef.current = null;
        } catch {
          // ignore
        }
      })();
    };
  }, [adUnitId, isNative, resolvedFormat]);

  if (!isNative) return null;

  // Keep a small, consistent layout gap where the ad is expected.
  // (Real banner is rendered natively.)
  if (resolvedFormat === "banner") {
    return (
      <Card
        className={"min-h-[56px] " + (className ?? "")}
        aria-label="AdMob test banner placeholder"
      />
    );
  }

  return null;
}
