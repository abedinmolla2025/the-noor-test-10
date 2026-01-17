import {
  Facebook,
  Mail,
  MessageCircle,
  PlayCircle,
} from "lucide-react";
import { useMemo } from "react";

export type FooterLinksSettings = {
  playStoreUrl?: string;
  appStoreUrl?: string;
  websiteUrl?: string;
  contactEmail?: string;
  facebookUrl?: string;
  whatsappUrl?: string;
  footerText?: string;
  developerLine?: string;
};

function normalizeUrl(raw?: string) {
  const v = (raw ?? "").trim();
  return v.length ? v : undefined;
}

function normalizeEmail(raw?: string) {
  const v = (raw ?? "").trim();
  if (!v) return undefined;
  if (v.startsWith("mailto:")) return v;
  // allow both raw emails and full mailto links
  if (v.includes("@")) return `mailto:${v}`;
  return v;
}

export default function FooterSection({
  settings,
  onNavigate,
  platform,
}: {
  settings?: FooterLinksSettings;
  onNavigate: (path: string) => void;
  platform: "web" | "app";
}) {
  const playStoreUrl = useMemo(() => normalizeUrl(settings?.playStoreUrl), [settings?.playStoreUrl]);
  const appStoreUrl = useMemo(() => normalizeUrl(settings?.appStoreUrl), [settings?.appStoreUrl]);
  const websiteUrl = useMemo(() => normalizeUrl(settings?.websiteUrl) ?? window.location.origin, [settings?.websiteUrl]);
  const mailto = useMemo(() => normalizeEmail(settings?.contactEmail), [settings?.contactEmail]);
  const facebookUrl = useMemo(() => normalizeUrl(settings?.facebookUrl), [settings?.facebookUrl]);
  const whatsappUrl = useMemo(() => normalizeUrl(settings?.whatsappUrl), [settings?.whatsappUrl]);

  const footerText =
    (settings?.footerText ?? "").trim() ||
    "Noor — আপনার দৈনিক নামাজ, কুরআন ও দ্বীনি রুটিনকে এক জায়গায় সহজ করে রাখার ছোট সাথী।";
  const developerLine =
    (settings?.developerLine ?? "").trim() || "Developed by ABEDIN MOLLA – India";

  return (
    <footer className="mt-6 pt-5 border-top border-border/70">
      <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-t from-primary/10 via-background to-background/80 border border-border/60 px-3 py-3 shadow-sm shadow-primary/10 animate-fade-in space-y-3">
        <p className="text-[11px] text-center text-muted-foreground">{footerText}</p>

        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
          <button
            onClick={() => onNavigate("/")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>হোম</span>
          </button>
          <button
            onClick={() => onNavigate("/quran")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>কুরআন</span>
          </button>
          <button
            onClick={() => onNavigate("/bukhari")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>হাদিস</span>
          </button>
          <button
            onClick={() => onNavigate("/calendar")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>ইসলামিক ক্যালেন্ডার</span>
          </button>
          <button
            onClick={() => onNavigate("/prayer-times")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>নামাজের সময়</span>
          </button>
          <button
            onClick={() => onNavigate("/notifications")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>ইনবক্স</span>
          </button>
          <button
            onClick={() => onNavigate("/settings")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>সেটিংস</span>
          </button>
          <button
            onClick={() => onNavigate("/privacy-policy")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>Privacy Policy</span>
          </button>
          <button
            onClick={() => onNavigate("/terms")}
            className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale"
          >
            <span>Terms &amp; Conditions</span>
          </button>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border border-border/60 rounded-xl px-3 py-2 bg-background/80">
          {platform === "app" ? (
            <a
              href={websiteUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-medium shadow-sm hover:brightness-[1.03] transition-all hover-scale"
            >
              <span>Visit our website</span>
            </a>
          ) : (
            <div className="flex flex-wrap items-center gap-2">
              {playStoreUrl ? (
                <a
                  href={playStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-medium shadow-sm hover:brightness-[1.03] transition-all hover-scale"
                >
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Play Store</span>
                </a>
              ) : (
                <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-medium shadow-sm hover:brightness-[1.03] transition-all hover-scale">
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Play Store (Soon)</span>
                </button>
              )}

              {appStoreUrl && (
                <a
                  href={appStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm hover:bg-muted transition-all hover-scale"
                >
                  <span>App Store</span>
                </a>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="hidden sm:inline">Contact &amp; Feedback:</span>
            <div className="flex items-center gap-2">
              {mailto && (
                <a href={mailto} className="hover:text-foreground hover-scale inline-flex" aria-label="Email">
                  <Mail className="h-3.5 w-3.5" />
                </a>
              )}
              {facebookUrl && (
                <a
                  href={facebookUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground hover-scale inline-flex"
                  aria-label="Facebook"
                >
                  <Facebook className="h-3.5 w-3.5" />
                </a>
              )}
              {whatsappUrl && (
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:text-foreground hover-scale inline-flex"
                  aria-label="WhatsApp"
                >
                  <MessageCircle className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="h-px w-20 mx-auto bg-border/70 rounded-full" />

        <p className="text-[11px] text-center text-muted-foreground">{developerLine}</p>
      </div>
    </footer>
  );
}
