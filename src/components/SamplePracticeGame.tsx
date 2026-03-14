import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Gamepad2, Star, Sparkles, RotateCcw, Volume2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Word {
  text: string;
  emoji: string;
  difficulty: "easy" | "medium";
}

const words: Word[] = [
  { text: "Sun", emoji: "☀️", difficulty: "easy" },
  { text: "Cat", emoji: "🐱", difficulty: "easy" },
  { text: "Ball", emoji: "⚽", difficulty: "easy" },
  { text: "Star", emoji: "⭐", difficulty: "easy" },
  { text: "Fish", emoji: "🐟", difficulty: "easy" },
  { text: "Moon", emoji: "🌙", difficulty: "medium" },
  { text: "Tree", emoji: "🌳", difficulty: "medium" },
  { text: "Book", emoji: "📖", difficulty: "medium" },
];

type GameState = "intro" | "playing" | "feedback" | "complete";

const encouragements = [
  "Brilliant! 🌟",
  "Amazing work! ⭐",
  "You're a star! ✨",
  "Wonderful! 🎉",
  "Keep going! 💪",
  "Superb! 🏆",
];

const SamplePracticeGame = () => {
  const [gameState, setGameState] = useState<GameState>("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [stars, setStars] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [feedback, setFeedback] = useState("");
  const [combo, setCombo] = useState(0);
  const [showReward, setShowReward] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalWords = 5;
  const currentWord = words[currentIndex % words.length];

  const startGame = () => {
    setGameState("playing");
    setCurrentIndex(0);
    setScore(0);
    setStars(0);
    setTimeLeft(30);
    setCombo(0);
    setShowReward(false);
  };

  // Timer
  useEffect(() => {
    if (gameState === "playing" && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    } else if (timeLeft === 0 && gameState === "playing") {
      setGameState("complete");
    }
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [gameState, timeLeft]);

  const handleSpeak = useCallback(() => {
    if (gameState !== "playing") return;

    const newCombo = combo + 1;
    setCombo(newCombo);

    // Variable reward: random bonus
    const basePoints = 10;
    const comboBonus = newCombo > 2 ? 5 : 0;
    const luckyBonus = Math.random() > 0.6 ? Math.floor(Math.random() * 15) + 5 : 0;
    const totalPoints = basePoints + comboBonus + luckyBonus;

    setScore((s) => s + totalPoints);
    setStars((s) => s + 1);

    // Show surprise reward occasionally
    if (luckyBonus > 10) {
      setShowReward(true);
      setTimeout(() => setShowReward(false), 1500);
    }

    const msg = encouragements[Math.floor(Math.random() * encouragements.length)];
    setFeedback(`${msg} +${totalPoints} pts`);
    setGameState("feedback");

    setTimeout(() => {
      if (currentIndex + 1 >= totalWords) {
        setGameState("complete");
      } else {
        setCurrentIndex((i) => i + 1);
        setGameState("playing");
        setFeedback("");
      }
    }, 1200);
  }, [gameState, combo, currentIndex]);

  const reset = () => {
    setGameState("intro");
    setFeedback("");
    setCombo(0);
  };

  return (
    <Card variant="glass" className="w-full overflow-hidden">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
            <Gamepad2 className="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <CardTitle className="text-xl">Try a Practice Game</CardTitle>
            <CardDescription>Experience the Kid Hub's positive reinforcement mechanics — no penalties, only progress</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {gameState === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-8 space-y-4"
            >
              <div className="text-6xl mb-4">🎤</div>
              <h3 className="font-display text-xl font-bold text-foreground">Say the Word!</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                A picture appears — tap "I Said It!" when you've spoken the word aloud. No wrong answers, just encouragement. Try for {totalWords} words in 30 seconds!
              </p>
              <Button variant="kids" size="kids" onClick={startGame}>
                <Sparkles className="w-5 h-5" /> Start Game
              </Button>
              <p className="text-xs text-muted-foreground">Demo mode — no microphone required</p>
            </motion.div>
          )}

          {(gameState === "playing" || gameState === "feedback") && (
            <motion.div
              key="playing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-5"
            >
              {/* HUD */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="w-4 h-4 text-gold" />
                  <span className="font-bold text-foreground">{stars}/{totalWords}</span>
                </div>
                <Badge variant="outline" className="font-mono">{timeLeft}s</Badge>
                <div className="flex items-center gap-1">
                  <span className="text-sm font-bold text-foreground">{score}</span>
                  <span className="text-xs text-muted-foreground">pts</span>
                </div>
              </div>

              <Progress value={(currentIndex / totalWords) * 100} className="h-2" />

              {/* Word Card */}
              <motion.div
                key={currentIndex}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-br from-accent-orange/10 to-primary/5 rounded-2xl p-8 text-center relative"
              >
                <div className="text-7xl mb-3">{currentWord.emoji}</div>
                <h2 className="font-display text-3xl font-bold text-foreground">{currentWord.text}</h2>

                {/* Surprise reward animation */}
                <AnimatePresence>
                  {showReward && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0, y: 0 }}
                      animate={{ scale: 1.2, opacity: 1, y: -30 }}
                      exit={{ opacity: 0, y: -60 }}
                      className="absolute top-2 right-4 text-3xl"
                    >
                      🎁
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Feedback */}
              {feedback && (
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-center font-bold text-success text-lg"
                >
                  {feedback}
                </motion.p>
              )}

              {/* Action */}
              <div className="flex justify-center">
                <Button
                  variant="kids"
                  size="kids"
                  onClick={handleSpeak}
                  disabled={gameState === "feedback"}
                  className="text-xl"
                >
                  <Volume2 className="w-5 h-5" /> I Said It!
                </Button>
              </div>

              {combo > 2 && (
                <p className="text-center text-xs text-accent-orange font-semibold">🔥 {combo}× Combo!</p>
              )}
            </motion.div>
          )}

          {gameState === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="text-6xl mb-2">🏆</div>
              <h3 className="font-display text-2xl font-bold text-foreground">Amazing Job!</h3>
              <div className="flex justify-center gap-6">
                <div className="text-center">
                  <Trophy className="w-6 h-6 text-gold mx-auto mb-1" />
                  <p className="font-bold text-xl text-foreground">{score}</p>
                  <p className="text-xs text-muted-foreground">Points</p>
                </div>
                <div className="text-center">
                  <Star className="w-6 h-6 text-gold mx-auto mb-1" />
                  <p className="font-bold text-xl text-foreground">{stars}</p>
                  <p className="text-xs text-muted-foreground">Stars</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground max-w-xs mx-auto">
                In the full Kid Hub, children earn gems, unlock avatars, and see animated celebrations — all designed around non-punitive positive reinforcement.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="kids" size="lg" onClick={startGame}>
                  <RotateCcw className="w-4 h-4" /> Play Again
                </Button>
                <Button variant="outline" size="lg" onClick={reset} className="rounded-xl">
                  Back
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

export default SamplePracticeGame;
