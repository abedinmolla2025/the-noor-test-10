import { useState, useEffect } from "react";

export interface Surah {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: string;
}

export interface Ayah {
  number: number;
  text: string;
  numberInSurah: number;
  audio?: string;
}

export interface SurahData {
  number: number;
  name: string;
  englishName: string;
  ayahs: Ayah[];
}

const EDITIONS = {
  arabic: "ar.alafasy", // Arabic with audio
  bengali: "bn.bengali",
  english: "en.sahih",
  urdu: "ur.ahmedali",
  hindi: "hi.hindi",
  indonesian: "id.indonesian",
};

export type Language = keyof typeof EDITIONS;

export const LANGUAGE_LABELS: Record<Language, string> = {
  arabic: "العربية",
  bengali: "বাংলা",
  english: "English",
  urdu: "اردو",
  hindi: "हिंदी",
  indonesian: "Bahasa",
};

export const useQuranData = () => {
  const [surahs, setSurahs] = useState<Surah[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSurahs = async () => {
      try {
        const response = await fetch("https://api.alquran.cloud/v1/surah");
        const data = await response.json();
        if (data.code === 200) {
          setSurahs(data.data);
        } else {
          setError("Failed to fetch surahs");
        }
      } catch (err) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    };

    fetchSurahs();
  }, []);

  return { surahs, loading, error };
};

export const useSurahDetail = (surahNumber: number, language: Language = "bengali") => {
  const [arabicData, setArabicData] = useState<SurahData | null>(null);
  const [translationData, setTranslationData] = useState<SurahData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!surahNumber) return;

    const fetchSurahData = async () => {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch Arabic with audio and translation in parallel
        const [arabicRes, translationRes] = await Promise.all([
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${EDITIONS.arabic}`),
          fetch(`https://api.alquran.cloud/v1/surah/${surahNumber}/${EDITIONS[language]}`),
        ]);

        const arabicJson = await arabicRes.json();
        const translationJson = await translationRes.json();

        if (arabicJson.code === 200) {
          setArabicData(arabicJson.data);
        }
        if (translationJson.code === 200) {
          setTranslationData(translationJson.data);
        }
      } catch (err) {
        setError("Failed to load surah");
      } finally {
        setLoading(false);
      }
    };

    fetchSurahData();
  }, [surahNumber, language]);

  return { arabicData, translationData, loading, error };
};
