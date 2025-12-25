import { useState, useEffect } from "react";
import { MapPin, Clock, Loader2, ChevronRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import prayingMan from "@/assets/praying-man.webp";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

interface PrayerHeroCardProps {
  prayerData?: ReturnType<typeof usePrayerTimes>;
}

const PrayerHeroCard = ({ prayerData }: PrayerHeroCardProps) => {
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
        {/* Dynamic Gradient Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[hsl(158,64%,18%)] via-[hsl(168,60%,22%)] to-[hsl(175,55%,15%)]" />
        
        {/* Animated Orbs */}
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            opacity: [0.15, 0.25, 0.15]
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -right-20 w-80 h-80 bg-gradient-to-br from-[hsl(45,93%,58%)] to-[hsl(35,90%,50%)] rounded-full blur-[80px]"
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            opacity: [0.1, 0.2, 0.1]
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-tr from-[hsl(158,64%,45%)] to-[hsl(180,50%,40%)] rounded-full blur-[60px]"
        />
        
        {/* Mesh Pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }} />

        {/* Content Container */}
        <div className="relative z-10 p-6 md:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            
            {/* Left Section - Main Info */}
            <div className="flex-1 space-y-5 relative z-20">
              
              {/* Top Bar - Location & Hijri Date */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex flex-wrap items-center gap-3"
              >
                <div className="flex items-center gap-2 bg-white/5 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-[hsl(45,93%,58%)]" />
                  ) : (
                    <MapPin size={14} className="text-[hsl(45,93%,58%)]" />
                  )}
                  <span className="text-sm text-white/90 font-medium">{locationStr}</span>
                </div>
                <div className="hidden sm:flex items-center gap-2 bg-[hsl(45,93%,58%)]/10 backdrop-blur-sm rounded-full px-4 py-2 border border-[hsl(45,93%,58%)]/20">
                  <span className="font-arabic text-sm text-[hsl(45,93%,58%)]">{hijriDateStr}</span>
                </div>
              </motion.div>

              {/* Current Time - Hero Display */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="space-y-2"
              >
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-[hsl(45,93%,58%)]" />
                  <span className="text-xs text-[hsl(45,93%,58%)] uppercase tracking-[0.2em] font-semibold">
                    Current Prayer
                  </span>
                </div>
                
                <div className="flex items-baseline gap-4">
                  <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                    {getCurrentPrayer()}
                  </h2>
                  <span className="text-3xl md:text-4xl lg:text-5xl font-light text-white/70 tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                </div>
              </motion.div>

              {/* Next Prayer Countdown - Premium Badge */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <div className="inline-flex items-center gap-3 bg-gradient-to-r from-[hsl(45,93%,58%)]/15 via-[hsl(45,93%,58%)]/10 to-transparent border border-[hsl(45,93%,58%)]/25 rounded-2xl px-5 py-3 backdrop-blur-md group-hover:border-[hsl(45,93%,58%)]/50 group-hover:from-[hsl(45,93%,58%)]/25 transition-all duration-300">
                  <div className="relative">
                    <Clock size={18} className="text-[hsl(45,93%,58%)]" />
                    <motion.div 
                      animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="absolute inset-0 bg-[hsl(45,93%,58%)] rounded-full blur-sm"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider text-white/50">Next Prayer</span>
                    <span className="text-lg font-bold text-white tabular-nums">{getCountdown()}</span>
                  </div>
                  <ChevronRight size={18} className="text-[hsl(45,93%,58%)] ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.div>
            </div>

            {/* Right Section - Prayer Times Quick View */}
            {/* Centered Praying Man - Background Element */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden"
            >
              <div className="relative">
                {/* Multi-layer Glow Effect */}
                <motion.div 
                  animate={{ opacity: [0.2, 0.4, 0.2] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-16 bg-gradient-to-tr from-[hsl(45,93%,58%)]/25 via-[hsl(45,93%,70%)]/15 to-transparent rounded-full blur-[60px]"
                />
                <motion.div 
                  animate={{ opacity: [0.15, 0.3, 0.15], scale: [1, 1.1, 1] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                  className="absolute -inset-12 bg-gradient-to-bl from-[hsl(158,64%,40%)]/15 via-transparent to-[hsl(45,93%,58%)]/10 rounded-full blur-[40px]"
                />
                
                {/* Floating Ring Effect */}
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                  className="absolute -inset-8 border border-[hsl(45,93%,58%)]/10 rounded-full"
                />
                
                {/* Image Container */}
                <div className="relative">
                  {/* Bottom Fade for Illusion */}
                  <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-[hsl(158,64%,18%)] via-[hsl(158,64%,18%)]/70 to-transparent z-10" />
                  
                  <img
                    src={prayingMan}
                    alt="Person praying"
                    className="w-48 h-56 md:w-72 md:h-80 lg:w-96 lg:h-[26rem] object-contain opacity-40 md:opacity-50 drop-shadow-[0_0_60px_rgba(212,175,55,0.3)] -scale-x-100 relative z-0"
                  />
                  
                  {/* Subtle overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent via-[hsl(45,93%,58%)]/3 to-[hsl(45,93%,58%)]/5 mix-blend-overlay z-5" />
                </div>
              </div>
            </motion.div>
          </div>

          {/* Bottom Quick Stats - Mobile Friendly */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mt-6 pt-5 border-t border-white/10"
          >
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3">
              {prayerSchedule.map((prayer, index) => {
                const isCurrentPrayer = getCurrentPrayer() === prayer.name;
                const isNextPrayer = getNextPrayer().name === prayer.name;
                
                return (
                  <motion.div
                    key={prayer.name}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.05 }}
                    className={`
                      relative text-center py-2.5 px-2 rounded-xl transition-all duration-300
                      ${isCurrentPrayer 
                        ? 'bg-[hsl(45,93%,58%)]/20 border border-[hsl(45,93%,58%)]/40 shadow-lg shadow-[hsl(45,93%,58%)]/10' 
                        : isNextPrayer
                          ? 'bg-white/5 border border-white/20'
                          : 'bg-white/[0.02] border border-transparent hover:bg-white/5'
                      }
                    `}
                  >
                    {isCurrentPrayer && (
                      <motion.div 
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute inset-0 bg-[hsl(45,93%,58%)]/10 rounded-xl"
                      />
                    )}
                    <p className={`text-[10px] sm:text-xs uppercase tracking-wider mb-1 ${
                      isCurrentPrayer ? 'text-[hsl(45,93%,58%)] font-semibold' : 'text-white/50'
                    }`}>
                      {prayer.name}
                    </p>
                    <p className={`text-sm sm:text-base font-bold tabular-nums ${
                      isCurrentPrayer ? 'text-[hsl(45,93%,58%)]' : 'text-white/90'
                    }`}>
                      {formatPrayerTime(prayer.time)}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Outer Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(45,93%,58%)]/0 via-[hsl(45,93%,58%)]/10 to-[hsl(45,93%,58%)]/0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
    </motion.div>
  );
};

export default PrayerHeroCard;