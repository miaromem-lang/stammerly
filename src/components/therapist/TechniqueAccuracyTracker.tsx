import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, XCircle, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface TechniqueMetrics {
  easyOnsetScore: number | null;
  easyOnsetAttempts: number;
  easyOnsetSuccesses: number;
  softContactScore: number | null;
  techniquesObserved: string[];
}

interface TechniqueAccuracyTrackerProps {
  metrics: TechniqueMetrics;
  compact?: boolean;
}

export const TechniqueAccuracyTracker = ({ 
  metrics, 
  compact = false 
}: TechniqueAccuracyTrackerProps) => {
  // Calculate success rate
  const successRate = metrics.easyOnsetAttempts > 0 
    ? (metrics.easyOnsetSuccesses / metrics.easyOnsetAttempts) * 100 
    : null;
  
  // Get rating for success rate
  const getSuccessRating = (rate: number | null): { label: string; color: string } => {
    if (rate === null) return { label: "No Data", color: "text-muted-foreground" };
    if (rate >= 80) return { label: "Excellent", color: "text-success" };
    if (rate >= 60) return { label: "Good", color: "text-primary" };
    if (rate >= 40) return { label: "Developing", color: "text-gold" };
    return { label: "Needs Practice", color: "text-accent-orange" };
  };
  
  const successRating = getSuccessRating(successRate);
  
  // Known techniques
  const allTechniques = [
    { id: 'easy-onset', name: 'Easy Onset', description: 'Gentle start to sounds' },
    { id: 'light-contact', name: 'Light Contact', description: 'Soft articulator contact' },
    { id: 'slow-speech', name: 'Slow Speech', description: 'Reduced speaking rate' },
    { id: 'diaphragmatic', name: 'Diaphragmatic Breathing', description: 'Deep belly breathing' },
    { id: 'prolongation', name: 'Voluntary Prolongation', description: 'Stretching sounds deliberately' },
    { id: 'pausing', name: 'Strategic Pausing', description: 'Planned pauses in speech' },
  ];

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Target className="w-4 h-4 text-success" />
            Technique Accuracy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Easy Onset Rate</span>
            <span className={cn("font-bold", successRating.color)}>
              {successRate !== null ? `${successRate.toFixed(0)}%` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Techniques Used</span>
            <span className="font-medium text-sm">{metrics.techniquesObserved.length}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Target className="w-5 h-5 text-success" />
          Technique Accuracy Tracker
          <span className="text-xs text-muted-foreground font-normal ml-auto">Practice Quality</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Easy Onset Success Rate - Primary Metric */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Easy Onset Success Rate</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", successRating.color)}>
              {successRating.label}
            </span>
          </div>
          
          {successRate !== null ? (
            <>
              <div className="flex items-end gap-4 mb-3">
                <span className={cn("text-4xl font-bold", successRating.color)}>
                  {successRate.toFixed(0)}%
                </span>
                <span className="text-muted-foreground text-sm mb-1">
                  ({metrics.easyOnsetSuccesses}/{metrics.easyOnsetAttempts} attempts)
                </span>
              </div>
              <Progress value={successRate} className="h-2" />
            </>
          ) : (
            <p className="text-muted-foreground text-sm">No technique attempts recorded in this session</p>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            {successRate !== null && successRate < 50 
              ? "Child may be practicing technique incorrectly - consider reviewing the approach"
              : successRate !== null && successRate >= 80
                ? "Excellent technique execution! Child is mastering the skill"
                : "Continue monitoring technique usage and provide feedback"}
          </p>
        </div>
        
        {/* Attempts Breakdown */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-success/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success">{metrics.easyOnsetSuccesses}</p>
            <p className="text-xs text-muted-foreground">Successful Uses</p>
          </div>
          
          <div className="p-4 bg-destructive/10 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <XCircle className="w-5 h-5 text-destructive" />
            </div>
            <p className="text-2xl font-bold text-destructive">
              {metrics.easyOnsetAttempts - metrics.easyOnsetSuccesses}
            </p>
            <p className="text-xs text-muted-foreground">Incomplete Uses</p>
          </div>
        </div>
        
        {/* Soft Contact Score */}
        {metrics.softContactScore !== null && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-foreground">Soft Contact Score</span>
              <span className={cn(
                "font-bold",
                metrics.softContactScore >= 70 ? "text-success" : 
                metrics.softContactScore >= 50 ? "text-gold" : "text-accent-orange"
              )}>
                {metrics.softContactScore}%
              </span>
            </div>
            <Progress value={metrics.softContactScore} className="h-2" />
          </div>
        )}
        
        {/* Techniques Observed */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
            Techniques Checklist
          </h4>
          
          <div className="grid grid-cols-2 gap-2">
            {allTechniques.map((technique) => {
              const isObserved = metrics.techniquesObserved.some(
                t => t.toLowerCase().includes(technique.id.replace('-', ' ')) || 
                     t.toLowerCase().includes(technique.name.toLowerCase())
              );
              
              return (
                <div 
                  key={technique.id}
                  className={cn(
                    "p-2 rounded-lg border transition-colors",
                    isObserved 
                      ? "bg-success/10 border-success/30" 
                      : "bg-secondary/30 border-border"
                  )}
                >
                  <div className="flex items-center gap-2">
                    {isObserved 
                      ? <CheckCircle className="w-4 h-4 text-success" />
                      : <div className="w-4 h-4 rounded-full border border-muted-foreground" />
                    }
                    <span className={cn(
                      "text-xs font-medium",
                      isObserved ? "text-success" : "text-muted-foreground"
                    )}>
                      {technique.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Clinical Note */}
        {metrics.techniquesObserved.length > 0 && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              <strong>Session Note:</strong> {metrics.techniquesObserved.length} technique(s) observed: {metrics.techniquesObserved.join(', ')}.
              {successRate !== null && successRate < 60 && 
                " Consider reviewing technique implementation with the child."}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
