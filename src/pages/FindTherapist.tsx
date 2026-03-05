import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { ArrowLeft, Search, MapPin, Star, Shield, Users, Mail } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Placeholder therapist profiles for launch
const placeholderTherapists = [
  {
    id: 1,
    name: "Dr. Sarah Chen",
    title: "Specialist SLT — Paediatric Fluency",
    location: "London, UK",
    specialisms: ["Stammering", "Cluttering", "Preschool fluency"],
    stammerlyIntegrated: true,
    rating: 4.9,
    reviewCount: 47,
  },
  {
    id: 2,
    name: "James Okafor",
    title: "Senior Speech & Language Therapist",
    location: "Birmingham, UK",
    specialisms: ["Adolescent stammering", "Cognitive-behavioural approaches"],
    stammerlyIntegrated: true,
    rating: 4.8,
    reviewCount: 31,
  },
  {
    id: 3,
    name: "Dr. Fiona MacLeod",
    title: "Clinical Lead — Fluency Disorders",
    location: "Edinburgh, UK",
    specialisms: ["Lidcombe Program", "Palin PCI", "Adult fluency"],
    stammerlyIntegrated: true,
    rating: 4.9,
    reviewCount: 62,
  },
  {
    id: 4,
    name: "Priya Sharma",
    title: "Specialist SLT — Bilingual Fluency",
    location: "Manchester, UK",
    specialisms: ["Bilingual stammering", "School-age fluency", "Telehealth"],
    stammerlyIntegrated: false,
    rating: 4.7,
    reviewCount: 19,
  },
];

const FindTherapist = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("all");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const filtered = placeholderTherapists.filter((t) => {
    const matchesSearch = !searchQuery || t.name.toLowerCase().includes(searchQuery.toLowerCase()) || t.specialisms.some((s) => s.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesRegion = regionFilter === "all" || t.location.toLowerCase().includes(regionFilter.toLowerCase());
    return matchesSearch && matchesRegion;
  });

  const handleJoinDirectory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from("waitlist_signups")
        .insert({ email: email.toLowerCase().trim(), user_type: "therapist_directory" });
      if (error && error.code === "23505") {
        toast({ title: "Already registered! 😊", description: "We'll contact you when the directory launches." });
      } else if (error) {
        throw error;
      } else {
        toast({ title: "Registered! 🎉", description: "We'll contact you when the directory opens for applications." });
      }
      setEmail("");
    } catch {
      toast({ title: "Something went wrong", description: "Please try again later.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Find a Speech Therapist | Stammerly Directory</title>
        <meta name="description" content="Find certified speech and language therapists who use Stammerly. Connect with professionals integrated into our platform for seamless, data-driven care." />
        <link rel="canonical" href="https://stammerly.com/find-a-therapist" />
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
            <div className="text-center mb-10">
              <Badge variant="outline" className="mb-4 bg-primary/10 text-primary border-primary/20">
                <Users className="w-3.5 h-3.5 mr-1" /> Coming Soon
              </Badge>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-4">
                Find a Stammerly-Integrated Therapist
              </h1>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
                Connect with certified speech and language therapists who use Stammerly. Your child's home practice data flows directly to their clinician — no manual handover needed.
              </p>
            </div>

            {/* Search & filters */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by name or specialism…" className="pl-10" />
              </div>
              <Select value={regionFilter} onValueChange={setRegionFilter}>
                <SelectTrigger className="sm:w-48">
                  <MapPin className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Region" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Regions</SelectItem>
                  <SelectItem value="london">London</SelectItem>
                  <SelectItem value="birmingham">Birmingham</SelectItem>
                  <SelectItem value="manchester">Manchester</SelectItem>
                  <SelectItem value="edinburgh">Edinburgh</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Preview note */}
            <Card className="bg-accent-orange/5 border-accent-orange/20 mb-6">
              <CardContent className="p-4 flex items-start gap-3">
                <Shield className="w-5 h-5 text-accent-orange shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Directory Preview</p>
                  <p className="text-xs text-muted-foreground">
                    The profiles below are illustrative. The full directory will launch alongside Stammerly, featuring verified, HCPC-registered therapists. All listed professionals will have completed Stammerly platform training.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Therapist cards */}
            <div className="grid sm:grid-cols-2 gap-4 mb-12">
              {filtered.map((t) => (
                <Card key={t.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h2 className="font-display font-bold text-foreground">{t.name}</h2>
                        <p className="text-xs text-muted-foreground">{t.title}</p>
                      </div>
                      {t.stammerlyIntegrated && (
                        <Badge className="bg-success/10 text-success border-success/20 text-xs shrink-0">
                          ✓ Stammerly
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-1 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{t.location}</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {t.specialisms.map((s) => (
                        <Badge key={s} variant="outline" className="text-xs">{s}</Badge>
                      ))}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3.5 h-3.5 text-gold fill-gold" />
                      <span className="font-medium text-foreground">{t.rating}</span>
                      <span className="text-muted-foreground">({t.reviewCount} reviews)</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8 col-span-2">No therapists match your search.</p>
              )}
            </div>

            {/* CTA for therapists to join */}
            <Card variant="glass" className="p-6 md:p-8">
              <div className="grid md:grid-cols-2 gap-6 items-center">
                <div>
                  <h2 className="font-display text-xl font-bold text-foreground mb-2">Are you an SLT?</h2>
                  <p className="text-sm text-muted-foreground mb-1">
                    Join the Stammerly therapist directory and receive direct referrals from parents already using the platform. Requirements:
                  </p>
                  <ul className="text-xs text-muted-foreground space-y-1 mt-2">
                    <li>• HCPC registered Speech & Language Therapist</li>
                    <li>• RCSLT member (or equivalent)</li>
                    <li>• Completion of Stammerly platform training (free)</li>
                  </ul>
                </div>
                <form onSubmit={handleJoinDirectory} className="space-y-3">
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your professional email" className="pl-10" required />
                  </div>
                  <Button type="submit" variant="hero" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Registering…" : "Register Interest"}
                  </Button>
                </form>
              </div>
            </Card>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default FindTherapist;
