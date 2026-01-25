 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Download, ExternalLink, Droplets } from "lucide-react";
 import { CAPACITOR_SPLASH_SIZES } from "@/lib/capacitorIcons";
 
 type SplashData = {
   platform: string;
   orientation: string;
   name: string;
   url: string;
 };
 
 export function CapacitorSplashViewer(props: { splashes: SplashData[] }) {
   const { splashes } = props;
   const [downloading, setDownloading] = useState<string | null>(null);
 
   const iosSplashes = splashes.filter((s) => s.platform === "ios");
   const androidSplashes = splashes.filter((s) => s.platform === "android");
 
   const iosPortrait = iosSplashes.filter((s) => s.orientation === "portrait");
   const iosLandscape = iosSplashes.filter((s) => s.orientation === "landscape");
   const androidPortrait = androidSplashes.filter((s) => s.orientation === "portrait");
   const androidLandscape = androidSplashes.filter((s) => s.orientation === "landscape");
 
   const downloadSplash = async (splash: SplashData) => {
     setDownloading(splash.name);
     try {
       const response = await fetch(splash.url);
       const blob = await response.blob();
       const url = URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = url;
       a.download = `${splash.name}.png`;
       a.click();
       URL.revokeObjectURL(url);
     } finally {
       setDownloading(null);
     }
   };
 
   const SplashGrid = ({ platformSplashes, orientation }: { platformSplashes: SplashData[]; orientation: string }) => {
     const specs =
       orientation === "portrait"
         ? [...CAPACITOR_SPLASH_SIZES.ios.portrait, ...CAPACITOR_SPLASH_SIZES.android.portrait]
         : [...CAPACITOR_SPLASH_SIZES.ios.landscape, ...CAPACITOR_SPLASH_SIZES.android.landscape];
 
     return (
       <div className="space-y-2">
         <p className="text-xs font-medium uppercase text-muted-foreground">
           {orientation} ({platformSplashes.length})
         </p>
         <div className="grid gap-3 sm:grid-cols-2">
           {platformSplashes.map((splash) => {
             const spec = specs.find((s) => s.name === splash.name);
             return (
               <div key={splash.name} className="flex items-center gap-3 rounded-lg border p-3">
                 <img
                   src={splash.url}
                   alt={splash.name}
                   className="h-16 w-auto max-w-[80px] rounded border object-contain"
                 />
                 <div className="flex-1 space-y-1">
                   <p className="text-xs font-medium">{splash.name}</p>
                   <p className="text-[10px] text-muted-foreground">
                     {spec?.width}×{spec?.height}px
                   </p>
                 </div>
                 <Button
                   size="sm"
                   variant="ghost"
                   className="h-8 w-8 p-0"
                   onClick={() => downloadSplash(splash)}
                   disabled={downloading === splash.name}
                 >
                   <Download className="h-3 w-3" />
                 </Button>
               </div>
             );
           })}
         </div>
       </div>
     );
   };
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center justify-between">
           <CardTitle className="flex items-center gap-2 text-base">
             <Droplets className="h-4 w-4" />
             Capacitor Splash Screens
           </CardTitle>
           <Button
             size="sm"
             variant="outline"
             className="gap-2"
             onClick={() =>
               window.open(
                 "https://capacitorjs.com/docs/guides/splash-screens-and-icons",
                 "_blank",
                 "noopener,noreferrer"
               )
             }
           >
             <ExternalLink className="h-3 w-3" />
             Capacitor Docs
           </Button>
         </div>
       </CardHeader>
       <CardContent>
         <Tabs defaultValue="ios">
           <TabsList className="grid w-full grid-cols-2">
             <TabsTrigger value="ios">iOS ({iosSplashes.length})</TabsTrigger>
             <TabsTrigger value="android">Android ({androidSplashes.length})</TabsTrigger>
           </TabsList>
 
           <TabsContent value="ios" className="space-y-4">
             <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
               <p className="text-xs text-muted-foreground">
                 Download splash screens and add to:{" "}
                 <code className="text-xs">App/App/Assets.xcassets/Splash.imageset</code>
               </p>
             </div>
             <SplashGrid platformSplashes={iosPortrait} orientation="portrait" />
             <SplashGrid platformSplashes={iosLandscape} orientation="landscape" />
           </TabsContent>
 
           <TabsContent value="android" className="space-y-4">
             <div className="rounded-lg border border-primary/20 bg-primary/5 p-3">
               <p className="text-xs text-muted-foreground">
                 Download splash screens and add to: <code className="text-xs">app/src/main/res/drawable-*/</code>
               </p>
             </div>
             <SplashGrid platformSplashes={androidPortrait} orientation="portrait" />
             <SplashGrid platformSplashes={androidLandscape} orientation="landscape" />
           </TabsContent>
         </Tabs>
       </CardContent>
     </Card>
   );
 }