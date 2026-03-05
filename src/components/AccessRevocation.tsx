import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldOff, ShieldCheck, UserX, Clock, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface LinkedProfessional {
  id: string;
  name: string;
  role: "therapist" | "teacher";
  linkedAt: string;
  active: boolean;
}

const STORAGE_KEY = "stammerly_linked_professionals";

const getDefaultProfessionals = (): LinkedProfessional[] => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch {}
  return [
    { id: "1", name: "Dr. Sarah Thompson", role: "therapist", linkedAt: "2025-12-15", active: true },
    { id: "2", name: "Mr. James Wilson", role: "teacher", linkedAt: "2026-01-08", active: true },
  ];
};

export const AccessRevocation = () => {
  const [professionals, setProfessionals] = useState<LinkedProfessional[]>(getDefaultProfessionals);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(professionals));
  }, [professionals]);

  const handleRevoke = (id: string) => {
    if (confirmId === id) {
      setProfessionals((prev) =>
        prev.map((p) => (p.id === id ? { ...p, active: false } : p))
      );
      setConfirmId(null);
      toast.success("Access revoked. This professional can no longer view your child's dashboard.");
    } else {
      setConfirmId(id);
    }
  };

  const handleRestore = (id: string) => {
    setProfessionals((prev) =>
      prev.map((p) => (p.id === id ? { ...p, active: true } : p))
    );
    toast.success("Access restored successfully.");
  };

  const activeProfessionals = professionals.filter((p) => p.active);
  const revokedProfessionals = professionals.filter((p) => !p.active);

  return (
    <Card className="glass-card-strong">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <ShieldCheck className="w-5 h-5 text-success" />
          Access Control
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Manage who can view your child's dashboard
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Active Professionals */}
        {activeProfessionals.length === 0 && revokedProfessionals.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No professionals linked yet. Use the Pendant Setup to link a therapist or teacher.
          </p>
        )}

        {activeProfessionals.map((prof) => (
          <div
            key={prof.id}
            className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg border border-border"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center text-lg">
                {prof.role === "therapist" ? "🩺" : "🏫"}
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">{prof.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {prof.role}
                  </Badge>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    Since {new Date(prof.linkedAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                  </span>
                </div>
              </div>
            </div>
            <Button
              variant={confirmId === prof.id ? "destructive" : "outline"}
              size="sm"
              className="gap-1 text-xs"
              onClick={() => handleRevoke(prof.id)}
            >
              {confirmId === prof.id ? (
                <>
                  <AlertTriangle className="w-3 h-3" />
                  Confirm Revoke
                </>
              ) : (
                <>
                  <UserX className="w-3 h-3" />
                  Revoke
                </>
              )}
            </Button>
          </div>
        ))}

        {/* Revoked Professionals */}
        {revokedProfessionals.length > 0 && (
          <div className="border-t border-border pt-4">
            <p className="text-xs font-medium text-muted-foreground mb-3 flex items-center gap-1">
              <ShieldOff className="w-3 h-3" />
              Revoked Access
            </p>
            {revokedProfessionals.map((prof) => (
              <div
                key={prof.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg opacity-75 mb-2"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-lg grayscale">
                    {prof.role === "therapist" ? "🩺" : "🏫"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground line-through">{prof.name}</p>
                    <Badge variant="outline" className="text-[10px] text-destructive border-destructive/30">
                      Access Revoked
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-success"
                  onClick={() => handleRestore(prof.id)}
                >
                  Restore
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="bg-primary/5 rounded-lg p-3">
          <p className="text-[10px] text-muted-foreground">
            🔒 Revoking access is instant. The professional will no longer see any data. You can restore access at any time.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
