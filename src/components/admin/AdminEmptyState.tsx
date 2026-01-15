import * as React from "react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type AdminEmptyStateProps = {
  title: string;
  description?: string;
  /** Optional icon element (e.g. <Users className=... />). Keep it subtle for admin-compact. */
  icon?: React.ReactNode;

  /** Primary call-to-action button (rendered on the left) */
  primaryAction?: {
    label: string;
    onClick: () => void;
    variant?: React.ComponentProps<typeof Button>["variant"];
  };

  /** Optional secondary action */
  secondaryAction?: {
    label: string;
    onClick: () => void;
    variant?: React.ComponentProps<typeof Button>["variant"];
  };

  /** Extra classes for the container */
  className?: string;
};

export function AdminEmptyState({
  title,
  description,
  icon,
  primaryAction,
  secondaryAction,
  className,
}: AdminEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex w-full flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/20 px-4 py-6 text-center",
        className,
      )}
      data-ui="admin-empty"
    >
      {icon ? (
        <div className="mb-2 inline-flex h-9 w-9 items-center justify-center rounded-full bg-background text-muted-foreground">
          {icon}
        </div>
      ) : null}

      <p className="text-sm font-medium text-foreground">{title}</p>
      {description ? (
        <p className="mt-1 max-w-md text-xs text-muted-foreground">{description}</p>
      ) : null}

      {(primaryAction || secondaryAction) && (
        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {primaryAction && (
            <Button
              size="sm"
              variant={primaryAction.variant ?? "default"}
              onClick={primaryAction.onClick}
            >
              {primaryAction.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              size="sm"
              variant={secondaryAction.variant ?? "outline"}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
