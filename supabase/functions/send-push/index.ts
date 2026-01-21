// supabase/functions/send-push/index.ts
/// <reference lib="deno.ns" />

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
// Deno-native Web Push implementation (avoids Node polyfills that crash in the Edge runtime)
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

function normalizeBase64Url(input: string) {
  // Some tooling stores VAPID keys with padding or non-url-safe chars.
  // Web Push expects URL-safe base64 without "=".
  return input
    .trim()
    .replace(/[\s\u00A0]+/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBytes(b64url: string) {
  const cleaned = normalizeBase64Url(b64url);
  const b64 = cleaned.replace(/-/g, "+").replace(/_/g, "/");
  const pad = "=".repeat((4 - (b64.length % 4)) % 4);
  const raw = atob(b64 + pad);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
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
    throw new Error(`FCM send failed: ${res.status} ${text}`);
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
  const subject = Deno.env.get("WEBPUSH_SUBJECT") ?? "";

  if (!publicKey || !privateKey || !subject) {
    throw new Error("Missing WEBPUSH_VAPID_* keys or WEBPUSH_SUBJECT");
  }

  const subscription = JSON.parse(subscriptionJson);

  const vapidDetails = {
    subject,
    publicKey: normalizeBase64Url(publicKey),
    privateKey: normalizeBase64Url(privateKey),
  };

  const vapidDetailsBytes = {
    subject,
    publicKey: base64UrlToBytes(publicKey),
    privateKey: base64UrlToBytes(privateKey),
  };

  const payload = JSON.stringify({
    title,
    body,
    image_url: imageUrl,
    deep_link: deepLink,
  });

  // jsr:@negrel/webpush has slightly different exports across versions.
  // We resolve the send function dynamically to keep this edge function resilient.
  const sendFn =
    (webpush as any).sendNotification ??
    (webpush as any).sendPushMessage ??
    (webpush as any).sendWebPush ??
    null;

  if (!sendFn) {
    throw new Error("webpush_library_missing_send_fn");
  }

  // Returns a standard Response
  const attempt = async (details: any) => {
    const res: Response = await sendFn(subscription, payload, { vapidDetails: details });
    const text = await res.text().catch(() => "");
    if (!res.ok) throw new Error(`webpush_failed_${res.status}: ${text}`);
    return String(res.status);
  };

  try {
    return await attempt(vapidDetails);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    // Some versions expect raw key bytes rather than base64url strings.
    if (msg.toLowerCase().includes("base 64") || msg.toLowerCase().includes("base64")) {
      return await attempt(vapidDetailsBytes);
    }
    throw e;
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) {
      return json(401, { error: "Unauthorized" });
    }

    const { notificationId, platform, dryRun, deviceId, tokenId } = (await req.json()) as SendPushRequest;
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

    for (const t of tokens ?? []) {
      const plat = String(t.platform) as "android" | "ios" | "web";
      try {
        let providerMessageId: string | null = null;

        if (plat === "web") {
          await sendWebPush({
            subscriptionJson: String(t.token),
            title: notif.title,
            body: notif.body,
            imageUrl: notif.image_url ?? null,
            deepLink: notif.deep_link ?? null,
          });
          providerMessageId = "webpush";
        } else {
          providerMessageId =
            (await sendFcm({
              accessToken: googleAccessToken!,
              projectId: fcmProjectId!,
              token: String(t.token),
              title: notif.title,
              body: notif.body,
              imageUrl: notif.image_url ?? null,
              deepLink: notif.deep_link ?? null,
            })) ?? "fcm";
        }

        sent += 1;
        perPlatform[plat].sent += 1;

        await svc.from("notification_deliveries").insert({
          notification_id: notif.id,
          token_id: t.id,
          platform: plat,
          status: "sent",
          provider_message_id: providerMessageId,
        });
      } catch (e) {
        failed += 1;
        perPlatform[plat].failed += 1;

        const msg = e instanceof Error ? e.message : String(e);
        console.error("send failed", { token_id: t.id, platform: plat, msg });

        await svc.from("notification_deliveries").insert({
          notification_id: notif.id,
          token_id: t.id,
          platform: plat,
          status: "failed",
          error_message: msg,
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
