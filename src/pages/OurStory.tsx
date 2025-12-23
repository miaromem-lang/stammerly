import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, GraduationCap, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const OurStory = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/5 to-primary/10">
      <Helmet>
        <title>Our Story | Stammerly - From UCL to Global Impact</title>
        <meta name="description" content="Discover how Stammerly began at UCL's SENDTech Challenge and won first place, aiming to transform support for children who stammer." />
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
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Our <span className="text-secondary">Story</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-secondary to-primary mx-auto rounded-full" />
          </div>

          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-r from-primary to-secondary p-6 text-primary-foreground">
              <div className="flex items-center gap-3">
                <GraduationCap className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Born at UCL</h2>
              </div>
            </div>
            <CardContent className="p-8">
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                The journey of Stammerly began at University College London (UCL) within the context of the SENDTech Challenge, a collaborative initiative between Edtech Access and the UCL Institute of Education and Faculty of Engineering. The challenge was designed to co-design inclusive EdTech solutions alongside learners and educators.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                We researched and saw that stammering is not only a speech challenge, but the true problem is not in the mouth; it is in the mind.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-8 border-none shadow-xl bg-gradient-to-br from-destructive/5 to-destructive/10">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">The Real Problem</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Stammering creates a profound emotional burden. People who stammer experience high levels of anxiety and embarrassment that persist across their lifespan. This leads to avoidance behaviours and, often, a <strong className="text-foreground">30% to 60% increased risk</strong> of feeling incompetent in academic and professional settings (Parsons et al., 2021).
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The real problem is a crisis of confidence and lack of available services. The current system fails to address this. Traditional interventions focus narrowly on symptomatic fluency (Mallick et al., 2021), and there is a dire lack of scalable, personalised tools that bridge the gap between the clinic and real life.
              </p>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Globe className="w-8 h-8 text-primary" />
                  <h3 className="text-xl font-bold text-foreground">Global Impact</h3>
                </div>
                <p className="text-3xl font-bold text-primary mb-2">Millions</p>
                <p className="text-muted-foreground">of children aged 4-12 with speech impediments worldwide</p>
              </CardContent>
            </Card>

            <Card className="border-none shadow-lg bg-gradient-to-br from-secondary/10 to-transparent">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-secondary" />
                  <h3 className="text-xl font-bold text-foreground">The Wait</h3>
                </div>
                <p className="text-3xl font-bold text-secondary mb-2">50,000+</p>
                <p className="text-muted-foreground">children waiting 12-18 months for professional help</p>
              </CardContent>
            </Card>
          </div>

          <Card className="mb-12 border-none shadow-xl bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border-2 border-amber-500/20">
            <CardContent className="p-8">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-16 h-16 bg-amber-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-foreground">First Place Winner</h3>
                  <p className="text-muted-foreground">SENDTech Challenge 2024</p>
                </div>
              </div>
              <p className="text-lg text-muted-foreground leading-relaxed">
                The project gained significant validation when it won first place in the SENDTech Challenge, highlighting its potential to transform how children who stammer are supported in educational and therapeutic settings.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/mission">Our Mission & Values</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/team">Meet the Team</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OurStory;
