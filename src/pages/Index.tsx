import { useEffect, useMemo, useState } from "react";
import { BellRing } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PrayerHeroCard from "@/components/PrayerHeroCard";
import FeatureIcons from "@/components/FeatureIcons";
import AudioRecitationCard from "@/components/AudioRecitationCard";
import BottomNavigation from "@/components/BottomNavigation";
import DailyHadith from "@/components/DailyHadith";
import AthanSettingsModal from "@/components/AthanSettingsModal";
import FooterSection from "@/components/FooterSection";
import { useAthanNotification } from "@/hooks/useAthanNotification";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useGlobalConfig } from "@/context/GlobalConfigContext";
import { AdSlot } from "@/components/ads/AdSlot";
import type { AdPlacement } from "@/lib/ads";
import { APP_PLACEMENTS, WEB_PLACEMENTS } from "@/lib/ads";
import type { LayoutPlatform } from "@/lib/layout";
import { detectLayoutPlatform } from "@/lib/layout";
import { useLayoutSettings } from "@/hooks/useLayoutSettings";

const Index = () => {
  const [athanModalOpen, setAthanModalOpen] = useState(false);
  const [layoutPlatform, setLayoutPlatform] = useState<LayoutPlatform>("web");
  const { prayerTimes } = usePrayerTimes();
  const navigate = useNavigate();
  const { system, branding } = useGlobalConfig();

  const layoutQuery = useLayoutSettings("home", layoutPlatform);

  const resolveAdPlacement = (raw: unknown, fallback: AdPlacement): AdPlacement => {
    const allowed = layoutPlatform === "app" ? APP_PLACEMENTS : WEB_PLACEMENTS;
    if (typeof raw === "string" && (allowed as readonly string[]).includes(raw)) return raw as AdPlacement;
    return fallback;
  };

  const getDefaultPlacementForSection = (sectionKey: string): AdPlacement => {
    // Currently we only ship one home ad block; keep this predictable.
    if (sectionKey === "ad_home_top") return layoutPlatform === "app" ? "app_home_top" : "web_home_top";
    // Safe fallback
    return layoutPlatform === "app" ? "app_home_top" : "web_home_top";
  };

  const sizeToPad = (size?: string) => {
    if (size === "compact") return "space-y-2";
    if (size === "large") return "space-y-5";
    return "space-y-4";
  };

  const variantToWrapper = (variant?: string) => {
    if (variant === "glass") {
      return "rounded-2xl border border-border bg-background/60 backdrop-blur";
    }
    if (variant === "soft") {
      return "rounded-2xl border border-border bg-card";
    }
    return "";
  };

  const wrapWithVariant = (node: React.ReactNode, variant?: string) => {
    const cls = variantToWrapper(variant);
    if (!cls) return node;
    return <div className={cls}>{node}</div>;
  };

  const {
    settings,
    updateSettings,
    togglePrayer,
    isPlaying,
    currentPrayer,
    playAthan,
    stopAthan,
    requestNotificationPermission,
  } = useAthanNotification(prayerTimes);

  useEffect(() => {
    detectLayoutPlatform().then(setLayoutPlatform).catch(() => setLayoutPlatform("web"));
  }, []);

  const defaultSections = useMemo(
    () =>
      [
        {
          section_key: "prayer_hero",
          el: (
            <PrayerHeroCard
              athanSettings={{
                enabled: settings.enabled,
                isPlaying,
                onOpenSettings: () => setAthanModalOpen(true),
              }}
            />
          ),
        },
        { section_key: "feature_icons", el: <FeatureIcons /> },
        {
          section_key: "ad_home_top",
          el: <AdSlot placement={getDefaultPlacementForSection("ad_home_top")} />,
        },
        {
          section_key: "focus_zone",
          el: (
            <div className="space-y-4">
              <AudioRecitationCard />
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Quiz</CardTitle>
                  <CardDescription className="text-sm">
                    আপনার জ্ঞান যাচাই করুন — ছোট ইসলামিক কুইজ খেলুন।
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button onClick={() => navigate("/quiz")} className="w-full">
                    Start Quiz
                  </Button>
                </CardContent>
              </Card>
            </div>
          ),
        },
        { section_key: "daily_hadith", el: <DailyHadith /> },
        {
          section_key: "footer",
          el: <FooterSection onNavigate={(path) => navigate(path)} />,
        },
      ] as const,
    [getDefaultPlacementForSection, isPlaying, navigate, settings.enabled],
  );

  const sectionMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    defaultSections.forEach((s) => map.set(s.section_key, s.el));
    return map;
  }, [defaultSections]);

  const hasConfig = (layoutQuery.data?.length ?? 0) > 0;

  const orderedSections = hasConfig
    ? (layoutQuery.data ?? [])
        .filter((r) => r.visible !== false)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((r) => {
          const rowSettings = (r as any).settings ?? {};

          // Ad slot: placement override via settings.adPlacement
          if (typeof r.section_key === "string" && r.section_key.startsWith("ad_")) {
            const fallbackPlacement = getDefaultPlacementForSection(r.section_key);
            const placement = resolveAdPlacement(rowSettings?.adPlacement, fallbackPlacement);
            return {
              key: r.id,
              el: wrapWithVariant(<AdSlot placement={placement} />, rowSettings?.styleVariant),
              pad: sizeToPad(r.size as any),
            };
          }

          // Feature icons: allow gridColumns
          if (r.section_key === "feature_icons") {
            const cols = typeof rowSettings?.gridColumns === "number" ? rowSettings.gridColumns : undefined;
            const layout = cols ? "grid" : "scroll";
            return {
              key: r.id,
              el: wrapWithVariant(
                <FeatureIcons layout={layout as any} columns={cols} />,
                rowSettings?.styleVariant,
              ),
              pad: sizeToPad(r.size as any),
            };
          }

          // Footer: allow links via settings
          if (r.section_key === "footer") {
            const footerSettings = {
              playStoreUrl: typeof rowSettings?.playStoreUrl === "string" ? rowSettings.playStoreUrl : undefined,
              appStoreUrl: typeof rowSettings?.appStoreUrl === "string" ? rowSettings.appStoreUrl : undefined,
              contactEmail: typeof rowSettings?.contactEmail === "string" ? rowSettings.contactEmail : undefined,
              facebookUrl: typeof rowSettings?.facebookUrl === "string" ? rowSettings.facebookUrl : undefined,
              whatsappUrl: typeof rowSettings?.whatsappUrl === "string" ? rowSettings.whatsappUrl : undefined,
            };

            return {
              key: r.id,
              el: wrapWithVariant(
                <FooterSection settings={footerSettings} onNavigate={(path) => navigate(path)} />,
                rowSettings?.styleVariant,
              ),
              pad: sizeToPad(r.size as any),
            };
          }

          const base = sectionMap.get(r.section_key);
          return {
            key: r.id,
            el: wrapWithVariant(base, rowSettings?.styleVariant),
            pad: sizeToPad(r.size as any),
          };
        })
        .filter((s) => s.el !== undefined)
    : defaultSections.map((s, idx) => ({ key: String(idx), el: s.el, pad: "space-y-4" }));

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-20 w-full overflow-x-hidden">
      {/* Maintenance banner */}
      {system.maintenanceMode && (
        <div className="w-full bg-amber-500/90 text-amber-950 text-center text-xs py-2 px-3">
          {branding.tagline || "The app is currently in maintenance mode. Some features may be limited."}
        </div>
      )}

      {/* Playing Indicator */}
      {isPlaying && currentPrayer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-4 right-4 z-40 bg-gradient-to-r from-emerald-600 to-teal-600 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-white/20"
        >
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-white animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{currentPrayer} আযান চলছে...</p>
            </div>
            <button
              onClick={stopAthan}
              className="text-xs bg-white/20 hover:bg-white/30 text-white px-3 py-1.5 rounded-full transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="w-full px-3 py-4">
        <div className="space-y-4">
          {orderedSections.map((s, idx) => (
            <section
              key={s.key}
              className="animate-fade-in"
              style={{ animationDelay: `${Math.min(idx * 80, 420)}ms` }}
            >
              <div className={s.pad ?? "space-y-4"}>{s.el}</div>
            </section>
          ))}

        </div>
      </main>

      {/* Athan Settings Modal */}
      <AthanSettingsModal
        open={athanModalOpen}
        onClose={() => setAthanModalOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onTogglePrayer={togglePrayer}
        onRequestPermission={requestNotificationPermission}
        isPlaying={isPlaying}
        onPlayTest={() => playAthan("Test")}
        onStop={stopAthan}
      />

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
