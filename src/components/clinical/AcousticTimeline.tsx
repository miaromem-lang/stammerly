import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";

export type AcousticEventRow = {
  id: string;
  session_id: string;
  user_id: string;
  event_type: "PROLONGATION" | "BLOCK" | "REPETITION" | "INTERJECTION";
  duration_ms: number;
  confidence: number;
  occurred_at_ms: number;
  detail: string | null;
};

export type WordTimingLite = { word: string; start: number; end: number };

interface AcousticTimelineProps {
  /** Provide either a sessionId to fetch from the DB, or events directly (for /demo). */
  sessionId?: string;
  events?: AcousticEventRow[];
  words?: WordTimingLite[];
  durationSeconds?: number;
  transcript?: string | null;
  /** Optional title override */
  title?: string;
}

const EVENT_COLOURS: Record<AcousticEventRow["event_type"], string> = {
  BLOCK: "hsl(0 84% 60%)",          // destructive red
  PROLONGATION: "hsl(38 92% 50%)",  // amber
  REPETITION: "hsl(243 75% 59%)",   // primary indigo
  INTERJECTION: "hsl(160 84% 39%)", // teal
};

const EVENT_LABEL: Record<AcousticEventRow["event_type"], string> = {
  BLOCK: "Block",
  PROLONGATION: "Prolongation",
  REPETITION: "Repetition",
  INTERJECTION: "Interjection",
};

export const AcousticTimeline = ({
  sessionId,
  events: providedEvents,
  words = [],
  durationSeconds,
  transcript,
  title = "Acoustic Event Timeline",
}: AcousticTimelineProps) => {
  const [events, setEvents] = useState<AcousticEventRow[]>(providedEvents ?? []);
  const [loading, setLoading] = useState(!providedEvents && !!sessionId);

  useEffect(() => {
    if (providedEvents) {
      setEvents(providedEvents);
      return;
    }
    if (!sessionId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      const { data, error } = await supabase
        .from("acoustic_events" as any)
        .select("*")
        .eq("session_id", sessionId)
        .order("occurred_at_ms", { ascending: true });
      if (cancelled) return;
      if (error) {
        console.error("Failed to load acoustic events:", error);
        setEvents([]);
      } else {
        setEvents((data as unknown as AcousticEventRow[]) ?? []);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [sessionId, providedEvents]);

  // Derive a sensible total duration in ms.
  const totalMs = useMemo(() => {
    const fromDuration = (durationSeconds ?? 0) * 1000;
    const fromWords = words.length ? Math.max(...words.map(w => w.end)) * 1000 : 0;
    const fromEvents = events.length ? Math.max(...events.map(e => e.occurred_at_ms + e.duration_ms)) : 0;
    return Math.max(fromDuration, fromWords, fromEvents, 1000);
  }, [durationSeconds, words, events]);

  const counts = useMemo(() => {
    const c: Record<AcousticEventRow["event_type"], number> = {
      BLOCK: 0, PROLONGATION: 0, REPETITION: 0, INTERJECTION: 0,
    };
    for (const e of events) c[e.event_type]++;
    return c;
  }, [events]);

  const avgConfidence = useMemo(() => {
    if (!events.length) return 0;
    return events.reduce((s, e) => s + (e.confidence || 0), 0) / events.length;
  }, [events]);

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Activity className="w-5 h-5 text-primary" />
          {title}
          <Badge variant="outline" className="ml-auto text-xs">Therapist & Admin only</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground mt-1">
          Live acoustic events captured by the in-browser stammer detector, plotted against
          the transcribed word timing. Bar width = event duration; colour = type.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary chips */}
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(counts) as Array<AcousticEventRow["event_type"]>).map(t => (
            <span
              key={t}
              className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-secondary/50"
            >
              <span className="w-2 h-2 rounded-full" style={{ background: EVENT_COLOURS[t] }} />
              {EVENT_LABEL[t]}: <strong>{counts[t]}</strong>
            </span>
          ))}
          <span className="text-xs text-muted-foreground ml-auto">
            Avg confidence: <strong className="text-foreground">{(avgConfidence * 100).toFixed(0)}%</strong>
            {" · "}Total: <strong className="text-foreground">{events.length}</strong>
          </span>
        </div>

        {loading && <p className="text-sm text-muted-foreground">Loading events…</p>}

        {!loading && events.length === 0 && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-secondary/30 text-sm text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            No acoustic events captured for this session — speech was clean, or the live
            detector wasn't active.
          </div>
        )}

        {/* Timeline */}
        {events.length > 0 && (
          <div className="space-y-2">
            {/* Word band */}
            {words.length > 0 && (
              <div className="relative h-8 rounded-md bg-secondary/30 border border-border overflow-hidden" aria-label="Transcript word timing">
                {words.map((w, i) => {
                  const leftPct = (w.start * 1000 / totalMs) * 100;
                  const widthPct = Math.max(0.5, ((w.end - w.start) * 1000 / totalMs) * 100);
                  return (
                    <div
                      key={i}
                      className="absolute top-1 bottom-1 px-1 text-[10px] leading-6 text-foreground/80 truncate border-r border-border/50"
                      style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
                      title={`${w.word} (${w.start.toFixed(2)}s–${w.end.toFixed(2)}s)`}
                    >
                      {w.word}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Event band */}
            <div
              className="relative h-12 rounded-md bg-secondary/20 border border-border overflow-hidden"
              role="img"
              aria-label={`${events.length} acoustic events plotted on a ${(totalMs / 1000).toFixed(1)} second timeline`}
            >
              {/* Time gridlines */}
              {Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={i}
                  className="absolute top-0 bottom-0 border-l border-border/40"
                  style={{ left: `${((i + 1) * 100) / 6}%` }}
                />
              ))}
              {events.map(ev => {
                const leftPct = (ev.occurred_at_ms / totalMs) * 100;
                const widthPct = Math.max(0.6, (ev.duration_ms / totalMs) * 100);
                return (
                  <div
                    key={ev.id}
                    className="absolute top-1 bottom-1 rounded-sm cursor-help transition-opacity hover:opacity-80"
                    style={{
                      left: `${leftPct}%`,
                      width: `${widthPct}%`,
                      background: EVENT_COLOURS[ev.event_type],
                      opacity: 0.4 + ev.confidence * 0.6,
                    }}
                    title={`${EVENT_LABEL[ev.event_type]} — ${ev.duration_ms.toFixed(0)}ms @ ${(ev.occurred_at_ms / 1000).toFixed(2)}s · confidence ${(ev.confidence * 100).toFixed(0)}%${ev.detail ? `\n${ev.detail}` : ""}`}
                  />
                );
              })}
            </div>

            {/* Time axis labels */}
            <div className="flex justify-between text-[10px] text-muted-foreground px-1">
              <span>0s</span>
              <span>{(totalMs / 4000).toFixed(1)}s</span>
              <span>{(totalMs / 2000).toFixed(1)}s</span>
              <span>{((totalMs * 3) / 4000).toFixed(1)}s</span>
              <span>{(totalMs / 1000).toFixed(1)}s</span>
            </div>

            {/* Event log table */}
            <div className="mt-3 max-h-48 overflow-y-auto rounded-md border border-border">
              <table className="w-full text-xs">
                <thead className="bg-secondary/40 sticky top-0">
                  <tr className="text-left">
                    <th className="px-2 py-1.5 font-medium">Time</th>
                    <th className="px-2 py-1.5 font-medium">Type</th>
                    <th className="px-2 py-1.5 font-medium">Duration</th>
                    <th className="px-2 py-1.5 font-medium">Confidence</th>
                    <th className="px-2 py-1.5 font-medium">Detail</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map(ev => (
                    <tr key={ev.id} className="border-t border-border/50">
                      <td className="px-2 py-1 tabular-nums">{(ev.occurred_at_ms / 1000).toFixed(2)}s</td>
                      <td className="px-2 py-1">
                        <span className="inline-flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full" style={{ background: EVENT_COLOURS[ev.event_type] }} />
                          {EVENT_LABEL[ev.event_type]}
                        </span>
                      </td>
                      <td className="px-2 py-1 tabular-nums">{ev.duration_ms.toFixed(0)}ms</td>
                      <td className={cn("px-2 py-1 tabular-nums",
                        ev.confidence >= 0.7 ? "text-success" : ev.confidence >= 0.4 ? "text-gold" : "text-muted-foreground")}>
                        {(ev.confidence * 100).toFixed(0)}%
                      </td>
                      <td className="px-2 py-1 text-muted-foreground truncate max-w-[260px]">{ev.detail ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {transcript && (
              <details className="mt-2 text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground">Show transcript</summary>
                <p className="mt-2 p-2 rounded bg-secondary/30 leading-relaxed">{transcript}</p>
              </details>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
