import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, User, Gamepad2, ClipboardList, FileBarChart } from "lucide-react";

const steps = [
  {
    number: 1,
    title: "SLP Sets Goal",
    description: "Speech therapist defines therapy targets and exercises",
    icon: User,
    color: "bg-primary",
  },
  {
    number: 2,
    title: "Child Plays Games",
    description: "Interactive practice through gamified activities",
    icon: Gamepad2,
    color: "bg-accent-orange",
  },
  {
    number: 3,
    title: "Carryover Logged",
    description: "Parent & teacher log real-world observations",
    icon: ClipboardList,
    color: "bg-accent",
  },
  {
    number: 4,
    title: "360° Report",
    description: "AI aggregates weekly progress report",
    icon: FileBarChart,
    color: "bg-success",
  },
];

export const DataLoop = () => {
  return (
    <section className="py-24 bg-secondary/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            The Synchronicity Engine
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            How Data Connects Us
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            A collaborative data loop ensuring every stakeholder stays informed and aligned
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((step, index) => {
              const Icon = step.icon;
              return (
                <div key={step.number} className="relative">
                  <Card variant="glass" className="h-full">
                    <CardContent className="p-6 text-center">
                      <div className={`inline-flex p-4 rounded-full ${step.color} mb-4`}>
                        <Icon className="w-8 h-8 text-primary-foreground" />
                      </div>
                      <div className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm">
                        {step.number}
                      </div>
                      <h3 className="font-display font-semibold text-lg mb-2">{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                  
                  {index < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                      <ArrowRight className="w-6 h-6 text-primary" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Circular indicator */}
          <div className="mt-8 flex justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-8 h-0.5 bg-primary rounded" />
              <span>Continuous feedback cycle</span>
              <div className="w-8 h-0.5 bg-primary rounded" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
