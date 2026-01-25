 import { useState, useRef } from "react";
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
 import { Button } from "@/components/ui/button";
 import { Alert, AlertDescription } from "@/components/ui/alert";
 import { supabase } from "@/integrations/supabase/client";
 import { useToast } from "@/hooks/use-toast";
 import { Droplets, Upload, ExternalLink, Info } from "lucide-react";
 import { useQueryClient } from "@tanstack/react-query";
 
 export function LottieSplashUploader(props: { branding: any; setBranding: (updater: any) => void }) {
   const { branding, setBranding } = props;
   const { toast } = useToast();
   const queryClient = useQueryClient();
   const fileInputRef = useRef<HTMLInputElement>(null);
   const [uploading, setUploading] = useState(false);
 
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
 
   return (
     <Card>
       <CardHeader>
         <div className="flex items-center gap-2">
           <Droplets className="h-5 w-5 text-primary" />
           <CardTitle>Lottie Animated Splash Screen</CardTitle>
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
 
         {branding.lottieSplashUrl ? (
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
         ) : null}
 
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
       </CardContent>
     </Card>
   );
 }