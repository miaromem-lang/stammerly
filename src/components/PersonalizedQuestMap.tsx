import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MapPin, Play, Star, Brain, Sparkles, TrendingUp, Target, Loader2, ChevronRight, Zap, CheckCircle2, Trophy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { exerciseCategories, type Exercise, type ExerciseCategory } from "@/data/exerciseData";
import { toast } from "sonner";

interface QuestRecommendation {
  id: string;
  title: string;
  description: string;
  reason: string;
  category: ExerciseCategory;
  exercise: Exercise;
  priority: "high" | "medium" | "low";
  icon: string;
  completed?: boolean;
}

interface PersonalizedQuestMapProps {
  selectedCharacter: { emoji: string; name: string };
  onExerciseStart: (exercise: Exercise, categoryId: string) => void;
}

export const PersonalizedQuestMap = ({ selectedCharacter, onExerciseStart }: PersonalizedQuestMapProps) => {
  const navigate = useNavigate();
  const [recommendations, setRecommendations] = useState<QuestRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [weakAreas, setWeakAreas] = useState<string[]>([]);
  const [completedQuests, setCompletedQuests] = useState<Set<string>>(new Set());

  useEffect(() => {
    generateRecommendations();
  }, []);

  const fetchCompletedQuests = async () => {
    const { data, error } = await supabase
      .from("quest_completions")
      .select("quest_id");
    
    if (!error && data) {
      setCompletedQuests(new Set(data.map(q => q.quest_id)));
    }
  };

  const markQuestComplete = async (questId: string, exerciseId: string) => {
    const { error } = await supabase
      .from("quest_completions")
      .upsert({ 
        quest_id: questId, 
        exercise_id: exerciseId 
      }, { 
        onConflict: "user_id,quest_id" 
      });
    
    if (error) {
      console.error("Error marking quest complete:", error);
      return;
    }
    
    setCompletedQuests(prev => new Set([...prev, questId]));
    toast.success("Quest completed! ⭐", {
      description: "Great job! You earned a star!",
    });
  };

  const generateRecommendations = async () => {
    try {
      // Fetch completed quests first
      await fetchCompletedQuests();

      // Fetch recent practice sessions to analyze
      const { data: sessions, error } = await supabase
        .from("practice_sessions")
        .select("*")
        .order("session_date", { ascending: false })
        .limit(30);

      if (error) {
        console.error("Error fetching sessions:", error);
        generateDefaultRecommendations();
        return;
      }

      // Analyze performance to identify weak areas
      const categoryScores: Record<string, { total: number; count: number; avgFluency: number }> = {};
      
      if (sessions && sessions.length > 0) {
        sessions.forEach(session => {
          const cat = session.exercise_category || "general";
          if (!categoryScores[cat]) {
            categoryScores[cat] = { total: 0, count: 0, avgFluency: 0 };
          }
          categoryScores[cat].total += session.fluency_score || 0;
          categoryScores[cat].count += 1;
        });

        // Calculate averages
        Object.keys(categoryScores).forEach(cat => {
          categoryScores[cat].avgFluency = categoryScores[cat].total / categoryScores[cat].count;
        });

        // Identify weak areas (categories with avg fluency < 70)
        const weak = Object.entries(categoryScores)
          .filter(([_, data]) => data.avgFluency < 70)
          .map(([cat]) => cat);
        
        setWeakAreas(weak);

        // Generate personalized recommendations based on analysis
        const recs: QuestRecommendation[] = [];

        // Check for disfluency patterns
        const totalBlocks = sessions.reduce((sum, s) => sum + (s.blocks_count || 0), 0);
        const totalRepetitions = sessions.reduce((sum, s) => sum + (s.repetitions_count || 0), 0);
        const totalProlongations = sessions.reduce((sum, s) => sum + (s.prolongations_count || 0), 0);

        // Recommend based on disfluency patterns
        if (totalBlocks > totalRepetitions && totalBlocks > totalProlongations) {
          const breathingCat = exerciseCategories.find(c => c.id === "breathing");
          const easyOnsetCat = exerciseCategories.find(c => c.id === "easy-onset");
          
          if (breathingCat) {
            recs.push({
              id: "quest-blocks-1",
              title: "Smooth Start Quest",
              description: "Practice breathing to reduce blocks",
              reason: `You've had ${totalBlocks} blocks recently. Breathing exercises help you start words smoothly!`,
              category: breathingCat,
              exercise: breathingCat.beginner[0],
              priority: "high",
              icon: "🎯",
            });
          }
          
          if (easyOnsetCat) {
            recs.push({
              id: "quest-blocks-2", 
              title: "Easy Start Adventure",
              description: "Master the gentle onset technique",
              reason: "Easy onset helps you begin words without tension - perfect for reducing blocks!",
              category: easyOnsetCat,
              exercise: easyOnsetCat.beginner[0],
              priority: "high",
              icon: "🌊",
            });
          }
        }

        if (totalRepetitions > 3) {
          const pacingCat = exerciseCategories.find(c => c.id === "pacing");
          if (pacingCat) {
            recs.push({
              id: "quest-reps",
              title: "Slow & Steady Journey",
              description: "Practice pacing to smooth out repetitions",
              reason: `${totalRepetitions} repetitions detected. Slowing down helps you speak more smoothly!`,
              category: pacingCat,
              exercise: pacingCat.beginner[0],
              priority: "medium",
              icon: "🐢",
            });
          }
        }

        if (totalProlongations > 2) {
          const lightContactCat = exerciseCategories.find(c => c.id === "light-contact");
          if (lightContactCat) {
            recs.push({
              id: "quest-prolong",
              title: "Feather Touch Mission",
              description: "Learn light contact for smoother sounds",
              reason: `${totalProlongations} prolongations noticed. Light contact helps sounds flow naturally!`,
              category: lightContactCat,
              exercise: lightContactCat.beginner[0],
              priority: "medium",
              icon: "🪶",
            });
          }
        }

        // Add a free talk challenge if they have some practice
        if (sessions.length >= 5) {
          const freeTalkCat = exerciseCategories.find(c => c.id === "free-talk");
          if (freeTalkCat) {
            recs.push({
              id: "quest-talk",
              title: "Chat Champion Challenge",
              description: `Talk with ${selectedCharacter.name}!`,
              reason: "You've been practicing great! Time to chat with your buddy and use all your skills!",
              category: freeTalkCat,
              exercise: freeTalkCat.beginner[0],
              priority: "low",
              icon: "💬",
            });
          }
        }

        // If we found recommendations, use them
        if (recs.length > 0) {
          setRecommendations(recs);
        } else {
          generateDefaultRecommendations();
        }
      } else {
        // No sessions yet - generate starter recommendations
        generateDefaultRecommendations();
      }
    } catch (err) {
      console.error("Error generating recommendations:", err);
      generateDefaultRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateDefaultRecommendations = () => {
    const recs: QuestRecommendation[] = [];
    
    const breathingCat = exerciseCategories.find(c => c.id === "breathing");
    const easyOnsetCat = exerciseCategories.find(c => c.id === "easy-onset");
    const pacingCat = exerciseCategories.find(c => c.id === "pacing");
    const freeTalkCat = exerciseCategories.find(c => c.id === "free-talk");

    if (breathingCat) {
      recs.push({
        id: "start-1",
        title: "First Breath Quest",
        description: "Begin your journey with breathing",
        reason: "Every great speaker starts with calm breathing. Let's learn together!",
        category: breathingCat,
        exercise: breathingCat.beginner[0],
        priority: "high",
        icon: "💨",
      });
    }

    if (easyOnsetCat) {
      recs.push({
        id: "start-2",
        title: "Gentle Waves Quest",
        description: "Learn to start words softly",
        reason: "Easy onset is like waves on a beach - smooth and gentle!",
        category: easyOnsetCat,
        exercise: easyOnsetCat.beginner[0],
        priority: "medium",
        icon: "🌊",
      });
    }

    if (pacingCat) {
      recs.push({
        id: "start-3",
        title: "Turtle's Path Quest",
        description: "Discover the power of slowing down",
        reason: "The turtle always wins because they take their time!",
        category: pacingCat,
        exercise: pacingCat.beginner[0],
        priority: "medium",
        icon: "🐢",
      });
    }

    if (freeTalkCat) {
      recs.push({
        id: "start-4",
        title: "Buddy Chat Quest",
        description: `Meet ${selectedCharacter.name}!`,
        reason: "Practice talking with your friendly buddy whenever you're ready!",
        category: freeTalkCat,
        exercise: freeTalkCat.beginner[0],
        priority: "low",
        icon: selectedCharacter.emoji,
      });
    }

    setRecommendations(recs);
  };

  const getPriorityStyles = (priority: string, isCompleted: boolean) => {
    if (isCompleted) {
      return {
        border: "border-success/50",
        bg: "bg-gradient-to-br from-success/20 to-success/5",
        badge: "bg-success text-primary-foreground",
        badgeText: "Completed! ⭐",
      };
    }
    
    switch (priority) {
      case "high":
        return {
          border: "border-accent-orange/50",
          bg: "bg-gradient-to-br from-accent-orange/20 to-gold/10",
          badge: "bg-accent-orange text-primary-foreground",
          badgeText: "Recommended!",
        };
      case "medium":
        return {
          border: "border-primary/30",
          bg: "bg-gradient-to-br from-primary/10 to-accent-sky/10",
          badge: "bg-primary text-primary-foreground",
          badgeText: "Good Choice",
        };
      default:
        return {
          border: "border-border",
          bg: "bg-gradient-to-br from-secondary/50 to-muted/30",
          badge: "bg-muted text-muted-foreground",
          badgeText: "Fun Extra",
        };
    }
  };

  const handleQuestClick = async (quest: QuestRecommendation) => {
    const isCompleted = completedQuests.has(quest.id);
    
    if (quest.category.id === "free-talk") {
      navigate(`/free-talk?character=${selectedCharacter.emoji}`);
    } else {
      onExerciseStart(quest.exercise, quest.category.id);
    }
    
    // Mark quest as complete after starting it
    if (!isCompleted) {
      await markQuestComplete(quest.id, quest.exercise.id);
    }
  };

  const completedCount = recommendations.filter(q => completedQuests.has(q.id)).length;
  const progressPercent = recommendations.length > 0 ? (completedCount / recommendations.length) * 100 : 0;

  if (loading) {
    return (
      <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
        <CardContent className="p-8 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-accent-orange mx-auto mb-4" />
            <p className="text-muted-foreground">AI is creating your personal quest map...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
      <CardContent className="p-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-display text-2xl font-bold text-foreground flex items-center gap-2">
            <Brain className="w-6 h-6 text-accent-orange" />
            🗺️ Your Quest Map
          </h2>
          <div className="flex items-center gap-1 bg-primary/10 px-3 py-1 rounded-full">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-xs font-medium text-primary">AI Powered</span>
          </div>
        </div>
        <p className="text-muted-foreground text-sm mb-4">
          Personalized quests based on your practice! {selectedCharacter.emoji} {selectedCharacter.name} picked these just for you!
        </p>

        {/* Progress Bar */}
        <div className="mb-6 p-4 bg-gradient-to-r from-gold/10 to-success/10 rounded-kids border border-gold/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Trophy className="w-5 h-5 text-gold" />
              <span className="font-medium text-foreground">Quest Progress</span>
            </div>
            <span className="text-sm font-bold text-gold">{completedCount}/{recommendations.length} Complete</span>
          </div>
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-gold to-success rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {completedCount === recommendations.length && recommendations.length > 0 && (
            <p className="text-success text-sm mt-2 font-medium text-center">🎉 All quests completed! You're a champion!</p>
          )}
        </div>

        {/* Weak areas alert */}
        {weakAreas.length > 0 && (
          <div className="bg-gold/10 border border-gold/30 rounded-kids p-4 mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-5 h-5 text-gold" />
              <span className="font-medium text-foreground">Focus Areas</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Your quests focus on: {weakAreas.map(w => w.replace("-", " ")).join(", ")}
            </p>
          </div>
        )}

        {/* Quest Path */}
        <div className="relative">
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-orange via-primary to-success rounded-full" />
          
          <div className="space-y-6">
            {recommendations.map((quest, index) => {
              const isCompleted = completedQuests.has(quest.id);
              const styles = getPriorityStyles(quest.priority, isCompleted);
              return (
                <button
                  key={quest.id}
                  onClick={() => handleQuestClick(quest)}
                  className={`flex items-start gap-4 relative w-full text-left transition-all hover:scale-[1.02] p-4 rounded-kids ${styles.bg} border-2 ${styles.border} ${isCompleted ? 'opacity-80' : ''}`}
                >
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold bg-card shadow-lg border-4 ${
                    isCompleted ? "border-success" : quest.priority === "high" ? "border-accent-orange" : quest.priority === "medium" ? "border-primary" : "border-muted"
                  }`}>
                    {isCompleted ? <CheckCircle2 className="w-8 h-8 text-success" /> : quest.icon}
                  </div>
                  <div className="flex-1 pt-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className={`font-display font-semibold ${isCompleted ? 'text-success' : 'text-foreground'}`}>
                        {quest.title}
                      </h4>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${styles.badge}`}>
                        {styles.badgeText}
                      </span>
                    </div>
                    <p className="text-sm text-foreground/80 mb-2">{quest.description}</p>
                    <div className="flex items-start gap-2 bg-card/50 rounded-lg p-2">
                      <Sparkles className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <p className="text-xs text-muted-foreground">{quest.reason}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-2 rounded-kids self-center ${
                    isCompleted ? 'bg-success/20' : 'bg-accent-orange/20'
                  }`}>
                    {isCompleted ? (
                      <>
                        <Star className="w-4 h-4 text-gold fill-gold" />
                        <span className="text-sm font-medium text-success">Done!</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 text-accent-orange" />
                        <span className="text-sm font-medium text-accent-orange">Play!</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Therapist recommendations section */}
        <div className="mt-8 pt-6 border-t border-border">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-5 h-5 text-gold" />
            <h3 className="font-display font-semibold text-foreground">Keep Improving!</h3>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-success/10 rounded-kids text-center">
              <TrendingUp className="w-6 h-6 text-success mx-auto mb-1" />
              <p className="text-sm font-medium text-foreground">Practice Daily</p>
              <p className="text-xs text-muted-foreground">5 min makes a difference!</p>
            </div>
            <div className="p-3 bg-primary/10 rounded-kids text-center">
              <Star className="w-6 h-6 text-gold mx-auto mb-1" />
              <p className="text-sm font-medium text-foreground">Earn Stars</p>
              <p className="text-xs text-muted-foreground">Complete quests for rewards!</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
