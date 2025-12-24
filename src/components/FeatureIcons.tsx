import { useState } from "react";
import { motion, TargetAndTransition } from "framer-motion";
import QiblaCompass from "./QiblaCompass";
import TasbihCounter from "./TasbihCounter";
import DuaCollection from "./DuaCollection";
import BabyNames from "./BabyNames";

interface FeatureItem {
  emoji: string;
  label: string;
  animation: TargetAndTransition;
  action?: string;
}

const features: FeatureItem[] = [
  { 
    emoji: "📖", 
    label: "Quran",
    animation: {
      rotateY: [0, 15, 0, -15, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "🤲", 
    label: "Dua",
    action: "dua",
    animation: {
      y: [0, -4, 0],
      scale: [1, 1.05, 1],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "👶", 
    label: "Names",
    action: "names",
    animation: {
      rotate: [-5, 5, -5],
      transition: { duration: 2.5, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "🧭", 
    label: "Qibla",
    action: "qibla",
    animation: {
      rotate: [0, 20, -20, 0],
      transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "📿", 
    label: "Tasbih",
    action: "tasbih",
    animation: {
      y: [0, -3, 0],
      rotate: [0, 10, 0],
      transition: { duration: 2, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
  { 
    emoji: "✨", 
    label: "99 Names",
    animation: {
      scale: [1, 1.2, 1],
      opacity: [1, 0.8, 1],
      transition: { duration: 1.5, repeat: Infinity, ease: "easeInOut" as const }
    }
  },
];

const FeatureIcons = () => {
  const [qiblaOpen, setQiblaOpen] = useState(false);
  const [tasbihOpen, setTasbihOpen] = useState(false);
  const [duaOpen, setDuaOpen] = useState(false);
  const [namesOpen, setNamesOpen] = useState(false);

  const handleFeatureClick = (action?: string) => {
    switch (action) {
      case "qibla":
        setQiblaOpen(true);
        break;
      case "tasbih":
        setTasbihOpen(true);
        break;
      case "dua":
        setDuaOpen(true);
        break;
      case "names":
        setNamesOpen(true);
        break;
      default:
        break;
    }
  };

  return (
    <>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {features.map((feature, index) => (
          <button
            key={feature.label}
            onClick={() => handleFeatureClick(feature.action)}
            className="flex-shrink-0 group cursor-pointer w-16 h-16 bg-card rounded-2xl shadow-soft flex items-center justify-center hover:shadow-md transition-shadow"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <motion.span
              className="text-3xl"
              animate={feature.animation}
            >
              {feature.emoji}
            </motion.span>
          </button>
        ))}
      </div>

      {/* Modals */}
      <QiblaCompass open={qiblaOpen} onOpenChange={setQiblaOpen} />
      <TasbihCounter open={tasbihOpen} onOpenChange={setTasbihOpen} />
      <DuaCollection open={duaOpen} onOpenChange={setDuaOpen} />
      <BabyNames open={namesOpen} onOpenChange={setNamesOpen} />
    </>
  );
};

export const FeatureLabels = () => {
  return (
    <div className="flex gap-3 mt-2">
      {features.map((feature) => (
        <div key={feature.label} className="w-16 flex-shrink-0 text-center">
          <span className="text-xs text-muted-foreground font-medium">
            {feature.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default FeatureIcons;
