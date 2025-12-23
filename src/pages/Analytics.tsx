import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Star, Trophy, TrendingUp, Calendar, Zap, Users, BarChart3, Activity, Brain, Target, Clock, Mic, FileText } from "lucide-react";
import { HubNavigation } from "@/components/HubNavigation";

const students = [
  { id: "alex", name: "Alex M.", age: 8, sessions: 23, progress: "+15%" },
  { id: "jordan", name: "Jordan S.", age: 10, sessions: 18, progress: "+8%" },
  { id: "sam", name: "Sam T.", age: 7, sessions: 31, progress: "+22%" },
];

const KidAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-white p-6">
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
    <div className="min-h-screen bg-white p-6">
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
    <div className="min-h-screen bg-white p-6">
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

const TherapistAnalytics = () => {
  const navigate = useNavigate();
  const [selectedPatient, setSelectedPatient] = useState<string>("");
  
  const patientData = {
    alex: { spm: 156, ss: 4.2, blocks: 5, reps: 12, prolongs: 8, confidence: 92 },
    jordan: { spm: 142, ss: 6.8, blocks: 8, reps: 18, prolongs: 11, confidence: 88 },
    sam: { spm: 168, ss: 2.9, blocks: 3, reps: 7, prolongs: 5, confidence: 95 },
  };
  
  const currentData = selectedPatient && selectedPatient !== "all" 
    ? patientData[selectedPatient as keyof typeof patientData] 
    : { spm: 156, ss: 4.2, blocks: 5, reps: 12, prolongs: 8, confidence: 92 };

  return (
    <div className="min-h-screen bg-white">
      <HubNavigation />
      <div className="container mx-auto px-4 py-6">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-5 h-5" /><span>Back</span>
        </button>
        
        <div className="flex items-center justify-between mb-6">
          <h1 className="font-display text-3xl font-bold text-foreground">Clinical Analytics Dashboard</h1>
          <Select value={selectedPatient} onValueChange={setSelectedPatient}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Select Patient" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Patients Overview</SelectItem>
              {students.map((s) => (
                <SelectItem key={s.id} value={s.id}>{s.name} (Age {s.age})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-6">
          {[
            {label:"SPM",value:currentData.spm,desc:"Syllables/min",icon:Mic},
            {label:"%SS",value:`${currentData.ss}%`,desc:"% Syllables Stuttered",icon:Activity},
            {label:"Blocks",value:currentData.blocks,desc:"Silent pauses",icon:Target},
            {label:"Repetitions",value:currentData.reps,desc:"Word/sound reps",icon:BarChart3},
            {label:"Prolongations",value:currentData.prolongs,desc:"Extended sounds",icon:Clock},
            {label:"AI Confidence",value:`${currentData.confidence}%`,desc:"Detection accuracy",icon:Brain}
          ].map((s,i)=>(
            <Card key={i} className="glass-card border border-border"><CardContent className="p-4 text-center">
              <s.icon className="w-5 h-5 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-[10px] text-muted-foreground/70">{s.desc}</p>
            </CardContent></Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* Disfluency Breakdown */}
          <Card className="glass-card-strong"><CardHeader><CardTitle className="text-foreground flex items-center gap-2"><BarChart3 className="w-5 h-5" />Disfluency Analysis</CardTitle></CardHeader>
            <CardContent><div className="space-y-4">
              {[
                {type:"Word Repetitions",pct:48,color:"bg-primary",trend:"↓5% from last week"},
                {type:"Sound Prolongations",pct:32,color:"bg-accent-orange",trend:"↓3% from last week"},
                {type:"Silent Blocks",pct:20,color:"bg-gold",trend:"↓8% from last week"}
              ].map((d,i)=>(
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground font-medium">{d.type}</span>
                    <span className="text-muted-foreground">{d.pct}%</span>
                  </div>
                  <div className="h-3 bg-secondary rounded-full overflow-hidden">
                    <div className={`h-full ${d.color} rounded-full transition-all`} style={{width:`${d.pct}%`}}/>
                  </div>
                  <p className="text-xs text-success mt-1">{d.trend}</p>
                </div>
              ))}
            </div></CardContent>
          </Card>
          
          {/* AI Insights */}
          <Card className="glass-card-strong"><CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Brain className="w-5 h-5" />AI Insights</CardTitle></CardHeader>
            <CardContent><ul className="space-y-3 text-muted-foreground text-sm">
              <li className="flex items-start gap-2"><span className="text-primary">•</span>Pattern detected: Increased blocks on word-initial /s/ and /f/ sounds</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span>Recommendation: Focus on easy onset technique with sibilants</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span>Home vs Clinic: 15% better fluency observed in clinical settings</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span>Best performance time: Morning sessions (9-11am)</li>
              <li className="flex items-start gap-2"><span className="text-primary">•</span>Technique adoption: Easy onset used in 67% of prompted situations</li>
            </ul></CardContent>
          </Card>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* Session History */}
          <Card className="glass-card-strong"><CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Calendar className="w-5 h-5" />Recent Sessions</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {[
                {date:"Today",score:87,type:"Easy Onset Practice"},
                {date:"Yesterday",score:82,type:"Reading Aloud"},
                {date:"2 days ago",score:79,type:"Free Conversation"},
                {date:"3 days ago",score:85,type:"Breathing Exercises"}
              ].map((s,i)=>(
                <div key={i} className="flex items-center justify-between p-2 bg-secondary/30 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-foreground">{s.type}</p>
                    <p className="text-xs text-muted-foreground">{s.date}</p>
                  </div>
                  <span className={`text-sm font-bold ${s.score >= 85 ? 'text-success' : s.score >= 75 ? 'text-gold' : 'text-muted-foreground'}`}>{s.score}%</span>
                </div>
              ))}
            </div></CardContent>
          </Card>

          {/* Technique Usage */}
          <Card className="glass-card-strong"><CardHeader><CardTitle className="text-foreground flex items-center gap-2"><Target className="w-5 h-5" />Technique Adoption</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">
              {[
                {tech:"Easy Onset",usage:67,trend:"+12%"},
                {tech:"Light Contact",usage:54,trend:"+8%"},
                {tech:"Pacing/Pausing",usage:45,trend:"+5%"},
                {tech:"Belly Breathing",usage:78,trend:"+15%"}
              ].map((t,i)=>(
                <div key={i}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-foreground">{t.tech}</span>
                    <span className="text-success text-xs">{t.trend}</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{width:`${t.usage}%`}}/>
                  </div>
                </div>
              ))}
            </div></CardContent>
          </Card>

          {/* Clinical Notes */}
          <Card className="glass-card-strong"><CardHeader><CardTitle className="text-foreground flex items-center gap-2"><FileText className="w-5 h-5" />Clinical Notes</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="p-3 bg-primary/10 rounded-lg border-l-4 border-primary">
                  <p className="font-medium text-foreground">IEP Goal Progress</p>
                  <p className="text-muted-foreground text-xs mt-1">8/10 goals on track for quarterly review</p>
                </div>
                <div className="p-3 bg-gold/10 rounded-lg border-l-4 border-gold">
                  <p className="font-medium text-foreground">Parent Feedback</p>
                  <p className="text-muted-foreground text-xs mt-1">More confident in classroom speaking activities</p>
                </div>
                <div className="p-3 bg-success/10 rounded-lg border-l-4 border-success">
                  <p className="font-medium text-foreground">Next Focus</p>
                  <p className="text-muted-foreground text-xs mt-1">Word-initial sibilants, conversation practice</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Chart Placeholder */}
        <Card className="glass-card-strong"><CardHeader><CardTitle className="text-foreground flex items-center gap-2"><TrendingUp className="w-5 h-5" />Fluency Trend (4 Weeks)</CardTitle></CardHeader>
          <CardContent>
            <div className="h-32 flex items-end justify-between gap-2 px-4">
              {[65, 68, 72, 70, 75, 78, 82, 79, 85, 83, 87, 85, 88, 87].map((val, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <div 
                    className="w-full bg-gradient-to-t from-primary to-primary/60 rounded-t transition-all"
                    style={{ height: `${val}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground mt-2 px-4">
              <span>Week 1</span><span>Week 2</span><span>Week 3</span><span>Week 4</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
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
