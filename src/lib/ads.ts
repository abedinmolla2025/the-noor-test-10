export type AdPlatform = "web" | "android" | "ios";

export type AdTargetPlatform = AdPlatform | "all";

export type AdPlacement =
  | "web_home_top"
  | "web_dua_middle"
  | "web_hadith_middle"
  | "web_quran_bottom"
  | "web_tasbih_footer"
  | "app_home_top"
  | "app_dua_middle"
  | "app_hadith_middle"
  | "app_quran_bottom"
  | "app_tasbih_footer"
  | "app_interstitial";

export const ALL_PLACEMENTS: AdPlacement[] = [
  "web_home_top",
  "web_dua_middle",
  "web_hadith_middle",
  "web_quran_bottom",
  "web_tasbih_footer",
  "app_home_top",
  "app_dua_middle",
  "app_hadith_middle",
  "app_quran_bottom",
  "app_tasbih_footer",
  "app_interstitial",
];

export const WEB_PLACEMENTS: AdPlacement[] = [
  "web_home_top",
  "web_dua_middle",
  "web_hadith_middle",
  "web_quran_bottom",
  "web_tasbih_footer",
];

export const APP_PLACEMENTS: AdPlacement[] = [
  "app_home_top",
  "app_dua_middle",
  "app_hadith_middle",
  "app_quran_bottom",
  "app_tasbih_footer",
  "app_interstitial",
];

export function isAdminRoutePath(pathname: string) {
  return pathname.startsWith("/admin");
}

export function getOrCreateAdSessionId(storageKey = "noor_ad_session_id") {
  const existing = localStorage.getItem(storageKey);
  if (existing && existing.length >= 8) return existing;

  // Prefer Web Crypto when available
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? (crypto as Crypto).randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  localStorage.setItem(storageKey, id);
  return id;
}

export async function detectPlatform(): Promise<AdPlatform> {
  try {
    const mod = await import("@capacitor/core");
    const { Capacitor } = mod;

    if (Capacitor.isNativePlatform()) {
      const p = Capacitor.getPlatform();
      if (p === "android") return "android";
      if (p === "ios") return "ios";
    }
  } catch {
    // ignore and default to web
  }

  return "web";
}
