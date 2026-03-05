import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldAlert, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, HandHeart, Volume2, Clock, MessageCircleWarning } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StudentAccommodation {
  studentName: string;
  urgency: "high" | "moderate" | "low";
  accommodations: {
    label: string;
    action: string;
    reason: string; // teacher-safe explanation, no clinical detail
    icon: React.ReactNode;
    category: "communication" | "participation" | "environment" | "assessment";
  }[];
  moodIndicator: "anxious" | "low" | "neutral" | "positive";
  lastUpdated: string;
}

// These would come from a sanitised backend endpoint in production.
// Clinical details (WSS scores, phoneme triggers, %SS) are deliberately
// excluded — only actionable classroom guidance is surfaced.
const studentAccommodations: StudentAccommodation[] = [
  {
    studentName: "Alex M.",
    urgency: "high",
    moodIndicator: "anxious",
    lastUpdated: "Today, 9:15 AM",
    accommodations: [
      {
        label: "Avoid Cold-Calling",
        action: "Do not call on Alex to read aloud without prior warning today.",
        reason: "Self-reported high anxiety this morning. Unexpected speaking demands may increase disfluency.",
        icon: <MessageCircleWarning className="w-4 h-4" />,
        category: "participation",
      },
      {
        label: "Extended Wait Time",
        action: "Allow 8–10 seconds of wait time before expecting a verbal response.",
        reason: "Current speech patterns show benefit from longer processing time.",
        icon: <Clock className="w-4 h-4" />,
        category: "communication",
      },
      {
        label: "Pair Work Preferred",
        action: "Offer paired or small-group discussion instead of whole-class answers.",
        reason: "Anxiety levels are elevated; smaller audiences reduce speaking pressure.",
        icon: <HandHeart className="w-4 h-4" />,
        category: "environment",
      },
    ],
  },
  {
    studentName: "Jordan S.",
    urgency: "moderate",
    moodIndicator: "low",
    lastUpdated: "Today, 8:40 AM",
    accommodations: [
      {
        label: "Gentle Encouragement",
        action: "Provide positive reinforcement after any verbal contribution, regardless of fluency.",
        reason: "Mood is lower than usual. Building confidence supports technique carryover.",
        icon: <HandHeart className="w-4 h-4" />,
        category: "communication",
      },
      {
        label: "Reduce Timed Tasks",
        action: "Avoid timed reading or speaking assessments today if possible.",
        reason: "Time pressure may increase speaking difficulty on lower-mood days.",
        icon: <Clock className="w-4 h-4" />,
        category: "assessment",
      },
    ],
  },
  {
    studentName: "Sam T.",
    urgency: "low",
    moodIndicator: "positive",
    lastUpdated: "Today, 8:55 AM",
    accommodations: [
      {
        label: "Standard Accommodations",
        action: "Continue with usual 5-second wait time and voluntary participation.",
        reason: "Mood and fluency patterns are within comfortable range today.",
        icon: <CheckCircle className="w-4 h-4" />,
        category: "participation",
      },
    ],
  },
];

const urgencyConfig = {
  high: { color: "bg-destructive/10 text-destructive border-destructive/20", badge: "destructive" as const, icon: <AlertTriangle className="w-4 h-4" /> },
  moderate: { color: "bg-gold/10 text-gold border-gold/20", badge: "outline" as const, icon: <Info className="w-4 h-4" /> },
  low: { color: "bg-success/10 text-success border-success/20", badge: "outline" as const, icon: <CheckCircle className="w-4 h-4" /> },
};

const moodLabels = {
  anxious: { emoji: "😰", label: "Anxious" },
  low: { emoji: "😔", label: "Low mood" },
  neutral: { emoji: "😐", label: "Neutral" },
  positive: { emoji: "😊", label: "Positive" },
};

const categoryLabels: Record<string, string> = {
  communication: "Communication",
  participation: "Participation",
  environment: "Environment",
  assessment: "Assessment",
};

export const ClassroomAccommodations = () => {
  const [expandedStudent, setExpandedStudent] = useState<string | null>(
    studentAccommodations.find(s => s.urgency === "high")?.studentName ?? null
  );

  const toggleStudent = (name: string) => {
    setExpandedStudent(prev => prev === name ? null : name);
  };

  const highUrgencyCount = studentAccommodations.filter(s => s.urgency === "high").length;

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ShieldAlert className="w-5 h-5 text-accent-orange" />
            Classroom Accommodations
          </CardTitle>
          {highUrgencyCount > 0 && (
            <Badge variant="destructive" className="text-xs animate-pulse">
              {highUrgencyCount} urgent
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          Actionable guidance based on each student's current wellbeing — no clinical data exposed
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        <TooltipProvider>
          {studentAccommodations.map((student) => {
            const config = urgencyConfig[student.urgency];
            const mood = moodLabels[student.moodIndicator];
            const isExpanded = expandedStudent === student.studentName;

            return (
              <div
                key={student.studentName}
                className={`rounded-lg border transition-all ${config.color}`}
              >
                {/* Student header row */}
                <button
                  onClick={() => toggleStudent(student.studentName)}
                  className="w-full flex items-center justify-between p-3 text-left"
                  aria-expanded={isExpanded}
                >
                  <div className="flex items-center gap-3">
                    {config.icon}
                    <div>
                      <span className="font-semibold text-sm text-foreground">{student.studentName}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs">{mood.emoji} {mood.label}</span>
                        <span className="text-[10px] text-muted-foreground">• {student.lastUpdated}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={config.badge} className="text-[10px] capitalize">
                      {student.urgency}
                    </Badge>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-muted-foreground" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-muted-foreground" />
                    )}
                  </div>
                </button>

                {/* Expanded accommodations */}
                {isExpanded && (
                  <div className="px-3 pb-3 space-y-2">
                    {student.accommodations.map((acc, i) => (
                      <div
                        key={i}
                        className="p-3 bg-card/80 rounded-lg border border-border/50"
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5 shrink-0 text-foreground">{acc.icon}</div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-semibold text-foreground">{acc.label}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-secondary text-muted-foreground">
                                {categoryLabels[acc.category]}
                              </span>
                            </div>
                            <p className="text-sm text-foreground mb-1">{acc.action}</p>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button className="text-[11px] text-muted-foreground underline decoration-dotted underline-offset-2 hover:text-foreground transition-colors">
                                  Why this recommendation?
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" className="max-w-xs bg-card text-foreground border-border p-3">
                                <p className="text-xs">{acc.reason}</p>
                                <p className="text-[10px] text-muted-foreground mt-1.5 pt-1.5 border-t border-border">
                                  Source: Stammerly wellbeing data • Clinical details are only visible to the therapist
                                </p>
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </TooltipProvider>

        {/* Privacy footer */}
        <div className="flex items-start gap-2 pt-2 border-t border-border">
          <Volume2 className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
          <p className="text-[10px] text-muted-foreground leading-relaxed">
            Recommendations are generated from mood check-ins and general fluency trends. 
            Detailed clinical metrics (severity scores, phoneme triggers, medical notes) are 
            <strong className="text-foreground"> not shared</strong> with educators per data protection policy.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
