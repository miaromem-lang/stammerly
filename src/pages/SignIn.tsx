import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Users, GraduationCap, Stethoscope, Sparkles, ArrowLeft, Mail, Lock, Star } from "lucide-react";

const hubs = [
  {
    id: "kid",
    label: "Kid Hub",
    icon: Smile,
    color: "bg-gradient-to-br from-accent-orange to-amber-500 hover:from-accent-orange/90 hover:to-amber-500/90",
    description: "Fun games & activities to practice speech",
    emoji: "🎮",
  },
  {
    id: "parent",
    label: "Parent Hub",
    icon: Users,
    color: "bg-gradient-to-br from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90",
    description: "Track your child's progress at home",
    emoji: "👨‍👩‍👧",
  },
  {
    id: "teacher",
    label: "Teacher Hub",
    icon: GraduationCap,
    color: "bg-gradient-to-br from-success to-emerald-600 hover:from-success/90 hover:to-emerald-600/90",
    description: "Classroom support & IEP tools",
    emoji: "📚",
  },
  {
    id: "therapist",
    label: "Therapist Hub",
    icon: Stethoscope,
    color: "bg-gradient-to-br from-purple-500 to-violet-600 hover:from-purple-500/90 hover:to-violet-600/90",
    description: "Clinical analytics & session planning",
    emoji: "🩺",
  },
];

const SignIn = () => {
  const navigate = useNavigate();
  const [selectedHub, setSelectedHub] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedHub) {
      navigate(`/hub/${selectedHub}`);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent-orange/10 via-primary/5 to-success/10 flex flex-col relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-orange/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl" />
      
      {/* Floating Stars */}
      <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>⭐</div>
      <div className="absolute top-40 left-20 text-3xl animate-bounce" style={{ animationDelay: "0.5s" }}>✨</div>
      <div className="absolute bottom-40 right-40 text-4xl animate-bounce" style={{ animationDelay: "0.8s" }}>🌟</div>
      <div className="absolute bottom-20 left-40 text-3xl animate-bounce" style={{ animationDelay: "1.1s" }}>💫</div>

      {/* Header */}
      <header className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center shadow-lg">
              <Sparkles className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-2xl text-foreground">Stammerly</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-orange/20 to-primary/20 px-4 py-2 rounded-full mb-4">
            <Star className="w-4 h-4 text-accent-orange" />
            <span className="text-sm font-medium text-foreground">Welcome Back!</span>
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground text-center mb-2">
            Choose Your{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-orange via-primary to-success">
              Hub
            </span>
          </h1>
          <p className="text-muted-foreground text-center max-w-md mx-auto">
            Select your role to access personalized tools and features
          </p>
        </div>

        {/* Hub Selection Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-5xl mb-12">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            const isSelected = selectedHub === hub.id;
            const isKid = hub.id === "kid";

            return (
              <button
                key={hub.id}
                onClick={() => setSelectedHub(hub.id)}
                className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 ${
                  isKid ? "rounded-kids" : ""
                } ${hub.color} text-primary-foreground ${
                  isSelected
                    ? "shadow-2xl scale-105 ring-4 ring-white/30"
                    : "hover:shadow-xl hover:scale-[1.02]"
                }`}
              >
                {/* Shine effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-white/20 backdrop-blur-sm">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <span className="text-3xl">{hub.emoji}</span>
                  </div>
                  <h3 className="font-display font-bold text-xl mb-2 text-primary-foreground">
                    {hub.label}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    {hub.description}
                  </p>
                </div>
                
                {isSelected && (
                  <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-current" />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* Sign In Form */}
        {selectedHub && (
          <Card className="w-full max-w-md bg-card/80 backdrop-blur-xl border-2 border-primary/20 shadow-2xl animate-fade-in">
            <CardHeader className="text-center pb-2">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center">
                <span className="text-3xl">{hubs.find((h) => h.id === selectedHub)?.emoji}</span>
              </div>
              <CardTitle className="font-display text-xl">
                Sign in to {hubs.find((h) => h.id === selectedHub)?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-2 border-border focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 h-12 rounded-xl border-2 border-border focus:border-primary transition-colors"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full h-12 rounded-xl text-lg font-semibold bg-gradient-to-r from-primary to-accent-orange hover:from-primary/90 hover:to-accent-orange/90 shadow-lg hover:shadow-xl transition-all" 
                  size="lg"
                >
                  Sign In ✨
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Don't have an account?{" "}
                  <button type="button" className="text-primary hover:underline font-medium">
                    Start free trial
                  </button>
                </p>
              </form>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default SignIn;
