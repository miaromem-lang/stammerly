import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Smile, Users, GraduationCap, Stethoscope } from "lucide-react";

const hubs = [
  {
    id: "kid",
    label: "Kid Hub",
    icon: Smile,
    color: "bg-accent-orange",
    description: "Fun games & activities",
  },
  {
    id: "parent",
    label: "Parent Hub",
    icon: Users,
    color: "gradient-navy",
    description: "Track progress at home",
  },
  {
    id: "teacher",
    label: "Teacher Hub",
    icon: GraduationCap,
    color: "gradient-navy",
    description: "Classroom support tools",
  },
  {
    id: "therapist",
    label: "Therapist Hub",
    icon: Stethoscope,
    color: "gradient-navy",
    description: "Clinical analytics",
  },
];

export const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-secondary/30" />
      <div className="absolute top-20 right-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl" />
      
      {/* Utility Bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Stammerly</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              <button onClick={() => navigate("/about")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">About</button>
              <button onClick={() => navigate("/ethics")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">Ethics & Privacy</button>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => navigate("/signin")}>
                Sign In
              </Button>
              <Button variant="navy" size="sm" onClick={() => navigate("/signin")}>
                Get Started
              </Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">The Circle of Support</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Empowering{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
              every voice
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            One platform connecting children, parents, teachers, and therapists.
          </p>
          
          <Button variant="hero" size="xl" onClick={() => navigate("/signin")}>
            Start 14-Day Pilot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        {/* Hub Cards - Bigger */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            const isKid = hub.id === "kid";

            return (
              <button
                key={hub.id}
                onClick={() => navigate("/signin")}
                className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 hover:scale-105 hover:shadow-2xl ${
                  isKid ? "rounded-kids bg-accent-orange text-primary-foreground" : "gradient-navy text-primary-foreground"
                }`}
              >
                <div className="inline-flex p-4 rounded-2xl mb-4 bg-primary-foreground/20">
                  <Icon className="w-10 h-10 text-primary-foreground" />
                </div>
                <h3 className="font-display font-bold text-2xl mb-2 text-primary-foreground">
                  {hub.label}
                </h3>
                <p className="text-sm text-primary-foreground/80">
                  {hub.description}
                </p>
                <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-primary-foreground/50 group-hover:text-primary-foreground group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
