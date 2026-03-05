import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wrench, Mic, Battery, Cpu, CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw } from "lucide-react";

type DiagStatus = "idle" | "running" | "pass" | "warn" | "fail";

interface DiagCheck {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  status: DiagStatus;
  detail: string;
}

const initialChecks: DiagCheck[] = [
  {
    id: "mic",
    label: "Microphone Health",
    description: "Tests recording clarity and noise floor",
    icon: <Mic className="w-4 h-4" />,
    status: "idle",
    detail: "",
  },
  {
    id: "battery",
    label: "Battery Degradation",
    description: "Checks charge capacity vs. original spec",
    icon: <Battery className="w-4 h-4" />,
    status: "idle",
    detail: "",
  },
  {
    id: "firmware",
    label: "Firmware Version",
    description: "Verifies latest firmware is installed",
    icon: <Cpu className="w-4 h-4" />,
    status: "idle",
    detail: "",
  },
];

const simulateResult = (id: string): { status: DiagStatus; detail: string } => {
  const results: Record<string, { status: DiagStatus; detail: string }> = {
    mic: {
      status: "pass",
      detail: "SNR: 42 dB — Excellent clarity. Noise floor: -68 dBFS. No obstructions detected.",
    },
    battery: {
      status: "warn",
      detail: "Capacity: 87% of original (438 mAh / 500 mAh). ~14 months of usage. Normal degradation.",
    },
    firmware: {
      status: "pass",
      detail: "Version 2.4.1 — Up to date. Last updated: 28 Feb 2026.",
    },
  };
  return results[id] || { status: "pass", detail: "Check complete." };
};

const statusIcon = (status: DiagStatus) => {
  switch (status) {
    case "pass":
      return <CheckCircle2 className="w-5 h-5 text-success" />;
    case "warn":
      return <AlertTriangle className="w-5 h-5 text-gold" />;
    case "fail":
      return <XCircle className="w-5 h-5 text-destructive" />;
    case "running":
      return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
    default:
      return <div className="w-5 h-5 rounded-full bg-muted" />;
  }
};

const statusLabel = (status: DiagStatus) => {
  switch (status) {
    case "pass":
      return <Badge className="bg-success/20 text-success border-success/30 text-[10px]">Pass</Badge>;
    case "warn":
      return <Badge className="bg-gold/20 text-gold border-gold/30 text-[10px]">Warning</Badge>;
    case "fail":
      return <Badge className="bg-destructive/20 text-destructive border-destructive/30 text-[10px]">Fail</Badge>;
    case "running":
      return <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Running...</Badge>;
    default:
      return <Badge variant="outline" className="text-[10px]">Not run</Badge>;
  }
};

export const HardwareDiagnostics = () => {
  const [checks, setChecks] = useState<DiagCheck[]>(initialChecks);
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const runDiagnostics = async () => {
    setRunning(true);
    setProgress(0);
    setChecks(initialChecks.map((c) => ({ ...c, status: "idle", detail: "" })));

    for (let i = 0; i < initialChecks.length; i++) {
      setChecks((prev) =>
        prev.map((c, idx) => (idx === i ? { ...c, status: "running" } : c))
      );
      setProgress(((i + 0.5) / initialChecks.length) * 100);

      // Simulate async diagnostic
      await new Promise((r) => setTimeout(r, 1500 + Math.random() * 1000));

      const result = simulateResult(initialChecks[i].id);
      setChecks((prev) =>
        prev.map((c, idx) =>
          idx === i ? { ...c, status: result.status, detail: result.detail } : c
        )
      );
      setProgress(((i + 1) / initialChecks.length) * 100);
    }

    setRunning(false);
  };

  const allDone = checks.every((c) => c.status !== "idle" && c.status !== "running");

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Wrench className="w-5 h-5 text-accent-sky" />
          Hardware Diagnostics
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Self-service diagnostic check for your child's pendant
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress Bar */}
        {running && (
          <div className="space-y-2">
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Running diagnostics... {Math.round(progress)}%
            </p>
          </div>
        )}

        {/* Checks */}
        <div className="space-y-3">
          {checks.map((check) => (
            <div
              key={check.id}
              className={`p-3 rounded-lg border transition-all ${
                check.status === "pass"
                  ? "bg-success/5 border-success/20"
                  : check.status === "warn"
                  ? "bg-gold/5 border-gold/20"
                  : check.status === "fail"
                  ? "bg-destructive/5 border-destructive/20"
                  : "bg-secondary/30 border-border"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  {statusIcon(check.status)}
                  <div>
                    <p className="text-sm font-medium text-foreground">{check.label}</p>
                    <p className="text-[11px] text-muted-foreground">{check.description}</p>
                  </div>
                </div>
                {statusLabel(check.status)}
              </div>
              {check.detail && (
                <p className="text-xs text-muted-foreground mt-2 ml-7 bg-background/50 p-2 rounded">
                  {check.detail}
                </p>
              )}
            </div>
          ))}
        </div>

        {/* Action Button */}
        <Button
          className="w-full gap-2"
          variant="navy"
          onClick={runDiagnostics}
          disabled={running}
        >
          {running ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Running Diagnostics...
            </>
          ) : allDone ? (
            <>
              <RefreshCw className="w-4 h-4" />
              Run Again
            </>
          ) : (
            <>
              <Wrench className="w-4 h-4" />
              Run Full Diagnostic
            </>
          )}
        </Button>

        {allDone && (
          <div className="bg-primary/5 rounded-lg p-3">
            <p className="text-[10px] text-muted-foreground">
              💡 If any check fails, try restarting the pendant. For persistent issues, contact support@stammerly.com.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
