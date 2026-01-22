import { supabase } from "@/integrations/supabase/client";

type DuaMeta = {
  source?: string;
  reference?: string;
};

const safeParseMeta = (meta: unknown): DuaMeta => {
  if (!meta || typeof meta !== "object") return {};
  const m = meta as Record<string, unknown>;
  const pick = (k: keyof DuaMeta) => (typeof m[k] === "string" ? (m[k] as string) : undefined);
  return {
    source: pick("source"),
    reference: pick("reference"),
  };
};

export type ExportedDuaRow = {
  title: string;
  title_arabic?: string;
  title_en?: string;
  title_hi?: string;
  title_ur?: string;

  content_arabic?: string;
  content_bn?: string;
  content_en?: string;
  content_hi?: string;
  content_ur?: string;

  pronunciation?: string;
  pronunciation_en?: string;
  pronunciation_hi?: string;
  pronunciation_ur?: string;

  category?: string;
  source?: string;
  reference?: string;
};

const downloadJson = (filename: string, data: unknown) => {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: "application/json;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

/**
 * Exports ALL "dua" items from the database to a downloadable JSON file.
 * Uses pagination (API default max is 1000 rows per request).
 */
export async function exportAllDuasFromDbToJson(opts?: {
  filename?: string;
  pageSize?: number;
}): Promise<{ total: number }> {
  const filename = opts?.filename ?? "duas-all.json";
  const pageSize = Math.max(100, Math.min(opts?.pageSize ?? 1000, 1000));

  const out: ExportedDuaRow[] = [];
  let from = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("admin_content")
      .select(
        [
          "title",
          "title_arabic",
          "title_en",
          "title_hi",
          "title_ur",
          "content_arabic",
          "content",
          "content_en",
          "content_hi",
          "content_ur",
          "content_pronunciation",
          "content_pronunciation_en",
          "content_pronunciation_hi",
          "content_pronunciation_ur",
          "category",
          "metadata",
        ].join(",")
      )
      .eq("content_type", "dua")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const rows = (data ?? []) as unknown as Array<{
      title: string;
      title_arabic: string | null;
      title_en: string | null;
      title_hi: string | null;
      title_ur: string | null;

      content_arabic: string | null;
      content: string | null;
      content_en: string | null;
      content_hi: string | null;
      content_ur: string | null;

      content_pronunciation: string | null;
      content_pronunciation_en: string | null;
      content_pronunciation_hi: string | null;
      content_pronunciation_ur: string | null;

      category: string | null;
      metadata: unknown;
    }>;

    for (const r of rows) {
      const meta = safeParseMeta(r.metadata);
      out.push({
        title: (r.title ?? "").trim(),
        title_arabic: r.title_arabic ?? undefined,
        title_en: r.title_en ?? undefined,
        title_hi: r.title_hi ?? undefined,
        title_ur: r.title_ur ?? undefined,

        content_arabic: r.content_arabic ?? undefined,
        content_bn: r.content ?? undefined,
        content_en: r.content_en ?? undefined,
        content_hi: r.content_hi ?? undefined,
        content_ur: r.content_ur ?? undefined,

        pronunciation: r.content_pronunciation ?? undefined,
        pronunciation_en: r.content_pronunciation_en ?? undefined,
        pronunciation_hi: r.content_pronunciation_hi ?? undefined,
        pronunciation_ur: r.content_pronunciation_ur ?? undefined,

        category: r.category ?? undefined,
        source: meta.source,
        reference: meta.reference,
      });
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  downloadJson(filename, out);
  return { total: out.length };
}
