import { useState } from "react";
import { BookOpen, ChevronRight } from "lucide-react";

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

const dailyHadith: Hadith = {
  translations: {
    bengali: "যে ব্যক্তি আল্লাহ ও শেষ দিবসে বিশ্বাস করে, সে যেন তার প্রতিবেশীকে কষ্ট না দেয়। যে ব্যক্তি আল্লাহ ও শেষ দিবসে বিশ্বাস করে, সে যেন তার মেহমানকে সম্মান করে। যে ব্যক্তি আল্লাহ ও শেষ দিবসে বিশ্বাস করে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।",
    english: "Whoever believes in Allah and the Last Day should not harm his neighbor. Whoever believes in Allah and the Last Day should honor his guest. Whoever believes in Allah and the Last Day should speak good or remain silent.",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلاَ يُؤْذِ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    urdu: "جو شخص اللہ اور یوم آخرت پر ایمان رکھتا ہے وہ اپنے پڑوسی کو تکلیف نہ دے۔ جو شخص اللہ اور یوم آخرت پر ایمان رکھتا ہے وہ اپنے مہمان کی عزت کرے۔ جو شخص اللہ اور یوم آخرت پر ایمان رکھتا ہے وہ اچھی بات کہے یا خاموش رہے۔",
    turkish: "Allah'a ve ahiret gününe iman eden komşusuna eziyet etmesin. Allah'a ve ahiret gününe iman eden misafirine ikram etsin. Allah'a ve ahiret gününe iman eden ya hayır söylesin ya da sussun.",
  },
  arabicOriginal: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
  source: "সহি বুখারী শরীফ",
  chapter: "Hadith 6018",
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
  const [selectedLang, setSelectedLang] = useState<Language>("english");

  return (
    <div className="rounded-2xl overflow-hidden shadow-card bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 border border-amber-200/50">
      {/* Golden Header */}
      <div className="bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 p-4 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute right-0 top-0 w-32 h-32 bg-yellow-300/30 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute right-8 top-4 w-16 h-16 bg-amber-300/40 rounded-full" />
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-600 rounded-xl flex items-center justify-center shadow-lg">
            <BookOpen size={24} className="text-white" />
          </div>
          <div>
            <h3 className="text-amber-900 font-bold text-lg font-arabic">হাদীস তত্ত্ব</h3>
            <p className="text-amber-800/80 text-sm font-medium">Hadith Today</p>
          </div>
        </div>
        
        {/* Golden border decoration */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-600/20 via-yellow-500 to-amber-600/20" />
      </div>

      {/* Content */}
      <div className="p-5 space-y-4">
        {/* Translation Text */}
        <p className={`text-xl font-semibold text-amber-900 leading-relaxed ${
          selectedLang === "arabic" || selectedLang === "urdu" ? "text-right font-arabic" : ""
        } ${selectedLang === "bengali" ? "font-arabic" : ""}`}>
          {dailyHadith.translations[selectedLang]}
        </p>

        {/* Arabic Original */}
        <p className="text-right text-amber-700 font-arabic text-lg leading-relaxed" dir="rtl">
          {dailyHadith.arabicOriginal}
        </p>

        {/* Language Selector */}
        <div className="flex flex-wrap gap-2 pt-2">
          {languages.map((lang) => (
            <button
              key={lang.key}
              onClick={() => setSelectedLang(lang.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                selectedLang === lang.key
                  ? "bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-900 shadow-md"
                  : "bg-amber-100/80 text-amber-700 hover:bg-amber-200/80"
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-amber-200/50">
          <div>
            <p className="font-bold text-amber-900">{dailyHadith.source}</p>
            <p className="text-sm text-amber-600">{dailyHadith.chapter}</p>
          </div>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-amber-100 to-yellow-100 hover:from-amber-200 hover:to-yellow-200 text-amber-800 font-semibold rounded-full shadow-sm transition-all duration-200 hover:shadow-md">
            Read More
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default DailyHadith;
