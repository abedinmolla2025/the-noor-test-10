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
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");

    if (!SUPABASE_URL || !SERVICE_KEY) {
      return json(
        { ok: false, error: "Missing backend service credentials" },
        500
      );
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

    const payload = await req.json().catch(() => null);
    const action = payload?.action;

    const DEFAULT_ADMIN_EMAIL = "admin@noor.app";
    const DEFAULT_PASSCODE = "noor-admin-1234";

    const authHeader = req.headers.get("authorization") ?? "";

    // Use ANON_KEY for validating end-user JWTs (service role key is for privileged admin ops).
    const authClient = createClient(SUPABASE_URL, ANON_KEY ?? SERVICE_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const getRequesterId = async (): Promise<string | null> => {
      if (!authHeader || !authHeader.toLowerCase().startsWith("bearer ")) return null;
      const { data, error } = await authClient.auth.getUser();
      if (error || !data?.user) return null;
      return data.user.id;
    };

    // Load config (service role bypasses RLS). If missing/invalid, auto-create a safe default.
    const ensureConfig = async () => {
      const { data: existing, error: existingErr } = await supabase
        .from("admin_security_config")
        .select("id, admin_email, require_fingerprint, passcode_hash")
        .eq("id", 1)
        .maybeSingle();

      if (existingErr) throw existingErr;

      // Create/repair if row missing or required fields are empty.
      if (!existing?.passcode_hash || !String(existing.admin_email ?? "").trim()) {
        const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");
        const passcodeHash = existing?.passcode_hash ?? (await bcrypt.hash(DEFAULT_PASSCODE));

        const adminEmail = String(existing?.admin_email ?? DEFAULT_ADMIN_EMAIL).trim() || DEFAULT_ADMIN_EMAIL;
        const requireFingerprint = Boolean(existing?.require_fingerprint ?? false);

        const { data: upserted, error: upsertErr } = await supabase
          .from("admin_security_config")
          .upsert(
            {
              id: 1,
              admin_email: adminEmail,
              passcode_hash: passcodeHash,
              require_fingerprint: requireFingerprint,
              failed_attempts: 0,
              locked_until: null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "id" }
          )
          .select("id, admin_email, require_fingerprint, passcode_hash")
          .single();

        if (upsertErr || !upserted) throw upsertErr ?? new Error("Failed to initialize admin security config");
        return upserted;
      }

      return existing;
    };

    const cfg = await ensureConfig();

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
      const sub = await getRequesterId();

      // If not authenticated, still record attempt with the dedicated admin actor.
      const actor = sub ?? (await ensureAdminUser()).id;
      await logAudit(actor, actionName || "security_event", { ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "set_require_fingerprint") {
      const requireFingerprint = Boolean(payload?.require_fingerprint);

      const sub = await getRequesterId();
      if (!sub) return json({ ok: false, error: "not_authenticated" }, 200);

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
          _passcode: passcode,
          _device_fingerprint: deviceFingerprint ?? "(none)",
        });

       if (rpcErr) {
         await logAudit(adminUser.id, "unlock_failed", {
           reason: "rpc_error",
           ip: getIp(req),
           message: rpcErr.message,
         });
         return json({ ok: false, error: "rpc_error", details: rpcErr.message }, 500);
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
      const current = String(payload?.current_passcode ?? "");
      const next = String(payload?.new_passcode ?? "");

      if (next.trim().length < 6 || next.length > 128) {
        return json({ ok: false, error: "weak_passcode" }, 400);
      }

      // Require a valid authenticated caller (admin)
      const sub = await getRequesterId();
      if (!sub) return json({ ok: false, error: "not_authenticated" }, 200);

      const { data: cfgRow, error: cfgRowErr } = await supabase
        .from("admin_security_config")
        .select("passcode_hash")
        .eq("id", 1)
        .maybeSingle();

      if (cfgRowErr || !cfgRow?.passcode_hash) {
        return json({ ok: false, error: "not_configured" }, 500);
      }

      const bcrypt = await import("https://deno.land/x/bcrypt@v0.4.1/mod.ts");

      const valid = await bcrypt.compare(current, String(cfgRow.passcode_hash));
      if (!valid) {
        await logAudit(sub, "unlock_failed", {
          reason: "change_passcode_invalid_current",
          ip: getIp(req),
        });
        return json({ ok: false, error: "invalid_current" }, 403);
      }

      const { data: historyData, error: historyErr } = await supabase
        .from("admin_passcode_history")
        .select("passcode_hash")
        .order("created_at", { ascending: false })
        .limit(5);

      if (historyErr) return json({ ok: false, error: "history_error" }, 500);

      for (const h of historyData ?? []) {
        if (await bcrypt.compare(next, String((h as any).passcode_hash))) {
          return json({ ok: false, error: "passcode_reused" }, 409);
        }
      }

      const newHash = await bcrypt.hash(next);

      const { error: insertErr } = await supabase.from("admin_passcode_history").insert({
        passcode_hash: newHash,
      });
      if (insertErr) return json({ ok: false, error: "history_insert_failed" }, 500);

      const { error: updateErr } = await supabase
        .from("admin_security_config")
        .update({
          passcode_hash: newHash,
          failed_attempts: 0,
          locked_until: null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", 1);

      if (updateErr) return json({ ok: false, error: "config_update_failed" }, 500);

      // Keep the dedicated admin user's auth password in sync
      const adminUser = await ensureAdminUser();
      await supabase.auth.admin.updateUserById(adminUser.id, { password: next });

      await logAudit(sub, "passcode_changed", { ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "revoke_sessions") {
      const sub = await getRequesterId();
      if (!sub) return json({ ok: false, error: "not_authenticated" }, 200);

      const adminUser = await ensureAdminUser();
      await supabase.auth.admin.signOut(adminUser.id);
      await logAudit(sub, "forced_lock", { ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "history") {
      const sub = await getRequesterId();
      if (!sub) return json({ ok: false, error: "not_authenticated" }, 200);

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
