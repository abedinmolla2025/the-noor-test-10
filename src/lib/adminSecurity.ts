export const ADMIN_IDLE_TIMEOUT_MS = 30 * 60 * 1000;

export const getDeviceFingerprint = async (): Promise<string> => {
  // Lightweight, deterministic fingerprint (not a secret): used only to bind sessions to the same device.
  const raw = [
    navigator.userAgent,
    navigator.language,
    String(navigator.hardwareConcurrency ?? ""),
    String((navigator as any).deviceMemory ?? ""),
    `${screen.width}x${screen.height}x${window.devicePixelRatio ?? 1}`,
    Intl.DateTimeFormat().resolvedOptions().timeZone ?? "",
  ].join("|");

  const data = new TextEncoder().encode(raw);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = Array.from(new Uint8Array(digest));
  return bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
};

export const getLastAdminActivity = (): number | null => {
  const v = localStorage.getItem("noor_admin_last_activity");
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export const setLastAdminActivityNow = () => {
  localStorage.setItem("noor_admin_last_activity", String(Date.now()));
};

export const isAdminIdleExpired = (): boolean => {
  const last = getLastAdminActivity();
  if (!last) return true;
  return Date.now() - last > ADMIN_IDLE_TIMEOUT_MS;
};
