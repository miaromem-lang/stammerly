import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Play, Star, Trophy, Target, Zap, MapPin, Flame, BookOpen, Mic, Sparkles, Settings } from "lucide-react";

const questLevels = [
  { id: 1, name: "Easy Start", completed: true, gems: 12 },
  { id: 2, name: "Sound Safari", completed: true, gems: 15 },
  { id: 3, name: "Word Builder", completed: false, current: true, gems: 20 },
  { id: 4, name: "Story Time", completed: false, gems: 25 },
  { id: 5, name: "Chat Champion", completed: false, gems: 30 },
];

const badges = [
  { id: 1, name: "First Words", emoji: "🌟", earned: true },
  { id: 2, name: "3 Day Streak", emoji: "🔥", earned: true },
  { id: 3, name: "Fluent Flow", emoji: "💎", earned: false },
  { id: 4, name: "Super Star", emoji: "⭐", earned: false },
];

const characters = [
  { id: "otter", name: "Echo the Otter", emoji: "🦦", color: "from-cyan-400 to-blue-500", personality: "playful and encouraging" },
  { id: "owl", name: "Luna the Owl", emoji: "🦉", color: "from-purple-400 to-indigo-500", personality: "wise and patient" },
  { id: "fox", name: "Finn the Fox", emoji: "🦊", color: "from-orange-400 to-red-500", personality: "clever and adventurous" },
  { id: "bunny", name: "Bella the Bunny", emoji: "🐰", color: "from-pink-400 to-rose-500", personality: "gentle and kind" },
  { id: "monkey", name: "Max the Monkey", emoji: "🐵", color: "from-amber-400 to-yellow-500", personality: "fun and silly" },
];

const practiceExercises = [
  { 
    id: 1, 
    title: "Easy Onset", 
    description: "Start words smoothly with gentle beginnings", 
    icon: "🌊", 
    difficulty: "Beginner",
    color: "from-blue-500/20 to-cyan-500/10",
    phrases: ["Hello, how are you?", "I like ice cream", "Open the door please"],
    teacherNote: "Focus on soft voice starts",
    aiEnabled: true,
    type: "practice"
  },
  { 
    id: 2, 
    title: "Light Contact", 
    description: "Touch sounds gently like a feather", 
    icon: "🪶", 
    difficulty: "Beginner",
    color: "from-green-500/20 to-emerald-500/10",
    phrases: ["Peter picked peppers", "Big brown bear", "Tiny tiger toes"],
    teacherNote: "Gentle articulator placement",
    aiEnabled: true,
    type: "practice"
  },
  { 
    id: 3, 
    title: "Slow & Steady", 
    description: "Practice calm, relaxed pacing", 
    icon: "🐢", 
    difficulty: "Intermediate",
    color: "from-amber-500/20 to-yellow-500/10",
    phrases: ["The lazy dog sleeps", "Walking through the park", "Reading my favourite book"],
    teacherNote: "Reduce speech rate naturally",
    aiEnabled: true,
    type: "practice"
  },
  { 
    id: 4, 
    title: "Phrase Power", 
    description: "Connect your words in smooth chains", 
    icon: "🔗", 
    difficulty: "Intermediate",
    color: "from-purple-500/20 to-pink-500/10",
    phrases: ["I want to go outside", "Can you help me please?", "My friend lives nearby"],
    teacherNote: "Link words without pausing",
    aiEnabled: true,
    type: "practice"
  },
  { 
    id: 5, 
    title: "Story Reading", 
    description: "Read fun stories aloud with expression", 
    icon: "📖", 
    difficulty: "Advanced",
    color: "from-rose-500/20 to-red-500/10",
    phrases: [],
    teacherNote: "Apply techniques to longer passages",
    aiEnabled: true,
    type: "story"
  },
  { 
    id: 6, 
    title: "Free Talk", 
    description: "Chat with your animal buddy!", 
    icon: "💬", 
    difficulty: "Advanced",
    color: "from-indigo-500/20 to-violet-500/10",
    phrases: [],
    teacherNote: "Transfer skills to spontaneous speech",
    aiEnabled: true,
    type: "chat"
  },
];

const KidHub = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'quests' | 'practice'>('quests');
  const [selectedCharacter, setSelectedCharacter] = useState(characters[0]);
  const [showCharacterPicker, setShowCharacterPicker] = useState(false);

  const handleExerciseClick = (exercise: typeof practiceExercises[0]) => {
    if (exercise.type === "story") {
      navigate(`/story-exercise?character=${selectedCharacter.emoji}`);
    } else if (exercise.type === "chat") {
      navigate(`/practice?mode=chat&character=${selectedCharacter.emoji}&characterName=${encodeURIComponent(selectedCharacter.name)}`);
    } else {
      navigate("/practice");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-orange/10 via-sky-blue/10 to-gold/10">
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
              <span className="font-bold text-foreground">127</span>
            </div>
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
                onClick={() => {
                  setSelectedCharacter(character);
                  setShowCharacterPicker(false);
                }}
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

        {/* Daily Streak & Stats */}
        <div className="flex items-center gap-4 mb-8 overflow-x-auto pb-2">
          <div className="flex items-center gap-2 bg-success/20 px-4 py-3 rounded-kids min-w-fit">
            <Zap className="w-6 h-6 text-success" />
            <span className="font-bold text-foreground">5 Day Streak! 🔥</span>
          </div>
          <div className="flex items-center gap-2 bg-primary/20 px-4 py-3 rounded-kids min-w-fit">
            <Trophy className="w-6 h-6 text-primary" />
            <span className="font-bold text-foreground">3 Badges Today</span>
          </div>
          <div className="flex items-center gap-2 bg-gold/20 px-4 py-3 rounded-kids min-w-fit">
            <Target className="w-6 h-6 text-gold" />
            <span className="font-bold text-foreground">2/3 Goals Done</span>
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
            Practice Exercises
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2">
            {activeTab === 'quests' ? (
              <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-accent-orange" />
                    🗺️ The Quest Map
                  </h2>
                  
                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-1 bg-accent-orange/20 rounded-full" />
                    
                    <div className="space-y-6">
                      {questLevels.map((level) => (
                        <div key={level.id} className="flex items-center gap-4 relative">
                          <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold transition-all duration-300 ${
                            level.completed 
                              ? "bg-success text-success-foreground shadow-lg" 
                              : level.current 
                                ? "bg-accent-orange text-primary-foreground shadow-xl scale-110 animate-pulse"
                                : "bg-muted text-muted-foreground"
                          }`}>
                            {level.completed ? "✓" : level.id}
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-display font-semibold ${
                              level.current ? "text-accent-orange" : "text-foreground"
                            }`}>
                              {level.name}
                            </h4>
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              <Star className="w-4 h-4 text-gold" />
                              {level.gems} gems
                            </div>
                          </div>
                          {level.current && (
                            <Button 
                              className="rounded-kids bg-accent-orange hover:bg-accent-orange/90 text-primary-foreground text-lg px-6 py-3 h-auto"
                              onClick={() => navigate("/practice")}
                            >
                              <Play className="w-5 h-5 mr-2" />
                              Play Now!
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
                <CardContent className="p-8">
                  <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                    <BookOpen className="w-6 h-6 text-primary" />
                    📚 Practice Exercises
                  </h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {practiceExercises.map((exercise) => (
                      <button
                        key={exercise.id}
                        onClick={() => handleExerciseClick(exercise)}
                        className={`p-4 rounded-kids bg-gradient-to-br ${exercise.color} border border-border/50 text-left transition-all hover:scale-[1.02] hover:shadow-lg group`}
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-3xl group-hover:scale-110 transition-transform">{exercise.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-display font-semibold text-foreground">{exercise.title}</h4>
                              {exercise.aiEnabled && (
                                <Sparkles className="w-4 h-4 text-primary" />
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mb-2">
                              {exercise.type === "chat" 
                                ? `Chat with ${selectedCharacter.name}!` 
                                : exercise.type === "story"
                                  ? "Create your own AI story!"
                                  : exercise.description
                              }
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                exercise.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                                exercise.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-600' :
                                'bg-purple-500/20 text-purple-600'
                              }`}>
                                {exercise.difficulty}
                              </span>
                              {exercise.type === "story" && (
                                <span className="text-xs px-2 py-1 rounded-full bg-accent-orange/20 text-accent-orange">
                                  ✨ AI Stories
                                </span>
                              )}
                              {exercise.type === "chat" && (
                                <span className="text-xs px-2 py-1 rounded-full bg-primary/20 text-primary">
                                  💬 Chat with {selectedCharacter.emoji}
                                </span>
                              )}
                            </div>
                            {exercise.type === "practice" && (
                              <p className="text-xs text-muted-foreground mt-2 italic">
                                📝 {exercise.teacherNote}
                              </p>
                            )}
                          </div>
                          <Play className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
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

            <Card className="rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-display text-lg font-bold text-foreground flex items-center gap-2">
                    <Flame className="w-5 h-5 text-accent-orange" />
                    Daily Streak
                  </h3>
                  <span className="text-2xl font-bold text-accent-orange">5 🔥</span>
                </div>
                
                <div className="grid grid-cols-4 gap-2 mb-4">
                  {badges.map((badge) => (
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
                    style={{ width: "65%" }}
                  />
                </div>
                <p className="text-xs text-muted-foreground text-center mt-2">
                  35 more gems to next badge!
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
