import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Smile, Users, GraduationCap, Stethoscope, Settings, X, BarChart3 } from "lucide-react";
import { useAuth, AppRole } from "@/hooks/useAuth";

const roles = [
  { id: "kid" as AppRole, label: "Kid Hub", icon: Smile, path: "/hub/kid", analyticsPath: "/analytics/kid", color: "bg-orange-500" },
  { id: "parent" as AppRole, label: "Parent Hub", icon: Users, path: "/hub/parent", analyticsPath: "/analytics/parent", color: "bg-blue-500" },
  { id: "teacher" as AppRole, label: "Teacher Hub", icon: GraduationCap, path: "/hub/teacher", analyticsPath: "/analytics/teacher", color: "bg-green-500" },
  { id: "therapist" as AppRole, label: "Therapist Hub", icon: Stethoscope, path: "/hub/therapist", analyticsPath: "/analytics/therapist", color: "bg-purple-500" },
];

const ROLE_KEY = "dev_viewing_as_role";
const OPEN_KEY = "dev_role_switcher_open";
const ROLE_EVENT = "dev-role-change";

const readActiveRole = (): AppRole | null =>
  (sessionStorage.getItem(ROLE_KEY) as AppRole | null) ?? null;

const writeActiveRole = (next: AppRole) => {
  sessionStorage.setItem(ROLE_KEY, next);
  window.dispatchEvent(new CustomEvent(ROLE_EVENT, { detail: next }));
};

export function DevRoleSwitcher() {
  const { role } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Persist panel open/close across navigations (incl. AdminHub tab switches)
  const [isOpen, setIsOpen] = useState<boolean>(() => sessionStorage.getItem(OPEN_KEY) === "true");
  const [activeRole, setActiveRole] = useState<AppRole | null>(() => readActiveRole());

  useEffect(() => {
    sessionStorage.setItem(OPEN_KEY, String(isOpen));
  }, [isOpen]);

  // Re-sync active role from storage on route changes and when other code updates it
  useEffect(() => {
    setActiveRole(readActiveRole());
  }, [location.pathname]);

  useEffect(() => {
    const sync = () => setActiveRole(readActiveRole());
    window.addEventListener(ROLE_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(ROLE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const handleRoleSwitch = useCallback((targetRole: AppRole, path: string) => {
    writeActiveRole(targetRole);
    setActiveRole(targetRole);
    navigate(path);
  }, [navigate]);

  const handleAnalyticsJump = useCallback((targetRole: AppRole, analyticsPath: string) => {
    writeActiveRole(targetRole);
    setActiveRole(targetRole);
    navigate(analyticsPath);
  }, [navigate]);

  // Only show for admin users (after hooks so order is stable)
  if (role !== "admin") return null;

  return (
    <>
      {/* Floating Dev Button */}
      <Button
        onClick={() => setIsOpen((v) => !v)}
        className="fixed bottom-4 right-4 z-50 rounded-full w-12 h-12 shadow-lg bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
        size="icon"
        aria-label={isOpen ? "Close dev role switcher" : "Open dev role switcher"}
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
              const isActive = activeRole === r.id || (!activeRole && role === r.id);

              const Icon = r.icon;
              return (
                <div key={r.id} className="flex items-stretch gap-1">
                  <Button
                    variant={isActive ? "default" : "outline"}
                    className="flex-1 justify-start gap-2"
                    onClick={() => handleRoleSwitch(r.id, r.path)}
                    aria-pressed={isActive}
                  >
                    <div className={`p-1 rounded ${r.color}`}>
                      <Icon className="w-3 h-3 text-white" />
                    </div>
                    <span className="text-sm">{r.label}</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="shrink-0"
                    onClick={() => handleAnalyticsJump(r.id, r.analyticsPath)}
                    title={`${r.label} analytics`}
                    aria-label={`Open ${r.label} analytics`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </Button>
                </div>
              );
            })}
          </div>
          <div className="mt-3 pt-2 border-t space-y-1">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/therapist-analytics")}
            >
              📊 Clinical Analytics Hub
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs"
              onClick={() => navigate("/admin")}
            >
              🛡️ Super Admin Hub
            </Button>
          </div>
        </Card>
      )}
    </>
  );
}
