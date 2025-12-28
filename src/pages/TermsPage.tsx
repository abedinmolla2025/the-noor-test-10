import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TermsPage = () => {
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
            <h1 className="text-xl font-bold tracking-wide">Terms &amp; Conditions</h1>
            <p className="text-sm text-muted-foreground">Guidelines for using NOOR – Islamic App</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5">
          <h2 className="text-lg font-semibold mb-2">1. Purpose of the app</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            NOOR – Islamic App is provided for educational and spiritual benefit only. It should
            not be used for any harmful, offensive or unlawful activity.
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">2. Personal responsibility</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            You remain responsible for verifying important information such as prayer times or
            religious rulings with trusted local scholars or sources.
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">3. Changes to these terms</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">
            These terms may be updated over time as the app improves. Continued use of the app
            after changes means you accept the updated terms.
          </p>
        </section>
      </main>
    </div>
  );
};

export default TermsPage;
