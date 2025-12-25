import { useState, useEffect } from "react";
import { MapPin, Clock, Loader2, ChevronRight, Sparkles, Bell, BellRing } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import noorLogo from "@/assets/noor-logo.png";
import prayingMan3D from "@/assets/praying-man-3d.png";
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
      <div className="relative overflow-hidden rounded-2xl border border-white/10 shadow-xl">
        {/* Dynamic Gradient Background - Solid Emerald Green */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-teal-600 to-emerald-700" />
        
        {/* Subtle Static Orbs - no animation for performance */}
        <div className="absolute -top-20 -right-20 w-60 h-60 bg-gradient-to-br from-amber-400 to-amber-500 rounded-full blur-[80px] opacity-10" />
        <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-gradient-to-tr from-teal-500 to-cyan-500 rounded-full blur-[60px] opacity-10" />
        
        {/* Mesh Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Content Container */}
        <div className="relative z-10 p-3 md:p-4">
          <div className="flex flex-col gap-2">
            
            {/* Left Section - Main Info */}
            <div className="flex-1 space-y-2 relative z-20">
              
              {/* Top Bar - NOOR Branding & Controls */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                {/* NOOR Branding */}
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="relative w-10 h-10 flex-shrink-0">
                      <div className="absolute -inset-0.5 bg-white rounded-full blur-sm opacity-25" />
                      <img 
                        src={noorLogo} 
                        alt="NOOR Logo" 
                        className="w-10 h-10 rounded-full object-cover relative z-10"
                        style={{ boxShadow: '0 0 8px 2px rgba(255, 255, 255, 0.25)' }}
                      />
                    </div>
                    <div className="flex flex-col ml-1.5">
                      <span 
                        className="text-lg font-premium font-semibold tracking-[0.2em] noor-shine-text"
                        style={{ 
                          background: 'linear-gradient(135deg, #ffffff 0%, #fef3c7 25%, #ffffff 50%, #fcd34d 75%, #ffffff 100%)',
                          backgroundSize: '200% 100%',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        NOOR
                      </span>
                      <span 
                        className="text-[7px] font-premium uppercase tracking-[0.2em] font-medium text-amber-300/80"
                      >
                        Islamic App
                      </span>
                    </div>
                  </div>
                </div>

                {/* Location & Bell */}
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-2 py-1 border border-white/15">
                    {isLoading ? (
                      <Loader2 size={10} className="animate-spin text-amber-400" />
                    ) : (
                      <MapPin size={10} className="text-amber-400" />
                    )}
                    <span className="text-[10px] text-white font-medium">{locationStr}</span>
                  </div>
                  
                  {/* Athan Bell Button */}
                  {athanSettings && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        athanSettings.onOpenSettings();
                      }}
                      className="relative p-1.5 rounded-full bg-white/10 border border-white/15"
                    >
                      {athanSettings.isPlaying ? (
                        <BellRing size={12} className="text-amber-400" />
                      ) : athanSettings.enabled ? (
                        <Bell size={12} className="text-amber-400" />
                      ) : (
                        <Bell size={12} className="text-white/50" />
                      )}
                      {athanSettings.enabled && (
                        <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 bg-green-500 rounded-full" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Current Prayer & Next Prayer - Side by Side */}
              <div className="flex items-center justify-between gap-2">
                {/* Current Prayer */}
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <Sparkles size={10} className="text-amber-400" />
                    <span className="text-[9px] text-amber-400 uppercase tracking-[0.1em] font-semibold">
                      Current Prayer
                    </span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <h2 className="text-2xl font-bold text-white tracking-tight">
                      {getCurrentPrayer()}
                    </h2>
                    <span className="text-lg font-light text-white/70 tabular-nums">
                      {formatTime(currentTime)}
                    </span>
                  </div>
                </div>

                {/* Praying Man 3D Image - Fixed Position with Light Rays */}
                <div className="absolute right-32 top-1/2 -translate-y-1/2">
                  {/* Light Rays from Above - CSS Animation for better performance */}
                  <div className="absolute -top-16 left-1/3 -translate-x-1/2 w-32 h-24 overflow-visible pointer-events-none">
                    {/* Main Light Beam - CSS animation */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-1/2 w-16 h-28 animate-pulse"
                      style={{
                        background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.6) 0%, rgba(251, 191, 36, 0.3) 40%, rgba(255, 255, 255, 0.1) 100%)',
                        clipPath: 'polygon(35% 0%, 65% 0%, 100% 100%, 0% 100%)',
                        filter: 'blur(4px)',
                        willChange: 'opacity',
                      }}
                    />
                    
                    {/* Side Light Rays - static for performance */}
                    <div
                      className="absolute top-0 left-1/2 -translate-x-[70%] w-10 h-24 opacity-40"
                      style={{
                        background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.4) 0%, transparent 100%)',
                        clipPath: 'polygon(60% 0%, 100% 0%, 100% 100%, 0% 100%)',
                        filter: 'blur(3px)',
                      }}
                    />
                    <div
                      className="absolute top-0 left-1/2 -translate-x-[30%] w-10 h-24 opacity-40"
                      style={{
                        background: 'linear-gradient(180deg, rgba(251, 191, 36, 0.4) 0%, transparent 100%)',
                        clipPath: 'polygon(0% 0%, 40% 0%, 100% 100%, 0% 100%)',
                        filter: 'blur(3px)',
                      }}
                    />
                  </div>
                  
                  {/* Glow on Hands - static for performance */}
                  <div
                    className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-8 rounded-full opacity-50"
                    style={{
                      background: 'radial-gradient(ellipse, rgba(251, 191, 36, 0.5) 0%, transparent 70%)',
                      filter: 'blur(6px)',
                    }}
                  />
                  
                  <img 
                    src={prayingMan3D} 
                    alt="Praying Man" 
                    className="w-20 h-20 object-contain -scale-x-100 relative z-10"
                    style={{
                      filter: 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.5)) drop-shadow(0 0 24px rgba(16, 185, 129, 0.4))'
                    }}
                  />
                </div>

                {/* Next Prayer Countdown - Fixed Width */}
                <div className="flex items-center gap-1.5 bg-amber-400/15 border border-amber-400/25 rounded-lg px-2 py-1.5 min-w-[90px]">
                  <Clock size={12} className="text-amber-400" />
                  <div className="flex flex-col leading-tight">
                    <span className="text-[8px] uppercase tracking-wider text-white/60">Next</span>
                    <span className="text-sm font-bold text-white tabular-nums">{getCountdown()}</span>
                  </div>
                  <ChevronRight size={12} className="text-amber-400" />
                </div>
              </div>
            </div>

          </div>

          {/* Bottom Quick Stats */}
          <div className="mt-2 pt-2 border-t border-white/10">
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1 sm:gap-1.5">
              {prayerSchedule.map((prayer) => {
                const isCurrentPrayer = getCurrentPrayer() === prayer.name;
                const isNextPrayer = getNextPrayer().name === prayer.name;
                
                return (
                  <div
                    key={prayer.name}
                    className={`
                      text-center py-1.5 px-1 rounded-md
                      ${isCurrentPrayer 
                        ? 'bg-amber-400/25 border border-amber-400/40' 
                        : isNextPrayer
                          ? 'bg-white/10 border border-white/20'
                          : 'bg-white/5 border border-transparent'
                      }
                    `}
                  >
                    <p className={`text-[8px] uppercase tracking-wider ${
                      isCurrentPrayer ? 'text-amber-300 font-semibold' : 'text-white/60'
                    }`}>
                      {prayer.name}
                    </p>
                    <p className={`text-[11px] font-bold tabular-nums ${
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