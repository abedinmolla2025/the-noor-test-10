import { SplashScreensManager } from "@/components/admin/SplashScreensManager";
import { LottieSplashUploader } from "@/components/admin/LottieSplashUploader";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

export default function AdminSplashScreens() {
  const { data: branding = {} } = useQuery({
    queryKey: ["app-setting", "branding"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_value")
        .eq("setting_key", "branding")
        .single();
      if (error) throw error;
      return (data?.setting_value as any) ?? {};
    },
  });

  const [brandingState, setBrandingState] = useState<any>({});

  useEffect(() => {
    setBrandingState(branding ?? {});
  }, [branding]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Splash Screens</h1>
        <p className="mt-2 text-muted-foreground">
          Manage scheduled splash animations (web/app/both) with priority and templates.
        </p>
      </div>

      <LottieSplashUploader branding={brandingState} setBranding={setBrandingState} />

      <SplashScreensManager />
    </div>
  );
}
