import { createContext, useContext, useEffect, useState } from "react";

export type ThemeMode = "light" | "dark";
export type ThemeColor = "default" | "emerald" | "teal" | "amber";
export type FontSize = "sm" | "md" | "lg";
export type AppLanguage = "bn" | "en" | "ar";

interface AppSettingsContextValue {
  theme: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  language: AppLanguage;
  setLanguage: (lang: AppLanguage) => void;
  themeColor: ThemeColor;
  setThemeColor: (color: ThemeColor) => void;
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
}

const AppSettingsContext = createContext<AppSettingsContextValue | undefined>(undefined);

const THEME_KEY = "theme";
const LANG_KEY = "appLanguage";
const COLOR_KEY = "themeColor";
const FONT_KEY = "fontSize";

function applyTheme(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  if (mode === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
}

function applyThemeColor(color: ThemeColor) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-theme-color", color);
}

function applyFontSize(size: FontSize) {
  if (typeof document === "undefined") return;
  document.documentElement.setAttribute("data-font-size", size);
}

function applyLanguage(lang: AppLanguage) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = lang === "bn" ? "bn" : lang === "ar" ? "ar" : "en";
}

export const AppSettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "dark";
    const stored = localStorage.getItem(THEME_KEY) as ThemeMode | null;
    if (stored === "dark" || stored === "light") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const [language, setLanguageState] = useState<AppLanguage>(() => {
    if (typeof window === "undefined") return "bn";
    const stored = localStorage.getItem(LANG_KEY) as AppLanguage | null;
    return stored ?? "bn";
  });

  const [themeColor, setThemeColorState] = useState<ThemeColor>(() => {
    if (typeof window === "undefined") return "default";
    const stored = localStorage.getItem(COLOR_KEY) as ThemeColor | null;
    return stored ?? "default";
  });

  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    if (typeof window === "undefined") return "md";
    const stored = localStorage.getItem(FONT_KEY) as FontSize | null;
    return stored ?? "md";
  });

  // Apply initial values on mount
  useEffect(() => {
    applyTheme(theme);
    applyLanguage(language);
    applyThemeColor(themeColor);
    applyFontSize(fontSize);
  }, []);

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    if (typeof window !== "undefined") {
      localStorage.setItem(THEME_KEY, mode);
    }
    applyTheme(mode);
  };

  const setLanguage = (lang: AppLanguage) => {
    setLanguageState(lang);
    if (typeof window !== "undefined") {
      localStorage.setItem(LANG_KEY, lang);
    }
    applyLanguage(lang);
  };

  const setThemeColor = (color: ThemeColor) => {
    setThemeColorState(color);
    if (typeof window !== "undefined") {
      localStorage.setItem(COLOR_KEY, color);
    }
    applyThemeColor(color);
  };

  const setFontSize = (size: FontSize) => {
    setFontSizeState(size);
    if (typeof window !== "undefined") {
      localStorage.setItem(FONT_KEY, size);
    }
    applyFontSize(size);
  };

  return (
    <AppSettingsContext.Provider
      value={{ theme, setTheme, language, setLanguage, themeColor, setThemeColor, fontSize, setFontSize }}
    >
      {children}
    </AppSettingsContext.Provider>
  );
};

export const useAppSettings = () => {
  const ctx = useContext(AppSettingsContext);
  if (!ctx) {
    throw new Error("useAppSettings must be used within AppSettingsProvider");
  }
  return ctx;
};
