import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Sparkles, Heart, Users, Target, Award } from "lucide-react";
import { Helmet } from "react-helmet-async";

const About = () => {
  const navigate = useNavigate();

  return (
    <>
      <Helmet>
        <title>About Stammerly | Our Mission & Story</title>
        <meta name="description" content="Learn about Stammerly's mission to empower every voice through synchronized care. A platform connecting children, parents, teachers, and therapists." />
      </Helmet>
      
      <div className="min-h-screen bg-white">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">Stammerly</span>
              </div>
              <div className="w-20" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">About Us</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-6">
              Empowering Every Voice
            </h1>
            <p className="text-xl text-muted-foreground">
              Stammerly was founded with a simple belief: every child deserves to communicate 
              with confidence, supported by a seamless circle of care.
            </p>
          </div>

          {/* Mission Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Our Mission</h3>
                <p className="text-muted-foreground text-sm">
                  To provide accessible, evidence-based speech therapy support through 
                  technology that connects families, educators, and clinicians.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-accent-orange/10 flex items-center justify-center mx-auto mb-4">
                  <Users className="w-7 h-7 text-accent-orange" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">The Circle of Care</h3>
                <p className="text-muted-foreground text-sm">
                  Four perspectives, one unified platform. Kids practice, parents support, 
                  teachers observe, therapists guide – all in sync.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card/80 backdrop-blur-sm md:col-span-2 lg:col-span-1">
              <CardContent className="p-6 text-center">
                <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Award className="w-7 h-7 text-success" />
                </div>
                <h3 className="font-display font-bold text-lg mb-2">Evidence-Based</h3>
                <p className="text-muted-foreground text-sm">
                  Built on proven speech therapy techniques including Lidcombe and 
                  easy onset methods, adapted for engaging digital practice.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Team/Founder Section */}
          <Card className="max-w-3xl mx-auto bg-card/80 backdrop-blur-sm mb-16">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h2 className="font-display text-2xl font-bold text-foreground mb-2">
                  Built by Those Who Understand
                </h2>
                <p className="text-muted-foreground">
                  Our team combines expertise in speech-language pathology, child psychology, 
                  and technology to create meaningful tools for fluency development.
                </p>
              </div>
              <div className="flex justify-center gap-4">
                <Button variant="navy" onClick={() => navigate("/signin")}>
                  Start Your Journey
                </Button>
                <Button variant="outline" onClick={() => navigate("/ethics")}>
                  Our Ethics
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Links */}
          <div className="text-center">
            <p className="text-muted-foreground mb-4">Learn more about how we protect your data</p>
            <div className="flex justify-center gap-4">
              <Button variant="link" onClick={() => navigate("/ethics")}>
                Privacy & Ethics →
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
};

export default About;