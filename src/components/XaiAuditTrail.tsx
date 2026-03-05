import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, UserCog, Clock, ChevronDown, ChevronUp, GitBranch } from "lucide-react";

interface AuditEntry {
  id: string;
  timestamp: string;
  parameter: string;
  previousValue: string;
  newValue: string;
  source: "ai" | "clinician";
  clinicianName?: string;
  reasoning: string;
  confidence?: number;
  modelVersion?: string;
}

const MOCK_AUDIT_LOG: AuditEntry[] = [
  {
    id: "1",
    timestamp: "2026-03-05T09:14:00",
    parameter: "Difficulty Level",
    previousValue: "Intermediate",
    newValue: "Beginner",
    source: "clinician",
    clinicianName: "Dr. Sarah Thompson",
    reasoning: "Patient showed elevated anxiety (SUDS 7/10) during multi-syllable exercises. Stepping back to rebuild confidence before progressing.",
  },
  {
    id: "2",
    timestamp: "2026-03-04T18:30:00",
    parameter: "Difficulty Level",
    previousValue: "Beginner",
    newValue: "Intermediate",
    source: "ai",
    reasoning: "3 consecutive sessions with fluency >85% and %SS <3%. Adaptation score suggests readiness for increased complexity.",
    confidence: 91,
    modelVersion: "gemini-2.5-flash",
  },
  {
    id: "3",
    timestamp: "2026-03-03T14:22:00",
    parameter: "Focus Phoneme",
    previousValue: "/s/ clusters",
    newValue: "/b/ initial",
    source: "ai",
    reasoning: "Phoneme trigger heatmap shows /b/ initial blocks increased 35% over 7 days while /s/ improved. Redirecting focus.",
    confidence: 87,
    modelVersion: "gemini-2.5-flash",
  },
  {
    id: "4",
    timestamp: "2026-03-02T11:05:00",
    parameter: "Session Duration",
    previousValue: "15 min",
    newValue: "10 min",
    source: "clinician",
    clinicianName: "Dr. Sarah Thompson",
    reasoning: "Parent reports child becoming fatigued. Reducing session length to maintain engagement quality.",
  },
  {
    id: "5",
    timestamp: "2026-03-01T20:15:00",
    parameter: "Exercise Category",
    previousValue: "Free Talk",
    newValue: "Story Reading",
    source: "ai",
    reasoning: "Mood-fluency correlation shows higher fluency during structured tasks. Recommending story reading to build confidence before unstructured speech.",
    confidence: 78,
    modelVersion: "gemini-2.5-flash",
  },
  {
    id: "6",
    timestamp: "2026-02-28T09:40:00",
    parameter: "Easy Onset Threshold",
    previousValue: "70%",
    newValue: "60%",
    source: "clinician",
    clinicianName: "Dr. Sarah Thompson",
    reasoning: "Overriding AI threshold — clinical judgement: child is developing naturalness at cost of onset precision. Acceptable tradeoff at this stage.",
  },
];

export const XaiAuditTrail = () => {
  const [patient, setPatient] = useState("Alex M.");
  const [filter, setFilter] = useState<"all" | "ai" | "clinician">("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = MOCK_AUDIT_LOG.filter(
    (e) => filter === "all" || e.source === filter
  );

  const aiCount = MOCK_AUDIT_LOG.filter((e) => e.source === "ai").length;
  const clinicianCount = MOCK_AUDIT_LOG.filter((e) => e.source === "clinician").length;

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <GitBranch className="w-4 h-4 text-accent-sky" />
          XAI Audit Trail
          <Badge className="bg-accent-sky/20 text-accent-sky text-[9px] border-0">Explainable AI</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Track every AI parameter change and clinician override
        </p>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Filters */}
        <div className="flex gap-2">
          <Select value={patient} onValueChange={setPatient}>
            <SelectTrigger className="h-7 text-xs flex-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alex M.">Alex M.</SelectItem>
              <SelectItem value="Jordan S.">Jordan S.</SelectItem>
              <SelectItem value="Sam T.">Sam T.</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filter} onValueChange={(v) => setFilter(v as any)}>
            <SelectTrigger className="h-7 text-xs w-[130px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({MOCK_AUDIT_LOG.length})</SelectItem>
              <SelectItem value="ai">AI ({aiCount})</SelectItem>
              <SelectItem value="clinician">Clinician ({clinicianCount})</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Timeline */}
        <ScrollArea className="h-[320px] pr-2">
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-px bg-border" />

            <div className="space-y-3">
              {filtered.map((entry) => {
                const isExpanded = expanded === entry.id;
                const isAI = entry.source === "ai";
                const date = new Date(entry.timestamp);

                return (
                  <div key={entry.id} className="relative pl-10">
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-2.5 top-2 w-3 h-3 rounded-full border-2 ${
                        isAI
                          ? "bg-accent-sky border-accent-sky/50"
                          : "bg-accent-orange border-accent-orange/50"
                      }`}
                    />

                    <button
                      className={`w-full text-left p-2.5 rounded-lg border transition-all ${
                        isExpanded
                          ? isAI
                            ? "bg-accent-sky/5 border-accent-sky/20"
                            : "bg-accent-orange/5 border-accent-orange/20"
                          : "bg-secondary/30 border-border hover:bg-secondary/50"
                      }`}
                      onClick={() => setExpanded(isExpanded ? null : entry.id)}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-1.5">
                          {isAI ? (
                            <Bot className="w-3.5 h-3.5 text-accent-sky" />
                          ) : (
                            <UserCog className="w-3.5 h-3.5 text-accent-orange" />
                          )}
                          <span className="text-xs font-medium text-foreground">
                            {entry.parameter}
                          </span>
                          <Badge
                            className={`text-[8px] border-0 px-1 py-0 ${
                              isAI
                                ? "bg-accent-sky/20 text-accent-sky"
                                : "bg-accent-orange/20 text-accent-orange"
                            }`}
                          >
                            {isAI ? "AI" : "Override"}
                          </Badge>
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-3 h-3 text-muted-foreground" />
                        ) : (
                          <ChevronDown className="w-3 h-3 text-muted-foreground" />
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {date.toLocaleDateString("en-GB", { day: "numeric", month: "short" })}{" "}
                        {date.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                        <span className="text-foreground/60">
                          {entry.previousValue} → <strong className="text-foreground">{entry.newValue}</strong>
                        </span>
                      </div>

                      {isExpanded && (
                        <div className="mt-2 pt-2 border-t border-border space-y-1.5">
                          <p className="text-[11px] text-muted-foreground">
                            <strong>Reasoning:</strong> {entry.reasoning}
                          </p>
                          {isAI && entry.confidence && (
                            <p className="text-[10px] text-muted-foreground">
                              Confidence: <strong className="text-foreground">{entry.confidence}%</strong>
                              {entry.modelVersion && ` • Model: ${entry.modelVersion}`}
                            </p>
                          )}
                          {!isAI && entry.clinicianName && (
                            <p className="text-[10px] text-muted-foreground">
                              By: <strong className="text-foreground">{entry.clinicianName}</strong>
                            </p>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
