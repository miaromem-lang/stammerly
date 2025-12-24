import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Trophy, GraduationCap, Globe, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import PageBackground from "@/components/PageBackground";

const OurStory = () => {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
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
              Our <span className="text-primary text-5xl md:text-6xl">Story</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
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

          {/* The Psycho-Social Problem */}
          <Card className="mb-8 border-none shadow-xl bg-gradient-to-br from-destructive/5 to-destructive/10">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-4">The Psycho-Social and Systemic Gaps</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                The foundation of Stammerly is the evidence that stammering is a <strong className="text-foreground">complex neurodevelopmental communication disorder</strong> with a profound and often undertreated psychosocial burden, compounded by systemic gaps in service delivery (Connery et al., 2020; Etchell et al., 2017).
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                Stuttering is a disruption of speech flow (Ruzalina et al., 2023). However, the major impact is not solely the disfluency but the <strong className="text-foreground">chronic anxiety, shame, and low confidence</strong> that it generates (Parsons et al., 2021). The emotional burden is substantial, often leading to avoidance behaviours in both the workplace and school settings, where individuals actively minimise exposure to stressful speaking situations.
              </p>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Most working people who stammer report high levels of anxiety and shame, with many self-selecting into less verbally demanding roles (Parsons et al., 2021). Stammerly is designed to address this by moving beyond the functional, body-centred focus of many past interventions, which largely failed to address the acknowledged psychosocial complexity of the disorder (Mallick et al., 2021).
              </p>
            </CardContent>
          </Card>

          {/* Service Delivery Gap */}
          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <h3 className="text-2xl font-bold text-foreground mb-6">The Service Delivery Gap</h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-bold text-destructive">1</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Specialist Scarcity</h4>
                    <p className="text-muted-foreground">
                      The lack of sufficient specialist SLP support, coupled with the challenge of low SLP perceived competence in managing complex stuttering cases, highlights a major service gap (Alegre et al., 2025). The most significant gaps in the early years (0-5) remain in high-quality identification tools and scalable, universal or targeted interventions specifically for stammering (McKean et al., 2025).
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-bold text-destructive">2</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Low-Quality Evidence Base</h4>
                    <p className="text-muted-foreground">
                      Interventions for school-aged children are particularly limited in number, and the methodological quality of existing evidence is generally low due to a lack of control groups, blinding, and randomisation (Mallick et al., 2021). This has resulted in a historic focus on symptomatic fluency measures, which contrasts with the acknowledged complexity of the disorder.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="w-8 h-8 bg-destructive/20 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                    <span className="font-bold text-destructive">3</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground mb-2">Need for Carry-Over</h4>
                    <p className="text-muted-foreground">
                      Clients consistently express dissatisfaction with therapy that fails to meet their individual needs and a desire for ongoing support and help with the carry-over of skills from the therapy clinic to the real world (Hayhow et al., 2002).
                    </p>
                  </div>
                </div>
              </div>
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

            <Card className="border-none shadow-lg bg-gradient-to-br from-destructive/10 to-destructive/5 border-2 border-destructive/20">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Clock className="w-8 h-8 text-destructive" />
                  <h3 className="text-xl font-bold text-foreground">The Crisis</h3>
                </div>
                <p className="text-4xl md:text-5xl font-bold text-destructive mb-2">50,000+</p>
                <p className="text-lg font-medium text-foreground mb-1">Children on Waiting Lists</p>
                <p className="text-muted-foreground">Waiting 12-18 months for professional speech therapy help</p>
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
