import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EyeOff, AlertTriangle, TrendingUp, BookOpen } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordAvoidanceTrackerProps {
  avoidances: string[];
  fearedPhonemes?: string[];
  compact?: boolean;
}

export const WordAvoidanceTracker = ({ 
  avoidances, 
  fearedPhonemes = [],
  compact = false 
}: WordAvoidanceTrackerProps) => {
  // Group avoidances by initial phoneme
  const avoidancesByPhoneme = avoidances.reduce((acc, word) => {
    const phoneme = word[0]?.toLowerCase() || 'other';
    if (!acc[phoneme]) acc[phoneme] = [];
    acc[phoneme].push(word);
    return acc;
  }, {} as Record<string, string[]>);
  
  // Get severity level
  const getSeverity = (): { label: string; color: string; bgColor: string } => {
    if (avoidances.length === 0) {
      return { label: "None Detected", color: "text-success", bgColor: "bg-success/10" };
    }
    if (avoidances.length <= 2) {
      return { label: "Minimal", color: "text-primary", bgColor: "bg-primary/10" };
    }
    if (avoidances.length <= 5) {
      return { label: "Moderate", color: "text-gold", bgColor: "bg-gold/10" };
    }
    return { label: "Significant", color: "text-destructive", bgColor: "bg-destructive/10" };
  };
  
  const severity = getSeverity();

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <EyeOff className="w-4 h-4 text-gold" />
            Word Avoidances
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Detected</span>
            <span className={cn("font-bold", severity.color)}>{avoidances.length}</span>
          </div>
          {avoidances.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {avoidances.slice(0, 3).map((word, i) => (
                <Badge key={i} variant="secondary" className="text-[10px]">{word}</Badge>
              ))}
              {avoidances.length > 3 && (
                <Badge variant="outline" className="text-[10px]">+{avoidances.length - 3}</Badge>
              )}
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
          <EyeOff className="w-5 h-5 text-gold" />
          Avoidance & Expectancy Log
          <span className="text-xs text-muted-foreground font-normal ml-auto">Cognitive Patterns</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overview */}
        <div className={cn("p-4 rounded-xl border", severity.bgColor, "border-border")}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">Avoidance Behavior</span>
            <span className={cn("text-xs px-2 py-0.5 rounded-full bg-secondary", severity.color)}>
              {severity.label}
            </span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-center">
              <p className={cn("text-3xl font-bold", severity.color)}>{avoidances.length}</p>
              <p className="text-xs text-muted-foreground">Words Avoided</p>
            </div>
            
            {fearedPhonemes.length > 0 && (
              <div className="text-center border-l border-border pl-4">
                <p className="text-3xl font-bold text-foreground">{fearedPhonemes.length}</p>
                <p className="text-xs text-muted-foreground">Feared Sounds</p>
              </div>
            )}
          </div>
        </div>
        
        {/* Word Avoidances List */}
        {avoidances.length > 0 ? (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-gold" />
              Potentially Avoided Words
            </h4>
            <p className="text-xs text-muted-foreground">
              Words present in target phrase but not spoken (possible synonym substitution or avoidance)
            </p>
            
            <div className="flex flex-wrap gap-2">
              {avoidances.map((word, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-sm py-1 px-3 bg-gold/10 text-gold border-gold/30"
                >
                  {word}
                </Badge>
              ))}
            </div>
            
            {/* Grouped by phoneme */}
            {Object.keys(avoidancesByPhoneme).length > 1 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs text-muted-foreground font-medium">Grouped by Initial Sound:</p>
                <div className="grid grid-cols-2 gap-2">
                  {Object.entries(avoidancesByPhoneme).map(([phoneme, words]) => (
                    <div key={phoneme} className="p-2 bg-secondary/30 rounded-lg">
                      <span className="font-mono text-sm text-primary">/{phoneme}/</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {words.length} word{words.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4 bg-success/10 rounded-lg text-center">
            <p className="text-sm text-success font-medium">No avoidance patterns detected</p>
            <p className="text-xs text-muted-foreground mt-1">
              Child attempted all target words without substitution
            </p>
          </div>
        )}
        
        {/* Feared Phonemes */}
        {fearedPhonemes.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-muted-foreground" />
              Known Feared Sounds
            </h4>
            
            <div className="flex flex-wrap gap-2">
              {fearedPhonemes.map((phoneme, index) => (
                <Badge 
                  key={index} 
                  variant="outline" 
                  className="font-mono text-sm"
                >
                  /{phoneme}/
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {/* Desensitization Recommendation */}
        {avoidances.length > 2 && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <div className="flex items-start gap-2">
              <TrendingUp className="w-4 h-4 text-primary mt-0.5" />
              <div>
                <p className="text-xs text-primary font-medium">Desensitization Recommended</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Consider creating targeted exercises for the avoided words, starting with low-pressure 
                  repetition tasks and gradually increasing complexity.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* Clinical Note */}
        <div className="p-3 bg-secondary/30 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Note:</strong> Word avoidance detection compares target phrases with transcribed speech. 
            Some detected "avoidances" may be natural word choices rather than fear-based substitutions. 
            Use clinical judgment and multiple sessions for accurate assessment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
