import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sparkles, ArrowLeft, Rocket } from "lucide-react";
import PageBackground from "@/components/PageBackground";

const WaitlistThankYou = () => {
  const navigate = useNavigate();

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
        <div className="max-w-md text-center space-y-8">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-orange to-primary flex items-center justify-center">
            <Rocket className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Main Message */}
          <div className="space-y-4">
            <h1 className="font-display text-4xl font-bold text-foreground">
              Big Things Coming Soon
            </h1>
            <p className="text-lg text-muted-foreground">
              Thank you for joining the waitlist! We're building something special and can't wait to share it with you.
            </p>
          </div>

          {/* Status */}
          <div className="bg-primary/5 rounded-2xl p-6 space-y-3">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-sm font-medium text-foreground">You're on the list</span>
            </div>
            <p className="text-sm text-muted-foreground">
              We'll email you as soon as Stammerly is ready for early access.
            </p>
          </div>

          {/* CTA */}
          <Button
            onClick={() => navigate("/")}
            className="w-full h-12 rounded-xl text-lg font-semibold"
            size="lg"
          >
            Return to Home
          </Button>
        </div>
      </main>
    </div>
  );
};

export default WaitlistThankYou;
