import { useState } from "react";
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
import { Upload } from "lucide-react";
import { z } from "zod";

const QuizQuestionSchema = z.object({
  question: z.string().min(1, "প্রশ্ন খালি হতে পারবে না"),
  options: z.array(z.string()).length(4, "৪টি অপশন থাকতে হবে"),
  correct_answer: z.number().min(0).max(3),
  category: z.string().min(1, "ক্যাটাগরি দিতে হবে"),
  difficulty: z.enum(["easy", "medium", "hard"]).optional().default("medium"),
  is_active: z.boolean().optional().default(true),
});

type QuizQuestion = z.infer<typeof QuizQuestionSchema>;

export function QuizBulkImportDialog() {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [jsonInput, setJsonInput] = useState("");
  const [preview, setPreview] = useState<QuizQuestion[]>([]);

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
      toast.success(`${questions.length}টি প্রশ্ন সফলভাবে যুক্ত হয়েছে`);
      setIsOpen(false);
      setJsonInput("");
      setPreview([]);
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
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
              `প্রশ্ন #${index + 1}: ${err.errors.map((e) => e.message).join(", ")}`
            );
          }
          throw err;
        }
      });

      setPreview(validated);
      toast.success(`${validated.length}টি প্রশ্ন যাচাই হয়েছে`);
    } catch (error) {
      if (error instanceof Error) {
        toast.error("JSON ত্রুটি: " + error.message);
      } else {
        toast.error("অবৈধ JSON ফরম্যাট");
      }
      setPreview([]);
    }
  };

  const handleImport = () => {
    if (preview.length === 0) {
      toast.error("প্রথমে প্রিভিউ দেখুন");
      return;
    }
    importMutation.mutate(preview);
  };

  const exampleJson = `[
  {
    "question": "কুরআন কত সূরা নিয়ে গঠিত?",
    "options": ["১১৪", "১১৫", "১১৩", "১১২"],
    "correct_answer": 0,
    "category": "Quran",
    "difficulty": "easy",
    "is_active": true
  },
  {
    "question": "ইসলামের পাঁচ স্তম্ভের প্রথমটি কী?",
    "options": ["নামাজ", "রোজা", "শাহাদাহ", "যাকাত"],
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
          বাল্ক ইম্পোর্ট
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>বাল্ক প্রশ্ন ইম্পোর্ট (JSON)</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>JSON ফরম্যাট উদাহরণ:</Label>
            <pre className="bg-muted p-4 rounded-lg text-xs overflow-x-auto">
              {exampleJson}
            </pre>
          </div>

          <div className="space-y-2">
            <Label htmlFor="json-input">JSON ডেটা পেস্ট করুন:</Label>
            <Textarea
              id="json-input"
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              placeholder="JSON ডেটা এখানে পেস্ট করুন..."
              rows={10}
              className="font-mono text-sm"
            />
          </div>

          {preview.length > 0 && (
            <div className="space-y-2">
              <Label>প্রিভিউ ({preview.length}টি প্রশ্ন):</Label>
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
                      ক্যাটাগরি: {q.category} | কঠিনতা: {q.difficulty}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              বাতিল
            </Button>
            <Button variant="secondary" onClick={handlePreview}>
              প্রিভিউ দেখুন
            </Button>
            <Button
              onClick={handleImport}
              disabled={preview.length === 0 || importMutation.isPending}
            >
              {importMutation.isPending ? "ইম্পোর্ট হচ্ছে..." : "ইম্পোর্ট করুন"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
