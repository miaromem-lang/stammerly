import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Trophy, Flame, Sparkles, MapPin } from "lucide-react";

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

export const KidsPlayground = () => {
  return (
    <section className="py-24 bg-accent-orange/5 relative overflow-hidden">
      {/* Playful background shapes */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-accent-orange/10 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent-sky/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-success/10 rounded-full blur-2xl" />
      </div>
      
      <div className="container mx-auto px-4 relative">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-accent-orange/10 text-accent-orange px-4 py-2 rounded-full mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="font-medium text-sm">Kids Zone</span>
          </div>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Mission Control: Practice Meets Play
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No time-limit stressors – just fun, rewarding practice at your own pace
          </p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Quest Map */}
          <Card variant="paper" className="lg:col-span-2 overflow-hidden">
            <CardContent className="p-8">
              <h3 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <MapPin className="w-6 h-6 text-accent-orange" />
                The Quest Map
              </h3>
              
              <div className="relative">
                {/* Path visualization */}
                <div className="absolute left-8 top-0 bottom-0 w-1 bg-accent-orange/20 rounded-full" />
                
                <div className="space-y-6">
                  {questLevels.map((level, index) => (
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
                        <Button variant="kids" size="kids">
                          Play Now!
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Avatar & Rewards */}
          <div className="space-y-6">
            {/* Avatar Pod */}
            <Card variant="paper" className="text-center overflow-hidden">
              <CardContent className="p-6">
                <h3 className="font-display text-lg font-bold text-foreground mb-4">
                  Echo the Otter
                </h3>
                <div className="relative w-32 h-32 mx-auto mb-4">
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-accent-sky to-accent-sky/60 flex items-center justify-center text-6xl animate-float">
                    🦦
                  </div>
                  {/* Floating gems */}
                  <div className="absolute -top-2 -right-2 text-2xl animate-badge-bounce">💎</div>
                  <div className="absolute -bottom-1 -left-2 text-xl animate-badge-bounce" style={{ animationDelay: "0.5s" }}>✨</div>
                </div>
                <p className="text-muted-foreground text-sm">
                  Your speech buddy is cheering you on!
                </p>
              </CardContent>
            </Card>
            
            {/* Reward Bar */}
            <Card variant="paper" className="overflow-hidden">
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
          </div>
        </div>
      </div>
    </section>
  );
};
