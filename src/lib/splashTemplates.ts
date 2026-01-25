 export interface SplashTemplate {
   id: string;
   name: string;
   category: 'ramadan' | 'eid' | 'muharram' | 'general' | 'seasonal';
   description: string;
   lottieUrl: string;
   duration: number;
   fadeOutDuration: number;
   thumbnail?: string;
   colors: {
     primary: string;
     secondary: string;
   };
 }
 
 export const SPLASH_TEMPLATES: SplashTemplate[] = [
   // Ramadan Templates
   {
     id: 'ramadan-crescent',
     name: 'Ramadan Crescent Moon',
     category: 'ramadan',
     description: 'Elegant crescent moon with stars animation for Ramadan',
     lottieUrl: 'https://lottie.host/4d3e5f67-8b9c-4e1a-8f3d-9c2a1b0e6d7f/ramadan-moon.json',
     duration: 3500,
     fadeOutDuration: 600,
     colors: {
       primary: '#1e3a8a',
       secondary: '#fbbf24',
     },
   },
   {
     id: 'ramadan-lantern',
     name: 'Ramadan Lantern Glow',
     category: 'ramadan',
     description: 'Traditional lanterns with glowing light effect',
     lottieUrl: 'https://lottie.host/8a7b6c5d-4e3f-2g1h-9i8j-7k6l5m4n3o2p/lantern-glow.json',
     duration: 4000,
     fadeOutDuration: 500,
     colors: {
       primary: '#7c3aed',
       secondary: '#f59e0b',
     },
   },
   {
     id: 'ramadan-mosque',
     name: 'Ramadan Mosque Silhouette',
     category: 'ramadan',
     description: 'Beautiful mosque silhouette with sunset backdrop',
     lottieUrl: 'https://lottie.host/2b1c3d4e-5f6g-7h8i-9j0k-1l2m3n4o5p6q/mosque-sunset.json',
     duration: 3000,
     fadeOutDuration: 500,
     colors: {
       primary: '#ec4899',
       secondary: '#fb923c',
     },
   },
 
   // Eid Templates
   {
     id: 'eid-celebration',
     name: 'Eid Celebration',
     category: 'eid',
     description: 'Festive celebration with geometric patterns',
     lottieUrl: 'https://lottie.host/5c6d7e8f-9g0h-1i2j-3k4l-5m6n7o8p9q0r/eid-festive.json',
     duration: 3500,
     fadeOutDuration: 600,
     colors: {
       primary: '#10b981',
       secondary: '#fbbf24',
     },
   },
   {
     id: 'eid-mubarak',
     name: 'Eid Mubarak Stars',
     category: 'eid',
     description: 'Sparkling stars and crescents for Eid',
     lottieUrl: 'https://lottie.host/6d7e8f9g-0h1i-2j3k-4l5m-6n7o8p9q0r1s/eid-stars.json',
     duration: 4000,
     fadeOutDuration: 700,
     colors: {
       primary: '#8b5cf6',
       secondary: '#fcd34d',
     },
   },
 
   // Muharram Templates
   {
     id: 'muharram-simple',
     name: 'Muharram Minimal',
     category: 'muharram',
     description: 'Simple and respectful design for Muharram',
     lottieUrl: 'https://lottie.host/7e8f9g0h-1i2j-3k4l-5m6n-7o8p9q0r1s2t/muharram-minimal.json',
     duration: 3000,
     fadeOutDuration: 500,
     colors: {
       primary: '#475569',
       secondary: '#94a3b8',
     },
   },
 
   // General Islamic Templates
   {
     id: 'islamic-geometric',
     name: 'Islamic Geometric Pattern',
     category: 'general',
     description: 'Beautiful Islamic geometric art animation',
     lottieUrl: 'https://lottie.host/8f9g0h1i-2j3k-4l5m-6n7o-8p9q0r1s2t3u/geometric-pattern.json',
     duration: 3500,
     fadeOutDuration: 600,
     colors: {
       primary: '#0ea5e9',
       secondary: '#22d3ee',
     },
   },
   {
     id: 'islamic-calligraphy',
     name: 'Islamic Calligraphy',
     category: 'general',
     description: 'Elegant Arabic calligraphy animation',
     lottieUrl: 'https://lottie.host/9g0h1i2j-3k4l-5m6n-7o8p-9q0r1s2t3u4v/calligraphy.json',
     duration: 4000,
     fadeOutDuration: 500,
     colors: {
       primary: '#0f172a',
       secondary: '#cbd5e1',
     },
   },
 
   // Seasonal Templates
   {
     id: 'winter-night',
     name: 'Peaceful Night Sky',
     category: 'seasonal',
     description: 'Calm night sky with twinkling stars',
     lottieUrl: 'https://lottie.host/0h1i2j3k-4l5m-6n7o-8p9q-0r1s2t3u4v5w/night-sky.json',
     duration: 3500,
     fadeOutDuration: 600,
     colors: {
       primary: '#1e293b',
       secondary: '#64748b',
     },
   },
   {
     id: 'spring-flowers',
     name: 'Spring Blossoms',
     category: 'seasonal',
     description: 'Gentle flower petals falling animation',
     lottieUrl: 'https://lottie.host/1i2j3k4l-5m6n-7o8p-9q0r-1s2t3u4v5w6x/spring-flowers.json',
     duration: 4000,
     fadeOutDuration: 700,
     colors: {
       primary: '#059669',
       secondary: '#fbbf24',
     },
   },
 ];
 
 export const TEMPLATE_CATEGORIES = [
   { value: 'all', label: 'All Templates' },
   { value: 'ramadan', label: 'Ramadan' },
   { value: 'eid', label: 'Eid' },
   { value: 'muharram', label: 'Muharram' },
   { value: 'general', label: 'Islamic General' },
   { value: 'seasonal', label: 'Seasonal' },
 ] as const;