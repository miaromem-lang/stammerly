import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, BookOpen, Plus, ExternalLink, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';

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
    <div className="min-h-screen bg-gradient-to-br from-background via-emerald-500/5 to-primary/10">
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
