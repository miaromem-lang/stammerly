import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Volume2, CheckCircle, Loader2, ArrowRight, RotateCcw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type CalibrationPhase = "intro" | "recording" | "analysing" | "complete";

const STORY_LINES = [
  "Once upon a time, there was a friendly dragon who loved to sing.",
  "Every morning, the dragon flew over the green hills and said hello to the birds.",
  "The birds would chirp back, and together they made the most wonderful sounds.",
];

interface CalibrationSequenceProps {
  onComplete?: (baseline: { volumeDb: number; noiseFloorDb: number }) => void;
}

export const CalibrationSequence = ({ onComplete }: CalibrationSequenceProps) => {
  const [phase, setPhase] = useState<CalibrationPhase>("intro");
  const [currentLine, setCurrentLine] = useState(0);
  const [volumeLevel, setVolumeLevel] = useState(0);
  const [progress, setProgress] = useState(0);
  const [baseline, setBaseline] = useState({ volumeDb: 0, noiseFloorDb: 0 });

  // Simulate volume meter during recording
  useEffect(() => {
    if (phase !== "recording") return;
    const iv = setInterval(() => {
      setVolumeLevel(Math.random() * 60 + 20);
    }, 150);
    return () => clearInterval(iv);
  }, [phase]);

  // Simulate progress during recording
  useEffect(() => {
    if (phase !== "recording") return;
    const duration = 5000; // 5s per line
    const start = Date.now();
    const iv = setInterval(() => {
      const elapsed = Date.now() - start;
      const lineProgress = Math.min(elapsed / duration, 1);
      setProgress(((currentLine + lineProgress) / STORY_LINES.length) * 100);

      if (elapsed >= duration) {
        clearInterval(iv);
        if (currentLine < STORY_LINES.length - 1) {
          setCurrentLine((p) => p + 1);
        } else {
          setPhase("analysing");
          setTimeout(() => {
            const result = { volumeDb: 62, noiseFloorDb: 28 };
            setBaseline(result);
            setPhase("complete");
            onComplete?.(result);
          }, 2500);
        }
      }
    }, 100);
    return () => clearInterval(iv);
  }, [phase, currentLine, onComplete]);

  const startRecording = () => {
    setPhase("recording");
    setCurrentLine(0);
    setProgress(0);
  };

  const restart = () => {
    setPhase("intro");
    setCurrentLine(0);
    setProgress(0);
    setVolumeLevel(0);
  };

  return (
    <Card className="glass-card-strong overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Mic className="w-5 h-5 text-primary" />
          Voice Calibration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div
              key="intro"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="bg-accent-orange/10 rounded-2xl p-6 text-center">
                <span className="text-4xl mb-3 block">🐉</span>
                <h3 className="font-display text-lg font-bold text-foreground mb-2">
                  Time for a quick story!
                </h3>
                <p className="text-sm text-muted-foreground">
                  Read the sentences out loud in your normal voice. This helps Stammerly learn your
                  speaking volume and the background noise in your room.
                </p>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  Takes about 30 seconds
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  No pressure — just read naturally
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
                  You can redo it anytime
                </li>
              </ul>
              <Button variant="hero" size="lg" className="w-full rounded-xl" onClick={startRecording}>
                <Mic className="w-5 h-5 mr-2" /> Start Reading
              </Button>
            </motion.div>
          )}

          {phase === "recording" && (
            <motion.div
              key="recording"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-5"
            >
              {/* Volume meter */}
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5 text-primary shrink-0" />
                <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-success to-accent-orange rounded-full"
                    animate={{ width: `${volumeLevel}%` }}
                    transition={{ duration: 0.1 }}
                  />
                </div>
                <span className="text-xs font-mono text-muted-foreground w-10 text-right">
                  {Math.round(volumeLevel)}%
                </span>
              </div>

              {/* Story line */}
              <div className="bg-card border border-border/50 rounded-xl p-6 min-h-[100px] flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentLine}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-lg font-medium text-foreground text-center leading-relaxed"
                  >
                    "{STORY_LINES[currentLine]}"
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="space-y-1">
                <Progress value={progress} className="h-2" />
                <p className="text-xs text-muted-foreground text-center">
                  Sentence {currentLine + 1} of {STORY_LINES.length}
                </p>
              </div>

              <div className="flex items-center justify-center gap-2 text-sm text-primary">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive" />
                </span>
                Listening…
              </div>
            </motion.div>
          )}

          {phase === "analysing" && (
            <motion.div
              key="analysing"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="flex flex-col items-center justify-center py-10 gap-4"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin" />
              <p className="text-muted-foreground font-medium">Analysing your voice…</p>
            </motion.div>
          )}

          {phase === "complete" && (
            <motion.div
              key="complete"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="bg-success/10 rounded-2xl p-6 text-center">
                <span className="text-4xl mb-2 block">🎉</span>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">
                  Calibration complete!
                </h3>
                <p className="text-sm text-muted-foreground">
                  We've set your child's voice baseline. The pendant is ready.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{baseline.volumeDb} dB</p>
                  <p className="text-xs text-muted-foreground">Voice Level</p>
                </div>
                <div className="bg-card border border-border/40 rounded-xl p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{baseline.noiseFloorDb} dB</p>
                  <p className="text-xs text-muted-foreground">Noise Floor</p>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={restart}>
                  <RotateCcw className="w-4 h-4 mr-2" /> Redo
                </Button>
                <Button variant="hero" className="flex-1 rounded-xl">
                  <ArrowRight className="w-4 h-4 mr-2" /> Continue Setup
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
