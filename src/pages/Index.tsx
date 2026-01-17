import { useEffect, useMemo, useState } from "react";
import {
  BellRing,
  Sparkles,
  Trophy,
  Home,
  BookOpen,
  ScrollText,
  CalendarDays,
  Settings,
  ListChecks,
  PlayCircle,
  Facebook,
  MessageCircle,
  Mail,
} from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PrayerHeroCard from "@/components/PrayerHeroCard";
import FeatureIcons from "@/components/FeatureIcons";
import AudioRecitationCard from "@/components/AudioRecitationCard";
import BottomNavigation from "@/components/BottomNavigation";
import DailyHadith from "@/components/DailyHadith";
import AthanSettingsModal from "@/components/AthanSettingsModal";
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

  const resolveAdPlacement = (raw: unknown): AdPlacement => {
    const allowed = layoutPlatform === "app" ? APP_PLACEMENTS : WEB_PLACEMENTS;
    if (typeof raw === "string" && (allowed as readonly string[]).includes(raw)) return raw as AdPlacement;
    return layoutPlatform === "app" ? "app_home_top" : "web_home_top";
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
          el: <AdSlot placement={layoutPlatform === "app" ? "app_home_top" : "web_home_top"} />,
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
        // footer is rendered below (not part of content blocks here)
      ] as const,
    [isPlaying, layoutPlatform, navigate, settings.enabled],
  );

  const sectionMap = useMemo(() => {
    const map = new Map<string, React.ReactNode>();
    defaultSections.forEach((s) => map.set(s.section_key, s.el));
    return map;
  }, [defaultSections]);

  const sizeToPad = (size?: string) => {
    if (size === "compact") return "space-y-2";
    if (size === "large") return "space-y-5";
    return "space-y-4";
  };

  const hasConfig = (layoutQuery.data?.length ?? 0) > 0;

  const orderedSections = hasConfig
    ? (layoutQuery.data ?? [])
        .filter((r) => r.visible !== false)
        .sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0))
        .map((r) => {
          // Special-case ad slot to allow optional placement override in the future
          if (r.section_key === "ad_home_top") {
            return {
              key: r.id,
              el: <AdSlot placement={resolveAdPlacement((r as any).settings?.adPlacement)} />,
              pad: sizeToPad(r.size as any),
            };
          }

          return { key: r.id, el: sectionMap.get(r.section_key), pad: sizeToPad(r.size as any) };
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

          {/* Footer Navigation (not part of builder yet) */}
          <footer className="mt-6 pt-5 border-top border-border/70">
            <div className="mx-auto max-w-2xl rounded-2xl bg-gradient-to-t from-primary/10 via-background to-background/80 border border-border/60 px-3 py-3 shadow-sm shadow-primary/10 animate-fade-in space-y-3">
              <p className="text-[11px] text-center text-muted-foreground">
                Noor — আপনার দৈনিক নামাজ, কুরআন ও দ্বীনি রুটিনকে এক জায়গায় সহজ করে রাখার ছোট সাথী।
              </p>

              <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[11px] text-muted-foreground">
                <button onClick={() => navigate("/")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <Home className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>হোম</span>
                </button>
                <button onClick={() => navigate("/quran")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <BookOpen className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>কুরআন</span>
                </button>
                <button onClick={() => navigate("/bukhari")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <ScrollText className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>হাদিস</span>
                </button>
                <button onClick={() => navigate("/calendar")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <CalendarDays className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>ইসলামিক ক্যালেন্ডার</span>
                </button>
                <button onClick={() => navigate("/prayer-times")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <ListChecks className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>নামাজের সময়</span>
                </button>
                <button onClick={() => navigate("/notifications")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <BellRing className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>ইনবক্স</span>
                </button>
                <button onClick={() => navigate("/settings")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <Settings className="h-3.5 w-3.5 text-primary group-hover:scale-110 transition-transform" />
                  <span>সেটিংস</span>
                </button>
                <button onClick={() => navigate("/privacy-policy")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <span>Privacy Policy</span>
                </button>
                <button onClick={() => navigate("/terms")} className="group inline-flex items-center gap-1.5 hover:text-foreground hover-scale">
                  <span>Terms &amp; Conditions</span>
                </button>
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 border border-border/60 rounded-xl px-3 py-2 bg-background/80">
                <button className="inline-flex items-center gap-2 rounded-full bg-primary text-primary-foreground px-3 py-1.5 text-[11px] font-medium shadow-sm hover:brightness-[1.03] transition-all hover-scale">
                  <PlayCircle className="h-3.5 w-3.5" />
                  <span>Get it on Play Store (Soon)</span>
                </button>
                <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
                  <span className="hidden sm:inline">Contact &amp; Feedback:</span>
                  <div className="flex items-center gap-2">
                    <a href="mailto:noor-app@example.com" className="hover:text-foreground hover-scale inline-flex">
                      <Mail className="h-3.5 w-3.5" />
                    </a>
                    <a href="#" className="hover:text-foreground hover-scale inline-flex">
                      <Facebook className="h-3.5 w-3.5" />
                    </a>
                    <a href="#" className="hover:text-foreground hover-scale inline-flex">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="h-px w-20 mx-auto bg-border/70 rounded-full" />

              <p className="text-[11px] text-center text-muted-foreground">
                Developed by <span className="font-semibold">ABEDIN MOLLA</span> – India
              </p>
            </div>
          </footer>
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
