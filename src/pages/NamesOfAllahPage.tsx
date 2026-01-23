import { useEffect, useState, useCallback } from "react";
import { ArrowLeft, Search, Sparkles, Crown, Volume2 } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface NameOfAllah {
  id: number;
  arabic: string;
  transliteration: string;
  meaning: string;
  bengaliMeaning?: string;
}

const namesOfAllah: NameOfAllah[] = [
  { id: 1, arabic: "الرَّحْمَنُ", transliteration: "Ar-Rahman", meaning: "The Most Gracious", bengaliMeaning: "পরম করুণাময়" },
  { id: 2, arabic: "الرَّحِيمُ", transliteration: "Ar-Raheem", meaning: "The Most Merciful", bengaliMeaning: "পরম দয়ালু" },
  { id: 3, arabic: "الْمَلِكُ", transliteration: "Al-Malik", meaning: "The King", bengaliMeaning: "রাজাধিরাজ" },
  { id: 4, arabic: "الْقُدُّوسُ", transliteration: "Al-Quddus", meaning: "The Most Holy", bengaliMeaning: "পবিত্রতম" },
  { id: 5, arabic: "السَّلَامُ", transliteration: "As-Salam", meaning: "The Source of Peace", bengaliMeaning: "শান্তিদাতা" },
  { id: 6, arabic: "الْمُؤْمِنُ", transliteration: "Al-Mu'min", meaning: "The Guardian of Faith", bengaliMeaning: "বিশ্বাসের রক্ষক" },
  { id: 7, arabic: "الْمُهَيْمِنُ", transliteration: "Al-Muhaymin", meaning: "The Protector", bengaliMeaning: "রক্ষাকর্তা" },
  { id: 8, arabic: "الْعَزِيزُ", transliteration: "Al-Aziz", meaning: "The Almighty", bengaliMeaning: "পরাক্রমশালী" },
  { id: 9, arabic: "الْجَبَّارُ", transliteration: "Al-Jabbar", meaning: "The Compeller", bengaliMeaning: "মহাপ্রতাপশালী" },
  { id: 10, arabic: "الْمُتَكَبِّرُ", transliteration: "Al-Mutakabbir", meaning: "The Supreme", bengaliMeaning: "শ্রেষ্ঠতম" },
  { id: 11, arabic: "الْخَالِقُ", transliteration: "Al-Khaliq", meaning: "The Creator", bengaliMeaning: "সৃষ্টিকর্তা" },
  { id: 12, arabic: "الْبَارِئُ", transliteration: "Al-Bari", meaning: "The Evolver", bengaliMeaning: "উদ্ভাবক" },
  { id: 13, arabic: "الْمُصَوِّرُ", transliteration: "Al-Musawwir", meaning: "The Fashioner", bengaliMeaning: "আকৃতিদাতা" },
  { id: 14, arabic: "الْغَفَّارُ", transliteration: "Al-Ghaffar", meaning: "The Forgiver", bengaliMeaning: "ক্ষমাশীল" },
  { id: 15, arabic: "الْقَهَّارُ", transliteration: "Al-Qahhar", meaning: "The Subduer", bengaliMeaning: "পরাভূতকারী" },
  { id: 16, arabic: "الْوَهَّابُ", transliteration: "Al-Wahhab", meaning: "The Bestower", bengaliMeaning: "দানকারী" },
  { id: 17, arabic: "الرَّزَّاقُ", transliteration: "Ar-Razzaq", meaning: "The Provider", bengaliMeaning: "রিজিকদাতা" },
  { id: 18, arabic: "الْفَتَّاحُ", transliteration: "Al-Fattah", meaning: "The Opener", bengaliMeaning: "উদ্ঘাটক" },
  { id: 19, arabic: "اَلْعَلِيْمُ", transliteration: "Al-Alim", meaning: "The All-Knowing", bengaliMeaning: "সর্বজ্ঞ" },
  { id: 20, arabic: "الْقَابِضُ", transliteration: "Al-Qabid", meaning: "The Constrictor", bengaliMeaning: "সংকোচক" },
  { id: 21, arabic: "الْبَاسِطُ", transliteration: "Al-Basit", meaning: "The Expander", bengaliMeaning: "প্রসারক" },
  { id: 22, arabic: "الْخَافِضُ", transliteration: "Al-Khafid", meaning: "The Abaser", bengaliMeaning: "অবনমনকারী" },
  { id: 23, arabic: "الرَّافِعُ", transliteration: "Ar-Rafi", meaning: "The Exalter", bengaliMeaning: "উন্নীতকারী" },
  { id: 24, arabic: "الْمُعِزُّ", transliteration: "Al-Mu'izz", meaning: "The Bestower of Honor", bengaliMeaning: "সম্মানদাতা" },
  { id: 25, arabic: "المُذِلُّ", transliteration: "Al-Muzil", meaning: "The Humiliator", bengaliMeaning: "অপমানকারী" },
  { id: 26, arabic: "السَّمِيعُ", transliteration: "As-Sami", meaning: "The All-Hearing", bengaliMeaning: "সর্বশ্রোতা" },
  { id: 27, arabic: "الْبَصِيرُ", transliteration: "Al-Basir", meaning: "The All-Seeing", bengaliMeaning: "সর্বদ্রষ্টা" },
  { id: 28, arabic: "الْحَكَمُ", transliteration: "Al-Hakam", meaning: "The Judge", bengaliMeaning: "বিচারক" },
  { id: 29, arabic: "الْعَدْلُ", transliteration: "Al-Adl", meaning: "The Just", bengaliMeaning: "ন্যায়বিচারক" },
  { id: 30, arabic: "اللَّطِيفُ", transliteration: "Al-Latif", meaning: "The Subtle One", bengaliMeaning: "সূক্ষ্মদর্শী" },
  { id: 31, arabic: "الْخَبِيرُ", transliteration: "Al-Khabir", meaning: "The All-Aware", bengaliMeaning: "সর্বজ্ঞাত" },
  { id: 32, arabic: "الْحَلِيمُ", transliteration: "Al-Halim", meaning: "The Forbearing", bengaliMeaning: "ধৈর্যশীল" },
  { id: 33, arabic: "الْعَظِيمُ", transliteration: "Al-Azim", meaning: "The Magnificent", bengaliMeaning: "মহান" },
  { id: 34, arabic: "الْغَفُورُ", transliteration: "Al-Ghafur", meaning: "The All-Forgiving", bengaliMeaning: "মহাক্ষমাশীল" },
  { id: 35, arabic: "الشَّكُورُ", transliteration: "Ash-Shakur", meaning: "The Appreciative", bengaliMeaning: "কৃতজ্ঞতাপূর্ণ" },
  { id: 36, arabic: "الْعَلِيُّ", transliteration: "Al-Ali", meaning: "The Highest", bengaliMeaning: "সর্বোচ্চ" },
  { id: 37, arabic: "الْكَبِيرُ", transliteration: "Al-Kabir", meaning: "The Greatest", bengaliMeaning: "মহীয়ান" },
  { id: 38, arabic: "الْحَفِيظُ", transliteration: "Al-Hafiz", meaning: "The Preserver", bengaliMeaning: "সংরক্ষক" },
  { id: 39, arabic: "المُقِيتُ", transliteration: "Al-Muqit", meaning: "The Sustainer", bengaliMeaning: "পালনকর্তা" },
  { id: 40, arabic: "الْحَسِيبُ", transliteration: "Al-Hasib", meaning: "The Reckoner", bengaliMeaning: "হিসাবকারী" },
  { id: 41, arabic: "الْجَلِيلُ", transliteration: "Al-Jalil", meaning: "The Majestic", bengaliMeaning: "মহিমান্বিত" },
  { id: 42, arabic: "الْكَرِيمُ", transliteration: "Al-Karim", meaning: "The Generous", bengaliMeaning: "মহানুভব" },
  { id: 43, arabic: "الرَّقِيبُ", transliteration: "Ar-Raqib", meaning: "The Watchful", bengaliMeaning: "পর্যবেক্ষক" },
  { id: 44, arabic: "الْمُجِيبُ", transliteration: "Al-Mujib", meaning: "The Responsive", bengaliMeaning: "উত্তরদাতা" },
  { id: 45, arabic: "الْوَاسِعُ", transliteration: "Al-Wasi", meaning: "The All-Encompassing", bengaliMeaning: "সর্বব্যাপী" },
  { id: 46, arabic: "الْحَكِيمُ", transliteration: "Al-Hakim", meaning: "The Wise", bengaliMeaning: "প্রজ্ঞাময়" },
  { id: 47, arabic: "الْوَدُودُ", transliteration: "Al-Wadud", meaning: "The Loving One", bengaliMeaning: "প্রেমময়" },
  { id: 48, arabic: "الْمَجِيدُ", transliteration: "Al-Majid", meaning: "The Glorious", bengaliMeaning: "গৌরবান্বিত" },
  { id: 49, arabic: "الْبَاعِثُ", transliteration: "Al-Ba'ith", meaning: "The Resurrector", bengaliMeaning: "পুনরুত্থানকারী" },
  { id: 50, arabic: "الشَّهِيدُ", transliteration: "Ash-Shahid", meaning: "The Witness", bengaliMeaning: "সাক্ষী" },
  { id: 51, arabic: "الْحَقُّ", transliteration: "Al-Haqq", meaning: "The Truth", bengaliMeaning: "সত্য" },
  { id: 52, arabic: "الْوَكِيلُ", transliteration: "Al-Wakil", meaning: "The Trustee", bengaliMeaning: "অভিভাবক" },
  { id: 53, arabic: "الْقَوِيُّ", transliteration: "Al-Qawiyy", meaning: "The Strong", bengaliMeaning: "শক্তিমান" },
  { id: 54, arabic: "الْمَتِينُ", transliteration: "Al-Matin", meaning: "The Firm One", bengaliMeaning: "দৃঢ়" },
  { id: 55, arabic: "الْوَلِيُّ", transliteration: "Al-Waliyy", meaning: "The Protecting Friend", bengaliMeaning: "অভিভাবক বন্ধু" },
  { id: 56, arabic: "الْحَمِيدُ", transliteration: "Al-Hamid", meaning: "The Praiseworthy", bengaliMeaning: "প্রশংসনীয়" },
  { id: 57, arabic: "الْمُحْصِي", transliteration: "Al-Muhsi", meaning: "The Accounter", bengaliMeaning: "গণনাকারী" },
  { id: 58, arabic: "الْمُبْدِئُ", transliteration: "Al-Mubdi", meaning: "The Originator", bengaliMeaning: "আদি সৃষ্টিকর্তা" },
  { id: 59, arabic: "الْمُعِيدُ", transliteration: "Al-Mu'id", meaning: "The Restorer", bengaliMeaning: "পুনঃসৃষ্টিকর্তা" },
  { id: 60, arabic: "الْمُحْيِي", transliteration: "Al-Muhyi", meaning: "The Giver of Life", bengaliMeaning: "জীবনদাতা" },
  { id: 61, arabic: "اَلْمُمِيتُ", transliteration: "Al-Mumit", meaning: "The Taker of Life", bengaliMeaning: "মৃত্যুদাতা" },
  { id: 62, arabic: "الْحَيُّ", transliteration: "Al-Hayy", meaning: "The Ever Living", bengaliMeaning: "চিরঞ্জীব" },
  { id: 63, arabic: "الْقَيُّومُ", transliteration: "Al-Qayyum", meaning: "The Self-Existing", bengaliMeaning: "স্বয়ংসম্পূর্ণ" },
  { id: 64, arabic: "الْوَاجِدُ", transliteration: "Al-Wajid", meaning: "The Finder", bengaliMeaning: "প্রাপ্তিকর্তা" },
  { id: 65, arabic: "الْمَاجِدُ", transliteration: "Al-Majid", meaning: "The Noble", bengaliMeaning: "মহৎ" },
  { id: 66, arabic: "الْوَاحِدُ", transliteration: "Al-Wahid", meaning: "The Only One", bengaliMeaning: "এক" },
  { id: 67, arabic: "اَلاَحَدُ", transliteration: "Al-Ahad", meaning: "The One", bengaliMeaning: "একক" },
  { id: 68, arabic: "الصَّمَدُ", transliteration: "As-Samad", meaning: "The Eternal", bengaliMeaning: "চিরস্থায়ী" },
  { id: 69, arabic: "الْقَادِرُ", transliteration: "Al-Qadir", meaning: "The Able", bengaliMeaning: "সক্ষম" },
  { id: 70, arabic: "الْمُقْتَدِرُ", transliteration: "Al-Muqtadir", meaning: "The Powerful", bengaliMeaning: "ক্ষমতাবান" },
  { id: 71, arabic: "الْمُقَدِّمُ", transliteration: "Al-Muqaddim", meaning: "The Expediter", bengaliMeaning: "অগ্রসরকারী" },
  { id: 72, arabic: "الْمُؤَخِّرُ", transliteration: "Al-Mu'akhkhir", meaning: "The Delayer", bengaliMeaning: "বিলম্বকারী" },
  { id: 73, arabic: "الأوَّلُ", transliteration: "Al-Awwal", meaning: "The First", bengaliMeaning: "প্রথম" },
  { id: 74, arabic: "الآخِرُ", transliteration: "Al-Akhir", meaning: "The Last", bengaliMeaning: "শেষ" },
  { id: 75, arabic: "الظَّاهِرُ", transliteration: "Az-Zahir", meaning: "The Manifest", bengaliMeaning: "প্রকাশ্য" },
  { id: 76, arabic: "الْبَاطِنُ", transliteration: "Al-Batin", meaning: "The Hidden", bengaliMeaning: "গুপ্ত" },
  { id: 77, arabic: "الْوَالِي", transliteration: "Al-Wali", meaning: "The Governor", bengaliMeaning: "শাসক" },
  { id: 78, arabic: "الْمُتَعَالِي", transliteration: "Al-Muta'ali", meaning: "The Most Exalted", bengaliMeaning: "সর্বোচ্চ মহিমাময়" },
  { id: 79, arabic: "الْبَرُّ", transliteration: "Al-Barr", meaning: "The Source of Goodness", bengaliMeaning: "পুণ্যদাতা" },
  { id: 80, arabic: "التَّوَابُ", transliteration: "At-Tawwab", meaning: "The Acceptor of Repentance", bengaliMeaning: "তওবা গ্রহণকারী" },
  { id: 81, arabic: "الْمُنْتَقِمُ", transliteration: "Al-Muntaqim", meaning: "The Avenger", bengaliMeaning: "প্রতিশোধ গ্রহণকারী" },
  { id: 82, arabic: "العَفُوُّ", transliteration: "Al-Afuww", meaning: "The Pardoner", bengaliMeaning: "ক্ষমাকারী" },
  { id: 83, arabic: "الرَّؤُوفُ", transliteration: "Ar-Ra'uf", meaning: "The Compassionate", bengaliMeaning: "স্নেহশীল" },
  { id: 84, arabic: "مَالِكُ الْمُلْكِ", transliteration: "Malik-ul-Mulk", meaning: "Owner of Sovereignty", bengaliMeaning: "সার্বভৌমত্বের মালিক" },
  { id: 85, arabic: "ذُوالْجَلاَلِ وَالإكْرَامِ", transliteration: "Dhul-Jalal wal-Ikram", meaning: "Lord of Majesty", bengaliMeaning: "মহিমা ও সম্মানের অধিকারী" },
  { id: 86, arabic: "الْمُقْسِطُ", transliteration: "Al-Muqsit", meaning: "The Equitable", bengaliMeaning: "ন্যায়পরায়ণ" },
  { id: 87, arabic: "الْجَامِعُ", transliteration: "Al-Jami", meaning: "The Gatherer", bengaliMeaning: "সংগ্রাহক" },
  { id: 88, arabic: "الْغَنِيُّ", transliteration: "Al-Ghani", meaning: "The Self-Sufficient", bengaliMeaning: "অভাবমুক্ত" },
  { id: 89, arabic: "الْمُغْنِي", transliteration: "Al-Mughni", meaning: "The Enricher", bengaliMeaning: "সমৃদ্ধকারী" },
  { id: 90, arabic: "اَلْمَانِعُ", transliteration: "Al-Mani", meaning: "The Preventer", bengaliMeaning: "বাধাদানকারী" },
  { id: 91, arabic: "الضَّارَّ", transliteration: "Ad-Darr", meaning: "The Distresser", bengaliMeaning: "ক্ষতিকারী" },
  { id: 92, arabic: "النَّافِعُ", transliteration: "An-Nafi", meaning: "The Propitious", bengaliMeaning: "উপকারী" },
  { id: 93, arabic: "النُّورُ", transliteration: "An-Nur", meaning: "The Light", bengaliMeaning: "আলো" },
  { id: 94, arabic: "الْهَادِي", transliteration: "Al-Hadi", meaning: "The Guide", bengaliMeaning: "পথপ্রদর্শক" },
  { id: 95, arabic: "الْبَدِيعُ", transliteration: "Al-Badi", meaning: "The Originator", bengaliMeaning: "অভিনব সৃষ্টিকর্তা" },
  { id: 96, arabic: "اَلْبَاقِي", transliteration: "Al-Baqi", meaning: "The Everlasting", bengaliMeaning: "চিরস্থায়ী" },
  { id: 97, arabic: "الْوَارِثُ", transliteration: "Al-Warith", meaning: "The Inheritor", bengaliMeaning: "উত্তরাধিকারী" },
  { id: 98, arabic: "الرَّشِيدُ", transliteration: "Ar-Rashid", meaning: "The Guide to Right Path", bengaliMeaning: "সঠিক পথের নির্দেশক" },
  { id: 99, arabic: "الصَّبُورُ", transliteration: "As-Sabur", meaning: "The Patient One", bengaliMeaning: "ধৈর্যশীল" },
];

const NamesOfAllahPage = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedName, setSelectedName] = useState<NameOfAllah | null>(null);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const selectedIdParam = searchParams.get("name");
  const selectedId = selectedIdParam ? Number(selectedIdParam) : null;

  useEffect(() => {
    if (!selectedId || !Number.isFinite(selectedId)) {
      setSelectedName(null);
      return;
    }
    const found = namesOfAllah.find((n) => n.id === selectedId) ?? null;
    setSelectedName(found);
  }, [selectedId]);

  const openName = (id: number) => {
    setSearchParams({ name: String(id) }, { replace: false });
  };

  const goBack = () => navigate(-1);

  const speakArabic = useCallback((arabicText: string, transliteration: string) => {
    // Cancel any ongoing speech
    window.speechSynthesis.cancel();
    
    const utterance = new SpeechSynthesisUtterance(arabicText);
    utterance.lang = 'ar-SA';
    utterance.rate = 0.7;
    utterance.pitch = 1;
    
    // Try to find an Arabic voice
    const voices = window.speechSynthesis.getVoices();
    const arabicVoice = voices.find(voice => 
      voice.lang.startsWith('ar') || voice.name.toLowerCase().includes('arabic')
    );
    
    if (arabicVoice) {
      utterance.voice = arabicVoice;
    }
    
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast.error("অডিও চালাতে সমস্যা হয়েছে");
    };
    
    window.speechSynthesis.speak(utterance);
    toast.success(`${transliteration} উচ্চারণ হচ্ছে...`);
  }, []);

  const filteredNames = namesOfAllah.filter(
    (name) =>
      name.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
      name.arabic.includes(searchQuery) ||
      (name.bengaliMeaning && name.bengaliMeaning.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Premium Royal Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Gold radial gradient */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-gradient-radial from-amber-300/30 via-yellow-200/20 to-transparent blur-3xl" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-gradient-radial from-orange-300/20 via-amber-200/10 to-transparent blur-3xl" />
        
        {/* Luxury Islamic geometric pattern */}
        <div className="absolute inset-0 opacity-[0.06]" 
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23b8860b' stroke-width='1'%3E%3Cpath d='M0 0l40 40M40 0l-40 40M40 40l40 40M80 40l-40 40M0 40l40-40M40 80l40-40M40 40l-40 40M0 80l40-40'/%3E%3Ccircle cx='40' cy='40' r='20'/%3E%3Ccircle cx='40' cy='40' r='10'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        
        {/* Floating golden orbs */}
        <motion.div 
          animate={{ y: [0, -30, 0], opacity: [0.4, 0.7, 0.4] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-32 right-16 w-48 h-48 bg-gradient-to-br from-amber-400/30 to-yellow-300/20 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ y: [0, 25, 0], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-32 left-8 w-56 h-56 bg-gradient-to-br from-orange-300/25 to-amber-200/15 rounded-full blur-3xl"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-br from-yellow-200/10 to-amber-300/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 backdrop-blur-xl bg-gradient-to-r from-amber-100/80 via-yellow-50/80 to-orange-100/80 border-b border-amber-300/40 shadow-lg shadow-amber-200/20"
      >
        <div className="px-4 py-4 flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl bg-gradient-to-br from-amber-200/60 to-yellow-200/60 hover:from-amber-300/80 hover:to-yellow-300/80 border border-amber-400/30 transition-all duration-300 hover:scale-105 shadow-md shadow-amber-300/20"
            >
              <ArrowLeft className="h-5 w-5 text-amber-800" />
            </button>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-amber-700 via-yellow-700 to-orange-700 bg-clip-text text-transparent flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-600" />
                আল্লাহর ৯৯ নাম
              </h1>
              <p className="text-xs text-amber-600/80 font-medium">Asmaul Husna</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 shadow-lg shadow-amber-400/30">
              <span className="text-sm font-bold text-white">৯৯</span>
            </div>
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {selectedName ? (
          /* Detail View */
          <motion.div
            key="detail"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="px-4 py-8 max-w-2xl mx-auto"
          >
            <button 
              onClick={goBack}
              className="mb-8 flex items-center gap-2 text-amber-700 hover:text-amber-600 transition-colors font-medium"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="text-sm">সব নাম দেখুন</span>
            </button>

            <motion.div 
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-amber-400/20"
              layoutId={`card-${selectedName.id}`}
              style={{ animation: 'gold-pulse 3s ease-in-out infinite' }}
            >
              {/* Card Background */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-100 via-yellow-50 to-orange-100" />
              <div className="absolute inset-0 bg-gradient-to-t from-amber-200/50 via-transparent to-yellow-100/30" />
              
              {/* Continuous Shimmer Effect */}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(105deg, transparent 20%, rgba(255,215,0,0.2) 35%, rgba(255,215,0,0.4) 50%, rgba(255,215,0,0.2) 65%, transparent 80%)',
                  backgroundSize: '200% 100%',
                  animation: 'shimmer 2s infinite linear',
                }}
              />
              
              {/* Gold Particles */}
              {[...Array(12)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    background: `radial-gradient(circle, rgba(255,215,0,0.8) 0%, rgba(255,193,7,0.4) 50%, transparent 70%)`,
                    left: `${10 + (i * 7)}%`,
                    top: `${15 + (i % 4) * 20}%`,
                  }}
                  animate={{
                    y: [0, -15, 0],
                    x: [0, i % 2 === 0 ? 8 : -8, 0],
                    opacity: [0.3, 0.8, 0.3],
                    scale: [0.8, 1.2, 0.8],
                  }}
                  transition={{
                    duration: 2 + (i * 0.3),
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: i * 0.2,
                  }}
                />
              ))}
              
              {/* Gold decorative corners */}
              <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-0 left-0 w-28 h-28 bg-gradient-to-br from-amber-400/40 to-transparent" 
              />
              <motion.div 
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl from-yellow-400/40 to-transparent" 
              />
              <motion.div 
                animate={{ opacity: [0.3, 0.5, 0.3] }}
                transition={{ duration: 3, repeat: Infinity, delay: 1 }}
                className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-orange-400/30 to-transparent" 
              />
              <motion.div 
                animate={{ opacity: [0.4, 0.6, 0.4] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                className="absolute bottom-0 right-0 w-28 h-28 bg-gradient-to-tl from-amber-400/40 to-transparent" 
              />
              
              {/* Animated Gold border effect */}
              <div className="absolute inset-0 border-2 border-amber-400/50 rounded-3xl" />
              <motion.div 
                animate={{ opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="absolute inset-[3px] border border-amber-300/40 rounded-3xl" 
              />
              
              <div className="relative p-8 md:p-12 text-center">
                {/* Number Badge */}
                <div className="inline-flex items-center justify-center mb-6">
                  <div className="relative">
                    <div className="absolute inset-0 bg-amber-400/40 blur-xl rounded-full" />
                    <div className="relative w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 via-yellow-400 to-orange-400 flex items-center justify-center shadow-xl shadow-amber-400/40 border-2 border-amber-300/50">
                      <span className="text-2xl font-bold text-white drop-shadow-md">{selectedName.id}</span>
                    </div>
                  </div>
                </div>

                {/* Arabic Name */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-6"
                >
                  <h2 className="text-6xl md:text-7xl font-bold text-amber-900 mb-4 drop-shadow-sm" style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}>
                    {selectedName.arabic}
                  </h2>
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                    <span className="text-xl text-amber-700 font-semibold">{selectedName.transliteration}</span>
                    <div className="h-px w-12 bg-gradient-to-r from-transparent via-amber-500 to-transparent" />
                  </div>
                </motion.div>

                {/* Audio Button */}
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.15 }}
                  onClick={() => speakArabic(selectedName.arabic, selectedName.transliteration)}
                  disabled={isSpeaking}
                  className={`mb-6 px-6 py-3 rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 text-white font-medium shadow-lg shadow-amber-400/30 hover:from-amber-500 hover:to-yellow-600 transition-all flex items-center gap-2 mx-auto ${isSpeaking ? 'animate-pulse' : ''}`}
                >
                  <Volume2 className={`h-5 w-5 ${isSpeaking ? 'animate-bounce' : ''}`} />
                  {isSpeaking ? 'উচ্চারণ হচ্ছে...' : 'উচ্চারণ শুনুন'}
                </motion.button>

                {/* Royal Divider */}
                <div className="flex items-center justify-center gap-4 mb-6">
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <div className="h-px w-20 bg-gradient-to-r from-transparent via-amber-400 to-transparent" />
                </div>

                {/* Meanings */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="space-y-4"
                >
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-white/80 to-amber-50/80 border border-amber-300/40 shadow-lg shadow-amber-200/20">
                    <p className="text-sm text-amber-600 mb-1 font-medium">English</p>
                    <p className="text-xl text-amber-900 font-semibold">{selectedName.meaning}</p>
                  </div>
                  
                  {selectedName.bengaliMeaning && (
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-white/80 to-orange-50/80 border border-orange-300/40 shadow-lg shadow-orange-200/20">
                      <p className="text-sm text-orange-600 mb-1 font-medium">বাংলা</p>
                      <p className="text-xl text-amber-900 font-semibold">{selectedName.bengaliMeaning}</p>
                    </div>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          /* List View */
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-4 py-6 max-w-7xl mx-auto"
          >
            {/* Search Bar */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-8"
            >
              <div className="relative max-w-md mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/30 to-yellow-400/30 rounded-2xl blur-xl opacity-60" />
                <div className="relative flex items-center bg-gradient-to-r from-white/90 to-amber-50/90 border-2 border-amber-300/50 rounded-2xl overflow-hidden backdrop-blur-sm shadow-lg shadow-amber-200/30">
                  <Search className="h-5 w-5 text-amber-500 ml-4" />
                  <input
                    type="text"
                    placeholder="নাম খুঁজুন..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent px-4 py-4 text-amber-900 placeholder:text-amber-400 focus:outline-none text-base font-medium"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="mr-4 text-xs text-amber-600 hover:text-amber-700 font-medium"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Names Grid */}
            <motion.div 
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-4"
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.02
                  }
                }
              }}
            >
              {filteredNames.map((name) => (
                <motion.button
                  key={name.id}
                  variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0 }
                  }}
                  whileHover={{ scale: 1.03, y: -6 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => openName(name.id)}
                  className="group relative rounded-2xl overflow-hidden text-left transition-all duration-300"
                  layoutId={`card-${name.id}`}
                >
                  {/* Card Background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-white via-amber-50/80 to-yellow-50 group-hover:from-amber-100 group-hover:via-yellow-100 group-hover:to-orange-50 transition-all duration-500" />
                  
                  {/* Gold Shimmer Effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                    style={{
                      background: 'linear-gradient(105deg, transparent 20%, rgba(255,215,0,0.15) 35%, rgba(255,215,0,0.35) 50%, rgba(255,215,0,0.15) 65%, transparent 80%)',
                      backgroundSize: '200% 100%',
                      animation: 'shimmer 1.5s infinite linear',
                    }}
                  />
                  
                  {/* Gold border */}
                  <div className="absolute inset-0 border-2 border-amber-200/60 group-hover:border-amber-400/80 rounded-2xl transition-colors duration-300" />
                  
                  {/* Hover glow effect */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-amber-200/40 to-yellow-200/30" />
                  
                  {/* Corner accents */}
                  <div className="absolute top-0 right-0 w-12 h-12 bg-gradient-to-bl from-amber-300/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative p-4">
                    {/* Audio Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        speakArabic(name.arabic, name.transliteration);
                      }}
                      className="absolute top-2 left-2 w-7 h-7 rounded-full bg-gradient-to-br from-amber-400/80 to-yellow-500/80 flex items-center justify-center shadow-md opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 z-10"
                    >
                      <Volume2 className="h-3.5 w-3.5 text-white" />
                    </button>
                    
                    {/* Number Badge */}
                    <div className="absolute top-2 right-2">
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-400 to-yellow-500 flex items-center justify-center shadow-md shadow-amber-300/30">
                        <span className="text-[9px] font-bold text-white">
                          {name.id}
                        </span>
                      </div>
                    </div>
                    
                    {/* Arabic */}
                    <div className="mb-3 pr-8 pl-6">
                      <p 
                        className="text-2xl md:text-3xl font-bold text-amber-900 group-hover:text-amber-800 transition-colors leading-tight"
                        style={{ fontFamily: "'Amiri', 'Noto Naskh Arabic', serif" }}
                      >
                        {name.arabic}
                      </p>
                    </div>
                    
                    {/* Transliteration */}
                    <p className="text-sm font-semibold text-amber-700 mb-1 truncate">
                      {name.transliteration}
                    </p>
                    
                    {/* Bengali Meaning */}
                    <p className="text-xs text-amber-600/80 group-hover:text-amber-700 truncate transition-colors font-medium">
                      {name.bengaliMeaning || name.meaning}
                    </p>
                  </div>
                  
                  {/* Bottom shine effect */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-amber-400/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </motion.button>
              ))}
            </motion.div>

            {filteredNames.length === 0 && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-200 to-yellow-200 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-200/40">
                  <Search className="h-10 w-10 text-amber-600" />
                </div>
                <p className="text-amber-700 font-medium text-lg">কোনো নাম পাওয়া যায়নি</p>
                <button 
                  onClick={() => setSearchQuery("")}
                  className="mt-4 px-6 py-2 bg-gradient-to-r from-amber-400 to-yellow-400 text-white rounded-full font-medium hover:from-amber-500 hover:to-yellow-500 transition-all shadow-lg shadow-amber-300/30"
                >
                  সব দেখুন
                </button>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default NamesOfAllahPage;
