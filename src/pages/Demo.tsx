import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Sparkles, Stethoscope } from "lucide-react";
import PageBackground from "@/components/PageBackground";
import {
  AcousticTimeline,
  type AcousticEventRow,
  type WordTimingLite,
} from "@/components/clinical/AcousticTimeline";
import { WSSExplainabilityPanel } from "@/components/clinical/WSSExplainabilityPanel";

// ----- Mock take: "She sells seashells by the shore" -----

const DEMO_TRANSCRIPT = "She sells s-s-seashells by the [block] shore";
const DEMO_DURATION_S = 8.4;

const DEMO_WORDS: WordTimingLite[] = [
  { word: "She",       start: 0.20, end: 0.55 },
  { word: "sells",     start: 0.62, end: 1.05 },
  { word: "s-s-seashells", start: 1.40, end: 3.10 },
  { word: "by",        start: 3.30, end: 3.55 },
  { word: "the",       start: 3.65, end: 3.90 },
  { word: "shore",     start: 5.30, end: 6.10 },
];

const DEMO_EVENTS: AcousticEventRow[] = [
  { id: "d1", session_id: "demo", user_id: "demo", event_type: "REPETITION",   duration_ms: 420, confidence: 0.78, occurred_at_ms: 1400, detail: "Sound repetition on /s/" },
  { id: "d2", session_id: "demo", user_id: "demo", event_type: "REPETITION",   duration_ms: 380, confidence: 0.72, occurred_at_ms: 1900, detail: "Sound repetition on /s/" },
  { id: "d3", session_id: "demo", user_id: "demo", event_type: "PROLONGATION", duration_ms: 640, confidence: 0.81, occurred_at_ms: 2400, detail: "Prolonged /s/ — 640ms" },
  { id: "d4", session_id: "demo", user_id: "demo", event_type: "BLOCK",        duration_ms: 1280, confidence: 0.88, occurred_at_ms: 4100, detail: "Silent block before /sh/" },
  { id: "d5", session_id: "demo", user_id: "demo", event_type: "INTERJECTION", duration_ms: 220, confidence: 0.65, occurred_at_ms: 5050, detail: "Filler 'um'" },
];

const DEMO_WSS_EXPLAIN = {
  transcriptOnly: {
    wss: 35,
    percentStuttered: 9.1,
    sldCount: 2,
    longestBlocks: [310, 180],
    avgLongestBlockMs: 245,
  },
  merged: {
    wss: 55,
    percentStuttered: 13.6,
    sldCount: 4,
    longestBlocks: [1280, 640, 420],
    avgLongestBlockMs: 780,
  },
  contributions: {
    acousticEventsAdded: 5,
    acousticBlocksAdded: 2,
    intraWordBlocksAdded: 1,
    addedSldCount: 2,
    addedBlockDurationsMs: [1280, 640, 420, 380, 220],
    wssDelta: 20,
    percentStutteredDelta: 4.5,
    avgLongestBlockDeltaMs: 535,
  },
};

const Demo = () => {
  return (
    <div className="min-h-screen">
      <Helmet>
        <title>Stammerly Clinician Demo · Acoustic Timeline</title>
        <meta
          name="description"
          content="Explore how Stammerly visualises captured acoustic events alongside transcript timing for therapists and admins."
        />
      </Helmet>
      <PageBackground />

      <header className="border-b bg-card/70 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" /> Back to home
          </Link>
          <Badge variant="outline" className="gap-1.5 border-primary/40 bg-primary/5 text-primary">
            <Sparkles className="h-3 w-3" /> Promo demo · no sign-in required
          </Badge>
        </div>
      </header>

      <main className="container mx-auto max-w-5xl px-4 py-8 space-y-6">
        <Card className="border-primary/20">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Stethoscope className="h-5 w-5 text-primary" />
              <CardTitle>Clinician results — example student take</CardTitle>
            </div>
            <p className="text-sm text-muted-foreground">
              This is a read-only walkthrough of the therapist/admin view after a child completes a
              practice take. The data below is mocked for demonstration. In production, this view is
              gated to therapist and admin roles only.
            </p>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-3 text-sm">
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs uppercase text-muted-foreground">Stimulus</p>
              <p className="font-medium">"She sells seashells by the shore"</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs uppercase text-muted-foreground">Take duration</p>
              <p className="font-medium font-mono">{DEMO_DURATION_S.toFixed(1)}s</p>
            </div>
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs uppercase text-muted-foreground">Acoustic events captured</p>
              <p className="font-medium font-mono">{DEMO_EVENTS.length}</p>
            </div>
          </CardContent>
        </Card>

        <AcousticTimeline
          events={DEMO_EVENTS}
          words={DEMO_WORDS}
          transcript={DEMO_TRANSCRIPT}
          durationSeconds={DEMO_DURATION_S}
          title="Acoustic events × transcript timing"
        />

        <WSSExplainabilityPanel explain={DEMO_WSS_EXPLAIN} />

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Want the full clinician dashboard?</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>Aggregate trends, S.O.A.P. notes, AI quest validation and more sit behind sign-in.</span>
            <Button asChild>
              <Link to="/contact">Request a live walkthrough</Link>
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Demo;
