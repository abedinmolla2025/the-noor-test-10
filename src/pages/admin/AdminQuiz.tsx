import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminLayout } from "@/components/admin/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { QuizBulkImportDialog } from "@/components/admin/QuizBulkImportDialog";

type QuizQuestion = {
  id: string;
  question: string;
  options: string[];
  correct_answer: number;
  category: string;
  difficulty: string;
  is_active: boolean;
  order_index: number;
};

const categories = [
  "Quran",
  "Pillars",
  "History",
  "Prophets",
  "Angels",
  "Special Days",
  "Names of Allah",
  "Prayer",
  "Basics",
  "Fasting",
  "Hajj",
  "Zakat",
];

const difficulties = ["easy", "medium", "hard"];

export default function AdminQuiz() {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<QuizQuestion | null>(null);
  const [formData, setFormData] = useState({
    question: "",
    option1: "",
    option2: "",
    option3: "",
    option4: "",
    correct_answer: 0,
    category: "Quran",
    difficulty: "medium",
    is_active: true,
  });

  const { data: questions, isLoading } = useQuery({
    queryKey: ["admin-quiz-questions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("quiz_questions")
        .select("*")
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data as QuizQuestion[];
    },
  });

  const createMutation = useMutation({
    mutationFn: async (newQuestion: any) => {
      const { error } = await supabase.from("quiz_questions").insert([
        {
          question: newQuestion.question,
          options: [
            newQuestion.option1,
            newQuestion.option2,
            newQuestion.option3,
            newQuestion.option4,
          ],
          correct_answer: newQuestion.correct_answer,
          category: newQuestion.category,
          difficulty: newQuestion.difficulty,
          is_active: newQuestion.is_active,
          order_index: questions?.length || 0,
        },
      ]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success("প্রশ্ন সফলভাবে যুক্ত হয়েছে");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedQuestion: any) => {
      const { error } = await supabase
        .from("quiz_questions")
        .update({
          question: updatedQuestion.question,
          options: [
            updatedQuestion.option1,
            updatedQuestion.option2,
            updatedQuestion.option3,
            updatedQuestion.option4,
          ],
          correct_answer: updatedQuestion.correct_answer,
          category: updatedQuestion.category,
          difficulty: updatedQuestion.difficulty,
          is_active: updatedQuestion.is_active,
        })
        .eq("id", editingQuestion?.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success("প্রশ্ন সফলভাবে আপডেট হয়েছে");
      resetForm();
      setEditingQuestion(null);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success("প্রশ্ন মুছে ফেলা হয়েছে");
    },
    onError: (error: Error) => {
      toast.error("ত্রুটি: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      question: "",
      option1: "",
      option2: "",
      option3: "",
      option4: "",
      correct_answer: 0,
      category: "Quran",
      difficulty: "medium",
      is_active: true,
    });
  };

  const handleEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      option1: question.options[0] || "",
      option2: question.options[1] || "",
      option3: question.options[2] || "",
      option4: question.options[3] || "",
      correct_answer: question.correct_answer,
      category: question.category,
      difficulty: question.difficulty,
      is_active: question.is_active,
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingQuestion) {
      updateMutation.mutate(formData);
    } else {
      createMutation.mutate(formData);
    }
  };

  const totalDays = questions ? Math.ceil(questions.filter((q) => q.is_active).length / 3) : 0;

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">কুইজ ম্যানেজমেন্ট</h1>
            <p className="text-muted-foreground mt-1">
              মোট প্রশ্ন: {questions?.length || 0} | সক্রিয়: {questions?.filter((q) => q.is_active).length || 0} | ইউনিক দিন: {totalDays}
            </p>
          </div>
          <div className="flex gap-2">
            <QuizBulkImportDialog />
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) {
                setEditingQuestion(null);
                resetForm();
              }
            }}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন প্রশ্ন যুক্ত করুন
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? "প্রশ্ন সম্পাদনা করুন" : "নতুন প্রশ্ন যুক্ত করুন"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="question">প্রশ্ন</Label>
                    <Textarea
                      id="question"
                      value={formData.question}
                      onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      required
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    {[1, 2, 3, 4].map((num) => (
                      <div key={num} className="space-y-2">
                        <Label htmlFor={`option${num}`}>অপশন {num}</Label>
                        <Input
                          id={`option${num}`}
                          value={formData[`option${num}` as keyof typeof formData] as string}
                          onChange={(e) =>
                            setFormData({ ...formData, [`option${num}`]: e.target.value })
                          }
                          required
                        />
                      </div>
                    ))}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="correct_answer">সঠিক উত্তর (১-৪)</Label>
                    <Select
                      value={String(formData.correct_answer)}
                      onValueChange={(value) =>
                        setFormData({ ...formData, correct_answer: parseInt(value) })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[0, 1, 2, 3].map((i) => (
                          <SelectItem key={i} value={String(i)}>
                            অপশন {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">ক্যাটাগরি</Label>
                      <Select
                        value={formData.category}
                        onValueChange={(value) => setFormData({ ...formData, category: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="difficulty">কঠিনতা</Label>
                      <Select
                        value={formData.difficulty}
                        onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((diff) => (
                            <SelectItem key={diff} value={diff}>
                              {diff === "easy" ? "সহজ" : diff === "medium" ? "মাধ্যম" : "কঠিন"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) =>
                        setFormData({ ...formData, is_active: checked })
                      }
                    />
                    <Label htmlFor="is_active">সক্রিয়</Label>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsDialogOpen(false);
                        setEditingQuestion(null);
                        resetForm();
                      }}
                    >
                      বাতিল
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingQuestion ? "আপডেট করুন" : "যুক্ত করুন"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>প্রশ্ন তালিকা</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">লোড হচ্ছে...</div>
            ) : questions && questions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>প্রশ্ন</TableHead>
                      <TableHead>ক্যাটাগরি</TableHead>
                      <TableHead>কঠিনতা</TableHead>
                      <TableHead>স্ট্যাটাস</TableHead>
                      <TableHead className="text-right">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question, index) => (
                      <TableRow key={question.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="max-w-md truncate">{question.question}</TableCell>
                        <TableCell>{question.category}</TableCell>
                        <TableCell>
                          {question.difficulty === "easy"
                            ? "সহজ"
                            : question.difficulty === "medium"
                            ? "মাধ্যম"
                            : "কঠিন"}
                        </TableCell>
                        <TableCell>
                          {question.is_active ? (
                            <span className="text-green-600">সক্রিয়</span>
                          ) : (
                            <span className="text-red-600">নিষ্ক্রিয়</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleEdit(question)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => {
                                if (confirm("আপনি কি নিশ্চিত এই প্রশ্নটি মুছে ফেলতে চান?")) {
                                  deleteMutation.mutate(question.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                কোনো প্রশ্ন নেই। নতুন প্রশ্ন যুক্ত করুন।
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
