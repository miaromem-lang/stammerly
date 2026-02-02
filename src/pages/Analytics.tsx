import { useState } from "react";
import { useNavigate, useParams, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, Trophy, TrendingUp, Calendar, Zap, Users, BarChart3, Activity, Brain, Target, Clock, Mic, FileText } from "lucide-react";
import { HubNavigation } from "@/components/HubNavigation";
import PageBackground from "@/components/PageBackground";

const students = [
  { id: "alex", name: "Alex M.", age: 8, sessions: 23, progress: "+15%" },
  { id: "jordan", name: "Jordan S.", age: 10, sessions: 18, progress: "+8%" },
  { id: "sam", name: "Sam T.", age: 7, sessions: 31, progress: "+22%" },
];

const KidAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative p-6">
      <PageBackground />
      <HubNavigation />
      <div className="container mx-auto pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-foreground/70 hover:text-foreground">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
        <h1 className="font-display text-3xl font-bold text-foreground mb-6 flex items-center gap-2">
          <Trophy className="w-8 h-8 text-gold" /> My Stars & Badges!
        </h1>
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card className="rounded-kids bg-gold/20"><CardContent className="p-6 text-center">
            <p className="text-5xl font-bold text-gold">127</p><p className="text-foreground">Total Stars ⭐</p>
          </CardContent></Card>
          <Card className="rounded-kids bg-success/20"><CardContent className="p-6 text-center">
            <p className="text-5xl font-bold text-success">5</p><p className="text-foreground">Day Streak 🔥</p>
          </CardContent></Card>
          <Card className="rounded-kids bg-accent-orange/20"><CardContent className="p-6 text-center">
            <p className="text-5xl font-bold text-accent-orange">12</p><p className="text-foreground">Badges 🏅</p>
          </CardContent></Card>
        </div>
        <Card className="rounded-kids"><CardHeader><CardTitle>Coach Says:</CardTitle></CardHeader>
          <CardContent><p className="text-lg text-foreground">"You're doing amazing! Keep practicing your easy onset - you're getting better every day!" 🦦</p></CardContent>
        </Card>
      </div>
    </div>
  );
};

const ParentAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen relative p-6">
      <PageBackground />
      <HubNavigation />
      <div className="container mx-auto pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
        <h1 className="font-display text-3xl font-bold text-foreground mb-6">Weekly Progress Report</h1>
        <div className="grid md:grid-cols-4 gap-4 mb-6">
          {[{label:"Fluency Score",value:"87%",color:"text-success"},{label:"Sessions",value:"23",color:"text-primary"},{label:"Weekly Change",value:"+12%",color:"text-gold"},{label:"Disfluencies",value:"↓15%",color:"text-success"}].map((s,i)=>(
            <Card key={i} className="glass-card"><CardContent className="p-4 text-center">
              <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p>
            </CardContent></Card>
          ))}
        </div>
        <Card className="glass-card-strong mb-6"><CardHeader><CardTitle>Observations</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-muted-foreground">
            <li>• More fluent during morning sessions</li><li>• Easy onset technique improving (+15%)</li>
            <li>• Best performance on "Breathing Bubbles" activity</li><li>• Recommend continuing 10-minute daily practice</li>
          </ul></CardContent>
        </Card>
      </div>
    </div>
  );
};

const TeacherAnalytics = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  
  return (
    <div className="min-h-screen relative p-6">
      <PageBackground />
      <HubNavigation />
      <div className="container mx-auto pt-4">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Student Analytics</h1>
          <Select value={selectedStudent} onValueChange={setSelectedStudent}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Student" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Students</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedStudent && selectedStudent !== "all" ? (
          <div className="space-y-6">
            <div className="grid md:grid-cols-4 gap-4">
              {[{label:"Fluency Score",value:"82%",icon:Activity},{label:"Sessions",value:students.find(s=>s.id===selectedStudent)?.sessions || 0,icon:Clock},{label:"Progress",value:students.find(s=>s.id===selectedStudent)?.progress || "+0%",icon:TrendingUp},{label:"Streak",value:"5 days",icon:Zap}].map((s,i)=>(
                <Card key={i} className="glass-card"><CardContent className="p-4 text-center">
                  <s.icon className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-2xl font-bold text-foreground">{s.value}</p>
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                </CardContent></Card>
              ))}
            </div>
            <Card className="glass-card-strong"><CardHeader><CardTitle>Individual Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2 text-muted-foreground">
                <li>• Provide 5 seconds wait time before responses</li>
                <li>• Responds well to visual cues and written prompts</li>
                <li>• Benefits from smaller group settings for oral activities</li>
                <li>• Morning reading sessions show best fluency</li>
              </ul></CardContent>
            </Card>
          </div>
        ) : (
          <>
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              {[{label:"Class Average",value:"82%"},{label:"Active Students",value:"3"},{label:"IEP Goals Met",value:"8/10"}].map((s,i)=>(
                <Card key={i} className="glass-card"><CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">{s.value}</p><p className="text-sm text-muted-foreground">{s.label}</p>
                </CardContent></Card>
              ))}
            </div>
            <Card className="glass-card-strong"><CardHeader><CardTitle>Classroom Recommendations</CardTitle></CardHeader>
              <CardContent><ul className="space-y-2 text-muted-foreground">
                <li>• Provide 5 seconds wait time before responses</li><li>• Alex M. responds well to visual cues</li>
                <li>• Jordan S. benefits from smaller group settings</li><li>• Consider morning reading sessions for best fluency</li>
              </ul></CardContent>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

// TherapistAnalytics redirects to the consolidated TherapistAnalyticsHub
const TherapistAnalytics = () => {
  return <Navigate to="/therapist-analytics" replace />;
};

const Analytics = () => {
  const { role } = useParams();
  if (role === "kid") return <KidAnalytics />;
  if (role === "parent") return <ParentAnalytics />;
  if (role === "teacher") return <TeacherAnalytics />;
  if (role === "therapist") return <TherapistAnalytics />;
  return <ParentAnalytics />;
};

export default Analytics;
