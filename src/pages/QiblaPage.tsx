import { useState, useEffect } from "react";
import { Loader2, ArrowLeft, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { motion } from "framer-motion";

const MECCA_LAT = 21.4225;
const MECCA_LNG = 39.8262;

const QiblaPage = () => {
  const navigate = useNavigate();
  const { location, isLoading } = usePrayerTimes();
  const [qiblaDirection, setQiblaDirection] = useState<number | null>(null);
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [compassSupported, setCompassSupported] = useState(false);
  const [distance, setDistance] = useState<number | null>(null);

  const calculateQiblaDirection = (lat: number, lng: number): number => {
    const userLatRad = (lat * Math.PI) / 180;
    const userLngRad = (lng * Math.PI) / 180;
    const meccaLatRad = (MECCA_LAT * Math.PI) / 180;
    const meccaLngRad = (MECCA_LNG * Math.PI) / 180;

    const lngDiff = meccaLngRad - userLngRad;

    const x = Math.sin(lngDiff);
    const y =
      Math.cos(userLatRad) * Math.tan(meccaLatRad) -
      Math.sin(userLatRad) * Math.cos(lngDiff);

    let qibla = Math.atan2(x, y) * (180 / Math.PI);
    qibla = (qibla + 360) % 360;

    return qibla;
  };

  const calculateDistance = (lat: number, lng: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((MECCA_LAT - lat) * Math.PI) / 180;
    const dLng = ((MECCA_LNG - lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat * Math.PI) / 180) *
        Math.cos((MECCA_LAT * Math.PI) / 180) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  useEffect(() => {
    if (location?.latitude && location?.longitude) {
      const direction = calculateQiblaDirection(
        location.latitude,
        location.longitude
      );
      setQiblaDirection(direction);
      setDistance(calculateDistance(location.latitude, location.longitude));
    }
  }, [location]);

  useEffect(() => {
    const handleOrientation = (event: DeviceOrientationEvent) => {
      const anyEvent = event as any;
      const heading =
        typeof anyEvent.webkitCompassHeading === "number"
          ? (anyEvent.webkitCompassHeading as number)
          : event.alpha === null
            ? null
            : (360 - event.alpha + 360) % 360;

      if (heading === null) return;
      setCompassSupported(true);
      setDeviceHeading(heading);
    };

    if (typeof DeviceOrientationEvent !== "undefined") {
      if (typeof (DeviceOrientationEvent as any).requestPermission !== "function") {
        window.addEventListener("deviceorientation", handleOrientation);
        setCompassSupported(true);
      }
    }

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const requestCompassPermission = async () => {
    try {
      const permission = await (DeviceOrientationEvent as any).requestPermission();
      if (permission === "granted") {
        window.addEventListener("deviceorientation", (event) => {
          const anyEvent = event as any;
          const heading =
            typeof anyEvent.webkitCompassHeading === "number"
              ? (anyEvent.webkitCompassHeading as number)
              : event.alpha === null
                ? null
                : (360 - event.alpha + 360) % 360;

          if (heading === null) return;
          setDeviceHeading(heading);
          setCompassSupported(true);
        });
      }
    } catch (error) {
      console.error("Compass permission denied:", error);
    }
  };

  const getCompassRotation = (): number => {
    if (qiblaDirection === null) return 0;
    if (deviceHeading !== null) {
      return qiblaDirection - deviceHeading;
    }
    return qiblaDirection;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-600 via-teal-700 to-teal-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-10 left-10 w-20 h-20 border border-white/10 rotate-45" />
        <div className="absolute top-32 right-16 w-16 h-16 border border-white/10 rotate-12" />
        <div className="absolute bottom-40 left-8 w-12 h-12 border border-white/10 -rotate-12" />
        <div className="absolute bottom-20 right-20 w-24 h-24 border border-white/10 rotate-45" />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-teal-700/50 backdrop-blur-lg"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-xl font-bold text-white">Qibla</h1>
        </div>
      </motion.header>

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-6">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-12 h-12 animate-spin text-white" />
            <p className="text-white/80 mt-4">Finding your location...</p>
          </div>
        ) : (
          <>
            {/* Title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-6"
            >
              <h2 className="text-xl font-semibold text-white/90 mb-1">Exquisite compass that</h2>
              <h2 className="text-xl font-semibold text-white/90">points to Kaaba</h2>
            </motion.div>

            {/* Main Compass Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="relative w-[320px] h-[320px] mb-6"
            >
              {/* Outer Golden Ring with 3D Effect */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-b from-amber-300 via-amber-400 to-amber-600 shadow-[0_8px_32px_rgba(0,0,0,0.3),inset_0_2px_4px_rgba(255,255,255,0.5)]">
                {/* Inner shadow ring */}
                <div className="absolute inset-[3px] rounded-full bg-gradient-to-b from-amber-500 to-amber-700 shadow-[inset_0_4px_8px_rgba(0,0,0,0.3)]" />
                {/* Highlight ring */}
                <div className="absolute inset-[6px] rounded-full bg-gradient-to-b from-amber-200 via-amber-300 to-amber-400" />
              </div>

              {/* Compass Face - Cream/Beige */}
              <div className="absolute inset-[10px] rounded-full bg-gradient-to-br from-[#f5f0e3] via-[#ebe4d3] to-[#e0d8c5] shadow-[inset_0_4px_20px_rgba(0,0,0,0.1)]">
                {/* Decorative rings */}
                <div className="absolute inset-4 rounded-full border border-amber-600/30" />
                <div className="absolute inset-8 rounded-full border border-amber-600/20" />
              </div>

              {/* Degree Tick Marks */}
              <div className="absolute inset-[16px] rounded-full">
                {[...Array(72)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 origin-bottom h-1/2 w-px -translate-x-1/2"
                    style={{ transform: `translateX(-50%) rotate(${i * 5}deg)` }}
                  >
                    <div
                      className={`${
                        i % 18 === 0
                          ? "w-1 h-4 bg-amber-800"
                          : i % 6 === 0
                          ? "w-0.5 h-3 bg-amber-700/80"
                          : "w-0.5 h-2 bg-amber-600/50"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Degree Numbers */}
              {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
                <div
                  key={deg}
                  className="absolute inset-0 flex justify-center"
                  style={{ transform: `rotate(${deg}deg)` }}
                >
                  <span
                    className="text-[9px] font-semibold text-amber-900/60 mt-[26px]"
                    style={{ transform: `rotate(-${deg}deg)` }}
                  >
                    {deg}°
                  </span>
                </div>
              ))}

              {/* Cardinal Directions */}
              <div className="absolute inset-0">
                {/* North - Red Triangle */}
                <div className="absolute top-[42px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                  <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[10px] border-b-red-600 mb-0.5" />
                  <span className="text-lg font-bold text-red-600">N</span>
                </div>
                {/* South */}
                <div className="absolute bottom-[42px] left-1/2 -translate-x-1/2">
                  <span className="text-base font-bold text-amber-800">S</span>
                </div>
                {/* East */}
                <div className="absolute right-[42px] top-1/2 -translate-y-1/2">
                  <span className="text-base font-bold text-amber-800">E</span>
                </div>
                {/* West */}
                <div className="absolute left-[42px] top-1/2 -translate-y-1/2">
                  <span className="text-base font-bold text-amber-800">W</span>
                </div>
              </div>

              {/* Inner Circle with Gradient */}
              <div className="absolute inset-[75px] rounded-full bg-gradient-to-br from-[#f8f5ed] to-[#e8e2d4] shadow-[inset_0_2px_8px_rgba(0,0,0,0.1)] border-2 border-amber-400/40" />

              {/* Rotating Needle with Kaaba */}
              <motion.div
                className="absolute inset-0"
                animate={{ rotate: getCompassRotation() }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              >
                {/* Needle pointing to Qibla */}
                <div className="absolute top-[20px] left-1/2 -translate-x-1/2 flex flex-col items-center">
                  {/* Kaaba Icon at top of needle */}
                  <div className="relative mb-1">
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-amber-400/40 rounded-full blur-lg animate-pulse" />
                    
                    {/* Kaaba Container */}
                    <div className="relative w-14 h-14 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 rounded-2xl shadow-[0_6px_20px_rgba(0,0,0,0.25)] border-2 border-amber-200 flex items-center justify-center">
                      {/* 3D Kaaba SVG */}
                      <svg viewBox="0 0 48 52" className="w-10 h-10">
                        {/* Shadow base */}
                        <ellipse cx="24" cy="50" rx="18" ry="2" fill="rgba(0,0,0,0.2)" />
                        
                        {/* Kaaba main body */}
                        <rect x="8" y="10" width="32" height="38" fill="#1a1a1a" rx="1" />
                        
                        {/* 3D Left face */}
                        <polygon points="8,10 8,48 4,44 4,14" fill="#0d0d0d" />
                        
                        {/* 3D Top face */}
                        <polygon points="8,10 40,10 44,6 12,6" fill="#2d2d2d" />
                        
                        {/* 3D Right edge highlight */}
                        <line x1="40" y1="10" x2="40" y2="48" stroke="#333" strokeWidth="1" />
                        
                        {/* Gold band - Hizam */}
                        <rect x="8" y="16" width="32" height="5" fill="url(#goldBandNew)" />
                        <rect x="4" y="19" width="4" height="4" fill="url(#goldBandNew)" opacity="0.8" />
                        
                        {/* Calligraphy pattern on band */}
                        <rect x="10" y="17.5" width="4" height="2" fill="#c9a227" rx="0.5" />
                        <rect x="16" y="17.5" width="3" height="2" fill="#c9a227" rx="0.5" />
                        <rect x="21" y="17.5" width="6" height="2" fill="#c9a227" rx="0.5" />
                        <rect x="29" y="17.5" width="3" height="2" fill="#c9a227" rx="0.5" />
                        <rect x="34" y="17.5" width="4" height="2" fill="#c9a227" rx="0.5" />
                        
                        {/* Door */}
                        <rect x="18" y="28" width="12" height="18" fill="url(#doorGoldNew)" rx="1" />
                        <rect x="19.5" y="29.5" width="9" height="15" fill="#654321" rx="0.5" />
                        {/* Door decoration */}
                        <rect x="21" y="31" width="6" height="3" fill="#b8860b" opacity="0.6" rx="0.5" />
                        <circle cx="24" cy="40" r="1" fill="#d4af37" />
                        
                        <defs>
                          <linearGradient id="goldBandNew" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#d4af37" />
                            <stop offset="30%" stopColor="#ffd700" />
                            <stop offset="50%" stopColor="#f0c14b" />
                            <stop offset="70%" stopColor="#ffd700" />
                            <stop offset="100%" stopColor="#d4af37" />
                          </linearGradient>
                          <linearGradient id="doorGoldNew" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor="#c9a227" />
                            <stop offset="50%" stopColor="#daa520" />
                            <stop offset="100%" stopColor="#b8860b" />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                  
                  {/* Needle shaft */}
                  <div className="w-3 h-[85px] bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-md relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-1 bg-amber-300/60" />
                  </div>
                </div>
                
                {/* Opposite needle (bottom) */}
                <div className="absolute bottom-[20px] left-1/2 -translate-x-1/2">
                  <div className="w-2.5 h-[85px] bg-gradient-to-t from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-md relative">
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gray-300/60" />
                  </div>
                  {/* Arrow tip */}
                  <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[12px] border-t-gray-500 -mt-1 ml-[-3px]" />
                </div>
              </motion.div>

              {/* Center Pivot */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 shadow-[0_4px_15px_rgba(0,0,0,0.3)] border-2 border-amber-100">
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner" />
                  <div className="absolute inset-3 rounded-full bg-gradient-to-br from-amber-200 to-amber-400" />
                </div>
              </div>

              {/* Glass Reflection */}
              <div className="absolute inset-[10px] rounded-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/4 w-3/4 h-full bg-gradient-to-br from-white/15 to-transparent rotate-12" />
              </div>
            </motion.div>

            {/* Location Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-white/90 mb-3"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{location?.city || "Your Location"}</span>
            </motion.div>

            {/* Distance Card */}
            {distance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl px-8 py-4 mb-4 border border-white/10"
              >
                <p className="text-white/60 text-sm text-center mb-1">Distance to Mecca</p>
                <p className="text-white text-3xl font-bold text-center">
                  {distance.toFixed(0)} km
                </p>
              </motion.div>
            )}

            {/* Compass Status */}
            {compassSupported && deviceHeading !== null ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 text-emerald-300"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-sm">Compass active - rotate your device</span>
              </motion.div>
            ) : (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-white/60 text-sm text-center"
              >
                Point your device towards the Qibla direction
              </motion.p>
            )}

            {/* Enable Compass Button for iOS */}
            {typeof (DeviceOrientationEvent as any).requestPermission === "function" &&
              !compassSupported && (
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={requestCompassPermission}
                  className="mt-6 px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-500 text-emerald-900 rounded-2xl font-semibold shadow-lg hover:shadow-xl transition-all active:scale-95"
                >
                  Enable Compass
                </motion.button>
              )}

            {/* Info Cards */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="grid grid-cols-2 gap-4 mt-8 w-full max-w-sm"
            >
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                <p className="text-white/60 text-xs mb-1">Latitude</p>
                <p className="text-white font-semibold">
                  {location?.latitude?.toFixed(4) || "--"}°
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center">
                <p className="text-white/60 text-xs mb-1">Longitude</p>
                <p className="text-white font-semibold">
                  {location?.longitude?.toFixed(4) || "--"}°
                </p>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </div>
  );
};

export default QiblaPage;
