import { useMemo, useState } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ImportResult = {
  total: number;
  inserted: number;
  updated: number;
  skipped: number;
  invalid: number;
};

const duaImportItemSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    title_arabic: z.string().trim().min(1).max(200).optional(),

    content_bn: z.string().trim().max(8000).optional(),
    content_en: z.string().trim().max(8000).optional(),
    pronunciation: z.string().trim().max(2000).optional(),

    category: z.string().trim().max(100).optional(),

    source: z.string().trim().max(300).optional(),
    reference: z.string().trim().max(300).optional(),
  })
  .strict();

type DuaImportItem = z.infer<typeof duaImportItemSchema>;

const makeKey = (title: string, titleArabic?: string) =>
  `${title.trim().toLowerCase()}||${(titleArabic ?? "").trim().toLowerCase()}`;

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export function DuaBulkImportDialog({
  open,
  onOpenChange,
  canEdit,
  existingKeys,
  onImported,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  canEdit: boolean;
  existingKeys: Set<string>;
  onImported?: (result: ImportResult) => void;
}) {
  const { toast } = useToast();

  const [jsonInput, setJsonInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [rawItems, setRawItems] = useState<unknown[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const [duplicateMode, setDuplicateMode] = useState<"skip" | "update">("skip");

  const [previewOnlyDuplicates, setPreviewOnlyDuplicates] = useState(false);

  const exampleJson = `[
  {
    "title": "Morning Dua",
    "title_arabic": "دعاء الصباح",
    "content_bn": "...",
    "content_en": "...",
    "pronunciation": "...",
    "category": "Morning",
    "source": "...",
    "reference": "..."
  }
]`;

  const parsed = useMemo(() => {
    const valid: DuaImportItem[] = [];
    const duplicatesExisting: DuaImportItem[] = [];
    const duplicatesInFile: DuaImportItem[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();

    rawItems.forEach((item, idx) => {
      const res = duaImportItemSchema.safeParse(item);
      if (!res.success) {
        invalid.push(`Row ${idx + 1}: invalid format`);
        return;
      }

      const it = res.data;
      const key = makeKey(it.title, it.title_arabic);

      if (seen.has(key)) {
        duplicatesInFile.push(it);
        return;
      }

      if (existingKeys.has(key)) {
        duplicatesExisting.push(it);
        return;
      }

      seen.add(key);
      valid.push(it);
    });

    return {
      valid,
      duplicatesExisting,
      duplicatesInFile,
      duplicates: [...duplicatesExisting, ...duplicatesInFile],
      invalid,
    };
  }, [rawItems, existingKeys]);

  const previewList = useMemo(() => {
    if (previewOnlyDuplicates) return parsed.duplicates;
    return duplicateMode === "update" ? [...parsed.valid, ...parsed.duplicatesExisting] : parsed.valid;
  }, [duplicateMode, parsed.duplicates, parsed.duplicatesExisting, parsed.valid, previewOnlyDuplicates]);

  const reset = () => {
    setJsonInput("");
    setRawItems([]);
    setErrors([]);
    setIsParsing(false);
    setIsImporting(false);
    setDuplicateMode("skip");
    setPreviewOnlyDuplicates(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const handleExportJson = () => {
    const content = (jsonInput.trim().length ? jsonInput : exampleJson).trim();
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "duas.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const parseFiles = async () => {
    const hasText = jsonInput.trim().length > 0;
    if (!hasText) {
      toast({ title: "JSON দিন (paste)", variant: "destructive" });
      return;
    }

    setIsParsing(true);
    setErrors([]);

    try {
      const all: unknown[] = [];
      const json = JSON.parse(jsonInput);
      if (!Array.isArray(json)) throw new Error("JSON must be an array");
      all.push(...json);

      setRawItems(all);
      toast({ title: "Parsed", description: `${all.length} items পাওয়া গেছে` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to parse JSON";
      setErrors([msg]);
      toast({ title: "Parse failed", description: msg, variant: "destructive" });
    } finally {
      setIsParsing(false);
    }
  };

  const doImport = async () => {
    if (!canEdit) {
      toast({
        title: "No permission",
        description: "আপনার content edit করার permission নেই",
        variant: "destructive",
      });
      return;
    }

    const canInsert = parsed.valid.length > 0;
    const canUpdate = duplicateMode === "update" && parsed.duplicatesExisting.length > 0;

    if (!canInsert && !canUpdate) {
      toast({ title: "Import করার মতো item নেই", variant: "destructive" });
      return;
    }

    const normalize = (v: string) => v.trim().toLowerCase();
    const keyOf = (t: string, a?: string | null) => `${normalize(t)}||${normalize(a ?? "")}`;

    const quote = (v: string) => `"${v.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;

    const buildOrFilter = (items: DuaImportItem[]) =>
      items
        .map((it) => {
          const t = quote(it.title.trim());
          const a = (it.title_arabic ?? "").trim();
          const aPart = a ? `title_arabic.eq.${quote(a)}` : "title_arabic.is.null";
          return `and(title.eq.${t},${aPart})`;
        })
        .join(",");

    setIsImporting(true);
    try {
      // 1) Insert new items
      if (parsed.valid.length) {
        const rows = parsed.valid.map((it) => {
          const meta: Record<string, string> = {};
          if (it.source?.trim()) meta.source = it.source.trim();
          if (it.reference?.trim()) meta.reference = it.reference.trim();

          return {
            content_type: "dua",
            title: it.title.trim(),
            title_arabic: it.title_arabic?.trim() || null,
            content: it.content_bn?.trim() || null,
            content_en: it.content_en?.trim() || null,
            content_pronunciation: it.pronunciation?.trim() || null,
            category: it.category?.trim() || null,
            metadata: Object.keys(meta).length ? meta : null,
            status: "draft",
            is_published: false,
          };
        });

        for (const part of chunk(rows, 200)) {
          const { error } = await supabase.from("admin_content").insert(part);
          if (error) throw error;
        }
      }

      // 2) Update duplicates (existing rows)
      let updated = 0;
      let notFound = 0;

      if (duplicateMode === "update" && parsed.duplicatesExisting.length) {
        for (const group of chunk(parsed.duplicatesExisting, 25)) {
          const orFilter = buildOrFilter(group);
          const { data, error } = await supabase
            .from("admin_content")
            .select("id,title,title_arabic,metadata")
            .eq("content_type", "dua")
            .or(orFilter);

          if (error) throw error;

          const byKey = new Map<string, { id: string; metadata: unknown }>();
          (data ?? []).forEach((row: any) => {
            byKey.set(keyOf(row.title, row.title_arabic), { id: row.id, metadata: row.metadata });
          });

          // Update sequentially to avoid bursts
          for (const it of group) {
            const hit = byKey.get(keyOf(it.title, it.title_arabic ?? null));
            if (!hit) {
              notFound += 1;
              continue;
            }

            const baseMeta = hit.metadata && typeof hit.metadata === "object" ? { ...(hit.metadata as any) } : {};
            if (it.source?.trim()) baseMeta.source = it.source.trim();
            if (it.reference?.trim()) baseMeta.reference = it.reference.trim();

            const payload = {
              title: it.title.trim(),
              title_arabic: it.title_arabic?.trim() || null,
              content: it.content_bn?.trim() || null,
              content_en: it.content_en?.trim() || null,
              content_pronunciation: it.pronunciation?.trim() || null,
              category: it.category?.trim() || null,
              metadata: Object.keys(baseMeta).length ? baseMeta : null,
              // keep draft/unpublished to match existing import behavior
              status: "draft",
              is_published: false,
            };

            const { error: updateError } = await supabase
              .from("admin_content")
              .update(payload)
              .eq("id", hit.id);
            if (updateError) throw updateError;
            updated += 1;
          }
        }
      }

      const skipped = parsed.duplicatesInFile.length + (duplicateMode === "skip" ? parsed.duplicatesExisting.length : 0) + notFound;

      const result: ImportResult = {
        total: rawItems.length,
        inserted: parsed.valid.length,
        updated,
        skipped,
        invalid: parsed.invalid.length,
      };

      toast({
        title: "Import done",
        description: `Inserted ${result.inserted}, updated ${result.updated}, skipped ${result.skipped}, invalid ${result.invalid}`,
      });

      onImported?.(result);
      handleClose(false);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Import failed";
      toast({ title: "Import failed", description: msg, variant: "destructive" });
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import — Dua (JSON)</DialogTitle>
          <DialogDescription>
            JSON paste করুন, তারপর Preview দেখে Import করুন। Duplicate হলে Skip/Update হবে (mode অনুযায়ী)।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>JSON Format Example:</Label>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">{exampleJson}</pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="dua-json-input">Paste JSON data:</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handleExportJson}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>
            <Textarea
              id="dua-json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={10}
              placeholder="Paste JSON data here..."
              className="font-mono text-sm"
            />
          </div>

          {errors.length ? (
            <Card className="p-3 text-sm">
              <p className="font-medium">Errors</p>
              <ul className="mt-2 list-disc pl-5 text-muted-foreground">
                {errors.slice(0, 5).map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </Card>
          ) : null}

          {rawItems.length ? (
            <Card className="p-3 text-sm">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex flex-wrap gap-x-4 gap-y-1">
                  <span>Total: {rawItems.length}</span>
                  <span className="text-foreground">New: {parsed.valid.length}</span>
                  <span className="text-foreground">Dup existing: {parsed.duplicatesExisting.length}</span>
                  <span className="text-muted-foreground">Dup in file: {parsed.duplicatesInFile.length}</span>
                  <span className="text-destructive">Invalid: {parsed.invalid.length}</span>
                </div>

                <div className="w-full sm:w-[220px]">
                  <Select value={duplicateMode} onValueChange={(v) => setDuplicateMode(v as any)}>
                    <SelectTrigger aria-label="Duplicate mode">
                      <SelectValue placeholder="Duplicate mode" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="skip">Duplicates: Skip</SelectItem>
                      <SelectItem value="update">Duplicates: Update</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </Card>
          ) : null}

          {previewList.length > 0 ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <Label>Preview ({previewList.length} items):</Label>
                <div className="flex items-center gap-3">
                  <div className="w-[220px]">
                    <Select value={duplicateMode} onValueChange={(v) => setDuplicateMode(v as any)}>
                      <SelectTrigger aria-label="Duplicate mode">
                        <SelectValue placeholder="Duplicate mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="skip">Duplicates: Skip</SelectItem>
                        <SelectItem value="update">Duplicates: Update</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border px-3 py-2">
                    <p className="text-sm font-medium">Only duplicates</p>
                    <Switch checked={previewOnlyDuplicates} onCheckedChange={setPreviewOnlyDuplicates} />
                  </div>
                </div>
              </div>

              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
                <Table className="min-w-[980px] text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Title</TableHead>
                      <TableHead className="whitespace-nowrap">Arabic</TableHead>
                      <TableHead className="whitespace-nowrap">Content (BN)</TableHead>
                      <TableHead className="whitespace-nowrap">Content (EN)</TableHead>
                      <TableHead className="whitespace-nowrap">Pronunciation</TableHead>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewList.slice(0, 20).map((it, idx) => (
                      <TableRow key={`${it.title}-${idx}`}>
                        <TableCell className="font-medium whitespace-nowrap">{it.title}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.title_arabic ?? ""}</TableCell>
                        <TableCell className="min-w-[320px]">{it.content_bn ?? ""}</TableCell>
                        <TableCell className="min-w-[320px]">{it.content_en ?? ""}</TableCell>
                        <TableCell className="min-w-[220px]">{it.pronunciation ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.category ?? ""}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Cancel
          </Button>
          <Button type="button" variant="secondary" onClick={parseFiles} disabled={isParsing || isImporting || jsonInput.trim().length === 0}>
            {isParsing ? "Previewing…" : "Preview"}
          </Button>
          <Button type="button" onClick={doImport} disabled={isImporting || isParsing || !rawItems.length}>
            {isImporting ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
