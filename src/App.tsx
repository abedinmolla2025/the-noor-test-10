 import { useEffect, useState } from "react";
 import { supabase } from "@/integrations/supabase/client";
 import { SplashScreen } from "@/components/SplashScreen";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SeoHead } from "@/components/seo/SeoHead";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BabyNamesPage from "./pages/BabyNamesPage";
import NamesPage from "./pages/NamesPage";
import QiblaPage from "./pages/QiblaPage";
import TasbihPage from "./pages/TasbihPage";
import DuaPage from "./pages/DuaPage";
import QuranPage from "./pages/QuranPage";
import NamesOfAllahPage from "./pages/NamesOfAllahPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import BukhariPage from "./pages/BukhariPage";
import IslamicCalendarPage from "./pages/IslamicCalendarPage";
import SettingsPage from "./pages/SettingsPage";
import NotificationsPage from "./pages/NotificationsPage";
import BackendStatusPage from "./pages/BackendStatusPage";
import QuizPage from "./pages/QuizPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminContent from "./pages/admin/AdminContent";
import AdminContentWorkflowPage from "./pages/admin/AdminContentWorkflow";
import AdminAuditPage from "./pages/admin/AdminAudit";
import AdminMonetization from "./pages/admin/AdminMonetization";
import AdminNotifications from "./pages/admin/AdminNotifications";
import AdminNotificationsHistory from "./pages/admin/AdminNotificationsHistory";
import AdminNotificationsDiagnostics from "./pages/admin/AdminNotificationsDiagnostics";
import AdminOccasions from "./pages/admin/AdminOccasions";
import AdminMedia from "./pages/admin/AdminMedia";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminSecurity from "./pages/admin/AdminSecurity";
import AdminAds from "./pages/admin/AdminAds";
import AdminLayoutControl from "./pages/admin/AdminLayoutControl";
import AdminSeoPage from "./pages/admin/AdminSeo";
import AdminPageBuilder from "./pages/admin/AdminPageBuilder";
import AdminQuiz from "./pages/admin/AdminQuiz";
import { AppSettingsProvider } from "./context/AppSettingsContext";
import { AdminProvider } from "./contexts/AdminContext";
import { AdminLayout } from "./components/admin/AdminLayout";
import { GlobalConfigProvider } from "./context/GlobalConfigContext";
import { usePushTokenRegistration } from "@/hooks/usePushTokenRegistration";
import { useWebPushRegistration } from "@/hooks/useWebPushRegistration";
import { useQuizReminder } from "@/hooks/useQuizReminder";
import AnnouncementTicker from "@/components/AnnouncementTicker";

const queryClient = new QueryClient();

const AppRoutes = () => (
  <>
    <SeoHead />
    <AnnouncementTicker />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/baby-names" element={<BabyNamesPage />} />
      <Route path="/names" element={<NamesPage />} />
      <Route path="/qibla" element={<QiblaPage />} />
      <Route path="/tasbih" element={<TasbihPage />} />
      <Route path="/dua" element={<DuaPage />} />
      <Route path="/quran" element={<QuranPage />} />
      <Route path="/99-names" element={<NamesOfAllahPage />} />
      <Route path="/prayer-times" element={<PrayerTimesPage />} />
      <Route path="/bukhari" element={<BukhariPage />} />
      <Route path="/calendar" element={<IslamicCalendarPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/notifications" element={<NotificationsPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
      <Route path="/terms" element={<TermsPage />} />

    {/* Admin Routes - all wrapped with AdminLayout (includes ProtectedRoute) */}
    <Route
      path="/admin"
      element={
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/dashboard"
      element={
        <AdminLayout>
          <AdminDashboard />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/users"
      element={
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/occasions"
      element={
        <AdminLayout>
          <AdminOccasions />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/content"
      element={
        <AdminLayout>
          <AdminContent />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/content/:id/workflow"
      element={
        <AdminLayout>
          <AdminContentWorkflowPage />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/quiz"
      element={
        <AdminLayout>
          <AdminQuiz />
        </AdminLayout>
      }
    />
    {/* Ads, Reports, Finance */}
    <Route
      path="/admin/ads"
      element={
        <AdminLayout>
          <AdminAds />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/reports"
      element={
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/finance"
      element={
        <AdminLayout>
          <AdminMonetization />
        </AdminLayout>
      }
    />
    {/* Keep existing admin routes for backward compatibility */}
    <Route
      path="/admin/monetization"
      element={
        <AdminLayout>
          <AdminMonetization />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/notifications"
      element={
        <AdminLayout>
          <AdminNotifications />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/notifications/history"
      element={
        <AdminLayout>
          <AdminNotificationsHistory />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/notifications/diagnostics"
      element={
        <AdminLayout>
          <AdminNotificationsDiagnostics />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/media"
      element={
        <AdminLayout>
          <AdminMedia />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/analytics"
      element={
        <AdminLayout>
          <AdminAnalytics />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/layout"
      element={
        <AdminLayout>
          <AdminLayoutControl />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/page-builder"
      element={
        <AdminLayout>
          <AdminPageBuilder />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/seo"
      element={
        <AdminLayout>
          <AdminSeoPage />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/settings"
      element={
        <AdminLayout>
          <AdminSettings />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/security"
      element={
        <AdminLayout>
          <AdminSecurity />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/security/backend-status"
      element={
        <AdminLayout>
          <BackendStatusPage />
        </AdminLayout>
      }
    />
    <Route
      path="/admin/audit"
      element={
        <AdminLayout>
          <AdminAuditPage />
        </AdminLayout>
      }
    />
     <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const App = () => {
   const [showSplash, setShowSplash] = useState(true);
   const [splashConfig, setSplashConfig] = useState<{
     lottieUrl: string;
     duration: number;
     fadeOutDuration: number;
   } | null>(null);

   useEffect(() => {
     const fetchActiveSplash = async () => {
       const now = new Date().toISOString();
       const platform = typeof window !== 'undefined' && (window as any).Capacitor ? 'app' : 'web';
       const platforms = platform === 'web' ? ['web', 'both'] : ['app', 'both'];

       // Try to fetch from admin_splash_screens first
       const { data: splashData } = await supabase
         .from('admin_splash_screens')
         .select('*')
         .eq('is_active', true)
         .lte('start_date', now)
         .gte('end_date', now)
         .in('platform', platforms)
         .order('priority', { ascending: false })
         .order('start_date', { ascending: false })
         .limit(1)
         .single();

       if (splashData) {
         setSplashConfig({
           lottieUrl: splashData.lottie_url,
           duration: splashData.duration,
           fadeOutDuration: splashData.fade_out_duration,
         });
       } else {
         // Fallback to branding settings
         const { data: brandingData } = await supabase
           .from('app_settings')
           .select('setting_value')
           .eq('setting_key', 'branding')
           .single();

         const brandingValue = brandingData?.setting_value as any;
         if (brandingValue?.lottieSplashUrl) {
           setSplashConfig({
             lottieUrl: brandingValue.lottieSplashUrl,
             duration: brandingValue.splashDuration || 3000,
             fadeOutDuration: brandingValue.splashFadeOutDuration || 500,
           });
         } else {
           setShowSplash(false);
         }
       }
     };
     fetchActiveSplash();
   }, []);

  // Native-only: register device token for future push delivery.
  usePushTokenRegistration();
  // Web-only: register browser for web push notifications.
  useWebPushRegistration();
  // Quiz reminder notifications
  useQuizReminder();

  return (
     <>
       {showSplash && splashConfig && (
         <SplashScreen 
           lottieUrl={splashConfig.lottieUrl}
           duration={splashConfig.duration}
           fadeOutDuration={splashConfig.fadeOutDuration}
           onComplete={() => setShowSplash(false)}
         />
       )}
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminProvider>
          <GlobalConfigProvider>
            <AppSettingsProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </AppSettingsProvider>
          </GlobalConfigProvider>
        </AdminProvider>
      </TooltipProvider>
    </QueryClientProvider>
     </>
  );
};

export default App;
