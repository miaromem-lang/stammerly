import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Building2, FileDown, Mail, Phone, Users, Shield, BarChart3, CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

import SendFundingCalculator from "@/components/SendFundingCalculator";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const benefits = [
  {
    icon: BarChart3,
    title: "Measurable Outcomes",
    desc: "Automated SOAP note generation and longitudinal fluency tracking reduce clinician admin time by an estimated 40%.",
  },
  {
    icon: Users,
    title: "Multi-Stakeholder Access",
    desc: "Therapists, teachers, and parents share a single source of truth — no more fragmented progress reports.",
  },
  {
    icon: Shield,
    title: "NHS-Ready Compliance",
    desc: "Designed against DTAC, DCB0129, and NHS Data Security & Protection Toolkit standards from day one.",
  },
];

const Procurement = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    organisation: "",
    orgType: "",
    role: "",
    licences: "",
    message: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.organisation || !form.orgType) return;

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("waitlist_signups").insert({
        email: form.email.toLowerCase().trim(),
        user_type: `b2b_${form.orgType}`,
      });

      if (error && error.code !== "23505") throw error;

      toast({
        title: "Request received! 🏥",
        description: "Our partnerships team will be in touch within 2 business days.",
      });
      setForm({ name: "", email: "", organisation: "", orgType: "", role: "", licences: "", message: "" });
    } catch {
      toast({
        title: "Something went wrong",
        description: "Please try again or email us directly at mia@stammerly.com.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Stammerly | NHS & School Procurement</title>
        <meta
          name="description"
          content="Stammerly for NHS Trusts and schools — bulk licensing, DTAC-compliant architecture, and evidence-based speech therapy technology for procurement officers."
        />
        <link rel="canonical" href="https://stammerly.com/procurement" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/8 via-background to-accent-sky/5" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <Link to="/product">
              <Button variant="ghost" size="sm" className="mb-8 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Product
              </Button>
            </Link>

            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                <Building2 className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">For Organisations</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Stammerly for NHS Trusts &amp; Schools
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Deploy evidence-based, AI-augmented speech therapy across your service — with centralised licensing, DTAC-aligned security, and measurable clinical outcomes.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="grid md:grid-cols-3 gap-8"
            >
              {benefits.map((b) => (
                <motion.div key={b.title} variants={fadeUp}>
                  <Card className="h-full border border-border/40">
                    <CardContent className="p-8">
                      <div className="p-3 rounded-xl bg-primary/10 w-fit mb-5">
                        <b.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-display text-xl font-bold text-foreground mb-3">{b.title}</h3>
                      <p className="text-muted-foreground leading-relaxed">{b.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Evidence Brief Download */}
        <section className="py-16 md:py-24 bg-primary/[0.03]">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
              className="max-w-3xl mx-auto text-center"
            >
              <motion.div variants={fadeUp} className="p-3 rounded-xl bg-accent-orange/10 w-fit mx-auto mb-5">
                <FileDown className="w-8 h-8 text-accent-orange" />
              </motion.div>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Evidence Brief
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground mb-4 max-w-xl mx-auto leading-relaxed">
                Download our pedagogical framework document covering the theoretical foundations of Stammerly's Hybrid Intelligence model, curriculum design principles, and alignment with NICE CG/NG guidelines for stammering interventions.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Card className="border border-border/40 max-w-lg mx-auto">
                  <CardContent className="p-8">
                    <h3 className="font-display text-lg font-bold text-foreground mb-2">What's inside</h3>
                    <ul className="text-left space-y-3 mb-6">
                      {[
                        "Hybrid Intelligence Loop — AI + clinician verification model",
                        "Pedagogical framework — gamified fluency shaping curriculum",
                        "Clinical evidence mapping — alignment with Lidcombe, Camperdown, and Palin PCI",
                        "Data governance — GDPR, DTAC, and DCB0129 compliance architecture",
                        "Outcome metrics — how Stammerly measures progress",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <CheckCircle className="w-4 h-4 text-success mt-1 shrink-0" />
                          <span className="text-sm text-muted-foreground">{item}</span>
                        </li>
                      ))}
                    </ul>
                    <Button variant="hero" size="lg" className="rounded-xl w-full" disabled>
                      <FileDown className="w-5 h-5 mr-2" /> Coming Soon — Q3 2026
                    </Button>
                    <p className="text-xs text-muted-foreground mt-3">
                      The Evidence Brief is currently in preparation. Submit the form below to be notified when it's available.
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl mx-auto">
              <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
                <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4 text-center">
                  Request a Bulk Licensing Quote
                </motion.h2>
                <motion.p variants={fadeUp} className="text-muted-foreground mb-10 text-center max-w-lg mx-auto">
                  Tell us about your organisation and we'll prepare a tailored proposal within 2 business days.
                </motion.p>

                <motion.form variants={fadeUp} onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proc-name">Full Name *</Label>
                      <Input id="proc-name" value={form.name} onChange={(e) => handleChange("name", e.target.value)} required maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proc-email">Work Email *</Label>
                      <Input id="proc-email" type="email" value={form.email} onChange={(e) => handleChange("email", e.target.value)} required maxLength={255} />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proc-org">Organisation Name *</Label>
                      <Input id="proc-org" value={form.organisation} onChange={(e) => handleChange("organisation", e.target.value)} required maxLength={150} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proc-type">Organisation Type *</Label>
                      <Select value={form.orgType} onValueChange={(v) => handleChange("orgType", v)} required>
                        <SelectTrigger id="proc-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nhs_trust">NHS Trust</SelectItem>
                          <SelectItem value="nhs_icb">Integrated Care Board (ICB)</SelectItem>
                          <SelectItem value="school">School / Academy Trust</SelectItem>
                          <SelectItem value="local_authority">Local Authority</SelectItem>
                          <SelectItem value="private_practice">Private Practice / Clinic</SelectItem>
                          <SelectItem value="university">University / Research</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="proc-role">Your Role</Label>
                      <Input id="proc-role" placeholder="e.g. Procurement Officer" value={form.role} onChange={(e) => handleChange("role", e.target.value)} maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="proc-licences">Estimated Licences Needed</Label>
                      <Input id="proc-licences" placeholder="e.g. 50" value={form.licences} onChange={(e) => handleChange("licences", e.target.value)} maxLength={20} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="proc-msg">Additional Details</Label>
                    <Textarea
                      id="proc-msg"
                      rows={4}
                      placeholder="Tell us about your use case, timelines, or any specific requirements."
                      value={form.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      maxLength={2000}
                    />
                  </div>

                  <Button type="submit" variant="hero" size="lg" className="w-full rounded-xl" disabled={isSubmitting}>
                    {isSubmitting ? "Submitting…" : "Request Quote"}
                  </Button>
                </motion.form>
              </motion.div>
            </div>
          </div>
        </section>

        {/* SEND Funding Calculator */}
        <section className="py-16 md:py-20 bg-gradient-to-b from-background to-secondary/20">
          <div className="container mx-auto px-4">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeUp}>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground text-center mb-3">SEND Funding Calculator</h2>
              <p className="text-muted-foreground text-center mb-8 max-w-2xl mx-auto">
                For SENCOs and school administrators — calculate how to compliantly allocate High Needs Block or Pupil Premium funding for Stammerly licences.
              </p>
              <div className="max-w-3xl mx-auto">
                <SendFundingCalculator />
              </div>
            </motion.div>
          </div>
        </section>

        {/* Direct Contact */}
        <section className="py-12 bg-primary/[0.03]">
          <div className="container mx-auto px-4 text-center">
            <p className="text-muted-foreground">
              Prefer to talk directly?{" "}
              <a href="mailto:mia@stammerly.com" className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                <Mail className="w-4 h-4" /> mia@stammerly.com
              </a>
            </p>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Procurement;
