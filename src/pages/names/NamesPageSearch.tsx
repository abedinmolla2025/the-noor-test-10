import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type Props = {
  value: string;
  onChange: (value: string) => void;
};

export function NamesPageSearch({ value, onChange }: Props) {
  return (
    <div className="dua-surface relative shadow-soft">
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--dua-fg-soft))]" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="নাম/অর্থ লিখে খুঁজুন…"
        className="h-12 border-0 !bg-transparent pl-10 text-[hsl(var(--dua-fg))] placeholder:text-[hsl(var(--dua-fg-soft))] shadow-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--dua-accent)/0.45)]"
        aria-label="Search names"
      />
    </div>
  );
}
