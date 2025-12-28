import { useState } from "react";
import { BellRing, Sparkles, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import PrayerHeroCard from "@/components/PrayerHeroCard";
import FeatureIcons from "@/components/FeatureIcons";
import AudioRecitationCard from "@/components/AudioRecitationCard";
import PrayerTimesList from "@/components/PrayerTimesList";
import BottomNavigation from "@/components/BottomNavigation";
import DailyHadith from "@/components/DailyHadith";
import AthanSettingsModal from "@/components/AthanSettingsModal";
import { useAthanNotification } from "@/hooks/useAthanNotification";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
const Index = () => {
  const [athanModalOpen, setAthanModalOpen] = useState(false);
  const { prayerTimes } = usePrayerTimes();
  const navigate = useNavigate();
  
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

  return (
    <div className="min-h-screen min-h-[100dvh] bg-background pb-20 w-full overflow-x-hidden">
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
              <p className="text-sm font-medium text-white">
                {currentPrayer} আযান চলছে...
              </p>
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
      <main className="w-full px-3 py-4 space-y-4">
        {/* Prayer Hero Card */}
        <section className="animate-fade-in" style={{ animationDelay: "0ms" }}>
          <PrayerHeroCard 
            athanSettings={{
              enabled: settings.enabled,
              isPlaying,
              onOpenSettings: () => setAthanModalOpen(true)
            }}
          />
        </section>

        {/* Feature Icons */}
        <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <FeatureIcons />
        </section>

        {/* Audio & Quiz Premium Section */}
        <section className="space-y-3 animate-fade-in" style={{ animationDelay: "150ms" }}>
          <div className="flex items-center justify-between px-1">
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Focus zone
              </p>
              <h2 className="text-sm font-semibold">Audio Recitation & Daily Quiz</h2>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="animate-fade-in" style={{ animationDelay: "180ms" }}>
              <AudioRecitationCard />
            </div>

            <Card className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/15 via-background to-emerald-600/20 shadow-[0_18px_45px_rgba(16,185,129,0.35)] hover:shadow-[0_22px_55px_rgba(16,185,129,0.5)] hover:-translate-y-1 transition-all duration-300 backdrop-blur-lg">
              {/* subtle light textures */}
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.18),_transparent_60%)]" />
              <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full bg-primary/25 blur-3xl" />
              <div className="pointer-events-none absolute -left-10 bottom-[-24px] h-28 w-28 rounded-full bg-emerald-400/20 blur-3xl" />

              <CardHeader className="relative z-10 pb-3 flex flex-row items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.16em] text-primary/90">
                    <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-primary/10">
                      <Trophy className="w-2.5 h-2.5" />
                    </span>
                    Daily Challenge
                  </p>
                  <div>
                    <CardTitle className="text-[15px] font-semibold flex items-center gap-1.5">
                      Daily Islamic Quiz
                      <span className="h-1 w-1 rounded-full bg-amber-400" />
                    </CardTitle>
                    <CardDescription className="mt-1 text-xs leading-relaxed text-muted-foreground">
                      প্রতিদিন ৩টি ছোট কুইজ, ধীরে ধীরে জ্ঞান বাড়ান
                    </CardDescription>
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px] text-muted-foreground/90">
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 border border-primary/10">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      increase emotional trust
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 border border-primary/10">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      improve engagement
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 border border-primary/10">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      push daily habit formation
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-background/60 px-2 py-0.5 border border-primary/10">
                      <span className="h-1 w-1 rounded-full bg-emerald-400" />
                      prepare for monetization
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="inline-flex items-center rounded-full border border-amber-400/60 bg-amber-500/10 px-2 py-0.5 text-[10px] font-semibold text-amber-400 backdrop-blur-sm shadow-[0_0_20px_rgba(251,191,36,0.35)]">
                    PRO
                  </span>
                  <span className="text-[10px] text-muted-foreground">Daily • 3 Qs</span>
                </div>
              </CardHeader>

              <CardContent className="relative z-10 flex flex-col gap-3 pb-4">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Streak &amp; points saved on this device</span>
                  <span className="rounded-full bg-background/70 px-2 py-0.5 border border-white/10">
                    Consistency matters
                  </span>
                </div>
                <Button
                  className="group w-full h-10 text-sm justify-between bg-gradient-to-r from-primary via-primary to-amber-500 text-primary-foreground shadow-[0_10px_30px_rgba(59,130,246,0.45)] hover:shadow-[0_14px_40px_rgba(59,130,246,0.75)] hover:brightness-[1.04] border border-white/10 px-3"
                  onClick={() => navigate("/quiz")}
                >
                  <span className="flex items-center gap-1.5">
                    <Trophy className="w-4 h-4 group-hover:scale-110 group-hover:-translate-y-px transition-transform" />
                    আজকের কুইজ দিন
                  </span>
                  <span className="text-[10px] uppercase tracking-wide text-primary-foreground/80 group-hover:translate-x-0.5 transition-transform">
                    Start • 3 questions
                  </span>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>


        {/* Daily Hadith */}
        <section className="animate-fade-in" style={{ animationDelay: "350ms" }}>
          <DailyHadith />
        </section>
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
