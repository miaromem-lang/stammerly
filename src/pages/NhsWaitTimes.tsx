import { Helmet } from "react-helmet-async";
import { Link, useParams, Navigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Clock, MapPin, TrendingUp, AlertTriangle, Mail, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RegionData {
  name: string;
  slug: string;
  avgWaitWeeks: number;
  childrenWaiting: string;
  nhsTrusts: string[];
  stats: { label: string; value: string }[];
  description: string;
  seoTitle: string;
  seoDesc: string;
}

const regions: Record<string, RegionData> = {
  london: {
    name: "London",
    slug: "london",
    avgWaitWeeks: 52,
    childrenWaiting: "8,200+",
    nhsTrusts: ["Great Ormond Street Hospital", "Evelina London Children's Hospital", "Royal Free London"],
    stats: [
      { label: "Average referral-to-treatment", value: "52 weeks" },
      { label: "Children on waiting lists", value: "8,200+" },
      { label: "SLT vacancies (London)", value: "34%" },
      { label: "Schools without SLT access", value: "1 in 3" },
    ],
    description: "London faces some of the longest speech therapy waiting times in England. With over 8,200 children waiting for specialist support and an average referral-to-treatment time of 52 weeks, many families are left without professional guidance during critical developmental windows.",
    seoTitle: "Speech Therapy Wait Times in London | Stammerly",
    seoDesc: "London NHS speech therapy waiting lists average 52 weeks. Discover how Stammerly provides immediate, clinician-designed support while your child waits.",
  },
  "west-midlands": {
    name: "West Midlands",
    slug: "west-midlands",
    avgWaitWeeks: 44,
    childrenWaiting: "5,100+",
    nhsTrusts: ["Birmingham Children's Hospital", "University Hospitals Coventry", "The Dudley Group"],
    stats: [
      { label: "Average referral-to-treatment", value: "44 weeks" },
      { label: "Children on waiting lists", value: "5,100+" },
      { label: "SLT vacancies (region)", value: "29%" },
      { label: "Post-pandemic backlog increase", value: "+62%" },
    ],
    description: "The West Midlands has seen a 62% increase in speech therapy referrals since the pandemic, with waiting lists now averaging 44 weeks. Birmingham and surrounding areas face acute shortages of specialist paediatric speech and language therapists.",
    seoTitle: "Speech Therapy Wait Times in West Midlands | Stammerly",
    seoDesc: "West Midlands NHS speech therapy waiting lists average 44 weeks. Learn how Stammerly bridges the gap with AI-powered home practice.",
  },
  "north-west": {
    name: "North West England",
    slug: "north-west",
    avgWaitWeeks: 48,
    childrenWaiting: "6,800+",
    nhsTrusts: ["Alder Hey Children's Hospital", "Royal Manchester Children's Hospital", "Lancashire Teaching Hospitals"],
    stats: [
      { label: "Average referral-to-treatment", value: "48 weeks" },
      { label: "Children on waiting lists", value: "6,800+" },
      { label: "Community SLT caseload avg.", value: "85 children" },
      { label: "Discharge before completion", value: "1 in 4" },
    ],
    description: "Across Greater Manchester, Lancashire, and Merseyside, over 6,800 children are waiting for speech therapy. High caseloads mean therapists often have less than 30 minutes per child per session, and one in four children are discharged before completing their treatment programme.",
    seoTitle: "Speech Therapy Wait Times in North West England | Stammerly",
    seoDesc: "North West England NHS speech therapy waits average 48 weeks. See how Stammerly supports children during the gap between referral and treatment.",
  },
  "south-east": {
    name: "South East England",
    slug: "south-east",
    avgWaitWeeks: 40,
    childrenWaiting: "4,500+",
    nhsTrusts: ["Oxford University Hospitals", "Brighton and Sussex", "East Kent Hospitals"],
    stats: [
      { label: "Average referral-to-treatment", value: "40 weeks" },
      { label: "Children on waiting lists", value: "4,500+" },
      { label: "Rural access gap", value: "45 min avg. travel" },
      { label: "Virtual sessions offered", value: "Only 18% of trusts" },
    ],
    description: "The South East faces unique challenges with rural access gaps. Many families travel over 45 minutes for a single therapy session. Despite shorter average waits than London, the region's dispersed population means that consistent, frequent therapy is impractical for many families.",
    seoTitle: "Speech Therapy Wait Times in South East England | Stammerly",
    seoDesc: "South East England NHS speech therapy waits average 40 weeks with significant rural access gaps. Stammerly brings therapy support directly to your home.",
  },
  scotland: {
    name: "Scotland",
    slug: "scotland",
    avgWaitWeeks: 36,
    childrenWaiting: "3,200+",
    nhsTrusts: ["NHS Greater Glasgow and Clyde", "NHS Lothian", "NHS Grampian"],
    stats: [
      { label: "Average referral-to-treatment", value: "36 weeks" },
      { label: "Children on waiting lists", value: "3,200+" },
      { label: "SLT workforce gap", value: "22%" },
      { label: "Highlands & Islands wait", value: "60+ weeks" },
    ],
    description: "Scotland's speech therapy services face significant regional disparities. While urban centres like Glasgow and Edinburgh maintain 36-week averages, families in the Highlands and Islands can wait over 60 weeks. The Scottish Government's RCSLT workforce data shows a 22% gap between funded and filled SLT positions.",
    seoTitle: "Speech Therapy Wait Times in Scotland | Stammerly",
    seoDesc: "Scotland NHS speech therapy waiting lists average 36 weeks, with rural areas exceeding 60 weeks. Stammerly provides immediate home-based support.",
  },
};

const allRegions = Object.values(regions);

const NhsWaitTimes = () => {
  const { region } = useParams<{ region?: string }>();
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // If a region slug is provided but invalid, redirect to the index
  if (region && !regions[region]) {
    return <Navigate to="/nhs-wait-times" replace />;
  }

  const data = region ? regions[region] : null;

  const handleWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .insert({ email: email.toLowerCase().trim(), user_type: `nhs_wait_${region || "index"}` });
      if (error && error.code === "23505") {
        toast({ title: "Already on the list! 😊", description: "We'll be in touch soon." });
      } else if (error) {
        throw error;
      } else {
        toast({ title: "You're on the list! 🎉", description: "We'll notify you when Stammerly launches in your area." });
      }
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Region index page
  if (!data) {
    return (
      <>
        <Helmet>
          <title>NHS Speech Therapy Wait Times by Region | Stammerly</title>
          <meta name="description" content="Check NHS speech therapy waiting times across the UK. Find your region and discover how Stammerly supports children during the wait." />
          <link rel="canonical" href="https://stammerly.com/nhs-wait-times" />
        </Helmet>
        <main className="min-h-screen bg-background">
          <header className="container mx-auto px-4 py-6">
            <Link to="/product" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Back to Product</span>
            </Link>
          </header>
          <section className="container mx-auto px-4 pb-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-4xl mx-auto">
              <div className="text-center mb-12">
                <Badge variant="outline" className="mb-4 bg-destructive/10 text-destructive border-destructive/20">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" /> NHS Backlog Crisis
                </Badge>
                <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                  Speech Therapy Wait Times Across the UK
                </h1>
                <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                  Over 50,000 children are currently waiting for NHS speech therapy. Select your region to see local statistics and learn how Stammerly can help during the wait.
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">
                {allRegions.map((r) => (
                  <Link key={r.slug} to={`/nhs-wait-times/${r.slug}`}>
                    <Card variant="bento" className="h-full">
                      <CardContent className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <MapPin className="w-4 h-4 text-primary" />
                          <h2 className="font-display font-bold text-foreground">{r.name}</h2>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <Clock className="w-4 h-4 text-destructive" />
                          <span className="text-2xl font-bold text-destructive">{r.avgWaitWeeks} weeks</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{r.childrenWaiting} children waiting</p>
                        <span className="text-xs text-primary font-medium inline-flex items-center gap-1">
                          View details <ChevronRight className="w-3 h-3" />
                        </span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>

              {/* Waitlist CTA */}
              <Card variant="glass" className="p-6 md:p-8 text-center">
                <h2 className="font-display text-xl font-bold text-foreground mb-2">Don't wait for the waiting list</h2>
                <p className="text-muted-foreground mb-5 max-w-md mx-auto">
                  Join the Stammerly waitlist and be the first to access clinician-designed home practice when we launch.
                </p>
                <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                  <div className="relative flex-1">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10" required />
                  </div>
                  <Button type="submit" variant="hero" disabled={isSubmitting}>
                    {isSubmitting ? "Joining…" : "Join Waitlist"}
                  </Button>
                </form>
              </Card>
            </motion.div>
          </section>
        </main>
      </>
    );
  }

  // Individual region page
  return (
    <>
      <Helmet>
        <title>{data.seoTitle}</title>
        <meta name="description" content={data.seoDesc} />
        <link rel="canonical" href={`https://stammerly.com/nhs-wait-times/${data.slug}`} />
      </Helmet>
      <main className="min-h-screen bg-background">
        <header className="container mx-auto px-4 py-6">
          <Link to="/nhs-wait-times" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">All Regions</span>
          </Link>
        </header>
        <section className="container mx-auto px-4 pb-20">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <MapPin className="w-5 h-5 text-primary" />
                <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{data.name}</Badge>
              </div>
              <h1 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Speech Therapy Wait Times in {data.name}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed">{data.description}</p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {data.stats.map((s) => (
                <Card key={s.label} variant="glass">
                  <CardContent className="p-4">
                    <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
                    <p className="font-display font-bold text-xl text-foreground">{s.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* NHS Trusts */}
            <Card variant="elevated" className="mb-8">
              <CardContent className="p-5">
                <h2 className="font-display font-bold text-lg text-foreground mb-3">Affected NHS Trusts</h2>
                <ul className="space-y-2">
                  {data.nhsTrusts.map((t) => (
                    <li key={t} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                      {t}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            {/* What parents can do */}
            <Card variant="elevated" className="mb-8">
              <CardContent className="p-5">
                <h2 className="font-display font-bold text-lg text-foreground mb-3">What Can You Do While Waiting?</h2>
                <ol className="space-y-3 text-sm text-muted-foreground list-decimal list-inside">
                  <li><strong className="text-foreground">Request a reassessment</strong> — If your child's needs have changed, contact your NHS trust to request priority reassessment.</li>
                  <li><strong className="text-foreground">Ask about interim support</strong> — Some trusts offer group sessions or parent-led programmes while families wait for individual therapy.</li>
                  <li><strong className="text-foreground">Explore evidence-based home practice</strong> — Stammerly is designed by SLTs to provide structured, AI-guided practice between or before clinical sessions.</li>
                  <li><strong className="text-foreground">Contact your MP</strong> — Parliamentary questions about local SLT provision have historically accelerated trust-level funding decisions.</li>
                </ol>
              </CardContent>
            </Card>

            {/* How Stammerly helps */}
            <Card className="bg-gradient-to-br from-primary/5 to-accent-orange/5 border-primary/20 mb-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  <h2 className="font-display font-bold text-lg text-foreground">How Stammerly Bridges the Gap</h2>
                </div>
                <p className="text-sm text-muted-foreground mb-4">
                  Stammerly is not a replacement for professional speech therapy — it's an interim solution designed by registered SLTs to ensure children don't lose ground while waiting for NHS services.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span> Clinician-designed practice exercises tailored to your child's needs</li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span> AI-powered speech monitoring via a wearable pendant</li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span> Seamless handover to your NHS therapist when treatment begins</li>
                  <li className="flex items-start gap-2"><span className="text-primary font-bold">✓</span> All data exportable in NHS-compatible clinical formats</li>
                </ul>
              </CardContent>
            </Card>

            {/* Waitlist CTA */}
            <Card variant="glass" className="p-6 text-center">
              <h2 className="font-display text-xl font-bold text-foreground mb-2">Join the {data.name} waitlist</h2>
              <p className="text-muted-foreground mb-5 text-sm">Be notified when Stammerly launches in your area.</p>
              <form onSubmit={handleWaitlist} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email" className="pl-10" required />
                </div>
                <Button type="submit" variant="hero" disabled={isSubmitting}>
                  {isSubmitting ? "Joining…" : "Join Waitlist"}
                </Button>
              </form>
            </Card>

            {/* Other regions */}
            <div className="mt-10">
              <h3 className="font-display font-semibold text-foreground mb-4">Other Regions</h3>
              <div className="flex flex-wrap gap-2">
                {allRegions.filter((r) => r.slug !== data.slug).map((r) => (
                  <Link key={r.slug} to={`/nhs-wait-times/${r.slug}`}>
                    <Badge variant="outline" className="cursor-pointer hover:bg-primary/10 transition-colors">
                      {r.name} · {r.avgWaitWeeks}wk
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </section>
        <Footer />
      </main>
    </>
  );
};

export default NhsWaitTimes;
