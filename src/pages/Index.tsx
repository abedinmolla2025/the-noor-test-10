import { useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { motion } from "framer-motion";
import PrayerHeroCard from "@/components/PrayerHeroCard";
import FeatureIcons, { FeatureLabels } from "@/components/FeatureIcons";
import AudioRecitationCard from "@/components/AudioRecitationCard";
import PrayerTimesList from "@/components/PrayerTimesList";
import BottomNavigation from "@/components/BottomNavigation";
import DailyHadith from "@/components/DailyHadith";
import AthanSettingsModal from "@/components/AthanSettingsModal";
import { useAthanNotification } from "@/hooks/useAthanNotification";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

const Index = () => {
  const [athanModalOpen, setAthanModalOpen] = useState(false);
  const { prayerTimes } = usePrayerTimes();
  
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
      {/* Athan Notification Button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setAthanModalOpen(true)}
        className="fixed top-4 right-4 z-40 p-3 rounded-full bg-primary/90 backdrop-blur-sm shadow-lg border border-primary/20 hover:bg-primary transition-colors"
      >
        {isPlaying ? (
          <BellRing className="w-5 h-5 text-primary-foreground animate-pulse" />
        ) : settings.enabled ? (
          <Bell className="w-5 h-5 text-primary-foreground" />
        ) : (
          <Bell className="w-5 h-5 text-primary-foreground opacity-50" />
        )}
        {settings.enabled && (
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
        )}
      </motion.button>

      {/* Playing Indicator */}
      {isPlaying && currentPrayer && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-4 right-20 z-40 bg-primary/90 backdrop-blur-sm rounded-2xl px-4 py-3 shadow-lg border border-primary/20"
        >
          <div className="flex items-center gap-3">
            <BellRing className="w-5 h-5 text-primary-foreground animate-pulse" />
            <div className="flex-1">
              <p className="text-sm font-medium text-primary-foreground">
                {currentPrayer} আযান চলছে...
              </p>
            </div>
            <button
              onClick={stopAthan}
              className="text-xs bg-primary-foreground/20 hover:bg-primary-foreground/30 text-primary-foreground px-3 py-1.5 rounded-full transition-colors"
            >
              বন্ধ করুন
            </button>
          </div>
        </motion.div>
      )}

      {/* Main Content */}
      <main className="w-full px-3 py-4 space-y-4 pt-16">
        {/* Prayer Hero Card */}
        <section className="animate-fade-in" style={{ animationDelay: "0ms" }}>
          <PrayerHeroCard />
        </section>

        {/* Feature Icons */}
        <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <FeatureIcons />
          <FeatureLabels />
        </section>

        {/* Audio Recitation Card */}
        <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <AudioRecitationCard />
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
