import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, GraduationCap, Building2, Stethoscope, ExternalLink } from "lucide-react";

const plans = [
  {
    name: "Home",
    price: "£9.99",
    period: "/month",
    description: "For families supporting practice at home",
    icon: GraduationCap,
    features: [
      "Unlimited child practice sessions",
      "Parent dashboard & ratings",
      "Daily video tips",
      "Progress reports",
      "Email support",
    ],
    cta: "Start Free Trial",
    popular: false,
  },
  {
    name: "School",
    price: "£29.99",
    period: "/month per class",
    description: "For educators and schools",
    icon: Building2,
    features: [
      "Everything in Home",
      "Teacher quick-log tools",
      "IEP comment bank",
      "Multi-student management",
      "School-wide analytics",
      "Priority support",
    ],
    cta: "Contact Sales",
    popular: true,
  },
  {
    name: "Clinic",
    price: "£49.99",
    period: "/month per clinician",
    description: "For speech & language therapists",
    icon: Stethoscope,
    features: [
      "Everything in School",
      "Clinical analytics dashboard",
      "AI-powered insights",
      "Telehealth integration",
      "Session planner",
      "HIPAA compliance tools",
      "Dedicated account manager",
    ],
    cta: "Book Demo",
    popular: false,
  },
];

export const PricingSection = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            Born from Research at UCL
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Plans for Every Setting
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Flexible pricing that scales with your needs
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan) => {
            const Icon = plan.icon;
            return (
              <Card 
                key={plan.name} 
                variant={plan.popular ? "glassStrong" : "glass"}
                className={`relative ${plan.popular ? "ring-2 ring-primary scale-105" : ""}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                      Most Popular
                    </span>
                  </div>
                )}
                <CardHeader className="text-center pb-4">
                  <div className="inline-flex p-3 rounded-xl bg-primary/10 mx-auto mb-4">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-6">
                    <span className="text-4xl font-display font-bold text-foreground">{plan.price}</span>
                    <span className="text-muted-foreground">{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <Check className="w-5 h-5 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-sm text-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    variant={plan.popular ? "navy" : "outline"} 
                    className="w-full"
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
        
        {/* Founder Bio */}
        <div className="max-w-3xl mx-auto">
          <Card variant="glass">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-center gap-8">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-5xl flex-shrink-0">
                  👩‍💼
                </div>
                <div className="text-center md:text-left">
                  <h3 className="font-display text-2xl font-bold text-foreground mb-2">
                    Founded with Purpose
                  </h3>
                  <p className="text-muted-foreground mb-4">
                    Stammerly was born from research at UCL, founded by an educator with an 
                    MA in Education and Technology. Our mission is to align cutting-edge AI 
                    with human-centred teaching practices, ensuring every child who stammers 
                    receives consistent, compassionate support across all environments.
                  </p>
                  <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                      UCL Research
                    </span>
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                      MA Education & Technology
                    </span>
                    <span className="text-xs bg-secondary px-3 py-1 rounded-full text-muted-foreground">
                      Human-Centred Design
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};
