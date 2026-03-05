import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Heart } from "lucide-react";
import { useMoodCheckins } from "@/hooks/useMoodCheckins";

const MOOD_OPTIONS = [
  { score: 1, emoji: "😢", label: "Really Sad", color: "from-red-400 to-rose-500" },
  { score: 2, emoji: "😟", label: "A Bit Worried", color: "from-orange-400 to-amber-500" },
  { score: 3, emoji: "😐", label: "Okay", color: "from-yellow-400 to-amber-400" },
  { score: 4, emoji: "😊", label: "Good!", color: "from-emerald-400 to-green-500" },
  { score: 5, emoji: "🤩", label: "Amazing!", color: "from-cyan-400 to-blue-500" },
];

const ANXIETY_LABELS: Record<number, string> = {
  0: "Super calm 😌",
  1: "Really relaxed",
  2: "Pretty relaxed",
  3: "A tiny bit nervous",
  4: "A little nervous",
  5: "Medium nervous",
  6: "Quite nervous",
  7: "Pretty worried",
  8: "Really worried",
  9: "Very anxious",
  10: "Super anxious 😰",
};

export const MoodCheckIn = () => {
  const { todayCheckin, loading, saveCheckin } = useMoodCheckins();
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [anxietyLevel, setAnxietyLevel] = useState<number[]>([3]);
  const [note, setNote] = useState("");
  const [showAnxiety, setShowAnxiety] = useState(false);
  const [saving, setSaving] = useState(false);

  // Pre-fill if already checked in today
  useEffect(() => {
    if (todayCheckin) {
      setSelectedMood(todayCheckin.mood_score);
      setAnxietyLevel([todayCheckin.anxiety_level ?? 3]);
      setNote(todayCheckin.context_note ?? "");
      setShowAnxiety(todayCheckin.anxiety_level !== null);
    }
  }, [todayCheckin]);

  const handleSave = async () => {
    if (selectedMood === null) return;
    setSaving(true);
    const moodOption = MOOD_OPTIONS.find(m => m.score === selectedMood);
    await saveCheckin(
      selectedMood,
      moodOption?.emoji ?? "😊",
      showAnxiety ? anxietyLevel[0] : null,
      note.trim() || null,
    );
    setSaving(false);
  };

  if (loading) {
    return (
      <Card className="rounded-kids glass-card-strong">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-kids glass-card-strong border-accent-orange/20 overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Heart className="w-5 h-5 text-accent-orange" />
          How Are You Feeling? {todayCheckin ? "✅" : ""}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          {todayCheckin ? "You already checked in today! You can update it." : "Tap the face that matches your mood right now."}
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Mood Picker */}
        <div className="flex justify-between gap-2">
          {MOOD_OPTIONS.map((mood) => (
            <button
              key={mood.score}
              onClick={() => setSelectedMood(mood.score)}
              className={`flex flex-col items-center gap-1 p-2 rounded-kids transition-all flex-1 ${
                selectedMood === mood.score
                  ? `bg-gradient-to-br ${mood.color} scale-110 shadow-lg ring-2 ring-accent-orange/50`
                  : "bg-secondary/40 hover:bg-secondary/70 hover:scale-105"
              }`}
            >
              <span className={`text-3xl ${selectedMood === mood.score ? "animate-bounce" : ""}`}>
                {mood.emoji}
              </span>
              <span className={`text-[10px] font-medium ${
                selectedMood === mood.score ? "text-primary-foreground" : "text-muted-foreground"
              }`}>
                {mood.label}
              </span>
            </button>
          ))}
        </div>

        {/* Anxiety Toggle */}
        {selectedMood !== null && (
          <div>
            <button
              onClick={() => setShowAnxiety(!showAnxiety)}
              className="text-sm text-primary hover:underline font-medium"
            >
              {showAnxiety ? "Hide worry meter ▲" : "Want to rate your worry level? ▼"}
            </button>

            {showAnxiety && (
              <div className="mt-3 p-4 bg-secondary/30 rounded-kids space-y-3">
                <div className="text-center">
                  <span className="text-2xl font-bold text-foreground">{anxietyLevel[0]}</span>
                  <span className="text-sm text-muted-foreground"> / 10</span>
                  <p className="text-xs text-muted-foreground mt-1">
                    {ANXIETY_LABELS[anxietyLevel[0]]}
                  </p>
                </div>
                <Slider
                  value={anxietyLevel}
                  onValueChange={setAnxietyLevel}
                  min={0}
                  max={10}
                  step={1}
                  className="w-full"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Calm</span>
                  <span>Worried</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Optional Note */}
        {selectedMood !== null && (
          <Textarea
            placeholder="Anything else? (like 'had a test today' or 'played with friends') — optional!"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="rounded-kids text-sm"
            rows={2}
          />
        )}

        {/* Save */}
        {selectedMood !== null && (
          <Button
            onClick={handleSave}
            variant="orange"
            className="w-full rounded-kids text-lg gap-2"
            disabled={saving}
          >
            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            {todayCheckin ? "Update My Check-In 🔄" : "Save My Check-In! 🌟"}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
