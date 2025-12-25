import { useState } from "react";
import { BellRing } from "lucide-react";
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
        {/* NOOR Branding Card */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 p-5 shadow-xl"
        >
          {/* Background Effects */}
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-amber-400/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -left-10 w-28 h-28 bg-cyan-400/20 rounded-full blur-3xl" />
          
          <div className="relative z-10 flex items-center justify-center gap-4">
            {/* Logo Icon */}
            <div className="relative">
              <div className="w-14 h-14 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/20 flex items-center justify-center shadow-lg">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  className="w-8 h-8 text-amber-300"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path
                    d="M12 3C7.5 3 4 7 4 12c0 3 1.5 5.5 4 7l1-2c-2-1-3-3-3-5 0-3.5 2.5-6 6-6s6 2.5 6 6c0 2-1 4-3 5l1 2c2.5-1.5 4-4 4-7 0-5-3.5-9-8-9z"
                    fill="currentColor"
                  />
                  <circle cx="12" cy="12" r="3" fill="currentColor" />
                  <path
                    d="M12 2v2M12 20v2M2 12h2M20 12h2"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 w-14 h-14 rounded-2xl bg-amber-400 blur-xl opacity-30 -z-10" />
            </div>
            
            {/* Brand Name */}
            <div className="flex flex-col">
              <h1 className="text-3xl font-bold tracking-wide text-white">
                NOOR
              </h1>
              <span className="text-xs text-white/70 tracking-[0.15em] uppercase">
                Islamic Companion
              </span>
            </div>
          </div>
        </motion.div>
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
