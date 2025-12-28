import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Moon, Sun, Bell, BellOff, Globe, Volume2, VolumeX, Palette, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import BottomNavigation from "@/components/BottomNavigation";
import { useAppSettings } from "@/context/AppSettingsContext";

const SettingsPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { theme, setTheme, language, setLanguage, themeColor, setThemeColor, fontSize, setFontSize } = useAppSettings();
  
  // Settings state (local-only for now)
  const [notifications, setNotifications] = useState(true);
  const [athanSound, setAthanSound] = useState(true);
  const [calculationMethod, setCalculationMethod] = useState("karachi");

  // Detailed notification preferences (local only)
  const [quizNotifications, setQuizNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(false);
  const [marketingNotifications, setMarketingNotifications] = useState(false);

  // Sync context theme with document class on first mount
  useEffect(() => {
    // ensure current theme is applied (context already handles this on mount)
  }, []);

  const handleDarkModeToggle = (checked: boolean) => {
    setTheme(checked ? "dark" : "light");
    toast({
      title: checked ? "🌙 ডার্ক মোড চালু" : "☀️ লাইট মোড চালু",
      description: "থিম পরিবর্তন হয়েছে",
    });
  };

  const handleNotificationToggle = (checked: boolean) => {
    setNotifications(checked);
    toast({
      title: checked ? "🔔 নোটিফিকেশন চালু" : "🔕 নোটিফিকেশন বন্ধ",
      description: checked ? "আযানের সময় নোটিফিকেশন পাবেন" : "নোটিফিকেশন বন্ধ করা হয়েছে",
    });
  };

  const handleAthanSoundToggle = (checked: boolean) => {
    setAthanSound(checked);
    toast({
      title: checked ? "🔊 আযান সাউন্ড চালু" : "🔇 আযান সাউন্ড বন্ধ",
      description: checked ? "নামাজের সময় আযান শুনতে পাবেন" : "আযান সাউন্ড বন্ধ করা হয়েছে",
    });
  };

  const handleLanguageChange = (value: string) => {
    const lang = value as "bn" | "en" | "ar";
    setLanguage(lang);
    const langName = lang === "bn" ? "বাংলা" : lang === "en" ? "English" : "العربية";
    toast({
      title: "🌐 ভাষা পরিবর্তন",
      description: `ভাষা ${langName} এ পরিবর্তন হয়েছে`,
    });
  };

  const handleThemeColorChange = (value: string) => {
    const color = value as "default" | "emerald" | "teal" | "amber";
    setThemeColor(color);
    const label =
      color === "default" ? "ডিফল্ট" :
      color === "emerald" ? "এমেরাল্ড" :
      color === "teal" ? "টিল" :
      "অ্যাম্বার";

    toast({
      title: "🎨 থিম কালার পরিবর্তন",
      description: `থিম কালার ${label} এখন গ্লোবালি প্রয়োগ হয়েছে`,
    });
  };

  const handleFontSizeChange = (value: string) => {
    const size = value as "sm" | "md" | "lg";
    setFontSize(size);
    const label = size === "sm" ? "ছোট" : size === "lg" ? "বড়" : "ডিফল্ট";

    toast({
      title: "🔤 ফন্ট সাইজ আপডেট",
      description: `ফন্ট সাইজ ${label} হিসেবে পুরো অ্যাপে সেভ হয়েছে`,
    });
  };

  const handleQuizNotificationToggle = (checked: boolean) => {
    setQuizNotifications(checked);
    toast({
      title: checked ? "📚 Daily Quiz নোটিফিকেশন চালু" : "📚 Daily Quiz নোটিফিকেশন বন্ধ",
      description: checked
        ? "নতুন Daily Quiz প্রকাশ হলে রিমাইন্ডার পাবেন"
        : "Quiz নোটিফিকেশন আর পাঠানো হবে না",
    });
  };

  const handleDailyReminderToggle = (checked: boolean) => {
    setDailyReminder(checked);
    toast({
      title: checked ? "⏰ দৈনিক রিমাইন্ডার চালু" : "⏰ দৈনিক রিমাইন্ডার বন্ধ",
      description: checked
        ? "প্রতিদিন নির্দিষ্ট সময়ে একটি নরম রিমাইন্ডার পাবেন"
        : "দৈনিক রিমাইন্ডার বন্ধ করা হয়েছে",
    });
  };

  const handleMarketingNotificationToggle = (checked: boolean) => {
    setMarketingNotifications(checked);
    toast({
      title: checked ? "✨ প্রমোশনাল নোটিফিকেশন চালু" : "✨ প্রমোশনাল নোটিফিকেশন বন্ধ",
      description: checked
        ? "নতুন ফিচার ও আপডেট সম্পর্কে জানানো হবে"
        : "প্রমোশনাল নোটিফিকেশন পাঠানো হবে না",
    });
  };

  const settingsGroups = [
    {
      title: "অ্যাপিয়ারেন্স",
      icon: "🎨",
      items: [
        {
          id: "darkMode",
          label: "ডার্ক মোড",
          description: "অন্ধকার থিম ব্যবহার করুন",
          icon: theme === "dark" ? <Moon size={20} className="text-primary" /> : <Sun size={20} className="text-amber-500" />,
          type: "switch",
          value: theme === "dark",
          onChange: handleDarkModeToggle,
        },
        {
          id: "themeColor",
          label: "থিম কালার",
          description: "প্রিয় কালার mood নির্বাচন করুন",
          icon: <Palette size={20} className="text-primary" />,
          type: "select",
          value: themeColor,
          onChange: handleThemeColorChange,
          options: [
            { value: "default", label: "ডিফল্ট" },
            { value: "emerald", label: "এমেরাল্ড" },
            { value: "teal", label: "টিল" },
            { value: "amber", label: "অ্যাম্বার" },
          ],
        },
        {
          id: "fontSize",
          label: "ফন্ট সাইজ",
          description: "লেখার সাইজ ছোট/বড় করুন",
          icon: <Info size={20} className="text-primary" />,
          type: "select",
          value: fontSize,
          onChange: handleFontSizeChange,
          options: [
            { value: "sm", label: "ছোট" },
            { value: "md", label: "ডিফল্ট" },
            { value: "lg", label: "বড়" },
          ],
        },
      ],
    },
    {
      title: "নোটিফিকেশন",
      icon: "🔔",
      items: [
        {
          id: "notifications",
          label: "পুশ নোটিফিকেশন",
          description: "নামাজের সময় নোটিফিকেশন পান",
          icon: notifications ? <Bell size={20} className="text-primary" /> : <BellOff size={20} className="text-muted-foreground" />,
          type: "switch",
          value: notifications,
          onChange: handleNotificationToggle,
        },
        {
          id: "athanSound",
          label: "আযান সাউন্ড",
          description: "নামাজের সময় আযান বাজবে",
          icon: athanSound ? <Volume2 size={20} className="text-primary" /> : <VolumeX size={20} className="text-muted-foreground" />,
          type: "switch",
          value: athanSound,
          onChange: handleAthanSoundToggle,
        },
        {
          id: "quizNotifications",
          label: "Daily Quiz নোটিফিকেশন",
          description: "নতুন Quiz এলে রিমাইন্ডার পান",
          icon: <Bell size={20} className="text-primary" />,
          type: "switch",
          value: quizNotifications,
          onChange: handleQuizNotificationToggle,
        },
        {
          id: "dailyReminder",
          label: "দৈনিক স্মরণ করিয়ে দেয়া",
          description: "একটি gentle daily reminder পাবেন",
          icon: <Bell size={20} className="text-emerald-500" />,
          type: "switch",
          value: dailyReminder,
          onChange: handleDailyReminderToggle,
        },
        {
          id: "marketingNotifications",
          label: "আপডেট ও ফিচার নোটিফিকেশন",
          description: "নতুন ফিচার ও Islamic content আপডেট",
          icon: <Bell size={20} className="text-amber-500" />,
          type: "switch",
          value: marketingNotifications,
          onChange: handleMarketingNotificationToggle,
        },
      ],
    },
    {
      title: "ভাষা ও অঞ্চল",
      icon: "🌍",
      items: [
        {
          id: "language",
          label: "ভাষা",
          description: "অ্যাপের ভাষা নির্বাচন করুন",
          icon: <Globe size={20} className="text-primary" />,
          type: "select",
          value: language,
          onChange: handleLanguageChange,
          options: [
            { value: "bn", label: "বাংলা" },
            { value: "en", label: "English" },
            { value: "ar", label: "العربية" },
          ],
        },
      ],
    },
    {
      title: "নামাজের সময়",
      icon: "🕌",
      items: [
        {
          id: "calculationMethod",
          label: "গণনা পদ্ধতি",
          description: "নামাজের সময় গণনার পদ্ধতি",
          icon: <Palette size={20} className="text-primary" />,
          type: "select",
          value: calculationMethod,
          onChange: setCalculationMethod,
          options: [
            { value: "karachi", label: "করাচি (হানাফী)" },
            { value: "isna", label: "ISNA (উত্তর আমেরিকা)" },
            { value: "mwl", label: "মুসলিম ওয়ার্ল্ড লিগ" },
            { value: "egypt", label: "মিশর" },
            { value: "makkah", label: "উম্মুল কুরা (মক্কা)" },
          ],
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-24 font-bangla">
      {/* Header */}
      <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-lg mx-auto px-4 py-4 flex items-center gap-4">
          <button 
            onClick={() => navigate("/")}
            className="p-2 rounded-full hover:bg-muted/70 border border-border/60 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-wide">সেটিংস</h1>
            <p className="text-sm text-muted-foreground">অ্যাপ আপনার পছন্দ অনুযায়ী কাস্টমাইজ করুন</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <Card className="bg-card/70 border border-border/60 rounded-2xl shadow-soft">
              <CardHeader className="pb-1 pt-4">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-xl">{group.icon}</span>
                  <span className="font-semibold">{group.title}</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pb-5 pt-2">
                {group.items.map((item, itemIndex) => (
                  <div key={item.id}>
                    {itemIndex > 0 && <Separator className="mb-4" />}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/5 text-primary shadow-soft">
                          {item.icon}
                        </div>
                        <div>
                          <Label htmlFor={item.id} className="text-sm font-semibold cursor-pointer">
                            {item.label}
                          </Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      
                      {item.type === "switch" && (
                        <Switch
                          id={item.id}
                          checked={item.value as boolean}
                          onCheckedChange={item.onChange as (checked: boolean) => void}
                        />
                      )}
                      
                      {item.type === "select" && (
                        <Select
                          value={item.value as string}
                          onValueChange={item.onChange as (value: string) => void}
                        >
                          <SelectTrigger className="w-[140px] bg-background">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border z-50">
                            {item.options?.map((option) => (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* App Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="bg-card/70 border border-border/60 rounded-2xl shadow-soft">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Info size={20} className="text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold">ইসলামিক অ্যাপ</h3>
                  <p className="text-xs text-muted-foreground">ভার্সন ১.০.০</p>
                </div>
              </div>
              <Separator className="my-4" />
              <p className="text-xs text-muted-foreground text-center">
                সকল প্রশংসা মহান আল্লাহর জন্য 🤲
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <BottomNavigation />
    </div>
  );
};

export default SettingsPage;
