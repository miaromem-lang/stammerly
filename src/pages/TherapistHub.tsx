import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Sparkles, ArrowLeft, BarChart3, Users, Calendar, FileText, TrendingUp, Smartphone, Upload, Play, Plus, Save, X } from "lucide-react";
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

const TherapistHub = () => {
  const navigate = useNavigate();
  const [draggedExercise, setDraggedExercise] = useState<number | null>(null);
  const [isBuilderOpen, setIsBuilderOpen] = useState(false);
  const [exercises, setExercises] = useState<Exercise[]>([
    { id: 1, name: "Easy Onset Quest", category: "Onset", difficulty: "Beginner" },
    { id: 2, name: "Slow Speech Safari", category: "Rate", difficulty: "Intermediate" },
    { id: 3, name: "Breathing Bubbles", category: "Breathing", difficulty: "Beginner" },
    { id: 4, name: "Word Mountain", category: "Complexity", difficulty: "Advanced" },
  ]);
  
  // New exercise form state
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/signin")}
              className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">Clinical Portal</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Left Column - Patient List */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-primary" />
                  Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {patients.map((patient) => (
                  <div 
                    key={patient.id}
                    className="p-3 bg-slate-700/50 rounded-lg cursor-pointer hover:bg-slate-700 transition-colors"
                    onClick={() => navigate("/analytics/therapist")}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium">{patient.name}</span>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        patient.risk === "low" ? "bg-success/20 text-success" : "bg-gold/20 text-gold"
                      }`}>
                        {patient.progress}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Age {patient.age} • {patient.nextSession}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Exercise Library */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-white">
                    <FileText className="w-5 h-5 text-gold" />
                    Exercise Library
                  </CardTitle>
                  <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-slate-400 hover:text-white">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-lg">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-primary" />
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
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Category *</Label>
                            <Select 
                              value={newExercise.category} 
                              onValueChange={(val) => setNewExercise({ ...newExercise, category: val })}
                            >
                              <SelectTrigger className="bg-slate-700 border-slate-600">
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
                              <SelectTrigger className="bg-slate-700 border-slate-600">
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
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="focus">Focus Area</Label>
                          <Input 
                            id="focus"
                            placeholder="e.g., /s/ sound onset, word-initial position"
                            value={newExercise.focusArea}
                            onChange={(e) => setNewExercise({ ...newExercise, focusArea: e.target.value })}
                            className="bg-slate-700 border-slate-600"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="instructions">Instructions for Child</Label>
                          <Textarea 
                            id="instructions"
                            placeholder="e.g., Say each word slowly, stretching the first sound..."
                            value={newExercise.instructions}
                            onChange={(e) => setNewExercise({ ...newExercise, instructions: e.target.value })}
                            className="bg-slate-700 border-slate-600 min-h-[80px]"
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1 border-slate-600"
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
                    className={`p-3 bg-slate-700/50 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                      draggedExercise === exercise.id ? "opacity-50 scale-95" : "hover:bg-slate-700"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm">{exercise.name}</p>
                      {exercise.custom && (
                        <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-400">{exercise.category} • {exercise.difficulty}</p>
                  </div>
                ))}
                <p className="text-xs text-slate-500 mt-2">Drag exercises to patient cards to assign</p>
              </CardContent>
            </Card>
          </div>

          {/* Center - Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* App Integration */}
            <Card className="bg-slate-800/50 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Connect Recording App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-400 mb-4">
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
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-success">92%</p>
                  <p className="text-xs text-slate-400">AI Confidence</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-primary">156</p>
                  <p className="text-xs text-slate-400">SPM Average</p>
                </CardContent>
              </Card>
              <Card className="bg-slate-800/50 border-slate-700">
                <CardContent className="p-4 text-center">
                  <p className="text-3xl font-bold text-gold">+18%</p>
                  <p className="text-xs text-slate-400">Avg Progress</p>
                </CardContent>
              </Card>
            </div>

            {/* SPM Comparison Chart Placeholder */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-5 h-5 text-primary" />
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
                            className="w-8 bg-primary/60 rounded-t"
                            style={{ height: `${val / 2}px` }}
                          />
                          <div 
                            className="w-8 bg-gold/60 rounded-b"
                            style={{ height: `${(val - 20) / 2}px` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center justify-center gap-6 text-xs text-slate-400">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-primary/60 rounded" />
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
                  className="w-full mt-4 border-slate-600 text-white hover:bg-slate-700"
                  onClick={() => navigate("/analytics/therapist")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Clinical Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Session Planner */}
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Calendar className="w-5 h-5 text-accent-orange" />
                  Push Exercises to Patients
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {patients.map((patient) => (
                    <div 
                      key={patient.id}
                      className="p-4 bg-slate-700/50 rounded-lg border-2 border-dashed border-slate-600 text-center"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedExercise) {
                          handlePushExercise(draggedExercise, patient.name);
                        }
                      }}
                    >
                      <p className="font-medium text-sm mb-1">{patient.name}</p>
                      <p className="text-xs text-slate-400">Drop exercise here</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - AI Insights */}
          <div className="space-y-6">
            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">AI Block Detection</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-400">Confidence</span>
                    <span className="text-success font-bold">92%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full w-[92%] bg-success rounded-full" />
                  </div>
                  <p className="text-xs text-slate-500">
                    AI flags patterns; humans make diagnoses
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-sm">Disfluency Analysis</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-primary hover:text-primary/80 h-6 px-2 text-xs"
                    onClick={() => navigate("/analytics/therapist")}
                  >
                    View All →
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { type: "Repetitions", count: 12, trend: "↓2", color: "bg-primary", detail: "Word-initial repetitions decreased" },
                  { type: "Prolongations", count: 8, trend: "↓1", color: "bg-gold", detail: "Sound prolongations improving" },
                  { type: "Blocks", count: 5, trend: "↓3", color: "bg-destructive", detail: "Silent blocks reduced significantly" },
                ].map((item) => (
                  <div key={item.type} className="p-3 bg-slate-700/50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-white">{item.type}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold">{item.count}</span>
                        <span className="text-xs text-success">{item.trend}</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400">{item.detail}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-primary/30">
              <CardHeader>
                <CardTitle className="text-white text-sm flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-300 mb-3">
                  Alex shows consistent improvement in easy onset technique. Word-initial blocks have decreased 40% over 2 weeks.
                </p>
                <p className="text-sm text-slate-300 mb-4">
                  <strong className="text-primary">Recommendation:</strong> Introduce phrase-level exercises focusing on /s/ and /b/ sounds.
                </p>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
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