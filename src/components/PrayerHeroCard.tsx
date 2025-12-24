import { useState, useEffect } from "react";
import { MapPin, Clock, Loader2 } from "lucide-react";
import prayingMan from "@/assets/praying-man.webp";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";

interface PrayerHeroCardProps {
  prayerData?: ReturnType<typeof usePrayerTimes>;
}

const PrayerHeroCard = ({ prayerData }: PrayerHeroCardProps) => {
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
    const nextMinutes = hours * 60 + minutes;
    const nowMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const nowSeconds = currentTime.getSeconds();

    // Calculate total seconds until next prayer
    let diffTotalSeconds = (nextMinutes - nowMinutes) * 60 - nowSeconds;
    
    // If negative, it means next prayer is tomorrow (Fajr after Isha)
    if (diffTotalSeconds < 0) {
      diffTotalSeconds += 24 * 60 * 60; // Add 24 hours in seconds
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
      hour12: false,
    });
  };

  const period = currentTime.getHours() >= 12 ? "PM" : "AM";

  const hijriDateStr = hijriDate
    ? `${hijriDate.day} ${hijriDate.month.en}, ${hijriDate.year} AH`
    : "Loading...";

  const locationStr = location?.city || "Loading...";

  return (
    <div className="islamic-card min-h-[200px]">
      {/* Decorative circles */}
      <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary-foreground/5" />
      <div className="absolute -right-5 top-20 w-24 h-24 rounded-full bg-primary-foreground/5" />

      <div className="relative z-10 flex justify-between items-start">
        <div className="flex-1">
          {/* Location and Date */}
          <div className="flex items-center gap-4 text-sm opacity-90 mb-4">
            <div className="flex items-center gap-1.5">
              {isLoading ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <MapPin size={14} />
              )}
              <span>{locationStr}</span>
            </div>
            <span>•</span>
            <span className="font-arabic">{hijriDateStr}</span>
          </div>

          {/* Current Prayer */}
          <h2 className="text-3xl font-bold mb-1">{getCurrentPrayer()}</h2>

          {/* Time */}
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-5xl font-bold tracking-tight">
              {formatTime(currentTime)}
            </span>
            <span className="text-xl font-medium opacity-80">{period}</span>
          </div>

          {/* Countdown */}
          <div className="inline-flex items-center gap-2 bg-primary-foreground/15 rounded-full px-4 py-2">
            <Clock size={16} className="animate-pulse-soft" />
            <span className="text-sm font-medium">Next in {getCountdown()}</span>
          </div>
        </div>

        {/* Praying Person Image */}
        <div className="hidden sm:block animate-float">
          <img
            src={prayingMan}
            alt="Person praying"
            className="w-48 h-48 object-contain drop-shadow-lg -scale-x-100"
          />
        </div>
      </div>
    </div>
  );
};

export default PrayerHeroCard;
