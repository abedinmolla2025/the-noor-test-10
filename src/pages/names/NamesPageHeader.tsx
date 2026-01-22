import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import { Button } from "@/components/ui/button";

type Props = {
  title: string;
  subtitle: string;
};

export function NamesPageHeader({ title, subtitle }: Props) {
  const navigate = useNavigate();

  return (
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
          {title}
        </h1>
        <p className="truncate text-xs text-[hsl(var(--dua-fg-muted))]">{subtitle}</p>
      </div>
    </div>
  );
}
