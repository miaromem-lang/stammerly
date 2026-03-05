import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ArrowLeft, Play, Star, Trophy, Target, Zap, MapPin, Flame, BookOpen, Mic, Sparkles, Settings, ChevronRight, Brain, Clock, Check } from "lucide-react";
import { HubNavigation } from "@/components/HubNavigation";
import { PracticeAnalytics } from "@/components/PracticeAnalytics";
import { PersonalizedQuestMap } from "@/components/PersonalizedQuestMap";
import { KidContact } from "@/components/KidContact";
import { useUserProgress } from "@/hooks/useUserProgress";
import { useAchievements } from "@/hooks/useAchievements";
import { 
  exerciseCategories as fullExerciseCategories, 
  questLevelMapping, 
  getExercisesForQuestLevel, 
  getAIRecommendation,
  getDifficultyStyle,
  type Exercise,
  type ExerciseCategory
} from "@/data/exerciseData";
import PageBackground from "@/components/PageBackground";
import { PendantStatusCard } from "@/components/PendantStatusCard";
import { SyncHistoryLog } from "@/components/SyncHistoryLog";
import { MoodCheckIn } from "@/components/MoodCheckIn";

const characters = [
  { id: "otter", name: "Echo the Otter", emoji: "🦦", color: "from-cyan-400 to-blue-500", personality: "playful and encouraging" },
  { id: "owl", name: "Luna the Owl", emoji: "🦉", color: "from-purple-400 to-indigo-500", personality: "wise and patient" },
  { id: "fox", name: "Finn the Fox", emoji: "🦊", color: "from-orange-400 to-red-500", personality: "clever and adventurous" },
  { id: "bunny", name: "Bella the Bunny", emoji: "🐰", color: "from-pink-400 to-rose-500", personality: "gentle and kind" },
  { id: "monkey", name: "Max the Monkey", emoji: "🐵", color: "from-amber-400 to-yellow-500", personality: "fun and silly" },
];

// Load therapist-created exercises from localStorage
const getTherapistExercises = () => {
  const saved = localStorage.getItem('stammerly_therapist_exercises');
  if (saved) {
    try {
      const exercises = JSON.parse(saved);
      return exercises.filter((e: any) => e.custom);
    } catch {
      return [];
    }
  }
  return [];
};

const KidHub = () => {
  const navigate = useNavigate();
  const { progress, loading: progressLoading } = useUserProgress();
  const { getAllAchievementsWithStatus, getAchievementProgress } = useAchievements();
  const [activeTab, setActiveTab] = useState<'quests' | 'practice'>('quests');
  const [activeDifficulty, setActiveDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [therapistExercises, setTherapistExercises] = useState(getTherapistExercises());
  
  // Exercise selection state
  const [selectedCategory, setSelectedCategory] = useState<ExerciseCategory | null>(null);
  const [showExerciseSheet, setShowExerciseSheet] = useState(false);
  
  // Load saved character from localStorage
  const [selectedCharacter, setSelectedCharacter] = useState(() => {
    const saved = localStorage.getItem('stammerly_character');
    if (saved) {
      const found = characters.find(c => c.id === saved);
      if (found) return found;
    }
    return characters[0];
  });
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);

  // Save character selection to localStorage
  const handleCharacterSelect = (character: typeof characters[0]) => {
    setSelectedCharacter(character);
    localStorage.setItem('stammerly_character', character.id);
    setShowCharacterPicker(false);
  };

  const handleCategorySelect = (category: ExerciseCategory) => {
    setSelectedCategory(category);
    setShowExerciseSheet(true);
  };

  const handleExerciseStart = (exercise: Exercise, categoryId: string) => {
    setShowExerciseSheet(false);
    if (categoryId === "free-talk") {
      navigate(`/free-talk?character=${selectedCharacter.emoji}&exercise=${exercise.id}`);
    } else {
      navigate(`/practice?category=${categoryId}&exercise=${exercise.id}&title=${encodeURIComponent(exercise.name)}`);
    }
  };

  const handleCategoryClick = (category: ExerciseCategory) => {
    if (category.id === "free-talk") {
      navigate(`/free-talk?character=${selectedCharacter.emoji}`);
    } else if (category.id === "reading") {
      navigate(`/story-exercise?character=${selectedCharacter.emoji}`);
    } else {
      handleCategorySelect(category);
    }
  };

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      {/* Top Navigation */}
      <HubNavigation />
      
      {/* Header */}
      <header className="bg-accent-orange/20 backdrop-blur-sm border-b border-accent-orange/20">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/signin")}
              className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowCharacterPicker(true)}
                className="w-10 h-10 rounded-full bg-accent-orange flex items-center justify-center text-2xl hover:scale-110 transition-transform"
              >
                {selectedCharacter.emoji}
              </button>
              <span className="font-display font-bold text-xl text-foreground">{selectedCharacter.name.split(' ')[0]}'s World</span>
            </div>
            <div className="flex items-center gap-2 bg-gold/20 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <span className="font-bold text-foreground">{progress.totalGems}</span>
            </div>
            <KidContact 
              characterName={selectedCharacter.name}
              characterEmoji={selectedCharacter.emoji}
            />
          </div>
        </div>
      </header>

      {/* Character Picker Dialog */}
      <Dialog open={showCharacterPicker} onOpenChange={setShowCharacterPicker}>
        <DialogContent className="bg-card border-border rounded-kids max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-display">Choose Your Speech Buddy!</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            {characters.map((character) => (
              <button
                key={character.id}
                onClick={() => handleCharacterSelect(character)}
                className={`p-4 rounded-kids transition-all hover:scale-105 ${
                  selectedCharacter.id === character.id 
                    ? "ring-4 ring-accent-orange bg-accent-orange/10" 
                    : "bg-secondary/50 hover:bg-secondary"
                }`}
              >
                <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${character.color} flex items-center justify-center text-4xl mb-2`}>
                  {character.emoji}
                </div>
                <p className="font-medium text-foreground text-sm">{character.name}</p>
                <p className="text-xs text-muted-foreground">{character.personality}</p>
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>

      {/* Exercise Selection Sheet - shows exercises by difficulty for a category */}
      <Sheet open={showExerciseSheet} onOpenChange={setShowExerciseSheet}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="text-2xl font-display flex items-center gap-2">
              {selectedCategory && (
                <>
                  <span className="text-3xl">{selectedCategory.icon}</span>
                  {selectedCategory.title}
                </>
              )}
            </SheetTitle>
          </SheetHeader>
          
          {selectedCategory && (
            <div className="mt-6 space-y-6">
              <p className="text-muted-foreground">{selectedCategory.focus}</p>
              
              {/* Difficulty selector */}
              <div className="flex gap-2">
                <Button
                  variant={activeDifficulty === 'beginner' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 rounded-kids"
                  onClick={() => setActiveDifficulty('beginner')}
                >
                  🌱 Beginner
                </Button>
                <Button
                  variant={activeDifficulty === 'intermediate' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 rounded-kids"
                  onClick={() => setActiveDifficulty('intermediate')}
                >
                  🌟 Growing
                </Button>
                <Button
                  variant={activeDifficulty === 'advanced' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 rounded-kids"
                  onClick={() => setActiveDifficulty('advanced')}
                >
                  🏆 Expert
                </Button>
              </div>
              
              {/* Exercises for selected difficulty */}
              <div className="space-y-3">
                {selectedCategory[activeDifficulty].map((exercise) => (
                  <button
                    key={exercise.id}
                    onClick={() => handleExerciseStart(exercise, selectedCategory.id)}
                    className={`w-full p-4 rounded-kids bg-gradient-to-br ${selectedCategory.color} border border-border/50 text-left transition-all hover:scale-[1.01] hover:shadow-md group`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-1">
                        <h5 className="font-medium text-foreground">{exercise.name}</h5>
                        <p className="text-sm text-muted-foreground">{exercise.description}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {exercise.duration}
                        </span>
                        <Play className="w-5 h-5 text-accent-orange" />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner with Character */}
        <Card className="rounded-kids bg-gradient-to-r from-accent-orange to-gold text-primary-foreground mb-8 overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Hey there, Champion! 🎉</h1>
              <p className="text-primary-foreground/80">Ready for today's speech adventure with {selectedCharacter.name}?</p>
            </div>
            <div className="relative">
              <div className="text-6xl animate-bounce">{selectedCharacter.emoji}</div>
              <div className="absolute -top-2 -right-2 text-xl animate-pulse">💎</div>
              <div className="absolute -bottom-1 -left-2 text-lg animate-pulse" style={{ animationDelay: "0.5s" }}>✨</div>
            </div>
          </CardContent>
        </Card>

        {/* Pendant Status */}
        <div className="mb-8">
          <PendantStatusCard variant="kid" />
        </div>

        {/* Daily Streak & Stats */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 bg-success/20 px-4 py-3 rounded-kids min-w-fit">
            <Zap className="w-6 h-6 text-success" />
            <span className="font-bold text-foreground">{progress.currentStreak} Day Streak! 🔥</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/20 px-4 py-3 rounded-kids min-w-fit">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">{getAchievementProgress().earned} Badges Earned</span>
          </div>
          <div className="flex items-center gap-2 bg-gold/20 px-4 py-3 rounded-kids min-w-fit">
            <Target className="w-6 h-6 text-gold" />
            <span className="font-bold text-foreground">{progress.dailyGoalsCompleted}/{progress.dailyGoalsTarget} Goals Done</span>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6">
          <Button
            variant={activeTab === 'quests' ? 'default' : 'outline'}
            className="rounded-kids flex-1"
            onClick={() => setActiveTab('quests')}
          >
            <MapPin className="w-4 h-4 mr-2" />
            Quest Map
          </Button>
          <Button
            variant={activeTab === 'practice' ? 'default' : 'outline'}
            className="rounded-kids flex-1"
            onClick={() => setActiveTab('practice')}
          >
            <Mic className="w-4 h-4 mr-2" />
            All Exercises
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'quests' ? (
              <PersonalizedQuestMap 
                selectedCharacter={selectedCharacter}
                onExerciseStart={handleExerciseStart}
              />
            ) : (
              <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    📚 All Practice Exercises
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {fullExerciseCategories.map((category) => {
                      const totalExercises = category.beginner.length + category.intermediate.length + category.advanced.length;
                      return (
                        <button
                          key={category.id}
                          onClick={() => handleCategoryClick(category)}
                          className={`p-4 rounded-kids bg-gradient-to-br ${category.color} border border-border/50 text-left transition-all hover:scale-[1.02] hover:shadow-lg group`}
                        >
                          <div className="flex items-start gap-3">
                            <span className="text-3xl group-hover:scale-110 transition-transform">{category.icon}</span>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-display font-semibold text-foreground">{category.title}</h4>
                              </div>
                              <p className="text-sm text-muted-foreground mb-2">
                                {category.id === "free-talk" 
                                  ? `Chat with ${selectedCharacter.name}!` 
                                  : category.description
                                }
                              </p>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs px-2 py-1 rounded-full bg-success/20 text-success">
                                  🌱 {category.beginner.length}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-amber-500/20 text-amber-600">
                                  🌟 {category.intermediate.length}
                                </span>
                                <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-600">
                                  🏆 {category.advanced.length}
                                </span>
                              </div>
                            </div>
                            <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  
                  {/* Therapist Recommended Exercises */}
                  {therapistExercises.length > 0 && (
                    <div className="mt-6">
                      <h3 className="font-display text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-primary" />
                        🩺 From Your Therapist
                      </h3>
                      <div className="space-y-3">
                        {therapistExercises.map((ex: any) => (
                          <button
                            key={ex.id}
                            onClick={() => navigate(`/practice?category=${ex.category.toLowerCase()}&title=${encodeURIComponent(ex.name)}`)}
                            className="w-full p-4 rounded-kids bg-gradient-to-br from-primary/20 to-accent-orange/10 border-2 border-primary/30 text-left transition-all hover:scale-[1.02] hover:shadow-lg"
                          >
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">⭐</span>
                              <div className="flex-1">
                                <h4 className="font-display font-semibold text-foreground">{ex.name}</h4>
                                <p className="text-sm text-muted-foreground">{ex.category} • {ex.difficulty}</p>
                              </div>
                              <Play className="w-5 h-5 text-primary" />
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Sidebar */}
          <div className="space-y-6">
            {/* Character Card */}
            <Card className="rounded-kids text-center overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-foreground">
                    Your Buddy
                  </h3>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setShowCharacterPicker(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Settings className="w-4 h-4" />
                  </Button>
                </div>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className={`w-full h-full rounded-full bg-gradient-to-br ${selectedCharacter.color} flex items-center justify-center text-6xl animate-float`}>
                    {selectedCharacter.emoji}
                  </div>
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">💎</div>
                  <div className="absolute -bottom-1 -left-2 text-xl animate-bounce" style={{ animationDelay: "0.5s" }}>✨</div>
                </div>
                <p className="font-medium text-foreground">{selectedCharacter.name}</p>
                <p className="text-muted-foreground text-sm capitalize">
                  {selectedCharacter.personality}
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-3 rounded-kids"
                  onClick={() => setShowCharacterPicker(true)}
                >
                  Change Buddy
                </Button>
              </CardContent>
            </Card>

            {/* Practice Analytics */}
            <PracticeAnalytics variant="kid" showRecent={false} />

            {/* Sync History */}
            <SyncHistoryLog variant="kid" />

            <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <Flame className="w-5 h-5 text-accent-orange" />
                    Daily Streak
                  </h3>
                  <span className="text-2xl font-bold text-accent-orange">{progress.currentStreak} 🔥</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {getAllAchievementsWithStatus().slice(0, 4).map((badge) => (
                    <div
                      key={badge.id}
                      className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all ${
                        badge.earned 
                          ? "bg-gold/20 scale-100" 
                          : "bg-muted/50 opacity-50 grayscale"
                      }`}
                    >
                      <span className="text-2xl">{badge.emoji}</span>
                      <span className="text-[10px] text-muted-foreground mt-1 text-center leading-tight">
                        {badge.name}
                      </span>
                    </div>
                  ))}
                </div>
                
                <div className="bg-muted rounded-full h-3 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-accent-orange to-gold rounded-full transition-all duration-500"
                    style={{ width: `${getAchievementProgress().percentage}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  {getAchievementProgress().nextAchievement 
                    ? `Next: ${getAchievementProgress().nextAchievement?.name}`
                    : "All badges earned! 🎉"}
                </p>
              </CardContent>
            </Card>

            <Button 
              variant="outline" 
              size="lg"
              className="w-full rounded-kids"
              onClick={() => navigate("/analytics/kid")}
            >
              <Star className="w-5 h-5 mr-2" />
              See My Stars & Badges
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default KidHub;
