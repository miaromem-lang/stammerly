import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, ArrowUpDown, Flame, Brain, TrendingUp, Activity } from "lucide-react";

type SortKey = "none" | "anxiety" | "streak_lost" | "block_increase";

interface TriagePatient {
  id: number;
  name: string;
  age: number;
  nextSession: string;
  anxietyLevel: number; // 0-10
  streakDays: number;
  streakLost: boolean;
  blockFreqChange: number; // percentage change, positive = increase
  lastSessionDate: string;
  riskLevel: "low" | "medium" | "high" | "critical";
}

const MOCK_PATIENTS: TriagePatient[] = [
  { id: 1, name: "Alex M.", age: 8, nextSession: "Today, 2:00 PM", anxietyLevel: 3, streakDays: 12, streakLost: false, blockFreqChange: -15, lastSessionDate: "2026-03-04", riskLevel: "low" },
  { id: 2, name: "Jordan S.", age: 10, nextSession: "Tomorrow, 10:00 AM", anxietyLevel: 8, streakDays: 0, streakLost: true, blockFreqChange: 42, lastSessionDate: "2026-03-01", riskLevel: "critical" },
  { id: 3, name: "Sam T.", age: 7, nextSession: "Wed, 3:30 PM", anxietyLevel: 5, streakDays: 3, streakLost: false, blockFreqChange: 10, lastSessionDate: "2026-03-04", riskLevel: "medium" },
  { id: 4, name: "Lily K.", age: 9, nextSession: "Thu, 11:00 AM", anxietyLevel: 7, streakDays: 0, streakLost: true, blockFreqChange: 25, lastSessionDate: "2026-02-28", riskLevel: "high" },
  { id: 5, name: "Oscar P.", age: 6, nextSession: "Fri, 9:30 AM", anxietyLevel: 2, streakDays: 21, streakLost: false, blockFreqChange: -8, lastSessionDate: "2026-03-04", riskLevel: "low" },
];

const riskConfig = {
  critical: { bg: "bg-destructive/10 border-destructive/30", badge: "bg-destructive/20 text-destructive", label: "🔴 Urgent" },
  high: { bg: "bg-accent-orange/10 border-accent-orange/30", badge: "bg-accent-orange/20 text-accent-orange", label: "🟠 High" },
  medium: { bg: "bg-gold/10 border-gold/30", badge: "bg-gold/20 text-gold", label: "🟡 Monitor" },
  low: { bg: "bg-success/10 border-success/30", badge: "bg-success/20 text-success", label: "🟢 Stable" },
};

export const CaseloadTriage = () => {
  const [sortBy, setSortBy] = useState<SortKey>("none");

  const sortedPatients = useMemo(() => {
    const list = [...MOCK_PATIENTS];
    switch (sortBy) {
      case "anxiety":
        return list.sort((a, b) => b.anxietyLevel - a.anxietyLevel);
      case "streak_lost":
        return list.sort((a, b) => {
          if (a.streakLost && !b.streakLost) return -1;
          if (!a.streakLost && b.streakLost) return 1;
          return a.streakDays - b.streakDays;
        });
      case "block_increase":
        return list.sort((a, b) => b.blockFreqChange - a.blockFreqChange);
      default:
        // Default: sort by risk level
        const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return list.sort((a, b) => riskOrder[a.riskLevel] - riskOrder[b.riskLevel]);
    }
  }, [sortBy]);

  const flaggedCount = MOCK_PATIENTS.filter((p) => p.riskLevel === "critical" || p.riskLevel === "high").length;

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground text-base">
            <AlertTriangle className="w-4 h-4 text-accent-orange" />
            Caseload Triage
            {flaggedCount > 0 && (
              <Badge className="bg-destructive/20 text-destructive text-[10px] ml-1">
                {flaggedCount} flagged
              </Badge>
            )}
          </CardTitle>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortKey)}>
            <SelectTrigger className="w-[160px] h-8 text-xs">
              <ArrowUpDown className="w-3 h-3 mr-1" />
              <SelectValue placeholder="Sort by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Risk Level</SelectItem>
              <SelectItem value="anxiety">High Anxiety</SelectItem>
              <SelectItem value="streak_lost">Streak Lost</SelectItem>
              <SelectItem value="block_increase">Block Increase</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {sortedPatients.map((patient) => {
          const risk = riskConfig[patient.riskLevel];
          return (
            <div
              key={patient.id}
              className={`p-3 rounded-lg border transition-all cursor-pointer hover:shadow-sm ${risk.bg}`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm text-foreground">{patient.name}</span>
                  <Badge className={`${risk.badge} text-[9px] border-0`}>{risk.label}</Badge>
                </div>
                <span className="text-[10px] text-muted-foreground">{patient.nextSession}</span>
              </div>
              <div className="flex items-center gap-4 text-[11px]">
                {/* Anxiety */}
                <div className="flex items-center gap-1" title="Reported anxiety level">
                  <Brain className={`w-3 h-3 ${patient.anxietyLevel >= 7 ? "text-destructive" : "text-muted-foreground"}`} />
                  <span className={patient.anxietyLevel >= 7 ? "text-destructive font-medium" : "text-muted-foreground"}>
                    Anxiety: {patient.anxietyLevel}/10
                  </span>
                </div>
                {/* Streak */}
                <div className="flex items-center gap-1" title="Practice streak">
                  <Flame className={`w-3 h-3 ${patient.streakLost ? "text-destructive" : "text-success"}`} />
                  <span className={patient.streakLost ? "text-destructive font-medium" : "text-muted-foreground"}>
                    {patient.streakLost ? "Streak lost" : `${patient.streakDays}d streak`}
                  </span>
                </div>
                {/* Block Frequency */}
                <div className="flex items-center gap-1" title="Block frequency change">
                  <Activity className={`w-3 h-3 ${patient.blockFreqChange > 20 ? "text-destructive" : patient.blockFreqChange > 0 ? "text-gold" : "text-success"}`} />
                  <span className={patient.blockFreqChange > 20 ? "text-destructive font-medium" : patient.blockFreqChange > 0 ? "text-gold" : "text-success"}>
                    {patient.blockFreqChange > 0 ? "+" : ""}{patient.blockFreqChange}% blocks
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
