import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { MapPin, Home, School, Phone, Users, Mic, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface EnvironmentData {
  environment: string;
  sessionCount: number;
  avgFluency: number;
  avgAnxiety?: number | null;
  trend?: 'improving' | 'stable' | 'declining';
}

interface SituationalHeatmapProps {
  environmentData: EnvironmentData[];
  compact?: boolean;
}

// Environment icons and labels
const environmentConfig: Record<string, { icon: React.ReactNode; label: string; description: string }> = {
  home: { 
    icon: <Home className="w-4 h-4" />, 
    label: "Home", 
    description: "Familiar, low-pressure environment" 
  },
  school: { 
    icon: <School className="w-4 h-4" />, 
    label: "School", 
    description: "Academic and peer setting" 
  },
  phone: { 
    icon: <Phone className="w-4 h-4" />, 
    label: "Phone", 
    description: "Telephone conversations" 
  },
  social: { 
    icon: <Users className="w-4 h-4" />, 
    label: "Social", 
    description: "Social gatherings and groups" 
  },
  therapy: { 
    icon: <Mic className="w-4 h-4" />, 
    label: "Therapy", 
    description: "Clinical session environment" 
  },
  app: { 
    icon: <Mic className="w-4 h-4" />, 
    label: "App Practice", 
    description: "Stammerly app sessions" 
  },
};

export const SituationalHeatmap = ({ 
  environmentData, 
  compact = false 
}: SituationalHeatmapProps) => {
  // Sort by session count (most practiced first)
  const sortedData = [...environmentData].sort((a, b) => b.sessionCount - a.sessionCount);
  
  // Find best and worst environments
  const bestEnv = sortedData.reduce((best, curr) => 
    curr.avgFluency > best.avgFluency ? curr : best, sortedData[0]
  );
  const worstEnv = sortedData.reduce((worst, curr) => 
    curr.avgFluency < worst.avgFluency ? curr : worst, sortedData[0]
  );
  
  // Get fluency color
  const getFluencyColor = (fluency: number): string => {
    if (fluency >= 80) return "text-success";
    if (fluency >= 60) return "text-primary";
    if (fluency >= 40) return "text-gold";
    return "text-destructive";
  };
  
  // Get heat level for background
  const getHeatLevel = (fluency: number): string => {
    if (fluency >= 80) return "bg-success/20 border-success/30";
    if (fluency >= 60) return "bg-primary/20 border-primary/30";
    if (fluency >= 40) return "bg-gold/20 border-gold/30";
    return "bg-destructive/20 border-destructive/30";
  };

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-accent-orange" />
            Situational
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {sortedData.slice(0, 3).map((env) => {
            const config = environmentConfig[env.environment] || environmentConfig.app;
            return (
              <div key={env.environment} className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground capitalize">{config.label}</span>
                <span className={cn("font-medium text-sm", getFluencyColor(env.avgFluency))}>
                  {env.avgFluency.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <MapPin className="w-5 h-5 text-accent-orange" />
          Situational Heatmap
          <span className="text-xs text-muted-foreground font-normal ml-auto">Environment Analysis</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-success/10 rounded-lg border border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Best Environment</p>
            <div className="flex items-center gap-2">
              <span className="text-success">
                {environmentConfig[bestEnv?.environment]?.icon || <MapPin className="w-4 h-4" />}
              </span>
              <span className="font-medium text-success capitalize">
                {environmentConfig[bestEnv?.environment]?.label || bestEnv?.environment || '—'}
              </span>
            </div>
            <p className="text-lg font-bold text-success mt-1">
              {bestEnv?.avgFluency.toFixed(0)}% fluency
            </p>
          </div>
          
          <div className="p-3 bg-destructive/10 rounded-lg border border-destructive/20">
            <p className="text-xs text-muted-foreground mb-1">Most Challenging</p>
            <div className="flex items-center gap-2">
              <span className="text-destructive">
                {environmentConfig[worstEnv?.environment]?.icon || <MapPin className="w-4 h-4" />}
              </span>
              <span className="font-medium text-destructive capitalize">
                {environmentConfig[worstEnv?.environment]?.label || worstEnv?.environment || '—'}
              </span>
            </div>
            <p className="text-lg font-bold text-destructive mt-1">
              {worstEnv?.avgFluency.toFixed(0)}% fluency
            </p>
          </div>
        </div>
        
        {/* Heatmap */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-foreground">Fluency by Environment</h4>
          <p className="text-xs text-muted-foreground">
            Track how fluency varies across different settings for generalization planning
          </p>
          
          <div className="space-y-2">
            {sortedData.map((env) => {
              const config = environmentConfig[env.environment] || {
                icon: <MapPin className="w-4 h-4" />,
                label: env.environment,
                description: "Unknown environment"
              };
              
              return (
                <div 
                  key={env.environment} 
                  className={cn(
                    "p-3 rounded-lg border transition-colors",
                    getHeatLevel(env.avgFluency)
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className={getFluencyColor(env.avgFluency)}>{config.icon}</span>
                      <div>
                        <span className="font-medium text-foreground capitalize">{config.label}</span>
                        <span className="text-xs text-muted-foreground ml-2">
                          ({env.sessionCount} session{env.sessionCount !== 1 ? 's' : ''})
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {env.trend && (
                        <span className={cn(
                          "flex items-center gap-1 text-xs",
                          env.trend === 'improving' ? "text-success" :
                          env.trend === 'declining' ? "text-destructive" : "text-muted-foreground"
                        )}>
                          {env.trend === 'improving' && <TrendingUp className="w-3 h-3" />}
                          {env.trend === 'declining' && <TrendingDown className="w-3 h-3" />}
                        </span>
                      )}
                      <span className={cn("font-bold text-lg", getFluencyColor(env.avgFluency))}>
                        {env.avgFluency.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                  
                  <Progress value={env.avgFluency} className="h-2" />
                  
                  {env.avgAnxiety !== null && env.avgAnxiety !== undefined && (
                    <div className="mt-2 text-xs text-muted-foreground">
                      Avg. Anxiety: {env.avgAnxiety.toFixed(1)}/10
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
        
        {/* Generalization Planning */}
        {sortedData.length > 1 && bestEnv && worstEnv && bestEnv.avgFluency - worstEnv.avgFluency > 20 && (
          <div className="p-3 bg-primary/10 rounded-lg">
            <p className="text-xs text-primary">
              <strong>Generalization Focus:</strong> There's a {(bestEnv.avgFluency - worstEnv.avgFluency).toFixed(0)}% 
              fluency gap between {environmentConfig[bestEnv.environment]?.label || bestEnv.environment} and 
              {' '}{environmentConfig[worstEnv.environment]?.label || worstEnv.environment}. 
              Consider practicing techniques in {environmentConfig[worstEnv.environment]?.label || worstEnv.environment} 
              {' '}settings to improve generalization.
            </p>
          </div>
        )}
        
        {sortedData.length === 0 && (
          <div className="p-4 bg-secondary/30 rounded-lg text-center">
            <p className="text-sm text-muted-foreground">No environment data available yet</p>
            <p className="text-xs text-muted-foreground mt-1">
              Practice sessions will populate the situational heatmap
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
