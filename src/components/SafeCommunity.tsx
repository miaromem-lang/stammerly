import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, HandMetal, Sparkles, Star, ThumbsUp, PartyPopper, Smile } from "lucide-react";
import { toast } from "sonner";

interface QuickAction {
  id: string;
  emoji: string;
  label: string;
  message: string;
  icon: React.ReactNode;
}

const QUICK_ACTIONS: QuickAction[] = [
  { id: "highfive", emoji: "🙏", label: "High Five!", message: "gave you a high five!", icon: <HandMetal className="w-4 h-4" /> },
  { id: "star", emoji: "⭐", label: "You're a Star!", message: "thinks you're a star!", icon: <Star className="w-4 h-4" /> },
  { id: "thumbsup", emoji: "👍", label: "Great Job!", message: "says great job!", icon: <ThumbsUp className="w-4 h-4" /> },
  { id: "heart", emoji: "💚", label: "You've Got This!", message: "believes in you!", icon: <Heart className="w-4 h-4" /> },
  { id: "party", emoji: "🎉", label: "Celebrate!", message: "is celebrating with you!", icon: <PartyPopper className="w-4 h-4" /> },
  { id: "smile", emoji: "😊", label: "Keep Smiling!", message: "sent you a smile!", icon: <Smile className="w-4 h-4" /> },
];

const ENCOURAGING_PHRASES = [
  "You're doing amazing! 🌟",
  "Every word counts! 💪",
  "I'm proud of you! 🎉",
  "You're so brave! 🦁",
  "Keep going, champion! 🏆",
  "Speech heroes unite! 🦸",
  "You make me smile! 😊",
  "Practice makes awesome! ✨",
];

interface SafeCommunityProps {
  characterName?: string;
  characterEmoji?: string;
}

export const SafeCommunity = ({ characterName = "Friend", characterEmoji = "🦦" }: SafeCommunityProps) => {
  const [sentActions, setSentActions] = useState<string[]>([]);
  const [recentMessages, setRecentMessages] = useState<Array<{ emoji: string; text: string; time: string }>>([]);

  const handleAction = (action: QuickAction) => {
    setSentActions((prev) => [...prev, action.id]);
    setRecentMessages((prev) => [
      { emoji: action.emoji, text: `You ${action.message}`, time: "Just now" },
      ...prev.slice(0, 4),
    ]);
    toast.success(`${action.emoji} ${action.label}`, { duration: 2000 });

    // Reset animation after a moment
    setTimeout(() => {
      setSentActions((prev) => prev.filter((id) => id !== action.id));
    }, 1500);
  };

  const handlePhrase = (phrase: string) => {
    setRecentMessages((prev) => [
      { emoji: "💬", text: `You said: "${phrase}"`, time: "Just now" },
      ...prev.slice(0, 4),
    ]);
    toast.success(`Message sent! 💬`, { duration: 2000 });
  };

  return (
    <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-display flex items-center gap-2 text-foreground">
          <Sparkles className="w-5 h-5 text-gold" />
          🤝 Cheer Squad
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Send encouragement to fellow speech adventurers!
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-2">
          {QUICK_ACTIONS.map((action) => {
            const isSent = sentActions.includes(action.id);
            return (
              <Button
                key={action.id}
                variant="outline"
                size="sm"
                className={`rounded-kids flex-col gap-1 h-auto py-3 transition-all ${
                  isSent ? "bg-success/20 border-success scale-95" : "hover:bg-accent-orange/10"
                }`}
                onClick={() => handleAction(action)}
                disabled={isSent}
              >
                <span className={`text-2xl ${isSent ? "animate-bounce" : ""}`}>{action.emoji}</span>
                <span className="text-[10px] leading-tight">{action.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Pre-written Phrases */}
        <div>
          <p className="text-xs font-medium text-muted-foreground mb-2">Send a kind message:</p>
          <div className="flex flex-wrap gap-1.5">
            {ENCOURAGING_PHRASES.map((phrase) => (
              <Button
                key={phrase}
                variant="ghost"
                size="sm"
                className="rounded-kids text-[11px] h-7 px-2.5 bg-secondary/50 hover:bg-accent-sky/20"
                onClick={() => handlePhrase(phrase)}
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        {recentMessages.length > 0 && (
          <div className="border-t border-border pt-3">
            <p className="text-xs font-medium text-muted-foreground mb-2">Recent:</p>
            <div className="space-y-1.5">
              {recentMessages.map((msg, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span>{msg.emoji}</span>
                  <span className="flex-1">{msg.text}</span>
                  <span className="text-[10px]">{msg.time}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="bg-success/10 rounded-kids p-3">
          <p className="text-[10px] text-muted-foreground text-center">
            💚 All messages are kind and positive. We keep this space safe and encouraging for everyone.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
