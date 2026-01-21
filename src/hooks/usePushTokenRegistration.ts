import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { PushNotifications } from "@capacitor/push-notifications";
import { supabase } from "@/integrations/supabase/client";

const DEVICE_ID_KEY = "noor_device_id";
const PUSH_OPT_IN_KEY = "noor_push_opt_in";

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const next = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

function isDuplicateTokenError(error: unknown): boolean {
  const msg = typeof (error as any)?.message === "string" ? (error as any).message : "";
  return msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("23505");
}

/**
 * Registers the device for push notifications on native (Capacitor) builds.
 *
 * This only stores the device token in the backend (for later delivery + scheduling).
 * Actual sending is intentionally NOT implemented yet.
 */
export function usePushTokenRegistration() {
  useEffect(() => {
    // No-op on web
    if (!Capacitor.isNativePlatform()) return;

    // Only register after user opt-in
    if (localStorage.getItem(PUSH_OPT_IN_KEY) !== "true") return;

    let removed = false;

    const run = async () => {
      try {
        const perm = await PushNotifications.requestPermissions();
        if (perm.receive !== "granted") return;

        await PushNotifications.register();

        const deviceId = getOrCreateDeviceId();
        const platform = Capacitor.getPlatform();

        PushNotifications.addListener("registration", async (token) => {
          if (removed) return;

          const { error } = await supabase
            // Types may lag behind migrations; keep this resilient.
            .from("device_push_tokens" as any)
            .insert({
              token: token.value,
              platform,
              device_id: deviceId,
              enabled: true,
            });

          // Ignore duplicates (same token already stored)
          if (error && !isDuplicateTokenError(error)) {
            // eslint-disable-next-line no-console
            console.warn("Failed to save push token", error);
          }
        });

        PushNotifications.addListener("registrationError", (err) => {
          // eslint-disable-next-line no-console
          console.warn("Push registration error", err);
        });
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Push setup failed", e);
      }
    };

    run();

    return () => {
      removed = true;
      // Best-effort cleanup
      PushNotifications.removeAllListeners().catch(() => undefined);
    };
  }, []);
}
