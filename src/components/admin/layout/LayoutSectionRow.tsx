import { useMemo, useState } from "react";
import { Reorder, useDragControls } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  GripVertical,
  SlidersHorizontal,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import type { LayoutPlatform } from "@/lib/layout";
import { APP_PLACEMENTS, WEB_PLACEMENTS } from "@/lib/ads";
import { getSectionTitleBnEn } from "@/lib/sectionLabels";

import type { SectionSettings, UiSection, UiSize, StyleVariant } from "./types";

type Props = {
  item: UiSection;
  platform: LayoutPlatform;
  onChange: (next: UiSection) => void;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  canMoveUp?: boolean;
  canMoveDown?: boolean;
};

const GRID_OPTIONS = [1, 2, 3, 4] as const;
const VARIANTS: Array<{ value: StyleVariant; label: string }> = [
  { value: "default", label: "Default" },
  { value: "soft", label: "Soft" },
  { value: "glass", label: "Glass" },
];

function getAdPlacementOptions(platform: LayoutPlatform) {
  return platform === "app" ? APP_PLACEMENTS : WEB_PLACEMENTS;
}

export function LayoutSectionRow({
  item,
  platform,
  onChange,
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
}: Props) {
  const [open, setOpen] = useState(false);
  const dragControls = useDragControls();
  const isAdSection = useMemo(() => item.section_key.startsWith("ad_"), [item.section_key]);
  const isFeatureIcons = useMemo(() => item.section_key === "feature_icons", [item.section_key]);
  const isFooter = useMemo(() => item.section_key === "footer", [item.section_key]);
  const isFocusZone = useMemo(() => item.section_key === "focus_zone", [item.section_key]);
  const isDailyHadith = useMemo(() => item.section_key === "daily_hadith", [item.section_key]);

  const hasSettings = useMemo(() => {
    const s = item.settings ?? {};
    const hasGrid = isFeatureIcons && Boolean(s.gridColumns);
    const hasPlacement = isAdSection && Boolean(s.adPlacement);
    const hasQuizOverlay = isFocusZone && Boolean((s as any).quizOverlay);
    const hasDailyQuizCard =
      isFocusZone &&
      Boolean(
        (s as any).dailyQuizCard?.overlayEnabled !== undefined ||
          (s as any).dailyQuizCard?.overlayPreset ||
          (s as any).dailyQuizCard?.overlayImageUrl ||
          (s as any).dailyQuizCard?.cardClassName ||
          (s as any).dailyQuizCard?.cardCss,
      );
    const hasDailyHadithCard =
      isDailyHadith &&
      Boolean((s as any).dailyHadithCard?.cardClassName || (s as any).dailyHadithCard?.cardCss);
    const hasFooterLinks =
      isFooter &&
      Boolean(
        s.playStoreUrl ||
          s.appStoreUrl ||
          s.websiteUrl ||
          s.contactEmail ||
          s.facebookUrl ||
          s.whatsappUrl ||
          s.footerText ||
          s.developerLine,
      );

    return Boolean(
      hasGrid ||
        hasPlacement ||
        hasFooterLinks ||
        hasQuizOverlay ||
        hasDailyQuizCard ||
        hasDailyHadithCard ||
        s.styleVariant,
    );
  }, [isAdSection, isDailyHadith, isFeatureIcons, isFooter, isFocusZone, item.settings]);

  const updateSettings = (patch: Partial<SectionSettings>) => {
    onChange({
      ...item,
      settings: {
        ...(item.settings ?? {}),
        ...patch,
      },
    });
  };

  const removeSettingsKeys = (keys: string[]) => {
    const next = { ...(item.settings ?? {}) } as Record<string, any>;
    keys.forEach((k) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete next[k];
    });
    onChange({ ...item, settings: next });
  };

  type QuizOverlayPreset = {
    opacity?: number;
    widthRem?: number;
    offsetXRem?: number;
    offsetYRem?: number;
  };

  type DailyQuizCardSettings = {
    overlayEnabled?: boolean;
    overlayPreset?: "old" | "new";
    overlayImageUrl?: string;
    cardClassName?: string;
    cardCss?: string;
  };

  type DailyHadithCardSettings = {
    cardClassName?: string;
    cardCss?: string;
  };

  const quizOverlay = (item.settings as any)?.quizOverlay as
    | { mobile?: QuizOverlayPreset; desktop?: QuizOverlayPreset }
    | undefined;

  const dailyQuizCard = (item.settings as any)?.dailyQuizCard as DailyQuizCardSettings | undefined;
  const dailyHadithCard =
    (item.settings as any)?.dailyHadithCard as DailyHadithCardSettings | undefined;

  const updateQuizOverlay = (target: "mobile" | "desktop", patch: QuizOverlayPreset) => {
    const next = {
      mobile: { ...(quizOverlay?.mobile ?? {}) },
      desktop: { ...(quizOverlay?.desktop ?? {}) },
    };
    next[target] = { ...next[target], ...patch };
    updateSettings({ quizOverlay: next } as any);
  };

  const updateDailyQuizCard = (patch: Partial<DailyQuizCardSettings>) => {
    updateSettings({ dailyQuizCard: { ...(dailyQuizCard ?? {}), ...patch } } as any);
  };

  const updateDailyHadithCard = (patch: Partial<DailyHadithCardSettings>) => {
    updateSettings({ dailyHadithCard: { ...(dailyHadithCard ?? {}), ...patch } } as any);
  };

  const resetDailyQuizCardToDefault = () => {
    // Remove both tuning + card settings objects so the UI falls back to built-in defaults.
    removeSettingsKeys(["quizOverlay", "dailyQuizCard"]);
  };

  const resetDailyHadithCardToDefault = () => {
    removeSettingsKeys(["dailyHadithCard"]);
  };

  const getPresetValue = (
    target: "mobile" | "desktop",
    key: keyof QuizOverlayPreset,
    fallback: number,
  ) => {
    const v = quizOverlay?.[target]?.[key];
    return typeof v === "number" ? v : fallback;
  };

  return (
    <Reorder.Item
      key={item.section_key}
      value={item}
      dragListener={false}
      dragControls={dragControls}
      className="rounded-xl border border-border bg-card p-3 touch-pan-y"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3 sm:flex-1 sm:min-w-0">
            <div
              className="cursor-grab text-muted-foreground touch-none"
              onPointerDown={(e) => dragControls.start(e)}
              aria-label="Drag to reorder"
              title="Drag to reorder"
            >
              <GripVertical className="h-4 w-4" />
            </div>

            <div className="min-w-0 flex-1">
              {(() => {
                const { primary, secondary } = getSectionTitleBnEn(item.section_key, item.label);
                return (
                  <>
                    <div className="flex items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="min-w-0 text-sm font-medium leading-tight break-words">
                          {primary}
                        </p>
                        {secondary && (
                          <p className="mt-0.5 text-[11px] text-muted-foreground break-words">
                            {secondary}
                          </p>
                        )}
                      </div>
                      {hasSettings && (
                        <span className="shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground">
                          settings
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 break-all text-[11px] text-muted-foreground">
                      {item.section_key}
                    </p>
                  </>
                );
              })()}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap sm:justify-end">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onMoveUp}
                disabled={!canMoveUp || !onMoveUp}
                aria-label="Move section up"
                title="Move up"
              >
                <ChevronUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={onMoveDown}
                disabled={!canMoveDown || !onMoveDown}
                aria-label="Move section down"
                title="Move down"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            <div className="w-32">
              <Select value={item.size} onValueChange={(v) => onChange({ ...item, size: v as UiSize })}>
                <SelectTrigger>
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="compact">Compact</SelectItem>
                  <SelectItem value="normal">Normal</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-2">
              <Label className="text-xs text-muted-foreground">Show</Label>
              <Switch
                checked={item.visible}
                onCheckedChange={(checked) => onChange({ ...item, visible: checked })}
              />
            </div>

            <CollapsibleTrigger asChild>
              <Button variant="outline" size="icon" aria-label="Edit section settings">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

          <CollapsibleContent className="pt-3">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {isFeatureIcons && (
                <div className="space-y-1">
                  <Label className="text-xs">Grid columns</Label>
                  <Select
                    value={item.settings?.gridColumns ? String(item.settings.gridColumns) : "auto"}
                    onValueChange={(v) =>
                      updateSettings({ gridColumns: v === "auto" ? undefined : Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      {GRID_OPTIONS.map((n) => (
                        <SelectItem key={n} value={String(n)}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {isAdSection && (
                <div className="space-y-1">
                  <Label className="text-xs">Ad placement</Label>
                  <Select
                    value={item.settings?.adPlacement ?? "auto"}
                    onValueChange={(v) =>
                      updateSettings({ adPlacement: v === "auto" ? undefined : v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Auto" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto</SelectItem>
                      {getAdPlacementOptions(platform).map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Optional — only used by ad sections.</p>
                </div>
              )}

              {isFooter && (
                <div className="space-y-3 sm:col-span-2">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label className="text-xs">Play Store URL</Label>
                      <Input
                        value={typeof item.settings?.playStoreUrl === "string" ? item.settings.playStoreUrl : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateSettings({ playStoreUrl: v ? v : undefined });
                        }}
                        placeholder="https://play.google.com/store/apps/details?id=..."
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">App Store URL</Label>
                      <Input
                        value={typeof item.settings?.appStoreUrl === "string" ? item.settings.appStoreUrl : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateSettings({ appStoreUrl: v ? v : undefined });
                        }}
                        placeholder="https://apps.apple.com/app/..."
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Website URL (for app users)</Label>
                      <Input
                        value={typeof item.settings?.websiteUrl === "string" ? item.settings.websiteUrl : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateSettings({ websiteUrl: v ? v : undefined });
                        }}
                        placeholder="https://yourdomain.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Contact email</Label>
                      <Input
                        value={typeof item.settings?.contactEmail === "string" ? item.settings.contactEmail : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateSettings({ contactEmail: v ? v : undefined });
                        }}
                        placeholder="noor-app@example.com"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Facebook URL</Label>
                      <Input
                        value={typeof item.settings?.facebookUrl === "string" ? item.settings.facebookUrl : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateSettings({ facebookUrl: v ? v : undefined });
                        }}
                        placeholder="https://facebook.com/yourpage"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">WhatsApp/Chat link</Label>
                      <Input
                        value={typeof item.settings?.whatsappUrl === "string" ? item.settings.whatsappUrl : ""}
                        onChange={(e) => {
                          const v = e.target.value.trim();
                          updateSettings({ whatsappUrl: v ? v : undefined });
                        }}
                        placeholder="https://wa.me/... অথবা অন্য chat link"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label className="text-xs">Developer line</Label>
                      <Input
                        value={typeof item.settings?.developerLine === "string" ? item.settings.developerLine : ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateSettings({ developerLine: v.trim() ? v : undefined });
                        }}
                        placeholder="Developed by ABEDIN MOLLA – India"
                      />
                    </div>

                    <div className="space-y-1 sm:col-span-2">
                      <Label className="text-xs">Footer text / Tagline</Label>
                      <Textarea
                        value={typeof item.settings?.footerText === "string" ? item.settings.footerText : ""}
                        onChange={(e) => {
                          const v = e.target.value;
                          updateSettings({ footerText: v.trim() ? v : undefined });
                        }}
                        placeholder="Noor — ..."
                        className="min-h-[80px]"
                      />
                    </div>
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    এই লেখা/লিংকগুলো শুধু Footer section‑এ ব্যবহার হবে।
                  </p>
                </div>
              )}

              {isFocusZone && (
                <div className="space-y-3 sm:col-span-3">
                  <div className="rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-sm font-medium">Daily Quiz card settings</p>
                    <p className="text-[11px] text-muted-foreground">
                      PNG replace/disable + card style override (শুধু DailyQuizCard)
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetDailyQuizCardToDefault}
                      >
                        Reset to default
                      </Button>
                      <p className="text-[11px] text-muted-foreground">
                        (className + CSS + overlay settings reset হবে)
                      </p>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Overlay enabled</Label>
                          <Switch
                            checked={typeof dailyQuizCard?.overlayEnabled === "boolean" ? dailyQuizCard.overlayEnabled : true}
                            onCheckedChange={(checked) => updateDailyQuizCard({ overlayEnabled: checked })}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          Off করলে overlay image show হবে না।
                        </p>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Overlay preset</Label>
                        <Select
                          value={dailyQuizCard?.overlayPreset ?? "new"}
                          onValueChange={(v) => updateDailyQuizCard({ overlayPreset: v as any })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New (Quran+Brain)</SelectItem>
                            <SelectItem value="old">Old (Brain)</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-[11px] text-muted-foreground">Custom URL দিলে preset override হবে।</p>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Overlay Image URL (optional)</Label>
                        <Input
                          value={typeof dailyQuizCard?.overlayImageUrl === "string" ? dailyQuizCard.overlayImageUrl : ""}
                          onChange={(e) => updateDailyQuizCard({ overlayImageUrl: e.target.value })}
                          placeholder="https://.../image.png"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Card Tailwind className (optional)</Label>
                        <Input
                          value={typeof dailyQuizCard?.cardClassName === "string" ? dailyQuizCard.cardClassName : ""}
                          onChange={(e) => updateDailyQuizCard({ cardClassName: e.target.value })}
                          placeholder="e.g. rounded-3xl border-primary/40"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          টিপ: এখানে semantic token-based utility দিন (যেমন border-primary/20)।
                        </p>
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Card CSS (declarations) (optional)</Label>
                        <Textarea
                          value={typeof dailyQuizCard?.cardCss === "string" ? dailyQuizCard.cardCss : ""}
                          onChange={(e) => updateDailyQuizCard({ cardCss: e.target.value })}
                          placeholder={"border-radius: 24px;\nbox-shadow: 0 16px 48px -20px hsl(var(--primary) / 0.35);"}
                          className="min-h-[110px] font-mono text-xs"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          এটা card root-এ apply হবে। (আপনি selector না দিয়ে শুধু declarations লিখতে পারেন)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-sm font-medium">Daily Quiz overlay (Mobile)</p>
                    <p className="text-[11px] text-muted-foreground">
                      Opacity, size ও position fine-tune করুন (শুধু DailyQuizCard overlay)
                    </p>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Opacity</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("mobile", "opacity", 0.35).toFixed(2)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("mobile", "opacity", 0.35)]}
                          min={0.05}
                          max={0.8}
                          step={0.05}
                          onValueChange={(v) => updateQuizOverlay("mobile", { opacity: v[0] })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Width (rem)</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("mobile", "widthRem", 19).toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("mobile", "widthRem", 19)]}
                          min={12}
                          max={32}
                          step={0.5}
                          onValueChange={(v) => updateQuizOverlay("mobile", { widthRem: v[0] })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Right offset (rem)</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("mobile", "offsetXRem", -2).toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("mobile", "offsetXRem", -2)]}
                          min={-8}
                          max={8}
                          step={0.5}
                          onValueChange={(v) => updateQuizOverlay("mobile", { offsetXRem: v[0] })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Top offset (rem)</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("mobile", "offsetYRem", -2.5).toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("mobile", "offsetYRem", -2.5)]}
                          min={-8}
                          max={8}
                          step={0.5}
                          onValueChange={(v) => updateQuizOverlay("mobile", { offsetYRem: v[0] })}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-sm font-medium">Daily Quiz overlay (Desktop)</p>
                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Opacity</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("desktop", "opacity", 0.35).toFixed(2)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("desktop", "opacity", 0.35)]}
                          min={0.05}
                          max={0.8}
                          step={0.05}
                          onValueChange={(v) => updateQuizOverlay("desktop", { opacity: v[0] })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Width (rem)</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("desktop", "widthRem", 22).toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("desktop", "widthRem", 22)]}
                          min={12}
                          max={40}
                          step={0.5}
                          onValueChange={(v) => updateQuizOverlay("desktop", { widthRem: v[0] })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Right offset (rem)</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("desktop", "offsetXRem", -2).toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("desktop", "offsetXRem", -2)]}
                          min={-10}
                          max={10}
                          step={0.5}
                          onValueChange={(v) => updateQuizOverlay("desktop", { offsetXRem: v[0] })}
                        />
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label className="text-xs">Top offset (rem)</Label>
                          <span className="text-xs text-muted-foreground">
                            {getPresetValue("desktop", "offsetYRem", -2.5).toFixed(1)}
                          </span>
                        </div>
                        <Slider
                          value={[getPresetValue("desktop", "offsetYRem", -2.5)]}
                          min={-10}
                          max={10}
                          step={0.5}
                          onValueChange={(v) => updateQuizOverlay("desktop", { offsetYRem: v[0] })}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {isDailyHadith && (
                <div className="space-y-3 sm:col-span-3">
                  <div className="rounded-xl border border-border bg-background/50 p-3">
                    <p className="text-sm font-medium">Daily Hadith card style</p>
                    <p className="text-[11px] text-muted-foreground">
                      Admin থেকে DailyHadith কার্ডের wrapper style change করুন
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={resetDailyHadithCardToDefault}
                      >
                        Reset to default
                      </Button>
                      <p className="text-[11px] text-muted-foreground">(className + CSS reset হবে)</p>
                    </div>

                    <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Wrapper Tailwind className (optional)</Label>
                        <Input
                          value={
                            typeof dailyHadithCard?.cardClassName === "string"
                              ? dailyHadithCard.cardClassName
                              : ""
                          }
                          onChange={(e) => updateDailyHadithCard({ cardClassName: e.target.value })}
                          placeholder="e.g. rounded-3xl overflow-hidden"
                        />
                      </div>

                      <div className="space-y-1 sm:col-span-2">
                        <Label className="text-xs">Wrapper CSS (declarations) (optional)</Label>
                        <Textarea
                          value={typeof dailyHadithCard?.cardCss === "string" ? dailyHadithCard.cardCss : ""}
                          onChange={(e) => updateDailyHadithCard({ cardCss: e.target.value })}
                          placeholder={
                            "border-radius: 28px;\nbox-shadow: 0 18px 60px -26px hsl(var(--foreground) / 0.25);"
                          }
                          className="min-h-[110px] font-mono text-xs"
                        />
                        <p className="text-[11px] text-muted-foreground">
                          এটা wrapper-এ apply হবে। (selector না দিয়ে শুধু declarations লিখতে পারেন)
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-1">
                <Label className="text-xs">Style variant</Label>
                <Select
                  value={item.settings?.styleVariant ?? "default"}
                  onValueChange={(v) =>
                    updateSettings({ styleVariant: (v as StyleVariant) || "default" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Default" />
                  </SelectTrigger>
                  <SelectContent>
                    {VARIANTS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CollapsibleContent>
      </Collapsible>
    </Reorder.Item>
  );
}
