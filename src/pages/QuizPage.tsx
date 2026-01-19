import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import BottomNavigation from "@/components/BottomNavigation";
import { ArrowLeft, Trophy, Star, Medal, Crown, Zap, CheckCircle2, XCircle, Sparkles, Target, TrendingUp, Clock, Eye, RotateCcw } from "lucide-react";
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
  question_bn?: string;
  question_en?: string;
  options: string[];
  options_bn?: string[];
  options_en?: string[];
  correctAnswer: number;
  category: string;
}

interface LeaderboardEntry {
  rank: number;
  name: string;
  points: number;
  badges: number;
}

// Questions are now loaded from database via useQuery in the component

const leaderboard: LeaderboardEntry[] = [
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

interface QuizAnswer {
  question: Question;
  userAnswer: number;
  isCorrect: boolean;
}

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
        question_bn: q.question_bn || q.question,
        question_en: q.question_en || q.question,
        options: q.options as string[],
        options_bn: q.options_bn as string[] || q.options as string[],
        options_en: q.options_en as string[] || q.options as string[],
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
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswer[]>([]);
  const [showReview, setShowReview] = useState(false);
  const [dailyQuestions, setDailyQuestions] = useState<Question[]>([]);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({ width: window.innerWidth, height: window.innerHeight });
  const [languageMode, setLanguageMode] = useState<LanguageMode>(() => {
    const saved = localStorage.getItem("quizLanguageMode") as LanguageMode | null;
    return saved ?? "mixed";
  });
  const [currentDate, setCurrentDate] = useState(() => new Date().toDateString());
  const [timeLeft, setTimeLeft] = useState(30);
  const [isTimeUp, setIsTimeUp] = useState(false);
  
  const nextButtonRef = useRef<HTMLDivElement>(null);
  const questionCardRef = useRef<HTMLDivElement>(null);

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
    // Get 5 deterministic questions for the current day based on date seed
    const dateSeed = currentDate;
    const shuffled = [...allQuestions].sort(() => {
      const hash = dateSeed.split("").reduce((a, b) => ((a << 5) - a) + b.charCodeAt(0), 0);
      return Math.sin(hash) - 0.5;
    });
    setDailyQuestions(shuffled.slice(0, 5));
    
    // Reset quiz state when date changes (new day = new quiz)
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setTimeLeft(30);
    setIsTimeUp(false);
    setQuizAnswers([]);
    setShowReview(false);
  }, [currentDate, allQuestions]);

  // Timer effect - must be before early returns
  useEffect(() => {
    const currentQuestion = dailyQuestions[currentQuestionIndex];
    
    if (quizCompleted || playedToday || !currentQuestion || showResult) {
      return;
    }

    if (timeLeft === 0) {
      setIsTimeUp(true);
      setShowResult(true);
      playSfx("wrong");
      
      // Scroll to show result
      setTimeout(() => {
        nextButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 300);
      
      // Auto advance to next question after 3 seconds
      const autoNextTimer = setTimeout(() => {
        handleNextQuestion();
      }, 3000);
      
      return () => clearTimeout(autoNextTimer);
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizCompleted, playedToday, currentQuestionIndex, dailyQuestions, showResult]);

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || isTimeUp) return;
    setSelectedAnswer(answerIndex);
  };

  const handleSubmitAnswer = () => {
    if (selectedAnswer === null) return;
    setShowResult(true);
    
    const currentQ = dailyQuestions[currentQuestionIndex];
    const isCorrect = selectedAnswer === currentQ.correctAnswer;
    
    // Store the answer for review
    setQuizAnswers(prev => [...prev, {
      question: currentQ,
      userAnswer: selectedAnswer,
      isCorrect
    }]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSfx("correct");
    } else {
      playSfx("wrong");
    }
    
    // Scroll to next button after short delay
    setTimeout(() => {
      nextButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 300);
  };

  const handleNextQuestion = () => {
    // Scroll to top of question card smoothly
    questionCardRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    
    if (currentQuestionIndex < dailyQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      setSelectedAnswer(null);
      setShowResult(false);
      setTimeLeft(30);
      setIsTimeUp(false);
    } else {
      // Quiz completed - add points for each question
      const earnedPoints = score * 10 + (score === 5 ? 20 : 0); // 10 per correct, +20 bonus for perfect score
      
      // Add points for each correct answer
      for (let i = 0; i < score; i++) {
        addPoints(10, true);
      }
      
      // Add bonus for perfect score
      if (score === 5) {
        addPoints(20, true);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 5000);
      }
      
      setQuizCompleted(true);
      playSfx("result");
    }
  };

  const handleShowReview = () => {
    setShowReview(true);
  };

  const resetQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizAnswers([]);
    setShowReview(false);
    setTimeLeft(30);
    setIsTimeUp(false);
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
                  {score === 5 && showConfetti && (
                    <Confetti
                      width={windowSize.width}
                      height={windowSize.height}
                      recycle={false}
                      numberOfPieces={500}
                      gravity={0.3}
                    />
                  )}
                  
                  {!showReview ? (
                    <Card className={`text-center py-8 relative overflow-hidden ${
                      score === 5 
                        ? "bg-gradient-to-br from-amber-500/20 via-yellow-500/20 to-orange-500/20 border-2 border-amber-500/50" 
                        : "bg-gradient-to-br from-primary/10 to-amber-500/10"
                    }`}>
                      {score === 5 && (
                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-yellow-500/10 to-orange-500/10 animate-pulse" />
                      )}
                      <CardContent className="relative z-10">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.2 }}
                        >
                          {score === 5 ? (
                            <motion.div
                              animate={{
                                rotate: [0, -5, 5, -5, 0],
                                scale: [1, 1.1, 1.1, 1.1, 1],
                              }}
                              transition={{ duration: 0.8, repeat: 2, delay: 0.3 }}
                            >
                              <Crown className="w-24 h-24 mx-auto text-amber-500 mb-4 drop-shadow-2xl" />
                            </motion.div>
                          ) : score >= 3 ? (
                            <Trophy className="w-20 h-20 mx-auto text-primary mb-4" />
                          ) : (
                            <Star className="w-20 h-20 mx-auto text-blue-500 mb-4" />
                          )}
                        </motion.div>
                        
                        <h2 className="text-2xl font-bold mb-2">
                          {score === 5
                            ? "🎉 PERFECT SCORE! 🎉"
                            : score >= 3
                            ? "Great job! 👏"
                            : "Good effort! 💪"}
                        </h2>
                        
                        {score === 5 && (
                          <p className="text-lg text-amber-600 dark:text-amber-400 font-semibold mb-2 animate-pulse">
                            ⭐ You're a Quiz Champion! ⭐
                          </p>
                        )}
                        
                        <p className="text-4xl font-bold text-primary my-4">{score}/5</p>
                        
                        <div className="bg-background/50 rounded-xl p-4 mb-4 space-y-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Points earned</p>
                            <p className="text-2xl font-bold text-emerald-500">
                              +{score * 10 + (score === 5 ? 20 : 0)}
                            </p>
                            {score === 5 && (
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

                        <div className="flex gap-3 justify-center mt-6">
                          <Button
                            onClick={handleShowReview}
                            size="lg"
                            className="gap-2"
                          >
                            <Eye className="w-4 h-4" />
                            Review Answers
                          </Button>
                          <Button
                            onClick={resetQuiz}
                            variant="outline"
                            size="lg"
                            className="gap-2"
                          >
                            <RotateCcw className="w-4 h-4" />
                            Reset Quiz
                          </Button>
                        </div>

                        <p className="text-muted-foreground text-sm mt-4">প্রতিদিন একটু একটু উন্নতিই বড় পরিবর্তন আনে।</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-4"
                    >
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Quiz Review</h2>
                        <Button
                          onClick={() => setShowReview(false)}
                          variant="outline"
                          size="sm"
                        >
                          <ArrowLeft className="w-4 h-4 mr-2" />
                          Back
                        </Button>
                      </div>

                      {quizAnswers.map((answer, index) => (
                        <Card key={index} className="p-4">
                          <div className="space-y-3">
                            <div className="flex items-start gap-3">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                                answer.isCorrect ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                              }`}>
                                {answer.isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                              </div>
                              <div className="flex-1">
                                <div className="mb-3">
                                  <Badge variant="outline" className="mb-2">প্রশ্ন {index + 1}</Badge>
                                  <p className="font-semibold text-lg font-bangla">
                                    {answer.question.question}
                                  </p>
                                </div>
                                
                                <div className="space-y-2">
                                  {answer.question.options.map((option: string, optIndex: number) => {
                                    const isUserAnswer = optIndex === answer.userAnswer;
                                    const isCorrectAnswer = optIndex === answer.question.correctAnswer;
                                    
                                    return (
                                      <div
                                        key={optIndex}
                                        className={`p-3 rounded-lg border-2 ${
                                          isCorrectAnswer
                                            ? 'bg-green-50 border-green-500 text-green-700'
                                            : isUserAnswer && !answer.isCorrect
                                            ? 'bg-red-50 border-red-500 text-red-700'
                                            : 'bg-muted/30 border-transparent'
                                        }`}
                                      >
                                        <div className="flex items-center gap-2">
                                          {isCorrectAnswer && (
                                            <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                                          )}
                                          {isUserAnswer && !answer.isCorrect && (
                                            <XCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                                          )}
                                          <span className="font-bangla">
                                            {option}
                                          </span>
                                          {isCorrectAnswer && (
                                            <span className="ml-auto text-xs font-semibold text-green-600">সঠিক</span>
                                          )}
                                          {isUserAnswer && !answer.isCorrect && (
                                            <span className="ml-auto text-xs font-semibold text-red-600">আপনার উত্তর</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}

                      <div className="flex justify-center pt-4">
                        <Button
                          onClick={resetQuiz}
                          variant="outline"
                          size="lg"
                          className="gap-2"
                        >
                          <RotateCcw className="w-4 h-4" />
                          Reset Quiz
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ) : currentQuestion ? (
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ x: 50, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  exit={{ x: -50, opacity: 0 }}
                >
                  {/* Progress & Timer */}
                  <div ref={questionCardRef} className="mb-4 space-y-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Question {currentQuestionIndex + 1}/5</span>
                      <span>Score: {score}</span>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / 5) * 100} className="h-2" />
                    
                    {/* Timer with Progress Bar */}
                    <div className="space-y-2">
                      <div className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${
                        timeLeft <= 5 
                          ? "bg-red-500/10 border-red-500/50" 
                          : timeLeft <= 10
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-primary/10 border-primary/20"
                      }`}>
                        <Clock className={`w-5 h-5 ${
                          timeLeft <= 5 ? "text-red-500" : timeLeft <= 10 ? "text-amber-500" : "text-primary"
                        }`} />
                        <span className={`text-2xl font-bold font-mono ${
                          timeLeft <= 5 ? "text-red-500" : timeLeft <= 10 ? "text-amber-500" : "text-primary"
                        }`}>
                          {timeLeft}s
                        </span>
                      </div>
                      
                      {/* Animated Progress Bar */}
                      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className={`h-full rounded-full ${
                            timeLeft <= 5 
                              ? "bg-gradient-to-r from-red-500 to-red-600" 
                              : timeLeft <= 10
                              ? "bg-gradient-to-r from-amber-500 to-amber-600"
                              : "bg-gradient-to-r from-primary to-emerald-500"
                          }`}
                          initial={{ width: "100%" }}
                          animate={{ 
                            width: `${(timeLeft / 30) * 100}%`,
                          }}
                          transition={{ 
                            duration: 0.5,
                            ease: "easeInOut"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <Card className="mb-3">
                    <CardHeader>
                      <CardTitle className="text-xl leading-relaxed">
                        {languageMode === "bn" && (
                          <span className="font-bangla text-2xl leading-relaxed">
                            {currentQuestion.question_bn || currentQuestion.question}
                          </span>
                        )}
                        {languageMode === "en" && (
                          <span className="font-serif text-lg">
                            {currentQuestion.question_en || currentQuestion.question}
                          </span>
                        )}
                        {languageMode === "mixed" && (
                          <div className="space-y-2">
                            <p className="font-bangla text-2xl leading-relaxed">
                              {currentQuestion.question_bn || currentQuestion.question}
                            </p>
                            <p className="text-sm text-muted-foreground font-serif">
                              {currentQuestion.question_en || currentQuestion.question}
                            </p>
                          </div>
                        )}
                      </CardTitle>
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
                            <div className="flex-1">
                              {languageMode === "bn" && (
                                <p className="font-bangla text-lg leading-snug">
                                  {currentQuestion.options_bn?.[index] || option}
                                </p>
                              )}
                              {languageMode === "en" && (
                                <p className="font-serif text-base">
                                  {currentQuestion.options_en?.[index] || option}
                                </p>
                              )}
                              {languageMode === "mixed" && (
                                <div className="space-y-1">
                                  <p className="font-bangla text-lg leading-snug">
                                    {currentQuestion.options_bn?.[index] || option}
                                  </p>
                                  <p className="text-xs text-muted-foreground font-serif">
                                    {currentQuestion.options_en?.[index] || option}
                                  </p>
                                </div>
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
                    <div className={`rounded-xl border p-4 text-sm ${
                      isTimeUp 
                        ? "border-red-500/30 bg-red-500/5"
                        : selectedAnswer === currentQuestion.correctAnswer
                        ? "border-emerald-500/30 bg-emerald-500/5"
                        : "border-amber-500/30 bg-amber-500/5"
                    }`}>
                      <p className="font-semibold flex items-center gap-2 mb-2">
                        {isTimeUp ? (
                          <>
                            <Clock className="w-4 h-4 text-red-500" />
                            <span className="text-red-600 dark:text-red-400">Time's up!</span>
                          </>
                        ) : selectedAnswer === currentQuestion.correctAnswer ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                            <span className="text-emerald-600 dark:text-emerald-400">Correct answer!</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-4 h-4 text-amber-500" />
                            <span className="text-amber-600 dark:text-amber-400">Wrong answer</span>
                          </>
                        )}
                      </p>
                       <p className="text-muted-foreground text-sm">
                        {isTimeUp 
                          ? languageMode === "bn" ? "সময় শেষ! সঠিক উত্তর দেখানো হচ্ছে।" 
                            : languageMode === "en" ? "Time's up! Showing correct answer."
                            : "সময় শেষ! সঠিক উত্তর দেখানো হচ্ছে। / Time's up!"
                          : selectedAnswer === currentQuestion.correctAnswer
                          ? languageMode === "bn" ? "সঠিক! ✓"
                            : languageMode === "en" ? "Correct! ✓"
                            : "সঠিক! ✓ / Correct!"
                          : languageMode === "bn" ? "ভুল উত্তর। সঠিক উত্তর দেখানো হচ্ছে।"
                            : languageMode === "en" ? "Wrong answer. Showing correct answer."
                            : "ভুল উত্তর। সঠিক উত্তর দেখানো হচ্ছে। / Wrong answer."
                        }
                      </p>
                      {isTimeUp && (
                        <p className="text-xs text-muted-foreground mt-2 font-medium">
                          Auto-advancing in 3 seconds...
                        </p>
                      )}
                    </div>
                  </div>
                )}

                  <div ref={nextButtonRef}>
                    {!showResult ? (
                      <Button
                        onClick={handleSubmitAnswer}
                        disabled={selectedAnswer === null || isTimeUp}
                        className="w-full h-12 text-lg"
                      >
                        Submit answer
                      </Button>
                    ) : !isTimeUp ? (
                      <Button
                        onClick={handleNextQuestion}
                        className="w-full h-12 text-lg bg-gradient-to-r from-primary to-amber-500"
                      >
                        {currentQuestionIndex < 4 ? "Next question" : "View result"}
                      </Button>
                    ) : null}
                  </div>
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
                {leaderboard.map((entry, index) => (
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
