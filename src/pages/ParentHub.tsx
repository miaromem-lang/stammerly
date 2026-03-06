import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft, MessageSquare, Upload, Bell, Calendar, Send, Smartphone, Loader2, Eye, ChevronRight, Brain, TrendingUp, Snowflake } from "lucide-react";
import { toast } from "sonner";
import { HubNavigation } from "@/components/HubNavigation";
import { TherapistReviewsSummary } from "@/components/TherapistReviewsSummary";
import { PracticeAnalytics } from "@/components/PracticeAnalytics";
import AIInsightsExplainer from "@/components/AIInsightsExplainer";
import { RecommendationTrendCharts } from "@/components/RecommendationTrendCharts";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useVictoryLogs } from "@/hooks/useVictoryLogs";
import { useContextNotes } from "@/hooks/useContextNotes";
import { useFluencyRatings } from "@/hooks/useFluencyRatings";
import PageBackground from "@/components/PageBackground";
import { PendantStatusCard } from "@/components/PendantStatusCard";
import { SyncHistoryLog } from "@/components/SyncHistoryLog";
import { ParentMoodTrends } from "@/components/ParentMoodTrends";
import { PrivacyPortal } from "@/components/PrivacyPortal";
import { NotificationPreferences } from "@/components/NotificationPreferences";
import { AccessRevocation } from "@/components/AccessRevocation";
import { HardwareDiagnostics } from "@/components/HardwareDiagnostics";
import { SubscriptionPortal } from "@/components/SubscriptionPortal";

const ParentHub = () => {
  const navigate = useNavigate();
  const { progress, loading: progressLoading, activateStreakFreeze } = useUserProgress();
  const { victories, formatVictoryTime } = useVictoryLogs();
  const { addNote } = useContextNotes();
  const { saveRating } = useFluencyRatings();
  
  const [comment, setComment] = useState("");
  const [fluencyEntry, setFluencyEntry] = useState("");
  const [savingComment, setSavingComment] = useState(false);
  const [savingEntry, setSavingEntry] = useState(false);

  const handleSubmitComment = async () => {
    if (comment.trim()) {
      setSavingComment(true);
      await addNote(comment);
      setComment("");
      setSavingComment(false);
    }
  };

  const handleSaveFluencyEntry = async () => {
    if (fluencyEntry.trim()) {
      setSavingEntry(true);
      // Save as a context note (fluency observations)
      await addNote(`Fluency observation: ${fluencyEntry}`);
      setFluencyEntry("");
      setSavingEntry(false);
    }
  };

  const handleConnectApp = () => {
    toast.success("App connection initiated - sync your mobile recordings");
  };

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      {/* Top Navigation */}
      <HubNavigation />
      
      {/* Header */}
      <header className="glass-card-strong border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/signin")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Parent Dashboard</span>
            </div>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              {victories.length > 0 && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
              )}
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats - Dynamic */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              {progressLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-success" />
              ) : (
                <p className="text-3xl font-bold text-success">{progress.todayScore || 0}%</p>
              )}
              <p className="text-sm text-muted-foreground">Today's Score</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              {progressLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" />
              ) : (
                <p className="text-3xl font-bold text-primary">{progress.currentStreak}</p>
              )}
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              {progressLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-gold" />
              ) : (
                <p className="text-3xl font-bold text-gold">
                  {progress.weeklyImprovement >= 0 ? '+' : ''}{progress.weeklyImprovement}%
                </p>
              )}
              <p className="text-sm text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              {progressLoading ? (
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-accent-orange" />
              ) : (
                <p className="text-3xl font-bold text-accent-orange">{progress.totalSessions}</p>
              )}
              <p className="text-sm text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* View Child's Hub */}
            <Card className="glass-card-strong border-accent-orange/30 bg-gradient-to-r from-accent-orange/5 to-gold/5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-orange/20 flex items-center justify-center">
                      <Eye className="w-6 h-6 text-accent-orange" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">View Child's Hub</h3>
                      <p className="text-sm text-muted-foreground">See quests, exercises & daily goals</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/hub/kid-overview")}
                    variant="orange"
                    className="gap-2"
                  >
                    Open Kid's View
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Pendant Status */}
            <PendantStatusCard variant="parent" />

            {/* Pendant Setup Link */}
            <Card className="glass-card-strong border-accent-sky/30 bg-gradient-to-r from-accent-sky/5 to-primary/5">
              <CardContent className="p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-accent-sky/20 flex items-center justify-center">
                      <Smartphone className="w-6 h-6 text-accent-sky" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">Pendant Setup & Onboarding</h3>
                      <p className="text-sm text-muted-foreground">Calibrate, pair, and link professionals</p>
                    </div>
                  </div>
                  <Button 
                    onClick={() => navigate("/hub/parent/pendant-setup")}
                    className="gap-2"
                  >
                    Open Setup
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* App Integration */}
            <Card className="glass-card-strong border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Connect Mobile App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sync recordings from the Stammerly mobile app to get personalized exercise recommendations.
                </p>
                <Button onClick={handleConnectApp} className="w-full" variant="navy">
                  <Upload className="w-4 h-4 mr-2" />
                  Connect & Sync Recordings
                </Button>
              </CardContent>
            </Card>

            {/* Practice Analytics from Database */}
            <PracticeAnalytics variant="parent" showRecent={true} limit={10} />

            {/* AI Insights - Same as Therapist View */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="w-5 h-5 text-accent-orange" />
                  AI Observations & Insights
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  The same AI analysis your therapist sees, with full reasoning explained
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <AIInsightsExplainer />
              </CardContent>
            </Card>

            {/* Mood & Fluency Trends */}
            <ParentMoodTrends />

            {/* Recommendation Trend Charts - AI vs Therapist */}
            <RecommendationTrendCharts />

            {/* Sync History */}
            <SyncHistoryLog variant="parent" />
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Therapist Reviews Summary */}
            <TherapistReviewsSummary />

            {/* Fluency Journey */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-gold" />
                  Fluency Journey - Daily Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Record observations about your child's speech today. Include context like tiredness, excitement, or situations.
                </p>
                <Textarea
                  placeholder="Today I noticed... (e.g., 'More fluent during breakfast, some blocks when tired after school')"
                  value={fluencyEntry}
                  onChange={(e) => setFluencyEntry(e.target.value)}
                  className="mb-4"
                  rows={3}
                />
                <Button 
                  onClick={handleSaveFluencyEntry}
                  className="w-full"
                  variant="navy"
                  disabled={savingEntry || !fluencyEntry.trim()}
                >
                  {savingEntry && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  Save Today's Entry
                </Button>
              </CardContent>
            </Card>

            {/* Victory Bell - Dynamic from database */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="w-5 h-5 text-gold" />
                  Victory Bell
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {victories.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No victories logged yet. They'll appear here when teachers share wins!
                  </p>
                ) : (
                  victories.slice(0, 3).map((victory) => (
                    <div key={victory.id} className="p-3 bg-gold/10 rounded-lg border border-gold/20">
                      <p className="text-sm text-foreground font-medium mb-1">
                        🔔 {victory.victory_text}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{victory.reporter_name}</span>
                        <span>{formatVictoryTime(victory.created_at)}</span>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Add Comment */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  Add Context Note
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  placeholder="Share context with the care team... (e.g., 'Had a sleepover, less sleep than usual')"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="mb-4"
                  rows={3}
                />
                <Button 
                  onClick={handleSubmitComment} 
                  className="w-full" 
                  variant="navy"
                  disabled={savingComment || !comment.trim()}
                >
                  {savingComment && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Send className="w-4 h-4 mr-2" />
                  Share with Team
              </Button>
              </CardContent>
            </Card>

            {/* Privacy & Data Control */}
            <PrivacyPortal />

            {/* Notification Preferences */}
            <NotificationPreferences />

            {/* Access Revocation */}
            <AccessRevocation />

            {/* Hardware Diagnostics */}
            <HardwareDiagnostics />

            {/* Subscription & Billing */}
            <SubscriptionPortal />
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentHub;
