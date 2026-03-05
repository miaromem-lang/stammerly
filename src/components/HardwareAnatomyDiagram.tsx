import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mic, Shield, Cpu, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface PendantPart {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  position: { top: string; left: string };
  badgeColor: string;
}

const parts: PendantPart[] = [
  {
    id: "mic",
    label: "Smart Microphone",
    description: "Dual MEMS microphone array with ambient noise cancellation. Captures speech at clinical-grade fidelity while filtering background noise.",
    icon: <Mic className="w-4 h-4" />,
    position: { top: "18%", left: "55%" },
    badgeColor: "bg-primary/10 text-primary border-primary/20",
  },
  {
    id: "clasp",
    label: "Safety Breakaway Clasp",
    description: "Magnetic breakaway mechanism releases under 2kg of force — exceeding EN 14682 child safety standards for cords and drawstrings.",
    icon: <AlertTriangle className="w-4 h-4" />,
    position: { top: "5%", left: "40%" },
    badgeColor: "bg-destructive/10 text-destructive border-destructive/20",
  },
  {
    id: "chip",
    label: "Local Processing Chip",
    description: "ARM Cortex-M33 with TensorFlow Lite Micro. All disfluency detection runs on-device — no raw audio ever leaves the pendant.",
    icon: <Cpu className="w-4 h-4" />,
    position: { top: "50%", left: "50%" },
    badgeColor: "bg-success/10 text-success border-success/20",
  },
  {
    id: "privacy",
    label: "Privacy LED Indicator",
    description: "Always-on green LED confirms when the microphone is active. Physical mute switch allows the child to disable recording at any time.",
    icon: <Shield className="w-4 h-4" />,
    position: { top: "35%", left: "30%" },
    badgeColor: "bg-gold/10 text-gold border-gold/20",
  },
];

const HardwareAnatomyDiagram = () => {
  const [activePart, setActivePart] = useState<PendantPart | null>(null);

  return (
    <div className="w-full">
      <div className="grid md:grid-cols-2 gap-6 items-center">
        {/* Pendant visual */}
        <div className="relative mx-auto w-full max-w-[300px] aspect-[3/4]">
          {/* Pendant body */}
          <div className="absolute inset-[10%] rounded-[40px] bg-gradient-to-b from-foreground/90 to-foreground/70 shadow-2xl">
            {/* Stammerly logo circle */}
            <div className="absolute top-[30%] left-1/2 -translate-x-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center">
              <span className="text-primary-foreground font-display font-bold text-xl">S</span>
            </div>
            {/* Privacy LED */}
            <div className="absolute top-[60%] left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-success shadow-[0_0_8px] shadow-success animate-pulse" />
          </div>
          {/* Lanyard */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-[12%] bg-muted-foreground/40 rounded-full" />
          {/* Clasp dot */}
          <div className="absolute top-[10%] left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-muted-foreground/60" />

          {/* Hotspots */}
          {parts.map((part) => (
            <button
              key={part.id}
              onClick={() => setActivePart(activePart?.id === part.id ? null : part)}
              className={`absolute w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all z-10 ${
                activePart?.id === part.id
                  ? "bg-primary border-primary scale-125 shadow-lg"
                  : "bg-card/90 border-primary/50 hover:scale-110 hover:border-primary"
              }`}
              style={{ top: part.position.top, left: part.position.left }}
              title={part.label}
            >
              <span className={`text-xs font-bold ${activePart?.id === part.id ? "text-primary-foreground" : "text-primary"}`}>
                {part.id === "mic" ? "1" : part.id === "clasp" ? "2" : part.id === "chip" ? "3" : "4"}
              </span>
            </button>
          ))}
        </div>

        {/* Part details */}
        <div className="space-y-3">
          {parts.map((part) => (
            <Card
              key={part.id}
              variant={activePart?.id === part.id ? "elevated" : "default"}
              className={`cursor-pointer transition-all ${activePart?.id === part.id ? "ring-2 ring-primary/30" : "opacity-70 hover:opacity-100"}`}
              onClick={() => setActivePart(activePart?.id === part.id ? null : part)}
            >
              <CardContent className="p-4 flex items-start gap-3">
                <Badge variant="outline" className={`${part.badgeColor} shrink-0 mt-0.5`}>
                  {part.icon}
                </Badge>
                <div>
                  <h4 className="font-semibold text-sm text-foreground">{part.label}</h4>
                  {activePart?.id === part.id && (
                    <p className="text-xs text-muted-foreground mt-1">{part.description}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HardwareAnatomyDiagram;
