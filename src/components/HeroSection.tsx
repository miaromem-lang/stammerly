import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ArrowRight, Sparkles, Smile, Users, GraduationCap, Stethoscope, Star, Menu } from "lucide-react";

const navLinks = [
  { to: "/about", label: "About" },
  { to: "/our-story", label: "Our Story" },
  { to: "/mission", label: "Mission" },
  { to: "/research", label: "Research" },
  { to: "/privacy-policy", label: "Privacy" },
  { to: "/reviews", label: "Reviews" },
  { to: "/contact", label: "Contact" },
];

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

export const HeroSection = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleHubClick = (hubId: string) => {
    navigate("/signin");
  };

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      {/* Colorful Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/10 via-primary/5 to-success/10" />
      <div className="absolute top-20 left-10 w-72 h-72 bg-accent-orange/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl" />
      
      {/* Floating Stars */}
      <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>⭐</div>
      <div className="absolute top-40 left-20 text-3xl animate-bounce" style={{ animationDelay: "0.5s" }}>✨</div>
      <div className="absolute bottom-40 right-40 text-4xl animate-bounce" style={{ animationDelay: "0.8s" }}>🌟</div>
      <div className="absolute bottom-20 left-40 text-3xl animate-bounce" style={{ animationDelay: "1.1s" }}>💫</div>
      
      {/* Utility Bar */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-2xl text-foreground">Stammerly</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link 
                  key={link.to}
                  to={link.to} 
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="hidden md:inline-flex" onClick={() => navigate("/signin")}>
                Sign In
              </Button>
              <Button variant="orange" size="sm" className="hidden md:inline-flex" onClick={() => navigate("/")}>
                Join Parent Waitlist
              </Button>
              <Button variant="navy" size="sm" className="hidden md:inline-flex" onClick={() => navigate("/procurement")}>
                Request Clinic Pilot
              </Button>
              
              {/* Mobile Hamburger Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                    <span className="sr-only">Toggle menu</span>
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[280px] bg-background">
                  <div className="flex flex-col gap-6 mt-8">
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center">
                        <Sparkles className="w-4 h-4 text-primary-foreground" />
                      </div>
                      <span className="font-display font-bold text-lg text-foreground">Stammerly</span>
                    </div>
                    <nav className="flex flex-col gap-4">
                      {navLinks.map((link) => (
                        <Link 
                          key={link.to}
                          to={link.to} 
                          className="text-base text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>
                    <div className="flex flex-col gap-3 mt-4">
                      <Button variant="outline" onClick={() => { navigate("/signin"); setMobileMenuOpen(false); }}>
                        Sign In
                      </Button>
                      <Button variant="navy" onClick={() => { navigate("/signin"); setMobileMenuOpen(false); }}>
                        Get Started
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto px-4 pt-24 pb-12 relative z-10">
        {/* Hero Content */}
        <div className="text-center max-w-4xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-orange/20 to-primary/20 px-4 py-2 rounded-full mb-6">
            <Star className="w-4 h-4 text-accent-orange" />
            <span className="text-sm font-medium text-foreground">The Circle of Support</span>
          </div>
          
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-black leading-tight mb-6">
            Empowering every voice
          </h1>
          
          <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            One platform connecting children, parents, teachers, and therapists.
          </p>
          
          <Button variant="hero" size="xl" onClick={() => navigate("/signin")}>
            Start 14-Day Pilot
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
        
        {/* Hub Cards with colorful styling */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {hubs.map((hub) => {
            const Icon = hub.icon;
            const isKid = hub.id === "kid";

            return (
              <button
                key={hub.id}
                onClick={() => handleHubClick(hub.id)}
                className={`group relative overflow-hidden rounded-2xl p-8 text-left transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] ${hub.color} text-primary-foreground ${
                  isKid ? "rounded-kids" : ""
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
                  <h3 className="font-display font-bold text-2xl mb-2 text-primary-foreground">
                    {hub.label}
                  </h3>
                  <p className="text-sm text-primary-foreground/80">
                    {hub.description}
                  </p>
                </div>
                <ArrowRight className="absolute bottom-6 right-6 w-6 h-6 text-primary-foreground/50 group-hover:text-primary-foreground group-hover:translate-x-1 transition-all" />
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
