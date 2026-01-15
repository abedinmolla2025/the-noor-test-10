// Admin security backend function
// - Unlock via passcode (+ optional device fingerprint)
// - Enforce lockout (via verify_admin_passcode RPC)
// - Ensure a dedicated admin user exists and has super_admin role
// - Log events to admin_audit_log

import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const getIp = (req: Request) => {
  const xf = req.headers.get("x-forwarded-for");
  if (xf) return xf.split(",")[0]?.trim() ?? null;
  return req.headers.get("cf-connecting-ip") ?? null;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json(
        { ok: false, error: "Missing backend service credentials" },
        500
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const payload = await req.json().catch(() => null);
    const action = payload?.action;

    // Load config (service role bypasses RLS)
    const { data: cfg, error: cfgErr } = await supabase
      .from("admin_security_config")
      .select("admin_email, require_fingerprint")
      .eq("id", 1)
      .maybeSingle();

    if (cfgErr || !cfg) {
      return json({ ok: false, error: "Admin security not configured" }, 500);
    }

    const adminEmail = String(cfg.admin_email);

    // Ensure admin user exists (so audit logs can reference actor_id even for failed unlocks)
    const ensureAdminUser = async (passwordForSync?: string) => {
      // auth admin API doesn't expose getUserByEmail in all builds; use listUsers and filter.
      const { data: listData, error: listErr } = await supabase.auth.admin.listUsers({
        page: 1,
        perPage: 200,
      });
      if (listErr) throw listErr;

      const existing = (listData?.users ?? []).find((u) => (u.email ?? "").toLowerCase() === adminEmail.toLowerCase());

      if (existing) {
        if (passwordForSync) {
          await supabase.auth.admin.updateUserById(existing.id, { password: passwordForSync });
        }
        return existing;
      }

      const created = await supabase.auth.admin.createUser({
        email: adminEmail,
        password: passwordForSync || "noor-admin-1234",
        email_confirm: true,
      });

      if (created.error || !created.data?.user) throw created.error ?? new Error("Failed to create admin user");
      return created.data.user;
    };

    const logAudit = async (actorId: string, action: string, metadata: Record<string, unknown>) => {
      await supabase.from("admin_audit_log").insert({
        action,
        actor_id: actorId,
        resource_type: "security",
        resource_id: null,
        metadata,
      });
    };

    if (action === "get_config") {
      return json({ ok: true, require_fingerprint: Boolean(cfg.require_fingerprint) });
    }

    if (action === "log_event") {
      const actionName = String(payload?.action_name ?? "");
      const authHeader = req.headers.get("authorization") ?? "";
      const authed = createClient(SUPABASE_URL, SERVICE_KEY, {
        global: { headers: { authorization: authHeader } },
      });
      const claimsRes = await authed.auth.getClaims();
      const sub = (claimsRes.data?.claims as any)?.sub as string | undefined;

      // If not authenticated, still record attempt with the dedicated admin actor.
      const actor = sub ?? (await ensureAdminUser()).id;
      await logAudit(actor, actionName || "security_event", { ip: getIp(req) });
      return json({ ok: true });
    }


    if (action === "set_require_fingerprint") {
      const requireFingerprint = Boolean(payload?.require_fingerprint);

      const authHeader = req.headers.get("authorization") ?? "";
      const authed = createClient(SUPABASE_URL, SERVICE_KEY, {
        global: { headers: { authorization: authHeader } },
      });
      const claimsRes = await authed.auth.getClaims();
      const sub = (claimsRes.data?.claims as any)?.sub as string | undefined;
      if (!sub) return json({ ok: false, error: "permission_denied" }, 401);

      await supabase
        .from("admin_security_config")
        .update({ require_fingerprint: requireFingerprint, updated_at: new Date().toISOString() })
        .eq("id", 1);

      await logAudit(sub, "security_setting_updated", { requireFingerprint, ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "unlock") {
      const passcode = String(payload?.passcode ?? "");
      const deviceFingerprint = payload?.device_fingerprint ? String(payload.device_fingerprint) : null;

      if (Boolean(cfg.require_fingerprint) && !deviceFingerprint) {
        // hard requirement enforced by backend
        const adminUser = await ensureAdminUser();
        await logAudit(adminUser.id, "unlock_failed", { reason: "fingerprint_required", ip: getIp(req) });
        return json({ ok: false, reason: "fingerprint_required" }, 400);
      }

      const adminUser = await ensureAdminUser(passcode);

      // Backend decides pass/fail via RPC (also writes attempt rows)
      const { data: res, error: rpcErr } = await supabase.rpc("verify_admin_passcode", {
        passcode,
        device_fingerprint: deviceFingerprint ?? "(none)",
      });

      if (rpcErr) {
        await logAudit(adminUser.id, "unlock_failed", { reason: "rpc_error", ip: getIp(req), message: rpcErr.message });
        return json({ ok: false, error: "rpc_error" }, 500);
      }

      const row = Array.isArray(res) ? res[0] : res;
      const ok = Boolean(row?.ok);

      if (!ok) {
        await logAudit(adminUser.id, "unlock_failed", {
          reason: row?.reason ?? "invalid",
          locked_until: row?.locked_until ?? null,
          device_fingerprint: deviceFingerprint,
          ip: getIp(req),
        });
        return json({ ok: false, locked_until: row?.locked_until ?? null });
      }

      // Ensure role + profile
      await supabase.from("profiles").upsert({ id: adminUser.id, email: adminEmail, full_name: "Admin" });
      await supabase.from("user_roles").upsert({ user_id: adminUser.id, role: "super_admin" });

      await logAudit(adminUser.id, "unlock_success", {
        device_fingerprint: deviceFingerprint,
        ip: getIp(req),
      });

      return json({ ok: true, admin_email: adminEmail });
    }

    if (action === "change_passcode") {
      const currentPasscode = String(payload?.current_passcode ?? "");
      const newPasscode = String(payload?.new_passcode ?? "");
      const deviceFingerprint = String(payload?.device_fingerprint ?? "");

      if (newPasscode.trim().length < 6 || newPasscode.length > 128) {
        return json({ ok: false, error: "invalid_new_passcode" }, 400);
      }

      // Require a valid authenticated caller (admin)
      const authHeader = req.headers.get("authorization") ?? "";
      const authed = createClient(SUPABASE_URL, SERVICE_KEY, {
        global: { headers: { authorization: authHeader } },
      });
      const claimsRes = await authed.auth.getClaims();
      const sub = (claimsRes.data?.claims as any)?.sub as string | undefined;
      if (!sub) return json({ ok: false, error: "permission_denied" }, 401);

      const { data: verifyRes } = await supabase.rpc("verify_admin_passcode", {
        passcode: currentPasscode,
        device_fingerprint: deviceFingerprint || "(none)",
      });
      const row = Array.isArray(verifyRes) ? verifyRes[0] : verifyRes;
      if (!row?.ok) {
        await logAudit(sub, "unlock_failed", {
          reason: "change_passcode_invalid_current",
          ip: getIp(req),
        });
        return json({ ok: false });
      }

      // Update hashed passcode in DB (bcrypt)
      const { data: rotated, error: rotateErr } = await supabase.rpc("set_admin_passcode", {
        new_passcode: newPasscode,
      });
      if (rotateErr || rotated !== true) {
        await logAudit(sub, "forced_lock", { reason: "passcode_rotate_failed", ip: getIp(req) });
        return json({ ok: false, error: "rotate_failed" }, 500);
      }

      // Keep the dedicated admin user's auth password in sync
      const adminUser = await ensureAdminUser();
      await supabase.auth.admin.updateUserById(adminUser.id, { password: newPasscode });

      await logAudit(sub, "passcode_changed", { ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "revoke_sessions") {
      const authHeader = req.headers.get("authorization") ?? "";
      const authed = createClient(SUPABASE_URL, SERVICE_KEY, {
        global: { headers: { authorization: authHeader } },
      });
      const claimsRes = await authed.auth.getClaims();
      const sub = (claimsRes.data?.claims as any)?.sub as string | undefined;
      if (!sub) return json({ ok: false, error: "permission_denied" }, 401);

      const adminUser = await ensureAdminUser();
      await supabase.auth.admin.signOut(adminUser.id);
      await logAudit(sub, "forced_lock", { ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "history") {
      const authHeader = req.headers.get("authorization") ?? "";
      const authed = createClient(SUPABASE_URL, SERVICE_KEY, {
        global: { headers: { authorization: authHeader } },
      });
      const claimsRes = await authed.auth.getClaims();
      const sub = (claimsRes.data?.claims as any)?.sub as string | undefined;
      if (!sub) return json({ ok: false, error: "permission_denied" }, 401);

      const { data: events } = await supabase
        .from("admin_audit_log")
        .select("*")
        .eq("resource_type", "security")
        .order("created_at", { ascending: false })
        .limit(100);

      return json({ ok: true, events: events ?? [] });
    }

    return json({ ok: false, error: "unknown_action" }, 400);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return json({ ok: false, error: msg }, 500);
  }
});
