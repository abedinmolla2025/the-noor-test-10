import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NameCard, type NameCardModel } from "@/components/names/NameCard";
import { NameSharePreviewModal } from "@/components/names/NameSharePreviewModal";

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
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeGender, setActiveGender] = useState<string>("all");
  const [selected, setSelected] = useState<NameCardModel | null>(null);
  const [stickyHeaderRaised, setStickyHeaderRaised] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      // Keep it subtle: raise the glass header slightly once the page is scrolled.
      setStickyHeaderRaised(window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const namesQuery = useQuery({
    queryKey: ["public-names"],
    queryFn: fetchNames,
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    for (const n of namesQuery.data ?? []) {
      const c = (n.category ?? "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [namesQuery.data]);

  const categoryFiltered = useMemo(() => {
    const list = namesQuery.data ?? [];
    return activeCategory === "all"
      ? list
      : list.filter((n) => (n.category ?? "").trim() === activeCategory);
  }, [namesQuery.data, activeCategory]);

  const genderCounts = useMemo(() => {
    const counts = {
      total: categoryFiltered.length,
      male: 0,
      female: 0,
      unisex: 0,
      unspecified: 0,
    };

    for (const n of categoryFiltered) {
      const g = normalizeGender(safeParseMeta(n.metadata).gender);
      if (!g) counts.unspecified += 1;
      else if (g === "male") counts.male += 1;
      else if (g === "female") counts.female += 1;
      else if (g === "unisex") counts.unisex += 1;
      else counts.unspecified += 1; // unknown/custom values treated as unspecified
    }

    return counts;
  }, [categoryFiltered]);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();

    const genderFiltered =
      activeGender === "all"
        ? categoryFiltered
        : categoryFiltered.filter((n) => {
            const g = normalizeGender(safeParseMeta(n.metadata).gender);
            if (activeGender === "unspecified") return !g;
            return g === activeGender;
          });

    if (!query) return genderFiltered;

    return genderFiltered.filter((n) => {
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
  }, [q, activeGender, categoryFiltered]);

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
        category: meta.gender?.trim() || n.category,
        origin: meta.origin,
        source: meta.source,
      };
    });
  }, [filtered]);

  return (
    <div className="min-h-screen dua-page pb-20">
      <header className="sticky top-0 z-40 border-b dua-header">
        <div className="mx-auto w-full max-w-none px-3 py-3 md:px-6 xl:px-10">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="dua-icon-btn"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-display text-lg font-semibold tracking-tight text-[hsl(var(--dua-fg))]">
                ইসলামিক নাম
              </h1>
              <p className="truncate text-xs text-[hsl(var(--dua-fg-muted))]">
                {namesQuery.isLoading
                  ? "লোড হচ্ছে…"
                  : `${filtered.length.toLocaleString()} ফলাফল • ${
                      (namesQuery.data?.length ?? 0).toLocaleString()
                    } মোট`}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="dua-surface relative shadow-soft">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--dua-fg-soft))]" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="নাম/অর্থ লিখে খুঁজুন…"
                className="h-12 border-0 !bg-transparent pl-10 text-[hsl(var(--dua-fg))] placeholder:text-[hsl(var(--dua-fg-soft))] shadow-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dua-accent)/0.45)]"
                aria-label="Search names"
              />
            </div>
          </div>

          <div className="mt-2 space-y-2">
            <div className="dua-surface p-2 shadow-soft">
              <p className="px-1 pb-1 text-[11px] font-medium text-[hsl(var(--dua-fg-muted))]">Categories</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveCategory("all")}
                  className={`dua-chip shrink-0 ${activeCategory === "all" ? "dua-chip-active" : ""}`}
                >
                  All
                </button>
                {categories.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setActiveCategory(c)}
                    className={`dua-chip shrink-0 ${activeCategory === c ? "dua-chip-active" : ""}`}
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>

            <div className="dua-surface p-2 shadow-soft">
              <p className="px-1 pb-1 text-[11px] font-medium text-[hsl(var(--dua-fg-muted))]">Gender</p>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveGender("all")}
                  className={`dua-chip shrink-0 ${activeGender === "all" ? "dua-chip-active" : ""}`}
                >
                  All ({genderCounts.total})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGender("male")}
                  className={`dua-chip shrink-0 ${activeGender === "male" ? "dua-chip-active" : ""}`}
                >
                  Male ({genderCounts.male})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGender("female")}
                  className={`dua-chip shrink-0 ${activeGender === "female" ? "dua-chip-active" : ""}`}
                >
                  Female ({genderCounts.female})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGender("unisex")}
                  className={`dua-chip shrink-0 ${activeGender === "unisex" ? "dua-chip-active" : ""}`}
                >
                  Unisex ({genderCounts.unisex})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveGender("unspecified")}
                  className={`dua-chip shrink-0 ${activeGender === "unspecified" ? "dua-chip-active" : ""}`}
                >
                  Unspecified ({genderCounts.unspecified})
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-none px-3 py-4 md:px-6 xl:px-10">
        {namesQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} className="dua-card">
                <CardHeader className="py-3">
                  <div className="h-4 w-2/3 rounded bg-[hsl(var(--dua-fg)/0.14)]" />
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="h-3 w-full rounded bg-[hsl(var(--dua-fg)/0.10)]" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {namesQuery.isError && (
          <Card className="dua-card">
            <CardHeader>
              <CardTitle className="text-base text-[hsl(var(--dua-fg))]">লোড করা যায়নি</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[hsl(var(--dua-fg-muted))]">
              নামগুলো লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।
            </CardContent>
          </Card>
        )}

        {!namesQuery.isLoading && !namesQuery.isError && filtered.length === 0 && (
          <Card className="dua-card">
            <CardHeader>
              <CardTitle className="text-base text-[hsl(var(--dua-fg))]">কোনো নাম পাওয়া যায়নি</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-[hsl(var(--dua-fg-muted))]">
              Admin → Content Management থেকে content type “Name” দিয়ে Published করে যোগ করুন।
            </CardContent>
          </Card>
        )}

        {!namesQuery.isLoading && !namesQuery.isError && filtered.length > 0 && (
          <div>
            <div
              className={`sticky top-[92px] z-20 mb-4 rounded-2xl border border-[hsl(var(--dua-border))] px-3 py-2 backdrop-blur-md transition-all duration-300 ease-out ${
                stickyHeaderRaised
                  ? "bg-[hsl(var(--dua-header)/0.74)] shadow-card"
                  : "bg-[hsl(var(--dua-header)/0.56)] shadow-soft"
              }`}
            >
              <p className="text-xs font-medium text-[hsl(var(--dua-fg-muted))]">
                Tap a name to generate a premium 1080×1080 PNG.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {cards.map((n) => (
                <NameCard key={n.id} name={n} onClick={() => setSelected(n)} />
              ))}
            </div>
          </div>
        )}
      </main>

      <NameSharePreviewModal open={!!selected} onOpenChange={(o) => !o && setSelected(null)} name={selected} />
    </div>
  );
};

export default NamesPage;
