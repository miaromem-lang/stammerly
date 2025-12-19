import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Smile, Users, GraduationCap, Stethoscope } from "lucide-react";

interface RoleSwitcherProps {
  onRoleSelect: (role: string) => void;
  selectedRole?: string;
}

const roles = [
  {
    id: "kid",
    label: "I am a Kid",
    icon: Smile,
    color: "bg-accent-orange",
    description: "Fun games & activities",
  },
  {
    id: "parent",
    label: "I am a Parent",
    icon: Users,
    color: "gradient-navy",
    description: "Track progress at home",
  },
  {
    id: "teacher",
    label: "I am a Teacher",
    icon: GraduationCap,
    color: "gradient-navy",
    description: "Classroom support tools",
  },
  {
    id: "therapist",
    label: "I am a Therapist",
    icon: Stethoscope,
    color: "gradient-navy",
    description: "Clinical analytics",
  },
];

export const RoleSwitcher = ({ onRoleSelect, selectedRole }: RoleSwitcherProps) => {
  return (
    <div className="glass-card-strong rounded-2xl p-6 mt-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {roles.map((role) => {
          const Icon = role.icon;
          const isSelected = selectedRole === role.id;
          const isKid = role.id === "kid";
          
          return (
            <button
              key={role.id}
              onClick={() => onRoleSelect(role.id)}
              className={`role-card group relative overflow-hidden rounded-xl p-5 text-left transition-all duration-300 ${
                isKid ? "rounded-kids" : ""
              } ${
                isSelected
                  ? isKid
                    ? "bg-accent-orange text-primary-foreground shadow-xl scale-105"
                    : "gradient-navy text-primary-foreground shadow-xl scale-105"
                  : "bg-card hover:shadow-lg border border-border"
              }`}
            >
              <div className={`inline-flex p-3 rounded-xl mb-3 ${
                isSelected 
                  ? "bg-primary-foreground/20" 
                  : isKid 
                    ? "bg-accent-orange/10" 
                    : "bg-primary/10"
              }`}>
                <Icon className={`w-6 h-6 ${
                  isSelected 
                    ? "text-primary-foreground" 
                    : isKid 
                      ? "text-accent-orange" 
                      : "text-primary"
                }`} />
              </div>
              <h3 className={`font-display font-semibold text-sm mb-1 ${
                isSelected ? "text-primary-foreground" : "text-foreground"
              }`}>
                {role.label}
              </h3>
              <p className={`text-xs ${
                isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}>
                {role.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
