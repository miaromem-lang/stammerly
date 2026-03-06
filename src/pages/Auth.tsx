import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Clock, Rocket } from "lucide-react";
import PageBackground from "@/components/PageBackground";

const Auth = () => {
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
        <Card className="w-full max-w-md bg-card border shadow-xl text-center">
          <CardHeader className="pb-4">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Clock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Coming Soon</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground leading-relaxed">
              Stammerly is not yet open for user accounts. We're currently in our pre-launch phase, 
              building something truly special for children who stammer and the professionals who support them.
            </p>

            <div className="bg-muted/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 justify-center text-sm font-medium text-foreground">
                <Rocket className="w-4 h-4 text-primary" />
                <span>Want early access?</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Join our waiting list to be the first to know when Stammerly launches.
              </p>
            </div>

            <div className="space-y-3">
              <Button
                onClick={() => navigate("/")}
                className="w-full h-12 rounded-xl text-lg font-semibold"
                size="lg"
              >
                Join the Waiting List
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/product")}
                className="w-full h-12 rounded-xl"
              >
                Learn More About Stammerly
              </Button>
            </div>

            <p className="text-xs text-muted-foreground pt-2">
              Already on the waiting list? We'll email you as soon as access is available.
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Auth;
