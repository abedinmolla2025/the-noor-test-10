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
    <div className="min-h-screen bg-gradient-to-b from-emerald-800 via-emerald-700 to-teal-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-emerald-800/50 backdrop-blur-lg"
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

      <div className="relative z-10 flex flex-col items-center justify-center px-4 py-8">
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
              className="text-center mb-8"
            >
              <h2 className="text-2xl font-bold text-white mb-2">Exquisite compass that</h2>
              <h2 className="text-2xl font-bold text-white">points to Kaaba</h2>
            </motion.div>

            {/* Main Compass */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", delay: 0.2 }}
              className="relative w-[340px] h-[340px] mb-8"
            >
              {/* Outer Metallic Ring */}
              <div className="absolute inset-0 z-0 rounded-full bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300 shadow-[0_0_60px_rgba(251,191,36,0.3)]">
                <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-600 via-amber-500 to-amber-700 shadow-inner" />
                <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-200 via-amber-100 to-amber-300" />
              </div>
              
              {/* Compass Face */}
              <div className="absolute inset-4 rounded-full bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 shadow-[inset_0_4px_20px_rgba(0,0,0,0.15)]">
                {/* Decorative inner rings */}
                <div className="absolute inset-2 rounded-full border border-emerald-800/20" />
                <div className="absolute inset-6 rounded-full border border-emerald-800/10" />
              </div>

              {/* Degree Markers - 360 degrees */}
              <div className="absolute inset-6">
                {[...Array(72)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 origin-bottom h-full w-px"
                    style={{ transform: `translateX(-50%) rotate(${i * 5}deg)` }}
                  >
                    <div
                      className={`${
                        i % 18 === 0 
                          ? "w-1 h-5 bg-emerald-900" 
                          : i % 6 === 0
                          ? "w-0.5 h-4 bg-emerald-800/80"
                          : "w-0.5 h-2 bg-emerald-700/40"
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
                    className="text-[10px] font-medium text-emerald-800/70 mt-8"
                    style={{ transform: `rotate(-${deg}deg)` }}
                  >
                    {deg}
                  </span>
                </div>
              ))}

              {/* Cardinal Directions with decorative styling */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="absolute top-[52px] flex flex-col items-center">
                  <span className="text-2xl font-bold text-red-600 drop-shadow-sm">N</span>
                </div>
                <div className="absolute bottom-[52px] flex flex-col items-center">
                  <span className="text-xl font-bold text-emerald-800">S</span>
                </div>
                <div className="absolute left-[52px]">
                  <span className="text-xl font-bold text-emerald-800">W</span>
                </div>
                <div className="absolute right-[52px]">
                  <span className="text-xl font-bold text-emerald-800">E</span>
                </div>
              </div>

              {/* Inner Decorative Circle */}
              <div className="absolute inset-[85px] rounded-full bg-gradient-to-br from-[#f8f5ef] to-[#e8e2d6] shadow-[inset_0_2px_10px_rgba(0,0,0,0.1)] border border-amber-300/50" />

              {/* Qibla Direction Needle with Kaaba */}
              <motion.div
                className="absolute inset-0 z-50 flex items-center justify-center"
                animate={{ rotate: getCompassRotation() }}
                transition={{ type: "spring", stiffness: 50, damping: 20 }}
              >
                <div className="relative h-full w-full flex items-center justify-center">
                  {/* Main Needle Body */}
                  <div className="absolute top-[30px] left-1/2 -translate-x-1/2 w-3 h-[110px]">
                    {/* Needle shaft with metallic effect */}
                    <div className="absolute inset-x-0 top-8 bottom-0 bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 rounded-full shadow-lg" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-8 bottom-0 w-0.5 bg-amber-300/50" />
                    
                    {/* Kaaba at the tip */}
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.5, type: "spring" }}
                        className="relative"
                      >
                        {/* Glowing background */}
                        <div className="absolute -inset-3 bg-amber-400/30 rounded-full blur-md animate-pulse" />
                        
                        {/* Kaaba container */}
                        <div className="relative w-12 h-12 bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 rounded-xl shadow-[0_4px_15px_rgba(251,191,36,0.5)] flex items-center justify-center border-2 border-amber-200">
                          {/* 3D Kaaba Design */}
                          <svg viewBox="0 0 40 44" className="w-9 h-9">
                            {/* Kaaba body - main face */}
                            <rect x="6" y="8" width="28" height="32" fill="url(#kaabaGradient)" rx="1" />
                            
                            {/* Left face (3D effect) */}
                            <polygon points="6,8 6,40 2,36 2,12" fill="#1a1a1a" />
                            
                            {/* Top face (3D effect) */}
                            <polygon points="6,8 34,8 38,4 10,4" fill="#2d2d2d" />
                            
                            {/* Kiswah gold band - Hizam */}
                            <rect x="6" y="14" width="28" height="4" fill="url(#goldBand)" />
                            <rect x="2" y="17" width="4" height="3" fill="url(#goldBand)" opacity="0.7" />
                            
                            {/* Arabic calligraphy pattern on band */}
                            <rect x="8" y="15" width="2" height="2" fill="#b8860b" rx="0.3" />
                            <rect x="12" y="15" width="3" height="2" fill="#b8860b" rx="0.3" />
                            <rect x="17" y="15" width="2" height="2" fill="#b8860b" rx="0.3" />
                            <rect x="21" y="15" width="3" height="2" fill="#b8860b" rx="0.3" />
                            <rect x="26" y="15" width="2" height="2" fill="#b8860b" rx="0.3" />
                            <rect x="30" y="15" width="2" height="2" fill="#b8860b" rx="0.3" />
                            
                            {/* Door - Bab */}
                            <rect x="16" y="24" width="8" height="14" fill="url(#doorGradient)" rx="1" />
                            <rect x="17" y="25" width="6" height="12" fill="url(#doorInner)" rx="0.5" />
                            {/* Door frame decoration */}
                            <rect x="18" y="26" width="4" height="2" fill="#ffd700" opacity="0.6" rx="0.3" />
                            
                            {/* Maqam Ibrahim hint */}
                            <circle cx="20" cy="42" r="1.5" fill="#d4af37" opacity="0.5" />
                            
                            {/* Gradients */}
                            <defs>
                              <linearGradient id="kaabaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#1a1a1a" />
                                <stop offset="50%" stopColor="#0d0d0d" />
                                <stop offset="100%" stopColor="#1a1a1a" />
                              </linearGradient>
                              <linearGradient id="goldBand" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#d4af37" />
                                <stop offset="25%" stopColor="#ffd700" />
                                <stop offset="50%" stopColor="#d4af37" />
                                <stop offset="75%" stopColor="#ffd700" />
                                <stop offset="100%" stopColor="#d4af37" />
                              </linearGradient>
                              <linearGradient id="doorGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#b8860b" />
                                <stop offset="50%" stopColor="#daa520" />
                                <stop offset="100%" stopColor="#b8860b" />
                              </linearGradient>
                              <linearGradient id="doorInner" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#8b7355" />
                                <stop offset="100%" stopColor="#654321" />
                              </linearGradient>
                            </defs>
                          </svg>
                        </div>
                      </motion.div>
                    </div>
                  </div>
                  
                  {/* Opposite end of needle (red/south indicator) */}
                  <div className="absolute bottom-[30px] left-1/2 -translate-x-1/2 w-2 h-[100px]">
                    <div className="absolute inset-x-0 top-0 h-full bg-gradient-to-b from-gray-400 via-gray-500 to-gray-600 rounded-full shadow-lg" />
                    <div className="absolute left-1/2 -translate-x-1/2 top-0 h-full w-0.5 bg-gray-300/50" />
                  </div>
                </div>
              </motion.div>

              {/* Center Pivot with metallic effect */}
              <div className="absolute inset-0 z-60 flex items-center justify-center pointer-events-none">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-200 via-amber-300 to-amber-500 shadow-[0_2px_10px_rgba(0,0,0,0.3)] border-2 border-amber-100">
                  <div className="absolute inset-1 rounded-full bg-gradient-to-br from-amber-400 to-amber-600" />
                  <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 shadow-inner" />
                </div>
              </div>

              {/* Glass reflection effect */}
              <div className="absolute inset-4 z-70 rounded-full overflow-hidden pointer-events-none">
                <div className="absolute -top-1/2 -left-1/4 w-3/4 h-full bg-gradient-to-br from-white/20 to-transparent rotate-12" />
              </div>
            </motion.div>

            {/* Location Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 text-white/90 mb-4"
            >
              <MapPin className="w-5 h-5" />
              <span className="text-lg">{location?.city || "Your Location"}</span>
            </motion.div>

            {/* Distance to Mecca */}
            {distance && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white/10 backdrop-blur-md rounded-2xl px-6 py-4 mb-6"
              >
                <p className="text-white/70 text-sm text-center mb-1">Distance to Mecca</p>
                <p className="text-white text-2xl font-bold text-center">
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
