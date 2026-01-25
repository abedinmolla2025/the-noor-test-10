import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminPageActionsDropdown } from "@/components/admin/AdminPageActionsDropdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Search, Save, Globe, FileText } from "lucide-react";

type SeoPageRow = {
  id: string;
  path: string;
  title: string | null;
  description: string | null;
  canonical_url: string | null;
  robots: string | null;
  json_ld: any | null;
  updated_at: string;
};

const DEFAULT_ROUTES = [
  { path: "/", label: "Home" },
  { path: "/quran", label: "Quran" },
  { path: "/bukhari", label: "Hadith (Bukhari)" },
  { path: "/dua", label: "Dua" },
  { path: "/prayer-times", label: "Prayer Times" },
  { path: "/qibla", label: "Qibla" },
  { path: "/calendar", label: "Islamic Calendar" },
  { path: "/settings", label: "Settings" },
  { path: "/privacy-policy", label: "Privacy Policy" },
  { path: "/terms", label: "Terms" },
];

function safeParseJson(input: string) {
  const trimmed = input.trim();
  if (!trimmed) return null;
  return JSON.parse(trimmed);
}

export default function AdminSeoPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pages } = useQuery<SeoPageRow[]>({
    queryKey: ["admin-seo-pages"],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from("seo_pages")
        .select("id, path, title, description, canonical_url, robots, json_ld, updated_at")
        .order("path", { ascending: true });
      if (error) throw error;
      return (data ?? []) as SeoPageRow[];
    },
  });

  const [filter, setFilter] = useState("");
  const [selectedPath, setSelectedPath] = useState<string>("/");

  const selected = useMemo(
    () => pages?.find((p) => p.path === selectedPath) ?? null,
    [pages, selectedPath],
  );

  const [form, setForm] = useState({
    title: "",
    description: "",
    canonical_url: "",
    robots: "index,follow",
    json_ld: "",
  });

  // sync when selection changes
  useEffect(() => {
    const next = selected;
    setForm({
      title: next?.title ?? "",
      description: next?.description ?? "",
      canonical_url: next?.canonical_url ?? "",
      robots: next?.robots ?? "index,follow",
      json_ld: next?.json_ld ? JSON.stringify(next.json_ld, null, 2) : "",
    });
  }, [selectedPath, selected?.id]);

  const filteredRoutes = useMemo(() => {
    const q = filter.trim().toLowerCase();
    const base = DEFAULT_ROUTES.map((r) => ({ ...r, isPreset: true }));

    const dbOnly = (pages ?? [])
      .filter((p) => !DEFAULT_ROUTES.some((r) => r.path === p.path))
      .map((p) => ({ path: p.path, label: p.path, isPreset: false }));

    const all = [...base, ...dbOnly];
    return q
      ? all.filter((r) => r.path.toLowerCase().includes(q) || r.label.toLowerCase().includes(q))
      : all;
  }, [filter, pages]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      let jsonLd: any = null;
      try {
        jsonLd = safeParseJson(form.json_ld);
      } catch (e: any) {
        throw new Error(`Invalid JSON-LD: ${e?.message ?? "Invalid JSON"}`);
      }

      const payload = {
        path: selectedPath,
        title: form.title || null,
        description: form.description || null,
        canonical_url: form.canonical_url || null,
        robots: form.robots || null,
        json_ld: jsonLd,
      };

      const { error } = await (supabase as any).from("seo_pages").upsert(payload, {
        onConflict: "path",
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-seo-pages"] });
      queryClient.invalidateQueries({ queryKey: ["page-seo", selectedPath] });
      toast({ title: "SEO saved" });
    },
    onError: (e: any) => {
      toast({
        title: "Save failed",
        description: e?.message ?? "Could not save SEO",
        variant: "destructive",
      });
    },
  });

  const titleLen = form.title.length;
  const descLen = form.description.length;

  const generateSitemapMutation = useMutation({
    mutationFn: async () => {
      // Fetch all indexable pages
      const { data, error } = await (supabase as any)
        .from("seo_pages")
        .select("path, updated_at, robots")
        .order("path", { ascending: true });
      if (error) throw error;

      const indexablePages = (data ?? []).filter((p: any) => {
        const robots = (p.robots || "").toLowerCase();
        return !robots.includes("noindex");
      });

      const origin = typeof window !== "undefined" ? window.location.origin : "https://example.com";

      const urls = indexablePages
        .map((p: any) => {
          const lastmod = p.updated_at ? new Date(p.updated_at).toISOString().split("T")[0] : new Date().toISOString().split("T")[0];
          const priority = p.path === "/" ? "1.0" : "0.8";
          return `  <url>
    <loc>${origin}${p.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
        })
        .join("\n");

      const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;

      return xml;
    },
    onSuccess: (xml) => {
      // Download the generated sitemap
      const blob = new Blob([xml], { type: "application/xml" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "sitemap.xml";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Sitemap generated",
        description: "sitemap.xml downloaded. Upload it to your public/ folder for SEO.",
      });
    },
    onError: (e: any) => {
      toast({
        title: "Sitemap generation failed",
        description: e?.message ?? "Unknown error",
        variant: "destructive",
      });
    },
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="SEO Manager"
        description="Set per-page title/description/canonical + optional JSON-LD. Changes apply instantly."
        icon={Globe}
        actions={
          <div className="flex items-center gap-2">
            <Button
              onClick={() => generateSitemapMutation.mutate()}
              disabled={generateSitemapMutation.isPending}
              variant="outline"
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Generate Sitemap
            </Button>
            <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
              <Save className="h-4 w-4" />
              Save
            </Button>
            <AdminPageActionsDropdown
              exportData={pages ?? []}
              exportFileName="seo-pages"
              onRefresh={() => queryClient.invalidateQueries({ queryKey: ["admin-seo-pages"] })}
            />
          </div>
        }
      />

      <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Pages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search /path"
                className="pl-8"
              />
            </div>

            <div className="space-y-1">
              {filteredRoutes.map((r) => (
                <button
                  key={r.path}
                  onClick={() => setSelectedPath(r.path)}
                  className={
                    "w-full rounded-lg border px-3 py-2 text-left text-sm transition-colors " +
                    (selectedPath === r.path
                      ? "border-primary bg-primary/10"
                      : "border-border hover:bg-muted")
                  }
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate">{r.label}</span>
                    <span className="text-[11px] text-muted-foreground">{r.path}</span>
                  </div>
                </button>
              ))}
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="customPath">Add / select custom path</Label>
              <Input
                id="customPath"
                value={selectedPath}
                onChange={(e) => setSelectedPath(e.target.value)}
                placeholder="/some-page"
              />
              <p className="text-[11px] text-muted-foreground">
                Tip: use exact routes like <code>/quran</code> (no trailing slash).
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">SEO for: {selectedPath}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="title">Title</Label>
                  <span className={"text-[11px] " + (titleLen > 60 ? "text-destructive" : "text-muted-foreground")}>
                    {titleLen}/60
                  </span>
                </div>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Under 60 characters"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="canonical">Canonical URL</Label>
                <Input
                  id="canonical"
                  value={form.canonical_url}
                  onChange={(e) => setForm((p) => ({ ...p, canonical_url: e.target.value }))}
                  placeholder="https://your-domain.com/path"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Meta description</Label>
                <span className={"text-[11px] " + (descLen > 160 ? "text-destructive" : "text-muted-foreground")}>
                  {descLen}/160
                </span>
              </div>
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                placeholder="Under 160 characters"
                rows={3}
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="robots">Robots</Label>
                <Input
                  id="robots"
                  value={form.robots}
                  onChange={(e) => setForm((p) => ({ ...p, robots: e.target.value }))}
                  placeholder="index,follow"
                />
                <p className="text-[11px] text-muted-foreground">
                  Example: <code>noindex,nofollow</code>
                </p>
              </div>
              <div className="space-y-2">
                <Label>Last updated</Label>
                <p className="text-sm text-muted-foreground">
                  {selected?.updated_at ? new Date(selected.updated_at).toLocaleString() : "—"}
                </p>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="jsonld">JSON-LD (optional)</Label>
              <Textarea
                id="jsonld"
                value={form.json_ld}
                onChange={(e) => setForm((p) => ({ ...p, json_ld: e.target.value }))}
                placeholder='{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "NOOR"
}'
                rows={10}
              />
              <p className="text-[11px] text-muted-foreground">
                Paste valid JSON only (no trailing commas). Saved as structured data.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="gap-2">
                <Save className="h-4 w-4" />
                Save
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
