import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ShieldAlert, AlertTriangle, CheckCircle, Info, ChevronDown, ChevronUp, HandHeart, Clock, MessageCircleWarning, Volume2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface Accommodation {
  label: string;
  action: string;
  reason: string;
  icon: React.ReactNode;
  category: "communication" | "participation" | "environment" | "assessment";
}

interface StudentAccommodation {
  studentId: string;
  studentName: string;
  urgency: "high" | "moderate" | "low";
  accommodations: Accommodation[];
  moodIndicator: "anxious" | "low" | "neutral" | "positive";
  lastUpdated: string;
}

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

function deriveMoodIndicator(moodScore: number, anxietyLevel: number | null): "anxious" | "low" | "neutral" | "positive" {
  if (anxietyLevel !== null && anxietyLevel >= 6) return "anxious";
  if (moodScore <= 2) return "low";
  if (moodScore >= 4) return "positive";
  return "neutral";
}

function deriveAccommodations(
  moodScore: number,
  anxietyLevel: number | null,
  avgFluency: number | null,
  recentBlocks: number
): Accommodation[] {
  const accommodations: Accommodation[] = [];

  // High anxiety → avoid cold-calling
  if (anxietyLevel !== null && anxietyLevel >= 6) {
    accommodations.push({
      label: "Avoid Cold-Calling",
      action: "Do not call on this student to read aloud without prior warning today.",
      reason: "Self-reported high anxiety this morning. Unexpected speaking demands may increase disfluency.",
      icon: <MessageCircleWarning className="w-4 h-4" />,
      category: "participation",
    });
    accommodations.push({
      label: "Pair Work Preferred",
      action: "Offer paired or small-group discussion instead of whole-class answers.",
      reason: "Anxiety levels are elevated; smaller audiences reduce speaking pressure.",
      icon: <HandHeart className="w-4 h-4" />,
      category: "environment",
    });
  }

  // Low mood → encouragement
  if (moodScore <= 2) {
    accommodations.push({
      label: "Gentle Encouragement",
      action: "Provide positive reinforcement after any verbal contribution, regardless of fluency.",
      reason: "Mood is lower than usual. Building confidence supports technique carryover.",
      icon: <HandHeart className="w-4 h-4" />,
      category: "communication",
    });
  }

  // Recent blocks or low fluency → extended wait time
  if (recentBlocks > 3 || (avgFluency !== null && avgFluency < 50)) {
    accommodations.push({
      label: "Extended Wait Time",
      action: "Allow 8–10 seconds of wait time before expecting a verbal response.",
      reason: "Current speech patterns show benefit from longer processing time.",
      icon: <Clock className="w-4 h-4" />,
      category: "communication",
    });
  }

  // Moderate anxiety or low mood → reduce timed tasks
  if ((anxietyLevel !== null && anxietyLevel >= 4) || moodScore <= 2) {
    accommodations.push({
      label: "Reduce Timed Tasks",
      action: "Avoid timed reading or speaking assessments today if possible.",
      reason: "Time pressure may increase speaking difficulty when mood or anxiety is elevated.",
      icon: <Clock className="w-4 h-4" />,
      category: "assessment",
    });
  }

  // If nothing triggered, standard accommodations
  if (accommodations.length === 0) {
    accommodations.push({
      label: "Standard Accommodations",
      action: "Continue with usual 5-second wait time and voluntary participation.",
      reason: "Mood and fluency patterns are within comfortable range today.",
      icon: <CheckCircle className="w-4 h-4" />,
      category: "participation",
    });
  }

  return accommodations;
}

function deriveUrgency(moodScore: number, anxietyLevel: number | null): "high" | "moderate" | "low" {
  if (anxietyLevel !== null && anxietyLevel >= 6) return "high";
  if (moodScore <= 2 || (anxietyLevel !== null && anxietyLevel >= 4)) return "moderate";
  return "low";
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));

  if (diffHours < 1) return "Just now";
  if (diffHours < 24) return `${diffHours}h ago`;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

export const ClassroomAccommodations = () => {
  const [students, setStudents] = useState<StudentAccommodation[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedStudent, setExpandedStudent] = useState<string | null>(null);

  useEffect(() => {
    fetchAccommodations();
  }, []);

  const fetchAccommodations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      // Get teacher's assigned students
      const { data: assignments, error: assignErr } = await supabase
        .from("teacher_student_assignments")
        .select("student_user_id, notes")
        .eq("teacher_user_id", user.id);

      if (assignErr || !assignments || assignments.length === 0) {
        setLoading(false);
        return;
      }

      const studentIds = assignments.map(a => a.student_user_id);
      const today = new Date().toISOString().split("T")[0];
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

      // Fetch mood check-ins and recent sessions in parallel
      const [moodRes, sessionsRes] = await Promise.all([
        supabase
          .from("mood_checkins")
          .select("user_id, mood_score, anxiety_level, mood_emoji, checkin_date, created_at")
          .in("user_id", studentIds)
          .gte("checkin_date", threeDaysAgo.toISOString().split("T")[0])
          .order("checkin_date", { ascending: false }),
        supabase
          .from("practice_sessions")
          .select("user_id, fluency_score, blocks_count, session_date")
          .in("user_id", studentIds)
          .gte("session_date", threeDaysAgo.toISOString())
          .order("session_date", { ascending: false }),
      ]);

      const moods = moodRes.data ?? [];
      const sessions = sessionsRes.data ?? [];

      const result: StudentAccommodation[] = studentIds.map(sid => {
        const assignment = assignments.find(a => a.student_user_id === sid);
        const studentName = assignment?.notes || sid.substring(0, 8); // Use notes as display name, fallback to ID prefix

        // Latest mood for this student
        const latestMood = moods.find(m => m.user_id === sid);
        const moodScore = latestMood?.mood_score ?? 3;
        const anxietyLevel = latestMood?.anxiety_level ?? null;
        const lastUpdated = latestMood?.created_at ?? new Date().toISOString();

        // Recent session stats
        const studentSessions = sessions.filter(s => s.user_id === sid);
        const avgFluency = studentSessions.length > 0
          ? studentSessions.reduce((sum, s) => sum + (s.fluency_score ?? 0), 0) / studentSessions.length
          : null;
        const recentBlocks = studentSessions.reduce((sum, s) => sum + (s.blocks_count ?? 0), 0);

        const mood = deriveMoodIndicator(moodScore, anxietyLevel);
        const urgency = deriveUrgency(moodScore, anxietyLevel);
        const accommodations = deriveAccommodations(moodScore, anxietyLevel, avgFluency, recentBlocks);

        return {
          studentId: sid,
          studentName,
          urgency,
          accommodations,
          moodIndicator: mood,
          lastUpdated: formatTime(lastUpdated),
        };
      });

      // Sort by urgency (high first)
      const urgencyOrder = { high: 0, moderate: 1, low: 2 };
      result.sort((a, b) => urgencyOrder[a.urgency] - urgencyOrder[b.urgency]);

      setStudents(result);
      // Auto-expand first high-urgency student
      const firstHigh = result.find(s => s.urgency === "high");
      if (firstHigh) setExpandedStudent(firstHigh.studentId);
    } catch (err) {
      console.error("Failed to fetch accommodations:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleStudent = (id: string) => {
    setExpandedStudent(prev => prev === id ? null : id);
  };

  const highUrgencyCount = students.filter(s => s.urgency === "high").length;

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
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        ) : students.length === 0 ? (
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground">No students assigned yet.</p>
            <p className="text-xs text-muted-foreground mt-1">
              Students will appear here once assigned to your classroom.
            </p>
          </div>
        ) : (
          <TooltipProvider>
            {students.map((student) => {
              const config = urgencyConfig[student.urgency];
              const mood = moodLabels[student.moodIndicator];
              const isExpanded = expandedStudent === student.studentId;

              return (
                <div
                  key={student.studentId}
                  className={`rounded-lg border transition-all ${config.color}`}
                >
                  <button
                    onClick={() => toggleStudent(student.studentId)}
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
        )}

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
