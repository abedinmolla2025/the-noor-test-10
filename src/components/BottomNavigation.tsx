import { useLocation, useNavigate } from "react-router-dom";

interface NavItem {
  icon: string;
  label: string;
  id: string;
  path: string;
}

const navItems: NavItem[] = [
  { 
    id: "home",
    icon: "🏠",
    label: "Home",
    path: "/"
  },
  { 
    id: "quran",
    icon: "📖",
    label: "Quran",
    path: "/quran"
  },
  { 
    id: "hadith",
    icon: "📜",
    label: "Hadith",
    path: "/bukhari"
  },
  { 
    id: "calendar",
    icon: "🗓️",
    label: "Calendar",
    path: "/calendar"
  },
  { 
    id: "settings",
    icon: "⚙️",
    label: "Settings",
    path: "/settings"
  },
];

const BottomNavigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg z-50 safe-area-bottom">
      <div className="w-full max-w-lg mx-auto flex justify-around items-center py-2 px-2 sm:px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => navigate(item.path)}
            className={`bottom-nav-item ${isActive(item.path) ? "active" : ""}`}
          >
            <div className={`transition-transform text-xl sm:text-2xl ${isActive(item.path) ? "scale-110" : ""}`}>
              {item.icon}
            </div>
            <span className={`text-[10px] sm:text-xs font-medium ${
              isActive(item.path) ? "text-primary" : "text-muted-foreground"
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
      {/* Safe area for mobile devices */}
      <div className="pb-[env(safe-area-inset-bottom)]" />
    </nav>
  );
};

export default BottomNavigation;
