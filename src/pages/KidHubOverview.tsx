import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, MapPin, Star, Zap, Trophy, Target, BookOpen, Mic, Sparkles, Play, Eye } from "lucide-react";

const questLevels = [
  { id: 1, name: "Easy Start", completed: true, gems: 12, description: "Learn gentle voice beginnings" },
  { id: 2, name: "Sound Safari", completed: true, gems: 15, description: "Explore different sounds" },
  { id: 3, name: "Word Builder", completed: false, current: true, gems: 20, description: "Build words with confidence" },
  { id: 4, name: "Story Time", completed: false, gems: 25, description: "Read fun stories aloud" },
  { id: 5, name: "Chat Champion", completed: false, gems: 30, description: "Practice conversations" },
];

const practiceExercises = [
  { 
    id: 1, 
    title: "Easy Onset", 
    description: "Start words smoothly with gentle beginnings", 
    icon: "🌊", 
    difficulty: "Beginner",
    howToHelp: "Encourage your child to start words gently, like a whisper growing into speech. Model this by saying words softly yourself."
  },
  { 
    id: 2, 
    title: "Light Contact", 
    description: "Touch sounds gently like a feather", 
    icon: "🪶", 
    difficulty: "Beginner",
    howToHelp: "Help your child relax their mouth muscles. Practice 'feather-light' sounds together - barely touching lips for 'p' and 'b'."
  },
  { 
    id: 3, 
    title: "Slow & Steady", 
    description: "Practice calm, relaxed pacing", 
    icon: "🐢", 
    difficulty: "Intermediate",
    howToHelp: "Read books together at a slower pace. Use a 'turtle voice' game where everyone speaks slowly and deliberately."
  },
  { 
    id: 4, 
    title: "Phrase Power", 
    description: "Connect your words in smooth chains", 
    icon: "🔗", 
    difficulty: "Intermediate",
    howToHelp: "Practice linking words without pausing between them. Sing songs together - music naturally connects words smoothly."
  },
  { 
    id: 5, 
    title: "Story Reading", 
    description: "Read fun stories aloud with expression", 
    icon: "📖", 
    difficulty: "Advanced",
    howToHelp: "Take turns reading paragraphs. If your child blocks, wait patiently and avoid finishing words for them."
  },
  { 
    id: 6, 
    title: "Free Talk", 
    description: "Share thoughts and feelings!", 
    icon: "💬", 
    difficulty: "Advanced",
    howToHelp: "Create low-pressure conversation time. Ask open questions and give plenty of time to respond without interrupting."
  },
];

const KidHubOverview = () => {
  const navigate = useNavigate();
  const [selectedExercise, setSelectedExercise] = useState<number | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="bg-card border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/hub/parent")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back to Parent Hub</span>
            </button>
            <div className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-primary" />
              <span className="font-display font-bold text-xl text-foreground">Kid Hub Overview</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Info Banner */}
        <Card className="bg-primary/10 border-primary/30 mb-8">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <div className="text-4xl">👨‍👩‍👧</div>
              <div>
                <h2 className="font-display font-bold text-lg text-foreground mb-2">
                  Parent Guide to Kid Hub
                </h2>
                <p className="text-muted-foreground">
                  This overview shows you exactly what your child sees and practices in their Kid Hub. 
                  Use this to stay in the loop and support their speech journey at home.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Quest Map Overview */}
          <div>
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <MapPin className="w-5 h-5 text-accent-orange" />
                  🗺️ The Quest Map
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Your child progresses through these quests, earning gems and badges along the way:
                </p>
                
                {questLevels.map((level) => (
                  <div key={level.id} className="flex items-center gap-4 p-3 bg-secondary/30 rounded-lg">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold ${
                      level.completed 
                        ? "bg-success text-white" 
                        : level.current 
                          ? "bg-accent-orange text-white animate-pulse"
                          : "bg-muted text-muted-foreground"
                    }`}>
                      {level.completed ? "✓" : level.id}
                    </div>
                    <div className="flex-1">
                      <h4 className={`font-medium ${level.current ? "text-accent-orange" : "text-foreground"}`}>
                        {level.name}
                        {level.current && <span className="ml-2 text-xs bg-accent-orange/20 px-2 py-0.5 rounded-full">Current</span>}
                      </h4>
                      <p className="text-sm text-muted-foreground">{level.description}</p>
                    </div>
                    <div className="flex items-center gap-1 text-gold">
                      <Star className="w-4 h-4 fill-gold" />
                      <span className="text-sm font-medium">{level.gems}</span>
                    </div>
                  </div>
                ))}

                <div className="border-t border-border pt-4">
                  <h4 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    How Quests Work
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>• Each quest contains fun speech exercises</li>
                    <li>• Kids earn gems for completing exercises</li>
                    <li>• Progress unlocks new levels and badges</li>
                    <li>• AI provides gentle feedback and encouragement</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Daily Progress */}
            <Card className="glass-card-strong mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <Trophy className="w-5 h-5 text-gold" />
                  Daily Goals & Streaks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-success/10 rounded-lg">
                    <Zap className="w-6 h-6 text-success mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">5</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                  <div className="text-center p-3 bg-primary/10 rounded-lg">
                    <Trophy className="w-6 h-6 text-primary mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">3</p>
                    <p className="text-xs text-muted-foreground">Badges Today</p>
                  </div>
                  <div className="text-center p-3 bg-gold/10 rounded-lg">
                    <Target className="w-6 h-6 text-gold mx-auto mb-1" />
                    <p className="text-lg font-bold text-foreground">2/3</p>
                    <p className="text-xs text-muted-foreground">Goals Done</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">
                  <strong>Tip:</strong> Celebrate streaks together! Consistency is more important than perfection.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Practice Exercises Overview */}
          <div>
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <BookOpen className="w-5 h-5 text-primary" />
                  📚 Practice Exercises
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground mb-4">
                  Click on any exercise to see how you can help at home:
                </p>
                
                {practiceExercises.map((exercise) => (
                  <div key={exercise.id}>
                    <button
                      onClick={() => setSelectedExercise(selectedExercise === exercise.id ? null : exercise.id)}
                      className={`w-full p-4 rounded-lg text-left transition-all ${
                        selectedExercise === exercise.id 
                          ? "bg-primary/10 border border-primary/30" 
                          : "bg-secondary/30 hover:bg-secondary/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{exercise.icon}</span>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-foreground">{exercise.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded-full ${
                              exercise.difficulty === 'Beginner' ? 'bg-success/20 text-success' :
                              exercise.difficulty === 'Intermediate' ? 'bg-amber-500/20 text-amber-600' :
                              'bg-purple-500/20 text-purple-600'
                            }`}>
                              {exercise.difficulty}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground">{exercise.description}</p>
                        </div>
                        <Mic className="w-4 h-4 text-muted-foreground" />
                      </div>
                    </button>
                    
                    {selectedExercise === exercise.id && (
                      <div className="mt-2 p-4 bg-gold/10 border border-gold/30 rounded-lg">
                        <h5 className="font-medium text-foreground mb-2 flex items-center gap-2">
                          💡 How to Help at Home
                        </h5>
                        <p className="text-sm text-muted-foreground">{exercise.howToHelp}</p>
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Tips for Parents */}
            <Card className="glass-card-strong mt-6 border-gold/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-foreground">
                  💡 Tips for Parents
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span><strong>Be patient:</strong> Never rush or finish words for your child</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span><strong>Maintain eye contact:</strong> Show you're listening, not waiting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span><strong>Model slow speech:</strong> Speak calmly and slightly slower</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-success">✓</span>
                    <span><strong>Celebrate effort:</strong> Praise practice, not just fluency</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive">✗</span>
                    <span><strong>Avoid:</strong> "Slow down," "Think before you speak," or showing frustration</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button variant="navy" size="lg" onClick={() => navigate("/hub/parent")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Parent Dashboard
          </Button>
        </div>
      </main>
    </div>
  );
};

export default KidHubOverview;
