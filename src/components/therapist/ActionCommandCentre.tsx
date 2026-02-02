import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { FileText, Clock, TrendingUp, AlertTriangle, CheckCircle, Flame } from "lucide-react";
import { cn } from "@/lib/utils";

interface ActionMetrics {
  totalSessions: number;
  totalPracticeMinutes: number;
  streakDays: number;
  adherenceRate: number; // Percentage
  lastSessionDate: string | null;
  averageSessionsPerWeek: number;
}

interface RelapseRiskIndicators {
  avoidanceTrend: 'increasing' | 'stable' | 'decreasing';
  fluencyTrend: 'improving' | 'stable' | 'declining';
  engagementTrend: 'increasing' | 'stable' | 'decreasing';
  overallRisk: 'low' | 'medium' | 'high';
}

interface ActionCommandCentreProps {
  metrics: ActionMetrics;
  relapseRisk?: RelapseRiskIndicators;
  compact?: boolean;
}

export const ActionCommandCentre = ({ 
  metrics, 
  relapseRisk,
  compact = false 
}: ActionCommandCentreProps) => {
  // Calculate days since last session
  const daysSinceLastSession = metrics.lastSessionDate 
    ? Math.floor((Date.now() - new Date(metrics.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24))
    : null;
  
  // Adherence rating
  const getAdherenceRating = (rate: number): { label: string; color: string } => {
    if (rate >= 80) return { label: "Excellent", color: "text-success" };
    if (rate >= 60) return { label: "Good", color: "text-primary" };
    if (rate >= 40) return { label: "Fair", color: "text-gold" };
    return { label: "Needs Improvement", color: "text-accent-orange" };
  };
  
  const adherenceRating = getAdherenceRating(metrics.adherenceRate);
  
  // Risk level styling
  const getRiskStyle = (risk: 'low' | 'medium' | 'high') => {
    switch (risk) {
      case 'low': return { bg: "bg-success/10", border: "border-success/30", text: "text-success" };
      case 'medium': return { bg: "bg-gold/10", border: "border-gold/30", text: "text-gold" };
      case 'high': return { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive" };
    }
  };

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <FileText className="w-4 h-4 text-accent-orange" />
            Engagement
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Adherence</span>
            <span className={cn("font-bold", adherenceRating.color)}>
              {metrics.adherenceRate.toFixed(0)}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Streak</span>
            <div className="flex items-center gap-1">
              <Flame className="w-3 h-3 text-accent-orange" />
              <span className="font-medium text-sm">{metrics.streakDays} days</span>
            </div>
          </div>
          {relapseRisk && relapseRisk.overallRisk !== 'low' && (
            <div className={cn("flex items-center gap-1 text-xs", getRiskStyle(relapseRisk.overallRisk).text)}>
              <AlertTriangle className="w-3 h-3" />
              <span>{relapseRisk.overallRisk} risk</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-accent-orange" />
          Action Command Centre
          <span className="text-xs text-muted-foreground font-normal ml-auto">Engagement & Admin</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Practice Adherence */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Practice Adherence & Dosage</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", adherenceRating.color)}>
              {adherenceRating.label}
            </span>
          </div>
          
          <div className="flex items-end gap-4 mb-3">
            <span className={cn("text-4xl font-bold", adherenceRating.color)}>
              {metrics.adherenceRate.toFixed(0)}%
            </span>
            <span className="text-muted-foreground text-sm mb-1">of recommended practice</span>
          </div>
          
          <Progress value={metrics.adherenceRate} className="h-2" />
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{metrics.totalSessions}</p>
            <p className="text-xs text-muted-foreground">Total Sessions</p>
          </div>
          
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{metrics.totalPracticeMinutes}</p>
            <p className="text-xs text-muted-foreground">Minutes Practiced</p>
          </div>
          
          <div className="p-3 bg-accent-orange/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 text-accent-orange" />
              <p className="text-2xl font-bold text-accent-orange">{metrics.streakDays}</p>
            </div>
            <p className="text-xs text-muted-foreground">Day Streak</p>
          </div>
          
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{metrics.averageSessionsPerWeek.toFixed(1)}</p>
            <p className="text-xs text-muted-foreground">Sessions/Week</p>
          </div>
        </div>
        
        {/* Last Session Warning */}
        {daysSinceLastSession !== null && daysSinceLastSession > 3 && (
          <div className={cn(
            "p-3 rounded-lg flex items-start gap-2",
            daysSinceLastSession > 7 ? "bg-destructive/10" : "bg-gold/10"
          )}>
            <Clock className={cn(
              "w-4 h-4 mt-0.5",
              daysSinceLastSession > 7 ? "text-destructive" : "text-gold"
            )} />
            <div>
              <p className={cn(
                "text-sm font-medium",
                daysSinceLastSession > 7 ? "text-destructive" : "text-gold"
              )}>
                {daysSinceLastSession} days since last practice
              </p>
              <p className="text-xs text-muted-foreground">
                Consider reaching out to check on the child's engagement
              </p>
            </div>
          </div>
        )}
        
        {/* Predictive Relapse Risk */}
        {relapseRisk && (
          <div className={cn(
            "p-4 rounded-xl border",
            getRiskStyle(relapseRisk.overallRisk).bg,
            getRiskStyle(relapseRisk.overallRisk).border
          )}>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {relapseRisk.overallRisk === 'low' 
                  ? <CheckCircle className="w-5 h-5 text-success" />
                  : <AlertTriangle className={cn("w-5 h-5", getRiskStyle(relapseRisk.overallRisk).text)} />
                }
                <span className="text-sm font-medium text-foreground">Predictive Relapse Risk</span>
              </div>
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full bg-background capitalize",
                getRiskStyle(relapseRisk.overallRisk).text
              )}>
                {relapseRisk.overallRisk}
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Avoidance</p>
                <div className={cn(
                  "flex items-center justify-center gap-1 text-sm font-medium",
                  relapseRisk.avoidanceTrend === 'increasing' ? "text-destructive" :
                  relapseRisk.avoidanceTrend === 'decreasing' ? "text-success" : "text-muted-foreground"
                )}>
                  {relapseRisk.avoidanceTrend === 'increasing' && <TrendingUp className="w-3 h-3" />}
                  {relapseRisk.avoidanceTrend === 'decreasing' && <TrendingUp className="w-3 h-3 rotate-180" />}
                  <span className="capitalize">{relapseRisk.avoidanceTrend}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Fluency</p>
                <div className={cn(
                  "flex items-center justify-center gap-1 text-sm font-medium",
                  relapseRisk.fluencyTrend === 'declining' ? "text-destructive" :
                  relapseRisk.fluencyTrend === 'improving' ? "text-success" : "text-muted-foreground"
                )}>
                  {relapseRisk.fluencyTrend === 'improving' && <TrendingUp className="w-3 h-3" />}
                  {relapseRisk.fluencyTrend === 'declining' && <TrendingUp className="w-3 h-3 rotate-180" />}
                  <span className="capitalize">{relapseRisk.fluencyTrend}</span>
                </div>
              </div>
              
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Engagement</p>
                <div className={cn(
                  "flex items-center justify-center gap-1 text-sm font-medium",
                  relapseRisk.engagementTrend === 'decreasing' ? "text-destructive" :
                  relapseRisk.engagementTrend === 'increasing' ? "text-success" : "text-muted-foreground"
                )}>
                  {relapseRisk.engagementTrend === 'increasing' && <TrendingUp className="w-3 h-3" />}
                  {relapseRisk.engagementTrend === 'decreasing' && <TrendingUp className="w-3 h-3 rotate-180" />}
                  <span className="capitalize">{relapseRisk.engagementTrend}</span>
                </div>
              </div>
            </div>
            
            {relapseRisk.overallRisk !== 'low' && (
              <p className="text-xs text-muted-foreground mt-3">
                {relapseRisk.overallRisk === 'high' 
                  ? "⚠️ Multiple risk factors detected - consider scheduling a check-in session"
                  : "Monitor these trends closely in upcoming sessions"}
              </p>
            )}
          </div>
        )}
        
        {/* S.O.A.P. Note Prompt */}
        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-primary">
            <strong>Auto S.O.A.P. Draft:</strong> Based on today's data - 
            Objective: {metrics.totalSessions} sessions, {metrics.adherenceRate.toFixed(0)}% adherence. 
            Assessment: {adherenceRating.label} engagement level.
            Plan: {metrics.adherenceRate < 60 
              ? "Discuss barriers to practice with family" 
              : "Continue current practice schedule"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
