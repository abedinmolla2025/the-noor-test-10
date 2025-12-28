import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const PrivacyPolicyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5 pb-24">
      <header className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-muted/70 border border-border/60 transition-colors"
          >
            <ArrowLeft size={22} />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-wide">Privacy Policy</h1>
            <p className="text-sm text-muted-foreground">How NOOR – Islamic App handles your data</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5">
          <h2 className="text-lg font-semibold mb-2">1. Introduction</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            NOOR – Islamic App is designed to help you with prayer times, Quran, duas and other
            Islamic content. We only collect the minimum data necessary to provide and improve
            the experience.
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">2. What we store on your device</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Some preferences (such as theme, language, quiz progress and settings) are stored
            locally on your device using local storage only for your convenience.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            This information is not shared with other users and is only used inside the app to
            personalize your experience.
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">3. Contact</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            If you have questions about this privacy policy, you can contact the NOOR team from
            within the app or via the store page where the app is published.
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
