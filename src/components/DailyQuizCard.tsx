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
      className={`relative overflow-hidden border-primary/20 bg-gradient-to-br from-primary/10 via-card to-accent/5 ${
        cardClassName ?? ""
      }`}
      style={{ transform: 'translateZ(0)', WebkitTransform: 'translateZ(0)' }}
    >
      {scopedCss ? <style>{scopedCss}</style> : null}

      {/* Subtle Islamic geometric motif (background texture) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "repeating-conic-gradient(from 20deg, hsl(var(--primary) / 0.08) 0 10deg, transparent 10deg 22deg), repeating-linear-gradient(135deg, hsl(var(--accent) / 0.06) 0 1px, transparent 1px 18px)",
          opacity: 0.9,
          transform: "translateZ(0)",
        }}
      />

      {/* Soft glow vignette */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(520px circle at 18% 22%, hsl(var(--primary) / 0.18), transparent 55%), radial-gradient(520px circle at 92% 18%, hsl(var(--accent) / 0.16), transparent 58%)",
          transform: "translateZ(0)",
        }}
      />

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
              filter: "drop-shadow(0 18px 30px hsl(var(--primary) / 0.18))",
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
            Daily
          </Badge>
        </div>

        {/* Title & Description */}
        <div className="space-y-2">
          <h3 className="text-lg font-bold text-foreground">
            Daily Islamic Quiz • আজকের কুইজ
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            প্রতিদিন ৫টি ছোট প্রশ্ন—ইসলামি জ্ঞান ও অভ্যাস দুটোই গড়ুন।
          </p>
          <p className="text-xs text-muted-foreground/80 italic">
            Build your habit, one day at a time.
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
              শুরু করুন
              <span className="text-xs opacity-90">• Start • 5 Questions</span>
            </span>
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
