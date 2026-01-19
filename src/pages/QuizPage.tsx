import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft, Trophy, Star, Medal, Crown, Zap, CheckCircle2, XCircle, Sparkles, Target, TrendingUp, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { playSfx } from "@/utils/quizSfx";
import { StarBadge, TrophyBadge, MedalBadge, CrownBadge, SparklesBadge } from "@/components/BadgeIcons";
import Confetti from "react-confetti";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useCountdownToMidnight } from "@/hooks/useCountdownToMidnight";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
  category: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  badges: number;
}

const allQuestions: Question[] = [
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
  {
    id: 41,
    question: "What is the first month of the Islamic calendar?",
    questionBn: "ইসলামিক ক্যালেন্ডারের প্রথম মাস কোনটি?",
    options: ["Ramadan", "Muharram", "Rajab", "Shawwal"],
    optionsBn: ["রমজান", "মুহররম", "রজব", "শাওয়াল"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "Muharram is the first month of the Islamic lunar calendar.",
    explanationBn: "মুহররম হলো ইসলামি চন্দ্র ক্যালেন্ডারের প্রথম মাস।",
  },
  {
    id: 42,
    question: "How many times is Salah (prayer) mentioned in the Quran?",
    questionBn: "কুরআনে সালাত (নামাজ) কতবার উল্লেখ করা হয়েছে?",
    options: ["67 times", "85 times", "100 times", "50 times"],
    optionsBn: ["৬৭ বার", "৮৫ বার", "১০০ বার", "৫০ বার"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "The word 'Salah' is mentioned 85 times in the Quran.",
    explanationBn: "কুরআনে 'সালাত' শব্দটি ৮৫ বার উল্লেখ করা হয়েছে।",
  },
  {
    id: 43,
    question: "Which companion was known as 'The Sword of Allah'?",
    questionBn: "কোন সাহাবীকে 'আল্লাহর তরবারি' বলা হত?",
    options: ["Abu Bakr (RA)", "Umar (RA)", "Khalid bin Walid (RA)", "Ali (RA)"],
    optionsBn: ["আবু বকর (রা.)", "উমর (রা.)", "খালিদ বিন ওয়ালিদ (রা.)", "আলী (রা.)"],
    correctAnswer: 2,
    category: "History",
    explanation: "Khalid bin Walid was given the title 'Sword of Allah' by Prophet Muhammad (PBUH).",
    explanationBn: "খালিদ বিন ওয়ালিদকে নবী মুহাম্মদ (সা.) 'আল্লাহর তরবারি' উপাধি দিয়েছিলেন।",
  },
  {
    id: 44,
    question: "What is the name of the gate of Paradise reserved for those who fast?",
    questionBn: "জান্নাতের কোন দরজা রোজাদারদের জন্য সংরক্ষিত?",
    options: ["Bab al-Salah", "Bab al-Rayyan", "Bab al-Jihad", "Bab al-Sadaqah"],
    optionsBn: ["বাব আল-সালাহ", "বাব আর-রাইয়ান", "বাব আল-জিহাদ", "বাব আল-সাদাকাহ"],
    correctAnswer: 1,
    category: "Special Days",
    explanation: "Ar-Rayyan is the gate of Paradise through which only those who fasted will enter.",
    explanationBn: "আর-রাইয়ান হলো জান্নাতের সেই দরজা যেখান দিয়ে শুধুমাত্র রোজাদাররা প্রবেশ করবে।",
  },
  {
    id: 45,
    question: "Which surah was revealed completely at one time?",
    questionBn: "কোন সূরা একসাথে সম্পূর্ণ নাযিল হয়েছিল?",
    options: ["Al-Fatiha", "Al-Ikhlas", "Al-Kahf", "Al-Baqarah"],
    optionsBn: ["আল-ফাতিহা", "আল-ইখলাস", "আল-কাহফ", "আল-বাকারাহ"],
    correctAnswer: 0,
    category: "Quran",
    explanation: "Surah Al-Fatiha was revealed completely at one time in Makkah.",
    explanationBn: "সূরা আল-ফাতিহা মক্কায় একসাথে সম্পূর্ণ নাযিল হয়েছিল।",
  },
  {
    id: 46,
    question: "How many years did Prophet Nuh (AS) preach to his people?",
    questionBn: "নবী নূহ (আ.) তাঁর জাতির কাছে কত বছর দাওয়াত দিয়েছিলেন?",
    options: ["500 years", "700 years", "950 years", "1000 years"],
    optionsBn: ["৫০০ বছর", "৭০০ বছর", "৯৫০ বছর", "১০০০ বছর"],
    correctAnswer: 2,
    category: "Prophets",
    explanation: "Prophet Nuh preached for 950 years according to the Quran (29:14).",
    explanationBn: "কুরআন অনুযায়ী (২৯:১৪) নবী নূহ ৯৫০ বছর দাওয়াত দিয়েছিলেন।",
  },
  {
    id: 47,
    question: "What is the Arabic word for charity?",
    questionBn: "দানের আরবি শব্দ কী?",
    options: ["Salah", "Sadaqah", "Sawm", "Shahada"],
    optionsBn: ["সালাহ", "সাদাকাহ", "সাওম", "শাহাদা"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "Sadaqah is voluntary charity given out of kindness and generosity.",
    explanationBn: "সাদাকাহ হলো দয়া ও উদারতা থেকে দেওয়া স্বেচ্ছাসেবী দান।",
  },
  {
    id: 48,
    question: "Which angel is responsible for bringing rain?",
    questionBn: "কোন ফেরেশতা বৃষ্টি আনার দায়িত্বে আছেন?",
    options: ["Jibreel", "Mikail", "Israfil", "Azrael"],
    optionsBn: ["জিবরীল", "মিকাইল", "ইস্রাফিল", "আজরাইল"],
    correctAnswer: 1,
    category: "Angels",
    explanation: "Angel Mikail is responsible for distributing rain and provisions.",
    explanationBn: "ফেরেশতা মিকাইল বৃষ্টি এবং রিজিক বণ্টনের দায়িত্বে আছেন।",
  },
  {
    id: 49,
    question: "What does 'Bismillah' mean?",
    questionBn: "'বিসমিল্লাহ' এর অর্থ কী?",
    options: ["In the name of Allah", "Allah is Great", "Praise be to Allah", "There is no god but Allah"],
    optionsBn: ["আল্লাহর নামে", "আল্লাহ মহান", "আল্লাহর প্রশংসা", "আল্লাহ ছাড়া কোন উপাস্য নেই"],
    correctAnswer: 0,
    category: "Basics",
    explanation: "Bismillah means 'In the name of Allah', used before starting any good deed.",
    explanationBn: "বিসমিল্লাহ মানে 'আল্লাহর নামে', যেকোনো ভালো কাজ শুরু করার আগে বলা হয়।",
  },
  {
    id: 50,
    question: "Which prophet is mentioned most in the Quran?",
    questionBn: "কুরআনে কোন নবীর নাম সবচেয়ে বেশিবার উল্লেখ করা হয়েছে?",
    options: ["Muhammad (PBUH)", "Ibrahim (AS)", "Musa (AS)", "Isa (AS)"],
    optionsBn: ["মুহাম্মদ (সা.)", "ইব্রাহিম (আ.)", "মূসা (আ.)", "ঈসা (আ.)"],
    correctAnswer: 2,
    category: "Prophets",
    explanation: "Prophet Musa is mentioned 136 times in the Quran, more than any other prophet.",
    explanationBn: "নবী মূসার নাম কুরআনে ১৩৬ বার উল্লেখ করা হয়েছে, অন্য যেকোনো নবীর চেয়ে বেশি।",
  },
  {
    id: 51,
    question: "How many sujood (prostrations) are there in a complete Quran?",
    questionBn: "সম্পূর্ণ কুরআনে কতটি সিজদা আছে?",
    options: ["10", "14", "15", "18"],
    optionsBn: ["১০", "১৪", "১৫", "১৮"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "There are 14 places of prostration (Sajdah Tilawat) in the Quran.",
    explanationBn: "কুরআনে ১৪টি সিজদায়ে তিলাওয়াত রয়েছে।",
  },
  {
    id: 52,
    question: "What is the reward for reading 'Ayatul Kursi' after every obligatory prayer?",
    questionBn: "প্রতি ফরজ নামাজের পর 'আয়াতুল কুরসি' পড়ার সওয়াব কী?",
    options: ["Paradise entry", "Forgiveness of sins", "Protection from evil", "All of the above"],
    optionsBn: ["জান্নাতে প্রবেশ", "গুনাহ মাফ", "খারাপ থেকে রক্ষা", "উপরের সবগুলো"],
    correctAnswer: 3,
    category: "Prayer",
    explanation: "Reading Ayatul Kursi after prayers ensures Paradise and protects from evil.",
    explanationBn: "নামাজের পর আয়াতুল কুরসি পড়লে জান্নাত নিশ্চিত এবং খারাপ থেকে রক্ষা পাওয়া যায়।",
  },
  {
    id: 53,
    question: "Which surah is known as the 'Mother of the Quran'?",
    questionBn: "কোন সূরাকে 'কুরআনের মাতা' বলা হয়?",
    options: ["Al-Baqarah", "Al-Fatiha", "Yasin", "Al-Mulk"],
    optionsBn: ["আল-বাকারাহ", "আল-ফাতিহা", "ইয়াসীন", "আল-মুলক"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "Surah Al-Fatiha is called 'Umm al-Quran' (Mother of the Quran).",
    explanationBn: "সূরা আল-ফাতিহাকে 'উম্মুল কুরআন' (কুরআনের মাতা) বলা হয়।",
  },
  {
    id: 54,
    question: "What was the age of Prophet Muhammad (PBUH) when he received first revelation?",
    questionBn: "নবী মুহাম্মদ (সা.) যখন প্রথম ওহী পান তখন তাঁর বয়স কত ছিল?",
    options: ["30 years", "35 years", "40 years", "45 years"],
    optionsBn: ["৩০ বছর", "৩৫ বছর", "৪০ বছর", "৪৫ বছর"],
    correctAnswer: 2,
    category: "History",
    explanation: "Prophet Muhammad (PBUH) was 40 years old when he received the first revelation.",
    explanationBn: "নবী মুহাম্মদ (সা.) ৪০ বছর বয়সে প্রথম ওহী পেয়েছিলেন।",
  },
  {
    id: 55,
    question: "Which of the 99 names of Allah means 'The Most Merciful'?",
    questionBn: "আল্লাহর ৯৯টি নামের মধ্যে কোনটি 'সর্বাধিক দয়াবান' অর্থ প্রকাশ করে?",
    options: ["Ar-Rahman", "Al-Karim", "Al-Wadud", "Al-Ghafur"],
    optionsBn: ["আর-রাহমান", "আল-কারীম", "আল-ওয়াদুদ", "আল-গাফুর"],
    correctAnswer: 0,
    category: "Names of Allah",
    explanation: "Ar-Rahman means 'The Most Merciful' and is one of Allah's most beautiful names.",
    explanationBn: "আর-রাহমান মানে 'সর্বাধিক দয়াবান' এবং এটি আল্লাহর সুন্দরতম নামগুলোর একটি।",
  },
  {
    id: 56,
    question: "What is the name of the cave where the Quran was first revealed?",
    questionBn: "যে গুহায় কুরআন প্রথম নাযিল হয়েছিল তার নাম কী?",
    options: ["Cave Hira", "Cave Thawr", "Cave Uhud", "Cave Arafat"],
    optionsBn: ["হেরা গুহা", "সাওর গুহা", "উহুদ গুহা", "আরাফাত গুহা"],
    correctAnswer: 0,
    category: "History",
    explanation: "The Quran was first revealed to Prophet Muhammad in Cave Hira.",
    explanationBn: "হেরা গুহায় নবী মুহাম্মদের কাছে প্রথম কুরআন নাযিল হয়েছিল।",
  },
  {
    id: 57,
    question: "How many Juz (parts) are in the Quran?",
    questionBn: "কুরআনে কতটি পারা আছে?",
    options: ["20", "25", "30", "40"],
    optionsBn: ["২০", "২৫", "৩০", "৪০"],
    correctAnswer: 2,
    category: "Quran",
    explanation: "The Quran is divided into 30 equal parts called Juz or Para.",
    explanationBn: "কুরআন ৩০টি সমান ভাগে বিভক্ত যাকে পারা বলা হয়।",
  },
  {
    id: 58,
    question: "Which prophet's wife turned into a pillar of salt?",
    questionBn: "কোন নবীর স্ত্রী লবণের স্তম্ভে পরিণত হয়েছিল?",
    options: ["Prophet Ibrahim (AS)", "Prophet Lut (AS)", "Prophet Nuh (AS)", "Prophet Musa (AS)"],
    optionsBn: ["নবী ইব্রাহিম (আ.)", "নবী লূত (আ.)", "নবী নূহ (আ.)", "নবী মূসা (আ.)"],
    correctAnswer: 1,
    category: "Prophets",
    explanation: "The wife of Prophet Lut disobeyed and turned into a pillar of salt.",
    explanationBn: "নবী লূতের স্ত্রী অবাধ্য হয়েছিল এবং লবণের স্তম্ভে পরিণত হয়েছিল।",
  },
  {
    id: 59,
    question: "What is the Arabic term for the night journey of Prophet Muhammad (PBUH)?",
    questionBn: "নবী মুহাম্মদ (সা.) এর রাত্রি ভ্রমণের আরবি শব্দ কী?",
    options: ["Hijrah", "Isra and Miraj", "Laylatul Qadr", "Hajj"],
    optionsBn: ["হিজরত", "ইসরা ও মিরাজ", "লাইলাতুল কদর", "হজ"],
    correctAnswer: 1,
    category: "History",
    explanation: "Isra and Miraj refers to the night journey from Makkah to Jerusalem and ascension to heaven.",
    explanationBn: "ইসরা ও মিরাজ মক্কা থেকে জেরুজালেম এবং আকাশে উর্ধ্বগমনের রাত্রি ভ্রমণকে বোঝায়।",
  },
  {
    id: 60,
    question: "Which companion was known as 'Al-Farooq' (The one who distinguishes truth from falsehood)?",
    questionBn: "কোন সাহাবীকে 'আল-ফারুক' (সত্য-মিথ্যার পার্থক্যকারী) বলা হত?",
    options: ["Abu Bakr (RA)", "Umar ibn al-Khattab (RA)", "Uthman (RA)", "Ali (RA)"],
    optionsBn: ["আবু বকর (রা.)", "উমর ইবনুল খাত্তাব (রা.)", "উসমান (রা.)", "আলী (রা.)"],
    correctAnswer: 1,
    category: "History",
    explanation: "Umar ibn al-Khattab was given the title Al-Farooq for his strong sense of justice.",
    explanationBn: "উমর ইবনুল খাত্তাবকে তাঁর প্রবল ন্যায়বোধের জন্য আল-ফারুক উপাধি দেওয়া হয়েছিল।",
  },
  {
    id: 61,
    question: "What is the punishment for breaking the fast intentionally without excuse?",
    questionBn: "অজুহাত ছাড়া ইচ্ছাকৃতভাবে রোজা ভাঙার শাস্তি কী?",
    options: ["Fast one day", "Fast 60 consecutive days", "Feed 60 poor people", "Give charity"],
    optionsBn: ["একদিন রোজা", "একটানা ৬০ দিন রোজা", "৬০ জন দরিদ্রকে খাওয়ানো", "দান করা"],
    correctAnswer: 1,
    category: "Pillars",
    explanation: "Breaking fast intentionally requires fasting 60 consecutive days (Kaffarah).",
    explanationBn: "ইচ্ছাকৃতভাবে রোজা ভাঙলে কাফফারা হিসেবে একটানা ৬০ দিন রোজা রাখতে হয়।",
  },
  {
    id: 62,
    question: "Which surah protects from the punishment of the grave?",
    questionBn: "কোন সূরা কবরের শাস্তি থেকে রক্ষা করে?",
    options: ["Al-Fatiha", "Al-Mulk", "Yasin", "Al-Waqiah"],
    optionsBn: ["আল-ফাতিহা", "আল-মুলক", "ইয়াসীন", "আল-ওয়াকিয়াহ"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "Surah Al-Mulk protects from the punishment of the grave when recited before sleep.",
    explanationBn: "সূরা আল-মুলক ঘুমানোর আগে পড়লে কবরের শাস্তি থেকে রক্ষা করে।",
  },
  {
    id: 63,
    question: "What is the minimum nisab (threshold) for Zakat on gold?",
    questionBn: "সোনার যাকাতের সর্বনিম্ন নিসাব (সীমা) কত?",
    options: ["5 grams", "20 grams", "87.48 grams", "100 grams"],
    optionsBn: ["৫ গ্রাম", "২০ গ্রাম", "৮৭.৪৮ গ্রাম", "১০০ গ্রাম"],
    correctAnswer: 2,
    category: "Pillars",
    explanation: "The nisab for gold is 87.48 grams or 7.5 tola.",
    explanationBn: "সোনার নিসাব হলো ৮৭.৪৮ গ্রাম বা ৭.৫ তোলা।",
  },
  {
    id: 64,
    question: "Which prophet was given the ability to interpret dreams?",
    questionBn: "কোন নবীকে স্বপ্নের ব্যাখ্যা করার ক্ষমতা দেওয়া হয়েছিল?",
    options: ["Yusuf (AS)", "Sulaiman (AS)", "Dawud (AS)", "Idris (AS)"],
    optionsBn: ["ইউসুফ (আ.)", "সুলাইমান (আ.)", "দাউদ (আ.)", "ইদরিস (আ.)"],
    correctAnswer: 0,
    category: "Prophets",
    explanation: "Prophet Yusuf was blessed with the gift of interpreting dreams.",
    explanationBn: "নবী ইউসুফকে স্বপ্নের ব্যাখ্যা করার উপহার দেওয়া হয়েছিল।",
  },
  {
    id: 65,
    question: "What does 'Tawheed' mean?",
    questionBn: "'তাওহীদ' এর অর্থ কী?",
    options: ["Five pillars", "Oneness of Allah", "Belief in prophets", "Day of Judgment"],
    optionsBn: ["পাঁচ স্তম্ভ", "আল্লাহর একত্ব", "নবীদের বিশ্বাস", "বিচার দিবস"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "Tawheed is the concept of the Oneness and Uniqueness of Allah.",
    explanationBn: "তাওহীদ হলো আল্লাহর একত্ব এবং অনন্যতার ধারণা।",
  },
  {
    id: 66,
    question: "Which battle is known as the 'Battle of the Trench'?",
    questionBn: "কোন যুদ্ধকে 'পরিখার যুদ্ধ' বলা হয়?",
    options: ["Battle of Badr", "Battle of Uhud", "Battle of Khandaq", "Battle of Tabuk"],
    optionsBn: ["বদরের যুদ্ধ", "উহুদের যুদ্ধ", "খন্দকের যুদ্ধ", "তাবুকের যুদ্ধ"],
    correctAnswer: 2,
    category: "History",
    explanation: "The Battle of Khandaq (Trench) was fought in 627 CE when Muslims dug a trench for defense.",
    explanationBn: "খন্দক (পরিখা) যুদ্ধ ৬২৭ খ্রিস্টাব্দে সংঘটিত হয়েছিল যখন মুসলমানরা প্রতিরক্ষার জন্য পরিখা খনন করেছিল।",
  },
  {
    id: 67,
    question: "What is the Arabic word for Paradise?",
    questionBn: "জান্নাতের আরবি শব্দ কী?",
    options: ["Jannah", "Jahannam", "Barzakh", "Sirat"],
    optionsBn: ["জান্নাহ", "জাহান্নাম", "বারযাখ", "সিরাত"],
    correctAnswer: 0,
    category: "Basics",
    explanation: "Jannah is the Arabic word for Paradise, the eternal abode of the believers.",
    explanationBn: "জান্নাহ হলো জান্নাতের আরবি শব্দ, বিশ্বাসীদের চিরন্তন আবাসস্থল।",
  },
  {
    id: 68,
    question: "Which prophet is known as 'Kalimullah' (The one who spoke to Allah)?",
    questionBn: "কোন নবীকে 'কালিমুল্লাহ' (যিনি আল্লাহর সাথে কথা বলেছিলেন) বলা হয়?",
    options: ["Ibrahim (AS)", "Musa (AS)", "Isa (AS)", "Muhammad (PBUH)"],
    optionsBn: ["ইব্রাহিম (আ.)", "মূসা (আ.)", "ঈসা (আ.)", "মুহাম্মদ (সা.)"],
    correctAnswer: 1,
    category: "Prophets",
    explanation: "Prophet Musa is called Kalimullah because Allah spoke to him directly.",
    explanationBn: "নবী মূসাকে কালিমুল্লাহ বলা হয় কারণ আল্লাহ সরাসরি তাঁর সাথে কথা বলেছিলেন।",
  },
  {
    id: 69,
    question: "What is the literal meaning of 'Quran'?",
    questionBn: "'কুরআন' শব্দের আভিধানিক অর্থ কী?",
    options: ["The Book", "The Recitation", "The Guidance", "The Light"],
    optionsBn: ["কিতাব", "পাঠ", "পথপ্রদর্শন", "আলো"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "Quran literally means 'The Recitation' or 'That which is recited'.",
    explanationBn: "কুরআন শব্দের আভিধানিক অর্থ 'পাঠ' বা 'যা পাঠ করা হয়'।",
  },
  {
    id: 70,
    question: "How many letters are in the Arabic alphabet?",
    questionBn: "আরবি বর্ণমালায় কতটি অক্ষর আছে?",
    options: ["22", "26", "28", "30"],
    optionsBn: ["২২", "২৬", "২৮", "৩০"],
    correctAnswer: 2,
    category: "Basics",
    explanation: "The Arabic alphabet consists of 28 letters.",
    explanationBn: "আরবি বর্ণমালায় ২৮টি অক্ষর রয়েছে।",
  },
  {
    id: 71,
    question: "Which angel will blow the trumpet on the Day of Judgment?",
    questionBn: "কোন ফেরেশতা বিচার দিবসে শিঙ্গা ফুঁকবেন?",
    options: ["Jibreel", "Mikail", "Israfil", "Azrael"],
    optionsBn: ["জিবরীল", "মিকাইল", "ইস্রাফিল", "আজরাইল"],
    correctAnswer: 2,
    category: "Angels",
    explanation: "Angel Israfil will blow the trumpet (Sur) to announce the Day of Judgment.",
    explanationBn: "ফেরেশতা ইস্রাফিল বিচার দিবস ঘোষণার জন্য শিঙ্গা (সূর) ফুঁকবেন।",
  },
  {
    id: 72,
    question: "What is the name of the Prophet's (PBUH) grandfather who raised him?",
    questionBn: "নবী (সা.)-এর দাদার নাম কী যিনি তাঁকে লালনপালন করেছিলেন?",
    options: ["Abu Talib", "Abdul Muttalib", "Abdullah", "Abu Lahab"],
    optionsBn: ["আবু তালিব", "আব্দুল মুত্তালিব", "আব্দুল্লাহ", "আবু লাহাব"],
    correctAnswer: 1,
    category: "History",
    explanation: "Abdul Muttalib was the Prophet's grandfather who took care of him after his mother's death.",
    explanationBn: "আব্দুল মুত্তালিব ছিলেন নবীর দাদা যিনি তাঁর মায়ের মৃত্যুর পর তাঁর যত্ন নিয়েছিলেন।",
  },
  {
    id: 73,
    question: "Which surah mentions the story of the People of the Cave?",
    questionBn: "কোন সূরায় গুহার অধিবাসীদের কাহিনী উল্লেখ আছে?",
    options: ["Al-Baqarah", "Al-Kahf", "Maryam", "Yusuf"],
    optionsBn: ["আল-বাকারাহ", "আল-কাহফ", "মারিয়াম", "ইউসুফ"],
    correctAnswer: 1,
    category: "Quran",
    explanation: "Surah Al-Kahf (The Cave) narrates the story of the young believers who slept in a cave.",
    explanationBn: "সূরা আল-কাহফ (গুহা) যুবক বিশ্বাসীদের কাহিনী বর্ণনা করে যারা একটি গুহায় ঘুমিয়েছিল।",
  },
  {
    id: 74,
    question: "What is the meaning of 'Alhamdulillah'?",
    questionBn: "'আলহামদুলিল্লাহ' এর অর্থ কী?",
    options: ["Allah is Great", "Praise be to Allah", "Glory to Allah", "In the name of Allah"],
    optionsBn: ["আল্লাহ মহান", "আল্লাহর প্রশংসা", "আল্লাহর মহিমা", "আল্লাহর নামে"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "Alhamdulillah means 'All praise is due to Allah' or 'Praise be to Allah'.",
    explanationBn: "আলহামদুলিল্লাহ মানে 'সমস্ত প্রশংসা আল্লাহর জন্য' বা 'আল্লাহর প্রশংসা'।",
  },
  {
    id: 75,
    question: "Which prophet was given the Zabur (Psalms)?",
    questionBn: "কোন নবীকে যাবুর (গীতসংহিতা) দেওয়া হয়েছিল?",
    options: ["Musa (AS)", "Isa (AS)", "Dawud (AS)", "Ibrahim (AS)"],
    optionsBn: ["মূসা (আ.)", "ঈসা (আ.)", "দাউদ (আ.)", "ইব্রাহিম (আ.)"],
    correctAnswer: 2,
    category: "Prophets",
    explanation: "Prophet Dawud (David) was given the Zabur (Psalms) as a divine scripture.",
    explanationBn: "নবী দাউদ (আ.)-কে যাবুর (গীতসংহিতা) ঐশী গ্রন্থ হিসেবে দেওয়া হয়েছিল।",
  },
  {
    id: 76,
    question: "What is the Islamic New Year called?",
    questionBn: "ইসলামিক নববর্ষকে কী বলা হয়?",
    options: ["Eid al-Fitr", "Muharram 1st", "Ramadan 1st", "Shawwal 1st"],
    optionsBn: ["ঈদ আল-ফিতর", "১লা মুহররম", "১লা রমজান", "১লা শাওয়াল"],
    correctAnswer: 1,
    category: "Special Days",
    explanation: "The Islamic New Year begins on the 1st of Muharram.",
    explanationBn: "ইসলামিক নববর্ষ ১লা মুহররম থেকে শুরু হয়।",
  },
  {
    id: 77,
    question: "Which companion was known as 'The Trustworthy'?",
    questionBn: "কোন সাহাবীকে 'বিশ্বস্ত' বলা হত?",
    options: ["Abu Bakr Al-Siddiq (RA)", "Uthman ibn Affan (RA)", "Ali ibn Abi Talib (RA)", "Umar (RA)"],
    optionsBn: ["আবু বকর আস-সিদ্দিক (রা.)", "উসমান ইবনে আফফান (রা.)", "আলী ইবনে আবী তালিব (রা.)", "উমর (রা.)"],
    correctAnswer: 1,
    category: "History",
    explanation: "Uthman ibn Affan was known for his trustworthiness and generosity.",
    explanationBn: "উসমান ইবনে আফফান তাঁর বিশ্বস্ততা এবং উদারতার জন্য পরিচিত ছিলেন।",
  },
  {
    id: 78,
    question: "How many heavens are mentioned in the Quran?",
    questionBn: "কুরআনে কতটি আসমানের উল্লেখ আছে?",
    options: ["3", "5", "7", "9"],
    optionsBn: ["৩", "৫", "৭", "৯"],
    correctAnswer: 2,
    category: "Quran",
    explanation: "The Quran mentions seven heavens (سموات سبع).",
    explanationBn: "কুরআনে সাতটি আসমানের (সমাওয়াত সাবা') উল্লেখ আছে।",
  },
  {
    id: 79,
    question: "What is the name of the bridge that Muslims must cross on the Day of Judgment?",
    questionBn: "বিচার দিবসে মুসলমানদের যে সেতু অতিক্রম করতে হবে তার নাম কী?",
    options: ["Barzakh", "Sirat", "Mizan", "Hawd"],
    optionsBn: ["বারযাখ", "সিরাত", "মিযান", "হাউদ"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "As-Sirat is the bridge over Hell that everyone must cross on the Day of Judgment.",
    explanationBn: "আস-সিরাত হলো জাহান্নামের উপর সেতু যা সবাইকে বিচার দিবসে অতিক্রম করতে হবে।",
  },
  {
    id: 80,
    question: "Which prophet was thrown into a blazing fire but was saved by Allah?",
    questionBn: "কোন নবীকে জ্বলন্ত আগুনে ফেলা হয়েছিল কিন্তু আল্লাহ তাঁকে রক্ষা করেছিলেন?",
    options: ["Musa (AS)", "Ibrahim (AS)", "Nuh (AS)", "Isa (AS)"],
    optionsBn: ["মূসা (আ.)", "ইব্রাহিম (আ.)", "নূহ (আ.)", "ঈসা (আ.)"],
    correctAnswer: 1,
    category: "Prophets",
    explanation: "Prophet Ibrahim was thrown into fire by Nimrod but Allah made it cool and safe for him.",
    explanationBn: "নবী ইব্রাহিমকে নমরুদ আগুনে ফেলেছিল কিন্তু আল্লাহ তা তাঁর জন্য ঠান্ডা ও নিরাপদ করে দিয়েছিলেন।",
  },
  {
    id: 81,
    question: "What is the meaning of 'InshaAllah'?",
    questionBn: "'ইনশাআল্লাহ' এর অর্থ কী?",
    options: ["Allah knows best", "If Allah wills", "Thanks to Allah", "Allah is Great"],
    optionsBn: ["আল্লাহই ভালো জানেন", "আল্লাহ চাইলে", "আল্লাহকে ধন্যবাদ", "আল্লাহ মহান"],
    correctAnswer: 1,
    category: "Basics",
    explanation: "InshaAllah means 'If Allah wills' and is said when speaking about the future.",
    explanationBn: "ইনশাআল্লাহ মানে 'আল্লাহ চাইলে' এবং ভবিষ্যতের কথা বলার সময় বলা হয়।",
  },
  {
    id: 82,
    question: "Which surah is recited in every rakat of prayer?",
    questionBn: "নামাজের প্রতি রাকাতে কোন সূরা পড়া হয়?",
    options: ["Al-Ikhlas", "Al-Fatiha", "An-Nas", "Al-Falaq"],
    optionsBn: ["আল-ইখলাস", "আল-ফাতিহা", "আন-নাস", "আল-ফালাক"],
    correctAnswer: 1,
    category: "Prayer",
    explanation: "Surah Al-Fatiha must be recited in every rakat of every prayer.",
    explanationBn: "প্রতিটি নামাজের প্রতিটি রাকাতে সূরা আল-ফাতিহা পড়তে হয়।",
  },
  {
    id: 83,
    question: "What is the reward for someone who memorizes the entire Quran?",
    questionBn: "যে ব্যক্তি সম্পূর্ণ কুরআন মুখস্থ করে তার পুরস্কার কী?",
    options: ["Hafiz title", "Crown for parents in Paradise", "High status in Paradise", "All of the above"],
    optionsBn: ["হাফিজ উপাধি", "জান্নাতে পিতামাতার মুকুট", "জান্নাতে উচ্চ মর্যাদা", "উপরের সবগুলো"],
    correctAnswer: 3,
    category: "Quran",
    explanation: "A person who memorizes the Quran is called a Hafiz and will receive many rewards including a crown for their parents.",
    explanationBn: "যে ব্যক্তি কুরআন মুখস্থ করে তাকে হাফিজ বলা হয় এবং তার পিতামাতার জন্য মুকুট সহ অনেক পুরস্কার পাবে।",
  },
  {
    id: 84,
    question: "Which prophet could control the jinn and understand animal language?",
    questionBn: "কোন নবী জিনদের নিয়ন্ত্রণ করতে এবং প্রাণীর ভাষা বুঝতে পারতেন?",
    options: ["Dawud (AS)", "Sulaiman (AS)", "Isa (AS)", "Ibrahim (AS)"],
    optionsBn: ["দাউদ (আ.)", "সুলাইমান (আ.)", "ঈসা (আ.)", "ইব্রাহিম (আ.)"],
    correctAnswer: 1,
    category: "Prophets",
    explanation: "Prophet Sulaiman was given power over jinn and could understand the language of animals and birds.",
    explanationBn: "নবী সুলাইমানকে জিনদের উপর ক্ষমতা দেওয়া হয়েছিল এবং তিনি প্রাণী ও পাখির ভাষা বুঝতে পারতেন।",
  },
  {
    id: 85,
    question: "What is the first right that will be questioned about on the Day of Judgment?",
    questionBn: "বিচার দিবসে সর্বপ্রথম কোন বিষয়ে জিজ্ঞাসা করা হবে?",
    options: ["Zakat", "Fasting", "Prayer (Salah)", "Hajj"],
    optionsBn: ["যাকাত", "রোজা", "নামাজ (সালাহ)", "হজ"],
    correctAnswer: 2,
    category: "Prayer",
    explanation: "Salah (prayer) will be the first thing a person will be questioned about on the Day of Judgment.",
    explanationBn: "বিচার দিবসে সর্বপ্রথম সালাহ (নামাজ) সম্পর্কে জিজ্ঞাসা করা হবে।",
  },
  {
    id: 86,
    question: "Which of the following is NOT a pillar of Islam?",
    questionBn: "নিচের কোনটি ইসলামের স্তম্ভ নয়?",
    options: ["Shahada", "Jihad", "Zakat", "Hajj"],
    optionsBn: ["শাহাদা", "জিহাদ", "যাকাত", "হজ"],
    correctAnswer: 1,
    category: "Pillars",
    explanation: "Jihad is not one of the five pillars of Islam. The five pillars are: Shahada, Salah, Zakat, Sawm, and Hajj.",
    explanationBn: "জিহাদ ইসলামের পাঁচ স্তম্ভের একটি নয়। পাঁচ স্তম্ভ হলো: শাহাদা, সালাহ, যাকাত, সাওম এবং হজ।",
  },
  {
    id: 87,
    question: "What is the Arabic term for the call to prayer?",
    questionBn: "নামাজের আহ্বানের আরবি শব্দ কী?",
    options: ["Iqamah", "Adhan", "Takbir", "Taslim"],
    optionsBn: ["ইকামাহ", "আযান", "তাকবীর", "তাসলিম"],
    correctAnswer: 1,
    category: "Prayer",
    explanation: "Adhan is the Islamic call to prayer proclaimed from a mosque five times a day.",
    explanationBn: "আযান হলো মসজিদ থেকে দিনে পাঁচবার ঘোষিত নামাজের ইসলামি আহ্বান।",
  },
  {
    id: 88,
    question: "Which companion was the first to accept Islam among men?",
    questionBn: "পুরুষদের মধ্যে কোন সাহাবী প্রথম ইসলাম গ্রহণ করেছিলেন?",
    options: ["Umar ibn al-Khattab (RA)", "Abu Bakr As-Siddiq (RA)", "Ali ibn Abi Talib (RA)", "Uthman ibn Affan (RA)"],
    optionsBn: ["উমর ইবনুল খাত্তাব (রা.)", "আবু বকর আস-সিদ্দিক (রা.)", "আলী ইবনে আবী তালিব (রা.)", "উসমান ইবনে আফফান (রা.)"],
    correctAnswer: 1,
    category: "History",
    explanation: "Abu Bakr As-Siddiq was the first adult male to accept Islam.",
    explanationBn: "আবু বকর আস-সিদ্দিক প্রথম প্রাপ্তবয়স্ক পুরুষ যিনি ইসলাম গ্রহণ করেছিলেন।",
  },
  {
    id: 89,
    question: "How many times should a Muslim perform Umrah in their lifetime?",
    questionBn: "একজন মুসলমানের জীবনে কতবার উমরাহ করা উচিত?",
    options: ["Once (mandatory)", "Three times", "Not mandatory, but recommended", "Every year"],
    optionsBn: ["একবার (বাধ্যতামূলক)", "তিনবার", "বাধ্যতামূলক নয়, তবে প্রস্তাবিত", "প্রতি বছর"],
    correctAnswer: 2,
    category: "Pillars",
    explanation: "Umrah is not obligatory but highly recommended (Sunnah Muakkadah).",
    explanationBn: "উমরাহ বাধ্যতামূলক নয় তবে অত্যন্ত প্রস্তাবিত (সুন্নাতে মুয়াক্কাদা)।",
  },
  {
    id: 90,
    question: "Which of Allah's names means 'The All-Knowing'?",
    questionBn: "আল্লাহর কোন নাম 'সর্বজ্ঞ' অর্থ প্রকাশ করে?",
    options: ["Al-Hakim", "Al-Alim", "Al-Khabir", "Al-Basir"],
    optionsBn: ["আল-হাকিম", "আল-আলিম", "আল-খাবির", "আল-বাসির"],
    correctAnswer: 1,
    category: "Names of Allah",
    explanation: "Al-Alim means 'The All-Knowing' - Allah who has perfect knowledge of everything.",
    explanationBn: "আল-আলিম মানে 'সর্বজ্ঞ' - আল্লাহ যিনি সবকিছুর নিখুঁত জ্ঞান রাখেন।",
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
  const countdown = useCountdownToMidnight();
  
  const {
    progress,
    isLoading: loading,
    addPoints,
    hasPlayedToday,
    getAccuracy,
    updateStreak,
  } = useQuizProgress();

  // Fetch questions from database
  const { data: allQuestions = [], isLoading: questionsLoading } = useQuery({
    queryKey: ["quiz-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .eq("is_active", true)
        .order("order_index", { ascending: true });

      if (error) throw error;

      return (data || []).map((q) => ({
        question: q.question,
        options: q.options as string[],
        correctAnswer: q.correct_answer,
        category: q.category,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });
  
  const [activeTab, setActiveTab] = useState<"quiz" | "leaderboard" | "badges">("quiz");
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]);
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

  const playedToday = hasPlayedToday();

  useEffect(() => {
    // Get 3 deterministic questions for the current day based on date seed
    const dateSeed = currentDate;
    const shuffled = [...allQuestions].sort(() => {
      const hash = dateSeed.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
      return Math.sin(hash) - 0.5;
    });
    setDailyQuestions(shuffled.slice(0, 3));
    
    // Reset quiz state when date changes (new day = new quiz)
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
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
      // Quiz completed - add points for each question
      const earnedPoints = score * 10 + (score === 3 ? 20 : 0); // 10 per correct, +20 bonus for perfect score
      
      // Add points for each correct answer
      for (let i = 0; i < score; i++) {
        addPoints(10, true);
      }
      
      // Add bonus for perfect score
      if (score === 3) {
        addPoints(20, true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      setQuizCompleted(true);
      playSfx("result");
    }
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
  };

  if (loading || questionsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-2xl mx-auto pt-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    );
  }

  if (!questionsLoading && allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
        <div className="max-w-2xl mx-auto pt-8 text-center">
          <p className="text-muted-foreground">কোনো প্রশ্ন পাওয়া যায়নি।</p>
        </div>
      </div>
    );
  }

  const currentQuestion = dailyQuestions[currentQuestionIndex];
  const earnedBadges = badges.filter(b => progress.totalPoints >= b.requirement);

  return (
    <div className="font-quizEn min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pb-24">
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
            <span className="font-bold text-primary">{progress.totalPoints}</span>
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
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
                      <p className="text-2xl font-bold text-primary">{progress.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-500/5">
                      <p className="text-2xl font-bold text-amber-500">{earnedBadges.length}</p>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center p-2 rounded-lg bg-emerald-500/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Zap className="w-3 h-3 text-emerald-500" />
                      </div>
                      <p className="text-lg font-bold text-emerald-500">{progress.totalPoints}</p>
                      <p className="text-[10px] text-muted-foreground">Points</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-blue-500/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-blue-500" />
                      </div>
                      <p className="text-lg font-bold text-blue-500">{getAccuracy()}%</p>
                      <p className="text-[10px] text-muted-foreground">Accuracy</p>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-purple-500/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <TrendingUp className="w-3 h-3 text-purple-500" />
                      </div>
                      <p className="text-lg font-bold text-purple-500">{progress.longestStreak}</p>
                      <p className="text-[10px] text-muted-foreground">Best</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {playedToday && !quizCompleted ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">আজকের কুইজ সম্পূর্ণ হয়েছে! ✅</h2>
                    <p className="text-muted-foreground mb-4">আগামীকাল নতুন প্রশ্নের জন্য ফিরে আসুন।</p>
                    <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-xl border border-primary/20">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-primary" />
                        <p className="text-sm font-medium text-muted-foreground">পরবর্তী কুইজ পাওয়া যাবে:</p>
                      </div>
                      <p className="text-2xl font-bold text-primary font-mono">{countdown}</p>
                      <p className="text-xs text-muted-foreground mt-1">ঘণ্টা:মিনিট:সেকেন্ড</p>
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
                            <p className="text-lg font-semibold text-primary">{progress.currentStreak} days</p>
                          </div>
                          <div className="rounded-lg bg-emerald-500/5 p-3">
                            <p className="text-xs text-muted-foreground">Total points</p>
                            <p className="text-lg font-semibold text-emerald-500">{progress.totalPoints}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-4 p-4 bg-gradient-to-r from-primary/10 to-amber-500/10 rounded-xl border border-primary/20">
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-primary" />
                          <p className="text-sm font-medium text-muted-foreground">পরবর্তী কুইজ পাওয়া যাবে:</p>
                        </div>
                        <p className="text-2xl font-bold text-primary font-mono">{countdown}</p>
                        <p className="text-xs text-muted-foreground mt-1">ঘণ্টা:মিনিট:সেকেন্ড</p>
                      </div>

                      <p className="text-muted-foreground text-sm mt-4">প্রতিদিন একটু একটু উন্নতিই বড় পরিবর্তন আনে।</p>
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
                      <CardTitle className="text-xl leading-relaxed">
                        {languageMode === "bn" && (
                          <span className="font-bangla text-2xl leading-relaxed">
                            {currentQuestion.questionBn}
                          </span>
                        )}
                        {languageMode === "en" && (
                          <span className="font-quizEn">
                            {currentQuestion.question}
                          </span>
                        )}
                        {languageMode === "mixed" && (
                          <span className="font-bangla text-2xl leading-relaxed">
                            {currentQuestion.questionBn}
                          </span>
                        )}
                      </CardTitle>
                      {languageMode === "mixed" && (
                        <div className="mt-1 space-y-0.5">
                          <p className="text-xs text-muted-foreground font-quizEn">
                            {currentQuestion.question}
                          </p>
                        </div>
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
                              <p
                                className={`font-semibold leading-snug ${
                                  languageMode === "bn" || languageMode === "mixed"
                                    ? "font-bangla text-[16px]"
                                    : "font-quizEn text-[14px]"
                                }`}
                              >
                                {languageMode === "bn" || languageMode === "mixed"
                                  ? currentQuestion.optionsBn?.[index] ?? option
                                  : option}
                              </p>
                              {languageMode === "mixed" && (
                                <p className="text-[11px] text-muted-foreground mt-0.5 font-quizEn">
                                  {option}
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
                      <p
                        className={`text-muted-foreground text-[13px] ${
                          languageMode === "bn" || languageMode === "mixed"
                            ? "font-bangla text-[14px]"
                            : "font-quizEn"
                        }`}
                      >
                        {languageMode === "bn" || languageMode === "mixed"
                          ? currentQuestion.explanationBn
                          : currentQuestion.explanation}
                      </p>
                      {languageMode === "mixed" && (
                        <p className="mt-1 text-[11px] text-muted-foreground/80 font-quizEn">
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
                        <p className="text-3xl font-bold text-primary">{progress.totalPoints}</p>
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
                          <p className="text-xs text-muted-foreground font-bangla">পয়েন্ট</p>
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
                  const isEarned = progress.totalPoints >= badge.requirement;
                  const isNext = !isEarned && (index === 0 || progress.totalPoints >= badges[index - 1].requirement);
                  const pointsNeeded = badge.requirement - progress.totalPoints;
                  const badgeProgress = isEarned ? 100 : Math.min(100, (progress.totalPoints / badge.requirement) * 100);

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
                              <p className="text-sm text-muted-foreground font-bangla mb-2">{badge.nameBn}</p>
                              
                              {/* Progress Bar */}
                              {!isEarned && (
                                <div className="space-y-1">
                                  <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{progress.totalPoints} points</span>
                                    <span>{badge.requirement} needed</span>
                                  </div>
                                  <Progress value={badgeProgress} className="h-1.5" />
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
