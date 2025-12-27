import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft, Trophy, Star, Medal, Crown, Zap, CheckCircle2, XCircle, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  { id: 1, name: "প্রথম পদক্ষেপ", icon: Star, color: "text-yellow-500", requirement: 10 },
  { id: 2, name: "কুইজ মাস্টার", icon: Trophy, color: "text-amber-500", requirement: 50 },
  { id: 3, name: "জ্ঞানী", icon: Medal, color: "text-blue-500", requirement: 100 },
  { id: 4, name: "চ্যাম্পিয়ন", icon: Crown, color: "text-purple-500", requirement: 200 },
  { id: 5, name: "কুরআন বিশেষজ্ঞ", icon: Sparkles, color: "text-emerald-500", requirement: 300 },
];

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

  const today = new Date().toDateString();
  const hasPlayedToday = lastPlayedDate === today;

  useEffect(() => {
    // Get 3 random questions for today based on date seed
    const dateSeed = new Date().toDateString();
    const shuffled = [...allQuestions].sort(() => {
      const hash = dateSeed.split('').reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
      return Math.sin(hash) - 0.5;
    });
    setDailyQuestions(shuffled.slice(0, 3));
  }, []);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    
    if (selectedAnswer === dailyQuestions[currentQuestionIndex].correctAnswer) {
      setScore(prev => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < dailyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
    } else {
      // Quiz completed
      const earnedPoints = score * 10 + (score === 3 ? 20 : 0); // Bonus for perfect score
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
            দৈনিক কুইজ
          </h1>
          <div className="flex items-center gap-2 bg-primary/10 px-3 py-1.5 rounded-full">
            <Zap className="w-4 h-4 text-primary" />
            <span className="font-bold text-primary">{totalPoints}</span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 px-4 pb-3">
          {[
            { id: "quiz", label: "কুইজ", icon: Sparkles },
            { id: "leaderboard", label: "লিডারবোর্ড", icon: Trophy },
            { id: "badges", label: "ব্যাজ", icon: Medal },
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
                      <p className="text-xs text-muted-foreground">দিনের ধারা 🔥</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-amber-500">{earnedBadges.length}</p>
                      <p className="text-xs text-muted-foreground">ব্যাজ অর্জিত</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-emerald-500">{totalPoints}</p>
                      <p className="text-xs text-muted-foreground">মোট পয়েন্ট</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {hasPlayedToday && !quizCompleted ? (
                <Card className="text-center py-8">
                  <CardContent>
                    <CheckCircle2 className="w-16 h-16 mx-auto text-emerald-500 mb-4" />
                    <h2 className="text-xl font-bold mb-2">আজকের কুইজ সম্পন্ন!</h2>
                    <p className="text-muted-foreground">আগামীকাল নতুন প্রশ্নের জন্য ফিরে আসুন</p>
                    <div className="mt-4 p-4 bg-primary/10 rounded-xl">
                      <p className="text-sm">পরবর্তী কুইজ:</p>
                      <p className="text-lg font-bold text-primary">আগামীকাল সকাল ১২:০০</p>
                    </div>
                  </CardContent>
                </Card>
              ) : quizCompleted ? (
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                >
                  <Card className="text-center py-8 bg-gradient-to-br from-primary/10 to-amber-500/10">
                    <CardContent>
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", delay: 0.2 }}
                      >
                        {score === 3 ? (
                          <Crown className="w-20 h-20 mx-auto text-amber-500 mb-4" />
                        ) : score >= 2 ? (
                          <Trophy className="w-20 h-20 mx-auto text-primary mb-4" />
                        ) : (
                          <Star className="w-20 h-20 mx-auto text-blue-500 mb-4" />
                        )}
                      </motion.div>
                      
                      <h2 className="text-2xl font-bold mb-2">
                        {score === 3 ? "পারফেক্ট! 🎉" : score >= 2 ? "অসাধারণ! 👏" : "ভালো চেষ্টা! 💪"}
                      </h2>
                      
                      <p className="text-4xl font-bold text-primary my-4">{score}/3</p>
                      
                      <div className="bg-background/50 rounded-xl p-4 mb-4 space-y-3">
                        <div>
                          <p className="text-sm text-muted-foreground">অর্জিত পয়েন্ট</p>
                          <p className="text-2xl font-bold text-emerald-500">
                            +{score * 10 + (score === 3 ? 20 : 0)}
                          </p>
                          {score === 3 && (
                            <Badge className="mt-2 bg-amber-500">পারফেক্ট বোনাস +20</Badge>
                          )}
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="rounded-lg bg-primary/5 p-3">
                            <p className="text-xs text-muted-foreground">আজকের স্ট্রীক</p>
                            <p className="text-lg font-semibold text-primary">{streak} দিন</p>
                          </div>
                          <div className="rounded-lg bg-emerald-500/5 p-3">
                            <p className="text-xs text-muted-foreground">মোট পয়েন্ট</p>
                            <p className="text-lg font-semibold text-emerald-500">{totalPoints}</p>
                          </div>
                        </div>
                      </div>
                      
                      <p className="text-muted-foreground mb-2">আগামীকাল নতুন প্রশ্নের জন্য ফিরে আসুন!</p>
                      <p className="text-xs text-muted-foreground">
                        ধীরে ধীরে শিখুন, প্রতিদিন সামান্য উন্নতিই সবচেয়ে বড় অগ্রগতি।
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
                      <span>প্রশ্ন {currentQuestionIndex + 1}/3</span>
                      <span>স্কোর: {score}</span>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / 3) * 100} className="h-2" />
                  </div>

                  <Card className="mb-3">
                    <CardHeader>
                      <Badge className="w-fit mb-2">{currentQuestion.category}</Badge>
                      <CardTitle className="text-lg leading-relaxed">
                        {currentQuestion.questionBn}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground">{currentQuestion.question}</p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentQuestion.optionsBn.map((option, index) => (
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
                              <p className="font-medium">{option}</p>
                              <p className="text-xs text-muted-foreground">
                                {currentQuestion.options[index]}
                              </p>
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
                          সঠিক উত্তর ব্যাখ্যা
                        </p>
                        <p className="text-muted-foreground text-[13px]">
                          {currentQuestion.explanationBn}
                        </p>
                        <p className="mt-1 text-[11px] text-muted-foreground/80">
                          {currentQuestion.explanation}
                        </p>
                      </div>
                    </div>
                  )}

                  {!showResult ? (
                    <Button
                      onClick={handleSubmitAnswer}
                      disabled={selectedAnswer === null}
                      className="w-full h-12 text-lg"
                    >
                      উত্তর জমা দিন
                    </Button>
                  ) : (
                    <Button
                      onClick={handleNextQuestion}
                      className="w-full h-12 text-lg bg-gradient-to-r from-primary to-amber-500"
                    >
                      {currentQuestionIndex < 2 ? "পরবর্তী প্রশ্ন" : "ফলাফল দেখুন"}
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
                      <p className="text-sm text-muted-foreground">আপনার র‍্যাংক</p>
                      <p className="text-3xl font-bold">#9</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">আপনার পয়েন্ট</p>
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
                          <p className="text-xs text-muted-foreground">{entry.badges} ব্যাজ</p>
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
              <Card className="mb-4">
                <CardContent className="p-4 text-center">
                  <p className="text-sm text-muted-foreground">অর্জিত ব্যাজ</p>
                  <p className="text-4xl font-bold text-primary">{earnedBadges.length}/{badges.length}</p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-2 gap-3">
                {badges.map((badge, index) => {
                  const isEarned = totalPoints >= badge.requirement;
                  return (
                    <motion.div
                      key={badge.id}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <Card className={`${
                        isEarned 
                          ? "bg-gradient-to-br from-primary/10 to-amber-500/10 border-primary/30" 
                          : "opacity-50 grayscale"
                      }`}>
                        <CardContent className="p-4 text-center">
                          <badge.icon className={`w-12 h-12 mx-auto mb-2 ${badge.color}`} />
                          <p className="font-semibold text-sm">{badge.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {badge.requirement} পয়েন্ট
                          </p>
                          {isEarned && (
                            <Badge className="mt-2 bg-emerald-500">অর্জিত ✓</Badge>
                          )}
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
