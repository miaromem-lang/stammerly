import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Battery, Droplets, Wind, AlertTriangle, CheckCircle, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
};

const safetyAreas = [
  {
    icon: AlertTriangle,
    title: "Choking Hazard Mitigations",
    colour: "text-accent-orange",
    bgColour: "bg-accent-orange/10",
    items: [
      "Pendant dimensions (42 × 42 × 10 mm) exceed the Small Parts Test Fixture (SPTF) cylinder defined by EN 71-1, eliminating ingestion risk.",
      "Breakaway lanyard rated to release at 2.2 kg of force — well below the 3 kg threshold recommended by the Consumer Product Safety Commission.",
      "No removable small parts: microphone grille, charging contacts, and indicator LED are flush-mounted and ultrasonically welded into the mono-body shell.",
      "Designed and tested for children aged 4+, clearly labelled in compliance with the Toy Safety Directive 2009/48/EC.",
    ],
  },
  {
    icon: Battery,
    title: "Battery Safety Standards",
    colour: "text-success",
    bgColour: "bg-success/10",
    items: [
      "Sealed lithium-polymer cell (120 mAh) encapsulated in a fire-retardant polycarbonate housing — no user access to the battery.",
      "Charge management IC with over-charge, over-discharge, short-circuit, and thermal runaway protection (IEC 62133-2 compliant).",
      "Wireless charging via Qi-compatible base eliminates exposed charging ports and electrical contact risk for wet hands.",
      "Battery chemistry selected for low energy density to minimise thermal event risk while delivering 8+ hours of continuous recording.",
    ],
  },
  {
    icon: Droplets,
    title: "Durability & Ingress Protection",
    colour: "text-accent-sky",
    bgColour: "bg-accent-sky/10",
    items: [
      "IP67 rated: fully dustproof and submersible in 1 m of fresh water for 30 minutes — safe for rain, splashes, and accidental submersion.",
      "Medical-grade silicone outer wrap absorbs impact; tested to withstand repeated 1.2 m drops onto concrete (IEC 60068-2-31).",
      "Operating temperature range: 0 °C to 45 °C; storage range: −20 °C to 60 °C.",
      "No glass, sharp edges, or pinch points. All seams are radiused to ≥ 0.5 mm.",
    ],
  },
  {
    icon: Wind,
    title: "Material & Biocompatibility",
    colour: "text-primary",
    bgColour: "bg-primary/10",
    items: [
      "Skin-contact surfaces made from ISO 10993-5 cytotoxicity-tested, hypoallergenic silicone — free of BPA, latex, and phthalates.",
      "Compliant with EU REACH Regulation (EC 1907/2006) — all restricted substances below thresholds.",
      "Antimicrobial additive in the silicone wrap inhibits bacterial growth on the surface.",
      "Lanyard fabric is Oeko-Tex Standard 100 Class I certified (suitable for babies).",
    ],
  },
];

const certifications = [
  "UKCA / CE marked",
  "EN 71-1, -2, -3 (Toy Safety)",
  "IEC 62133-2 (Battery Safety)",
  "IP67 (Ingress Protection)",
  "EU REACH & RoHS compliant",
  "ISO 10993-5 (Biocompatibility)",
  "FCC Part 15 / RED 2014/53/EU",
  "Qi v1.3 (Wireless Charging)",
];

const HardwareSafety = () => {
  return (
    <>
      <Helmet>
        <title>Stammerly | Hardware Safety Specifications</title>
        <meta
          name="description"
          content="Detailed safety specifications for the Stammerly speech pendant — choking hazard mitigations, battery safety, IP67 durability, and biocompatibility certifications."
        />
        <link rel="canonical" href="https://stammerly.com/hardware-safety" />
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-success/5" />
          <div className="absolute top-10 right-10 w-64 h-64 bg-accent-sky/10 rounded-full blur-3xl" />

          <div className="container mx-auto px-4 relative z-10">
            <Link to="/product">
              <Button variant="ghost" size="sm" className="mb-8 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Product
              </Button>
            </Link>

            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-primary/10 px-4 py-1.5 rounded-full mb-6">
                <Shield className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Safety First</span>
              </motion.div>

              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground leading-tight mb-6">
                Built for little explorers
              </motion.h1>

              <motion.p variants={fadeUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                Every design decision in the Stammerly pendant starts with one question: <strong className="text-foreground">is it safe for a child?</strong> Below is a transparent breakdown of how we protect your child.
              </motion.p>
            </motion.div>
          </div>
        </section>

        {/* Safety Areas */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={stagger}
              className="space-y-12"
            >
              {safetyAreas.map((area) => (
                <motion.div key={area.title} variants={fadeUp}>
                  <Card className="border border-border/40 shadow-sm">
                    <CardContent className="p-6 md:p-10">
                      <div className="flex items-start gap-4 mb-6">
                        <div className={`p-3 rounded-xl ${area.bgColour}`}>
                          <area.icon className={`w-6 h-6 ${area.colour}`} />
                        </div>
                        <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground">{area.title}</h2>
                      </div>
                      <ul className="space-y-4">
                        {area.items.map((item, i) => (
                          <li key={i} className="flex items-start gap-3">
                            <CheckCircle className="w-5 h-5 text-success mt-0.5 shrink-0" />
                            <span className="text-muted-foreground leading-relaxed">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* Certifications */}
        <section className="py-16 md:py-24 bg-primary/[0.03]">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              <motion.h2 variants={fadeUp} className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
                Certifications & Standards
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground mb-12 max-w-xl mx-auto">
                The Stammerly pendant is designed to meet or exceed the following regulatory standards.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap justify-center gap-3 max-w-3xl mx-auto">
                {certifications.map((cert) => (
                  <span
                    key={cert}
                    className="px-4 py-2 rounded-full border border-border bg-card text-sm font-medium text-foreground shadow-sm"
                  >
                    {cert}
                  </span>
                ))}
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4 text-center">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-xl mx-auto">
              <motion.h2 variants={fadeUp} className="font-display text-2xl md:text-3xl font-bold text-foreground mb-4">
                Questions about safety?
              </motion.h2>
              <motion.p variants={fadeUp} className="text-muted-foreground mb-8">
                Our team is happy to discuss any aspect of the pendant's design. Reach out and we'll get back to you within 24 hours.
              </motion.p>
              <motion.div variants={fadeUp}>
                <Link to="/contact">
                  <Button variant="hero" size="lg" className="rounded-xl">
                    Contact Us
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default HardwareSafety;
