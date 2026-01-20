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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Upload } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { QuizBulkImportDialog } from "@/components/admin/QuizBulkImportDialog";
import { AdminPageActionsDropdown } from "@/components/admin/AdminPageActionsDropdown";

type QuizQuestion = {
  id: string;
  question: string;
  question_en: string | null;
  question_bn: string | null;
  options: string[];
  options_en: string[] | null;
  options_bn: string[] | null;
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
    question_en: "",
    question_bn: "",
    option1_en: "",
    option2_en: "",
    option3_en: "",
    option4_en: "",
    option1_bn: "",
    option2_bn: "",
    option3_bn: "",
    option4_bn: "",
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
          question: newQuestion.question_en || newQuestion.question_bn || "Untitled",
          question_en: newQuestion.question_en,
          question_bn: newQuestion.question_bn,
          options: [
            newQuestion.option1_en || newQuestion.option1_bn,
            newQuestion.option2_en || newQuestion.option2_bn,
            newQuestion.option3_en || newQuestion.option3_bn,
            newQuestion.option4_en || newQuestion.option4_bn,
          ],
          options_en: [
            newQuestion.option1_en,
            newQuestion.option2_en,
            newQuestion.option3_en,
            newQuestion.option4_en,
          ],
          options_bn: [
            newQuestion.option1_bn,
            newQuestion.option2_bn,
            newQuestion.option3_bn,
            newQuestion.option4_bn,
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
      toast.success("Question added successfully");
      resetForm();
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Error: " + error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (updatedQuestion: any) => {
      const { error } = await supabase
        .from("quiz_questions")
        .update({
          question: updatedQuestion.question_en || updatedQuestion.question_bn || "Untitled",
          question_en: updatedQuestion.question_en,
          question_bn: updatedQuestion.question_bn,
          options: [
            updatedQuestion.option1_en || updatedQuestion.option1_bn,
            updatedQuestion.option2_en || updatedQuestion.option2_bn,
            updatedQuestion.option3_en || updatedQuestion.option3_bn,
            updatedQuestion.option4_en || updatedQuestion.option4_bn,
          ],
          options_en: [
            updatedQuestion.option1_en,
            updatedQuestion.option2_en,
            updatedQuestion.option3_en,
            updatedQuestion.option4_en,
          ],
          options_bn: [
            updatedQuestion.option1_bn,
            updatedQuestion.option2_bn,
            updatedQuestion.option3_bn,
            updatedQuestion.option4_bn,
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
      toast.success("Question updated successfully");
      resetForm();
      setEditingQuestion(null);
      setIsDialogOpen(false);
    },
    onError: (error: Error) => {
      toast.error("Error: " + error.message);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("quiz_questions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quiz-questions"] });
      toast.success("Question deleted successfully");
    },
    onError: (error: Error) => {
      toast.error("Error: " + error.message);
    },
  });

  const resetForm = () => {
    setFormData({
      question_en: "",
      question_bn: "",
      option1_en: "",
      option2_en: "",
      option3_en: "",
      option4_en: "",
      option1_bn: "",
      option2_bn: "",
      option3_bn: "",
      option4_bn: "",
      correct_answer: 0,
      category: "Quran",
      difficulty: "medium",
      is_active: true,
    });
  };

  const handleEdit = (question: QuizQuestion) => {
    setEditingQuestion(question);
    const optionsEn = question.options_en || question.options || [];
    const optionsBn = question.options_bn || [];
    setFormData({
      question_en: question.question_en || question.question || "",
      question_bn: question.question_bn || "",
      option1_en: optionsEn[0] || "",
      option2_en: optionsEn[1] || "",
      option3_en: optionsEn[2] || "",
      option4_en: optionsEn[3] || "",
      option1_bn: optionsBn[0] || "",
      option2_bn: optionsBn[1] || "",
      option3_bn: optionsBn[2] || "",
      option4_bn: optionsBn[3] || "",
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

  const exportData = questions?.map((q) => ({
    question: q.question_en || q.question || "",
    question_en: q.question_en,
    question_bn: q.question_bn,
    options: q.options_en || q.options || [],
    options_en: q.options_en,
    options_bn: q.options_bn,
    correct_answer: q.correct_answer,
    category: q.category,
    difficulty: q.difficulty,
    is_active: q.is_active,
  }));

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Quiz Management</h1>
            <p className="text-muted-foreground mt-1">
              Total Questions: {questions?.length || 0} | Active: {questions?.filter((q) => q.is_active).length || 0} | Unique Days: {totalDays}
            </p>
          </div>
          <div className="flex gap-2">
            <AdminPageActionsDropdown
              exportData={exportData}
              exportFileName="quiz-questions.json"
              exportLabel="Export Questions"
            />
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
                  Add New Question
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>
                    {editingQuestion ? "Edit Question" : "Add New Question"}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <Tabs defaultValue="en" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="en">English</TabsTrigger>
                      <TabsTrigger value="bn">বাংলা</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="en" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="question_en">Question (English)</Label>
                        <Textarea
                          id="question_en"
                          value={formData.question_en}
                          onChange={(e) => setFormData({ ...formData, question_en: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3, 4].map((num) => (
                          <div key={num} className="space-y-2">
                            <Label htmlFor={`option${num}_en`}>Option {num} (English)</Label>
                            <Input
                              id={`option${num}_en`}
                              value={formData[`option${num}_en` as keyof typeof formData] as string}
                              onChange={(e) =>
                                setFormData({ ...formData, [`option${num}_en`]: e.target.value })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="bn" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="question_bn">প্রশ্ন (বাংলা)</Label>
                        <Textarea
                          id="question_bn"
                          value={formData.question_bn}
                          onChange={(e) => setFormData({ ...formData, question_bn: e.target.value })}
                          rows={3}
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {[1, 2, 3, 4].map((num) => (
                          <div key={num} className="space-y-2">
                            <Label htmlFor={`option${num}_bn`}>অপশন {num} (বাংলা)</Label>
                            <Input
                              id={`option${num}_bn`}
                              value={formData[`option${num}_bn` as keyof typeof formData] as string}
                              onChange={(e) =>
                                setFormData({ ...formData, [`option${num}_bn`]: e.target.value })
                              }
                            />
                          </div>
                        ))}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="space-y-2">
                    <Label htmlFor="correct_answer">Correct Answer (1-4)</Label>
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
                            Option {i + 1}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category">Category</Label>
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
                      <Label htmlFor="difficulty">Difficulty</Label>
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
                              {diff === "easy" ? "Easy" : diff === "medium" ? "Medium" : "Hard"}
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
                    <Label htmlFor="is_active">Active</Label>
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
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createMutation.isPending || updateMutation.isPending}>
                      {editingQuestion ? "Update" : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Question List</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">Loading...</div>
            ) : questions && questions.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">#</TableHead>
                      <TableHead>Question (EN)</TableHead>
                      <TableHead>Question (BN)</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Difficulty</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {questions.map((question, index) => (
                      <TableRow key={question.id}>
                        <TableCell>{index + 1}</TableCell>
                        <TableCell className="max-w-md truncate">{(question as any).question_en || question.question || "-"}</TableCell>
                        <TableCell className="max-w-md truncate">{(question as any).question_bn || "-"}</TableCell>
                        <TableCell>{question.category}</TableCell>
                        <TableCell>
                          {question.difficulty === "easy"
                            ? "Easy"
                            : question.difficulty === "medium"
                            ? "Medium"
                            : "Hard"}
                        </TableCell>
                        <TableCell>
                          {question.is_active ? (
                            <span className="text-green-600">Active</span>
                          ) : (
                            <span className="text-red-600">Inactive</span>
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
                                if (confirm("Are you sure you want to delete this question?")) {
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
                No questions found. Add a new question.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
