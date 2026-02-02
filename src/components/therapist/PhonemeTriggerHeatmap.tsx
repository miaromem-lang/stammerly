import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Grid3X3, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhonemeTrigger {
  phoneme: string;
  count: number;
  avgDurationMs: number;
  words: string[];
}

interface PhonemeTriggerHeatmapProps {
  triggers: PhonemeTrigger[];
  wordAvoidances?: string[];
  compact?: boolean;
}

export const PhonemeTriggerHeatmap = ({ 
  triggers, 
  wordAvoidances = [],
  compact = false 
}: PhonemeTriggerHeatmapProps) => {
  // Sort triggers by count (most problematic first)
  const sortedTriggers = [...triggers].sort((a, b) => b.count - a.count);
  
  // Get heat intensity based on count
  const getHeatColor = (count: number, maxCount: number): string => {
    const intensity = maxCount > 0 ? count / maxCount : 0;
    if (intensity > 0.8) return "bg-destructive text-destructive-foreground";
    if (intensity > 0.6) return "bg-accent-orange text-white";
    if (intensity > 0.4) return "bg-gold text-foreground";
    if (intensity > 0.2) return "bg-gold/50 text-foreground";
    return "bg-muted text-muted-foreground";
  };
  
  const maxCount = sortedTriggers.length > 0 ? sortedTriggers[0].count : 1;
  
  // All phonemes for comprehensive display
  const allPhonemes = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z', 'th', 'sh', 'ch', 'wh', 'ph'];
  
  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Grid3X3 className="w-4 h-4 text-accent-orange" />
            Phoneme Triggers
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedTriggers.length > 0 ? (
            <div className="flex flex-wrap gap-1">
              {sortedTriggers.slice(0, 5).map((trigger) => (
                <span
                  key={trigger.phoneme}
                  className={cn(
                    "px-2 py-1 rounded-md text-xs font-mono font-bold",
                    getHeatColor(trigger.count, maxCount)
                  )}
                >
                  /{trigger.phoneme}/ ({trigger.count})
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">No significant triggers detected</p>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Grid3X3 className="w-5 h-5 text-accent-orange" />
          Phoneme Trigger Heatmap
          <span className="text-xs text-muted-foreground font-normal ml-auto">Feared Sounds</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Visual Heatmap Grid */}
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Sounds that triggered the most disfluencies (darker = more problematic)
          </p>
          
          <div className="grid grid-cols-6 sm:grid-cols-9 gap-1">
            {allPhonemes.map((phoneme) => {
              const trigger = triggers.find(t => t.phoneme === phoneme);
              const count = trigger?.count || 0;
              
              return (
                <div
                  key={phoneme}
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center text-xs font-mono font-bold transition-all",
                    count > 0 
                      ? getHeatColor(count, maxCount)
                      : "bg-secondary/30 text-muted-foreground/50"
                  )}
                  title={trigger 
                    ? `/${phoneme}/: ${count} occurrences, avg ${trigger.avgDurationMs.toFixed(0)}ms`
                    : `/${phoneme}/: No issues detected`
                  }
                >
                  {phoneme}
                </div>
              );
            })}
          </div>
          
          {/* Legend */}
          <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-secondary/30" />
              <span>None</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gold/50" />
              <span>Low</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-gold" />
              <span>Medium</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-accent-orange" />
              <span>High</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded bg-destructive" />
              <span>Severe</span>
            </div>
          </div>
        </div>
        
        {/* Top Triggers Detail */}
        {sortedTriggers.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground">
              Top Problem Sounds
            </h4>
            
            <div className="space-y-2">
              {sortedTriggers.slice(0, 5).map((trigger, index) => (
                <div 
                  key={trigger.phoneme}
                  className="flex items-center gap-3 p-2 bg-secondary/30 rounded-lg"
                >
                  <span className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm",
                    getHeatColor(trigger.count, maxCount)
                  )}>
                    {trigger.phoneme}
                  </span>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-foreground">
                        /{trigger.phoneme}/ sound
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {trigger.count} occurrences
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Avg duration: {trigger.avgDurationMs.toFixed(0)}ms • 
                      Words: {trigger.words.slice(0, 3).join(', ')}{trigger.words.length > 3 ? '...' : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Word Avoidances */}
        {wordAvoidances.length > 0 && (
          <div className="p-4 rounded-xl bg-gold/10 border border-gold/20">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-gold" />
              <span className="text-sm font-medium text-foreground">Possible Word Avoidances</span>
            </div>
            <p className="text-xs text-muted-foreground mb-2">
              These words from the target phrase were not spoken - may indicate avoidance behavior:
            </p>
            <div className="flex flex-wrap gap-1">
              {wordAvoidances.map((word, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-gold/20 text-gold rounded-md text-xs font-medium"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}
        
        {/* No triggers message */}
        {sortedTriggers.length === 0 && wordAvoidances.length === 0 && (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              No significant phoneme triggers or avoidances detected in recent sessions.
            </p>
          </div>
        )}
        
        {/* Clinical Recommendation */}
        {sortedTriggers.length > 0 && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              <strong>Clinical Recommendation:</strong> Focus desensitization exercises on the 
              /{sortedTriggers[0].phoneme}/ sound, which shows the highest trigger frequency.
              Consider creating word lists that gradually introduce this sound in different positions.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
