import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Flame, Clock } from "lucide-react";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useCountdownToMidnight } from "@/hooks/useCountdownToMidnight";

export const DailyQuizCard = () => {
  const navigate = useNavigate();
  const { progress, hasPlayedToday } = useQuizProgress();
  const countdown = useCountdownToMidnight();
  const playedToday = hasPlayedToday();

  return (
    <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card to-card/50">
      <CardContent className="p-6 space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Daily Challenge
            </span>
          </div>
          <Badge variant="secondary" className="text-xs font-bold px-2 py-0.5">
            PRO
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            Daily Islamic Quiz
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            প্রতিদিন ৩টি ছোট কুইজ, ধীরে ধীরে জ্ঞান বাড়ান
          </p>
          <p className="text-xs text-muted-foreground/80 italic">
            Build your daily Islamic habit
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-orange-500" />
              <span className="font-semibold text-foreground">{progress.currentStreak}</span> day streak
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="font-semibold text-foreground">{progress.totalPoints}</span> pts
            </span>
          </div>
          <span className="font-medium">Daily • 3 Qs</span>
        </div>

        {/* CTA Button */}
        {playedToday ? (
          <div className="space-y-3">
            <div className="p-3 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  আজকের কুইজ সম্পূর্ণ!
                </p>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Clock className="w-3 h-3 text-muted-foreground" />
                <p className="text-xs text-muted-foreground">পরবর্তী কুইজ:</p>
                <p className="text-sm font-bold text-primary font-mono">{countdown}</p>
              </div>
            </div>
            <Button
              onClick={() => navigate("/quiz")}
              variant="outline"
              className="w-full"
              size="lg"
            >
              ফলাফল এবং ব্যাজ দেখুন
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => navigate("/quiz")}
            className="w-full bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg"
            size="lg"
          >
            <span className="flex items-center gap-2">
              আজকের কুইজ দিন
              <span className="text-xs opacity-90">• START • 3 QUESTIONS</span>
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
