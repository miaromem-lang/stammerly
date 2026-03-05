import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Accessibility, CheckCircle, AlertTriangle, Mail, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import PageBackground from "@/components/PageBackground";

const AccessibilityStatement = () => {
  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Helmet>
        <title>Accessibility Statement | Stammerly</title>
        <meta name="description" content="Stammerly's accessibility statement outlining our WCAG 2.2 AA compliance status and commitment to inclusive design." />
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
              <Accessibility className="w-5 h-5" />
              <span className="font-medium">WCAG 2.2 AA</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Accessibility <span className="text-primary">Statement</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Stammerly is committed to ensuring digital accessibility for all users, including children with disabilities, their parents, teachers, and therapists.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-6" />
          </div>

          {/* Scope */}
          <Card className="mb-8 border-2 border-primary/20 shadow-xl bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-primary/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl">About This Statement</CardTitle>
                  <p className="text-muted-foreground">Scope and compliance standard</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This accessibility statement applies to the Stammerly web application at <strong className="text-foreground">stammerly.lovable.app</strong>.
              </p>
              <p className="text-muted-foreground">
                This website is run by Stammerly. We want as many people as possible to be able to use this website. For example, that means you should be able to:
              </p>
              <ul className="space-y-2">
                {[
                  "Navigate most of the website using a keyboard",
                  "Navigate most of the website using a screen reader",
                  "Use the website with browser text resizing up to 200%",
                  "Understand the content without relying on colour alone",
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <p className="text-muted-foreground">
                We've also made the website text as simple as possible to understand, particularly in our <Link to="/childrens-privacy" className="text-primary hover:underline">Children's Privacy Notice</Link> which uses age-appropriate language.
              </p>
            </CardContent>
          </Card>

          {/* Compliance Status */}
          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-orange/20 rounded-xl flex items-center justify-center">
                  <Accessibility className="w-7 h-7 text-accent-orange" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Compliance Status</CardTitle>
                  <p className="text-muted-foreground">WCAG 2.2 Level AA</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                This website is <strong className="text-foreground">partially compliant</strong> with the <a href="https://www.w3.org/TR/WCAG22/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Web Content Accessibility Guidelines version 2.2</a> AA standard, due to the non-compliances listed below.
              </p>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-sm text-muted-foreground">
                  We are working towards full WCAG 2.2 AA compliance as part of our commitment to serving NHS trusts, local authorities, and public sector education providers who require supplier accessibility conformance.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Non-Accessible Content */}
          <Card className="mb-8 border-2 border-accent-orange/20 shadow-xl bg-gradient-to-br from-accent-orange/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-orange/20 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-7 h-7 text-accent-orange" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Non-Accessible Content</CardTitle>
                  <p className="text-muted-foreground">Known limitations and our plan to fix them</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">The content listed below is non-accessible for the following reasons:</p>
              
              <div className="space-y-4">
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Voice Recording Exercises</h4>
                  <p className="text-sm text-muted-foreground mb-1">Speech practice exercises require microphone input and audio playback. We are investigating alternative input methods and ensuring all controls are keyboard-accessible.</p>
                  <p className="text-xs text-muted-foreground italic">WCAG criteria: 1.2.1 (Audio-only and Video-only), 2.1.1 (Keyboard)</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Charts and Data Visualisations</h4>
                  <p className="text-sm text-muted-foreground mb-1">Some analytics charts and progress graphs may not be fully accessible to screen reader users. We are adding text-based alternatives and ARIA labels to all data visualisations.</p>
                  <p className="text-xs text-muted-foreground italic">WCAG criteria: 1.1.1 (Non-text Content), 1.3.1 (Info and Relationships)</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">Colour Contrast in Gamification Elements</h4>
                  <p className="text-sm text-muted-foreground mb-1">Some decorative gamification elements (stars, gems, achievement badges) may not meet the minimum contrast ratio of 4.5:1 in all themes. We are reviewing and remediating these.</p>
                  <p className="text-xs text-muted-foreground italic">WCAG criteria: 1.4.3 (Contrast Minimum)</p>
                </div>
                <div className="p-4 bg-background/50 rounded-xl">
                  <h4 className="font-semibold text-foreground mb-2">PDF Report Exports</h4>
                  <p className="text-sm text-muted-foreground mb-1">PDF reports generated from session data may not be fully tagged for screen reader navigation. We are working to ensure all exported documents meet PDF/UA standards.</p>
                  <p className="text-xs text-muted-foreground italic">WCAG criteria: 4.1.2 (Name, Role, Value)</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* What We're Doing */}
          <Card className="mb-8 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-success/20 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-7 h-7 text-success" />
                </div>
                <div>
                  <CardTitle className="text-2xl">What We're Doing to Improve</CardTitle>
                  <p className="text-muted-foreground">Our accessibility roadmap</p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {[
                  "Conducting a full WCAG 2.2 AA audit with an independent accessibility consultancy",
                  "Adding ARIA landmarks, labels, and live regions throughout the application",
                  "Ensuring all interactive elements are fully keyboard-navigable",
                  "Providing text alternatives for all non-text content including charts",
                  "Testing with assistive technologies including NVDA, JAWS, and VoiceOver",
                  "Including users with disabilities in our user research programme",
                  "Training our development team on inclusive design principles",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <CheckCircle className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Contact for Accessibility */}
          <Card className="mb-8 border-2 border-accent-sky/30 shadow-xl bg-gradient-to-br from-accent-sky/5 to-transparent">
            <CardHeader>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-accent-sky/20 rounded-xl flex items-center justify-center">
                  <Mail className="w-7 h-7 text-accent-sky" />
                </div>
                <div>
                  <CardTitle className="text-2xl">Requesting Alternative Formats</CardTitle>
                  <p className="text-muted-foreground">We're here to help</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                If you need information from this website in a different format — for example, large print, easy read, audio recording, or braille — please contact us:
              </p>
              <div className="p-4 bg-background/50 rounded-xl">
                <p className="text-foreground font-medium mb-1">Mia Romem — Founder</p>
                <p className="text-muted-foreground text-sm mb-1">Email: <a href="mailto:mia@stammerly.com" className="text-primary hover:underline">mia@stammerly.com</a></p>
                <p className="text-sm text-muted-foreground mt-3">We'll consider your request and aim to respond within 10 working days.</p>
              </div>
            </CardContent>
          </Card>

          {/* Enforcement */}
          <Card className="mb-12 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl">Enforcement Procedure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                The Equality and Human Rights Commission (EHRC) is responsible for enforcing the Public Sector Bodies (Websites and Mobile Applications) (No. 2) Accessibility Regulations 2018 (the 'accessibility regulations').
              </p>
              <p className="text-muted-foreground">
                If you're not happy with how we respond to your complaint, contact the <a href="https://www.equalityadvisoryservice.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Equality Advisory and Support Service (EASS)</a>.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-4 justify-center">
            <Button asChild size="lg" className="rounded-full">
              <Link to="/privacy-policy">Privacy Policy</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/nhs-compliance">NHS Compliance</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full">
              <Link to="/contact">Contact Us</Link>
            </Button>
          </div>

          <p className="text-center text-sm text-muted-foreground mt-8">
            This statement was prepared on March 2026. It was last reviewed on March 2026.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AccessibilityStatement;
