import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Play, Star, Trophy, Target, Zap, MapPin, Flame } from "lucide-react";

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

const KidHub = () => {
  const navigate = useNavigate();

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
              <div className="w-10 h-10 rounded-full bg-accent-orange flex items-center justify-center text-2xl">
                🦦
              </div>
              <span className="font-display font-bold text-xl text-foreground">Echo's World</span>
            </div>
            <div className="flex items-center gap-2 bg-gold/20 px-4 py-2 rounded-full">
              <Star className="w-5 h-5 text-gold fill-gold" />
              <span className="font-bold text-foreground">127</span>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Banner with Echo */}
        <Card className="rounded-kids bg-gradient-to-r from-accent-orange to-gold text-primary-foreground mb-8 overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Hey there, Champion! 🎉</h1>
              <p className="text-primary-foreground/80">Ready for today's speech adventure?</p>
            </div>
            <div className="relative">
              <div className="text-6xl animate-bounce">🦦</div>
              {/* Floating gems around Echo */}
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

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quest Map - Main Feature */}
          <Card className="lg:col-span-2 rounded-kids overflow-hidden bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-accent-orange" />
                🗺️ The Quest Map
              </h2>
              
              <div className="relative">
                {/* Path visualization */}
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

          {/* Right Sidebar - Avatar & Rewards */}
          <div className="space-y-6">
            {/* Avatar Pod - Echo the Otter */}
            <Card className="rounded-kids text-center overflow-hidden bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  Echo the Otter 🦦
                </h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-sky to-accent-sky/60 flex items-center justify-center text-6xl animate-float">
                    🦦
                  </div>
                  {/* Floating gems */}
                  <div className="absolute -top-2 -right-2 text-2xl animate-bounce">💎</div>
                  <div className="absolute -bottom-1 -left-2 text-xl animate-bounce" style={{ animationDelay: "0.5s" }}>✨</div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your speech buddy is cheering you on!
                </p>
              </CardContent>
            </Card>

            {/* Reward Bar */}
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

            {/* View Progress Button */}
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