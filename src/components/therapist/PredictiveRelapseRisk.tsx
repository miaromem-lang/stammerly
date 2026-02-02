import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus, Shield, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface RelapseRiskData {
  // Current metrics
  currentAdherence: number;
  currentFluency: number;
  currentAvoidanceCount: number;
  
  // Historical metrics (previous period)
  previousAdherence: number;
  previousFluency: number;
  previousAvoidanceCount: number;
  
  // Engagement metrics
  daysSinceLastSession: number;
  sessionsThisWeek: number;
  averageSessionsPerWeek: number;
  
  // Technique usage
  techniqueSuccessRate: number;
  previousTechniqueSuccessRate: number;
}

interface PredictiveRelapseRiskProps {
  data: RelapseRiskData;
  compact?: boolean;
}

type TrendType = 'improving' | 'stable' | 'declining';
type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export const PredictiveRelapseRisk = ({ data, compact = false }: PredictiveRelapseRiskProps) => {
  // Calculate trends
  const calculateTrend = (current: number, previous: number, higherIsBetter: boolean): TrendType => {
    const diff = current - previous;
    const threshold = 10; // 10% change threshold
    
    if (Math.abs(diff) < threshold) return 'stable';
    if (higherIsBetter) {
      return diff > 0 ? 'improving' : 'declining';
    }
    return diff < 0 ? 'improving' : 'declining';
  };
  
  const adherenceTrend = calculateTrend(data.currentAdherence, data.previousAdherence, true);
  const fluencyTrend = calculateTrend(data.currentFluency, data.previousFluency, true);
  const avoidanceTrend = calculateTrend(data.currentAvoidanceCount, data.previousAvoidanceCount, false);
  const techniqueTrend = calculateTrend(data.techniqueSuccessRate, data.previousTechniqueSuccessRate, true);
  
  // Calculate risk score (0-100)
  const calculateRiskScore = (): number => {
    let score = 0;
    
    // Adherence factors (max 30 points)
    if (data.currentAdherence < 30) score += 30;
    else if (data.currentAdherence < 50) score += 20;
    else if (data.currentAdherence < 70) score += 10;
    
    if (adherenceTrend === 'declining') score += 10;
    
    // Engagement factors (max 25 points)
    if (data.daysSinceLastSession > 7) score += 20;
    else if (data.daysSinceLastSession > 4) score += 10;
    else if (data.daysSinceLastSession > 2) score += 5;
    
    if (data.sessionsThisWeek === 0) score += 5;
    
    // Avoidance factors (max 25 points)
    if (avoidanceTrend === 'declining') score += 15; // Declining = more avoidance = bad
    if (data.currentAvoidanceCount > 5) score += 10;
    
    // Technique factors (max 20 points)
    if (techniqueTrend === 'declining') score += 15;
    if (data.techniqueSuccessRate < 30) score += 5;
    
    return Math.min(100, score);
  };
  
  const riskScore = calculateRiskScore();
  
  // Determine risk level
  const getRiskLevel = (score: number): RiskLevel => {
    if (score >= 70) return 'critical';
    if (score >= 50) return 'high';
    if (score >= 25) return 'medium';
    return 'low';
  };
  
  const riskLevel = getRiskLevel(riskScore);
  
  // Risk level styling
  const getRiskStyle = (level: RiskLevel) => {
    switch (level) {
      case 'low': return { 
        bg: "bg-success/10", 
        border: "border-success/30", 
        text: "text-success",
        label: "Low Risk"
      };
      case 'medium': return { 
        bg: "bg-gold/10", 
        border: "border-gold/30", 
        text: "text-gold",
        label: "Moderate Risk"
      };
      case 'high': return { 
        bg: "bg-accent-orange/10", 
        border: "border-accent-orange/30", 
        text: "text-accent-orange",
        label: "High Risk"
      };
      case 'critical': return { 
        bg: "bg-destructive/10", 
        border: "border-destructive/30", 
        text: "text-destructive",
        label: "Critical Risk"
      };
    }
  };
  
  const riskStyle = getRiskStyle(riskLevel);
  
  // Get trend icon and color
  const getTrendDisplay = (trend: TrendType, inverted = false) => {
    const actualTrend = inverted ? (trend === 'improving' ? 'declining' : trend === 'declining' ? 'improving' : 'stable') : trend;
    
    switch (actualTrend) {
      case 'improving': return { 
        icon: <TrendingUp className="w-3 h-3" />, 
        color: "text-success",
        label: "Improving"
      };
      case 'declining': return { 
        icon: <TrendingDown className="w-3 h-3" />, 
        color: "text-destructive",
        label: "Declining"
      };
      default: return { 
        icon: <Minus className="w-3 h-3" />, 
        color: "text-muted-foreground",
        label: "Stable"
      };
    }
  };
  
  // Generate recommendations
  const getRecommendations = (): string[] => {
    const recs: string[] = [];
    
    if (data.daysSinceLastSession > 3) {
      recs.push("Schedule a check-in to re-engage with practice routine");
    }
    if (adherenceTrend === 'declining') {
      recs.push("Discuss barriers to practice with family");
    }
    if (avoidanceTrend === 'declining') {
      recs.push("Focus on desensitization for avoided words/sounds");
    }
    if (techniqueTrend === 'declining') {
      recs.push("Review and reinforce technique implementation");
    }
    if (data.currentFluency < 50 && fluencyTrend !== 'improving') {
      recs.push("Consider adjusting difficulty level of practice materials");
    }
    
    if (recs.length === 0) {
      recs.push("Continue current treatment approach");
    }
    
    return recs;
  };

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Shield className="w-4 h-4 text-primary" />
            Relapse Risk
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <span className={cn("font-bold text-sm", riskStyle.text)}>{riskStyle.label}</span>
          </div>
          <Progress value={100 - riskScore} className="h-2" />
          {riskLevel !== 'low' && (
            <div className={cn("flex items-center gap-1 text-xs", riskStyle.text)}>
              <AlertTriangle className="w-3 h-3" />
              <span>Needs attention</span>
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
          <Shield className="w-5 h-5 text-primary" />
          Predictive Relapse Risk Analysis
          <span className="text-xs text-muted-foreground font-normal ml-auto">Early Warning System</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Risk Score Overview */}
        <div className={cn("p-4 rounded-xl border", riskStyle.bg, riskStyle.border)}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              {riskLevel === 'low' 
                ? <CheckCircle className="w-6 h-6 text-success" />
                : <AlertTriangle className={cn("w-6 h-6", riskStyle.text)} />
              }
              <div>
                <span className="text-sm font-medium text-foreground">Overall Risk Assessment</span>
                <p className="text-xs text-muted-foreground">Based on multi-factor analysis</p>
              </div>
            </div>
            <div className="text-right">
              <span className={cn("text-2xl font-bold", riskStyle.text)}>{riskStyle.label}</span>
              <p className="text-xs text-muted-foreground">Score: {riskScore}/100</p>
            </div>
          </div>
          
          <Progress value={100 - riskScore} className="h-3" />
        </div>
        
        {/* Risk Factors */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Risk Factor Analysis
          </h4>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Adherence */}
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Adherence</span>
                {(() => {
                  const display = getTrendDisplay(adherenceTrend);
                  return (
                    <span className={cn("flex items-center gap-1 text-xs", display.color)}>
                      {display.icon}
                      {display.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-lg font-bold text-foreground">{data.currentAdherence.toFixed(0)}%</p>
            </div>
            
            {/* Fluency */}
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Fluency</span>
                {(() => {
                  const display = getTrendDisplay(fluencyTrend);
                  return (
                    <span className={cn("flex items-center gap-1 text-xs", display.color)}>
                      {display.icon}
                      {display.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-lg font-bold text-foreground">{data.currentFluency.toFixed(0)}%</p>
            </div>
            
            {/* Avoidance */}
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Avoidances</span>
                {(() => {
                  const display = getTrendDisplay(avoidanceTrend, true);
                  return (
                    <span className={cn("flex items-center gap-1 text-xs", display.color)}>
                      {display.icon}
                      {display.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-lg font-bold text-foreground">{data.currentAvoidanceCount}</p>
            </div>
            
            {/* Technique */}
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground">Technique</span>
                {(() => {
                  const display = getTrendDisplay(techniqueTrend);
                  return (
                    <span className={cn("flex items-center gap-1 text-xs", display.color)}>
                      {display.icon}
                      {display.label}
                    </span>
                  );
                })()}
              </div>
              <p className="text-lg font-bold text-foreground">{data.techniqueSuccessRate.toFixed(0)}%</p>
            </div>
          </div>
        </div>
        
        {/* Engagement Alert */}
        {data.daysSinceLastSession > 2 && (
          <div className={cn(
            "p-3 rounded-lg flex items-start gap-2",
            data.daysSinceLastSession > 7 ? "bg-destructive/10" : "bg-gold/10"
          )}>
            <AlertTriangle className={cn(
              "w-4 h-4 mt-0.5",
              data.daysSinceLastSession > 7 ? "text-destructive" : "text-gold"
            )} />
            <div>
              <p className={cn(
                "text-sm font-medium",
                data.daysSinceLastSession > 7 ? "text-destructive" : "text-gold"
              )}>
                {data.daysSinceLastSession} days since last practice
              </p>
              <p className="text-xs text-muted-foreground">
                Regular practice is key to maintaining progress
              </p>
            </div>
          </div>
        )}
        
        {/* Recommendations */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-foreground">Recommended Actions</h4>
          <ul className="space-y-1">
            {getRecommendations().map((rec, index) => (
              <li key={index} className="flex items-start gap-2 text-xs text-muted-foreground">
                <span className="text-primary mt-0.5">•</span>
                <span>{rec}</span>
              </li>
            ))}
          </ul>
        </div>
        
        {/* Clinical Note */}
        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-primary">
            <strong>Note:</strong> This predictive analysis uses pattern recognition across 
            engagement, fluency, and behavioral metrics. It serves as an early warning system 
            and should be combined with clinical judgment for treatment decisions.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
