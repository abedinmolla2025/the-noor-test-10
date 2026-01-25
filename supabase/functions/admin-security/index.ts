// Admin security backend function
// - Unlock via passcode (+ optional device fingerprint)
// - Enforce lockout (via verify_admin_passcode RPC)
// - Ensure a dedicated admin user exists and has super_admin role
// - Log events to admin_audit_log

import { createClient } from "npm:@supabase/supabase-js@2.89.0";

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

const randomDigits = (n: number) => {
  const bytes = new Uint8Array(n);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => String(b % 10))
    .join("");
};

const randomHex = (bytesLen: number) => {
  const bytes = new Uint8Array(bytesLen);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
};

const sha256Hex = async (input: string) => {
  const data = new TextEncoder().encode(input);
  const digest = await crypto.subtle.digest("SHA-256", data);
  const bytes = new Uint8Array(digest);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

    const requireAdminRequester = async (): Promise<string | null> => {
      const sub = await getRequesterId();
      if (!sub) return null;
      const { data: isAdmin, error: isAdminErr } = await supabase.rpc("is_admin", { _user_id: sub });
      if (isAdminErr) throw isAdminErr;
      if (!isAdmin) return null;
      return sub;
    };

    const getAdminActorId = async () => {
      const adminUser = await ensureAdminUser();
      return adminUser.id;
    };

    // Load config (service role bypasses RLS).
    // IMPORTANT: passcode hashing/verification is done in Postgres (crypt), not in JS.
    // If the config row is missing (common in remixes), we auto-bootstrap it with secure defaults:
    // - random initial passcode (unknown to anyone)
    // - require_fingerprint=false
    // Then the admin should use the "request_reset_code" flow to set a known passcode.
    const ensureConfig = async (): Promise<{
      cfg: { id: number; admin_email: string; require_fingerprint: boolean; passcode_hash: string };
      bootstrapped: boolean;
    }> => {
      const { data: existing, error: existingErr } = await supabase
        .from("admin_security_config")
        .select("id, admin_email, require_fingerprint, passcode_hash")
        .eq("id", 1)
        .maybeSingle();

      if (existingErr) throw existingErr;

      if (existing?.passcode_hash) {
        return {
          cfg: {
            id: Number(existing.id),
            admin_email: String(existing.admin_email),
            require_fingerprint: Boolean(existing.require_fingerprint),
            passcode_hash: String(existing.passcode_hash),
          },
          bootstrapped: false,
        };
      }

      // Auto-bootstrap
      const initialPasscode = `${randomDigits(6)}-${randomHex(8)}`; // random + non-guessable, not meant for direct use
      
      // Use RPC directly - it handles INSERT OR UPDATE (upsert) atomically with hash set
      const { data: setOk, error: setErr } = await supabase.rpc("set_admin_passcode", {
        new_passcode: initialPasscode,
      });
      if (setErr || !setOk) throw setErr ?? new Error("bootstrap_set_passcode_failed");

      // Seed history best-effort (reuse protections)
      const { data: updatedCfg, error: updatedCfgErr } = await supabase
        .from("admin_security_config")
        .select("id, admin_email, require_fingerprint, passcode_hash")
        .eq("id", 1)
        .single();
      if (updatedCfgErr || !updatedCfg?.passcode_hash) throw updatedCfgErr ?? new Error("bootstrap_read_failed");

      try {
        await supabase
          .from("admin_passcode_history")
          .insert({ passcode_hash: String(updatedCfg.passcode_hash) });
      } catch {
        // best-effort: history seeding should not block bootstrap
      }

      return {
        cfg: {
          id: Number(updatedCfg.id),
          admin_email: String(updatedCfg.admin_email),
          require_fingerprint: Boolean(updatedCfg.require_fingerprint),
          passcode_hash: String(updatedCfg.passcode_hash),
        },
        bootstrapped: true,
      };
    };

    const { cfg, bootstrapped } = await ensureConfig();

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

    const sendResetEmail = async (to: string, code: string) => {
      const apiKey = Deno.env.get("RESEND_API_KEY");
      if (!apiKey) throw new Error("missing_resend_api_key");

      // NOTE: Custom FROM domains can fail if the domain isn't verified. We try a
      // configured sender first, then fallback to Resend's onboarding sender.
      const preferredFrom = Deno.env.get("RESEND_FROM_EMAIL") || "";
      const fallbackFrom = "Lovable <onboarding@resend.dev>";

      const html = `
        <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto; line-height: 1.5;">
          <h2 style="margin: 0 0 12px;">Admin passcode reset</h2>
          <p style="margin: 0 0 12px;">Your verification code is:</p>
          <div style="font-size: 28px; font-weight: 700; letter-spacing: 6px; padding: 12px 16px; border: 1px solid #e5e7eb; border-radius: 10px; display: inline-block;">${code}</div>
          <p style="margin: 12px 0 0; color: #6b7280; font-size: 12px;">This code expires in 10 minutes. If you didn’t request this, you can ignore this email.</p>
        </div>
      `;

      const send = async (from: string) => {
        const resp = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from,
            to: [to],
            subject: "Admin passcode reset code",
            html,
          }),
        });

        const t = await resp.text().catch(() => "");
        if (!resp.ok) {
          throw new Error(`resend_failed_${resp.status}: ${t}`);
        }

        // consume body (already done via text) + return parsed payload if needed
        return t;
      };

      if (preferredFrom) {
        try {
          await send(preferredFrom);
          return;
        } catch (e) {
          // fallback below
          console.warn(
            "Preferred RESEND_FROM_EMAIL failed, falling back to onboarding sender:",
            e instanceof Error ? e.message : String(e),
          );
        }
      }

      await send(fallbackFrom);
    };

    if (action === "get_config") {
      return json({ ok: true, require_fingerprint: Boolean(cfg.require_fingerprint), bootstrapped });
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

      const sub = await requireAdminRequester();
      if (!sub) return json({ ok: false, error: "not_authorized" }, 200);

      await supabase
        .from("admin_security_config")
        .update({ require_fingerprint: requireFingerprint, updated_at: new Date().toISOString() })
        .eq("id", 1);

      await logAudit(sub, "security_setting_updated", { requireFingerprint, ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "unlock") {
      if (bootstrapped) {
        // We just created a secure random passcode unknown to the user.
        // Force the safer reset-code flow rather than encouraging guessing.
        return json(
          {
            ok: false,
            error: "setup_required",
            message: "Admin security was initialized. Please request a reset code to set a new passcode.",
          },
          200,
        );
      }

      const passcode = String(payload?.passcode ?? "");
      const deviceFingerprint = payload?.device_fingerprint ? String(payload.device_fingerprint) : null;

      if (Boolean(cfg.require_fingerprint) && !deviceFingerprint) {
        // hard requirement enforced by backend
        const adminUser = await ensureAdminUser();
        await logAudit(adminUser.id, "unlock_failed", { reason: "fingerprint_required", ip: getIp(req) });
        // Return 200 so the client can show a specific message (avoid generic non-2xx error)
        return json({ ok: false, reason: "fingerprint_required" }, 200);
      }

      const adminUser = await ensureAdminUser(passcode);

      // Backend decides pass/fail via RPC (also writes attempt rows)
       const { data: res, error: rpcErr } = await supabase.rpc("verify_admin_passcode", {
          _passcode: passcode,
          _device_fingerprint: deviceFingerprint ?? "no-fingerprint",
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

      // Always return 200 + ok=false for expected/handled errors so the client
      // doesn't surface a generic "non-2xx" message.
      if (next.trim().length < 6 || next.length > 128) {
        return json({ ok: false, error: "weak_passcode" }, 200);
      }

      // Require a valid authenticated caller (admin)
      const sub = await requireAdminRequester();
      if (!sub) return json({ ok: false, error: "not_authorized" }, 200);

      const { data: cfgRow, error: cfgRowErr } = await supabase
        .from("admin_security_config")
        .select("passcode_hash")
        .eq("id", 1)
        .maybeSingle();

      if (cfgRowErr || !cfgRow?.passcode_hash) {
        return json({ ok: false, error: "not_configured" }, 500);
      }

      // Validate current passcode using DB crypt verifier (also applies lockout rules)
      const { data: verifyRes, error: verifyErr } = await supabase.rpc("verify_admin_passcode", {
        _passcode: current,
        _device_fingerprint: "(change_passcode)",
      });

      if (verifyErr) return json({ ok: false, error: "verify_failed" }, 500);

      const verifyRow = Array.isArray(verifyRes) ? verifyRes[0] : verifyRes;
      if (!verifyRow?.ok) {
        await logAudit(sub, "unlock_failed", {
          reason: "change_passcode_invalid_current",
          ip: getIp(req),
        });
        return json({ ok: false, error: "invalid_current" }, 200);
      }

      // Prevent reuse (last 5)
      const { data: isReused, error: reusedErr } = await supabase.rpc("is_recent_admin_passcode", {
        _passcode: next,
        _limit: 5,
      });

      if (reusedErr) return json({ ok: false, error: "history_error" }, 500);
      if (isReused) return json({ ok: false, error: "passcode_reused" }, 200);

      // Update config hash in DB
      const { data: updatedOk, error: updateRpcErr } = await supabase.rpc("update_admin_passcode", {
        new_passcode: next,
      });

      if (updateRpcErr || !updatedOk) return json({ ok: false, error: "config_update_failed" }, 500);

      // Store latest hash in history (read it back after update)
      const { data: updatedCfg, error: updatedCfgErr } = await supabase
        .from("admin_security_config")
        .select("passcode_hash")
        .eq("id", 1)
        .single();

      if (updatedCfgErr || !updatedCfg?.passcode_hash) return json({ ok: false, error: "history_insert_failed" }, 500);

      const { error: insertErr } = await supabase.from("admin_passcode_history").insert({
        passcode_hash: String(updatedCfg.passcode_hash),
      });
      if (insertErr) return json({ ok: false, error: "history_insert_failed" }, 500);

      // Keep the dedicated admin user's auth password in sync
      const adminUser = await ensureAdminUser();
      await supabase.auth.admin.updateUserById(adminUser.id, { password: next });

      await logAudit(sub, "passcode_changed", { ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "revoke_sessions") {
      const sub = await requireAdminRequester();
      if (!sub) return json({ ok: false, error: "not_authorized" }, 200);

      const adminUser = await ensureAdminUser();
      await supabase.auth.admin.signOut(adminUser.id);
      await logAudit(sub, "forced_lock", { ip: getIp(req) });
      return json({ ok: true });
    }

    if (action === "history") {
      const sub = await requireAdminRequester();
      if (!sub) return json({ ok: false, error: "not_authorized" }, 200);

      const { data: events } = await supabase
        .from("admin_audit_log")
        .select("*")
        .eq("resource_type", "security")
        .order("created_at", { ascending: false })
        .limit(100);

      return json({ ok: true, events: events ?? [] });
    }

    if (action === "request_reset_code") {
      // This must work even when the admin is locked out (no session).
      // Throttle by IP to prevent email abuse.
      const ip = getIp(req);

      // Simple IP throttle: max 3 requests / 15 minutes
      if (ip) {
        const { count, error: countErr } = await supabase
          .from("admin_passcode_reset_tokens")
          .select("id", { count: "exact", head: true })
          .eq("admin_email", adminEmail)
          .eq("requested_ip", ip)
          .gte("created_at", new Date(Date.now() - 15 * 60 * 1000).toISOString());
        if (countErr) return json({ ok: false, error: "throttle_check_failed" }, 500);
        if ((count ?? 0) >= 3) {
          const actor = await getAdminActorId();
          await logAudit(actor, "passcode_reset_throttled", { ip });
          return json({ ok: false, error: "too_many_requests" }, 200);
        }
      }

      const code = randomDigits(6);
      const salt = randomHex(16);
      const codeHash = await sha256Hex(`${code}:${salt}`);
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();

      // Invalidate any previous unused tokens (best-effort)
      await supabase
        .from("admin_passcode_reset_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("admin_email", adminEmail)
        .is("used_at", null);

      const requester = await getRequesterId();
      const { error: insertErr } = await supabase.from("admin_passcode_reset_tokens").insert({
        admin_email: adminEmail,
        code_hash: codeHash,
        code_salt: salt,
        requested_ip: ip,
        requested_user_id: requester,
        expires_at: expiresAt,
      });
      if (insertErr) return json({ ok: false, error: "token_insert_failed" }, 500);

      const actor = requester ?? (await getAdminActorId());
      try {
        await sendResetEmail(adminEmail, code);
      } catch (e) {
        await logAudit(actor, "passcode_reset_email_failed", {
          ip,
          message: e instanceof Error ? e.message : String(e),
        });
        // Return 200 so client can display a specific message (avoid generic non-2xx).
        return json(
          {
            ok: false,
            error: "email_send_failed",
            details: e instanceof Error ? e.message : String(e),
          },
          200,
        );
      }

      await logAudit(actor, "passcode_reset_code_requested", { ip });
      // Return the destination email for transparency in UI (helps debug “no code received”).
      return json({ ok: true, to: adminEmail });
    }

    if (action === "reset_passcode_with_code") {
      // This must work even when the admin is locked out (no session).
      const sub = await getRequesterId();
      const actor = sub ?? (await getAdminActorId());

      const code = String(payload?.code ?? "").trim();
      const next = String(payload?.new_passcode ?? "");

      if (!/^\d{6}$/.test(code)) return json({ ok: false, error: "invalid_code" }, 200);
      if (next.trim().length < 6 || next.length > 128) return json({ ok: false, error: "weak_passcode" }, 200);

      const { data: rows, error: selErr } = await supabase
        .from("admin_passcode_reset_tokens")
        .select("id, code_hash, code_salt, expires_at, used_at")
        .eq("admin_email", adminEmail)
        .is("used_at", null)
        .order("created_at", { ascending: false })
        .limit(5);
      if (selErr) return json({ ok: false, error: "token_fetch_failed" }, 500);

      const now = Date.now();
      let matchedId: string | null = null;

      for (const r of rows ?? []) {
        const exp = new Date(String(r.expires_at)).getTime();
        if (!Number.isFinite(exp) || exp <= now) continue;
        const h = await sha256Hex(`${code}:${String(r.code_salt ?? "")}`);
        if (h === String(r.code_hash)) {
          matchedId = String(r.id);
          break;
        }
      }

      if (!matchedId) {
        await logAudit(actor, "passcode_reset_failed", { reason: "invalid_or_expired_code", ip: getIp(req) });
        return json({ ok: false, error: "invalid_or_expired_code" }, 200);
      }

      // Mark token used
      await supabase
        .from("admin_passcode_reset_tokens")
        .update({ used_at: new Date().toISOString() })
        .eq("id", matchedId);

      // Prevent reuse (last 5)
      const { data: isReused, error: reusedErr } = await supabase.rpc("is_recent_admin_passcode", {
        _passcode: next,
        _limit: 5,
      });
      if (reusedErr) return json({ ok: false, error: "history_error" }, 500);
      if (isReused) return json({ ok: false, error: "passcode_reused" }, 200);

      const { data: updatedOk, error: updateRpcErr } = await supabase.rpc("update_admin_passcode", { new_passcode: next });
      if (updateRpcErr || !updatedOk) return json({ ok: false, error: "config_update_failed" }, 500);

      const { data: updatedCfg, error: updatedCfgErr } = await supabase
        .from("admin_security_config")
        .select("passcode_hash")
        .eq("id", 1)
        .single();
      if (updatedCfgErr || !updatedCfg?.passcode_hash) return json({ ok: false, error: "history_insert_failed" }, 500);

      const { error: insertErr } = await supabase.from("admin_passcode_history").insert({ passcode_hash: String(updatedCfg.passcode_hash) });
      if (insertErr) return json({ ok: false, error: "history_insert_failed" }, 500);

      // Sync dedicated admin user password
      const adminUser = await ensureAdminUser();
      await supabase.auth.admin.updateUserById(adminUser.id, { password: next });

      // Revoke admin sessions after reset
      await supabase.auth.admin.signOut(adminUser.id);

      await logAudit(actor, "passcode_reset_success", { ip: getIp(req) });
      return json({ ok: true, revoked: true });
    }

    return json({ ok: false, error: "unknown_action" }, 200);
  } catch (e) {
    // Properly serialize all error types (Supabase errors, Error objects, etc.)
    let msg: string;
    if (e instanceof Error) {
      msg = e.message;
    } else if (typeof e === "object" && e !== null) {
      msg = JSON.stringify(e);
    } else {
      msg = String(e);
    }
    console.error("admin-security error:", msg);
    return json({ ok: false, error: msg }, 500);
  }
});
