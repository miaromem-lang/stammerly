import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Minus, Brain, UserCircle, Target, BarChart3, Loader2, Award, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface WeeklyStats {
  weekStart: string;
  weekEnd: string;
  therapistQuests: {
    total: number;
    completed: number;
    avgFluency: number;
    avgAccuracy: number;
  };
  aiQuests: {
    total: number;
    completed: number;
    avgFluency: number;
    avgAccuracy: number;
  };
  totalSessions: number;
  overallFluency: number;
}

interface CompletedQuest {
  id: string;
  quest_title: string;
  chosen_recommendation: string | null;
  outcome_fluency_score: number | null;
  outcome_accuracy_score: number | null;
  completed_at: string | null;
  ai_agrees: boolean | null;
}

export const WeeklyProgressReport = () => {
  const [stats, setStats] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>("0");
  const [completedQuests, setCompletedQuests] = useState<CompletedQuest[]>([]);

  useEffect(() => {
    fetchWeeklyStats();
    fetchCompletedQuests();
  }, []);

  const fetchCompletedQuests = async () => {
    const { data } = await supabase
      .from("therapist_assigned_quests")
      .select("id, quest_title, chosen_recommendation, outcome_fluency_score, outcome_accuracy_score, completed_at, ai_agrees")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false })
      .limit(50);

    if (data) {
      setCompletedQuests(data);
    }
  };

  const fetchWeeklyStats = async () => {
    try {
      // Get last 4 weeks of data
      const weeks: WeeklyStats[] = [];
      
      for (let i = 0; i < 4; i++) {
        const weekEnd = new Date();
        weekEnd.setDate(weekEnd.getDate() - (i * 7));
        weekEnd.setHours(23, 59, 59, 999);
        
        const weekStart = new Date(weekEnd);
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        // Fetch quests completed this week
        const { data: quests } = await supabase
          .from("therapist_assigned_quests")
          .select("*")
          .gte("completed_at", weekStart.toISOString())
          .lte("completed_at", weekEnd.toISOString());

        // Fetch practice sessions this week
        const { data: sessions } = await supabase
          .from("practice_sessions")
          .select("fluency_score, accuracy_score")
          .gte("session_date", weekStart.toISOString())
          .lte("session_date", weekEnd.toISOString());

        const therapistQuests = quests?.filter(q => q.chosen_recommendation === "therapist") || [];
        const aiQuests = quests?.filter(q => q.chosen_recommendation === "ai") || [];

        const avgFluencyTherapist = therapistQuests.length > 0
          ? therapistQuests.reduce((sum, q) => sum + (q.outcome_fluency_score || 0), 0) / therapistQuests.length
          : 0;

        const avgAccuracyTherapist = therapistQuests.length > 0
          ? therapistQuests.reduce((sum, q) => sum + (q.outcome_accuracy_score || 0), 0) / therapistQuests.length
          : 0;

        const avgFluencyAI = aiQuests.length > 0
          ? aiQuests.reduce((sum, q) => sum + (q.outcome_fluency_score || 0), 0) / aiQuests.length
          : 0;

        const avgAccuracyAI = aiQuests.length > 0
          ? aiQuests.reduce((sum, q) => sum + (q.outcome_accuracy_score || 0), 0) / aiQuests.length
          : 0;

        const overallFluency = sessions?.length
          ? sessions.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / sessions.length
          : 0;

        weeks.push({
          weekStart: weekStart.toISOString().split('T')[0],
          weekEnd: weekEnd.toISOString().split('T')[0],
          therapistQuests: {
            total: therapistQuests.length,
            completed: therapistQuests.filter(q => q.outcome_fluency_score !== null).length,
            avgFluency: Math.round(avgFluencyTherapist),
            avgAccuracy: Math.round(avgAccuracyTherapist),
          },
          aiQuests: {
            total: aiQuests.length,
            completed: aiQuests.filter(q => q.outcome_fluency_score !== null).length,
            avgFluency: Math.round(avgFluencyAI),
            avgAccuracy: Math.round(avgAccuracyAI),
          },
          totalSessions: sessions?.length || 0,
          overallFluency: Math.round(overallFluency),
        });
      }

      setStats(weeks);
    } catch (err) {
      console.error("Error fetching weekly stats:", err);
    } finally {
      setLoading(false);
    }
  };

  const currentWeek = stats[parseInt(selectedWeek)] || null;
  const previousWeek = stats[parseInt(selectedWeek) + 1] || null;

  const getTrend = (current: number, previous: number) => {
    if (!previous || !current) return "neutral";
    const diff = current - previous;
    if (diff > 5) return "up";
    if (diff < -5) return "down";
    return "neutral";
  };

  const TrendIcon = ({ trend }: { trend: string }) => {
    switch (trend) {
      case "up":
        return <TrendingUp className="w-4 h-4 text-success" />;
      case "down":
        return <TrendingDown className="w-4 h-4 text-destructive" />;
      default:
        return <Minus className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getWinner = () => {
    if (!currentWeek) return null;
    const therapistScore = currentWeek.therapistQuests.avgFluency;
    const aiScore = currentWeek.aiQuests.avgFluency;
    
    if (therapistScore === 0 && aiScore === 0) return null;
    if (therapistScore > aiScore) return "therapist";
    if (aiScore > therapistScore) return "ai";
    return "tie";
  };

  const winner = getWinner();

  if (loading) {
    return (
      <Card variant="dark" className="border-background/10">
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-background/50" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="dark" className="border-background/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-background">
            <BarChart3 className="w-5 h-5 text-primary" />
            Weekly Progress Report
          </CardTitle>
          <Select value={selectedWeek} onValueChange={setSelectedWeek}>
            <SelectTrigger className="w-40 bg-background/10 border-background/20 text-background">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {stats.map((week, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {i === 0 ? "This Week" : i === 1 ? "Last Week" : `${i} weeks ago`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {currentWeek && (
          <p className="text-sm text-background/60">
            <Calendar className="w-3 h-3 inline mr-1" />
            {new Date(currentWeek.weekStart).toLocaleDateString()} - {new Date(currentWeek.weekEnd).toLocaleDateString()}
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Comparison Header */}
        {winner && (
          <div className={`p-4 rounded-lg text-center ${
            winner === "therapist" 
              ? "bg-accent-sky/20 border border-accent-sky/30" 
              : winner === "ai" 
                ? "bg-primary/20 border border-primary/30"
                : "bg-gold/20 border border-gold/30"
          }`}>
            <Award className={`w-6 h-6 mx-auto mb-2 ${
              winner === "therapist" ? "text-accent-sky" : winner === "ai" ? "text-primary" : "text-gold"
            }`} />
            <p className="font-medium text-background">
              {winner === "therapist" && "🩺 Therapist recommendations led this week!"}
              {winner === "ai" && "🤖 AI recommendations led this week!"}
              {winner === "tie" && "🤝 It's a tie! Both approaches worked equally well."}
            </p>
          </div>
        )}

        {/* Side by Side Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {/* Therapist Stats */}
          <div className="p-4 rounded-lg bg-accent-sky/10 border border-accent-sky/20">
            <div className="flex items-center gap-2 mb-3">
              <UserCircle className="w-5 h-5 text-accent-sky" />
              <span className="font-medium text-background">Therapist</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-background/60">Quests Completed</p>
                <p className="text-2xl font-bold text-background">
                  {currentWeek?.therapistQuests.total || 0}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-background/60">Avg Fluency</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-semibold text-background">
                      {currentWeek?.therapistQuests.avgFluency || 0}%
                    </p>
                    {previousWeek && (
                      <TrendIcon trend={getTrend(
                        currentWeek?.therapistQuests.avgFluency || 0,
                        previousWeek?.therapistQuests.avgFluency || 0
                      )} />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-background/60">Avg Accuracy</p>
                  <p className="text-lg font-semibold text-background">
                    {currentWeek?.therapistQuests.avgAccuracy || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* AI Stats */}
          <div className="p-4 rounded-lg bg-primary/10 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Brain className="w-5 h-5 text-primary" />
              <span className="font-medium text-background">AI</span>
            </div>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-background/60">Quests Completed</p>
                <p className="text-2xl font-bold text-background">
                  {currentWeek?.aiQuests.total || 0}
                </p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-background/60">Avg Fluency</p>
                  <div className="flex items-center gap-1">
                    <p className="text-lg font-semibold text-background">
                      {currentWeek?.aiQuests.avgFluency || 0}%
                    </p>
                    {previousWeek && (
                      <TrendIcon trend={getTrend(
                        currentWeek?.aiQuests.avgFluency || 0,
                        previousWeek?.aiQuests.avgFluency || 0
                      )} />
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-xs text-background/60">Avg Accuracy</p>
                  <p className="text-lg font-semibold text-background">
                    {currentWeek?.aiQuests.avgAccuracy || 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Overall Stats */}
        <div className="p-4 rounded-lg bg-background/5 border border-background/10">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-5 h-5 text-gold" />
            <span className="font-medium text-background">Overall Progress</span>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-background/60">Total Sessions</p>
              <p className="text-xl font-bold text-background">{currentWeek?.totalSessions || 0}</p>
            </div>
            <div>
              <p className="text-xs text-background/60">Average Fluency</p>
              <div className="flex items-center gap-1">
                <p className="text-xl font-bold text-background">{currentWeek?.overallFluency || 0}%</p>
                {previousWeek && (
                  <TrendIcon trend={getTrend(
                    currentWeek?.overallFluency || 0,
                    previousWeek?.overallFluency || 0
                  )} />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Completed Quests with Outcomes */}
        {completedQuests.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-background mb-3">Recent Quest Outcomes</h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {completedQuests.slice(0, 5).map((quest) => (
                <div key={quest.id} className="flex items-center justify-between p-2 rounded bg-background/5 border border-background/10">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    {quest.chosen_recommendation === "therapist" ? (
                      <UserCircle className="w-4 h-4 text-accent-sky shrink-0" />
                    ) : quest.chosen_recommendation === "ai" ? (
                      <Brain className="w-4 h-4 text-primary shrink-0" />
                    ) : (
                      <Target className="w-4 h-4 text-muted-foreground shrink-0" />
                    )}
                    <span className="text-sm text-background truncate">{quest.quest_title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {quest.outcome_fluency_score !== null ? (
                      <>
                        <Badge variant={quest.outcome_fluency_score >= 80 ? "success" : quest.outcome_fluency_score >= 60 ? "warning" : "secondary"} className="text-[10px]">
                          {quest.outcome_fluency_score}%
                        </Badge>
                      </>
                    ) : (
                      <Badge variant="outline" className="text-[10px] text-background/60">
                        Pending
                      </Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {stats.length === 0 || (currentWeek?.totalSessions === 0 && currentWeek?.therapistQuests.total === 0) && (
          <div className="text-center py-8 text-background/60">
            <BarChart3 className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No data for this week yet.</p>
            <p className="text-sm">Complete some quests to see your progress!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
