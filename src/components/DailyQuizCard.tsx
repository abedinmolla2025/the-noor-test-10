import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Flame, Clock } from "lucide-react";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useCountdownToMidnight } from "@/hooks/useCountdownToMidnight";
import brainOverlay from "@/assets/quiz-brain-quran-overlay.png";

export const DailyQuizCard = () => {
  const navigate = useNavigate();
  const { progress, hasPlayedToday } = useQuizProgress();
  const countdown = useCountdownToMidnight();
  const playedToday = hasPlayedToday();

  return (
    <Card className="relative overflow-hidden border-primary/25 bg-[radial-gradient(120%_100%_at_0%_0%,hsl(var(--primary)/0.28)_0%,transparent_55%),radial-gradient(120%_100%_at_100%_0%,hsl(var(--accent)/0.18)_0%,transparent_52%),linear-gradient(135deg,hsl(var(--card))_0%,hsl(var(--card)/0.70)_100%)]">
      {/* Ambient brain overlay */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_45%,hsl(var(--primary)/0.18)_0%,transparent_70%)]" />
        <img
          src={brainOverlay}
          alt=""
          className="absolute -right-8 -top-10 w-[19rem] sm:w-[22rem] opacity-35 rotate-6 select-none transform-gpu"
          loading="lazy"
          draggable={false}
        />
      </div>

      <CardContent className="relative p-6 space-y-4">
        {/* Header Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-primary" />
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              Daily Challenge
            </span>
          </div>
          <Badge
            variant="secondary"
            className="text-xs font-bold px-2 py-0.5 bg-[hsl(var(--secondary)/0.55)] backdrop-blur"
          >
            PRO
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            Daily Islamic Quiz
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            প্রতিদিন ৫টি ছোট কুইজ, ধীরে ধীরে জ্ঞান বাড়ান
          </p>
          <p className="text-xs text-muted-foreground/80 italic">
            Build your daily Islamic habit
          </p>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/50">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-accent" />
              <span className="font-semibold text-foreground">{progress.currentStreak}</span> day streak
            </span>
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              <span className="font-semibold text-foreground">{progress.totalPoints}</span> pts
            </span>
          </div>
          <span className="font-medium">Daily • 5 Qs</span>
        </div>

        {/* CTA Button */}
        {playedToday ? (
          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-primary/20 bg-[hsl(var(--primary)/0.08)] backdrop-blur">
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-2xl">✅</span>
                <p className="text-sm font-semibold text-foreground">
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
              className="w-full bg-[hsl(var(--card)/0.35)] backdrop-blur border-primary/20 hover:bg-[hsl(var(--card)/0.55)]"
              size="lg"
            >
              ফলাফল এবং ব্যাজ দেখুন
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => navigate("/quiz")}
            className="w-full font-semibold shadow-lg bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--accent))_55%,hsl(var(--primary))_100%)] text-primary-foreground hover:opacity-95"
            size="lg"
          >
            <span className="flex items-center gap-2">
              আজকের কুইজ দিন
              <span className="text-xs opacity-90">• START • 5 QUESTIONS</span>
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
