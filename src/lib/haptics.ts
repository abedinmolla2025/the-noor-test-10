type HapticImpactStyle = "light" | "medium" | "heavy";

// Safe wrapper for web + native (Capacitor) haptics.
// - On native: uses @capacitor/haptics
// - On web: falls back to navigator.vibrate when available

const webVibrate = (pattern: number | number[]) => {
  if (typeof navigator === "undefined" || typeof navigator.vibrate !== "function") return;
  navigator.vibrate(pattern);
};

const isCapacitorRuntime = () => {
  // Works without importing @capacitor/core
  return typeof window !== "undefined" && !!(window as any).Capacitor?.isNativePlatform?.();
};

export async function hapticImpact(style: HapticImpactStyle) {
  // Native path
  if (isCapacitorRuntime()) {
    try {
      const mod = await import("@capacitor/haptics");
      const Haptics = mod.Haptics;
      const ImpactStyle = mod.ImpactStyle;

      const mapped =
        style === "light"
          ? ImpactStyle.Light
          : style === "medium"
          ? ImpactStyle.Medium
          : ImpactStyle.Heavy;

      await Haptics.impact({ style: mapped });
      return;
    } catch {
      // Fall back to web vibration
    }
  }

  // Web fallback
  webVibrate(style === "light" ? 15 : style === "medium" ? 25 : 40);
}

export async function hapticNotification(type: "success" | "warning" | "error") {
  // Native path
  if (isCapacitorRuntime()) {
    try {
      const mod = await import("@capacitor/haptics");
      const Haptics = mod.Haptics;
      const NotificationType = mod.NotificationType;

      const mapped =
        type === "success" ? NotificationType.Success : type === "warning" ? NotificationType.Warning : NotificationType.Error;

      await Haptics.notification({ type: mapped });
      return;
    } catch {
      // Fall back to web vibration
    }
  }

  // Web fallback patterns
  webVibrate(type === "success" ? 20 : type === "warning" ? [15, 30, 15] : [30, 40, 30]);
}
