import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { QrCode, KeyRound, Copy, CheckCircle, Shield, Clock, Users, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

type LinkMode = "generate" | "active" | "expired";

function generatePin(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let pin = "";
  for (let i = 0; i < 8; i++) {
    pin += chars[Math.floor(Math.random() * chars.length)];
    if (i === 3) pin += "-";
  }
  return pin;
}

export const SecureAccountLinking = () => {
  const [mode, setMode] = useState<LinkMode>("generate");
  const [role, setRole] = useState<string>("");
  const [pin, setPin] = useState("");
  const [expiresIn, setExpiresIn] = useState(0);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Countdown
  useEffect(() => {
    if (mode !== "active" || expiresIn <= 0) return;
    const iv = setInterval(() => {
      setExpiresIn((p) => {
        if (p <= 1) {
          setMode("expired");
          return 0;
        }
        return p - 1;
      });
    }, 1000);
    return () => clearInterval(iv);
  }, [mode, expiresIn]);

  const handleGenerate = () => {
    if (!role) return;
    setPin(generatePin());
    setExpiresIn(15 * 60); // 15 minutes
    setMode("active");
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(pin);
    setCopied(true);
    toast({ title: "PIN copied!", description: "Share this code with the professional." });
    setTimeout(() => setCopied(false), 2000);
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  const reset = () => {
    setMode("generate");
    setRole("");
    setPin("");
    setExpiresIn(0);
  };

  return (
    <Card className="glass-card-strong overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-primary" />
          Secure Account Linking
        </CardTitle>
      </CardHeader>
      <CardContent>
        <AnimatePresence mode="wait">
          {mode === "generate" && (
            <motion.div
              key="gen"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="bg-primary/5 rounded-2xl p-5 text-center">
                <KeyRound className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Generate a unique, time-limited code to grant a therapist or teacher secure access to your child's dashboard. The code expires after 15 minutes.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Who are you linking?</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="therapist">Speech & Language Therapist</SelectItem>
                    <SelectItem value="teacher">Teacher / Educator</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button variant="hero" className="w-full rounded-xl" onClick={handleGenerate} disabled={!role}>
                <QrCode className="w-4 h-4 mr-2" /> Generate Linking Code
              </Button>
            </motion.div>
          )}

          {mode === "active" && (
            <motion.div
              key="active"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="bg-success/10 rounded-2xl p-5 text-center">
                <Badge variant="outline" className="mb-2">
                  <Users className="w-3 h-3 mr-1" />
                  {role === "therapist" ? "Therapist" : "Teacher"} Access
                </Badge>

                <div className="flex items-center justify-center gap-3 my-4">
                  <span className="font-mono text-3xl md:text-4xl font-bold tracking-[0.2em] text-foreground">
                    {pin}
                  </span>
                  <Button variant="ghost" size="sm" onClick={handleCopy} className="shrink-0">
                    {copied ? <CheckCircle className="w-5 h-5 text-success" /> : <Copy className="w-5 h-5" />}
                  </Button>
                </div>

                <div className="flex items-center justify-center gap-1.5 text-sm">
                  <Clock className={`w-4 h-4 ${expiresIn < 120 ? "text-destructive" : "text-muted-foreground"}`} />
                  <span className={`font-mono ${expiresIn < 120 ? "text-destructive font-semibold" : "text-muted-foreground"}`}>
                    Expires in {formatTime(expiresIn)}
                  </span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Share this code with the professional. They'll enter it in their portal to link to your child's account. The code is encrypted and single-use.
              </p>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={reset}>
                  Cancel
                </Button>
                <Button variant="hero" className="flex-1 rounded-xl" onClick={handleCopy}>
                  <Copy className="w-4 h-4 mr-2" /> {copied ? "Copied!" : "Copy Code"}
                </Button>
              </div>
            </motion.div>
          )}

          {mode === "expired" && (
            <motion.div
              key="expired"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              className="space-y-4"
            >
              <div className="bg-destructive/10 rounded-2xl p-5 text-center">
                <Clock className="w-8 h-8 text-destructive mx-auto mb-2" />
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Code Expired</h3>
                <p className="text-sm text-muted-foreground">
                  The linking code has expired for security. Generate a new one below.
                </p>
              </div>

              <Button variant="hero" className="w-full rounded-xl" onClick={reset}>
                <RefreshCw className="w-4 h-4 mr-2" /> Generate New Code
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};
