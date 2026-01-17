export type SectionLabelPair = {
  en: string;
  bn: string;
};

const SECTION_LABELS: Record<string, SectionLabelPair> = {
  occasions: { en: "Occasions", bn: "অকেশন" },
  prayer_hero: { en: "Prayer hero", bn: "নামাজের হিরো" },
  feature_icons: { en: "Feature icons", bn: "ফিচার আইকন" },
  ad_home_top: { en: "Home ad slot", bn: "হোম বিজ্ঞাপন" },
  focus_zone: { en: "Audio + Quiz", bn: "অডিও + কুইজ" },
  daily_hadith: { en: "Daily hadith", bn: "দৈনিক হাদিস" },
  footer: { en: "Footer", bn: "ফুটার" },
};

export function getSectionLabels(sectionKey: string): SectionLabelPair | null {
  return SECTION_LABELS[sectionKey] ?? null;
}

export function getSectionTitleBnEn(sectionKey: string, fallback?: string) {
  const pair = getSectionLabels(sectionKey);
  if (!pair) {
    return { primary: fallback ?? sectionKey, secondary: undefined as string | undefined };
  }

  return {
    primary: pair.bn,
    secondary: pair.en,
  };
}
