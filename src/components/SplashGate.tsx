import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SplashScreen } from "@/components/SplashScreen";

type SplashConfig = {
  lottieUrl: string;
  duration: number;
  fadeOutDuration: number;
};

/**
 * Ensures splash overlay is visible while we fetch splash config.
 * On slower devices (native WebView), fetching can be slow enough that
 * the previous approach never rendered anything because splashConfig was null.
 */
export function SplashGate(props: { children: React.ReactNode }) {
  const { children } = props;

  const [done, setDone] = useState(false);
  const [config, setConfig] = useState<SplashConfig | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const fetchActiveSplash = async () => {
      try {
        const now = new Date().toISOString();
        const platform =
          typeof window !== "undefined" && (window as any).Capacitor
            ? "app"
            : "web";
        const platforms = platform === "web" ? ["web", "both"] : ["app", "both"];

        const { data: splashData } = await supabase
          .from("admin_splash_screens")
          .select("*")
          .eq("is_active", true)
          .lte("start_date", now)
          .gte("end_date", now)
          .in("platform", platforms)
          .order("priority", { ascending: false })
          .order("start_date", { ascending: false })
          .limit(1)
          .single();

        if (cancelled) return;

        if (splashData) {
          setConfig({
            lottieUrl: splashData.lottie_url,
            duration: splashData.duration ?? 3000,
            fadeOutDuration: splashData.fade_out_duration ?? 500,
          });
          setLoadingConfig(false);
          return;
        }

        // Fallback to branding settings
        const { data: brandingData } = await supabase
          .from("app_settings")
          .select("setting_value")
          .eq("setting_key", "branding")
          .single();

        if (cancelled) return;

        const brandingValue = brandingData?.setting_value as any;
        if (brandingValue?.lottieSplashUrl && brandingValue?.splashEnabled !== false) {
          setConfig({
            lottieUrl: brandingValue.lottieSplashUrl,
            duration: brandingValue.splashDuration || 3000,
            fadeOutDuration: brandingValue.splashFadeOutDuration || 500,
          });
          setLoadingConfig(false);
          return;
        }

        // No splash configured
        setDone(true);
      } catch {
        if (!cancelled) setDone(true);
      } finally {
        if (!cancelled) setLoadingConfig(false);
      }
    };

    fetchActiveSplash();

    return () => {
      cancelled = true;
    };
  }, []);

  if (done) return <>{children}</>;

  // While we are fetching config, still show the overlay spinner (SplashScreen fallback)
  if (loadingConfig) {
    return (
      <SplashScreen
        duration={0}
        fadeOutDuration={0}
        onComplete={() => {
          /* keep visible until config arrives */
        }}
      />
    );
  }

  if (!config) return <>{children}</>;

  return (
    <>
      <SplashScreen
        lottieUrl={config.lottieUrl}
        duration={config.duration}
        fadeOutDuration={config.fadeOutDuration}
        onComplete={() => setDone(true)}
      />
      {!done ? null : children}
    </>
  );
}
