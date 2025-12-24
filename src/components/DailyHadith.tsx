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
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary to-accent shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-40 h-40 bg-primary-foreground/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary-foreground/15 rounded-full blur-2xl" />
      </div>

      {/* Content */}
      <div className="relative z-10 p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-5">
          <motion.div 
            className="w-14 h-14 bg-primary-foreground/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-primary-foreground/30"
            whileHover={{ scale: 1.05, rotate: 5 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <BookOpen size={26} className="text-primary-foreground" />
          </motion.div>
          <div>
            <h3 className="text-primary-foreground font-bold text-xl tracking-wide">হাদীস টুডে</h3>
            <p className="text-primary-foreground/80 text-sm">Daily Hadith</p>
          </div>
        </div>

        {/* Hadith Text */}
        <div className="bg-primary-foreground/10 backdrop-blur-sm rounded-xl p-5 mb-5 border border-primary-foreground/20">
          <p className={`text-lg text-primary-foreground leading-loose tracking-wide ${
            selectedLang === "arabic" || selectedLang === "urdu" ? "text-right" : ""
          }`}>
            {dailyHadith.translations[selectedLang]}
          </p>

          {/* Arabic Original */}
          {selectedLang !== "arabic" && (
            <p className="text-right text-primary-foreground/70 text-base leading-loose mt-4 pt-4 border-t border-primary-foreground/20" dir="rtl">
              {dailyHadith.arabicOriginal}
            </p>
          )}
        </div>

        {/* Language Selector */}
        <div className="flex flex-wrap gap-2 mb-5">
          {languages.map((lang) => (
            <motion.button
              key={lang.key}
              onClick={() => setSelectedLang(lang.key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                selectedLang === lang.key
                  ? "bg-primary-foreground text-primary shadow-md"
                  : "bg-primary-foreground/15 text-primary-foreground/90 hover:bg-primary-foreground/25 border border-primary-foreground/30"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              {lang.label}
            </motion.button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-primary-foreground/20">
          <div>
            <p className="font-bold text-primary-foreground text-lg">{dailyHadith.source}</p>
            <p className="text-primary-foreground/60 text-sm">{dailyHadith.chapter}</p>
          </div>
          <motion.button 
            onClick={() => navigate("/bukhari")}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary-foreground text-primary font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-200"
            whileHover={{ scale: 1.03, x: 3 }}
            whileTap={{ scale: 0.97 }}
          >
            <span>Read More</span>
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default DailyHadith;
