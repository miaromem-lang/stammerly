import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { StammerDetector } from "@/components/StammerDetector";
import { HubNavigation } from "@/components/HubNavigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loadSavedName, loadSavedProfile } from "@/pages/Settings";

type Role = "parent" | "therapist" | "child";

const Session = () => {
  const [childName, setChildName] = useState(() => loadSavedName());
  const [role, setRole] = useState<Role>("parent");
  const [started, setStarted] = useState(false);
  const [audioProfile] = useState(() => loadSavedProfile());

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!childName.trim()) return;
    setStarted(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Helmet>
        <title>Live Session | Stammerly</title>
        <meta name="description" content="Real-time stammer detection session with Stammerly." />
        <link rel="canonical" href="/session" />
      </Helmet>
      <HubNavigation />
      <main className="container mx-auto px-4 py-10 flex justify-center">
        <div className="w-full max-w-5xl bg-white rounded-2xl shadow-xl p-6 md:p-10">
          {!started ? (
            <form onSubmit={handleStart} className="max-w-md mx-auto space-y-6">
              <div className="space-y-2 text-center">
                <h1 className="text-2xl font-display font-bold text-foreground">
                  Start a Session
                </h1>
                <p className="text-sm text-muted-foreground">
                  Tell us a little about who's using Stammerly today.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="childName">Child's name</Label>
                <Input
                  id="childName"
                  value={childName}
                  onChange={(e) => setChildName(e.target.value)}
                  placeholder="e.g. Leo"
                  required
                  autoFocus
                />
              </div>

              <div className="space-y-2">
                <Label>I am a…</Label>
                <div className="grid grid-cols-3 gap-2">
                  {(["parent", "therapist", "child"] as Role[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`px-3 py-2 rounded-lg border text-sm capitalize transition-colors ${
                        role === r
                          ? "border-primary bg-primary/10 text-primary font-medium"
                          : "border-border bg-card text-muted-foreground hover:text-foreground"
                      }`}
                      aria-pressed={role === r}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <Button type="submit" className="w-full" disabled={!childName.trim()}>
                Continue
              </Button>
            </form>
          ) : (
            <>
              <h1 className="sr-only">Live Stammer Detection Session</h1>
              <StammerDetector
                childName={childName}
                childId="child_001"
                defaultView={role}
                defaultProfile={audioProfile}
              />
            </>
          )}
        </div>
      </main>
    </div>
  );
};

export default Session;
