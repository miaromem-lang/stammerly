import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Brain, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Area, ComposedChart } from "recharts";
import { format, subDays } from "date-fns";

interface MoodFluencyDataPoint {
  date: string;
  displayDate: string;
  moodScore: number | null;
  anxietyLevel: number | null;
  avgFluency: number | null;
  avgWSS: number | null;
  triggerCount: number | null;
}

interface Props {
  patientId?: string;
}

export const MoodFluencyCorrelation = ({ patientId }: Props) => {
  const [data, setData] = useState<MoodFluencyDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30");

  useEffect(() => {
    if (!patientId || patientId === "all") {
      setData([]);
      setLoading(false);
      return;
    }
    fetchCorrelationData();
  }, [patientId, timeRange]);

  const fetchCorrelationData = async () => {
    setLoading(true);
    const days = parseInt(timeRange);
    const startDate = subDays(new Date(), days).toISOString().split("T")[0];

    // Fetch mood check-ins and practice sessions in parallel
    const [moodRes, sessionsRes] = await Promise.all([
      supabase
        .from("mood_checkins")
        .select("checkin_date, mood_score, anxiety_level")
        .eq("user_id", patientId)
        .gte("checkin_date", startDate)
        .order("checkin_date", { ascending: true }),
      supabase
        .from("practice_sessions")
        .select("session_date, fluency_score, weighted_stuttering_severity, phoneme_triggers")
        .eq("user_id", patientId)
        .gte("session_date", `${startDate}T00:00:00`)
        .order("session_date", { ascending: true }),
    ]);

    const moodByDate = new Map<string, { mood: number; anxiety: number | null }>();
    (moodRes.data ?? []).forEach((m: any) => {
      moodByDate.set(m.checkin_date, { mood: m.mood_score, anxiety: m.anxiety_level });
    });

    // Aggregate sessions by date
    const sessionsByDate = new Map<string, { fluencies: number[]; wss: number[]; triggers: number }>();
    (sessionsRes.data ?? []).forEach((s: any) => {
      const date = s.session_date.split("T")[0];
      if (!sessionsByDate.has(date)) {
        sessionsByDate.set(date, { fluencies: [], wss: [], triggers: 0 });
      }
      const entry = sessionsByDate.get(date)!;
      if (s.fluency_score != null) entry.fluencies.push(s.fluency_score);
      if (s.weighted_stuttering_severity != null) entry.wss.push(s.weighted_stuttering_severity);
      const triggers = Array.isArray(s.phoneme_triggers) ? s.phoneme_triggers.length : 0;
      entry.triggers += triggers;
    });

    // Merge into timeline
    const allDates = new Set([...moodByDate.keys(), ...sessionsByDate.keys()]);
    const sorted = Array.from(allDates).sort();

    const merged: MoodFluencyDataPoint[] = sorted.map(date => {
      const mood = moodByDate.get(date);
      const sessions = sessionsByDate.get(date);
      const avgFluency = sessions?.fluencies.length
        ? sessions.fluencies.reduce((a, b) => a + b, 0) / sessions.fluencies.length
        : null;
      const avgWSS = sessions?.wss.length
        ? sessions.wss.reduce((a, b) => a + b, 0) / sessions.wss.length
        : null;

      return {
        date,
        displayDate: format(new Date(date), "MMM d"),
        moodScore: mood?.mood ?? null,
        anxietyLevel: mood?.anxiety ?? null,
        avgFluency: avgFluency ? Math.round(avgFluency) : null,
        avgWSS: avgWSS ? Math.round(avgWSS * 10) / 10 : null,
        triggerCount: sessions?.triggers ?? null,
      };
    });

    setData(merged);
    setLoading(false);
  };

  // Compute correlation insight
  const correlationInsight = useMemo(() => {
    const paired = data.filter(d => d.anxietyLevel !== null && d.avgWSS !== null);
    if (paired.length < 5) return null;

    const avgAnx = paired.reduce((s, d) => s + d.anxietyLevel!, 0) / paired.length;
    const avgWSS = paired.reduce((s, d) => s + d.avgWSS!, 0) / paired.length;

    let num = 0, denA = 0, denW = 0;
    paired.forEach(d => {
      const da = d.anxietyLevel! - avgAnx;
      const dw = d.avgWSS! - avgWSS;
      num += da * dw;
      denA += da * da;
      denW += dw * dw;
    });

    const denom = Math.sqrt(denA * denW);
    if (denom === 0) return null;
    const r = num / denom;

    if (r > 0.3) return { direction: "positive" as const, r, text: "Higher anxiety correlates with increased stuttering severity" };
    if (r < -0.3) return { direction: "negative" as const, r, text: "Lower anxiety correlates with increased stuttering severity (paradoxical)" };
    return { direction: "neutral" as const, r, text: "No strong correlation between anxiety and stuttering severity" };
  }, [data]);

  if (!patientId || patientId === "all") {
    return (
      <Card className="glass-card-strong">
        <CardContent className="py-8 text-center">
          <p className="text-muted-foreground text-sm">Select a specific patient to view mood–fluency correlations.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Brain className="w-5 h-5 text-accent-orange" />
            Psychosocial–Fluency Correlation
          </CardTitle>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 14 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <p className="text-sm text-muted-foreground">
          Self-reported mood &amp; anxiety overlaid with stuttering severity and phoneme trigger frequency
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : data.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No mood check-in or session data available for this period.
          </p>
        ) : (
          <>
            {/* Correlation insight badge */}
            {correlationInsight && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-secondary/40 border border-border">
                {correlationInsight.direction === "positive" ? (
                  <TrendingUp className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
                ) : correlationInsight.direction === "negative" ? (
                  <TrendingDown className="w-4 h-4 text-success mt-0.5 shrink-0" />
                ) : (
                  <Minus className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                )}
                <div>
                  <p className="text-sm font-medium text-foreground">{correlationInsight.text}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Pearson r = {correlationInsight.r.toFixed(2)} across {data.filter(d => d.anxietyLevel !== null && d.avgWSS !== null).length} paired observations
                  </p>
                </div>
                <Badge variant={
                  correlationInsight.direction === "positive" ? "destructive" :
                  correlationInsight.direction === "negative" ? "success" : "secondary"
                } className="ml-auto shrink-0">
                  {Math.abs(correlationInsight.r) > 0.6 ? "Strong" : Math.abs(correlationInsight.r) > 0.3 ? "Moderate" : "Weak"}
                </Badge>
              </div>
            )}

            {/* Chart */}
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="displayDate" tick={{ fontSize: 11 }} className="fill-muted-foreground" />
                  <YAxis yAxisId="left" domain={[0, 10]} tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: "Score", angle: -90, position: "insideLeft", style: { fontSize: 11 } }} />
                  <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} className="fill-muted-foreground" label={{ value: "Triggers", angle: 90, position: "insideRight", style: { fontSize: 11 } }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "8px" }}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="anxietyLevel"
                    name="Anxiety (0-10)"
                    fill="hsl(var(--destructive) / 0.15)"
                    stroke="hsl(var(--destructive))"
                    strokeWidth={2}
                    connectNulls
                    dot={false}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="moodScore"
                    name="Mood (1-5)"
                    stroke="hsl(var(--success))"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgWSS"
                    name="WSS"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    connectNulls
                    dot={{ r: 3 }}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="triggerCount"
                    name="Phoneme Triggers"
                    stroke="hsl(var(--accent-orange))"
                    strokeWidth={2}
                    connectNulls
                    dot={{ r: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <p className="text-xs text-muted-foreground">
              <strong>Clinical note:</strong> Parsons et al. (2021) highlight that psychosocial burden significantly
              modulates stammering severity. Days with elevated self-reported anxiety may show increased phoneme
              trigger frequency and higher WSS scores, indicating anxiety-driven exacerbation patterns.
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
};
