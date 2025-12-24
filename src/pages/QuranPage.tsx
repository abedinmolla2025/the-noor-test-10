import { useState } from "react";
import { ArrowLeft, BookOpen, Search, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useQuranData, Surah } from "@/hooks/useQuranData";
import SurahReader from "@/components/SurahReader";

const QuranPage = () => {
  const navigate = useNavigate();
  const { surahs, loading, error } = useQuranData();
  const [selectedSurah, setSelectedSurah] = useState<Surah | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredSurahs = surahs.filter(
    (surah) =>
      surah.englishName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      surah.name.includes(searchQuery) ||
      surah.number.toString().includes(searchQuery)
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/95 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => (selectedSurah ? setSelectedSurah(null) : navigate("/"))}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <BookOpen className="w-5 h-5 text-primary" />
          <h1 className="text-lg font-bold flex-1">
            {selectedSurah ? selectedSurah.englishName : "পবিত্র কুরআন"}
          </h1>
        </div>

        {/* Search Bar - Only show in list view */}
        {!selectedSurah && (
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="সূরা খুঁজুন..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-muted border-0 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
            </div>
          </div>
        )}
      </motion.header>

      {selectedSurah ? (
        <SurahReader
          surahNumber={selectedSurah.number}
          surahName={selectedSurah.englishName}
          arabicName={selectedSurah.name}
        />
      ) : (
        <div className="px-3 py-3 space-y-2">
          {filteredSurahs.map((surah, index) => (
            <motion.button
              key={surah.number}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.015 }}
              onClick={() => setSelectedSurah(surah)}
              className="w-full text-left p-3 rounded-xl bg-card shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <span className="font-bold text-primary text-sm">{surah.number}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-foreground truncate">{surah.englishName}</p>
                    <span className="text-lg font-arabic text-primary shrink-0">{surah.name}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {surah.numberOfAyahs} আয়াত • {surah.revelationType === "Meccan" ? "মক্কী" : "মাদানী"}
                  </p>
                </div>
              </div>
            </motion.button>
          ))}

          {filteredSurahs.length === 0 && (
            <div className="text-center py-10">
              <p className="text-muted-foreground">কোন সূরা পাওয়া যায়নি</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default QuranPage;
