import { useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Download, Upload } from "lucide-react";
import { z } from "zod";

function makeQuestionKey(q: {
  question?: string;
  question_en?: string | null;
  question_bn?: string | null;
}) {
  // Prefer stable bilingual fields when available.
  const raw = (q.question_en || q.question_bn || q.question || "").trim();
  return raw.replace(/\s+/g, " ").toLowerCase();
}

const QuizQuestionSchema = z
  .object({
    // Base fields (required)
    question: z.string().min(1, "Question cannot be empty"),
    options: z.array(z.string()).length(4, "Must have 4 options"),
    correct_answer: z.number().min(0).max(3),
    category: z.string().min(1, "Category is required"),
    difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
    is_active: z.boolean().optional().default(true),

    // Optional bilingual packs (your uploaded JSON already contains these)
    question_en: z.string().optional(),
    question_bn: z.string().optional(),
    options_en: z.array(z.string()).length(4).optional(),
    options_bn: z.array(z.string()).length(4).optional(),
  })
  .superRefine((q, ctx) => {
    if (q.options_en && q.options_en.length !== 4) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "options_en must have 4 options" });
    }
    if (q.options_bn && q.options_bn.length !== 4) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "options_bn must have 4 options" });
    }
  });

type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export function QuizBulkImportDialog() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [preview, setPreview] = useState<QuizQuestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const importMutation = useMutation({
    mutationFn: async (questions: QuizQuestion[]) => {
      // Fetch existing questions once and skip duplicates.
      const { data: existingAll, error: existingErr } = await supabase
        .from("quiz_questions")
        .select("question, question_en, question_bn");
      if (existingErr) throw existingErr;

      const existingKeys = new Set<string>();
      (existingAll ?? []).forEach((q) => {
        const key = makeQuestionKey(q);
        if (key) existingKeys.add(key);
      });

      const seenInImport = new Set<string>();
      let skipped = 0;
      const uniqueQuestions = questions.filter((q) => {
        const key = makeQuestionKey(q);
        if (!key) {
          skipped += 1;
          return false;
        }
        if (existingKeys.has(key) || seenInImport.has(key)) {
          skipped += 1;
          return false;
        }
        seenInImport.add(key);
        return true;
      });

      if (uniqueQuestions.length === 0) {
        return { inserted: 0, skipped };
      }

      const { data: existingQuestions } = await supabase
        .from("quiz_questions")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const startIndex = existingQuestions?.[0]?.order_index ?? -1;

      const questionsWithOrder = uniqueQuestions.map((q, index) => {
        const derivedBaseQuestion = (q.question_en || q.question_bn || q.question).trim();
        const derivedOptions = (q.options_en || q.options_bn || q.options).map((s) => String(s));

        return {
          // Base (used by older clients / fallback)
          question: derivedBaseQuestion,
          options: derivedOptions,

          // Explicit bilingual fields (if present)
          question_en: q.question_en ?? null,
          question_bn: q.question_bn ?? null,
          options_en: q.options_en ?? null,
          options_bn: q.options_bn ?? null,

          correct_answer: q.correct_answer,
          category: q.category,
          difficulty: q.difficulty || "medium",
          is_active: q.is_active !== false,
          order_index: startIndex + index + 1,
        };
      });

      const { error } = await supabase.from("quiz_questions").insert(questionsWithOrder);

      if (error) throw error;

      return { inserted: uniqueQuestions.length, skipped };
    },
    onSuccess: (result, questions) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      const inserted = result?.inserted ?? questions.length;
      const skipped = result?.skipped ?? 0;
      if (skipped > 0) {
        toast.success(`Imported ${inserted} questions (skipped ${skipped} duplicates)`);
      } else {
        toast.success(`Imported ${inserted} questions`);
      }
      setIsOpen(false);
      setJsonInput("");
      setPreview([]);
    },
    onError: (error: Error) => {
      toast.error("Error: " + error.message);
    },
  });

  const handlePreview = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      const questions = Array.isArray(parsed) ? parsed : [parsed];

      const validated = questions.map((q, index) => {
        try {
          return QuizQuestionSchema.parse(q);
        } catch (err) {
          if (err instanceof z.ZodError) {
            throw new Error(
              `Question #${index + 1}: ${err.errors.map((e) => e.message).join(", ")}`
            );
          }
          throw err;
        }
      });

      setPreview(validated);
      toast.success(`${validated.length} questions validated`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("JSON Error: " + error.message);
      } else {
        toast.error("Invalid JSON format");
      }
      setPreview([]);
    }
  };

  const handlePickFile = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelected = async (file: File | null) => {
    if (!file) return;
    try {
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File is too large (max 10MB)");
        return;
      }
      const text = await file.text();
      // Basic validation before setting
      JSON.parse(text);
      setJsonInput(text);
      setPreview([]);
      toast.success(`Loaded ${file.name}`);
    } catch (e) {
      toast.error("Invalid JSON file");
    } finally {
      // allow re-selecting same file
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleExportJson = () => {
    const content = (jsonInput.trim().length ? jsonInput : exampleJson).trim();
    const blob = new Blob([content], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "quiz-questions.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast.error("Please preview first");
      return;
    }
    importMutation.mutate(preview);
  };

  const exampleJson = `[
  {
    "question": "How many surahs are in the Quran?",
    "question_en": "How many surahs are in the Quran?",
    "question_bn": "কুরআন কত সূরা নিয়ে গঠিত?",
    "options": ["114", "115", "113", "112"],
    "options_en": ["114", "115", "113", "112"],
    "options_bn": ["১১৪", "১১৫", "১১৩", "১১২"],
    "correct_answer": 0,
    "category": "Quran",
    "difficulty": "easy",
    "is_active": true
  }
]`;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Upload className="h-4 w-4 mr-2" />
          Bulk Import
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Question Import (JSON)</DialogTitle>
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
            <Label>JSON Format Example:</Label>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {exampleJson}
            </pre>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3">
              <Label htmlFor="json-input">Paste JSON data:</Label>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" size="sm" onClick={handlePickFile}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import JSON file
                </Button>
                <Button type="button" variant="outline" size="sm" onClick={handleExportJson}>
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
              </div>
            </div>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="Paste JSON data here..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>Preview ({preview.length} questions):</Label>
              <div className="bg-muted p-4 rounded-lg max-h-60 overflow-y-auto space-y-4">
                {preview.map((q, index) => (
                  <div key={index} className="border-b border-border pb-2 last:border-0">
                    <p className="font-semibold">
                      {index + 1}. {q.question}
                    </p>
                    <ul className="text-sm text-muted-foreground ml-4 mt-1">
                      {q.options.map((opt, i) => (
                        <li
                          key={i}
                          className={i === q.correct_answer ? "text-green-600 font-semibold" : ""}
                        >
                          {String.fromCharCode(65 + i)}. {opt}
                          {i === q.correct_answer && " ✓"}
                        </li>
                      ))}
                    </ul>
                    <p className="text-xs text-muted-foreground mt-1">
                      Category: {q.category} | Difficulty: {q.difficulty}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button variant="secondary" onClick={handlePreview}>
              Preview
            </Button>
            <Button
              onClick={handleImport}
              disabled={preview.length === 0 || importMutation.isPending}
            >
              {importMutation.isPending ? "Importing..." : "Import"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
