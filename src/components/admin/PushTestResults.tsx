import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export type PushTestTotals = {
  sent: number;
  failed: number;
  targets: number;
};

export type PushTestPerPlatform = Record<string, { sent: number; failed: number }>;

export type DeliveryRow = {
  id: string;
  delivered_at: string;
  platform: string;
  status: string;
  stage: string | null;
  error_code: string | null;
  error_message: string | null;
  endpoint_host: string | null;
  browser: string | null;
};

function badgeVariant(status: string) {
  if (status === "sent") return "default" as const;
  if (status === "failed") return "destructive" as const;
  return "secondary" as const;
}

export function PushTestResults({
  notificationId,
  totals,
  perPlatform,
  deliveries,
}: {
  notificationId: string;
  totals: PushTestTotals;
  perPlatform: PushTestPerPlatform;
  deliveries: DeliveryRow[];
}) {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Result</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-2 text-sm">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Notification ID</span>
              <span className="font-medium break-all">{notificationId}</span>
            </div>
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <span className="text-muted-foreground">Totals</span>
              <span className="font-medium">
                Sent: {totals.sent} • Failed: {totals.failed} • Targets: {totals.targets}
              </span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(perPlatform).map(([k, v]) => (
              <div key={k} className="rounded-lg border border-border p-3">
                <div className="text-xs text-muted-foreground">{k}</div>
                <div className="text-sm font-medium">Sent {v.sent} • Failed {v.failed}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Delivery log (latest)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Error</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {deliveries.length ? (
                deliveries.map((d) => (
                  <TableRow key={d.id}>
                    <TableCell>
                      <Badge variant={badgeVariant(d.status)}>{String(d.status).toUpperCase()}</Badge>
                    </TableCell>
                    <TableCell>{d.platform}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{d.stage ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {(d.endpoint_host ?? "") + (d.browser ? ` (${d.browser})` : "") || "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {d.status === "failed" ? `${d.error_code ?? "error"}: ${d.error_message ?? ""}` : "—"}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="text-sm text-muted-foreground">
                    No delivery rows yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
