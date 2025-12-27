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

            <Card className="relative overflow-hidden bg-gradient-to-br from-primary/15 via-amber-500/10 to-emerald-500/15 border-primary/30 shadow-lg hover-scale">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.08),_transparent_60%)]" />
              <CardHeader className="relative z-10 pb-3 flex flex-row items-start justify-between gap-2">
                <div>
                  <p className="text-xs uppercase tracking-wide text-primary flex items-center gap-1">
                    <Trophy className="w-3 h-3" />
                    Daily Challenge
                  </p>
                  <CardTitle className="mt-1 text-base">Daily Islamic Quiz</CardTitle>
                  <CardDescription className="mt-1 text-xs leading-relaxed">
                    প্রতিদিন ৩টি শর্ট কুইজ, ধীরে ধীরে জ্ঞান বাড়ান এবং ধারাবাহিকতা (streak) ধরে রাখুন।
                  </CardDescription>
                </div>
              </CardHeader>
              <CardContent className="relative z-10 flex flex-col gap-3 pb-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Streak &amp; points saved on this device</span>
                  <span className="rounded-full bg-background/40 px-2 py-0.5">Daily • 3 Qs</span>
                </div>
                <Button
                  className="w-full h-9 text-sm bg-gradient-to-r from-primary to-amber-500 text-primary-foreground shadow-md hover:opacity-95"
                  onClick={() => navigate("/quiz")}
                >
                  Start today&apos;s quiz
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Prayer Times List */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <PrayerTimesList />
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
