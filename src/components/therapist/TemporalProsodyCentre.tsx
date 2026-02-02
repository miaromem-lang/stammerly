import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Clock, Volume2, Mic, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface TemporalMetrics {
  initiationLagMs: number | null;
  naturalnessScore: number | null;
  linguisticPausesCount: number;
  stutterHesitationsCount: number;
  avgPauseDurationMs: number | null;
  pitchVariance?: number | null;
  volumeVariance?: number | null;
}

interface TemporalProsodyCentreProps {
  metrics: TemporalMetrics;
  compact?: boolean;
}

export const TemporalProsodyCentre = ({ 
  metrics, 
  compact = false 
}: TemporalProsodyCentreProps) => {
  const naturalnessScore = metrics.naturalnessScore ?? 5;
  const initiationLag = metrics.initiationLagMs ?? 0;
  
  // Naturalness interpretation
  const getNaturalnessLabel = (score: number): { label: string; color: string; description: string } => {
    if (score <= 2) return { 
      label: "Very Natural", 
      color: "text-success", 
      description: "Speech sounds authentic and effortless" 
    };
    if (score <= 4) return { 
      label: "Natural", 
      color: "text-success", 
      description: "Minor variations from typical speech patterns" 
    };
    if (score <= 6) return { 
      label: "Somewhat Unnatural", 
      color: "text-gold", 
      description: "Some robotic or controlled speech detected" 
    };
    if (score <= 8) return { 
      label: "Unnatural", 
      color: "text-accent-orange", 
      description: "Speech sounds overly controlled or monotone" 
    };
    return { 
      label: "Very Unnatural", 
      color: "text-destructive", 
      description: "Highly controlled speech - may need technique adjustment" 
    };
  };
  
  const naturalness = getNaturalnessLabel(naturalnessScore);
  
  // Initiation lag interpretation (silent block detection)
  const getInitiationLagLabel = (lagMs: number): { label: string; color: string } => {
    if (lagMs < 300) return { label: "Normal", color: "text-success" };
    if (lagMs < 700) return { label: "Mild Delay", color: "text-gold" };
    if (lagMs < 1200) return { label: "Moderate Block", color: "text-accent-orange" };
    return { label: "Severe Block", color: "text-destructive" };
  };
  
  const initiationStatus = getInitiationLagLabel(initiationLag);
  
  // Pause architecture summary
  const totalPauses = metrics.linguisticPausesCount + metrics.stutterHesitationsCount;
  const stutterPauseRatio = totalPauses > 0 
    ? (metrics.stutterHesitationsCount / totalPauses) * 100 
    : 0;

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-gold" />
            Temporal & Prosody
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Naturalness</span>
            <span className={cn("font-bold", naturalness.color)}>{naturalnessScore}/9</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Initiation Lag</span>
            <span className={cn("font-medium text-sm", initiationStatus.color)}>
              {initiationLag > 0 ? `${initiationLag.toFixed(0)}ms` : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Clock className="w-5 h-5 text-gold" />
          Temporal & Prosodic Analysis
          <span className="text-xs text-muted-foreground font-normal ml-auto">Hidden Block Detection</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Naturalness Index */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Naturalness Index (1-9)</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", naturalness.color)}>
              {naturalness.label}
            </span>
          </div>
          
          {/* Visual scale */}
          <div className="flex items-center gap-1 mb-3">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
              <div
                key={n}
                className={cn(
                  "h-8 flex-1 rounded-sm transition-all flex items-center justify-center text-xs font-medium",
                  n === naturalnessScore 
                    ? "bg-primary text-primary-foreground scale-110" 
                    : n < naturalnessScore 
                      ? "bg-success/30 text-success" 
                      : "bg-muted text-muted-foreground"
                )}
              >
                {n === naturalnessScore && n}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between text-[10px] text-muted-foreground mb-2">
            <span>Most Natural</span>
            <span>Most Robotic</span>
          </div>
          
          <p className="text-xs text-muted-foreground">{naturalness.description}</p>
        </div>
        
        {/* Initiation Lag - Silent Block Detection */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Initiation Lag (Silent Block)</span>
            </div>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", initiationStatus.color)}>
              {initiationStatus.label}
            </span>
          </div>
          
          <div className="flex items-end gap-4">
            <span className={cn("text-3xl font-bold", initiationStatus.color)}>
              {initiationLag > 0 ? initiationLag.toFixed(0) : '—'}
            </span>
            <span className="text-muted-foreground text-sm mb-1">ms before first word</span>
          </div>
          
          <p className="text-xs text-muted-foreground mt-2">
            {initiationLag > 700 
              ? "Long delay before speaking may indicate a silent block - the child may be struggling before any sound comes out"
              : initiationLag > 300
                ? "Slight hesitation detected - could be thinking or mild tension"
                : "Quick response time - no significant initiation difficulty"}
          </p>
        </div>
        
        {/* Pause Architecture */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <Activity className="w-4 h-4 text-muted-foreground" />
            Pause Architecture
          </h4>
          
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <p className="text-xl font-bold text-success">{metrics.linguisticPausesCount}</p>
              <p className="text-[10px] text-muted-foreground">Natural Pauses</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <p className="text-xl font-bold text-destructive">{metrics.stutterHesitationsCount}</p>
              <p className="text-[10px] text-muted-foreground">Stutter Hesitations</p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg text-center">
              <p className="text-xl font-bold text-foreground">
                {metrics.avgPauseDurationMs ? metrics.avgPauseDurationMs.toFixed(0) : '—'}
              </p>
              <p className="text-[10px] text-muted-foreground">Avg Pause (ms)</p>
            </div>
          </div>
          
          {totalPauses > 0 && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Natural Pauses</span>
                <span>Stutter Hesitations ({stutterPauseRatio.toFixed(0)}%)</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-success transition-all"
                  style={{ width: `${100 - stutterPauseRatio}%` }}
                />
                <div 
                  className="h-full bg-destructive transition-all"
                  style={{ width: `${stutterPauseRatio}%` }}
                />
              </div>
            </div>
          )}
        </div>
        
        {/* Pitch & Volume Variance (placeholder for future audio analysis) */}
        {(metrics.pitchVariance !== undefined || metrics.volumeVariance !== undefined) && (
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Volume2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Volume Variance</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {metrics.volumeVariance?.toFixed(1) ?? '—'}
              </p>
            </div>
            <div className="p-3 bg-secondary/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Pitch Variance</span>
              </div>
              <p className="text-lg font-bold text-foreground">
                {metrics.pitchVariance?.toFixed(1) ?? '—'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
