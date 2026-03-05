import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { FileText, Loader2, Copy, Check, Download, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ClinicalData {
  // Surface metrics
  weightedStutteringSeverity: number;
  percentSyllablesStuttered: number;
  sldCount: number;
  odCount: number;
  
  // Temporal
  initiationLagMs: number | null;
  naturalnessScore: number | null;
  
  // Disfluency breakdown
  blocksCount: number;
  prolongationsCount: number;
  repetitionsCount: number;
  
  // Technique
  easyOnsetScore: number | null;
  easyOnsetAttempts: number;
  easyOnsetSuccesses: number;
  
  // Engagement
  totalSessions: number;
  adherenceRate: number;
  streakDays: number;
  
  // Context
  patientName?: string;
  sessionDate?: string;

  // Psychosocial
  recentMoodAvg?: number | null;
  recentAnxietyAvg?: number | null;
  moodTrend?: "improving" | "declining" | "stable" | null;
  moodCheckinCount?: number;
}

interface SOAPNoteGeneratorProps {
  clinicalData: ClinicalData;
}

export const SOAPNoteGenerator = ({ clinicalData }: SOAPNoteGeneratorProps) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [soapNote, setSoapNote] = useState<string>("");
  const [copied, setCopied] = useState(false);
  
  const generateSOAPNote = async () => {
    setIsGenerating(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-soap-note', {
        body: { clinicalData }
      });
      
      if (error) throw error;
      
      setSoapNote(data.soapNote);
      toast.success("S.O.A.P. note generated!");
    } catch (error) {
      console.error("Error generating S.O.A.P. note:", error);
      
      // Fallback to local generation
      const localNote = generateLocalSOAPNote(clinicalData);
      setSoapNote(localNote);
      toast.success("S.O.A.P. note generated locally");
    } finally {
      setIsGenerating(false);
    }
  };
  
  const generateLocalSOAPNote = (data: ClinicalData): string => {
    const date = data.sessionDate || new Date().toLocaleDateString();
    const name = data.patientName || "Patient";
    
    // Subjective
    const adherenceDescription = data.adherenceRate >= 80 ? "excellent" : 
      data.adherenceRate >= 60 ? "good" : 
      data.adherenceRate >= 40 ? "fair" : "limited";
    
    // Objective
    const severityLevel = data.weightedStutteringSeverity > 50 ? "moderate-to-severe" :
      data.weightedStutteringSeverity > 25 ? "mild-to-moderate" : "mild";
    
    // Assessment
    const techniqueSuccess = data.easyOnsetAttempts > 0 
      ? ((data.easyOnsetSuccesses / data.easyOnsetAttempts) * 100).toFixed(0)
      : "N/A";
    
    // Plan
    const focusAreas: string[] = [];
    if (data.blocksCount > 3) focusAreas.push("block management through relaxed breathing");
    if (data.prolongationsCount > 2) focusAreas.push("smooth phonation techniques");
    if (data.adherenceRate < 60) focusAreas.push("increasing home practice frequency");
    if (data.easyOnsetAttempts > 0 && (data.easyOnsetSuccesses / data.easyOnsetAttempts) < 0.5) {
      focusAreas.push("reinforcing easy onset technique");
    }
    if (focusAreas.length === 0) focusAreas.push("maintenance and generalization");
    
    // Psychosocial
    const hasMoodData = data.recentMoodAvg !== null && data.recentMoodAvg !== undefined;
    const moodDescription = hasMoodData
      ? data.recentMoodAvg! >= 4 ? "positive" : data.recentMoodAvg! >= 3 ? "neutral" : "low"
      : null;
    const anxietyDescription = data.recentAnxietyAvg !== null && data.recentAnxietyAvg !== undefined
      ? data.recentAnxietyAvg! >= 7 ? "elevated" : data.recentAnxietyAvg! >= 4 ? "moderate" : "low"
      : null;

    return `S.O.A.P. NOTE
Date: ${date}
Patient: ${name}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SUBJECTIVE:
${name} completed ${data.totalSessions} practice session(s) this period with ${adherenceDescription} adherence (${data.adherenceRate.toFixed(0)}%). Current practice streak: ${data.streakDays} day(s). ${data.streakDays > 7 ? "Patient demonstrates consistent engagement with home practice program." : data.streakDays > 3 ? "Practice frequency is developing." : "Encourage increased practice frequency."}${hasMoodData ? `\n\nPSYCHOSOCIAL: Self-reported mood over recent check-ins averaged ${data.recentMoodAvg!.toFixed(1)}/5 (${moodDescription}).${anxietyDescription ? ` Self-reported anxiety averaged ${data.recentAnxietyAvg!.toFixed(1)}/10 (${anxietyDescription}).` : ""}${data.moodTrend ? ` Mood trend: ${data.moodTrend}.` : ""} Based on ${data.moodCheckinCount ?? 0} check-in(s).` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVE:
• Weighted Stuttering Severity (WSS): ${data.weightedStutteringSeverity.toFixed(1)}/100 (${severityLevel})
• Percent Syllables Stuttered (%SS): ${data.percentSyllablesStuttered.toFixed(1)}%
• Stutter-Like Disfluencies (SLD): ${data.sldCount}
• Other Disfluencies (OD): ${data.odCount}
• Blocks: ${data.blocksCount} | Prolongations: ${data.prolongationsCount} | Repetitions: ${data.repetitionsCount}
• Initiation Lag: ${data.initiationLagMs ? data.initiationLagMs.toFixed(0) + 'ms' : 'Not measured'}
• Naturalness Score: ${data.naturalnessScore ?? 'Not measured'}/9
• Easy Onset Score: ${data.easyOnsetScore ?? 'N/A'}%
• Technique Success Rate: ${techniqueSuccess}% (${data.easyOnsetSuccesses}/${data.easyOnsetAttempts} attempts)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ASSESSMENT:
${name} presents with ${severityLevel} developmental stuttering characterized primarily by ${data.blocksCount > data.prolongationsCount ? "blocks" : "prolongations"} and ${data.sldCount > data.odCount ? "stutter-like disfluencies" : "a mix of disfluency types"}. ${data.naturalnessScore && data.naturalnessScore <= 4 ? "Speech naturalness is within functional limits." : data.naturalnessScore && data.naturalnessScore >= 7 ? "Speech may sound overly controlled; monitor for 'robotic' quality." : "Speech naturalness is developing."} ${data.easyOnsetAttempts > 0 && (data.easyOnsetSuccesses / data.easyOnsetAttempts) >= 0.6 ? "Good progress with fluency shaping techniques noted." : "Continued practice with fluency techniques recommended."} ${data.adherenceRate >= 60 ? "Family engagement with home practice is positive prognostic indicator." : "Increased home practice would support treatment progress."}${hasMoodData && moodDescription === "low" ? ` Psychosocial concern: Self-reported mood is low (${data.recentMoodAvg!.toFixed(1)}/5), which may be contributing to increased disfluency patterns (Parsons et al., 2021).` : ""}${anxietyDescription === "elevated" ? ` Elevated self-reported anxiety (${data.recentAnxietyAvg!.toFixed(1)}/10) warrants attention and may correlate with increased phoneme trigger sensitivity.` : ""}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PLAN:
1. Continue current treatment approach with focus on: ${focusAreas.join("; ")}.
2. ${data.adherenceRate < 60 ? "Discuss strategies to increase home practice frequency with family." : "Maintain current practice schedule."}
3. ${data.blocksCount > 3 ? "Introduce progressive desensitization for blocking moments." : "Continue reinforcing successful fluency strategies."}
4. ${data.naturalnessScore && data.naturalnessScore >= 7 ? "Monitor for over-controlled speech; encourage natural intonation." : "No immediate concerns regarding speech naturalness."}${anxietyDescription === "elevated" || moodDescription === "low" ? "\n5. Consider psychosocial support: brief CBT-based strategies for speech-related anxiety management." : ""}
${!(anxietyDescription === "elevated" || moodDescription === "low") ? "5" : "6"}. Next session: Review progress and adjust targets as appropriate.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Generated by Stammerly Clinical Analytics - ${new Date().toISOString().split('T')[0]}]`;
  };
  
  const copyToClipboard = async () => {
    await navigator.clipboard.writeText(soapNote);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };
  
  const downloadNote = () => {
    const blob = new Blob([soapNote], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `SOAP_Note_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Note downloaded");
  };

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <FileText className="w-5 h-5 text-primary" />
          Automated S.O.A.P. Note Generator
          <span className="text-xs text-muted-foreground font-normal ml-auto">Clinical Documentation</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate clinical documentation based on collected session data. 
          Notes follow the S.O.A.P. format (Subjective, Objective, Assessment, Plan).
        </p>
        
        <div className="flex gap-2">
          <Button 
            onClick={generateSOAPNote} 
            disabled={isGenerating}
            className="flex-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : soapNote ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Regenerate Note
              </>
            ) : (
              <>
                <FileText className="w-4 h-4 mr-2" />
                Generate S.O.A.P. Note
              </>
            )}
          </Button>
        </div>
        
        {soapNote && (
          <div className="space-y-3">
            <div className="flex justify-end gap-2">
              <Button variant="outline" size="sm" onClick={copyToClipboard}>
                {copied ? (
                  <Check className="w-4 h-4 mr-1 text-success" />
                ) : (
                  <Copy className="w-4 h-4 mr-1" />
                )}
                {copied ? "Copied" : "Copy"}
              </Button>
              <Button variant="outline" size="sm" onClick={downloadNote}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            </div>
            
            <Textarea 
              value={soapNote}
              onChange={(e) => setSoapNote(e.target.value)}
              className="min-h-[400px] font-mono text-sm bg-secondary/30"
              placeholder="S.O.A.P. note will appear here..."
            />
            
            <p className="text-xs text-muted-foreground">
              <strong>Note:</strong> This is an AI-generated draft. Review and modify as clinically appropriate 
              before adding to official patient records.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
