import { useState } from "react";

interface NavItem {
  icon: string;
  label: string;
  id: string;
}

const navItems: NavItem[] = [
  { 
    id: "home",
    icon: "🏠",
    label: "Home" 
  },
  { 
    id: "quran",
    icon: "📖",
    label: "Quran" 
  },
  { 
    id: "hadith",
    icon: "📜",
    label: "Hadith" 
  },
  { 
    id: "calendar",
    icon: "🗓️",
    label: "Calendar" 
  },
  { 
    id: "settings",
    icon: "⚙️",
    label: "Settings" 
  },
];

const BottomNavigation = () => {
  const [activeTab, setActiveTab] = useState("home");

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur-lg border-t border-border shadow-lg z-50">
      <div className="max-w-lg mx-auto flex justify-around items-center py-2 px-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`bottom-nav-item ${activeTab === item.id ? "active" : ""}`}
          >
            <div className={`transition-transform text-2xl ${activeTab === item.id ? "scale-110" : ""}`}>
              {item.icon}
            </div>
            <span className={`text-xs font-medium ${
              activeTab === item.id ? "text-primary" : "text-muted-foreground"
            }`}>
              {item.label}
            </span>
          </button>
        ))}
      </div>
      {/* Safe area for mobile devices */}
      <div className="h-safe-area-inset-bottom bg-card" />
    </nav>
  );
};

export default BottomNavigation;
