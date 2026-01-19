import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { z } from "zod";
import { Loader2 } from "lucide-react";

type TargetPlatform = "all" | "android" | "ios" | "web";
type TemplateCategory = "prayer" | "daily" | "special" | "custom";

const templateSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required")
    .max(100, "Name must be less than 100 characters"),
  title: z
    .string()
    .trim()
    .min(1, "Title is required")
    .max(200, "Title must be less than 200 characters"),
  body: z
    .string()
    .trim()
    .min(1, "Message is required")
    .max(1000, "Message must be less than 1000 characters"),
  imageUrl: z
    .string()
    .trim()
    .max(2048, "Image URL too long")
    .refine((val) => !val || val.startsWith("http://") || val.startsWith("https://"), {
      message: "Image URL must start with http:// or https://",
    })
    .optional(),
  deepLink: z
    .string()
    .trim()
    .max(500, "Deep link too long")
    .optional(),
  targetPlatform: z.enum(["all", "android", "ios", "web"]),
  category: z.enum(["prayer", "daily", "special", "custom"]),
});

type TemplateFormData = z.infer<typeof templateSchema>;

interface NotificationTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
  editingTemplate?: {
    id: string;
    name: string;
    title: string;
    body: string;
    image_url: string | null;
    deep_link: string | null;
    target_platform: string;
    category: string;
  } | null;
}

export function NotificationTemplateDialog({
  open,
  onOpenChange,
  onSuccess,
  editingTemplate,
}: NotificationTemplateDialogProps) {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: "",
    title: "",
    body: "",
    imageUrl: "",
    deepLink: "",
    targetPlatform: "all",
    category: "custom",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof TemplateFormData, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (editingTemplate) {
      setFormData({
        name: editingTemplate.name,
        title: editingTemplate.title,
        body: editingTemplate.body,
        imageUrl: editingTemplate.image_url || "",
        deepLink: editingTemplate.deep_link || "",
        targetPlatform: editingTemplate.target_platform as TargetPlatform,
        category: editingTemplate.category as TemplateCategory,
      });
    } else {
      // Reset form when opening for new template
      setFormData({
        name: "",
        title: "",
        body: "",
        imageUrl: "",
        deepLink: "",
        targetPlatform: "all",
        category: "custom",
      });
    }
    setErrors({});
  }, [editingTemplate, open]);

  const validateForm = (): boolean => {
    try {
      templateSchema.parse(formData);
      setErrors({});
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Partial<Record<keyof TemplateFormData, string>> = {};
        error.errors.forEach((err) => {
          const path = err.path[0] as keyof TemplateFormData;
          newErrors[path] = err.message;
        });
        setErrors(newErrors);
      }
      return false;
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const templateData = {
        name: formData.name.trim(),
        title: formData.title.trim(),
        body: formData.body.trim(),
        image_url: formData.imageUrl?.trim() || null,
        deep_link: formData.deepLink?.trim() || null,
        target_platform: formData.targetPlatform,
        category: formData.category,
        created_by: user.id,
      };

      if (editingTemplate) {
        // Update existing template
        const { error } = await supabase
          .from("notification_templates")
          .update(templateData)
          .eq("id", editingTemplate.id);

        if (error) throw error;
        toast({ title: "Template updated successfully" });
      } else {
        // Create new template
        const { error } = await supabase.from("notification_templates").insert(templateData);

        if (error) throw error;
        toast({ title: "Template created successfully" });
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Failed to save template",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingTemplate ? "Edit Template" : "Create Custom Template"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>
              Template Name <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="E.g., Ramadan Special"
              maxLength={100}
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>
                Category <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.category}
                onValueChange={(v) => setFormData({ ...formData, category: v as TemplateCategory })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="custom">Custom</SelectItem>
                  <SelectItem value="prayer">Prayer</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="special">Special</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>
                Target Platform <span className="text-destructive">*</span>
              </Label>
              <Select
                value={formData.targetPlatform}
                onValueChange={(v) => setFormData({ ...formData, targetPlatform: v as TargetPlatform })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Platforms</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>
              Notification Title <span className="text-destructive">*</span>
            </Label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="E.g., 🌙 Ramadan Kareem"
              maxLength={200}
            />
            {errors.title && <p className="text-sm text-destructive">{errors.title}</p>}
          </div>

          <div className="space-y-2">
            <Label>
              Message <span className="text-destructive">*</span>
            </Label>
            <Textarea
              value={formData.body}
              onChange={(e) => setFormData({ ...formData, body: e.target.value })}
              placeholder="Enter your notification message..."
              rows={4}
              maxLength={1000}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{errors.body || ""}</span>
              <span>{formData.body.length}/1000</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Image URL (optional)</Label>
            <Input
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
              maxLength={2048}
            />
            {errors.imageUrl && <p className="text-sm text-destructive">{errors.imageUrl}</p>}
          </div>

          <div className="space-y-2">
            <Label>Deep Link (optional)</Label>
            <Input
              value={formData.deepLink}
              onChange={(e) => setFormData({ ...formData, deepLink: e.target.value })}
              placeholder="/dua or /quran"
              maxLength={500}
            />
            {errors.deepLink && <p className="text-sm text-destructive">{errors.deepLink}</p>}
            <p className="text-xs text-muted-foreground">App route to open when notification is tapped</p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingTemplate ? "Update Template" : "Create Template"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
