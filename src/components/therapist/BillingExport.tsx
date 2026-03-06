import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Download, PoundSterling } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const ICD10_CODES = [
  { code: "F98.5", description: "Adult onset fluency disorder (Stuttering)" },
  { code: "F80.0", description: "Phonological disorder" },
  { code: "F80.1", description: "Expressive language disorder" },
  { code: "F80.2", description: "Mixed receptive-expressive language disorder" },
  { code: "F80.8", description: "Other developmental disorders of speech and language" },
];

interface BillingLine {
  date: string;
  patientRef: string;
  icdCode: string;
  icdDescription: string;
  durationMinutes: number;
  amount: number;
}

export const BillingExport = () => {
  const [hourlyRate, setHourlyRate] = useState("65");
  const [selectedCode, setSelectedCode] = useState("F98.5");
  const [patientRef, setPatientRef] = useState("");
  const [generating, setGenerating] = useState(false);

  const generateInvoice = async () => {
    if (!patientRef.trim()) {
      toast.error("Please enter a patient reference");
      return;
    }

    setGenerating(true);
    try {
      // Fetch recent sessions for billing
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const { data: sessions, error } = await supabase
        .from("practice_sessions")
        .select("session_date, duration_seconds, exercise_name")
        .gte("session_date", thirtyDaysAgo.toISOString())
        .order("session_date", { ascending: true });

      if (error) throw error;

      if (!sessions || sessions.length === 0) {
        toast.error("No sessions found in the last 30 days");
        setGenerating(false);
        return;
      }

      const rate = parseFloat(hourlyRate) || 65;
      const icdInfo = ICD10_CODES.find(c => c.code === selectedCode) || ICD10_CODES[0];

      const lines: BillingLine[] = sessions.map(s => {
        const durationMin = Math.round((s.duration_seconds || 0) / 60);
        return {
          date: new Date(s.session_date).toLocaleDateString("en-GB"),
          patientRef: patientRef.trim(),
          icdCode: icdInfo.code,
          icdDescription: icdInfo.description,
          durationMinutes: durationMin,
          amount: Math.round((durationMin / 60) * rate * 100) / 100,
        };
      });

      const totalAmount = lines.reduce((sum, l) => sum + l.amount, 0);
      const totalMinutes = lines.reduce((sum, l) => sum + l.durationMinutes, 0);

      // Generate PDF
      const doc = new jsPDF();
      
      doc.setFontSize(18);
      doc.text("Stammerly Clinical Invoice", 14, 22);
      
      doc.setFontSize(10);
      doc.text(`Patient Reference: ${patientRef}`, 14, 35);
      doc.text(`Invoice Date: ${new Date().toLocaleDateString("en-GB")}`, 14, 42);
      doc.text(`ICD-10 Code: ${icdInfo.code} — ${icdInfo.description}`, 14, 49);
      doc.text(`Rate: £${rate.toFixed(2)}/hour`, 14, 56);

      autoTable(doc, {
        startY: 65,
        head: [["Date", "Ref", "ICD-10", "Duration (min)", "Amount (£)"]],
        body: lines.map(l => [
          l.date,
          l.patientRef,
          l.icdCode,
          l.durationMinutes.toString(),
          `£${l.amount.toFixed(2)}`,
        ]),
        foot: [["", "", "Total", `${totalMinutes} min`, `£${totalAmount.toFixed(2)}`]],
        theme: "striped",
        headStyles: { fillColor: [30, 58, 95] },
        footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: "bold" },
      });

      doc.save(`stammerly-invoice-${patientRef}-${new Date().toISOString().split("T")[0]}.pdf`);
      toast.success(`Invoice generated: ${lines.length} sessions, £${totalAmount.toFixed(2)} total`);
    } catch (err) {
      console.error("Error generating invoice:", err);
      toast.error("Failed to generate invoice");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <PoundSterling className="w-5 h-5 text-success" />
          Billing & Invoice Export
          <span className="text-xs text-muted-foreground font-normal ml-auto">ICD-10 Mapped</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Generate PDF invoices from session data with ICD-10 diagnostic codes for insurance or private billing.
        </p>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label className="text-xs">Patient Reference</Label>
            <Input
              placeholder="e.g., AM-001"
              value={patientRef}
              onChange={(e) => setPatientRef(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">Hourly Rate (£)</Label>
            <Input
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Diagnostic Code</Label>
          <Select value={selectedCode} onValueChange={setSelectedCode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ICD10_CODES.map(c => (
                <SelectItem key={c.code} value={c.code}>
                  {c.code} — {c.description}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateInvoice} disabled={generating} className="w-full" variant="navy">
          <Download className="w-4 h-4 mr-2" />
          {generating ? "Generating..." : "Generate Invoice PDF (Last 30 Days)"}
        </Button>
      </CardContent>
    </Card>
  );
};
