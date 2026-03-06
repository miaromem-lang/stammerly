import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Ruler, Thermometer, Weight, Shirt, Backpack, ShieldCheck, Sparkles } from "lucide-react";
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

const specs = [
  { icon: Weight, label: "Weight", value: "18 g", detail: "Lighter than two £1 coins. Most children forget they're wearing it within minutes.", colour: "text-primary", bg: "bg-primary/10" },
  { icon: Ruler, label: "Dimensions", value: "42 × 42 × 10 mm", detail: "About the size of a large button. Sits flat against clothing with no sharp edges or protrusions.", colour: "text-accent-orange", bg: "bg-accent-orange/10" },
  { icon: Thermometer, label: "Surface Temperature", value: "Body-neutral", detail: "Medical-grade silicone does not retain heat or cold. It quickly adapts to skin temperature and never feels metallic or jarring.", colour: "text-success", bg: "bg-success/10" },
  { icon: Sparkles, label: "Texture", value: "Smooth matte silicone", detail: "Soft, non-sticky, non-tacky surface. No ridges, seams, or textures that could cause sensory irritation. Similar to the feel of a premium phone case.", colour: "text-accent-sky", bg: "bg-accent-sky/10" },
];

const wearingOptions = [
  {
    icon: "🧶",
    title: "Lanyard (Default)",
    description: "A soft, breakaway lanyard made from Oeko-Tex Class I fabric. Releases at 2.2 kg of force for safety. The fabric is smooth, non-itchy, and washable at 30°C.",
    bestFor: "Children comfortable with necklaces",
  },
  {
    icon: "👕",
    title: "Collar Clip",
    description: "An integrated spring-loaded clip attaches the pendant securely to a school jumper collar, shirt pocket, or hoodie neckline. The microphone remains close enough to the mouth for accurate recording.",
    bestFor: "Children who dislike things around their neck",
  },
  {
    icon: "🎒",
    title: "Backpack Strap Mount",
    description: "A Velcro sleeve slides over any backpack shoulder strap, positioning the pendant near the collarbone. Ideal for outdoor play and school commutes.",
    bestFor: "Active children and outdoor environments",
  },
  {
    icon: "🧸",
    title: "Clothing Pocket",
    description: "The pendant fits inside most breast pockets on school uniforms. Audio quality remains high through a single layer of fabric, though accuracy may reduce by approximately 5% compared to direct wear.",
    bestFor: "Children who prefer hidden wearables",
  },
];

const sensoryFAQ = [
  { q: "Will the lanyard irritate my child's skin?", a: "The lanyard is made from Oeko-Tex Standard 100 Class I certified fabric — the same standard required for products touching baby skin. It contains no wool, nylon, or synthetic fibres known to cause irritation." },
  { q: "Does the pendant vibrate or make noise?", a: "No. The pendant operates silently with no vibration motor. The only tactile feedback is a single, subtle LED pulse when it begins or ends a recording session — and this can be disabled in settings." },
  { q: "Can my child wear it during PE or swimming?", a: "The pendant is IP67 waterproof and survives splashes, rain, and brief submersion. However, we recommend removing it for competitive swimming or contact sports to avoid discomfort." },
  { q: "My child has ADHD and fidgets — will they break it?", a: "The pendant is drop-tested to 1.2 m onto concrete (IEC 60068-2-31) and has no removable parts. The smooth, rounded design is actually quite satisfying to hold, and many children find it calming to touch." },
  { q: "My child is autistic and sensitive to weight on their chest. What do I do?", a: "At 18 g, the pendant is extremely light. However, if even this is too much, use the collar clip or backpack strap mount instead — both keep the pendant off the chest entirely while maintaining recording quality." },
];

const SensoryFitGuide = () => {
  return (
    <>
      <Helmet>
        <title>Sensory Fit Guide | Will Stammerly Bother My Child?</title>
        <meta name="description" content="Detailed sensory guide for the Stammerly pendant. Weight, texture, temperature, and alternative wearing options for children with sensory sensitivities, autism, or ADHD." />
        <link rel="canonical" href="https://stammerly.com/sensory-fit-guide" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-orange/5 via-background to-primary/5" />
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/product">
              <Button variant="ghost" size="sm" className="mb-8 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Product
              </Button>
            </Link>
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-accent-orange/10 px-4 py-1.5 rounded-full mb-6">
                <ShieldCheck className="w-4 h-4 text-accent-orange" />
                <span className="text-sm font-medium text-accent-orange">Neurodiversity-Friendly</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                Will it bother my child?
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl">
                We know stammering frequently co-occurs with autism, ADHD, and sensory processing differences. This guide gives you everything you need to decide if the pendant will work for your child.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto space-y-10">

            {/* Physical specs */}
            <motion.div variants={fadeUp}>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Pendant Specifications</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {specs.map((s) => (
                  <Card key={s.label} variant="elevated">
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded-lg ${s.bg}`}>
                          <s.icon className={`w-5 h-5 ${s.colour}`} />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">{s.label}</p>
                          <p className="font-display font-bold text-lg text-foreground">{s.value}</p>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">{s.detail}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Alternative wearing options */}
            <motion.div variants={fadeUp}>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-3">Alternative Wearing Options</h2>
              <p className="text-muted-foreground mb-6">
                The pendant doesn't have to go around the neck. Here are four tested configurations:
              </p>
              <div className="space-y-4">
                {wearingOptions.map((opt) => (
                  <Card key={opt.title} variant="elevated">
                    <CardContent className="p-5 flex items-start gap-4">
                      <span className="text-3xl shrink-0">{opt.icon}</span>
                      <div>
                        <h3 className="font-display font-bold text-foreground mb-1">{opt.title}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{opt.description}</p>
                        <Badge variant="outline" className="text-xs bg-primary/5 text-primary border-primary/20">
                          Best for: {opt.bestFor}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* Sensory FAQ */}
            <motion.div variants={fadeUp}>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Sensory Questions from Parents</h2>
              <div className="space-y-4">
                {sensoryFAQ.map((item) => (
                  <Card key={item.q} className="border border-border/30">
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-foreground mb-2">{item.q}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>

            {/* CTA */}
            <motion.div variants={fadeUp} className="text-center pt-4">
              <h2 className="font-display text-2xl font-bold text-foreground mb-3">Still unsure?</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                We offer a 30-day comfort guarantee. If your child can't tolerate the pendant, return it for a full refund — no questions asked.
              </p>
              <Link to="/contact">
                <Button variant="hero" size="lg" className="rounded-xl">Ask Us a Question</Button>
              </Link>
            </motion.div>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default SensoryFitGuide;
