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
import { OccasionCarousel } from "@/components/OccasionCarousel";
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
          section_key: "occasions",
          el: <OccasionCarousel platform={layoutPlatform} />,
        },
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
              
              {/* Daily Quiz Challenge Card */}
              <Card className="bg-gradient-to-br from-teal-50/80 via-emerald-50/80 to-cyan-50/80 dark:from-teal-950/50 dark:via-emerald-950/50 dark:to-cyan-950/50 border border-teal-200/50 dark:border-teal-800/50 shadow-md overflow-hidden">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-4 h-4 text-teal-600 dark:text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <span className="text-xs font-semibold tracking-wider text-teal-700 dark:text-teal-300 uppercase">
                      Daily Challenge
                    </span>
                  </div>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
                        Daily Islamic Quiz
                      </CardTitle>
                      <CardDescription className="text-sm mt-2 text-gray-700 dark:text-gray-300">
                        প্রতিদিন ৩টি ছোট কুইজ, ধীরে ধীরে জ্ঞান বাড়ান
                      </CardDescription>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Build your daily Islamic habit
                      </p>
                    </div>
                    <span className="px-2 py-1 text-xs font-semibold bg-amber-400 text-amber-900 rounded-md">
                      PRO
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                    <span>Streak & points saved on this device</span>
                    <span className="font-medium">Daily • 3 Qs</span>
                  </div>
                  <Button 
                    onClick={() => navigate("/quiz")} 
                    className="w-full bg-gradient-to-r from-emerald-600 via-teal-600 to-amber-500 hover:from-emerald-700 hover:via-teal-700 hover:to-amber-600 text-white font-semibold py-6 shadow-lg transition-all duration-300"
                  >
                    <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    আজকের কুইজ দিন • START • 3 QUESTIONS
                  </Button>
                </CardContent>
              </Card>
            </div>
          ),
        },
        { section_key: "daily_hadith", el: <DailyHadith /> },
        {
          section_key: "footer",
          el: <FooterSection platform={layoutPlatform} onNavigate={(path) => navigate(path)} />,
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
              playStoreUrl:
                typeof rowSettings?.playStoreUrl === "string" ? rowSettings.playStoreUrl : undefined,
              appStoreUrl:
                typeof rowSettings?.appStoreUrl === "string" ? rowSettings.appStoreUrl : undefined,
              websiteUrl:
                typeof rowSettings?.websiteUrl === "string" ? rowSettings.websiteUrl : undefined,
              contactEmail:
                typeof rowSettings?.contactEmail === "string" ? rowSettings.contactEmail : undefined,
              facebookUrl:
                typeof rowSettings?.facebookUrl === "string" ? rowSettings.facebookUrl : undefined,
              whatsappUrl:
                typeof rowSettings?.whatsappUrl === "string" ? rowSettings.whatsappUrl : undefined,
              footerText:
                typeof rowSettings?.footerText === "string" ? rowSettings.footerText : undefined,
              developerLine:
                typeof rowSettings?.developerLine === "string" ? rowSettings.developerLine : undefined,
            };

            return {
              key: r.id,
              el: wrapWithVariant(
                <FooterSection
                  platform={layoutPlatform}
                  settings={footerSettings}
                  onNavigate={(path) => navigate(path)}
                />,
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
