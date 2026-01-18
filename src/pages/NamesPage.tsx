import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search } from "lucide-react";

import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type NameContentRow = {
  id: string;
  title: string;
  title_arabic: string | null;
  content: string | null;
  content_en: string | null;
  content_arabic: string | null;
  category: string | null;
  metadata: unknown;
  created_at: string | null;
  order_index: number | null;
};

const fetchNames = async (): Promise<NameContentRow[]> => {
  const { data, error } = await supabase
    .from("admin_content")
    .select(
      "id,title,title_arabic,content,content_en,content_arabic,category,metadata,created_at,order_index,is_published,content_type",
    )
    .eq("content_type", "name")
    .eq("is_published", true)
    .order("order_index", { ascending: true, nullsFirst: false })
    .order("created_at", { ascending: false });

  if (error) throw error;
  // Narrow type locally
  return (data ?? []) as unknown as NameContentRow[];
};

const NamesPage = () => {
  const navigate = useNavigate();
  const [q, setQ] = useState("");

  const namesQuery = useQuery({
    queryKey: ["public-names"],
    queryFn: fetchNames,
  });

  const filtered = useMemo(() => {
    const list = namesQuery.data ?? [];
    const query = q.trim().toLowerCase();
    if (!query) return list;

    return list.filter((n) => {
      const parts = [
        n.title,
        n.title_arabic ?? "",
        n.content ?? "",
        n.content_en ?? "",
        n.content_arabic ?? "",
        n.category ?? "",
      ];
      return parts.join(" ").toLowerCase().includes(query);
    });
  }, [namesQuery.data, q]);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-40 border-b border-border/50 bg-background/90 backdrop-blur">
        <div className="mx-auto w-full max-w-2xl px-3 py-3">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)} aria-label="Back">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="min-w-0 flex-1">
              <h1 className="truncate text-base font-semibold text-foreground">Names</h1>
              <p className="truncate text-xs text-muted-foreground">Admin content থেকে নামগুলো লোড হচ্ছে</p>
            </div>
          </div>

          <div className="mt-3 relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="নাম/অর্থ লিখে খুঁজুন..."
              className="pl-9"
              aria-label="Search names"
            />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-2xl px-3 py-4">
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
              const primary = n.title_arabic?.trim() ? n.title_arabic : n.title;
              const secondary = n.title_arabic?.trim() ? n.title : null;
              const meaning = (n.content_en ?? n.content ?? n.content_arabic ?? "").trim();

              return (
                <Card key={n.id}>
                  <CardHeader className="py-3">
                    <CardTitle className="text-base leading-snug">
                      {primary}
                      {secondary ? (
                        <span className="ml-2 text-sm font-medium text-muted-foreground">({secondary})</span>
                      ) : null}
                    </CardTitle>
                  </CardHeader>
                  {meaning ? (
                    <CardContent className="pt-0 pb-3 text-sm text-muted-foreground">
                      {meaning}
                    </CardContent>
                  ) : null}
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default NamesPage;
