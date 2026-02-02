import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingDown, TrendingUp, Repeat, AlertCircle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrialData {
  trialNumber: number;
  stutterCount: number;
  stutteredWords: string[];
  timestamp: string;
}

interface AdaptationMetrics {
  trials: TrialData[];
  adaptationScore: number | null; // Percentage decrease in stutters across trials
  consistencyWords: string[]; // Words that stuttered in ALL trials
  improvingWords: string[]; // Words that improved across trials
  targetPhrase: string | null;
}

interface AdaptationConsistencyTrackerProps {
  metrics: AdaptationMetrics;
  compact?: boolean;
}

export const AdaptationConsistencyTracker = ({ 
  metrics, 
  compact = false 
}: AdaptationConsistencyTrackerProps) => {
  const { trials, adaptationScore, consistencyWords, improvingWords, targetPhrase } = metrics;
  
  // Calculate adaptation trend
  const getAdaptationRating = (score: number | null): { label: string; color: string; icon: typeof TrendingDown } => {
    if (score === null || trials.length < 2) {
      return { label: "Insufficient Data", color: "text-muted-foreground", icon: Info };
    }
    if (score >= 40) return { label: "Strong Adaptation", color: "text-success", icon: TrendingDown };
    if (score >= 20) return { label: "Moderate Adaptation", color: "text-primary", icon: TrendingDown };
    if (score >= 0) return { label: "Minimal Adaptation", color: "text-gold", icon: TrendingUp };
    return { label: "Negative Adaptation", color: "text-destructive", icon: TrendingUp };
  };
  
  const adaptationRating = getAdaptationRating(adaptationScore);
  const AdaptationIcon = adaptationRating.icon;
  
  // Calculate consistency percentage
  const hasConsistencyPattern = consistencyWords.length > 0;
  const consistencyPercentage = trials.length > 0 && trials[0].stutteredWords.length > 0
    ? (consistencyWords.length / trials[0].stutteredWords.length) * 100
    : 0;
  
  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Repeat className="w-4 h-4 text-primary" />
            Adaptation & Consistency
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Trials Recorded</span>
            <span className="font-bold">{trials.length}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Adaptation</span>
            <span className={cn("font-medium text-sm", adaptationRating.color)}>
              {adaptationScore !== null ? `${adaptationScore > 0 ? '+' : ''}${adaptationScore.toFixed(0)}%` : '—'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Consistent Blocks</span>
            <span className={cn("font-medium", hasConsistencyPattern ? "text-accent-orange" : "text-muted-foreground")}>
              {consistencyWords.length}
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
          <Repeat className="w-5 h-5 text-primary" />
          Adaptation & Consistency Effects
          <span className="text-xs text-muted-foreground font-normal ml-auto">SSI-4 Criteria</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Target Phrase Display */}
        {targetPhrase && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <p className="text-xs text-muted-foreground mb-1">Target Phrase</p>
            <p className="text-sm font-medium text-foreground">"{targetPhrase}"</p>
          </div>
        )}
        
        {/* Trial Overview */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
            Trial-by-Trial Analysis
            <span className="text-xs text-muted-foreground font-normal">
              ({trials.length} trial{trials.length !== 1 ? 's' : ''})
            </span>
          </h4>
          
          {trials.length >= 2 ? (
            <div className="space-y-2">
              {trials.map((trial, index) => {
                const prevTrial = trials[index - 1];
                const change = prevTrial 
                  ? trial.stutterCount - prevTrial.stutterCount 
                  : 0;
                
                return (
                  <div 
                    key={trial.trialNumber}
                    className="flex items-center gap-3 p-2 bg-secondary/20 rounded-lg"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs font-bold text-primary">{trial.trialNumber}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{trial.stutterCount} disfluencies</span>
                        {index > 0 && (
                          <span className={cn(
                            "text-xs font-medium flex items-center gap-1",
                            change < 0 ? "text-success" : change > 0 ? "text-destructive" : "text-muted-foreground"
                          )}>
                            {change < 0 ? <TrendingDown className="w-3 h-3" /> : change > 0 ? <TrendingUp className="w-3 h-3" /> : null}
                            {change !== 0 ? `${change > 0 ? '+' : ''}${change}` : 'No change'}
                          </span>
                        )}
                      </div>
                      <Progress 
                        value={Math.max(0, 100 - (trial.stutterCount * 10))} 
                        className="h-1 mt-1" 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-4 bg-secondary/20 rounded-lg text-center">
              <Info className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                {trials.length === 0 
                  ? "No trial data recorded yet. Have the child read the same passage 3 times."
                  : "Need at least 2 trials to analyze adaptation patterns."}
              </p>
            </div>
          )}
        </div>
        
        {/* Adaptation Score */}
        <div className="p-4 rounded-xl bg-secondary/50 border border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Adaptation Effect</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", adaptationRating.color)}>
              {adaptationRating.label}
            </span>
          </div>
          
          {adaptationScore !== null && trials.length >= 2 ? (
            <>
              <div className="flex items-end gap-4 mb-3">
                <span className={cn("text-4xl font-bold", adaptationRating.color)}>
                  {adaptationScore > 0 ? '-' : '+'}{Math.abs(adaptationScore).toFixed(0)}%
                </span>
                <span className="text-muted-foreground text-sm mb-1">
                  stutter reduction from Trial 1 to {trials.length}
                </span>
              </div>
              <Progress 
                value={adaptationScore > 0 ? Math.min(100, adaptationScore) : 0} 
                className="h-2" 
              />
            </>
          ) : (
            <p className="text-muted-foreground text-sm">
              Record multiple trials of the same passage to measure adaptation
            </p>
          )}
          
          <p className="text-xs text-muted-foreground mt-3">
            {adaptationScore !== null && adaptationScore >= 30
              ? "Good adaptation suggests anxiety may be a factor - stuttering decreases with familiarity"
              : adaptationScore !== null && adaptationScore < 10
                ? "Low adaptation may indicate neurological patterns - consider deeper clinical assessment"
                : "Adaptation shows how stuttering changes with repeated readings of the same material"}
          </p>
        </div>
        
        {/* Consistency Analysis */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-accent-orange/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <AlertCircle className="w-5 h-5 text-accent-orange" />
            </div>
            <p className="text-2xl font-bold text-accent-orange text-center">{consistencyWords.length}</p>
            <p className="text-xs text-muted-foreground text-center">Consistent Blocks</p>
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Same words in all trials
            </p>
          </div>
          
          <div className="p-4 bg-success/10 rounded-lg">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-success" />
            </div>
            <p className="text-2xl font-bold text-success text-center">{improvingWords.length}</p>
            <p className="text-xs text-muted-foreground text-center">Improving Words</p>
            <p className="text-xs text-center mt-1 text-muted-foreground">
              Reduced stuttering
            </p>
          </div>
        </div>
        
        {/* Consistency Words Detail */}
        {consistencyWords.length > 0 && (
          <div className="p-3 bg-accent-orange/10 rounded-lg border border-accent-orange/20">
            <h4 className="text-sm font-medium text-accent-orange mb-2 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              High Consistency Words (Target for Therapy)
            </h4>
            <div className="flex flex-wrap gap-2">
              {consistencyWords.map((word, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-accent-orange/20 text-accent-orange text-xs rounded-full font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These words showed disfluency in every trial - may indicate deep-rooted neurological patterns
            </p>
          </div>
        )}
        
        {/* Improving Words Detail */}
        {improvingWords.length > 0 && (
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <h4 className="text-sm font-medium text-success mb-2 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Improving Words (Positive Signs)
            </h4>
            <div className="flex flex-wrap gap-2">
              {improvingWords.map((word, index) => (
                <span 
                  key={index}
                  className="px-2 py-1 bg-success/20 text-success text-xs rounded-full font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              These words showed improvement across trials - adaptation is working
            </p>
          </div>
        )}
        
        {/* Clinical Interpretation */}
        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-primary">
            <strong>Clinical Insight:</strong> {
              consistencyPercentage > 50
                ? "High consistency (>50%) suggests neurological stuttering patterns. Focus therapy on these specific trigger words with desensitization techniques."
                : adaptationScore !== null && adaptationScore >= 30
                  ? "Strong adaptation indicates situational/anxiety factors. Practice and familiarity help this child - encourage repeated reading exercises."
                  : trials.length < 2
                    ? "Record 3 trials of the same passage to reveal adaptation and consistency patterns."
                    : "Mixed pattern detected. Consider both fluency shaping and psychological approaches."
            }
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
