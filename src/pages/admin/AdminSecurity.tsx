import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { Loader2, ShieldAlert, ShieldCheck, Trash2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getDeviceFingerprint } from "@/lib/adminSecurity";

type AuditRow = {
  id: string;
  created_at: string;
  action: string;
  actor_id: string;
  resource_type: string | null;
  resource_id: string | null;
  metadata: any;
};

const AdminSecurity = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [revoking, setRevoking] = useState(false);

  const [requireFingerprint, setRequireFingerprint] = useState(false);
  const [currentPasscode, setCurrentPasscode] = useState("");
  const [newPasscode, setNewPasscode] = useState("");
  const [confirmPasscode, setConfirmPasscode] = useState("");

  const [resetSending, setResetSending] = useState(false);
  const [resetSaving, setResetSaving] = useState(false);
  const [resetCode, setResetCode] = useState("");
  const [resetNewPasscode, setResetNewPasscode] = useState("");
  const [resetConfirmPasscode, setResetConfirmPasscode] = useState("");
  const [events, setEvents] = useState<AuditRow[]>([]);

  const passcodeStrength = useMemo(() => {
    const p = newPasscode;
    if (!p) return { score: 0, label: "" };

    let score = 0;
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasDigit = /\d/.test(p);
    const hasSymbol = /[^A-Za-z0-9]/.test(p);

    if (p.trim().length >= 6) score++;
    if (p.length >= 10) score++;
    if ([hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length >= 2) score++;
    if ([hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length >= 3) score++;

    score = Math.max(0, Math.min(4, score));
    const label = score <= 1 ? "Weak" : score === 2 ? "Okay" : score === 3 ? "Good" : "Strong";
    return { score, label };
  }, [newPasscode]);

  const resetPasscodeStrength = useMemo(() => {
    const p = resetNewPasscode;
    if (!p) return { score: 0, label: "" };

    let score = 0;
    const hasLower = /[a-z]/.test(p);
    const hasUpper = /[A-Z]/.test(p);
    const hasDigit = /\d/.test(p);
    const hasSymbol = /[^A-Za-z0-9]/.test(p);

    if (p.trim().length >= 6) score++;
    if (p.length >= 10) score++;
    if ([hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length >= 2) score++;
    if ([hasLower, hasUpper, hasDigit, hasSymbol].filter(Boolean).length >= 3) score++;

    score = Math.max(0, Math.min(4, score));
    const label = score <= 1 ? "Weak" : score === 2 ? "Okay" : score === 3 ? "Good" : "Strong";
    return { score, label };
  }, [resetNewPasscode]);

  const canChange = useMemo(() => {
    const curOk = currentPasscode.trim().length >= 6;
    const nextOk = newPasscode.trim().length >= 6 && newPasscode.length <= 128;
    const confirmOk = newPasscode.length > 0 && newPasscode === confirmPasscode;
    return curOk && nextOk && confirmOk;
  }, [currentPasscode, newPasscode, confirmPasscode]);

  const canReset = useMemo(() => {
    const codeOk = /^\d{6}$/.test(resetCode.trim());
    const nextOk = resetNewPasscode.trim().length >= 6 && resetNewPasscode.length <= 128;
    const confirmOk = resetNewPasscode.length > 0 && resetNewPasscode === resetConfirmPasscode;
    return codeOk && nextOk && confirmOk;
  }, [resetCode, resetNewPasscode, resetConfirmPasscode]);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-security", {
        body: { action: "get_config" },
      });
      if (error) throw error;
      setRequireFingerprint(Boolean(data?.require_fingerprint));

      const { data: eventsData, error: eventsError } = await supabase.functions.invoke("admin-security", {
        body: { action: "history" },
      });
      if (eventsError) throw eventsError;
      setEvents((eventsData?.events as AuditRow[]) ?? []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveFingerprintSetting = async () => {
    setSaving(true);
    try {
      const { error } = await supabase.functions.invoke("admin-security", {
        body: { action: "set_require_fingerprint", require_fingerprint: requireFingerprint },
      });
      if (error) throw error;
      toast({ title: "Security setting updated" });
      await load();
    } catch (e) {
      toast({ title: "Failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePasscode = async () => {
    if (!canChange) return;
    setSaving(true);
    try {
      // Verify we have a valid session before calling edge function
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        toast({ 
          title: "Session expired", 
          description: "Please unlock admin again.", 
          variant: "destructive" 
        });
        localStorage.removeItem("noor_admin_unlocked");
        navigate("/");
        return;
      }

      const fingerprint = await getDeviceFingerprint();
      const { data, error } = await supabase.functions.invoke("admin-security", {
        body: {
          action: "change_passcode",
          current_passcode: currentPasscode,
          new_passcode: newPasscode,
          device_fingerprint: fingerprint,
        },
      });
      if (error) throw error;

      if (!data?.ok) {
        const err = String(data?.error ?? "");
        const description =
          err === "invalid_current"
            ? "Current passcode is incorrect."
            : err === "passcode_reused"
              ? "You recently used this passcode. Choose a different one."
              : err === "weak_passcode"
                ? "New passcode must be at least 6 characters (max 128)."
                : err === "not_authenticated"
                  ? "Session expired. Please unlock admin again."
                  : err === "not_configured"
                    ? "Admin security is not configured yet. Re-initialize the admin passcode in backend settings."
                    : err === "history_error"
                      ? "Could not check passcode history. Please try again."
                      : err === "config_update_failed"
                        ? "Could not update passcode. Please try again."
                        : err === "verify_failed"
                          ? "Could not verify current passcode. Please try again."
                          : "Passcode change failed.";

        toast({ title: "Failed", description, variant: "destructive" });

        // If auth is missing, clear local unlock so ProtectedRoute will prompt unlock again.
        if (err === "not_authenticated") {
          localStorage.removeItem("noor_admin_unlocked");
        }
        return;
      }

      toast({
        title: "Passcode updated",
        description: "Your admin passcode has been changed.",
      });

      setCurrentPasscode("");
      setNewPasscode("");
      setConfirmPasscode("");
      await load();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      const isAuth = msg.includes("401") || msg.toLowerCase().includes("jwt") || msg.toLowerCase().includes("not authenticated");
      toast({
        title: "Failed",
        description: isAuth ? "Session expired. Please unlock admin again." : msg,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const clearLocalAdminUnlock = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem("noor_admin_unlocked");
    localStorage.removeItem("noor_admin_last_activity");
    localStorage.removeItem("noor_admin_device_fingerprint");
  };

  const handleRequestResetCode = async () => {
    setResetSending(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-security", {
        body: { action: "request_reset_code" },
      });
      if (error) throw error;
      if (!data?.ok) {
        toast({ title: "Failed", description: "Not authorized or backend rejected the request.", variant: "destructive" });
        return;
      }
      toast({ title: "Code sent", description: "A 6-digit verification code was sent to the admin email." });
    } catch (e) {
      toast({ title: "Failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setResetSending(false);
    }
  };

  const handleResetPasscode = async () => {
    if (!canReset) return;
    setResetSaving(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-security", {
        body: {
          action: "reset_passcode_with_code",
          code: resetCode.trim(),
          new_passcode: resetNewPasscode,
        },
      });
      if (error) throw error;

      if (!data?.ok) {
        const err = String(data?.error ?? "");
        const description =
          err === "invalid_code"
            ? "Code must be exactly 6 digits."
            : err === "invalid_or_expired_code"
              ? "Code is invalid or expired. Request a new code."
              : err === "passcode_reused"
                ? "You recently used this passcode. Choose a different one."
                : err === "weak_passcode"
                  ? "New passcode must be at least 6 characters (max 128)."
                  : err === "not_authorized"
                    ? "Not authorized. Please unlock admin again."
                    : "Reset failed.";

        toast({ title: "Failed", description, variant: "destructive" });
        return;
      }

      toast({ title: "Passcode reset", description: "Admin sessions were revoked. Please unlock again." });

      setResetCode("");
      setResetNewPasscode("");
      setResetConfirmPasscode("");

      await load();
      await clearLocalAdminUnlock();
      navigate("/");
    } catch (e) {
      toast({ title: "Failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      setResetSaving(false);
    }
  };

  const handleLockAdmin = async () => {
    setRevoking(true);
    try {
      const { error } = await supabase.functions.invoke("admin-security", {
        body: { action: "revoke_sessions" },
      });
      if (error) throw error;
      toast({ title: "Admin locked" });
    } catch (e) {
      toast({ title: "Failed to lock admin", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      await clearLocalAdminUnlock();
      navigate("/");
      setRevoking(false);
    }
  };

  const handleRevokeAllSessions = async () => {
    setRevoking(true);
    try {
      const { error } = await supabase.functions.invoke("admin-security", {
        body: { action: "revoke_sessions" },
      });
      if (error) throw error;
      toast({ title: "All sessions revoked" });
    } catch (e) {
      toast({ title: "Failed", description: e instanceof Error ? e.message : String(e), variant: "destructive" });
    } finally {
      await clearLocalAdminUnlock();
      navigate("/");
      setRevoking(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-5 w-5 text-primary" />
        <h1 className="text-lg font-semibold">Security</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Admin Protection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Require device fingerprint</p>
              <p className="text-xs text-muted-foreground">If enabled, unlock only works on the same device.</p>
            </div>
            <Switch checked={requireFingerprint} onCheckedChange={setRequireFingerprint} />
          </div>

          <Button variant="outline" onClick={handleSaveFingerprintSetting} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Save security settings
          </Button>

          <Separator />

          <Button
            variant="secondary"
            onClick={() => navigate("/admin/security/backend-status")}
          >
            Backend status
          </Button>

          <Separator />

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="current">Current passcode</Label>
              <Input
                id="current"
                type="password"
                value={currentPasscode}
                onChange={(e) => setCurrentPasscode(e.target.value)}
                autoComplete="current-password"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="next">New passcode</Label>
              <Input
                id="next"
                type="password"
                value={newPasscode}
                onChange={(e) => setNewPasscode(e.target.value)}
                autoComplete="new-password"
              />

              {newPasscode.length > 0 ? (
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">Strength</span>
                    <span className="text-xs text-muted-foreground">{passcodeStrength.label}</span>
                  </div>
                  <Progress value={(passcodeStrength.score / 4) * 100} />
                  <p className="text-[11px] text-muted-foreground">Tip: 10+ chars + mix letters/numbers/symbols.</p>
                </div>
              ) : null}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm">Confirm new passcode</Label>
              <Input
                id="confirm"
                type="password"
                value={confirmPasscode}
                onChange={(e) => setConfirmPasscode(e.target.value)}
                autoComplete="new-password"
              />
              {confirmPasscode.length > 0 && newPasscode !== confirmPasscode ? (
                <p className="text-xs text-destructive">Passcodes do not match.</p>
              ) : null}
            </div>
          </div>

          <Button onClick={handleChangePasscode} disabled={!canChange || saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
            Change passcode
          </Button>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium">Reset passcode with 6-digit code</p>
                <p className="text-xs text-muted-foreground">Sends a verification code to the configured admin email.</p>
              </div>
              <Button variant="outline" onClick={handleRequestResetCode} disabled={resetSending}>
                {resetSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Send code
              </Button>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <Label htmlFor="reset-code">6-digit code</Label>
                <Input
                  id="reset-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={resetCode}
                  onChange={(e) => setResetCode(e.target.value)}
                  placeholder="123456"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-next">New passcode</Label>
                <Input
                  id="reset-next"
                  type="password"
                  value={resetNewPasscode}
                  onChange={(e) => setResetNewPasscode(e.target.value)}
                  autoComplete="new-password"
                />

                {resetNewPasscode.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Strength</span>
                      <span className="text-xs text-muted-foreground">{resetPasscodeStrength.label}</span>
                    </div>
                    <Progress value={(resetPasscodeStrength.score / 4) * 100} />
                    <p className="text-[11px] text-muted-foreground">Tip: 10+ chars + mix letters/numbers/symbols.</p>
                  </div>
                ) : null}
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset-confirm">Confirm new passcode</Label>
                <Input
                  id="reset-confirm"
                  type="password"
                  value={resetConfirmPasscode}
                  onChange={(e) => setResetConfirmPasscode(e.target.value)}
                  autoComplete="new-password"
                />
                {resetConfirmPasscode.length > 0 && resetNewPasscode !== resetConfirmPasscode ? (
                  <p className="text-xs text-destructive">Passcodes do not match.</p>
                ) : null}
              </div>
            </div>

            <Button onClick={handleResetPasscode} disabled={!canReset || resetSaving}>
              {resetSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShieldAlert className="mr-2 h-4 w-4" />}
              Reset passcode & revoke sessions
            </Button>
          </div>

          <Separator />

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" onClick={handleLockAdmin} disabled={revoking} className="sm:flex-1">
              {revoking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Lock admin
            </Button>

            <Button variant="destructive" onClick={handleRevokeAllSessions} disabled={revoking} className="sm:flex-1">
              {revoking ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
              Revoke all sessions
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Unlock History</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {events.length === 0 ? (
            <p className="text-sm text-muted-foreground">No events yet.</p>
          ) : (
            <div className="space-y-2">
              {events.map((e) => (
                <div key={e.id} className="rounded-lg border border-border p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium">{e.action}</p>
                    <p className="text-xs text-muted-foreground">{new Date(e.created_at).toLocaleString()}</p>
                  </div>
                  {e.metadata && (
                    <pre className="mt-2 overflow-auto rounded-md bg-muted p-2 text-[11px] text-muted-foreground">
                      {JSON.stringify(e.metadata, null, 2)}
                    </pre>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSecurity;
