import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Play, Star, Trophy, Target, Zap } from "lucide-react";

const activities = [
  { id: 1, name: "Easy Onset Quest", emoji: "🌊", unlocked: true, stars: 2 },
  { id: 2, name: "Slow Speech Safari", emoji: "🦁", unlocked: true, stars: 3 },
  { id: 3, name: "Breathing Bubbles", emoji: "🫧", unlocked: true, stars: 1 },
  { id: 4, name: "Word Mountain", emoji: "⛰️", unlocked: false, stars: 0 },
  { id: 5, name: "Sentence Stream", emoji: "🏞️", unlocked: false, stars: 0 },
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
        {/* Welcome Banner */}
        <Card className="rounded-kids bg-gradient-to-r from-accent-orange to-gold text-primary-foreground mb-8 overflow-hidden">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <h1 className="font-display text-3xl font-bold mb-2">Hey there, Champion! 🎉</h1>
              <p className="text-primary-foreground/80">Ready for today's speech adventure?</p>
            </div>
            <div className="text-6xl animate-bounce">🦦</div>
          </CardContent>
        </Card>

        {/* Daily Streak */}
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

        {/* Quest Map */}
        <h2 className="font-display text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
          <span>🗺️</span> Your Quest Map
        </h2>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {activities.map((activity, index) => (
            <Card 
              key={activity.id}
              className={`rounded-kids overflow-hidden transition-all duration-300 ${
                activity.unlocked 
                  ? "hover:scale-105 hover:shadow-xl cursor-pointer" 
                  : "opacity-50"
              }`}
              onClick={() => activity.unlocked && navigate("/practice")}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-5xl">{activity.emoji}</div>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((star) => (
                      <Star 
                        key={star}
                        className={`w-5 h-5 ${
                          star <= activity.stars 
                            ? "text-gold fill-gold" 
                            : "text-muted"
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <h3 className="font-display font-bold text-lg text-foreground mb-2">
                  {activity.name}
                </h3>
                {activity.unlocked ? (
                  <Button 
                    className="w-full rounded-kids bg-accent-orange hover:bg-accent-orange/90 text-primary-foreground"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate("/practice");
                    }}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Play Now!
                  </Button>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-muted-foreground py-2">
                    <span>🔒</span>
                    <span>Complete previous quest</span>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* My Progress Button */}
        <div className="mt-8 text-center">
          <Button 
            variant="outline" 
            size="lg"
            className="rounded-kids"
            onClick={() => navigate("/analytics/kid")}
          >
            <Star className="w-5 h-5 mr-2" />
            See My Stars & Badges
          </Button>
        </div>
      </main>
    </div>
  );
};

export default KidHub;
