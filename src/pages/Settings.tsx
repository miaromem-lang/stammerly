import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { HubNavigation } from "@/components/HubNavigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

type AudioProfile = "quiet" | "classroom" | "cafeteria" | "outdoor";

const ENVIRONMENTS: { value: AudioProfile; label: string; description: string }[] = [
  { value: "quiet",     label: "Quiet",     description: "Home, therapy room, or other low-noise space." },
  { value: "classroom", label: "Classroom", description: "Moderate background chatter and movement." },
  { value: "cafeteria", label: "Cafeteria", description: "Loud, multi-speaker environments with reverberation." },
  { value: "outdoor",   label: "Outdoor",   description: "Wind, traffic, or open-air variability." },
];

const STORAGE_KEYS = {
  name:        "stammerly.settings.childName",
  yearGroup:   "stammerly.settings.yearGroup",
  environment: "stammerly.settings.audioProfile",
};

export const loadSavedProfile = (): AudioProfile => {
  const v = localStorage.getItem(STORAGE_KEYS.environment) as AudioProfile | null;
  return v && ENVIRONMENTS.some(e => e.value === v) ? v : "quiet";
};

export const loadSavedName = (): string => localStorage.getItem(STORAGE_KEYS.name) ?? "";

const Settings = () => {
  const [childName, setChildName] = useState("");
  const [yearGroup, setYearGroup] = useState("");
  const [environment, setEnvironment] = useState<AudioProfile>("quiet");

  useEffect(() => {
    setChildName(localStorage.getItem(STORAGE_KEYS.name) ?? "");
    setYearGroup(localStorage.getItem(STORAGE_KEYS.yearGroup) ?? "");
    setEnvironment(loadSavedProfile());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem(STORAGE_KEYS.name, childName.trim());
    localStorage.setItem(STORAGE_KEYS.yearGroup, yearGroup.trim());
    localStorage.setItem(STORAGE_KEYS.environment, environment);
    toast.success("Settings saved");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30">
      <Helmet>
        <title>Settings | Stammerly</title>
        <meta name="description" content="Configure child profile, audio environment, and privacy preferences." />
        <link rel="canonical" href="/settings" />
      </Helmet>
      <HubNavigation />
      <main className="container mx-auto px-4 py-6 sm:py-10 pb-24 sm:pb-10">
        <div className="max-w-2xl mx-auto">
          <header className="mb-8">
            <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Personalise the detector for your child and environment.
            </p>
          </header>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Child Profile */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Child Profile</CardTitle>
                <CardDescription>Used to personalise the session interface.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="childName">Child's name</Label>
                  <Input
                    id="childName"
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="e.g. Leo"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearGroup">Year group</Label>
                  <Input
                    id="yearGroup"
                    value={yearGroup}
                    onChange={(e) => setYearGroup(e.target.value)}
                    placeholder="e.g. Year 4"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Audio Environment */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Audio Environment</CardTitle>
                <CardDescription>Tune detection sensitivity to background noise.</CardDescription>
              </CardHeader>
              <CardContent>
                <RadioGroup
                  value={environment}
                  onValueChange={(v) => setEnvironment(v as AudioProfile)}
                  className="space-y-3"
                >
                  {ENVIRONMENTS.map((env) => (
                    <label
                      key={env.value}
                      htmlFor={`env-${env.value}`}
                      className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors ${
                        environment === env.value
                          ? "border-primary bg-primary/5"
                          : "border-border hover:bg-muted/40"
                      }`}
                    >
                      <RadioGroupItem id={`env-${env.value}`} value={env.value} className="mt-1" />
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{env.label}</div>
                        <div className="text-sm text-muted-foreground">{env.description}</div>
                      </div>
                    </label>
                  ))}
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Privacy */}
            <Card className="bg-white shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-primary" />
                  Privacy
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Stammerly analyses speech in real time, directly on your device.
                  <strong className="text-foreground"> No audio is ever recorded, uploaded, or stored.</strong>{" "}
                  Only anonymised disfluency markers (such as block or repetition counts) are kept,
                  in line with UK GDPR and our Children's Privacy Notice.
                </p>
              </CardContent>
            </Card>

            <div className="flex justify-end">
              <Button type="submit">Save settings</Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default Settings;
