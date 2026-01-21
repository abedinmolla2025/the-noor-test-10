import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Copy, Search, Share2 } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";

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

const buildShareText = (n: NameContentRow) => {
  const meta = safeParseMeta(n.metadata);
  const arabicName = n.title_arabic?.trim() || "";
  const englishName = n.title?.trim() || "";
  const banglaName = meta.bn_name?.trim() || "";
  const pronunciation = meta.pronunciation?.trim() || "";
  const gender = meta.gender?.trim() || "";
  const meaningBn = n.content?.trim() || "";
  const meaningEn = n.content_en?.trim() || "";

  const lines: string[] = [];
  if (arabicName || englishName) lines.push([arabicName, englishName].filter(Boolean).join(" — "));
  if (banglaName) lines.push(`নাম (বাংলা): ${banglaName}`);
  if (pronunciation) lines.push(`উচ্চারণ: ${pronunciation}`);
  if (gender) lines.push(`Gender: ${gender}`);
  if (meaningBn) lines.push(`অর্থ (বাংলা): ${meaningBn}`);
  if (meaningEn) lines.push(`Meaning (English): ${meaningEn}`);
  if (n.category?.trim()) lines.push(`Category: ${n.category.trim()}`);
  if (meta.source?.trim()) lines.push(`Source: ${meta.source.trim()}`);

  return lines.join("\n").trim();
};

const copyToClipboard = async (text: string, label = "Copied") => {
  try {
    if (!text.trim()) {
      toast.error("কপি করার মতো টেক্সট নেই");
      return;
    }
    await navigator.clipboard.writeText(text);
    toast.success(label);
  } catch {
    toast.error("Copy failed", { description: "আপনার ব্রাউজার clipboard access ব্লক করেছে।" });
  }
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
  const [selected, setSelected] = useState<NameContentRow | null>(null);

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

  const selectedMeta = useMemo(() => safeParseMeta(selected?.metadata), [selected?.metadata]);

  const onShare = async (n: NameContentRow) => {
    const text = buildShareText(n);
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({
          title: n.title_arabic?.trim() ? `${n.title_arabic} (${n.title})` : n.title,
          text,
          url,
        });
        return;
      }

      // Fallback
      await copyToClipboard(`${text}\n\n${url}`, "Copied share text");
    } catch {
      // user cancelled share or share failed
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/75">
        <div className="mx-auto w-full max-w-4xl px-3 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-foreground">Islamic Names</h1>
              <p className="truncate text-xs text-muted-foreground">
                {namesQuery.isLoading
                  ? "লোড হচ্ছে…"
                  : `${filtered.length.toLocaleString()} ফলাফল • ${
                      (namesQuery.data?.length ?? 0).toLocaleString()
                    } মোট`}
              </p>
            </div>
          </div>

          <div className="mt-3">
            <div className="relative rounded-xl border border-border/60 bg-card/50 shadow-sm">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="নাম/অর্থ লিখে খুঁজুন…"
                className="h-11 border-0 bg-transparent pl-9 shadow-none focus-visible:ring-2"
                aria-label="Search names"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
            <Button
              type="button"
              size="sm"
              variant={activeCategory === "all" ? "secondary" : "outline"}
              onClick={() => setActiveCategory("all")}
              className="shrink-0 rounded-full"
            >
              All
            </Button>
            {categories.map((c) => (
              <Button
                key={c}
                type="button"
                size="sm"
                variant={activeCategory === c ? "secondary" : "outline"}
                onClick={() => setActiveCategory(c)}
                className="shrink-0 rounded-full"
              >
                {c}
              </Button>
            ))}
          </div>

          <div className="mt-2 flex items-center gap-2 overflow-x-auto pb-1">
            <Button
              type="button"
              size="sm"
              variant={activeGender === "all" ? "secondary" : "outline"}
              onClick={() => setActiveGender("all")}
              className="shrink-0 rounded-full"
            >
              All ({genderCounts.total})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeGender === "male" ? "secondary" : "outline"}
              onClick={() => setActiveGender("male")}
              className="shrink-0 rounded-full"
            >
              Male ({genderCounts.male})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeGender === "female" ? "secondary" : "outline"}
              onClick={() => setActiveGender("female")}
              className="shrink-0 rounded-full"
            >
              Female ({genderCounts.female})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeGender === "unisex" ? "secondary" : "outline"}
              onClick={() => setActiveGender("unisex")}
              className="shrink-0 rounded-full"
            >
              Unisex ({genderCounts.unisex})
            </Button>
            <Button
              type="button"
              size="sm"
              variant={activeGender === "unspecified" ? "secondary" : "outline"}
              onClick={() => setActiveGender("unspecified")}
              className="shrink-0 rounded-full"
            >
              Unspecified ({genderCounts.unspecified})
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-4xl px-3 py-4">
        {namesQuery.isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i}>
                <CardHeader className="py-3">
                  <div className="h-4 w-2/3 rounded bg-muted" />
                </CardHeader>
                <CardContent className="pb-3">
                  <div className="h-3 w-full rounded bg-muted" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {namesQuery.isError && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">লোড করা যায়নি</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              নামগুলো লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।
            </CardContent>
          </Card>
        )}

        {!namesQuery.isLoading && !namesQuery.isError && filtered.length === 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">কোনো নাম পাওয়া যায়নি</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Admin → Content Management থেকে content type “Name” দিয়ে Published করে যোগ করুন।
            </CardContent>
          </Card>
        )}

        {!namesQuery.isLoading && !namesQuery.isError && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((n) => {
              const meta = safeParseMeta(n.metadata);
              const primary = n.title_arabic?.trim() ? n.title_arabic : n.title;
              const secondary = n.title_arabic?.trim() ? n.title : null;
              const bnName = meta.bn_name?.trim() || "";
              const snippet = (n.content_en ?? n.content ?? "").trim();
              const gender = normalizeGender(meta.gender);
              const genderLabel =
                gender === "male" ? "Male" : gender === "female" ? "Female" : gender === "unisex" ? "Unisex" : "";

              return (
                <Card
                  key={n.id}
                  className="group cursor-pointer border-border/60 bg-card/60 shadow-sm transition-all hover:-translate-y-[1px] hover:border-border hover:bg-card hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  onClick={() => setSelected(n)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") setSelected(n);
                  }}
                  aria-label={`Open details for ${n.title}`}
                >
                  <CardHeader className="py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <CardTitle className="truncate text-base leading-snug">
                          <span className={n.title_arabic?.trim() ? "font-arabic" : undefined}>{primary}</span>
                          {secondary ? (
                            <span className="ml-2 text-sm font-medium text-muted-foreground">({secondary})</span>
                          ) : null}
                        </CardTitle>
                        {bnName ? <p className="pt-1 text-sm text-muted-foreground">{bnName}</p> : null}
                      </div>

                      <div className="flex shrink-0 items-center gap-1">
                        {genderLabel ? (
                          <Badge variant="outline" className="text-[11px]">
                            {genderLabel}
                          </Badge>
                        ) : null}
                        {n.category?.trim() ? (
                          <Badge variant="secondary" className="text-[11px]">
                            {n.category}
                          </Badge>
                        ) : null}
                      </div>
                    </div>
                  </CardHeader>
                  {snippet ? (
                    <CardContent className="pt-0 pb-3 text-sm text-muted-foreground">
                      <p className="leading-relaxed">{snippet}</p>
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </main>

      <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-base">
              {selected?.title_arabic?.trim() ? selected?.title_arabic : selected?.title}
              {selected?.title_arabic?.trim() ? (
                <span className="ml-2 text-sm font-medium text-muted-foreground">({selected?.title})</span>
              ) : null}
            </DialogTitle>
            {selectedMeta.bn_name?.trim() ? (
              <p className="text-sm text-muted-foreground">{selectedMeta.bn_name}</p>
            ) : null}
          </DialogHeader>

          {selected?.category?.trim() ? (
            <div className="-mt-1">
              <Badge variant="secondary" className="text-[11px]">
                {selected.category}
              </Badge>
            </div>
          ) : null}

          <div className="space-y-3 text-sm">
            {selected?.content ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">অর্থ (বাংলা)</p>
                <p className="whitespace-pre-wrap">{selected.content}</p>
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selected.content ?? "", "বাংলা অর্থ কপি হয়েছে")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            ) : null}

            {selected?.content_en ? (
              <div className="space-y-1">
                <p className="text-xs text-muted-foreground">Meaning (English)</p>
                <p className="whitespace-pre-wrap">{selected.content_en}</p>
                <div className="pt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(selected.content_en ?? "", "English meaning copied")}
                  >
                    <Copy className="mr-2 h-4 w-4" />
                    Copy
                  </Button>
                </div>
              </div>
            ) : null}


            {(selectedMeta.bn_name ||
              selectedMeta.pronunciation ||
              selectedMeta.gender ||
              selectedMeta.source ||
              selectedMeta.origin ||
              selectedMeta.reference) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <p className="text-xs font-medium text-foreground">Details</p>

                  {selectedMeta.bn_name ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Bangla name</p>
                      <p className="font-medium break-words">{selectedMeta.bn_name}</p>
                    </div>
                  ) : null}

                  {selectedMeta.pronunciation ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Pronunciation</p>
                      <p className="font-medium break-words">{selectedMeta.pronunciation}</p>
                    </div>
                  ) : null}

                  {selectedMeta.gender ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Gender</p>
                      <p className="font-medium break-words">{selectedMeta.gender}</p>
                    </div>
                  ) : null}

                  {selectedMeta.source ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Source</p>
                      <p className="font-medium break-words">{selectedMeta.source}</p>
                    </div>
                  ) : null}

                  {selectedMeta.origin ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Origin</p>
                      <p className="font-medium break-words">{selectedMeta.origin}</p>
                    </div>
                  ) : null}

                  {selectedMeta.reference ? (
                    <div>
                      <p className="text-xs text-muted-foreground">Reference</p>
                      <p className="font-medium break-words">{selectedMeta.reference}</p>
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!selected) return;
                void copyToClipboard(buildShareText(selected), "Copied");
              }}
              disabled={!selected}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy all
            </Button>
            <Button
              onClick={() => {
                if (!selected) return;
                void onShare(selected);
              }}
              disabled={!selected}
            >
              <Share2 className="mr-2 h-4 w-4" />
              Share
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default NamesPage;
