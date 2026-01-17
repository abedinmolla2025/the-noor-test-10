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
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
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

  const hasSettings = useMemo(() => {
    const s = item.settings ?? {};
    const hasGrid = isFeatureIcons && Boolean(s.gridColumns);
    const hasPlacement = isAdSection && Boolean(s.adPlacement);
    const hasFooterLinks =
      isFooter &&
      Boolean(
        s.playStoreUrl || s.appStoreUrl || s.contactEmail || s.facebookUrl || s.whatsappUrl,
      );

    return Boolean(hasGrid || hasPlacement || hasFooterLinks || s.styleVariant);
  }, [isAdSection, isFeatureIcons, isFooter, item.settings]);

  const updateSettings = (patch: Partial<SectionSettings>) => {
    onChange({
      ...item,
      settings: {
        ...(item.settings ?? {}),
        ...patch,
      },
    });
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
                  </div>
                  <p className="text-[11px] text-muted-foreground">
                    এই লিংকগুলো শুধু Footer section‑এ ব্যবহার হবে।
                  </p>
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
