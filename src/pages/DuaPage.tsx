import { useState, useEffect } from "react";
import { Search, BookOpen, ChevronRight, ArrowLeft, Sparkles, Heart, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import DuaAudioPlayer from "@/components/DuaAudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot } from "@/components/ads/AdSlot";
import { IslamicPatternOverlay } from "@/components/IslamicPatternOverlay";

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


const DuaPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("bengali");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);
  const [duas, setDuas] = useState<Dua[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDuas = async () => {
      setLoading(true);
      setError(null);
      const { data, error } = await supabase
        .from("admin_content")
        .select("*")
        .eq("status", "published")
        .in("content_type", ["dua", "Dua"]) // Support both lowercase and capitalized types
        .order("published_at", { ascending: false });

      if (error) {
        console.error("Error loading duas", error);
        setError("Failed to load duas. Please try again.");
        setLoading(false);
        return;
      }

      const mapped: Dua[] = (data as AdminContentDuaRow[]).map((row) => ({
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
      }));

      setDuas(mapped);
      setLoading(false);
    };

    fetchDuas();
  }, []);

  const categories = [...new Set(duas.map((d) => d.translations[language].category))];

  const filteredDuas = duas.filter((dua) => {
    const translation = dua.translations[language];
    const matchesSearch =
      translation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dua.bengaliTransliteration || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dua.pronunciationEn || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dua.pronunciationHi || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dua.pronunciationUr || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      translation.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || translation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBack = () => {
    if (selectedDua) {
      setSelectedDua(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate("/");
    }
  };

  const getTitle = () => {
    if (selectedDua) return selectedDua.translations[language].title;
    if (selectedCategory) return selectedCategory;
    return language === "bengali" ? "দোয়া সংকলন" : 
           language === "hindi" ? "दुआ संग्रह" : 
           language === "urdu" ? "دعا مجموعہ" : "Dua Collection";
  };

  return (
    <div className="min-h-screen dua-page relative overflow-hidden">
      {/* Page texture (matches reference) */}
      <IslamicPatternOverlay className="pointer-events-none absolute inset-0 text-[hsl(var(--dua-fg))] opacity-[0.10]" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_10%,hsl(var(--dua-fg)/0.06),transparent_58%),radial-gradient(900px_circle_at_20%_60%,hsl(var(--dua-accent)/0.07),transparent_62%)]" />
      {/* soft vignette */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(1200px_circle_at_50%_0%,transparent_40%,hsl(var(--dua-bg))_92%)]" />

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 border-b dua-header relative overflow-hidden"
      >
        {/* Header subtle texture */}
        <IslamicPatternOverlay className="pointer-events-none absolute inset-0 text-[hsl(var(--dua-fg))] opacity-[0.08]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(700px_circle_at_20%_20%,hsl(var(--dua-accent)/0.08),transparent_62%)]" />

        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 dua-icon-btn"
          >
            <ArrowLeft className="w-5 h-5 text-[hsl(var(--dua-fg))]" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-[linear-gradient(90deg,hsl(var(--dua-accent)),hsl(var(--dua-accent-strong)))] flex items-center justify-center shadow-soft">
            <BookOpen className="w-4 h-4 text-[hsl(var(--dua-accent-fg))]" />
          </div>
          <h1 className="text-xl font-bold text-[hsl(var(--dua-fg))]">{getTitle()}</h1>
        </div>

        {/* Language Selector */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setSelectedCategory(null);
                }}
                className={language === lang ? "dua-chip dua-chip-active" : "dua-chip"}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {/* Web Ad Slot */}
      {!loading && !error && (
        <div className="px-4 pt-4">
          <AdSlot placement="web_dua_middle" />
        </div>
      )}

      {loading && (
        <div className="relative p-4 text-center text-[hsl(var(--dua-fg-muted))] text-sm">Loading duas...</div>
      )}
      {error && (
        <div className="relative p-4 text-center text-sm text-destructive">{error}</div>
      )}

      <AnimatePresence mode="wait">
        {selectedDua ? (
          // Dua Detail View
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-4 space-y-6"
          >
            <div className="text-center space-y-6 py-6">
              {/* Arabic Text Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative dua-card rounded-3xl p-6 overflow-hidden"
              >
                <IslamicPatternOverlay className="pointer-events-none absolute inset-0 text-[hsl(var(--dua-fg))] opacity-[0.07]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_22%_18%,hsl(var(--dua-accent)/0.10),transparent_58%),radial-gradient(620px_circle_at_86%_30%,hsl(var(--dua-fg)/0.05),transparent_62%)]" />
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_35%,transparent_34%,hsl(var(--dua-bg))_80%)]" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[hsl(var(--dua-accent))]" />
                    <span className="text-xs font-medium text-[hsl(var(--dua-accent))]">
                      {SECTION_LABELS.arabic[language]}
                    </span>
                    <Sparkles className="w-4 h-4 text-[hsl(var(--dua-accent))]" />
                  </div>
                  <p className="text-3xl md:text-4xl font-arabic leading-[2] text-[hsl(var(--dua-fg))]">
                    {selectedDua.arabic}
                  </p>
                </div>
              </motion.div>

              {/* Transliteration */}
              {(() => {
                const translitText =
                  language === "bengali"
                    ? selectedDua.bengaliTransliteration
                    : language === "english"
                    ? selectedDua.pronunciationEn
                    : language === "hindi"
                    ? selectedDua.pronunciationHi
                    : selectedDua.pronunciationUr;

                const fallbackText =
                  translitText ||
                  selectedDua.bengaliTransliteration ||
                  selectedDua.pronunciationEn ||
                  selectedDua.pronunciationHi ||
                  selectedDua.pronunciationUr;

                if (!fallbackText) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="dua-surface p-5"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[hsl(var(--dua-accent))]" />
                      <p className="text-xs font-medium text-[hsl(var(--dua-accent))]">
                        {SECTION_LABELS.transliteration[language]}
                      </p>
                    </div>
                    <p className="text-[hsl(var(--dua-fg))] text-lg md:text-xl leading-relaxed">
                      {fallbackText}
                    </p>
                  </motion.div>
                );
              })()}

              {/* Translation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="rounded-2xl p-5 border bg-[radial-gradient(900px_circle_at_50%_0%,hsl(var(--dua-accent)/0.10),transparent_60%)] border-[hsl(var(--dua-accent)/0.20)]"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-[hsl(var(--dua-accent))]" />
                  <p className="text-xs font-medium text-[hsl(var(--dua-accent))]">
                    {SECTION_LABELS.translation[language]}
                  </p>
                </div>
                <p className="text-[hsl(var(--dua-fg))] text-lg md:text-xl leading-relaxed">
                  {selectedDua.translations[language].translation}
                </p>
              </motion.div>

              {/* Audio Player */}
              <DuaAudioPlayer 
                arabicText={selectedDua.arabic} 
                duaId={selectedDua.id} 
              />
            </div>
          </motion.div>
        ) : (
          // List View
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[hsl(var(--dua-fg-soft))]" />
              <Input
                placeholder={language === "bengali" ? "দোয়া খুঁজুন..." : language === "hindi" ? "दुआ खोजें..." : language === "urdu" ? "دعا تلاش کریں..." : "Search duas..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl dua-surface dua-input focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:border-[hsl(var(--dua-accent)/0.35)]"
              />
            </div>

            {/* Categories */}
            {!selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 flex-wrap"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={selectedCategory === cat ? "dua-chip dua-chip-active" : "dua-chip"}
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Dua List */}
            {!loading && !error && filteredDuas.length === 0 ? (
              <div className="py-8 text-center text-[hsl(var(--dua-fg-muted))] text-sm">
                {language === "bengali"
                  ? "কোনো দোয়া পাওয়া যায়নি।"
                  : language === "hindi"
                  ? "कोई दुआ नहीं मिली।"
                  : language === "urdu"
                  ? "کوئی دعا نہیں ملی۔"
                  : "No duas found."}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredDuas.map((dua, index) => (
                  <motion.button
                    key={dua.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedDua(dua)}
                    className="w-full text-left p-4 rounded-2xl dua-card relative overflow-hidden transition-all active:scale-[0.98] group hover:border-[hsl(var(--dua-accent)/0.28)]"
                  >
                    {/* Card texture like reference */}
                    <IslamicPatternOverlay className="pointer-events-none absolute inset-0 text-[hsl(var(--dua-fg))] opacity-[0.07]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(520px_circle_at_22%_18%,hsl(var(--dua-accent)/0.06),transparent_58%),radial-gradient(620px_circle_at_86%_30%,hsl(var(--dua-fg)/0.05),transparent_62%)]" />
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_circle_at_50%_35%,transparent_34%,hsl(var(--dua-bg))_84%)]" />

                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[hsl(var(--dua-accent)/0.20)] flex items-center justify-center text-xs font-bold text-[hsl(var(--dua-accent))]">
                            {index + 1}
                          </span>
                          <p className="font-semibold text-[hsl(var(--dua-fg))]">{dua.translations[language].title}</p>
                        </div>
                        <p className="text-sm text-[hsl(var(--dua-fg-soft))] line-clamp-1 font-arabic">
                          {dua.arabic}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-[hsl(var(--dua-fg-soft))] group-hover:text-[hsl(var(--dua-accent))] transition-colors" />
                    </div>
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DuaPage;
