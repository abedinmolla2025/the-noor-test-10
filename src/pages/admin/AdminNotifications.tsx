// Notification management with template support
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
import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CalendarClock, History as HistoryIcon, Send, Zap, BookOpen, Moon, Star, Plus, Edit, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { NotificationTemplateDialog } from "@/components/admin/NotificationTemplateDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

type CustomTemplate = {
  id: string;
  name: string;
  title: string;
  body: string;
  image_url: string | null;
  deep_link: string | null;
  target_platform: string;
  category: string;
  created_by: string;
};

export default function AdminNotifications() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [deepLink, setDeepLink] = useState("");
  const [targetPlatform, setTargetPlatform] = useState<TargetPlatform>("all");
  const [scheduledAt, setScheduledAt] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  // In-app announcement ticker controls
  const [annTitle, setAnnTitle] = useState("");
  const [annMessage, setAnnMessage] = useState("");
  const [annDuration, setAnnDuration] = useState<"12" | "24" | "custom">("12");
  const [annCustomHours, setAnnCustomHours] = useState<string>("");
  const [annFont, setAnnFont] = useState<string>("font-sans");
  const [annSize, setAnnSize] = useState<string>("text-xs");
  const [annColor, setAnnColor] = useState<string>("text-foreground/90");
  const annCanSubmit = annTitle.trim().length > 0 && annMessage.trim().length > 0;

  const [activeAnnouncement, setActiveAnnouncement] = useState<
    | {
        id: string;
        title: string;
        message: string;
        sent_at: string | null;
        scheduled_at: string | null;
        expires_at: string | null;
      }
    | null
  >(null);
  const [nowTick, setNowTick] = useState(() => Date.now());
  const [extendHours, setExtendHours] = useState<"12" | "24">("12");

  const [activeStyleDraft, setActiveStyleDraft] = useState<{ font: string; size: string; color: string } | null>(null);
  const [savingActiveStyle, setSavingActiveStyle] = useState(false);
  const styleSaveTimerRef = useRef<number | null>(null);
  const [tokenCount, setTokenCount] = useState<{ android: number; ios: number; web: number; total: number } | null>(
    null
  );
  const [loadingTokens, setLoadingTokens] = useState(false);
  const [customTemplates, setCustomTemplates] = useState<CustomTemplate[]>([]);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<CustomTemplate | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const canSubmit = title.trim().length > 0 && body.trim().length > 0;

  const createAnnouncement = async () => {
    setSubmitting(true);
    try {
      const {
        data: { user },
        error: userErr,
      } = await supabase.auth.getUser();
      if (userErr) throw userErr;
      if (!user) throw new Error("Not authenticated");

      const hours =
        annDuration === "custom"
          ? Math.max(1, Math.min(168, Number(annCustomHours || "0")))
          : Number(annDuration);

      if (!Number.isFinite(hours) || hours <= 0) {
        throw new Error("Invalid duration");
      }

      const now = new Date();
      const expiresAt = new Date(now.getTime() + hours * 60 * 60 * 1000).toISOString();

      const { error } = await supabase.from("admin_notifications").insert({
        title: annTitle.trim(),
        message: annMessage.trim(),
        status: "sent",
        sent_at: now.toISOString(),
        scheduled_at: null,
        expires_at: expiresAt,
        ticker_style: {
          font: annFont,
          size: annSize,
          color: annColor,
        },
        created_by: user.id,
      } as any);

      if (error) throw error;

      toast({
        title: "Announcement activated",
        description: `Ticker will auto-hide after ${hours} hour(s).`,
      });

      await loadActiveAnnouncement();

      setAnnTitle("");
      setAnnMessage("");
      setAnnDuration("12");
      setAnnCustomHours("");
      setAnnFont("font-sans");
      setAnnSize("text-xs");
      setAnnColor("text-foreground/90");
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error?.message ?? "Could not activate announcement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const deactivateActiveAnnouncement = async () => {
    if (!activeAnnouncement) return;
    setSubmitting(true);
    try {
      const nowIso = new Date().toISOString();
      const { error } = await supabase
        .from("admin_notifications")
        .update({ expires_at: nowIso } as any)
        .eq("id", activeAnnouncement.id);
      if (error) throw error;

      toast({ title: "Announcement hidden", description: "Ticker will disappear immediately." });
      await loadActiveAnnouncement();
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error?.message ?? "Could not hide announcement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const extendActiveAnnouncement = async () => {
    if (!activeAnnouncement) return;
    setSubmitting(true);
    try {
      const base = activeAnnouncement.expires_at ? new Date(activeAnnouncement.expires_at) : new Date();
      const next = new Date(base.getTime() + Number(extendHours) * 60 * 60 * 1000).toISOString();

      const { error } = await supabase
        .from("admin_notifications")
        .update({ expires_at: next } as any)
        .eq("id", activeAnnouncement.id);
      if (error) throw error;

      toast({ title: "Extended", description: `Extended by ${extendHours} hour(s).` });
      await loadActiveAnnouncement();
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error?.message ?? "Could not extend announcement",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const resetActiveAnnouncementStyle = async () => {
    if (!activeAnnouncement) return;
    setSubmitting(true);
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({
          ticker_style: {
            font: "font-sans",
            size: "text-xs",
            color: "text-foreground/90",
          },
        } as any)
        .eq("id", activeAnnouncement.id);
      if (error) throw error;

      toast({ title: "Style reset", description: "Ticker style has been reset to default." });
      await loadActiveAnnouncement();
    } catch (error: any) {
      toast({
        title: "Failed",
        description: error?.message ?? "Could not reset style",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const applyTemplate = (templateId: string) => {
    const template = NOTIFICATION_TEMPLATES.find((t) => t.id === templateId);
    if (template) {
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
    } else {
      // Try custom template
      const customTemplate = customTemplates.find((t) => t.id === templateId);
      if (!customTemplate) return;

      setTitle(customTemplate.title);
      setBody(customTemplate.body);
      setImageUrl(customTemplate.image_url ?? "");
      setDeepLink(customTemplate.deep_link ?? "");
      setTargetPlatform(customTemplate.target_platform as TargetPlatform);
      setSelectedTemplate(templateId);

      toast({
        title: "Template applied",
        description: `"${customTemplate.name}" template loaded. Edit as needed.`,
      });
    }
  };

  const handleDeleteTemplate = async () => {
    if (!templateToDelete) return;

    try {
      const { error } = await supabase.from("notification_templates").delete().eq("id", templateToDelete);

      if (error) throw error;

      toast({ title: "Template deleted successfully" });
      loadCustomTemplates();
    } catch (error: any) {
      toast({
        title: "Failed to delete template",
        description: error?.message || "Please try again",
        variant: "destructive",
      });
    } finally {
      setDeleteDialogOpen(false);
      setTemplateToDelete(null);
    }
  };

  const openEditDialog = (template: CustomTemplate) => {
    setEditingTemplate(template);
    setTemplateDialogOpen(true);
  };

  const openDeleteDialog = (templateId: string) => {
    setTemplateToDelete(templateId);
    setDeleteDialogOpen(true);
  };

  const handleTemplateDialogClose = (open: boolean) => {
    setTemplateDialogOpen(open);
    if (!open) {
      setEditingTemplate(null);
    }
  };

  useEffect(() => {
    loadTokenCounts();
    loadCustomTemplates();
  }, []);

  const loadActiveAnnouncement = async () => {
    try {
      const nowIso = new Date().toISOString();
      const { data, error } = await supabase
        .from("admin_notifications")
        .select("id,title,message,sent_at,scheduled_at,expires_at,ticker_style")
        .in("status", ["sent", "scheduled"])
        .or(`expires_at.is.null,expires_at.gt.${nowIso}`)
        .or(`scheduled_at.is.null,scheduled_at.lte.${nowIso}`)
        .order("sent_at", { ascending: false, nullsFirst: false })
        .order("scheduled_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false, nullsFirst: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setActiveAnnouncement((data as any) ?? null);
    } catch (e) {
      console.error("Failed to load active announcement", e);
    }
  };

  const getNormalizedTickerStyle = (raw: any) => {
    const st = raw ?? {};
    return {
      font: typeof st.font === "string" ? st.font : "font-sans",
      size: typeof st.size === "string" ? st.size : "text-xs",
      color: typeof st.color === "string" ? st.color : "text-foreground/90",
    };
  };

  const saveActiveAnnouncementStyle = async (style: { font: string; size: string; color: string }) => {
    if (!activeAnnouncement) return;
    setSavingActiveStyle(true);
    try {
      const { error } = await supabase
        .from("admin_notifications")
        .update({ ticker_style: style } as any)
        .eq("id", activeAnnouncement.id);
      if (error) throw error;
      await loadActiveAnnouncement();
    } catch (e: any) {
      toast({
        title: "Style save failed",
        description: e?.message ?? "Could not update announcement style",
        variant: "destructive",
      });
    } finally {
      setSavingActiveStyle(false);
    }
  };

  const scheduleActiveStyleSave = (style: { font: string; size: string; color: string }) => {
    if (styleSaveTimerRef.current) {
      window.clearTimeout(styleSaveTimerRef.current);
    }
    styleSaveTimerRef.current = window.setTimeout(() => {
      void saveActiveAnnouncementStyle(style);
    }, 450);
  };

  useEffect(() => {
    if (activeAnnouncement) {
      setActiveStyleDraft(getNormalizedTickerStyle((activeAnnouncement as any).ticker_style));
    } else {
      setActiveStyleDraft(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAnnouncement?.id]);

  useEffect(() => {
    void loadActiveAnnouncement();
    const t = window.setInterval(() => setNowTick(Date.now()), 1000);
    return () => {
      window.clearInterval(t);
      if (styleSaveTimerRef.current) window.clearTimeout(styleSaveTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCustomTemplates = async () => {
    setLoadingTemplates(true);
    try {
      const { data, error } = await supabase
        .from("notification_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setCustomTemplates(data || []);
    } catch (error: any) {
      console.error("Failed to load templates", error);
    } finally {
      setLoadingTemplates(false);
    }
  };

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
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Quick Templates</CardTitle>
              <CardDescription>Choose from preset or custom notification templates</CardDescription>
            </div>
            <Button onClick={() => setTemplateDialogOpen(true)} size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Create Custom
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Custom Templates */}
          {customTemplates.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <h3 className="font-medium text-sm">My Custom Templates</h3>
                <Badge variant="secondary">{customTemplates.length}</Badge>
              </div>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {customTemplates.map((template) => (
                  <div
                    key={template.id}
                    className={`relative group rounded-lg border p-3 ${
                      selectedTemplate === template.id ? "border-primary bg-primary/5" : ""
                    }`}
                  >
                    <Button
                      variant="ghost"
                      className="h-auto w-full justify-start p-0 text-left"
                      onClick={() => applyTemplate(template.id)}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                        <span className="text-xs text-muted-foreground line-clamp-1">{template.body}</span>
                      </div>
                    </Button>
                    <div className="absolute right-2 top-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          openEditDialog(template);
                        }}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-7 w-7 hover:bg-destructive hover:text-destructive-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          openDeleteDialog(template.id);
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

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

      {/* Announcement ticker (in-app) */}
      <Card>
        <CardHeader>
          <CardTitle>Announcement Ticker</CardTitle>
          <CardDescription>Show/hide the top ticker by activating an announcement with an expiry time.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Active announcement preview */}
          <div className="rounded-lg border bg-card p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Active announcement</p>
                {activeAnnouncement ? (
                  <>
                    <p className="mt-1 truncate text-sm font-semibold">{activeAnnouncement.title}</p>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{activeAnnouncement.message}</p>
                  </>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">No active announcement (ticker hidden).</p>
                )}
              </div>

              <div className="flex flex-col gap-2 sm:items-end">
                {activeAnnouncement ? (
                  (() => {
                    const exp = activeAnnouncement.expires_at ? new Date(activeAnnouncement.expires_at).getTime() : null;
                    const remainingMs = exp ? Math.max(0, exp - nowTick) : null;
                    const remainingText =
                      remainingMs === null
                        ? "No expiry"
                        : (() => {
                            const total = Math.ceil(remainingMs / 1000);
                            const h = Math.floor(total / 3600);
                            const m = Math.floor((total % 3600) / 60);
                            const s = total % 60;
                            return `${h}h ${m}m ${s}s`;
                          })();

                    return (
                      <>
                        <p className="text-xs text-muted-foreground">Remaining: {remainingText}</p>

                        {activeStyleDraft ? (
                          <div className="mt-2 grid gap-2 sm:grid-cols-3">
                            <div className="space-y-1">
                              <p className="text-[11px] font-medium text-muted-foreground">Font</p>
                              <Select
                                value={activeStyleDraft.font}
                                onValueChange={(v) => {
                                  const next = { ...activeStyleDraft, font: v };
                                  setActiveStyleDraft(next);
                                  scheduleActiveStyleSave(next);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="font-sans">Sans</SelectItem>
                                  <SelectItem value="font-display">Display</SelectItem>
                                  <SelectItem value="font-premium">Premium Serif</SelectItem>
                                  <SelectItem value="font-arabic">Arabic</SelectItem>
                                  <SelectItem value="font-bangla">Bangla</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[11px] font-medium text-muted-foreground">Size</p>
                              <Select
                                value={activeStyleDraft.size}
                                onValueChange={(v) => {
                                  const next = { ...activeStyleDraft, size: v };
                                  setActiveStyleDraft(next);
                                  scheduleActiveStyleSave(next);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text-xs">Small</SelectItem>
                                  <SelectItem value="text-sm">Medium</SelectItem>
                                  <SelectItem value="text-base">Large</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="space-y-1">
                              <p className="text-[11px] font-medium text-muted-foreground">Color</p>
                              <Select
                                value={activeStyleDraft.color}
                                onValueChange={(v) => {
                                  const next = { ...activeStyleDraft, color: v };
                                  setActiveStyleDraft(next);
                                  scheduleActiveStyleSave(next);
                                }}
                              >
                                <SelectTrigger className="h-8 text-xs">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="text-foreground/90">Default</SelectItem>
                                  <SelectItem value="text-primary">Primary</SelectItem>
                                  <SelectItem value="text-accent">Accent</SelectItem>
                                  <SelectItem value="text-muted-foreground">Muted</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>

                            <div className="sm:col-span-3">
                              <p className="text-[11px] text-muted-foreground">{savingActiveStyle ? "Saving…" : "Live: changes apply instantly"}</p>
                            </div>
                          </div>
                        ) : null}

                        <div className="flex flex-col gap-2 sm:flex-row">
                          <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={deactivateActiveAnnouncement}
                            disabled={submitting}
                          >
                            Hide now
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={resetActiveAnnouncementStyle}
                            disabled={submitting}
                          >
                            Reset style
                          </Button>

                          <div className="flex items-center gap-2">
                            <Select value={extendHours} onValueChange={(v) => setExtendHours(v as any)}>
                              <SelectTrigger className="h-8 w-[120px] text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="12">+12 hours</SelectItem>
                                <SelectItem value="24">+24 hours</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button size="sm" onClick={extendActiveAnnouncement} disabled={submitting}>
                              Extend
                            </Button>
                          </div>
                        </div>
                      </>
                    );
                  })()
                ) : (
                  <Button variant="outline" size="sm" onClick={loadActiveAnnouncement} disabled={submitting} className="gap-2">
                    Refresh
                  </Button>
                )}
              </div>
            </div>

            {/* Visual ticker preview */}
            {activeAnnouncement ? (
              <div className="mt-4 overflow-hidden rounded-md border bg-background/80 px-3 py-2">
                {(() => {
                  const st = activeStyleDraft ?? getNormalizedTickerStyle((activeAnnouncement as any).ticker_style);
                  const fontClass = st.font;
                  const sizeClass = st.size;
                  const colorClass = st.color;
                  return (
                    <p className={`whitespace-nowrap font-medium ${sizeClass} ${colorClass} ${fontClass}`}>
                      {activeAnnouncement.title}: {activeAnnouncement.message}
                    </p>
                  );
                })()}
              </div>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Ticker title</Label>
              <Input
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                placeholder="Announcement title"
                className="h-9 text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Auto-hide after</Label>
              <Select value={annDuration} onValueChange={(v) => setAnnDuration(v as any)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="12">12 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
              {annDuration === "custom" ? (
                <div className="mt-2">
                  <Input
                    type="number"
                    min={1}
                    max={168}
                    value={annCustomHours}
                    onChange={(e) => setAnnCustomHours(e.target.value)}
                    placeholder="Hours (1-168)"
                    className="h-9 text-sm"
                  />
                  <p className="mt-1 text-[11px] text-muted-foreground">Max 168 hours (7 days).</p>
                </div>
              ) : null}
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Font</Label>
              <Select value={annFont} onValueChange={(v) => setAnnFont(v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select font" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="font-sans">Sans (default)</SelectItem>
                  <SelectItem value="font-display">Display</SelectItem>
                  <SelectItem value="font-premium">Premium Serif</SelectItem>
                  <SelectItem value="font-arabic">Arabic</SelectItem>
                  <SelectItem value="font-bangla">Bangla</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Text size</Label>
              <Select value={annSize} onValueChange={(v) => setAnnSize(v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-xs">Small</SelectItem>
                  <SelectItem value="text-sm">Medium</SelectItem>
                  <SelectItem value="text-base">Large</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-xs sm:text-sm">Text color</Label>
              <Select value={annColor} onValueChange={(v) => setAnnColor(v)}>
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text-foreground/90">Default</SelectItem>
                  <SelectItem value="text-primary">Primary</SelectItem>
                  <SelectItem value="text-accent">Accent</SelectItem>
                  <SelectItem value="text-muted-foreground">Muted</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-xs sm:text-sm">Ticker message</Label>
            <Textarea
              value={annMessage}
              onChange={(e) => setAnnMessage(e.target.value)}
              placeholder="Announcement message"
              rows={3}
              className="min-h-[96px] text-sm"
            />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              onClick={createAnnouncement}
              className="h-9 w-full text-sm sm:w-auto"
              disabled={!annCanSubmit || submitting || (annDuration === "custom" && !annCustomHours)}
            >
              Activate ticker
            </Button>
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

      {/* Template Management Dialogs */}
      <NotificationTemplateDialog
        open={templateDialogOpen}
        onOpenChange={handleTemplateDialogClose}
        onSuccess={loadCustomTemplates}
        editingTemplate={editingTemplate}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Template?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this custom template. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteTemplate} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
