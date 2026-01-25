export type MaskShape = "square" | "circle";

async function blobToImage(blob: Blob): Promise<HTMLImageElement> {
  const url = URL.createObjectURL(blob);
  try {
    return await new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = url;
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

export async function resizeToPng(params: {
  source: Blob;
  size: number;
  maskShape?: MaskShape;
}): Promise<Blob> {
  const { source, size, maskShape = "square" } = params;
  const image = await blobToImage(source);

  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const s = Math.max(1, Math.floor(size));
  canvas.width = s;
  canvas.height = s;

  ctx.imageSmoothingQuality = "high";

  if (maskShape === "circle") {
    const r = s / 2;
    ctx.save();
    ctx.beginPath();
    ctx.arc(r, r, r, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
  }

  ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

  if (maskShape === "circle") {
    ctx.restore();
  }

  const blob: Blob | null = await new Promise((resolve) =>
    canvas.toBlob((b) => resolve(b), "image/png"),
  );
  if (!blob) throw new Error("Failed to export PNG");
  return blob;
}
