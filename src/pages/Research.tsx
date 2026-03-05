import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, ExternalLink, Calendar, Users, Brain, GraduationCap, Handshake, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import PageBackground from "@/components/PageBackground";

interface ResearchItem {
  id: string;
  title: string;
  authors: string;
  year: string;
  journal: string;
  link?: string;
  summary: string;
}

const initialResearch: ResearchItem[] = [
  {
    id: '1',
    title: 'The psychological impact of stammering on academic performance',
    authors: 'Parsons, S., et al.',
    year: '2021',
    journal: 'Journal of Fluency Disorders',
    summary: 'Research showing 30-60% increased risk of feeling incompetent in academic and professional settings for people who stammer.',
  },
  {
    id: '2',
    title: 'Traditional interventions and symptomatic fluency approaches',
    authors: 'Mallick, R., et al.',
    year: '2021',
    journal: 'Speech and Language Therapy Review',
    summary: 'Analysis of how traditional interventions focus narrowly on symptomatic fluency rather than holistic support.',
  },
  {
    id: '3',
    title: 'Co-designing inclusive EdTech solutions with neurodivergent learners',
    authors: 'UCL Institute of Education',
    year: '2024',
    journal: 'SENDTech Challenge Research Papers',
    summary: 'Framework for developing technology alongside learners and educators to address real accessibility gaps.',
  },
];

const Research = () => {
  const [research] = useState<ResearchItem[]>(initialResearch);

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Helmet>
        <title>Academic Research | Stammerly</title>
        <meta name="description" content="Explore the academic research and evidence base behind Stammerly's approach to supporting children who stammer." />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-full text-emerald-600 mb-6">
              <BookOpen className="w-5 h-5" />
              <span className="font-medium">Evidence-Based Approach</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Academic <span className="text-primary">Research</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Every feature in Stammerly is grounded in rigorous academic research and proven pedagogical frameworks.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-6" />
          </div>

          {/* Hybrid Intelligence Framework */}
          <Card className="mb-10 border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-transparent overflow-hidden">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">The Hybrid Intelligence Framework</CardTitle>
                  <p className="text-muted-foreground">Human expertise + AI insight = better outcomes</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <p className="text-muted-foreground text-lg leading-relaxed">
                Stammerly is built on a <strong className="text-foreground">Hybrid Intelligence</strong> model — the principle that the most effective outcomes in speech therapy arise not from AI alone, nor from human judgement alone, but from the deliberate combination of both. This framework is rooted in Mia Romem's active research at <strong className="text-foreground">University College London (UCL)</strong>, where she is completing an <strong className="text-foreground">MA in Education and Technology</strong> at the Institute of Education, investigating how AI can augment — rather than automate — pedagogical decision-making.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-5 bg-background/50 rounded-xl">
                  <div className="w-10 h-10 bg-accent-sky/20 rounded-lg flex items-center justify-center mb-3">
                    <Brain className="w-5 h-5 text-accent-sky" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">AI Does</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Detects disfluency patterns at scale</li>
                    <li>• Tracks longitudinal progress metrics</li>
                    <li>• Identifies phoneme triggers and trends</li>
                    <li>• Suggests evidence-based exercises</li>
                  </ul>
                </div>
                <div className="p-5 bg-background/50 rounded-xl">
                  <div className="w-10 h-10 bg-success/20 rounded-lg flex items-center justify-center mb-3">
                    <Handshake className="w-5 h-5 text-success" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Together They</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Cross-validate recommendations</li>
                    <li>• Present both perspectives transparently</li>
                    <li>• Empower families to choose their path</li>
                    <li>• Create a feedback loop that improves both</li>
                  </ul>
                </div>
                <div className="p-5 bg-background/50 rounded-xl">
                  <div className="w-10 h-10 bg-accent-orange/20 rounded-lg flex items-center justify-center mb-3">
                    <ShieldCheck className="w-5 h-5 text-accent-orange" />
                  </div>
                  <h4 className="font-semibold text-foreground mb-2">Clinicians Do</h4>
                  <ul className="text-sm text-muted-foreground space-y-1.5">
                    <li>• Make all clinical diagnoses</li>
                    <li>• Interpret data in context</li>
                    <li>• Apply empathy and professional judgement</li>
                    <li>• Decide treatment direction</li>
                  </ul>
                </div>
              </div>

              <div className="p-5 bg-primary/5 rounded-xl border border-primary/10">
                <h4 className="font-semibold text-foreground mb-2">Collaborative Recommendations in Practice</h4>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  When a therapist assigns a quest or exercise, Stammerly's AI independently validates the recommendation — it may agree, suggest an alternative, or flag a concern. Both perspectives are presented transparently to the family, who can weigh clinical expertise alongside data-driven insight and choose the path that feels right for their child. This is Hybrid Intelligence in action: neither AI nor clinician is overruled; both inform the decision, and the family retains agency.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Founder's Academic Background */}
          <Card className="mb-10 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-orange/20 rounded-xl flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-accent-orange" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Academic Foundation</CardTitle>
                  <p className="text-muted-foreground">Rigorous research driving responsible innovation</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground leading-relaxed">
                Stammerly's pedagogical architecture is shaped by <strong className="text-foreground">Mia Romem's</strong> ongoing research at <strong className="text-foreground">UCL's Institute of Education</strong>, where her MA in Education and Technology investigates the responsible integration of AI into educational practice. Her work focuses on a central question: <em className="text-foreground">how can artificial intelligence amplify teacher and therapist effectiveness without undermining the human relationships that drive real learning?</em>
              </p>
              <p className="text-muted-foreground leading-relaxed">
                This academic grounding ensures that Stammerly is not simply a technology product — it is a pedagogical tool designed from first principles to respect clinical expertise, prioritise child wellbeing, and support the professional autonomy of speech and language therapists. Every feature is evaluated against the standard: <em className="text-foreground">does this empower the educator, or does it attempt to replace them?</em>
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                <div className="px-4 py-2 bg-background/50 rounded-full text-sm font-medium text-foreground">UCL Institute of Education</div>
                <div className="px-4 py-2 bg-background/50 rounded-full text-sm font-medium text-foreground">MA Education & Technology</div>
                <div className="px-4 py-2 bg-background/50 rounded-full text-sm font-medium text-foreground">SENDTech Challenge Winner</div>
                <div className="px-4 py-2 bg-background/50 rounded-full text-sm font-medium text-foreground">Human-Centred AI</div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Add Button - Placeholder for future functionality */}
          <Card className="mb-8 border-dashed border-2 border-primary/30 bg-primary/5">
            <CardContent className="p-6 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-foreground mb-1">Admin: Add Research</h3>
                <p className="text-sm text-muted-foreground">Add new research papers to the library (admin access required)</p>
              </div>
              <Button variant="outline" className="rounded-full gap-2" disabled>
                <Plus className="w-4 h-4" />
                Add Research
              </Button>
            </CardContent>
          </Card>

          {/* Research List */}
          <div className="space-y-6 mb-12">
            {research.map((item) => (
              <Card key={item.id} className="border-none shadow-lg hover:shadow-xl transition-shadow bg-card/80 backdrop-blur-sm">
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl mb-2 leading-tight">{item.title}</CardTitle>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {item.authors}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          {item.year}
                        </span>
                      </div>
                    </div>
                    {item.link && (
                      <Button variant="ghost" size="sm" className="rounded-full" asChild>
                        <a href={item.link} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4" />
                        </a>
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-primary/80 mb-3 font-medium">{item.journal}</p>
                  <p className="text-muted-foreground">{item.summary}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* UCL Partnership */}
          <Card className="mb-12 border-none shadow-xl bg-gradient-to-r from-primary/10 to-secondary/10">
            <CardContent className="p-8 text-center">
              <h3 className="text-2xl font-bold text-foreground mb-4">In Partnership with UCL</h3>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Stammerly was developed in collaboration with University College London's Institute of Education and Faculty of Engineering, ensuring our approach is backed by world-class academic expertise.
              </p>
              <div className="flex justify-center gap-4">
                <div className="px-6 py-3 bg-card rounded-full shadow-md">
                  <span className="font-semibold text-foreground">UCL Institute of Education</span>
                </div>
                <div className="px-6 py-3 bg-card rounded-full shadow-md">
                  <span className="font-semibold text-foreground">UCL Engineering</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/our-story">Our Story</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/contact">Contact for Collaboration</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Research;
