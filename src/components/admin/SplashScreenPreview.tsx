 import { useState, useEffect } from 'react';
 import Lottie from 'lottie-react';
 import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
 import { Monitor, Tablet, Smartphone, Play, X } from 'lucide-react';
 
 interface SplashScreenPreviewProps {
   lottieUrl: string;
   duration: number;
   fadeOutDuration: number;
 }
 
 const DEVICE_SIZES = {
   mobile: { width: 390, height: 844, label: 'iPhone 13', icon: Smartphone },
   tablet: { width: 768, height: 1024, label: 'iPad', icon: Tablet },
   desktop: { width: 1440, height: 900, label: 'Desktop', icon: Monitor },
 };
 
 export function SplashScreenPreview({ lottieUrl, duration, fadeOutDuration }: SplashScreenPreviewProps) {
   const [device, setDevice] = useState<keyof typeof DEVICE_SIZES>('mobile');
   const [isPlaying, setIsPlaying] = useState(false);
   const [animationData, setAnimationData] = useState<any>(null);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const [visible, setVisible] = useState(true);
   const [fadeOut, setFadeOut] = useState(false);
 
   const currentDevice = DEVICE_SIZES[device];
 
   useEffect(() => {
     if (!lottieUrl) {
       setError('No Lottie URL provided');
       return;
     }
 
     setLoading(true);
     setError(null);
     
     fetch(lottieUrl)
       .then((res) => {
         if (!res.ok) throw new Error('Failed to load animation');
         return res.json();
       })
       .then((data) => {
         setAnimationData(data);
         setLoading(false);
       })
       .catch((err) => {
         setError(err.message || 'Failed to load animation');
         setLoading(false);
       });
   }, [lottieUrl]);
 
   const handlePlay = () => {
     setIsPlaying(true);
     setVisible(true);
     setFadeOut(false);
 
     setTimeout(() => {
       setFadeOut(true);
       setTimeout(() => {
         setVisible(false);
         setIsPlaying(false);
       }, fadeOutDuration);
     }, duration);
   };
 
   const handleStop = () => {
     setIsPlaying(false);
     setVisible(true);
     setFadeOut(false);
   };
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center justify-between">
           <CardTitle className="text-base">Live Preview</CardTitle>
           <div className="flex items-center gap-2">
             {Object.entries(DEVICE_SIZES).map(([key, { label, icon: Icon }]) => (
               <Button
                 key={key}
                 variant={device === key ? 'default' : 'outline'}
                 size="sm"
                 onClick={() => setDevice(key as keyof typeof DEVICE_SIZES)}
                 className="gap-2"
               >
                 <Icon className="h-4 w-4" />
                 <span className="hidden sm:inline">{label}</span>
               </Button>
             ))}
           </div>
         </div>
       </CardHeader>
       <CardContent className="space-y-4">
         <div className="flex items-center justify-between">
           <div className="text-sm text-muted-foreground">
             {currentDevice.width}px × {currentDevice.height}px
           </div>
           <div className="flex gap-2">
             {!isPlaying ? (
               <Button onClick={handlePlay} size="sm" disabled={!animationData || loading}>
                 <Play className="mr-2 h-4 w-4" />
                 Play Preview
               </Button>
             ) : (
               <Button onClick={handleStop} size="sm" variant="outline">
                 <X className="mr-2 h-4 w-4" />
                 Stop
               </Button>
             )}
           </div>
         </div>
 
         {/* Device Frame */}
         <div className="flex items-center justify-center bg-muted/30 p-8 rounded-lg">
           <div
             className="relative bg-background border-4 border-foreground/10 rounded-2xl shadow-2xl overflow-hidden"
             style={{
               width: `${Math.min(currentDevice.width, 600)}px`,
               height: `${Math.min(currentDevice.height, 600)}px`,
               aspectRatio: `${currentDevice.width} / ${currentDevice.height}`,
             }}
           >
             {/* Splash Screen Simulation */}
             {isPlaying && visible && (
               <div
                 className={`absolute inset-0 z-50 flex items-center justify-center bg-background transition-opacity`}
                 style={{
                   opacity: fadeOut ? 0 : 1,
                   transitionDuration: `${fadeOutDuration}ms`,
                 }}
               >
                 {animationData ? (
                   <div className="w-full max-w-md px-8">
                     <Lottie animationData={animationData} loop={true} />
                   </div>
                 ) : (
                   <div className="flex flex-col items-center gap-4">
                     <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                     <p className="text-sm text-muted-foreground">Loading animation...</p>
                   </div>
                 )}
               </div>
             )}
 
             {/* App Content Behind */}
             <div className="flex flex-col items-center justify-center h-full p-8 text-center">
               {loading ? (
                 <div className="flex flex-col items-center gap-4">
                   <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                   <p className="text-sm text-muted-foreground">Loading animation...</p>
                 </div>
               ) : error ? (
                 <div className="flex flex-col items-center gap-2">
                   <p className="text-sm text-destructive font-medium">Error loading animation</p>
                   <p className="text-xs text-muted-foreground">{error}</p>
                 </div>
               ) : !isPlaying ? (
                 <div className="space-y-4">
                   <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                     <Play className="h-8 w-8 text-primary" />
                   </div>
                   <div className="space-y-2">
                     <p className="text-sm font-medium">Click "Play Preview" to test</p>
                     <p className="text-xs text-muted-foreground">
                       Duration: {duration}ms | Fade: {fadeOutDuration}ms
                     </p>
                   </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                   <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                     <Monitor className="h-8 w-8 text-primary" />
                   </div>
                   <p className="text-lg font-semibold">App Content</p>
                   <p className="text-xs text-muted-foreground">This is what users see after splash</p>
                 </div>
               )}
             </div>
           </div>
         </div>
 
         {/* Info Panel */}
         <div className="grid grid-cols-3 gap-4 text-center">
           <div className="space-y-1">
             <p className="text-xs text-muted-foreground">Duration</p>
             <p className="text-sm font-medium">{(duration / 1000).toFixed(1)}s</p>
           </div>
           <div className="space-y-1">
             <p className="text-xs text-muted-foreground">Fade Out</p>
             <p className="text-sm font-medium">{fadeOutDuration}ms</p>
           </div>
           <div className="space-y-1">
             <p className="text-xs text-muted-foreground">Total Time</p>
             <p className="text-sm font-medium">{((duration + fadeOutDuration) / 1000).toFixed(1)}s</p>
           </div>
         </div>
       </CardContent>
     </Card>
   );
 }