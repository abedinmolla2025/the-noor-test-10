import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft, Trophy, Star, Medal, Crown, Zap, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { playSfx } from "@/utils/quizSfx";
import { StarBadge, TrophyBadge, MedalBadge, CrownBadge, SparklesBadge } from "@/components/BadgeIcons";
import Confetti from "react-confetti";

interface QuizQuestion {
  id: number;
  question: string;
  questionBn: string;
  options: string[];
  optionsBn: string[];
  correctAnswer: number;
  category: string;
  explanation: string;
  explanationBn: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  badges: number;
}

const allQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "How many times is the word 'Allah' mentioned in the Quran?",
    questionBn: "কুরআনে 'আল্লাহ' শব্দটি কতবার উল্লেখ করা হয়েছে?",
    options: ["2,698", "1,500", "3,000", "2,000"],
    optionsBn: ["২,৬৯৮", "১,৫০০", "৩,০০০", "২,০০০"],
    correctAnswer: 0,
    category: "Quran",
    explanation: "Classical scholars have counted the word 'Allah' appearing 2,698 times in the Quran.",
    explanationBn: "প্রাচীন আলেমদের হিসাব অনুযায়ী কুরআনে 'আল্লাহ' শব্দটি ২,৬৯৮ বার এসেছে।",
  },
  {
    id: 2,
    question: "What is the first pillar of Islam?",
    questionBn: "ইসলামের প্রথম স্তম্ভ কী?",
    options: ["Salah", "Shahada", "Zakat", "Sawm"],
    optionsBn: ["সালাত", "শাহাদা", "যাকাত", "সাওম"],
    correctAnswer: 1,
    category: "Pillars",
    explanation: "The Shahada (testimony of faith) is the foundation and first pillar of Islam.",
    explanationBn: "শাহাদাহ বা ঈমানের সাক্ষ্যই ইসলামের প্রথম ও মূল ভিত্তি।",
  },
  {
    id: 3,
    question: "In which month was the Quran revealed?",
    questionBn: "কুরআন কোন মাসে নাযিল হয়েছিল?",
    options: ["Shaban", "Rajab", "Ramadan", "Muharram"],
    optionsBn: ["শাবান", "রজব", "রমজান", "মুহররম"],
    correctAnswer: 2,
    category: "History",
    explanation: "The Quran was first revealed in the month of Ramadan on Laylat al-Qadr.",
    explanationBn: "কুরআনের অবতরণ রমজান মাসে শবে কদরে শুরু হয়েছিল।",
  },
  {
    id: 4,
    question: "How many surahs are in the Quran?",
    questionBn: "কুরআনে কতটি সূরা আছে?",
    options: ["100", "114", "120", "99"],
    optionsBn: ["১০০", "১১৪", "১২০", "৯৯"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "The Quran is divided into 114 surahs of varying lengths.",
    explanationBn: "কুরআনুল কারীমে মোট ১১৪টি সূরা রয়েছে, যেগুলোর দৈর্ঘ্য ভিন্ন ভিন্ন।",
  },
  {
    id: 5,
    question: "What is the longest surah in the Quran?",
    questionBn: "কুরআনের সবচেয়ে দীর্ঘ সূরা কোনটি?",
    options: ["Al-Imran", "An-Nisa", "Al-Baqarah", "Al-Maidah"],
    optionsBn: ["আল-ইমরান", "আন-নিসা", "আল-বাকারাহ", "আল-মায়িদাহ"],
    correctAnswer: 2,
    category: "Quran",
    explanation: "Surah Al-Baqarah is the longest surah, containing 286 verses.",
    explanationBn: "আল-বাকারাহ হলো কুরআনের সবচেয়ে দীর্ঘ সূরা, এতে ২৮৬টি আয়াত রয়েছে।",
  },
  {
    id: 6,
    question: "How many daily prayers are obligatory in Islam?",
    questionBn: "ইসলামে কতটি দৈনিক নামাজ ফরজ?",
    options: ["3", "4", "5", "6"],
    optionsBn: ["৩", "৪", "৫", "৬"],
    correctAnswer: 2,
    category: "Pillars",
    explanation: "Five daily prayers were made obligatory during the Night Journey (Isra and Mi'raj).",
    explanationBn: "ইসরা ও মেরাজের রাতে পাঁচ ওয়াক্ত নামাজ উম্মতের ওপর ফরজ করা হয়েছে।",
  },
  {
    id: 7,
    question: "Who was the first prophet in Islam?",
    questionBn: "ইসলামে প্রথম নবী কে ছিলেন?",
    options: ["Ibrahim (AS)", "Musa (AS)", "Adam (AS)", "Nuh (AS)"],
    optionsBn: ["ইব্রাহিম (আ.)", "মূসা (আ.)", "আদম (আ.)", "নূহ (আ.)"],
    correctAnswer: 2,
    category: "Prophets",
    explanation: "Prophet Adam (AS) is regarded as the first human and first prophet in Islam.",
    explanationBn: "আদম (আ.)-কে ইসলামে প্রথম মানুষ ও প্রথম নবী হিসেবে মানা হয়।",
  },
  {
    id: 8,
    question: "What is the direction Muslims face during prayer?",
    questionBn: "মুসলমানরা নামাজের সময় কোন দিকে মুখ করে?",
    options: ["Jerusalem", "Medina", "Makkah", "Damascus"],
    optionsBn: ["জেরুজালেম", "মদিনা", "মক্কা", "দামেস্ক"],
    correctAnswer: 2,
    category: "Prayer",
    explanation: "Muslims face the Ka'bah in Makkah, known as the Qibla, during prayer.",
    explanationBn: "মুসলমানরা নামাজে মক্কার কাবা ঘরের দিকে মুখ করে, যাকে কিবলা বলা হয়।",
  },
  {
    id: 9,
    question: "What is Zakat?",
    questionBn: "যাকাত কী?",
    options: ["Fasting", "Charity", "Pilgrimage", "Prayer"],
    optionsBn: ["রোজা", "দান", "হজ", "নামাজ"],
    correctAnswer: 1,
    category: "Pillars",
    explanation: "Zakat is the obligatory charity given from one's wealth to purify it and help the needy.",
    explanationBn: "যাকাত হলো সম্পদকে পবিত্র করার জন্য এবং দরিদ্রদের সহায়তায় বাধ্যতামূলক দান।",
  },
  {
    id: 10,
    question: "Which angel revealed the Quran to Prophet Muhammad (PBUH)?",
    questionBn: "কোন ফেরেশতা নবী মুহাম্মদ (সা.) এর কাছে কুরআন নাযিল করেছিলেন?",
    options: ["Mikail", "Israfil", "Jibreel", "Azrael"],
    optionsBn: ["মিকাইল", "ইস্রাফিল", "জিবরীল", "আজরাইল"],
    correctAnswer: 2,
    category: "Angels",
    explanation: "Angel Jibreel (Gabriel) was sent by Allah to reveal the Quran to the Prophet (PBUH).",
    explanationBn: "আল্লাহর পক্ষ থেকে জিবরীল (আ.) নবী (সা.)-এর নিকট কুরআন নাযিল করেন।",
  },
  {
    id: 11,
    question: "What is the night of power called?",
    questionBn: "শবে কদরকে কী বলা হয়?",
    options: ["Laylat al-Miraj", "Laylat al-Qadr", "Laylat al-Bara'at", "Laylat al-Isra"],
    optionsBn: ["লাইলাতুল মিরাজ", "লাইলাতুল কদর", "লাইলাতুল বরাত", "লাইলাতুল ইসরা"],
    correctAnswer: 1,
    category: "Special Days",
    explanation: "The Night of Power, Laylat al-Qadr, is better than a thousand months of worship.",
    explanationBn: "লাইলাতুল কদর এমন এক রাত যা এক হাজার মাসের ইবাদতের চেয়েও উত্তম।",
  },
  {
    id: 12,
    question: "How many names does Allah have?",
    questionBn: "আল্লাহর কতটি নাম আছে?",
    options: ["50", "99", "100", "75"],
    optionsBn: ["৫০", "৯৯", "১০০", "৭৫"],
    correctAnswer: 1,
    category: "Names of Allah",
    explanation: "Allah has 99 beautiful names (Asma ul-Husna) mentioned in the Sunnah.",
    explanationBn: "আল্লাহর ৯৯টি সুন্দর নাম আছে, যেগুলোকে আসমাউল হুসনা বলা হয়।",
  },
  {
    id: 13,
    question: "What is the shortest surah in the Quran?",
    questionBn: "কুরআনের সবচেয়ে ছোট সূরা কোনটি?",
    options: ["Al-Ikhlas", "Al-Kawthar", "An-Nasr", "Al-Asr"],
    optionsBn: ["আল-ইখলাস", "আল-কাওসার", "আন-নাসর", "আল-আসর"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "Surah Al-Kawthar is the shortest surah with only 3 verses.",
    explanationBn: "আল-কাওসার হলো কুরআনের সবচেয়ে ছোট সূরা, মাত্র ৩টি আয়াত আছে।",
  },
  {
    id: 14,
    question: "How many times should Muslims perform Hajj in their lifetime?",
    questionBn: "জীবনে কতবার হজ করা ফরজ?",
    options: ["Once", "Three times", "Five times", "Every year"],
    optionsBn: ["একবার", "তিনবার", "পাঁচবার", "প্রতি বছর"],
    correctAnswer: 0,
    category: "Pillars",
    explanation: "Hajj is obligatory once in a lifetime for those who are physically and financially able.",
    explanationBn: "যারা শারীরিক ও আর্থিকভাবে সক্ষম, তাদের জীবনে একবার হজ করা ফরজ।",
  },
  {
    id: 15,
    question: "Which prophet built the Ka'bah?",
    questionBn: "কোন নবী কাবা ঘর নির্মাণ করেছিলেন?",
    options: ["Musa (AS)", "Ibrahim (AS)", "Isa (AS)", "Muhammad (PBUH)"],
    optionsBn: ["মূসা (আ.)", "ইব্রাহিম (আ.)", "ঈসা (আ.)", "মুহাম্মদ (সা.)"],
    correctAnswer: 1,
    category: "Prophets",
    explanation: "Prophet Ibrahim (AS) and his son Ismail (AS) rebuilt the Ka'bah.",
    explanationBn: "নবী ইব্রাহিম (আ.) এবং তাঁর পুত্র ইসমাইল (আ.) কাবা ঘর পুনর্নির্মাণ করেছিলেন।",
  },
  {
    id: 16,
    question: "What was the name of Prophet Muhammad's (PBUH) mother?",
    questionBn: "নবী মুহাম্মদ (সা.) এর মায়ের নাম কী ছিল?",
    options: ["Khadijah", "Aminah", "Fatimah", "Aisha"],
    optionsBn: ["খাদিজা", "আমিনা", "ফাতিমা", "আয়েশা"],
    correctAnswer: 1,
    category: "History",
    explanation: "Prophet Muhammad's (PBUH) mother was Aminah bint Wahb.",
    explanationBn: "নবী মুহাম্মদ (সা.) এর মায়ের নাম ছিল আমিনা বিনতে ওয়াহাব।",
  },
  {
    id: 17,
    question: "How many prophets are mentioned by name in the Quran?",
    questionBn: "কুরআনে কতজন নবীর নাম উল্লেখ আছে?",
    options: ["25", "40", "124,000", "313"],
    optionsBn: ["২৫", "৪০", "১,২৪,০০০", "৩১৩"],
    correctAnswer: 0,
    category: "Prophets",
    explanation: "25 prophets are mentioned by name in the Quran, though there were many more.",
    explanationBn: "কুরআনে ২৫ জন নবীর নাম উল্লেখ আছে, যদিও আরও অনেক নবী ছিলেন।",
  },
  {
    id: 18,
    question: "What is the meaning of 'Islam'?",
    questionBn: "'ইসলাম' শব্দের অর্থ কী?",
    options: ["Peace", "Submission", "Faith", "Both A and B"],
    optionsBn: ["শান্তি", "আত্মসমর্পণ", "বিশ্বাস", "A এবং B উভয়"],
    correctAnswer: 3,
    category: "Basics",
    explanation: "Islam means both peace and submission to the will of Allah.",
    explanationBn: "ইসলাম মানে শান্তি এবং আল্লাহর ইচ্ছার কাছে আত্মসমর্পণ উভয়ই।",
  },
  {
    id: 19,
    question: "Which surah is known as the 'Heart of the Quran'?",
    questionBn: "কোন সূরাকে 'কুরআনের হৃদয়' বলা হয়?",
    options: ["Al-Fatiha", "Yasin", "Al-Mulk", "Ar-Rahman"],
    optionsBn: ["আল-ফাতিহা", "ইয়াসীন", "আল-মুলক", "আর-রাহমান"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "Surah Yasin is referred to as the heart of the Quran in hadith.",
    explanationBn: "হাদিসে সূরা ইয়াসীনকে কুরআনের হৃদয় বলে উল্লেখ করা হয়েছে।",
  },
  {
    id: 20,
    question: "How many years did Prophet Muhammad (PBUH) receive revelation?",
    questionBn: "নবী মুহাম্মদ (সা.) কত বছর ওহী পেয়েছিলেন?",
    options: ["10 years", "23 years", "40 years", "13 years"],
    optionsBn: ["১০ বছর", "২৩ বছর", "৪০ বছর", "১৩ বছর"],
    correctAnswer: 1,
    category: "History",
    explanation: "Prophet Muhammad (PBUH) received revelation for 23 years (13 in Makkah, 10 in Madinah).",
    explanationBn: "নবী মুহাম্মদ (সা.) ২৩ বছর ওহী পেয়েছিলেন (১৩ বছর মক্কায়, ১০ বছর মদিনায়)।",
  },
  {
    id: 21,
    question: "What is the Islamic holy book called?",
    questionBn: "ইসলামের পবিত্র গ্রন্থের নাম কী?",
    options: ["Torah", "Bible", "Quran", "Zabur"],
    optionsBn: ["তাওরাত", "ইঞ্জিল", "কুরআন", "যাবুর"],
    correctAnswer: 2,
    category: "Basics",
    explanation: "The Quran is the final holy book revealed to Prophet Muhammad (PBUH).",
    explanationBn: "কুরআন হলো নবী মুহাম্মদ (সা.)-এর উপর নাযিলকৃত সর্বশেষ পবিত্র গ্রন্থ।",
  },
  {
    id: 22,
    question: "In which year did the Hijrah (migration) to Madinah occur?",
    questionBn: "হিজরত (মদিনায় স্থানান্তর) কোন বছর হয়েছিল?",
    options: ["610 CE", "622 CE", "630 CE", "632 CE"],
    optionsBn: ["৬১০ খ্রিস্টাব্দ", "৬২২ খ্রিস্টাব্দ", "৬৩০ খ্রিস্টাব্দ", "৬৩২ খ্রিস্টাব্দ"],
    correctAnswer: 1,
    category: "History",
    explanation: "The Hijrah occurred in 622 CE and marks the beginning of the Islamic calendar.",
    explanationBn: "হিজরত ৬২২ খ্রিস্টাব্দে হয়েছিল এবং এটি ইসলামি ক্যালেন্ডারের শুরু চিহ্নিত করে।",
  },
  {
    id: 23,
    question: "How many rakats are in Fajr prayer?",
    questionBn: "ফজরের নামাজে কত রাকাত আছে?",
    options: ["2 rakats", "4 rakats", "3 rakats", "5 rakats"],
    optionsBn: ["২ রাকাত", "৪ রাকাত", "৩ রাকাত", "৫ রাকাত"],
    correctAnswer: 0,
    category: "Prayer",
    explanation: "Fajr prayer consists of 2 obligatory rakats.",
    explanationBn: "ফজরের নামাজে ২ রাকাত ফরজ আছে।",
  },
  {
    id: 24,
    question: "What is the Arabic term for the call to prayer?",
    questionBn: "নামাজের আহ্বানের আরবি শব্দ কী?",
    options: ["Iqamah", "Adhan", "Takbir", "Tasbih"],
    optionsBn: ["ইকামাহ", "আযান", "তাকবীর", "তাসবীহ"],
    correctAnswer: 1,
    category: "Prayer",
    explanation: "Adhan is the Islamic call to prayer recited five times a day.",
    explanationBn: "আযান হলো ইসলামি নামাজের আহ্বান যা দিনে পাঁচবার পাঠ করা হয়।",
  },
  {
    id: 25,
    question: "Which prophet could speak to animals?",
    questionBn: "কোন নবী পশুদের সাথে কথা বলতে পারতেন?",
    options: ["Dawud (AS)", "Sulaiman (AS)", "Musa (AS)", "Yunus (AS)"],
    optionsBn: ["দাউদ (আ.)", "সুলাইমান (আ.)", "মূসা (আ.)", "ইউনুস (আ.)"],
    correctAnswer: 1,
    category: "Prophets",
    explanation: "Prophet Sulaiman (AS) was given the ability to understand and speak to animals.",
    explanationBn: "নবী সুলাইমান (আ.)-কে পশুদের ভাষা বুঝার ও তাদের সাথে কথা বলার ক্ষমতা দেওয়া হয়েছিল।",
  },
  {
    id: 26,
    question: "What is the first revelation received by Prophet Muhammad (PBUH)?",
    questionBn: "নবী মুহাম্মদ (সা.) প্রথম কোন আয়াত পেয়েছিলেন?",
    options: ["Surah Al-Fatiha", "Surah Al-Alaq (Read)", "Surah An-Nas", "Surah Al-Baqarah"],
    optionsBn: ["সূরা আল-ফাতিহা", "সূরা আল-আলাক (পড়ুন)", "সূরা আন-নাস", "সূরা আল-বাকারাহ"],
    correctAnswer: 1,
    category: "History",
    explanation: "The first revelation was 'Iqra' (Read) from Surah Al-Alaq.",
    explanationBn: "প্রথম ওহী ছিল সূরা আল-আলাক থেকে 'ইকরা' (পড়ুন)।",
  },
  {
    id: 27,
    question: "How many months are in the Islamic calendar?",
    questionBn: "ইসলামি ক্যালেন্ডারে কতটি মাস আছে?",
    options: ["10", "11", "12", "13"],
    optionsBn: ["১০", "১১", "১২", "১৩"],
    correctAnswer: 2,
    category: "Basics",
    explanation: "The Islamic calendar has 12 lunar months.",
    explanationBn: "ইসলামি ক্যালেন্ডারে ১২টি চান্দ্র মাস আছে।",
  },
  {
    id: 28,
    question: "What is the Arabic word for charity?",
    questionBn: "দানের আরবি শব্দ কী?",
    options: ["Salah", "Sadaqah", "Sawm", "Siyam"],
    optionsBn: ["সালাহ", "সাদাকাহ", "সাওম", "সিয়াম"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "Sadaqah refers to voluntary charity in Islam.",
    explanationBn: "সাদাকাহ মানে ইসলামে স্বেচ্ছায় দান করা।",
  },
  {
    id: 29,
    question: "Which battle is known as the first major battle in Islam?",
    questionBn: "ইসলামের প্রথম বড় যুদ্ধ কোনটি?",
    options: ["Battle of Uhud", "Battle of Badr", "Battle of Khandaq", "Battle of Tabuk"],
    optionsBn: ["উহুদ যুদ্ধ", "বদর যুদ্ধ", "খন্দক যুদ্ধ", "তাবুক যুদ্ধ"],
    correctAnswer: 1,
    category: "History",
    explanation: "The Battle of Badr was the first major battle fought by Muslims.",
    explanationBn: "বদর যুদ্ধ ছিল মুসলমানদের প্রথম বড় যুদ্ধ।",
  },
  {
    id: 30,
    question: "What does 'Ramadan' mean?",
    questionBn: "'রমজান' শব্দের অর্থ কী?",
    options: ["Fasting", "Scorching heat", "Prayer", "Charity"],
    optionsBn: ["রোজা", "প্রচণ্ড উত্তাপ", "নামাজ", "দান"],
    correctAnswer: 1,
    category: "Special Days",
    explanation: "Ramadan comes from the Arabic root meaning scorching heat or dryness.",
    explanationBn: "রমজান আরবি মূল থেকে এসেছে যার অর্থ প্রচণ্ড উত্তাপ বা শুষ্কতা।",
  },
  {
    id: 31,
    question: "How many articles of faith (Iman) are there in Islam?",
    questionBn: "ইসলামে ঈমানের কতটি রুকন আছে?",
    options: ["5", "6", "7", "10"],
    optionsBn: ["৫", "৬", "৭", "১০"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "There are 6 articles of faith: belief in Allah, angels, books, prophets, Day of Judgment, and divine decree.",
    explanationBn: "ঈমানের ৬টি রুকন আছে: আল্লাহ, ফেরেশতা, কিতাব, নবী, আখিরাত এবং তাকদিরে বিশ্বাস।",
  },
  {
    id: 32,
    question: "Which surah is recited in every rakat of prayer?",
    questionBn: "কোন সূরা প্রতিটি রাকাতে পড়া হয়?",
    options: ["Al-Ikhlas", "Al-Fatiha", "Al-Falaq", "An-Nas"],
    optionsBn: ["আল-ইখলাস", "আল-ফাতিহা", "আল-ফালাক", "আন-নাস"],
    correctAnswer: 1,
    category: "Prayer",
    explanation: "Surah Al-Fatiha must be recited in every rakat of prayer.",
    explanationBn: "সূরা আল-ফাতিহা প্রতিটি রাকাতে পড়া আবশ্যক।",
  },
  {
    id: 33,
    question: "Who was the first Muezzin (caller to prayer) in Islam?",
    questionBn: "ইসলামে প্রথম মুয়াজ্জিন কে ছিলেন?",
    options: ["Umar ibn al-Khattab", "Bilal ibn Rabah", "Ali ibn Abi Talib", "Abu Bakr"],
    optionsBn: ["উমর ইবনে খাত্তাব", "বিলাল ইবনে রাবাহ", "আলী ইবনে আবি তালিব", "আবু বকর"],
    correctAnswer: 1,
    category: "History",
    explanation: "Bilal ibn Rabah was chosen as the first Muezzin by Prophet Muhammad (PBUH).",
    explanationBn: "বিলাল ইবনে রাবাহকে নবী মুহাম্মদ (সা.) প্রথম মুয়াজ্জিন হিসেবে নির্বাচন করেছিলেন।",
  },
  {
    id: 34,
    question: "What is the Islamic term for pilgrimage to Makkah?",
    questionBn: "মক্কায় তীর্থযাত্রার ইসলামি শব্দ কী?",
    options: ["Umrah", "Hajj", "Tawaf", "Salah"],
    optionsBn: ["উমরাহ", "হজ", "তাওয়াফ", "সালাহ"],
    correctAnswer: 1,
    category: "Pillars",
    explanation: "Hajj is the annual Islamic pilgrimage to Makkah, a mandatory religious duty.",
    explanationBn: "হজ হলো মক্কায় বার্ষিক ইসলামি তীর্থযাত্রা, যা একটি বাধ্যতামূলক ধর্মীয় কর্তব্য।",
  },
  {
    id: 35,
    question: "Which prophet was swallowed by a whale?",
    questionBn: "কোন নবীকে তিমি গিলে ফেলেছিল?",
    options: ["Musa (AS)", "Yunus (AS)", "Nuh (AS)", "Yusuf (AS)"],
    optionsBn: ["মূসা (আ.)", "ইউনুস (আ.)", "নূহ (আ.)", "ইউসুফ (আ.)"],
    correctAnswer: 1,
    category: "Prophets",
    explanation: "Prophet Yunus (Jonah) was swallowed by a whale as mentioned in the Quran.",
    explanationBn: "কুরআনে উল্লেখ অনুযায়ী নবী ইউনুস (আ.)-কে একটি তিমি গিলে ফেলেছিল।",
  },
  {
    id: 36,
    question: "What percentage of wealth is paid as Zakat?",
    questionBn: "সম্পদের কত শতাংশ যাকাত দিতে হয়?",
    options: ["1.5%", "2.5%", "5%", "10%"],
    optionsBn: ["১.৫%", "২.৫%", "৫%", "১০%"],
    correctAnswer: 1,
    category: "Pillars",
    explanation: "2.5% of savings held for a year must be given as Zakat.",
    explanationBn: "এক বছর ধরে রাখা সঞ্চয়ের ২.৫% যাকাত হিসেবে দিতে হয়।",
  },
  {
    id: 37,
    question: "Which Islamic month comes before Ramadan?",
    questionBn: "রমজানের আগে কোন ইসলামি মাস আসে?",
    options: ["Rajab", "Shaban", "Shawwal", "Muharram"],
    optionsBn: ["রজব", "শাবান", "শাওয়াল", "মুহররম"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "Shaban is the month that comes immediately before Ramadan.",
    explanationBn: "শাবান হলো সেই মাস যা রমজানের ঠিক আগে আসে।",
  },
  {
    id: 38,
    question: "What does 'SubhanAllah' mean?",
    questionBn: "'সুবহানাল্লাহ' এর অর্থ কী?",
    options: ["Praise be to Allah", "Glory be to Allah", "Allah is Great", "There is no god but Allah"],
    optionsBn: ["আল্লাহর প্রশংসা", "আল্লাহ পবিত্র", "আল্লাহ মহান", "আল্লাহ ছাড়া কোন উপাস্য নেই"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "SubhanAllah means 'Glory be to Allah' or 'Allah is perfect and free from all imperfections'.",
    explanationBn: "সুবহানাল্লাহ মানে 'আল্লাহ পবিত্র' বা 'আল্লাহ সকল দোষ থেকে মুক্ত'।",
  },
  {
    id: 39,
    question: "In which city was Prophet Muhammad (PBUH) born?",
    questionBn: "নবী মুহাম্মদ (সা.) কোন শহরে জন্মগ্রহণ করেছিলেন?",
    options: ["Madinah", "Makkah", "Taif", "Jerusalem"],
    optionsBn: ["মদিনা", "মক্কা", "তায়েফ", "জেরুজালেম"],
    correctAnswer: 1,
    category: "History",
    explanation: "Prophet Muhammad (PBUH) was born in Makkah in 570 CE.",
    explanationBn: "নবী মুহাম্মদ (সা.) ৫৭০ খ্রিস্টাব্দে মক্কায় জন্মগ্রহণ করেছিলেন।",
  },
  {
    id: 40,
    question: "Which day of the week is most blessed in Islam?",
    questionBn: "সপ্তাহের কোন দিন ইসলামে সবচেয়ে বরকতময়?",
    options: ["Monday", "Friday", "Saturday", "Sunday"],
    optionsBn: ["সোমবার", "শুক্রবার", "শনিবার", "রবিবার"],
    correctAnswer: 1,
    category: "Special Days",
    explanation: "Friday (Jumu'ah) is considered the most blessed day of the week in Islam.",
    explanationBn: "শুক্রবার (জুমআ) ইসলামে সপ্তাহের সবচেয়ে বরকতময় দিন হিসেবে বিবেচিত।",
  },
];

const mockLeaderboard: LeaderboardEntry[] = [
  { rank: 1, name: "আহমেদ", points: 2450, badges: 12 },
  { rank: 2, name: "ফাতিমা", points: 2320, badges: 11 },
  { rank: 3, name: "মুহাম্মদ", points: 2180, badges: 10 },
  { rank: 4, name: "আয়েশা", points: 1950, badges: 9 },
  { rank: 5, name: "ইব্রাহিম", points: 1820, badges: 8 },
  { rank: 6, name: "খাদিজা", points: 1700, badges: 7 },
  { rank: 7, name: "উমর", points: 1580, badges: 6 },
  { rank: 8, name: "মারিয়াম", points: 1450, badges: 5 },
];

const badges = [
  { id: 1, name: "First Steps", nameBn: "প্রথম পদক্ষেপ", BadgeIcon: StarBadge, color: "text-yellow-500", bgGradient: "from-yellow-500/20 to-amber-500/20", requirement: 10 },
  { id: 2, name: "Quiz Master", nameBn: "কুইজ মাস্টার", BadgeIcon: TrophyBadge, color: "text-amber-500", bgGradient: "from-amber-500/20 to-orange-500/20", requirement: 50 },
  { id: 3, name: "Knowledge Seeker", nameBn: "জ্ঞানী", BadgeIcon: MedalBadge, color: "text-blue-500", bgGradient: "from-blue-500/20 to-cyan-500/20", requirement: 100 },
  { id: 4, name: "Champion", nameBn: "চ্যাম্পিয়ন", BadgeIcon: CrownBadge, color: "text-purple-500", bgGradient: "from-purple-500/20 to-pink-500/20", requirement: 200 },
  { id: 5, name: "Quran Expert", nameBn: "কুরআন বিশেষজ্ঞ", BadgeIcon: SparklesBadge, color: "text-emerald-500", bgGradient: "from-emerald-500/20 to-teal-500/20", requirement: 300 },
];

type LanguageMode = "en" | "bn" | "mixed";

const QuizPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"quiz" | "leaderboard" | "badges">("quiz");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<QuizQuestion[]>([]);
  const [totalPoints, setTotalPoints] = useState(() => {
    const saved = localStorage.getItem("quizPoints");
    return saved ? parseInt(saved) : 0;
  });
  const [streak, setStreak] = useState(() => {
    const saved = localStorage.getItem("quizStreak");
    return saved ? parseInt(saved) : 0;
  });
  const [lastPlayedDate, setLastPlayedDate] = useState(() => {
    return localStorage.getItem("lastQuizDate") || "";
  });
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem("quizLanguageMode") as LanguageMode | null;
    return saved ?? "mixed";
  });
  const [currentDate, setCurrentDate] = useState(() => new Date().toDateString());

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("quizLanguageMode", languageMode);
  }, [languageMode]);

  // Keep track of the current calendar day so that daily quiz
  // can auto-refresh even if the page stays open past midnight
  useEffect(() => {
    const interval = setInterval(() => {
      const nextDate = new Date().toDateString();
      setCurrentDate(prev => (prev === nextDate ? prev : nextDate));
    }, 60_000); // check every minute

    return () => clearInterval(interval);
  }, []);

  const today = currentDate;
  const hasPlayedToday = lastPlayedDate === today;

  useEffect(() => {
    // Get 3 deterministic questions for the current day based on date seed
    const dateSeed = currentDate;
    const shuffled = [...allQuestions].sort(() => {
      const hash = dateSeed.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
      return Math.sin(hash) - 0.5;
    });
    setDailyQuestions(shuffled.slice(0, 3));
  }, [currentDate]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    
    const isCorrect = selectedAnswer === dailyQuestions[currentQuestionIndex].correctAnswer;
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSfx("correct");
    } else {
      playSfx("wrong");
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < dailyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      const earnedPoints = score * 10 + (score === 3 ? 20 : 0);
      const newTotal = totalPoints + earnedPoints;
      setTotalPoints(newTotal);
      localStorage.setItem("quizPoints", newTotal.toString());
      localStorage.setItem("lastQuizDate", today);
      
      // Update streak
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      if (lastPlayedDate === yesterday.toDateString()) {
        const newStreak = streak + 1;
        setStreak(newStreak);
        localStorage.setItem("quizStreak", newStreak.toString());
      } else if (lastPlayedDate !== today) {
        setStreak(1);
        localStorage.setItem("quizStreak", "1");
      }
      
      setLastPlayedDate(today);
      setQuizCompleted(true);
      playSfx("result");
      
      // Show confetti for perfect score
      if (score === 3) {
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  const currentQuestion = dailyQuestions[currentQuestionIndex];
  const earnedBadges = badges.filter(b => totalPoints >= b.requirement);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-amber-500 bg-clip-text text-transparent">
            Daily Quiz
          </h1>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{totalPoints}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-4 pb-2">
          {[
            { id: "quiz", label: "Quiz", icon: Sparkles },
            { id: "leaderboard", label: "Leaderboard", icon: Trophy },
            { id: "badges", label: "Badges", icon: Medal },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted/50 hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Language Toggle (Quiz only) */}
        {activeTab === "quiz" && (
          <div className="flex items-center justify-between px-4 pb-3 text-xs">
            <span className="text-muted-foreground">Question language</span>
            <div className="inline-flex rounded-full bg-muted/60 p-1">
              {(
                [
                  { id: "en", label: "English" },
                  { id: "bn", label: "বাংলা" },
                  { id: "mixed", label: "Mixed" },
                ] as { id: LanguageMode; label: string }[]
              ).map((mode) => (
                <button
                  key={mode.id}
                  onClick={() => setLanguageMode(mode.id)}
                  className={`px-3 py-1 rounded-full transition-all ${
                    languageMode === mode.id
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <AnimatePresence mode="wait">
          {/* Quiz Tab */}
          {activeTab === "quiz" && (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              {/* Stats Card */}
              <Card className="mb-4 bg-gradient-to-r from-primary/10 to-amber-500/10 border-primary/20">
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-primary">{streak}</p>
                      <p className="text-xs text-muted-foreground">Day streak 🔥</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500">{earnedBadges.length}</p>
                      <p className="text-xs text-muted-foreground">Badges earned</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-500">{totalPoints}</p>
                      <p className="text-xs text-muted-foreground">Total points</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {hasPlayedToday && !quizCompleted ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">Today's quiz completed!</h2>
                    <p className="text-muted-foreground">Come back tomorrow for new questions.</p>
                    <div className="mt-4 p-4 bg-primary/10 rounded-xl">
                      <p className="text-sm">Next quiz:</p>
                      <p className="text-lg font-bold text-primary">Tomorrow 12:00 AM</p>
                    </div>
                  </CardContent>
                </Card>
              ) : quizCompleted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  {score === 3 && showConfetti && (
                    <Confetti
                      width={windowSize.width}
                      height={windowSize.height}
                      recycle={false}
                      numberOfPieces={500}
                      gravity={0.3}
                    />
                  )}
                  <Card className={`text-center py-8 relative overflow-hidden ${
                    score === 3 
                      ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-2 border-amber-500/50" 
                      : "bg-gradient-to-br from-primary/10 to-amber-500/10"
                  }`}>
                    {score === 3 && (
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 animate-pulse" />
                    )}
                    <CardContent className="relative z-10">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        {score === 3 ? (
                          <motion.div
                            animate={{
                              rotate: [0, -5, 5, -5, 0],
                              scale: [1, 1.1, 1.1, 1.1, 1],
                            }}
                            transition={{ duration: 0.8, repeat: 2, delay: 0.3 }}
                          >
                            <Crown className="w-24 h-24 mx-auto text-amber-500 mb-4 drop-shadow-2xl" />
                          </motion.div>
                        ) : score >= 2 ? (
                          <Trophy className="w-20 h-20 mx-auto text-primary mb-4" />
                        ) : (
                          <Star className="w-20 h-20 mx-auto text-blue-500 mb-4" />
                        )}
                      </motion.div>
                      
                      <h2 className="text-2xl font-bold mb-2">
                        {score === 3
                          ? "🎉 PERFECT SCORE! 🎉"
                          : score >= 2
                          ? "Great job! 👏"
                          : "Good effort! 💪"}
                      </h2>
                      
                      {score === 3 && (
                        <p className="text-lg text-amber-600 dark:text-amber-400 font-semibold mb-2 animate-pulse">
                          ⭐ You're a Quiz Champion! ⭐
                        </p>
                      )}
                      
                      <p className="text-4xl font-bold text-primary my-4">{score}/3</p>
                      
                      <div className="bg-background/50 rounded-xl p-4 mb-4 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">Points earned</p>
                          <p className="text-2xl font-bold text-emerald-500">
                            +{score * 10 + (score === 3 ? 20 : 0)}
                          </p>
                          {score === 3 && (
                            <Badge className="mt-2 bg-amber-500">Perfect bonus +20</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-primary/5 p-3">
                            <p className="text-xs text-muted-foreground">Today streak</p>
                            <p className="text-lg font-semibold text-primary">{streak} days</p>
                          </div>
                          <div className="rounded-lg bg-emerald-500/5 p-3">
                            <p className="text-xs text-muted-foreground">Total points</p>
                            <p className="text-lg font-semibold text-emerald-500">{totalPoints}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-2">Come back tomorrow for new questions!</p>
                      <p className="text-xs text-muted-foreground">
                        Learn slowly, a little improvement every day becomes a big change.
                      </p>
                    </CardContent>
                  </Card>
                </motion.div>
              ) : currentQuestion ? (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                >
                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Question {currentQuestionIndex + 1}/3</span>
                      <span>Score: {score}</span>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / 3) * 100} className="h-2" />
                  </div>

                  <Card className="mb-3">
                    <CardHeader>
                      <Badge className="w-fit mb-2">{currentQuestion.category}</Badge>
                      <CardTitle className="text-lg leading-relaxed">
                        {languageMode === "bn"
                          ? currentQuestion.questionBn
                          : currentQuestion.question}
                      </CardTitle>
                      {languageMode === "mixed" && (
                        <p className="text-sm text-muted-foreground mt-1">
                          {currentQuestion.questionBn}
                        </p>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                        <motion.button
                          key={index}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showResult}
                          className={`w-full p-4 rounded-xl text-left transition-all border-2 ${
                            showResult
                              ? index === currentQuestion.correctAnswer
                                ? "bg-emerald-500/20 border-emerald-500 text-emerald-700 dark:text-emerald-300"
                                : selectedAnswer === index
                                ? "bg-red-500/20 border-red-500 text-red-700 dark:text-red-300"
                                : "bg-muted/30 border-transparent"
                              : selectedAnswer === index
                              ? "bg-primary/20 border-primary"
                              : "bg-muted/50 border-transparent hover:bg-muted"
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">
                                {languageMode === "bn"
                                  ? currentQuestion.optionsBn?.[index] ?? option
                                  : option}
                              </p>
                              {languageMode === "mixed" && currentQuestion.optionsBn?.[index] && (
                                <p className="text-sm text-muted-foreground mt-0.5">
                                  {currentQuestion.optionsBn[index]}
                                </p>
                              )}
                            </div>
                            {showResult && index === currentQuestion.correctAnswer && (
                              <CheckCircle2 className="w-6 h-6 text-emerald-500" />
                            )}
                            {showResult && selectedAnswer === index && index !== currentQuestion.correctAnswer && (
                              <XCircle className="w-6 h-6 text-red-500" />
                            )}
                          </div>
                        </motion.button>
                      ))}
                    </CardContent>
                  </Card>

                {showResult && currentQuestion && (
                  <div className="mb-4">
                    <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm">
                      <p className="font-semibold flex items-center gap-2 mb-1">
                        <Sparkles className="w-4 h-4 text-emerald-500" />
                        Correct answer explanation
                      </p>
                      <p className="text-muted-foreground text-[13px]">
                        {languageMode === "bn" || languageMode === "mixed"
                          ? currentQuestion.explanationBn
                          : currentQuestion.explanation}
                      </p>
                      {languageMode === "mixed" && (
                        <p className="mt-1 text-[11px] text-muted-foreground/80">
                          {currentQuestion.explanation}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                  {!showResult ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="w-full h-12 text-lg"
                    >
                      Submit answer
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-amber-500"
                    >
                      {currentQuestionIndex < 2 ? "Next question" : "View result"}
                    </Button>
                  )}
                </motion.div>
              ) : null}
            </motion.div>
          )}

          {/* Leaderboard Tab */}
          {activeTab === "leaderboard" && (
            <motion.div
              key="leaderboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
                <Card className="mb-4 bg-gradient-to-r from-amber-500/20 to-primary/20 border-amber-500/30">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Your rank</p>
                        <p className="text-3xl font-bold">#9</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Your points</p>
                        <p className="text-3xl font-bold text-primary">{totalPoints}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

              <div className="space-y-3">
                {mockLeaderboard.map((entry, index) => (
                  <motion.div
                    key={entry.rank}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <Card className={`${
                      entry.rank <= 3 
                        ? "bg-gradient-to-r from-amber-500/10 to-transparent border-amber-500/30" 
                        : ""
                    }`}>
                      <CardContent className="p-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                          entry.rank === 1 
                            ? "bg-amber-500 text-white" 
                            : entry.rank === 2 
                            ? "bg-gray-400 text-white"
                            : entry.rank === 3
                            ? "bg-amber-700 text-white"
                            : "bg-muted"
                        }`}>
                          {entry.rank <= 3 ? (
                            entry.rank === 1 ? <Crown className="w-5 h-5" /> :
                            entry.rank === 2 ? <Medal className="w-5 h-5" /> :
                            <Medal className="w-5 h-5" />
                          ) : entry.rank}
                        </div>
                        <div className="flex-1">
                          <p className="font-semibold">{entry.name}</p>
                          <p className="text-xs text-muted-foreground">{entry.badges} badges</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-primary">{entry.points}</p>
                          <p className="text-xs text-muted-foreground">পয়েন্ট</p>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Badges Tab */}
          {activeTab === "badges" && (
            <motion.div
              key="badges"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
            >
              <Card className="mb-4 bg-gradient-to-br from-primary/5 to-amber-500/5">
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">Badges collected</p>
                  <p className="text-5xl font-bold text-primary mb-1">{earnedBadges.length}/{badges.length}</p>
                  <Progress value={(earnedBadges.length / badges.length) * 100} className="h-2" />
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 gap-4">
                {badges.map((badge, index) => {
                  const isEarned = totalPoints >= badge.requirement;
                  const isNext = !isEarned && (index === 0 || totalPoints >= badges[index - 1].requirement);
                  const pointsNeeded = badge.requirement - totalPoints;
                  const progress = isEarned ? 100 : Math.min(100, (totalPoints / badge.requirement) * 100);

                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`relative overflow-hidden transition-all ${
                        isEarned 
                          ? `bg-gradient-to-br ${badge.bgGradient} border-2 border-primary/30 shadow-lg` 
                          : isNext
                          ? "bg-muted/30 border-2 border-dashed border-primary/20"
                          : "bg-muted/10 opacity-60"
                      }`}>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            {/* Badge Icon */}
                            <div className={`relative ${
                              isEarned 
                                ? `bg-gradient-to-br ${badge.bgGradient}` 
                                : "bg-muted/50"
                            } rounded-2xl p-3 shrink-0`}>
                              {!isEarned && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px] rounded-2xl z-10">
                                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                </div>
                              )}
                              <badge.BadgeIcon className="w-16 h-16" />
                            </div>

                            {/* Badge Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <h3 className="font-bold text-base">{badge.name}</h3>
                                {isEarned && (
                                  <Badge className="bg-emerald-500 text-white shrink-0">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Unlocked
                                  </Badge>
                                )}
                                {isNext && !isEarned && (
                                  <Badge variant="outline" className="shrink-0">Next</Badge>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">{badge.nameBn}</p>
                              
                              {/* Progress Bar */}
                              {!isEarned && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{totalPoints} points</span>
                                    <span>{badge.requirement} needed</span>
                                  </div>
                                  <Progress value={progress} className="h-1.5" />
                                  {isNext && (
                                    <p className="text-xs text-primary font-medium">
                                      {pointsNeeded} points to unlock
                                    </p>
                                  )}
                                </div>
                              )}
                              {isEarned && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                                  Unlocked at {badge.requirement} points ✓
                                </p>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default QuizPage;
