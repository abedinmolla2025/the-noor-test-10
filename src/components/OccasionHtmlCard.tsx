import DOMPurify from "dompurify";
import { cn } from "@/lib/utils";

type Props = {
  occasionId: string;
  title: string;
  subtitle?: string | null;
  htmlCode?: string | null;
  cssCode?: string | null;
  containerClassName?: string | null;
};

/**
 * Admin-driven HTML/CSS occasion card.
 * - HTML is sanitized.
 * - CSS is injected via <style>. Authors should scope selectors to `.occasion-scope`.
 */
export function OccasionHtmlCard({
  occasionId,
  title,
  subtitle,
  htmlCode,
  cssCode,
  containerClassName,
}: Props) {
  const safeHtml = DOMPurify.sanitize(htmlCode ?? "", {
    USE_PROFILES: { html: true },
    FORBID_TAGS: ["style", "script", "iframe", "object", "embed"],
    FORBID_ATTR: ["onerror", "onload", "onclick", "onmouseover"],
  }).trim();

  return (
    <section
      aria-label={title}
      className={cn("occasion-scope relative w-full overflow-hidden rounded-[20px]", containerClassName)}
      data-occasion-id={occasionId}
    >
      {cssCode?.trim() ? <style>{cssCode}</style> : null}
      <div className="w-full" dangerouslySetInnerHTML={{ __html: safeHtml }} />
      <span className="sr-only">{subtitle ?? ""}</span>
    </section>
  );
}
