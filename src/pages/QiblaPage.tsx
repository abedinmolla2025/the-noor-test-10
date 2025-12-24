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
      if (event.alpha !== null) {
        setCompassSupported(true);
        setDeviceHeading(event.alpha);
      }
    };

    if (typeof DeviceOrientationEvent !== "undefined") {
      if (
        typeof (DeviceOrientationEvent as any).requestPermission !== "function"
      ) {
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
      const permission = await (
        DeviceOrientationEvent as any
      ).requestPermission();
      if (permission === "granted") {
        window.addEventListener("deviceorientation", (event) => {
          if (event.alpha !== null) {
            setDeviceHeading(event.alpha);
            setCompassSupported(true);
          }
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
              className="relative w-80 h-80 mb-8"
            >
              {/* Outer Decorative Ring */}
              <div className="absolute inset-0 rounded-full border-[3px] border-amber-400/30" />
              
              {/* Compass Background */}
              <div className="absolute inset-2 rounded-full bg-gradient-to-br from-amber-100 via-amber-50 to-amber-100 shadow-2xl">
                {/* Inner shadow effect */}
                <div className="absolute inset-0 rounded-full shadow-inner" />
              </div>

              {/* Degree Markers */}
              <div className="absolute inset-4">
                {[...Array(72)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute top-0 left-1/2 origin-bottom h-full w-px -translate-x-1/2"
                    style={{ transform: `translateX(-50%) rotate(${i * 5}deg)` }}
                  >
                    <div
                      className={`w-0.5 ${
                        i % 6 === 0 
                          ? "h-4 bg-emerald-800" 
                          : "h-2 bg-emerald-600/50"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Cardinal Directions */}
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="absolute top-6 text-xl font-bold text-emerald-800">N</span>
                <span className="absolute bottom-6 text-lg font-semibold text-emerald-700">S</span>
                <span className="absolute left-6 text-lg font-semibold text-emerald-700">W</span>
                <span className="absolute right-6 text-lg font-semibold text-emerald-700">E</span>
                
                {/* Intercardinal */}
                <span className="absolute top-10 right-10 text-sm text-emerald-600">NE</span>
                <span className="absolute top-10 left-10 text-sm text-emerald-600">NW</span>
                <span className="absolute bottom-10 right-10 text-sm text-emerald-600">SE</span>
                <span className="absolute bottom-10 left-10 text-sm text-emerald-600">SW</span>
              </div>

              {/* Inner Circle with Degree */}
              <div className="absolute inset-16 rounded-full bg-gradient-to-br from-amber-50 to-white flex items-center justify-center shadow-inner">
                <div className="text-center">
                  <p className="text-4xl font-bold text-emerald-800">
                    {qiblaDirection !== null ? `${Math.round(qiblaDirection)}°` : "--"}
                  </p>
                </div>
              </div>

              {/* Qibla Direction Arrow/Kaaba */}
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                animate={{ rotate: getCompassRotation() }}
                transition={{ type: "spring", stiffness: 30, damping: 15 }}
              >
                <div className="relative h-full w-full flex items-center justify-center">
                  {/* Arrow Line */}
                  <div className="absolute top-4 left-1/2 -translate-x-1/2 w-1 h-24 bg-gradient-to-b from-amber-500 to-amber-600 rounded-full shadow-lg" />
                  
                  {/* Kaaba Icon */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.5, type: "spring" }}
                      className="w-14 h-14 bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 rounded-lg shadow-lg flex items-center justify-center border-2 border-amber-300"
                    >
                      {/* Kaaba design */}
                      <div className="relative w-8 h-10 bg-gradient-to-b from-gray-800 to-black rounded-sm">
                        {/* Gold band */}
                        <div className="absolute top-2 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-400 via-amber-300 to-amber-400" />
                        {/* Door */}
                        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 w-2 h-3 bg-gradient-to-b from-amber-500 to-amber-600 rounded-t-sm" />
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Center Point */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 shadow-lg border-2 border-white" />
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
