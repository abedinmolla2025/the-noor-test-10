import { useMemo, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";

async function createImage(src: string): Promise<HTMLImageElement> {
  return await new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

async function cropToBlob(params: {
  imageSrc: string;
  crop: Area;
  outputType: "image/jpeg" | "image/webp";
  quality: number;
}): Promise<Blob> {
  const { imageSrc, crop, outputType, quality } = params;

  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  canvas.width = Math.max(1, Math.floor(crop.width));
  canvas.height = Math.max(1, Math.floor(crop.height));

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    canvas.width,
    canvas.height,
  );

  const blob: Blob | null = await new Promise((resolve) => canvas.toBlob((b) => resolve(b), outputType, quality));
  if (!blob) throw new Error("Failed to export cropped image");
  return blob;
}

export function ImageCropDialog(props: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  imageSrc: string | null;
  title?: string;
  aspect?: number;
  outputType?: "image/jpeg" | "image/webp";
  quality?: number;
  onConfirm: (blob: Blob) => void | Promise<void>;
}) {
  const {
    open,
    onOpenChange,
    imageSrc,
    title = "Crop image",
    aspect = 16 / 9,
    outputType = "image/webp",
    quality = 0.9,
    onConfirm,
  } = props;

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedPixels, setCroppedPixels] = useState<Area | null>(null);
  const [saving, setSaving] = useState(false);

  const disabled = useMemo(() => !imageSrc || !croppedPixels || saving, [imageSrc, croppedPixels, saving]);

  const handleSave = async () => {
    if (!imageSrc || !croppedPixels) return;
    setSaving(true);
    try {
      const blob = await cropToBlob({ imageSrc, crop: croppedPixels, outputType, quality });
      await onConfirm(blob);
      onOpenChange(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[820px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4">
          <div className="relative w-full overflow-hidden rounded-xl border border-border bg-muted" style={{ height: 360 }}>
            {imageSrc ? (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={(_, areaPixels) => setCroppedPixels(areaPixels)}
              />
            ) : null}
          </div>

          <div className="grid gap-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Zoom</p>
              <p className="text-xs text-muted-foreground">{Math.round(zoom * 100)}%</p>
            </div>
            <Slider value={[zoom]} min={1} max={3} step={0.01} onValueChange={(v) => setZoom(v[0] ?? 1)} />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSave} disabled={disabled}>
            {saving ? "Saving…" : "Use cropped"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
