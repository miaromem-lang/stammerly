import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Play, Bell, ChevronRight, Heart, Loader2 } from "lucide-react";
import { useVictoryLogs } from "@/hooks/useVictoryLogs";
import { useFluencyRatings } from "@/hooks/useFluencyRatings";
import { RecommendationTrendCharts } from "./RecommendationTrendCharts";
import { MonthlyReport } from "./MonthlyReport";

const ratingDescriptions: Record<number, string> = {
  1: "Completely fluent speech",
  2: "Very mild stuttering, barely noticeable",
  3: "Mild stuttering, some easy repetitions",
  4: "Occasional stutter, no tension",
  5: "Moderate stuttering, slight tension",
  6: "Moderate stuttering with tension",
  7: "Frequent stuttering with tension",
  8: "Severe stuttering, noticeable struggle",
  9: "Very severe stuttering",
  10: "Extremely severe stuttering",
};

const tips = [
  { id: 1, title: "Easy Onset Practice", duration: "0:45", thumbnail: "🎤" },
  { id: 2, title: "Positive Reinforcement", duration: "1:20", thumbnail: "⭐" },
  { id: 3, title: "Daily Check-in Tips", duration: "0:55", thumbnail: "💬" },
];

export const ParentDashboard = () => {
  const { victories, loading: victoriesLoading, formatVictoryTime } = useVictoryLogs();
  const { todayRating, saveRating, loading: ratingsLoading } = useFluencyRatings();
  
  const [rating, setRating] = useState([todayRating?.rating || 5]);
  const [saving, setSaving] = useState(false);

  const handleLogRating = async () => {
    setSaving(true);
    await saveRating(rating[0]);
    setSaving(false);
  };

  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            Parent Dashboard
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Empowering the Home Coaching Team
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Track progress, log observations, and connect with your child's support network
          </p>
          <div className="mt-4">
            <MonthlyReport recipientType="parent" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Lidcombe Slider */}
          <Card variant="glass" className="lg:row-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Daily Rating
              </CardTitle>
              <p className="text-sm text-muted-foreground">Lidcombe Programme Scale</p>
            </CardHeader>
            <CardContent className="flex flex-col items-center">
              <div className="w-full max-w-xs mb-8">
                <div className="text-center mb-8">
                  <span className="text-6xl font-display font-bold text-primary">
                    {rating[0]}
                  </span>
                  <p className="text-muted-foreground mt-2 text-sm min-h-[40px]">
                    {ratingDescriptions[rating[0]]}
                  </p>
                </div>
                
                <Slider
                  value={rating}
                  onValueChange={setRating}
                  min={1}
                  max={10}
                  step={1}
                  className="w-full"
                />
                
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Fluent</span>
                  <span>Severe</span>
                </div>
              </div>
              
              <Button variant="navy" className="w-full" onClick={handleLogRating} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {todayRating ? "Update Today's Rating" : "Log Today's Rating"}
              </Button>
            </CardContent>
          </Card>
          
          {/* Video Tips */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Play className="w-5 h-5 text-primary" />
                Expert Tips
              </CardTitle>
              <p className="text-sm text-muted-foreground">30-second video guides</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {tips.map((tip) => (
                  <button
                    key={tip.id}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left group"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-2xl">
                      {tip.thumbnail}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-foreground">{tip.title}</p>
                      <p className="text-xs text-muted-foreground">{tip.duration}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Victory Log */}
          <Card variant="glass">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-gold" />
                Victory Bell
              </CardTitle>
              <p className="text-sm text-muted-foreground">Wins shared by teachers</p>
            </CardHeader>
            <CardContent>
              {victoriesLoading ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              ) : victories.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No victories logged yet. They'll appear here when teachers share wins!
                </p>
              ) : (
                <div className="space-y-3">
                  {victories.slice(0, 3).map((victory) => (
                    <div
                      key={victory.id}
                      className="p-3 rounded-lg bg-gold/10 border border-gold/20"
                    >
                      <p className="text-sm text-foreground font-medium mb-1">
                        🔔 {victory.victory_text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{victory.reporter_name}</span>
                        <span>{formatVictoryTime(victory.created_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* AI vs Therapist Insights */}
        <div className="max-w-6xl mx-auto mt-8">
          <RecommendationTrendCharts />
        </div>
      </div>
    </section>
  );
};
