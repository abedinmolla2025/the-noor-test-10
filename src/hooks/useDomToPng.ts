import { useCallback, useState } from "react";
import { toPng } from "html-to-image";

type UseDomToPngOptions = {
  fileName?: string;
  pixelRatio?: number;
  width?: number;
  height?: number;
};

const dataUrlToBlob = async (dataUrl: string) => {
  const res = await fetch(dataUrl);
  return await res.blob();
};

export function useDomToPng(ref: React.RefObject<HTMLElement>, opts?: UseDomToPngOptions) {
  const [isRendering, setIsRendering] = useState(false);

  const render = useCallback(async (overrides?: UseDomToPngOptions) => {
    const node = ref.current;
    if (!node) throw new Error("missing_node");

    setIsRendering(true);
    try {
      const dataUrl = await toPng(node, {
        cacheBust: true,
        // Avoid cross-origin stylesheet SecurityError from Google Fonts while exporting.
        // This keeps the export reliable across browsers and inside iframes/webviews.
        // (Text will still render using loaded fonts; we just skip embedding font CSS.)
        skipFonts: true,
        pixelRatio: overrides?.pixelRatio ?? opts?.pixelRatio ?? 2,
        width: overrides?.width ?? opts?.width,
        height: overrides?.height ?? opts?.height,
        style: {
          transform: "none",
        },
      });

      const blob = await dataUrlToBlob(dataUrl);
      const fileName = overrides?.fileName ?? opts?.fileName ?? "name.png";
      const file = new File([blob], fileName, { type: "image/png" });

      return { dataUrl, blob, file, fileName };
    } finally {
      setIsRendering(false);
    }
  }, [ref, opts?.fileName, opts?.height, opts?.pixelRatio, opts?.width]);

  const download = useCallback(
    async () => {
      const { dataUrl, fileName } = await render();
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    },
    [render]
  );

  return { isRendering, render, download };
}
