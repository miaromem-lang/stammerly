import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Shield, Baby, UserCheck, Lock, MessageCircle, Trash2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageBackground from "@/components/PageBackground";

const ChildrensPrivacy = () => {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Helmet>
        <title>Children's Privacy Notice | Stammerly</title>
        <meta name="description" content="Stammerly's Children's Code privacy notice — written in clear, age-appropriate language explaining how we look after your data." />
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
          {/* Hero */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary mb-6">
              <Baby className="w-5 h-5" />
              <span className="font-medium">ICO Children's Code Compliant</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Your Privacy, <span className="text-primary">Explained Simply</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              This notice is written so that children and young people can understand how we look after their information. It follows the UK Information Commissioner's Office Age Appropriate Design Code (Children's Code).
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-6" />
          </div>

          {/* For Young People Section */}
          <Card className="mb-8 border-2 border-accent-sky/30 shadow-xl bg-gradient-to-br from-accent-sky/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-sky/20 rounded-xl flex items-center justify-center">
                  <MessageCircle className="w-7 h-7 text-accent-sky" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Hey! 👋 This bit is for you</CardTitle>
                  <p className="text-muted-foreground">If you're a child or young person using Stammerly</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground text-lg">
                Stammerly helps you practise your speech in a fun and safe way. Here's what you need to know:
              </p>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🎙️</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">Your voice recordings</strong> — When you do speech exercises, we listen to your voice to help you improve. We don't share your recordings with anyone who isn't on your care team (like your therapist or parent).</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🔒</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">Your information is safe</strong> — We keep your name, your progress, and your voice data locked up safely so only the right people can see it.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🤖</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">Our AI helper</strong> — We use clever computer tools to spot patterns in your speech. But a real person (your therapist) always makes the important decisions — not the computer.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🗑️</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">You can ask us to delete it</strong> — If you (or your parent/guardian) want us to remove your data, just ask and we will. No questions asked.</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">🚫</span>
                  <span className="text-muted-foreground"><strong className="text-foreground">We never sell your data</strong> — We will never, ever sell your information to anyone. That's a promise.</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Parental Consent */}
          <Card className="mb-8 border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <UserCheck className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Parental Consent</CardTitle>
                  <p className="text-muted-foreground">How we obtain and verify consent for children under 13</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                In accordance with UK GDPR Article 8 and the ICO Children's Code, we require verifiable parental or guardian consent before any child under the age of 13 can use Stammerly. Here is how our consent process works:
              </p>
              <div className="space-y-4">
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">1. Account Creation by a Parent or Guardian</h4>
                  <p className="text-sm text-muted-foreground">
                    A parent or legal guardian must create the child's account. Children cannot sign up independently. The parent provides their own verified email address and explicitly consents to the child's use of the platform.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">2. Consent Confirmation</h4>
                  <p className="text-sm text-muted-foreground">
                    During registration, the parent or guardian must actively confirm (not pre-ticked) that they have read this Children's Privacy Notice and our main Privacy Policy, and that they consent to the processing of their child's speech data for therapeutic purposes.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">3. Withdrawal of Consent</h4>
                  <p className="text-sm text-muted-foreground">
                    Parents may withdraw consent at any time by contacting us at <a href="mailto:mia@stammerly.com" className="text-primary hover:underline">mia@stammerly.com</a>. Upon withdrawal, all of the child's personal data, including voice recordings and progress data, will be deleted within 30 days.
                  </p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">4. Children Aged 13–17</h4>
                  <p className="text-sm text-muted-foreground">
                    Young people aged 13 and over may create their own account, but we strongly recommend parental involvement. We apply the same high privacy standards regardless of age.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What Data We Collect */}
          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-orange/20 rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-accent-orange" />
                </div>
                <div>
                  <CardTitle className="text-2xl">What Information We Collect</CardTitle>
                  <p className="text-muted-foreground">Only what's needed to help your child</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Account Information</h4>
                  <p className="text-sm text-muted-foreground">First name (or nickname), email address of the parent/guardian, and the user's chosen role (Kid or Parent).</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Speech & Practice Data</h4>
                  <p className="text-sm text-muted-foreground">Voice recordings during exercises, fluency scores, disfluency patterns, and practice session progress. This is Category 1 (sensitive) health data.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Engagement Data</h4>
                  <p className="text-sm text-muted-foreground">Stars earned, gems collected, streaks, and quest progress — used to keep practice fun and motivating.</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">What We Don't Collect</h4>
                  <p className="text-sm text-muted-foreground">We do not collect location data, browsing history, social media profiles, photos, or any data not directly needed for speech therapy support.</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Protection Principles */}
          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-success/20 rounded-xl flex items-center justify-center">
                  <Lock className="w-7 h-7 text-success" />
                </div>
                <div>
                  <CardTitle className="text-2xl">How We Protect Your Data</CardTitle>
                  <p className="text-muted-foreground">Children's Code design principles we follow</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  { title: "Best interests of the child", desc: "Every design decision considers the child's wellbeing first. We never use dark patterns, nudge techniques, or manipulative design." },
                  { title: "Data minimisation", desc: "We only collect what's strictly necessary for speech therapy support. Nothing more." },
                  { title: "Privacy by default", desc: "All accounts are set to the highest privacy settings by default. Data sharing is opt-in, never opt-out." },
                  { title: "No profiling", desc: "We do not profile children for marketing or advertising purposes. AI analysis is used solely for therapeutic benefit." },
                  { title: "No detrimental use", desc: "Data is never used in ways that could be harmful or detrimental to the child's physical or mental health." },
                  { title: "Transparency", desc: "This notice is written in plain, age-appropriate language. We don't hide important information in legal jargon." },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
                    <div className="w-2 h-2 bg-success rounded-full mt-2 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-foreground">{item.title}</span>
                      <span className="text-muted-foreground"> — {item.desc}</span>
                    </div>
                  </li>
                ))}
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
                  <CardTitle className="text-2xl">Your Rights</CardTitle>
                  <p className="text-muted-foreground">What you (or your parent) can ask us to do</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-muted-foreground">Under UK GDPR, you and your parent or guardian have the right to:</p>
              <ul className="space-y-2">
                {[
                  "See all the data we hold about you (Subject Access Request)",
                  "Ask us to correct any mistakes in your data",
                  "Ask us to delete all your data (Right to Erasure)",
                  "Ask us to stop processing your data",
                  "Move your data to another service (Data Portability)",
                  "Complain to the Information Commissioner's Office if you're unhappy",
                ].map((right, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
                    {right}
                  </li>
                ))}
              </ul>
              <div className="p-4 rounded-lg bg-gold/10 border border-gold/30 mt-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-gold mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-muted-foreground">
                    To exercise any of these rights, please email <a href="mailto:mia@stammerly.com" className="text-primary hover:underline">mia@stammerly.com</a>. We will respond within 30 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact & DPO */}
          <Card className="mb-12 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8 text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">Questions About This Notice?</h3>
              <p className="text-muted-foreground mb-4">
                If you're a child, young person, parent or guardian and have any questions about how we use your data, please get in touch:
              </p>
              <p className="text-muted-foreground mb-1"><strong className="text-foreground">Mia Romem</strong> — Founder & Data Protection Contact</p>
              <a href="mailto:mia@stammerly.com" className="text-primary hover:underline">mia@stammerly.com</a>
              <p className="text-sm text-muted-foreground mt-6">
                You can also complain to the <a href="https://ico.org.uk/make-a-complaint/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Information Commissioner's Office (ICO)</a> if you are not happy with how we handle your data.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/privacy-policy">Full Privacy Policy</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            Last updated: March 2026. This notice is reviewed at least annually.
          </p>
        </div>
      </main>
    </div>
  );
};

export default ChildrensPrivacy;
