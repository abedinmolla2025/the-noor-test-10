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
    }).replace(" AM", "").replace(" PM", "");
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
        <div className="relative z-10 p-6">
          <div className="flex justify-between items-start">
            
            {/* Left Section - Main Info */}
            <div className="flex-1 space-y-4">
              
              {/* Top Bar - Location & Hijri Date */}
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-4 text-sm"
              >
                <div className="flex items-center gap-1.5 text-white/80">
                  {isLoading ? (
                    <Loader2 size={14} className="animate-spin text-[hsl(45,93%,58%)]" />
                  ) : (
                    <MapPin size={14} className="text-[hsl(45,93%,58%)]" />
                  )}
                  <span>{locationStr}</span>
                </div>
                <span className="text-white/40">•</span>
                <span className="font-arabic text-white/80">{hijriDateStr}</span>
              </motion.div>

              {/* Current Prayer */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles size={16} className="text-[hsl(45,93%,58%)]" />
                  <span className="text-xs text-[hsl(45,93%,58%)] uppercase tracking-wider font-medium">Current Prayer</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-2">
                  {getCurrentPrayer()}
                </h2>
              </motion.div>

              {/* Time */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="flex items-baseline gap-2 mb-4"
              >
                <span className="text-5xl font-bold tracking-tight text-white">
                  {formatTime(currentTime)}
                </span>
                <span className="text-xl font-medium text-[hsl(45,93%,58%)]">{period}</span>
              </motion.div>

              {/* Countdown */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(45,93%,58%)]/20 to-[hsl(45,93%,58%)]/10 border border-[hsl(45,93%,58%)]/30 rounded-full px-4 py-2 backdrop-blur-sm group-hover:border-[hsl(45,93%,58%)]/50 transition-all"
              >
                <Clock size={16} className="text-[hsl(45,93%,58%)] animate-pulse" />
                <span className="text-sm font-medium text-white">Next in {getCountdown()}</span>
                <ChevronRight size={16} className="text-[hsl(45,93%,58%)] ml-1 group-hover:translate-x-1 transition-transform" />
              </motion.div>
            </div>

            {/* Praying Person Image */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="hidden sm:block relative"
            >
              <div className="absolute inset-0 bg-[hsl(45,93%,58%)]/20 rounded-full blur-3xl scale-75" />
              <img
                src={prayingMan}
                alt="Person praying"
                className="w-48 h-48 object-contain drop-shadow-2xl -scale-x-100 relative z-10"
              />
            </motion.div>
          </div>
        </div>
      </div>

      {/* Outer Glow Effect on Hover */}
      <div className="absolute -inset-1 bg-gradient-to-r from-[hsl(45,93%,58%)]/0 via-[hsl(45,93%,58%)]/10 to-[hsl(45,93%,58%)]/0 rounded-[2.5rem] opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10 blur-xl" />
    </motion.div>
  );
};

export default PrayerHeroCard;