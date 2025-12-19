import { useState } from "react";
import { Button } from "@/components/ui/button";
import { RoleSwitcher } from "@/components/RoleSwitcher";
import { Play, ArrowRight, Sparkles } from "lucide-react";

export const HeroSection = () => {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const scrollToSection = (role: string) => {
    setSelectedRole(role);
    const sectionMap: Record<string, string> = {
      kid: "kids-section",
      parent: "parent-section",
      teacher: "teacher-section",
      therapist: "therapist-section",
    };
    const element = document.getElementById(sectionMap[role]);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

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
              <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-muted-foreground hover:text-foreground transition-colors">How It Works</a>
              <a href="#pricing" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <a href="#research" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Research</a>
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm">Sign In</Button>
              <Button variant="navy" size="sm">Get Started</Button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 items-center">
          {/* Left Content - 60% */}
          <div className="lg:col-span-3">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Sparkles className="w-4 h-4" />
              <span className="text-sm font-medium">The Circle of Support</span>
            </div>
            
            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
              Empowering{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">
                every voice
              </span>{" "}
              through synchronised care
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-xl">
              One platform connecting children, parents, teachers, and therapists for 
              consistent, evidence-based speech therapy support.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-12">
              <Button variant="hero" size="xl">
                Start 14-Day Pilot
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="heroSecondary" size="xl">
                <Play className="w-5 h-5 mr-2" />
                Watch Our Ethics Story
              </Button>
            </div>
            
            {/* Stats */}
            <div className="flex gap-8">
              <div>
                <p className="text-3xl font-display font-bold text-foreground">10,000+</p>
                <p className="text-sm text-muted-foreground">Children Supported</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-foreground">98%</p>
                <p className="text-sm text-muted-foreground">Parent Satisfaction</p>
              </div>
              <div>
                <p className="text-3xl font-display font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Schools</p>
              </div>
            </div>
          </div>
          
          {/* Right Content - Dashboard Mockup - 40% */}
          <div className="lg:col-span-2 relative">
            <div className="relative animate-float">
              {/* Tablet Frame */}
              <div className="bg-foreground rounded-3xl p-3 shadow-2xl">
                <div className="bg-card rounded-2xl overflow-hidden aspect-[4/3]">
                  {/* Mock Dashboard */}
                  <div className="p-4 h-full">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-full bg-accent-orange flex items-center justify-center text-lg">
                        🦦
                      </div>
                      <div>
                        <p className="text-xs font-medium text-foreground">Echo's Progress</p>
                        <p className="text-[10px] text-muted-foreground">Today's Goals</p>
                      </div>
                    </div>
                    
                    {/* Progress bars */}
                    <div className="space-y-3 mb-4">
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Easy Onset</span>
                          <span className="text-success">85%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[85%] bg-success rounded-full" />
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between text-[10px] mb-1">
                          <span className="text-muted-foreground">Daily Streak</span>
                          <span className="text-accent-orange">5 days</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div className="h-full w-[70%] bg-accent-orange rounded-full" />
                        </div>
                      </div>
                    </div>
                    
                    {/* Mini chart */}
                    <div className="bg-secondary/50 rounded-lg p-3">
                      <p className="text-[10px] text-muted-foreground mb-2">Weekly SPM</p>
                      <div className="flex items-end gap-1 h-12">
                        {[40, 55, 45, 60, 70, 65, 80].map((h, i) => (
                          <div 
                            key={i} 
                            className="flex-1 bg-primary rounded-t"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Floating elements */}
              <div className="absolute -top-4 -right-4 bg-success text-success-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg animate-bounce">
                +12% this week!
              </div>
              <div className="absolute -bottom-4 -left-4 bg-card border shadow-lg px-4 py-2 rounded-full text-sm">
                🔔 New badge earned!
              </div>
            </div>
          </div>
        </div>
        
        {/* Role Switcher */}
        <RoleSwitcher onRoleSelect={scrollToSection} selectedRole={selectedRole || undefined} />
      </div>
    </section>
  );
};
