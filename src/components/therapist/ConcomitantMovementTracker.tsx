import { useRef, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Camera, CameraOff, Eye, Loader2, AlertTriangle, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useWebcamAnalysis, ConcomitantMetrics, DetectionEvent } from "@/hooks/useWebcamAnalysis";

interface ConcomitantMovementTrackerProps {
  onMetricsUpdate?: (metrics: ConcomitantMetrics) => void;
  compact?: boolean;
}

export const ConcomitantMovementTracker = ({ 
  onMetricsUpdate,
  compact = false 
}: ConcomitantMovementTrackerProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const { 
    isActive, 
    isLoading, 
    error, 
    metrics, 
    events,
    startAnalysis, 
    stopAnalysis 
  } = useWebcamAnalysis();

  const handleToggle = useCallback(async () => {
    if (isActive) {
      stopAnalysis();
      if (onMetricsUpdate) {
        onMetricsUpdate(metrics);
      }
    } else if (videoRef.current) {
      await startAnalysis(videoRef.current);
    }
  }, [isActive, startAnalysis, stopAnalysis, metrics, onMetricsUpdate]);

  // Get intensity color
  const getIntensityColor = (intensity: ConcomitantMetrics['tensionIntensity']) => {
    switch (intensity) {
      case 'high': return 'text-destructive';
      case 'moderate': return 'text-gold';
      default: return 'text-success';
    }
  };

  // Get recent events of a type
  const getRecentEvents = (type: DetectionEvent['type'], limit = 5) => {
    return events
      .filter(e => e.type === type)
      .slice(-limit)
      .reverse();
  };

  if (compact) {
    return (
      <Card className="glass-card-strong">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-sm">
            <Camera className="w-4 h-4 text-primary" />
            Physicality Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Eye Blinks</span>
            <span className="font-medium text-sm">{metrics.eyeBlinks}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Tension Events</span>
            <span className={cn("font-medium text-sm", getIntensityColor(metrics.tensionIntensity))}>
              {metrics.jawTensionEvents}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Head Movements</span>
            <span className="font-medium text-sm">{metrics.headMovements}</span>
          </div>
          <Button 
            size="sm" 
            variant={isActive ? "destructive" : "outline"}
            onClick={handleToggle}
            disabled={isLoading}
            className="w-full mt-2"
          >
            {isLoading ? (
              <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Loading...</>
            ) : isActive ? (
              <><CameraOff className="w-3 h-3 mr-1" /> Stop</>
            ) : (
              <><Camera className="w-3 h-3 mr-1" /> Start</>
            )}
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Camera className="w-5 h-5 text-primary" />
          Concomitant Movement Tracker
          <span className="text-xs text-muted-foreground font-normal ml-auto">Secondary Behaviours</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Error Message */}
        {error && (
          <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </div>
        )}

        {/* Video Feed */}
        <div className="relative rounded-xl overflow-hidden bg-secondary/50 border border-border">
          <video 
            ref={videoRef}
            className="w-full aspect-video object-cover"
            muted
            playsInline
          />
          
          {/* Overlay when not active */}
          {!isActive && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="text-center">
                <Camera className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground mb-4">
                  Enable webcam to detect secondary behaviours
                </p>
                <Button onClick={handleToggle} disabled={isLoading}>
                  {isLoading ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading Model...</>
                  ) : (
                    <><Camera className="w-4 h-4 mr-2" /> Start Detection</>
                  )}
                </Button>
              </div>
            </div>
          )}
          
          {/* Active indicator */}
          {isActive && (
            <div className="absolute top-3 left-3 flex items-center gap-2 bg-success/90 text-white px-3 py-1 rounded-full text-xs">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              Detecting
            </div>
          )}
          
          {/* Stop button overlay */}
          {isActive && (
            <div className="absolute bottom-3 right-3">
              <Button size="sm" variant="destructive" onClick={handleToggle}>
                <CameraOff className="w-4 h-4 mr-2" /> Stop
              </Button>
            </div>
          )}
        </div>

        {/* Real-time Metrics */}
        <div className="grid grid-cols-3 gap-4">
          {/* Eye Blinks */}
          <div className="p-4 bg-secondary/30 rounded-lg text-center">
            <Eye className="w-6 h-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold text-foreground">{metrics.eyeBlinks}</p>
            <p className="text-xs text-muted-foreground">Eye Blinks</p>
            {metrics.blinkRate > 0 && (
              <p className="text-[10px] text-muted-foreground mt-1">
                {metrics.blinkRate.toFixed(1)}/min
              </p>
            )}
          </div>
          
          {/* Jaw Tension */}
          <div className="p-4 bg-secondary/30 rounded-lg text-center">
            <Activity className="w-6 h-6 mx-auto mb-2 text-gold" />
            <p className={cn("text-2xl font-bold", getIntensityColor(metrics.tensionIntensity))}>
              {metrics.jawTensionEvents}
            </p>
            <p className="text-xs text-muted-foreground">Jaw Tension</p>
            <p className={cn("text-[10px] mt-1", getIntensityColor(metrics.tensionIntensity))}>
              {metrics.tensionIntensity} intensity
            </p>
          </div>
          
          {/* Head Movements */}
          <div className="p-4 bg-secondary/30 rounded-lg text-center">
            <svg className="w-6 h-6 mx-auto mb-2 text-accent-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <p className="text-2xl font-bold text-foreground">{metrics.headMovements}</p>
            <p className="text-xs text-muted-foreground">Head Movements</p>
          </div>
        </div>

        {/* Blink Duration */}
        {metrics.avgBlinkDuration > 0 && (
          <div className="p-3 bg-secondary/30 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Average Blink Duration</span>
              <span className="text-sm font-medium">{metrics.avgBlinkDuration.toFixed(0)}ms</span>
            </div>
            <Progress 
              value={Math.min(100, (metrics.avgBlinkDuration / 500) * 100)} 
              className="h-2" 
            />
            <p className="text-xs text-muted-foreground mt-2">
              {metrics.avgBlinkDuration > 300 
                ? "Extended blinks may indicate tension during blocks"
                : "Normal blink duration range"}
            </p>
          </div>
        )}

        {/* Recent Events Timeline */}
        {events.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground">Recent Detections</h4>
            <div className="max-h-32 overflow-y-auto space-y-1">
              {events.slice(-10).reverse().map((event, idx) => (
                <div 
                  key={idx}
                  className={cn(
                    "text-xs p-2 rounded flex items-center justify-between",
                    event.type === 'eye-blink' ? "bg-primary/10" :
                    event.type === 'jaw-tension' ? "bg-gold/10" : "bg-accent-orange/10"
                  )}
                >
                  <span className="capitalize">
                    {event.type.replace('-', ' ')}
                  </span>
                  <span className="text-muted-foreground">
                    {event.duration ? `${event.duration}ms` : 
                     event.intensity ? `intensity: ${event.intensity.toFixed(2)}` : ''}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Clinical Interpretation */}
        <div className="p-3 bg-primary/10 rounded-lg">
          <p className="text-xs text-primary">
            <strong>Clinical Note:</strong> {' '}
            {metrics.jawTensionEvents > 10 
              ? "High jaw tension events detected. Consider physical relaxation techniques."
              : metrics.headMovements > 15
                ? "Frequent head movements observed. May indicate escape behaviours during blocks."
                : metrics.eyeBlinks > 30
                  ? "Elevated blink rate may correlate with speech anxiety. Monitor for patterns."
                  : "Secondary behaviours within typical range. Continue monitoring during practice."}
          </p>
        </div>

        {/* Privacy Note */}
        <p className="text-[10px] text-muted-foreground text-center">
          Video is processed locally and never leaves your device. No recordings are stored.
        </p>
      </CardContent>
    </Card>
  );
};
