import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface SurfaceMetrics {
  weightedStutteringSeverity: number | null;
  percentSyllablesStuttered: number | null;
  sldCount: number;
  odCount: number;
  syllablesPerMinute: number | null;
  articulationRate: number | null;
  blocksCount: number;
  prolongationsCount: number;
  repetitionsCount: number;
}

interface SurfaceCommandCentreProps {
  metrics: SurfaceMetrics;
  previousMetrics?: SurfaceMetrics | null;
  compact?: boolean;
}

export const SurfaceCommandCentre = ({ 
  metrics, 
  previousMetrics,
  compact = false 
}: SurfaceCommandCentreProps) => {
  const wss = metrics.weightedStutteringSeverity ?? 0;
  const prevWss = previousMetrics?.weightedStutteringSeverity ?? null;
  
  // Determine severity level
  const getSeverityLevel = (wss: number): { label: string; color: string; bgColor: string } => {
    if (wss <= 10) return { label: "Very Mild", color: "text-success", bgColor: "bg-success/20" };
    if (wss <= 20) return { label: "Mild", color: "text-success", bgColor: "bg-success/20" };
    if (wss <= 35) return { label: "Moderate", color: "text-gold", bgColor: "bg-gold/20" };
    if (wss <= 50) return { label: "Severe", color: "text-accent-orange", bgColor: "bg-accent-orange/20" };
    return { label: "Very Severe", color: "text-destructive", bgColor: "bg-destructive/20" };
  };
  
  const severity = getSeverityLevel(wss);
  
  // Calculate trend
  const getTrend = (current: number, previous: number | null) => {
    if (previous === null) return null;
    const diff = current - previous;
    if (Math.abs(diff) < 1) return { direction: 'stable', value: 0 };
    return { 
      direction: diff < 0 ? 'improving' : 'worsening', 
      value: Math.abs(diff).toFixed(1) 
    };
  };
  
  const wssTrend = getTrend(wss, prevWss);
  
  // SLD vs OD ratio display
  const totalDisfluencies = metrics.sldCount + metrics.odCount;
  const sldPercentage = totalDisfluencies > 0 ? (metrics.sldCount / totalDisfluencies) * 100 : 0;
  
  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Activity className="w-4 h-4 text-primary" />
            Fluency Metrics
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">WSS Score</span>
            <div className="flex items-center gap-2">
              <span className={cn("font-bold", severity.color)}>{wss.toFixed(1)}</span>
              {wssTrend && wssTrend.direction !== 'stable' && (
                wssTrend.direction === 'improving' 
                  ? <TrendingDown className="w-3 h-3 text-success" />
                  : <TrendingUp className="w-3 h-3 text-destructive" />
              )}
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">%SS</span>
            <span className="font-medium text-sm">{(metrics.percentSyllablesStuttered ?? 0).toFixed(1)}%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">SLD/OD</span>
            <span className="font-medium text-sm">{metrics.sldCount}/{metrics.odCount}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="w-5 h-5 text-primary" />
          Surface Command Centre
          <span className="text-xs text-muted-foreground font-normal ml-auto">Acoustic & Fluency</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* WSS - North Star Metric */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">Weighted Stuttering Severity (WSS)</span>
              <span className={cn("text-xs px-2 py-0.5 rounded-full", severity.bgColor, severity.color)}>
                {severity.label}
              </span>
            </div>
            {wssTrend && (
              <div className={cn(
                "flex items-center gap-1 text-xs",
                wssTrend.direction === 'improving' ? "text-success" : 
                wssTrend.direction === 'worsening' ? "text-destructive" : "text-muted-foreground"
              )}>
                {wssTrend.direction === 'improving' && <TrendingDown className="w-3 h-3" />}
                {wssTrend.direction === 'worsening' && <TrendingUp className="w-3 h-3" />}
                {wssTrend.direction === 'stable' && <Minus className="w-3 h-3" />}
                {wssTrend.direction !== 'stable' && <span>{wssTrend.value} pts</span>}
              </div>
            )}
          </div>
          <div className="flex items-end gap-4">
            <span className={cn("text-4xl font-bold", severity.color)}>{wss.toFixed(1)}</span>
            <span className="text-muted-foreground text-sm mb-1">/100 (lower is better)</span>
          </div>
          <Progress value={100 - wss} className="h-2 mt-3" />
        </div>
        
        {/* Grid of metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* %SS */}
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-primary">{(metrics.percentSyllablesStuttered ?? 0).toFixed(1)}%</p>
            <p className="text-xs text-muted-foreground">Syllables Stuttered</p>
          </div>
          
          {/* SPM */}
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{(metrics.syllablesPerMinute ?? 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Syllables/Min</p>
          </div>
          
          {/* Articulation Rate */}
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            <p className="text-2xl font-bold text-foreground">{(metrics.articulationRate ?? 0).toFixed(0)}</p>
            <p className="text-xs text-muted-foreground">Articulation Rate</p>
          </div>
          
          {/* Speech Rate Comparator */}
          <div className="p-3 bg-secondary/30 rounded-lg text-center">
            {metrics.syllablesPerMinute && metrics.articulationRate && (
              <>
                <p className={cn(
                  "text-2xl font-bold",
                  Math.abs(metrics.articulationRate - metrics.syllablesPerMinute) > 30 
                    ? "text-gold" : "text-success"
                )}>
                  {Math.abs((metrics.articulationRate ?? 0) - (metrics.syllablesPerMinute ?? 0)).toFixed(0)}
                </p>
                <p className="text-xs text-muted-foreground">Rate Difference</p>
              </>
            )}
          </div>
        </div>
        
        {/* SLD vs OD Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            Dysfluency Type Distribution
            <span className="text-xs text-muted-foreground font-normal">
              (SLD = Stutter-Like, OD = Other)
            </span>
          </h4>
          
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-destructive">SLD: {metrics.sldCount}</span>
                <span className="text-muted-foreground">OD: {metrics.odCount}</span>
              </div>
              <div className="h-3 bg-muted rounded-full overflow-hidden flex">
                <div 
                  className="h-full bg-destructive transition-all"
                  style={{ width: `${sldPercentage}%` }}
                />
                <div 
                  className="h-full bg-muted-foreground/30 transition-all"
                  style={{ width: `${100 - sldPercentage}%` }}
                />
              </div>
            </div>
            
            {sldPercentage > 70 && (
              <AlertTriangle className="w-4 h-4 text-gold" />
            )}
            {sldPercentage <= 30 && (
              <CheckCircle className="w-4 h-4 text-success" />
            )}
          </div>
          
          <p className="text-xs text-muted-foreground">
            {sldPercentage > 50 
              ? "More stutter-like disfluencies than normal - focus on fluency techniques"
              : "Good ratio of normal disfluencies - progressing well"}
          </p>
        </div>
        
        {/* Stutter Types Breakdown */}
        <div className="grid grid-cols-3 gap-2">
          <div className="p-2 bg-destructive/10 rounded-lg text-center">
            <p className="text-lg font-bold text-destructive">{metrics.blocksCount}</p>
            <p className="text-[10px] text-muted-foreground">Blocks</p>
          </div>
          <div className="p-2 bg-accent-orange/10 rounded-lg text-center">
            <p className="text-lg font-bold text-accent-orange">{metrics.prolongationsCount}</p>
            <p className="text-[10px] text-muted-foreground">Prolongations</p>
          </div>
          <div className="p-2 bg-gold/10 rounded-lg text-center">
            <p className="text-lg font-bold text-gold">{metrics.repetitionsCount}</p>
            <p className="text-[10px] text-muted-foreground">Repetitions</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
