import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, BarChart3, Users, Calendar, FileText, TrendingUp, Smartphone, Upload, Play } from "lucide-react";
import { toast } from "sonner";

const patients = [
  { id: 1, name: "Alex M.", age: 8, nextSession: "Today, 2:00 PM", progress: "+15%", risk: "low" },
  { id: 2, name: "Jordan S.", age: 10, nextSession: "Tomorrow, 10:00 AM", progress: "+8%", risk: "medium" },
  { id: 3, name: "Sam T.", age: 7, nextSession: "Wed, 3:30 PM", progress: "+22%", risk: "low" },
];

const exercises = [
  { id: 1, name: "Easy Onset Quest", category: "Onset", difficulty: "Beginner" },
  { id: 2, name: "Slow Speech Safari", category: "Rate", difficulty: "Intermediate" },
  { id: 3, name: "Breathing Bubbles", category: "Breathing", difficulty: "Beginner" },
  { id: 4, name: "Word Mountain", category: "Complexity", difficulty: "Advanced" },
];

const TherapistHub = () => {
  const navigate = useNavigate();
  const [draggedExercise, setDraggedExercise] = useState<number | null>(null);

  const handleConnectApp = () => {
    toast.success("Clinical app connection initiated - sync all patient recording data");
  };

  const handlePushExercise = (exerciseId: number, patientName: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    toast.success(`${exercise?.name} pushed to ${patientName}'s app`);
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
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-gold" />
                  Exercise Library
                </CardTitle>
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
                    <p className="font-medium text-sm">{exercise.name}</p>
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
                <CardTitle className="text-white text-sm">Recent Disfluency Types</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { type: "Repetitions", count: 12, color: "bg-primary" },
                  { type: "Prolongations", count: 8, color: "bg-gold" },
                  { type: "Blocks", count: 5, color: "bg-destructive" },
                ].map((item) => (
                  <div key={item.type} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${item.color}`} />
                      <span className="text-sm text-slate-300">{item.type}</span>
                    </div>
                    <span className="text-sm font-bold">{item.count}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white text-sm">Baseline Overlay</CardTitle>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="outline" 
                  className="w-full border-slate-600 text-white hover:bg-slate-700"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Compare to Baseline
                </Button>
                <p className="text-xs text-slate-500 mt-2">
                  Toggle to overlay current waveform against baseline
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TherapistHub;
