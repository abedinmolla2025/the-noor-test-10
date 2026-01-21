import { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { X } from "lucide-react";
import { useInAppNotifications } from "@/hooks/useInAppNotifications";
import { Button } from "@/components/ui/button";

const DISMISS_KEY = "noor_announcement_dismissed_ids";

function getDismissedSet(): Set<string> {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    return new Set(ids);
  } catch {
    return new Set();
  }
}

function setDismissedSet(ids: Set<string>) {
  try {
    localStorage.setItem(DISMISS_KEY, JSON.stringify(Array.from(ids).slice(0, 500)));
  } catch {
    // ignore
  }
}

export default function AnnouncementTicker() {
  const location = useLocation();
  const navigate = useNavigate();
  const { data } = useInAppNotifications();

  const dismissed = useMemo(() => getDismissedSet(), []);

  const isAdminRoute = location.pathname.startsWith("/admin");
  if (isAdminRoute) return null;

  const latest = (data ?? [])[0];
  if (!latest) return null;
  if (dismissed.has(latest.id)) return null;

  const text = `${latest.title}: ${latest.message}`;

  return (
    <div className="border-b border-border bg-background/80 backdrop-blur">
      <div className="mx-auto flex max-w-lg items-center gap-2 px-3 py-2">
        <button
          type="button"
          onClick={() => navigate("/notifications")}
          className="group relative flex-1 overflow-hidden whitespace-nowrap text-left"
          aria-label="Open notifications"
        >
          <span
            className="inline-block pr-12 text-xs font-medium text-foreground/90"
            style={{ animation: "noor-marquee 18s linear infinite" }}
          >
            {text}
          </span>
          <span className="pointer-events-none absolute inset-y-0 left-0 w-8 bg-gradient-to-r from-background/90 to-transparent" />
          <span className="pointer-events-none absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-background/90 to-transparent" />
        </button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label="Dismiss announcement"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            const next = new Set(dismissed);
            next.add(latest.id);
            setDismissedSet(next);
            navigate(0);
          }}
        >
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
