import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Loader2, Star, Flame, TrendingUp, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalyticsData {
  totalSessions: number;
  totalPracticeTime: number;
  avgFluency: number;
  avgAccuracy: number;
  totalStars: number;
  totalGems: number;
  recentSessions: Array<{
    id: string;
    exercise_name: string;
    fluency_score: number | null;
    session_date: string;
    stars_earned: number | null;
  }>;
}

interface PracticeAnalyticsProps {
  variant?: "kid" | "parent" | "compact";
  showRecent?: boolean;
  limit?: number;
}

export const PracticeAnalytics = ({ 
  variant = "parent", 
  showRecent = true,
  limit = 5 
}: PracticeAnalyticsProps) => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('practice-sessions-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'practice_sessions'
        },
        (payload) => {
          console.log('New practice session:', payload);
          toast.success("New practice session completed! 🎉");
          fetchAnalytics(); // Refresh data when new session is added
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [limit]);

  const fetchAnalytics = async () => {
    try {
      // Fetch recent sessions
      const { data: sessions, error: sessionsError } = await supabase
        .from("practice_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(limit);

      if (sessionsError) throw sessionsError;

      // Fetch aggregated daily analytics
      const { data: analytics, error: analyticsError } = await supabase
        .from("daily_analytics")
        .select("*")
        .order("practice_date", { ascending: false })
        .limit(7);

      if (analyticsError) {
        console.warn("Could not fetch daily analytics:", analyticsError);
      }

      // Calculate totals from recent sessions if no analytics view data
      const totalSessions = sessions?.length || 0;
      const totalPracticeTime = sessions?.reduce((acc, s) => acc + (s.duration_seconds || 0), 0) || 0;
      const avgFluency = sessions?.length 
        ? Math.round(sessions.reduce((acc, s) => acc + (s.fluency_score || 0), 0) / sessions.length)
        : 0;
      const avgAccuracy = sessions?.length
        ? Math.round(sessions.reduce((acc, s) => acc + (s.accuracy_score || 0), 0) / sessions.length)
        : 0;
      const totalStars = sessions?.reduce((acc, s) => acc + (s.stars_earned || 0), 0) || 0;
      const totalGems = sessions?.reduce((acc, s) => acc + (s.gems_earned || 0), 0) || 0;

      setData({
        totalSessions,
        totalPracticeTime,
        avgFluency,
        avgAccuracy,
        totalStars,
        totalGems,
        recentSessions: sessions || [],
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    return `${hours}h ${mins % 60}m`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  if (loading) {
    return (
      <Card className="glass-card-strong">
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.totalSessions === 0) {
    return (
      <Card className="glass-card-strong">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <BarChart3 className="w-5 h-5 text-primary" />
            Practice Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-4">
            No practice sessions yet. Start practicing to see your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  if (variant === "kid") {
    return (
      <Card className="rounded-kids bg-gradient-to-br from-primary/10 to-accent-orange/10 border-2 border-primary/20">
        <CardContent className="p-6">
          <h3 className="font-display text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            My Progress 🚀
          </h3>
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-card/80 rounded-kids p-4 text-center">
              <div className="flex justify-center gap-1 mb-1">
                {Array.from({ length: Math.min(data.totalStars, 5) }).map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-gold fill-gold" />
                ))}
              </div>
              <p className="text-2xl font-bold text-gold">{data.totalStars}</p>
              <p className="text-xs text-muted-foreground">Stars Earned</p>
            </div>
            <div className="bg-card/80 rounded-kids p-4 text-center">
              <p className="text-3xl">💎</p>
              <p className="text-2xl font-bold text-primary">{data.totalGems}</p>
              <p className="text-xs text-muted-foreground">Gems Collected</p>
            </div>
          </div>

          <div className="bg-success/20 rounded-kids p-3 text-center">
            <p className="text-lg font-bold text-success">{data.avgFluency}%</p>
            <p className="text-xs text-muted-foreground">Average Fluency Score</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <BarChart3 className="w-5 h-5 text-primary" />
          Practice Analytics
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-success">{data.avgFluency}%</p>
            <p className="text-xs text-muted-foreground">Avg Fluency</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-primary">{data.totalSessions}</p>
            <p className="text-xs text-muted-foreground">Sessions</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-gold">{data.totalStars}</p>
            <p className="text-xs text-muted-foreground">Stars</p>
          </div>
          <div className="text-center p-3 bg-secondary/50 rounded-lg">
            <p className="text-2xl font-bold text-accent-orange">{formatTime(data.totalPracticeTime)}</p>
            <p className="text-xs text-muted-foreground">Practice Time</p>
          </div>
        </div>

        {/* Recent Sessions */}
        {showRecent && data.recentSessions.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Clock className="w-4 h-4 text-muted-foreground" />
              Recent Sessions
            </h4>
            {data.recentSessions.slice(0, 3).map((session) => (
              <div 
                key={session.id}
                className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-foreground">{session.exercise_name}</p>
                  <p className="text-xs text-muted-foreground">{formatDate(session.session_date)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-success">{session.fluency_score ?? 0}%</span>
                  <div className="flex">
                    {Array.from({ length: session.stars_earned || 1 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 text-gold fill-gold" />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
