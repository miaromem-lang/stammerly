import { Helmet } from "react-helmet-async";
import { HubNavigation } from "@/components/HubNavigation";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Activity, Calendar } from "lucide-react";

type MarkerType = "Block" | "Repetition" | "Prolongation" | "Interjection";

interface SessionRecord {
  id: string;
  date: string;
  durationMin: number;
  totalEvents: number;
  dominantMarker: MarkerType;
}

const SESSIONS: SessionRecord[] = [
  { id: "s1", date: "14 May 2026", durationMin: 12, totalEvents: 24, dominantMarker: "Block" },
  { id: "s2", date: "12 May 2026", durationMin: 18, totalEvents: 31, dominantMarker: "Repetition" },
  { id: "s3", date: "09 May 2026", durationMin: 8,  totalEvents: 15, dominantMarker: "Interjection" },
  { id: "s4", date: "05 May 2026", durationMin: 22, totalEvents: 47, dominantMarker: "Prolongation" },
  { id: "s5", date: "02 May 2026", durationMin: 15, totalEvents: 28, dominantMarker: "Block" },
];

const markerStyles: Record<MarkerType, string> = {
  Block:        "bg-red-100 text-red-700 border-red-200",
  Repetition:   "bg-amber-100 text-amber-700 border-amber-200",
  Prolongation: "bg-blue-100 text-blue-700 border-blue-200",
  Interjection: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

const History = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Helmet>
        <title>Session History | Stammerly</title>
        <meta name="description" content="Review your past Stammerly detection sessions." />
        <link rel="canonical" href="/history" />
      </Helmet>
      <HubNavigation />
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Session History</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Your most recent detection sessions.
            </p>
          </header>

          <ul className="space-y-3">
            {SESSIONS.map((s) => (
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
        </div>
      </main>
    </div>
  );
};

export default History;
