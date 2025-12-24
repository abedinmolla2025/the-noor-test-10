import { useState } from "react";
import { Search, Heart, User, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";

interface BabyName {
  id: number;
  name: string;
  arabic: string;
  meaning: string;
  gender: "boy" | "girl";
  origin: string;
}

const babyNames: BabyName[] = [
  // Boys
  { id: 1, name: "Muhammad", arabic: "مُحَمَّد", meaning: "Praised, commendable", gender: "boy", origin: "Arabic" },
  { id: 2, name: "Ahmad", arabic: "أَحْمَد", meaning: "Most commendable, most praiseworthy", gender: "boy", origin: "Arabic" },
  { id: 3, name: "Ali", arabic: "عَلِي", meaning: "High, elevated, noble", gender: "boy", origin: "Arabic" },
  { id: 4, name: "Omar", arabic: "عُمَر", meaning: "Flourishing, long-lived", gender: "boy", origin: "Arabic" },
  { id: 5, name: "Yusuf", arabic: "يُوسُف", meaning: "God increases", gender: "boy", origin: "Hebrew/Arabic" },
  { id: 6, name: "Ibrahim", arabic: "إِبْرَاهِيم", meaning: "Father of nations", gender: "boy", origin: "Hebrew/Arabic" },
  { id: 7, name: "Adam", arabic: "آدَم", meaning: "Earth, created from earth", gender: "boy", origin: "Hebrew/Arabic" },
  { id: 8, name: "Hassan", arabic: "حَسَن", meaning: "Good, handsome, beautiful", gender: "boy", origin: "Arabic" },
  { id: 9, name: "Hussein", arabic: "حُسَيْن", meaning: "Good, handsome (diminutive)", gender: "boy", origin: "Arabic" },
  { id: 10, name: "Khalid", arabic: "خَالِد", meaning: "Eternal, immortal", gender: "boy", origin: "Arabic" },
  { id: 11, name: "Hamza", arabic: "حَمْزَة", meaning: "Strong, steadfast", gender: "boy", origin: "Arabic" },
  { id: 12, name: "Bilal", arabic: "بِلَال", meaning: "Water, moisture", gender: "boy", origin: "Arabic" },
  { id: 13, name: "Zayd", arabic: "زَيْد", meaning: "Growth, abundance", gender: "boy", origin: "Arabic" },
  { id: 14, name: "Amir", arabic: "أَمِير", meaning: "Prince, commander", gender: "boy", origin: "Arabic" },
  { id: 15, name: "Tariq", arabic: "طَارِق", meaning: "Morning star, he who knocks", gender: "boy", origin: "Arabic" },
  { id: 16, name: "Imran", arabic: "عِمْرَان", meaning: "Prosperity, long life", gender: "boy", origin: "Arabic" },
  { id: 17, name: "Idris", arabic: "إِدْرِيس", meaning: "Studious, learned", gender: "boy", origin: "Arabic" },
  { id: 18, name: "Rayyan", arabic: "رَيَّان", meaning: "Gates of Heaven, luxuriant", gender: "boy", origin: "Arabic" },
  { id: 19, name: "Zain", arabic: "زَيْن", meaning: "Beauty, grace", gender: "boy", origin: "Arabic" },
  { id: 20, name: "Faisal", arabic: "فَيْصَل", meaning: "Decisive, judge", gender: "boy", origin: "Arabic" },
  
  // Girls
  { id: 21, name: "Fatima", arabic: "فَاطِمَة", meaning: "One who abstains", gender: "girl", origin: "Arabic" },
  { id: 22, name: "Aisha", arabic: "عَائِشَة", meaning: "Living, prosperous, alive", gender: "girl", origin: "Arabic" },
  { id: 23, name: "Khadija", arabic: "خَدِيجَة", meaning: "Early baby, premature child", gender: "girl", origin: "Arabic" },
  { id: 24, name: "Maryam", arabic: "مَرْيَم", meaning: "Beloved, sea of sorrow", gender: "girl", origin: "Hebrew/Arabic" },
  { id: 25, name: "Zainab", arabic: "زَيْنَب", meaning: "Fragrant flower, beauty of the father", gender: "girl", origin: "Arabic" },
  { id: 26, name: "Layla", arabic: "لَيْلَى", meaning: "Night, dark beauty", gender: "girl", origin: "Arabic" },
  { id: 27, name: "Sara", arabic: "سَارَة", meaning: "Princess, pure", gender: "girl", origin: "Hebrew/Arabic" },
  { id: 28, name: "Hana", arabic: "هَنَا", meaning: "Happiness, bliss", gender: "girl", origin: "Arabic" },
  { id: 29, name: "Noor", arabic: "نُور", meaning: "Light, radiance", gender: "girl", origin: "Arabic" },
  { id: 30, name: "Amina", arabic: "أَمِينَة", meaning: "Trustworthy, faithful", gender: "girl", origin: "Arabic" },
  { id: 31, name: "Hafsa", arabic: "حَفْصَة", meaning: "Young lioness", gender: "girl", origin: "Arabic" },
  { id: 32, name: "Ruqayyah", arabic: "رُقَيَّة", meaning: "Ascent, progress", gender: "girl", origin: "Arabic" },
  { id: 33, name: "Asma", arabic: "أَسْمَاء", meaning: "Excellent, lofty", gender: "girl", origin: "Arabic" },
  { id: 34, name: "Safiya", arabic: "صَفِيَّة", meaning: "Pure, sincere friend", gender: "girl", origin: "Arabic" },
  { id: 35, name: "Sumayya", arabic: "سُمَيَّة", meaning: "High above", gender: "girl", origin: "Arabic" },
  { id: 36, name: "Yasmin", arabic: "يَاسْمِين", meaning: "Jasmine flower", gender: "girl", origin: "Persian/Arabic" },
  { id: 37, name: "Iman", arabic: "إِيمَان", meaning: "Faith, belief", gender: "girl", origin: "Arabic" },
  { id: 38, name: "Aaliyah", arabic: "عَالِيَة", meaning: "High, exalted, sublime", gender: "girl", origin: "Arabic" },
  { id: 39, name: "Zahra", arabic: "زَهْرَاء", meaning: "Radiant, shining, flower", gender: "girl", origin: "Arabic" },
  { id: 40, name: "Mariam", arabic: "مَرْيَم", meaning: "Beloved, wished-for child", gender: "girl", origin: "Hebrew/Arabic" },
];

const BabyNamesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedName, setSelectedName] = useState<BabyName | null>(null);

  const toggleFavorite = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const filterNames = (names: BabyName[], gender?: "boy" | "girl") => {
    return names.filter((name) => {
      const matchesSearch =
        name.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.meaning.toLowerCase().includes(searchQuery.toLowerCase()) ||
        name.arabic.includes(searchQuery);
      const matchesGender = !gender || name.gender === gender;
      return matchesSearch && matchesGender;
    });
  };

  const NameCard = ({ name }: { name: BabyName }) => (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={() => setSelectedName(name)}
      className="w-full text-left p-4 rounded-2xl bg-card shadow-soft hover:shadow-md transition-all active:scale-[0.98]"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center ${
              name.gender === "boy"
                ? "bg-blue-100 text-blue-600"
                : "bg-pink-100 text-pink-600"
            }`}
          >
            <User size={20} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-semibold text-foreground">{name.name}</p>
              <span className="text-lg font-arabic text-muted-foreground">
                {name.arabic}
              </span>
            </div>
            <p className="text-sm text-muted-foreground line-clamp-1">
              {name.meaning}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => toggleFavorite(name.id, e)}
          className="p-2 hover:bg-muted rounded-full transition-colors"
        >
          {favorites.includes(name.id) ? (
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          ) : (
            <Heart className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>
    </motion.button>
  );

  const NamesList = ({ names }: { names: BabyName[] }) => (
    <div className="space-y-3">
      {names.length > 0 ? (
        names.map((name, index) => (
          <motion.div
            key={name.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.03 }}
          >
            <NameCard name={name} />
          </motion.div>
        ))
      ) : (
        <p className="text-center text-muted-foreground py-8">
          No names found
        </p>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <button
            onClick={() => selectedName ? setSelectedName(null) : navigate("/")}
            className="p-2 -ml-2 hover:bg-muted rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">
            {selectedName ? selectedName.name : "👶 Islamic Baby Names"}
          </h1>
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {selectedName ? (
          // Name Detail View
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="p-4 space-y-6"
          >
            <div className="text-center space-y-4 py-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", delay: 0.1 }}
                className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center ${
                  selectedName.gender === "boy"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-pink-100 text-pink-600"
                }`}
              >
                <User size={40} />
              </motion.div>
              <div>
                <h2 className="text-3xl font-bold">{selectedName.name}</h2>
                <p className="text-4xl font-arabic text-primary mt-3">
                  {selectedName.arabic}
                </p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="bg-card rounded-2xl p-5 shadow-soft">
                <p className="text-sm font-medium text-muted-foreground mb-2">
                  Meaning
                </p>
                <p className="text-lg text-foreground">{selectedName.meaning}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-card rounded-2xl p-5 shadow-soft">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Gender
                  </p>
                  <p className="text-lg text-foreground capitalize">
                    {selectedName.gender}
                  </p>
                </div>
                <div className="bg-card rounded-2xl p-5 shadow-soft">
                  <p className="text-sm font-medium text-muted-foreground mb-2">
                    Origin
                  </p>
                  <p className="text-lg text-foreground">{selectedName.origin}</p>
                </div>
              </div>
            </motion.div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              onClick={(e) => toggleFavorite(selectedName.id, e)}
              className={`w-full py-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${
                favorites.includes(selectedName.id)
                  ? "bg-red-100 text-red-600"
                  : "bg-primary text-primary-foreground"
              }`}
            >
              {favorites.includes(selectedName.id) ? (
                <>
                  <Heart className="w-5 h-5 fill-current" />
                  Remove from Favorites
                </>
              ) : (
                <>
                  <Heart className="w-5 h-5" />
                  Add to Favorites
                </>
              )}
            </motion.button>
          </motion.div>
        ) : (
          // List View
          <motion.div
            key="list"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="p-4 space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search names or meanings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-12 h-12 rounded-2xl bg-card border-0 shadow-soft"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4 h-12 rounded-2xl bg-muted p-1">
                <TabsTrigger value="all" className="rounded-xl">All</TabsTrigger>
                <TabsTrigger value="boys" className="rounded-xl">Boys</TabsTrigger>
                <TabsTrigger value="girls" className="rounded-xl">Girls</TabsTrigger>
                <TabsTrigger value="favorites" className="rounded-xl">
                  ❤️ {favorites.length}
                </TabsTrigger>
              </TabsList>
              <TabsContent value="all" className="mt-4">
                <NamesList names={filterNames(babyNames)} />
              </TabsContent>
              <TabsContent value="boys" className="mt-4">
                <NamesList names={filterNames(babyNames, "boy")} />
              </TabsContent>
              <TabsContent value="girls" className="mt-4">
                <NamesList names={filterNames(babyNames, "girl")} />
              </TabsContent>
              <TabsContent value="favorites" className="mt-4">
                <NamesList
                  names={babyNames.filter((n) => favorites.includes(n.id))}
                />
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BabyNamesPage;
