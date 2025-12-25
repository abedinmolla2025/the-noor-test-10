import { useState, useEffect } from "react";
import { MapPin, Clock, Loader2, ChevronRight, Sparkles, Bell, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import noorLogo from "@/assets/noor-logo.png";
interface AthanSettings {
  enabled: boolean;
  isPlaying: boolean;
  onOpenSettings: () => void;
}

interface PrayerHeroCardProps {
  prayerData?: ReturnType<typeof usePrayerTimes>;
  athanSettings?: AthanSettings;
}

const PrayerHeroCard = ({ prayerData, athanSettings }: PrayerHeroCardProps) => {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const localPrayerData = usePrayerTimes();
  const { prayerTimes, location, hijriDate, isLoading } = prayerData || localPrayerData;

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTo24Hour = (timeStr: string): { hours: number; minutes: number } => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return { hours, minutes };
  };

  const formatPrayerTime = (timeStr: string): string => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const prayerSchedule = prayerTimes
    ? [
        { name: "Fajr", time: prayerTimes.Fajr },
        { name: "Sunrise", time: prayerTimes.Sunrise },
        { name: "Dhuhr", time: prayerTimes.Dhuhr },
        { name: "Asr", time: prayerTimes.Asr },
        { name: "Maghrib", time: prayerTimes.Maghrib },
        { name: "Isha", time: prayerTimes.Isha },
      ]
    : [
        { name: "Fajr", time: "05:00" },
        { name: "Sunrise", time: "06:15" },
        { name: "Dhuhr", time: "12:30" },
        { name: "Asr", time: "15:30" },
        { name: "Maghrib", time: "18:00" },
        { name: "Isha", time: "19:30" },
      ];

  const getCurrentPrayer = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (let i = prayerSchedule.length - 1; i >= 0; i--) {
      const { hours, minutes } = formatTo24Hour(prayerSchedule[i].time);
      const prayerMinutes = hours * 60 + minutes;
      if (now >= prayerMinutes) {
        return prayerSchedule[i].name;
      }
    }
    return "Isha";
  };

  const getNextPrayer = () => {
    const now = currentTime.getHours() * 60 + currentTime.getMinutes();

    for (let i = 0; i < prayerSchedule.length; i++) {
      const { hours, minutes } = formatTo24Hour(prayerSchedule[i].time);
      const prayerMinutes = hours * 60 + minutes;
      if (now < prayerMinutes) {
        return { name: prayerSchedule[i].name, time: prayerSchedule[i].time };
      }
    }
    return { name: prayerSchedule[0].name, time: prayerSchedule[0].time };
  };

  const getCountdown = () => {
    const next = getNextPrayer();
    const { hours, minutes } = formatTo24Hour(next.time);
    
    const nextTotalSeconds = hours * 3600 + minutes * 60;
    const nowTotalSeconds = 
      currentTime.getHours() * 3600 + 
      currentTime.getMinutes() * 60 + 
      currentTime.getSeconds();

    let diffTotalSeconds = nextTotalSeconds - nowTotalSeconds;
    
    if (diffTotalSeconds <= 0) {
      diffTotalSeconds += 24 * 60 * 60;
    }

    const h = Math.floor(diffTotalSeconds / 3600);
    const m = Math.floor((diffTotalSeconds % 3600) / 60);
    const s = diffTotalSeconds % 60;

    return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const period = currentTime.getHours() >= 12 ? "PM" : "AM";

  const hijriDateStr = hijriDate
    ? `${hijriDate.day} ${hijriDate.month.en}, ${hijriDate.year} AH`
    : "Loading...";

  const locationStr = location?.city || "Loading...";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative cursor-pointer group"
      onClick={() => navigate("/prayer-times")}
    >
      {/* Premium Glass Card */}
      <div className="relative overflow-hidden rounded-[2rem] border border-white/10 shadow-2xl">
        {/* Dynamic Gradient Background - Matching PrayerTimesPage */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-teal-700 to-cyan-800" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.35, 0.2]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full blur-[80px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-teal-400 to-cyan-500 rounded-full blur-[60px]"
        />
        
        {/* Mesh Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Content Container */}
        <div className="relative z-10 p-4 md:p-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            
            {/* Left Section - Main Info */}
            <div className="flex-1 space-y-3 relative z-20">
              
              {/* Top Bar - NOOR Branding & Controls */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center justify-between gap-3"
              >
                {/* NOOR Branding */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <div className="relative w-12 h-12 flex-shrink-0">
                      {/* Glow Layer */}
                      <div className="absolute -inset-1 bg-white rounded-full blur-md opacity-30" />
                      <img 
                        src={noorLogo} 
                        alt="NOOR Logo" 
                        className="w-12 h-12 rounded-full object-cover relative z-10"
                        style={{ 
                          boxShadow: '0 0 10px 2px rgba(255, 255, 255, 0.3)' 
                        }}
                      />
                    </div>
                    <div className="flex flex-col ml-2">
                      <span 
                        className="text-xl font-premium font-semibold tracking-[0.25em] relative noor-shine-text"
                        style={{ 
                          background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 25%, #ffffff 50%, #fcd34d 75%, #ffffff 100%)',
                          backgroundSize: '200% 100%',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                          filter: 'drop-shadow(0 2px 6px rgba(251, 191, 36, 0.3))'
                        }}
                      >
                        NOOR
                      </span>
                      <span 
                        className="text-[8px] font-premium uppercase tracking-[0.3em] font-medium"
                        style={{
                          background: 'linear-gradient(90deg, #fbbf24 0%, #fef3c7 50%, #fbbf24 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Islamic App
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location, Hijri & Bell Controls */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 border border-white/20">
                    {isLoading ? (
                      <Loader2 size={12} className="animate-spin text-amber-400" />
                    ) : (
                      <MapPin size={12} className="text-amber-400" />
                    )}
                    <span className="text-xs text-white font-medium">{locationStr}</span>
                  </div>
                  <div className="hidden sm:flex items-center gap-2 bg-amber-400/15 backdrop-blur-sm rounded-full px-3 py-1.5 border border-amber-400/30">
                    <span className="font-arabic text-xs text-amber-300">{hijriDateStr}</span>
                  </div>
                  
                  {/* Athan Bell Button */}
                  {athanSettings && (
                    <motion.button
                      whileTap={{ scale: 0.95 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        athanSettings.onOpenSettings();
                      }}
                      className="relative p-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
                    >
                      {athanSettings.isPlaying ? (
                        <BellRing size={16} className="text-amber-400 animate-pulse" />
                      ) : athanSettings.enabled ? (
                        <Bell size={16} className="text-amber-400" />
                      ) : (
                        <Bell size={16} className="text-white/50" />
                      )}
                      {athanSettings.enabled && (
                        <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-emerald-700" />
                      )}
                    </motion.button>
                  )}
                </div>
              </motion.div>

              {/* Current Time - Hero Display */}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Sparkles size={12} className="text-amber-400" />
                  <span className="text-[10px] text-amber-400 uppercase tracking-[0.15em] font-semibold">
                    Current Prayer
                  </span>
                </div>
                
                <div className="flex items-baseline gap-3">
                  <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                    {getCurrentPrayer()}
                  </h2>
                  <span className="text-2xl md:text-3xl font-light text-white/70 tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </div>

              {/* Next Prayer Countdown - Compact */}
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-400/20 via-amber-400/15 to-transparent border border-amber-400/30 rounded-xl px-3 py-2 backdrop-blur-md">
                <Clock size={14} className="text-amber-400" />
                <div className="flex flex-col">
                  <span className="text-[9px] uppercase tracking-wider text-white/60">Next Prayer</span>
                  <span className="text-base font-bold text-white tabular-nums">{getCountdown()}</span>
                </div>
                <ChevronRight size={14} className="text-amber-400 ml-1" />
              </div>
            </div>

          </div>

          {/* Bottom Quick Stats */}
          <div className="mt-4 pt-3 border-t border-white/10">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 sm:gap-2">
              {prayerSchedule.map((prayer) => {
                const isCurrentPrayer = getCurrentPrayer() === prayer.name;
                const isNextPrayer = getNextPrayer().name === prayer.name;
                
                return (
                  <div
                    key={prayer.name}
                    className={`
                      relative text-center py-2 px-1.5 rounded-lg transition-all duration-300
                      ${isCurrentPrayer 
                        ? 'bg-amber-400/25 border border-amber-400/50' 
                        : isNextPrayer
                          ? 'bg-white/10 border border-white/25'
                          : 'bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    <p className={`text-[9px] sm:text-[10px] uppercase tracking-wider mb-0.5 ${
                      isCurrentPrayer ? 'text-amber-300 font-semibold' : 'text-white/60'
                    }`}>
                      {prayer.name}
                    </p>
                    <p className={`text-xs sm:text-sm font-bold tabular-nums ${
                      isCurrentPrayer ? 'text-amber-300' : 'text-white'
                    }`}>
                      {formatPrayerTime(prayer.time)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Outer Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-amber-400/0 via-amber-400/15 to-amber-400/0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
    </motion.div>
  );
};

export default PrayerHeroCard;