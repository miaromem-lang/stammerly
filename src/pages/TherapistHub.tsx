import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, ArrowLeft, BarChart3, Users, Calendar, FileText, TrendingUp, Smartphone, Upload, Plus, Save, X } from "lucide-react";
import { toast } from "sonner";

const patients = [
  { id: 1, name: "Alex M.", age: 8, nextSession: "Today, 2:00 PM", progress: "+15%", risk: "low" },
  { id: 2, name: "Jordan S.", age: 10, nextSession: "Tomorrow, 10:00 AM", progress: "+8%", risk: "medium" },
  { id: 3, name: "Sam T.", age: 7, nextSession: "Wed, 3:30 PM", progress: "+22%", risk: "low" },
];

interface Exercise {
  id: number;
  name: string;
  category: string;
  difficulty: string;
  custom?: boolean;
}

const disfluencyData = [
  { type: "Blocks", count: 5, trend: "↓3", color: "bg-destructive", detail: "Silent pauses" },
  { type: "Interjections", count: 8, trend: "↓2", color: "bg-amber-500", detail: "Um, uh insertions" },
  { type: "Prolongations", count: 7, trend: "↓1", color: "bg-gold", detail: "Extended sounds" },
  { type: "Sound Rep.", count: 4, trend: "↓2", color: "bg-primary", detail: "Initial repeats" },
  { type: "Word Rep.", count: 6, trend: "↓1", color: "bg-accent-sky", detail: "Whole words" },
  { type: "Modified", count: 12, trend: "↑4", color: "bg-success", detail: "Technique use" },
];

const TherapistHub = () => {
  const navigate = useNavigate();
  const [draggedExercise, setDraggedExercise] = useState<number | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [showFullAnalytics, setShowFullAnalytics] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: 1, name: "Easy Onset Quest", category: "Onset", difficulty: "Beginner" },
    { id: 2, name: "Slow Speech Safari", category: "Rate", difficulty: "Intermediate" },
    { id: 3, name: "Breathing Bubbles", category: "Breathing", difficulty: "Beginner" },
    { id: 4, name: "Word Mountain", category: "Complexity", difficulty: "Advanced" },
  ]);
  
  const [newExercise, setNewExercise] = useState({
    name: "",
    category: "",
    difficulty: "",
    targetPhrase: "",
    instructions: "",
    focusArea: "",
  });

  const handleConnectApp = () => {
    toast.success("Clinical app connection initiated - sync all patient recording data");
  };

  const handlePushExercise = (exerciseId: number, patientName: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    toast.success(`${exercise?.name} pushed to ${patientName}'s app`);
  };

  const handleCreateExercise = () => {
    if (!newExercise.name || !newExercise.category || !newExercise.difficulty) {
      toast.error("Please fill in all required fields");
      return;
    }

    const newEx: Exercise = {
      id: exercises.length + 1,
      name: newExercise.name,
      category: newExercise.category,
      difficulty: newExercise.difficulty,
      custom: true,
    };

    setExercises([...exercises, newEx]);
    setNewExercise({ name: "", category: "", difficulty: "", targetPhrase: "", instructions: "", focusArea: "" });
    setIsBuilderOpen(false);
    toast.success(`"${newExercise.name}" exercise created successfully!`);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border">
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
              <div className="w-10 h-10 rounded-xl bg-accent-orange flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Clinical Portal</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Patient List */}
          <div className="space-y-6">
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Users className="w-5 h-5 text-accent-orange" />
                  Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patients.map((patient) => (
                  <div 
                    key={patient.id}
                    className="p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => navigate("/analytics/therapist")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-foreground">{patient.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.risk === "low" ? "bg-success/20 text-success" : "bg-gold/20 text-gold"
                      }`}>
                        {patient.progress}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">Age {patient.age} • {patient.nextSession}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Exercise Library */}
            <Card className="glass-card-strong">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <FileText className="w-5 h-5 text-gold" />
                    Exercise Library
                  </CardTitle>
                  <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-accent-orange" />
                          Build New Exercise
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Exercise Name *</Label>
                          <Input 
                            id="name"
                            placeholder="e.g., Gentle Start Sentences"
                            value={newExercise.name}
                            onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select 
                              value={newExercise.category} 
                              onValueChange={(val) => setNewExercise({ ...newExercise, category: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Onset">Onset</SelectItem>
                                <SelectItem value="Rate">Rate</SelectItem>
                                <SelectItem value="Breathing">Breathing</SelectItem>
                                <SelectItem value="Complexity">Complexity</SelectItem>
                                <SelectItem value="Fluency">Fluency</SelectItem>
                                <SelectItem value="Articulation">Articulation</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Difficulty *</Label>
                            <Select 
                              value={newExercise.difficulty}
                              onValueChange={(val) => setNewExercise({ ...newExercise, difficulty: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="Beginner">Beginner</SelectItem>
                                <SelectItem value="Intermediate">Intermediate</SelectItem>
                                <SelectItem value="Advanced">Advanced</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phrase">Target Phrase/Sentence</Label>
                          <Input 
                            id="phrase"
                            placeholder="e.g., Sally saw the sun shine softly"
                            value={newExercise.targetPhrase}
                            onChange={(e) => setNewExercise({ ...newExercise, targetPhrase: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="focus">Focus Area</Label>
                          <Input 
                            id="focus"
                            placeholder="e.g., /s/ sound onset, word-initial position"
                            value={newExercise.focusArea}
                            onChange={(e) => setNewExercise({ ...newExercise, focusArea: e.target.value })}
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="instructions">Instructions for Child</Label>
                          <Textarea 
                            id="instructions"
                            placeholder="e.g., Say each word slowly, stretching the first sound..."
                            value={newExercise.instructions}
                            onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                            className="min-h-[80px]"
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setIsBuilderOpen(false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={handleCreateExercise}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Create Exercise
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {exercises.map((exercise) => (
                  <div 
                    key={exercise.id}
                    draggable
                    onDragStart={() => setDraggedExercise(exercise.id)}
                    onDragEnd={() => setDraggedExercise(null)}
                    className={`p-3 bg-secondary/50 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                      draggedExercise === exercise.id ? "opacity-50 scale-95" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm text-foreground">{exercise.name}</p>
                      {exercise.custom && (
                        <span className="text-[10px] bg-accent-orange/20 text-accent-orange px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">{exercise.category} • {exercise.difficulty}</p>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-2">Drag exercises to patient cards to assign</p>
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* App Integration */}
            <Card className="glass-card-strong border-accent-orange/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Smartphone className="w-5 h-5 text-accent-orange" />
                  Connect Recording App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sync all patient recordings from the mobile app to generate comprehensive analytics and personalized exercise plans.
                </p>
                <Button onClick={handleConnectApp} className="w-full" variant="navy">
                  <Upload className="w-4 h-4 mr-2" />
                  Connect & Sync All Patient Data
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-success">92%</p>
                  <p className="text-xs text-muted-foreground">AI Confidence</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-accent-orange">156</p>
                  <p className="text-xs text-muted-foreground">SPM Average</p>
                </CardContent>
              </Card>
              <Card className="glass-card">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-gold">+18%</p>
                  <p className="text-xs text-muted-foreground">Avg Progress</p>
                </CardContent>
              </Card>
            </div>

            {/* SPM Comparison Chart */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-accent-orange" />
                  SPM: Home vs Clinic Comparison
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-48 flex items-center justify-center">
                  <div className="text-center">
                    <div className="flex items-end justify-center gap-2 mb-4">
                      {[120, 145, 130, 160, 155, 170, 165].map((val, i) => (
                        <div key={i} className="flex flex-col gap-1">
                          <div 
                            className="w-8 bg-accent-orange/60 rounded-t"
                            style={{ height: `${val / 2}px` }}
                          />
                          <div 
                            className="w-8 bg-gold/60 rounded-b"
                            style={{ height: `${(val - 20) / 2}px` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-accent-orange/60 rounded" />
                        <span>Clinic</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gold/60 rounded" />
                        <span>Home</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  className="w-full mt-4"
                  onClick={() => navigate("/analytics/therapist")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Clinical Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Session Planner */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Calendar className="w-5 h-5 text-accent-orange" />
                  Push Exercises to Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {patients.map((patient) => (
                    <div 
                      key={patient.id}
                      className="p-4 bg-secondary/50 rounded-lg border-2 border-dashed border-border text-center"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedExercise) {
                          handlePushExercise(draggedExercise, patient.name);
                        }
                      }}
                    >
                      <p className="font-medium text-sm mb-1 text-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">Drop exercise here</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="text-foreground text-sm">AI Block Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Confidence</span>
                    <span className="text-success font-bold">92%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-success rounded-full" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AI flags patterns; humans make diagnoses
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Disfluency Summary with View All */}
            <Card className="glass-card-strong">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground text-sm">Disfluency Summary</CardTitle>
                  <Dialog open={showFullAnalytics} onOpenChange={setShowFullAnalytics}>
                    <DialogTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-accent-orange hover:text-accent-orange/80 h-6 px-2 text-xs"
                      >
                        View All →
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-background border-border text-foreground max-w-2xl max-h-[80vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-accent-orange" />
                          Detailed Disfluency Analytics
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-6 mt-4">
                        {/* Full Disfluency Grid */}
                        <div className="grid grid-cols-2 gap-4">
                          {disfluencyData.map((item) => (
                            <div key={item.type} className="p-4 bg-secondary/30 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                                  <span className="font-medium text-foreground">{item.type}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-lg font-bold text-foreground">{item.count}</span>
                                  <span className={`text-sm ${item.trend.startsWith('↑') ? 'text-success' : 'text-success'}`}>{item.trend}</span>
                                </div>
                              </div>
                              <p className="text-sm text-muted-foreground">{item.detail}</p>
                            </div>
                          ))}
                        </div>

                        {/* Time Interval Chart */}
                        <div className="border-t border-border pt-4">
                          <h4 className="text-sm font-medium text-foreground mb-4">Disfluencies Over Time (5-min intervals)</h4>
                          <div className="flex items-end justify-between h-32 gap-2 px-4">
                            {[
                              { time: "0-5", blocks: 3, other: 5 },
                              { time: "5-10", blocks: 2, other: 4 },
                              { time: "10-15", blocks: 1, other: 3 },
                              { time: "15-20", blocks: 2, other: 2 },
                              { time: "20-25", blocks: 1, other: 2 },
                              { time: "25-30", blocks: 0, other: 1 },
                            ].map((interval, i) => (
                              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex flex-col gap-0.5">
                                  <div 
                                    className="w-full bg-destructive/60 rounded-t"
                                    style={{ height: `${interval.blocks * 15}px` }}
                                  />
                                  <div 
                                    className="w-full bg-accent-orange/60 rounded-b"
                                    style={{ height: `${interval.other * 10}px` }}
                                  />
                                </div>
                                <span className="text-xs text-muted-foreground">{interval.time}</span>
                              </div>
                            ))}
                          </div>
                          <div className="flex items-center justify-center gap-6 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-destructive/60 rounded" />
                              <span>Blocks</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-3 h-3 bg-accent-orange/60 rounded" />
                              <span>Other Disfluencies</span>
                            </div>
                          </div>
                        </div>

                        {/* Trend Analysis */}
                        <div className="border-t border-border pt-4">
                          <h4 className="text-sm font-medium text-foreground mb-3">Weekly Trend</h4>
                          <p className="text-sm text-muted-foreground">
                            Overall disfluencies decreased by <span className="text-success font-medium">23%</span> compared to last week. 
                            Modified speech techniques increased by <span className="text-success font-medium">4 instances</span>, 
                            indicating improved technique application.
                          </p>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {disfluencyData.slice(0, 3).map((item) => (
                  <div key={item.type} className="flex items-center justify-between p-2 bg-secondary/30 rounded">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-xs text-foreground">{item.type}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-foreground">{item.count}</span>
                      <span className="text-[10px] text-success">{item.trend}</span>
                    </div>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground text-center pt-1">
                  +3 more categories
                </p>
              </CardContent>
            </Card>

            <Card className="glass-card-strong border-accent-orange/30">
              <CardHeader>
                <CardTitle className="text-foreground text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-orange" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-3">
                  Alex shows consistent improvement in easy onset technique. Word-initial blocks have decreased 40% over 2 weeks.
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  <strong className="text-accent-orange">Recommendation:</strong> Introduce phrase-level exercises focusing on /s/ and /b/ sounds.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/analytics/therapist")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  Detailed Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistHub;
