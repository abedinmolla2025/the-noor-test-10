import { useState } from "react";
import { motion } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { useSurahDetail, Language, LANGUAGE_LABELS } from "@/hooks/useQuranData";
import QuranAudioPlayer from "./QuranAudioPlayer";

interface SurahReaderProps {
  surahNumber: number;
  surahName: string;
  arabicName: string;
}

const SurahReader = ({ surahNumber, surahName, arabicName }: SurahReaderProps) => {
  const [language, setLanguage] = useState<Language>("bengali");
  const [currentAyah, setCurrentAyah] = useState<number | null>(null);
  const { arabicData, translationData, loading, error } = useSurahDetail(surahNumber, language);

  const handlePlayAyah = (ayahIndex: number) => {
    setCurrentAyah(ayahIndex);
  };

  const handleNextAyah = () => {
    if (arabicData && currentAyah !== null && currentAyah < arabicData.ayahs.length - 1) {
      setCurrentAyah(currentAyah + 1);
    }
  };

  const handlePreviousAyah = () => {
    if (currentAyah !== null && currentAyah > 0) {
      setCurrentAyah(currentAyah - 1);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="pb-32">
      {/* Surah Header */}
      <div className="text-center py-6 border-b border-border">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-4"
        >
          <span className="text-3xl font-arabic text-primary">{arabicName}</span>
        </motion.div>
        <h2 className="text-2xl font-bold">{surahName}</h2>
        <p className="text-muted-foreground">
          {arabicData?.ayahs.length} আয়াত
        </p>
      </div>

      {/* Language Selector */}
      <div className="sticky top-[60px] z-40 bg-background/95 backdrop-blur-lg py-3 px-4 border-b border-border">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
            <button
              key={lang}
              onClick={() => setLanguage(lang)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                language === lang
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Bismillah */}
      {surahNumber !== 1 && surahNumber !== 9 && (
        <div className="text-center py-6 border-b border-border">
          <p className="text-2xl font-arabic text-primary leading-loose">
            بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
          </p>
          {language === "bengali" && (
            <p className="text-muted-foreground mt-2">
              পরম করুণাময় অসীম দয়ালু আল্লাহর নামে
            </p>
          )}
        </div>
      )}

      {/* Ayahs */}
      <div className="divide-y divide-border">
        {arabicData?.ayahs.map((ayah, index) => (
          <motion.div
            key={ayah.number}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.02 }}
            className={`p-4 ${currentAyah === index ? "bg-primary/5" : ""}`}
          >
            {/* Ayah Number & Play Button */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-bold text-primary">
                  {ayah.numberInSurah}
                </span>
              </div>
              <button
                onClick={() => handlePlayAyah(index)}
                className={`p-2 rounded-full transition-colors ${
                  currentAyah === index
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted hover:bg-primary/20"
                }`}
              >
                <Play className="w-4 h-4" />
              </button>
            </div>

            {/* Arabic Text */}
            <p className="text-2xl font-arabic text-foreground leading-[2.5] text-right mb-4">
              {ayah.text}
            </p>

            {/* Translation */}
            {translationData?.ayahs[index] && language !== "arabic" && (
              <p className="text-muted-foreground leading-relaxed">
                {translationData.ayahs[index].text}
              </p>
            )}
          </motion.div>
        ))}
      </div>

      {/* Audio Player */}
      {currentAyah !== null && arabicData?.ayahs[currentAyah]?.audio && (
        <QuranAudioPlayer
          audioUrl={arabicData.ayahs[currentAyah].audio!}
          ayahNumber={arabicData.ayahs[currentAyah].numberInSurah}
          onNext={handleNextAyah}
          onPrevious={handlePreviousAyah}
          hasNext={currentAyah < arabicData.ayahs.length - 1}
          hasPrevious={currentAyah > 0}
        />
      )}
    </div>
  );
};

export default SurahReader;
