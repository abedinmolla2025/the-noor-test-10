import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAdmin } from "@/contexts/AdminContext";
import { DollarSign } from "lucide-react";
import type { AdPlacement, AdTargetPlatform } from "@/lib/ads";
import { ALL_PLACEMENTS } from "@/lib/ads";

type AdminAdRow = {
  id: string;
  title: string;
  image_path: string | null;
  link_url: string | null;
  button_text: string | null;
  target_platform: string;
  placement: string | null;
  priority: number;
  start_at: string | null;
  end_at: string | null;
  status: string;
  show_after_n_items: number | null;
  frequency_per_session: number | null;
  max_daily_views: number | null;
  created_at: string;
};

type ControlsRow = {
  id: number;
  web_enabled: boolean;
  app_enabled: boolean;
  kill_switch: boolean;
  updated_at: string;
};

function toISODateTimeLocal(value: string) {
  // input[type=datetime-local] gives local time without timezone; store as ISO string in UTC
  // simplest: new Date(localString) assumes local timezone.
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d.toISOString();
}

export default function AdminAds() {
  const qc = useQueryClient();
  const { toast } = useToast();
  const { user } = useAdmin();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<AdminAdRow | null>(null);

  const emptyForm = useMemo(
    () => ({
      title: "",
      link_url: "",
      button_text: "Learn more",
      target_platform: "all" as AdTargetPlatform,
      placement: "web_home_top" as AdPlacement,
      priority: 1,
      start_at: "",
      end_at: "",
      status: "paused",
      show_after_n_items: "",
      frequency_per_session: "",
      max_daily_views: "",
      imageFile: null as File | null,
    }),
    [],
  );

  const [form, setForm] = useState(emptyForm);

  const { data: controls } = useQuery({
    queryKey: ["ad-controls"],
    queryFn: async () => {
      const { data, error } = await supabase.from("admin_ad_controls").select("*").eq("id", 1).maybeSingle();
      if (error) throw error;
      return data as ControlsRow | null;
    },
  });

  const { data: ads = [] } = useQuery({
    queryKey: ["admin-ads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("admin_ads")
        .select("*")
        .order("priority", { ascending: false })
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as AdminAdRow[];
    },
  });

  const { data: adStats } = useQuery({
    queryKey: ["ad-analytics"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ad_events")
        .select("platform,event_type");
      if (error) throw error;

      const stats = {
        web: { impressions: 0, clicks: 0 },
        android: { impressions: 0, clicks: 0 },
        ios: { impressions: 0, clicks: 0 },
      } as const;

      for (const row of data ?? []) {
        const platform = row.platform as "web" | "android" | "ios";
        const type = row.event_type as "impression" | "click";
        if (!(platform in stats)) continue;
        if (type === "impression") (stats as any)[platform].impressions += 1;
        if (type === "click") (stats as any)[platform].clicks += 1;
      }

      const ctr = (clicks: number, impressions: number) => (impressions ? (clicks / impressions) * 100 : 0);

      return {
        ...stats,
        ctr: {
          web: ctr(stats.web.clicks, stats.web.impressions),
          android: ctr(stats.android.clicks, stats.android.impressions),
          ios: ctr(stats.ios.clicks, stats.ios.impressions),
        },
      };
    },
  });

  const logAudit = async (action: string, resourceId?: string, metadata?: any) => {
    if (!user) return;
    try {
      await supabase.from("admin_audit_log").insert({
        actor_id: user.id,
        action,
        resource_type: "ad",
        resource_id: resourceId ?? null,
        metadata: metadata ?? {},
      });
    } catch {
      // ignore
    }
  };

  const updateControls = useMutation({
    mutationFn: async (patch: Partial<Pick<ControlsRow, "web_enabled" | "app_enabled" | "kill_switch">>) => {
      const { error } = await supabase.from("admin_ad_controls").update(patch).eq("id", 1);
      if (error) throw error;
    },
    onSuccess: async (_, patch) => {
      await qc.invalidateQueries({ queryKey: ["ad-controls"] });
      await logAudit("ad_controls_update", undefined, patch);
      toast({ title: "Saved", description: "Ad controls updated." });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message ?? "Could not update controls.", variant: "destructive" }),
  });

  const saveAd = useMutation({
    mutationFn: async () => {
      // Upload image if provided
      let image_path: string | null = editing?.image_path ?? null;

      if (form.imageFile) {
        const path = `ads/${crypto.randomUUID()}-${form.imageFile.name}`;
        const { error: uploadError } = await supabase.storage.from("ad-assets").upload(path, form.imageFile, {
          cacheControl: "3600",
          upsert: false,
        });
        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("ad-assets").getPublicUrl(path);
        image_path = data.publicUrl;
      }

      const payload = {
        title: form.title.trim(),
        link_url: form.link_url.trim() || null,
        button_text: form.button_text.trim() || null,
        target_platform: form.target_platform,
        placement: form.placement,
        priority: Number(form.priority) || 1,
        start_at: form.start_at ? toISODateTimeLocal(form.start_at) : null,
        end_at: form.end_at ? toISODateTimeLocal(form.end_at) : null,
        status: form.status,
        show_after_n_items: form.show_after_n_items === "" ? null : Number(form.show_after_n_items),
        frequency_per_session: form.frequency_per_session === "" ? null : Number(form.frequency_per_session),
        max_daily_views: form.max_daily_views === "" ? null : Number(form.max_daily_views),
        image_path,
        // Keep legacy fields non-null where required
        ad_code: "managed",
        ad_type: "image",
        zone: "default",
        platform: "both",
      };

      if (editing) {
        const { error } = await supabase.from("admin_ads").update(payload).eq("id", editing.id);
        if (error) throw error;
        return { id: editing.id, mode: "update" as const };
      }

      const { data, error } = await supabase.from("admin_ads").insert(payload).select("id").single();
      if (error) throw error;
      return { id: data.id as string, mode: "create" as const };
    },
    onSuccess: async ({ id, mode }) => {
      await qc.invalidateQueries({ queryKey: ["admin-ads"] });
      await logAudit(mode === "create" ? "ad_create" : "ad_update", id);
      setDialogOpen(false);
      setEditing(null);
      setForm(emptyForm);
      toast({ title: "Saved", description: mode === "create" ? "Ad created." : "Ad updated." });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message ?? "Could not save ad.", variant: "destructive" }),
  });

  const deleteAd = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("admin_ads").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: async (_, id) => {
      await qc.invalidateQueries({ queryKey: ["admin-ads"] });
      await logAudit("ad_delete", id);
      toast({ title: "Deleted", description: "Ad removed." });
    },
    onError: (e: any) => toast({ title: "Failed", description: e.message ?? "Could not delete ad.", variant: "destructive" }),
  });

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (ad: AdminAdRow) => {
    setEditing(ad);
    setForm({
      ...emptyForm,
      title: ad.title ?? "",
      link_url: ad.link_url ?? "",
      button_text: ad.button_text ?? "Learn more",
      target_platform: (ad.target_platform as AdTargetPlatform) ?? "all",
      placement: (ad.placement as AdPlacement) ?? "web_home_top",
      priority: ad.priority ?? 1,
      start_at: "",
      end_at: "",
      status: ad.status ?? "paused",
      show_after_n_items: ad.show_after_n_items?.toString() ?? "",
      frequency_per_session: ad.frequency_per_session?.toString() ?? "",
      max_daily_views: ad.max_daily_views?.toString() ?? "",
      imageFile: null,
    });
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Ads"
        description="Manage web + app ads from one dashboard."
        icon={DollarSign}
      />

      <Tabs defaultValue="ads">
        <TabsList>
          <TabsTrigger value="ads">Ads</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="controls">Emergency Controls</TabsTrigger>
        </TabsList>

        <TabsContent value="controls" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Emergency Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!controls ? (
                <p className="text-sm text-muted-foreground">Controls are not initialized yet.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Web Ads</p>
                      <p className="text-xs text-muted-foreground">Disable all ads on web.</p>
                    </div>
                    <Switch
                      checked={controls.web_enabled}
                      onCheckedChange={(v) => updateControls.mutate({ web_enabled: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">App Ads</p>
                      <p className="text-xs text-muted-foreground">Disable ads on Android/iOS.</p>
                    </div>
                    <Switch
                      checked={controls.app_enabled}
                      onCheckedChange={(v) => updateControls.mutate({ app_enabled: v })}
                    />
                  </div>

                  <div className="flex items-center justify-between gap-3 rounded-lg border border-border p-3">
                    <div>
                      <p className="text-sm font-medium">Kill Switch</p>
                      <p className="text-xs text-muted-foreground">Disable everything instantly.</p>
                    </div>
                    <Switch
                      checked={controls.kill_switch}
                      onCheckedChange={(v) => updateControls.mutate({ kill_switch: v })}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {(["web", "android"] as const).map((p) => (
              <Card key={p}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">{p.toUpperCase()} CTR</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-semibold">
                    {adStats ? `${adStats.ctr[p].toFixed(2)}%` : "—"}
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {adStats ? `${(adStats as any)[p].clicks} clicks / ${(adStats as any)[p].impressions} impressions` : ""}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Raw totals</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              This is the first pass; next we can add charts + per-ad breakdown.
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ads" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-muted-foreground">Create, schedule, and prioritize ads.</p>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={openCreate}>Create Ad</Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editing ? "Edit Ad" : "Create Ad"}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={form.title}
                      onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Platform Target</Label>
                    <Select
                      value={form.target_platform}
                      onValueChange={(v) => setForm((p) => ({ ...p, target_platform: v as AdTargetPlatform }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All</SelectItem>
                        <SelectItem value="web">Web</SelectItem>
                        <SelectItem value="android">Android</SelectItem>
                        <SelectItem value="ios">iOS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Placement</Label>
                    <Select value={form.placement} onValueChange={(v) => setForm((p) => ({ ...p, placement: v as AdPlacement }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_PLACEMENTS.map((p) => (
                          <SelectItem key={p} value={p}>
                            {p}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="link">Link URL</Label>
                    <Input
                      id="link"
                      value={form.link_url}
                      onChange={(e) => setForm((p) => ({ ...p, link_url: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="btn">Button text</Label>
                    <Input
                      id="btn"
                      value={form.button_text}
                      onChange={(e) => setForm((p) => ({ ...p, button_text: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority">Priority</Label>
                    <Input
                      id="priority"
                      type="number"
                      value={form.priority}
                      onChange={(e) => setForm((p) => ({ ...p, priority: Number(e.target.value) }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="start">Start date</Label>
                    <Input
                      id="start"
                      type="datetime-local"
                      value={form.start_at}
                      onChange={(e) => setForm((p) => ({ ...p, start_at: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="end">End date</Label>
                    <Input
                      id="end"
                      type="datetime-local"
                      value={form.end_at}
                      onChange={(e) => setForm((p) => ({ ...p, end_at: e.target.value }))}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="img">Image</Label>
                    <Input
                      id="img"
                      type="file"
                      accept="image/*"
                      onChange={(e) => setForm((p) => ({ ...p, imageFile: e.target.files?.[0] ?? null }))}
                    />
                    <p className="text-[11px] text-muted-foreground">Upload a square image for best results.</p>
                  </div>

                  <div className="space-y-2">
                    <Label>Rules</Label>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <Label className="text-[11px]" htmlFor="after">
                          show_after
                        </Label>
                        <Input
                          id="after"
                          type="number"
                          value={form.show_after_n_items}
                          onChange={(e) => setForm((p) => ({ ...p, show_after_n_items: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]" htmlFor="freq">
                          per_session
                        </Label>
                        <Input
                          id="freq"
                          type="number"
                          value={form.frequency_per_session}
                          onChange={(e) => setForm((p) => ({ ...p, frequency_per_session: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label className="text-[11px]" htmlFor="daily">
                          max_daily
                        </Label>
                        <Input
                          id="daily"
                          type="number"
                          value={form.max_daily_views}
                          onChange={(e) => setForm((p) => ({ ...p, max_daily_views: e.target.value }))}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={() => saveAd.mutate()} disabled={!form.title.trim()}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>All ads</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Platform</TableHead>
                    <TableHead>Placement</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {ads.map((ad) => (
                    <TableRow key={ad.id}>
                      <TableCell className="font-medium">{ad.title}</TableCell>
                      <TableCell>{ad.target_platform}</TableCell>
                      <TableCell>{ad.placement}</TableCell>
                      <TableCell>{ad.status}</TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button variant="outline" size="sm" onClick={() => openEdit(ad)}>
                          Edit
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => deleteAd.mutate(ad.id)}>
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {ads.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-sm text-muted-foreground">
                        No ads yet.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
