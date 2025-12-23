import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Target, Shield, Lightbulb, BookOpen, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const coreValues = [
  {
    icon: Heart,
    title: "Inclusivity by Design",
    description: "Ensuring technology is co-designed with neurodivergent learners and educators to address real-world accessibility gaps.",
    color: "from-pink-500/20 to-rose-500/10"
  },
  {
    icon: Shield,
    title: "Ethical Integration",
    description: "Prioritising the ethical use of learning analytics to protect student data while enhancing pedagogical outcomes.",
    color: "from-blue-500/20 to-cyan-500/10"
  },
  {
    icon: Lightbulb,
    title: "Empowerment",
    description: "Using AI not to replace human intervention, but to provide the tools that allow teachers to focus on creativity and critical thinking.",
    color: "from-amber-500/20 to-yellow-500/10"
  },
  {
    icon: BookOpen,
    title: "Evidence-Based Innovation",
    description: "Grounding every feature in rigorous academic research and proven pedagogical frameworks developed at leading institutions like UCL.",
    color: "from-emerald-500/20 to-green-500/10"
  }
];

const Mission = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <Helmet>
        <title>Our Mission | Stammerly - Empowering Children Through AI</title>
        <meta name="description" content="Discover Stammerly's mission to empower children with speech needs through human-centred AI and our core values of inclusivity, ethics, and empowerment." />
      </Helmet>

      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our <span className="text-primary">Mission</span> & Values
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
          </div>

          <Card className="mb-16 border-none shadow-2xl bg-gradient-to-br from-primary/10 via-card to-secondary/10 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl" />
            <CardContent className="p-8 md:p-12 relative">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center">
                  <Target className="w-8 h-8 text-primary" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-foreground">Mission Statement</h2>
              </div>
              <p className="text-xl md:text-2xl text-muted-foreground leading-relaxed italic">
                "To empower children with speech, language, and communication needs through human-centred AI, providing educators and therapists with the data-informed insights required to foster confidence, fluency, and authentic self-expression in every learner."
              </p>
            </CardContent>
          </Card>

          <div className="mb-12">
            <h2 className="text-3xl font-bold text-foreground text-center mb-8">Core Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {coreValues.map((value, index) => (
                <Card 
                  key={index} 
                  className={`border-none shadow-lg bg-gradient-to-br ${value.color} hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-background/50 rounded-xl flex items-center justify-center">
                        <value.icon className="w-6 h-6 text-primary" />
                      </div>
                      <CardTitle className="text-xl">{value.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">{value.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>


          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/privacy-policy">Privacy & Ethics</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/research">Our Research</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Mission;
