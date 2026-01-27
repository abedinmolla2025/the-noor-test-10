import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap, Flame, Clock } from "lucide-react";
import { useQuizProgress } from "@/hooks/useQuizProgress";
import { useCountdownToMidnight } from "@/hooks/useCountdownToMidnight";
import overlayNew from "@/assets/quiz-brain-quran-overlay.png";
import overlayOld from "@/assets/brain-overlay.png";
import { useIsMobile } from "@/hooks/use-mobile";

type OverlayPreset = {
  opacity?: number;
  widthRem?: number;
  offsetXRem?: number; // right
  offsetYRem?: number; // top
};

export type DailyQuizOverlayTuning = {
  mobile?: OverlayPreset;
  desktop?: OverlayPreset;
};

export type DailyQuizOverlayConfig = {
  enabled?: boolean;
  // If provided (https://...), overrides preset images.
  imageUrl?: string;
  preset?: "old" | "new";
};

type Props = {
  overlayTuning?: DailyQuizOverlayTuning;
  overlayConfig?: DailyQuizOverlayConfig;
  cardClassName?: string;
  /** CSS declarations applied to card root, e.g. "border-radius: 24px;" */
  cardCss?: string;
};

export const DailyQuizCard = ({ overlayTuning, overlayConfig, cardClassName, cardCss }: Props) => {
  const navigate = useNavigate();
  const { progress, hasPlayedToday } = useQuizProgress();
  const countdown = useCountdownToMidnight();
  const playedToday = hasPlayedToday();
  const isMobile = useIsMobile();

  const overlayEnabled = overlayConfig?.enabled ?? true;
  const overlayPreset = overlayConfig?.preset ?? "new";
  const customUrl = typeof overlayConfig?.imageUrl === "string" ? overlayConfig.imageUrl.trim() : "";
  const overlaySrc = /^https?:\/\//i.test(customUrl)
    ? customUrl
    : overlayPreset === "old"
      ? overlayOld
      : overlayNew;

  const css = typeof cardCss === "string" ? cardCss.trim() : "";
  const scopedCss =
    css && !css.includes("{")
      ? `[data-daily-quiz-card]{${css}}`
      : css;

  const defaults: Required<OverlayPreset> = isMobile
    ? { opacity: 0.35, widthRem: 19, offsetXRem: -2, offsetYRem: -2.5 }
    : { opacity: 0.35, widthRem: 22, offsetXRem: -2, offsetYRem: -2.5 };

  const tuningPreset = (isMobile ? overlayTuning?.mobile : overlayTuning?.desktop) ?? {};
  const overlay: Required<OverlayPreset> = {
    opacity: typeof tuningPreset.opacity === "number" ? tuningPreset.opacity : defaults.opacity,
    widthRem: typeof tuningPreset.widthRem === "number" ? tuningPreset.widthRem : defaults.widthRem,
    offsetXRem: typeof tuningPreset.offsetXRem === "number" ? tuningPreset.offsetXRem : defaults.offsetXRem,
    offsetYRem: typeof tuningPreset.offsetYRem === "number" ? tuningPreset.offsetYRem : defaults.offsetYRem,
  };

  return (
    <Card
      data-daily-quiz-card
      className={`relative overflow-hidden border border-primary/35 shadow-glow ring-1 ring-primary/15 backdrop-blur-xl bg-[hsl(var(--card)/0.55)] ${
        // Glass highlight + subtle depth
        "before:pointer-events-none before:absolute before:inset-0 before:z-[0] before:bg-[linear-gradient(135deg,hsl(var(--primary)/0.16)_0%,hsl(var(--background)/0.10)_38%,hsl(var(--accent)/0.12)_100%)] before:opacity-100 " +
        "after:pointer-events-none after:absolute after:inset-0 after:z-[0] after:bg-[radial-gradient(circle_at_20%_15%,hsl(var(--primary)/0.22),transparent_55%)] after:opacity-100 " +
        (cardClassName ?? "")
      }`}
      style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
    >
      {scopedCss ? <style>{scopedCss}</style> : null}

      {/* Ambient overlay */}
      {overlayEnabled ? (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-[1]">
          <img
            src={overlaySrc}
            alt=""
            className="absolute rotate-6 select-none"
            style={{
              right: `${overlay.offsetXRem}rem`,
              top: `${overlay.offsetYRem}rem`,
              width: `${overlay.widthRem}rem`,
              opacity: overlay.opacity,
            }}
            loading="lazy"
            draggable={false}
          />
        </div>
      ) : null}

      <CardContent className="relative z-[2] p-6 space-y-4">
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
        <div className="space-y-3">
          <h3 className="text-xl font-bold text-foreground font-quizBnPremium leading-tight">
            Daily Islamic Quiz
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed font-bangla">
            প্রতিদিন ৫টি ছোট কুইজ, ধীরে ধীরে জ্ঞান বাড়ান
          </p>
          <p className="text-xs text-muted-foreground/80 italic font-quizEnPremium mt-1.5">
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
            className="w-full font-bold shadow-lg bg-[linear-gradient(135deg,hsl(var(--primary))_0%,hsl(var(--accent))_55%,hsl(var(--primary))_100%)] text-primary-foreground hover:opacity-95 tracking-wide"
            size="lg"
          >
            <span className="flex items-center justify-center gap-2.5 font-bangla">
              <span className="text-base">আজকের কুইজ শুরু করুন</span>
              <span className="text-[10px] opacity-90 font-quizEnPremium uppercase tracking-wider">5 Questions</span>
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
