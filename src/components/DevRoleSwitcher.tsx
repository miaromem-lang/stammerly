import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Users, GraduationCap, Stethoscope, Settings, X } from "lucide-react";
import { useAuth, AppRole } from "@/hooks/useAuth";

const roles = [
  { id: "kid" as AppRole, label: "Kid Hub", icon: Smile, path: "/hub/kid", color: "bg-orange-500" },
  { id: "parent" as AppRole, label: "Parent Hub", icon: Users, path: "/hub/parent", color: "bg-blue-500" },
  { id: "teacher" as AppRole, label: "Teacher Hub", icon: GraduationCap, path: "/hub/teacher", color: "bg-green-500" },
  { id: "therapist" as AppRole, label: "Therapist Hub", icon: Stethoscope, path: "/hub/therapist", color: "bg-purple-500" },
];

export function DevRoleSwitcher() {
  const [isOpen, setIsOpen] = useState(false);
  const { role } = useAuth();
  const navigate = useNavigate();

  // Only show for admin users
  if (role !== "admin") return null;

  const handleRoleSwitch = (targetRole: AppRole, path: string) => {
    // Store the "viewing as" role in sessionStorage for dev purposes
    sessionStorage.setItem("dev_viewing_as_role", targetRole);
    navigate(path);
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Dev Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="icon"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Settings className="w-5 h-5" />}
      </Button>

      {/* Role Switcher Panel */}
      {isOpen && (
        <Card className="fixed bottom-20 right-4 z-50 p-4 w-64 shadow-2xl border-2 border-purple-500/20 bg-card/95 backdrop-blur-sm">
          <div className="flex items-center gap-2 mb-3 pb-2 border-b">
            <Settings className="w-4 h-4 text-purple-500" />
            <span className="font-semibold text-sm">Dev Role Switcher</span>
          </div>
          <p className="text-xs text-muted-foreground mb-3">
            Admin mode: Access any hub for testing
          </p>
          <div className="space-y-2">
            {roles.map((r) => {
              const Icon = r.icon;
              const devRole = sessionStorage.getItem("dev_viewing_as_role");
              const isActive = devRole === r.id || (!devRole && role === r.id);
              
              return (
                <Button
                  key={r.id}
                  variant={isActive ? "default" : "outline"}
                  className="w-full justify-start gap-2"
                  onClick={() => handleRoleSwitch(r.id, r.path)}
                >
                  <div className={`p-1 rounded ${r.color}`}>
                    <Icon className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-sm">{r.label}</span>
                </Button>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/therapist-analytics")}
            >
              📊 Clinical Analytics Hub
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
