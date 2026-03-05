import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Heart, Star, ThumbsUp } from "lucide-react";

type FeedbackType = "fluent" | "disfluency" | "attempt" | "complete";

interface FeedbackConfig {
  emoji: string;
  messages: string[];
  bgClass: string;
  icon: React.ReactNode;
}

const FEEDBACK_CONFIG: Record<FeedbackType, FeedbackConfig> = {
  fluent: {
    emoji: "🌟",
    messages: [
      "Beautiful! That sounded so smooth!",
      "Wow, you nailed it! ✨",
      "That was fantastic! Keep going!",
      "Amazing flow! You're doing great!",
      "Brilliant! Your words were so clear!",
    ],
    bgClass: "bg-success/10 border-success/30",
    icon: <Star className="w-5 h-5 text-gold" />,
  },
  disfluency: {
    emoji: "💪",
    messages: [
      "You kept going — that takes courage!",
      "Great effort! Every try makes you stronger!",
      "You're practising so well! That's what matters!",
      "Nice work pushing through! You're so brave!",
      "That took real bravery. You're a champion!",
    ],
    bgClass: "bg-accent-sky/10 border-accent-sky/30",
    icon: <Heart className="w-5 h-5 text-accent-sky" />,
  },
  attempt: {
    emoji: "🌈",
    messages: [
      "Great try! You're learning every time!",
      "Love that you're giving it a go!",
      "Every attempt is a step forward!",
      "You're building your speech muscles!",
      "That's the spirit! Keep exploring!",
    ],
    bgClass: "bg-gold/10 border-gold/30",
    icon: <ThumbsUp className="w-5 h-5 text-gold" />,
  },
  complete: {
    emoji: "🎉",
    messages: [
      "You did it! What an amazing job!",
      "Session complete! You should be so proud!",
      "Incredible work today! 🏆",
      "You're a speech superstar! ⭐",
      "Brilliant session! Your buddy is so proud!",
    ],
    bgClass: "bg-accent-orange/10 border-accent-orange/30",
    icon: <Sparkles className="w-5 h-5 text-accent-orange" />,
  },
};

interface NonPunitiveFeedbackProps {
  type: FeedbackType;
  characterEmoji?: string;
  characterName?: string;
  visible?: boolean;
  onDismiss?: () => void;
}

/**
 * Non-punitive feedback component for speech practice.
 * NEVER shows negative indicators (red, buzzers, "try again").
 * All feedback is positive or encouragingly neutral.
 */
export const NonPunitiveFeedback = ({
  type,
  characterEmoji = "🦦",
  characterName = "Echo",
  visible = true,
  onDismiss,
}: NonPunitiveFeedbackProps) => {
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);

  const config = FEEDBACK_CONFIG[type];

  useEffect(() => {
    if (visible) {
      const randomMsg = config.messages[Math.floor(Math.random() * config.messages.length)];
      setMessage(randomMsg);
      setShow(true);

      // Auto-dismiss after 4 seconds
      const timer = setTimeout(() => {
        setShow(false);
        onDismiss?.();
      }, 4000);

      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, type]);

  if (!show) return null;

  return (
    <div className="animate-fade-in">
      <Card className={`rounded-kids border ${config.bgClass} overflow-hidden`}>
        <CardContent className="p-4 flex items-center gap-4">
          {/* Character reaction */}
          <div className="text-4xl shrink-0 animate-bounce">{characterEmoji}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {config.icon}
              <span className="text-sm font-medium text-foreground">{characterName} says:</span>
            </div>
            <p className="text-sm text-foreground/90">{message}</p>
          </div>

          <span className="text-3xl shrink-0">{config.emoji}</span>
        </CardContent>
      </Card>
    </div>
  );
};

/**
 * Helper to get the appropriate feedback type based on practice results.
 * IMPORTANT: There is intentionally NO "negative" or "failure" type.
 */
export const getFeedbackType = (fluencyScore: number | null): FeedbackType => {
  if (fluencyScore === null) return "attempt";
  if (fluencyScore >= 80) return "fluent";
  if (fluencyScore >= 50) return "attempt";
  // Even low scores get encouraging "disfluency" feedback, NEVER negative
  return "disfluency";
};
