import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft, Lock, Smile, Users, GraduationCap, Stethoscope, Shield } from "lucide-react";
import PageBackground from "@/components/PageBackground";

const hubs = [
  { id: "kid", label: "Kid Hub", icon: Smile, path: "/hub/kid", color: "bg-orange-500" },
  { id: "parent", label: "Parent Hub", icon: Users, path: "/hub/parent", color: "bg-blue-500" },
  { id: "teacher", label: "Teacher Hub", icon: GraduationCap, path: "/hub/teacher", color: "bg-green-500" },
  { id: "therapist", label: "Therapist Hub", icon: Stethoscope, path: "/hub/therapist", color: "bg-purple-500" },
  { id: "admin", label: "Admin Hub", icon: Shield, path: "/admin", color: "bg-red-500" },
];

const AdminLogin = () => {
  const navigate = useNavigate();

  const handleHubSelect = (path: string) => {
    // Set dev bypass flag so ProtectedRoute allows access
    sessionStorage.setItem("dev_admin_bypass", "true");
    navigate(path);
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <PageBackground />

      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl text-foreground">Stammerly</span>
          </div>
          <div className="w-20" />
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-lg bg-card border shadow-xl">
          <CardHeader className="pb-4 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="font-display text-2xl">Team Hub Viewer</CardTitle>
            <p className="text-sm text-muted-foreground mt-2">Select a hub to preview</p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {hubs.map((hub) => {
                const Icon = hub.icon;
                return (
                  <Button
                    key={hub.id}
                    variant="outline"
                    className="h-auto py-4 flex flex-col items-center gap-2 hover:shadow-md transition-all"
                    onClick={() => handleHubSelect(hub.path)}
                  >
                    <div className={`p-2 rounded-lg ${hub.color}`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <span className="font-semibold">{hub.label}</span>
                  </Button>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AdminLogin;
