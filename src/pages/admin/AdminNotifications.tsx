import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, Send } from "lucide-react";

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const { toast } = useToast();

  const handleSend = async (mode: "now" | "schedule") => {
    try {
      const now = new Date();
      const scheduled = mode === "schedule" && scheduledAt ? new Date(scheduledAt) : now;

      const payload = {
        title,
        message,
        status: mode === "now" ? "sent" : "scheduled",
        scheduled_at: scheduled.toISOString(),
        sent_at: mode === "now" ? now.toISOString() : null,
      };

      const { error } = await supabase.from("admin_notifications").insert(payload);
      if (error) throw error;

      toast({
        title: mode === "now" ? "Notification sent" : "Notification scheduled",
      });
      setTitle("");
      setMessage("");
      setScheduledAt("");
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error?.message ?? "Could not save notification",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-muted-foreground mt-2">In-app inbox notifications (push later).</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Notification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-5">
          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Notification title"
              className="text-sm h-9"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Message</Label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Notification message"
              rows={4}
              className="text-sm min-h-[120px]"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Schedule (optional)</Label>
            <Input
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              className="text-sm h-9"
            />
            <p className="text-[11px] text-muted-foreground">
              If set, it will appear in the app inbox after this time.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => handleSend("schedule")}
              className="w-full sm:w-auto sm:self-end text-sm h-9 gap-2"
              disabled={!title || !message || !scheduledAt}
            >
              <CalendarClock className="h-4 w-4" />
              Schedule
            </Button>
            <Button
              onClick={() => handleSend("now")}
              className="w-full sm:w-auto sm:self-end text-sm h-9"
              disabled={!title || !message}
            >
              <Send className="h-4 w-4 mr-2" />
              Send now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
