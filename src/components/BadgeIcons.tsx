import { LucideIcon } from "lucide-react";

interface BadgeIconProps {
  className?: string;
}

export const StarBadge = ({ className }: BadgeIconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="starGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#FFA500" />
        <stop offset="100%" stopColor="#FF8C00" />
      </linearGradient>
      <filter id="starShadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="45" fill="url(#starGold)" filter="url(#starShadow)" opacity="0.3"/>
    <path d="M50 15 L58 38 L82 38 L63 52 L70 75 L50 60 L30 75 L37 52 L18 38 L42 38 Z" 
          fill="url(#starGold)" filter="url(#starShadow)" stroke="#B8860B" strokeWidth="1.5"/>
    <circle cx="50" cy="35" r="3" fill="#FFF" opacity="0.8"/>
  </svg>
);

export const TrophyBadge = ({ className }: BadgeIconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="trophyGold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#FFD700" />
        <stop offset="50%" stopColor="#DAA520" />
        <stop offset="100%" stopColor="#B8860B" />
      </linearGradient>
      <filter id="trophyShadow">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.4"/>
      </filter>
    </defs>
    <ellipse cx="50" cy="85" rx="20" ry="4" fill="#000" opacity="0.2"/>
    <rect x="35" y="70" width="30" height="15" rx="2" fill="url(#trophyGold)" filter="url(#trophyShadow)"/>
    <path d="M30 25 Q30 45 40 50 L40 70 L60 70 L60 50 Q70 45 70 25 L30 25 Z" 
          fill="url(#trophyGold)" filter="url(#trophyShadow)" stroke="#8B6914" strokeWidth="1.5"/>
    <path d="M25 25 Q20 30 20 40 Q20 48 28 50 L30 25 Z" 
          fill="url(#trophyGold)" opacity="0.8"/>
    <path d="M75 25 Q80 30 80 40 Q80 48 72 50 L70 25 Z" 
          fill="url(#trophyGold)" opacity="0.8"/>
    <ellipse cx="50" cy="32" rx="8" ry="3" fill="#FFF" opacity="0.6"/>
  </svg>
);

export const MedalBadge = ({ className }: BadgeIconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="medalBlue" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#4169E1" />
        <stop offset="50%" stopColor="#1E90FF" />
        <stop offset="100%" stopColor="#0066CC" />
      </linearGradient>
      <linearGradient id="ribbon" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#DC143C" />
        <stop offset="100%" stopColor="#8B0000" />
      </linearGradient>
      <filter id="medalShadow">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.3"/>
      </filter>
    </defs>
    <path d="M35 15 L40 40 L30 50 L35 15 Z" fill="url(#ribbon)" filter="url(#medalShadow)"/>
    <path d="M65 15 L60 40 L70 50 L65 15 Z" fill="url(#ribbon)" filter="url(#medalShadow)"/>
    <circle cx="50" cy="60" r="28" fill="url(#medalBlue)" filter="url(#medalShadow)" stroke="#00008B" strokeWidth="2"/>
    <text x="50" y="70" textAnchor="middle" fontSize="30" fontWeight="bold" fill="#FFF">1</text>
    <circle cx="50" cy="45" r="4" fill="#FFF" opacity="0.7"/>
  </svg>
);

export const CrownBadge = ({ className }: BadgeIconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="crownPurple" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#9370DB" />
        <stop offset="50%" stopColor="#8A2BE2" />
        <stop offset="100%" stopColor="#6A0DAD" />
      </linearGradient>
      <radialGradient id="gem">
        <stop offset="0%" stopColor="#FF1493" />
        <stop offset="100%" stopColor="#C71585" />
      </radialGradient>
      <filter id="crownShadow">
        <feDropShadow dx="0" dy="3" stdDeviation="4" floodOpacity="0.4"/>
      </filter>
    </defs>
    <ellipse cx="50" cy="85" rx="25" ry="5" fill="#000" opacity="0.2"/>
    <path d="M20 70 L25 35 L35 50 L50 30 L65 50 L75 35 L80 70 Z" 
          fill="url(#crownPurple)" filter="url(#crownShadow)" stroke="#4B0082" strokeWidth="2"/>
    <rect x="18" y="70" width="64" height="8" rx="2" fill="url(#crownPurple)" stroke="#4B0082" strokeWidth="1.5"/>
    <circle cx="25" cy="35" r="4" fill="url(#gem)"/>
    <circle cx="50" cy="30" r="5" fill="url(#gem)"/>
    <circle cx="75" cy="35" r="4" fill="url(#gem)"/>
    <ellipse cx="50" cy="50" rx="10" ry="3" fill="#FFF" opacity="0.4"/>
  </svg>
);

export const SparklesBadge = ({ className }: BadgeIconProps) => (
  <svg className={className} viewBox="0 0 100 100" fill="none">
    <defs>
      <linearGradient id="sparkleEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#50C878" />
        <stop offset="50%" stopColor="#2E8B57" />
        <stop offset="100%" stopColor="#228B22" />
      </linearGradient>
      <filter id="sparkleShadow">
        <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3"/>
      </filter>
      <filter id="glow">
        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
        <feMerge>
          <feMergeNode in="coloredBlur"/>
          <feMergeNode in="SourceGraphic"/>
        </feMerge>
      </filter>
    </defs>
    <circle cx="50" cy="50" r="35" fill="url(#sparkleEmerald)" filter="url(#sparkleShadow)" stroke="#006400" strokeWidth="2"/>
    <path d="M50 20 L52 40 L60 35 L52 48 L65 50 L52 52 L60 65 L52 60 L50 80 L48 60 L40 65 L48 52 L35 50 L48 48 L40 35 L48 40 Z" 
          fill="#FFF" filter="url(#glow)" opacity="0.9"/>
    <circle cx="50" cy="30" r="3" fill="#FFF" opacity="0.8"/>
    <circle cx="60" cy="45" r="2" fill="#FFF" opacity="0.7"/>
    <circle cx="40" cy="55" r="2" fill="#FFF" opacity="0.7"/>
  </svg>
);

export const badgeIconMap = {
  star: StarBadge,
  trophy: TrophyBadge,
  medal: MedalBadge,
  crown: CrownBadge,
  sparkles: SparklesBadge,
};
