import { useCallback, useEffect, useMemo, useState } from "react";
import { RefreshCcw, Server } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

type CheckStatus = "idle" | "loading" | "ok" | "error";

type CheckResult = {
  status: CheckStatus;
  details?: string;
};

function statusBadgeVariant(status: CheckStatus): "default" | "secondary" | "destructive" | "outline" {
  if (status === "ok") return "default";
  if (status === "error") return "destructive";
  if (status === "loading") return "secondary";
  return "outline";
}

function statusLabel(status: CheckStatus) {
  if (status === "ok") return "OK";
  if (status === "error") return "ERROR";
  if (status === "loading") return "Checking…";
  return "—";
}

export default function BackendHealthWidget() {
  const [adminSecurity, setAdminSecurity] = useState<CheckResult>({ status: "idle" });
  const [sendPush, setSendPush] = useState<CheckResult>({ status: "idle" });
  const [webpushPublicKey, setWebpushPublicKey] = useState<CheckResult>({ status: "idle" });
  const [lastCheckedAt, setLastCheckedAt] = useState<string | null>(null);

  const overall: CheckStatus = useMemo(() => {
    const statuses = [adminSecurity.status, sendPush.status, webpushPublicKey.status];
    if (statuses.some((s) => s === "loading")) return "loading";
    if (statuses.some((s) => s === "error")) return "error";
    if (statuses.every((s) => s === "ok")) return "ok";
    return "idle";
  }, [adminSecurity.status, sendPush.status, webpushPublicKey.status]);

  const runChecks = useCallback(async () => {
    setAdminSecurity({ status: "loading" });
    setSendPush({ status: "loading" });
    setWebpushPublicKey({ status: "loading" });

    const [adminRes, sendPushRes, webpushRes] = await Promise.all([
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("admin-security", {
            body: { action: "get_config" },
          });
          if (error) throw error;
          if (!data?.ok) throw new Error(String(data?.error ?? "unknown"));
          return { status: "ok" as const };
        } catch (e) {
          return { status: "error" as const, details: e instanceof Error ? e.message : String(e) };
        }
      })(),
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("send-push", {
            body: { action: "health" },
          });
          if (error) throw error;
          if (!data?.ok) throw new Error(String(data?.error ?? "unknown"));
          return { status: "ok" as const };
        } catch (e) {
          return { status: "error" as const, details: e instanceof Error ? e.message : String(e) };
        }
      })(),
      (async () => {
        try {
          const { data, error } = await supabase.functions.invoke("webpush-public-key", { body: {} });
          if (error) throw error;
          const key = String(data?.publicKey ?? "");
          if (!key) throw new Error("missing_public_key");
          return { status: "ok" as const };
        } catch (e) {
          return { status: "error" as const, details: e instanceof Error ? e.message : String(e) };
        }
      })(),
    ]);

    setAdminSecurity(adminRes);
    setSendPush(sendPushRes);
    setWebpushPublicKey(webpushRes);
    setLastCheckedAt(new Date().toLocaleString());
  }, []);

  useEffect(() => {
    void runChecks();
  }, [runChecks]);

  return (
    <Card className="bg-card/70 border border-border/60 rounded-2xl shadow-soft">
      <CardHeader className="pb-1 pt-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base flex items-center gap-2">
            <span className="text-xl">🩺</span>
            <span className="font-semibold">Backend health</span>
            <Badge variant={statusBadgeVariant(overall)} className="ml-1">
              {statusLabel(overall)}
            </Badge>
          </CardTitle>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void runChecks()}
            className="gap-2"
          >
            <RefreshCcw className="h-4 w-4" />
            Check
          </Button>
        </div>
        {lastCheckedAt ? (
          <p className="text-xs text-muted-foreground mt-1">Last checked: {lastCheckedAt}</p>
        ) : null}
      </CardHeader>
      <CardContent className="pt-2 pb-5">
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-primary" />
              <span className="font-medium">admin-security</span>
            </div>
            <Badge variant={statusBadgeVariant(adminSecurity.status)}>{statusLabel(adminSecurity.status)}</Badge>
          </div>
          {adminSecurity.status === "error" && adminSecurity.details ? (
            <p className="text-xs text-muted-foreground break-words">{adminSecurity.details}</p>
          ) : null}

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-primary" />
              <span className="font-medium">send-push</span>
            </div>
            <Badge variant={statusBadgeVariant(sendPush.status)}>{statusLabel(sendPush.status)}</Badge>
          </div>
          {sendPush.status === "error" && sendPush.details ? (
            <p className="text-xs text-muted-foreground break-words">{sendPush.details}</p>
          ) : null}

          <Separator />

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Server className="h-4 w-4 text-primary" />
              <span className="font-medium">webpush-public-key</span>
            </div>
            <Badge variant={statusBadgeVariant(webpushPublicKey.status)}>{statusLabel(webpushPublicKey.status)}</Badge>
          </div>
          {webpushPublicKey.status === "error" && webpushPublicKey.details ? (
            <p className="text-xs text-muted-foreground break-words">{webpushPublicKey.details}</p>
          ) : null}

          <p className="text-[11px] text-muted-foreground mt-2">
            Note: This checks function availability/config only (it does not send notifications).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
