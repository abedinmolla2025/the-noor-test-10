import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { RefreshCw, RotateCcw, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";

type NotificationRow = {
  id: string;
  title: string;
  body: string;
  target_platform: string;
  status: string;
  created_at: string;
  scheduled_at: string | null;
  sent_at: string | null;
};

type DeliveryRow = {
  notification_id: string;
  platform: string;
  status: string;
};

function StatusBadge({ status }: { status: string }) {
  const variant = status === "sent" ? "default" : status === "failed" ? "destructive" : "secondary";
  return <Badge variant={variant as any}>{status}</Badge>;
}

export default function AdminNotificationsHistory() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<NotificationRow[]>([]);
  const [deliveries, setDeliveries] = useState<DeliveryRow[]>([]);
  const [q, setQ] = useState("");

  const load = async () => {
    setLoading(true);
    try {
      const { data: notifs, error: nErr } = await supabase
        .from("notifications")
        .select("id,title,body,target_platform,status,created_at,scheduled_at,sent_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (nErr) throw nErr;

      const ids = (notifs ?? []).map((n) => n.id);
      let delivs: DeliveryRow[] = [];
      if (ids.length) {
        const { data: d, error: dErr } = await supabase
          .from("notification_deliveries")
          .select("notification_id,platform,status")
          .in("notification_id", ids)
          .limit(5000);
        if (dErr) throw dErr;
        delivs = (d ?? []) as any;
      }

      setItems((notifs ?? []) as any);
      setDeliveries(delivs);
    } catch (e: any) {
      toast({
        title: "Failed to load history",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const statsByNotification = useMemo(() => {
    const map = new Map<
      string,
      {
        android: { sent: number; failed: number };
        ios: { sent: number; failed: number };
        web: { sent: number; failed: number };
      }
    >();

    for (const d of deliveries) {
      const key = d.notification_id;
      if (!map.has(key)) {
        map.set(key, {
          android: { sent: 0, failed: 0 },
          ios: { sent: 0, failed: 0 },
          web: { sent: 0, failed: 0 },
        });
      }
      const entry = map.get(key)!;
      const plat = (d.platform as "android" | "ios" | "web") ?? "web";
      const bucket = entry[plat] ?? entry.web;
      if (d.status === "sent") bucket.sent += 1;
      else bucket.failed += 1;
    }

    return map;
  }, [deliveries]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((n) => {
      return (
        n.title.toLowerCase().includes(query) ||
        n.body.toLowerCase().includes(query) ||
        n.status.toLowerCase().includes(query) ||
        n.target_platform.toLowerCase().includes(query)
      );
    });
  }, [items, q]);

  const handleResend = async (notificationId: string) => {
    try {
      toast({ title: "Sending…" });
      const { data, error } = await supabase.functions.invoke("send-push", {
        body: { notificationId },
      });
      if (error) throw error;

      toast({
        title: "Triggered resend",
        description: `Sent: ${data?.totals?.sent ?? 0}, Failed: ${data?.totals?.failed ?? 0}`,
      });
      await load();
    } catch (e: any) {
      toast({
        title: "Resend failed",
        description: e?.message ?? "Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">History + per-platform delivery stats.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link to="/admin/notifications">Send</Link>
            </Button>
            <Button asChild>
              <Link to="/admin/notifications/history">History</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/admin/notifications/diagnostics">Diagnostics</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search notifications…" className="pl-9" />
        </div>

        <Button variant="outline" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={"h-4 w-4" + (loading ? " animate-spin" : "")} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4">
        {filtered.map((n) => {
          const st = statsByNotification.get(n.id) ?? {
            android: { sent: 0, failed: 0 },
            ios: { sent: 0, failed: 0 },
            web: { sent: 0, failed: 0 },
          };

          return (
            <Card key={n.id}>
              <CardHeader className="space-y-3">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <CardTitle className="truncate">{n.title}</CardTitle>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{n.body}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <StatusBadge status={n.status} />
                    <Badge variant="outline">{n.target_platform}</Badge>
                  </div>
                </div>

                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <div>
                    <span className="font-medium text-foreground">Created:</span> {new Date(n.created_at).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Scheduled:</span> {n.scheduled_at ? new Date(n.scheduled_at).toLocaleString() : "—"}
                  </div>
                  <div>
                    <span className="font-medium text-foreground">Sent:</span> {n.sent_at ? new Date(n.sent_at).toLocaleString() : "—"}
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="grid gap-2 sm:grid-cols-3">
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground">Android</p>
                    <p className="mt-1 text-sm">Sent: {st.android.sent} • Failed: {st.android.failed}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground">iOS</p>
                    <p className="mt-1 text-sm">Sent: {st.ios.sent} • Failed: {st.ios.failed}</p>
                  </div>
                  <div className="rounded-md border border-border p-3">
                    <p className="text-xs font-medium text-muted-foreground">Web</p>
                    <p className="mt-1 text-sm">Sent: {st.web.sent} • Failed: {st.web.failed}</p>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                  <Button variant="outline" className="gap-2" onClick={() => handleResend(n.id)}>
                    <RotateCcw className="h-4 w-4" />
                    Resend
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}

        {!filtered.length && (
          <Card>
            <CardContent className="py-10 text-center text-sm text-muted-foreground">No notifications found.</CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
