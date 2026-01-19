import { useState, useEffect } from "react";

interface QuizProgress {
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  lastPlayedDate: string;
  questionsAnswered: number;
  correctAnswers: number;
}

const STORAGE_KEY = "noor_quiz_progress";

const getDefaultProgress = (): QuizProgress => ({
  totalPoints: 0,
  currentStreak: 0,
  longestStreak: 0,
  lastPlayedDate: "",
  questionsAnswered: 0,
  correctAnswers: 0,
});

const getTodayString = (): string => {
  return new Date().toISOString().split("T")[0];
};

const getYesterdayString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return yesterday.toISOString().split("T")[0];
};

export const useQuizProgress = () => {
  const [progress, setProgress] = useState<QuizProgress>(getDefaultProgress);
  const [isLoading, setIsLoading] = useState(true);

  // Load progress from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as QuizProgress;
        setProgress(parsed);
      }
    } catch (error) {
      console.error("Failed to load quiz progress:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save progress to localStorage whenever it changes
  const saveProgress = (newProgress: QuizProgress) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProgress));
      setProgress(newProgress);
    } catch (error) {
      console.error("Failed to save quiz progress:", error);
    }
  };

  // Update streak based on when user last played
  const updateStreak = () => {
    const today = getTodayString();
    const yesterday = getYesterdayString();
    const lastPlayed = progress.lastPlayedDate;

    let newStreak = progress.currentStreak;

    if (lastPlayed === today) {
      // Already played today, don't update streak
      return progress.currentStreak;
    } else if (lastPlayed === yesterday || lastPlayed === "") {
      // Played yesterday or first time - increment streak
      newStreak = progress.currentStreak + 1;
    } else {
      // Streak broken - reset to 1
      newStreak = 1;
    }

    return newStreak;
  };

  // Add points when user answers correctly
  const addPoints = (points: number, isCorrect: boolean) => {
    const newStreak = updateStreak();
    const newProgress: QuizProgress = {
      ...progress,
      totalPoints: progress.totalPoints + points,
      currentStreak: newStreak,
      longestStreak: Math.max(newStreak, progress.longestStreak),
      lastPlayedDate: getTodayString(),
      questionsAnswered: progress.questionsAnswered + 1,
      correctAnswers: progress.correctAnswers + (isCorrect ? 1 : 0),
    };

    saveProgress(newProgress);
    return newProgress;
  };

  // Reset progress (for testing or user request)
  const resetProgress = () => {
    const defaultProgress = getDefaultProgress();
    saveProgress(defaultProgress);
  };

  // Check if user has played today
  const hasPlayedToday = () => {
    return progress.lastPlayedDate === getTodayString();
  };

  // Calculate accuracy percentage
  const getAccuracy = () => {
    if (progress.questionsAnswered === 0) return 0;
    return Math.round((progress.correctAnswers / progress.questionsAnswered) * 100);
  };

  return {
    progress,
    isLoading,
    addPoints,
    resetProgress,
    hasPlayedToday,
    getAccuracy,
    updateStreak,
  };
};
