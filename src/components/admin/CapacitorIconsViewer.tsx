 import { useState } from "react";
 import { Button } from "@/components/ui/button";
 import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
 import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
 import { Download, ExternalLink, Smartphone } from "lucide-react";
 import { CAPACITOR_ICON_SIZES } from "@/lib/capacitorIcons";
 
 type IconData = {
   platform: string;
   name: string;
   url: string;
 };
 
 export function CapacitorIconsViewer(props: { icons: IconData[] }) {
   const { icons } = props;
   const [downloading, setDownloading] = useState<string | null>(null);
 
   const iosIcons = icons.filter((i) => i.platform === "ios");
   const androidIcons = icons.filter((i) => i.platform === "android");
 
   const downloadIcon = async (icon: IconData) => {
     setDownloading(icon.name);
     try {
       const response = await fetch(icon.url);
       const blob = await response.blob();
       const url = URL.createObjectURL(blob);
       const a = document.createElement("a");
       a.href = url;
       a.download = `${icon.name}.png`;
       a.click();
       URL.revokeObjectURL(url);
     } finally {
       setDownloading(null);
     }
   };
 
   const downloadAllZip = async (platform: "ios" | "android") => {
     // For now, just download the setup guide
     // In the future, we could use JSZip to create a proper zip file
     alert(
       `Download individual icons below, then follow the setup guide to add them to your ${platform.toUpperCase()} project.`
     );
   };
 
   const IconGrid = ({ platformIcons }: { platformIcons: IconData[] }) => (
     <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
       {platformIcons.map((icon) => {
         const spec = [...CAPACITOR_ICON_SIZES.ios, ...CAPACITOR_ICON_SIZES.android].find((s) => s.name === icon.name);
         return (
           <div key={icon.name} className="flex items-center gap-3 rounded-lg border p-3">
             <img src={icon.url} alt={icon.name} className="h-12 w-12 rounded border object-cover" />
             <div className="flex-1 space-y-1">
               <p className="text-xs font-medium">{icon.name}</p>
               <p className="text-[10px] text-muted-foreground">{spec?.size}×{spec?.size}px</p>
             </div>
             <Button
               size="sm"
               variant="ghost"
               className="h-8 w-8 p-0"
               onClick={() => downloadIcon(icon)}
               disabled={downloading === icon.name}
             >
               <Download className="h-3 w-3" />
             </Button>
           </div>
         );
       })}
     </div>
   );
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center justify-between">
           <CardTitle className="flex items-center gap-2 text-base">
             <Smartphone className="h-4 w-4" />
             Capacitor App Icons
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
             <TabsTrigger value="ios">iOS ({iosIcons.length})</TabsTrigger>
             <TabsTrigger value="android">Android ({androidIcons.length})</TabsTrigger>
           </TabsList>
 
           <TabsContent value="ios" className="space-y-3">
             <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
               <p className="text-xs text-muted-foreground">
                 Download icons and add to: <code className="text-xs">Assets.xcassets/AppIcon.appiconset</code>
               </p>
               <Button size="sm" variant="outline" onClick={() => downloadAllZip("ios")}>
                 Instructions
               </Button>
             </div>
             <IconGrid platformIcons={iosIcons} />
           </TabsContent>
 
           <TabsContent value="android" className="space-y-3">
             <div className="flex items-center justify-between rounded-lg border border-primary/20 bg-primary/5 p-3">
               <p className="text-xs text-muted-foreground">
                 Download icons and add to: <code className="text-xs">app/src/main/res/drawable-*/</code>
               </p>
               <Button size="sm" variant="outline" onClick={() => downloadAllZip("android")}>
                 Instructions
               </Button>
             </div>
             <IconGrid platformIcons={androidIcons} />
           </TabsContent>
         </Tabs>
       </CardContent>
     </Card>
   );
 }