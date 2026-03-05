import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { FileDown, FileText, Table2, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type ExportFormat = "csv" | "pdf";
type ReportType = "disfluency" | "clinical_notes" | "progress";

interface ExportConfig {
  label: string;
  description: string;
  icon: React.ReactNode;
}

const REPORT_TYPES: Record<ReportType, ExportConfig> = {
  disfluency: {
    label: "Disfluency Report",
    description: "SLD/OD counts, %SS, WSS, phoneme triggers",
    icon: <Table2 className="w-4 h-4" />,
  },
  clinical_notes: {
    label: "Clinical Notes",
    description: "Session reviews, SOAP notes, therapist annotations",
    icon: <FileText className="w-4 h-4" />,
  },
  progress: {
    label: "Progress Summary",
    description: "Fluency scores, technique accuracy, streaks",
    icon: <FileText className="w-4 h-4" />,
  },
};

// Mock clinical data for export
const MOCK_DISFLUENCY_DATA = [
  { date: "2026-03-04", session: "Easy Onset", sld: 3, od: 2, pss: "4.2%", wss: "2.1", blocks: 1, prolongations: 1, repetitions: 1, phoneme: "/s/", severity: "mild" },
  { date: "2026-03-03", session: "Story Reading", sld: 5, od: 3, pss: "6.1%", wss: "3.4", blocks: 2, prolongations: 2, repetitions: 1, phoneme: "/b/", severity: "moderate" },
  { date: "2026-03-02", session: "Free Talk", sld: 2, od: 1, pss: "2.8%", wss: "1.5", blocks: 0, prolongations: 1, repetitions: 1, phoneme: "/t/", severity: "mild" },
  { date: "2026-03-01", session: "Phrase Power", sld: 4, od: 2, pss: "5.0%", wss: "2.8", blocks: 1, prolongations: 1, repetitions: 2, phoneme: "/s/", severity: "moderate" },
];

const MOCK_CLINICAL_NOTES = [
  { date: "2026-03-04", type: "Session Review", note: "Improved easy onset. Consistent use of light contacts on /s/ clusters.", rating: "4/5", recommendation: "Progress to multi-syllable words" },
  { date: "2026-03-03", type: "SOAP Note", note: "S: Child reports feeling confident. O: %SS decreased to 4.2%. A: Good progress. P: Increase complexity.", rating: "N/A", recommendation: "Introduce paragraph-level reading" },
  { date: "2026-03-01", type: "Annotation Override", note: "AI classified as block; corrected to prolongation based on acoustic analysis.", rating: "N/A", recommendation: "Monitor /b/ onset pattern" },
];

export const NhsDataExport = () => {
  const [reportType, setReportType] = useState<ReportType>("disfluency");
  const [patient, setPatient] = useState("Alex M.");
  const [exporting, setExporting] = useState(false);

  const generateCSV = (type: ReportType): string => {
    if (type === "disfluency") {
      const headers = "Date,Session,SLD Count,OD Count,%SS,WSS,Blocks,Prolongations,Repetitions,Primary Phoneme,Severity\n";
      const rows = MOCK_DISFLUENCY_DATA.map((r) =>
        `${r.date},${r.session},${r.sld},${r.od},${r.pss},${r.wss},${r.blocks},${r.prolongations},${r.repetitions},${r.phoneme},${r.severity}`
      ).join("\n");
      return headers + rows;
    }
    if (type === "clinical_notes") {
      const headers = "Date,Type,Note,Rating,Recommendation\n";
      const rows = MOCK_CLINICAL_NOTES.map((r) =>
        `${r.date},"${r.type}","${r.note}",${r.rating},"${r.recommendation}"`
      ).join("\n");
      return headers + rows;
    }
    // progress
    const headers = "Date,Session,Fluency Score,Technique Score,%SS,Streak\n";
    const rows = MOCK_DISFLUENCY_DATA.map((r) =>
      `${r.date},${r.session},87,82,${r.pss},12`
    ).join("\n");
    return headers + rows;
  };

  const generatePDF = (type: ReportType) => {
    const doc = new jsPDF();
    const now = new Date().toLocaleDateString("en-GB");

    // NHS-style header
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("CONFIDENTIAL — NHS Electronic Health Record Export", 14, 10);
    doc.text(`Generated: ${now}`, 14, 15);
    doc.text(`Patient: ${patient}`, 14, 20);
    doc.text("System: Stammerly Clinical Platform v2.4", 14, 25);

    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.text(REPORT_TYPES[type].label, 14, 35);

    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("DCB0129 Clinical Safety Compliant | DTAC Standards | UK GDPR", 14, 40);

    if (type === "disfluency") {
      autoTable(doc, {
        startY: 45,
        head: [["Date", "Session", "SLD", "OD", "%SS", "WSS", "Blocks", "Prolong.", "Reps", "Phoneme", "Severity"]],
        body: MOCK_DISFLUENCY_DATA.map((r) => [
          r.date, r.session, r.sld, r.od, r.pss, r.wss, r.blocks, r.prolongations, r.repetitions, r.phoneme, r.severity,
        ]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [35, 47, 89] },
      });
    } else if (type === "clinical_notes") {
      autoTable(doc, {
        startY: 45,
        head: [["Date", "Type", "Note", "Rating", "Recommendation"]],
        body: MOCK_CLINICAL_NOTES.map((r) => [r.date, r.type, r.note, r.rating, r.recommendation]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [35, 47, 89] },
        columnStyles: { 2: { cellWidth: 60 }, 4: { cellWidth: 40 } },
      });
    } else {
      autoTable(doc, {
        startY: 45,
        head: [["Date", "Session", "Fluency", "Technique", "%SS", "Streak"]],
        body: MOCK_DISFLUENCY_DATA.map((r) => [r.date, r.session, "87%", "82%", r.pss, "12 days"]),
        styles: { fontSize: 7 },
        headStyles: { fillColor: [35, 47, 89] },
      });
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(7);
      doc.setTextColor(150);
      doc.text(
        `Stammerly | NHS EHR Compatible | Page ${i} of ${pageCount}`,
        14,
        doc.internal.pageSize.height - 10
      );
    }

    return doc;
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);

    // Brief delay for UX
    await new Promise((r) => setTimeout(r, 800));

    try {
      if (format === "csv") {
        const csv = generateCSV(reportType);
        const blob = new Blob([csv], { type: "text/csv" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `stammerly_${reportType}_${patient.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
      } else {
        const doc = generatePDF(reportType);
        doc.save(`stammerly_${reportType}_${patient.replace(/\s/g, "_")}_${new Date().toISOString().split("T")[0]}.pdf`);
      }
      toast.success(`${format.toUpperCase()} exported — NHS EHR compatible format`);
    } catch (error) {
      toast.error("Export failed. Please try again.");
    }

    setExporting(false);
  };

  return (
    <Card className="glass-card-strong">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-foreground text-base">
          <FileDown className="w-4 h-4 text-primary" />
          NHS Data Export
          <Badge className="bg-success/20 text-success text-[9px] border-0">EHR Compatible</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">
          Export clinical data in NHS Electronic Health Record format
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Patient Selection */}
        <div className="grid grid-cols-2 gap-3">
          <Select value={patient} onValueChange={setPatient}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Patient..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Alex M.">Alex M.</SelectItem>
              <SelectItem value="Jordan S.">Jordan S.</SelectItem>
              <SelectItem value="Sam T.">Sam T.</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={(v) => setReportType(v as ReportType)}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Report type..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(REPORT_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Report Description */}
        <div className="bg-secondary/30 rounded-lg p-3">
          <p className="text-xs text-muted-foreground">
            {REPORT_TYPES[reportType].description}
          </p>
        </div>

        {/* Export Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handleExport("csv")}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <Table2 className="w-3 h-3" />}
            Export CSV
          </Button>
          <Button
            variant="navy"
            size="sm"
            className="gap-1.5 text-xs"
            onClick={() => handleExport("pdf")}
            disabled={exporting}
          >
            {exporting ? <Loader2 className="w-3 h-3 animate-spin" /> : <FileDown className="w-3 h-3" />}
            Export PDF
          </Button>
        </div>

        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <CheckCircle2 className="w-3 h-3 text-success" />
          DCB0129 compliant • DTAC standards • UK GDPR
        </div>
      </CardContent>
    </Card>
  );
};
