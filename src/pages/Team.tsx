import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Linkedin, Mail, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import PageBackground from "@/components/PageBackground";

const founders = [
  {
    name: "Mia Romem",
    role: "Founder",
    email: "mia@stammerly.com",
    image: null,
    bio: "MA in Education and Technology. Passionate about aligning technology with human-centred teaching practices to transform speech therapy support for children.",
  },
];

const Team = () => {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Helmet>
        <title>Meet the Team | Stammerly</title>
        <meta name="description" content="Meet Mia Romem, founder of Stammerly, transforming support for children who stammer." />
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
              Meet the <span className="text-primary">Team</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              The passionate founder behind Stammerly, dedicated to transforming speech therapy support for children.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-6" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {cofounders.map((founder, index) => (
              <Card key={index} className="border-none shadow-xl bg-card/80 backdrop-blur-sm overflow-hidden">
                {/* Profile Image Placeholder */}
                <div className="h-64 bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                  <div className="w-32 h-32 bg-primary/30 rounded-full flex items-center justify-center">
                    <span className="text-4xl font-bold text-primary">
                      {founder.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                </div>
                
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold text-foreground mb-1">{founder.name}</h2>
                  <p className="text-primary font-medium mb-4">{founder.role}</p>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <a 
                      href={`mailto:${founder.email}`}
                      className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
                    >
                      <Mail className="w-4 h-4" />
                      <span className="text-sm">{founder.email}</span>
                    </a>
                  </div>


                  {/* Bio Text Area - Empty for now */}
                  <div className="mt-6">
                    <label className="text-sm font-medium text-foreground mb-2 block">About</label>
                    <Textarea 
                      placeholder="Bio coming soon..."
                      className="resize-none bg-muted/50"
                      rows={4}
                      value={founder.bio}
                      readOnly
                    />
                  </div>

                  <div className="flex gap-3 mt-6">
                    <Button variant="outline" size="sm" className="rounded-full gap-2" disabled>
                      <Linkedin className="w-4 h-4" />
                      LinkedIn
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>


          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/contact">Get in Touch</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/our-story">Read Our Story</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Team;
