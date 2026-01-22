import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { AdminContentType } from "./contentTypes";
import { ADMIN_CONTENT_TYPE_OPTIONS } from "./contentTypes";

export function ContentTypeSelector({
  value,
  onChange,
  disabled,
}: {
  value: AdminContentType | null;
  onChange: (v: AdminContentType) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-1">
      <Label className="text-xs text-muted-foreground">Select Content Type</Label>
      <Select value={value ?? ""} onValueChange={(v) => onChange(v as AdminContentType)} disabled={disabled}>
        <SelectTrigger className="h-9">
          <SelectValue placeholder="Choose a content type" />
        </SelectTrigger>
        <SelectContent className="z-50 bg-popover">
          {ADMIN_CONTENT_TYPE_OPTIONS.map((o) => (
            <SelectItem key={o.value} value={o.value}>
              {o.label}
              {o.description ? ` — ${o.description}` : ""}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
