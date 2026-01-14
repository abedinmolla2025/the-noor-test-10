import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAdmin } from "@/contexts/AdminContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Alert } from "@/components/ui/alert";

interface ImportDuaJson {
  title: string;
  title_arabic: string;
  content_arabic: string;
  pronunciation: string;
  content: string;
  category: string;
}

// Full dua dataset for import
const OLD_DUAS: ImportDuaJson[] = [
  {
    title: "ঘুমের আগে দোয়া",
    title_arabic: "دعاء قبل النوم",
    content_arabic: "بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا",
    pronunciation: "বিসমিকা আল্লাহুম্মা আমূতু ওয়া আহইয়া",
    content: "হে আল্লাহ! আপনারই নামে আমি মরি এবং বেঁচে উঠি।",
    category: "Sleep",
  },
  {
    title: "ঘুম থেকে জাগ্রত হওয়ার দোয়া",
    title_arabic: "دعاء الاستيقاظ من النوم",
    content_arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ",
    pronunciation:
      "আলহামদু লিল্লাহিল্লাযী আহইয়ানা বা’দা মা আমাতানা ওয়া ইলাইহিন নুশূর",
    content:
      "সমস্ত প্রশংসা আল্লাহর, যিনি আমাদের মৃত্যু পরবর্তী আবার জীবন দান করলেন এবং তাঁর কাছেই ফিরে যেতে হবে।",
    category: "Daily",
  },
  {
    title: "বাড়ি থেকে বের হওয়ার দোয়া",
    title_arabic: "دعاء الخروج من المنزل",
    content_arabic:
      "بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ",
    pronunciation:
      "বিসমিল্লাহি তাওয়াক্কালতু আলাল্লাহ, লা হাউলা ওয়া লা কুওয়্যাতা ইল্লা বিল্লাহ",
    content:
      "আল্লাহর নামে বের হচ্ছি, আল্লাহর উপর ভরসা করলাম, আল্লাহ ছাড়া কোনো শক্তি ও ক্ষমতা নেই।",
    category: "Daily",
  },
  {
    title: "বাড়িতে প্রবেশের দোয়া",
    title_arabic: "دعاء دخول المنزل",
    content_arabic:
      "بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا",
    pronunciation:
      "বিসমিল্লাহি ওয়ালাজনা ওয়া বিসমিল্লাহি খারাজনা ওয়া আলাল্লাহি রব্বিনা তাওয়াক্কালনা",
    content:
      "আল্লাহর নামে আমরা প্রবেশ করলাম, আল্লাহর নামেই বের হলাম এবং আমাদের রব আল্লাহর ওপরই ভরসা করলাম।",
    category: "Daily",
  },
  {
    title: "মসজিদে প্রবেশের দোয়া",
    title_arabic: "دعاء دخول المسجد",
    content_arabic: "اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ",
    pronunciation: "আল্লাহুম্মা ইফতাহ্ লী আবওয়াবা রাহমাতিক",
    content: "হে আল্লাহ! আমার জন্য আপনার রহমতের দরজাগুলো খুলে দিন।",
    category: "Prayer",
  },
  {
    title: "মসজিদ থেকে বের হওয়ার দোয়া",
    title_arabic: "دعاء الخروج من المسجد",
    content_arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ",
    pronunciation: "আল্লাহুম্মা ইন্নী আসআলুকা মিন ফাদলিক",
    content: "হে আল্লাহ! আমি আপনার অনুগ্রহ প্রার্থনা করছি।",
    category: "Prayer",
  },
  {
    title: "ওযুর পরের দোয়া",
    title_arabic: "دعاء بعد الوضوء",
    content_arabic:
      "أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ، وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ",
    pronunciation:
      "আশহাদু আল্লা ইলা-হা ইল্লাল্লাহু ওয়াহ্দাহু লা শারীকালাহু, ওয়া আশহাদু আন্না মুহাম্মাদান আবদুহু ওয়া রাসূলুহ",
    content:
      "আমি সাক্ষ্য দিচ্ছি, আল্লাহ ছাড়া কোনো ইলাহ নেই, তাঁর কোনো শরিক নেই এবং আমি সাক্ষ্য দিচ্ছি যে মুহাম্মাদ (সা.) তাঁর বান্দা ও রাসুল।",
    category: "Prayer",
  },
  {
    title: "খাওয়ার আগে দোয়া",
    title_arabic: "دعاء قبل الطعام",
    content_arabic: "بِسْمِ اللَّهِ",
    pronunciation: "বিসমিল্লাহ",
    content: "আল্লাহর নামে (খেতে শুরু করছি)।",
    category: "Daily",
  },
  {
    title: "খাওয়ার পরের দোয়া",
    title_arabic: "دعاء بعد الطعام",
    content_arabic:
      "الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مِنَ الْمُسْلِمِينَ",
    pronunciation:
      "আলহামদু লিল্লাহিল্লাযী আতআমানা ওয়া সাকানা ওয়া জা’আলানা মিনাল মুসলিমীন",
    content:
      "সব প্রশংসা আল্লাহর জন্য, যিনি আমাদের খাদ্য ও পানীয় দিয়েছেন এবং আমাদের মুসলিম বানিয়েছেন।",
    category: "Daily",
  },
  {
    title: "ভ্রমণে বের হওয়ার দোয়া",
    title_arabic: "دعاء السفر",
    content_arabic:
      "سُبْحَانَ الَّذِي سَخَّرَ لَنَا هٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ",
    pronunciation:
      "সুবহানাল্লাযী সাখ্খারা লানা হাযা ওয়া মা কুলনা লাহু মুকরিনীন, ওয়া ইন্না ইলা রব্বিনা লামুনক্বলিবুন",
    content:
      "পাক তিনি, যিনি আমাদের জন্য এ বাহনকে বশীভূত করলেন, নইলে আমরা তা সামলাতে পারতাম না; এবং অবশ্যই আমরা আমাদের রবের কাছেই ফিরে যাব।",
    category: "Travel",
  },
  {
    title: "ভয় ও দুঃখের সময়ের দোয়া",
    title_arabic: "دعاء الكرب",
    content_arabic:
      "لَا إِلٰهَ إِلَّا اللَّهُ الْعَظِيمُ الْحَلِيمُ، لَا إِلٰهَ إِلَّا اللَّهُ رَبُّ الْعَرْشِ الْعَظِيمِ",
    pronunciation:
      "লা ইলাহা ইল্লাল্লাহুল আজীমুল হালীম, লা ইলাহা ইল্লাল্লাহু রব্বুল আরশিল আজীম",
    content:
      "কোনো ইলাহ নেই আল্লাহ ব্যতীত, মহান ও সহনশীল; কোনো ইলাহ নেই আল্লাহ ব্যতীত, মহান আরশের রব।",
    category: "Protection",
  },
  {
    title: "কষ্ট ও বিপদে ধৈর্যের দোয়া",
    title_arabic: "دعاء الصبر",
    content_arabic: "رَبَّنَا أَفْرِغْ عَلَيْنَا صَبْرًا وَثَبِّتْ أَقْدَامَنَا",
    pronunciation: "রাব্বানা আফরিগ আলাইনা সাবরাঁ ওয়া সাব্বিত আকদামানা",
    content:
      "হে আমাদের রব! আমাদের উপর ব্যাপক ধৈর্য বর্ষণ করুন এবং আমাদের পা দৃঢ় রাখুন।",
    category: "Protection",
  },
  {
    title: "রোগ-ব্যাধি থেকে আরোগ্যের দোয়া",
    title_arabic: "دعاء الشفاء",
    content_arabic:
      "اللَّهُمَّ رَبَّ النَّاسِ، أَذْهِبِ الْبَأْسَ، اشْفِ أَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ",
    pronunciation:
      "আল্লাহুম্মা রাব্বান্ নাস, আঝহিবিল বা’স, ইশফি আনতাশ শাফি, লা শিফা’ইল্লা শিফাউক",
    content:
      "হে মানুষের রব আল্লাহ! কষ্ট দূর করুন, আরোগ্য দান করুন; আপনি আরোগ্যদাতা, আপনার আরোগ্য ব্যতীত কোনো আরোগ্য নেই।",
    category: "Health",
  },
  {
    title: "রিযিকের দোয়া",
    title_arabic: "دعاء الرزق",
    content_arabic: "اللَّهُمَّ ارْزُقْنِي رِزْقًا حَلَالًا طَيِّبًا وَاسِعًا",
    pronunciation: "আল্লাহুম্মার যুকনী রিযকান হালালান তইয়্যিবান ওয়াসিআ",
    content: "হে আল্লাহ! আমাকে হালাল, পবিত্র ও প্রসস্ত রিযিক দান করুন।",
    category: "Rizq",
  },
  {
    title: "তাওবা ও ক্ষমা প্রার্থনার দোয়া",
    title_arabic: "سيد الاستغفار",
    content_arabic:
      "اللَّهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ...",
    pronunciation:
      "আল্লাহুম্মা আনতা রাব্বী লা ইলা-হা ইল্লা আনতা, খালাকতানী ওয়া আনা আবদুক...",
    content:
      "হে আল্লাহ! আপনি আমার রব, আপনার ছাড়া কোনো ইলাহ নেই, আপনি আমাকে সৃষ্টি করেছেন আর আমি আপনার বান্দা — এভাবে ক্ষমা চেয়ে তওবা করার সর্বোত্তম দোয়া।",
    category: "Daily",
  },
  {
    title: "পিতা-মাতার জন্য দোয়া",
    title_arabic: "دعاء للوالدين",
    content_arabic: "رَبِّ ارْحَمْهُمَا كَمَا رَبَّيَانِي صَغِيرًا",
    pronunciation: "রাব্বির হামহুমা কামা রাব্বায়ানি সগীরাআ",
    content:
      "হে আমার রব! আমার পিতা-মাতার প্রতি দয়া করুন, যেমন তারা শৈশবে আমাকে লালন-পালন করেছেন।",
    category: "Daily",
  },
  {
    title: "হেদায়াতের জন্য দোয়া",
    title_arabic: "دعاء الهداية",
    content_arabic: "اللَّهُمَّ اهْدِنِي وَسَدِّدْنِي",
    pronunciation: "আল্লাহুম্মা ইহদিনী ওয়া সাদ্দিদনী",
    content: "হে আল্লাহ! আমাকে সঠিক পথে পরিচালিত করুন এবং আমার কাজসমূহ সঠিক করে দিন।",
    category: "Daily",
  },
  {
    title: "দ্বীনের উপর অটল থাকার দোয়া",
    title_arabic: "دعاء الثبات",
    content_arabic:
      "يَا مُقَلِّبَ الْقُلُوبِ ثَبِّتْ قَلْبِي عَلَى دِينِكَ",
    pronunciation: "ইয়া মুকাল্লিবাল কুলূব, সাব্বিত কালবি ‘আলা দীনিক",
    content:
      "হে অন্তর পরিবর্তনকারী! আমার অন্তরকে আপনার দ্বীনের উপর দৃঢ় রাখুন।",
    category: "Protection",
  },
  {
    title: "শয়তানের কুমন্ত্রণা থেকে বাঁচার দোয়া",
    title_arabic: "الاستعاذة من الشيطان",
    content_arabic: "أَعُوذُ بِاللَّهِ مِنَ الشَّيْطَانِ الرَّجِيمِ",
    pronunciation: "আঊযু বিল্লাহি মিনাশ শাইতানির রাজীম",
    content:
      "নিক্ষিপ্ত শয়তান থেকে আমি আল্লাহর নিকট আশ্রয় প্রার্থনা করছি।",
    category: "Protection",
  },
  {
    title: "দুঃখ ও দুশ্চিন্তা দূর করার দোয়া",
    title_arabic: "دعاء الهم والحزن",
    content_arabic: "اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ",
    pronunciation: "আল্লাহুম্মা ইন্নী আঊযু বিকা মিনাল হাম্মি ওয়াল হাযান",
    content:
      "হে আল্লাহ! আমি আপনার কাছে দুঃখ ও দুশ্চিন্তা থেকে আশ্রয় চাই।",
    category: "Health",
  },
  {
    title: "জান্নাত প্রার্থনার দোয়া",
    title_arabic: "دعاء الجنة",
    content_arabic: "اللَّهُمَّ إِنِّي أَسْأَلُكَ الْجَنَّةَ",
    pronunciation: "আল্লাহুম্মা ইন্নী আসআলুকাল জান্নাহ",
    content: "হে আল্লাহ! আমি আপনার নিকট জান্নাত প্রার্থনা করছি।",
    category: "Prayer",
  },
];

export default function ImportOldDuas() {
  const { user, isAdmin, isSuperAdmin } = useAdmin();
  const [status, setStatus] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(OLD_DUAS, null, 2));

  const canImport = !!user && (isAdmin || isSuperAdmin);

  const handleImport = async () => {
    setStatus("");
    setError("");

    if (!canImport) {
      setError("You must be logged in as admin to import.");
      return;
    }

    let parsed: ImportDuaJson[];
    try {
      parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) {
        throw new Error("JSON must be an array");
      }
    } catch (e: any) {
      setError("Invalid JSON: " + e.message);
      return;
    }

    try {
      const payload = parsed.map((d) => ({
        content_type: "dua",
        title: d.title,
        title_arabic: d.title_arabic,
        content: d.content,
        content_arabic: d.content_arabic,
        content_pronunciation: d.pronunciation,
        category: d.category,
        status: "published",
        is_published: true,
      }));

      const { error: insertError } = await supabase.from("admin_content").insert(payload);
      if (insertError) throw insertError;

      setStatus(`Imported ${payload.length} duas successfully.`);
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Import failed");
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Import Old Duas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {!canImport && (
            <Alert variant="destructive">
              You must be logged in as an admin to run this import.
            </Alert>
          )}

          <p className="text-sm text-muted-foreground">
            Paste your JSON array of duas here. Each item must have
            <code className="mx-1">title</code>,
            <code className="mx-1">title_arabic</code>,
            <code className="mx-1">content_arabic</code>,
            <code className="mx-1">pronunciation</code>,
            <code className="mx-1">content</code>, and
            <code className="mx-1">category</code> fields.
          </p>

          <Textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            rows={18}
            className="font-mono text-xs"
          />

          <div className="flex gap-2 items-center">
            <Button onClick={handleImport} disabled={!canImport}>
              Import Duas
            </Button>
            {status && <span className="text-sm text-emerald-500">{status}</span>}
            {error && <span className="text-sm text-destructive">{error}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
