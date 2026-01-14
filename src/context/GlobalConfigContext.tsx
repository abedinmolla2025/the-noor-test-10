import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type AppSettingKey =
  | "branding"
  | "theme"
  | "seo"
  | "system"
  | "modules";

export interface BrandingSettings {
  appName?: string;
  tagline?: string;
  logoUrl?: string;
  iconUrl?: string;
  faviconUrl?: string;
}

export interface ThemeSettings {
  primaryColor?: string; // HSL string, e.g. "158 64% 35%"
  secondaryColor?: string;
  accentColor?: string;
  fontFamily?: string;
  borderRadius?: string;
  defaultMode?: "light" | "dark";
}

export interface SeoSettings {
  title?: string;
  description?: string;
  shareImageUrl?: string;
}

export interface SystemSettings {
  maintenanceMode?: boolean;
  showAds?: boolean;
  forceUpdate?: boolean;
}

export interface ModuleToggles {
  prayerTimes?: boolean;
  quran?: boolean;
  duas?: boolean;
  hadith?: boolean;
  calendar?: boolean;
  quiz?: boolean;
}

export interface GlobalConfigState {
  branding: BrandingSettings;
  theme: ThemeSettings;
  seo: SeoSettings;
  system: SystemSettings;
  modules: ModuleToggles;
  loading: boolean;
}

interface GlobalConfigContextValue extends GlobalConfigState {}

const GlobalConfigContext = createContext<GlobalConfigContextValue | undefined>(
  undefined,
);

function applyDocumentBranding(branding: BrandingSettings, seo: SeoSettings) {
  if (typeof document === "undefined") return;

  if (seo.title) {
    document.title = seo.title;
  } else if (branding.appName) {
    document.title = branding.appName;
  }

  const description = seo.description;
  if (description) {
    let meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (!meta) {
      meta = document.createElement("meta");
      meta.name = "description";
      document.head.appendChild(meta);
    }
    meta.content = description;
  }

  const shareImage = seo.shareImageUrl || branding.logoUrl;
  if (shareImage) {
    const og =
      document.querySelector<HTMLMetaElement>('meta[property="og:image"]') ??
      (() => {
        const m = document.createElement("meta");
        m.setAttribute("property", "og:image");
        document.head.appendChild(m);
        return m;
      })();
    og.content = shareImage;

    const tw =
      document.querySelector<HTMLMetaElement>('meta[name="twitter:image"]') ??
      (() => {
        const m = document.createElement("meta");
        m.name = "twitter:image";
        document.head.appendChild(m);
        return m;
      })();
    tw.content = shareImage;
  }

  const faviconHref = branding.faviconUrl || branding.iconUrl || branding.logoUrl;
  if (faviconHref) {
    let link = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (!link) {
      link = document.createElement("link");
      link.rel = "icon";
      document.head.appendChild(link);
    }
    if (link.href !== faviconHref) {
      link.href = faviconHref;
    }
  }
}

function applyThemeSettings(theme: ThemeSettings) {
  if (typeof document === "undefined") return;

  const root = document.documentElement;

  if (theme.defaultMode === "dark") {
    root.classList.add("dark");
  } else if (theme.defaultMode === "light") {
    root.classList.remove("dark");
  }

  if (theme.primaryColor) {
    root.style.setProperty("--primary", theme.primaryColor);
    root.style.setProperty("--ring", theme.primaryColor);
  }
  if (theme.secondaryColor) {
    root.style.setProperty("--secondary", theme.secondaryColor);
  }
  if (theme.accentColor) {
    root.style.setProperty("--accent", theme.accentColor);
  }
  if (theme.borderRadius) {
    root.style.setProperty("--radius", theme.borderRadius);
  }
  if (theme.fontFamily) {
    root.style.setProperty("--font-sans", theme.fontFamily);
  }
}

const defaultState: GlobalConfigState = {
  branding: {},
  theme: {},
  seo: {},
  system: {},
  modules: {
    prayerTimes: true,
    quran: true,
    duas: true,
    hadith: true,
    calendar: true,
    quiz: true,
  },
  loading: true,
};

export const GlobalConfigProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [state, setState] = useState<GlobalConfigState>(defaultState);

  useEffect(() => {
    let isMounted = true;

    const loadSettings = async () => {
      const { data, error } = await supabase
        .from("app_settings")
        .select("setting_key, setting_value")
        .in("setting_key", ["branding", "theme", "seo", "system", "modules"]);

      if (error) {
        console.error("Error loading app_settings", error);
        if (!isMounted) return;
        setState((prev) => ({ ...prev, loading: false }));
        return;
      }

      const nextState: GlobalConfigState = { ...defaultState, loading: false };

      for (const row of data || []) {
        const key = row.setting_key as AppSettingKey;
        const value = (row.setting_value || {}) as any;
        switch (key) {
          case "branding":
            nextState.branding = value;
            break;
          case "theme":
            nextState.theme = value;
            break;
          case "seo":
            nextState.seo = value;
            break;
          case "system":
            nextState.system = value;
            break;
          case "modules":
            nextState.modules = { ...nextState.modules, ...value };
            break;
        }
      }

      if (!isMounted) return;
      setState(nextState);
      applyDocumentBranding(nextState.branding, nextState.seo);
      applyThemeSettings(nextState.theme);
    };

    loadSettings();

    const channel = supabase
      .channel("app_settings_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "app_settings",
        },
        (payload) => {
          const key = (payload.new as any)?.setting_key as AppSettingKey | undefined;
          if (!key) return;
          const value = ((payload.new as any)?.setting_value || {}) as any;

          setState((prev) => {
            const updated: GlobalConfigState = { ...prev };
            switch (key) {
              case "branding":
                updated.branding = value;
                break;
              case "theme":
                updated.theme = value;
                break;
              case "seo":
                updated.seo = value;
                break;
              case "system":
                updated.system = value;
                break;
              case "modules":
                updated.modules = { ...prev.modules, ...value };
                break;
            }
            applyDocumentBranding(updated.branding, updated.seo);
            applyThemeSettings(updated.theme);
            return updated;
          });
        },
      )
      .subscribe();

    return () => {
      isMounted = false;
      supabase.removeChannel(channel);
    };
  }, []);

  const value = useMemo<GlobalConfigContextValue>(() => state, [state]);

  return (
    <GlobalConfigContext.Provider value={value}>
      {children}
    </GlobalConfigContext.Provider>
  );
};

export const useGlobalConfig = () => {
  const ctx = useContext(GlobalConfigContext);
  if (!ctx) throw new Error("useGlobalConfig must be used within GlobalConfigProvider");
  return ctx;
};
