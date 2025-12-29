import { useState } from "react";
import { Moon, Sun, Sunrise, Sunset, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { motion, AnimatePresence } from "framer-motion";

interface PrayerTime {
  name: string;
  nameBn: string;
  time: string;
  icon: React.ReactNode;
}

const PrayerTimesList = () => {
  const { prayerTimes, isLoading } = usePrayerTimes();
  const [showAll, setShowAll] = useState(false);

  const today = new Date().toLocaleDateString("bn-BD", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });

  const formatTo12Hour = (time24: string): string => {
    const [hours, minutes] = time24.split(":").map(Number);
    const period = hours >= 12 ? "PM" : "AM";
    const hours12 = hours % 12 || 12;
    return `${hours12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${period}`;
  };

  const prayerTimesList: PrayerTime[] = prayerTimes
    ? [
        { name: "Fajr", nameBn: "ফজর", time: formatTo12Hour(prayerTimes.Fajr), icon: <Moon size={20} className="text-indigo-400" /> },
        { name: "Sunrise", nameBn: "সূর্যোদয়", time: formatTo12Hour(prayerTimes.Sunrise), icon: <Sunrise size={20} className="text-amber-400" /> },
        { name: "Dhuhr", nameBn: "যোহর", time: formatTo12Hour(prayerTimes.Dhuhr), icon: <Sun size={20} className="text-yellow-400" /> },
        { name: "Asr", nameBn: "আসর", time: formatTo12Hour(prayerTimes.Asr), icon: <Sun size={20} className="text-orange-400" /> },
        { name: "Maghrib", nameBn: "মাগরিব", time: formatTo12Hour(prayerTimes.Maghrib), icon: <Sunset size={20} className="text-rose-400" /> },
        { name: "Isha", nameBn: "ইশা", time: formatTo12Hour(prayerTimes.Isha), icon: <Moon size={20} className="text-purple-400" /> },
      ]
    : [
        { name: "Fajr", nameBn: "ফজর", time: "05:00 AM", icon: <Moon size={20} className="text-indigo-400" /> },
        { name: "Sunrise", nameBn: "সূর্যোদয়", time: "06:15 AM", icon: <Sunrise size={20} className="text-amber-400" /> },
        { name: "Dhuhr", nameBn: "যোহর", time: "12:30 PM", icon: <Sun size={20} className="text-yellow-400" /> },
        { name: "Asr", nameBn: "আসর", time: "03:30 PM", icon: <Sun size={20} className="text-orange-400" /> },
        { name: "Maghrib", nameBn: "মাগরিব", time: "06:00 PM", icon: <Sunset size={20} className="text-rose-400" /> },
        { name: "Isha", nameBn: "ইশা", time: "07:30 PM", icon: <Moon size={20} className="text-purple-400" /> },
      ];

  // Get next prayer index
  const getNextPrayerIndex = () => {
    if (!prayerTimes) return 0;
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const times = [
      prayerTimes.Fajr,
      prayerTimes.Sunrise,
      prayerTimes.Dhuhr,
      prayerTimes.Asr,
      prayerTimes.Maghrib,
      prayerTimes.Isha,
    ].map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    });

    for (let i = 0; i < times.length; i++) {
      if (currentMinutes < times[i]) {
        return i;
      }
    }
    return 0; // Fajr next day
  };

  const nextPrayerIndex = getNextPrayerIndex();
  const nextPrayer = prayerTimesList[nextPrayerIndex];

  // Calculate time remaining
  const getTimeRemaining = () => {
    if (!prayerTimes) return "";
    
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    
    const times = [
      prayerTimes.Fajr,
      prayerTimes.Sunrise,
      prayerTimes.Dhuhr,
      prayerTimes.Asr,
      prayerTimes.Maghrib,
      prayerTimes.Isha,
    ].map((time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    });

    let diff = times[nextPrayerIndex] - currentMinutes;
    if (diff < 0) diff += 24 * 60; // Next day

    const hours = Math.floor(diff / 60);
    const mins = diff % 60;

    if (hours > 0) {
      return `${hours} ঘণ্টা ${mins} মিনিট বাকি`;
    }
    return `${mins} মিনিট বাকি`;
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-xl p-3 shadow-lg">
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-emerald-300" />
          <span className="ml-2 text-xs text-emerald-200">নামাজের সময় লোড হচ্ছে...</span>
        </div>
      </div>
    );
  }
 
  return (
    <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-lg p-3 shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">আজকের নামাজের সময়</h3>
        <span className="text-[10px] text-emerald-200">{today}</span>
      </div>
 
      {/* Next Prayer Highlight */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-md p-2.5 mb-2"
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-8 h-8 rounded-md bg-white/20 flex items-center justify-center flex-shrink-0">
              {nextPrayer.icon}
            </div>
            <div className="min-w-0">
              <p className="text-amber-100 text-[9px] leading-none">পরবর্তী নামাজ</p>
              <p className="text-white font-semibold text-sm leading-snug truncate">{nextPrayer.nameBn}</p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="text-white font-semibold text-base leading-tight">{nextPrayer.time}</p>
            <p className="text-amber-100 text-[9px] leading-none mt-0.5">{getTimeRemaining()}</p>
          </div>
        </div>
      </motion.div>
 
      {/* Show More Button */}
      <button
        onClick={() => setShowAll(!showAll)}
        className="w-full flex items-center justify-center gap-1 py-1 text-[11px] text-emerald-200 hover:text-white transition-colors"
      >
        <span>{showAll ? "সংক্ষিপ্ত করুন" : "সব সময় দেখুন"}</span>
        {showAll ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
      </button>
 
      {/* All Prayer Times */}
      <AnimatePresence>
        {showAll && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="space-y-0.5 pt-1.5 border-t border-white/10 mt-1.5">
              {prayerTimesList.map((prayer, index) => (
                <motion.div
                  key={prayer.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className={`flex items-center justify-between py-1 px-2 rounded-md text-xs transition-colors ${
                    index === nextPrayerIndex
                      ? "bg-amber-500/20"
                      : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded bg-white/10 flex items-center justify-center">
                      {prayer.icon}
                    </div>
                    <span
                      className={`font-medium ${
                        index === nextPrayerIndex ? "text-amber-300" : "text-white"
                      }`}
                    >
                      {prayer.nameBn}
                    </span>
                  </div>
                  <span
                    className={`font-semibold tabular-nums ${
                      index === nextPrayerIndex ? "text-amber-300" : "text-white"
                    }`}
                  >
                    {prayer.time}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
 
export default PrayerTimesList;
