import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, MapPin, Clock, Wrench, Stethoscope, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useState } from 'react';
import { toast } from 'sonner';
import PageBackground from "@/components/PageBackground";
import LiveChatWidget from "@/components/LiveChatWidget";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (formType: string) => (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(`${formType} enquiry sent! We'll respond within 24 hours.`);
    }, 1200);
  };

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Helmet>
        <title>Contact Us | Stammerly</title>
        <meta name="description" content="Get in touch with Stammerly for technical support, clinical questions, or press and investment enquiries." />
      </Helmet>

      <header className="container mx-auto px-4 py-6">
        <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back to Home</span>
        </Link>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Contact <span className="text-primary">Us</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose the right channel so we can route your enquiry to the right team member.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Routed Forms */}
            <div className="lg:col-span-2">
              <Tabs defaultValue="technical" className="w-full">
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="technical" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Wrench className="w-3.5 h-3.5" /> Technical
                  </TabsTrigger>
                  <TabsTrigger value="clinical" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Stethoscope className="w-3.5 h-3.5" /> Clinical
                  </TabsTrigger>
                  <TabsTrigger value="press" className="flex items-center gap-1.5 text-xs sm:text-sm">
                    <Briefcase className="w-3.5 h-3.5" /> Press / Invest
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="technical">
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-accent-orange" /> Technical Support
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit("Technical support")} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input placeholder="Your name" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="you@email.com" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Issue Type</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Select issue type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="pendant">Pendant / Hardware</SelectItem>
                              <SelectItem value="app">App / Software</SelectItem>
                              <SelectItem value="account">Account / Login</SelectItem>
                              <SelectItem value="data">Data / Privacy</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Description</Label>
                          <Textarea placeholder="Describe the issue…" rows={4} required />
                        </div>
                        <Button type="submit" variant="hero" className="w-full rounded-xl" disabled={isSubmitting}>
                          {isSubmitting ? "Sending…" : "Submit Technical Enquiry"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="clinical">
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Stethoscope className="w-5 h-5 text-primary" /> Clinical Questions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit("Clinical")} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input placeholder="Your name" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Email</Label>
                            <Input type="email" placeholder="you@email.com" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Your Role</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Select your role" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="slt">Speech & Language Therapist</SelectItem>
                              <SelectItem value="parent">Parent / Carer</SelectItem>
                              <SelectItem value="teacher">Teacher / SENCO</SelectItem>
                              <SelectItem value="researcher">Researcher</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Question</Label>
                          <Textarea placeholder="Your clinical question…" rows={4} required />
                        </div>
                        <Button type="submit" variant="hero" className="w-full rounded-xl" disabled={isSubmitting}>
                          {isSubmitting ? "Sending…" : "Submit Clinical Enquiry"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="press">
                  <Card variant="glass">
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="w-5 h-5 text-success" /> Press & Investment
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <form onSubmit={handleSubmit("Press/Investment")} className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>Name</Label>
                            <Input placeholder="Your name" required />
                          </div>
                          <div className="space-y-2">
                            <Label>Organisation</Label>
                            <Input placeholder="Company / Publication" required />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Email</Label>
                          <Input type="email" placeholder="you@email.com" required />
                        </div>
                        <div className="space-y-2">
                          <Label>Enquiry Type</Label>
                          <Select>
                            <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="press">Press / Media</SelectItem>
                              <SelectItem value="investment">Investment</SelectItem>
                              <SelectItem value="partnership">Strategic Partnership</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>Message</Label>
                          <Textarea placeholder="Tell us more…" rows={4} required />
                        </div>
                        <Button type="submit" variant="hero" className="w-full rounded-xl" disabled={isSubmitting}>
                          {isSubmitting ? "Sending…" : "Submit Enquiry"}
                        </Button>
                      </form>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="space-y-4">
              <Card className="border-none shadow-lg bg-gradient-to-br from-primary/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Email Directly</h3>
                      <a href="mailto:mia@stammerly.com" className="text-sm text-primary hover:underline">mia@stammerly.com</a>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-secondary/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-secondary/20 rounded-xl flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-secondary-foreground" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Location</h3>
                      <p className="text-sm text-muted-foreground">University College London<br />Gower Street, London WC1E 6BT</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-none shadow-lg bg-gradient-to-br from-success/10 to-transparent">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-success/20 rounded-xl flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Response Time</h3>
                      <p className="text-sm text-muted-foreground">Within 24 hours on business days.</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <LiveChatWidget />
    </div>
  );
};

export default Contact;
