import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Activity, Brain, Calendar, TrendingUp, Settings, FileBarChart, Loader2, HelpCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const spmData = [
  { label: "Mon", home: 145, clinic: 160 },
  { label: "Tue", home: 152, clinic: 158 },
  { label: "Wed", home: 148, clinic: 165 },
  { label: "Thu", home: 155, clinic: 162 },
  { label: "Fri", home: 160, clinic: 168 },
];

const exercises = [
  { id: 1, name: "Easy Onset Practice", duration: "5 min", type: "Fluency" },
  { id: 2, name: "Breathing Exercises", duration: "3 min", type: "Foundation" },
  { id: 3, name: "Word Chains", duration: "8 min", type: "Fluency" },
  { id: 4, name: "Story Retell", duration: "10 min", type: "Carryover" },
];

interface AnalyticsStats {
  aiConfidence: number;
  sessionsThisWeek: number;
  homePracticePercent: number;
  avgFluencyScore: number;
  goalProgress: number;
}

export const TherapistPortal = () => {
  const [showOverlay, setShowOverlay] = useState(false);
  const [stats, setStats] = useState<AnalyticsStats | null>(null);
  const [loading, setLoading] = useState(true);
  const maxSPM = 180;

  useEffect(() => {
    fetchAnalyticsStats();
  }, []);

  const fetchAnalyticsStats = async () => {
    try {
      // Fetch recent practice sessions for analysis
      const { data: sessions, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(50);

      if (error) {
        console.error("Error fetching sessions:", error);
        setStats({
          aiConfidence: 85,
          sessionsThisWeek: 0,
          homePracticePercent: 0,
          avgFluencyScore: 0,
          goalProgress: 0,
        });
        return;
      }

      if (!sessions || sessions.length === 0) {
        setStats({
          aiConfidence: 0,
          sessionsThisWeek: 0,
          homePracticePercent: 0,
          avgFluencyScore: 0,
          goalProgress: 0,
        });
        return;
      }

      // Calculate AI Confidence based on:
      // 1. Average accuracy scores (how well AI understood speech)
      // 2. Consistency of scores (low variance = higher confidence)
      // 3. Number of successful analyses
      const accuracyScores = sessions
        .filter(s => s.accuracy_score !== null)
        .map(s => s.accuracy_score as number);
      
      const fluencyScores = sessions
        .filter(s => s.fluency_score !== null)
        .map(s => s.fluency_score as number);

      let aiConfidence = 85; // Base confidence

      if (accuracyScores.length > 0) {
        // Factor 1: Average accuracy (40% weight)
        const avgAccuracy = accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length;
        
        // Factor 2: Score consistency - lower std dev = higher confidence (30% weight)
        const variance = accuracyScores.reduce((sum, score) => {
          return sum + Math.pow(score - avgAccuracy, 2);
        }, 0) / accuracyScores.length;
        const stdDev = Math.sqrt(variance);
        const consistencyScore = Math.max(0, 100 - stdDev * 2);

        // Factor 3: Sample size confidence (30% weight)
        // More sessions = more confident in the analysis
        const sampleConfidence = Math.min(100, (sessions.length / 20) * 100);

        aiConfidence = Math.round(
          avgAccuracy * 0.4 + 
          consistencyScore * 0.3 + 
          sampleConfidence * 0.3
        );

        // Clamp between 0 and 100
        aiConfidence = Math.max(0, Math.min(100, aiConfidence));
      }

      // Calculate sessions this week
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      const sessionsThisWeek = sessions.filter(
        s => new Date(s.session_date) >= oneWeekAgo
      ).length;

      // Calculate home practice percentage (sessions with duration > 0)
      const practiceSessionsCount = sessions.filter(s => (s.duration_seconds || 0) > 30).length;
      const homePracticePercent = sessions.length > 0 
        ? Math.round((practiceSessionsCount / sessions.length) * 100) 
        : 0;

      // Average fluency score (scaled to 10)
      const avgFluencyScore = fluencyScores.length > 0
        ? (fluencyScores.reduce((a, b) => a + b, 0) / fluencyScores.length / 10).toFixed(1)
        : 0;

      // Goal progress: based on sessions achieving 70%+ fluency
      const successfulSessions = fluencyScores.filter(s => s >= 70).length;
      const goalProgress = fluencyScores.length > 0
        ? Math.round((successfulSessions / fluencyScores.length) * 100)
        : 0;

      setStats({
        aiConfidence,
        sessionsThisWeek,
        homePracticePercent,
        avgFluencyScore: Number(avgFluencyScore),
        goalProgress,
      });
    } catch (err) {
      console.error("Failed to fetch analytics:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-accent-sky/20 text-accent-sky px-4 py-2 rounded-full text-sm font-medium mb-4">
            Clinical Portal
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Precision Analytics & Clinical Accountability
          </h2>
          <p className="text-lg text-background/70 max-w-2xl mx-auto">
            Deep data insights for evidence-based therapy decisions
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* SPM Graph */}
          <Card variant="dark" className="lg:col-span-2 border-background/10">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-background">
                  <TrendingUp className="w-5 h-5 text-accent-sky" />
                  Syllables Per Minute (SPM)
                </CardTitle>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-background/60">Show Overlay</span>
                  <Switch checked={showOverlay} onCheckedChange={setShowOverlay} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-sky" />
                  <span className="text-sm text-background/70">Clinic</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-accent-orange" />
                  <span className="text-sm text-background/70">Home</span>
                </div>
                {showOverlay && (
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-background/30" />
                    <span className="text-sm text-background/70">Baseline</span>
                  </div>
                )}
              </div>
              
              <div className="h-48 flex items-end gap-4">
                {spmData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="w-full flex gap-1 items-end h-40">
                      <div 
                        className="flex-1 bg-accent-orange rounded-t transition-all duration-300"
                        style={{ height: `${(day.home / maxSPM) * 100}%` }}
                      />
                      <div 
                        className="flex-1 bg-accent-sky rounded-t transition-all duration-300"
                        style={{ height: `${(day.clinic / maxSPM) * 100}%` }}
                      />
                      {showOverlay && (
                        <div 
                          className="flex-1 bg-background/30 rounded-t"
                          style={{ height: "75%" }}
                        />
                      )}
                    </div>
                    <span className="text-xs text-background/60">{day.label}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* AI Confidence Score */}
          <Card variant="dark" className="border-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-background">
                <Brain className="w-5 h-5 text-success" />
                AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <Loader2 className="w-6 h-6 animate-spin text-background/50" />
                </div>
              ) : (
                <>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="text-center mb-6 cursor-help">
                          <div className="relative w-32 h-32 mx-auto">
                            <svg className="w-full h-full transform -rotate-90">
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                className="text-background/20"
                              />
                              <circle
                                cx="64"
                                cy="64"
                                r="56"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="8"
                                strokeDasharray={`${((stats?.aiConfidence || 0) / 100) * 352} 352`}
                                className={stats?.aiConfidence && stats.aiConfidence >= 80 ? "text-success" : stats?.aiConfidence && stats.aiConfidence >= 60 ? "text-gold" : "text-accent-orange"}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-3xl font-display font-bold text-background">
                                {stats?.aiConfidence || 0}%
                              </span>
                            </div>
                            <div className="absolute -top-1 -right-1">
                              <HelpCircle className="w-4 h-4 text-background/40" />
                            </div>
                          </div>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="left" className="max-w-xs p-4 bg-card text-foreground border-border">
                        <div className="space-y-2">
                          <p className="font-semibold text-sm">How AI Confidence is calculated:</p>
                          <ul className="text-xs space-y-1 text-muted-foreground">
                            <li><span className="text-foreground font-medium">• Accuracy (40%):</span> How well AI understood the speech</li>
                            <li><span className="text-foreground font-medium">• Consistency (30%):</span> Lower score variance = higher confidence</li>
                            <li><span className="text-foreground font-medium">• Sample size (30%):</span> More sessions = more reliable data</li>
                          </ul>
                          <p className="text-xs text-muted-foreground pt-1 border-t border-border mt-2">
                            <span className="text-success">80%+</span> = Highly reliable • 
                            <span className="text-gold"> 60-79%</span> = Moderate • 
                            <span className="text-accent-orange"> &lt;60%</span> = Needs more data
                          </p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-background/70 text-center">
                    AI is <span className={`font-medium ${stats?.aiConfidence && stats.aiConfidence >= 80 ? "text-success" : stats?.aiConfidence && stats.aiConfidence >= 60 ? "text-gold" : "text-accent-orange"}`}>
                      {stats?.aiConfidence || 0}% confident
                    </span> in analysis accuracy
                  </p>
                  <p className="text-xs text-background/50 text-center mt-2">
                    Based on {stats?.sessionsThisWeek || 0} sessions this week
                  </p>
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Session Planner */}
          <Card variant="dark" className="lg:col-span-2 border-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-background">
                <Calendar className="w-5 h-5 text-accent-sky" />
                Session Planner
              </CardTitle>
              <p className="text-sm text-background/60">Drag exercises to push to child's app</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {exercises.map((exercise) => (
                  <div
                    key={exercise.id}
                    className="p-4 rounded-lg bg-background/10 border border-background/20 cursor-move hover:bg-background/20 transition-colors"
                    draggable
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-background">{exercise.name}</span>
                      <span className="text-xs text-accent-sky">{exercise.type}</span>
                    </div>
                    <span className="text-xs text-background/60">{exercise.duration}</span>
                  </div>
                ))}
              </div>
              <Button variant="sky" className="w-full mt-4">
                Push to Child's App
              </Button>
            </CardContent>
          </Card>
          
          {/* Quick Stats */}
          <Card variant="dark" className="border-background/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-background">
                <FileBarChart className="w-5 h-5 text-accent-sky" />
                Quick Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-background/50" />
                </div>
              ) : (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-background/70">Sessions this week</span>
                    <span className="font-semibold text-background">{stats?.sessionsThisWeek || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-background/70">Home practice %</span>
                    <span className="font-semibold text-success">{stats?.homePracticePercent || 0}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-background/70">Avg. fluency score</span>
                    <span className="font-semibold text-accent-sky">{stats?.avgFluencyScore || 0}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-background/70">Goal progress</span>
                    <span className="font-semibold text-gold">{stats?.goalProgress || 0}%</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
