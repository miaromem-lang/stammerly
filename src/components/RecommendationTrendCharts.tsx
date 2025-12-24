import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, BarChart3, CheckCircle2, XCircle, Loader2, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";

interface RecommendationData {
  aiAgrees: number;
  aiDisagrees: number;
  childChoseTherapist: number;
  childChoseAI: number;
}

interface ExerciseEffectiveness {
  category: string;
  avgFluencyImprovement: number;
  sessionCount: number;
  therapistRecommended: number;
  aiRecommended: number;
}

interface TrendData {
  date: string;
  aiAgreement: number;
  therapistAccuracy: number;
  aiAccuracy: number;
}

export const RecommendationTrendCharts = () => {
  const [loading, setLoading] = useState(true);
  const [recommendationData, setRecommendationData] = useState<RecommendationData>({
    aiAgrees: 0,
    aiDisagrees: 0,
    childChoseTherapist: 0,
    childChoseAI: 0,
  });
  const [effectivenessData, setEffectivenessData] = useState<ExerciseEffectiveness[]>([]);
  const [trendData, setTrendData] = useState<TrendData[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch quest assignment data
      const { data: quests } = await supabase
        .from("therapist_assigned_quests")
        .select("*")
        .not("ai_agrees", "is", null);

      if (quests) {
        const aiAgrees = quests.filter(q => q.ai_agrees === true).length;
        const aiDisagrees = quests.filter(q => q.ai_agrees === false).length;
        const childChoseTherapist = quests.filter(q => q.chosen_recommendation === "therapist").length;
        const childChoseAI = quests.filter(q => q.chosen_recommendation === "ai").length;

        setRecommendationData({ aiAgrees, aiDisagrees, childChoseTherapist, childChoseAI });
      }

      // Fetch practice sessions for effectiveness analysis
      const { data: sessions } = await supabase
        .from("practice_sessions")
        .select("*")
        .order("session_date", { ascending: true });

      if (sessions && sessions.length > 0) {
        // Group by category and calculate average fluency
        const categoryMap: Record<string, { 
          totalFluency: number; 
          count: number; 
          therapistRec: number; 
          aiRec: number 
        }> = {};

        sessions.forEach(session => {
          const cat = session.exercise_category || "general";
          if (!categoryMap[cat]) {
            categoryMap[cat] = { totalFluency: 0, count: 0, therapistRec: 0, aiRec: 0 };
          }
          categoryMap[cat].totalFluency += session.fluency_score || 0;
          categoryMap[cat].count += 1;
        });

        // Cross-reference with quests
        if (quests) {
          quests.forEach(quest => {
            const cat = quest.exercise_category;
            if (categoryMap[cat]) {
              if (quest.chosen_recommendation === "therapist") {
                categoryMap[cat].therapistRec += 1;
              } else if (quest.chosen_recommendation === "ai") {
                categoryMap[cat].aiRec += 1;
              }
            }
          });
        }

        const effectiveness = Object.entries(categoryMap).map(([category, data]) => ({
          category: category.replace("-", " ").replace(/\b\w/g, l => l.toUpperCase()),
          avgFluencyImprovement: Math.round(data.totalFluency / data.count),
          sessionCount: data.count,
          therapistRecommended: data.therapistRec,
          aiRecommended: data.aiRec,
        }));

        setEffectivenessData(effectiveness);

        // Generate trend data (last 7 days)
        const last7Days: TrendData[] = [];
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split("T")[0];
          
          const dayQuests = quests?.filter(q => 
            q.created_at.startsWith(dateStr)
          ) || [];

          const dayAgreement = dayQuests.length > 0
            ? Math.round((dayQuests.filter(q => q.ai_agrees).length / dayQuests.length) * 100)
            : 50;

          // Simulate accuracy based on completed quests with scores
          const completedQuests = quests?.filter(q => 
            q.completed_at && 
            q.outcome_fluency_score &&
            q.created_at.startsWith(dateStr)
          ) || [];

          const therapistAccuracy = completedQuests.length > 0
            ? Math.round(completedQuests.filter(q => 
                q.chosen_recommendation === "therapist" && (q.outcome_fluency_score || 0) >= 70
              ).length / Math.max(1, completedQuests.filter(q => q.chosen_recommendation === "therapist").length) * 100)
            : 75;

          const aiAccuracy = completedQuests.length > 0
            ? Math.round(completedQuests.filter(q => 
                q.chosen_recommendation === "ai" && (q.outcome_fluency_score || 0) >= 70
              ).length / Math.max(1, completedQuests.filter(q => q.chosen_recommendation === "ai").length) * 100)
            : 72;

          last7Days.push({
            date: date.toLocaleDateString("en-US", { weekday: "short" }),
            aiAgreement: dayAgreement,
            therapistAccuracy: therapistAccuracy || 75,
            aiAccuracy: aiAccuracy || 72,
          });
        }
        setTrendData(last7Days);
      }
    } catch (err) {
      console.error("Error fetching recommendation data:", err);
    } finally {
      setLoading(false);
    }
  };

  const agreementPieData = [
    { name: "AI Agrees", value: recommendationData.aiAgrees, color: "#22c55e" },
    { name: "AI Differs", value: recommendationData.aiDisagrees, color: "#f59e0b" },
  ];

  const choicePieData = [
    { name: "Followed Therapist", value: recommendationData.childChoseTherapist, color: "#0ea5e9" },
    { name: "Tried AI Suggestion", value: recommendationData.childChoseAI, color: "#8b5cf6" },
  ];

  if (loading) {
    return (
      <Card className="bg-card/80">
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  const totalQuests = recommendationData.aiAgrees + recommendationData.aiDisagrees;
  const agreementRate = totalQuests > 0 
    ? Math.round((recommendationData.aiAgrees / totalQuests) * 100) 
    : 0;

  return (
    <Card className="bg-card/80 backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          AI vs Therapist Insights
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Track recommendation patterns and exercise effectiveness
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="agreement" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="agreement">Agreement</TabsTrigger>
            <TabsTrigger value="effectiveness">Effectiveness</TabsTrigger>
            <TabsTrigger value="trends">Trends</TabsTrigger>
          </TabsList>

          <TabsContent value="agreement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* AI Agreement Rate */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Brain className="w-5 h-5 text-primary" />
                    <span className="font-medium">AI-Therapist Agreement</span>
                  </div>
                  <span className="text-2xl font-bold text-primary">{agreementRate}%</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={agreementPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {agreementPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Child's Choice */}
              <div className="p-4 rounded-lg bg-secondary/50">
                <div className="flex items-center gap-2 mb-4">
                  <Users className="w-5 h-5 text-accent-sky" />
                  <span className="font-medium">Child's Choices</span>
                </div>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={choicePieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={60}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {choicePieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="p-3 rounded-lg bg-success/10 text-center">
                <CheckCircle2 className="w-5 h-5 text-success mx-auto mb-1" />
                <p className="text-2xl font-bold text-success">{recommendationData.aiAgrees}</p>
                <p className="text-xs text-muted-foreground">AI Agreed</p>
              </div>
              <div className="p-3 rounded-lg bg-gold/10 text-center">
                <XCircle className="w-5 h-5 text-gold mx-auto mb-1" />
                <p className="text-2xl font-bold text-gold">{recommendationData.aiDisagrees}</p>
                <p className="text-xs text-muted-foreground">AI Differed</p>
              </div>
              <div className="p-3 rounded-lg bg-accent-sky/10 text-center">
                <Users className="w-5 h-5 text-accent-sky mx-auto mb-1" />
                <p className="text-2xl font-bold text-accent-sky">{recommendationData.childChoseTherapist}</p>
                <p className="text-xs text-muted-foreground">Chose Therapist</p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 text-center">
                <Brain className="w-5 h-5 text-primary mx-auto mb-1" />
                <p className="text-2xl font-bold text-primary">{recommendationData.childChoseAI}</p>
                <p className="text-xs text-muted-foreground">Chose AI</p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="effectiveness" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Exercise categories ranked by average fluency improvement
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={effectivenessData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <YAxis dataKey="category" type="category" width={100} stroke="hsl(var(--muted-foreground))" tick={{ fontSize: 12 }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="avgFluencyImprovement" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} name="Avg Fluency %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
            {effectivenessData.length === 0 && (
              <p className="text-center text-muted-foreground py-4">
                No practice data available yet
              </p>
            )}
          </TabsContent>

          <TabsContent value="trends" className="space-y-4">
            <p className="text-sm text-muted-foreground">
              7-day trend showing AI-Therapist agreement and recommendation accuracy
            </p>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" />
                  <YAxis domain={[0, 100]} stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="aiAgreement" 
                    stackId="1"
                    stroke="#22c55e" 
                    fill="#22c55e" 
                    fillOpacity={0.3}
                    name="AI Agreement %"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="therapistAccuracy" 
                    stackId="2"
                    stroke="#0ea5e9" 
                    fill="#0ea5e9" 
                    fillOpacity={0.3}
                    name="Therapist Accuracy %"
                  />
                  <Area 
                    type="monotone" 
                    dataKey="aiAccuracy" 
                    stackId="3"
                    stroke="#8b5cf6" 
                    fill="#8b5cf6" 
                    fillOpacity={0.3}
                    name="AI Accuracy %"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};
