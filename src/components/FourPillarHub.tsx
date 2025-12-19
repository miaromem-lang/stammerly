import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Smile, Users, GraduationCap, Stethoscope } from "lucide-react";

const pillars = [
  {
    id: "kid",
    title: "Kid Hub",
    subtitle: "Low-Friction Access",
    icon: Smile,
    color: "bg-accent-orange",
    features: ["Picture-password login", "Gamified activities", "Speech gems & rewards"],
    accent: "shadow-accent-orange/20",
  },
  {
    id: "parent",
    title: "Parent Hub",
    subtitle: "Daily Check-ins",
    icon: Users,
    color: "gradient-navy",
    features: ["Push notifications", "Progress tracking", "Expert video tips"],
    accent: "shadow-primary/20",
  },
  {
    id: "teacher",
    title: "Teacher Hub",
    subtitle: "Reduced Admin Load",
    icon: GraduationCap,
    color: "gradient-navy",
    features: ["IEP Automator", "Quick-action logging", "Comment bank"],
    accent: "shadow-primary/20",
  },
  {
    id: "therapist",
    title: "Therapist Hub",
    subtitle: "Clinical Workspace",
    icon: Stethoscope,
    color: "gradient-navy",
    features: ["Telehealth integration", "Deep analytics", "Session planner"],
    accent: "shadow-primary/20",
  },
];

export const FourPillarHub = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            A Seamless Ecosystem for Fluency
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Four interconnected portals designed for each stakeholder in the child's journey
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          {pillars.map((pillar, index) => {
            const Icon = pillar.icon;
            const isKid = pillar.id === "kid";
            
            return (
              <Card 
                key={pillar.id}
                variant="bento"
                className={`${isKid ? "rounded-kids" : ""} ${pillar.accent} hover:shadow-2xl`}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className={`inline-flex p-4 rounded-2xl ${
                      isKid ? "bg-accent-orange" : "gradient-navy"
                    }`}>
                      <Icon className="w-7 h-7 text-primary-foreground" />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1">{pillar.title}</CardTitle>
                      <p className={`text-sm font-medium ${
                        isKid ? "text-accent-orange" : "text-primary"
                      }`}>
                        {pillar.subtitle}
                      </p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {pillar.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-3 text-muted-foreground">
                        <div className={`w-2 h-2 rounded-full ${
                          isKid ? "bg-accent-orange" : "bg-primary"
                        }`} />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};
