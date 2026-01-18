import { useMemo, useState } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

  const [files, setFiles] = useState<File[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [rawItems, setRawItems] = useState<unknown[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const [duplicateMode, setDuplicateMode] = useState<"skip" | "update">("skip");

  const [previewQuery, setPreviewQuery] = useState("");
  const [previewCategory, setPreviewCategory] = useState<string>("all");
  const [previewOnlyDuplicates, setPreviewOnlyDuplicates] = useState(false);

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

  const previewBaseList = useMemo(
    () => (previewOnlyDuplicates ? parsed.duplicates : parsed.valid),
    [parsed.duplicates, parsed.valid, previewOnlyDuplicates]
  );

  const previewCategories = useMemo(() => {
    const set = new Set<string>();
    for (const it of previewBaseList) {
      const c = (it.category ?? "").trim();
      if (c) set.add(c);
    }
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [previewBaseList]);

  const previewFiltered = useMemo(() => {
    const q = previewQuery.trim().toLowerCase();
    const list =
      previewCategory === "all"
        ? previewBaseList
        : previewBaseList.filter((it) => (it.category ?? "").trim() === previewCategory);

    if (!q) return list;

    return list.filter((it) => {
      const parts = [
        it.title,
        it.title_arabic ?? "",
        it.category ?? "",
        it.content_bn ?? "",
        it.content_en ?? "",
        it.pronunciation ?? "",
      ];
      return parts.join(" ").toLowerCase().includes(q);
    });
  }, [previewBaseList, previewCategory, previewQuery]);

  const reset = () => {
    setFiles([]);
    setRawItems([]);
    setErrors([]);
    setIsParsing(false);
    setIsImporting(false);
    setDuplicateMode("skip");
    setPreviewQuery("");
    setPreviewCategory("all");
    setPreviewOnlyDuplicates(false);
  };

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) reset();
    onOpenChange(nextOpen);
  };

  const onPickFiles = (list: FileList | null) => {
    if (!list) return;
    setFiles(Array.from(list));
  };

  const parseFiles = async () => {
    if (!files.length) {
      toast({ title: "JSON file দিন", variant: "destructive" });
      return;
    }

    setIsParsing(true);
    setErrors([]);

    try {
      const all: unknown[] = [];
      for (const f of files) {
        const text = await f.text();
        const json = JSON.parse(text);
        if (!Array.isArray(json)) {
          throw new Error(`${f.name}: root must be an array`);
        }
        all.push(...json);
      }

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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Bulk Import — Dua (JSON)</DialogTitle>
          <DialogDescription>
            এক বা একাধিক JSON ফাইল দিন (root array). Duplicate (title + title_arabic) হলে Skip বা Update হবে (mode অনুযায়ী)।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>JSON files</Label>
            <Input
              type="file"
              accept="application/json,.json"
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" onClick={parseFiles} disabled={isParsing || !files.length}>
                {isParsing ? "Parsing…" : "Parse"}
              </Button>
              <Button type="button" variant="ghost" onClick={reset} disabled={isParsing || isImporting}>
                Reset
              </Button>
            </div>
            {files.length ? (
              <p className="text-xs text-muted-foreground">Selected: {files.map((f) => f.name).join(", ")}</p>
            ) : null}
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

          {parsed.valid.length || parsed.duplicates.length ? (
            <Card className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Preview (first 20)</p>
                    {previewOnlyDuplicates ? (
                      <p className="text-xs text-muted-foreground">
                        {duplicateMode === "update"
                          ? `Showing duplicates (existing: ${parsed.duplicatesExisting.length}, in file: ${parsed.duplicatesInFile.length})`
                          : `Showing duplicates that will be skipped (${parsed.duplicates.length})`}
                      </p>
                    ) : null}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Showing {Math.min(20, previewFiltered.length)} of {previewFiltered.length}
                  </p>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  <Input
                    value={previewQuery}
                    onChange={(e) => setPreviewQuery(e.target.value)}
                    placeholder="Search title/category/content…"
                    aria-label="Preview search"
                  />

                  <Select value={previewCategory} onValueChange={setPreviewCategory}>
                    <SelectTrigger aria-label="Filter by category">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All categories</SelectItem>
                      {previewCategories.map((c) => (
                        <SelectItem key={c} value={c}>
                          {c}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between gap-3 rounded-md border border-border p-2">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Only duplicates</p>
                    <p className="text-xs text-muted-foreground">
                      {duplicateMode === "update" ? "existing duplicates update হবে" : "এইগুলো import এ Skip হবে"}
                    </p>
                  </div>
                  <Switch
                    checked={previewOnlyDuplicates}
                    onCheckedChange={(v) => {
                      setPreviewOnlyDuplicates(v);
                      setPreviewCategory("all");
                      setPreviewQuery("");
                    }}
                    aria-label="Only duplicates"
                  />
                </div>
              </div>

              <div className="mt-3 overflow-auto">
                <Table className="min-w-[980px] text-xs">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="whitespace-nowrap">Title</TableHead>
                      <TableHead className="whitespace-nowrap">Arabic</TableHead>
                      <TableHead className="whitespace-nowrap">Content (BN)</TableHead>
                      <TableHead className="whitespace-nowrap">Content (EN)</TableHead>
                      <TableHead className="whitespace-nowrap">Pronunciation</TableHead>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap">Source</TableHead>
                      <TableHead className="whitespace-nowrap">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewFiltered.slice(0, 20).map((it, idx) => (
                      <TableRow key={`${it.title}-${idx}`}>
                        <TableCell className="font-medium whitespace-nowrap">{it.title}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.title_arabic ?? ""}</TableCell>
                        <TableCell className="min-w-[320px]">{it.content_bn ?? ""}</TableCell>
                        <TableCell className="min-w-[320px]">{it.content_en ?? ""}</TableCell>
                        <TableCell className="min-w-[220px]">{it.pronunciation ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.category ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.source ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.reference ?? ""}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </Card>
          ) : null}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleClose(false)}>
            Close
          </Button>
          <Button type="button" onClick={doImport} disabled={isImporting || isParsing || !rawItems.length}>
            {isImporting ? "Importing…" : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
