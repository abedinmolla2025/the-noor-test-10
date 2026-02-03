import type { AdPlacement } from "@/lib/ads";

// Google AdMob official TEST Ad Unit IDs
export const ADMOB_TEST_BANNER_AD_UNIT_ID = "ca-app-pub-3940256099942544/6300978111";
export const ADMOB_TEST_INTERSTITIAL_AD_UNIT_ID = "ca-app-pub-3940256099942544/1033173712";
export const ADMOB_TEST_REWARDED_AD_UNIT_ID = "ca-app-pub-3940256099942544/5224354917";

export type AdMobFormat = "banner" | "interstitial" | "rewarded";

/**
 * Default mapping for app placements.
 * - app_interstitial => interstitial
 * - all other app_* placements => banner
 */
export function getTestAdUnitIdForPlacement(placement: AdPlacement, format?: AdMobFormat) {
  const inferred: AdMobFormat =
    format ?? (placement === "app_interstitial" ? "interstitial" : "banner");

  if (inferred === "interstitial") return ADMOB_TEST_INTERSTITIAL_AD_UNIT_ID;
  if (inferred === "rewarded") return ADMOB_TEST_REWARDED_AD_UNIT_ID;
  return ADMOB_TEST_BANNER_AD_UNIT_ID;
}
