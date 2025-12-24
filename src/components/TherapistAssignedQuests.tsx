import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, CheckCircle2, AlertTriangle, Brain, Sparkles, UserCircle, Star, ThumbsUp, ThumbsDown, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exerciseCategories, type Exercise } from "@/data/exerciseData";
import { toast } from "sonner";

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
}

interface TherapistAssignedQuestsProps {
  selectedCharacter: { emoji: string; name: string };
  onExerciseStart: (exercise: Exercise, categoryId: string) => void;
}

export const TherapistAssignedQuests = ({ selectedCharacter, onExerciseStart }: TherapistAssignedQuestsProps) => {
  const navigate = useNavigate();
  const [quests, setQuests] = useState<AssignedQuest[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchAssignedQuests();
    fetchCompletedQuests();
  }, []);

  const fetchAssignedQuests = async () => {
    const { data, error } = await supabase
      .from("therapist_assigned_quests")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });
    
    if (!error && data) {
      setQuests(data);
    }
    setLoading(false);
  };

  const fetchCompletedQuests = async () => {
    const { data } = await supabase
      .from("quest_completions")
      .select("quest_id");
    
    if (data) {
      setCompletedQuests(new Set(data.map(q => q.quest_id)));
    }
  };

  const markQuestComplete = async (questId: string, exerciseId: string, chosenRecommendation: "therapist" | "ai") => {
    // Mark quest completion in quest_completions table
    const { error: completionError } = await supabase
      .from("quest_completions")
      .upsert({ 
        quest_id: `therapist-${questId}`, 
        exercise_id: exerciseId 
      }, { 
        onConflict: "user_id,quest_id" 
      });
    
    // Update the therapist_assigned_quests with choice and completion time
    const { error: updateError } = await supabase
      .from("therapist_assigned_quests")
      .update({ 
        chosen_recommendation: chosenRecommendation,
        completed_at: new Date().toISOString()
      })
      .eq("id", questId);
    
    if (!completionError && !updateError) {
      setCompletedQuests(prev => new Set([...prev, `therapist-${questId}`]));
      toast.success("Quest completed! ⭐");
    }
  };

  const getExerciseFromId = (categoryId: string, exerciseId: string): Exercise | null => {
    const category = exerciseCategories.find(c => c.id === categoryId);
    if (!category) return null;
    
    const allExercises = [...category.beginner, ...category.intermediate, ...category.advanced];
    return allExercises.find(e => e.id === exerciseId) || null;
  };

  const getCategoryIcon = (categoryId: string) => {
    return exerciseCategories.find(c => c.id === categoryId)?.icon || "📋";
  };

  const handleQuestStart = async (quest: AssignedQuest, useAlternative: boolean = false) => {
    let categoryId = quest.exercise_category;
    let exerciseId = quest.exercise_id;

    // If using AI alternative, try to find the alternative category
    if (useAlternative && quest.ai_alternative_suggestion) {
      // Extract category from AI suggestion (simple heuristic)
      const suggestionLower = quest.ai_alternative_suggestion.toLowerCase();
      const matchedCategory = exerciseCategories.find(c => 
        suggestionLower.includes(c.id.replace("-", " ")) || 
        suggestionLower.includes(c.title.toLowerCase())
      );
      if (matchedCategory) {
        categoryId = matchedCategory.id;
        exerciseId = matchedCategory.beginner[0]?.id || exerciseId;
      }
    }

    const exercise = getExerciseFromId(categoryId, exerciseId);
    const chosenRecommendation: "therapist" | "ai" = useAlternative ? "ai" : "therapist";
    
    if (exercise) {
      if (categoryId === "free-talk") {
        navigate(`/free-talk?character=${selectedCharacter.emoji}`);
      } else {
        onExerciseStart(exercise, categoryId);
      }
      
      if (!completedQuests.has(`therapist-${quest.id}`)) {
        await markQuestComplete(quest.id, exerciseId, chosenRecommendation);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (quests.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-4">
        <UserCircle className="w-5 h-5 text-accent-sky" />
        <h3 className="font-display font-semibold text-foreground">Therapist Assigned Quests</h3>
        <Badge variant="secondary" className="text-xs">New!</Badge>
      </div>

      <div className="space-y-4">
        {quests.map(quest => {
          const isCompleted = completedQuests.has(`therapist-${quest.id}`);
          const showConflict = quest.ai_agrees === false && quest.ai_alternative_suggestion;
          
          return (
            <Card 
              key={quest.id} 
              className={`rounded-kids overflow-hidden border-2 ${
                isCompleted 
                  ? "border-success/50 bg-success/5" 
                  : showConflict 
                    ? "border-gold/50 bg-gold/5"
                    : "border-accent-sky/50 bg-accent-sky/5"
              }`}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl bg-card shadow-md border-2 ${
                    isCompleted ? "border-success" : "border-accent-sky"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-7 h-7 text-success" /> : getCategoryIcon(quest.exercise_category)}
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-display font-semibold text-foreground">
                        {quest.quest_title}
                      </h4>
                      {isCompleted && (
                        <Badge variant="success" className="text-[10px]">Completed ⭐</Badge>
                      )}
                    </div>

                    {/* Therapist reasoning */}
                    <div className="flex items-start gap-2 mb-3 p-2 bg-card/50 rounded-lg">
                      <UserCircle className="w-4 h-4 text-accent-sky mt-0.5 shrink-0" />
                      <div>
                        <p className="text-xs font-medium text-accent-sky">Therapist says:</p>
                        <p className="text-sm text-muted-foreground">{quest.therapist_reason}</p>
                      </div>
                    </div>

                    {/* AI feedback */}
                    {quest.ai_feedback && (
                      <div className={`flex items-start gap-2 mb-3 p-2 rounded-lg ${
                        quest.ai_agrees ? "bg-success/10" : "bg-gold/10"
                      }`}>
                        <Brain className={`w-4 h-4 mt-0.5 shrink-0 ${quest.ai_agrees ? "text-success" : "text-gold"}`} />
                        <div>
                          <p className={`text-xs font-medium ${quest.ai_agrees ? "text-success" : "text-gold"}`}>
                            {quest.ai_agrees ? "AI Agrees ✓" : "AI Has a Different Idea"}
                          </p>
                          <p className="text-sm text-muted-foreground">{quest.ai_feedback}</p>
                        </div>
                      </div>
                    )}

                    {/* Choice buttons when AI disagrees */}
                    {showConflict && !isCompleted ? (
                      <div className="space-y-2">
                        <p className="text-xs text-muted-foreground mb-2">
                          <Sparkles className="w-3 h-3 inline mr-1" />
                          You can choose which path to follow:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuestStart(quest, false)}
                            className="border-accent-sky text-accent-sky hover:bg-accent-sky/10"
                          >
                            <ThumbsUp className="w-4 h-4 mr-2" />
                            Follow Therapist
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleQuestStart(quest, true)}
                            className="border-gold text-gold hover:bg-gold/10"
                          >
                            <Brain className="w-4 h-4 mr-2" />
                            Try AI's Suggestion
                          </Button>
                        </div>
                        {quest.ai_alternative_suggestion && (
                          <p className="text-xs text-gold/80 mt-1 p-2 bg-card rounded border border-gold/20">
                            <strong>AI suggests:</strong> {quest.ai_alternative_suggestion}
                          </p>
                        )}
                      </div>
                    ) : !isCompleted ? (
                      <Button
                        size="sm"
                        onClick={() => handleQuestStart(quest, false)}
                        className="bg-accent-sky hover:bg-accent-sky/90"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Start Quest!
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2 text-success text-sm">
                        <Star className="w-4 h-4 fill-gold text-gold" />
                        Great job completing this quest!
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
