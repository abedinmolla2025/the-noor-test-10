import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Flame, Clock } from "lucide-react";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useCountdownToMidnight } from "@/hooks/useCountdownToMidnight";
import { Progress } from "@/components/ui/progress";

export const DailyQuizCard = () => {
  const navigate = useNavigate();
  const { progress, hasPlayedToday } = useQuizProgress();
  const countdown = useCountdownToMidnight();
  const playedToday = hasPlayedToday();
  const accuracy = progress.questionsAnswered > 0 ? Math.round((progress.correctAnswers / progress.questionsAnswered) * 100) : 0;

  return (
    <Card className="group relative overflow-hidden border-border bg-card shadow-card">
      {/* Subtle accent wash */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-24 h-56 w-56 rounded-full bg-primary/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-28 -left-28 h-64 w-64 rounded-full bg-accent/10 blur-3xl transition-opacity duration-300 group-hover:opacity-80"
      />

      <CardContent className="relative p-5 md:p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border bg-background/60 backdrop-blur">
              <Trophy className="h-4 w-4 text-primary" />
            </span>
            <div className="leading-tight">
              <p className="text-xs font-semibold tracking-wide text-muted-foreground">আজকের চ্যালেঞ্জ</p>
              <h3 className="text-base font-semibold text-foreground">Daily Islamic Quiz</h3>
            </div>
          </div>
          <Badge variant="secondary" className="text-[11px] font-semibold">
            ৫ প্রশ্ন
          </Badge>
        </div>

        {/* Body */}
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground leading-relaxed">
            ছোট ছোট কুইজে প্রতিদিন ইসলামিক জ্ঞান বাড়ান—একটা ফোকাসড, পরিষ্কার অভ্যাস।
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border bg-background/40 p-2">
              <p className="text-[11px] text-muted-foreground">Streak</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Flame className="h-3.5 w-3.5 text-accent" />
                <p className="text-sm font-semibold text-foreground">{progress.currentStreak}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-2">
              <p className="text-[11px] text-muted-foreground">Points</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-primary" />
                <p className="text-sm font-semibold text-foreground">{progress.totalPoints}</p>
              </div>
            </div>
            <div className="rounded-xl border border-border bg-background/40 p-2">
              <p className="text-[11px] text-muted-foreground">Accuracy</p>
              <p className="mt-1 text-sm font-semibold text-foreground">{accuracy}%</p>
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>সামগ্রিক প্রগ্রেস</span>
            <span className="font-medium text-foreground">{progress.correctAnswers}/{progress.questionsAnswered || 0}</span>
          </div>
          <Progress value={accuracy} className="h-2" />
        </div>

        {/* CTA */}
        {playedToday ? (
          <div className="rounded-2xl border border-border bg-background/40 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">আজকের কুইজ সম্পন্ন হয়েছে</p>
                <p className="text-xs text-muted-foreground">পরবর্তী কুইজ শুরু হবে</p>
              </div>
              <div className="text-right">
                <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="font-mono text-sm font-semibold text-primary">{countdown}</span>
                </div>
              </div>
            </div>
            <Button onClick={() => navigate("/quiz")} variant="outline" className="w-full" size="lg">
              ফলাফল ও ব্যাজ দেখুন
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => navigate("/quiz")}
            className="w-full shadow-card"
            size="lg"
          >
            কুইজ শুরু করুন
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
