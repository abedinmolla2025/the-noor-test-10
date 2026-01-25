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

// Capacitor splash screen size requirements for iOS and Android
export const CAPACITOR_SPLASH_SIZES = {
  ios: {
    portrait: [
      { name: "Default@2x~universal~anyany", width: 2732, height: 2732 },
      { name: "Default@2x~iphone~anyany", width: 1334, height: 1334 },
      { name: "Default@2x~iphone~comany", width: 750, height: 1334 },
      { name: "Default@3x~iphone~anyany", width: 2208, height: 2208 },
      { name: "Default@3x~iphone~anycom", width: 2208, height: 1242 },
      { name: "Default@3x~iphone~comany", width: 1242, height: 2208 },
      { name: "Default@2x~ipad~anyany", width: 2732, height: 2732 },
      { name: "Default@2x~ipad~comany", width: 1278, height: 2732 },
    ],
    landscape: [
      { name: "Default@2x~universal~comany", width: 2732, height: 1278 },
      { name: "Default@3x~iphone~comcom", width: 2208, height: 2208 },
      { name: "Default@2x~ipad~comcom", width: 2732, height: 2048 },
    ],
  },
  android: {
    portrait: [
      { name: "drawable-land-ldpi-screen", width: 320, height: 426 },
      { name: "drawable-land-mdpi-screen", width: 320, height: 470 },
      { name: "drawable-land-hdpi-screen", width: 480, height: 640 },
      { name: "drawable-land-xhdpi-screen", width: 720, height: 960 },
      { name: "drawable-land-xxhdpi-screen", width: 960, height: 1280 },
      { name: "drawable-land-xxxhdpi-screen", width: 1280, height: 1920 },
    ],
    landscape: [
      { name: "drawable-port-ldpi-screen", width: 426, height: 320 },
      { name: "drawable-port-mdpi-screen", width: 470, height: 320 },
      { name: "drawable-port-hdpi-screen", width: 640, height: 480 },
      { name: "drawable-port-xhdpi-screen", width: 960, height: 720 },
      { name: "drawable-port-xxhdpi-screen", width: 1280, height: 960 },
      { name: "drawable-port-xxxhdpi-screen", width: 1920, height: 1280 },
    ],
  },
} as const;

export type SplashOrientation = "portrait" | "landscape";