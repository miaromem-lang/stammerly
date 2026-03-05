import { Helmet } from "react-helmet-async";
import { Sparkles, Mail } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .insert({ email: email.toLowerCase().trim() });

      if (error) {
        if (error.code === "23505") {
          toast({
            title: "Already on the list! 😊",
            description: "This email is already registered. We'll be in touch soon!",
          });
        } else {
          throw error;
        }
      } else {
        toast({
          title: "You're on the list! 🎉",
          description: "We'll notify you when Stammerly launches.",
        });
      }
      setEmail("");
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Stammerly | Coming Soon - Speech Therapy Platform</title>
        <meta 
          name="description" 
          content="Stammerly is coming soon. A collaborative speech therapy platform empowering every voice through synchronised care. Join the waitlist to be notified at launch." 
        />
        <meta name="keywords" content="speech therapy, stammering, stuttering, coming soon, speech-language pathology" />
        <link rel="canonical" href="https://stammerly.com" />
        
        <meta property="og:title" content="Stammerly | Coming Soon" />
        <meta property="og:description" content="Empowering every voice through synchronised care. Join the waitlist!" />
        <meta property="og:type" content="website" />
      </Helmet>
      
      <main className="min-h-screen relative overflow-hidden flex items-center justify-center">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent-orange/10 to-success/5" />
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent-orange/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-success/10 rounded-full blur-3xl" />
        
        {/* Floating Elements */}
        <div className="absolute top-20 right-20 text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>⭐</div>
        <div className="absolute top-40 left-20 text-3xl animate-bounce" style={{ animationDelay: "0.5s" }}>✨</div>
        <div className="absolute bottom-40 right-40 text-4xl animate-bounce" style={{ animationDelay: "0.8s" }}>🌟</div>
        <div className="absolute bottom-20 left-40 text-3xl animate-bounce" style={{ animationDelay: "1.1s" }}>💫</div>
        
        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center">
          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-8">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center shadow-xl">
              <Sparkles className="w-8 h-8 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-4xl md:text-5xl text-foreground">Stammerly</span>
          </div>
          
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-orange/20 to-primary/20 px-5 py-2 rounded-full mb-8">
            <span className="text-sm font-medium text-foreground">🚀 Coming Soon</span>
          </div>
          
          {/* Main Heading */}
          <h1 className="font-display text-4xl md:text-6xl lg:text-7xl font-bold text-foreground leading-tight mb-6">
            Empowering every voice
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground mb-4 max-w-2xl mx-auto">
            through synchronised care
          </p>
          
          <p className="text-base md:text-lg text-muted-foreground mb-12 max-w-xl mx-auto">
            One platform connecting children, parents, teachers, and therapists for collaborative speech therapy.
          </p>
          
          {/* Waitlist Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-12">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-12 h-14 text-base rounded-xl border-2 border-border/50 focus:border-primary bg-background/80 backdrop-blur-sm"
                  required
                />
              </div>
              <Button 
                type="submit" 
                variant="hero" 
                size="xl"
                disabled={isSubmitting}
                className="rounded-xl"
              >
                {isSubmitting ? "Joining..." : "Join Waitlist"}
              </Button>
            </div>
          </form>

          {/* Survey CTA */}
          <div className="max-w-2xl mx-auto mb-12 bg-card/70 backdrop-blur-sm border border-border/30 rounded-2xl p-6 md:p-8 shadow-lg text-left">
            <h2 className="font-display text-lg md:text-xl font-bold text-foreground mb-3 text-center">
              Help us shape Stammerly 🗣️
            </h2>
            <p className="text-sm md:text-base text-muted-foreground mb-5 text-center">
              Parents &amp; Speech-Language Therapists — we're developing a device designed to transform home practice for children and automate clinical report writing for professionals. Please take 60 seconds to share your experiences and ensure this technology genuinely serves the stammering community.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <a
                href="https://forms.gle/b55nUZHSb6YQjLzq7"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="hero" size="lg" className="rounded-xl w-full sm:w-auto">
                  👨‍👩‍👧 Parent Survey
                </Button>
              </a>
              <a
                href="https://forms.gle/SCFfxH59Q4RiCRJz5"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="heroSecondary" size="lg" className="rounded-xl w-full sm:w-auto">
                  🩺 Therapist Survey
                </Button>
              </a>
            </div>
          </div>
          
          {/* Features Preview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { emoji: "🎮", label: "Kid Hub" },
              { emoji: "👨‍👩‍👧", label: "Parent Hub" },
              { emoji: "📚", label: "Teacher Hub" },
              { emoji: "🩺", label: "Therapist Hub" },
            ].map((item) => (
              <div 
                key={item.label}
                className="bg-card/60 backdrop-blur-sm border border-border/30 rounded-2xl p-4 shadow-lg"
              >
                <span className="text-3xl mb-2 block">{item.emoji}</span>
                <span className="text-sm font-medium text-muted-foreground">{item.label}</span>
              </div>
            ))}
          </div>
          
          {/* Footer */}
          <p className="mt-16 text-sm text-muted-foreground">
            © {new Date().getFullYear()} Stammerly. All rights reserved.
          </p>
        </div>
      </main>
    </>
  );
};

export default Index;
