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
import { hapticImpact, hapticNotification } from "@/lib/haptics";

interface Question {
  question: string;
  question_bn?: string | null;
  question_en?: string | null;
  options: string[];
  options_bn?: string[] | null;
  options_en?: string[] | null;
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

const QUIZ_WARNING_SOUNDS_MUTED_KEY = "quizWarningSoundsMuted";

type HapticType = "success" | "error";

const triggerHaptic = (type: HapticType) => {
  // Fire-and-forget; native (Capacitor) + web fallback handled in helper.
  void (type === "success" ? hapticNotification("success") : hapticNotification("error"));
  void (type === "success" ? hapticImpact("light") : hapticImpact("medium"));
};

const QuizPage = () => {
  const navigate = useNavigate();
  const countdown = useCountdownToMidnight();

  const nextButtonRef = useRef<HTMLDivElement | null>(null);
  const submitAutoNextTimerRef = useRef<number | null>(null);
  const submitScrollTimerRef = useRef<number | null>(null);
  
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
        question_bn: (q as any).question_bn ?? null,
        question_en: (q as any).question_en ?? null,
        options: q.options as string[],
        options_bn: ((q as any).options_bn as string[] | null) ?? null,
        options_en: ((q as any).options_en as string[] | null) ?? null,
        correctAnswer: q.correct_answer,
        category: q.category,
      }));
    },
    staleTime: 5 * 60 * 1000,
  });

  const getQuestionText = (q: Question, mode: LanguageMode) => {
    if (mode === "bn") return q.question_bn || q.question;
    if (mode === "en") return q.question_en || q.question;
    // mixed: prefer Bangla when available, otherwise fall back to English/base
    return q.question_bn || q.question_en || q.question;
  };

  const getQuestionTextSecondary = (q: Question) => {
    return q.question_en || q.question;
  };

  const getOptionText = (q: Question, optionFallback: string, index: number, mode: LanguageMode) => {
    if (mode === "bn") return q.options_bn?.[index] || optionFallback;
    if (mode === "en") return q.options_en?.[index] || optionFallback;
    // mixed: prefer Bangla when available, otherwise fall back to English/base
    return q.options_bn?.[index] || q.options_en?.[index] || optionFallback;
  };

  const getOptionTextSecondary = (q: Question, optionFallback: string, index: number) => {
    return q.options_en?.[index] || optionFallback;
  };

  const isMixedPrimaryBangla = (q: Question) => {
    const bn = (q.question_bn ?? "").trim();
    if (!bn) return false;
    // If Bangla value equals the English/base value, treat it as not-a-translation
    const enOrBase = (q.question_en ?? q.question ?? "").trim();
    return bn !== enOrBase;
  };

  const isMixedPrimaryBanglaOption = (q: Question, index: number) => {
    const bn = (q.options_bn?.[index] ?? "").trim();
    if (!bn) return false;
    const enOrBase = (q.options_en?.[index] ?? (q.options?.[index] as string) ?? "").trim();
    return bn !== enOrBase;
  };

  const shouldShowMixedSecondaryQuestion = (q: Question) => {
    const en = (q.question_en ?? "").trim();
    if (!en) return false;
    const primary = getQuestionText(q, "mixed").trim();
    return en !== primary;
  };

  const shouldShowMixedSecondaryOption = (q: Question, index: number) => {
    const en = (q.options_en?.[index] ?? "").trim();
    if (!en) return false;
    const primary = getOptionText(q, (q.options?.[index] as string) ?? "", index, "mixed").trim();
    return en !== primary;
  };
  
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
  const [resultProgress, setResultProgress] = useState(0);
  const resultMetaRef = useRef<{ startedAt: number; durationMs: number } | null>(null);
  const [showResultBurst, setShowResultBurst] = useState(false);
  const resultBurstTimerRef = useRef<number | null>(null);

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
    const hasBnPack = (q: any) => !!q.question_bn && Array.isArray(q.options_bn) && q.options_bn.length === 4;
    const hasEnPack = (q: any) => !!q.question_en && Array.isArray(q.options_en) && q.options_en.length === 4;

    // Prefer language-specific packs when switching language.
    // - bn: only questions that have Bangla fields
    // - en: only questions that have English fields
    // - mixed: only questions that have BOTH (so mixed can show bn big + en small)
    const preferredPool =
      languageMode === "bn"
        ? allQuestions.filter(hasBnPack)
        : languageMode === "en"
        ? allQuestions.filter(hasEnPack)
        : allQuestions.filter((q) => hasBnPack(q) && hasEnPack(q));

    const pool = preferredPool.length >= 5 ? preferredPool : allQuestions;

    const shuffled = [...pool].sort(() => {
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
  }, [currentDate, allQuestions, languageMode]);

  // Timer effect - must be before early returns
  useEffect(() => {
    const currentQuestion = dailyQuestions[currentQuestionIndex];
    
    if (quizCompleted || playedToday || !currentQuestion || showResult) {
      return;
    }

    // Warning sounds (web only)
    const muted = localStorage.getItem(QUIZ_WARNING_SOUNDS_MUTED_KEY) === "true";
    if (!muted) {
      if (timeLeft === 10) playSfx("warn10");
      if (timeLeft === 5) playSfx("warn5");
    }

    if (timeLeft === 0) {
      setIsTimeUp(true);
      setShowResult(true);
      playSfx("wrong");
      triggerHaptic("error");

      // Result popup countdown (time-up uses 3s)
      resultMetaRef.current = { startedAt: Date.now(), durationMs: 3000 };
      setResultProgress(0);
      
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

  // Result popup progress bar updater
  useEffect(() => {
    if (!showResult) return;
    const meta = resultMetaRef.current;
    if (!meta) return;

    const tick = () => {
      const elapsed = Date.now() - meta.startedAt;
      const p = Math.min(100, Math.max(0, (elapsed / meta.durationMs) * 100));
      setResultProgress(p);
    };

    tick();
    const id = window.setInterval(tick, 40);
    return () => window.clearInterval(id);
  }, [showResult, currentQuestionIndex]);

  // Popup micro-effects (confetti on correct; shake on wrong is handled in motion props)
  useEffect(() => {
    if (!showResult) return;
    const q = dailyQuestions[currentQuestionIndex];
    if (!q) return;

    // confetti only for answered questions (not time-up)
    const isCorrect = !isTimeUp && selectedAnswer !== null && selectedAnswer === q.correctAnswer;
    if (!isCorrect) return;

    setShowResultBurst(true);
    if (resultBurstTimerRef.current) window.clearTimeout(resultBurstTimerRef.current);
    resultBurstTimerRef.current = window.setTimeout(() => setShowResultBurst(false), 550);

    return () => {
      if (resultBurstTimerRef.current) window.clearTimeout(resultBurstTimerRef.current);
    };
  }, [showResult, currentQuestionIndex, isTimeUp, selectedAnswer, dailyQuestions]);

  const submitAnswer = (answerIndex: number) => {
    if (showResult || isTimeUp) return;
    setShowResult(true);
    
    const currentQ = dailyQuestions[currentQuestionIndex];
    const isCorrect = answerIndex === currentQ.correctAnswer;
    
    // Store the answer for review
    setQuizAnswers(prev => [...prev, {
      question: currentQ,
      userAnswer: answerIndex,
      isCorrect
    }]);
    
    if (isCorrect) {
      setScore(prev => prev + 1);
      playSfx("correct");
      triggerHaptic("success");
    } else {
      playSfx("wrong");
      triggerHaptic("error");
    }

    // Result popup countdown (answer select uses 1.5s)
    resultMetaRef.current = { startedAt: Date.now(), durationMs: 1500 };
    setResultProgress(0);

    // Clear any previous scheduled actions
    if (submitAutoNextTimerRef.current) window.clearTimeout(submitAutoNextTimerRef.current);
    if (submitScrollTimerRef.current) window.clearTimeout(submitScrollTimerRef.current);

    // Scroll to the action area (top of screen)
    submitScrollTimerRef.current = window.setTimeout(() => {
      nextButtonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 250);

    // Auto-go to next question (no Next button)
    submitAutoNextTimerRef.current = window.setTimeout(() => {
      handleNextQuestion();
    }, 1500);
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (showResult || isTimeUp) return;
    setSelectedAnswer(answerIndex);

    // Always auto-submit on select (no submit button)
    submitAnswer(answerIndex);
  };

  useEffect(() => {
    return () => {
      if (submitAutoNextTimerRef.current) window.clearTimeout(submitAutoNextTimerRef.current);
      if (submitScrollTimerRef.current) window.clearTimeout(submitScrollTimerRef.current);
      if (resultBurstTimerRef.current) window.clearTimeout(resultBurstTimerRef.current);
    };
  }, []);

  const handleNextQuestion = () => {
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

  const availableBnCount = allQuestions.filter((q) => !!q.question_bn).length;
  const availableEnCount = allQuestions.filter((q) => !!q.question_en).length;
  const availableMixedCount = allQuestions.filter((q) => !!q.question_bn && !!q.question_en).length;

  return (
    <div className="min-h-screen quiz-page-bg pb-24">
      {/* Header */}
      <div className="sticky top-0 z-10 border-b border-border/50 quiz-glass">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate("/")}
            className="p-2 rounded-full bg-muted/50 hover:bg-muted transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Daily Quiz
          </h1>
          <div className="flex items-center gap-2 rounded-full border px-3 py-1.5 quiz-glass quiz-glass-accent">
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
                className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl border transition-all ${
                  activeTab === tab.id
                    ? "bg-primary text-primary-foreground shadow-card border-primary/20"
                    : "quiz-glass hover:shadow-soft"
                }`}
            >
              <tab.icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Language Toggle (Quiz only) */}
        {activeTab === "quiz" && (
          <div className="px-4 pb-3 text-xs">
            <div className="flex items-center justify-between">
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

            {languageMode === "bn" && availableBnCount < 5 && (
              <p className="mt-2 text-muted-foreground">
                বাংলা প্রশ্ন এখন কম আছে ({availableBnCount} টি)। কিছু প্রশ্ন fallback হিসেবে English থেকে আসতে পারে।
              </p>
            )}
            {languageMode === "en" && availableEnCount < 5 && (
              <p className="mt-2 text-muted-foreground">
                English প্রশ্ন এখন কম আছে ({availableEnCount} টি)। কিছু প্রশ্ন fallback হিসেবে অন্য ভাষা থেকে আসতে পারে।
              </p>
            )}
            {languageMode === "mixed" && availableMixedCount < 5 && (
              <p className="mt-2 text-muted-foreground">
                Mixed mode চালাতে Bangla+English দুটোই দরকার। এখন আছে ({availableMixedCount} টি), তাই কিছু প্রশ্ন single-language হতে পারে।
              </p>
            )}
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
              <Card className="mb-4 border quiz-glass quiz-glass-accent">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="text-center p-3 rounded-xl bg-primary/10 border border-primary/10">
                      <p className="text-2xl font-bold text-primary">{progress.currentStreak}</p>
                      <p className="text-xs text-muted-foreground">Day Streak 🔥</p>
                    </div>
                    <div className="text-center p-3 rounded-xl bg-accent/15 border border-accent/15">
                      <p className="text-2xl font-bold text-accent">{earnedBadges.length}</p>
                      <p className="text-xs text-muted-foreground">Badges</p>
                    </div>
                  </div>
                    <div className="grid grid-cols-3 gap-2">
                      <div className="text-center p-2 rounded-lg bg-primary/10 border border-primary/10">
                      <div className="flex items-center justify-center gap-1 mb-1">
                          <Zap className="w-3 h-3 text-primary" />
                      </div>
                        <p className="text-lg font-bold text-primary">{progress.totalPoints}</p>
                      <p className="text-[10px] text-muted-foreground">Points</p>
                    </div>
                      <div className="text-center p-2 rounded-lg bg-muted/60 border border-border/60">
                      <div className="flex items-center justify-center gap-1 mb-1">
                          <Target className="w-3 h-3 text-foreground/70" />
                      </div>
                        <p className="text-lg font-bold text-foreground">{getAccuracy()}%</p>
                      <p className="text-[10px] text-muted-foreground">Accuracy</p>
                    </div>
                      <div className="text-center p-2 rounded-lg bg-muted/60 border border-border/60">
                      <div className="flex items-center justify-center gap-1 mb-1">
                          <TrendingUp className="w-3 h-3 text-foreground/70" />
                      </div>
                        <p className="text-lg font-bold text-foreground">{progress.longestStreak}</p>
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
                                  <div>
                                    {languageMode === "bn" || (languageMode === "mixed" && isMixedPrimaryBangla(answer.question)) ? (
                                      <p className="quiz-text-bn text-lg font-medium">
                                        {getQuestionText(answer.question, languageMode)}
                                      </p>
                                    ) : (
                                      <p className="quiz-text-en text-lg font-semibold">
                                        {getQuestionText(answer.question, languageMode)}
                                      </p>
                                    )}
                                    {languageMode === "mixed" && isMixedPrimaryBangla(answer.question) && (
                                      <p className="quiz-text-en-secondary mt-1 text-xs">
                                        {getQuestionTextSecondary(answer.question)}
                                      </p>
                                    )}
                                  </div>
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
                                          <div className="flex-1">
                                            <span
                                              className={
                                                languageMode === "bn" ||
                                                (languageMode === "mixed" && isMixedPrimaryBanglaOption(answer.question, optIndex))
                                                  ? "quiz-text-bn font-medium"
                                                  : "quiz-text-en font-medium"
                                              }
                                            >
                                              {getOptionText(answer.question, option, optIndex, languageMode)}
                                            </span>
                                            {languageMode === "mixed" && isMixedPrimaryBanglaOption(answer.question, optIndex) && (
                                              <p className="quiz-text-en-secondary text-xs mt-0.5">
                                                {getOptionTextSecondary(answer.question, option, optIndex)}
                                              </p>
                                            )}
                                          </div>
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
                  <div ref={nextButtonRef} />
                  {/* Progress & Timer */}
                  <div className="mb-4 space-y-3">
                    <div className="flex justify-between text-sm mb-2">
                      <span>Question {currentQuestionIndex + 1}/5</span>
                      <span>Score: {score}</span>
                    </div>
                    <Progress value={((currentQuestionIndex + 1) / 5) * 100} className="h-2" />
                    
                    {/* Timer with Progress Bar */}
                    <div
                      className={`rounded-xl border-2 transition-all ${
                        timeLeft <= 5
                          ? "bg-red-500/10 border-red-500/50"
                          : timeLeft <= 10
                          ? "bg-amber-500/10 border-amber-500/50"
                          : "bg-emerald-500/10 border-emerald-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2 p-3">
                        <Clock
                          className={`w-5 h-5 ${
                            timeLeft <= 5
                              ? "text-red-500"
                              : timeLeft <= 10
                              ? "text-amber-500"
                              : "text-emerald-500"
                          }`}
                        />
                        <span
                          className={`text-2xl font-bold font-mono ${
                            timeLeft <= 5
                              ? "text-red-500"
                              : timeLeft <= 10
                              ? "text-amber-500"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {timeLeft}s
                        </span>
                      </div>

                      {/* Animated Progress Bar (fills/empties with time) */}
                      <div className="px-3 pb-3">
                        <div className="h-2 w-full overflow-hidden rounded-full bg-muted/60">
                          <motion.div
                            aria-hidden="true"
                            className={`h-full rounded-full ${
                              timeLeft <= 5
                                ? "bg-destructive"
                                : timeLeft <= 10
                                ? "bg-accent"
                                : "bg-emerald-500"
                            }`}
                            animate={{ width: `${Math.max(0, Math.min(100, (timeLeft / 30) * 100))}%` }}
                            transition={{ duration: 0.25, ease: "easeOut" }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <Card className="mb-3">
                    <CardHeader>
                      <CardTitle className="text-xl leading-relaxed">
                        {languageMode === "bn" || (languageMode === "mixed" && isMixedPrimaryBangla(currentQuestion)) ? (
                          <span className="quiz-text-bn text-2xl md:text-3xl font-medium">
                            {getQuestionText(currentQuestion, languageMode)}
                          </span>
                        ) : (
                          <span className="quiz-text-en text-lg md:text-xl font-semibold">
                            {getQuestionText(currentQuestion, languageMode)}
                          </span>
                        )}
                      </CardTitle>
                      {languageMode === "bn" && !currentQuestion.question_bn && (
                        <p className="mt-2 text-xs text-muted-foreground">
                          বাংলা অনুবাদ নেই — এই প্রশ্নটি fallback হিসেবে দেখানো হচ্ছে।
                        </p>
                      )}
                      {languageMode === "mixed" && isMixedPrimaryBangla(currentQuestion) && shouldShowMixedSecondaryQuestion(currentQuestion) && (
                        <div className="mt-1 space-y-0.5">
                          <p className="quiz-text-en-secondary text-sm md:text-xs">
                            {getQuestionTextSecondary(currentQuestion)}
                          </p>
                        </div>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {currentQuestion.options.map((option, index) => (
                      <motion.button
                          key={index}
                          whileTap={{ scale: 0.98 }}
                          animate={
                            showResult && selectedAnswer === index
                              ? index === currentQuestion.correctAnswer
                                ? { scale: [1, 1.04, 1] }
                                : { x: [0, -8, 8, -6, 6, 0] }
                              : undefined
                          }
                          transition={{ duration: 0.35 }}
                          onClick={() => handleAnswerSelect(index)}
                          disabled={showResult}
                        className={`w-full p-4 text-left quiz-option ${
                          showResult
                            ? index === currentQuestion.correctAnswer
                              ? "quiz-option-correct"
                              : selectedAnswer === index
                              ? "quiz-option-wrong"
                              : "opacity-80"
                            : selectedAnswer === index
                            ? "quiz-option-selected"
                            : ""
                        }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p
                                className={`leading-snug ${
                                  languageMode === "bn" ||
                                  (languageMode === "mixed" && isMixedPrimaryBanglaOption(currentQuestion, index))
                                    ? "quiz-text-bn text-lg font-medium"
                                    : "quiz-text-en text-sm font-medium"
                                }`}
                              >
                                {getOptionText(currentQuestion, option, index, languageMode)}
                              </p>
                              {languageMode === "mixed" &&
                                isMixedPrimaryBanglaOption(currentQuestion, index) &&
                                shouldShowMixedSecondaryOption(currentQuestion, index) && (
                                <p className="quiz-text-en-secondary text-xs mt-0.5">
                                  {getOptionTextSecondary(currentQuestion, option, index)}
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

                {/* Result popup (shows before moving to next question) */}
                <AnimatePresence>
                  {showResult && currentQuestion && (
                    <motion.div
                      key={`result-${currentQuestionIndex}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-background/70 backdrop-blur-sm"
                      aria-live="polite"
                      role="status"
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.96, y: 10 }}
                        animate={{
                          opacity: 1,
                          scale: 1,
                          y: 0,
                          ...(isTimeUp || (selectedAnswer !== null && selectedAnswer !== currentQuestion.correctAnswer)
                            ? { x: [0, -10, 10, -8, 8, 0] }
                            : {}),
                        }}
                        exit={{ opacity: 0, scale: 0.98, y: 10 }}
                        transition={{ duration: 0.18 }}
                        className="relative w-[min(92vw,440px)] overflow-hidden rounded-2xl border bg-card shadow-lg"
                      >
                        {/* Top accent */}
                        <div
                          className={`h-1.5 w-full ${
                            isTimeUp
                              ? "bg-destructive"
                              : selectedAnswer === currentQuestion.correctAnswer
                              ? "bg-primary"
                              : "bg-destructive"
                          }`}
                        />

                        <div className="p-5">
                          {/* Small confetti burst (correct only) */}
                          {showResultBurst && !isTimeUp && selectedAnswer === currentQuestion.correctAnswer && (
                            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                              <Confetti
                                width={440}
                                height={260}
                                numberOfPieces={70}
                                recycle={false}
                                gravity={0.45}
                                initialVelocityY={12}
                                confettiSource={{ x: 220, y: 10, w: 10, h: 10 }}
                              />
                            </div>
                          )}

                          <div className="flex items-start gap-3">
                            <div
                              className={`mt-0.5 inline-flex h-11 w-11 items-center justify-center rounded-xl border ${
                                isTimeUp
                                  ? "border-destructive/30 bg-destructive/10"
                                  : selectedAnswer === currentQuestion.correctAnswer
                                  ? "border-primary/30 bg-primary/10"
                                  : "border-destructive/30 bg-destructive/10"
                              }`}
                            >
                              {isTimeUp ? (
                                <Clock className="h-5 w-5 text-destructive" />
                              ) : selectedAnswer === currentQuestion.correctAnswer ? (
                                <CheckCircle2 className="h-5 w-5 text-primary" />
                              ) : (
                                <XCircle className="h-5 w-5 text-destructive" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-base font-semibold leading-snug">
                              {isTimeUp
                                ? languageMode === "bn"
                                  ? "সময় শেষ!"
                                  : languageMode === "en"
                                  ? "Time's up!"
                                  : "সময় শেষ! / Time's up!"
                                : selectedAnswer === currentQuestion.correctAnswer
                                ? languageMode === "bn"
                                  ? "সঠিক উত্তর!"
                                  : languageMode === "en"
                                  ? "Correct!"
                                  : "সঠিক! / Correct!"
                                : languageMode === "bn"
                                ? "ভুল উত্তর"
                                : languageMode === "en"
                                ? "Wrong"
                                : "ভুল / Wrong"}
                            </p>
                            <p
                              className={`mt-1 text-sm text-muted-foreground ${
                                languageMode === "bn" || languageMode === "mixed" ? "font-bangla" : "font-quizEn"
                              }`}
                            >
                              {isTimeUp
                                ? "সময় শেষ! সঠিক উত্তর দেখানো হচ্ছে।"
                                : selectedAnswer === currentQuestion.correctAnswer
                                ? "সঠিক! ✓"
                                : "ভুল উত্তর। সঠিক উত্তর দেখানো হচ্ছে।"}
                            </p>

                              {/* Correct answer preview (more professional/clear) */}
                              <div className="mt-4 rounded-xl border bg-muted/30 p-3">
                                <p className="text-xs font-medium text-muted-foreground">
                                  {languageMode === "bn"
                                    ? "সঠিক উত্তর"
                                    : languageMode === "en"
                                    ? "Correct answer"
                                    : "সঠিক উত্তর / Correct answer"}
                                </p>
                                <p
                                  className={`mt-1 leading-snug ${
                                    languageMode === "bn" ||
                                    (languageMode === "mixed" &&
                                      isMixedPrimaryBanglaOption(currentQuestion, currentQuestion.correctAnswer))
                                      ? "quiz-text-bn text-base font-medium"
                                      : "quiz-text-en text-sm font-medium"
                                  }`}
                                >
                                  {getOptionText(
                                    currentQuestion,
                                    currentQuestion.options[currentQuestion.correctAnswer],
                                    currentQuestion.correctAnswer,
                                    languageMode,
                                  )}
                                </p>
                                {languageMode === "mixed" &&
                                  isMixedPrimaryBanglaOption(currentQuestion, currentQuestion.correctAnswer) &&
                                  shouldShowMixedSecondaryOption(currentQuestion, currentQuestion.correctAnswer) && (
                                    <p className="quiz-text-en-secondary text-xs mt-0.5">
                                      {getOptionTextSecondary(
                                        currentQuestion,
                                        currentQuestion.options[currentQuestion.correctAnswer],
                                        currentQuestion.correctAnswer,
                                      )}
                                    </p>
                                  )}
                              </div>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
                              <span>
                                {languageMode === "bn"
                                  ? "পরবর্তী প্রশ্ন"
                                  : languageMode === "en"
                                  ? "Next question"
                                  : "পরবর্তী প্রশ্ন / Next"}
                              </span>
                              <span>{Math.max(0, Math.round(100 - resultProgress))}%</span>
                            </div>
                            <Progress value={resultProgress} className="h-2" />
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                  {/* (inline “moving to next” removed; popup handles feedback) */}
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
