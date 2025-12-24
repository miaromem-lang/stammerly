import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Mail, Lock, Smile, Users, GraduationCap, Stethoscope } from "lucide-react";
import PageBackground from "@/components/PageBackground";

const hubs = [
  { id: "kid", label: "Kid Hub", icon: Smile, emoji: "🎮" },
  { id: "parent", label: "Parent Hub", icon: Users, emoji: "👨‍👩‍👧" },
  { id: "teacher", label: "Teacher Hub", icon: GraduationCap, emoji: "📚" },
  { id: "therapist", label: "Therapist Hub", icon: Stethoscope, emoji: "🩺" },
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
    <div className="min-h-screen relative flex flex-col">
      <PageBackground />
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Stammerly</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-md bg-card border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-2xl">Sign In</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Select your hub and sign in to continue
            </p>
          </CardHeader>
          <CardContent>
            {/* Hub Selection */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              {hubs.map((hub) => {
                const Icon = hub.icon;
                const isSelected = selectedHub === hub.id;
                return (
                  <button
                    key={hub.id}
                    onClick={() => setSelectedHub(hub.id)}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      isSelected 
                        ? "border-primary bg-primary/10" 
                        : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-5 h-5" />
                      <span className="text-lg">{hub.emoji}</span>
                    </div>
                    <span className="text-sm font-medium">{hub.label}</span>
                  </button>
                );
              })}
            </div>

            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-11 h-12 rounded-xl"
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
                  className="pl-11 h-12 rounded-xl"
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full h-12 rounded-xl text-lg font-semibold" 
                size="lg"
                disabled={!selectedHub}
              >
                Sign In
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
      </main>
    </div>
  );
};

export default SignIn;
