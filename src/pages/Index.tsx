import PrayerHeroCard from "@/components/PrayerHeroCard";
import FeatureIcons, { FeatureLabels } from "@/components/FeatureIcons";
import AudioRecitationCard from "@/components/AudioRecitationCard";
import PrayerTimesList from "@/components/PrayerTimesList";
import BottomNavigation from "@/components/BottomNavigation";
import DailyHadith from "@/components/DailyHadith";

const Index = () => {
  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Prayer Hero Card */}
        <section className="animate-fade-in" style={{ animationDelay: "0ms" }}>
          <PrayerHeroCard location="New York" hijriDate="3 Rajab, 1447 AH" />
        </section>

        {/* Feature Icons */}
        <section className="animate-fade-in" style={{ animationDelay: "100ms" }}>
          <FeatureIcons />
          <FeatureLabels />
        </section>

        {/* Audio Recitation Card */}
        <section className="animate-fade-in" style={{ animationDelay: "150ms" }}>
          <AudioRecitationCard />
        </section>

        {/* Prayer Times List */}
        <section className="animate-fade-in" style={{ animationDelay: "200ms" }}>
          <PrayerTimesList />
        </section>

        {/* Daily Hadith */}
        <section className="animate-fade-in" style={{ animationDelay: "300ms" }}>
          <DailyHadith />
        </section>
      </main>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
};

export default Index;
