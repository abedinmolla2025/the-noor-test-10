import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NameCard, type NameCardModel } from "@/components/names/NameCard";

type Props = {
  isLoading: boolean;
  isError: boolean;
  hasResults: boolean;
  stickyHeaderRaised: boolean;
  cards: NameCardModel[];
  onSelect: (n: NameCardModel) => void;
};

export function NamesCardsGrid({
  isLoading,
  isError,
  hasResults,
  stickyHeaderRaised,
  cards,
  onSelect,
}: Props) {
  if (isLoading) {
    return (
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
    );
  }

  if (isError) {
    return (
      <Card className="dua-card">
        <CardHeader>
          <CardTitle className="text-base text-[hsl(var(--dua-fg))]">লোড করা যায়নি</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[hsl(var(--dua-fg-muted))]">
          নামগুলো লোড করতে সমস্যা হয়েছে। পরে আবার চেষ্টা করুন।
        </CardContent>
      </Card>
    );
  }

  if (!hasResults) {
    return (
      <Card className="dua-card">
        <CardHeader>
          <CardTitle className="text-base text-[hsl(var(--dua-fg))]">কোনো নাম পাওয়া যায়নি</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[hsl(var(--dua-fg-muted))]">
          Admin → Content Management থেকে content type “Name” দিয়ে Published করে যোগ করুন।
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <div
        className={`sticky top-[92px] z-20 mb-4 rounded-2xl border border-[hsl(var(--dua-border))] px-3 py-2 backdrop-blur-md transition-all duration-300 ease-out ${
          stickyHeaderRaised
            ? "bg-[hsl(var(--dua-header)/0.74)] shadow-card"
            : "bg-[hsl(var(--dua-header)/0.56)] shadow-soft"
        }`}
      >
        <p className="text-xs font-medium text-[hsl(var(--dua-fg-muted))]">
          📸 যেকোনো নাম ট্যাপ করুন — শেয়ার করার মতো 1080×1080 PNG তৈরি হবে।
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {cards.map((n) => (
          <NameCard key={n.id} name={n} onClick={() => onSelect(n)} />
        ))}
      </div>
    </div>
  );
}
