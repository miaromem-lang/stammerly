import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Sparkles, ArrowLeft, BarChart3, Users, Calendar, FileText, Smartphone, Upload, Plus, Save, X, CalendarIcon, Star } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { HubNavigation } from "@/components/HubNavigation";
import { SessionReviews } from "@/components/SessionReviews";
import PageBackground from "@/components/PageBackground";
import { QuestAssigner } from "@/components/QuestAssigner";
import { RecommendationTrendCharts } from "@/components/RecommendationTrendCharts";
import { AILearningHistory } from "@/components/AILearningHistory";
import { MonthlyReport } from "@/components/MonthlyReport";
import { WeeklyPsychosocialSummary } from "@/components/therapist/WeeklyPsychosocialSummary";
import { supabase } from "@/integrations/supabase/client";

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
  const [isF2FDialogOpen, setIsF2FDialogOpen] = useState(false);
  const [f2fSessionDate, setF2fSessionDate] = useState<Date | undefined>(new Date());
  const [f2fSession, setF2fSession] = useState({
    patient: "",
    sessionType: "",
    duration: "",
    techniqueRating: 0,
    progressRating: 0,
    notes: "",
    observations: "",
    recommendations: "",
    goals: "",
  });
  
  // Load exercises from localStorage (therapist-created exercises are shared with KidHub)
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('stammerly_therapist_exercises');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [
          { id: 1, name: "Easy Onset Quest", category: "Onset", difficulty: "Beginner" },
          { id: 2, name: "Slow Speech Safari", category: "Rate", difficulty: "Intermediate" },
          { id: 3, name: "Breathing Bubbles", category: "Breathing", difficulty: "Beginner" },
          { id: 4, name: "Word Mountain", category: "Complexity", difficulty: "Advanced" },
        ];
      }
    }
    return [
      { id: 1, name: "Easy Onset Quest", category: "Onset", difficulty: "Beginner" },
      { id: 2, name: "Slow Speech Safari", category: "Rate", difficulty: "Intermediate" },
      { id: 3, name: "Breathing Bubbles", category: "Breathing", difficulty: "Beginner" },
      { id: 4, name: "Word Mountain", category: "Complexity", difficulty: "Advanced" },
    ];
  });
  
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
      id: Date.now(), // Use timestamp for unique ID
      name: newExercise.name,
      category: newExercise.category,
      difficulty: newExercise.difficulty,
      custom: true,
    };

    const updatedExercises = [...exercises, newEx];
    setExercises(updatedExercises);
    
    // Save to localStorage so KidHub can access it
    localStorage.setItem('stammerly_therapist_exercises', JSON.stringify(updatedExercises));
    
    setNewExercise({ name: "", category: "", difficulty: "", targetPhrase: "", instructions: "", focusArea: "" });
    setIsBuilderOpen(false);
    toast.success(`"${newExercise.name}" exercise created and pushed to Kid Hub!`);
  };

  const handleSaveF2FSession = async () => {
    if (!f2fSession.patient || !f2fSession.sessionType || !f2fSessionDate) {
      toast.error("Please fill in patient, session type, and date");
      return;
    }

    try {
      // Create a practice session entry for the face-to-face session
      const { data: sessionData, error: sessionError } = await supabase
        .from('practice_sessions')
        .insert({
          exercise_name: `Face-to-Face: ${f2fSession.sessionType}`,
          exercise_category: 'In-Person',
          exercise_difficulty: 'N/A',
          session_date: format(f2fSessionDate, 'yyyy-MM-dd'),
          duration_seconds: parseInt(f2fSession.duration) * 60 || 30 * 60,
          fluency_score: f2fSession.progressRating * 20,
          accuracy_score: f2fSession.techniqueRating * 20,
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Create a session review for the face-to-face session
      const { error: reviewError } = await supabase
        .from('session_reviews')
        .insert({
          session_id: sessionData.id,
          technique_rating: f2fSession.techniqueRating,
          progress_rating: f2fSession.progressRating,
          therapist_notes: f2fSession.notes,
          recommendations: f2fSession.recommendations,
        });

      if (reviewError) throw reviewError;

      toast.success("Face-to-face session review saved!");
      setIsF2FDialogOpen(false);
      setF2fSession({
        patient: "",
        sessionType: "",
        duration: "",
        techniqueRating: 0,
        progressRating: 0,
        notes: "",
        observations: "",
        recommendations: "",
        goals: "",
      });
      setF2fSessionDate(new Date());
    } catch (error) {
      console.error('Error saving F2F session:', error);
      toast.error("Failed to save session review");
    }
  };

  const RatingStars = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          className="focus:outline-none"
        >
          <Star
            className={cn(
              "w-5 h-5 transition-colors",
              star <= value ? "fill-gold text-gold" : "text-muted-foreground"
            )}
          />
        </button>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      {/* Top Navigation */}
      <HubNavigation />
      
      {/* Header */}
      <header className="bg-white border-b border-border">
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
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Patient List & Quick Actions */}
          <div className="space-y-4">
            <Card className="glass-card-strong">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Users className="w-4 h-4 text-accent-orange" />
                  Patients
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {patients.map((patient) => (
                  <div 
                    key={patient.id}
                    className="p-2.5 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => navigate("/therapist-analytics")}
                  >
                    <div className="flex items-center justify-between mb-0.5">
                      <span className="font-medium text-sm text-foreground">{patient.name}</span>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${
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
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground text-base">
                    <FileText className="w-4 h-4 text-gold" />
                    Exercise Library
                  </CardTitle>
                  <Dialog open={isBuilderOpen} onOpenChange={setIsBuilderOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
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
              <CardContent className="space-y-1.5">
                {exercises.slice(0, 4).map((exercise) => (
                  <div 
                    key={exercise.id}
                    draggable
                    onDragStart={() => setDraggedExercise(exercise.id)}
                    onDragEnd={() => setDraggedExercise(null)}
                    className={`p-2 bg-secondary/50 rounded-lg cursor-grab active:cursor-grabbing transition-all ${
                      draggedExercise === exercise.id ? "opacity-50 scale-95" : "hover:bg-secondary"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-xs text-foreground">{exercise.name}</p>
                      {exercise.custom && (
                        <span className="text-[9px] bg-accent-orange/20 text-accent-orange px-1.5 py-0.5 rounded-full">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground">{exercise.category} • {exercise.difficulty}</p>
                  </div>
                ))}
                <p className="text-[10px] text-muted-foreground pt-1">Drag to patient cards to assign</p>
              </CardContent>
            </Card>

            {/* Push Exercises to Patients */}
            <Card className="glass-card-strong">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-foreground text-base">
                  <Calendar className="w-4 h-4 text-accent-orange" />
                  Push Exercises
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {patients.map((patient) => (
                    <div 
                      key={patient.id}
                      className="p-3 bg-secondary/50 rounded-lg border-2 border-dashed border-border text-center"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => {
                        if (draggedExercise) {
                          handlePushExercise(draggedExercise, patient.name);
                        }
                      }}
                    >
                      <p className="font-medium text-sm text-foreground">{patient.name}</p>
                      <p className="text-xs text-muted-foreground">Drop exercise here</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quest Assigner */}
            <QuestAssigner />


            {/* Session Reviews with Add Button */}
            <Card className="glass-card-strong">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground text-base">
                    <FileText className="w-4 h-4 text-gold" />
                    Session Reviews
                  </CardTitle>
                  <Dialog open={isF2FDialogOpen} onOpenChange={setIsF2FDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground"
                      >
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-border text-foreground max-w-lg max-h-[90vh] overflow-y-auto">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <Plus className="w-5 h-5 text-accent-orange" />
                          Add Face-to-Face Session Review
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4 mt-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Patient *</Label>
                            <Select 
                              value={f2fSession.patient} 
                              onValueChange={(val) => setF2fSession({ ...f2fSession, patient: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select patient..." />
                              </SelectTrigger>
                              <SelectContent>
                                {patients.map((p) => (
                                  <SelectItem key={p.id} value={p.name}>{p.name}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Session Date *</Label>
                            <Popover>
                              <PopoverTrigger asChild>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !f2fSessionDate && "text-muted-foreground"
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {f2fSessionDate ? format(f2fSessionDate, "PPP") : "Pick a date"}
                                </Button>
                              </PopoverTrigger>
                              <PopoverContent className="w-auto p-0" align="start">
                                <CalendarComponent
                                  mode="single"
                                  selected={f2fSessionDate}
                                  onSelect={setF2fSessionDate}
                                  initialFocus
                                  className="p-3 pointer-events-auto"
                                />
                              </PopoverContent>
                            </Popover>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Session Type *</Label>
                            <Select 
                              value={f2fSession.sessionType} 
                              onValueChange={(val) => setF2fSession({ ...f2fSession, sessionType: val })}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select type..." />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="In-Person Session">In-Person Session</SelectItem>
                                <SelectItem value="Home Visit">Home Visit</SelectItem>
                                <SelectItem value="Phone Consultation">Phone Consultation</SelectItem>
                                <SelectItem value="Video Call">Video Call</SelectItem>
                                <SelectItem value="Group Session">Group Session</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <Label>Duration (minutes)</Label>
                            <Input 
                              type="number"
                              placeholder="e.g., 30"
                              value={f2fSession.duration}
                              onChange={(e) => setF2fSession({ ...f2fSession, duration: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Technique Rating</Label>
                            <RatingStars 
                              value={f2fSession.techniqueRating} 
                              onChange={(val) => setF2fSession({ ...f2fSession, techniqueRating: val })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>Progress Rating</Label>
                            <RatingStars 
                              value={f2fSession.progressRating} 
                              onChange={(val) => setF2fSession({ ...f2fSession, progressRating: val })}
                            />
                          </div>
                        </div>

                        <div className="space-y-2">
                          <Label>Session Notes</Label>
                          <Textarea 
                            placeholder="Key observations from the session..."
                            value={f2fSession.notes}
                            onChange={(e) => setF2fSession({ ...f2fSession, notes: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Observations</Label>
                          <Textarea 
                            placeholder="Specific behaviors or patterns noticed..."
                            value={f2fSession.observations}
                            onChange={(e) => setF2fSession({ ...f2fSession, observations: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Recommendations</Label>
                          <Textarea 
                            placeholder="Recommendations for practice at home..."
                            value={f2fSession.recommendations}
                            onChange={(e) => setF2fSession({ ...f2fSession, recommendations: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </div>

                        <div className="space-y-2">
                          <Label>Goals for Next Session</Label>
                          <Textarea 
                            placeholder="Goals to work on before next meeting..."
                            value={f2fSession.goals}
                            onChange={(e) => setF2fSession({ ...f2fSession, goals: e.target.value })}
                            className="min-h-[60px]"
                          />
                        </div>
                        
                        <div className="flex gap-3 pt-2">
                          <Button 
                            variant="outline" 
                            className="flex-1"
                            onClick={() => setIsF2FDialogOpen(false)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button 
                            className="flex-1"
                            onClick={handleSaveF2FSession}
                          >
                            <Save className="w-4 h-4 mr-2" />
                            Save Review
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </CardHeader>
              <CardContent>
                <SessionReviews compact />
              </CardContent>
            </Card>

            {/* Side-by-side: Connect Recording App & Reports */}
            <div className="grid grid-cols-2 gap-3">
              {/* Connect Recording App */}
              <Card className="glass-card-strong border-accent-orange/30">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <Smartphone className="w-4 h-4 text-accent-orange" />
                    Connect App
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <Button onClick={handleConnectApp} size="sm" className="w-full" variant="navy">
                    <Upload className="w-3 h-3 mr-2" />
                    Sync
                  </Button>
                </CardContent>
              </Card>

              {/* Generate Reports */}
              <Card className="glass-card-strong">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center gap-2 text-foreground text-sm">
                    <FileText className="w-4 h-4 text-accent-orange" />
                    Reports
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <MonthlyReport recipientType="therapist" childName="Alex M." />
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Dashboard */}
          <div className="lg:col-span-2 space-y-6">
            {/* Clinical Analytics Preview */}
            <Card className="glass-card-strong border-accent-orange/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-5 h-5 text-accent-orange" />
                  Clinical Analytics Overview
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold text-success">92%</p>
                    <p className="text-xs text-muted-foreground">AI Confidence</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold text-accent-orange">156</p>
                    <p className="text-xs text-muted-foreground">SPM Average</p>
                  </div>
                  <div className="text-center p-3 bg-secondary/50 rounded-lg">
                    <p className="text-2xl font-bold text-gold">+18%</p>
                    <p className="text-xs text-muted-foreground">Avg Progress</p>
                  </div>
                </div>

                {/* AI Summary */}
                <div className="p-4 bg-secondary/30 rounded-lg mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-4 h-4 text-accent-orange" />
                    <span className="text-sm font-medium text-foreground">AI Insights</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Alex shows consistent improvement in easy onset technique. Word-initial blocks have decreased 40% over 2 weeks.
                  </p>
                </div>

                <Button 
                  className="w-full"
                  variant="navy"
                  onClick={() => navigate("/analytics/therapist")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View Full Clinical Analytics
                </Button>
              </CardContent>
            </Card>

            {/* Recommendation Trend Charts */}
            <RecommendationTrendCharts />

            {/* AI Learning History - Limited Height */}
            <AILearningHistory maxHeight="280px" />
          </div>

        </div>
      </main>
    </div>
  );
};

export default TherapistHub;
