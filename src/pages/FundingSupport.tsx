import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, PoundSterling, Heart, FileDown, GraduationCap, Building, HelpCircle, CheckCircle } from "lucide-react";
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

const fundingSources = [
  {
    icon: PoundSterling,
    title: "Disability Living Allowance (DLA)",
    colour: "text-primary",
    bg: "bg-primary/10",
    description: "Children with stammering may qualify for DLA if their speech difficulty significantly affects their daily life. Stammerly can be classed as a communication aid under DLA spending guidelines.",
    steps: [
      "Apply for DLA using the DWP form DLA1 (child). You do not need a formal diagnosis — describe the daily impact.",
      "In Section 5 (Communication), detail how your child's stammering affects their ability to be understood by strangers.",
      "If awarded, the DLA payment can be used towards communication aids including the Stammerly pendant (£89) and subscription (£4.99/mo).",
      "Keep receipts — you may need to demonstrate how the allowance was spent if reassessed.",
    ],
  },
  {
    icon: Heart,
    title: "Family Fund",
    colour: "text-destructive",
    bg: "bg-destructive/10",
    description: "Family Fund is the UK's largest charity providing grants for families raising disabled or seriously ill children. Communication equipment is an eligible category.",
    steps: [
      "Check eligibility: your household income must be £27,500 or less (or £32,500 with 2+ disabled children).",
      "Apply online at familyfund.org.uk — applications are free and open year-round.",
      "Select 'Communication Equipment' as your grant category.",
      "Use the template letter below to describe why Stammerly is needed alongside or instead of NHS provision.",
    ],
  },
  {
    icon: GraduationCap,
    title: "School SENCO Funding",
    colour: "text-accent-orange",
    bg: "bg-accent-orange/10",
    description: "Schools receive delegated SEN budgets (Element 2 funding: up to £6,000 per pupil). Your child's SENCO may be able to purchase Stammerly as a reasonable adjustment.",
    steps: [
      "Request a meeting with your child's SENCO (Special Educational Needs Coordinator).",
      "Explain that Stammerly provides structured home practice aligned with SLT recommendations.",
      "The SENCO can use delegated SEN budget or apply for Element 3 top-up funding from the local authority.",
      "Use the template letter below to formally request the purchase.",
    ],
  },
  {
    icon: Building,
    title: "Local Authority / EHCP Provision",
    colour: "text-success",
    bg: "bg-success/10",
    description: "If your child has an Education, Health and Care Plan (EHCP), communication aids can be written into the plan as a named provision.",
    steps: [
      "At your next Annual Review, request that Stammerly be added to Section F (Educational Provision) or Section G (Health Provision).",
      "Provide evidence: GP letter, SLT report, or waiting list confirmation showing the current gap in provision.",
      "Once named in the EHCP, the local authority is legally required to fund it.",
      "This route takes longer but provides the most secure, ongoing funding.",
    ],
  },
];

const familyFundLetter = `Dear Family Fund Team,

I am writing to request a grant for a Stammerly speech practice pendant and subscription for my child, [CHILD'S NAME], aged [AGE].

[CHILD'S NAME] has a stammering/speech fluency difficulty that significantly impacts their daily communication, confidence, and social participation. They are currently [on the NHS waiting list for speech therapy / receiving limited NHS speech therapy sessions].

Stammerly is an evidence-informed communication aid designed by registered Speech and Language Therapists. It provides:
• Daily structured speech practice through a wearable microphone pendant (£89 one-off cost)
• AI-powered feedback and progress tracking via a monthly subscription (£4.99/month)
• Clinical reports that can be shared with their NHS therapist when treatment begins

The total cost for the first year would be approximately £149 (pendant + 12 months subscription).

This technology would allow [CHILD'S NAME] to maintain and develop their speech skills during the current gap in NHS provision, reducing the risk of their difficulties becoming more entrenched.

I have attached [a letter from our GP / our NHS waiting list confirmation / our SLT report] as supporting evidence.

Thank you for considering this application.

Yours sincerely,
[YOUR NAME]
[YOUR ADDRESS]
[DATE]`;

const sencoLetter = `Dear [SENCO NAME],

RE: Request for Communication Aid Funding — [CHILD'S NAME], Year [X]

I am writing to request that the school considers purchasing a Stammerly speech practice device for [CHILD'S NAME] as a reasonable adjustment under their SEN support plan.

[CHILD'S NAME] has an identified speech fluency difficulty (stammering) that affects their classroom participation, reading aloud, and social interactions with peers. They are currently [on the NHS waiting list / receiving limited SLT sessions].

Stammerly is a wearable speech monitoring device designed by registered SLTs. It would enable [CHILD'S NAME] to:
• Complete structured speech exercises at home and potentially during calm moments at school
• Build confidence through gamified, low-pressure practice
• Generate progress reports for the SENCO, class teacher, and external SLT

The cost is:
• Pendant hardware: £89 (one-off)
• Monthly subscription: £4.99
• Annual total: approximately £149

This falls well within the school's delegated Element 2 SEN budget and would demonstrate a proactive approach to supporting [CHILD'S NAME]'s communication needs during the current waiting period for specialist services.

I would welcome the opportunity to discuss this further at your convenience.

Yours sincerely,
[YOUR NAME]
[DATE]`;

const FundingSupport = () => {
  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <Helmet>
        <title>Financial Support & Funding Guide | Stammerly</title>
        <meta name="description" content="Help paying for Stammerly. DLA guidance, Family Fund applications, SENCO funding requests, and free downloadable template letters for UK parents." />
        <link rel="canonical" href="https://stammerly.com/funding-support" />
      </Helmet>

      <main className="min-h-screen bg-background">
        <section className="relative py-20 md:py-28 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-success/5 via-background to-primary/5" />
          <div className="container mx-auto px-4 relative z-10">
            <Link to="/product">
              <Button variant="ghost" size="sm" className="mb-8 gap-2">
                <ArrowLeft className="w-4 h-4" /> Back to Product
              </Button>
            </Link>
            <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl">
              <motion.div variants={fadeUp} className="inline-flex items-center gap-2 bg-success/10 px-4 py-1.5 rounded-full mb-6">
                <PoundSterling className="w-4 h-4 text-success" />
                <span className="text-sm font-medium text-success">Financial Support</span>
              </motion.div>
              <motion.h1 variants={fadeUp} className="font-display text-4xl md:text-5xl font-bold text-foreground leading-tight mb-6">
                Help Paying for Stammerly
              </motion.h1>
              <motion.p variants={fadeUp} className="text-lg text-muted-foreground max-w-2xl">
                We believe cost should never prevent a child from accessing speech support. Here are the funding options available to UK families — with free template letters you can download and send today.
              </motion.p>
            </motion.div>
          </div>
        </section>

        <section className="container mx-auto px-4 pb-20">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto space-y-8">

            {fundingSources.map((source) => (
              <motion.div key={source.title} variants={fadeUp}>
                <Card variant="elevated">
                  <CardContent className="p-6 md:p-8">
                    <div className="flex items-start gap-4 mb-4">
                      <div className={`p-3 rounded-xl ${source.bg}`}>
                        <source.icon className={`w-6 h-6 ${source.colour}`} />
                      </div>
                      <h2 className="font-display text-xl md:text-2xl font-bold text-foreground">{source.title}</h2>
                    </div>
                    <p className="text-muted-foreground mb-4">{source.description}</p>
                    <h3 className="font-semibold text-foreground text-sm mb-3">How to Apply:</h3>
                    <ol className="space-y-2">
                      {source.steps.map((step, i) => (
                        <li key={i} className="flex items-start gap-3">
                          <Badge variant="outline" className="shrink-0 mt-0.5 w-6 h-6 p-0 flex items-center justify-center text-xs font-bold">{i + 1}</Badge>
                          <span className="text-sm text-muted-foreground">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              </motion.div>
            ))}

            {/* Template Letters */}
            <motion.div variants={fadeUp}>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-6">Free Template Letters</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <Card variant="elevated" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Heart className="w-5 h-5 text-destructive" />
                      <h3 className="font-display font-bold text-foreground">Family Fund Application Letter</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      A ready-to-customise letter for Family Fund grant applications. Just fill in the bracketed fields and attach supporting documents.
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2 w-full"
                      onClick={() => handleDownload(familyFundLetter, "Stammerly_FamilyFund_Letter.txt")}
                    >
                      <FileDown className="w-4 h-4" /> Download Letter
                    </Button>
                  </CardContent>
                </Card>
                <Card variant="elevated" className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-5 flex flex-col h-full">
                    <div className="flex items-center gap-2 mb-3">
                      <GraduationCap className="w-5 h-5 text-accent-orange" />
                      <h3 className="font-display font-bold text-foreground">SENCO Funding Request Letter</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 flex-1">
                      A formal letter requesting your child's school SENCO to fund Stammerly from their delegated SEN budget.
                    </p>
                    <Button
                      variant="outline"
                      className="gap-2 w-full"
                      onClick={() => handleDownload(sencoLetter, "Stammerly_SENCO_Request_Letter.txt")}
                    >
                      <FileDown className="w-4 h-4" /> Download Letter
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </motion.div>

            {/* FAQ */}
            <motion.div variants={fadeUp}>
              <Card className="bg-muted/30 border-border/30">
                <CardContent className="p-5 flex items-start gap-3">
                  <HelpCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-foreground text-sm mb-1">Need help with your application?</p>
                    <p className="text-xs text-muted-foreground">
                      Our team can provide supporting documentation, clinical rationale letters, and guidance on navigating DLA assessments. <Link to="/contact" className="text-primary hover:underline">Get in touch</Link> and we'll help for free.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        </section>
      </main>
    </>
  );
};

export default FundingSupport;
