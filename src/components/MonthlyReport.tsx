import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileText, Download, Mail, Loader2, Calendar, User, TrendingUp, BarChart3, Target, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface MonthlyReportData {
  totalSessions: number;
  totalPracticeMinutes: number;
  avgFluencyScore: number;
  avgAccuracyScore: number;
  totalGems: number;
  totalStars: number;
  exerciseBreakdown: { category: string; count: number; avgFluency: number }[];
  weeklyProgress: { week: string; sessions: number; avgFluency: number }[];
  streakInfo: { currentStreak: number; longestStreak: number; totalDays: number };
  disfluencyTrends: { blocks: number; repetitions: number; prolongations: number };
  recommendations: string[];
}

interface MonthlyReportProps {
  recipientType: "parent" | "therapist" | "teacher";
  childName?: string;
}

export const MonthlyReport = ({ recipientType, childName = "Child" }: MonthlyReportProps) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });
  const [email, setEmail] = useState("");
  const [reportData, setReportData] = useState<MonthlyReportData | null>(null);

  const getMonthOptions = () => {
    const options = [];
    const now = new Date();
    for (let i = 0; i < 6; i++) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      options.push({
        value: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`,
        label: date.toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      });
    }
    return options;
  };

  const fetchReportData = async (): Promise<MonthlyReportData> => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const startDate = new Date(year, month - 1, 1).toISOString();
    const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

    // Fetch practice sessions for the month
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("*")
      .gte("session_date", startDate)
      .lte("session_date", endDate)
      .order("session_date", { ascending: true });

    // Fetch streak info
    const { data: streaks } = await supabase
      .from("user_streaks")
      .select("*")
      .limit(1)
      .single();

    // Fetch progress
    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .limit(1)
      .single();

    const sessionList = sessions || [];
    
    // Calculate metrics
    const totalSessions = sessionList.length;
    const totalPracticeMinutes = Math.round(sessionList.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / 60);
    const avgFluencyScore = sessionList.length > 0
      ? Math.round(sessionList.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / sessionList.length)
      : 0;
    const avgAccuracyScore = sessionList.length > 0
      ? Math.round(sessionList.reduce((sum, s) => sum + (s.accuracy_score || 0), 0) / sessionList.length)
      : 0;
    const totalGems = sessionList.reduce((sum, s) => sum + (s.gems_earned || 0), 0);
    const totalStars = sessionList.reduce((sum, s) => sum + (s.stars_earned || 0), 0);

    // Exercise breakdown by category
    const categoryMap: Record<string, { count: number; totalFluency: number }> = {};
    sessionList.forEach((s) => {
      const cat = s.exercise_category || "general";
      if (!categoryMap[cat]) categoryMap[cat] = { count: 0, totalFluency: 0 };
      categoryMap[cat].count += 1;
      categoryMap[cat].totalFluency += s.fluency_score || 0;
    });
    const exerciseBreakdown = Object.entries(categoryMap).map(([category, data]) => ({
      category: category.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
      count: data.count,
      avgFluency: Math.round(data.totalFluency / data.count),
    }));

    // Weekly progress
    const weeklyMap: Record<string, { sessions: number; totalFluency: number }> = {};
    sessionList.forEach((s) => {
      const date = new Date(s.session_date);
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      const weekKey = weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      if (!weeklyMap[weekKey]) weeklyMap[weekKey] = { sessions: 0, totalFluency: 0 };
      weeklyMap[weekKey].sessions += 1;
      weeklyMap[weekKey].totalFluency += s.fluency_score || 0;
    });
    const weeklyProgress = Object.entries(weeklyMap).map(([week, data]) => ({
      week,
      sessions: data.sessions,
      avgFluency: Math.round(data.totalFluency / data.sessions),
    }));

    // Disfluency trends
    const disfluencyTrends = {
      blocks: sessionList.reduce((sum, s) => sum + (s.blocks_count || 0), 0),
      repetitions: sessionList.reduce((sum, s) => sum + (s.repetitions_count || 0), 0),
      prolongations: sessionList.reduce((sum, s) => sum + (s.prolongations_count || 0), 0),
    };

    // Generate AI recommendations based on data
    const recommendations: string[] = [];
    if (totalSessions < 10) {
      recommendations.push("Consider practicing more frequently - aim for daily short sessions.");
    }
    if (avgFluencyScore < 60) {
      recommendations.push("Focus on foundational exercises like breathing and easy onset.");
    }
    if (disfluencyTrends.blocks > disfluencyTrends.repetitions) {
      recommendations.push("Blocks are prevalent - emphasize breathing exercises and light contact techniques.");
    }
    if (exerciseBreakdown.length < 3) {
      recommendations.push("Try exploring more exercise categories for well-rounded practice.");
    }
    if (recommendations.length === 0) {
      recommendations.push("Great progress! Continue with the current practice routine.");
    }

    return {
      totalSessions,
      totalPracticeMinutes,
      avgFluencyScore,
      avgAccuracyScore,
      totalGems,
      totalStars,
      exerciseBreakdown,
      weeklyProgress,
      streakInfo: {
        currentStreak: streaks?.current_streak || 0,
        longestStreak: streaks?.longest_streak || 0,
        totalDays: streaks?.total_practice_days || 0,
      },
      disfluencyTrends,
      recommendations,
    };
  };

  const generatePDF = async (data: MonthlyReportData): Promise<jsPDF> => {
    const doc = new jsPDF();
    const [year, month] = selectedMonth.split("-").map(Number);
    const monthName = new Date(year, month - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Header
    doc.setFillColor(255, 107, 53); // accent-orange
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Speech Practice Report", 20, 25);
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${childName} • ${monthName}`, 20, 35);

    // Reset text color
    doc.setTextColor(0, 0, 0);

    // Summary Section
    let yPos = 55;
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text("Monthly Summary", 20, yPos);
    yPos += 10;

    // Summary boxes
    const summaryData = [
      { label: "Total Sessions", value: data.totalSessions.toString(), icon: "📊" },
      { label: "Practice Time", value: `${data.totalPracticeMinutes} min`, icon: "⏱️" },
      { label: "Avg Fluency", value: `${data.avgFluencyScore}%`, icon: "🎯" },
      { label: "Gems Earned", value: data.totalGems.toString(), icon: "💎" },
    ];

    doc.setFontSize(10);
    summaryData.forEach((item, i) => {
      const x = 20 + (i % 2) * 90;
      const y = yPos + Math.floor(i / 2) * 20;
      doc.setFillColor(245, 245, 245);
      doc.roundedRect(x, y, 80, 15, 3, 3, "F");
      doc.setFont("helvetica", "normal");
      doc.text(`${item.icon} ${item.label}: `, x + 5, y + 10);
      doc.setFont("helvetica", "bold");
      doc.text(item.value, x + 55, y + 10);
    });

    yPos += 50;

    // Streak info
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("🔥 Streak Progress", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Current Streak: ${data.streakInfo.currentStreak} days`, 25, yPos);
    doc.text(`Longest Streak: ${data.streakInfo.longestStreak} days`, 100, yPos);
    yPos += 15;

    // Exercise Breakdown Table
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📚 Exercise Breakdown", 20, yPos);
    yPos += 5;

    if (data.exerciseBreakdown.length > 0) {
      autoTable(doc, {
        startY: yPos,
        head: [["Category", "Sessions", "Avg Fluency"]],
        body: data.exerciseBreakdown.map((e) => [e.category, e.count.toString(), `${e.avgFluency}%`]),
        theme: "striped",
        headStyles: { fillColor: [255, 107, 53] },
        margin: { left: 20, right: 20 },
      });
      yPos = (doc as any).lastAutoTable.finalY + 15;
    } else {
      yPos += 10;
      doc.setFontSize(10);
      doc.setFont("helvetica", "italic");
      doc.text("No exercise data for this period", 25, yPos);
      yPos += 15;
    }

    // Disfluency Analysis
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("📈 Disfluency Patterns", 20, yPos);
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Blocks: ${data.disfluencyTrends.blocks}`, 25, yPos);
    doc.text(`Repetitions: ${data.disfluencyTrends.repetitions}`, 80, yPos);
    doc.text(`Prolongations: ${data.disfluencyTrends.prolongations}`, 145, yPos);
    yPos += 15;

    // Recommendations
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("💡 Recommendations", 20, yPos);
    yPos += 8;
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    data.recommendations.forEach((rec, i) => {
      doc.text(`• ${rec}`, 25, yPos);
      yPos += 7;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 20, 285);
    doc.text("Stammerly - Speech Therapy Practice App", 140, 285);

    return doc;
  };

  const handleDownload = async () => {
    setLoading(true);
    try {
      const data = await fetchReportData();
      setReportData(data);
      const pdf = await generatePDF(data);
      const [year, month] = selectedMonth.split("-");
      pdf.save(`speech-report-${year}-${month}.pdf`);
      toast.success("Report downloaded! 📄");
    } catch (err) {
      console.error("Error generating PDF:", err);
      toast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  const handleEmail = async () => {
    if (!email.trim()) {
      toast.error("Please enter an email address");
      return;
    }

    setLoading(true);
    try {
      const data = await fetchReportData();
      const pdf = await generatePDF(data);
      const pdfBase64 = pdf.output("datauristring").split(",")[1];

      // For now, just download since email requires Resend setup
      // You can integrate Resend here later
      toast.info("Email feature requires setup. Downloading instead...");
      const [year, month] = selectedMonth.split("-");
      pdf.save(`speech-report-${year}-${month}.pdf`);
    } catch (err) {
      console.error("Error:", err);
      toast.error("Failed to send report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileText className="w-4 h-4" />
          Monthly Report
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Generate Monthly Report
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Month Selector */}
          <div>
            <label className="text-sm font-medium mb-2 block">Select Month</label>
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {getMonthOptions().map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Report Preview */}
          <Card className="bg-secondary/50">
            <CardContent className="p-4">
              <p className="text-sm text-muted-foreground mb-2">Report includes:</p>
              <ul className="text-sm space-y-1">
                <li className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-primary" />
                  Practice session summary
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  Fluency score trends
                </li>
                <li className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-accent-sky" />
                  Disfluency analysis
                </li>
                <li className="flex items-center gap-2">
                  <Trophy className="w-4 h-4 text-gold" />
                  Achievements & streaks
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Download Button */}
          <Button onClick={handleDownload} disabled={loading} className="w-full">
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Download className="w-4 h-4 mr-2" />
            )}
            Download PDF
          </Button>

          {/* Email Option */}
          <div className="border-t pt-4">
            <label className="text-sm font-medium mb-2 block">Or send via email</label>
            <div className="flex gap-2">
              <Input
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1"
              />
              <Button variant="outline" onClick={handleEmail} disabled={loading}>
                <Mail className="w-4 h-4" />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Email feature requires additional setup
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
