import { useMemo, useRef, useState } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";
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
  skipped: number;
  invalid: number;
};

const nameImportItemSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    title_arabic: z.string().trim().min(1).max(200).optional(),
    bn_name: z.string().trim().max(200).optional(),

    meaning_bn: z.string().trim().max(2000).optional(),
    meaning_en: z.string().trim().max(2000).optional(),
    meaning_ar: z.string().trim().max(2000).optional(),

    category: z.string().trim().max(100).optional(),

    source: z.string().trim().max(300).optional(),
    origin: z.string().trim().max(300).optional(),
    reference: z.string().trim().max(300).optional(),
  })
  .strict();

type NameImportItem = z.infer<typeof nameImportItemSchema>;

const makeKey = (title: string, titleArabic?: string) =>
  `${title.trim().toLowerCase()}||${(titleArabic ?? "").trim().toLowerCase()}`;

const chunk = <T,>(arr: T[], size: number) => {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

export function NameBulkImportDialog({
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
  const [jsonInput, setJsonInput] = useState("");
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [rawItems, setRawItems] = useState<unknown[]>([]);
  const [errors, setErrors] = useState<string[]>([]);

  const [previewQuery, setPreviewQuery] = useState("");
  const [previewCategory, setPreviewCategory] = useState<string>("all");
  const [previewOnlyDuplicates, setPreviewOnlyDuplicates] = useState(false);

  const parsed = useMemo(() => {
    const valid: NameImportItem[] = [];
    const duplicates: NameImportItem[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();
    let skipped = 0;

    rawItems.forEach((item, idx) => {
      const res = nameImportItemSchema.safeParse(item);
      if (!res.success) {
        invalid.push(`Row ${idx + 1}: invalid format`);
        return;
      }

      const it = res.data;
      const key = makeKey(it.title, it.title_arabic);
      if (existingKeys.has(key) || seen.has(key)) {
        skipped += 1;
        duplicates.push(it);
        return;
      }
      seen.add(key);
      valid.push(it);
    });

    return {
      valid,
      duplicates,
      invalid,
      skipped,
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
        it.bn_name ?? "",
        it.category ?? "",
        it.meaning_bn ?? "",
        it.meaning_en ?? "",
        it.meaning_ar ?? "",
      ];
      return parts.join(" ").toLowerCase().includes(q);
    });
  }, [previewBaseList, previewCategory, previewQuery]);

  const reset = () => {
    setFiles([]);
    setJsonInput("");
    setRawItems([]);
    setErrors([]);
    setIsParsing(false);
    setIsImporting(false);
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

  const handlePickFile = () => fileInputRef.current?.click();

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File is too large (max 10MB)", variant: "destructive" });
        return;
      }
      const text = await file.text();
      JSON.parse(text);
      setJsonInput(text);
      setFiles([]);
      setRawItems([]);
      toast({ title: `Loaded ${file.name}` });
    } catch {
      toast({ title: "Invalid JSON file", variant: "destructive" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const parseFiles = async () => {
    const hasText = jsonInput.trim().length > 0;
    if (!files.length && !hasText) {
      toast({ title: "JSON দিন (file বা paste)", variant: "destructive" });
      return;
    }

    setIsParsing(true);
    setErrors([]);

    try {
      const all: unknown[] = [];
      if (hasText) {
        const json = JSON.parse(jsonInput);
        if (!Array.isArray(json)) throw new Error("Pasted JSON: root must be an array");
        all.push(...json);
      } else {
        for (const f of files) {
          const text = await f.text();
          const json = JSON.parse(text);
          if (!Array.isArray(json)) {
            throw new Error(`${f.name}: root must be an array`);
          }
          all.push(...json);
        }
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
      toast({ title: "No permission", description: "আপনার content edit করার permission নেই", variant: "destructive" });
      return;
    }

    if (!parsed.valid.length) {
      toast({ title: "Import করার মতো valid item নেই", variant: "destructive" });
      return;
    }

    setIsImporting(true);
    try {
      const rows = parsed.valid.map((it) => {
        const meta: Record<string, string> = {};
        if (it.bn_name?.trim()) meta.bn_name = it.bn_name.trim();
        if (it.source?.trim()) meta.source = it.source.trim();
        if (it.origin?.trim()) meta.origin = it.origin.trim();
        if (it.reference?.trim()) meta.reference = it.reference.trim();

        return {
          content_type: "name",
          title: it.title.trim(),
          title_arabic: it.title_arabic?.trim() || null,
          content: it.meaning_bn?.trim() || null,
          content_en: it.meaning_en?.trim() || null,
          content_arabic: it.meaning_ar?.trim() || null,
          category: it.category?.trim() || null,
          metadata: Object.keys(meta).length ? meta : null,
          status: "draft",
          is_published: false,
        };
      });

      // Insert in chunks to avoid request limits
      for (const part of chunk(rows, 200)) {
        const { error } = await supabase.from("admin_content").insert(part);
        if (error) throw error;
      }

      const result: ImportResult = {
        total: rawItems.length,
        inserted: parsed.valid.length,
        skipped: parsed.skipped,
        invalid: parsed.invalid.length,
      };

      toast({
        title: "Import done",
        description: `Inserted ${result.inserted}, skipped ${result.skipped}, invalid ${result.invalid}`,
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
          <DialogTitle>Bulk Import — Names (JSON)</DialogTitle>
          <DialogDescription>
            এক বা একাধিক JSON ফাইল দিন (root array). Duplicate (title + title_arabic) হলে Skip হবে।
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />

          <div className="space-y-2">
            <Label>JSON files</Label>
            <Input
              type="file"
              accept="application/json,.json"
              multiple
              onChange={(e) => onPickFiles(e.target.files)}
            />
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="outline" size="sm" onClick={handlePickFile}>
                <Upload className="mr-2 h-4 w-4" />
                Import JSON file
              </Button>
              <span className="text-xs text-muted-foreground">(single file → paste field)</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={parseFiles}
                disabled={isParsing || isImporting || (!files.length && jsonInput.trim().length === 0)}
              >
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

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="name-json-input">Or paste JSON array</Label>
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={parseFiles}
                disabled={isParsing || isImporting || jsonInput.trim().length === 0}
              >
                Preview
              </Button>
            </div>
            <Textarea
              id="name-json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              rows={8}
              placeholder='[ { "title": "...", "meaning_bn": "..." } ]'
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
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Total: {rawItems.length}</span>
                <span className="text-foreground">Valid: {parsed.valid.length}</span>
                <span className="text-muted-foreground">Skipped: {parsed.skipped}</span>
                <span className="text-destructive">Invalid: {parsed.invalid.length}</span>
              </div>
              {parsed.invalid.length ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Invalid rows will be ignored (first 5 shown on import error list).
                </p>
              ) : null}
            </Card>
          ) : null}

          {parsed.valid.length ? (
            <Card className="p-3">
              <div className="flex flex-col gap-2">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <p className="text-sm font-medium">Preview (first 20)</p>
                    {previewOnlyDuplicates ? (
                      <p className="text-xs text-muted-foreground">
                        Showing duplicates that will be skipped ({parsed.duplicates.length})
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
                    placeholder="Search title/category/meaning…"
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
                    <p className="text-xs text-muted-foreground">এইগুলো import এ Skip হবে</p>
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
                      <TableHead className="whitespace-nowrap">Bangla name</TableHead>
                      <TableHead className="whitespace-nowrap">Meaning (BN)</TableHead>
                      <TableHead className="whitespace-nowrap">Meaning (EN)</TableHead>
                      <TableHead className="whitespace-nowrap">Meaning (AR)</TableHead>
                      <TableHead className="whitespace-nowrap">Category</TableHead>
                      <TableHead className="whitespace-nowrap">Source</TableHead>
                      <TableHead className="whitespace-nowrap">Origin</TableHead>
                      <TableHead className="whitespace-nowrap">Reference</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewFiltered.slice(0, 20).map((it, idx) => (
                      <TableRow key={`${it.title}-${idx}`}>
                        <TableCell className="font-medium whitespace-nowrap">{it.title}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.title_arabic ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.bn_name ?? ""}</TableCell>
                        <TableCell className="min-w-[240px]">{it.meaning_bn ?? ""}</TableCell>
                        <TableCell className="min-w-[240px]">{it.meaning_en ?? ""}</TableCell>
                        <TableCell className="min-w-[240px]">{it.meaning_ar ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.category ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.source ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.origin ?? ""}</TableCell>
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
