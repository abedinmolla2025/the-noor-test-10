import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Heart, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import DuaAudioPlayer from "@/components/DuaAudioPlayer";
import { supabase } from "@/integrations/supabase/client";

type Language = "bengali" | "english" | "hindi" | "urdu";

const LANGUAGE_LABELS: Record<Language, string> = {
  bengali: "বাংলা",
  english: "English",
  hindi: "हिंदी",
  urdu: "اردو",
};

const SECTION_LABELS = {
  arabic: {
    bengali: "আরবি",
    english: "Arabic",
    hindi: "अरबी",
    urdu: "عربی",
  },
  transliteration: {
    bengali: "বাংলা উচ্চারণ",
    english: "Transliteration",
    hindi: "उच्चारण",
    urdu: "تلفظ",
  },
  translation: {
    bengali: "অনুবাদ",
    english: "Translation",
    hindi: "अनुवाद",
    urdu: "ترجمہ",
  },
} as const;

interface DuaTranslation {
  title: string;
  translation: string;
  category: string;
}

interface Dua {
  id: string;
  arabic: string;
  bengaliTransliteration?: string;
  pronunciationEn?: string;
  pronunciationHi?: string;
  pronunciationUr?: string;
  translations: Record<Language, DuaTranslation>;
}

interface AdminContentDuaRow {
  id: string;
  title: string | null;
  title_en: string | null;
  title_hi: string | null;
  title_ur: string | null;
  content: string | null;
  content_arabic: string | null;
  content_en: string | null;
  content_hi: string | null;
  content_ur: string | null;
  content_pronunciation: string | null;
  content_pronunciation_en: string | null;
  content_pronunciation_hi: string | null;
  content_pronunciation_ur: string | null;
  category: string | null;
}

type LocationState = {
  language?: Language;
  dua?: Dua;
};

const DuaDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  const state = (location.state || {}) as LocationState;

  const [language, setLanguage] = useState<Language>(state.language ?? "bengali");
  const [dua, setDua] = useState<Dua | null>(state.dua ?? null);
  const [loading, setLoading] = useState(!state.dua);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (dua || !id) return;

    const run = async () => {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("admin_content")
        .select("*")
        .eq("id", id)
        .eq("status", "published")
        .maybeSingle();

      if (error) {
        setError("Failed to load dua.");
        setLoading(false);
        return;
      }

      const row = data as AdminContentDuaRow | null;
      if (!row) {
        setError("Dua not found.");
        setLoading(false);
        return;
      }

      const mapped: Dua = {
        id: row.id,
        arabic: row.content_arabic || "",
        bengaliTransliteration: row.content_pronunciation || undefined,
        pronunciationEn: row.content_pronunciation_en || undefined,
        pronunciationHi: row.content_pronunciation_hi || undefined,
        pronunciationUr: row.content_pronunciation_ur || undefined,
        translations: {
          bengali: {
            title: row.title || "দোয়া",
            category: row.category || "দোয়া",
            translation: row.content || "",
          },
          english: {
            title: row.title_en || row.title || "Dua",
            category: row.category || "Dua",
            translation: row.content_en || row.content || "",
          },
          hindi: {
            title: row.title_hi || row.title || "दुआ",
            category: row.category || "दुआ",
            translation: row.content_hi || row.content || "",
          },
          urdu: {
            title: row.title_ur || row.title || "دعا",
            category: row.category || "دعا",
            translation: row.content_ur || row.content || "",
          },
        },
      };

      setDua(mapped);
      setLoading(false);
    };

    run();
  }, [dua, id]);

  const title = useMemo(() => {
    if (!dua) return "দোয়া";
    return dua.translations[language]?.title ?? dua.translations.bengali.title;
  }, [dua, language]);

  const transliteration = useMemo(() => {
    if (!dua) return undefined;
    const primary =
      language === "bengali"
        ? dua.bengaliTransliteration
        : language === "english"
          ? dua.pronunciationEn
          : language === "hindi"
            ? dua.pronunciationHi
            : dua.pronunciationUr;

    return (
      primary ||
      dua.bengaliTransliteration ||
      dua.pronunciationEn ||
      dua.pronunciationHi ||
      dua.pronunciationUr
    );
  }, [dua, language]);

  return (
    <div className="min-h-screen bg-islamic-dark">
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-islamic-dark/90 backdrop-blur border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 -ml-2 rounded-full hover:bg-background/10 transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <h1 className="text-lg font-bold text-foreground font-bangla">{title}</h1>
        </div>

        {/* Optional language chips (keeps UX consistent if user wants to switch while reading) */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => {
              const active = language === lang;
              return (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={
                    "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition " +
                    (active
                      ? "bg-islamic-gold text-islamic-dark shadow-soft"
                      : "bg-islamic-green/40 text-foreground/80 hover:bg-islamic-green/55")
                  }
                >
                  {LANGUAGE_LABELS[lang]}
                </button>
              );
            })}
          </div>
        </div>
      </motion.header>

      {loading && <div className="p-4 text-center text-muted-foreground text-sm">Loading…</div>}
      {error && <div className="p-4 text-center text-destructive text-sm">{error}</div>}

      {!loading && !error && dua && (
        <div className="p-4 space-y-6">
          {/* Arabic Text Card */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-islamic-green to-islamic-dark border border-islamic-gold/20 shadow-card"
          >
            <div className="absolute inset-0 noor-islamic-pattern opacity-[0.06]" />
            <div className="relative p-6 text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Sparkles className="w-4 h-4 text-islamic-gold" />
                <span className="text-xs font-medium text-islamic-gold">{SECTION_LABELS.arabic[language]}</span>
                <Sparkles className="w-4 h-4 text-islamic-gold" />
              </div>
              <p className="font-arabic text-3xl leading-[2] text-foreground">{dua.arabic}</p>
            </div>
          </motion.div>

          {/* Transliteration */}
          {transliteration && (
            <div className="rounded-2xl border border-border bg-background/5 p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles className="w-4 h-4 text-islamic-gold" />
                <p className="text-xs font-medium text-islamic-gold">{SECTION_LABELS.transliteration[language]}</p>
              </div>
              <p className="text-foreground/90 text-lg leading-relaxed font-bangla">{transliteration}</p>
            </div>
          )}

          {/* Translation */}
          <div className="rounded-2xl border border-islamic-gold/20 bg-islamic-gold/10 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Heart className="w-4 h-4 text-islamic-gold" />
              <p className="text-xs font-medium text-islamic-gold">{SECTION_LABELS.translation[language]}</p>
            </div>
            <p className="text-foreground text-lg leading-relaxed font-bangla">
              {dua.translations[language]?.translation ?? dua.translations.bengali.translation}
            </p>
          </div>

          {/* Audio */}
          <DuaAudioPlayer arabicText={dua.arabic} duaId={dua.id} />
        </div>
      )}
    </div>
  );
};

export default DuaDetailPage;
