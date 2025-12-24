import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Brain, Loader2, Send, CheckCircle2, XCircle, AlertTriangle, Trash2, Sparkles, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exerciseCategories, type Exercise } from "@/data/exerciseData";
import { toast } from "sonner";
import { QuestMessages } from "./QuestMessages";

interface AssignedQuest {
  id: string;
  quest_title: string;
  exercise_category: string;
  exercise_id: string;
  therapist_reason: string;
  ai_feedback: string | null;
  ai_agrees: boolean | null;
  ai_alternative_suggestion: string | null;
  status: string;
  created_at: string;
}

interface ChildAnalytics {
  totalSessions: number;
  avgFluency: number;
  totalBlocks: number;
  totalRepetitions: number;
  totalProlongations: number;
  recentCategories: string[];
}

export const QuestAssigner = () => {
  const [open, setOpen] = useState(false);
  const [assignedQuests, setAssignedQuests] = useState<AssignedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [validating, setValidating] = useState(false);
  
  // Form state
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [questTitle, setQuestTitle] = useState("");
  const [therapistReason, setTherapistReason] = useState("");
  
  // AI feedback state
  const [aiFeedback, setAiFeedback] = useState<{
    agrees: boolean;
    feedback: string;
    alternativeSuggestion: string | null;
  } | null>(null);

  useEffect(() => {
    fetchAssignedQuests();
  }, []);

  const fetchAssignedQuests = async () => {
    const { data, error } = await supabase
      .from("therapist_assigned_quests")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setAssignedQuests(data);
    }
    setLoading(false);
  };

  const getChildAnalytics = async (): Promise<ChildAnalytics> => {
    const { data: sessions } = await supabase
      .from("practice_sessions")
      .select("*")
      .order("session_date", { ascending: false })
      .limit(30);
    
    if (!sessions || sessions.length === 0) {
      return {
        totalSessions: 0,
        avgFluency: 0,
        totalBlocks: 0,
        totalRepetitions: 0,
        totalProlongations: 0,
        recentCategories: [],
      };
    }

    const avgFluency = sessions.reduce((sum, s) => sum + (s.fluency_score || 0), 0) / sessions.length;
    const totalBlocks = sessions.reduce((sum, s) => sum + (s.blocks_count || 0), 0);
    const totalRepetitions = sessions.reduce((sum, s) => sum + (s.repetitions_count || 0), 0);
    const totalProlongations = sessions.reduce((sum, s) => sum + (s.prolongations_count || 0), 0);
    const recentCategories = [...new Set(sessions.map(s => s.exercise_category))];

    return {
      totalSessions: sessions.length,
      avgFluency: Math.round(avgFluency),
      totalBlocks,
      totalRepetitions,
      totalProlongations,
      recentCategories,
    };
  };

  const validateWithAI = async () => {
    if (!selectedCategory || !selectedExercise || !questTitle || !therapistReason) {
      toast.error("Please fill all fields first");
      return;
    }

    setValidating(true);
    setAiFeedback(null);

    try {
      const childAnalytics = await getChildAnalytics();
      
      const { data, error } = await supabase.functions.invoke("validate-quest-assignment", {
        body: {
          exerciseCategory: selectedCategory,
          exerciseId: selectedExercise,
          questTitle,
          therapistReason,
          childAnalytics,
        },
      });

      if (error) throw error;

      setAiFeedback(data);
    } catch (err) {
      console.error("AI validation error:", err);
      toast.error("Failed to get AI feedback. You can still assign the quest.");
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCategory || !selectedExercise || !questTitle || !therapistReason) {
      toast.error("Please fill all fields");
      return;
    }

    setSubmitting(true);

    try {
      const { error } = await supabase.from("therapist_assigned_quests").insert({
        exercise_category: selectedCategory,
        exercise_id: selectedExercise,
        quest_title: questTitle,
        therapist_reason: therapistReason,
        ai_feedback: aiFeedback?.feedback || null,
        ai_agrees: aiFeedback?.agrees ?? null,
        ai_alternative_suggestion: aiFeedback?.alternativeSuggestion || null,
        priority: "high",
        status: "active",
      });

      if (error) throw error;

      toast.success("Quest assigned successfully!");
      setOpen(false);
      resetForm();
      fetchAssignedQuests();
    } catch (err) {
      console.error("Error assigning quest:", err);
      toast.error("Failed to assign quest");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteQuest = async (id: string) => {
    const { error } = await supabase
      .from("therapist_assigned_quests")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete quest");
    } else {
      toast.success("Quest removed");
      fetchAssignedQuests();
    }
  };

  const resetForm = () => {
    setSelectedCategory("");
    setSelectedExercise("");
    setQuestTitle("");
    setTherapistReason("");
    setAiFeedback(null);
  };

  const getExercisesForCategory = (categoryId: string): Exercise[] => {
    const category = exerciseCategories.find(c => c.id === categoryId);
    if (!category) return [];
    return [...category.beginner, ...category.intermediate, ...category.advanced];
  };

  const getCategoryName = (id: string) => {
    return exerciseCategories.find(c => c.id === id)?.title || id;
  };

  // Inner component for quest cards with messaging
  const QuestCardItem = ({ 
    quest, 
    onDelete, 
    getCategoryName 
  }: { 
    quest: AssignedQuest; 
    onDelete: (id: string) => void;
    getCategoryName: (id: string) => string;
  }) => {
    const [showMessages, setShowMessages] = useState(false);
    
    return (
      <div className="p-3 rounded-lg bg-background/10 border border-background/20">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="font-medium text-background text-sm truncate">
                {quest.quest_title}
              </span>
              {quest.ai_agrees !== null && (
                <Badge variant={quest.ai_agrees ? "success" : "warning"} className="shrink-0">
                  {quest.ai_agrees ? "AI Agrees" : "AI Differs"}
                </Badge>
              )}
            </div>
            <p className="text-xs text-background/60">
              {getCategoryName(quest.exercise_category)}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMessages(!showMessages)}
              className="text-background/50 hover:text-background shrink-0"
            >
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(quest.id)}
              className="text-background/50 hover:text-destructive shrink-0"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {showMessages && (
          <div className="mt-3 rounded-lg overflow-hidden bg-card">
            <QuestMessages
              questId={quest.id}
              questTitle={quest.quest_title}
              senderRole="therapist"
              senderName="Dr. Smith"
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <Card variant="dark" className="border-background/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-background">
            <Brain className="w-5 h-5 text-accent-sky" />
            Assign Quests
          </CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="sky" size="sm">
                <Send className="w-4 h-4 mr-2" />
                New Quest
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg bg-card">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Assign a Quest with AI Collaboration
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Quest Title</label>
                  <Input
                    placeholder="e.g., Breathing Champion Quest"
                    value={questTitle}
                    onChange={e => setQuestTitle(e.target.value)}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Exercise Category</label>
                  <Select value={selectedCategory} onValueChange={v => {
                    setSelectedCategory(v);
                    setSelectedExercise("");
                    setAiFeedback(null);
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {exerciseCategories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.icon} {cat.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedCategory && (
                  <div>
                    <label className="text-sm font-medium mb-2 block">Specific Exercise</label>
                    <Select value={selectedExercise} onValueChange={v => {
                      setSelectedExercise(v);
                      setAiFeedback(null);
                    }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select exercise" />
                      </SelectTrigger>
                      <SelectContent>
                        {getExercisesForCategory(selectedCategory).map(ex => (
                          <SelectItem key={ex.id} value={ex.id}>
                            {ex.name} ({ex.difficulty})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium mb-2 block">Your Reasoning</label>
                  <Textarea
                    placeholder="Why are you recommending this exercise? What patterns have you observed?"
                    value={therapistReason}
                    onChange={e => setTherapistReason(e.target.value)}
                    rows={3}
                  />
                </div>

                {/* AI Validation Section */}
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      AI Collaboration
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={validateWithAI}
                      disabled={validating || !selectedCategory || !therapistReason}
                    >
                      {validating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 mr-2" />
                          Get AI Feedback
                        </>
                      )}
                    </Button>
                  </div>

                  {aiFeedback && (
                    <div className={`p-4 rounded-lg border ${
                      aiFeedback.agrees 
                        ? "bg-success/10 border-success/30" 
                        : "bg-gold/10 border-gold/30"
                    }`}>
                      <div className="flex items-start gap-2 mb-2">
                        {aiFeedback.agrees ? (
                          <CheckCircle2 className="w-5 h-5 text-success shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-5 h-5 text-gold shrink-0 mt-0.5" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {aiFeedback.agrees ? "AI Agrees ✓" : "AI Has Suggestions"}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            {aiFeedback.feedback}
                          </p>
                          {aiFeedback.alternativeSuggestion && (
                            <p className="text-sm mt-2 p-2 bg-card rounded border">
                              <span className="font-medium">Alternative: </span>
                              {aiFeedback.alternativeSuggestion}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  <p className="text-xs text-muted-foreground mt-2">
                    The child will see both your recommendation and AI's input, and can choose which to follow.
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => {
                      setOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleSubmit}
                    disabled={submitting || !selectedCategory || !selectedExercise || !questTitle || !therapistReason}
                  >
                    {submitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      "Assign Quest"
                    )}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="w-5 h-5 animate-spin text-background/50" />
          </div>
        ) : assignedQuests.length === 0 ? (
          <p className="text-sm text-background/60 text-center py-4">
            No quests assigned yet. Click "New Quest" to create one.
          </p>
        ) : (
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {assignedQuests.map(quest => (
              <QuestCardItem 
                key={quest.id} 
                quest={quest} 
                onDelete={deleteQuest}
                getCategoryName={getCategoryName}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
