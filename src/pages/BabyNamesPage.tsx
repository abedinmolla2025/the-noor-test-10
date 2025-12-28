import { useState, useEffect } from "react";
import { Search, Heart, User, ArrowLeft, Globe, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

type Language = "bn" | "en" | "ar" | "hi" | "ur";

interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

const languages: LanguageOption[] = [
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "en", name: "English", nativeName: "English" },
  { code: "ar", name: "Arabic", nativeName: "العربية" },
  { code: "hi", name: "Hindi", nativeName: "हिन्दी" },
  { code: "ur", name: "Urdu", nativeName: "اردو" },
];

interface BabyName {
  id: number;
  name: string;
  arabic: string;
  meanings: Record<Language, string>;
  gender: "boy" | "girl";
  origin: string;
  bnPronunciation?: string;
  reference?: string;
}

const translations: Record<
  Language,
  {
    title: string;
    searchPlaceholder: string;
    all: string;
    boys: string;
    girls: string;
    favorites: string;
    noNames: string;
    meaning: string;
    gender: string;
    origin: string;
    boy: string;
    girl: string;
    addFavorite: string;
    removeFavorite: string;
    selectLanguage: string;
  }
> = {
  bn: {
    title: "ইসলামিক নাম",
    searchPlaceholder: "নাম বা অর্থ খুঁজুন...",
    all: "সব",
    boys: "ছেলে",
    girls: "মেয়ে",
    favorites: "পছন্দ",
    noNames: "কোন নাম পাওয়া যায়নি",
    meaning: "অর্থ",
    gender: "লিঙ্গ",
    origin: "উৎপত্তি",
    boy: "ছেলে",
    girl: "মেয়ে",
    addFavorite: "পছন্দে যোগ করুন",
    removeFavorite: "পছন্দ থেকে সরান",
    selectLanguage: "ভাষা নির্বাচন করুন",
  },
  en: {
    title: "Islamic Names",
    searchPlaceholder: "Search names or meanings...",
    all: "All",
    boys: "Boys",
    girls: "Girls",
    favorites: "Favorites",
    noNames: "No names found",
    meaning: "Meaning",
    gender: "Gender",
    origin: "Origin",
    boy: "Boy",
    girl: "Girl",
    addFavorite: "Add to Favorites",
    removeFavorite: "Remove from Favorites",
    selectLanguage: "Select Language",
  },
  ar: {
    title: "الأسماء الإسلامية",
    searchPlaceholder: "ابحث عن الأسماء أو المعاني...",
    all: "الكل",
    boys: "أولاد",
    girls: "بنات",
    favorites: "المفضلة",
    noNames: "لم يتم العثور على أسماء",
    meaning: "المعنى",
    gender: "الجنس",
    origin: "الأصل",
    boy: "ولد",
    girl: "بنت",
    addFavorite: "أضف إلى المفضلة",
    removeFavorite: "إزالة من المفضلة",
    selectLanguage: "اختر اللغة",
  },
  hi: {
    title: "इस्लामी नाम",
    searchPlaceholder: "नाम या अर्थ खोजें...",
    all: "सभी",
    boys: "लड़के",
    girls: "लड़कियाँ",
    favorites: "पसंदीदा",
    noNames: "कोई नाम नहीं मिला",
    meaning: "अর্থ",
    gender: "लिंग",
    origin: "मूल",
    boy: "लड़का",
    girl: "लड़की",
    addFavorite: "पसंदीदा में जोड़ें",
    removeFavorite: "पसंदीदा से हटाएं",
    selectLanguage: "भाषा चुनें",
  },
  ur: {
    title: "اسلامی نام",
    searchPlaceholder: "نام या معنی تلاش کریں...",
    all: "सब",
    boys: "लड़के",
    girls: "लड़कियाँ",
    favorites: "پسندیدہ",
    noNames: "کوئی نام نہیں मिला",
    meaning: "معنی",
    gender: "جنس",
    origin: "اصل",
    boy: "लड़का",
    girl: "लड़की",
    addFavorite: "پسندیدہ میں شامل کریں",
    removeFavorite: "پسندیدہ से ہٹائیں",
    selectLanguage: "زبان منتخب کریں",
  },
};

const babyNames: BabyName[] = [
  // Boys — top Islamic names with full Bangla pronunciation & reference
  {
    id: 1,
    name: "Muhammad",
    arabic: "مُحَمَّد",
    meanings: {
      bn: "প্রশংসিত, প্রশংসনীয়",
      en: "Praised, commendable",
      ar: "المحمود، الجدير بالثناء",
      hi: "प्रशंसित, सराहनीय",
      ur: "تعریف کیا گیا، قابل تعریف",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "মুহাম্মদ",
    reference: "শেষ নবী মুহাম্মদ ﷺ এর নাম",
  },
  {
    id: 2,
    name: "Ahmad",
    arabic: "أَحْمَد",
    meanings: {
      bn: "সর্বাধিক প্রশংসনীয়",
      en: "Most commendable, most praiseworthy",
      ar: "الأكثر حمدًا وثناءً",
      hi: "सबसे प्रशंसनीय",
      ur: "سب سے زیادہ قابل تعریف",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "আহমাদ",
    reference: "কুরআনে উল্লেখিত নবী মুহাম্মদ ﷺ এর আরেকটি নাম",
  },
  {
    id: 3,
    name: "Ali",
    arabic: "عَلِي",
    meanings: {
      bn: "উচ্চ, মহান, সম্মানিত",
      en: "High, elevated, noble",
      ar: "العالي، الرفيع، النبيل",
      hi: "ऊंचा, महान, उदार",
      ur: "بلند، اعلیٰ، شریف",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "আলী",
    reference: "চতুর্থ খলিফা ও নবী মুহাম্মদ ﷺ এর চাচাতো ভাই",
  },
  {
    id: 4,
    name: "Omar",
    arabic: "عُمَر",
    meanings: {
      bn: "সমৃদ্ধ, দীর্ঘজীবী",
      en: "Flourishing, long-lived",
      ar: "المزدهر، طويل العمر",
      hi: "समृद्ध, दीर्घजीवी",
      ur: "خوشحال، طویل عمر",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "উমর / ওমর",
    reference: "দ্বিতীয় খলিফা উমর ইবনুল খত্তাব রাদিয়াল্লাহু আনহু",
  },
  {
    id: 5,
    name: "Yusuf",
    arabic: "يُوسُف",
    meanings: {
      bn: "আল্লাহ বৃদ্ধি করেন",
      en: "God increases",
      ar: "الله يزيد",
      hi: "भगवान बढ़ाते हैं",
      ur: "اللہ بڑھاتا ہے",
    },
    gender: "boy",
    origin: "Hebrew/Arabic",
    bnPronunciation: "ইউসুফ",
    reference: "নবী ইউসুফ عَلَيْهِ السَّلَام — কুরআনের সূরা ইউসুফ এর নাম",
  },
  {
    id: 6,
    name: "Ibrahim",
    arabic: "إِبْرَاهِيم",
    meanings: {
      bn: "জাতির পিতা",
      en: "Father of nations",
      ar: "أبو الأمم",
      hi: "राष्ट्रों के पिता",
      ur: "قوموں کا باپ",
    },
    gender: "boy",
    origin: "Hebrew/Arabic",
    bnPronunciation: "ইবরাহীম",
    reference: "খলিলুল্লাহ নবী ইবরাহীম عَلَيْهِ السَّلَام এর নাম",
  },
  {
    id: 7,
    name: "Adam",
    arabic: "آدَم",
    meanings: {
      bn: "মাটি থেকে সৃষ্ট",
      en: "Earth, created from earth",
      ar: "الأرض، مخلوق من التراب",
      hi: "पृथ्वी, मिट्टी से बना",
      ur: "زمین، مٹی سے پیدا کیا گیا",
    },
    gender: "boy",
    origin: "Hebrew/Arabic",
    bnPronunciation: "আদম",
    reference: "প্রথম মানব ও প্রথম রাসূল নবী আদম عَلَيْهِ السَّلَام",
  },
  {
    id: 8,
    name: "Hassan",
    arabic: "حَسَن",
    meanings: {
      bn: "সুন্দর, চমৎকার",
      en: "Good, handsome, beautiful",
      ar: "الحسن، الجميل",
      hi: "अच्छा, सुंदर",
      ur: "اچھا، خوبصورت",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "হাসান",
    reference: "রাসূলুল্লাহ ﷺ এর দৌহিত্র হাসান ইবনে আলী রাদিয়াল্লাহু আনহু",
  },
  {
    id: 9,
    name: "Hussein",
    arabic: "حُسَيْن",
    meanings: {
      bn: "ছোট সুন্দর",
      en: "Good, handsome (diminutive)",
      ar: "الحسن الصغير",
      hi: "छोटा सुंदर",
      ur: "چھوٹا خوبصورت",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "হুসাইন",
    reference: "রাসূলুল্লাহ ﷺ এর দৌহিত্র হুসাইন ইবনে আলী রাদিয়াল্লাহু আনহু",
  },
  {
    id: 10,
    name: "Khalid",
    arabic: "خَالِد",
    meanings: {
      bn: "চিরস্থায়ী, অমর",
      en: "Eternal, immortal",
      ar: "الخالد، الأبدي",
      hi: "शाश्वत, अमर",
      ur: "ابدی، لازوال",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "খালিদ",
    reference: "প্রখ্যাত সাহাবী খালিদ ইবনে ওয়ালিদ রাদিয়াল্লাহু আনহু",
  },
  {
    id: 11,
    name: "Hamza",
    arabic: "حَمْزَة",
    meanings: {
      bn: "শক্তিশালী, দৃঢ়",
      en: "Strong, steadfast",
      ar: "القوي، الثابت",
      hi: "मजबूत, स्थिर",
      ur: "مضبوط، ثابت قدم",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "হামজা",
    reference: "নবী মুহাম্মদ ﷺ এর চাচা ও সাহাবী হামজা রাদিয়াল্লাহু আনহু",
  },
  {
    id: 12,
    name: "Bilal",
    arabic: "بِلَال",
    meanings: {
      bn: "জল, আর্দ্রতা",
      en: "Water, moisture",
      ar: "الماء، الرطوبة",
      hi: "पानी, नमी",
      ur: "پانی، نمی",
    },
    gender: "boy",
    origin: "Arabic",
    bnPronunciation: "বিলাল",
    reference: "প্রথম মুয়াজ্জিন সাহাবী বিলাল ইবনে রباح রাদিয়াল্লাহু আনহু",
  },
  // Girls — top Islamic names with meaning & origin
  {
    id: 51,
    name: "Aisha",
    arabic: "عَائِشَة",
    meanings: {
      bn: "জীবন্ত, প্রাণবন্ত",
      en: "Living, alive",
      ar: "حية، تعيش",
      hi: "जीवित, जीवंत",
      ur: "زندہ، زندہ دل",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর স্ত্রী আয়েশা রাদিয়াল্লাহু আনহা",
  },
  {
    id: 52,
    name: "Fatima",
    arabic: "فَاطِمَة",
    meanings: {
      bn: "বর্জনকারিণী",
      en: "Abstaining",
      ar: "المنقطعة عن الشهوات",
      hi: "संयमी",
      ur: "پرہیزگار",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর কন্যা ফাতিমা রাদিয়াল্লাহু আনহা",
  },
  {
    id: 53,
    name: "Zainab",
    arabic: "زَيْنَب",
    meanings: {
      bn: "সৌন্দর্য, শোভা",
      en: "Beauty, adornment",
      ar: "الجمال، الزينة",
      hi: "सौंदर्य, सजावट",
      ur: "خوبصورتی، زینت",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর দৌহিত্রী ও আলী রাদিয়াল্লাহু আনহু এর কন্যা",
  },
  {
    id: 54,
    name: "Maryam",
    arabic: "مَرْيَم",
    meanings: {
      bn: "মারিয়াম",
      en: "Mary",
      ar: "مريم",
      hi: "मरियम",
      ur: "مریم",
    },
    gender: "girl",
    origin: "Hebrew",
    reference: "ঈসা (আঃ) এর মাতা মারিয়াম",
  },
  {
    id: 55,
    name: "Khadija",
    arabic: "خَدِيجَة",
    meanings: {
      bn: "অকালজাত",
      en: "Premature child",
      ar: "الطفلة المولودة قبل أوانها",
      hi: "समय से पहले जन्मी बच्ची",
      ur: "وقت سے پہلے پیدا ہونے والی بچی",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর প্রথম স্ত্রী খাদিজা রাদিয়াল্লাহু আনহা",
  },
  {
    id: 56,
    name: "Safiya",
    arabic: "صَفِيَّة",
    meanings: {
      bn: "বিশুদ্ধ, নির্বাচিত",
      en: "Pure, chosen",
      ar: "الصافية، المختارة",
      hi: "शुद्ध, चयनित",
      ur: "خالص، منتخب",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর স্ত্রী সাফিয়া রাদিয়াল্লাহু আনহা",
  },
  {
    id: 57,
    name: "Ruqayyah",
    arabic: "رُقَيَّة",
    meanings: {
      bn: "উন্নতি, আরোহণ",
      en: "Ascent, rise",
      ar: "الصعود، الارتفاع",
      hi: "ऊपर उठना, चढ़ाई",
      ur: "صعود، بلندی",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর কন্যা রুকাইয়া রাদিয়াল্লাহু আনহা",
  },
  {
    id: 58,
    name: "Sumaiya",
    arabic: "سُمَيَّة",
    meanings: {
      bn: "উচ্চ, উন্নত",
      en: "High, elevated",
      ar: "العالية، المرتفعة",
      hi: "उच्च, उन्नत",
      ur: "اعلی، بلند",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "ইসলামের প্রথম মহিলা শহীদ সুমাইয়া রাদিয়াল্লাহু আনহা",
  },
  {
    id: 59,
    name: "Asma",
    arabic: "أَسْمَاء",
    meanings: {
      bn: "নাম, খ্যাতি",
      en: "Names",
      ar: "أسماء",
      hi: "नाम",
      ur: "نام",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "বিভিন্ন বিখ্যাত মহিলার নাম",
  },
  {
    id: 60,
    name: "Juwayriya",
    arabic: "جُوَيْرِيَّة",
    meanings: {
      bn: "ছোট বালিকা",
      en: "Young girl",
      ar: "الفتاة الصغيرة",
      hi: "युवा लड़की",
      ur: "نوجوان لڑکی",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর স্ত্রী জুয়াইরিয়া রাদিয়াল্লাহু আনহা",
  },
  {
    id: 61,
    name: "Hafsa",
    arabic: "حَفْصَة",
    meanings: {
      bn: "ছোট সিংহী",
      en: "Young lioness",
      ar: "اللبؤة الصغيرة",
      hi: "युवा शेरनी",
      ur: "نوجوان شیرنی",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "নবী মুহাম্মদ ﷺ এর স্ত্রী হাফসা রাদিয়াল্লাহু আনহা",
  },
  {
    id: 62,
    name: "Aatikah",
    arabic: "عَاتِكَة",
    meanings: {
      bn: "সুন্দর, পরিষ্কার",
      en: "Beautiful, pure",
      ar: "الجميلة، النقية",
      hi: "सुंदर, शुद्ध",
      ur: "خوبصورت، خالص",
    },
    gender: "girl",
    origin: "Arabic",
    reference: "বিভিন্ন ঐতিহাসিক ব্যক্তিত্ব",
  },
];

export default function BabyNamesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [language, setLanguage] = useState<Language>("bn");
  const [selectedName, setSelectedName] = useState<BabyName | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedFavorites = localStorage.getItem("baby-name-favorites");
    const storedLanguage = localStorage.getItem("baby-name-language");
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites));
    if (storedLanguage && ["bn", "en", "ar", "hi", "ur"].includes(storedLanguage)) {
      setLanguage(storedLanguage as Language);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("baby-name-favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("baby-name-language", language);
  }, [language]);

  const t = translations[language];

  const toggleFavorite = (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((favId) => favId !== id) : [...prev, id]
    );
  };

  const filterNames = (genderFilter?: "boy" | "girl") => {
    return babyNames.filter((name) => {
      const matchesGender = genderFilter ? name.gender === genderFilter : true;
      const query = searchQuery.toLowerCase();
      const matchesQuery =
        name.name.toLowerCase().includes(query) ||
        name.meanings[language].toLowerCase().includes(query) ||
        name.meanings.bn.toLowerCase().includes(query);
      return matchesGender && (!query || matchesQuery);
    });
  };

  const NameCard = ({ name }: { name: BabyName }) => (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="w-full text-left bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3"
      onClick={() => setSelectedName(name)}
    >
      <div>
        <p className="text-sm text-white/60">{name.arabic}</p>
        <p className="text-lg font-semibold text-white">{name.name}</p>
        {name.bnPronunciation && (
          <p className="text-xs text-teal-100 mt-0.5">উচ্চারণ: {name.bnPronunciation}</p>
        )}
        <p className="text-xs text-white/50 mt-1">
          {name.gender === "boy" ? t.boy : t.girl} · {name.origin}
        </p>
      </div>
      <button
        onClick={(e) => toggleFavorite(name.id, e)}
        className={`p-2 rounded-full border transition-colors ${
          favorites.includes(name.id)
            ? "bg-teal-500/20 border-teal-400 text-teal-300"
            : "border-white/10 text-white/60 hover:border-teal-400/60 hover:text-teal-200"
        }`}
      >
        <Heart className="w-5 h-5" />
      </button>
    </motion.button>
  );

  const NamesList = ({ genderFilter }: { genderFilter?: "boy" | "girl" }) => {
    const names = filterNames(genderFilter);

    if (!names.length) {
      return <p className="text-center text-white/60 mt-6">{t.noNames}</p>;
    }

    return (
      <div className="space-y-3 mt-4">
        {names.map((name) => (
          <NameCard key={name.id} name={name} />
        ))}
      </div>
    );
  };

  const favoriteNames = babyNames.filter((name) => favorites.includes(name.id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Page header, language selector, search bar, tabs */}
      <main className="max-w-xl mx-auto px-4 pb-28 pt-4">
        {/* Back button and title */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-xl font-semibold tracking-tight flex items-center gap-2">
              <User className="w-5 h-5 text-teal-300" />
              {t.title}
            </h1>
            <p className="text-xs text-white/60 mt-0.5">
              অর্থ, উচ্চারণ ও ইসলামিক রেফারেন্সসহ সুন্দর নাম বেছে নিন।
            </p>
          </div>
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/70">
            <Globe className="w-3 h-3" />
            <select
              className="bg-transparent outline-none text-xs"
              value={language}
              onChange={(e) => setLanguage(e.target.value as Language)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code} className="text-slate-900">
                  {lang.nativeName}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3 h-3" />
          </div>
        </div>

        {/* Search bar */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="bg-white/5 border-white/10 text-sm pl-9 placeholder:text-white/40 text-white"
            />
          </div>
        </div>

        {/* Tabs and content */}
        <Tabs defaultValue="all" className="mt-2">
          <TabsList className="grid grid-cols-4 bg-white/5 border border-white/10 rounded-full p-1">
            <TabsTrigger value="all" className="text-xs">{t.all}</TabsTrigger>
            <TabsTrigger value="boys" className="text-xs">{t.boys}</TabsTrigger>
            <TabsTrigger value="girls" className="text-xs">{t.girls}</TabsTrigger>
            <TabsTrigger value="favorites" className="text-xs">{t.favorites}</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <NamesList />
          </TabsContent>
          <TabsContent value="boys">
            <NamesList genderFilter="boy" />
          </TabsContent>
          <TabsContent value="girls">
            <NamesList genderFilter="girl" />
          </TabsContent>
          <TabsContent value="favorites">
            {favoriteNames.length ? (
              <div className="space-y-3 mt-4">
                {favoriteNames.map((name) => (
                  <NameCard key={name.id} name={name} />
                ))}
              </div>
            ) : (
              <p className="text-center text-white/60 mt-6">{t.noNames}</p>
            )}
          </TabsContent>
        </Tabs>

        {/* Selected name details modal / panel */}
        <AnimatePresence>
          {selectedName && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed inset-x-0 bottom-0 max-w-xl mx-auto px-4 pb-6"
            >
              <div className="bg-slate-900/95 border border-white/15 rounded-3xl p-5 shadow-2xl">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <p className="text-sm text-white/60">{selectedName.arabic}</p>
                    <p className="text-xl font-semibold text-white">{selectedName.name}</p>
                    {selectedName.bnPronunciation && (
                      <p className="text-xs text-teal-100 mt-0.5">
                        উচ্চারণ: {selectedName.bnPronunciation}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSelectedName(null)}
                    className="text-xs text-white/60 hover:text-white"
                  >
                    Close
                  </button>
                </div>

                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-3">
                  <div>
                    <p className="text-sm font-medium text-white/60 mb-1">{t.meaning}</p>
                    <p className="text-lg text-white">
                      {selectedName.meanings[language]}
                    </p>
                  </div>

                  {selectedName.bnPronunciation && (
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1">
                        উচ্চারণ (বাংলা)
                      </p>
                      <p className="text-base text-teal-100">
                        {selectedName.bnPronunciation}
                      </p>
                    </div>
                  )}

                  {selectedName.reference && (
                    <div>
                      <p className="text-sm font-medium text-white/60 mb-1">
                        ইসলামিক রেফারেন্স
                      </p>
                      <p className="text-sm text-teal-100/90">
                        {selectedName.reference}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-white/60">
                  <span>
                    {t.gender}: {selectedName.gender === "boy" ? t.boy : t.girl}
                  </span>
                  <span>
                    {t.origin}: {selectedName.origin}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
