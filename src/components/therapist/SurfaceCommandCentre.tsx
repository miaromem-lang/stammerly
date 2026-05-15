import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Activity, TrendingDown, TrendingUp, Minus, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

interface SurfaceMetrics {
  weightedStutteringSeverity: number | null;
  weightedStutteringSeverityCI?: { low: number; high: number } | null;
  percentSyllablesStuttered: number | null;
  percentSyllablesStutteredCI?: { low: number; high: number } | null;
  totalSyllables?: number | null;
  sampleAdequacy?: 'low' | 'moderate' | 'adequate' | null;
  sldCount: number;
  odCount: number;
  syllablesPerMinute: number | null;
  articulationRate: number | null;
  blocksCount: number;
  prolongationsCount: number;
  repetitionsCount: number;
}

interface TaskTypeData {
  category: string;
  percentSS: number;
  sessionCount: number;
}

interface SurfaceCommandCentreProps {
  metrics: SurfaceMetrics;
  previousMetrics?: SurfaceMetrics | null;
  taskTypeData?: TaskTypeData[];
  compact?: boolean;
}

// Color scale for %SS values
const getSSColor = (percentSS: number): string => {
  if (percentSS <= 2) return 'hsl(var(--success))';
  if (percentSS <= 5) return 'hsl(142, 76%, 46%)'; // lighter green
  if (percentSS <= 10) return 'hsl(var(--gold))';
  if (percentSS <= 15) return 'hsl(var(--accent-orange))';
  return 'hsl(var(--destructive))';
};

// Task Type Comparison Chart Component
const TaskTypeChart = ({ data }: { data: TaskTypeData[] }) => {
  if (!data || data.length === 0) {
    return (
      <div className="p-4 bg-secondary/30 rounded-lg text-center">
        <p className="text-sm text-muted-foreground">No task type data available yet</p>
      </div>
    );
  }

  // Format category names for display
  const formattedData = data.map(d => ({
    ...d,
    displayName: d.category.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }));

  // Find reading vs spontaneous for clinical insight
  const readingData = data.find(d => d.category.toLowerCase().includes('reading'));
  const spontaneousData = data.find(d => 
    d.category.toLowerCase().includes('free') || 
    d.category.toLowerCase().includes('spontaneous') ||
    d.category.toLowerCase().includes('conversation')
  );

  const getClinicalInsight = () => {
    if (!readingData || !spontaneousData) return null;
    
    const diff = spontaneousData.percentSS - readingData.percentSS;
    if (Math.abs(diff) < 1) {
      return "Similar %SS across task types suggests consistent fluency patterns.";
    } else if (diff > 3) {
      return `Spontaneous speech shows ${diff.toFixed(1)}% higher %SS than reading. Focus on transfer activities.`;
    } else if (diff < -3) {
      return `Reading shows ${Math.abs(diff).toFixed(1)}% higher %SS than spontaneous speech. Consider word-level interventions.`;
    }
    return "Slight variation between task types is typical.";
  };

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
        %SS by Task Type
        <span className="text-xs text-muted-foreground font-normal">
          (Situational Comparison)
        </span>
      </h4>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={formattedData} 
            layout="vertical"
            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
          >
            <XAxis 
              type="number" 
              domain={[0, 'auto']}
              tickFormatter={(val) => `${val}%`}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              type="category" 
              dataKey="displayName" 
              width={100}
              tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
            />
            <Tooltip 
              formatter={(value: number) => [`${value.toFixed(1)}%`, '%SS']}
              labelFormatter={(label) => label}
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar 
              dataKey="percentSS" 
              radius={[0, 4, 4, 0]}
            >
              {formattedData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getSSColor(entry.percentSS)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Clinical Insight */}
      {getClinicalInsight() && (
        <div className="p-2 bg-primary/10 rounded-lg">
          <p className="text-xs text-primary">
            <strong>Insight:</strong> {getClinicalInsight()}
          </p>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-2 justify-center text-[10px]">
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-success" /> ≤2%
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-gold" /> 2-10%
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-accent-orange" /> 10-15%
        </span>
        <span className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-destructive" /> &gt;15%
        </span>
      </div>
    </div>
  );
};

export const SurfaceCommandCentre = ({ 
  metrics, 
  previousMetrics,
  taskTypeData,
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
        
        {/* Task Type Comparison Chart */}
        {taskTypeData && taskTypeData.length > 0 && (
          <TaskTypeChart data={taskTypeData} />
        )}
        
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
