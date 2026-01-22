import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { ComponentProps } from "react";

import { supabase } from "@/integrations/supabase/client";
import { NameCard, type NameCardModel } from "@/components/names/NameCard";
import { NameSharePreviewModal } from "@/components/names/NameSharePreviewModal";
import { NamesPageHeader } from "@/pages/names/NamesPageHeader";
import { NamesPageSearch } from "@/pages/names/NamesPageSearch";
import { NamesQuickFilters } from "@/pages/names/NamesQuickFilters";
import { NamesCardsGrid } from "@/pages/names/NamesCardsGrid";
import { NamesAlphabetFilter } from "@/pages/names/NamesAlphabetFilter";

type NameContentRow = {
  id: string;
  title: string;
  title_arabic: string | null;
  /** Bengali meaning */
  content: string | null;
  /** English meaning */
  content_en: string | null;
  /** Arabic meaning (optional/legacy) */
  content_arabic: string | null;
  category: string | null;
  metadata: unknown;
  created_at: string | null;
  order_index: number | null;
};

type NameMeta = {
  bn_name?: string;
  pronunciation?: string;
  gender?: string;
  source?: string;
  origin?: string;
  reference?: string;
};

const safeParseMeta = (meta: unknown): NameMeta => {
  if (!meta || typeof meta !== "object") return {};
  const m = meta as Record<string, unknown>;
  const pick = (k: string) => (typeof m[k] === "string" ? (m[k] as string) : undefined);
  return {
    bn_name: pick("bn_name"),
    pronunciation: pick("pronunciation"),
    gender: pick("gender"),
    source: pick("source"),
    origin: pick("origin"),
    reference: pick("reference"),
  };
};

const normalizeGender = (raw?: string) => {
  const g = (raw ?? "").trim().toLowerCase();
  if (!g) return "";
  if (g === "boy") return "male";
  if (g === "girl") return "female";
  if (g === "m") return "male";
  if (g === "f") return "female";
  if (g === "male" || g === "female" || g === "unisex") return g;
  return g; // fallback (custom values)
};

const fetchNames = async (): Promise<NameContentRow[]> => {
  const { data, error } = await supabase
    .from("admin_content")
    .select("id,title,title_arabic,content,content_en,content_arabic,category,metadata,created_at,order_index,is_published,content_type")
    .eq("content_type", "name")
    .eq("is_published", true)
    .order("order_index", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as NameContentRow[];
};

const NamesPage = () => {
  const [q, setQ] = useState("");
  const [activeQuickFilter, setActiveQuickFilter] = useState<ComponentProps<typeof NamesQuickFilters>["active"]>(
    "all"
  );
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [selected, setSelected] = useState<NameCardModel | null>(null);

  const namesQuery = useQuery({
    queryKey: ["public-names"],
    queryFn: fetchNames,
  });

  const filteredBase = useMemo(() => {
    const query = q.trim().toLowerCase();

    const list = namesQuery.data ?? [];
    const quickFiltered = list.filter((n) => {
      const meta = safeParseMeta(n.metadata);
      // Gender is primarily stored in metadata, but some datasets store it in `category`.
      const categoryRaw = (n.category ?? "").trim();
      const g = normalizeGender(meta.gender) || normalizeGender(categoryRaw);
      const category = categoryRaw.toLowerCase();
      const title = (n.title ?? "").trim();

      if (activeQuickFilter === "all") return true;
      if (activeQuickFilter === "boy") return g === "male";
      if (activeQuickFilter === "girl") return g === "female";
      if (activeQuickFilter === "unisex") return g === "unisex";
      if (activeQuickFilter === "quranic") return category === "quranic";
      if (activeQuickFilter === "popular") return category === "popular";
      if (activeQuickFilter === "short") return title.length > 0 && title.length <= 5;
      return true;
    });

    if (!query) return quickFiltered;

    return quickFiltered.filter((n) => {
      const meta = safeParseMeta(n.metadata);
      const parts = [
        n.title,
        n.title_arabic ?? "",
        meta.bn_name ?? "",
        meta.pronunciation ?? "",
        meta.gender ?? "",
        n.content ?? "",
        n.content_en ?? "",
        n.category ?? "",
        meta.source ?? "",
        meta.origin ?? "",
        meta.reference ?? "",
      ];
      return parts.join(" ").toLowerCase().includes(query);
    });
  }, [q, activeQuickFilter, namesQuery.data]);

  const alphabetCounts = useMemo<Record<string, number>>(() => {
    const out: Record<string, number> = {};
    for (const n of filteredBase ?? []) {
      const t = (n.title ?? "").trim();
      const first = t ? t[0]!.toUpperCase() : "";
      if (first >= "A" && first <= "Z") out[first] = (out[first] ?? 0) + 1;
    }
    return out;
  }, [filteredBase]);

  const filtered = useMemo(() => {
    if (!activeLetter) return filteredBase;
    return (filteredBase ?? []).filter((n) => {
      const t = (n.title ?? "").trim();
      const first = t ? t[0]!.toUpperCase() : "";
      return first === activeLetter;
    });
  }, [activeLetter, filteredBase]);

  const cards = useMemo<NameCardModel[]>(() => {
    return (filtered ?? []).map((n) => {
      const meta = safeParseMeta(n.metadata);
      return {
        id: n.id,
        title: (n.title ?? "").trim(),
        title_arabic: n.title_arabic,
        bn_name: meta.bn_name,
        meaning_bn: n.content,
        meaning_en: n.content_en,
        meaning_ar: n.content_arabic,
        gender: meta.gender?.trim() || null,
        category: n.category,
        origin: meta.origin,
        source: meta.source,
      };
    });
  }, [filtered]);

  return (
    <div className="min-h-screen dua-page pb-20">
      <header className="sticky top-0 z-40 border-b dua-header">
        <div className="mx-auto w-full max-w-none px-3 py-3 md:px-6 xl:px-10">
          <NamesPageHeader
            title="ইসলামিক নাম"
            subtitle={
              namesQuery.isLoading
                ? "লোড হচ্ছে…"
                : `${filtered.length.toLocaleString()} ফলাফল • ${(namesQuery.data?.length ?? 0).toLocaleString()} মোট`
            }
          />

          <div className="mt-3">
            <NamesPageSearch value={q} onChange={setQ} />
          </div>

          <div className="mt-2">
            <NamesQuickFilters active={activeQuickFilter} onChange={setActiveQuickFilter} />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-none px-3 py-4 md:px-6 xl:px-10">
        <div className="mb-3">
          <NamesAlphabetFilter activeLetter={activeLetter} counts={alphabetCounts} onChange={setActiveLetter} />
        </div>

        <p className="mb-3 text-xs font-medium text-[hsl(var(--dua-fg-muted))]">
          📸 যেকোনো নাম ট্যাপ করুন — শেয়ার করার মতো 1080×1080 ছবি তৈরি হবে
        </p>

        <NamesCardsGrid
          isLoading={namesQuery.isLoading}
          isError={namesQuery.isError}
          hasResults={!namesQuery.isLoading && !namesQuery.isError && filtered.length > 0}
          cards={cards}
          onSelect={setSelected}
          emptyStateTitle={activeLetter ? "কোনো নাম পাওয়া যায়নি" : undefined}
          emptyStateDescription={activeLetter ? "এই অক্ষরে কোনো নাম পাওয়া যায়নি" : undefined}
        />
      </main>

      <NameSharePreviewModal open={!!selected} onOpenChange={(o) => !o && setSelected(null)} name={selected} />
    </div>
  );
};

export default NamesPage;
