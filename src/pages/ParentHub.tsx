import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, ArrowLeft, BarChart3, MessageSquare, Upload, Bell, TrendingUp, Calendar, Send, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { HubNavigation } from "@/components/HubNavigation";

const recentActivities = [
  { date: "Today", activity: "Easy Onset Quest", score: 87, improvement: "+5%" },
  { date: "Yesterday", activity: "Slow Speech Safari", score: 82, improvement: "+3%" },
  { date: "2 days ago", activity: "Breathing Bubbles", score: 79, improvement: "+7%" },
];

const teacherNotes = [
  { from: "Mrs. Thompson", date: "Today", message: "Great participation in reading group! Used easy onset technique well." },
  { from: "Mr. Davies", date: "Yesterday", message: "Presented to class with minimal blocks. Very confident!" },
];

const ParentHub = () => {
  const navigate = useNavigate();
  const [comment, setComment] = useState("");
  const [fluencyEntry, setFluencyEntry] = useState("");

  const handleSubmitComment = () => {
    if (comment.trim()) {
      toast.success("Comment added to fluency journal");
      setComment("");
    }
  };

  const handleConnectApp = () => {
    toast.success("App connection initiated - sync your mobile recordings");
  };

  return (
    <div className="min-h-screen bg-white">
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
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-destructive rounded-full" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-success">87%</p>
              <p className="text-sm text-muted-foreground">Today's Score</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-primary">5</p>
              <p className="text-sm text-muted-foreground">Day Streak</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-gold">+12%</p>
              <p className="text-sm text-muted-foreground">This Week</p>
            </CardContent>
          </Card>
          <Card className="glass-card">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-accent-orange">23</p>
              <p className="text-sm text-muted-foreground">Sessions</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
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

            {/* Recent Activities */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-primary" />
                  Recent Practice Sessions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {recentActivities.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <div>
                      <p className="font-medium text-foreground">{activity.activity}</p>
                      <p className="text-sm text-muted-foreground">{activity.date}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-foreground">{activity.score}%</p>
                      <p className="text-sm text-success">{activity.improvement}</p>
                    </div>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => navigate("/analytics/parent")}
                  >
                    View Analytics
                    <TrendingUp className="w-4 h-4 ml-2" />
                  </Button>
                  <Button 
                    variant="navy" 
                    className="flex-1"
                    onClick={() => navigate("/hub/kid-overview")}
                  >
                    Kid Hub Guide
                  </Button>
                </div>
              </CardContent>
            </Card>

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
                  onClick={() => {
                    if (fluencyEntry.trim()) {
                      toast.success("Journal entry saved");
                      setFluencyEntry("");
                    }
                  }}
                  className="w-full"
                  variant="navy"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Save Today's Entry
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Teacher Notes */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent-orange" />
                  Notes from School
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {teacherNotes.map((note, index) => (
                  <div key={index} className="p-3 bg-accent-orange/10 rounded-lg border-l-4 border-accent-orange">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-medium text-foreground">{note.from}</p>
                      <p className="text-xs text-muted-foreground">{note.date}</p>
                    </div>
                    <p className="text-sm text-muted-foreground">{note.message}</p>
                  </div>
                ))}
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
                <Button onClick={handleSubmitComment} className="w-full" variant="navy">
                  <Send className="w-4 h-4 mr-2" />
                  Share with Team
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ParentHub;
