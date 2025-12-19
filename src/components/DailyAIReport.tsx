import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Brain, Sparkles, TrendingUp, AlertCircle, CheckCircle, Lightbulb, Calendar, RefreshCw } from "lucide-react";

interface InsightItem {
  type: "success" | "improvement" | "tip";
  title: string;
  description: string;
}

const insights: InsightItem[] = [
  {
    type: "success",
    title: "Excellent Easy Onset Progress",
    description: "Your soft speech onset has improved by 23% this week. The 'Sally saw the sun' exercise showed consistent improvement across 12 recordings."
  },
  {
    type: "improvement",
    title: "Pacing Could Use Work",
    description: "Speech rate tends to increase mid-sentence. Consider practising with the metronome feature set to 80 BPM for better rhythm control."
  },
  {
    type: "tip",
    title: "Recommended Focus Area",
    description: "Based on your patterns, focus on prolonged speech exercises for the next week. This will complement your strong easy onset skills."
  }
];

const dailyStats = {
  sessionsToday: 3,
  totalMinutes: 18,
  averageFluency: 84,
  bestScore: 92,
  practiceStreak: 7,
  wordsAnalysed: 156,
};

const patternAnalysis = [
  { pattern: "Easy Onset", score: 92, trend: "up" },
  { pattern: "Continuous Flow", score: 78, trend: "up" },
  { pattern: "Natural Pausing", score: 85, trend: "stable" },
  { pattern: "Speech Rate", score: 71, trend: "down" },
];

export const DailyAIReport = () => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 2000);
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "improvement":
        return <AlertCircle className="w-5 h-5 text-gold" />;
      case "tip":
        return <Lightbulb className="w-5 h-5 text-primary" />;
      default:
        return <Sparkles className="w-5 h-5 text-primary" />;
    }
  };

  const getInsightBg = (type: string) => {
    switch (type) {
      case "success":
        return "bg-success/10 border-success/20";
      case "improvement":
        return "bg-gold/10 border-gold/20";
      case "tip":
        return "bg-primary/10 border-primary/20";
      default:
        return "bg-secondary border-border";
    }
  };

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            AI-Powered Insights
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Daily AI Report
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Personalised analysis of your speech patterns and actionable recommendations
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Main Report Card */}
          <Card variant="glassStrong" className="lg:col-span-2">
            <CardHeader className="border-b border-border">
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-primary" />
                  Today's Analysis
                </CardTitle>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'short' })}
                  </span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleRefresh}
                    disabled={isRefreshing}
                  >
                    <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {/* AI Confidence Banner */}
              <div className="flex items-center gap-3 p-4 bg-secondary/50 rounded-xl mb-6">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-success flex items-center justify-center">
                    <span className="text-sm font-bold text-success">AI</span>
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-success-foreground" />
                  </div>
                </div>
                <div>
                  <p className="font-medium text-foreground">High Confidence Analysis</p>
                  <p className="text-sm text-muted-foreground">
                    Based on {dailyStats.wordsAnalysed} words analysed from {dailyStats.sessionsToday} sessions today
                  </p>
                </div>
              </div>
              
              {/* Insights List */}
              <div className="space-y-4">
                {insights.map((insight, index) => (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border ${getInsightBg(insight.type)}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getInsightIcon(insight.type)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground">{insight.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Pattern Analysis */}
              <div className="mt-6 pt-6 border-t border-border">
                <h4 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-primary" />
                  Pattern Analysis
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  {patternAnalysis.map((pattern, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{pattern.pattern}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {pattern.trend === "up" ? (
                            <span className="text-xs text-success">↑ Improving</span>
                          ) : pattern.trend === "down" ? (
                            <span className="text-xs text-gold">↓ Needs work</span>
                          ) : (
                            <span className="text-xs text-muted-foreground">→ Stable</span>
                          )}
                        </div>
                      </div>
                      <div className={`text-2xl font-bold ${
                        pattern.score >= 85 ? "text-success" : 
                        pattern.score >= 75 ? "text-primary" : "text-gold"
                      }`}>
                        {pattern.score}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Daily Stats Sidebar */}
          <div className="space-y-6">
            <Card variant="glass">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Today's Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Sessions</span>
                    <span className="font-bold text-foreground">{dailyStats.sessionsToday}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Practice Time</span>
                    <span className="font-bold text-foreground">{dailyStats.totalMinutes} min</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Avg Fluency</span>
                    <span className="font-bold text-success">{dailyStats.averageFluency}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Best Score</span>
                    <span className="font-bold text-gold">{dailyStats.bestScore}%</span>
                  </div>
                  <div className="pt-4 border-t border-border">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Streak</span>
                      <span className="font-bold text-accent-orange">🔥 {dailyStats.practiceStreak} days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass" className="bg-gradient-to-br from-primary/5 to-accent/5">
              <CardContent className="p-6">
                <div className="text-center">
                  <div className="text-5xl mb-4">🎯</div>
                  <h3 className="font-display font-bold text-lg text-foreground mb-2">
                    Today's Goal
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Complete 2 more sessions to hit your daily target
                  </p>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all"
                      style={{ width: "60%" }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">3/5 sessions complete</p>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Sparkles className="w-5 h-5 text-gold" />
                  <h3 className="font-semibold text-foreground">AI Recommendation</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Try the "Smooth Sailing" exercise next. It's designed to help with the pacing patterns detected in your recent sessions.
                </p>
                <Button variant="navy" className="w-full">
                  Start Exercise
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
