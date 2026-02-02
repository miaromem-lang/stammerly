import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Pause, Clock, AlertCircle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PauseMetrics {
  linguisticPausesCount: number;
  stutterHesitationsCount: number;
  avgPauseDurationMs: number | null;
  longestBlockMs: number | null;
  secondLongestBlockMs: number | null;
  thirdLongestBlockMs: number | null;
}

interface PauseArchitectureTrackerProps {
  metrics: PauseMetrics;
  compact?: boolean;
}

export const PauseArchitectureTracker = ({ 
  metrics, 
  compact = false 
}: PauseArchitectureTrackerProps) => {
  const totalPauses = metrics.linguisticPausesCount + metrics.stutterHesitationsCount;
  const linguisticPercentage = totalPauses > 0 
    ? (metrics.linguisticPausesCount / totalPauses) * 100 
    : 50;
  
  // Get pause quality rating
  const getPauseQuality = (): { label: string; color: string; description: string } => {
    if (totalPauses === 0) {
      return { label: "No Data", color: "text-muted-foreground", description: "No pauses analyzed" };
    }
    
    if (linguisticPercentage >= 70) {
      return { 
        label: "Excellent", 
        color: "text-success", 
        description: "Most pauses are natural linguistic pauses" 
      };
    }
    if (linguisticPercentage >= 50) {
      return { 
        label: "Good", 
        color: "text-primary", 
        description: "Balanced pause architecture" 
      };
    }
    if (linguisticPercentage >= 30) {
      return { 
        label: "Developing", 
        color: "text-gold", 
        description: "Some stutter hesitations detected - focus on relaxed breathing" 
      };
    }
    return { 
      label: "Needs Focus", 
      color: "text-accent-orange", 
      description: "High stutter hesitation rate - consider tension reduction exercises" 
    };
  };
  
  const pauseQuality = getPauseQuality();
  
  // Format duration
  const formatDuration = (ms: number | null): string => {
    if (ms === null) return '—';
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };
  
  // Get block severity
  const getBlockSeverity = (ms: number | null): { label: string; color: string } => {
    if (ms === null) return { label: "None", color: "text-muted-foreground" };
    if (ms > 1000) return { label: "Severe", color: "text-destructive" };
    if (ms > 500) return { label: "Moderate", color: "text-gold" };
    if (ms > 250) return { label: "Mild", color: "text-primary" };
    return { label: "Brief", color: "text-success" };
  };

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Pause className="w-4 h-4 text-primary" />
            Pause Architecture
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Linguistic</span>
            <span className="font-medium text-sm text-success">{metrics.linguisticPausesCount}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Hesitations</span>
            <span className="font-medium text-sm text-destructive">{metrics.stutterHesitationsCount}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Pause className="w-5 h-5 text-primary" />
          Pause Architecture Analysis
          <span className="text-xs text-muted-foreground font-normal ml-auto">Physicality Command Centre</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Pause Quality Overview */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Pause Quality</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", pauseQuality.color)}>
              {pauseQuality.label}
            </span>
          </div>
          
          <p className="text-xs text-muted-foreground mb-4">{pauseQuality.description}</p>
          
          {/* Linguistic vs Stutter Hesitation Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-success">Linguistic Pauses</span>
              <span className="text-destructive">Stutter Hesitations</span>
            </div>
            <div className="h-4 bg-secondary rounded-full overflow-hidden flex">
              <div 
                className="bg-success/70 transition-all"
                style={{ width: `${linguisticPercentage}%` }}
              />
              <div 
                className="bg-destructive/70 transition-all"
                style={{ width: `${100 - linguisticPercentage}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{metrics.linguisticPausesCount} ({linguisticPercentage.toFixed(0)}%)</span>
              <span>{metrics.stutterHesitationsCount} ({(100 - linguisticPercentage).toFixed(0)}%)</span>
            </div>
          </div>
        </div>
        
        {/* Pause Types Comparison */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-success/10 rounded-lg text-center border border-success/20">
            <CheckCircle className="w-6 h-6 text-success mx-auto mb-2" />
            <p className="text-2xl font-bold text-success">{metrics.linguisticPausesCount}</p>
            <p className="text-xs text-muted-foreground">Linguistic Pauses</p>
            <p className="text-[10px] text-muted-foreground mt-1">Natural breathing points</p>
          </div>
          
          <div className="p-4 bg-destructive/10 rounded-lg text-center border border-destructive/20">
            <AlertCircle className="w-6 h-6 text-destructive mx-auto mb-2" />
            <p className="text-2xl font-bold text-destructive">{metrics.stutterHesitationsCount}</p>
            <p className="text-xs text-muted-foreground">Stutter Hesitations</p>
            <p className="text-[10px] text-muted-foreground mt-1">Pre-block tension pauses</p>
          </div>
        </div>
        
        {/* Average Pause Duration */}
        {metrics.avgPauseDurationMs !== null && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Average Pause Duration</span>
              </div>
              <span className="font-bold text-foreground">{formatDuration(metrics.avgPauseDurationMs)}</span>
            </div>
          </div>
        )}
        
        {/* Longest Blocks (SSI-4 Component) */}
        {(metrics.longestBlockMs || metrics.secondLongestBlockMs || metrics.thirdLongestBlockMs) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">Three Longest Blocks (SSI-4)</h4>
            <p className="text-xs text-muted-foreground">
              Block duration contributes to Weighted Stuttering Severity score
            </p>
            
            <div className="space-y-2">
              {[
                { label: "Longest", value: metrics.longestBlockMs },
                { label: "2nd Longest", value: metrics.secondLongestBlockMs },
                { label: "3rd Longest", value: metrics.thirdLongestBlockMs },
              ].map((block) => {
                const severity = getBlockSeverity(block.value);
                return (
                  <div key={block.label} className="flex items-center justify-between p-2 bg-secondary/20 rounded-lg">
                    <span className="text-xs text-muted-foreground">{block.label}</span>
                    <div className="flex items-center gap-2">
                      <span className={cn("text-xs px-1.5 py-0.5 rounded", severity.color, "bg-secondary")}>
                        {severity.label}
                      </span>
                      <span className="font-mono text-sm font-medium text-foreground">
                        {formatDuration(block.value)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
        
        {/* Clinical Note */}
        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-primary">
            <strong>Clinical Note:</strong> {pauseQuality.label === "Needs Focus" 
              ? "Consider teaching diaphragmatic breathing and 'sliding' technique to reduce pre-block tension."
              : pauseQuality.label === "Developing"
                ? "Continue reinforcing natural breathing patterns and relaxed speech initiation."
                : "Pause architecture shows healthy speech rhythm. Maintain current techniques."}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
