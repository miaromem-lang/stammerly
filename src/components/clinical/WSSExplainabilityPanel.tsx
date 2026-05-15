import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, TrendingUp, TrendingDown, Minus, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export interface WSSExplain {
  transcriptOnly: {
    wss: number;
    percentStuttered: number;
    sldCount: number;
    longestBlocks: number[];
    avgLongestBlockMs: number;
  };
  merged: {
    wss: number;
    percentStuttered: number;
    sldCount: number;
    longestBlocks: number[];
    avgLongestBlockMs: number;
  };
  contributions: {
    acousticEventsAdded: number;
    acousticBlocksAdded: number;
    intraWordBlocksAdded: number;
    addedSldCount: number;
    addedBlockDurationsMs: number[];
    wssDelta: number;
    percentStutteredDelta: number;
    avgLongestBlockDeltaMs: number;
  };
}

interface Props {
  explain: WSSExplain;
  className?: string;
}

const fmtMs = (ms: number) => `${Math.round(ms)}ms`;
const fmt1 = (n: number) => n.toFixed(1);

const DeltaPill = ({ value, suffix = "" }: { value: number; suffix?: string }) => {
  const Icon = value > 0.05 ? TrendingUp : value < -0.05 ? TrendingDown : Minus;
  const tone =
    value > 0.05
      ? "bg-destructive/10 text-destructive border-destructive/30"
      : value < -0.05
      ? "bg-success/10 text-success border-success/30"
      : "bg-muted text-muted-foreground border-border";
  const sign = value > 0 ? "+" : "";
  return (
    <Badge variant="outline" className={cn("gap-1 font-mono", tone)}>
      <Icon className="h-3 w-3" />
      {sign}
      {fmt1(value)}
      {suffix}
    </Badge>
  );
};

export const WSSExplainabilityPanel = ({ explain, className }: Props) => {
  const { transcriptOnly, merged, contributions } = explain;

  return (
    <Card className={cn("border-primary/20", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Info className="h-4 w-4 text-primary" />
          WSS Explainability — Transcript-only vs Merged Pool
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          How live acoustic events and intra-word silent blocks shifted the score against a Whisper-only baseline.
          Clinician/admin view.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Side-by-side scores */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] items-center gap-3">
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Transcript only</p>
            <p className="text-3xl font-bold font-mono">{fmt1(transcriptOnly.wss)}</p>
            <p className="text-xs text-muted-foreground">
              %SS {fmt1(transcriptOnly.percentStuttered)} · avg longest block {fmtMs(transcriptOnly.avgLongestBlockMs)}
            </p>
          </div>
          <ArrowRight className="hidden md:block h-5 w-5 text-muted-foreground mx-auto" />
          <div className="rounded-lg border-2 border-primary/40 bg-primary/5 p-3">
            <p className="text-xs uppercase tracking-wide text-primary">Merged (final WSS)</p>
            <p className="text-3xl font-bold font-mono text-primary">{fmt1(merged.wss)}</p>
            <p className="text-xs text-muted-foreground">
              %SS {fmt1(merged.percentStuttered)} · avg longest block {fmtMs(merged.avgLongestBlockMs)}
            </p>
          </div>
        </div>

        {/* Deltas */}
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Δ WSS</span>
            <DeltaPill value={contributions.wssDelta} />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Δ %SS</span>
            <DeltaPill value={contributions.percentStutteredDelta} suffix="%" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground">Δ avg longest block</span>
            <DeltaPill value={contributions.avgLongestBlockDeltaMs} suffix="ms" />
          </div>
        </div>

        {/* Contributions */}
        <div className="rounded-lg border bg-card/50 p-3 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            What the merged pool added
          </p>
          <ul className="text-sm space-y-1">
            <li className="flex justify-between">
              <span>Live acoustic events folded in</span>
              <span className="font-mono font-medium">{contributions.acousticEventsAdded}</span>
            </li>
            <li className="flex justify-between">
              <span>· Acoustic blocks/prolongations added to pool</span>
              <span className="font-mono font-medium">{contributions.acousticBlocksAdded}</span>
            </li>
            <li className="flex justify-between">
              <span>· Intra-word silent blocks (segment-level)</span>
              <span className="font-mono font-medium">{contributions.intraWordBlocksAdded}</span>
            </li>
            <li className="flex justify-between">
              <span>Extra SLD events counted</span>
              <span className="font-mono font-medium">+{contributions.addedSldCount}</span>
            </li>
          </ul>
        </div>

        {/* Longest blocks comparison */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Top 3 blocks (transcript)
            </p>
            <p className="font-mono text-sm">
              {transcriptOnly.longestBlocks.length
                ? transcriptOnly.longestBlocks.map(fmtMs).join(", ")
                : "—"}
            </p>
          </div>
          <div className="rounded-lg border border-primary/30 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-primary mb-1">
              Top 3 blocks (merged)
            </p>
            <p className="font-mono text-sm">
              {merged.longestBlocks.length ? merged.longestBlocks.map(fmtMs).join(", ") : "—"}
            </p>
          </div>
        </div>

        {contributions.addedBlockDurationsMs.length > 0 && (
          <div className="rounded-lg bg-muted/40 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
              Acoustic / intra-word durations folded into the pool
            </p>
            <p className="font-mono text-xs text-foreground/80">
              {contributions.addedBlockDurationsMs.slice(0, 10).map(fmtMs).join(" · ")}
              {contributions.addedBlockDurationsMs.length > 10 ? " …" : ""}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default WSSExplainabilityPanel;
