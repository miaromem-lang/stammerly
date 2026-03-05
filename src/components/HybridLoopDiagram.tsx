import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Brain, Stethoscope, Gamepad2, ChevronRight } from "lucide-react";

interface LoopStep {
  id: number;
  icon: typeof Mic;
  label: string;
  title: string;
  description: string;
  color: string;
  bgClass: string;
  ringClass: string;
}

const steps: LoopStep[] = [
  {
    id: 0,
    icon: Mic,
    label: "Capture",
    title: "Stammerly Pendant",
    description:
      "A lightweight, child-friendly device worn throughout the day. It captures natural speech in real conversations — at home, at school, and at play — without changing how your child communicates.",
    color: "hsl(var(--accent-orange))",
    bgClass: "bg-accent-orange/15",
    ringClass: "ring-accent-orange/40",
  },
  {
    id: 1,
    icon: Brain,
    label: "Analyse",
    title: "AI Speech Engine",
    description:
      "Our Hybrid Intelligence engine analyses word-level timing, phoneme triggers, pause architecture, and disfluency patterns — building a clinical-grade picture of fluency that improves with every session.",
    color: "hsl(var(--primary))",
    bgClass: "bg-primary/15",
    ringClass: "ring-primary/40",
  },
  {
    id: 2,
    icon: Stethoscope,
    label: "Verify",
    title: "Therapist Review",
    description:
      "Clinicians audit flagged events with micro-level audio playback, annotate AI assessments, and shape recommendations. The AI suggests — humans decide. That's Hybrid Intelligence.",
    color: "hsl(var(--accent-sky))",
    bgClass: "bg-accent-sky/15",
    ringClass: "ring-accent-sky/40",
  },
  {
    id: 3,
    icon: Gamepad2,
    label: "Practise",
    title: "Personalised Quests",
    description:
      "Therapist-approved exercises transform into fun quests tailored to your child's specific phoneme triggers and difficulty areas — making practice feel like play, not homework.",
    color: "hsl(var(--success))",
    bgClass: "bg-success/15",
    ringClass: "ring-success/40",
  },
];

export default function HybridLoopDiagram() {
  const [activeStep, setActiveStep] = useState(0);
  const active = steps[activeStep];

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      {/* Subtle background glow following active color */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          key={activeStep}
          className="absolute top-1/2 left-1/2 w-[500px] h-[500px] rounded-full blur-[120px] opacity-20 -translate-x-1/2 -translate-y-1/2"
          style={{ backgroundColor: active.color }}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.15 }}
          transition={{ duration: 0.8 }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section header */}
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 bg-primary/10 text-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            The Hybrid Intelligence Loop
          </span>
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-3">
            How Stammerly works
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            A continuous cycle that blends AI precision with human clinical expertise.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left: circular loop visualisation */}
          <motion.div
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="relative w-72 h-72 md:w-80 md:h-80">
              {/* Orbit ring */}
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-muted-foreground/20" />

              {/* Animated orbit particle */}
              <motion.div
                className="absolute w-3 h-3 rounded-full"
                style={{ backgroundColor: active.color }}
                animate={{
                  rotate: [0, 360],
                }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                // Position on the orbit ring
                initial={false}
              >
                <motion.div
                  className="absolute -inset-1 rounded-full opacity-50"
                  style={{ backgroundColor: active.color }}
                  animate={{ scale: [1, 1.8, 1], opacity: [0.5, 0, 0.5] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>

              {/* Flow arrows between nodes */}
              {steps.map((_, i) => {
                const angle1 = (i * 90 - 90) * (Math.PI / 180);
                const angle2 = ((i + 1) * 90 - 90) * (Math.PI / 180);
                const r = 130;
                const midAngle = (angle1 + angle2) / 2;
                const mx = 50 + (Math.cos(midAngle) * (r + 8)) / (r * 2) * 100;
                const my = 50 + (Math.sin(midAngle) * (r + 8)) / (r * 2) * 100;
                const arrowRotation = ((i * 90 - 90) + 45);

                return (
                  <motion.div
                    key={`arrow-${i}`}
                    className="absolute text-muted-foreground/30"
                    style={{
                      left: `${mx}%`,
                      top: `${my}%`,
                      transform: `translate(-50%, -50%) rotate(${arrowRotation}deg)`,
                    }}
                    animate={{
                      opacity: activeStep === i ? 0.8 : 0.25,
                      scale: activeStep === i ? 1.2 : 1,
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronRight className="w-4 h-4" style={{ color: activeStep === i ? active.color : undefined }} />
                  </motion.div>
                );
              })}

              {/* Step nodes positioned at cardinal points */}
              {steps.map((step, i) => {
                const angle = (i * 90 - 90) * (Math.PI / 180);
                const radius = 42; // % from centre
                const x = 50 + Math.cos(angle) * radius;
                const y = 50 + Math.sin(angle) * radius;

                return (
                  <motion.button
                    key={step.id}
                    className={`absolute flex flex-col items-center gap-1.5 -translate-x-1/2 -translate-y-1/2 cursor-pointer group focus:outline-none`}
                    style={{ left: `${x}%`, top: `${y}%` }}
                    onClick={() => setActiveStep(i)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <motion.div
                      className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shadow-lg ring-2 transition-all duration-300 ${step.bgClass} ${
                        activeStep === i ? step.ringClass : "ring-transparent"
                      }`}
                      animate={{
                        scale: activeStep === i ? 1.15 : 1,
                        boxShadow: activeStep === i
                          ? `0 0 24px ${step.color}40`
                          : "0 4px 12px rgba(0,0,0,0.08)",
                      }}
                      transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    >
                      <step.icon
                        className="w-6 h-6 md:w-7 md:h-7 transition-colors duration-300"
                        style={{ color: activeStep === i ? step.color : "hsl(var(--muted-foreground))" }}
                      />
                    </motion.div>
                    <span
                      className={`text-xs font-semibold transition-colors duration-300 ${
                        activeStep === i ? "text-foreground" : "text-muted-foreground"
                      }`}
                    >
                      {step.label}
                    </span>
                  </motion.button>
                );
              })}

              {/* Centre label */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={activeStep}
                    className="text-xs font-bold uppercase tracking-widest text-muted-foreground/60"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.25 }}
                  >
                    Step {activeStep + 1} of 4
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>
          </motion.div>

          {/* Right: detail panel */}
          <div className="flex flex-col">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center ${active.bgClass}`}
                  >
                    <active.icon className="w-5 h-5" style={{ color: active.color }} />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-foreground">
                    {active.title}
                  </h3>
                </div>
                <p className="text-muted-foreground text-base leading-relaxed max-w-md">
                  {active.description}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* Step pills */}
            <div className="flex gap-2 mt-8">
              {steps.map((step, i) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(i)}
                  className="flex items-center gap-1.5 focus:outline-none"
                >
                  <motion.div
                    className="h-1.5 rounded-full"
                    animate={{
                      width: activeStep === i ? 32 : 12,
                      backgroundColor: activeStep === i ? step.color : "hsl(var(--muted))",
                    }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  />
                </button>
              ))}
            </div>

            {/* Auto-advance hint */}
            <p className="text-xs text-muted-foreground mt-4">
              Click each node to explore the full loop.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
