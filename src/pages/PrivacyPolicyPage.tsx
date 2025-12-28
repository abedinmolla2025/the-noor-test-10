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

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 text-sm leading-relaxed">
        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">1. Introduction / ভূমিকা</h2>
          <p className="text-muted-foreground">
            NOOR – Islamic App is designed to help you with prayer times, Quran, duas and
            other Islamic content. We only collect the minimum information needed to keep the
            app working smoothly and to improve your experience.
          </p>
          <p className="text-muted-foreground">
            NOOR – ইসলামিক অ্যাপ আপনার নামাজের সময়সূচি, কুরআন, দোআ ও অন্যান্য ইসলামিক কনটেন্ট
            সহজভাবে পাওয়ার জন্য তৈরি করা হয়েছে। অ্যাপ সঠিকভাবে চালু রাখতে এবং আপনাকে ভালো
            অভিজ্ঞতা দিতে যতটুকু প্রয়োজন ততটুকু সীমিত তথ্যই শুধু ব্যবহার করা হয়।
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">2. What we store on your device / আপনার ডিভাইসে যা সেভ হয়</h2>
          <p className="text-muted-foreground">
            Some preferences (such as theme mode, language selection, quiz progress,
            notification and prayer settings) are stored locally on your device using
            localStorage. This data never leaves your device unless your platform (for example,
            backup services) syncs it.
          </p>
          <p className="text-muted-foreground">
            থিম (ডার্ক/লাইট), ভাষা নির্বাচন, কুইজ প্রগ্রেস, নোটিফিকেশন পছন্দ, নামাজের সময় ইত্যাদি
            কিছু সেটিংস আপনার ডিভাইসে localStorage এর মাধ্যমে সেভ থাকে। এই তথ্য কেবলমাত্র
            আপনার ডিভাইসেই থাকে এবং অ্যাপের ভেতরে আপনার অভিজ্ঞতা ব্যক্তিগত করার জন্য ব্যবহৃত হয়।
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">3. Usage information / ব্যবহারের তথ্য</h2>
          <p className="text-muted-foreground">
            The app may collect anonymous usage information (such as which screens are visited
            most) to understand how features are used. This information is aggregated and does
            not identify you personally.
          </p>
          <p className="text-muted-foreground">
            অ্যাপের কোন পেজ বেশি ব্যবহার হচ্ছে, কোন ফিচার বেশি দেখা হচ্ছে – এমন কিছু সামগ্রিক
            (anonymous) তথ্য বিশ্লেষণের জন্য ব্যবহার করা হতে পারে, যা কখনই কোনো ব্যবহারকারীকে
            আলাদা করে শনাক্ত করার জন্য ব্যবহৃত হয় না।
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">4. Your rights / আপনার অধিকার</h2>
          <p className="text-muted-foreground">
            You can clear app data (such as local preferences or quiz history) from your device
            at any time through your browser or device settings. If you stop using the app,
            we do not keep any additional personal information about you inside the app.
          </p>
          <p className="text-muted-foreground">
            আপনি চাইলে যেকোনো সময় ব্রাউজার বা ডিভাইসের সেটিংস থেকে অ্যাপের local data মুছে ফেলতে
            পারবেন। আপনি অ্যাপ ব্যবহার বন্ধ করে দিলে আমাদের পক্ষ থেকে আলাদা করে আপনার ব্যক্তিগত
            তথ্য সংরক্ষণ করা হয় না।
          </p>
        </section>

        <section className="bg-card/70 border border-border/60 rounded-2xl shadow-soft p-5 space-y-2">
          <h2 className="text-lg font-semibold">5. Changes & contact / নীতি পরিবর্তন ও যোগাযোগ</h2>
          <p className="text-muted-foreground">
            This privacy policy may be updated as the app evolves. If you have questions or
            concerns, you may reach out to the NOOR team through the app or via the store page
            where the app is published.
          </p>
          <p className="text-muted-foreground">
            ভবিষ্যতে অ্যাপের উন্নয়নের সাথে সাথে এই প্রাইভেসি নীতিমালায় পরিবর্তন আসতে পারে। কোনো
            প্রশ্ন বা উদ্বেগ থাকলে অ্যাপের ভেতর থেকে কিংবা যেখান থেকে অ্যাপটি ডাউনলোড করেছেন,
            সেখানকার মাধ্যমে ডেভেলপার টিমের সাথে যোগাযোগ করতে পারবেন।
          </p>
        </section>
      </main>
    </div>
  );
};

export default PrivacyPolicyPage;
