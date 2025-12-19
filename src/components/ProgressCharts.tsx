import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Calendar, Target, Award, ArrowUp, ArrowDown, Minus } from "lucide-react";

const weeklyData = [
  { day: "Mon", fluency: 72, sessions: 2, improvement: "up" },
  { day: "Tue", fluency: 75, sessions: 3, improvement: "up" },
  { day: "Wed", fluency: 74, sessions: 2, improvement: "down" },
  { day: "Thu", fluency: 78, sessions: 4, improvement: "up" },
  { day: "Fri", fluency: 82, sessions: 3, improvement: "up" },
  { day: "Sat", fluency: 80, sessions: 1, improvement: "down" },
  { day: "Sun", fluency: 85, sessions: 2, improvement: "up" },
];

const monthlyProgress = [
  { week: "Week 1", score: 65 },
  { week: "Week 2", score: 72 },
  { week: "Week 3", score: 78 },
  { week: "Week 4", score: 85 },
];

const milestones = [
  { name: "First Recording", achieved: true, date: "Dec 1" },
  { name: "5-Day Streak", achieved: true, date: "Dec 6" },
  { name: "70% Fluency", achieved: true, date: "Dec 10" },
  { name: "80% Fluency", achieved: true, date: "Dec 17" },
  { name: "90% Fluency", achieved: false, date: "Target" },
];

export const ProgressCharts = () => {
  const maxFluency = 100;
  const avgFluency = Math.round(weeklyData.reduce((acc, d) => acc + d.fluency, 0) / weeklyData.length);
  const totalSessions = weeklyData.reduce((acc, d) => acc + d.sessions, 0);
  
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-success/10 text-success px-4 py-2 rounded-full text-sm font-medium mb-4">
            Progress Tracking
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Your Fluency Journey
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track improvements over time with detailed analytics and milestone achievements
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Weekly Fluency Chart */}
          <Card variant="glass" className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-success" />
                  Weekly Fluency Scores
                </CardTitle>
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-muted-foreground">Avg:</span>
                  <span className="font-bold text-success">{avgFluency}%</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-64 flex items-end gap-3">
                {weeklyData.map((day, index) => (
                  <div key={index} className="flex-1 flex flex-col items-center gap-2">
                    <div className="relative w-full">
                      {/* Fluency bar */}
                      <div 
                        className={`w-full rounded-t-lg transition-all duration-500 ${
                          day.fluency >= 80 ? "bg-success" : 
                          day.fluency >= 70 ? "bg-gold" : "bg-accent-orange"
                        }`}
                        style={{ height: `${(day.fluency / maxFluency) * 200}px` }}
                      />
                      {/* Score label */}
                      <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-bold text-foreground">
                        {day.fluency}%
                      </div>
                      {/* Trend indicator */}
                      <div className="absolute -top-10 left-1/2 transform -translate-x-1/2">
                        {day.improvement === "up" ? (
                          <ArrowUp className="w-3 h-3 text-success" />
                        ) : day.improvement === "down" ? (
                          <ArrowDown className="w-3 h-3 text-destructive" />
                        ) : (
                          <Minus className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">{day.day}</span>
                    <span className="text-[10px] text-muted-foreground/70">{day.sessions} sessions</span>
                  </div>
                ))}
              </div>
              
              {/* Legend */}
              <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-border">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-success" />
                  <span className="text-xs text-muted-foreground">80%+ Excellent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gold" />
                  <span className="text-xs text-muted-foreground">70-79% Good</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-accent-orange" />
                  <span className="text-xs text-muted-foreground">&lt;70% Improving</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Stats Summary */}
          <div className="space-y-6">
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-success/10">
                    <Target className="w-6 h-6 text-success" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold font-display text-foreground">{avgFluency}%</p>
                    <p className="text-sm text-muted-foreground">Average This Week</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm">
                  <ArrowUp className="w-4 h-4 text-success" />
                  <span className="text-success font-medium">+13%</span>
                  <span className="text-muted-foreground">vs last week</span>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-xl bg-primary/10">
                    <Calendar className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-bold font-display text-foreground">{totalSessions}</p>
                    <p className="text-sm text-muted-foreground">Sessions This Week</p>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${(totalSessions / 21) * 100}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{totalSessions}/21 goal</p>
                </div>
              </CardContent>
            </Card>
            
            <Card variant="glass">
              <CardContent className="p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 rounded-xl bg-gold/10">
                    <Award className="w-6 h-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-lg font-bold font-display text-foreground">Milestones</p>
                    <p className="text-xs text-muted-foreground">4/5 achieved</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {milestones.map((milestone, index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        milestone.achieved ? "bg-success/10" : "bg-muted/50"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={milestone.achieved ? "text-success" : "text-muted-foreground"}>
                          {milestone.achieved ? "✓" : "○"}
                        </span>
                        <span className={`text-sm ${milestone.achieved ? "text-foreground" : "text-muted-foreground"}`}>
                          {milestone.name}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">{milestone.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Monthly Progress */}
          <Card variant="glass" className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Monthly Progress Overview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                {monthlyProgress.map((week, index) => (
                  <div key={index} className="text-center">
                    <div className="relative h-32 flex items-end justify-center mb-2">
                      <div 
                        className="w-full max-w-20 bg-gradient-to-t from-primary to-accent rounded-t-lg transition-all duration-500"
                        style={{ height: `${week.score}%` }}
                      />
                      <div className="absolute top-0 left-1/2 transform -translate-x-1/2 text-lg font-bold text-foreground">
                        {week.score}%
                      </div>
                    </div>
                    <p className="text-sm font-medium text-foreground">{week.week}</p>
                    {index > 0 && (
                      <p className="text-xs text-success">
                        +{week.score - monthlyProgress[index - 1].score}%
                      </p>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 p-4 bg-success/10 rounded-xl border border-success/20">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <p className="font-semibold text-foreground">Amazing Progress!</p>
                    <p className="text-sm text-muted-foreground">
                      You've improved by 20% this month. Keep up the great work!
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
