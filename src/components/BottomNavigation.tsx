import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BookOpen, ScrollText, CalendarDays, Settings2 } from "lucide-react";
import type React from "react";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  labelBn: string;
  id: string;
  path: string;
}

const navItems: NavItem[] = [
  { 
    id: "home",
    icon: <Home className="w-5 h-5" />,
    label: "Home",
    labelBn: "হোম",
    path: "/",
  },
  { 
    id: "quran",
    icon: <BookOpen className="w-5 h-5" />,
    label: "Quran",
    labelBn: "কুরআন",
    path: "/quran",
  },
  { 
    id: "hadith",
    icon: <ScrollText className="w-5 h-5" />,
    label: "Hadith",
    labelBn: "হাদিস",
    path: "/bukhari",
  },
  { 
    id: "calendar",
    icon: <CalendarDays className="w-5 h-5" />,
    label: "Calendar",
    labelBn: "ক্যালেন্ডার",
    path: "/calendar",
  },
  { 
    id: "settings",
    icon: <Settings2 className="w-5 h-5" />,
    label: "Settings",
    labelBn: "সেটিংস",
    path: "/settings",
  },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background/80 dark:bg-card/90 backdrop-blur-2xl border-t border-border/60 shadow-[0_-10px_40px_rgba(0,0,0,0.45)] z-50 animate-fade-in">
      <div className="w-full max-w-lg mx-auto flex justify-around items-center pt-2 pb-5 px-3 sm:px-5">
        {navItems.map((item) => (
          <motion.button
            key={item.id}
            onClick={() => navigate(item.path)}
            whileTap={{ scale: 0.9 }}
            className={`relative flex flex-col items-center gap-1 px-3 py-2 rounded-2xl transition-all duration-200 hover-scale
              ${isActive(item.path)
                ? "text-primary"
                : "text-muted-foreground hover:text-foreground"}
            `}
          >
            {/* Active glow background */}
            {isActive(item.path) && (
              <motion.div
                layoutId="activeTabBackground"
                className="absolute inset-0 -z-10 rounded-2xl bg-primary/10 dark:bg-primary/15 border border-primary/30 shadow-[0_0_25px_rgba(234,179,8,0.35)]"
                transition={{ type: "spring", stiffness: 260, damping: 25 }}
              />
            )}

            {/* Active top indicator bar */}
            {isActive(item.path) && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 left-1/2 -translate-x-1/2 w-9 h-1.5 rounded-full bg-gradient-to-r from-primary to-accent shadow-[0_0_10px_rgba(234,179,8,0.65)]"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}

            <motion.div
              className={`text-xl sm:text-2xl transition-transform ${
                isActive(item.path) ? "scale-110" : ""
              }`}
              animate={isActive(item.path) ? { y: [0, -2, 0] } : {}}
              transition={{ duration: 0.3 }}
            >
              {item.icon}
            </motion.div>
            <div className="flex flex-col items-center leading-tight">
              <span
                className={`text-[10px] sm:text-xs font-medium tracking-wide ${
                  isActive(item.path) ? "text-primary font-semibold" : ""
                }`}
              >
                {item.label}
              </span>
              <span className="hidden xs:inline-block text-[9px] text-muted-foreground/80">
                {item.labelBn}
              </span>
            </div>
          </motion.button>
        ))}
      </div>
      {/* Safe area for mobile devices */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNavigation;
