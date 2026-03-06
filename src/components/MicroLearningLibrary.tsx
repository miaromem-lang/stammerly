import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Play, Clock, ChevronRight, CheckCircle, ArrowLeft } from "lucide-react";

interface Module {
  id: string;
  title: string;
  description: string;
  duration: string;
  category: "communication" | "environment" | "emotional" | "techniques";
  content: string;
  keyTakeaway: string;
  completed: boolean;
}

const modules: Module[] = [
  {
    id: "latency-pause",
    title: "The Power of the Pause",
    description: "Increase your response latency to reduce speaking pressure on your child.",
    duration: "60s",
    category: "communication",
    content: "When your child speaks, wait 2-3 seconds before responding. This simple technique — called 'increased latency' — signals that there is no rush, reducing the time pressure your child may feel. Research shows that when parents slow their conversational pace, children's fluency improves measurably within weeks. Practice by silently counting to two after your child finishes speaking before you begin your response.",
    keyTakeaway: "Wait 2-3 seconds before replying to your child. It reduces their speaking pressure.",
    completed: false,
  },
  {
    id: "slow-speech-model",
    title: "Slow & Smooth Modelling",
    description: "Model slightly slower speech without asking your child to slow down.",
    duration: "45s",
    category: "communication",
    content: "Instead of telling your child to 'slow down' or 'take a breath', simply model slower speech yourself. Speak at about 75% of your normal pace, using natural pauses between phrases. Children unconsciously mirror the speech patterns they hear. This indirect approach is far more effective than direct instructions, which can increase self-consciousness and anxiety about speaking.",
    keyTakeaway: "Slow your own speech to 75% pace — children mirror what they hear.",
    completed: false,
  },
  {
    id: "reduce-questions",
    title: "Comments Over Questions",
    description: "Replace rapid-fire questions with descriptive comments.",
    duration: "55s",
    category: "communication",
    content: "Questions create speaking pressure — your child must formulate a response on demand. Instead, use descriptive comments: 'I can see you built a tall tower' rather than 'What did you build?' This technique, called 'following the child's lead', reduces demands on speech production while maintaining rich conversation. Aim for a ratio of 3 comments to every 1 question.",
    keyTakeaway: "Use 3 comments for every 1 question to reduce speaking pressure.",
    completed: false,
  },
  {
    id: "special-time",
    title: "5-Minute Special Time",
    description: "Dedicated one-to-one time that promotes fluency through connection.",
    duration: "50s",
    category: "environment",
    content: "Set aside 5 minutes daily of uninterrupted, child-led play time. During Special Time: put your phone away, let the child choose the activity, avoid teaching or correcting, and use slow, relaxed speech. This creates a low-pressure environment where fluency naturally increases. The Lidcombe Programme identifies Special Time as the foundation of effective parent-delivered intervention.",
    keyTakeaway: "5 minutes of daily child-led play creates a low-pressure fluency environment.",
    completed: false,
  },
  {
    id: "sibling-dynamics",
    title: "Managing Sibling Interruptions",
    description: "Create fair turn-taking systems that protect speaking space.",
    duration: "55s",
    category: "environment",
    content: "Siblings often interrupt or finish sentences, which can increase frustration and disfluency. Introduce a visual turn-taking system — a 'talking stick' or special object that signals whose turn it is to speak. At mealtimes, go around the table giving each child a designated sharing time. Praise all children for waiting and listening, not just the child who stammers.",
    keyTakeaway: "Use visual turn-taking tools so every child gets protected speaking time.",
    completed: false,
  },
  {
    id: "praise-fluency",
    title: "Praising Smooth Speech",
    description: "Specific, genuine praise that reinforces fluent moments.",
    duration: "45s",
    category: "techniques",
    content: "When your child speaks fluently, offer specific praise: 'That was really smooth talking!' rather than generic 'Good job.' The Lidcombe Programme recommends a ratio of 5 positive comments about smooth speech for every 1 gentle acknowledgement of bumpy speech. Keep praise natural and varied — 'I loved how smooth that was', 'That sounded so easy', 'Wow, beautiful talking!'",
    keyTakeaway: "Use 5:1 ratio — five praises for smooth speech per one acknowledgement of bumpy speech.",
    completed: false,
  },
  {
    id: "acknowledge-bumpy",
    title: "Gently Acknowledging Bumpy Speech",
    description: "How to respond to disfluent moments without causing distress.",
    duration: "60s",
    category: "techniques",
    content: "During Lidcombe 'structured conversations', you may gently acknowledge a stutter: 'That was a bit bumpy — can you try that again?' Use a warm, matter-of-fact tone. Never do this when your child is upset, tired, or in front of others. If your child self-corrects naturally, praise the correction: 'You fixed that up beautifully!' Always follow the therapist's guidance on when and how often to use acknowledgements.",
    keyTakeaway: "Only acknowledge bumpy speech in structured, calm moments — never when the child is distressed.",
    completed: false,
  },
  {
    id: "emotional-reactions",
    title: "Managing Your Own Reactions",
    description: "How your facial expressions and body language affect your child's confidence.",
    duration: "50s",
    category: "emotional",
    content: "Children are highly attuned to parental reactions. If you look worried, tense, or look away during a stutter, your child receives the message that stammering is something to fear. Practice maintaining relaxed eye contact and a calm expression during disfluent moments. Your body language should communicate: 'I have all the time in the world to listen to you.' This is one of the most powerful things you can do.",
    keyTakeaway: "Maintain calm eye contact during stutters — your reaction shapes their confidence.",
    completed: false,
  },
  {
    id: "tiredness-triggers",
    title: "Understanding Fluency Fluctuations",
    description: "Why stammering varies day to day and what environmental factors matter.",
    duration: "55s",
    category: "emotional",
    content: "Stammering naturally fluctuates. Common triggers for increased disfluency include: tiredness, excitement, illness, competing for speaking turns, complex sentences, and novel situations. Knowing this helps you set realistic expectations and provide appropriate support. On difficult days, reduce speaking demands and increase environmental supports. Use the daily rating scale to track patterns over time.",
    keyTakeaway: "Disfluency fluctuates with tiredness, excitement, and illness — adjust expectations accordingly.",
    completed: false,
  },
];

const categoryColors: Record<string, string> = {
  communication: "bg-primary/10 text-primary border-primary/20",
  environment: "bg-success/10 text-success border-success/20",
  emotional: "bg-accent-orange/10 text-accent-orange border-accent-orange/20",
  techniques: "bg-accent-sky/10 text-accent-sky border-accent-sky/20",
};

const categoryLabels: Record<string, string> = {
  communication: "Communication Style",
  environment: "Home Environment",
  emotional: "Emotional Support",
  techniques: "Lidcombe Techniques",
};

export const MicroLearningLibrary = () => {
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [completedModules, setCompletedModules] = useState<Set<string>>(new Set());
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const filtered = filterCategory
    ? modules.filter((m) => m.category === filterCategory)
    : modules;

  const handleComplete = (id: string) => {
    setCompletedModules((prev) => new Set([...prev, id]));
  };

  if (selectedModule) {
    return (
      <Card className="glass-card-strong">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <Button variant="ghost" size="sm" onClick={() => setSelectedModule(null)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
          <Badge className={categoryColors[selectedModule.category]} variant="outline">
            {categoryLabels[selectedModule.category]}
          </Badge>
          <CardTitle className="text-xl mt-2">{selectedModule.title}</CardTitle>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-3.5 h-3.5" />
            <span>{selectedModule.duration} read</span>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-foreground leading-relaxed">{selectedModule.content}</p>
          <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
            <p className="text-sm font-semibold text-primary mb-1">💡 Key Takeaway</p>
            <p className="text-sm text-foreground">{selectedModule.keyTakeaway}</p>
          </div>
          {!completedModules.has(selectedModule.id) ? (
            <Button
              variant="navy"
              className="w-full"
              onClick={() => {
                handleComplete(selectedModule.id);
              }}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Mark as Read
            </Button>
          ) : (
            <div className="flex items-center justify-center gap-2 text-success py-2">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Completed</span>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-primary" />
          Parent Micro-Learning Library
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Evidence-based 60-second modules to support your child's fluency journey
        </p>
        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
          <CheckCircle className="w-3.5 h-3.5 text-success" />
          <span>{completedModules.size} of {modules.length} completed</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Category filters */}
        <div className="flex flex-wrap gap-2 mb-2">
          <Button
            variant={filterCategory === null ? "navy" : "outline"}
            size="sm"
            onClick={() => setFilterCategory(null)}
          >
            All
          </Button>
          {Object.entries(categoryLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filterCategory === key ? "navy" : "outline"}
              size="sm"
              onClick={() => setFilterCategory(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        {filtered.map((mod) => (
          <button
            key={mod.id}
            onClick={() => setSelectedModule(mod)}
            className="w-full flex items-center gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors text-left group"
          >
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              {completedModules.has(mod.id) ? (
                <CheckCircle className="w-5 h-5 text-success" />
              ) : (
                <Play className="w-5 h-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-foreground truncate">{mod.title}</p>
              <p className="text-xs text-muted-foreground truncate">{mod.description}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-muted-foreground">{mod.duration}</span>
              <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}
      </CardContent>
    </Card>
  );
};
