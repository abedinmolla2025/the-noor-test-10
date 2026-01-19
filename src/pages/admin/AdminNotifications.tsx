import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, History as HistoryIcon, Send, Zap, BookOpen, Moon, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";

type TargetPlatform = "all" | "android" | "ios" | "web";

type NotificationTemplate = {
  id: string;
  name: string;
  title: string;
  body: string;
  imageUrl?: string;
  deepLink?: string;
  targetPlatform: TargetPlatform;
  icon: React.ComponentType<{ className?: string }>;
  category: "prayer" | "daily" | "special";
};

const NOTIFICATION_TEMPLATES: NotificationTemplate[] = [
  {
    id: "fajr-reminder",
    name: "Fajr Prayer Reminder",
    title: "🌅 Fajr Time",
    body: "Wake up for Fajr prayer. The best time for blessings!",
    deepLink: "/prayer-times",
    targetPlatform: "all",
    icon: Moon,
    category: "prayer",
  },
  {
    id: "dhuhr-reminder",
    name: "Dhuhr Prayer Reminder",
    title: "☀️ Dhuhr Time",
    body: "It's time for Dhuhr prayer. Take a break and pray.",
    deepLink: "/prayer-times",
    targetPlatform: "all",
    icon: Moon,
    category: "prayer",
  },
  {
    id: "asr-reminder",
    name: "Asr Prayer Reminder",
    title: "🌤️ Asr Time",
    body: "Don't miss Asr prayer. Connect with Allah now.",
    deepLink: "/prayer-times",
    targetPlatform: "all",
    icon: Moon,
    category: "prayer",
  },
  {
    id: "maghrib-reminder",
    name: "Maghrib Prayer Reminder",
    title: "🌇 Maghrib Time",
    body: "The sun has set. Time for Maghrib prayer.",
    deepLink: "/prayer-times",
    targetPlatform: "all",
    icon: Moon,
    category: "prayer",
  },
  {
    id: "isha-reminder",
    name: "Isha Prayer Reminder",
    title: "🌙 Isha Time",
    body: "Complete your daily prayers with Isha.",
    deepLink: "/prayer-times",
    targetPlatform: "all",
    icon: Moon,
    category: "prayer",
  },
  {
    id: "morning-dua",
    name: "Morning Dua",
    title: "☀️ Morning Remembrance",
    body: "Start your day with morning duas and remembrance of Allah.",
    deepLink: "/dua",
    targetPlatform: "all",
    icon: BookOpen,
    category: "daily",
  },
  {
    id: "evening-dua",
    name: "Evening Dua",
    title: "🌆 Evening Remembrance",
    body: "Recite your evening duas for protection and blessings.",
    deepLink: "/dua",
    targetPlatform: "all",
    icon: BookOpen,
    category: "daily",
  },
  {
    id: "friday-reminder",
    name: "Jummah Reminder",
    title: "🕌 Jummah Mubarak",
    body: "It's Friday! Don't forget to read Surah Al-Kahf and send blessings upon the Prophet ﷺ",
    deepLink: "/quran",
    targetPlatform: "all",
    icon: Star,
    category: "daily",
  },
  {
    id: "ramadan-greeting",
    name: "Ramadan Greeting",
    title: "🌙 Ramadan Mubarak",
    body: "May this blessed month bring peace, prosperity, and spiritual growth. Ramadan Kareem!",
    targetPlatform: "all",
    icon: Moon,
    category: "special",
  },
  {
    id: "eid-greeting",
    name: "Eid Greeting",
    title: "✨ Eid Mubarak",
    body: "Wishing you and your family a blessed Eid filled with joy and happiness. Eid Mubarak!",
    targetPlatform: "all",
    icon: Star,
    category: "special",
  },
  {
    id: "laylatul-qadr",
    name: "Laylatul Qadr",
    title: "🌟 Laylatul Qadr",
    body: "Tonight could be the Night of Power! Increase your worship and make sincere dua.",
    deepLink: "/dua",
    targetPlatform: "all",
    icon: Star,
    category: "special",
  },
];

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>("all");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [tokenCount, setTokenCount] = useState<{ android: number; ios: number; web: number; total: number } | null>(
    null
  );
  const [loadingTokens, setLoadingTokens] = useState(false);
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  const applyTemplate = (templateId: string) => {
    const template = NOTIFICATION_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;

    setTitle(template.title);
    setBody(template.body);
    setImageUrl(template.imageUrl ?? "");
    setDeepLink(template.deepLink ?? "");
    setTargetPlatform(template.targetPlatform);
    setSelectedTemplate(templateId);

    toast({
      title: "Template applied",
      description: `"${template.name}" template loaded. Edit as needed.`,
    });
  };

  useEffect(() => {
    loadTokenCounts();
  }, []);

  const loadTokenCounts = async () => {
    setLoadingTokens(true);
    try {
      const { data, error } = await supabase.from("device_push_tokens").select("platform").eq("enabled", true);

      if (error) throw error;

      const counts = {
        android: data?.filter((t) => t.platform === "android").length ?? 0,
        ios: data?.filter((t) => t.platform === "ios").length ?? 0,
        web: data?.filter((t) => t.platform === "web").length ?? 0,
        total: data?.length ?? 0,
      };

      setTokenCount(counts);
    } catch (error: any) {
      console.error("Failed to load token counts", error);
    } finally {
      setLoadingTokens(false);
    }
  };

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

  const sendTestNotification = async () => {
    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const { data: created, error: insErr } = await supabase
        .from("notifications")
        .insert({
          title: "Test Notification 🔔",
          body: "This is a test push notification from Noor App!",
          target_platform: "all",
          status: "draft",
          created_by: user.id,
        })
        .select("id")
        .single();

      if (insErr) throw insErr;

      const { data: sendRes, error: sendErr } = await supabase.functions.invoke("send-push", {
        body: { notificationId: created.id },
      });
      if (sendErr) throw sendErr;

      toast({
        title: "Test notification sent! ✅",
        description: `Sent: ${sendRes?.totals?.sent ?? 0}, Failed: ${sendRes?.totals?.failed ?? 0}`,
      });

      loadTokenCounts();
    } catch (error: any) {
      toast({
        title: "Test failed",
        description: error?.message ?? "Could not send test notification",
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

      {/* Token Status Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Push Notification Status
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{loadingTokens ? "..." : tokenCount?.android ?? 0}</div>
              <div className="text-sm text-muted-foreground">Android Devices</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{loadingTokens ? "..." : tokenCount?.ios ?? 0}</div>
              <div className="text-sm text-muted-foreground">iOS Devices</div>
            </div>
            <div className="rounded-lg border bg-card p-4">
              <div className="text-2xl font-bold">{loadingTokens ? "..." : tokenCount?.web ?? 0}</div>
              <div className="text-sm text-muted-foreground">Web Browsers</div>
            </div>
            <div className="rounded-lg border bg-primary/10 p-4">
              <div className="text-2xl font-bold text-primary">{loadingTokens ? "..." : tokenCount?.total ?? 0}</div>
              <div className="text-sm font-medium">Total Devices</div>
            </div>
          </div>

          <Alert>
            <AlertDescription className="flex items-center justify-between">
              <span className="text-sm">Test your FCM integration with a sample notification</span>
              <Button onClick={sendTestNotification} disabled={submitting || (tokenCount?.total ?? 0) === 0} size="sm">
                <Zap className="mr-2 h-4 w-4" />
                Send Test Push
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Templates Card */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Templates</CardTitle>
          <CardDescription>Choose from preset notification templates for common scenarios</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Prayer Templates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Prayer Reminders</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {NOTIFICATION_TEMPLATES.filter((t) => t.category === "prayer").map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className="h-auto justify-start p-3 text-left"
                  onClick={() => applyTemplate(template.id)}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <template.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{template.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">{template.body}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Daily Templates */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Daily Reminders</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {NOTIFICATION_TEMPLATES.filter((t) => t.category === "daily").map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className="h-auto justify-start p-3 text-left"
                  onClick={() => applyTemplate(template.id)}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <template.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{template.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">{template.body}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>

          {/* Special Occasions */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-medium text-sm">Special Occasions</h3>
            </div>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {NOTIFICATION_TEMPLATES.filter((t) => t.category === "special").map((template) => (
                <Button
                  key={template.id}
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  className="h-auto justify-start p-3 text-left"
                  onClick={() => applyTemplate(template.id)}
                >
                  <div className="flex w-full flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <template.icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{template.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground line-clamp-1">{template.body}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

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
