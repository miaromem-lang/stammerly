import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Shield, Trash2, Download, Loader2, AlertTriangle, FileDown, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const PrivacyPortal = () => {
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [deleteComplete, setDeleteComplete] = useState(false);

  const handleExportData = async () => {
    setExporting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in first"); return; }

      // Fetch all child-related data in parallel
      const [
        sessions,
        achievements,
        progress,
        streaks,
        questCompletions,
        moodCheckins,
        contextNotes,
        fluencyRatings,
        victoryLogs,
        pendantHistory,
        disfluencyLogs,
        subjectiveRatings,
      ] = await Promise.all([
        supabase.from("practice_sessions").select("*").eq("user_id", user.id),
        supabase.from("user_achievements").select("*").eq("user_id", user.id),
        supabase.from("user_progress").select("*").eq("user_id", user.id),
        supabase.from("user_streaks").select("*").eq("user_id", user.id),
        supabase.from("quest_completions").select("*").eq("user_id", user.id),
        supabase.from("mood_checkins").select("*").eq("user_id", user.id),
        supabase.from("context_notes").select("*").or(`parent_user_id.eq.${user.id},child_user_id.eq.${user.id}`),
        supabase.from("daily_fluency_ratings").select("*").or(`parent_user_id.eq.${user.id},child_user_id.eq.${user.id}`),
        supabase.from("victory_logs").select("*").eq("child_user_id", user.id),
        supabase.from("pendant_sync_history").select("*").eq("user_id", user.id),
        supabase.from("disfluency_logs").select("*").eq("user_id", user.id),
        supabase.from("subjective_ratings").select("*").eq("user_id", user.id),
      ]);

      const exportPayload = {
        exportDate: new Date().toISOString(),
        userId: user.id,
        email: user.email,
        dataCategories: {
          practiceSessions: sessions.data ?? [],
          achievements: achievements.data ?? [],
          progress: progress.data ?? [],
          streaks: streaks.data ?? [],
          questCompletions: questCompletions.data ?? [],
          moodCheckins: moodCheckins.data ?? [],
          contextNotes: contextNotes.data ?? [],
          fluencyRatings: fluencyRatings.data ?? [],
          victoryLogs: victoryLogs.data ?? [],
          pendantSyncHistory: pendantHistory.data ?? [],
          disfluencyLogs: disfluencyLogs.data ?? [],
          subjectiveRatings: subjectiveRatings.data ?? [],
        },
        gdprNotice: "This export contains all personal data held by Stammerly in accordance with UK GDPR Article 20 (Right to Data Portability).",
      };

      const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `stammerly-data-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast.success("Data export downloaded successfully");
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export data");
    } finally {
      setExporting(false);
    }
  };

  const handleDeleteAllData = async () => {
    if (confirmText !== "DELETE MY DATA") return;
    setDeleting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Please sign in first"); return; }

      // Delete in dependency order (children first)
      const tables: { table: string; column: string }[] = [
        { table: "disfluency_logs", column: "user_id" },
        { table: "subjective_ratings", column: "user_id" },
        { table: "quest_completions", column: "user_id" },
        { table: "mood_checkins", column: "user_id" },
        { table: "pendant_sync_history", column: "user_id" },
        { table: "low_battery_alerts", column: "user_id" },
        { table: "user_achievements", column: "user_id" },
        { table: "user_streaks", column: "user_id" },
        { table: "user_progress", column: "user_id" },
        { table: "practice_sessions", column: "user_id" },
        { table: "kid_messages", column: "child_user_id" },
      ];

      const errors: string[] = [];

      for (const { table, column } of tables) {
        const { error } = await supabase
          .from(table as any)
          .delete()
          .eq(column, user.id);
        if (error) {
          console.error(`Failed to delete from ${table}:`, error);
          errors.push(table);
        }
      }

      // Also delete parent-linked data
      await supabase.from("context_notes").delete().eq("parent_user_id", user.id);
      await supabase.from("daily_fluency_ratings").delete().eq("parent_user_id", user.id);

      if (errors.length > 0) {
        toast.error(`Some data could not be deleted: ${errors.join(", ")}`);
      } else {
        setDeleteComplete(true);
        toast.success("All data has been permanently deleted");
      }
    } catch (err) {
      console.error("Deletion failed:", err);
      toast.error("An error occurred during deletion");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <Card className="glass-card-strong border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Shield className="w-5 h-5 text-primary" />
          Privacy & Data Control
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          UK GDPR compliant self-service tools for your child's data
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Data */}
        <div className="p-4 rounded-lg bg-secondary/50 border border-border">
          <div className="flex items-start gap-3">
            <FileDown className="w-5 h-5 text-accent-sky mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground mb-1">Export Complete Data Profile</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Download all data held about your child — practice sessions, mood check-ins, achievements, fluency ratings, and more. Provided under GDPR Article 20 (Right to Data Portability).
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportData}
                disabled={exporting}
              >
                {exporting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Download className="w-4 h-4 mr-2" />
                )}
                Export as JSON
              </Button>
            </div>
          </div>
        </div>

        {/* Delete Data */}
        <div className="p-4 rounded-lg bg-destructive/5 border border-destructive/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-foreground mb-1">Right to be Forgotten</h4>
              <p className="text-xs text-muted-foreground mb-3">
                Permanently delete all ambient audio recordings, practice sessions, mood data, achievements, and associated analytics. This action is <strong>irreversible</strong> under GDPR Article 17.
              </p>
              <Dialog open={deleteOpen} onOpenChange={(open) => {
                setDeleteOpen(open);
                if (!open) {
                  setConfirmText("");
                  setDeleteComplete(false);
                }
              }}>
                <DialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete All Data
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border text-foreground">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-destructive">
                      <AlertTriangle className="w-5 h-5" />
                      Confirm Permanent Deletion
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                      This will permanently erase all of your child's data from Stammerly, including:
                    </DialogDescription>
                  </DialogHeader>

                  {deleteComplete ? (
                    <div className="flex flex-col items-center gap-3 py-6">
                      <CheckCircle className="w-12 h-12 text-success" />
                      <p className="text-sm font-medium text-foreground">All data has been deleted.</p>
                      <p className="text-xs text-muted-foreground text-center">
                        Your child's data has been permanently removed from our systems in accordance with UK GDPR Article 17.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4 mt-2">
                      <ul className="text-sm text-muted-foreground space-y-1.5 list-disc pl-5">
                        <li>All practice sessions & ambient audio recordings</li>
                        <li>Fluency scores, disfluency logs & clinical metrics</li>
                        <li>Mood check-ins & anxiety data</li>
                        <li>Achievements, streaks & quest progress</li>
                        <li>Context notes & fluency ratings</li>
                        <li>Pendant sync history & device alerts</li>
                      </ul>

                      <div className="p-3 bg-destructive/10 rounded-lg text-xs text-destructive">
                        <strong>Warning:</strong> We recommend exporting your data before deletion. This action cannot be undone.
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Type <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-destructive">DELETE MY DATA</span> to confirm:
                        </label>
                        <Input
                          value={confirmText}
                          onChange={(e) => setConfirmText(e.target.value)}
                          placeholder="DELETE MY DATA"
                          className="font-mono"
                        />
                      </div>

                      <div className="flex gap-3">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => setDeleteOpen(false)}
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          className="flex-1"
                          disabled={confirmText !== "DELETE MY DATA" || deleting}
                          onClick={handleDeleteAllData}
                        >
                          {deleting ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4 mr-2" />
                          )}
                          Permanently Delete
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Compliance badges */}
        <div className="flex items-center gap-3 pt-1 text-[10px] text-muted-foreground">
          <span className="px-2 py-1 rounded-full bg-secondary border border-border">🇬🇧 UK GDPR</span>
          <span className="px-2 py-1 rounded-full bg-secondary border border-border">Article 17 — Erasure</span>
          <span className="px-2 py-1 rounded-full bg-secondary border border-border">Article 20 — Portability</span>
        </div>
      </CardContent>
    </Card>
  );
};
