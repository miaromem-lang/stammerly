import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ClipboardCheck, Star, MessageSquare, ChevronRight, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PracticeSession {
  id: string;
  exercise_name: string;
  exercise_category: string;
  fluency_score: number | null;
  accuracy_score: number | null;
  session_date: string;
  duration_seconds: number | null;
  blocks_count: number | null;
  repetitions_count: number | null;
  prolongations_count: number | null;
}

interface SessionReview {
  id: string;
  session_id: string;
  therapist_notes: string | null;
  technique_rating: number | null;
  progress_rating: number | null;
  recommendations: string | null;
  reviewed_at: string;
}

export const SessionReviews = () => {
  const [sessions, setSessions] = useState<PracticeSession[]>([]);
  const [reviews, setReviews] = useState<Record<string, SessionReview>>({});
  const [loading, setLoading] = useState(true);
  const [selectedSession, setSelectedSession] = useState<PracticeSession | null>(null);
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [reviewForm, setReviewForm] = useState({
    therapist_notes: "",
    technique_rating: 0,
    progress_rating: 0,
    recommendations: "",
  });

  useEffect(() => {
    fetchSessionsAndReviews();
  }, []);

  const fetchSessionsAndReviews = async () => {
    try {
      // Fetch recent practice sessions
      const { data: sessionsData, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(20);

      if (sessionsError) throw sessionsError;
      setSessions(sessionsData || []);

      // Fetch existing reviews
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("session_reviews")
        .select("*");

      if (reviewsError) throw reviewsError;
      
      // Map reviews by session_id
      const reviewsMap: Record<string, SessionReview> = {};
      (reviewsData || []).forEach((review: SessionReview) => {
        reviewsMap[review.session_id] = review;
      });
      setReviews(reviewsMap);
    } catch (error) {
      console.error("Error fetching sessions:", error);
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  const openReviewDialog = (session: PracticeSession) => {
    setSelectedSession(session);
    const existingReview = reviews[session.id];
    if (existingReview) {
      setReviewForm({
        therapist_notes: existingReview.therapist_notes || "",
        technique_rating: existingReview.technique_rating || 0,
        progress_rating: existingReview.progress_rating || 0,
        recommendations: existingReview.recommendations || "",
      });
    } else {
      setReviewForm({
        therapist_notes: "",
        technique_rating: 0,
        progress_rating: 0,
        recommendations: "",
      });
    }
    setIsReviewOpen(true);
  };

  const handleSaveReview = async () => {
    if (!selectedSession) return;
    
    setSaving(true);
    try {
      const existingReview = reviews[selectedSession.id];
      
      if (existingReview) {
        // Update existing review
        const { error } = await supabase
          .from("session_reviews")
          .update({
            therapist_notes: reviewForm.therapist_notes,
            technique_rating: reviewForm.technique_rating || null,
            progress_rating: reviewForm.progress_rating || null,
            recommendations: reviewForm.recommendations,
            reviewed_at: new Date().toISOString(),
          })
          .eq("id", existingReview.id);

        if (error) throw error;
      } else {
        // Create new review
        const { error } = await supabase
          .from("session_reviews")
          .insert({
            session_id: selectedSession.id,
            therapist_notes: reviewForm.therapist_notes,
            technique_rating: reviewForm.technique_rating || null,
            progress_rating: reviewForm.progress_rating || null,
            recommendations: reviewForm.recommendations,
          });

        if (error) throw error;
      }

      toast.success("Review saved successfully");
      setIsReviewOpen(false);
      fetchSessionsAndReviews();
    } catch (error) {
      console.error("Error saving review:", error);
      toast.error("Failed to save review");
    } finally {
      setSaving(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const RatingStars = ({ 
    value, 
    onChange, 
    label 
  }: { 
    value: number; 
    onChange: (val: number) => void; 
    label: string;
  }) => (
    <div className="space-y-1">
      <label className="text-sm font-medium text-foreground">{label}</label>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
          >
            <Star 
              className={`w-6 h-6 ${
                star <= value 
                  ? "fill-gold text-gold" 
                  : "text-muted-foreground"
              }`} 
            />
          </button>
        ))}
      </div>
    </div>
  );

  if (loading) {
    return (
      <Card className="glass-card-strong">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-accent-orange" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <ClipboardCheck className="w-5 h-5 text-accent-orange" />
            Session Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No practice sessions to review yet.
            </p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {sessions.map((session) => {
                const hasReview = !!reviews[session.id];
                return (
                  <div
                    key={session.id}
                    onClick={() => openReviewDialog(session)}
                    className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors flex items-center justify-between group"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground">
                          {session.exercise_name}
                        </span>
                        {hasReview && (
                          <span className="text-[10px] bg-success/20 text-success px-2 py-0.5 rounded-full">
                            Reviewed
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatDate(session.session_date)}</span>
                        <span>•</span>
                        <span>Fluency: {session.fluency_score ?? 0}%</span>
                        {session.blocks_count !== null && session.blocks_count > 0 && (
                          <>
                            <span>•</span>
                            <span>{session.blocks_count} blocks</span>
                          </>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={isReviewOpen} onOpenChange={setIsReviewOpen}>
        <DialogContent className="bg-card border-border text-foreground max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-accent-orange" />
              Review Session
            </DialogTitle>
          </DialogHeader>

          {selectedSession && (
            <div className="space-y-4 mt-2">
              {/* Session Summary */}
              <div className="p-3 bg-secondary/50 rounded-lg">
                <p className="font-medium text-foreground mb-1">
                  {selectedSession.exercise_name}
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <span>Category: {selectedSession.exercise_category}</span>
                  <span>Duration: {Math.round((selectedSession.duration_seconds || 0) / 60)}min</span>
                  <span>Fluency: {selectedSession.fluency_score ?? 0}%</span>
                  <span>Accuracy: {selectedSession.accuracy_score ?? 0}%</span>
                  <span>Blocks: {selectedSession.blocks_count ?? 0}</span>
                  <span>Repetitions: {selectedSession.repetitions_count ?? 0}</span>
                </div>
              </div>

              {/* Ratings */}
              <div className="grid grid-cols-2 gap-4">
                <RatingStars
                  value={reviewForm.technique_rating}
                  onChange={(val) => setReviewForm({ ...reviewForm, technique_rating: val })}
                  label="Technique Rating"
                />
                <RatingStars
                  value={reviewForm.progress_rating}
                  onChange={(val) => setReviewForm({ ...reviewForm, progress_rating: val })}
                  label="Progress Rating"
                />
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Therapist Notes
                </label>
                <Textarea
                  placeholder="Observations about the session..."
                  value={reviewForm.therapist_notes}
                  onChange={(e) => setReviewForm({ ...reviewForm, therapist_notes: e.target.value })}
                  className="min-h-[80px]"
                />
              </div>

              {/* Recommendations */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Recommendations
                </label>
                <Textarea
                  placeholder="Suggestions for next session or practice focus..."
                  value={reviewForm.recommendations}
                  onChange={(e) => setReviewForm({ ...reviewForm, recommendations: e.target.value })}
                  className="min-h-[60px]"
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsReviewOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveReview}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : null}
                  Save Review
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
