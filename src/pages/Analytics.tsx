import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, Trophy, TrendingUp, Calendar, Zap } from "lucide-react";

const KidAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-orange/10 via-sky-blue/10 to-gold/10 p-6">
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
  );
};

const ParentAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-6">
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
  );
};

const TeacherAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-background p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-muted-foreground hover:text-foreground">
        <ArrowLeft className="w-5 h-5" /><span>Back</span>
      </button>
      <h1 className="font-display text-3xl font-bold text-foreground mb-6">Student Analytics</h1>
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
    </div>
  );
};

const TherapistAnalytics = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-900 text-white p-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 mb-6 text-slate-400 hover:text-white">
        <ArrowLeft className="w-5 h-5" /><span>Back</span>
      </button>
      <h1 className="font-display text-3xl font-bold mb-6">Clinical Analytics Dashboard</h1>
      <div className="grid md:grid-cols-5 gap-4 mb-6">
        {[{label:"SPM",value:"156"},{label:"%SS",value:"4.2%"},{label:"Blocks",value:"5"},{label:"Repetitions",value:"12"},{label:"Prolongations",value:"8"}].map((s,i)=>(
          <Card key={i} className="bg-slate-800 border-slate-700"><CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-primary">{s.value}</p><p className="text-xs text-slate-400">{s.label}</p>
          </CardContent></Card>
        ))}
      </div>
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white">Disfluency Analysis</CardTitle></CardHeader>
          <CardContent><div className="space-y-3">
            {[{type:"Word Repetitions",pct:48},{type:"Sound Prolongations",pct:32},{type:"Silent Blocks",pct:20}].map((d,i)=>(
              <div key={i}><div className="flex justify-between text-sm mb-1"><span className="text-slate-300">{d.type}</span><span>{d.pct}%</span></div>
                <div className="h-2 bg-slate-700 rounded-full"><div className="h-full bg-primary rounded-full" style={{width:`${d.pct}%`}}/></div>
              </div>
            ))}
          </div></CardContent>
        </Card>
        <Card className="bg-slate-800 border-slate-700"><CardHeader><CardTitle className="text-white">AI Insights</CardTitle></CardHeader>
          <CardContent><ul className="space-y-2 text-slate-300 text-sm">
            <li>• Confidence: 92% on block detection</li><li>• Pattern: Increased blocks on word-initial /s/</li>
            <li>• Recommendation: Focus on easy onset with sibilants</li><li>• Home vs Clinic: 15% better fluency in clinic</li>
          </ul></CardContent>
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
