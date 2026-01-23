import { useState, useEffect } from "react";
import { Search, Heart, User, ArrowLeft, Globe, ChevronDown } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
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

const translations: Record<Language, {
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
}> = {
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
    meaning: "अर्थ",
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
    searchPlaceholder: "نام یا معنی تلاش کریں...",
    all: "سب",
    boys: "لڑکے",
    girls: "لڑکیاں",
    favorites: "پسندیدہ",
    noNames: "کوئی نام نہیں ملا",
    meaning: "معنی",
    gender: "جنس",
    origin: "اصل",
    boy: "لڑکا",
    girl: "لڑکی",
    addFavorite: "پسندیدہ میں شامل کریں",
    removeFavorite: "پسندیدہ سے ہٹائیں",
    selectLanguage: "زبان منتخب کریں",
  },
};

const babyNames: BabyName[] = [
  // Boys
  { 
    id: 1, 
    name: "Muhammad", 
    arabic: "مُحَمَّد", 
    meanings: {
      bn: "প্রশংসিত, প্রশংসনীয়",
      en: "Praised, commendable",
      ar: "المحمود، الجدير بالثناء",
      hi: "प्रशंसित, सराहनीय",
      ur: "تعریف کیا گیا، قابل تعریف"
    },
    gender: "boy", 
    origin: "Arabic" 
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
      ur: "सब से زیادہ قابل تعریف"
    },
    gender: "boy", 
    origin: "Arabic",
    bnPronunciation: "আহমাদ",
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
      ur: "بلند، اعلیٰ، شریف"
    },
    gender: "boy", 
    origin: "Arabic",
    bnPronunciation: "আলী",
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
      ur: "خوشحال، طویل عمر"
    },
    gender: "boy", 
    origin: "Arabic" 
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
      ur: "اللہ بڑھاتا ہے"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
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
      ur: "قوموں کا باپ"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
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
      ur: "زمین، مٹی سے پیدا کیا گیا"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
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
      ur: "اچھا، خوبصورت"
    },
    gender: "boy", 
    origin: "Arabic" 
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
      ur: "چھوٹا خوبصورت"
    },
    gender: "boy", 
    origin: "Arabic" 
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
      ur: "ابدی، لازوال"
    },
    gender: "boy", 
    origin: "Arabic" 
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
      ur: "مضبوط، ثابت قدم"
    },
    gender: "boy", 
    origin: "Arabic" 
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
      ur: "پانی، نمی"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 13, 
    name: "Zayd", 
    arabic: "زَيْد", 
    meanings: {
      bn: "বৃদ্ধি, প্রাচুর্য",
      en: "Growth, abundance",
      ar: "النمو، الوفرة",
      hi: "विकास, प्रचुरता",
      ur: "ترقی، کثرت"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 14, 
    name: "Amir", 
    arabic: "أَمِير", 
    meanings: {
      bn: "রাজকুমার, সেনাপতি",
      en: "Prince, commander",
      ar: "الأمير، القائد",
      hi: "राजकुमार, सेनापति",
      ur: "شہزادہ، کمانڈر"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 15, 
    name: "Tariq", 
    arabic: "طَارِق", 
    meanings: {
      bn: "প্রভাতী তারা, দরজায় আঘাতকারী",
      en: "Morning star, he who knocks",
      ar: "نجم الصباح، الطارق",
      hi: "सुबह का तारा, दस्तक देने वाला",
      ur: "صبح کا ستارہ، دستک دینے والا"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 16, 
    name: "Imran", 
    arabic: "عِمْرَان", 
    meanings: {
      bn: "সমৃদ্ধি, দীর্ঘায়ু",
      en: "Prosperity, long life",
      ar: "الازدهار، طول العمر",
      hi: "समृद्धि, दीर्घायु",
      ur: "خوشحالی، لمبی عمر"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 17, 
    name: "Idris", 
    arabic: "إِدْرِيس", 
    meanings: {
      bn: "জ্ঞানী, পণ্ডিত",
      en: "Studious, learned",
      ar: "الدارس، المتعلم",
      hi: "अध्ययनशील, विद्वान",
      ur: "پڑھا لکھا، عالم"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 18, 
    name: "Rayyan", 
    arabic: "رَيَّان", 
    meanings: {
      bn: "জান্নাতের দরজা, সতেজ",
      en: "Gates of Heaven, luxuriant",
      ar: "باب الجنة، النضر",
      hi: "स्वर्ग के द्वार, हरा-भरा",
      ur: "جنت کا دروازہ، سرسبز"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 19, 
    name: "Zain", 
    arabic: "زَيْن", 
    meanings: {
      bn: "সৌন্দর্য, কমনীয়তা",
      en: "Beauty, grace",
      ar: "الجمال، الرشاقة",
      hi: "सौंदर्य, अनुग्रह",
      ur: "حسن، خوبصورتی"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 20, 
    name: "Faisal", 
    arabic: "فَيْصَل", 
    meanings: {
      bn: "নির্ণায়ক, বিচারক",
      en: "Decisive, judge",
      ar: "الفاصل، الحاكم",
      hi: "निर्णायक, न्यायाधीश",
      ur: "فیصلہ کن، جج"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  
  // Girls
  { 
    id: 21, 
    name: "Fatima", 
    arabic: "فَاطِمَة", 
    meanings: {
      bn: "যে বিরত থাকে",
      en: "One who abstains",
      ar: "التي تفطم",
      hi: "जो परहेज करती है",
      ur: "پرہیز کرنے والی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 22, 
    name: "Aisha", 
    arabic: "عَائِشَة", 
    meanings: {
      bn: "জীবন্ত, সমৃদ্ধ",
      en: "Living, prosperous, alive",
      ar: "الحية، المزدهرة",
      hi: "जीवित, समृद्ध",
      ur: "زندہ، خوشحال"
    },
    gender: "girl", 
    origin: "Arabic",
    bnPronunciation: "আয়েশা",
    reference: "নবী মুহাম্মদ ﷺ এর স্ত্রী",
  },
  { 
    id: 23, 
    name: "Khadija", 
    arabic: "خَدِيجَة", 
    meanings: {
      bn: "অকালজাত শিশু",
      en: "Early baby, premature child",
      ar: "الطفل المبكر",
      hi: "जल्दी पैदा हुआ बच्चा",
      ur: "جلدی پیدا ہونے والا بچہ"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 24, 
    name: "Maryam", 
    arabic: "مَرْيَم", 
    meanings: {
      bn: "প্রিয়, কাঙ্ক্ষিত",
      en: "Beloved, sea of sorrow",
      ar: "المحبوبة، بحر الحزن",
      hi: "प्रिय, दुख का सागर",
      ur: "پیاری، غم کا سمندر"
    },
    gender: "girl", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 25, 
    name: "Zainab", 
    arabic: "زَيْنَب", 
    meanings: {
      bn: "সুগন্ধি ফুল, পিতার সৌন্দর্য",
      en: "Fragrant flower, beauty of the father",
      ar: "زهرة عطرة، جمال الأب",
      hi: "सुगंधित फूल, पिता की सुंदरता",
      ur: "خوشبودار پھول، باپ کی خوبصورتی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 26, 
    name: "Layla", 
    arabic: "لَيْلَى", 
    meanings: {
      bn: "রাত, অন্ধকার সৌন্দর্য",
      en: "Night, dark beauty",
      ar: "الليل، الجمال الداكن",
      hi: "रात, गहरी सुंदरता",
      ur: "رات، گہری خوبصورتی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 27, 
    name: "Sara", 
    arabic: "سَارَة", 
    meanings: {
      bn: "রাজকন্যা, পবিত্র",
      en: "Princess, pure",
      ar: "الأميرة، الطاهرة",
      hi: "राजकुमारी, शुद्ध",
      ur: "شہزادی، پاک"
    },
    gender: "girl", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 28, 
    name: "Hana", 
    arabic: "هَنَا", 
    meanings: {
      bn: "সুখ, আনন্দ",
      en: "Happiness, bliss",
      ar: "السعادة، النعيم",
      hi: "खुशी, आनंद",
      ur: "خوشی، مسرت"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 29, 
    name: "Noor", 
    arabic: "نُور", 
    meanings: {
      bn: "আলো, দীপ্তি",
      en: "Light, radiance",
      ar: "النور، الإشراق",
      hi: "प्रकाश, चमक",
      ur: "روشنی، چمک"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 30, 
    name: "Amina", 
    arabic: "أَمِينَة", 
    meanings: {
      bn: "বিশ্বস্ত, বিশ্বাসযোগ্য",
      en: "Trustworthy, faithful",
      ar: "الأمينة، المخلصة",
      hi: "विश्वसनीय, वफादार",
      ur: "قابل اعتماد، وفادار"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 40, 
    name: "Yasin", 
    arabic: "يٰسۤٓۚیۡنَ", 
    meanings: {
      bn: "কুরআনের একটি সূরার নাম",
      en: "A chapter of the Qur'an (Ya-Sin)",
      ar: "اسم من أسماء سور القرآن (يس)",
      hi: "कुरआन की एक सूरह का नाम",
      ur: "قرآن की ایک سورت का نام"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 41, 
    name: "Nabil", 
    arabic: "نَبِيل", 
    meanings: {
      bn: "মর্যাদাবান, মহৎ",
      en: "Noble, distinguished",
      ar: "النبيل، المميز",
      hi: "सम्मानित, महान",
      ur: "باوقار، معزز"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 42, 
    name: "Mahira", 
    arabic: "مَاهِرَة", 
    meanings: {
      bn: "দক্ষ, পারদর্শী",
      en: "Skilled, expert",
      ar: "الماهرة، الخبيرة",
      hi: "कुशल, निपुण",
      ur: "ماہر، ماہر فن"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 31, 
    name: "Hafsa", 
    arabic: "حَفْصَة", 
    meanings: {
      bn: "তরুণী সিংহী",
      en: "Young lioness",
      ar: "اللبؤة الصغيرة",
      hi: "छोटी शेरनी",
      ur: "چھوٹی شیرنی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 32, 
    name: "Ruqayyah", 
    arabic: "رُقَيَّة", 
    meanings: {
      bn: "উত্থান, অগ্রগতি",
      en: "Ascent, progress",
      ar: "الصعود، التقدم",
      hi: "उत्थान, प्रगति",
      ur: "ترقی، پیش رفت"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 33, 
    name: "Asma", 
    arabic: "أَسْمَاء", 
    meanings: {
      bn: "উৎকৃষ্ট, উচ্চ",
      en: "Excellent, lofty",
      ar: "الممتازة، السامية",
      hi: "उत्कृष्ट, ऊंची",
      ur: "بہترین، اعلیٰ"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 34, 
    name: "Safiya", 
    arabic: "صَفِيَّة", 
    meanings: {
      bn: "পবিত্র, আন্তরিক বন্ধু",
      en: "Pure, sincere friend",
      ar: "الصافية، الصديقة المخلصة",
      hi: "शुद्ध, सच्ची दोस्त",
      ur: "پاک، سچی دوست"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 35, 
    name: "Sumayya", 
    arabic: "سُمَيَّة", 
    meanings: {
      bn: "উচ্চে স্থিত",
      en: "High above",
      ar: "العالية",
      hi: "ऊंची",
      ur: "بلند"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 36, 
    name: "Yasmin", 
    arabic: "يَاسْمِين", 
    meanings: {
      bn: "জুঁই ফুল",
      en: "Jasmine flower",
      ar: "زهرة الياسمين",
      hi: "चमेली का फूल",
      ur: "چمیلی کا پھول"
    },
    gender: "girl", 
    origin: "Persian/Arabic" 
  },
  { 
    id: 37, 
    name: "Iman", 
    arabic: "إِيمَان", 
    meanings: {
      bn: "ঈমান, বিশ্বাস",
      en: "Faith, belief",
      ar: "الإيمان، العقيدة",
      hi: "आस्था, विश्वास",
      ur: "ایمان، عقیدہ"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 38, 
    name: "Aaliyah", 
    arabic: "عَالِيَة", 
    meanings: {
      bn: "উচ্চ, মহান, উন্নত",
      en: "High, exalted, sublime",
      ar: "العالية، الرفيعة",
      hi: "ऊंची, महान, उत्कृष्ट",
      ur: "بلند، عظیم، اعلیٰ"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 39, 
    name: "Zahra", 
    arabic: "زَهْرَاء", 
    meanings: {
      bn: "উজ্জ্বল, চকচকে, ফুল",
      en: "Radiant, shining, flower",
      ar: "الزهراء، المشرقة",
      hi: "चमकदार, उज्ज्वल, फूल",
      ur: "چمکدار، روشن، پھول"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 40, 
    name: "Mariam", 
    arabic: "مَرْيَم", 
    meanings: {
      bn: "প্রিয়, কাঙ্ক্ষিত সন্তান",
      en: "Beloved, wished-for child",
      ar: "المحبوبة، الطفل المرغوب",
      hi: "प्रिय, वांछित बच्चा",
      ur: "پیاری، چاہی ہوئی بچی"
    },
    gender: "girl", 
    origin: "Hebrew/Arabic" 
  },
  // Additional Boys Names
  { 
    id: 41, 
    name: "Anas", 
    arabic: "أَنَس", 
    meanings: {
      bn: "বন্ধুত্বপূর্ণ, স্নেহময়",
      en: "Friendly, affectionate",
      ar: "الأنيس، الودود",
      hi: "मिलनसार, स्नेही",
      ur: "دوستانہ، محبت کرنے والا"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 42, 
    name: "Usman", 
    arabic: "عُثْمَان", 
    meanings: {
      bn: "শিশু সাপ, বিশ্বস্ত",
      en: "Baby snake, devoted",
      ar: "الحية الصغيرة، المخلص",
      hi: "छोटा सांप, समर्पित",
      ur: "چھوٹا سانپ، وفادار"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 43, 
    name: "Salman", 
    arabic: "سَلْمَان", 
    meanings: {
      bn: "নিরাপদ, শান্তিপূর্ণ",
      en: "Safe, peaceful",
      ar: "السالم، المسالم",
      hi: "सुरक्षित, शांतिपूर्ण",
      ur: "محفوظ، پرامن"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 44, 
    name: "Saad", 
    arabic: "سَعْد", 
    meanings: {
      bn: "সৌভাগ্য, আনন্দ",
      en: "Good fortune, happiness",
      ar: "السعد، السعادة",
      hi: "सौभाग्य, खुशी",
      ur: "خوش قسمتی، خوشی"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 45, 
    name: "Muaz", 
    arabic: "مُعَاذ", 
    meanings: {
      bn: "সুরক্ষিত, আশ্রিত",
      en: "Protected, sheltered",
      ar: "المحمي، المعاذ",
      hi: "संरक्षित, आश्रित",
      ur: "محفوظ، پناہ دیا گیا"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 46, 
    name: "Sulaiman", 
    arabic: "سُلَيْمَان", 
    meanings: {
      bn: "শান্তিপূর্ণ, নিরাপদ",
      en: "Peaceful, safe",
      ar: "السلام، الأمان",
      hi: "शांतिपूर्ण, सुरक्षित",
      ur: "پرسکون، محفوظ"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 47, 
    name: "Dawud", 
    arabic: "دَاوُود", 
    meanings: {
      bn: "প্রিয়, ভালোবাসা",
      en: "Beloved, loved one",
      ar: "المحبوب، الحبيب",
      hi: "प्रिय, प्यारा",
      ur: "محبوب، پیارا"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 48, 
    name: "Ismail", 
    arabic: "إِسْمَاعِيل", 
    meanings: {
      bn: "আল্লাহ শোনেন",
      en: "God hears",
      ar: "الله يسمع",
      hi: "भगवान सुनते हैं",
      ur: "اللہ سنتا ہے"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 49, 
    name: "Ishaq", 
    arabic: "إِسْحَاق", 
    meanings: {
      bn: "হাস্য, আনন্দ",
      en: "Laughter, joy",
      ar: "الضحك، الفرح",
      hi: "हंसी, खुशी",
      ur: "ہنسی، خوشی"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 50, 
    name: "Musa", 
    arabic: "مُوسَى", 
    meanings: {
      bn: "পানি থেকে উদ্ধার",
      en: "Saved from water",
      ar: "المنقذ من الماء",
      hi: "पानी से बचाया गया",
      ur: "پانی سے بچایا گیا"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 51, 
    name: "Isa", 
    arabic: "عِيسَى", 
    meanings: {
      bn: "ত্রাণকর্তা",
      en: "The Savior",
      ar: "المخلص",
      hi: "उद्धारकर्ता",
      ur: "نجات دہندہ"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 52, 
    name: "Nuh", 
    arabic: "نُوح", 
    meanings: {
      bn: "বিশ্রাম, শান্তি",
      en: "Rest, peace",
      ar: "الراحة، السلام",
      hi: "आराम, शांति",
      ur: "آرام، سکون"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 53, 
    name: "Yahya", 
    arabic: "يَحْيَى", 
    meanings: {
      bn: "আল্লাহ করুণাময়",
      en: "God is gracious",
      ar: "الله كريم",
      hi: "भगवान दयालु है",
      ur: "اللہ مہربان ہے"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 54, 
    name: "Zakaria", 
    arabic: "زَكَرِيَّا", 
    meanings: {
      bn: "আল্লাহ স্মরণ করেন",
      en: "God remembers",
      ar: "الله يذكر",
      hi: "भगवान याद करते हैं",
      ur: "اللہ یاد کرتا ہے"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 55, 
    name: "Haroon", 
    arabic: "هَارُون", 
    meanings: {
      bn: "উচ্চ পর্বত, আলোকিত",
      en: "High mountain, enlightened",
      ar: "الجبل العالي، المستنير",
      hi: "ऊंचा पहाड़, प्रबुद्ध",
      ur: "اونچا پہاڑ، روشن"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 56, 
    name: "Ayub", 
    arabic: "أَيُّوب", 
    meanings: {
      bn: "ধৈর্যশীল, অনুতপ্ত",
      en: "Patient, repentant",
      ar: "الصابر، التائب",
      hi: "धैर्यवान, पश्चातापी",
      ur: "صبر کرنے والا، توبہ کرنے والا"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 57, 
    name: "Yunus", 
    arabic: "يُونُس", 
    meanings: {
      bn: "কবুতর",
      en: "Dove",
      ar: "الحمامة",
      hi: "कबूतर",
      ur: "کبوتر"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 58, 
    name: "Shoaib", 
    arabic: "شُعَيْب", 
    meanings: {
      bn: "যে সঠিক পথ দেখায়",
      en: "One who shows the right path",
      ar: "من يرشد إلى الطريق الصحيح",
      hi: "जो सही रास्ता दिखाता है",
      ur: "جو صحیح راستہ دکھائے"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 59, 
    name: "Luqman", 
    arabic: "لُقْمَان", 
    meanings: {
      bn: "জ্ঞানী, বুদ্ধিমান",
      en: "Wise, intelligent",
      ar: "الحكيم، الذكي",
      hi: "बुद्धिमान, समझदार",
      ur: "عقلمند، دانا"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 60, 
    name: "Uzair", 
    arabic: "عُزَيْر", 
    meanings: {
      bn: "সাহায্যকারী, শক্তিশালী",
      en: "Helper, strong",
      ar: "المساعد، القوي",
      hi: "सहायक, मजबूत",
      ur: "مددگار، مضبوط"
    },
    gender: "boy", 
    origin: "Hebrew/Arabic" 
  },
  { 
    id: 61, 
    name: "Arham", 
    arabic: "أَرْحَم", 
    meanings: {
      bn: "সবচেয়ে দয়ালু",
      en: "Most merciful",
      ar: "الأكثر رحمة",
      hi: "सबसे दयालु",
      ur: "سب سے زیادہ رحم کرنے والا"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 62, 
    name: "Aryan", 
    arabic: "آرْيَان", 
    meanings: {
      bn: "সম্মানিত, যোদ্ধা",
      en: "Noble, warrior",
      ar: "النبيل، المحارب",
      hi: "कुलीन, योद्धा",
      ur: "نجیب، جنگجو"
    },
    gender: "boy", 
    origin: "Sanskrit/Persian" 
  },
  { 
    id: 63, 
    name: "Rehan", 
    arabic: "رَيْحَان", 
    meanings: {
      bn: "সুগন্ধি, জান্নাতের গাছ",
      en: "Sweet basil, heavenly flower",
      ar: "الريحان، زهرة الجنة",
      hi: "तुलसी, स्वर्गीय फूल",
      ur: "خوشبودار پودا، جنت کا پھول"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 64, 
    name: "Fahad", 
    arabic: "فَهَد", 
    meanings: {
      bn: "চিতা, সাহসী",
      en: "Leopard, courageous",
      ar: "الفهد، الشجاع",
      hi: "चीता, साहसी",
      ur: "چیتا، بہادر"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  { 
    id: 65, 
    name: "Nabeel", 
    arabic: "نَبِيل", 
    meanings: {
      bn: "মহান, সম্মানিত",
      en: "Noble, generous",
      ar: "النبيل، الكريم",
      hi: "महान, उदार",
      ur: "عظیم، سخی"
    },
    gender: "boy", 
    origin: "Arabic" 
  },
  // Additional Girls Names
  { 
    id: 66, 
    name: "Rabia", 
    arabic: "رَابِعَة", 
    meanings: {
      bn: "বসন্ত, চতুর্থ",
      en: "Spring, fourth",
      ar: "الربيع، الرابعة",
      hi: "वसंत, चौथी",
      ur: "بہار، چوتھی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 67, 
    name: "Lubna", 
    arabic: "لُبْنَى", 
    meanings: {
      bn: "স্টোরাক্স গাছ",
      en: "Storax tree",
      ar: "شجرة اللبان",
      hi: "स्टोरैक्स का पेड़",
      ur: "لبان کا درخت"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 68, 
    name: "Sana", 
    arabic: "سَنَا", 
    meanings: {
      bn: "উজ্জ্বলতা, দীপ্তি",
      en: "Brilliance, radiance",
      ar: "اللمعان، الإشراق",
      hi: "चमक, दीप्ति",
      ur: "چمک، روشنی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 69, 
    name: "Hiba", 
    arabic: "هِبَة", 
    meanings: {
      bn: "উপহার, দান",
      en: "Gift, blessing",
      ar: "الهبة، النعمة",
      hi: "उपहार, आशीर्वाद",
      ur: "تحفہ، نعمت"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 70, 
    name: "Rania", 
    arabic: "رَانِيَا", 
    meanings: {
      bn: "রানী, তাকানো",
      en: "Queen, gazing",
      ar: "الملكة، الناظرة",
      hi: "रानी, देखने वाली",
      ur: "ملکہ، دیکھنے والی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 71, 
    name: "Dania", 
    arabic: "دَانِيَة", 
    meanings: {
      bn: "কাছের, নিকটবর্তী",
      en: "Close, near",
      ar: "القريبة، الدانية",
      hi: "करीब, नजदीक",
      ur: "قریب، نزدیک"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 72, 
    name: "Malika", 
    arabic: "مَلِكَة", 
    meanings: {
      bn: "রানী, শাসক",
      en: "Queen, ruler",
      ar: "الملكة، الحاكمة",
      hi: "रानी, शासक",
      ur: "ملکہ، حکمران"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 73, 
    name: "Naima", 
    arabic: "نَعِيمَة", 
    meanings: {
      bn: "আরামদায়ক, সুখী",
      en: "Comfortable, blissful",
      ar: "المنعمة، السعيدة",
      hi: "आरामदायक, सुखी",
      ur: "آرام دہ، خوشحال"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 74, 
    name: "Jannah", 
    arabic: "جَنَّة", 
    meanings: {
      bn: "জান্নাত, বাগান",
      en: "Paradise, garden",
      ar: "الجنة، الحديقة",
      hi: "स्वर्ग, बगीचा",
      ur: "جنت، باغ"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 75, 
    name: "Samira", 
    arabic: "سَمِيرَة", 
    meanings: {
      bn: "রাতের সঙ্গী, গল্পকারী",
      en: "Night companion, storyteller",
      ar: "سمير الليل، الراوية",
      hi: "रात की साथी, कहानीकार",
      ur: "رات کی ساتھی، قصہ گو"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 76, 
    name: "Farah", 
    arabic: "فَرَح", 
    meanings: {
      bn: "আনন্দ, খুশি",
      en: "Joy, happiness",
      ar: "الفرح، السعادة",
      hi: "खुशी, आनंद",
      ur: "خوشی، مسرت"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 77, 
    name: "Amara", 
    arabic: "عَمَارَة", 
    meanings: {
      bn: "চিরস্থায়ী, অমর",
      en: "Eternal, everlasting",
      ar: "الأبدية، الخالدة",
      hi: "शाश्वत, अमर",
      ur: "دائمی، لازوال"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 78, 
    name: "Reem", 
    arabic: "رِيم", 
    meanings: {
      bn: "সাদা হরিণ",
      en: "White antelope",
      ar: "الظبي الأبيض",
      hi: "सफेद हिरण",
      ur: "سفید ہرن"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 79, 
    name: "Salma", 
    arabic: "سَلْمَى", 
    meanings: {
      bn: "শান্তিপূর্ণ, নিরাপদ",
      en: "Peaceful, safe",
      ar: "السالمة، الآمنة",
      hi: "शांतिपूर्ण, सुरक्षित",
      ur: "پرامن، محفوظ"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 80, 
    name: "Inaya", 
    arabic: "عِنَايَة", 
    meanings: {
      bn: "যত্ন, উদ্বেগ",
      en: "Care, concern",
      ar: "العناية، الاهتمام",
      hi: "देखभाल, चिंता",
      ur: "دیکھ بھال، خیال"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 81, 
    name: "Manal", 
    arabic: "مَنَال", 
    meanings: {
      bn: "অর্জন, সাফল্য",
      en: "Achievement, attainment",
      ar: "الإنجاز، التحقيق",
      hi: "उपलब्धि, सफलता",
      ur: "حصول، کامیابی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 82, 
    name: "Nabila", 
    arabic: "نَبِيلَة", 
    meanings: {
      bn: "মহান, সম্মানিত",
      en: "Noble, honorable",
      ar: "النبيلة، الشريفة",
      hi: "महान, सम्माननीय",
      ur: "عظیم، معزز"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 83, 
    name: "Rahma", 
    arabic: "رَحْمَة", 
    meanings: {
      bn: "দয়া, করুণা",
      en: "Mercy, compassion",
      ar: "الرحمة، الشفقة",
      hi: "दया, करुणा",
      ur: "رحم، شفقت"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 84, 
    name: "Shifa", 
    arabic: "شِفَاء", 
    meanings: {
      bn: "নিরাময়, আরোগ্য",
      en: "Healing, cure",
      ar: "الشفاء، العلاج",
      hi: "उपचार, इलाज",
      ur: "شفا، علاج"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 85, 
    name: "Tasneem", 
    arabic: "تَسْنِيم", 
    meanings: {
      bn: "জান্নাতের ঝর্ণা",
      en: "Fountain of Paradise",
      ar: "نبع في الجنة",
      hi: "स्वर्ग का झरना",
      ur: "جنت کا چشمہ"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 86, 
    name: "Warda", 
    arabic: "وَرْدَة", 
    meanings: {
      bn: "গোলাপ",
      en: "Rose",
      ar: "الوردة",
      hi: "गुलाब",
      ur: "گلاب"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 87, 
    name: "Zara", 
    arabic: "زَارَا", 
    meanings: {
      bn: "রাজকন্যা, ফুল",
      en: "Princess, flower",
      ar: "الأميرة، الزهرة",
      hi: "राजकुमारी, फूल",
      ur: "شہزادی، پھول"
    },
    gender: "girl", 
    origin: "Arabic/Hebrew" 
  },
  { 
    id: 88, 
    name: "Ayesha", 
    arabic: "عَائِشَة", 
    meanings: {
      bn: "জীবন্ত, সমৃদ্ধ",
      en: "Alive, living well",
      ar: "الحية، المعيشة الطيبة",
      hi: "जीवित, अच्छी तरह रहना",
      ur: "زندہ، اچھی زندگی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 89, 
    name: "Bushra", 
    arabic: "بُشْرَى", 
    meanings: {
      bn: "সুসংবাদ",
      en: "Good news, glad tidings",
      ar: "البشرى، الأخبار السارة",
      hi: "शुभ समाचार",
      ur: "خوشخبری"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
  { 
    id: 90, 
    name: "Duha", 
    arabic: "ضُحَى", 
    meanings: {
      bn: "সকালের আলো",
      en: "Morning light",
      ar: "ضوء الصباح",
      hi: "सुबह की रोशनी",
      ur: "صبح کی روشنی"
    },
    gender: "girl", 
    origin: "Arabic" 
  },
];

const BabyNamesPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>(() => {
    const saved = localStorage.getItem("baby_names_favorites");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedName, setSelectedName] = useState<BabyName | null>(null);
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem("baby_names_language");
    return (saved as Language) || "bn";
  });
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);

  const t = translations[language];
  const isRtl = language === "ar" || language === "ur";

  const selectedIdParam = searchParams.get("name");
  const selectedId = selectedIdParam ? Number(selectedIdParam) : null;

  useEffect(() => {
    if (!selectedId) {
      setSelectedName(null);
      return;
    }
    const found = babyNames.find((n) => n.id === selectedId) ?? null;
    setSelectedName(found);
  }, [selectedId]);

  const openName = (name: BabyName) => {
    setSearchParams({ name: String(name.id) }, { replace: false });
  };

  const goBack = () => navigate(-1);

  useEffect(() => {
    localStorage.setItem("baby_names_favorites", JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem("baby_names_language", language);
  }, [language]);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const filterNames = (names: BabyName[], gender?: "boy" | "girl") => {
    return names.filter((name) => {
      const matchesSearch =
        name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.meanings[language].toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.arabic.includes(searchQuery);
      const matchesGender = !gender || name.gender === gender;
      return matchesSearch && matchesGender;
    });
  };

  const NameCard = ({ name }: { name: BabyName }) => (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => openName(name)}
      className="w-full text-left p-4 rounded-2xl bg-white/10 backdrop-blur-sm hover:bg-white/15 transition-all active:scale-[0.98]"
      style={{ direction: isRtl ? "rtl" : "ltr" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              name.gender === "boy"
                ? "bg-blue-500/20 text-blue-300"
                : "bg-pink-500/20 text-pink-300"
            }`}
          >
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-white">
                {name.name}
                {language === "bn" && name.bnPronunciation && (
                  <span className="text-xs text-teal-200/90 ml-1">
                    ( {name.bnPronunciation} )
                  </span>
                )}
              </p>
              <span className="text-lg font-arabic text-amber-300">
                {name.arabic}
              </span>
            </div>
            <p className="text-sm text-white/60 line-clamp-1">
              {name.meanings[language]}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => toggleFavorite(name.id, e)}
          className="p-2 hover:bg-white/10 rounded-full transition-colors"
        >
          {favorites.includes(name.id) ? (
            <Heart className="w-5 h-5 text-red-400 fill-red-400" />
          ) : (
            <Heart className="w-5 h-5 text-white/50" />
          )}
        </button>
      </div>
    </motion.button>
  );

  const NamesList = ({ names }: { names: BabyName[] }) => (
    <div className="space-y-3">
      {names.length > 0 ? (
        names.map((name, index) => (
          <motion.div
            key={name.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <NameCard name={name} />
          </motion.div>
        ))
      ) : (
        <p className="text-center text-white/60 py-8">
          {t.noNames}
        </p>
      )}
    </div>
  );

  const currentLang = languages.find(l => l.code === language);

  return (
    <div className="min-h-screen bg-gradient-to-b from-teal-900 via-emerald-800 to-teal-900" style={{ direction: isRtl ? "rtl" : "ltr" }}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-teal-900/80 backdrop-blur-lg"
      >
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={goBack}
              className="p-2 -ml-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5" style={{ transform: isRtl ? "scaleX(-1)" : "none" }} />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-white">
                {selectedName ? selectedName.name : t.title}
              </h1>
              <p className="text-xs text-teal-200/70">👶 {babyNames.length} names</p>
            </div>
          </div>
          
          {/* Language Selector */}
          <div className="relative">
            <button
              onClick={() => setShowLanguageMenu(!showLanguageMenu)}
              className="flex items-center gap-2 px-3 py-2 bg-white/10 hover:bg-white/15 rounded-full transition-colors text-white"
            >
              <Globe size={16} />
              <span className="text-sm">{currentLang?.nativeName}</span>
              <ChevronDown size={14} className={`transition-transform ${showLanguageMenu ? "rotate-180" : ""}`} />
            </button>
            
            <AnimatePresence>
              {showLanguageMenu && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full mt-2 right-0 bg-teal-800 rounded-xl shadow-xl overflow-hidden min-w-[160px] z-50"
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageMenu(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-white/10 transition-colors flex items-center justify-between ${
                        language === lang.code ? "bg-white/10 text-amber-300" : "text-white"
                      }`}
                    >
                      <span>{lang.nativeName}</span>
                      <span className="text-xs text-white/50">{lang.name}</span>
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {selectedName ? (
          // Name Detail View
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-4 space-y-6"
          >
            <div className="text-center space-y-4 py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
                  selectedName.gender === "boy"
                    ? "bg-blue-500/20 text-blue-300"
                    : "bg-pink-500/20 text-pink-300"
                }`}
              >
                <User size={40} />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold text-white">{selectedName.name}</h2>
                <p className="text-4xl font-arabic text-amber-300 mt-3">
                  {selectedName.arabic}
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 space-y-3">
                <div>
                  <p className="text-sm font-medium text-white/60 mb-1">
                    {t.meaning}
                  </p>
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

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <p className="text-sm font-medium text-white/60 mb-2">
                    {t.gender}
                  </p>
                  <p className="text-lg text-white capitalize">
                    {selectedName.gender === "boy" ? t.boy : t.girl}
                  </p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5">
                  <p className="text-sm font-medium text-white/60 mb-2">
                    {t.origin}
                  </p>
                  <p className="text-lg text-white">{selectedName.origin}</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={(e) => toggleFavorite(selectedName.id, e)}
              className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                favorites.includes(selectedName.id)
                  ? "bg-red-500/20 text-red-300"
                  : "bg-amber-500 text-amber-900"
              }`}
            >
              {favorites.includes(selectedName.id) ? (
                <>
                  <Heart className="w-5 h-5 fill-current" />
                  {t.removeFavorite}
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  {t.addFavorite}
                </>
              )}
            </motion.button>
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" style={{ left: isRtl ? "auto" : "1rem", right: isRtl ? "1rem" : "auto" }} />
              <Input
                placeholder={t.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-12 rounded-2xl bg-white/10 border-0 text-white placeholder:text-white/50"
                style={{ paddingLeft: isRtl ? "1rem" : "3rem", paddingRight: isRtl ? "3rem" : "1rem" }}
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 rounded-2xl bg-white/10 p-1">
                <TabsTrigger value="all" className="rounded-xl text-white data-[state=active]:bg-amber-500 data-[state=active]:text-amber-900">{t.all}</TabsTrigger>
                <TabsTrigger value="boys" className="rounded-xl text-white data-[state=active]:bg-blue-500 data-[state=active]:text-white">{t.boys}</TabsTrigger>
                <TabsTrigger value="girls" className="rounded-xl text-white data-[state=active]:bg-pink-500 data-[state=active]:text-white">{t.girls}</TabsTrigger>
                <TabsTrigger value="favorites" className="rounded-xl text-white data-[state=active]:bg-red-500 data-[state=active]:text-white">
                  ❤️ {favorites.length}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <NamesList names={filterNames(babyNames)} />
              </TabsContent>
              <TabsContent value="boys" className="mt-4">
                <NamesList names={filterNames(babyNames, "boy")} />
              </TabsContent>
              <TabsContent value="girls" className="mt-4">
                <NamesList names={filterNames(babyNames, "girl")} />
              </TabsContent>
              <TabsContent value="favorites" className="mt-4">
                <NamesList
                  names={babyNames.filter((n) => favorites.includes(n.id))}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BabyNamesPage;
