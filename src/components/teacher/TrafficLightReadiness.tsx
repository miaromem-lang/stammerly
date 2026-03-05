import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CircleDot, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

type ReadinessLevel = "green" | "amber" | "red";

interface StudentReadiness {
  id: number;
  name: string;
  level: ReadinessLevel;
  summary: string;
  tip: string;
}

const MOCK_READINESS: StudentReadiness[] = [
  {
    id: 1,
    name: "Alex M.",
    level: "green",
    summary: "Low anxiety, strong streak, fluency trending up",
    tip: "Safe to include in oral activities and cold-call.",
  },
  {
    id: 2,
    name: "Jordan S.",
    level: "red",
    summary: "High anxiety (8/10), streak lost, block frequency +42%",
    tip: "Avoid cold-calling today. Offer written alternatives or voluntary participation only.",
  },
  {
    id: 3,
    name: "Sam T.",
    level: "amber",
    summary: "Moderate anxiety, slight block increase",
    tip: "Pair with a supportive peer. Give extra wait time if called on.",
  },
];

const levelConfig: Record<ReadinessLevel, { bg: string; ring: string; dot: string; label: string; emoji: string }> = {
  green: {
    bg: "bg-success/10 border-success/30",
    ring: "ring-success/40",
    dot: "text-success",
    label: "Ready",
    emoji: "🟢",
  },
  amber: {
    bg: "bg-gold/10 border-gold/30",
    ring: "ring-gold/40",
    dot: "text-gold",
    label: "Caution",
    emoji: "🟡",
  },
  red: {
    bg: "bg-destructive/10 border-destructive/30",
    ring: "ring-destructive/40",
    dot: "text-destructive",
    label: "Avoid Cold-Call",
    emoji: "🔴",
  },
};

export const TrafficLightReadiness = () => {
  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <CircleDot className="w-4 h-4 text-success" />
          Morning Readiness
          <Badge className="bg-primary/10 text-primary text-[9px] border-0">Daily</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          AI-generated forecast — guides cold-call and read-aloud decisions
        </p>
      </CardHeader>
      <CardContent className="space-y-2">
        {MOCK_READINESS.map((student) => {
          const config = levelConfig[student.level];
          return (
            <div
              key={student.id}
              className={`p-3 rounded-lg border transition-all ${config.bg}`}
            >
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm">{config.emoji}</span>
                  <span className="font-medium text-sm text-foreground">{student.name}</span>
                  <Badge className={`text-[9px] border-0 ${
                    student.level === "green" ? "bg-success/20 text-success" :
                    student.level === "amber" ? "bg-gold/20 text-gold" :
                    "bg-destructive/20 text-destructive"
                  }`}>
                    {config.label}
                  </Badge>
                </div>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="w-3.5 h-3.5 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent side="left" className="max-w-[220px] text-xs">
                    {student.summary}
                  </TooltipContent>
                </Tooltip>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed pl-6">
                {student.tip}
              </p>
            </div>
          );
        })}
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Updated daily at 7:00 AM from overnight practice & mood data
        </p>
      </CardContent>
    </Card>
  );
};
