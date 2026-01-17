import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, History as HistoryIcon, Send } from "lucide-react";
import { Link } from "react-router-dom";

type TargetPlatform = "all" | "android" | "ios" | "web";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>("all");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  const handleCreateAndSend = async (mode: "now" | "schedule") => {
    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const nowIso = new Date().toISOString();
      const scheduledIso = mode === "schedule" && scheduledAt ? new Date(scheduledAt).toISOString() : null;

      const { data: created, error: insErr } = await supabase
        .from("notifications")
        .insert({
          title: title.trim(),
          body: body.trim(),
          image_url: imageUrl.trim() ? imageUrl.trim() : null,
          deep_link: deepLink.trim() ? deepLink.trim() : null,
          target_platform: targetPlatform,
          scheduled_at: scheduledIso,
          status: mode === "schedule" ? "scheduled" : "draft",
          created_by: user.id,
          created_at: nowIso,
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

      if (mode === "now") {
        const { data: sendRes, error: sendErr } = await supabase.functions.invoke("send-push", {
          body: { notificationId: created.id },
        });
        if (sendErr) throw sendErr;

        toast({
          title: "Notification sent",
          description: `Sent: ${sendRes?.totals?.sent ?? 0}, Failed: ${sendRes?.totals?.failed ?? 0}`,
        });
      } else {
        toast({
          title: "Notification scheduled",
          description: scheduledIso ? new Date(scheduledIso).toLocaleString() : undefined,
        });
      }

      setTitle("");
      setBody("");
      setImageUrl("");
      setDeepLink("");
      setTargetPlatform("all");
      setScheduledAt("");
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error?.message ?? "Could not create notification",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Notifications</h1>
            <p className="text-sm text-muted-foreground">Send push notifications to mobile + web.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild>
              <Link to="/admin/notifications">Send</Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/notifications/history">
                <HistoryIcon className="h-4 w-4" />
                History
              </Link>
            </Button>
            <Button asChild variant="outline" className="gap-2">
              <Link to="/admin/notifications/diagnostics">
                <Send className="h-4 w-4" />
                Diagnostics
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Create Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Title</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Notification title"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Target platform</Label>
              <Select value={targetPlatform} onValueChange={(v) => setTargetPlatform(v as TargetPlatform)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select target" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="android">Android</SelectItem>
                  <SelectItem value="ios">iOS</SelectItem>
                  <SelectItem value="web">Web</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Notification message"
              rows={4}
              className="min-h-[120px] text-sm"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Image URL (optional)</Label>
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://…"
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Deep link (optional)</Label>
              <Input
                value={deepLink}
                onChange={(e) => setDeepLink(e.target.value)}
                placeholder="/dua/123"
                className="h-9 text-sm"
              />
              <p className="text-[11px] text-muted-foreground">Use a path like /dua/123 (works for web + app).</p>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Schedule (optional)</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="h-9 text-sm"
            />
            <p className="text-[11px] text-muted-foreground">If set, it will be queued for later sending.</p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => handleCreateAndSend("schedule")}
              className="h-9 w-full gap-2 text-sm sm:w-auto"
              disabled={!canSubmit || !scheduledAt || submitting}
            >
              <CalendarClock className="h-4 w-4" />
              Schedule
            </Button>
            <Button
              onClick={() => handleCreateAndSend("now")}
              className="h-9 w-full text-sm sm:w-auto"
              disabled={!canSubmit || submitting}
            >
              <Send className="mr-2 h-4 w-4" />
              Send now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
