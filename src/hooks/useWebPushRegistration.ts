import { useEffect } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";

const DEVICE_ID_KEY = "noor_device_id";
const WEB_PUSH_REGISTERED_KEY = "noor_web_push_registered";
const PUSH_OPT_IN_KEY = "noor_push_opt_in";

function getOrCreateDeviceId(): string {
  const existing = localStorage.getItem(DEVICE_ID_KEY);
  if (existing) return existing;

  const next = crypto.randomUUID();
  localStorage.setItem(DEVICE_ID_KEY, next);
  return next;
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

function isDuplicateTokenError(error: unknown): boolean {
  const msg = typeof (error as any)?.message === "string" ? (error as any).message : "";
  return msg.toLowerCase().includes("duplicate") || msg.toLowerCase().includes("23505");
}

/**
 * Registers the browser for web push notifications.
 * Only runs on web (not native platforms).
 */
export function useWebPushRegistration() {
  useEffect(() => {
    // Only run on web
    if (Capacitor.isNativePlatform()) return;

    // Check if service workers are supported
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) return;

    // Only register after user opt-in
    if (localStorage.getItem(PUSH_OPT_IN_KEY) !== "true") return;

    // Check if already registered
    if (localStorage.getItem(WEB_PUSH_REGISTERED_KEY) === "true") return;

    let removed = false;

    const run = async () => {
      try {
        // Request notification permission (should be user-initiated via UI, but keep safe)
        const permission = await Notification.requestPermission();
        if (permission !== "granted") return;

        // Register service worker
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });
        await navigator.serviceWorker.ready;

        // Get VAPID public key from edge function
        const { data: keyRes, error: keyErr } = await supabase.functions.invoke("webpush-public-key", {
          body: {},
        });
        if (keyErr) throw keyErr;
        const publicKey = String(keyRes?.publicKey ?? "");
        if (!publicKey) throw new Error("Missing VAPID public key");

        // If an old subscription exists (e.g., VAPID key changed), unsubscribe first to avoid
        // "A subscription with a different applicationServerKey already exists" errors.
        const existing = await reg.pushManager.getSubscription();
        if (existing) {
          try {
            await existing.unsubscribe();
          } catch {
            // ignore
          }
        }

        // Subscribe to push
        const subscription = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });

        if (removed) return;

        const deviceId = getOrCreateDeviceId();

        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Save subscription to database
        const { error } = await supabase
          .from("device_push_tokens" as any)
          .insert({
            token: JSON.stringify(subscription),
            platform: "web",
            device_id: deviceId,
            enabled: true,
            user_id: user?.id ?? null,
          });

        // Ignore duplicates
        if (error && !isDuplicateTokenError(error)) {
          // eslint-disable-next-line no-console
          console.warn("Failed to save web push subscription", error);
          return;
        }

        // Mark as registered
        localStorage.setItem(WEB_PUSH_REGISTERED_KEY, "true");
        // eslint-disable-next-line no-console
        console.log("Web push subscription registered");
      } catch (e) {
        // eslint-disable-next-line no-console
        console.warn("Web push setup failed", e);
      }
    };

    // Delay registration to avoid blocking initial render
    const timer = setTimeout(run, 2000);

    return () => {
      removed = true;
      clearTimeout(timer);
    };
  }, []);
}
