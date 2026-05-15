import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

type Aggregate = {
  type: "BLOCK" | "PROLONGATION" | "REPETITION" | "INTERJECTION";
  count: number;
  avgDurationMs: number;
  avgConfidence: number;
};

const TYPE_COLOURS: Record<Aggregate["type"], string> = {
  BLOCK: "hsl(0 84% 60%)",
  PROLONGATION: "hsl(38 92% 50%)",
  REPETITION: "hsl(243 75% 59%)",
  INTERJECTION: "hsl(160 84% 39%)",
};

interface Props {
  /** Filter by a specific child user (therapist viewing their patient). Omit for admin all-users. */
  childUserId?: string;
  /** Days back to aggregate */
  days?: number;
}

export const AcousticEventsAggregate = ({ childUserId, days = 30 }: Props) => {
  const [aggregates, setAggregates] = useState<Aggregate[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalSessions, setTotalSessions] = useState(0);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const since = new Date(Date.now() - days * 86400_000).toISOString();
      let q = (supabase as any)
        .from("acoustic_events")
        .select("event_type, duration_ms, confidence, session_id, created_at")
        .gte("created_at", since);
      if (childUserId) q = q.eq("user_id", childUserId);
      const { data, error } = await q;
      if (cancelled) return;
      if (error) {
        console.error("Failed to load acoustic aggregates:", error);
        setAggregates([]);
      } else {
        const rows = (data ?? []) as Array<{ event_type: Aggregate["type"]; duration_ms: number; confidence: number; session_id: string }>;
        const byType: Record<Aggregate["type"], { count: number; durSum: number; confSum: number }> = {
          BLOCK: { count: 0, durSum: 0, confSum: 0 },
          PROLONGATION: { count: 0, durSum: 0, confSum: 0 },
          REPETITION: { count: 0, durSum: 0, confSum: 0 },
          INTERJECTION: { count: 0, durSum: 0, confSum: 0 },
        };
        const sessionIds = new Set<string>();
        for (const r of rows) {
          if (!byType[r.event_type]) continue;
          byType[r.event_type].count += 1;
          byType[r.event_type].durSum += r.duration_ms || 0;
          byType[r.event_type].confSum += r.confidence || 0;
          sessionIds.add(r.session_id);
        }
        setTotalSessions(sessionIds.size);
        setAggregates(
          (Object.keys(byType) as Aggregate["type"][]).map(t => ({
            type: t,
            count: byType[t].count,
            avgDurationMs: byType[t].count ? byType[t].durSum / byType[t].count : 0,
            avgConfidence: byType[t].count ? byType[t].confSum / byType[t].count : 0,
          }))
        );
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [childUserId, days]);

  const total = aggregates.reduce((s, a) => s + a.count, 0);

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="w-5 h-5 text-primary" />
          Acoustic Events — Last {days} Days
          <Badge variant="outline" className="ml-auto text-xs">Therapist & Admin</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Aggregated live-detector events across {totalSessions} session{totalSessions === 1 ? "" : "s"}.
        </p>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : total === 0 ? (
          <p className="text-sm text-muted-foreground">No acoustic events captured in this window.</p>
        ) : (
          <>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={aggregates}>
                  <XAxis dataKey="type" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip
                    contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                    formatter={(value: number, _name, p: any) => [
                      `${value} events · avg ${p.payload.avgDurationMs.toFixed(0)}ms · ${(p.payload.avgConfidence * 100).toFixed(0)}% conf.`,
                      p.payload.type,
                    ]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {aggregates.map((a) => (
                      <Cell key={a.type} fill={TYPE_COLOURS[a.type]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
              {aggregates.map(a => (
                <div key={a.type} className="p-2 rounded bg-secondary/30 text-center">
                  <p className="text-xs text-muted-foreground">{a.type}</p>
                  <p className="text-lg font-bold" style={{ color: TYPE_COLOURS[a.type] }}>{a.count}</p>
                  <p className="text-[10px] text-muted-foreground">avg {a.avgDurationMs.toFixed(0)}ms</p>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
