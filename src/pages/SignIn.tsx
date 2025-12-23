import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Users, GraduationCap, Stethoscope, Sparkles, ArrowLeft, Mail, Lock } from "lucide-react";

const hubs = [
  {
    id: "kid",
    label: "Kid Hub",
    icon: Smile,
    color: "bg-accent-orange hover:bg-accent-orange/90",
    description: "Fun games & activities to practice speech",
  },
  {
    id: "parent",
    label: "Parent Hub",
    icon: Users,
    color: "gradient-navy hover:opacity-90",
    description: "Track your child's progress at home",
  },
  {
    id: "teacher",
    label: "Teacher Hub",
    icon: GraduationCap,
    color: "gradient-navy hover:opacity-90",
    description: "Classroom support & IEP tools",
  },
  {
    id: "therapist",
    label: "Therapist Hub",
    icon: Stethoscope,
    color: "gradient-navy hover:opacity-90",
    description: "Clinical analytics & session planning",
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30 flex flex-col">
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
          <div className="w-20" /> {/* Spacer */}
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex flex-col items-center justify-center">
        <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground text-center mb-2">
          Choose Your Hub
        </h1>
        <p className="text-muted-foreground text-center mb-10 max-w-md">
          Select your role to access the right tools and features
        </p>

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
                } ${
                  isSelected
                    ? isKid
                      ? "bg-accent-orange text-primary-foreground shadow-2xl scale-105 ring-4 ring-accent-orange/30"
                      : "gradient-navy text-primary-foreground shadow-2xl scale-105 ring-4 ring-primary/30"
                    : "bg-card hover:shadow-xl border-2 border-border hover:border-primary/30"
                }`}
              >
                <div
                  className={`inline-flex p-4 rounded-2xl mb-4 ${
                    isSelected
                      ? "bg-primary-foreground/20"
                      : isKid
                      ? "bg-accent-orange/10"
                      : "bg-primary/10"
                  }`}
                >
                  <Icon
                    className={`w-10 h-10 ${
                      isSelected
                        ? "text-primary-foreground"
                        : isKid
                        ? "text-accent-orange"
                        : "text-primary"
                    }`}
                  />
                </div>
                <h3
                  className={`font-display font-bold text-xl mb-2 ${
                    isSelected ? "text-primary-foreground" : "text-foreground"
                  }`}
                >
                  {hub.label}
                </h3>
                <p
                  className={`text-sm ${
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}
                >
                  {hub.description}
                </p>
              </button>
            );
          })}
        </div>

        {/* Sign In Form */}
        {selectedHub && (
          <Card className="w-full max-w-md glass-card-strong animate-fade-in">
            <CardHeader>
              <CardTitle className="font-display text-xl text-center">
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
                    className="pl-11"
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
                    className="pl-11"
                    required
                  />
                </div>
                <Button type="submit" variant="navy" className="w-full" size="lg">
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
        )}
      </main>
    </div>
  );
};

export default SignIn;
