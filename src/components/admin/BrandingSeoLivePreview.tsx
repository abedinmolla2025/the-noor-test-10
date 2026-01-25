import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";

type Branding = {
  appName?: string;
  tagline?: string;
  logoUrl?: string;
  iconUrl?: string;
  faviconUrl?: string;
};

type Seo = {
  title?: string;
  description?: string;
  shareImageUrl?: string;
};

function normalizeTitle(title?: string) {
  if (!title) return "";
  return title.length > 60 ? title.slice(0, 57) + "…" : title;
}

function normalizeDescription(description?: string) {
  if (!description) return "";
  return description.length > 160 ? description.slice(0, 157) + "…" : description;
}

export function BrandingSeoLivePreview(props: { branding: Branding; seo: Seo }) {
  const { branding, seo } = props;

  const title = normalizeTitle(seo.title || branding.appName || "");
  const description = normalizeDescription(seo.description || branding.tagline || "");

  const logoUrl = branding.logoUrl;
  const appIconUrl = branding.iconUrl;
  const faviconUrl = branding.faviconUrl;
  const shareImageUrl = seo.shareImageUrl || branding.logoUrl;

  const siteHost = typeof window !== "undefined" ? window.location.host : "example.com";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Live Preview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground">Header / App branding</p>
          <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-4 py-3">
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt="Logo preview"
                  className="h-10 w-10 rounded-full border border-border object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-10 w-10 rounded-full border border-dashed border-border bg-muted" />
              )}

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{branding.appName || "App name"}</p>
                <p className="truncate text-xs text-muted-foreground">{branding.tagline || "Tagline"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Icon</p>
                {appIconUrl ? (
                  <img
                    src={appIconUrl}
                    alt="App icon preview"
                    className="h-9 w-9 rounded-lg border border-border object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-lg border border-dashed border-border bg-muted" />
                )}
              </div>

              <div className="text-right">
                <p className="text-[10px] text-muted-foreground">Favicon</p>
                {faviconUrl ? (
                  <img
                    src={faviconUrl}
                    alt="Favicon preview"
                    className="h-9 w-9 rounded-lg border border-border object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="h-9 w-9 rounded-lg border border-dashed border-border bg-muted" />
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <p className="text-xs font-medium text-muted-foreground">Social share (OG) preview</p>
            <p className="text-[10px] text-muted-foreground">{siteHost}</p>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <AspectRatio ratio={16 / 9}>
              {shareImageUrl ? (
                <img
                  src={shareImageUrl}
                  alt="OG image preview"
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              ) : (
                <div className="h-full w-full bg-muted" />
              )}
            </AspectRatio>

            <div className="space-y-1 px-4 py-3">
              <p className="line-clamp-2 text-sm font-semibold">{title || "Title"}</p>
              <p className="line-clamp-2 text-xs text-muted-foreground">{description || "Description"}</p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            Note: This is a visual preview—social apps may render cards differently.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
