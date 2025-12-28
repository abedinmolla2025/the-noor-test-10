import { Play, Headphones, Music2, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

const AudioRecitationCard = () => {
  const navigate = useNavigate();

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => navigate("/quran")}
      className="relative overflow-hidden rounded-2xl shadow-xl cursor-pointer group"
    >
      {/* Premium Gradient Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary to-emerald-700" />
      
      {/* Subtle overlays (kept but dialed down) */}
      <div className="absolute inset-0 opacity-[0.04]" style={{
        backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, white 2px, white 4px)`,
        backgroundSize: '20px 100%'
      }} />
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
        backgroundSize: '24px 24px'
      }} />
      
      {/* Inner Border */}
      <div className="absolute inset-0 rounded-2xl border border-white/10 group-hover:border-primary/30 transition-colors duration-300" />

      {/* Content */}
      <div className="relative z-10 px-3 py-3 md:px-4 md:py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Icon */}
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-background/10 border border-white/15 backdrop-blur-sm">
              <Headphones size={18} className="text-amber-300" />
            </div>
            <div className="space-y-0.5">
              <p className="text-[10px] md:text-[11px] uppercase tracking-[0.14em] text-white/60 font-medium">
                কুরআন শুনুন
              </p>
          <div className="flex items-center gap-1 text-xs text-amber-200/90">
            <span className="font-semibold">Audio Recitation</span>
            <span className="h-1 w-1 rounded-full bg-amber-300" />
            <span>১০০+ সূরা • Multiple Reciters</span>
          </div>
            </div>
          </div>

          {/* Compact Play Button */}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-primary shadow-md shadow-amber-500/40 group-hover:shadow-lg group-hover:shadow-amber-500/60 transition-shadow"
            aria-label="Start audio recitation"
          >
            <Play size={18} className="ml-0.5" fill="currentColor" />
          </motion.button>
        </div>

        {/* Bottom Row - extra compact */}
        <div className="mt-2 flex items-center justify-between text-[11px] text-white/70">
          <div className="flex items-center gap-1.5">
            <div className="flex -space-x-1">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="flex h-5 w-5 items-center justify-center rounded-full bg-background/20 border border-white/15"
                >
                  <span className="text-[8px] text-white/70 font-medium">
                    {['AS', 'MS'][i - 1]}
                  </span>
                </div>
              ))}
            </div>
            <span>Beautiful & peaceful recitation</span>
          </div>

          <div className="flex items-center gap-0.5 text-amber-200">
            <span>▶ Play Now</span>
            <ChevronRight size={13} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default AudioRecitationCard;