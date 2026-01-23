// supabase/functions/send-push/index.ts
/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Web Push provider (works in Edge runtime when bundled for Deno)
// Deno-native Web Push (avoids Node crypto APIs like crypto.ECDH which are not available here)
import * as webpush from "jsr:@negrel/webpush";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

type SendPushRequest = {
  notificationId: string;
  /** Optional override: if provided, sends only to this platform */
  platform?: "all" | "android" | "ios" | "web";
  /** Optional: if provided, sends only to this device_id (recommended for diagnostics) */
  deviceId?: string;
  /** Optional: if provided, sends only to this token row id (recommended for diagnostics) */
  tokenId?: string;
  /** If true, do not actually send; only validate + count targets */
  dryRun?: boolean;
};

type DeliveryLogInsert = {
  notification_id: string;
  token_id: string;
  platform: string;
  status: "sent" | "failed";
  provider_message_id?: string | null;
  error_code?: string | null;
  error_message?: string | null;
  subscription_endpoint?: string | null;
  endpoint_host?: string | null;
  browser?: string | null;
  stage?: string | null;
};

function isValidIdLike(input: unknown, min: number, max: number): input is string {
  if (typeof input !== "string") return false;
  const v = input.trim();
  return v.length >= min && v.length <= max;
}

function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      ...extraHeaders,
      "Content-Type": "application/json",
    },
  });
}

function base64UrlEncode(bytes: Uint8Array) {
  let str = "";
  for (const b of bytes) str += String.fromCharCode(b);
  // btoa is available in Deno
  return btoa(str).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToUint8Array(base64Url: string) {
  // Convert base64url -> base64
  const b64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob(b64 + pad);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i += 1) out[i] = raw.charCodeAt(i);
  return out;
}

function normalizeBase64Url(input: string) {
  // Some tooling stores VAPID keys with padding or non-url-safe chars.
  // Web Push expects URL-safe base64 without "=".
  return input
    .trim()
    .replace(/[\s\u00A0]+/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
    // Remove any stray punctuation (quotes, commas, etc.)
    .replace(/[^A-Za-z0-9\-_]/g, "");
}

function normalizeVapidSubject(input: string) {
  // Expect something like: "mailto:admin@example.com" or "https://example.com"
  return input
    .trim()
    .replace(/[\s\u00A0]+/g, "")
    .replace(/^mailto:</i, "mailto:")
    .replace(/>$/g, "")
    .replace(/<|>/g, "")
    .replace(/^["']+|["',]+$/g, "");
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getHostFromUrl(url: string | null | undefined) {
  if (!url) return null;
  try {
    return new URL(url).host;
  } catch {
    return null;
  }
}

function guessBrowserFromEndpointHost(host: string | null) {
  const h = (host ?? "").toLowerCase();
  if (!h) return null;
  if (h.includes("google") || h.includes("fcm") || h.includes("gstatic")) return "chrome";
  if (h.includes("mozilla") || h.includes("push.services.mozilla")) return "firefox";
  if (h.includes("windows") || h.includes("wns")) return "edge";
  if (h.includes("apple")) return "safari";
  return null;
}

function isRetryableStatus(status: number) {
  return status === 429 || (status >= 500 && status <= 599);
}

async function withRetry<T>(fn: (attempt: number) => Promise<T>, opts?: { retries?: number; baseDelayMs?: number }) {
  const retries = Math.max(0, opts?.retries ?? 2);
  const baseDelayMs = Math.max(50, opts?.baseDelayMs ?? 400);

  let lastErr: unknown;
  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn(attempt);
    } catch (e) {
      lastErr = e;
      if (attempt >= retries) break;
      // Exponential backoff with small jitter
      const jitter = Math.floor(Math.random() * 150);
      const delay = baseDelayMs * Math.pow(2, attempt) + jitter;
      await sleep(delay);
    }
  }
  throw lastErr;
}


async function signRs256JWT(privateKeyPem: string, header: Record<string, unknown>, payload: Record<string, unknown>) {
  const enc = new TextEncoder();
  const headerB64 = base64UrlEncode(enc.encode(JSON.stringify(header)));
  const payloadB64 = base64UrlEncode(enc.encode(JSON.stringify(payload)));
  const data = `${headerB64}.${payloadB64}`;

  const pem = privateKeyPem
    .replace(/-----BEGIN PRIVATE KEY-----/g, "")
    .replace(/-----END PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");

  const raw = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey(
    "pkcs8",
    raw.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, enc.encode(data));
  const sigB64 = base64UrlEncode(new Uint8Array(sig));
  return `${data}.${sigB64}`;
}

async function getGoogleAccessToken(serviceAccountJson: string) {
  const sa = JSON.parse(serviceAccountJson) as {
    client_email: string;
    private_key: string;
    token_uri?: string;
    project_id?: string;
  };

  if (!sa.client_email || !sa.private_key) {
    throw new Error("FCM service account JSON missing client_email/private_key");
  }

  const now = Math.floor(Date.now() / 1000);
  const tokenUri = sa.token_uri ?? "https://oauth2.googleapis.com/token";

  const assertion = await signRs256JWT(
    sa.private_key,
    { alg: "RS256", typ: "JWT" },
    {
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/firebase.messaging",
      aud: tokenUri,
      iat: now,
      exp: now + 60 * 60,
    },
  );

  const res = await fetch(tokenUri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`Failed to get Google access token: ${res.status} ${txt}`);
  }

  const data = (await res.json()) as { access_token: string };
  if (!data.access_token) throw new Error("No access_token in Google token response");
  return { accessToken: data.access_token, projectId: sa.project_id };
}

async function sendFcm({
  accessToken,
  projectId,
  token,
  title,
  body,
  imageUrl,
  deepLink,
}: {
  accessToken: string;
  projectId: string;
  token: string;
  title: string;
  body: string;
  imageUrl: string | null;
  deepLink: string | null;
}) {
  const url = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;

  const message: any = {
    token,
    notification: {
      title,
      body,
      ...(imageUrl ? { image: imageUrl } : {}),
    },
    data: {
      ...(deepLink ? { deep_link: deepLink } : {}),
      ...(imageUrl ? { image_url: imageUrl } : {}),
    },
  };

  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ message }),
  });

  const text = await res.text().catch(() => "");
  if (!res.ok) {
    // Preserve status in error string so caller can classify.
    throw new Error(`fcm_failed_${res.status}: ${text}`);
  }

  // Response is { name: "projects/.../messages/..." }
  const parsed = JSON.parse(text);
  return parsed?.name as string | undefined;
}

async function sendWebPush({
  subscriptionJson,
  title,
  body,
  imageUrl,
  deepLink,
}: {
  subscriptionJson: string;
  title: string;
  body: string;
  imageUrl: string | null;
  deepLink: string | null;
}) {
  const publicKey = Deno.env.get("WEBPUSH_VAPID_PUBLIC_KEY") ?? "";
  const privateKey = Deno.env.get("WEBPUSH_VAPID_PRIVATE_KEY") ?? "";
  const subject = normalizeVapidSubject(Deno.env.get("WEBPUSH_SUBJECT") ?? "");

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Missing WEBPUSH_VAPID_* keys or WEBPUSH_SUBJECT");
  }

  const subscription = JSON.parse(subscriptionJson);

  const publicKeyB64Url = normalizeBase64Url(publicKey);
  const privateKeyB64Url = normalizeBase64Url(privateKey);

  // @negrel/webpush expects WebCrypto-friendly key material (Uint8Array / JWK).
  // Passing base64url strings can trigger SubtleCrypto.importKey() errors.
  const vapidDetails = {
    subject,
    publicKey: base64UrlToUint8Array(publicKeyB64Url),
    privateKey: base64UrlToUint8Array(privateKeyB64Url),
  };

  const payload = JSON.stringify({
    title,
    body,
    image_url: imageUrl,
    deep_link: deepLink,
  });

  const w = webpush as any;

  // Helpful for diagnosing runtime export differences
  const g = globalThis as any;
  if (!g.__WEBPUSH_EXPORTS_LOGGED__) {
    g.__WEBPUSH_EXPORTS_LOGGED__ = true;
    try {
      console.log("webpush_exports", Object.keys(w));
    } catch {
      // ignore
    }
  }

  // Try function-style APIs (preferred)
  const sendFn = w.sendNotification ?? w.sendPushMessage ?? w.sendWebPush;
  if (typeof sendFn === "function") {
    const res: Response = await sendFn(subscription, payload, { vapidDetails });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error(`webpush_failed_${res.status}: ${text}`);
    return String(res.status);
  }

  // Try class-style API
  const ApplicationServer = w.ApplicationServer;
  if (typeof ApplicationServer === "function") {
    const importVapidKeys = w.importVapidKeys;
    const vapidKeys =
      typeof importVapidKeys === "function"
        ? await importVapidKeys({
            publicKey: vapidDetails.publicKey,
            privateKey: vapidDetails.privateKey,
          })
        : {
            publicKey: vapidDetails.publicKey,
            privateKey: vapidDetails.privateKey,
          };

    const server = new ApplicationServer({
      contactInformation: subject,
      vapidKeys,
    });

    const PushSubscriber = w.PushSubscriber;
    if (typeof PushSubscriber === "function") {
      const subscriber = new PushSubscriber(subscription);

      const pushText = subscriber.pushTextMessage ?? subscriber.pushMessage ?? null;
      if (typeof pushText === "function") {
        // Different versions accept either (payload, { applicationServer }) or (payload, applicationServer)
        const tryCall = async (arg2: any) => {
          const res: Response = await pushText.call(subscriber, payload, arg2);
          const text = await res.text().catch(() => "");
          if (!res.ok) throw new Error(`webpush_failed_${res.status}: ${text}`);
          return String(res.status);
        };

        try {
          return await tryCall({ applicationServer: server });
        } catch {
          return await tryCall(server);
        }
      }
    }

    // Some versions expose server.send(subscription, payload)
    if (typeof server.sendNotification === "function") {
      const res: Response = await server.sendNotification(subscription, payload);
      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(`webpush_failed_${res.status}: ${text}`);
      return String(res.status);
    }
    if (typeof server.send === "function") {
      const res: Response = await server.send(subscription, payload);
      const text = await res.text().catch(() => "");
      if (!res.ok) throw new Error(`webpush_failed_${res.status}: ${text}`);
      return String(res.status);
    }
  }

  throw new Error("webpush_send_not_supported_by_library");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    // Read body once (request streams can only be consumed once)
    const rawBody = await req.text().catch(() => "");
    const body: any = rawBody
      ? (() => {
          try {
            return JSON.parse(rawBody);
          } catch {
            return null;
          }
        })()
      : {};

    // Public health check (no secrets, no side effects)
    // Used by the Settings "Backend health" widget.
    if (body && typeof body === "object" && body.action === "health") {
      return json(200, { ok: true });
    }

    if (body === null) {
      return json(400, { error: "Invalid JSON" });
    }

    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json(401, { error: "Unauthorized" });
    }

    const { notificationId, platform, dryRun, deviceId, tokenId } = body as SendPushRequest;
    if (!notificationId || typeof notificationId !== "string") {
      return json(400, { error: "notificationId is required" });
    }

    // Optional diagnostics filters
    if (deviceId !== undefined && !isValidIdLike(deviceId, 8, 128)) {
      return json(400, { error: "Invalid deviceId" });
    }
    if (tokenId !== undefined && !isValidIdLike(tokenId, 8, 128)) {
      return json(400, { error: "Invalid tokenId" });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Authed client for authorization checks (uses caller JWT)
    const authed = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const jwt = authHeader.slice("Bearer ".length);
    const { data: claims, error: claimsErr } = await authed.auth.getClaims(jwt);
    if (claimsErr || !claims?.claims?.sub) {
      return json(401, { error: "Unauthorized" });
    }

    const userId = claims.claims.sub as string;
    const { data: isAdmin, error: isAdminErr } = await authed.rpc("is_admin", { _user_id: userId });
    if (isAdminErr || !isAdmin) {
      return json(403, { error: "Forbidden" });
    }

    // Service client for reading tokens + writing delivery logs regardless of RLS
    const svc = createClient(supabaseUrl, serviceKey);

    const { data: notif, error: notifErr } = await svc
      .from("notifications")
      .select("id,title,body,image_url,deep_link,target_platform,status")
      .eq("id", notificationId)
      .maybeSingle();

    if (notifErr || !notif) {
      return json(404, { error: "Notification not found" });
    }

    const effectiveTarget = platform ?? (notif.target_platform as any) ?? "all";
    const allowedPlatforms = ((): Array<"android" | "ios" | "web"> => {
      if (effectiveTarget === "android") return ["android"];
      if (effectiveTarget === "ios") return ["ios"];
      if (effectiveTarget === "web") return ["web"];
      return ["android", "ios", "web"]; // all
    })();

    let tokensQuery = svc
      .from("device_push_tokens")
      .select("id,token,platform")
      .eq("enabled", true)
      .in("platform", allowedPlatforms);

    if (deviceId) tokensQuery = tokensQuery.eq("device_id", deviceId);
    if (tokenId) tokensQuery = tokensQuery.eq("id", tokenId);

    const { data: tokens, error: tokensErr } = await tokensQuery;

    if (tokensErr) {
      console.error("token fetch error", tokensErr);
      return json(500, { error: "Failed to fetch tokens" });
    }

    if (dryRun) {
      return json(200, {
        ok: true,
        dryRun: true,
        notificationId,
        target_platform: effectiveTarget,
        targets: tokens?.length ?? 0,
      });
    }

    // Prepare providers
    let googleAccessToken: string | null = null;
    let fcmProjectId: string | null = null;

    if (allowedPlatforms.some((p) => p === "android" || p === "ios")) {
      const saJson = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON") ?? "";
      if (!saJson) throw new Error("Missing FCM_SERVICE_ACCOUNT_JSON");
      const tok = await getGoogleAccessToken(saJson);
      googleAccessToken = tok.accessToken;
      fcmProjectId = tok.projectId ?? null;
      if (!fcmProjectId) throw new Error("FCM service account JSON missing project_id");
    }

    // Send sequentially (safe); can be parallelized later with rate-limiting
    let sent = 0;
    let failed = 0;
    const perPlatform: Record<string, { sent: number; failed: number }> = {
      android: { sent: 0, failed: 0 },
      ios: { sent: 0, failed: 0 },
      web: { sent: 0, failed: 0 },
    };

    const logDelivery = async (row: DeliveryLogInsert) => {
      const { error } = await svc.from("notification_deliveries").insert(row as any);
      if (error) console.warn("delivery log insert failed", error);
    };

    const disableToken = async (tokenId: string) => {
      // Best-effort: mark bad tokens disabled to reduce repeated failures.
      await svc.from("device_push_tokens").update({ enabled: false }).eq("id", tokenId);
    };

    for (const t of tokens ?? []) {
      const plat = String(t.platform) as "android" | "ios" | "web";
      try {
        let providerMessageId: string | null = null;
        const tokenIdStr = String(t.id);

        const baseLog: Omit<DeliveryLogInsert, "status"> = {
          notification_id: notif.id,
          token_id: tokenIdStr,
          platform: plat,
        };

        if (plat === "web") {
          let endpoint: string | null = null;
          let endpointHost: string | null = null;
          try {
            const sub = JSON.parse(String(t.token));
            endpoint = typeof sub?.endpoint === "string" ? sub.endpoint : null;
            endpointHost = getHostFromUrl(endpoint);
          } catch {
            // ignore parse errors here; sendWebPush will throw if invalid
          }
          const browser = guessBrowserFromEndpointHost(endpointHost);

          providerMessageId = await withRetry(
            async () => {
              const status = await sendWebPush({
                subscriptionJson: String(t.token),
                title: notif.title,
                body: notif.body,
                imageUrl: notif.image_url ?? null,
                deepLink: notif.deep_link ?? null,
              });
              // For web push, we store status code as provider id
              return `webpush_${status}`;
            },
            { retries: 2, baseDelayMs: 450 },
          );

          await logDelivery({
            ...baseLog,
            status: "sent",
            provider_message_id: providerMessageId,
            subscription_endpoint: endpoint,
            endpoint_host: endpointHost,
            browser,
            stage: "webpush_send",
          });
        } else {
          providerMessageId = await withRetry(
            async (attempt) => {
              // If we got 401/403 from Google, refresh token once.
              if (attempt > 0) {
                const saJson = Deno.env.get("FCM_SERVICE_ACCOUNT_JSON") ?? "";
                const tok = await getGoogleAccessToken(saJson);
                googleAccessToken = tok.accessToken;
              }
              return (
                (await sendFcm({
                  accessToken: googleAccessToken!,
                  projectId: fcmProjectId!,
                  token: String(t.token),
                  title: notif.title,
                  body: notif.body,
                  imageUrl: notif.image_url ?? null,
                  deepLink: notif.deep_link ?? null,
                })) ?? "fcm"
              );
            },
            { retries: 2, baseDelayMs: 350 },
          );

          await logDelivery({
            ...baseLog,
            status: "sent",
            provider_message_id: providerMessageId,
            stage: "fcm_send",
          });
        }

        sent += 1;
        perPlatform[plat].sent += 1;
      } catch (e) {
        failed += 1;
        perPlatform[plat].failed += 1;

        const msg = e instanceof Error ? e.message : String(e);
        console.error("send failed", { token_id: t.id, platform: plat, msg });

        const tokenIdStr = String(t.id);
        const errorCode = (() => {
          const m = msg.toLowerCase();
          if (m.includes("webpush_failed_")) return m.match(/webpush_failed_(\d+)/)?.[1] ? `http_${m.match(/webpush_failed_(\d+)/)?.[1]}` : null;
          if (m.includes("fcm_failed_")) return m.match(/fcm_failed_(\d+)/)?.[1] ? `http_${m.match(/fcm_failed_(\d+)/)?.[1]}` : null;
          if (m.includes("timeout")) return "timeout";
          return null;
        })();

        let endpoint: string | null = null;
        let endpointHost: string | null = null;
        let browser: string | null = null;
        if (String(t.platform) === "web") {
          try {
            const sub = JSON.parse(String(t.token));
            endpoint = typeof sub?.endpoint === "string" ? sub.endpoint : null;
            endpointHost = getHostFromUrl(endpoint);
            browser = guessBrowserFromEndpointHost(endpointHost);
          } catch {
            // ignore
          }
        }

        // If the provider says the subscription/token is gone, disable it.
        if (errorCode === "http_404" || errorCode === "http_410") {
          await disableToken(tokenIdStr);
        }

        await logDelivery({
          notification_id: notif.id,
          token_id: tokenIdStr,
          platform: plat,
          status: "failed",
          error_code: errorCode,
          error_message: msg,
          subscription_endpoint: endpoint,
          endpoint_host: endpointHost,
          browser,
          stage: plat === "web" ? "webpush_send" : "fcm_send",
        });
      }
    }

    const finalStatus = failed > 0 && sent === 0 ? "failed" : "sent";
    await svc
      .from("notifications")
      .update({ status: finalStatus, sent_at: new Date().toISOString() })
      .eq("id", notif.id);

    return json(200, {
      ok: true,
      notificationId: notif.id,
      status: finalStatus,
      totals: { sent, failed, targets: tokens?.length ?? 0 },
      perPlatform,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("send-push error", msg);
    return json(500, { error: msg });
  }
});
