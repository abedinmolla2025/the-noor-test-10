import { useEffect, useMemo, useState } from "react";
import { Capacitor } from "@capacitor/core";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Bell, CheckCircle2, KeyRound, Loader2, Send, ShieldAlert, Smartphone } from "lucide-react";
import { Link } from "react-router-dom";
import { PushTestResults, type DeliveryRow } from "@/components/admin/PushTestResults";

const DEVICE_ID_KEY = "noor_device_id";

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

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type TargetPlatform = "all" | "android" | "ios" | "web";

type WebPushState = {
  swSupported: boolean;
  permission: NotificationPermission | "unsupported";
  hasSubscription: boolean;
};

export default function AdminNotificationsDiagnostics() {
  const { toast } = useToast();
  const [authInfo, setAuthInfo] = useState<{ id: string; email: string | null } | null>(null);
  const [adminOk, setAdminOk] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);

  const isNative = Capacitor.isNativePlatform();
  const platform = isNative ? Capacitor.getPlatform() : "web";
  const deviceId = getOrCreateDeviceId();
  const thisDeviceTarget = ((): TargetPlatform => {
    if (!isNative) return "web";
    return platform === "ios" ? "ios" : "android";
  })();

  const [webState, setWebState] = useState<WebPushState>({
    swSupported: "serviceWorker" in navigator && "PushManager" in window,
    permission: typeof Notification === "undefined" ? "unsupported" : Notification.permission,
    hasSubscription: false,
  });

  const [testTitle, setTestTitle] = useState("Test notification");
  const [testBody, setTestBody] = useState("Assalamu Alaikum — this is a diagnostics test.");
  const [testImageUrl, setTestImageUrl] = useState("");
  const [testDeepLink, setTestDeepLink] = useState("/notifications");
  const [testTarget, setTestTarget] = useState<TargetPlatform>("all");

  const [lastResult, setLastResult] = useState<
    | null
    | {
        notificationId: string;
        totals: { sent: number; failed: number; targets: number };
        perPlatform: Record<string, { sent: number; failed: number }>;
        deliveries: DeliveryRow[];
      }
  >(null);

  const statusRows = useMemo(
    () =>
      [
        { label: "Runtime", value: isNative ? "Native (Capacitor)" : "Web" },
        { label: "Platform", value: String(platform) },
        { label: "Device ID", value: deviceId },
        {
          label: "Notification permission",
          value: webState.permission === "unsupported" ? "Unsupported" : webState.permission,
        },
        { label: "Service worker supported", value: webState.swSupported ? "Yes" : "No" },
        { label: "Web push subscription", value: webState.hasSubscription ? "Present" : "Missing" },
      ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isNative, platform, deviceId, webState.permission, webState.swSupported, webState.hasSubscription],
  );

  const refreshAuth = async () => {
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user) {
      setAuthInfo(null);
      setAdminOk(null);
      return;
    }
    setAuthInfo({ id: data.user.id, email: data.user.email ?? null });

    const { data: isAdmin, error: adminErr } = await supabase.rpc("is_admin", { _user_id: data.user.id });
    if (adminErr) throw adminErr;
    setAdminOk(!!isAdmin);
  };

  const refreshWebSubscription = async () => {
    if (!("serviceWorker" in navigator)) {
      setWebState((s) => ({ ...s, swSupported: false, hasSubscription: false }));
      return;
    }
    const reg = await navigator.serviceWorker.getRegistration();
    const sub = await reg?.pushManager.getSubscription();
    setWebState((s) => ({
      ...s,
      swSupported: "PushManager" in window,
      permission: typeof Notification === "undefined" ? "unsupported" : Notification.permission,
      hasSubscription: !!sub,
    }));
  };

  useEffect(() => {
    (async () => {
      try {
        await refreshAuth();
      } catch {
        // ignore
      } finally {
        await refreshWebSubscription().catch(() => undefined);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const registerWebPush = async () => {
    if (isNative) {
      toast({ title: "Web push is for browsers only", description: "Native push uses FCM/APNS." });
      return;
    }

    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      toast({ title: "Not supported", description: "This browser does not support Web Push.", variant: "destructive" });
      return;
    }

    setLoading(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        setWebState((s) => ({ ...s, permission }));
        toast({ title: "Permission denied", description: "Enable notifications in browser settings." });
        return;
      }

      const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

      const { data: keyRes, error: keyErr } = await supabase.functions.invoke("webpush-public-key", { body: {} });
      if (keyErr) throw keyErr;
      const publicKey = String(keyRes?.publicKey ?? "");
      if (!publicKey) throw new Error("Missing public key");

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      const deviceId = getOrCreateDeviceId();
      const token = JSON.stringify(subscription);

      const { error } = await supabase
        .from("device_push_tokens" as any)
        .insert({
          token,
          platform: "web",
          device_id: deviceId,
          enabled: true,
        });

      if (error && !isDuplicateTokenError(error)) throw error;

      toast({
        title: "Web push registered",
        description: "Subscription saved. You can now run a test-send.",
      });

      await refreshWebSubscription();
    } catch (e: any) {
      toast({ title: "Web push setup failed", description: e?.message ?? "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const runTest = async (dryRun: boolean, scope: "all" | "this_device") => {
    setLoading(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const nowIso = new Date().toISOString();

      const { data: created, error: insErr } = await supabase
        .from("notifications")
        .insert({
          title: testTitle.trim(),
          body: testBody.trim(),
          image_url: testImageUrl.trim() ? testImageUrl.trim() : null,
          deep_link: testDeepLink.trim() ? testDeepLink.trim() : null,
          target_platform: "all",
          status: "draft",
          created_by: user.id,
          created_at: nowIso,
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

      const { data: res, error } = await supabase.functions.invoke("send-push", {
        body: {
          notificationId: created.id,
          platform: scope === "this_device" ? thisDeviceTarget : testTarget,
          deviceId: scope === "this_device" ? deviceId : undefined,
          dryRun,
        },
      });
      if (error) throw error;

      if (!dryRun) {
        // Pull latest delivery rows to show clear diagnostics immediately.
        const { data: deliveries, error: dErr } = await supabase
          .from("notification_deliveries" as any)
          .select("id,delivered_at,platform,status,stage,error_code,error_message,endpoint_host,browser")
          .eq("notification_id", created.id)
          .order("delivered_at", { ascending: false })
          .limit(50);
        if (dErr) throw dErr;

        setLastResult({
          notificationId: created.id,
          totals: {
            sent: Number(res?.totals?.sent ?? 0),
            failed: Number(res?.totals?.failed ?? 0),
            targets: Number(res?.totals?.targets ?? 0),
          },
          perPlatform: (res?.perPlatform ?? {}) as any,
          deliveries: (deliveries ?? []) as any,
        });
      } else {
        setLastResult(null);
      }

      if (dryRun) {
        toast({
          title: "Dry run OK",
          description:
            scope === "this_device"
              ? `This device • Platform: ${thisDeviceTarget} • Targets: ${res?.targets ?? 0}`
              : `Target: ${res?.target_platform ?? testTarget} • Targets: ${res?.targets ?? 0}`,
        });
      } else {
        toast({
          title: "Test send triggered",
          description:
            scope === "this_device"
              ? `This device • Sent: ${res?.totals?.sent ?? 0}, Failed: ${res?.totals?.failed ?? 0}`
              : `Sent: ${res?.totals?.sent ?? 0}, Failed: ${res?.totals?.failed ?? 0}`,
        });
      }
    } catch (e: any) {
      const desc =
        typeof e?.message === "string"
          ? e.message
          : (() => {
              try {
                return JSON.stringify(e);
              } catch {
                return "Please try again.";
              }
            })();
      toast({ title: "Test failed", description: desc, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifications Diagnostics</h1>
            <p className="text-sm text-muted-foreground">Permission, token registration, and test-send tools.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link to="/admin/notifications">Back to Send</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/notifications/history">History</Link>
            </Button>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4" />
            Auth & Environment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Signed in</span>
              <span className="font-medium">{authInfo ? authInfo.email ?? authInfo.id : "No"}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Admin access</span>
              <span className="font-medium">
                {adminOk === null ? "—" : adminOk ? "Yes" : "No"}
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={() => refreshAuth().catch(() => undefined)} disabled={loading}>
              Refresh
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {isNative ? <Smartphone className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
            Registration Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2 rounded-lg border border-border p-3 text-sm">
            {statusRows.map((r) => (
              <div key={r.label} className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-muted-foreground">{r.label}</span>
                <span className="font-medium break-all">{r.value}</span>
              </div>
            ))}
          </div>

          {!isNative && (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                Web Push requires a browser permission + service worker subscription.
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => refreshWebSubscription()} disabled={loading}>
                  Check
                </Button>
                <Button onClick={registerWebPush} disabled={loading} className="gap-2">
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
                  Enable Web Push
                </Button>
              </div>
            </div>
          )}

          {isNative && (
            <p className="text-sm text-muted-foreground">
              Native push tokens are registered automatically when the app runs on Android/iOS.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Test Send
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Title</Label>
              <Input value={testTitle} onChange={(e) => setTestTitle(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Target platform (override)</Label>
              <Select value={testTarget} onValueChange={(v) => setTestTarget(v as TargetPlatform)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Body</Label>
            <Textarea value={testBody} onChange={(e) => setTestBody(e.target.value)} rows={4} className="text-sm" />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Image URL (optional)</Label>
              <Input value={testImageUrl} onChange={(e) => setTestImageUrl(e.target.value)} placeholder="https://…" className="h-9 text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Deep link (optional)</Label>
              <Input value={testDeepLink} onChange={(e) => setTestDeepLink(e.target.value)} placeholder="/notifications" className="h-9 text-sm" />
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => runTest(true, "this_device")}
              disabled={loading || adminOk !== true}
              title={adminOk !== true ? "Admin access required" : undefined}
            >
              Dry run (this device)
            </Button>
            <Button
              onClick={() => runTest(false, "this_device")}
              disabled={loading || adminOk !== true}
              className="gap-2"
              title={adminOk !== true ? "Admin access required" : undefined}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send to this device
            </Button>

            <Button
              variant="outline"
              onClick={() => runTest(true, "all")}
              disabled={loading || adminOk !== true}
              title={adminOk !== true ? "Admin access required" : undefined}
            >
              Dry run (all)
            </Button>
            <Button
              onClick={() => runTest(false, "all")}
              disabled={loading || adminOk !== true}
              className="gap-2"
              title={adminOk !== true ? "Admin access required" : undefined}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Send to all
            </Button>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: Test sends create a notification record (visible in History).
          </p>
        </CardContent>
      </Card>

      {lastResult ? (
        <PushTestResults
          notificationId={lastResult.notificationId}
          totals={lastResult.totals}
          perPlatform={lastResult.perPlatform}
          deliveries={lastResult.deliveries}
        />
      ) : null}
    </div>
  );
}
