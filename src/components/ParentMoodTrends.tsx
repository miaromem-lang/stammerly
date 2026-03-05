import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Heart, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { useMoodCheckins } from "@/hooks/useMoodCheckins";
import { useFluencyRatings } from "@/hooks/useFluencyRatings";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import { format } from "date-fns";
import { useMemo } from "react";

const MOOD_EMOJIS: Record<number, string> = {
  1: "😢", 2: "😟", 3: "😐", 4: "😊", 5: "🤩",
};

export const ParentMoodTrends = () => {
  const { recentCheckins, loading: moodLoading } = useMoodCheckins();
  const { ratings, loading: ratingsLoading } = useFluencyRatings();
  const loading = moodLoading || ratingsLoading;

  const chartData = useMemo(() => {
    const byDate = new Map<string, { mood: number | null; anxiety: number | null; fluencyRating: number | null }>();

    recentCheckins.forEach(c => {
      const date = c.checkin_date;
      const entry = byDate.get(date) || { mood: null, anxiety: null, fluencyRating: null };
      entry.mood = c.mood_score;
      entry.anxiety = c.anxiety_level;
      byDate.set(date, entry);
    });

    (ratings ?? []).forEach((r: any) => {
      const date = r.rating_date;
      const entry = byDate.get(date) || { mood: null, anxiety: null, fluencyRating: null };
      entry.fluencyRating = r.rating;
      byDate.set(date, entry);
    });

    return Array.from(byDate.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => ({
        date,
        displayDate: format(new Date(date), "MMM d"),
        mood: data.mood,
        anxiety: data.anxiety,
        fluencyRating: data.fluencyRating,
      }));
  }, [recentCheckins, recentRatings]);

  // Trend summary
  const trendSummary = useMemo(() => {
    if (recentCheckins.length < 3) return null;
    const last3 = recentCheckins.slice(-3);
    const first3 = recentCheckins.slice(0, 3);
    const recentAvg = last3.reduce((s, c) => s + c.mood_score, 0) / last3.length;
    const earlyAvg = first3.reduce((s, c) => s + c.mood_score, 0) / first3.length;
    const diff = recentAvg - earlyAvg;
    if (diff > 0.5) return { direction: "up" as const, text: "Mood is trending upward — great sign!" };
    if (diff < -0.5) return { direction: "down" as const, text: "Mood has been lower recently — worth discussing" };
    return { direction: "stable" as const, text: "Mood has been steady" };
  }, [recentCheckins]);

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="w-5 h-5 text-accent-orange" />
          Mood &amp; Fluency Trends
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Your child's daily emotional check-ins alongside fluency ratings (last 30 days)
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">
            No mood check-ins recorded yet. Your child can log how they feel each day from their hub!
          </p>
        ) : (
          <>
            {/* Trend badge */}
            {trendSummary && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/40 border border-border">
                {trendSummary.direction === "up" ? (
                  <TrendingUp className="w-4 h-4 text-success" />
                ) : trendSummary.direction === "down" ? (
                  <TrendingDown className="w-4 h-4 text-destructive" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground" />
                )}
                <p className="text-sm text-foreground">{trendSummary.text}</p>
                <Badge variant={trendSummary.direction === "up" ? "success" : trendSummary.direction === "down" ? "warning" : "secondary"} className="ml-auto">
                  {recentCheckins.length} check-ins
                </Badge>
              </div>
            )}

            {/* Recent mood emojis */}
            <div className="flex gap-1 justify-center flex-wrap">
              {recentCheckins.slice(-14).map(c => (
                <div key={c.id} className="flex flex-col items-center gap-0.5">
                  <span className="text-lg">{MOOD_EMOJIS[c.mood_score] ?? "😊"}</span>
                  <span className="text-[9px] text-muted-foreground">{format(new Date(c.checkin_date), "d")}</span>
                </div>
              ))}
            </div>

            {/* Chart */}
            <div className="h-[240px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} className="fill-muted-foreground" />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px", fontSize: "12px" }}
                  />
                  <Legend wrapperStyle={{ fontSize: "11px" }} />
                  <Area
                    type="monotone"
                    dataKey="anxiety"
                    name="Anxiety (0-10)"
                    fill="hsl(var(--destructive) / 0.12)"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={1.5}
                    connectNulls
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="mood"
                    name="Mood (1-5)"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="fluencyRating"
                    name="Fluency Rating (1-10)"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    connectNulls
                    dot={{ r: 3 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-muted-foreground">
              💡 <strong>Tip:</strong> Higher fluency ratings (Lidcombe scale) indicate more severe stuttering.
              Days with low mood or high anxiety alongside high fluency ratings may suggest emotional triggers.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
