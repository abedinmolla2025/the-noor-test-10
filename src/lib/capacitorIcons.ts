 // Capacitor icon size requirements for iOS and Android
 export const CAPACITOR_ICON_SIZES = {
   ios: [
     { name: "AppIcon-20x20@1x", size: 20 },
     { name: "AppIcon-20x20@2x", size: 40 },
     { name: "AppIcon-20x20@3x", size: 60 },
     { name: "AppIcon-29x29@1x", size: 29 },
     { name: "AppIcon-29x29@2x", size: 58 },
     { name: "AppIcon-29x29@3x", size: 87 },
     { name: "AppIcon-40x40@1x", size: 40 },
     { name: "AppIcon-40x40@2x", size: 80 },
     { name: "AppIcon-40x40@3x", size: 120 },
     { name: "AppIcon-60x60@2x", size: 120 },
     { name: "AppIcon-60x60@3x", size: 180 },
     { name: "AppIcon-76x76@1x", size: 76 },
     { name: "AppIcon-76x76@2x", size: 152 },
     { name: "AppIcon-83.5x83.5@2x", size: 167 },
     { name: "AppIcon-1024x1024@1x", size: 1024 },
   ],
   android: [
     { name: "drawable-ldpi-icon", size: 36 },
     { name: "drawable-mdpi-icon", size: 48 },
     { name: "drawable-hdpi-icon", size: 72 },
     { name: "drawable-xhdpi-icon", size: 96 },
     { name: "drawable-xxhdpi-icon", size: 144 },
     { name: "drawable-xxxhdpi-icon", size: 192 },
     { name: "playstore-icon", size: 512 },
   ],
 } as const;
 
 export type IconPlatform = keyof typeof CAPACITOR_ICON_SIZES;