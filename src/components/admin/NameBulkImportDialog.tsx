import { useMemo, useRef, useState } from "react";
import { z } from "zod";

import { supabase } from "@/integrations/supabase/client";
import { exportAllNamesFromDbToJson } from "@/lib/exportNamesJson";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Download, Upload } from "lucide-react";
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
  insertedIds?: string[];
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

  const [jsonInput, setJsonInput] = useState("");
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [isExportingAll, setIsExportingAll] = useState(false);
  const [rawItems, setRawItems] = useState<unknown[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const exampleJson = `[
  {
    "title": "Ayaan",
    "title_arabic": "عيان",
    "bn_name": "আয়ান",
    "meaning_bn": "আল্লাহর উপহার",
    "meaning_en": "Gift of Allah",
    "meaning_ar": "هبة الله",
    "category": "Boy",
    "source": "...",
    "origin": "...",
    "reference": "..."
  }
]`;

  const parsed = useMemo(() => {
    const valid: NameImportItem[] = [];
    const duplicatesExisting: NameImportItem[] = [];
    const duplicatesInFile: NameImportItem[] = [];
    const invalid: string[] = [];
    const seen = new Set<string>();

    rawItems.forEach((item, idx) => {
      const res = nameImportItemSchema.safeParse(item);
      if (!res.success) {
        invalid.push(`Row ${idx + 1}: invalid format`);
        return;
      }

      const it = res.data;
      const key = makeKey(it.title, it.title_arabic);
      if (existingKeys.has(key)) {
        duplicatesExisting.push(it);
        return;
      }
      if (seen.has(key)) {
        duplicatesInFile.push(it);
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
      skipped: duplicatesExisting.length + duplicatesInFile.length,
    };
  }, [rawItems, existingKeys]);

  const previewList = useMemo(() => parsed.valid, [parsed.valid]);

  const reset = () => {
    setJsonInput("");
    setRawItems([]);
    setErrors([]);
    setIsParsing(false);
    setIsImporting(false);
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
    a.download = "names.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleExportAllFromDb = async () => {
    try {
      setIsExportingAll(true);
      const filename = `names-all-${new Date().toISOString().slice(0, 10)}.json`;
      const res = await exportAllNamesFromDbToJson({ filename });
      toast({ title: "Exported", description: `${res.total} নাম ডাউনলোড হয়েছে` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Export failed";
      toast({ title: "Export failed", description: msg, variant: "destructive" });
    } finally {
      setIsExportingAll(false);
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) {
        toast({ title: "File too large", description: "Max 10MB", variant: "destructive" });
        return;
      }
      const text = await file.text();
      JSON.parse(text);
      setJsonInput(text);
      setRawItems([]);
      setErrors([]);
      toast({ title: "Loaded", description: file.name });
    } catch (e) {
      toast({ title: "Invalid JSON file", variant: "destructive" });
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
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
      const insertedIds: string[] = [];
      for (const part of chunk(rows, 200)) {
        const { data, error } = await supabase.from("admin_content").insert(part).select("id");
        if (error) throw error;
        for (const row of (data ?? []) as any[]) {
          if (row?.id) insertedIds.push(String(row.id));
        }
      }

      const result: ImportResult = {
        total: rawItems.length,
        inserted: parsed.valid.length,
        skipped: parsed.skipped,
        invalid: parsed.invalid.length,
        insertedIds,
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
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Import — Names (JSON)</DialogTitle>
          <DialogDescription>JSON paste করুন, তারপর Preview দেখে Import করুন।</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            hidden
            aria-hidden="true"
            tabIndex={-1}
            style={{ display: "none" }}
            onChange={(e) => handleFileSelected(e.target.files?.[0] ?? null)}
          />

          <div className="space-y-2">
            <Label>JSON Format Example:</Label>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">{exampleJson}</pre>
          </div>

          <div className="space-y-2">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <Label htmlFor="name-json-input">Paste JSON data:</Label>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handlePickFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON file
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportAllFromDb}
                  disabled={isExportingAll || isParsing || isImporting}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isExportingAll ? "Exporting…" : "Export All (DB)"}
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleExportJson}>
                  <Download className="h-4 w-4 mr-2" />
                  Export Template
                </Button>
              </div>
            </div>
            <Textarea
              id="name-json-input"
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
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                <span>Total: {rawItems.length}</span>
                <span className="text-foreground">Valid: {parsed.valid.length}</span>
                <span className="text-foreground">Dup existing: {parsed.duplicatesExisting.length}</span>
                <span className="text-muted-foreground">Dup in file: {parsed.duplicatesInFile.length}</span>
                <span className="text-muted-foreground">Skipped (dup): {parsed.skipped}</span>
                <span className="text-destructive">Invalid: {parsed.invalid.length}</span>
              </div>
              {parsed.invalid.length ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Invalid rows will be ignored (first 5 shown on import error list).
                </p>
              ) : null}
            </Card>
          ) : null}

          {previewList.length > 0 ? (
            <div className="space-y-2">
              <Label>Preview ({previewList.length} items):</Label>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto">
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
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {previewList.slice(0, 20).map((it, idx) => (
                      <TableRow key={`${it.title}-${idx}`}>
                        <TableCell className="font-medium whitespace-nowrap">{it.title}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.title_arabic ?? ""}</TableCell>
                        <TableCell className="whitespace-nowrap">{it.bn_name ?? ""}</TableCell>
                        <TableCell className="min-w-[240px]">{it.meaning_bn ?? ""}</TableCell>
                        <TableCell className="min-w-[240px]">{it.meaning_en ?? ""}</TableCell>
                        <TableCell className="min-w-[240px]">{it.meaning_ar ?? ""}</TableCell>
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
