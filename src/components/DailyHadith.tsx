import { useState, useMemo } from "react";
import { BookOpen, ChevronRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

interface HadithTranslation {
  bengali: string;
  english: string;
  arabic: string;
  urdu: string;
  turkish: string;
}

interface Hadith {
  translations: HadithTranslation;
  arabicOriginal: string;
  source: string;
  chapter: string;
}

// Collection of hadiths that will rotate daily
const hadithCollection: Hadith[] = [
  {
    translations: {
      bengali: "জ্ঞান অনুন্ধান করা প্রতিটি মুসলিমের জন্য বাধ্যতামূলক।",
      english: "Seeking knowledge is an obligation upon every Muslim.",
      arabic: "طلب العلم فريضة على كل مسلم",
      urdu: "علم حاصل کرنا ہر مسلمان پر فرض ہے۔",
      turkish: "İlim öğrenmek her Müslümana farzdır.",
    },
    arabicOriginal: "طلب العلم فريضة على كل مسلم",
    source: "Ibn Majah",
    chapter: "Knowledge",
  },
  {
    translations: {
      bengali: "কর্মের ফলাফল নিয়তের উপর নির্ভরশীল।",
      english: "Actions are judged by intentions.",
      arabic: "إنما الأعمال بالنيات",
      urdu: "اعمال کا دارومدار نیتوں پر ہے۔",
      turkish: "Ameller niyetlere göredir.",
    },
    arabicOriginal: "إنما الأعمال بالنيات",
    source: "Sahih Bukhari",
    chapter: "Revelation",
  },
  {
    translations: {
      bengali: "যে ব্যক্তি আল্লাহ ও শেষ দিবসে বিশ্বাস করে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।",
      english: "Whoever believes in Allah and the Last Day should speak good or remain silent.",
      arabic: "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت",
      urdu: "جو اللہ اور آخرت پر ایمان رکھتا ہے وہ اچھی بات کہے یا خاموش رہے۔",
      turkish: "Allah'a ve ahiret gününe iman eden ya hayır söylesin ya da sussun.",
    },
    arabicOriginal: "من كان يؤمن بالله واليوم الآخر فليقل خيراً أو ليصمت",
    source: "Sahih Bukhari",
    chapter: "Belief",
  },
  {
    translations: {
      bengali: "তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি যে কুরআন শেখে এবং অন্যদের শেখায়।",
      english: "The best of you is the one who learns the Quran and teaches it.",
      arabic: "خيركم من تعلم القرآن وعلمه",
      urdu: "تم میں سے بہترین وہ ہے جو قرآن سیکھے اور سکھائے۔",
      turkish: "En hayırlınız Kuran'ı öğrenen ve öğretendir.",
    },
    arabicOriginal: "خيركم من تعلم القرآن وعلمه",
    source: "Sahih Bukhari",
    chapter: "Knowledge",
  },
  {
    translations: {
      bengali: "মুমিনদের মধ্যে সবচেয়ে পূর্ণ ঈমানের অধিকারী সে যার চরিত্র সবচেয়ে সুন্দর।",
      english: "The most complete believer in faith is the one with the best character.",
      arabic: "أكمل المؤمنين إيماناً أحسنهم خلقاً",
      urdu: "ایمان میں سب سے کامل وہ ہے جس کا اخلاق سب سے اچھا ہو۔",
      turkish: "İmanda en olgun olan, ahlakı en güzel olandır.",
    },
    arabicOriginal: "أكمل المؤمنين إيماناً أحسنهم خلقاً",
    source: "Abu Dawud",
    chapter: "Character",
  },
  {
    translations: {
      bengali: "মুসলিম সেই ব্যক্তি যার জিহ্বা ও হাত থেকে অন্য মুসলিমরা নিরাপদ থাকে।",
      english: "A Muslim is the one from whose tongue and hands other Muslims are safe.",
      arabic: "المسلم من سلم المسلمون من لسانه ويده",
      urdu: "مسلمان وہ ہے جس کی زبان اور ہاتھ سے دوسرے مسلمان محفوظ رہیں۔",
      turkish: "Müslüman, dilinden ve elinden diğer Müslümanların selamette olduğu kimsedir.",
    },
    arabicOriginal: "المسلم من سلم المسلمون من لسانه ويده",
    source: "Sahih Bukhari",
    chapter: "Belief",
  },
  {
    translations: {
      bengali: "লজ্জাশীলতা ঈমানের অংশ।",
      english: "Modesty is part of faith.",
      arabic: "الحياء من الإيمان",
      urdu: "حیا ایمان کا حصہ ہے۔",
      turkish: "Hayâ imandan bir şubedir.",
    },
    arabicOriginal: "الحياء من الإيمان",
    source: "Sahih Bukhari",
    chapter: "Belief",
  },
];

// Function to get hadith based on current date
const getDailyHadith = (): Hadith => {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 0);
  const diff = today.getTime() - startOfYear.getTime();
  const dayOfYear = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hadithIndex = dayOfYear % hadithCollection.length;
  return hadithCollection[hadithIndex];
};

type Language = "bengali" | "english" | "arabic" | "urdu" | "turkish";

const languages: { key: Language; label: string }[] = [
  { key: "bengali", label: "বাংলা" },
  { key: "english", label: "English" },
  { key: "arabic", label: "العربية" },
  { key: "urdu", label: "اردو" },
  { key: "turkish", label: "Türkçe" },
];

const DailyHadith = () => {
  const navigate = useNavigate();
  const [selectedLang, setSelectedLang] = useState<Language>("bengali");
  
  // Get today's hadith - memoized so it doesn't change during the session
  const dailyHadith = useMemo(() => getDailyHadith(), []);

  return (
    <motion.div 
      className="bg-card rounded-2xl p-5 shadow-lg border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
          <BookOpen size={24} className="text-primary" />
        </div>
        <div>
          <h3 className="text-foreground font-bold text-xl">হাদীস টুডে</h3>
          <p className="text-muted-foreground text-sm">Hadith Today</p>
        </div>
      </div>

      {/* Content */}
      <div className="space-y-4">
        {/* Translation Text */}
        <p className={`text-lg font-medium text-foreground leading-relaxed ${
          selectedLang === "arabic" || selectedLang === "urdu" ? "text-right font-arabic" : ""
        } ${selectedLang === "bengali" ? "font-arabic" : ""}`}>
          {dailyHadith.translations[selectedLang]}
        </p>

        {/* Arabic Original - always shown */}
        {selectedLang !== "arabic" && (
          <p className="text-right text-muted-foreground font-arabic text-base leading-relaxed" dir="rtl">
            {dailyHadith.arabicOriginal}
          </p>
        )}

        {/* Language Selector Buttons */}
        <div className="flex flex-wrap gap-2">
          {languages.map((lang) => (
            <button
              key={lang.key}
              onClick={() => setSelectedLang(lang.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedLang === lang.key
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Footer with source and Read More button */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="font-semibold text-foreground">{dailyHadith.source}</p>
            <p className="text-muted-foreground text-sm">{dailyHadith.chapter}</p>
          </div>
          <button 
            onClick={() => navigate("/bukhari")}
            className="flex items-center gap-1 px-4 py-2 bg-primary/10 hover:bg-primary/20 text-primary font-medium rounded-full transition-colors duration-200"
          >
            <span>Read More</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyHadith;
