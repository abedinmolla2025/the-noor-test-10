// supabase/functions/webpush-public-key/index.ts
/// <reference lib="deno.ns" />

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

function json(status: number, body: unknown) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
    },
  });
}

function normalizeBase64Url(input: string) {
  return input
    .trim()
    .replace(/[\s\u00A0]+/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "")
    .replace(/[^A-Za-z0-9\-_]/g, "");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const publicKey = Deno.env.get("WEBPUSH_VAPID_PUBLIC_KEY") ?? "";
    if (!publicKey) return json(500, { error: "Missing WEBPUSH_VAPID_PUBLIC_KEY" });

    return json(200, { publicKey: normalizeBase64Url(publicKey) });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json(500, { error: msg });
  }
});
