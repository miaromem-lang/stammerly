import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Star, Lock, Check, Sparkles } from "lucide-react";
import { useUserProgress } from "@/hooks/useUserProgress";
import { toast } from "sonner";

interface StoreItem {
  id: string;
  name: string;
  emoji: string;
  category: "hat" | "accessory" | "companion" | "background";
  cost: number;
  description: string;
}

const STORE_ITEMS: StoreItem[] = [
  // Hats
  { id: "hat-crown", name: "Golden Crown", emoji: "👑", category: "hat", cost: 50, description: "Feel like royalty!" },
  { id: "hat-wizard", name: "Wizard Hat", emoji: "🧙", category: "hat", cost: 75, description: "Magical speech powers" },
  { id: "hat-pirate", name: "Pirate Hat", emoji: "🏴‍☠️", category: "hat", cost: 60, description: "Ahoy, Captain!" },
  { id: "hat-astronaut", name: "Space Helmet", emoji: "🧑‍🚀", category: "hat", cost: 100, description: "To infinity and beyond!" },
  // Accessories
  { id: "acc-cape", name: "Super Cape", emoji: "🦸", category: "accessory", cost: 80, description: "You're a speech hero!" },
  { id: "acc-glasses", name: "Cool Shades", emoji: "😎", category: "accessory", cost: 30, description: "Looking cool!" },
  { id: "acc-bow", name: "Rainbow Bow", emoji: "🎀", category: "accessory", cost: 25, description: "Pretty and colourful" },
  { id: "acc-medal", name: "Gold Medal", emoji: "🥇", category: "accessory", cost: 90, description: "Champion speaker!" },
  // Companions
  { id: "comp-dragon", name: "Baby Dragon", emoji: "🐉", category: "companion", cost: 150, description: "A fiery friend!" },
  { id: "comp-unicorn", name: "Unicorn", emoji: "🦄", category: "companion", cost: 120, description: "Magical and sparkly" },
  { id: "comp-cat", name: "Space Cat", emoji: "🐱", category: "companion", cost: 100, description: "Meow from the stars" },
  // Backgrounds
  { id: "bg-rainbow", name: "Rainbow World", emoji: "🌈", category: "background", cost: 40, description: "Colours everywhere!" },
  { id: "bg-space", name: "Outer Space", emoji: "🚀", category: "background", cost: 60, description: "Among the stars" },
  { id: "bg-underwater", name: "Under the Sea", emoji: "🐠", category: "background", cost: 55, description: "Splash and play!" },
];

const STORAGE_KEY = "stammerly_avatar_store";

const categoryLabels: Record<string, string> = {
  hat: "🎩 Hats",
  accessory: "✨ Accessories",
  companion: "🐾 Companions",
  background: "🌍 Backgrounds",
};

export const AvatarStore = () => {
  const { progress } = useUserProgress();
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>("hat");
  const [purchased, setPurchased] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [equipped, setEquipped] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY + "_equipped");
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(purchased));
  }, [purchased]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY + "_equipped", JSON.stringify(equipped));
  }, [equipped]);

  const handlePurchase = (item: StoreItem) => {
    if (progress.totalGems < item.cost) {
      toast("Not enough gems yet! Keep practising to earn more 💪");
      return;
    }
    setPurchased((prev) => [...prev, item.id]);
    toast.success(`You got ${item.name}! ${item.emoji}`);
  };

  const handleEquip = (item: StoreItem) => {
    setEquipped((prev) => {
      const next = { ...prev };
      if (next[item.category] === item.id) {
        delete next[item.category];
      } else {
        next[item.category] = item.id;
      }
      return next;
    });
  };

  const filteredItems = STORE_ITEMS.filter((i) => i.category === activeCategory);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="rounded-kids gap-2">
          <ShoppingBag className="w-4 h-4" />
          Avatar Shop
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border rounded-kids max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-center text-xl font-display flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-gold" />
            Avatar Shop
          </DialogTitle>
        </DialogHeader>

        {/* Gem Balance */}
        <div className="flex items-center justify-center gap-2 bg-gold/10 px-4 py-2 rounded-kids mb-4">
          <Star className="w-5 h-5 text-gold fill-gold" />
          <span className="font-bold text-foreground">{progress.totalGems} Gems Available</span>
        </div>

        {/* Equipped Preview */}
        <div className="flex items-center justify-center gap-3 mb-4 p-4 bg-secondary/30 rounded-kids">
          {Object.entries(equipped).length > 0 ? (
            Object.entries(equipped).map(([cat, id]) => {
              const item = STORE_ITEMS.find((i) => i.id === id);
              return item ? (
                <span key={cat} className="text-3xl" title={item.name}>
                  {item.emoji}
                </span>
              ) : null;
            })
          ) : (
            <p className="text-sm text-muted-foreground">No items equipped yet</p>
          )}
        </div>

        {/* Category Tabs */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={activeCategory === key ? "default" : "outline"}
              size="sm"
              className="rounded-kids text-xs"
              onClick={() => setActiveCategory(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredItems.map((item) => {
            const owned = purchased.includes(item.id);
            const isEquipped = equipped[item.category] === item.id;
            const canAfford = progress.totalGems >= item.cost;

            return (
              <Card
                key={item.id}
                className={`overflow-hidden transition-all ${
                  isEquipped ? "ring-2 ring-success" : ""
                }`}
              >
                <CardContent className="p-4 text-center">
                  <span className="text-4xl block mb-2">{item.emoji}</span>
                  <p className="text-sm font-medium text-foreground">{item.name}</p>
                  <p className="text-[11px] text-muted-foreground mb-3">{item.description}</p>

                  {owned ? (
                    <Button
                      size="sm"
                      variant={isEquipped ? "default" : "outline"}
                      className="w-full rounded-kids text-xs"
                      onClick={() => handleEquip(item)}
                    >
                      {isEquipped ? (
                        <>
                          <Check className="w-3 h-3 mr-1" /> Wearing
                        </>
                      ) : (
                        "Wear It"
                      )}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full rounded-kids text-xs gap-1"
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                    >
                      {canAfford ? (
                        <>
                          <Star className="w-3 h-3 text-gold" /> {item.cost} Gems
                        </>
                      ) : (
                        <>
                          <Lock className="w-3 h-3" /> {item.cost} Gems
                        </>
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};
