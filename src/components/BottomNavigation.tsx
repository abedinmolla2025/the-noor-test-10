import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, BookOpen, ScrollText, CalendarDays, Settings2, Bell } from "lucide-react";
import type React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import { useGlobalConfig } from "@/context/GlobalConfigContext";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  labelBn: string;
  id: string;
  path: string;
  moduleKey?: keyof ReturnType<typeof useGlobalConfig>["modules"];
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
    moduleKey: "quran",
  },
  {
    id: "hadith",
    icon: <ScrollText className="w-5 h-5" />,
    label: "Hadith",
    labelBn: "হাদিস",
    path: "/bukhari",
    moduleKey: "hadith",
  },
  {
    id: "calendar",
    icon: <CalendarDays className="w-5 h-5" />,
    label: "Calendar",
    labelBn: "ক্যালেন্ডার",
    path: "/calendar",
    moduleKey: "calendar",
  },
  {
    id: "notifications",
    icon: <Bell className="w-5 h-5" />,
    label: "Inbox",
    labelBn: "ইনবক্স",
    path: "/notifications",
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
  const isMobile = useIsMobile();
  const { modules } = useGlobalConfig();

  const isActive = (path: string) => location.pathname === path;

  // বড় স্ক্রিনে লুকিয়ে রেখে শুধু মোবাইল/ট্যাবের জন্য বটম ন্যাভবার
  if (!isMobile) return null;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border/50 bg-background md:bottom-4 md:mx-auto md:max-w-lg md:rounded-2xl md:border md:shadow-card" style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}>
      <div className="mx-auto flex w-full max-w-lg items-center justify-between gap-1.5 px-2 pt-2 pb-4 sm:px-4">
        {navItems
          .filter((item) => (item.moduleKey ? modules[item.moduleKey] !== false : true))
          .map((item) => {
            const active = isActive(item.path);

            return (
              <motion.button
                key={item.id}
                onClick={() => navigate(item.path)}
                whileTap={{ scale: 0.94 }}
                className={`bottom-nav-item relative flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-1.5 text-[11px] font-medium transition-all duration-200 sm:text-xs ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 left-1/2 h-1 w-9 -translate-x-1/2 rounded-full bg-gradient-to-r from-primary to-accent"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}

                <motion.div
                  className={`transition-transform ${active ? "scale-110" : "scale-100"}`}
                  animate={active ? { y: [0, -3, 0] } : { y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {item.icon}
                </motion.div>

                <span className={active ? "font-semibold" : undefined}>
                  {item.label}
                </span>
              </motion.button>
            );
          })}
      </div>
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNavigation;
