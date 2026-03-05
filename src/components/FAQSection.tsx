import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Shield, Cpu, Stethoscope } from "lucide-react";

interface FAQItem {
  q: string;
  a: string;
}

const categories: { id: string; label: string; icon: React.ReactNode; color: string; items: FAQItem[] }[] = [
  {
    id: "hardware",
    label: "Hardware & Safety",
    icon: <Cpu className="w-4 h-4" />,
    color: "bg-accent-orange/10 text-accent-orange",
    items: [
      {
        q: "Will this device listen to my private family conversations?",
        a: "No. The pendant processes all audio locally using on-device AI. Raw audio is never transmitted to the cloud. Only anonymised disfluency metadata (e.g., 'block detected at 3.2s, duration 420ms') is synced. Parents can also physically mute the microphone at any time using the hardware switch.",
      },
      {
        q: "Is the pendant safe for young children to wear?",
        a: "Yes. The pendant uses a magnetic breakaway clasp that releases under 2kg of force, exceeding EN 14682 child safety standards. It weighs just 18g, is IP54 splash-resistant, and made from hypoallergenic medical-grade silicone.",
      },
      {
        q: "How long does the battery last?",
        a: "A full charge lasts approximately 14 hours of continuous use. Charging takes around 90 minutes via the included USB-C cable. The parent app alerts you when battery drops below 15%.",
      },
      {
        q: "What happens if the pendant breaks or gets lost?",
        a: "Replacement pendants are available at a reduced cost for existing subscribers. All speech data is stored securely in the cloud, so no progress is lost if the hardware needs replacing.",
      },
    ],
  },
  {
    id: "privacy",
    label: "Data & Privacy",
    icon: <Shield className="w-4 h-4" />,
    color: "bg-primary/10 text-primary",
    items: [
      {
        q: "Where is my child's data stored?",
        a: "All data is stored on UK-based servers compliant with UK GDPR and the Data Protection Act 2018. We do not transfer data outside the UK/EEA without explicit consent and appropriate safeguards.",
      },
      {
        q: "Can I delete my child's data?",
        a: "Yes. Under GDPR Article 17 (Right to Erasure), you can request complete deletion of all data at any time via the Privacy Portal in the Parent Hub or by emailing mia@stammerly.com. Deletion is processed within 72 hours.",
      },
      {
        q: "Is the platform compliant with NHS data standards?",
        a: "We are designing against DTAC (Digital Technology Assessment Criteria), DCB0129 clinical safety standards, and the NHS Data Security and Protection Toolkit. Full certification is targeted prior to NHS deployment.",
      },
      {
        q: "Who can see my child's speech data?",
        a: "Only the assigned therapist, the parent/carer account holder, and the child's linked teacher (read-only, limited view) can access speech data. Access is controlled by role-based permissions and encrypted at rest.",
      },
    ],
  },
  {
    id: "clinical",
    label: "Clinical Efficacy",
    icon: <Stethoscope className="w-4 h-4" />,
    color: "bg-success/10 text-success",
    items: [
      {
        q: "Is Stammerly a replacement for speech therapy?",
        a: "No. Stammerly is a clinical support tool designed to augment — never replace — the therapist. The AI flags patterns and generates reports; the qualified clinician makes all diagnostic and treatment decisions.",
      },
      {
        q: "What evidence supports Stammerly's approach?",
        a: "Our methodology draws on the Lidcombe Programme, spaced repetition research (Ebbinghaus, 1885; Cepeda et al., 2006), non-punitive reinforcement schedules, and the ICF framework. We are planning clinical validation studies with UK university partners.",
      },
      {
        q: "How accurate is the AI disfluency detection?",
        a: "Our current model achieves approximately 89% agreement with expert clinician ratings on standard test sets. Every AI assessment can be reviewed and corrected by the therapist, and these corrections continuously improve the model.",
      },
      {
        q: "Can Stammerly handle different accents and dialects?",
        a: "The model is being trained on diverse UK speech patterns including regional accents. We use accent-normalised acoustic features to minimise bias. Therapists can flag accent-related false positives to improve accuracy.",
      },
    ],
  },
];

const FAQSection = () => {
  return (
    <div className="space-y-8">
      {categories.map((cat) => (
        <div key={cat.id}>
          <div className="flex items-center gap-2 mb-4">
            <Badge variant="outline" className={cat.color}>{cat.icon}<span className="ml-1">{cat.label}</span></Badge>
          </div>
          <Accordion type="multiple" className="space-y-2">
            {cat.items.map((item, i) => (
              <AccordionItem key={i} value={`${cat.id}-${i}`} className="border border-border/30 rounded-xl px-4 data-[state=open]:bg-card/50">
                <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      ))}
    </div>
  );
};

export default FAQSection;
