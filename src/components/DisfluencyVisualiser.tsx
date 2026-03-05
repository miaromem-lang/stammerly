import { useState, useRef, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Volume2 } from "lucide-react";

interface DisfluencyEvent {
  startPercent: number;
  endPercent: number;
  type: string;
  label: string;
  color: string;
  description: string;
}

interface AudioSample {
  id: string;
  title: string;
  typology: string;
  description: string;
  durationMs: number;
  events: DisfluencyEvent[];
  waveform: number[];
}

// Generate synthetic waveform data
const generateWaveform = (length: number, seed: number): number[] =>
  Array.from({ length }, (_, i) => {
    const base = Math.sin(i * 0.15 + seed) * 0.3 + 0.5;
    const noise = Math.sin(i * 0.7 + seed * 3) * 0.15;
    return Math.max(0.05, Math.min(1, base + noise));
  });

const samples: AudioSample[] = [
  {
    id: "block",
    title: "Silent Block",
    typology: "Block",
    description: "A tense pause where airflow stops completely before the target sound, common on plosive consonants.",
    durationMs: 4200,
    events: [
      { startPercent: 22, endPercent: 38, type: "block", label: "Silent Block (620ms)", color: "hsl(var(--destructive))", description: "Laryngeal tension on /b/ in 'birthday'" },
      { startPercent: 65, endPercent: 72, type: "block", label: "Block (280ms)", color: "hsl(var(--destructive))", description: "Glottal block on /k/ in 'cake'" },
    ],
    waveform: generateWaveform(120, 1),
  },
  {
    id: "prolongation",
    title: "Sound Prolongation",
    typology: "Prolongation",
    description: "An audible stretching of a sound, often on fricatives and nasals, extending beyond natural duration.",
    durationMs: 3800,
    events: [
      { startPercent: 15, endPercent: 35, type: "prolongation", label: "Prolongation (760ms)", color: "hsl(var(--gold))", description: "Extended /s/ in 'ssssschool'" },
      { startPercent: 58, endPercent: 68, type: "prolongation", label: "Prolongation (380ms)", color: "hsl(var(--gold))", description: "Extended /m/ in 'mmmorning'" },
    ],
    waveform: generateWaveform(120, 2),
  },
  {
    id: "repetition",
    title: "Part-Word Repetition",
    typology: "Repetition",
    description: "Involuntary repetition of a syllable or sound unit, typically at the beginning of a word.",
    durationMs: 4500,
    events: [
      { startPercent: 10, endPercent: 28, type: "repetition", label: "Repetition ×3", color: "hsl(var(--accent-sky))", description: "'b-b-b-but' — sound-level repetition" },
      { startPercent: 50, endPercent: 62, type: "repetition", label: "Repetition ×2", color: "hsl(var(--accent-sky))", description: "'go-going' — syllable repetition" },
    ],
    waveform: generateWaveform(120, 3),
  },
];

const DisfluencyVisualiser = () => {
  const [activeSample, setActiveSample] = useState<AudioSample>(samples[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [activeEvent, setActiveEvent] = useState<DisfluencyEvent | null>(null);
  const animRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  const animate = useCallback((timestamp: number) => {
    if (!startRef.current) startRef.current = timestamp;
    const elapsed = timestamp - startRef.current;
    const pct = Math.min(100, (elapsed / activeSample.durationMs) * 100);
    setProgress(pct);

    // Check active event
    const currentEvent = activeSample.events.find((e) => pct >= e.startPercent && pct <= e.endPercent);
    setActiveEvent(currentEvent || null);

    if (pct < 100) {
      animRef.current = requestAnimationFrame(animate);
    } else {
      setIsPlaying(false);
      startRef.current = 0;
    }
  }, [activeSample]);

  const togglePlay = () => {
    if (isPlaying) {
      if (animRef.current) cancelAnimationFrame(animRef.current);
      setIsPlaying(false);
    } else {
      if (progress >= 100) {
        setProgress(0);
        startRef.current = 0;
      }
      setIsPlaying(true);
    }
  };

  const reset = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setIsPlaying(false);
    setProgress(0);
    setActiveEvent(null);
    startRef.current = 0;
  };

  useEffect(() => {
    if (isPlaying) {
      startRef.current = 0;
      animRef.current = requestAnimationFrame(animate);
    }
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, animate]);

  const selectSample = (sample: AudioSample) => {
    reset();
    setActiveSample(sample);
  };

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent-orange/10 flex items-center justify-center">
            <Volume2 className="w-5 h-5 text-accent-orange" />
          </div>
          <div>
            <CardTitle className="text-xl">Disfluency Visualiser</CardTitle>
            <CardDescription>See how Stammerly's AI identifies and categorises stammering events in real-time</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Sample Tabs */}
        <div className="flex gap-2 flex-wrap">
          {samples.map((s) => (
            <Button
              key={s.id}
              variant={activeSample.id === s.id ? "default" : "outline"}
              size="sm"
              onClick={() => selectSample(s)}
              className="rounded-xl"
            >
              {s.typology}
            </Button>
          ))}
        </div>

        <p className="text-sm text-muted-foreground">{activeSample.description}</p>

        {/* Waveform Visualisation */}
        <div className="relative bg-foreground/5 rounded-xl p-4 overflow-hidden">
          {/* Event highlight regions */}
          {activeSample.events.map((event, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0 opacity-20 rounded"
              style={{
                left: `${event.startPercent}%`,
                width: `${event.endPercent - event.startPercent}%`,
                backgroundColor: event.color,
              }}
            />
          ))}

          {/* Waveform bars */}
          <div className="flex items-center gap-[1px] h-16 relative z-10">
            {activeSample.waveform.map((amp, i) => {
              const barPct = (i / activeSample.waveform.length) * 100;
              const isPast = barPct <= progress;
              const inEvent = activeSample.events.find((e) => barPct >= e.startPercent && barPct <= e.endPercent);
              return (
                <div
                  key={i}
                  className="flex-1 rounded-full transition-colors duration-100"
                  style={{
                    height: `${amp * 100}%`,
                    backgroundColor: isPast
                      ? inEvent ? inEvent.color : "hsl(var(--primary))"
                      : "hsl(var(--muted-foreground) / 0.2)",
                  }}
                />
              );
            })}
          </div>

          {/* Playhead */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-foreground/60 z-20 transition-none"
            style={{ left: `${progress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" onClick={togglePlay} className="rounded-full">
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={reset} className="rounded-full">
            <RotateCcw className="w-4 h-4" />
          </Button>
          <div className="flex-1 text-xs text-muted-foreground">
            {((progress / 100) * activeSample.durationMs / 1000).toFixed(1)}s / {(activeSample.durationMs / 1000).toFixed(1)}s
          </div>
          <Badge variant="outline" className="text-xs">Anonymised Sample</Badge>
        </div>

        {/* Active event callout */}
        <div className={`rounded-xl border p-3 transition-all duration-200 ${activeEvent ? "border-primary/30 bg-primary/5" : "border-border/30 bg-secondary/30"}`}>
          {activeEvent ? (
            <div className="flex items-start gap-3">
              <div className="w-3 h-3 rounded-full mt-1 shrink-0" style={{ backgroundColor: activeEvent.color }} />
              <div>
                <p className="font-semibold text-sm text-foreground">{activeEvent.label}</p>
                <p className="text-xs text-muted-foreground">{activeEvent.description}</p>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              {progress === 0 ? "Press play to see AI analysis in action" : "No disfluency detected at this point"}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default DisfluencyVisualiser;
