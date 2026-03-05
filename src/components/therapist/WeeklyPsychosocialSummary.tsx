import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, TrendingUp, TrendingDown, Minus, AlertTriangle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface DaySummary {
  date: string;
  dayLabel: string;
  moodScore: number;
  anxietyLevel: number | null;
  emoji: string;
}

export const WeeklyPsychosocialSummary = () => {
  const [days, setDays] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekAvgMood, setWeekAvgMood] = useState(0);
  const [weekAvgAnxiety, setWeekAvgAnxiety] = useState(0);
  const [prevWeekAvgMood, setPrevWeekAvgMood] = useState(0);
  const [checkinRate, setCheckinRate] = useState(0);
  const [highAnxietyDays, setHighAnxietyDays] = useState(0);

  useEffect(() => {
    fetchWeeklyMood();
  }, []);

  const fetchWeeklyMood = async () => {
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - 6);
      const prevWeekStart = new Date(weekStart);
      prevWeekStart.setDate(prevWeekStart.getDate() - 7);

      // Current week
      const { data: currentWeek } = await supabase
        .from("mood_checkins")
        .select("*")
        .gte("checkin_date", weekStart.toISOString().split("T")[0])
        .lte("checkin_date", now.toISOString().split("T")[0])
        .order("checkin_date", { ascending: true });

      // Previous week for trend
      const { data: prevWeek } = await supabase
        .from("mood_checkins")
        .select("mood_score")
        .gte("checkin_date", prevWeekStart.toISOString().split("T")[0])
        .lt("checkin_date", weekStart.toISOString().split("T")[0]);

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const daySummaries: DaySummary[] = [];

      for (let i = 0; i < 7; i++) {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        const dateStr = d.toISOString().split("T")[0];
        const checkin = currentWeek?.find(c => c.checkin_date === dateStr);

        if (checkin) {
          daySummaries.push({
            date: dateStr,
            dayLabel: dayNames[d.getDay()],
            moodScore: checkin.mood_score,
            anxietyLevel: checkin.anxiety_level,
            emoji: checkin.mood_emoji,
          });
        } else {
          daySummaries.push({
            date: dateStr,
            dayLabel: dayNames[d.getDay()],
            moodScore: 0,
            anxietyLevel: null,
            emoji: "—",
          });
        }
      }

      setDays(daySummaries);

      const activeDays = daySummaries.filter(d => d.moodScore > 0);
      setCheckinRate(Math.round((activeDays.length / 7) * 100));

      if (activeDays.length > 0) {
        const avgMood = activeDays.reduce((s, d) => s + d.moodScore, 0) / activeDays.length;
        setWeekAvgMood(Math.round(avgMood * 10) / 10);

        const anxDays = activeDays.filter(d => d.anxietyLevel !== null);
        if (anxDays.length > 0) {
          const avgAnx = anxDays.reduce((s, d) => s + (d.anxietyLevel || 0), 0) / anxDays.length;
          setWeekAvgAnxiety(Math.round(avgAnx * 10) / 10);
          setHighAnxietyDays(anxDays.filter(d => (d.anxietyLevel || 0) >= 6).length);
        }
      }

      if (prevWeek && prevWeek.length > 0) {
        const prevAvg = prevWeek.reduce((s, d) => s + d.mood_score, 0) / prevWeek.length;
        setPrevWeekAvgMood(Math.round(prevAvg * 10) / 10);
      }
    } catch (err) {
      console.error("Error fetching weekly mood:", err);
    } finally {
      setLoading(false);
    }
  };

  const moodTrend = weekAvgMood > prevWeekAvgMood + 0.3
    ? "improving"
    : weekAvgMood < prevWeekAvgMood - 0.3
      ? "declining"
      : "stable";

  const getMoodColor = (score: number) => {
    if (score === 0) return "bg-muted";
    if (score >= 4) return "bg-success";
    if (score >= 3) return "bg-gold";
    return "bg-destructive";
  };

  const getAnxietyColor = (level: number | null) => {
    if (level === null) return "bg-muted";
    if (level <= 3) return "bg-success";
    if (level <= 5) return "bg-gold";
    return "bg-destructive";
  };

  if (loading) {
    return (
      <Card className="glass-card-strong">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <Heart className="w-4 h-4 text-destructive" />
          Weekly Psychosocial Summary
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Trend badges */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary">
            {moodTrend === "improving" ? (
              <TrendingUp className="w-3 h-3 text-success" />
            ) : moodTrend === "declining" ? (
              <TrendingDown className="w-3 h-3 text-destructive" />
            ) : (
              <Minus className="w-3 h-3 text-muted-foreground" />
            )}
            <span className="text-foreground font-medium">
              Mood {weekAvgMood}/5
            </span>
            <span className="text-muted-foreground">
              ({moodTrend})
            </span>
          </div>

          <div className="flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-full bg-secondary">
            <span className="text-foreground font-medium">Anxiety {weekAvgAnxiety}/10</span>
          </div>

          {highAnxietyDays > 0 && (
            <div className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="w-3 h-3" />
              {highAnxietyDays} high-anxiety day{highAnxietyDays > 1 ? "s" : ""}
            </div>
          )}

          <div className="text-xs text-muted-foreground ml-auto">
            {checkinRate}% check-in rate
          </div>
        </div>

        {/* 7-day mood grid */}
        <div className="grid grid-cols-7 gap-1.5">
          {days.map((day) => (
            <div key={day.date} className="text-center space-y-1">
              <span className="text-[10px] text-muted-foreground">{day.dayLabel}</span>
              <div className="text-lg leading-none">{day.emoji}</div>
              <div
                className={`h-1.5 rounded-full ${getMoodColor(day.moodScore)}`}
                title={`Mood: ${day.moodScore}/5`}
              />
              <div
                className={`h-1 rounded-full ${getAnxietyColor(day.anxietyLevel)}`}
                title={`Anxiety: ${day.anxietyLevel ?? "N/A"}/10`}
              />
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-[10px] text-muted-foreground pt-1">
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-full bg-success" /> Good
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-full bg-gold" /> Moderate
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-1.5 rounded-full bg-destructive" /> Concern
          </div>
          <span className="ml-auto">Top: mood · Bottom: anxiety</span>
        </div>
      </CardContent>
    </Card>
  );
};
