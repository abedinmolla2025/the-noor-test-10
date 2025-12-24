import { useState } from "react";
import { ArrowLeft, Search, BookOpen, ChevronRight, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";

type Language = "bn" | "en" | "ar";

interface Hadith {
  id: number;
  number: string;
  arabic: string;
  translations: {
    bn: string;
    en: string;
    ar: string;
  };
  narrator: {
    bn: string;
    en: string;
    ar: string;
  };
  chapter: {
    bn: string;
    en: string;
    ar: string;
  };
}

const languages = [
  { code: "bn" as Language, name: "বাংলা" },
  { code: "en" as Language, name: "English" },
  { code: "ar" as Language, name: "العربية" },
];

const chapters = [
  { id: 1, name: { bn: "ওহীর সূচনা", en: "Revelation", ar: "بدء الوحي" }, count: 7 },
  { id: 2, name: { bn: "ঈমান", en: "Belief", ar: "الإيمان" }, count: 51 },
  { id: 3, name: { bn: "ইলম (জ্ঞান)", en: "Knowledge", ar: "العلم" }, count: 76 },
  { id: 4, name: { bn: "অযু", en: "Ablution", ar: "الوضوء" }, count: 113 },
  { id: 5, name: { bn: "গোসল", en: "Bathing", ar: "الغسل" }, count: 46 },
  { id: 6, name: { bn: "হায়েয", en: "Menstrual Periods", ar: "الحيض" }, count: 32 },
  { id: 7, name: { bn: "তায়াম্মুম", en: "Tayammum", ar: "التيمم" }, count: 15 },
  { id: 8, name: { bn: "সালাত", en: "Prayer", ar: "الصلاة" }, count: 172 },
  { id: 9, name: { bn: "সালাতের সময়", en: "Prayer Times", ar: "مواقيت الصلاة" }, count: 41 },
  { id: 10, name: { bn: "আযান", en: "Call to Prayer", ar: "الأذان" }, count: 105 },
];

const hadiths: Hadith[] = [
  {
    id: 1,
    number: "1",
    arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
    translations: {
      bn: "কর্মের ফলাফল নিয়তের উপর নির্ভরশীল। প্রত্যেক ব্যক্তি তাই পাবে যা সে নিয়ত করে। যার হিজরত আল্লাহ ও তাঁর রাসূলের জন্য, তার হিজরত আল্লাহ ও তাঁর রাসূলের দিকেই। আর যার হিজরত দুনিয়া অর্জন বা কোনো নারীকে বিয়ে করার জন্য, তার হিজরত সেদিকেই যার জন্য সে হিজরত করেছে।",
      en: "Actions are judged by intentions. Everyone will get what they intended. Whoever emigrated for Allah and His Messenger, his emigration is for Allah and His Messenger. Whoever emigrated for worldly benefits or to marry a woman, his emigration is for what he emigrated for.",
      ar: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى، فَمَنْ كَانَتْ هِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ فَهِجْرَتُهُ إِلَى اللَّهِ وَرَسُولِهِ، وَمَنْ كَانَتْ هِجْرَتُهُ لِدُنْيَا يُصِيبُهَا أَوِ امْرَأَةٍ يَنْكِحُهَا فَهِجْرَتُهُ إِلَى مَا هَاجَرَ إِلَيْهِ",
    },
    narrator: {
      bn: "উমার ইবনুল খাত্তাব (রাঃ)",
      en: "Umar ibn Al-Khattab (RA)",
      ar: "عمر بن الخطاب رضي الله عنه",
    },
    chapter: {
      bn: "ওহীর সূচনা",
      en: "Revelation",
      ar: "بدء الوحي",
    },
  },
  {
    id: 2,
    number: "2",
    arabic: "بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ النَّبِيِّ صلى الله عليه وسلم إِذْ جَاءَهُ رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعَرِ",
    translations: {
      bn: "আমরা একদিন নবী (সাল্লাল্লাহু আলাইহি ওয়া সাল্লাম) এর কাছে বসে ছিলাম। এমন সময় এক ব্যক্তি আসলেন যার কাপড় ছিল অত্যন্ত সাদা এবং চুল ছিল অত্যন্ত কালো।",
      en: "While we were sitting with the Prophet (peace be upon him), a man came to him with extremely white clothes and extremely black hair.",
      ar: "بَيْنَمَا نَحْنُ جُلُوسٌ عِنْدَ النَّبِيِّ صلى الله عليه وسلم إِذْ جَاءَهُ رَجُلٌ شَدِيدُ بَيَاضِ الثِّيَابِ شَدِيدُ سَوَادِ الشَّعَرِ",
    },
    narrator: {
      bn: "উমার ইবনুল খাত্তাব (রাঃ)",
      en: "Umar ibn Al-Khattab (RA)",
      ar: "عمر بن الخطاب رضي الله عنه",
    },
    chapter: {
      bn: "ঈমান",
      en: "Belief",
      ar: "الإيمان",
    },
  },
  {
    id: 3,
    number: "6018",
    arabic: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلاَ يُؤْذِ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    translations: {
      bn: "যে ব্যক্তি আল্লাহ ও শেষ দিবসে বিশ্বাস করে, সে যেন তার প্রতিবেশীকে কষ্ট না দেয়। যে ব্যক্তি আল্লাহ ও শেষ দিবসে বিশ্বাস করে, সে যেন তার মেহমানকে সম্মান করে। যে ব্যক্তি আল্লাহ ও শেষ দিবসে বিশ্বাস করে, সে যেন ভালো কথা বলে অথবা চুপ থাকে।",
      en: "Whoever believes in Allah and the Last Day should not harm his neighbor. Whoever believes in Allah and the Last Day should honor his guest. Whoever believes in Allah and the Last Day should speak good or remain silent.",
      ar: "مَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلاَ يُؤْذِ جَارَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيُكْرِمْ ضَيْفَهُ، وَمَنْ كَانَ يُؤْمِنُ بِاللَّهِ وَالْيَوْمِ الآخِرِ فَلْيَقُلْ خَيْرًا أَوْ لِيَصْمُتْ",
    },
    narrator: {
      bn: "আবু হুরায়রা (রাঃ)",
      en: "Abu Hurairah (RA)",
      ar: "أبو هريرة رضي الله عنه",
    },
    chapter: {
      bn: "আদব",
      en: "Good Manners",
      ar: "الأدب",
    },
  },
  {
    id: 4,
    number: "3",
    arabic: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ",
    translations: {
      bn: "মুসলিম সেই ব্যক্তি যার জিহ্বা ও হাত থেকে অন্য মুসলিমরা নিরাপদ থাকে। আর মুহাজির সেই ব্যক্তি যে আল্লাহর নিষেধকৃত বিষয় ত্যাগ করে।",
      en: "A Muslim is the one from whose tongue and hands other Muslims are safe. And the Muhajir (emigrant) is the one who abandons what Allah has forbidden.",
      ar: "الْمُسْلِمُ مَنْ سَلِمَ الْمُسْلِمُونَ مِنْ لِسَانِهِ وَيَدِهِ، وَالْمُهَاجِرُ مَنْ هَجَرَ مَا نَهَى اللَّهُ عَنْهُ",
    },
    narrator: {
      bn: "আব্দুল্লাহ ইবনে আমর (রাঃ)",
      en: "Abdullah ibn Amr (RA)",
      ar: "عبد الله بن عمرو رضي الله عنه",
    },
    chapter: {
      bn: "ঈমান",
      en: "Belief",
      ar: "الإيمان",
    },
  },
  {
    id: 5,
    number: "4",
    arabic: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    translations: {
      bn: "তোমাদের মধ্যে সর্বোত্তম সেই ব্যক্তি যে কুরআন শেখে এবং অন্যদের শেখায়।",
      en: "The best of you is the one who learns the Quran and teaches it.",
      ar: "خَيْرُكُمْ مَنْ تَعَلَّمَ الْقُرْآنَ وَعَلَّمَهُ",
    },
    narrator: {
      bn: "উসমান ইবনে আফফান (রাঃ)",
      en: "Uthman ibn Affan (RA)",
      ar: "عثمان بن عفان رضي الله عنه",
    },
    chapter: {
      bn: "কুরআনের ফযীলত",
      en: "Virtues of Quran",
      ar: "فضائل القرآن",
    },
  },
  {
    id: 6,
    number: "5",
    arabic: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    translations: {
      bn: "তোমাদের কেউ ততক্ষণ পর্যন্ত প্রকৃত মুমিন হতে পারবে না, যতক্ষণ না সে তার ভাইয়ের জন্য তা-ই পছন্দ করবে যা সে নিজের জন্য পছন্দ করে।",
      en: "None of you truly believes until he loves for his brother what he loves for himself.",
      ar: "لاَ يُؤْمِنُ أَحَدُكُمْ حَتَّى يُحِبَّ لأَخِيهِ مَا يُحِبُّ لِنَفْسِهِ",
    },
    narrator: {
      bn: "আনাস ইবনে মালিক (রাঃ)",
      en: "Anas ibn Malik (RA)",
      ar: "أنس بن مالك رضي الله عنه",
    },
    chapter: {
      bn: "ঈমান",
      en: "Belief",
      ar: "الإيمان",
    },
  },
  {
    id: 7,
    number: "6",
    arabic: "الدِّينُ النَّصِيحَةُ",
    translations: {
      bn: "দ্বীন হলো নসীহত (উপদেশ)।",
      en: "Religion is sincere advice.",
      ar: "الدِّينُ النَّصِيحَةُ",
    },
    narrator: {
      bn: "তামীম আদ-দারী (রাঃ)",
      en: "Tamim ad-Dari (RA)",
      ar: "تميم الداري رضي الله عنه",
    },
    chapter: {
      bn: "ঈমান",
      en: "Belief",
      ar: "الإيمان",
    },
  },
  {
    id: 8,
    number: "7",
    arabic: "مَا مِنْ مُسْلِمٍ يَغْرِسُ غَرْسًا أَوْ يَزْرَعُ زَرْعًا فَيَأْكُلُ مِنْهُ طَيْرٌ أَوْ إِنْسَانٌ أَوْ بَهِيمَةٌ إِلاَّ كَانَ لَهُ بِهِ صَدَقَةٌ",
    translations: {
      bn: "কোনো মুসলিম যদি কোনো গাছ রোপণ করে অথবা ফসল ফলায়, তারপর তা থেকে কোনো পাখি, মানুষ বা জন্তু খায়, তবে তা তার জন্য সদকা হিসেবে গণ্য হবে।",
      en: "If a Muslim plants a tree or sows a field, and a bird, human, or animal eats from it, it is counted as charity for him.",
      ar: "مَا مِنْ مُسْلِمٍ يَغْرِسُ غَرْسًا أَوْ يَزْرَعُ زَرْعًا فَيَأْكُلُ مِنْهُ طَيْرٌ أَوْ إِنْسَانٌ أَوْ بَهِيمَةٌ إِلاَّ كَانَ لَهُ بِهِ صَدَقَةٌ",
    },
    narrator: {
      bn: "আনাস ইবনে মালিক (রাঃ)",
      en: "Anas ibn Malik (RA)",
      ar: "أنس بن مالك رضي الله عنه",
    },
    chapter: {
      bn: "কৃষি",
      en: "Agriculture",
      ar: "الحرث والمزارعة",
    },
  },
  {
    id: 9,
    number: "8",
    arabic: "الْحَيَاءُ مِنَ الإِيمَانِ",
    translations: {
      bn: "লজ্জাশীলতা ঈমানের অংশ।",
      en: "Modesty is part of faith.",
      ar: "الْحَيَاءُ مِنَ الإِيمَانِ",
    },
    narrator: {
      bn: "আবু হুরায়রা (রাঃ)",
      en: "Abu Hurairah (RA)",
      ar: "أبو هريرة رضي الله عنه",
    },
    chapter: {
      bn: "ঈমান",
      en: "Belief",
      ar: "الإيمان",
    },
  },
  {
    id: 10,
    number: "9",
    arabic: "مَنْ لاَ يَشْكُرُ النَّاسَ لاَ يَشْكُرُ اللَّهَ",
    translations: {
      bn: "যে মানুষের কৃতজ্ঞতা প্রকাশ করে না, সে আল্লাহরও কৃতজ্ঞতা প্রকাশ করে না।",
      en: "He who does not thank people does not thank Allah.",
      ar: "مَنْ لاَ يَشْكُرُ النَّاسَ لاَ يَشْكُرُ اللَّهَ",
    },
    narrator: {
      bn: "আবু হুরায়রা (রাঃ)",
      en: "Abu Hurairah (RA)",
      ar: "أبو هريرة رضي الله عنه",
    },
    chapter: {
      bn: "আদব",
      en: "Good Manners",
      ar: "الأدب",
    },
  },
];

const uiText = {
  bn: {
    title: "সহিহ বুখারী শরীফ",
    subtitle: "সর্বাধিক বিশ্বস্ত হাদিস সংকলন",
    searchPlaceholder: "হাদিস খুঁজুন...",
    chapters: "অধ্যায়সমূহ",
    allHadiths: "সকল হাদিস",
    hadithNo: "হাদিস নং",
    narrator: "বর্ণনাকারী",
    chapter: "অধ্যায়",
    hadiths: "টি হাদিস",
  },
  en: {
    title: "Sahih Al-Bukhari",
    subtitle: "The Most Authentic Hadith Collection",
    searchPlaceholder: "Search hadiths...",
    chapters: "Chapters",
    allHadiths: "All Hadiths",
    hadithNo: "Hadith No",
    narrator: "Narrator",
    chapter: "Chapter",
    hadiths: "Hadiths",
  },
  ar: {
    title: "صحيح البخاري",
    subtitle: "أصح كتب الحديث",
    searchPlaceholder: "ابحث عن الأحاديث...",
    chapters: "الأبواب",
    allHadiths: "جميع الأحاديث",
    hadithNo: "حديث رقم",
    narrator: "الراوي",
    chapter: "الباب",
    hadiths: "أحاديث",
  },
};

const BukhariPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("bn");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedHadith, setSelectedHadith] = useState<Hadith | null>(null);
  const [activeTab, setActiveTab] = useState<"chapters" | "hadiths">("hadiths");
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const t = uiText[language];
  const isRtl = language === "ar";

  const filteredHadiths = hadiths.filter((hadith) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      hadith.translations[language].toLowerCase().includes(searchLower) ||
      hadith.arabic.includes(searchQuery) ||
      hadith.number.includes(searchQuery) ||
      hadith.narrator[language].toLowerCase().includes(searchLower)
    );
  });

  return (
    <div 
      className="min-h-screen bg-gradient-to-b from-amber-900 via-amber-800 to-orange-900"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-amber-900/90 backdrop-blur-lg"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => selectedHadith ? setSelectedHadith(null) : navigate("/")}
              className="p-2 -ml-2 text-amber-100/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
            </button>
            <div>
              <h1 className="text-lg font-bold text-white">{t.title}</h1>
              <p className="text-xs text-amber-200/70">{t.subtitle}</p>
            </div>
          </div>

          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-full transition-colors text-white"
            >
              <Globe size={16} />
              <span className="text-sm">{languages.find(l => l.code === language)?.name}</span>
            </button>
            
            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 right-0 bg-amber-800 rounded-xl shadow-xl overflow-hidden min-w-[120px] z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors ${
                        language === lang.code ? "bg-white/10 text-amber-300" : "text-white"
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Search */}
        {!selectedHadith && (
          <div className="px-4 pb-4">
            <div className="relative">
              <Search 
                className="absolute top-1/2 -translate-y-1/2 w-5 h-5 text-amber-300/50" 
                style={{ left: isRtl ? "auto" : "1rem", right: isRtl ? "1rem" : "auto" }}
              />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-xl bg-white/10 border-0 text-white placeholder:text-amber-200/50"
                style={{ paddingLeft: isRtl ? "1rem" : "3rem", paddingRight: isRtl ? "3rem" : "1rem" }}
              />
            </div>
          </div>
        )}
      </motion.header>

      <AnimatePresence mode="wait">
        {selectedHadith ? (
          // Hadith Detail View
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-4 space-y-4"
          >
            {/* Hadith Number Badge */}
            <div className="flex justify-center">
              <div className="bg-gradient-to-r from-amber-400 to-yellow-500 px-6 py-2 rounded-full">
                <span className="text-amber-900 font-bold">{t.hadithNo} {selectedHadith.number}</span>
              </div>
            </div>

            {/* Arabic Text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            >
              <p className="text-2xl font-arabic text-amber-200 leading-loose text-right" dir="rtl">
                {selectedHadith.arabic}
              </p>
            </motion.div>

            {/* Translation */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white/10 backdrop-blur-sm rounded-2xl p-6"
            >
              <p className={`text-lg text-white leading-relaxed ${isRtl ? "text-right" : ""}`}>
                {selectedHadith.translations[language]}
              </p>
            </motion.div>

            {/* Narrator & Chapter Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="grid grid-cols-2 gap-3"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-amber-300/70 text-sm mb-1">{t.narrator}</p>
                <p className="text-white font-medium">{selectedHadith.narrator[language]}</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-amber-300/70 text-sm mb-1">{t.chapter}</p>
                <p className="text-white font-medium">{selectedHadith.chapter[language]}</p>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          // List View
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4"
          >
            {/* Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => setActiveTab("hadiths")}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "hadiths"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900"
                    : "bg-white/10 text-white"
                }`}
              >
                {t.allHadiths}
              </button>
              <button
                onClick={() => setActiveTab("chapters")}
                className={`flex-1 py-3 rounded-xl font-medium transition-all ${
                  activeTab === "chapters"
                    ? "bg-gradient-to-r from-amber-400 to-yellow-500 text-amber-900"
                    : "bg-white/10 text-white"
                }`}
              >
                {t.chapters}
              </button>
            </div>

            {activeTab === "hadiths" ? (
              // Hadiths List
              <div className="space-y-3">
                {filteredHadiths.map((hadith, index) => (
                  <motion.button
                    key={hadith.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => setSelectedHadith(hadith)}
                    className="w-full text-left bg-white/10 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/15 transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center flex-shrink-0">
                        <span className="text-amber-900 font-bold text-sm">{hadith.number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white/90 line-clamp-2 mb-2">
                          {hadith.translations[language]}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-amber-200/60">
                          <BookOpen size={12} />
                          <span>{hadith.narrator[language]}</span>
                        </div>
                      </div>
                      <ChevronRight className="text-amber-300/50 flex-shrink-0" size={20} />
                    </div>
                  </motion.button>
                ))}
              </div>
            ) : (
              // Chapters List
              <div className="space-y-3">
                {chapters.map((chapter, index) => (
                  <motion.div
                    key={chapter.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white/10 backdrop-blur-sm rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center">
                          <span className="text-amber-900 font-bold text-sm">{chapter.id}</span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{chapter.name[language]}</p>
                          <p className="text-amber-200/60 text-sm">{chapter.count} {t.hadiths}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-amber-300/50" size={20} />
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BukhariPage;
