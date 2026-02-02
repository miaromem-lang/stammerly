import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target, CheckCircle, XCircle, TrendingUp, AudioWaveform } from "lucide-react";
import { cn } from "@/lib/utils";

interface AcousticOnsetData {
  easyOnsetSignatures: number;
  partialOnsetSignatures: number;
  hardOnsetSignatures: number;
  overallEasyOnsetScore: number;
}

interface TechniqueMetrics {
  easyOnsetScore: number | null;
  easyOnsetAttempts: number;
  easyOnsetSuccesses: number;
  softContactScore: number | null;
  techniquesObserved: string[];
  acousticAnalysis?: AcousticOnsetData | null;
}

interface TechniqueAccuracyTrackerProps {
  metrics: TechniqueMetrics;
  compact?: boolean;
}

// Acoustic Signature Visualization Component
const AcousticSignatureAnalysis = ({ data }: { data: AcousticOnsetData }) => {
  const total = data.easyOnsetSignatures + data.partialOnsetSignatures + data.hardOnsetSignatures;
  
  if (total === 0) {
    return (
      <div className="p-3 bg-secondary/30 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">No onset patterns detected yet</p>
      </div>
    );
  }

  const easyPercent = (data.easyOnsetSignatures / total) * 100;
  const partialPercent = (data.partialOnsetSignatures / total) * 100;
  const hardPercent = (data.hardOnsetSignatures / total) * 100;

  return (
    <div className="space-y-4 p-4 bg-secondary/30 rounded-xl border border-border">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
          <AudioWaveform className="w-4 h-4 text-primary" />
          Acoustic Signature Analysis
        </h4>
        <span className={cn(
          "text-xs px-2 py-0.5 rounded-full",
          data.overallEasyOnsetScore >= 70 ? "bg-success/20 text-success" :
          data.overallEasyOnsetScore >= 50 ? "bg-gold/20 text-gold" : "bg-destructive/20 text-destructive"
        )}>
          {data.overallEasyOnsetScore}% Score
        </span>
      </div>

      {/* Waveform Visual Representation */}
      <div className="flex items-end justify-center gap-1 h-16 px-4">
        {/* Easy Onset - Gradual Rise */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-full flex items-end justify-center gap-0.5 h-12">
            <div className="w-1 bg-success rounded-t" style={{ height: '20%' }} />
            <div className="w-1 bg-success rounded-t" style={{ height: '35%' }} />
            <div className="w-1 bg-success rounded-t" style={{ height: '50%' }} />
            <div className="w-1 bg-success rounded-t" style={{ height: '70%' }} />
            <div className="w-1 bg-success rounded-t" style={{ height: '85%' }} />
            <div className="w-1 bg-success rounded-t" style={{ height: '100%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Easy Onset</p>
          <p className="text-xs font-bold text-success">{data.easyOnsetSignatures}</p>
        </div>

        {/* Partial Onset - Moderate Rise */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-full flex items-end justify-center gap-0.5 h-12">
            <div className="w-1 bg-gold rounded-t" style={{ height: '30%' }} />
            <div className="w-1 bg-gold rounded-t" style={{ height: '60%' }} />
            <div className="w-1 bg-gold rounded-t" style={{ height: '90%' }} />
            <div className="w-1 bg-gold rounded-t" style={{ height: '100%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Partial</p>
          <p className="text-xs font-bold text-gold">{data.partialOnsetSignatures}</p>
        </div>

        {/* Hard Onset - Abrupt Rise */}
        <div className="flex flex-col items-center flex-1">
          <div className="w-full flex items-end justify-center gap-0.5 h-12">
            <div className="w-1 bg-destructive rounded-t" style={{ height: '10%' }} />
            <div className="w-1 bg-destructive rounded-t" style={{ height: '100%' }} />
            <div className="w-1 bg-destructive rounded-t" style={{ height: '95%' }} />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1">Hard Onset</p>
          <p className="text-xs font-bold text-destructive">{data.hardOnsetSignatures}</p>
        </div>
      </div>

      {/* Distribution Bar */}
      <div className="space-y-1">
        <div className="flex justify-between text-[10px] text-muted-foreground">
          <span>Onset Pattern Distribution</span>
          <span>{total} total</span>
        </div>
        <div className="h-3 rounded-full overflow-hidden flex">
          <div 
            className="h-full bg-success transition-all"
            style={{ width: `${easyPercent}%` }}
            title={`Easy: ${data.easyOnsetSignatures}`}
          />
          <div 
            className="h-full bg-gold transition-all"
            style={{ width: `${partialPercent}%` }}
            title={`Partial: ${data.partialOnsetSignatures}`}
          />
          <div 
            className="h-full bg-destructive transition-all"
            style={{ width: `${hardPercent}%` }}
            title={`Hard: ${data.hardOnsetSignatures}`}
          />
        </div>
      </div>

      {/* Clinical Insight */}
      <p className="text-xs text-muted-foreground">
        {easyPercent >= 70 
          ? "Excellent acoustic signature for Easy Onset technique. Gentle volume rise detected consistently."
          : easyPercent >= 50
            ? "Good progress with Easy Onset. Some utterances show abrupt starts - practice gradual volume increase."
            : "Most utterances show abrupt onset patterns. Focus on starting sounds gently with a soft 'h' sound."}
      </p>
    </div>
  );
};

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
          {metrics.acousticAnalysis && (
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Acoustic Score</span>
              <span className={cn(
                "font-medium text-sm",
                metrics.acousticAnalysis.overallEasyOnsetScore >= 70 ? "text-success" :
                metrics.acousticAnalysis.overallEasyOnsetScore >= 50 ? "text-gold" : "text-destructive"
              )}>
                {metrics.acousticAnalysis.overallEasyOnsetScore}%
              </span>
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

        {/* Acoustic Signature Analysis */}
        {metrics.acousticAnalysis && (
          <AcousticSignatureAnalysis data={metrics.acousticAnalysis} />
        )}
        
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
