import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, FileText, AlertTriangle, CheckCircle, ArrowLeft, Scale, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const RegulatoryStatus = () => {
  return (
    <>
      <Helmet>
        <title>Regulatory & MHRA Status | Stammerly</title>
        <meta
          name="description"
          content="Stammerly's MHRA regulatory classification, hardware safety certifications, and medical device status. Transparent compliance information for parents, clinicians, and procurement teams."
        />
        <link rel="canonical" href="https://stammerly.com/regulatory" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent-sky/5" />
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/product">
              <Button variant="ghost" size="sm" className="mb-8 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Product
              </Button>
            </Link>
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                <Scale className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Regulatory Transparency</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                Regulatory Status & Safety Certifications
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl">
                We believe procurement officers, clinicians, and parents deserve complete clarity about what Stammerly is — and what it is not.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto space-y-8">

            {/* MHRA Classification */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-primary/10">
                      <Building2 className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h2 className="font-display text-2xl font-bold text-foreground mb-1">MHRA Classification</h2>
                      <Badge variant="outline" className="bg-accent-orange/10 text-accent-orange border-accent-orange/20">
                        Not a Medical Device
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-4 text-muted-foreground leading-relaxed">
                    <p>
                      <strong className="text-foreground">Stammerly is classified as a general wellness and educational technology product.</strong> It is not registered, marketed, or intended for use as a medical device under the UK Medical Devices Regulations 2002 (SI 2002/618, as amended) or the EU Medical Device Regulation (EU) 2017/745.
                    </p>
                    <p>
                      Specifically, Stammerly <strong className="text-foreground">does not</strong>:
                    </p>
                    <ul className="space-y-2 ml-4">
                      {[
                        "Diagnose, treat, cure, or prevent any disease or medical condition",
                        "Make clinical diagnoses — all flagged patterns are suggestions for qualified SLT review",
                        "Replace professional speech and language therapy or clinical judgement",
                        "Perform any function that meets the MHRA definition of a medical device under Regulation 2(1)",
                      ].map((item) => (
                        <li key={item} className="flex items-start gap-2">
                          <AlertTriangle className="w-4 h-4 text-accent-orange mt-0.5 shrink-0" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="bg-muted/50 rounded-xl p-4 mt-4 border border-border/30">
                      <p className="text-sm">
                        <strong className="text-foreground">What Stammerly does:</strong> It records speech via a wearable microphone, processes audio locally on-device, and presents patterns as educational feedback for children and observational data for their care team. Think of it as an <em>educational wellness tracker</em> — analogous to a fitness tracker that counts steps but does not diagnose cardiovascular disease.
                      </p>
                    </div>
                    <p className="text-sm">
                      If our intended use or clinical claims change in the future, we will immediately engage the MHRA's pre-submission process and pursue appropriate classification. We maintain ongoing dialogue with the MHRA's Innovation Office to ensure continued compliance.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Regulatory Framework */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-success/10">
                      <FileText className="w-6 h-6 text-success" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Applicable Regulatory Frameworks</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Although Stammerly is not a medical device, we voluntarily comply with the following standards to meet the expectations of NHS procurement and clinical governance teams:
                  </p>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {[
                      { code: "DTAC", label: "Digital Technology Assessment Criteria", desc: "NHS England's baseline assessment for digital health technologies" },
                      { code: "DCB0129", label: "Clinical Risk Management", desc: "Hazard identification and risk assessment for health IT systems" },
                      { code: "DCB0160", label: "Clinical Content Authority", desc: "Ensuring clinical content accuracy and evidence basis" },
                      { code: "UK GDPR", label: "Data Protection Act 2018", desc: "Full compliance with UK data protection regulation" },
                      { code: "ICO Code", label: "Children's Code (AADC)", desc: "Age-Appropriate Design Code for under-18 data processing" },
                      { code: "Cyber Essentials", label: "Cyber Essentials Plus", desc: "NCSC-backed cybersecurity certification scheme" },
                    ].map((f) => (
                      <Card key={f.code} className="border border-border/30">
                        <CardContent className="p-4">
                          <Badge variant="outline" className="mb-2 font-mono text-xs">{f.code}</Badge>
                          <p className="font-semibold text-foreground text-sm mb-1">{f.label}</p>
                          <p className="text-xs text-muted-foreground">{f.desc}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Hardware Safety Summary */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated">
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-start gap-4 mb-5">
                    <div className="p-3 rounded-xl bg-accent-sky/10">
                      <Shield className="w-6 h-6 text-accent-sky" />
                    </div>
                    <h2 className="font-display text-2xl font-bold text-foreground">Hardware Safety Certifications</h2>
                  </div>
                  <p className="text-muted-foreground mb-4">
                    The Stammerly pendant is designed with child safety as the absolute priority. Key safety features:
                  </p>
                  <ul className="space-y-3">
                    {[
                      { title: "Hypoallergenic Medical-Grade Silicone", desc: "ISO 10993-5 cytotoxicity-tested, BPA-free, latex-free, phthalate-free. Safe for prolonged skin contact in children aged 4+." },
                      { title: "Breakaway Safety Clasp", desc: "Lanyard releases at 2.2 kg of force — well below the 3 kg CPSC threshold — preventing strangulation and choking hazards." },
                      { title: "No Small Parts", desc: "Pendant dimensions (42 × 42 × 10 mm) exceed the EN 71-1 Small Parts Test Fixture. All components are ultrasonically welded." },
                      { title: "Sealed Battery", desc: "120 mAh lithium-polymer cell with IEC 62133-2 protection (overcharge, short-circuit, thermal runaway). Wireless Qi charging — no exposed ports." },
                      { title: "IP67 Waterproof", desc: "Fully dustproof and submersible in 1 m of water for 30 minutes. Survives rain, splashes, and accidental submersion." },
                      { title: "Impact Resistant", desc: "Tested to withstand repeated 1.2 m drops onto concrete (IEC 60068-2-31). No glass, sharp edges, or pinch points." },
                    ].map((item) => (
                      <li key={item.title} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-success mt-0.5 shrink-0" />
                        <div>
                          <span className="font-semibold text-foreground">{item.title}</span>
                          <p className="text-sm text-muted-foreground">{item.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-6">
                    <Link to="/hardware-safety">
                      <Button variant="outline" className="gap-2">
                        View Full Safety Specifications <ArrowLeft className="w-4 h-4 rotate-180" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Questions */}
            <motion.div variants={fadeUp} className="text-center pt-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Regulatory Questions?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Our clinical governance team is available to answer procurement questions and provide documentation packs for NHS trusts and school academies.
              </p>
              <Link to="/contact">
                <Button variant="hero" size="lg" className="rounded-xl">Contact Governance Team</Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </>
  );
};

export default RegulatoryStatus;
