import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Star, Stethoscope, Loader2, Lightbulb } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface ReviewWithSession {
  id: string;
  therapist_notes: string | null;
  technique_rating: number | null;
  progress_rating: number | null;
  recommendations: string | null;
  reviewed_at: string;
  exercise_name: string;
  session_date: string;
}

export const TherapistReviewsSummary = () => {
  const [reviews, setReviews] = useState<ReviewWithSession[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      // Fetch reviews with session info
      const { data: reviewsData, error: reviewsError } = await supabase
        .from("session_reviews")
        .select("*")
        .order("reviewed_at", { ascending: false })
        .limit(5);

      if (reviewsError) throw reviewsError;

      // Get session details for each review
      const reviewsWithSessions: ReviewWithSession[] = [];
      
      for (const review of reviewsData || []) {
        const { data: sessionData } = await supabase
          .from("practice_sessions")
          .select("exercise_name, session_date")
          .eq("id", review.session_id)
          .maybeSingle();

        if (sessionData) {
          reviewsWithSessions.push({
            ...review,
            exercise_name: sessionData.exercise_name,
            session_date: sessionData.session_date,
          });
        }
      }

      setReviews(reviewsWithSessions);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const truncateText = (text: string | null, maxLength: number = 80) => {
    if (!text) return "";
    return text.length > maxLength ? text.substring(0, maxLength) + "..." : text;
  };

  const StarRating = ({ rating }: { rating: number | null }) => {
    if (!rating) return null;
    return (
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? "fill-gold text-gold" : "text-muted-foreground/30"
            }`}
          />
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <Card className="glass-card-strong">
        <CardContent className="flex items-center justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (reviews.length === 0) {
    return (
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Stethoscope className="w-5 h-5 text-primary" />
            Therapist Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-2">
            No therapist reviews yet. Reviews will appear here after sessions are reviewed.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Stethoscope className="w-5 h-5 text-primary" />
          Therapist Reviews
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className="p-3 bg-primary/5 rounded-lg border-l-4 border-primary"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-sm text-foreground">
                {review.exercise_name}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatDate(review.reviewed_at)}
              </p>
            </div>
            
            {/* Ratings */}
            <div className="flex items-center gap-4 mb-2">
              {review.technique_rating && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Technique:</span>
                  <StarRating rating={review.technique_rating} />
                </div>
              )}
              {review.progress_rating && (
                <div className="flex items-center gap-1">
                  <span className="text-xs text-muted-foreground">Progress:</span>
                  <StarRating rating={review.progress_rating} />
                </div>
              )}
            </div>

            {/* Notes Summary */}
            {review.therapist_notes && (
              <p className="text-sm text-muted-foreground mb-2">
                {truncateText(review.therapist_notes)}
              </p>
            )}

            {/* Recommendations */}
            {review.recommendations && (
              <div className="flex items-start gap-2 p-2 bg-gold/10 rounded-md">
                <Lightbulb className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <p className="text-xs text-foreground">
                  {truncateText(review.recommendations, 100)}
                </p>
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
