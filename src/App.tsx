import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import BabyNamesPage from "./pages/BabyNamesPage";
import QiblaPage from "./pages/QiblaPage";
import TasbihPage from "./pages/TasbihPage";
import DuaPage from "./pages/DuaPage";
import QuranPage from "./pages/QuranPage";
import NamesOfAllahPage from "./pages/NamesOfAllahPage";
import PrayerTimesPage from "./pages/PrayerTimesPage";
import BukhariPage from "./pages/BukhariPage";
import IslamicCalendarPage from "./pages/IslamicCalendarPage";
import SettingsPage from "./pages/SettingsPage";
import QuizPage from "./pages/QuizPage";
import PrivacyPolicyPage from "./pages/PrivacyPolicyPage";
import TermsPage from "./pages/TermsPage";
import { AppSettingsProvider } from "./context/AppSettingsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppSettingsProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/baby-names" element={<BabyNamesPage />} />
            <Route path="/qibla" element={<QiblaPage />} />
            <Route path="/tasbih" element={<TasbihPage />} />
            <Route path="/dua" element={<DuaPage />} />
            <Route path="/quran" element={<QuranPage />} />
            <Route path="/99-names" element={<NamesOfAllahPage />} />
            <Route path="/prayer-times" element={<PrayerTimesPage />} />
            <Route path="/bukhari" element={<BukhariPage />} />
            <Route path="/calendar" element={<IslamicCalendarPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppSettingsProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
