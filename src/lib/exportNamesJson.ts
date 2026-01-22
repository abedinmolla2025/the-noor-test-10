import { supabase } from "@/integrations/supabase/client";

type NameMeta = {
  bn_name?: string;
  source?: string;
  origin?: string;
  reference?: string;
};

const safeParseMeta = (meta: unknown): NameMeta => {
  if (!meta || typeof meta !== "object") return {};
  const m = meta as Record<string, unknown>;
  const pick = (k: keyof NameMeta) => (typeof m[k] === "string" ? (m[k] as string) : undefined);
  return {
    bn_name: pick("bn_name"),
    source: pick("source"),
    origin: pick("origin"),
    reference: pick("reference"),
  };
};

export type ExportedNameRow = {
  title: string;
  title_arabic?: string;
  bn_name?: string;
  meaning_bn?: string;
  meaning_en?: string;
  meaning_ar?: string;
  category?: string;
  source?: string;
  origin?: string;
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
 * Exports ALL "name" items from the database to a downloadable JSON file.
 * Uses pagination (API default max is 1000 rows per request).
 */
export async function exportAllNamesFromDbToJson(opts?: {
  filename?: string;
  pageSize?: number;
}): Promise<{ total: number }> {
  const filename = opts?.filename ?? "names-all.json";
  const pageSize = Math.max(100, Math.min(opts?.pageSize ?? 1000, 1000));

  const out: ExportedNameRow[] = [];
  let from = 0;

  // eslint-disable-next-line no-constant-condition
  while (true) {
    const to = from + pageSize - 1;
    const { data, error } = await supabase
      .from("admin_content")
      .select("title,title_arabic,content,content_en,content_arabic,category,metadata")
      .eq("content_type", "name")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    const rows = (data ?? []) as Array<{
      title: string;
      title_arabic: string | null;
      content: string | null;
      content_en: string | null;
      content_arabic: string | null;
      category: string | null;
      metadata: unknown;
    }>;

    for (const r of rows) {
      const meta = safeParseMeta(r.metadata);
      out.push({
        title: (r.title ?? "").trim(),
        title_arabic: r.title_arabic ?? undefined,
        bn_name: meta.bn_name,
        meaning_bn: r.content ?? undefined,
        meaning_en: r.content_en ?? undefined,
        meaning_ar: r.content_arabic ?? undefined,
        category: r.category ?? undefined,
        source: meta.source,
        origin: meta.origin,
        reference: meta.reference,
      });
    }

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  downloadJson(filename, out);
  return { total: out.length };
}
