import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

interface IcebergMetrics {
  objectiveSeverity: number; // WSS or similar
  subjectiveRating: number | null; // SUDS or parent rating
  anxietyBefore?: number | null;
  anxietyAfter?: number | null;
  situationContext?: string;
}

interface EnvironmentData {
  environment: string;
  sessionCount: number;
  avgFluency: number;
  avgAnxiety?: number;
}

interface IcebergCommandCentreProps {
  metrics: IcebergMetrics;
  environmentData?: EnvironmentData[];
  compact?: boolean;
}

export const IcebergCommandCentre = ({ 
  metrics, 
  environmentData = [],
  compact = false 
}: IcebergCommandCentreProps) => {
  // Calculate objective vs subjective gap
  // High gap (high anxiety but low stuttering) flags need for social-emotional intervention
  const hasSubjective = metrics.subjectiveRating !== null;
  const gap = hasSubjective 
    ? Math.abs((metrics.subjectiveRating! * 10) - metrics.objectiveSeverity) 
    : null;
  
  // Interpret the gap
  const getGapInterpretation = (gap: number | null, subjective: number | null, objective: number): {
    label: string;
    color: string;
    description: string;
    needsIntervention: boolean;
  } => {
    if (gap === null || subjective === null) {
      return { 
        label: "No Data", 
        color: "text-muted-foreground", 
        description: "Need subjective rating to compare",
        needsIntervention: false
      };
    }
    
    // High subjective (feels bad) but low objective (not much stuttering)
    if (subjective > 6 && objective < 30) {
      return {
        label: "Emotional Focus Needed",
        color: "text-destructive",
        description: "Child feels significant distress despite low observable stuttering - focus on emotional support",
        needsIntervention: true
      };
    }
    
    // Low subjective (feels fine) but high objective (lots of stuttering)
    if (subjective < 4 && objective > 50) {
      return {
        label: "Good Coping",
        color: "text-success",
        description: "Child manages well emotionally despite speech challenges",
        needsIntervention: false
      };
    }
    
    // Aligned scores
    if (gap < 20) {
      return {
        label: "Aligned",
        color: "text-primary",
        description: "Subjective experience matches objective measurements",
        needsIntervention: false
      };
    }
    
    // Moderate gap
    return {
      label: "Monitor",
      color: "text-gold",
      description: "Some disconnect between feelings and observable speech",
      needsIntervention: false
    };
  };
  
  const gapInterpretation = getGapInterpretation(gap, metrics.subjectiveRating, metrics.objectiveSeverity);

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Brain className="w-4 h-4 text-primary" />
            Psychosocial
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Obj/Subj Gap</span>
            <span className={cn("font-bold", gapInterpretation.color)}>
              {gap !== null ? gap.toFixed(0) : '—'}
            </span>
          </div>
          {gapInterpretation.needsIntervention && (
            <div className="flex items-center gap-1 text-xs text-destructive">
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
          <Brain className="w-5 h-5 text-primary" />
          Iceberg Command Centre
          <span className="text-xs text-muted-foreground font-normal ml-auto">Psychosocial & Behavioural</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Objective vs Subjective Gap */}
        <div className={cn(
          "p-4 rounded-xl border",
          gapInterpretation.needsIntervention 
            ? "bg-destructive/10 border-destructive/30" 
            : "bg-secondary/50 border-border"
        )}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-foreground">Objective vs Subjective Gap</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", gapInterpretation.color)}>
              {gapInterpretation.label}
            </span>
          </div>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Objective */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">AI Detected (WSS)</p>
              <p className="text-2xl font-bold text-foreground">{metrics.objectiveSeverity.toFixed(0)}</p>
              <Progress value={100 - metrics.objectiveSeverity} className="h-1 mt-2" />
            </div>
            
            {/* Subjective */}
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">Child's Feeling (SUDS)</p>
              <p className="text-2xl font-bold text-foreground">
                {metrics.subjectiveRating !== null ? metrics.subjectiveRating : '—'}
              </p>
              {metrics.subjectiveRating !== null && (
                <Progress value={(10 - metrics.subjectiveRating) * 10} className="h-1 mt-2" />
              )}
            </div>
          </div>
          
          {gapInterpretation.needsIntervention && (
            <div className="flex items-start gap-2 p-2 bg-destructive/20 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-destructive mt-0.5" />
              <p className="text-xs text-destructive">{gapInterpretation.description}</p>
            </div>
          )}
          
          {!gapInterpretation.needsIntervention && gap !== null && (
            <p className="text-xs text-muted-foreground">{gapInterpretation.description}</p>
          )}
        </div>
        
        {/* Anxiety Before/After */}
        {(metrics.anxietyBefore !== null || metrics.anxietyAfter !== null) && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Heart className="w-4 h-4 text-muted-foreground" />
              Session Anxiety
            </h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">Before</p>
                <p className={cn(
                  "text-2xl font-bold",
                  (metrics.anxietyBefore ?? 0) > 6 ? "text-destructive" : 
                  (metrics.anxietyBefore ?? 0) > 3 ? "text-gold" : "text-success"
                )}>
                  {metrics.anxietyBefore ?? '—'}
                </p>
              </div>
              <div className="p-3 bg-secondary/30 rounded-lg text-center">
                <p className="text-xs text-muted-foreground mb-1">After</p>
                <p className={cn(
                  "text-2xl font-bold",
                  (metrics.anxietyAfter ?? 0) > 6 ? "text-destructive" : 
                  (metrics.anxietyAfter ?? 0) > 3 ? "text-gold" : "text-success"
                )}>
                  {metrics.anxietyAfter ?? '—'}
                </p>
              </div>
            </div>
            
            {metrics.anxietyBefore !== null && metrics.anxietyAfter !== null && (
              <div className="flex items-center justify-center gap-2">
                {metrics.anxietyAfter < metrics.anxietyBefore ? (
                  <>
                    <TrendingDown className="w-4 h-4 text-success" />
                    <span className="text-xs text-success">
                      Anxiety reduced by {metrics.anxietyBefore - metrics.anxietyAfter} points
                    </span>
                  </>
                ) : metrics.anxietyAfter > metrics.anxietyBefore ? (
                  <>
                    <TrendingUp className="w-4 h-4 text-destructive" />
                    <span className="text-xs text-destructive">
                      Anxiety increased by {metrics.anxietyAfter - metrics.anxietyBefore} points
                    </span>
                  </>
                ) : (
                  <span className="text-xs text-muted-foreground">No change in anxiety</span>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Situational Heatmap */}
        {environmentData.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Situational Heatmap
            </h4>
            <p className="text-xs text-muted-foreground">
              Fluency levels across different environments
            </p>
            
            <div className="space-y-2">
              {environmentData.map((env) => (
                <div key={env.environment} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground capitalize">{env.environment}</span>
                    <span className={cn(
                      env.avgFluency >= 70 ? "text-success" : 
                      env.avgFluency >= 50 ? "text-gold" : "text-destructive"
                    )}>
                      {env.avgFluency.toFixed(0)}% fluency
                    </span>
                  </div>
                  <Progress value={env.avgFluency} className="h-2" />
                  <p className="text-[10px] text-muted-foreground">
                    {env.sessionCount} session{env.sessionCount !== 1 ? 's' : ''}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Situation Context */}
        {metrics.situationContext && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Current Context</p>
            <p className="text-sm font-medium text-foreground">{metrics.situationContext}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
