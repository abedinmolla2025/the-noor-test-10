import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { getDeviceFingerprint } from "@/lib/adminSecurity";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUnlocked?: () => void;
};

export const AdminUnlockModal = ({ open, onOpenChange, onUnlocked }: Props) => {
  const [passcode, setPasscode] = useState("");
  const [useFingerprint, setUseFingerprint] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => passcode.trim().length >= 6 && passcode.length <= 128, [passcode]);

  useEffect(() => {
    if (!open) {
      setError(null);
      setSubmitting(false);
      setPasscode("");
      setUseFingerprint(true);
    }
  }, [open]);

  const handleUnlock = async () => {
    setError(null);

    if (!canSubmit) {
      setError("Passcode must be at least 6 characters.");
      return;
    }

    setSubmitting(true);
    try {
      const fingerprint = useFingerprint ? await getDeviceFingerprint() : null;

      const { data, error: fnError } = await supabase.functions.invoke("admin-security", {
        body: {
          action: "unlock",
          passcode,
          device_fingerprint: fingerprint,
        },
      });

      if (fnError) throw fnError;

      if (!data?.ok) {
        if (data?.locked_until) {
          setError(`Locked out until ${new Date(data.locked_until).toLocaleTimeString()}.`);
        } else {
          setError("Invalid passcode.");
        }
        return;
      }

      // Hidden admin sign-in (no user-facing login system)
      const adminEmail = String(data.admin_email ?? "");
      if (!adminEmail) throw new Error("Missing admin_email from backend");

      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: adminEmail,
        password: passcode,
      });
      if (signInError) {
        // avoid leaking details
        setError("Unlock succeeded but sign-in failed. Please try again.");
        return;
      }

      // CRITICAL: Wait for session to fully establish before setting unlock state
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData?.session) {
        setError("Session failed to establish. Please try again.");
        return;
      }

      if (fingerprint) {
        localStorage.setItem("noor_admin_device_fingerprint", fingerprint);
      } else {
        localStorage.removeItem("noor_admin_device_fingerprint");
      }
      localStorage.setItem("noor_admin_unlocked", "1");
      localStorage.setItem("noor_admin_last_activity", String(Date.now()));

      onOpenChange(false);
      onUnlocked?.();
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      setError(msg || "Failed to unlock.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Admin Unlock
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="admin-passcode">Admin passcode</Label>
            <Input
              id="admin-passcode"
              type="password"
              autoComplete="one-time-code"
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              placeholder="Enter passcode"
            />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">Device fingerprint</p>
              <p className="text-xs text-muted-foreground">Bind admin unlock to this device (optional)</p>
            </div>
            <Switch checked={useFingerprint} onCheckedChange={setUseFingerprint} />
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <Button className="w-full" onClick={handleUnlock} disabled={!canSubmit || submitting}>
            {submitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Unlocking...
              </>
            ) : (
              "Unlock Admin"
            )}
          </Button>

          <p className="text-[11px] text-muted-foreground">
            Security note: default passcode is <span className="font-medium">noor-admin-1234</span>. Change it
            immediately in <span className="font-medium">/admin/security</span>.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};
