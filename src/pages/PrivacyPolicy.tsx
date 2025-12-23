import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Lock, Trash2, Eye, Database, UserCheck, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useState } from 'react';
import { toast } from 'sonner';

const PrivacyPolicy = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRequest = () => {
    setIsDeleting(true);
    setTimeout(() => {
      setIsDeleting(false);
      toast.success("Data deletion request submitted. You will receive confirmation within 48 hours.");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-blue-500/5 to-primary/10">
      <Helmet>
        <title>Privacy Policy & Ethical AI | Stammerly</title>
        <meta name="description" content="Learn about Stammerly's HIPAA/GDPR-compliant data practices, ethical AI disclosure, and how we protect your voice data." />
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
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
              <Shield className="w-5 h-5" />
              <span className="font-medium">HIPAA & GDPR Compliant</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Ethical AI & <span className="text-primary">Data Privacy</span>
            </h1>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full" />
          </div>

          {/* AI Disclosure Block */}
          <Card className="mb-8 border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <Eye className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Ethical AI Disclosure</CardTitle>
                  <p className="text-muted-foreground">Transparency in how we use AI</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-background/50 rounded-xl">
                  <Database className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Data Collection</h4>
                  <p className="text-sm text-muted-foreground">Voice recordings are processed locally when possible. Only anonymised speech patterns are stored for analysis.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <Lock className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Data Storage</h4>
                  <p className="text-sm text-muted-foreground">All data is encrypted at rest and in transit using AES-256 encryption. Stored in GDPR-compliant EU data centres.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <UserCheck className="w-8 h-8 text-primary mb-3" />
                  <h4 className="font-semibold text-foreground mb-2">Anonymisation</h4>
                  <p className="text-sm text-muted-foreground">Personal identifiers are stripped from all voice data. AI models never see names, faces, or identifying information.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Secure Communication */}
          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-secondary/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-secondary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Secure Therapist Communication</CardTitle>
                  <p className="text-muted-foreground">HIPAA/GDPR-compliant messaging</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Our platform includes a secure, encrypted chat thread that connects parents, educators, and therapists. All communications are:
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  End-to-end encrypted
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Audit-logged for compliance
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Accessible only to authorised care team members
                </li>
                <li className="flex items-center gap-2 text-muted-foreground">
                  <div className="w-2 h-2 bg-primary rounded-full" />
                  Stored with automatic retention policies
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Data Deletion */}
          <Card className="mb-8 border-2 border-destructive/20 shadow-xl bg-gradient-to-br from-destructive/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-destructive/20 rounded-xl flex items-center justify-center">
                  <Trash2 className="w-7 h-7 text-destructive" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Delete Your Data</CardTitle>
                  <p className="text-muted-foreground">Exercise your right to be forgotten</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-start gap-4 p-4 bg-amber-500/10 rounded-xl mb-6">
                <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-foreground mb-1">Important Notice</h4>
                  <p className="text-sm text-muted-foreground">
                    Deleting your data is permanent and cannot be undone. This includes all voice recordings, progress data, and analytics associated with your account.
                  </p>
                </div>
              </div>
              <p className="text-muted-foreground mb-6">
                Under GDPR and other privacy regulations, you have the right to request complete deletion of all your personal data, including voice recordings and speech analysis results. Click below to initiate a deletion request.
              </p>
              <Button 
                variant="destructive" 
                size="lg" 
                onClick={handleDeleteRequest}
                disabled={isDeleting}
                className="rounded-full"
              >
                {isDeleting ? "Processing..." : "Request Data Deletion"}
              </Button>
            </CardContent>
          </Card>

          {/* Compliance Badges */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {['HIPAA', 'GDPR', 'COPPA', 'SOC 2'].map((badge) => (
              <div 
                key={badge}
                className="px-6 py-3 bg-card border border-border rounded-full shadow-md"
              >
                <span className="font-semibold text-foreground">{badge} Compliant</span>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/contact">Contact Us</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/ethics">Full Ethics Policy</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default PrivacyPolicy;
