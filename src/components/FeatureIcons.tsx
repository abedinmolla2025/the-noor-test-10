import { useNavigate } from "react-router-dom";
import { motion, TargetAndTransition } from "framer-motion";

interface FeatureItem {
  emoji: string;
  label: string;
  labelBn: string;
  animation: TargetAndTransition;
  path: string;
  gradient: string;
}

const features: FeatureItem[] = [
  { 
    emoji: "📖", 
    label: "Quran",
    labelBn: "কুরআন",
    path: "/quran",
    gradient: "from-emerald-500/30 to-teal-600/40",
    animation: {
      rotateY: [0, 15, 0, -15, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "🤲", 
    label: "Dua",
    labelBn: "দোয়া",
    path: "/dua",
    gradient: "from-amber-500/30 to-orange-600/40",
    animation: {
      y: [0, -4, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "👶", 
    label: "Names",
    labelBn: "নাম",
    path: "/baby-names",
    gradient: "from-pink-500/30 to-rose-600/40",
    animation: {
      rotate: [-5, 5, -5],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "🧭", 
    label: "Qibla",
    labelBn: "কিবলা",
    path: "/qibla",
    gradient: "from-blue-500/30 to-cyan-600/40",
    animation: {
      rotate: [0, 20, -20, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "📿", 
    label: "Tasbih",
    labelBn: "তাসবিহ",
    path: "/tasbih",
    gradient: "from-purple-500/30 to-violet-600/40",
    animation: {
      y: [0, -3, 0],
      rotate: [0, 10, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "✨", 
    label: "99 Names",
    labelBn: "৯৯ নাম",
    path: "/99-names",
    gradient: "from-[hsl(45,93%,58%)]/30 to-amber-600/40",
    animation: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
];

const FeatureIcons = () => {
  const navigate = useNavigate();

  return (
    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
      {features.map((feature, index) => (
        <motion.button
          key={feature.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          whileHover={{ scale: 1.05, y: -2 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(feature.path)}
          className="flex-shrink-0 flex flex-col items-center gap-1.5"
        >
          <div className={`relative group cursor-pointer w-14 h-14 bg-gradient-to-br ${feature.gradient} backdrop-blur-md rounded-2xl border border-white/20 shadow-[0_8px_20px_-4px_rgba(0,0,0,0.3),0_4px_8px_-2px_rgba(0,0,0,0.2),inset_0_1px_1px_rgba(255,255,255,0.15)] hover:shadow-[0_12px_28px_-4px_rgba(0,0,0,0.4),0_6px_12px_-2px_rgba(0,0,0,0.25)] hover:border-[hsl(45,93%,58%)]/40 transition-all duration-300 flex items-center justify-center overflow-hidden`}>
            {/* Inner highlight for 3D effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent rounded-2xl pointer-events-none" />
            <motion.span
              className="text-2xl drop-shadow-md relative z-10"
              animate={feature.animation}
            >
              {feature.emoji}
            </motion.span>
          </div>
          <span className="text-[10px] text-muted-foreground font-medium tracking-wide">
            {feature.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
};

// FeatureLabels is now integrated into FeatureIcons, keeping export for compatibility
export const FeatureLabels = () => null;

export default FeatureIcons;