import { useState, useMemo } from "react";
import { BookOpen, ChevronRight, Sparkles } from "lucide-react";
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
      className="relative bg-gradient-to-br from-[hsl(158,64%,22%)] via-[hsl(168,55%,25%)] to-[hsl(158,50%,20%)] rounded-2xl p-5 shadow-xl overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(45,93%,58%)]/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-[hsl(158,64%,40%)]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
      
      {/* Border accent */}
      <div className="absolute inset-0 rounded-2xl border border-[hsl(45,93%,58%)]/10" />

      {/* Header */}
      <div className="relative z-10 flex items-center gap-3 mb-4">
        <motion.div 
          animate={{ 
            boxShadow: ['0 0 10px hsl(45,93%,58%,0.2)', '0 0 20px hsl(45,93%,58%,0.4)', '0 0 10px hsl(45,93%,58%,0.2)']
          }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 bg-gradient-to-br from-[hsl(45,93%,58%)]/20 to-[hsl(45,93%,58%)]/10 border border-[hsl(45,93%,58%)]/30 rounded-xl flex items-center justify-center"
        >
          <BookOpen size={24} className="text-[hsl(45,93%,58%)]" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-white">হাদীস টুডে</h3>
            <Sparkles size={14} className="text-[hsl(45,93%,58%)]" />
          </div>
          <p className="text-sm text-white/60">Daily Hadith</p>
        </div>
      </div>

      {/* Hadith Text */}
      <div className="relative z-10 bg-white/5 border border-white/10 rounded-xl p-4 mb-4 backdrop-blur-sm">
        <p className={`text-white font-medium leading-relaxed ${
          selectedLang === "arabic" || selectedLang === "urdu" ? "text-right" : ""
        }`}>
          {dailyHadith.translations[selectedLang]}
        </p>

        {/* Arabic Original */}
        {selectedLang !== "arabic" && (
          <p className="text-right text-[hsl(45,93%,58%)]/80 text-sm leading-relaxed mt-3 pt-3 border-t border-white/10" dir="rtl">
            {dailyHadith.arabicOriginal}
          </p>
        )}
      </div>

      {/* Language Selector */}
      <div className="relative z-10 flex flex-wrap gap-2 mb-4">
        {languages.map((lang) => (
          <motion.button
            key={lang.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setSelectedLang(lang.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
              selectedLang === lang.key
                ? "bg-gradient-to-r from-[hsl(45,93%,58%)] to-[hsl(45,93%,48%)] text-[hsl(158,64%,15%)] shadow-lg"
                : "bg-white/10 text-white hover:bg-white/20 border border-white/10"
            }`}
          >
            {lang.label}
          </motion.button>
        ))}
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-between pt-3 border-t border-white/10">
        <div>
          <p className="font-semibold text-[hsl(45,93%,58%)]">{dailyHadith.source}</p>
          <p className="text-white/60 text-sm">{dailyHadith.chapter}</p>
        </div>
        <motion.button 
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => navigate("/bukhari")}
          className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-[hsl(45,93%,58%)]/20 to-[hsl(45,93%,58%)]/10 border border-[hsl(45,93%,58%)]/30 hover:border-[hsl(45,93%,58%)]/50 text-white font-medium rounded-full transition-all"
        >
          <span>Read More</span>
          <ChevronRight size={16} className="text-[hsl(45,93%,58%)]" />
        </motion.button>
      </div>
    </motion.div>
  );
};

export default DailyHadith;