import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

interface ImportDuaJson {
  title: string;
  title_arabic: string;
  content_arabic: string;
  pronunciation: string;
  content: string;
  category: string;
}

// Example test dua – you can replace/extend this list with your full JSON
const OLD_DUAS: ImportDuaJson[] = [
  {
    title: "ঘুমের আগে দোয়া",
    title_arabic: "دعاء قبل النوم",
    content_arabic:
      "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    pronunciation: "বিসমিকা আল্লাহুম্মা আমূতু ওয়া আহইয়া",
    content: "হে আল্লাহ! আপনারই নামে আমি মরি এবং বেঁচে উঠি।",
    category: "Sleep",
  },
];

export default function ImportOldDuas() {
  const { user, isAdmin, isSuperAdmin } = useAdmin();
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(OLD_DUAS, null, 2));

  const canImport = !!user && (isAdmin || isSuperAdmin);

  const handleImport = async () => {
    setStatus("");
    setError("");

    if (!canImport) {
      setError("You must be logged in as admin to import.");
      return;
    }

    let parsed: ImportDuaJson[];
    try {
      parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array");
      }
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
      return;
    }

    try {
      const payload = parsed.map((d) => ({
        content_type: "dua",
        title: d.title,
        title_arabic: d.title_arabic,
        content: d.content,
        content_arabic: d.content_arabic,
        content_pronunciation: d.pronunciation,
        category: d.category,
        status: "published",
        is_published: true,
      }));

      const { error: insertError } = await supabase.from("admin_content").insert(payload);
      if (insertError) throw insertError;

      setStatus(`Imported ${payload.length} duas successfully.`);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Import failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Import Old Duas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canImport && (
            <Alert variant="destructive">
              You must be logged in as an admin to run this import.
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            Paste your JSON array of duas here. Each item must have
            <code className="mx-1">title</code>,
            <code className="mx-1">title_arabic</code>,
            <code className="mx-1">content_arabic</code>,
            <code className="mx-1">pronunciation</code>,
            <code className="mx-1">content</code>, and
            <code className="mx-1">category</code> fields.
          </p>

          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={18}
            className="font-mono text-xs"
          />

          <div className="flex gap-2 items-center">
            <Button onClick={handleImport} disabled={!canImport}>
              Import Duas
            </Button>
            {status && <span className="text-sm text-emerald-500">{status}</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
