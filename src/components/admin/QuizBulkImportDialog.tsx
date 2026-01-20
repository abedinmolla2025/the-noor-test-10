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

const QuizQuestionSchema = z.object({
  question: z.string().min(1, "Question cannot be empty"),
  options: z.array(z.string()).length(4, "Must have 4 options"),
  correct_answer: z.number().min(0).max(3),
  category: z.string().min(1, "Category is required"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  is_active: z.boolean().optional().default(true),
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
      const { data: existingQuestions } = await supabase
        .from("quiz_questions")
        .select("order_index")
        .order("order_index", { ascending: false })
        .limit(1);

      const startIndex = existingQuestions?.[0]?.order_index ?? -1;

      const questionsWithOrder = questions.map((q, index) => ({
        question: q.question,
        options: q.options,
        correct_answer: q.correct_answer,
        category: q.category,
        difficulty: q.difficulty || "medium",
        is_active: q.is_active !== false,
        order_index: startIndex + index + 1,
      }));

      const { error } = await supabase.from("quiz_questions").insert(questionsWithOrder);

      if (error) throw error;
    },
    onSuccess: (_, questions) => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success(`${questions.length} questions added successfully`);
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
    "options": ["114", "115", "113", "112"],
    "correct_answer": 0,
    "category": "Quran",
    "difficulty": "easy",
    "is_active": true
  },
  {
    "question": "What is the first pillar of Islam?",
    "options": ["Prayer", "Fasting", "Shahada", "Zakat"],
    "correct_answer": 2,
    "category": "Pillars",
    "difficulty": "easy"
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
