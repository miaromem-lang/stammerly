import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Target, Lock, RefreshCw } from "lucide-react";
import { useState } from "react";

interface IepGoal {
  id: string;
  area: string;
  goal: string;
  target: string;
  progress: number;
  status: "on-track" | "behind" | "met";
  setBy: string;
  lastUpdated: string;
}

interface StudentIep {
  name: string;
  goals: IepGoal[];
}

const MOCK_IEP_DATA: Record<string, StudentIep> = {
  "1": {
    name: "Alex M.",
    goals: [
      {
        id: "g1",
        area: "Phoneme Focus",
        goal: "Produce /s/ clusters with easy onset in structured tasks",
        target: "80% accuracy across 3 consecutive sessions",
        progress: 72,
        status: "on-track",
        setBy: "Dr. Sarah Thompson (SLP)",
        lastUpdated: "28 Feb 2026",
      },
      {
        id: "g2",
        area: "Confidence",
        goal: "Voluntarily participate in small-group reading without prompting",
        target: "3 times per week",
        progress: 55,
        status: "behind",
        setBy: "Dr. Sarah Thompson (SLP)",
        lastUpdated: "28 Feb 2026",
      },
      {
        id: "g3",
        area: "Technique",
        goal: "Use light contacts on initial /b/ sounds during conversation",
        target: "70% success rate in Free Talk sessions",
        progress: 88,
        status: "met",
        setBy: "Dr. Sarah Thompson (SLP)",
        lastUpdated: "03 Mar 2026",
      },
    ],
  },
  "2": {
    name: "Jordan S.",
    goals: [
      {
        id: "g4",
        area: "Anxiety Management",
        goal: "Complete mood check-in before and after each practice session",
        target: "Daily for 4 consecutive weeks",
        progress: 30,
        status: "behind",
        setBy: "Dr. Sarah Thompson (SLP)",
        lastUpdated: "01 Mar 2026",
      },
      {
        id: "g5",
        area: "Phoneme Focus",
        goal: "Reduce block duration on /b/ and /d/ initial sounds",
        target: "Average block <500ms",
        progress: 45,
        status: "behind",
        setBy: "Dr. Sarah Thompson (SLP)",
        lastUpdated: "01 Mar 2026",
      },
    ],
  },
  "3": {
    name: "Sam T.",
    goals: [
      {
        id: "g6",
        area: "Fluency",
        goal: "Maintain %SS below 4% during story reading exercises",
        target: "Consistent across 5 sessions",
        progress: 60,
        status: "on-track",
        setBy: "Dr. Sarah Thompson (SLP)",
        lastUpdated: "04 Mar 2026",
      },
    ],
  },
};

const statusConfig = {
  "on-track": { badge: "bg-success/20 text-success", label: "On Track" },
  behind: { badge: "bg-gold/20 text-gold", label: "Behind" },
  met: { badge: "bg-primary/20 text-primary", label: "Met ✓" },
};

export const IepGoalsSync = () => {
  const [selectedStudent, setSelectedStudent] = useState("1");
  const student = MOCK_IEP_DATA[selectedStudent];

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <Target className="w-4 h-4 text-primary" />
            IEP Goals
            <Badge className="bg-muted text-muted-foreground text-[9px] border-0 gap-1">
              <Lock className="w-2.5 h-2.5" />
              Read-Only
            </Badge>
          </CardTitle>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[120px] h-7 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(MOCK_IEP_DATA).map(([id, data]) => (
                <SelectItem key={id} value={id}>{data.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          Synced from Therapist Hub • {student.goals[0]?.lastUpdated}
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {student.goals.map((goal) => {
          const status = statusConfig[goal.status];
          return (
            <div
              key={goal.id}
              className="p-3 rounded-lg border border-border bg-secondary/20"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-medium text-primary uppercase tracking-wide">
                  {goal.area}
                </span>
                <Badge className={`${status.badge} text-[9px] border-0`}>
                  {status.label}
                </Badge>
              </div>
              <p className="text-xs font-medium text-foreground mb-1 leading-relaxed">
                {goal.goal}
              </p>
              <p className="text-[10px] text-muted-foreground mb-2">
                Target: {goal.target}
              </p>
              <div className="flex items-center gap-2">
                <Progress value={goal.progress} className="h-1.5 flex-1" />
                <span className="text-[10px] font-medium text-muted-foreground w-8 text-right">
                  {goal.progress}%
                </span>
              </div>
              <p className="text-[9px] text-muted-foreground mt-1.5">
                Set by {goal.setBy}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
