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

            <Card className="relative overflow-hidden rounded-2xl border border-primary/40 bg-gradient-to-br from-primary/20 via-background to-emerald-500/15 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-200">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_60%)]" />
              <div className="pointer-events-none absolute -right-6 -top-6 h-20 w-20 rounded-full bg-primary/20 blur-2xl" />
              <CardHeader className="relative z-10 pb-3 flex flex-row items-start justify-between gap-2">
                <div>
                  <p className="text-[11px] uppercase tracking-[0.16em] text-primary flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" />
                    Daily Challenge
                  </p>
                  <CardTitle className="mt-1 text-base">Daily Islamic Quiz</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed">
                    প্রতিদিন ৩টি শর্ট কুইজ, ধীরে ধীরে জ্ঞান বাড়ান এবং ধারাবাহিকতা (streak) ধরে রাখুন।
                  </CardDescription>
                </div>
                <span className="inline-flex items-center rounded-full border border-primary/30 bg-background/60 px-2 py-0.5 text-[10px] font-medium text-primary backdrop-blur-sm">
                  Pro Tip
                </span>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col gap-3 pb-4">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Streak &amp; points saved on this device</span>
                  <span className="rounded-full bg-background/50 px-2 py-0.5">Daily • 3 Qs</span>
                </div>
                <Button
                  className="group w-full h-10 text-sm justify-between bg-gradient-to-r from-primary via-primary to-amber-500 text-primary-foreground shadow-md shadow-primary/40 hover:shadow-lg hover:shadow-primary/60 hover:brightness-[1.03] border border-white/10 px-3"
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
