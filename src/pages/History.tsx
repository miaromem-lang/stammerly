import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { HubNavigation } from "@/components/HubNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Clock, Activity, Calendar, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type MarkerType = "Block" | "Repetition" | "Prolongation" | "Interjection";

interface SessionRow {
  id: string;
  session_date: string;
  duration_seconds: number | null;
  blocks_count: number | null;
  repetitions_count: number | null;
  prolongations_count: number | null;
  interjections_count: number | null;
  environment_type: string | null;
}

interface DisplaySession {
  id: string;
  date: string;
  durationMin: number;
  totalEvents: number;
  dominantMarker: MarkerType;
  environment: string;
}

const markerStyles: Record<MarkerType, string> = {
  Block: "bg-red-100 text-red-700 border-red-200",
  Repetition: "bg-amber-100 text-amber-700 border-amber-200",
  Prolongation: "bg-blue-100 text-blue-700 border-blue-200",
  Interjection: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

function dominant(row: SessionRow): MarkerType {
  const entries: Array<[MarkerType, number]> = [
    ["Block", row.blocks_count ?? 0],
    ["Repetition", row.repetitions_count ?? 0],
    ["Prolongation", row.prolongations_count ?? 0],
    ["Interjection", row.interjections_count ?? 0],
  ];
  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0];
}

function transform(rows: SessionRow[]): DisplaySession[] {
  return rows.map((r) => {
    const total =
      (r.blocks_count ?? 0) +
      (r.repetitions_count ?? 0) +
      (r.prolongations_count ?? 0) +
      (r.interjections_count ?? 0);
    return {
      id: r.id,
      date: new Date(r.session_date).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      durationMin: Math.max(1, Math.round((r.duration_seconds ?? 0) / 60)),
      totalEvents: total,
      dominantMarker: dominant(r),
      environment: r.environment_type ?? "—",
    };
  });
}

const History = () => {
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<DisplaySession[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("practice_sessions")
        .select(
          "id, session_date, duration_seconds, blocks_count, repetitions_count, prolongations_count, interjections_count, environment_type"
        )
        .order("session_date", { ascending: false })
        .limit(50);
      if (cancelled) return;
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSessions(transform((data ?? []) as SessionRow[]));
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Helmet>
        <title>Session History | Stammerly</title>
        <meta name="description" content="Review your past Stammerly detection sessions." />
        <link rel="canonical" href="/history" />
      </Helmet>
      <HubNavigation />
      <main className="container mx-auto px-4 py-6 sm:py-10 pb-24 sm:pb-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Session History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your most recent detection sessions.
            </p>
          </header>

          {loading ? (
            <ul className="space-y-3">
              {[0, 1, 2].map((i) => (
                <li key={i}>
                  <Skeleton className="h-20 w-full rounded-xl" />
                </li>
              ))}
            </ul>
          ) : error ? (
            <Card className="bg-white">
              <CardContent className="p-6 text-sm text-red-600">
                Couldn't load sessions: {error}
              </CardContent>
            </Card>
          ) : sessions.length === 0 ? (
            <Card className="bg-white">
              <CardContent className="p-6 text-sm text-muted-foreground text-center">
                No sessions yet — start one from the Session tab to see it here.
              </CardContent>
            </Card>
          ) : (
            <ul className="space-y-3">
              {sessions.map((s) => (
                <li key={s.id}>
                  <Card className="bg-white shadow-sm hover:shadow-md transition-shadow">
                    <CardContent className="p-5 flex items-center justify-between gap-4">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 flex-1 min-w-0">
                        <div className="flex items-center gap-2 text-foreground font-medium">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          {s.date}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          {s.durationMin} min
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Activity className="w-4 h-4" />
                          {s.totalEvents} events
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground capitalize">
                          <MapPin className="w-3.5 h-3.5" />
                          {s.environment}
                        </div>
                      </div>
                      <Badge
                        variant="outline"
                        className={`${markerStyles[s.dominantMarker]} font-medium`}
                      >
                        {s.dominantMarker}
                      </Badge>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
