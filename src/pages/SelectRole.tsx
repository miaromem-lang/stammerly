import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, Smile, Users, GraduationCap, Stethoscope, Loader2, LogOut } from "lucide-react";
import { useAuth, AppRole } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import PageBackground from "@/components/PageBackground";

const hubs = [
  { id: "kid" as AppRole, label: "Kid Hub", icon: Smile, emoji: "🎮", description: "Fun games & activities to practice speech" },
  { id: "parent" as AppRole, label: "Parent Hub", icon: Users, emoji: "👨‍👩‍👧", description: "Track your child's progress at home" },
  { id: "teacher" as AppRole, label: "Teacher Hub", icon: GraduationCap, emoji: "📚", description: "Classroom support & IEP tools" },
  { id: "therapist" as AppRole, label: "Therapist Hub", icon: Stethoscope, emoji: "🩺", description: "Clinical analytics & session planning" },
];

const roleToHub: Record<AppRole, string> = {
  kid: "/hub/kid",
  parent: "/hub/parent",
  teacher: "/hub/teacher",
  therapist: "/hub/therapist",
  admin: "/hub/therapist",
};

const SelectRole = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isAuthenticated || !user) {
    navigate("/signin", { replace: true });
    return null;
  }

  const handleConfirm = async () => {
    if (!selectedRole || !user) return;

    setLoading(true);
    try {
      const { error } = await (supabase as any)
        .from("user_roles")
        .insert({ user_id: user.id, role: selectedRole });

      if (error) {
        toast({ title: "Failed to set role", description: error.message, variant: "destructive" });
        return;
      }

      toast({ title: "Welcome to Stammerly! 🎉", description: `You're all set as a ${selectedRole}.` });
      // Small delay to let auth state update
      setTimeout(() => {
        window.location.href = roleToHub[selectedRole];
      }, 300);
    } catch {
      toast({ title: "Something went wrong", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <PageBackground />

      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-display font-bold text-xl text-foreground">Stammerly</span>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-lg bg-card border shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="font-display text-2xl">One last step!</CardTitle>
            <p className="text-muted-foreground text-sm mt-2">
              Select your role to personalise your experience
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {hubs.map((hub) => {
                const Icon = hub.icon;
                const isSelected = selectedRole === hub.id;
                return (
                  <button
                    key={hub.id}
                    type="button"
                    onClick={() => setSelectedRole(hub.id)}
                    disabled={loading}
                    className={`p-5 rounded-xl border-2 transition-all flex flex-col items-center gap-2 text-center ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-md"
                        : "border-border hover:border-primary/50"
                    } ${loading ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-6 h-6" />
                      <span className="text-2xl">{hub.emoji}</span>
                    </div>
                    <span className="text-sm font-semibold">{hub.label}</span>
                    <span className="text-xs text-muted-foreground">{hub.description}</span>
                  </button>
                );
              })}
            </div>

            <Button
              className="w-full h-12 rounded-xl text-lg font-semibold mt-4"
              size="lg"
              disabled={!selectedRole || loading}
              onClick={handleConfirm}
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Continue"
              )}
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default SelectRole;
