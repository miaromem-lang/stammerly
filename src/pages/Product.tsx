import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Sparkles, Home, Stethoscope, BarChart3, FileText, Shield, Users, Zap, ArrowRight, Monitor, Smartphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

const Product = () => {
  return (
    <>
      <Helmet>
        <title>Stammerly | Product &amp; Pricing</title>
        <meta
          name="description"
          content="Discover Stammerly's speech therapy platform. Hardware + app for families at £89 + £4.99/mo, or clinical software for professionals at £9.99/mo per clinician."
        />
        <link rel="canonical" href="https://stammerly.com/product" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-accent-orange/10 to-success/5" />
          <div className="absolute top-10 right-20 w-72 h-72 bg-accent-orange/15 rounded-full blur-3xl" />
          <div className="absolute bottom-10 left-10 w-96 h-96 bg-primary/15 rounded-full blur-3xl" />

          <div className="relative z-10 container mx-auto px-4 text-center">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent-orange flex items-center justify-center shadow-lg">
                <Sparkles className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-3xl text-foreground">Stammerly</span>
            </div>

            <div className="inline-flex items-center gap-2 bg-success/15 px-4 py-1.5 rounded-full mb-6">
              <span className="text-sm font-medium text-foreground">🎉 Thanks for joining the waitlist!</span>
            </div>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-4">
              Here's what's coming
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              One platform connecting children, parents, teachers, and therapists — powered by Hybrid Intelligence.
            </p>
          </div>
        </section>

        {/* For Parents (D2C) */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-accent-orange/15 text-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  👨‍👩‍👧 For Families
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Practice at home, progress everywhere
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  A purpose-built device and companion app that makes daily speech practice engaging for children and effortless for parents.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: Monitor, text: "Stammerly Device — fun, guided practice sessions" },
                    { icon: Smartphone, text: "Parent Dashboard — track progress in real-time" },
                    { icon: BarChart3, text: "AI-powered insights — see what's working" },
                    { icon: Users, text: "Circle of Support — connected with your child's therapist" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-accent-orange/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-accent-orange" />
                      </div>
                      <span className="text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Card variant="glass" className="p-8 text-center">
                <div className="mb-6">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Family Plan</span>
                </div>
                <div className="mb-2">
                  <span className="font-display text-5xl font-bold text-foreground">£89</span>
                  <span className="text-muted-foreground ml-2">one-time</span>
                </div>
                <p className="text-sm text-muted-foreground mb-1">Stammerly Device</p>
                <div className="flex items-center justify-center gap-1 mb-6">
                  <span className="text-2xl font-bold text-foreground">+ £4.99</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-8">App subscription</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    "Unlimited daily practice sessions",
                    "Progress tracking & weekly reports",
                    "Parent dashboard with AI insights",
                    "Connected to your child's therapist",
                    "Video tips & technique guides",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="text-success">✓</span> {item}
                    </li>
                  ))}
                </ul>

                <a href="https://forms.gle/b55nUZHSb6YQjLzq7" target="_blank" rel="noopener noreferrer">
                  <Button variant="hero" size="lg" className="w-full rounded-xl">
                    Take the Parent Survey <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </Card>
            </div>
          </div>
        </section>

        {/* For Professionals (B2B) */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-background to-secondary/30">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <Card variant="glass" className="p-8 text-center order-2 lg:order-1">
                <div className="mb-6">
                  <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Professional Plan</span>
                </div>
                <div className="mb-2">
                  <span className="font-display text-5xl font-bold text-foreground">£9.99</span>
                  <span className="text-muted-foreground ml-2">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mb-8">per clinician</p>

                <ul className="text-left space-y-3 mb-8">
                  {[
                    "AI-powered clinical analytics dashboard",
                    "Automated SOAP note generation",
                    "Phoneme trigger heatmaps",
                    "Predictive relapse risk alerts",
                    "NHS DTAC & GDPR compliant",
                    "Multi-client caseload management",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                      <span className="text-success">✓</span> {item}
                    </li>
                  ))}
                </ul>

                <a href="https://forms.gle/SCFfxH59Q4RiCRJz5" target="_blank" rel="noopener noreferrer">
                  <Button variant="heroSecondary" size="lg" className="w-full rounded-xl">
                    Take the Therapist Survey <ArrowRight className="w-4 h-4" />
                  </Button>
                </a>
              </Card>

              <div className="order-1 lg:order-2">
                <span className="inline-flex items-center gap-2 bg-primary/10 text-foreground px-4 py-1.5 rounded-full text-sm font-medium mb-4">
                  🩺 For Professionals
                </span>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                  Clinical intelligence, automated
                </h2>
                <p className="text-muted-foreground text-lg mb-8">
                  Save hours on admin. Stammerly analyses practice sessions and generates clinical reports so you can focus on therapy.
                </p>

                <div className="space-y-4 mb-8">
                  {[
                    { icon: FileText, text: "SOAP notes generated from session data" },
                    { icon: BarChart3, text: "Clinical metrics: WSS, %SS, SPM, and more" },
                    { icon: Zap, text: "Predictive analytics for relapse prevention" },
                    { icon: Shield, text: "NHS DTAC compliant — built for the UK" },
                  ].map((item) => (
                    <div key={item.text} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <item.icon className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-foreground">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works — Circle of Support */}
        <section className="py-16 md:py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              The Circle of Support
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-12">
              Stammerly synchronises everyone around the child — creating a unified, consistent approach to speech therapy.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {[
                { emoji: "🎮", role: "Child", desc: "Fun daily practice on the device" },
                { emoji: "👨‍👩‍👧", role: "Parent", desc: "Track progress & log context" },
                { emoji: "📚", role: "Teacher", desc: "Report classroom victories" },
                { emoji: "🩺", role: "Therapist", desc: "AI-assisted clinical oversight" },
              ].map((item) => (
                <Card key={item.role} variant="bento" className="p-6">
                  <CardContent className="p-0 text-center">
                    <span className="text-4xl mb-3 block">{item.emoji}</span>
                    <h3 className="font-display font-bold text-foreground mb-1">{item.role}</h3>
                    <p className="text-sm text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Hybrid Intelligence Callout */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-background to-secondary/30">
          <div className="container mx-auto px-4">
            <Card variant="dark" className="p-8 md:p-12 text-center max-w-3xl mx-auto">
              <h2 className="font-display text-2xl md:text-3xl font-bold mb-4">
                Built on Hybrid Intelligence
              </h2>
              <p className="text-background/70 mb-6 max-w-xl mx-auto">
                Stammerly combines AI analysis with human clinical expertise — ensuring technology supports, never replaces, the therapist.
              </p>
              <Link to="/research">
                <Button variant="glass" size="lg" className="rounded-xl">
                  Read our Research Framework <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </Card>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Product;
