import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, Share2, X, Facebook, Instagram } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useDomToPng } from "@/hooks/useDomToPng";
import type { NameCardModel } from "./NameCard";
import { NameShareSquare } from "./NameShareSquare";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: NameCardModel | null;
};

const easePremium: [number, number, number, number] = [0.16, 1, 0.3, 1];

type NativeShareSupport = "image" | "text" | "none";

function createTinyPngFile(): File {
  // 1x1 transparent PNG
  const base64 =
    "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO2g2pUAAAAASUVORK5CYII=";
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: "image/png" });
  return new File([blob], "share.png", { type: "image/png" });
}

function getNativeShareSupport(): NativeShareSupport {
  if (typeof navigator === "undefined" || !navigator.share) return "none";

  // If canShare exists, use it to be precise (esp. for file sharing support)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const canShareFn: ((data: ShareData) => boolean) | undefined = (navigator as any).canShare;

  if (!canShareFn) return "text";

  try {
    const imageOk = canShareFn({ files: [createTinyPngFile()] });
    if (imageOk) return "image";

    const textOk = canShareFn({ title: "Test", text: "Test", url: window.location.href });
    return textOk ? "text" : "none";
  } catch {
    // Some browsers throw on unsupported shapes
    return "text";
  }
}

export function NameSharePreviewModal({ open, onOpenChange, name }: Props) {
  const squareRef = useRef<HTMLDivElement>(null);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState(false);
  const [nativeShareSupport, setNativeShareSupport] = useState<NativeShareSupport>("none");

  const isInIframe = useMemo(() => {
    try {
      return window.self !== window.top;
    } catch {
      return true;
    }
  }, []);

  const safeName = useMemo(() => name, [name]);

  // Share link helpers (no file attachment) — avoids popup/CSP blocks vs window.open.
  const shareTitle = useMemo(() => {
    if (!safeName) return "";
    return safeName.title_arabic?.trim() ? `${safeName.title_arabic} (${safeName.title})` : safeName.title;
  }, [safeName]);

  const shareTextForLinks = useMemo(() => {
    if (!safeName) return "";
    return `${shareTitle}\n${window.location.href}`;
  }, [safeName, shareTitle]);

  const whatsappShareHref = useMemo(() => {
    return `https://wa.me/?text=${encodeURIComponent(shareTextForLinks)}`;
  }, [shareTextForLinks]);

  const facebookShareHref = useMemo(() => {
    return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`;
  }, []);

  const fileName = useMemo(() => {
    const base = (safeName?.title ?? "name").trim().replace(/\s+/g, "-").toLowerCase();
    return `${base || "name"}-1080.png`;
  }, [safeName?.title]);

  const { isRendering, render, download } = useDomToPng(squareRef, {
    fileName,
    width: 1080,
    height: 1080,
    pixelRatio: 2,
  });

  // Detect native share capabilities at runtime (mobile-first).
  useEffect(() => {
    if (!open) return;
    const support = getNativeShareSupport();
    setNativeShareSupport(support);
    console.info(`[share] native share support: ${support}`);
  }, [open]);

  // Generate a visible preview inside the modal.
  // We keep the 1080x1080 DOM node (unscaled) as the source of truth for export quality.
  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!open || !safeName) return;
      setPreviewError(false);
      setPreviewDataUrl(null);

      try {
        const { dataUrl } = await render();
        if (cancelled) return;
        setPreviewDataUrl(dataUrl);
      } catch (e) {
        console.warn(e);
        if (cancelled) return;
        setPreviewError(true);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [open, safeName?.title, safeName?.title_arabic, render]);

  const shareNative = async () => {
    if (!safeName) return;

    try {
      const title = safeName.title_arabic?.trim()
        ? `${safeName.title_arabic} (${safeName.title})`
        : safeName.title;

      // If the browser can only share text, do a text share instead of attempting files.
      if (nativeShareSupport === "text" && navigator.share) {
        await navigator.share({ title, text: "Islamic Name Meaning", url: window.location.href });
        return;
      }

      // If native share isn't supported at all, fallback to download.
      if (nativeShareSupport === "none" || !navigator.share) {
        await download();
        toast.success("PNG downloaded", {
          description: isInIframe
            ? "Direct share may be blocked in preview. Open the app in a new tab on mobile for Native Share."
            : "Direct share isn't supported in this browser. Share it from your gallery.",
        });
        return;
      }

      // 1) Try best-quality file first.
      const best = await render();
      const bestShare: ShareData = {
        title,
        text: "Islamic Name Meaning",
        files: [best.file],
      };

      // Some browsers expose navigator.canShare
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const canShareBest = (navigator as any).canShare ? (navigator as any).canShare(bestShare) : true;

      // If canShare fails (often file too large / unsupported), try a lighter file.
      if (!canShareBest) {
        const lite = await render({ pixelRatio: 1 });
        const liteShare: ShareData = {
          title,
          text: "Islamic Name Meaning",
          files: [lite.file],
        };
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const canShareLite = (navigator as any).canShare ? (navigator as any).canShare(liteShare) : true;
        if (canShareLite) {
          await navigator.share(liteShare);
          return;
        }

        await download();
        toast.success("PNG downloaded", { description: "Your browser can't share this image directly." });
        return;
      }

      await navigator.share(bestShare);
    } catch (e) {
      // user cancelled or browser failed
      console.warn(e);
    }
  };

  // (WhatsApp/Facebook link sharing is rendered as <a> buttons below.)

  const shareInstagram = async () => {
    if (navigator.share) return await shareNative();
    await download();
    toast.success("Downloaded", { description: "Upload the PNG in Instagram." });
  };

  if (!open || !safeName) return null;

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className="absolute inset-0 bg-[hsl(var(--dua-bg)/0.72)] backdrop-blur-md"
            onClick={() => onOpenChange(false)}
          />

          <motion.div
            role="dialog"
            aria-modal="true"
            className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-lg"
            initial={{ y: 24, opacity: 0, scale: 0.98 }}
            animate={{ y: 0, opacity: 1, scale: 1, transition: { duration: 0.42, ease: easePremium } }}
            exit={{ y: 24, opacity: 0, scale: 0.98, transition: { duration: 0.28, ease: easePremium } }}
          >
            <div className="dua-card m-3 overflow-hidden rounded-3xl border border-[hsl(var(--dua-border))] shadow-card">
              <div className="flex items-center justify-between gap-3 border-b border-[hsl(var(--dua-border))] bg-[hsl(var(--dua-header)/0.62)] px-4 py-3 backdrop-blur-lg">
                <div className="min-w-0">
                  <p className="truncate text-xs text-[hsl(var(--dua-fg-soft))]">Share Preview</p>
                  <p className="truncate font-medium text-[hsl(var(--dua-fg))]">
                    {safeName.title_arabic?.trim() || safeName.title}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onOpenChange(false)}
                  className="dua-icon-btn"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>

              <div className="p-4">
                <div className="flex justify-center">
                  <div className="w-full max-w-[360px] overflow-hidden rounded-3xl border border-[hsl(var(--dua-border))] bg-[hsl(var(--dua-bg))]">
                    {/*
                      Export source (kept rendered for html-to-image). We keep it offscreen so
                      the user sees the generated PNG preview instead of a scaled DOM node.
                    */}
                    <div className="pointer-events-none absolute -left-[99999px] top-0 opacity-0">
                      <NameShareSquare ref={squareRef} name={safeName} />
                    </div>

                    {/* Visible preview (must render before share/download buttons) */}
                    <div className="relative aspect-square w-full">
                      {previewDataUrl ? (
                        <img
                          src={previewDataUrl}
                          alt={`Share preview for ${safeName.title}`}
                          className="h-full w-full object-cover"
                          loading="eager"
                          draggable={false}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center p-6">
                          <div className="text-center">
                            <p className="text-sm font-medium text-[hsl(var(--dua-fg))]">
                              {previewError ? "Preview failed" : "Generating preview…"}
                            </p>
                            <p className="mt-1 text-xs text-[hsl(var(--dua-fg-soft))]">
                              {previewError
                                ? "Please close and try again."
                                : "This takes a moment on some devices."}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {previewDataUrl ? (
                  <div className="mt-4 grid grid-cols-2 gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className="border-[hsl(var(--dua-fg)/0.18)] bg-transparent text-[hsl(var(--dua-fg))] hover:bg-[hsl(var(--dua-fg)/0.10)]"
                  >
                    <a href={facebookShareHref} target="_blank" rel="noopener noreferrer">
                      <Facebook className="mr-2 h-4 w-4" />
                      Facebook Link
                    </a>
                  </Button>
                  <Button
                    asChild
                    variant="outline"
                    className="border-[hsl(var(--dua-fg)/0.18)] bg-transparent text-[hsl(var(--dua-fg))] hover:bg-[hsl(var(--dua-fg)/0.10)]"
                  >
                    <a href={whatsappShareHref} target="_blank" rel="noopener noreferrer">
                      <Share2 className="mr-2 h-4 w-4" />
                      WhatsApp Link
                    </a>
                  </Button>
                  <Button
                    onClick={() => void shareInstagram()}
                    variant="outline"
                    className="border-[hsl(var(--dua-fg)/0.18)] bg-transparent text-[hsl(var(--dua-fg))] hover:bg-[hsl(var(--dua-fg)/0.10)]"
                    disabled={isRendering}
                  >
                    <Instagram className="mr-2 h-4 w-4" />
                    Instagram
                  </Button>
                  <Button
                    onClick={() => void download()}
                    variant="outline"
                    className="border-[hsl(var(--dua-fg)/0.18)] bg-transparent text-[hsl(var(--dua-fg))] hover:bg-[hsl(var(--dua-fg)/0.10)]"
                    disabled={isRendering}
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                  </div>
                ) : null}

                {previewDataUrl ? (
                  <div className="mt-3">
                    <Button
                      onClick={() => void shareNative()}
                      className="w-full bg-[linear-gradient(to_right,hsl(var(--dua-accent)),hsl(var(--dua-accent-strong)))] text-[hsl(var(--dua-accent-fg))] hover:opacity-95"
                      disabled={isRendering}
                    >
                      <Share2 className="mr-2 h-4 w-4" />
                      {nativeShareSupport === "image"
                        ? "Share (Native Image)"
                        : nativeShareSupport === "text"
                          ? "Share (Native Text)"
                          : "Download PNG"}
                    </Button>
                    {nativeShareSupport === "none" ? (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 w-full border-[hsl(var(--dua-fg)/0.18)] bg-transparent text-[hsl(var(--dua-fg))] hover:bg-[hsl(var(--dua-fg)/0.10)]"
                        onClick={() => window.open(window.location.href, "_blank", "noopener,noreferrer")}
                      >
                        Open in new tab (for share)
                      </Button>
                    ) : null}
                    <p className="mt-2 text-center text-[11px] text-[hsl(var(--dua-fg-soft))]">
                      {nativeShareSupport === "image"
                        ? "Native Share supported (image)."
                        : nativeShareSupport === "text"
                          ? "Native Share supported (text only)."
                          : "Native Share not supported."}
                    </p>
                  </div>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
