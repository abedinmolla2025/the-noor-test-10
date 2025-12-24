import { useState } from "react";
import { Search, Heart, HeartOff, User } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface BabyNamesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

const BabyNames = ({ open, onOpenChange }: BabyNamesProps) => {
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
    <button
      onClick={() => setSelectedName(name)}
      className="w-full text-left p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors group"
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              name.gender === "boy"
                ? "bg-blue-100 text-blue-600"
                : "bg-pink-100 text-pink-600"
            }`}
          >
            <User size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="font-medium">{name.name}</p>
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
          className="p-2 hover:bg-background rounded-full transition-colors"
        >
          {favorites.includes(name.id) ? (
            <Heart className="w-5 h-5 text-red-500 fill-red-500" />
          ) : (
            <Heart className="w-5 h-5 text-muted-foreground" />
          )}
        </button>
      </div>
    </button>
  );

  const NamesList = ({ names }: { names: BabyName[] }) => (
    <ScrollArea className="h-[45vh]">
      <div className="space-y-2 pr-4">
        {names.length > 0 ? (
          names.map((name) => <NameCard key={name.id} name={name} />)
        ) : (
          <p className="text-center text-muted-foreground py-8">
            No names found
          </p>
        )}
      </div>
    </ScrollArea>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {selectedName && (
              <button
                onClick={() => setSelectedName(null)}
                className="mr-2 p-1 hover:bg-muted rounded-md transition-colors"
              >
                ←
              </button>
            )}
            👶 {selectedName ? selectedName.name : "Islamic Baby Names"}
          </DialogTitle>
        </DialogHeader>

        {selectedName ? (
          // Name Detail View
          <div className="space-y-6 py-4">
            <div className="text-center space-y-4">
              <div
                className={`w-20 h-20 rounded-full mx-auto flex items-center justify-center ${
                  selectedName.gender === "boy"
                    ? "bg-blue-100 text-blue-600"
                    : "bg-pink-100 text-pink-600"
                }`}
              >
                <User size={32} />
              </div>
              <div>
                <h3 className="text-2xl font-bold">{selectedName.name}</h3>
                <p className="text-3xl font-arabic text-primary mt-2">
                  {selectedName.arabic}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm font-medium text-muted-foreground mb-1">
                  Meaning
                </p>
                <p className="text-foreground">{selectedName.meaning}</p>
              </div>

              <div className="flex gap-4">
                <div className="flex-1 bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Gender
                  </p>
                  <p className="text-foreground capitalize">
                    {selectedName.gender}
                  </p>
                </div>
                <div className="flex-1 bg-muted/50 rounded-lg p-4">
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Origin
                  </p>
                  <p className="text-foreground">{selectedName.origin}</p>
                </div>
              </div>
            </div>

            <button
              onClick={(e) => toggleFavorite(selectedName.id, e)}
              className={`w-full py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                favorites.includes(selectedName.id)
                  ? "bg-red-100 text-red-600 hover:bg-red-200"
                  : "bg-muted hover:bg-muted/80"
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
            </button>
          </div>
        ) : (
          // List View
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search names or meanings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="boys">Boys</TabsTrigger>
                <TabsTrigger value="girls">Girls</TabsTrigger>
                <TabsTrigger value="favorites">
                  ❤️ ({favorites.length})
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
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BabyNames;
