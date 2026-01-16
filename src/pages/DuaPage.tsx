import { useState, useEffect } from "react";
import { Search, BookOpen, ChevronRight, ArrowLeft, Sparkles, Heart, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import DuaAudioPlayer from "@/components/DuaAudioPlayer";
import { supabase } from "@/integrations/supabase/client";
import { AdSlot } from "@/components/ads/AdSlot";

type Language = "bengali" | "english" | "hindi" | "urdu";

const LANGUAGE_LABELS: Record<Language, string> = {
  bengali: "বাংলা",
  english: "English",
  hindi: "हिंदी",
  urdu: "اردو",
};

interface DuaTranslation {
  title: string;
  translation: string;
  category: string;
}

interface Dua {
  id: string;
  arabic: string;
  transliteration?: string;
  bengaliTransliteration?: string;
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
        transliteration: undefined,
        bengaliTransliteration: row.content_pronunciation || undefined,
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
      (dua.transliteration || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dua.bengaliTransliteration || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
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
    <div className="min-h-screen bg-[hsl(158,64%,18%)]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-gradient-to-b from-[hsl(158,55%,22%)] to-[hsl(158,55%,22%)]/95 backdrop-blur-lg border-b border-white/10"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(45,93%,58%)] to-[hsl(45,93%,48%)] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[hsl(158,64%,15%)]" />
          </div>
          <h1 className="text-xl font-bold text-white">{getTitle()}</h1>
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
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  language === lang
                    ? "bg-gradient-to-r from-[hsl(45,93%,58%)] to-[hsl(45,93%,48%)] text-[hsl(158,64%,15%)] shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
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
        <div className="p-4 text-center text-white/70 text-sm">Loading duas...</div>
      )}
      {error && (
        <div className="p-4 text-center text-red-300 text-sm">{error}</div>
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
                className="relative bg-gradient-to-br from-[hsl(158,55%,25%)] to-[hsl(158,64%,20%)] rounded-3xl p-6 border border-[hsl(45,93%,58%)]/20 shadow-lg overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(45,93%,58%)]/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[hsl(158,64%,30%)]/30 rounded-full blur-xl" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[hsl(45,93%,58%)]" />
                    <span className="text-xs font-medium text-[hsl(45,93%,58%)]">
                      {language === "bengali" ? "আরবি" : language === "hindi" ? "अरबी" : language === "urdu" ? "عربی" : "Arabic"}
                    </span>
                    <Sparkles className="w-4 h-4 text-[hsl(45,93%,58%)]" />
                  </div>
                  <p className="text-3xl md:text-4xl font-arabic leading-[2] text-white">
                    {selectedDua.arabic}
                  </p>
                </div>
              </motion.div>

              {/* Transliteration */}
              {(() => {
                const translitText = language === "bengali"
                  ? selectedDua.bengaliTransliteration
                  : selectedDua.transliteration;

                if (!translitText) return null;

                return (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white/5 rounded-2xl p-5 border border-white/10"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-4 h-4 text-[hsl(45,93%,58%)]" />
                      <p className="text-xs font-medium text-[hsl(45,93%,58%)]">
                        {language === "bengali" ? "উচ্চারণ" : language === "hindi" ? "उच्चारण" : language === "urdu" ? "تلفظ" : "Transliteration"}
                      </p>
                    </div>
                    <p className="text-white/90 text-lg md:text-xl leading-relaxed">
                      {translitText}
                    </p>
                  </motion.div>
                );
              })()}

              {/* Translation */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[hsl(45,93%,58%)]/10 to-transparent rounded-2xl p-5 border border-[hsl(45,93%,58%)]/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-[hsl(45,93%,58%)]" />
                  <p className="text-xs font-medium text-[hsl(45,93%,58%)]">
                    {language === "bengali" ? "অর্থ" : language === "hindi" ? "अनुवाद" : language === "urdu" ? "ترجمہ" : "Translation"}
                  </p>
                </div>
                <p className="text-white text-lg md:text-xl leading-relaxed">
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input
                placeholder={language === "bengali" ? "দোয়া খুঁজুন..." : language === "hindi" ? "दुआ खोजें..." : language === "urdu" ? "دعا تلاش کریں..." : "Search duas..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-[hsl(45,93%,58%)]/50"
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
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-[hsl(45,93%,58%)]/20 hover:text-[hsl(45,93%,58%)] transition-all border border-transparent hover:border-[hsl(45,93%,58%)]/30"
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Dua List */}
            {!loading && !error && filteredDuas.length === 0 ? (
              <div className="py-8 text-center text-white/70 text-sm">
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
                    className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-[hsl(158,55%,25%)] to-[hsl(158,64%,20%)] border border-white/10 hover:border-[hsl(45,93%,58%)]/30 transition-all active:scale-[0.98] group"
                  >
                    <div className="flex items-center justify-between">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-[hsl(45,93%,58%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(45,93%,58%)]">
                            {index + 1}
                          </span>
                          <p className="font-semibold text-white">{dua.translations[language].title}</p>
                        </div>
                        <p className="text-sm text-white/60 line-clamp-1 font-arabic">
                          {dua.arabic}
                        </p>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[hsl(45,93%,58%)] transition-colors" />
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
