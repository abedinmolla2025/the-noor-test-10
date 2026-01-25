 import { useState, useRef } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Alert, AlertDescription } from "@/components/ui/alert";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { Droplets, Upload, ExternalLink, Info, Power, PowerOff } from "lucide-react";
 import { useQueryClient } from "@tanstack/react-query";
 import { Badge } from "@/components/ui/badge";
 import { Switch } from "@/components/ui/switch";
 
 export function LottieSplashUploader(props: { branding: any; setBranding: (updater: any) => void }) {
   const { branding, setBranding } = props;
   const { toast } = useToast();
   const queryClient = useQueryClient();
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [uploading, setUploading] = useState(false);
   const [enabled, setEnabled] = useState(props.branding.splashEnabled ?? true);
 
   const uploadLottieJson = async (file: File) => {
     setUploading(true);
     try {
       const path = `branding/lottie-splash/${crypto.randomUUID()}-${file.name}`;
       const { data, error } = await supabase.storage.from("branding").upload(path, file, {
         cacheControl: "3600",
         upsert: true,
         contentType: "application/json",
       });
       if (error) throw error;
 
       const { data: publicUrlData } = supabase.storage.from("branding").getPublicUrl(data.path);
       setBranding((prev: any) => ({ ...prev, lottieSplashUrl: publicUrlData.publicUrl }));
 
       // Also update in database
       await supabase
         .from("app_settings")
         .upsert({
           setting_key: "branding",
           setting_value: { ...branding, lottieSplashUrl: publicUrlData.publicUrl },
         });
 
       queryClient.invalidateQueries({ queryKey: ["app-settings"] });
       toast({ title: "Lottie animation uploaded", description: "Refresh the app to see the animated splash screen" });
     } catch (e: any) {
       toast({
         title: "Upload failed",
         description: e?.message ?? "Could not upload Lottie JSON",
         variant: "destructive",
       });
     } finally {
       setUploading(false);
     }
   };
 
   const handleToggle = (checked: boolean) => {
     setEnabled(checked);
     setBranding((prev: any) => ({ ...prev, splashEnabled: checked }));
   };

   return (
     <Card>
       <CardHeader>
           <div className="flex items-center justify-between">
             <div className="flex items-center gap-2">
           <Droplets className="h-5 w-5 text-primary" />
           <CardTitle>Lottie Animated Splash Screen</CardTitle>
         </div>
             <div className="flex items-center gap-2">
               {enabled ? (
                 <Badge variant="default" className="gap-1">
                   <Power className="h-3 w-3" />
                   Enabled
                 </Badge>
               ) : (
                 <Badge variant="secondary" className="gap-1">
                   <PowerOff className="h-3 w-3" />
                   Disabled
                 </Badge>
               )}
               <Switch checked={enabled} onCheckedChange={handleToggle} />
             </div>
           </div>
         <CardDescription>Upload a Lottie JSON animation for web & Capacitor app loading</CardDescription>
       </CardHeader>
       <CardContent className="space-y-4">
         <Alert>
           <Info className="h-4 w-4" />
           <AlertDescription className="text-xs space-y-2">
             <p>
               <strong>How it works:</strong> Upload a Lottie JSON file and it will automatically play when users
               first load your app (web + Capacitor). The splash screen shows for 3 seconds then fades out.
             </p>
             <p>
               Get free Lottie animations from:{" "}
               <a
                 href="https://lottiefiles.com"
                 target="_blank"
                 rel="noopener noreferrer"
                 className="text-primary underline"
               >
                 LottieFiles.com
               </a>
             </p>
           </AlertDescription>
         </Alert>
 
           {enabled && branding.lottieSplashUrl ? (
           <Alert className="border-primary/20 bg-primary/5">
             <Droplets className="h-4 w-4 text-primary" />
             <AlertDescription>
               <div className="flex items-center justify-between gap-4">
                 <div>
                   <p className="text-sm font-medium">Lottie splash active</p>
                   <p className="text-xs text-muted-foreground mt-1">Animation will play on app load</p>
                 </div>
                 <div className="flex gap-2">
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => window.open(branding.lottieSplashUrl, "_blank", "noopener,noreferrer")}
                   >
                     <ExternalLink className="h-3 w-3 mr-1" />
                     View JSON
                   </Button>
                   <Button
                     size="sm"
                     variant="outline"
                     onClick={() => {
                       setBranding((prev: any) => ({ ...prev, lottieSplashUrl: undefined }));
                       supabase
                         .from("app_settings")
                         .upsert({
                           setting_key: "branding",
                           setting_value: { ...branding, lottieSplashUrl: undefined },
                         });
                       toast({ title: "Splash removed" });
                     }}
                   >
                     Remove
                   </Button>
                 </div>
               </div>
             </AlertDescription>
           </Alert>
           ) : !enabled && branding.lottieSplashUrl ? (
             <Alert className="border-muted bg-muted/30">
               <PowerOff className="h-4 w-4 text-muted-foreground" />
               <AlertDescription>
                 <p className="text-sm font-medium text-muted-foreground">Splash screen is disabled</p>
                 <p className="text-xs text-muted-foreground mt-1">Enable the toggle above to show splash screen to users</p>
               </AlertDescription>
             </Alert>
           ) : null}
 
           {enabled && (
             <div className="flex gap-2">
           <input
             ref={fileInputRef}
             type="file"
             accept="application/json,.json"
             className="hidden"
             onChange={(e) => {
               const file = e.target.files?.[0];
               if (!file) return;
               uploadLottieJson(file);
               e.currentTarget.value = "";
             }}
           />
           <Button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gap-2">
             <Upload className="h-4 w-4" />
             {uploading ? "Uploading…" : "Upload Lottie JSON"}
           </Button>
         </div>
           )}
       </CardContent>
     </Card>
   );
 }