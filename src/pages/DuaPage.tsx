import { useState } from "react";
import { Search, BookOpen, ChevronRight, ArrowLeft, Sparkles, Heart, Volume2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import DuaAudioPlayer from "@/components/DuaAudioPlayer";

type Language = "bengali" | "english" | "hindi" | "urdu";

const LANGUAGE_LABELS: Record<Language, string> = {
  bengali: "বাংলা",
  english: "English",
  hindi: "हिंदी",
  urdu: "اردو",
};

interface DuaTranslation {
  title: string;
  translation: string;
  category: string;
}

interface Dua {
  id: number;
  arabic: string;
  transliteration: string;
  translations: Record<Language, DuaTranslation>;
}

const duas: Dua[] = [
  // Morning Adhkar
  {
    id: 1,
    arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Asbahna wa asbahal mulku lillah, walhamdu lillah",
    translations: {
      bengali: { title: "সকালের দোয়া", category: "সকালের আযকার", translation: "আমরা সকালে উপনীত হয়েছি এবং এই সময়ে সমস্ত সার্বভৌমত্ব আল্লাহর। সমস্ত প্রশংসা আল্লাহর জন্য।" },
      english: { title: "Morning Dua", category: "Morning Adhkar", translation: "We have reached the morning and at this very time all sovereignty belongs to Allah. All praise is due to Allah." },
      hindi: { title: "सुबह की दुआ", category: "सुबह के अज़कार", translation: "हम सुबह को पहुँचे और इस समय सारी बादशाहत अल्लाह की है। सारी तारीफ अल्लाह के लिए है।" },
      urdu: { title: "صبح کی دعا", category: "صبح کے اذکار", translation: "ہم نے صبح کی اور اس وقت ساری بادشاہت اللہ کی ہے۔ تمام تعریفیں اللہ کے لیے ہیں۔" },
    },
  },
  {
    id: 2,
    arabic: "اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ النُّشُورُ",
    transliteration: "Allahumma bika asbahna, wa bika amsayna, wa bika nahya, wa bika namutu, wa ilaykan-nushur",
    translations: {
      bengali: { title: "সকালে আল্লাহর উপর ভরসা", category: "সকালের আযকার", translation: "হে আল্লাহ, তোমার কারণে আমরা সকালে উপনীত হয়েছি, তোমার কারণে সন্ধ্যায় উপনীত হই, তোমার কারণে জীবিত থাকি, তোমার কারণে মৃত্যুবরণ করি এবং তোমার কাছেই পুনরুত্থান।" },
      english: { title: "Morning Trust in Allah", category: "Morning Adhkar", translation: "O Allah, by You we enter the morning, by You we enter the evening, by You we live, by You we die, and to You is the resurrection." },
      hindi: { title: "सुबह अल्लाह पर भरोसा", category: "सुबह के अज़कार", translation: "हे अल्लाह, तेरी वजह से हमने सुबह की, तेरी वजह से शाम करते हैं, तेरी वजह से जीते हैं, तेरी वजह से मरते हैं और तेरी तरफ़ ही लौटना है।" },
      urdu: { title: "صبح اللہ پر بھروسہ", category: "صبح کے اذکار", translation: "اے اللہ، تیری وجہ سے ہم نے صبح کی، تیری وجہ سے شام کرتے ہیں، تیری وجہ سے جیتے ہیں، تیری وجہ سے مرتے ہیں اور تیری طرف ہی لوٹنا ہے۔" },
    },
  },
  {
    id: 3,
    arabic: "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلَهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ",
    transliteration: "Allahumma anta rabbi la ilaha illa anta, khalaqtani wa ana 'abduk",
    translations: {
      bengali: { title: "সাইয়্যিদুল ইস্তিগফার (সকাল)", category: "সকালের আযকার", translation: "হে আল্লাহ, তুমি আমার রব, তুমি ছাড়া কোনো উপাস্য নেই, তুমি আমাকে সৃষ্টি করেছ এবং আমি তোমার বান্দা।" },
      english: { title: "Sayyidul Istighfar (Morning)", category: "Morning Adhkar", translation: "O Allah, You are my Lord, there is no deity except You, You created me and I am Your servant." },
      hindi: { title: "सय्यिदुल इस्तिग़फ़ार (सुबह)", category: "सुबह के अज़कार", translation: "हे अल्लाह, तू मेरा रब है, तेरे सिवा कोई माबूद नहीं, तूने मुझे पैदा किया और मैं तेरा बंदा हूँ।" },
      urdu: { title: "سید الاستغفار (صبح)", category: "صبح کے اذکار", translation: "اے اللہ، تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں۔" },
    },
  },
  {
    id: 4,
    arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ",
    transliteration: "Subhanallahi wa bihamdihi, 'adada khalqihi, wa rida nafsihi, wa zinata 'arshihi, wa midada kalimatihi",
    translations: {
      bengali: { title: "সুবহানাল্লাহি ওয়া বিহামদিহি", category: "সকালের আযকার", translation: "আল্লাহর প্রশংসা ও পবিত্রতা ঘোষণা করি, তাঁর সৃষ্টির সংখ্যা পরিমাণ, তাঁর সন্তুষ্টি পরিমাণ, তাঁর আরশের ওজন পরিমাণ এবং তাঁর বাণীসমূহের কালি পরিমাণ।" },
      english: { title: "Subhanallahi wa Bihamdihi", category: "Morning Adhkar", translation: "Glory and praise be to Allah, as many as His creations, as pleases Him, as heavy as His Throne, and as extensive as His Words." },
      hindi: { title: "सुबहानल्लाहि व बिहम्दिही", category: "सुबह के अज़कार", translation: "अल्लाह की पाकी और तारीफ बयान करता हूँ, उसकी मख़लूक़ की तादाद, उसकी रज़ा, उसके अर्श के वज़न और उसके कलिमात की स्याही के बराबर।" },
      urdu: { title: "سبحان اللہ و بحمدہ", category: "صبح کے اذکار", translation: "اللہ کی پاکی اور تعریف بیان کرتا ہوں، اس کی مخلوق کی تعداد، اس کی رضا، اس کے عرش کے وزن اور اس کے کلمات کی سیاہی کے برابر۔" },
    },
  },

  // Evening Adhkar
  {
    id: 5,
    arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ",
    transliteration: "Amsayna wa amsal mulku lillah, walhamdu lillah",
    translations: {
      bengali: { title: "সন্ধ্যার দোয়া", category: "সন্ধ্যার আযকার", translation: "আমরা সন্ধ্যায় উপনীত হয়েছি এবং এই সময়ে সমস্ত সার্বভৌমত্ব আল্লাহর। সমস্ত প্রশংসা আল্লাহর জন্য।" },
      english: { title: "Evening Dua", category: "Evening Adhkar", translation: "We have reached the evening and at this very time all sovereignty belongs to Allah. All praise is due to Allah." },
      hindi: { title: "शाम की दुआ", category: "शाम के अज़कार", translation: "हम शाम को पहुँचे और इस समय सारी बादशाहत अल्लाह की है। सारी तारीफ अल्लाह के लिए है।" },
      urdu: { title: "شام کی دعا", category: "شام کے اذکار", translation: "ہم نے شام کی اور اس وقت ساری بادشاہت اللہ کی ہے۔ تمام تعریفیں اللہ کے لیے ہیں۔" },
    },
  },
  {
    id: 6,
    arabic: "اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ، وَإِلَيْكَ الْمَصِيرُ",
    transliteration: "Allahumma bika amsayna, wa bika asbahna, wa bika nahya, wa bika namutu, wa ilaykal-masir",
    translations: {
      bengali: { title: "সন্ধ্যায় আল্লাহর উপর ভরসা", category: "সন্ধ্যার আযকার", translation: "হে আল্লাহ, তোমার কারণে আমরা সন্ধ্যায় উপনীত হয়েছি, তোমার কারণে সকালে উপনীত হই, তোমার কারণে জীবিত থাকি, তোমার কারণে মৃত্যুবরণ করি এবং তোমার কাছেই প্রত্যাবর্তন।" },
      english: { title: "Evening Trust in Allah", category: "Evening Adhkar", translation: "O Allah, by You we enter the evening, by You we enter the morning, by You we live, by You we die, and to You is the final return." },
      hindi: { title: "शाम अल्लाह पर भरोसा", category: "शाम के अज़कार", translation: "हे अल्लाह, तेरी वजह से हमने शाम की, तेरी वजह से सुबह करते हैं, तेरी वजह से जीते हैं, तेरी वजह से मरते हैं और तेरी तरफ़ ही लौटना है।" },
      urdu: { title: "شام اللہ پر بھروسہ", category: "شام کے اذکار", translation: "اے اللہ، تیری وجہ سے ہم نے شام کی، تیری وجہ سے صبح کرتے ہیں، تیری وجہ سے جیتے ہیں، تیری وجہ سے مرتے ہیں اور تیری طرف ہی لوٹنا ہے۔" },
    },
  },
  {
    id: 7,
    arabic: "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
    transliteration: "A'udhu bikalimatillahit-tammati min sharri ma khalaq",
    translations: {
      bengali: { title: "সন্ধ্যায় সুরক্ষার দোয়া", category: "সন্ধ্যার আযকার", translation: "আমি আল্লাহর পরিপূর্ণ বাণীসমূহের আশ্রয় নিচ্ছি তাঁর সৃষ্টির অনিষ্ট থেকে।" },
      english: { title: "Evening Protection Dua", category: "Evening Adhkar", translation: "I seek refuge in Allah's perfect words from the evil of what He has created." },
      hindi: { title: "शाम की हिफ़ाज़त की दुआ", category: "शाम के अज़कार", translation: "मैं अल्लाह के मुकम्मल कलिमात की पनाह लेता हूँ उसकी मख़लूक़ के शर से।" },
      urdu: { title: "شام کی حفاظت کی دعا", category: "شام کے اذکار", translation: "میں اللہ کے مکمل کلمات کی پناہ لیتا ہوں اس کی مخلوق کے شر سے۔" },
    },
  },
  {
    id: 8,
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ",
    transliteration: "Allahumma inni as'alukal-'afwa wal-'afiyah fid-dunya wal-akhirah",
    translations: {
      bengali: { title: "ক্ষমা ও নিরাপত্তার দোয়া", category: "সন্ধ্যার আযকার", translation: "হে আল্লাহ, আমি তোমার কাছে দুনিয়া ও আখিরাতে ক্ষমা এবং নিরাপত্তা প্রার্থনা করছি।" },
      english: { title: "Dua for Pardon and Well-being", category: "Evening Adhkar", translation: "O Allah, I ask You for pardon and well-being in this life and the Hereafter." },
      hindi: { title: "माफ़ी और आफ़ियत की दुआ", category: "शाम के अज़कार", translation: "हे अल्लाह, मैं तुझसे दुनिया और आख़िरत में माफ़ी और आफ़ियत माँगता हूँ।" },
      urdu: { title: "معافی اور عافیت کی دعا", category: "شام کے اذکار", translation: "اے اللہ، میں تجھ سے دنیا اور آخرت میں معافی اور عافیت مانگتا ہوں۔" },
    },
  },

  // Travel Prayers
  {
    id: 9,
    arabic: "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    transliteration: "Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin, wa inna ila rabbina lamunqalibun",
    translations: {
      bengali: { title: "যানবাহনে চড়ার দোয়া", category: "সফরের দোয়া", translation: "পবিত্র সেই সত্তা যিনি এটিকে আমাদের বশীভূত করে দিয়েছেন, অথচ আমরা এটিকে বশীভূত করতে সক্ষম ছিলাম না এবং নিশ্চয়ই আমরা আমাদের রবের কাছে ফিরে যাব।" },
      english: { title: "Dua When Riding Vehicle", category: "Travel Prayers", translation: "Glory to Him who has subjected this to us, and we could never have subdued it ourselves, and surely to our Lord we shall return." },
      hindi: { title: "सवारी पर बैठने की दुआ", category: "सफ़र की दुआ", translation: "पाक है वह जिसने इसे हमारे वश में कर दिया, वर्ना हम इसे वश में करने की ताक़त नहीं रखते थे और बेशक हम अपने रब की तरफ़ लौटने वाले हैं।" },
      urdu: { title: "سواری پر بیٹھنے کی دعا", category: "سفر کی دعا", translation: "پاک ہے وہ جس نے اسے ہمارے بس میں کر دیا، ورنہ ہم اسے بس میں کرنے کی طاقت نہیں رکھتے تھے اور بے شک ہم اپنے رب کی طرف لوٹنے والے ہیں۔" },
    },
  },
  {
    id: 10,
    arabic: "اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى، وَمِنَ الْعَمَلِ مَا تَرْضَى",
    transliteration: "Allahumma inna nas'aluka fi safarina hadhal-birra wat-taqwa, wa minal-'amali ma tarda",
    translations: {
      bengali: { title: "সফরের শুরুতে দোয়া", category: "সফরের দোয়া", translation: "হে আল্লাহ, আমরা তোমার কাছে এই সফরে সৎকর্ম ও তাকওয়া প্রার্থনা করি এবং এমন আমল চাই যা তুমি পছন্দ কর।" },
      english: { title: "Dua at Start of Travel", category: "Travel Prayers", translation: "O Allah, we ask You on this journey for righteousness and piety, and for deeds that please You." },
      hindi: { title: "सफ़र शुरू करने की दुआ", category: "सफ़र की दुआ", translation: "हे अल्लाह, हम तुझसे इस सफ़र में नेकी और तक़्वा माँगते हैं और ऐसा अमल माँगते हैं जो तुझे पसंद हो।" },
      urdu: { title: "سفر شروع کرنے کی دعا", category: "سفر کی دعا", translation: "اے اللہ، ہم تجھ سے اس سفر میں نیکی اور تقویٰ مانگتے ہیں اور ایسا عمل مانگتے ہیں جو تجھے پسند ہو۔" },
    },
  },
  {
    id: 11,
    arabic: "اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا، وَاطْوِ عَنَّا بُعْدَهُ",
    transliteration: "Allahumma hawwin 'alayna safarana hadha, watwi 'anna bu'dahu",
    translations: {
      bengali: { title: "সফর সহজ করার দোয়া", category: "সফরের দোয়া", translation: "হে আল্লাহ, আমাদের এই সফরকে সহজ করে দাও এবং এর দূরত্ব সংক্ষিপ্ত করে দাও।" },
      english: { title: "Dua for Easy Journey", category: "Travel Prayers", translation: "O Allah, make this journey easy for us and shorten the distance for us." },
      hindi: { title: "सफ़र आसान करने की दुआ", category: "सफ़र की दुआ", translation: "हे अल्लाह, हमारे इस सफ़र को आसान कर दे और इसकी दूरी को कम कर दे।" },
      urdu: { title: "سفر آسان کرنے کی دعا", category: "سفر کی دعا", translation: "اے اللہ، ہمارے اس سفر کو آسان کر دے اور اس کی دوری کو کم کر دے۔" },
    },
  },
  {
    id: 12,
    arabic: "اللَّهُمَّ أَنْتَ الصَّاحِبُ فِي السَّفَرِ، وَالْخَلِيفَةُ فِي الْأَهْلِ",
    transliteration: "Allahumma antas-sahibu fis-safar, wal-khalifatu fil-ahl",
    translations: {
      bengali: { title: "সফরে সাথী হওয়ার দোয়া", category: "সফরের দোয়া", translation: "হে আল্লাহ, তুমি সফরে আমার সাথী এবং পরিবারে আমার প্রতিনিধি।" },
      english: { title: "Dua for Companionship in Travel", category: "Travel Prayers", translation: "O Allah, You are the Companion in travel and the Guardian of the family." },
      hindi: { title: "सफ़र में साथी की दुआ", category: "सफ़र की दुआ", translation: "हे अल्लाह, तू सफ़र में मेरा साथी है और घर वालों का निगहबान है।" },
      urdu: { title: "سفر میں ساتھی کی دعا", category: "سفر کی دعا", translation: "اے اللہ، تو سفر میں میرا ساتھی ہے اور گھر والوں کا نگہبان ہے۔" },
    },
  },
  {
    id: 13,
    arabic: "آيِبُونَ تَائِبُونَ عَابِدُونَ لِرَبِّنَا حَامِدُونَ",
    transliteration: "Ayibuna, ta'ibuna, 'abiduna, li Rabbina hamidun",
    translations: {
      bengali: { title: "সফর থেকে ফেরার দোয়া", category: "সফরের দোয়া", translation: "আমরা প্রত্যাবর্তনকারী, তওবাকারী, ইবাদতকারী এবং আমাদের রবের প্রশংসাকারী।" },
      english: { title: "Dua When Returning from Travel", category: "Travel Prayers", translation: "We are returning, repentant, worshipping, and praising our Lord." },
      hindi: { title: "सफ़र से लौटने की दुआ", category: "सफ़र की दुआ", translation: "हम लौटने वाले, तौबा करने वाले, इबादत करने वाले और अपने रब की तारीफ़ करने वाले हैं।" },
      urdu: { title: "سفر سے واپسی کی دعا", category: "سفر کی دعا", translation: "ہم لوٹنے والے، توبہ کرنے والے، عبادت کرنے والے اور اپنے رب کی تعریف کرنے والے ہیں۔" },
    },
  },

  // Healing Prayers
  {
    id: 14,
    arabic: "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَاسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا",
    transliteration: "Allahumma rabban-nas, adhhibil-ba's, ishfi antash-shafi, la shifa'a illa shifa'uk, shifa'an la yughadiru saqama",
    translations: {
      bengali: { title: "রোগ থেকে সুস্থতার দোয়া", category: "রোগমুক্তির দোয়া", translation: "হে আল্লাহ, মানুষের রব, কষ্ট দূর কর, তুমি আরোগ্যদানকারী, তোমার শিফা ছাড়া কোনো শিফা নেই, এমন আরোগ্য দাও যা কোনো রোগ অবশিষ্ট রাখে না।" },
      english: { title: "Dua for Healing from Illness", category: "Healing Prayers", translation: "O Allah, Lord of mankind, remove the harm, heal him, You are the Healer, there is no healing except Your healing, a healing that leaves no illness." },
      hindi: { title: "बीमारी से शिफ़ा की दुआ", category: "शिफ़ा की दुआ", translation: "हे अल्लाह, इंसानों के रब, तकलीफ़ दूर कर, तू शिफ़ा देने वाला है, तेरी शिफ़ा के सिवा कोई शिफ़ा नहीं, ऐसी शिफ़ा दे जो कोई बीमारी न छोड़े।" },
      urdu: { title: "بیماری سے شفا کی دعا", category: "شفا کی دعا", translation: "اے اللہ، انسانوں کے رب، تکلیف دور کر، تو شفا دینے والا ہے، تیری شفا کے سوا کوئی شفا نہیں، ایسی شفا دے جو کوئی بیماری نہ چھوڑے۔" },
    },
  },
  {
    id: 15,
    arabic: "بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ",
    transliteration: "Bismillahil-ladhi la yadurru ma'asmihi shay'un fil-ardi wa la fis-sama'i, wa huwas-sami'ul-'alim",
    translations: {
      bengali: { title: "ক্ষতি থেকে রক্ষার দোয়া", category: "রোগমুক্তির দোয়া", translation: "আল্লাহর নামে যাঁর নামের সাথে আকাশ ও জমিনে কোনো কিছু ক্ষতি করতে পারে না এবং তিনি সর্বশ্রোতা, সর্বজ্ঞ।" },
      english: { title: "Dua for Protection from Harm", category: "Healing Prayers", translation: "In the name of Allah with whose name nothing can cause harm in the earth or the heavens, and He is the All-Hearing, All-Knowing." },
      hindi: { title: "नुक़सान से बचाव की दुआ", category: "शिफ़ा की दुआ", translation: "अल्लाह के नाम से जिसके नाम के साथ ज़मीन और आसमान में कोई चीज़ नुक़सान नहीं पहुँचा सकती और वह सुनने वाला, जानने वाला है।" },
      urdu: { title: "نقصان سے بچاؤ کی دعا", category: "شفا کی دعا", translation: "اللہ کے نام سے جس کے نام کے ساتھ زمین اور آسمان میں کوئی چیز نقصان نہیں پہنچا سکتی اور وہ سننے والا، جاننے والا ہے۔" },
    },
  },
  {
    id: 16,
    arabic: "أَسْأَلُ اللَّهَ الْعَظِيمَ رَبَّ الْعَرْشِ الْعَظِيمِ أَنْ يَشْفِيَكَ",
    transliteration: "As'alullaha al-'Azim, Rabbal-'Arshil-'Azim, an yashfiyak",
    translations: {
      bengali: { title: "অসুস্থের জন্য দোয়া", category: "রোগমুক্তির দোয়া", translation: "আমি মহান আল্লাহর কাছে, মহান আরশের রবের কাছে প্রার্থনা করি তোমাকে সুস্থ করার জন্য।" },
      english: { title: "Dua for the Sick Person", category: "Healing Prayers", translation: "I ask Allah the Almighty, Lord of the Magnificent Throne, to cure you." },
      hindi: { title: "बीमार के लिए दुआ", category: "शिफ़ा की दुआ", translation: "मैं अल्लाह अज़ीम से, अर्शे अज़ीम के रब से दुआ करता हूँ कि वह तुझे शिफ़ा दे।" },
      urdu: { title: "بیمار کے لیے دعا", category: "شفا کی دعا", translation: "میں اللہ عظیم سے، عرش عظیم کے رب سے دعا کرتا ہوں کہ وہ تجھے شفا دے۔" },
    },
  },
  {
    id: 17,
    arabic: "اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي",
    transliteration: "Allahumma 'afini fi badani, Allahumma 'afini fi sam'i, Allahumma 'afini fi basari",
    translations: {
      bengali: { title: "শরীরের সুস্থতার দোয়া", category: "রোগমুক্তির দোয়া", translation: "হে আল্লাহ, আমার শরীরে আমাকে সুস্থতা দাও, হে আল্লাহ, আমার শ্রবণে সুস্থতা দাও, হে আল্লাহ, আমার দৃষ্টিতে সুস্থতা দাও।" },
      english: { title: "Dua for Body Health", category: "Healing Prayers", translation: "O Allah, grant me health in my body, O Allah, grant me health in my hearing, O Allah, grant me health in my sight." },
      hindi: { title: "जिस्म की सेहत की दुआ", category: "शिफ़ा की दुआ", translation: "हे अल्लाह, मेरे जिस्म में मुझे आफ़ियत दे, हे अल्लाह, मेरी सुनने की ताक़त में आफ़ियत दे, हे अल्लाह, मेरी आँखों में आफ़ियत दे।" },
      urdu: { title: "جسم کی صحت کی دعا", category: "شفا کی دعا", translation: "اے اللہ، میرے جسم میں مجھے عافیت دے، اے اللہ، میری سماعت میں عافیت دے، اے اللہ، میری بینائی میں عافیت دے۔" },
    },
  },

  // Protection Prayers
  {
    id: 18,
    arabic: "اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ",
    transliteration: "Allahu la ilaha illa huwal hayyul qayyum",
    translations: {
      bengali: { title: "আয়াতুল কুরসি", category: "সুরক্ষার দোয়া", translation: "আল্লাহ - তিনি ছাড়া কোনো উপাস্য নেই, তিনি চিরঞ্জীব, সবকিছুর ধারক।" },
      english: { title: "Ayatul Kursi", category: "Protection", translation: "Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence." },
      hindi: { title: "आयतुल कुर्सी", category: "हिफ़ाज़त की दुआ", translation: "अल्लाह - उसके सिवा कोई माबूद नहीं, वह हमेशा जीने वाला, सब का सहारा है।" },
      urdu: { title: "آیۃ الکرسی", category: "حفاظت کی دعا", translation: "اللہ - اس کے سوا کوئی معبود نہیں، وہ ہمیشہ زندہ رہنے والا، سب کا سہارا ہے۔" },
    },
  },
  {
    id: 19,
    arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ، اللَّهُ الصَّمَدُ، لَمْ يَلِدْ وَلَمْ يُولَدْ، وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ",
    transliteration: "Qul huwal-lahu ahad, Allahus-samad, lam yalid wa lam yulad, wa lam yakun lahu kufuwan ahad",
    translations: {
      bengali: { title: "সূরা ইখলাস", category: "সুরক্ষার দোয়া", translation: "বল, তিনি আল্লাহ, এক। আল্লাহ অমুখাপেক্ষী। তিনি কাউকে জন্ম দেননি এবং কেউ তাঁকে জন্ম দেয়নি। তাঁর সমতুল্য কেউ নেই।" },
      english: { title: "Surah Ikhlas", category: "Protection", translation: "Say, He is Allah, the One. Allah, the Eternal Refuge. He neither begets nor is born. Nor is there to Him any equivalent." },
      hindi: { title: "सूरह इख़लास", category: "हिफ़ाज़त की दुआ", translation: "कह, वह अल्लाह एक है। अल्लाह बेनियाज़ है। न उसने किसी को जन्म दिया न वह पैदा हुआ। और उसका कोई समकक्ष नहीं।" },
      urdu: { title: "سورہ اخلاص", category: "حفاظت کی دعا", translation: "کہہ، وہ اللہ ایک ہے۔ اللہ بے نیاز ہے۔ نہ اس نے کسی کو جنم دیا نہ وہ پیدا ہوا۔ اور اس کا کوئی ہم سر نہیں۔" },
    },
  },
  {
    id: 20,
    arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ، مِن شَرِّ مَا خَلَقَ",
    transliteration: "Qul a'udhu birabbil-falaq, min sharri ma khalaq",
    translations: {
      bengali: { title: "সূরা ফালাক", category: "সুরক্ষার দোয়া", translation: "বল, আমি আশ্রয় নিচ্ছি ভোরের রবের কাছে, তাঁর সৃষ্টির অনিষ্ট থেকে।" },
      english: { title: "Surah Falaq", category: "Protection", translation: "Say, I seek refuge in the Lord of daybreak, from the evil of that which He created." },
      hindi: { title: "सूरह फ़लक़", category: "हिफ़ाज़त की दुआ", translation: "कह, मैं सुबह के रब की पनाह लेता हूँ, उसकी मख़लूक़ के शर से।" },
      urdu: { title: "سورہ فلق", category: "حفاظت کی دعا", translation: "کہہ، میں صبح کے رب کی پناہ لیتا ہوں، اس کی مخلوق کے شر سے۔" },
    },
  },
  {
    id: 21,
    arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ، مَلِكِ النَّاسِ، إِلَٰهِ النَّاسِ",
    transliteration: "Qul a'udhu birabbin-nas, malikin-nas, ilahin-nas",
    translations: {
      bengali: { title: "সূরা নাস", category: "সুরক্ষার দোয়া", translation: "বল, আমি আশ্রয় নিচ্ছি মানুষের রবের কাছে, মানুষের বাদশাহের কাছে, মানুষের উপাস্যের কাছে।" },
      english: { title: "Surah Nas", category: "Protection", translation: "Say, I seek refuge in the Lord of mankind, the King of mankind, the God of mankind." },
      hindi: { title: "सूरह नास", category: "हिफ़ाज़त की दुआ", translation: "कह, मैं इंसानों के रब की पनाह लेता हूँ, इंसानों के बादशाह की, इंसानों के माबूद की।" },
      urdu: { title: "سورہ ناس", category: "حفاظت کی دعا", translation: "کہہ، میں انسانوں کے رب کی پناہ لیتا ہوں، انسانوں کے بادشاہ کی، انسانوں کے معبود کی۔" },
    },
  },

  // Sleep Related
  {
    id: 22,
    arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    transliteration: "Bismika Allahumma amutu wa ahya",
    translations: {
      bengali: { title: "ঘুমানোর আগে দোয়া", category: "ঘুমের দোয়া", translation: "হে আল্লাহ, তোমার নামে আমি মৃত্যুবরণ করি এবং জীবিত হই।" },
      english: { title: "Dua Before Sleeping", category: "Sleep", translation: "In Your name O Allah, I live and die." },
      hindi: { title: "सोने से पहले की दुआ", category: "नींद की दुआ", translation: "हे अल्लाह, तेरे नाम पर मैं मरता हूँ और जीता हूँ।" },
      urdu: { title: "سونے سے پہلے کی دعا", category: "نیند کی دعا", translation: "اے اللہ، تیرے نام پر میں مرتا ہوں اور جیتا ہوں۔" },
    },
  },
  {
    id: 23,
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    transliteration: "Alhamdu lillahil-ladhi ahyana ba'da ma amatana wa ilayhin-nushur",
    translations: {
      bengali: { title: "ঘুম থেকে জাগার দোয়া", category: "ঘুমের দোয়া", translation: "সমস্ত প্রশংসা আল্লাহর যিনি আমাদের মৃত্যুর পর জীবিত করেছেন এবং তাঁর কাছেই পুনরুত্থান।" },
      english: { title: "Dua Upon Waking", category: "Sleep", translation: "All praise is for Allah who gave us life after having taken it from us and unto Him is the resurrection." },
      hindi: { title: "जागने पर की दुआ", category: "नींद की दुआ", translation: "सारी तारीफ अल्लाह के लिए है जिसने हमें मौत के बाद ज़िंदा किया और उसी की तरफ़ लौटना है।" },
      urdu: { title: "جاگنے کی دعا", category: "نیند کی دعا", translation: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں موت کے بعد زندہ کیا اور اسی کی طرف لوٹنا ہے۔" },
    },
  },

  // Food Related
  {
    id: 24,
    arabic: "بِسْمِ اللَّهِ وَعَلَى بَرَكَةِ اللَّهِ",
    transliteration: "Bismillahi wa 'ala barakatillah",
    translations: {
      bengali: { title: "খাওয়ার আগে দোয়া", category: "খাবারের দোয়া", translation: "আল্লাহর নামে এবং আল্লাহর বরকতে।" },
      english: { title: "Dua Before Eating", category: "Food", translation: "In the name of Allah and with the blessings of Allah." },
      hindi: { title: "खाने से पहले की दुआ", category: "खाने की दुआ", translation: "अल्लाह के नाम पर और अल्लाह की बरकत से।" },
      urdu: { title: "کھانے سے پہلے کی دعا", category: "کھانے کی دعا", translation: "اللہ کے نام سے اور اللہ کی برکت سے۔" },
    },
  },
  {
    id: 25,
    arabic: "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ",
    transliteration: "Alhamdu lillahil-ladhi at'amana wa saqana wa ja'alana muslimin",
    translations: {
      bengali: { title: "খাওয়ার পরে দোয়া", category: "খাবারের দোয়া", translation: "সমস্ত প্রশংসা আল্লাহর যিনি আমাদের খাওয়ালেন, পান করালেন এবং মুসলিম বানালেন।" },
      english: { title: "Dua After Eating", category: "Food", translation: "All praise is for Allah who fed us, gave us drink and made us Muslims." },
      hindi: { title: "खाने के बाद की दुआ", category: "खाने की दुआ", translation: "सारी तारीफ अल्लाह के लिए है जिसने हमें खिलाया, पिलाया और मुसलमान बनाया।" },
      urdu: { title: "کھانے کے بعد کی دعا", category: "کھانے کی دعا", translation: "تمام تعریفیں اللہ کے لیے ہیں جس نے ہمیں کھلایا، پلایا اور مسلمان بنایا۔" },
    },
  },

  // Home Related
  {
    id: 26,
    arabic: "بِسْمِ اللَّهِ وَلَجْنَا، وَبِسْمِ اللَّهِ خَرَجْنَا، وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    transliteration: "Bismillahi walajna, wa bismillahi kharajna, wa 'ala Allahi rabbina tawakkalna",
    translations: {
      bengali: { title: "বাড়িতে প্রবেশের দোয়া", category: "বাড়ির দোয়া", translation: "আল্লাহর নামে আমরা প্রবেশ করি এবং আল্লাহর নামে বের হই, এবং আমাদের রবের উপর ভরসা করি।" },
      english: { title: "Dua When Entering Home", category: "Home", translation: "In the name of Allah we enter and in the name of Allah we leave, and upon our Lord we place our trust." },
      hindi: { title: "घर में दाखिल होने की दुआ", category: "घर की दुआ", translation: "अल्लाह के नाम से हम दाखिल होते हैं और अल्लाह के नाम से निकलते हैं, और अपने रब पर भरोसा करते हैं।" },
      urdu: { title: "گھر میں داخل ہونے کی دعا", category: "گھر کی دعا", translation: "اللہ کے نام سے ہم داخل ہوتے ہیں اور اللہ کے نام سے نکلتے ہیں، اور اپنے رب پر بھروسہ کرتے ہیں۔" },
    },
  },
  {
    id: 27,
    arabic: "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ، لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    transliteration: "Bismillahi tawakkaltu 'alallah, la hawla wa la quwwata illa billah",
    translations: {
      bengali: { title: "বাড়ি থেকে বের হওয়ার দোয়া", category: "বাড়ির দোয়া", translation: "আল্লাহর নামে, আমি আল্লাহর উপর ভরসা করি, আল্লাহ ছাড়া কোনো শক্তি ও ক্ষমতা নেই।" },
      english: { title: "Dua When Leaving Home", category: "Home", translation: "In the name of Allah, I place my trust in Allah, and there is no might nor power except with Allah." },
      hindi: { title: "घर से निकलने की दुआ", category: "घर की दुआ", translation: "अल्लाह के नाम पर, मैं अल्लाह पर भरोसा करता हूँ, अल्लाह के सिवा कोई ताकत और शक्ति नहीं।" },
      urdu: { title: "گھر سے نکلنے کی دعا", category: "گھر کی دعا", translation: "اللہ کے نام پر، میں اللہ پر بھروسہ کرتا ہوں، اللہ کے سوا کوئی طاقت اور قوت نہیں۔" },
    },
  },

  // Forgiveness
  {
    id: 28,
    arabic: "رَبَّنَا ظَلَمْنَا أَنفُسَنَا وَإِن لَّمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ",
    transliteration: "Rabbana zalamna anfusana wa illam taghfir lana wa tarhamna lanakunanna minal khasireen",
    translations: {
      bengali: { title: "ক্ষমা প্রার্থনার দোয়া", category: "ক্ষমার দোয়া", translation: "হে আমাদের রব, আমরা নিজেদের উপর জুলুম করেছি, যদি তুমি আমাদের ক্ষমা না কর এবং রহম না কর, তাহলে আমরা ক্ষতিগ্রস্তদের অন্তর্ভুক্ত হব।" },
      english: { title: "Seeking Forgiveness", category: "Forgiveness", translation: "Our Lord, we have wronged ourselves, and if You do not forgive us and have mercy upon us, we will surely be among the losers." },
      hindi: { title: "माफ़ी की दुआ", category: "माफ़ी की दुआ", translation: "हे हमारे रब, हमने अपने ऊपर ज़ुल्म किया, अगर तू हमें माफ़ न करे और रहम न करे, तो हम नुक़सान उठाने वालों में होंगे।" },
      urdu: { title: "معافی کی دعا", category: "معافی کی دعا", translation: "اے ہمارے رب، ہم نے اپنے اوپر ظلم کیا، اگر تو ہمیں معاف نہ کرے اور رحم نہ کرے، تو ہم نقصان اٹھانے والوں میں ہوں گے۔" },
    },
  },
  {
    id: 29,
    arabic: "أَسْتَغْفِرُ اللَّهَ الْعَظِيمَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ",
    transliteration: "Astaghfirullaha al-'Azima alladhi la ilaha illa huwal-Hayyul-Qayyumu wa atubu ilayh",
    translations: {
      bengali: { title: "সাইয়্যিদুল ইস্তিগফার", category: "ক্ষমার দোয়া", translation: "আমি মহান আল্লাহর কাছে ক্ষমা চাই যিনি ছাড়া কোনো উপাস্য নেই, যিনি চিরঞ্জীব, সবকিছুর ধারক এবং তাঁর কাছে তওবা করি।" },
      english: { title: "Master of Seeking Forgiveness", category: "Forgiveness", translation: "I seek forgiveness from Allah the Almighty, besides whom there is no deity, the Ever-Living, the Sustainer of existence, and I repent to Him." },
      hindi: { title: "सय्यिदुल इस्तिग़फ़ार", category: "माफ़ी की दुआ", translation: "मैं अल्लाह अज़ीम से माफ़ी माँगता हूँ जिसके सिवा कोई माबूद नहीं, जो हमेशा ज़िंदा है, सब का सहारा है और उसकी तरफ़ तौबा करता हूँ।" },
      urdu: { title: "سید الاستغفار", category: "معافی کی دعا", translation: "میں اللہ عظیم سے معافی مانگتا ہوں جس کے سوا کوئی معبود نہیں، جو ہمیشہ زندہ ہے، سب کا سہارا ہے اور اس کی طرف توبہ کرتا ہوں۔" },
    },
  },

  // Anxiety & Distress
  {
    id: 30,
    arabic: "لَا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ",
    transliteration: "La ilaha illa anta subhanaka inni kuntu minaz-zalimin",
    translations: {
      bengali: { title: "বিপদ থেকে মুক্তির দোয়া (ইউনুস আ.)", category: "বিপদের দোয়া", translation: "তুমি ছাড়া কোনো উপাস্য নেই, তুমি পবিত্র, নিশ্চয়ই আমি জালিমদের অন্তর্ভুক্ত ছিলাম।" },
      english: { title: "Dua of Prophet Yunus", category: "Distress", translation: "There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers." },
      hindi: { title: "यूनुस अलैहिस्सलाम की दुआ", category: "मुश्किल की दुआ", translation: "तेरे सिवा कोई माबूद नहीं, तू पाक है, बेशक मैं ज़ालिमों में से था।" },
      urdu: { title: "یونس علیہ السلام کی دعا", category: "مشکل کی دعا", translation: "تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ظالموں میں سے تھا۔" },
    },
  },
  {
    id: 31,
    arabic: "حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ",
    transliteration: "Hasbunallahu wa ni'mal-wakil",
    translations: {
      bengali: { title: "আল্লাহ যথেষ্ট", category: "বিপদের দোয়া", translation: "আল্লাহ আমাদের জন্য যথেষ্ট এবং তিনি কতই না উত্তম কর্মবিধায়ক।" },
      english: { title: "Allah is Sufficient", category: "Distress", translation: "Allah is sufficient for us and He is the best disposer of affairs." },
      hindi: { title: "अल्लाह काफ़ी है", category: "मुश्किल की दुआ", translation: "अल्लाह हमारे लिए काफ़ी है और वह कितना अच्छा कारसाज़ है।" },
      urdu: { title: "اللہ کافی ہے", category: "مشکل کی دعا", translation: "اللہ ہمارے لیے کافی ہے اور وہ کتنا اچھا کارساز ہے۔" },
    },
  },
  {
    id: 32,
    arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَأَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ",
    transliteration: "Allahumma inni a'udhu bika minal-hammi wal-hazan, wa a'udhu bika minal-'ajzi wal-kasal",
    translations: {
      bengali: { title: "চিন্তা ও দুশ্চিন্তা থেকে মুক্তি", category: "বিপদের দোয়া", translation: "হে আল্লাহ, আমি তোমার কাছে দুশ্চিন্তা ও বিষণ্ণতা থেকে আশ্রয় চাই এবং অক্ষমতা ও অলসতা থেকে আশ্রয় চাই।" },
      english: { title: "Relief from Worry and Grief", category: "Distress", translation: "O Allah, I seek refuge in You from worry and grief, and I seek refuge in You from incapacity and laziness." },
      hindi: { title: "चिंता और ग़म से छुटकारा", category: "मुश्किल की दुआ", translation: "हे अल्लाह, मैं तेरी पनाह लेता हूँ परेशानी और ग़म से, और मजबूरी और सुस्ती से।" },
      urdu: { title: "پریشانی اور غم سے چھٹکارا", category: "مشکل کی دعا", translation: "اے اللہ، میں تیری پناہ لیتا ہوں پریشانی اور غم سے، اور مجبوری اور سستی سے۔" },
    },
  },

  // Mosque Related
  {
    id: 33,
    arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    transliteration: "Allahummaf-tah li abwaba rahmatik",
    translations: {
      bengali: { title: "মসজিদে প্রবেশের দোয়া", category: "মসজিদের দোয়া", translation: "হে আল্লাহ, আমার জন্য তোমার রহমতের দরজাসমূহ খুলে দাও।" },
      english: { title: "Dua When Entering Mosque", category: "Mosque", translation: "O Allah, open for me the doors of Your mercy." },
      hindi: { title: "मस्जिद में दाखिल होने की दुआ", category: "मस्जिद की दुआ", translation: "हे अल्लाह, मेरे लिए अपनी रहमत के दरवाज़े खोल दे।" },
      urdu: { title: "مسجد میں داخل ہونے کی دعا", category: "مسجد کی دعا", translation: "اے اللہ، میرے لیے اپنی رحمت کے دروازے کھول دے۔" },
    },
  },
  {
    id: 34,
    arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    transliteration: "Allahumma inni as'aluka min fadlik",
    translations: {
      bengali: { title: "মসজিদ থেকে বের হওয়ার দোয়া", category: "মসজিদের দোয়া", translation: "হে আল্লাহ, আমি তোমার অনুগ্রহ প্রার্থনা করছি।" },
      english: { title: "Dua When Leaving Mosque", category: "Mosque", translation: "O Allah, I ask You from Your bounty." },
      hindi: { title: "मस्जिद से निकलने की दुआ", category: "मस्जिद की दुआ", translation: "हे अल्लाह, मैं तुझसे तेरे फ़ज़्ल की दुआ करता हूँ।" },
      urdu: { title: "مسجد سے نکلنے کی دعا", category: "مسجد کی دعا", translation: "اے اللہ، میں تجھ سے تیرے فضل کی دعا کرتا ہوں۔" },
    },
  },

  // Parents
  {
    id: 35,
    arabic: "رَّبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    transliteration: "Rabbir-hamhuma kama rabbayani saghira",
    translations: {
      bengali: { title: "পিতামাতার জন্য দোয়া", category: "পরিবারের দোয়া", translation: "হে আমার রব, তাদের প্রতি রহম কর যেমন তারা আমাকে ছোটবেলায় লালন-পালন করেছেন।" },
      english: { title: "Dua for Parents", category: "Family", translation: "My Lord, have mercy upon them as they brought me up when I was small." },
      hindi: { title: "माता-पिता के लिए दुआ", category: "परिवार की दुआ", translation: "हे मेरे रब, उन पर रहम कर जैसा उन्होंने मुझे बचपन में पाला।" },
      urdu: { title: "والدین کے لیے دعا", category: "خاندان کی دعا", translation: "اے میرے رب، ان پر رحم کر جیسا انہوں نے مجھے بچپن میں پالا۔" },
    },
  },
];

const DuaPage = () => {
  const navigate = useNavigate();
  const [language, setLanguage] = useState<Language>("bengali");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedDua, setSelectedDua] = useState<Dua | null>(null);

  const categories = [...new Set(duas.map((d) => d.translations[language].category))];

  const filteredDuas = duas.filter((dua) => {
    const translation = dua.translations[language];
    const matchesSearch =
      translation.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dua.transliteration.toLowerCase().includes(searchQuery.toLowerCase()) ||
      translation.translation.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || translation.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleBack = () => {
    if (selectedDua) {
      setSelectedDua(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else {
      navigate("/");
    }
  };

  const getTitle = () => {
    if (selectedDua) return selectedDua.translations[language].title;
    if (selectedCategory) return selectedCategory;
    return language === "bengali" ? "দোয়া সংকলন" : 
           language === "hindi" ? "दुआ संग्रह" : 
           language === "urdu" ? "دعا مجموعہ" : "Dua Collection";
  };

  return (
    <div className="min-h-screen bg-[hsl(158,64%,18%)]">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-gradient-to-b from-[hsl(158,55%,22%)] to-[hsl(158,55%,22%)]/95 backdrop-blur-lg border-b border-white/10"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[hsl(45,93%,58%)] to-[hsl(45,93%,48%)] flex items-center justify-center">
            <BookOpen className="w-4 h-4 text-[hsl(158,64%,15%)]" />
          </div>
          <h1 className="text-xl font-bold text-white">{getTitle()}</h1>
        </div>

        {/* Language Selector */}
        <div className="px-4 pb-3">
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {(Object.keys(LANGUAGE_LABELS) as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => {
                  setLanguage(lang);
                  setSelectedCategory(null);
                }}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  language === lang
                    ? "bg-gradient-to-r from-[hsl(45,93%,58%)] to-[hsl(45,93%,48%)] text-[hsl(158,64%,15%)] shadow-md"
                    : "bg-white/10 text-white/70 hover:bg-white/20"
                }`}
              >
                {LANGUAGE_LABELS[lang]}
              </button>
            ))}
          </div>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {selectedDua ? (
          // Dua Detail View
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-4 space-y-6"
          >
            <div className="text-center space-y-6 py-6">
              {/* Arabic Text Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative bg-gradient-to-br from-[hsl(158,55%,25%)] to-[hsl(158,64%,20%)] rounded-3xl p-6 border border-[hsl(45,93%,58%)]/20 shadow-lg overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[hsl(45,93%,58%)]/10 rounded-full blur-2xl" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[hsl(158,64%,30%)]/30 rounded-full blur-xl" />
                <div className="relative">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <Sparkles className="w-4 h-4 text-[hsl(45,93%,58%)]" />
                    <span className="text-xs font-medium text-[hsl(45,93%,58%)]">
                      {language === "bengali" ? "আরবি" : language === "hindi" ? "अरबी" : language === "urdu" ? "عربی" : "Arabic"}
                    </span>
                    <Sparkles className="w-4 h-4 text-[hsl(45,93%,58%)]" />
                  </div>
                  <p className="text-3xl md:text-4xl font-arabic leading-[2] text-white">
                    {selectedDua.arabic}
                  </p>
                </div>
              </motion.div>

              {/* Transliteration */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white/5 rounded-2xl p-4 border border-white/10"
              >
                <p className="text-xs font-medium text-[hsl(45,93%,58%)] mb-2">
                  {language === "bengali" ? "উচ্চারণ" : language === "hindi" ? "उच्चारण" : language === "urdu" ? "تلفظ" : "Transliteration"}
                </p>
                <p className="text-lg italic text-white/80">{selectedDua.transliteration}</p>
              </motion.div>

              {/* Translation */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-gradient-to-br from-[hsl(45,93%,58%)]/10 to-transparent rounded-2xl p-5 border border-[hsl(45,93%,58%)]/20"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Heart className="w-4 h-4 text-[hsl(45,93%,58%)]" />
                  <p className="text-xs font-medium text-[hsl(45,93%,58%)]">
                    {language === "bengali" ? "অনুবাদ" : language === "hindi" ? "अनुवाद" : language === "urdu" ? "ترجمہ" : "Translation"}
                  </p>
                </div>
                <p className="text-white text-lg md:text-xl leading-relaxed">
                  {selectedDua.translations[language].translation}
                </p>
              </motion.div>

              {/* Audio Player */}
              <DuaAudioPlayer 
                arabicText={selectedDua.arabic} 
                duaId={selectedDua.id} 
              />
            </div>
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
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/50" />
              <Input
                placeholder={language === "bengali" ? "দোয়া খুঁজুন..." : language === "hindi" ? "दुआ खोजें..." : language === "urdu" ? "دعا تلاش کریں..." : "Search duas..."}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl bg-white/10 border-white/10 text-white placeholder:text-white/50 focus:border-[hsl(45,93%,58%)]/50"
              />
            </div>

            {/* Categories */}
            {!selectedCategory && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 flex-wrap"
              >
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white/10 text-white/80 hover:bg-[hsl(45,93%,58%)]/20 hover:text-[hsl(45,93%,58%)] transition-all border border-transparent hover:border-[hsl(45,93%,58%)]/30"
                  >
                    {cat}
                  </button>
                ))}
              </motion.div>
            )}

            {/* Dua List */}
            <div className="space-y-3">
              {filteredDuas.map((dua, index) => (
                <motion.button
                  key={dua.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => setSelectedDua(dua)}
                  className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-[hsl(158,55%,25%)] to-[hsl(158,64%,20%)] border border-white/10 hover:border-[hsl(45,93%,58%)]/30 transition-all active:scale-[0.98] group"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-[hsl(45,93%,58%)]/20 flex items-center justify-center text-xs font-bold text-[hsl(45,93%,58%)]">
                          {dua.id}
                        </span>
                        <p className="font-semibold text-white">{dua.translations[language].title}</p>
                      </div>
                      <p className="text-sm text-white/60 line-clamp-1 font-arabic">
                        {dua.arabic}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-[hsl(45,93%,58%)] transition-colors" />
                  </div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DuaPage;
