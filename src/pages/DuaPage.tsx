import { useMemo, useState, useEffect } from "react";
import { ArrowLeft, BookOpen, ChevronRight, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";

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

  const categoryChips = useMemo(
    () =>
      [
        { key: "Morning", label: "🌅 Morning" },
        { key: "Evening", label: "🌙 Evening" },
        { key: "Salah", label: "🕌 Salah" },
        { key: "Travel", label: "✈️ Travel" },
        { key: "Forgiveness", label: "🤲 Forgiveness" },
      ] as const,
    [],
  );

  const normalize = (s: string) => s.trim().toLowerCase();

  const filteredDuas = useMemo(() => {
    const q = normalize(searchQuery);
    return duas.filter((dua) => {
      const t = dua.translations[language];
      const matchesSearch =
        !q ||
        normalize(t.title).includes(q) ||
        normalize(dua.arabic || "").includes(q);

      const matchesCategory =
        !selectedCategory || normalize(t.category) === normalize(selectedCategory);

      return matchesSearch && matchesCategory;
    });
  }, [duas, language, searchQuery, selectedCategory]);

  const availableCategories = useMemo(() => {
    const set = new Set(duas.map((d) => normalize(d.translations[language].category)));
    return set;
  }, [duas, language]);

  const handleBack = () => {
    if (selectedCategory) {
      setSelectedCategory(null);
      return;
    }
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-islamic-dark">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-islamic-dark/90 backdrop-blur border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-background/10 rounded-full transition"
            aria-label="Back"
          >
            <ArrowLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="w-10 h-8 rounded-xl bg-islamic-gold flex items-center justify-center shadow-soft">
            <BookOpen className="w-4 h-4 text-islamic-dark" />
          </div>
          <h1 className="text-xl font-bold text-foreground font-bangla">দোয়া সংগ্রহ</h1>
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
                className={
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition " +
                  (language === lang
                    ? "bg-islamic-gold text-islamic-dark shadow-soft"
                    : "bg-islamic-green/40 text-foreground/80 hover:bg-islamic-green/55")
                }
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      {loading && <div className="p-4 text-center text-muted-foreground text-sm">Loading…</div>}
      {error && <div className="p-4 text-center text-destructive text-sm">{error}</div>}

      {/* Main: discovery only */}
      <motion.main
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 space-y-4"
      >
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground/50" />
          <Input
            placeholder="দোয়া খুঁজুন (নাম বা আরবি শব্দ)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={
              "pl-12 h-12 rounded-2xl bg-islamic-green/30 border-border text-foreground " +
              "placeholder:text-foreground/50 focus-visible:ring-2 focus-visible:ring-islamic-gold/25 focus-visible:border-islamic-gold/40"
            }
          />
        </div>

        {/* Category chips (primary) */}
        <div className="flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
          {categoryChips.map((c) => {
            const active = selectedCategory === c.key;
            const hasAny = availableCategories.has(normalize(c.key));
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => setSelectedCategory((prev) => (prev === c.key ? null : c.key))}
                disabled={!hasAny && !active}
                className={
                  "px-4 py-2 rounded-full text-sm font-medium transition border " +
                  (active
                    ? "bg-islamic-gold text-islamic-dark border-islamic-gold shadow-soft"
                    : "bg-islamic-green/35 text-foreground/85 border-transparent hover:bg-islamic-green/50") +
                  (!hasAny && !active ? " opacity-50" : "")
                }
              >
                {c.label}
              </button>
            );
          })}
        </div>

        {/* Helper text */}
        <p className="text-sm text-foreground/60 font-bangla">
          📖 যে কোনো দোয়া ট্যাপ করুন সম্পূর্ণ পড়তে ও শুনতে
        </p>

        {/* List */}
        {!loading && !error && filteredDuas.length === 0 ? (
          <div className="py-10 text-center text-foreground/65 text-sm font-bangla">
            এই ক্যাটাগরিতে কোনো দোয়া পাওয়া যায়নি
          </div>
        ) : (
          <div className="space-y-3">
            {filteredDuas.map((dua, index) => (
              <motion.button
                key={dua.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.03, 0.3) }}
                onClick={() =>
                  navigate(`/dua/${dua.id}`, {
                    state: { language, dua },
                  })
                }
                className={
                  "w-full text-left rounded-2xl overflow-hidden shadow-card " +
                  "bg-gradient-to-br from-islamic-green to-islamic-dark border border-border/70 " +
                  "active:scale-[0.99] transition-transform"
                }
              >
                <div className="relative p-4">
                  <div className="absolute inset-0 noor-islamic-pattern opacity-[0.06]" />
                  <div className="relative flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-islamic-gold/20 flex items-center justify-center text-sm font-bold text-islamic-gold">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-base font-bold text-foreground font-bangla truncate">
                        {dua.translations[language].title}
                      </p>
                      <p className="mt-1 text-sm text-foreground/70 font-arabic line-clamp-1">
                        {dua.arabic}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-foreground/45" />
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </motion.main>
    </div>
  );
};

export default DuaPage;
