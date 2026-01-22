import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Props = {
  count: number;
  onSubmitForReview: () => void;
  onPublish: () => void;
  onDismiss: () => void;
  disabledReview?: boolean;
  disabledPublish?: boolean;
};

export function JustImportedActionBar({
  count,
  onSubmitForReview,
  onPublish,
  onDismiss,
  disabledReview,
  disabledPublish,
}: Props) {
  if (!count) return null;

  return (
    <div className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-3xl rounded-2xl border border-border bg-background/95 p-3 shadow-lg backdrop-blur sm:inset-x-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="rounded-full">
            Just imported ({count})
          </Badge>
          <div className="text-xs text-muted-foreground">One-click actions for this batch</div>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          <Button type="button" size="sm" variant="outline" disabled={!!disabledReview} onClick={onSubmitForReview}>
            Submit for Review
          </Button>
          <Button type="button" size="sm" variant="secondary" disabled={!!disabledPublish} onClick={onPublish}>
            Publish Now
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={onDismiss}>
            Dismiss
          </Button>
        </div>
      </div>
    </div>
  );
}
