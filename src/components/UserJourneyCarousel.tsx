import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Mic, Brain, BarChart3, Gamepad2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const steps = [
  {
    id: 1,
    emoji: "🎤",
    icon: Mic,
    title: "Child Speaks Naturally",
    description: "The Stammerly pendant captures speech throughout the day — during homework, play, and family conversations. No need to sit at a screen.",
    visual: "bg-gradient-to-br from-accent-orange/20 to-gold/10",
  },
  {
    id: 2,
    emoji: "🧠",
    icon: Brain,
    title: "AI Logs Disfluencies",
    description: "On-device processing identifies and categorises each disfluency event — blocks, prolongations, and repetitions — with millisecond precision.",
    visual: "bg-gradient-to-br from-primary/20 to-accent-sky/10",
  },
  {
    id: 3,
    emoji: "📊",
    icon: BarChart3,
    title: "Therapist Reviews Dashboard",
    description: "Clinical-grade analytics appear in the Therapist Hub — trend charts, phoneme triggers, SOAP notes — all ready for the next session.",
    visual: "bg-gradient-to-br from-success/20 to-primary/10",
  },
  {
    id: 4,
    emoji: "🎮",
    icon: Gamepad2,
    title: "Child Plays Tailored Games",
    description: "The AI generates personalised practice quests targeting the child's specific trigger words, delivered as fun games with variable rewards.",
    visual: "bg-gradient-to-br from-accent-orange/20 to-success/10",
  },
];

const UserJourneyCarousel = () => {
  const [current, setCurrent] = useState(0);

  const prev = () => setCurrent((c) => (c - 1 + steps.length) % steps.length);
  const next = () => setCurrent((c) => (c + 1) % steps.length);

  const step = steps[current];
  const StepIcon = step.icon;

  return (
    <div className="w-full">
      <div className="relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.3 }}
          >
            <Card variant="glass" className="overflow-hidden">
              <CardContent className="p-0">
                <div className={`${step.visual} p-8 md:p-12 flex flex-col md:flex-row items-center gap-6`}>
                  <div className="w-20 h-20 rounded-2xl bg-card/80 backdrop-blur-sm flex items-center justify-center shadow-lg shrink-0">
                    <span className="text-4xl">{step.emoji}</span>
                  </div>
                  <div className="text-center md:text-left flex-1">
                    <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Step {step.id} of {steps.length}</span>
                      <StepIcon className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <h3 className="font-display text-xl md:text-2xl font-bold text-foreground mb-2">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        {/* Nav buttons */}
        <Button
          variant="ghost"
          size="icon"
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm shadow"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-card/80 backdrop-blur-sm shadow"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Dots */}
      <div className="flex justify-center gap-2 mt-4">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-2.5 h-2.5 rounded-full transition-all ${i === current ? "bg-primary w-6" : "bg-muted-foreground/30"}`}
          />
        ))}
      </div>
    </div>
  );
};

export default UserJourneyCarousel;
