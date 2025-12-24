import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, UserCircle, TrendingUp, BarChart3, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface OutcomeStats {
  totalCompleted: number;
  therapistChosen: number;
  aiChosen: number;
  avgFluencyTherapist: number;
  avgFluencyAI: number;
  avgAccuracyTherapist: number;
  avgAccuracyAI: number;
}

interface CompletedQuest {
  id: string;
  quest_title: string;
  chosen_recommendation: string | null;
  outcome_fluency_score: number | null;
  outcome_accuracy_score: number | null;
  completed_at: string;
  ai_agrees: boolean | null;
}

export const RecommendationOutcomes = () => {
  const [stats, setStats] = useState<OutcomeStats | null>(null);
  const [recentCompletions, setRecentCompletions] = useState<CompletedQuest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOutcomeData();
  }, []);

  const fetchOutcomeData = async () => {
    const { data, error } = await supabase
      .from("therapist_assigned_quests")
      .select("*")
      .not("completed_at", "is", null)
      .order("completed_at", { ascending: false });

    if (error || !data) {
      setLoading(false);
      return;
    }

    const completedQuests = data as CompletedQuest[];
    setRecentCompletions(completedQuests.slice(0, 5));

    const therapistQuests = completedQuests.filter(q => q.chosen_recommendation === "therapist");
    const aiQuests = completedQuests.filter(q => q.chosen_recommendation === "ai");

    const avgFluencyTherapist = therapistQuests.length > 0
      ? therapistQuests.reduce((sum, q) => sum + (q.outcome_fluency_score || 0), 0) / therapistQuests.length
      : 0;
    
    const avgFluencyAI = aiQuests.length > 0
      ? aiQuests.reduce((sum, q) => sum + (q.outcome_fluency_score || 0), 0) / aiQuests.length
      : 0;

    const avgAccuracyTherapist = therapistQuests.length > 0
      ? therapistQuests.reduce((sum, q) => sum + (q.outcome_accuracy_score || 0), 0) / therapistQuests.length
      : 0;
    
    const avgAccuracyAI = aiQuests.length > 0
      ? aiQuests.reduce((sum, q) => sum + (q.outcome_accuracy_score || 0), 0) / aiQuests.length
      : 0;

    setStats({
      totalCompleted: completedQuests.length,
      therapistChosen: therapistQuests.length,
      aiChosen: aiQuests.length,
      avgFluencyTherapist: Math.round(avgFluencyTherapist),
      avgFluencyAI: Math.round(avgFluencyAI),
      avgAccuracyTherapist: Math.round(avgAccuracyTherapist),
      avgAccuracyAI: Math.round(avgAccuracyAI),
    });

    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="glass-card-strong">
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!stats || stats.totalCompleted === 0) {
    return (
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-accent-sky" />
            Recommendation Outcomes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-4">
            No completed quests yet. Outcomes will appear here once children complete their assigned quests.
          </p>
        </CardContent>
      </Card>
    );
  }

  const therapistPercent = stats.totalCompleted > 0 
    ? Math.round((stats.therapistChosen / stats.totalCompleted) * 100) 
    : 0;

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BarChart3 className="w-5 h-5 text-accent-sky" />
          Recommendation Outcomes
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Choice Distribution */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-foreground/80">Choice Distribution</span>
            <span className="text-xs text-muted-foreground">{stats.totalCompleted} completed</span>
          </div>
          <div className="flex gap-2 mb-2">
            <div className="flex items-center gap-1.5">
              <UserCircle className="w-4 h-4 text-accent-sky" />
              <span className="text-sm text-foreground">{stats.therapistChosen} Therapist</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Brain className="w-4 h-4 text-gold" />
              <span className="text-sm text-foreground">{stats.aiChosen} AI</span>
            </div>
          </div>
          <div className="h-3 rounded-full bg-secondary overflow-hidden flex">
            <div 
              className="h-full bg-accent-sky transition-all"
              style={{ width: `${therapistPercent}%` }}
            />
            <div 
              className="h-full bg-gold transition-all"
              style={{ width: `${100 - therapistPercent}%` }}
            />
          </div>
        </div>

        {/* Performance Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-accent-sky/10 border border-accent-sky/30">
            <div className="flex items-center gap-2 mb-2">
              <UserCircle className="w-4 h-4 text-accent-sky" />
              <span className="text-xs font-medium text-foreground">Therapist Picks</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Fluency</span>
                <span className="text-foreground font-medium">{stats.avgFluencyTherapist}%</span>
              </div>
              <Progress value={stats.avgFluencyTherapist} className="h-1.5" />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Avg Accuracy</span>
                <span className="text-foreground font-medium">{stats.avgAccuracyTherapist}%</span>
              </div>
              <Progress value={stats.avgAccuracyTherapist} className="h-1.5" />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-gold/10 border border-gold/30">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="w-4 h-4 text-gold" />
              <span className="text-xs font-medium text-foreground">AI Picks</span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Avg Fluency</span>
                <span className="text-foreground font-medium">{stats.avgFluencyAI}%</span>
              </div>
              <Progress value={stats.avgFluencyAI} className="h-1.5" />
              <div className="flex justify-between text-sm mt-2">
                <span className="text-muted-foreground">Avg Accuracy</span>
                <span className="text-foreground font-medium">{stats.avgAccuracyAI}%</span>
              </div>
              <Progress value={stats.avgAccuracyAI} className="h-1.5" />
            </div>
          </div>
        </div>

        {/* Recent Completions */}
        {recentCompletions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Recent Completions
            </h4>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {recentCompletions.map(quest => (
                <div
                  key={quest.id}
                  className="p-2 rounded-lg bg-secondary/50 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                    <span className="text-sm text-foreground truncate">{quest.quest_title}</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {quest.chosen_recommendation && (
                      <Badge 
                        variant={quest.chosen_recommendation === "therapist" ? "default" : "warning"}
                        className="text-[10px]"
                      >
                        {quest.chosen_recommendation === "therapist" ? (
                          <><UserCircle className="w-3 h-3 mr-1" /> Therapist</>
                        ) : (
                          <><Brain className="w-3 h-3 mr-1" /> AI</>
                        )}
                      </Badge>
                    )}
                    {quest.outcome_fluency_score && (
                      <span className="text-xs text-muted-foreground">
                        {quest.outcome_fluency_score}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};