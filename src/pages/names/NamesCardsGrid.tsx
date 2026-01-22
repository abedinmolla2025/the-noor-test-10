import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NameCard, type NameCardModel } from "@/components/names/NameCard";

type Props = {
  isLoading: boolean;
  isError: boolean;
  hasResults: boolean;
  cards: NameCardModel[];
  onSelect: (n: NameCardModel) => void;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
};

export function NamesCardsGrid({
  isLoading,
  isError,
  hasResults,
  cards,
  onSelect,
  emptyStateTitle,
  emptyStateDescription,
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
          <CardTitle className="text-base text-[hsl(var(--dua-fg))]">
            {emptyStateTitle ?? "কোনো নাম পাওয়া যায়নি"}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-[hsl(var(--dua-fg-muted))]">
          {emptyStateDescription ??
            "Admin → Content Management থেকে content type “Name” দিয়ে Published করে যোগ করুন।"}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
      {cards.map((n) => (
        <NameCard key={n.id} name={n} onClick={() => onSelect(n)} />
      ))}
    </div>
  );
}
