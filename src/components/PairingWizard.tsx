import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bluetooth, Wifi, CheckCircle, XCircle, Loader2, ArrowRight, ArrowLeft, AlertTriangle, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

type WizardStep = "bluetooth" | "bt-searching" | "bt-success" | "bt-fail" | "wifi" | "wifi-connecting" | "wifi-success" | "wifi-fail" | "done";

const troubleshooting: Record<string, string[]> = {
  "bt-fail": [
    "Ensure the pendant is charged and powered on (hold the button for 3 seconds).",
    "Move the pendant within 1 metre of this device.",
    "Turn Bluetooth off and on again in your device settings.",
    "Restart the pendant by holding the button for 10 seconds.",
  ],
  "wifi-fail": [
    "Check your Wi-Fi password is correct.",
    "Move closer to your Wi-Fi router.",
    "Ensure your network is a 2.4 GHz band — the pendant doesn't support 5 GHz.",
    "Restart your router and try again.",
  ],
};

export const PairingWizard = () => {
  const [step, setStep] = useState<WizardStep>("bluetooth");

  const simulateSearch = (successStep: WizardStep, failStep: WizardStep) => {
    // 80% success simulation
    setTimeout(() => {
      setStep(Math.random() > 0.2 ? successStep : failStep);
    }, 3000);
  };

  const startBtSearch = () => {
    setStep("bt-searching");
    simulateSearch("bt-success", "bt-fail");
  };

  const startWifiConnect = () => {
    setStep("wifi-connecting");
    simulateSearch("wifi-success", "wifi-fail");
  };

  const stepIndex = ["bluetooth", "bt-searching", "bt-success", "bt-fail", "wifi", "wifi-connecting", "wifi-success", "wifi-fail", "done"].indexOf(step);
  const progressValue = step === "done" ? 100 : step.startsWith("wifi") ? 66 : 33;

  return (
    <Card className="glass-card-strong overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bluetooth className="w-5 h-5 text-primary" />
          Connection Setup
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Progress value={progressValue} className="h-1.5 mb-6" />

        <AnimatePresence mode="wait">
          {/* Bluetooth intro */}
          {step === "bluetooth" && (
            <StepPanel key="bt">
              <StepVisual emoji="📡" colour="bg-accent-sky/10">
                <h3 className="font-display text-lg font-bold text-foreground">Step 1: Pair via Bluetooth</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Press and hold the pendant button until the light pulses blue, then tap "Search" below.
                </p>
              </StepVisual>
              <IllustrationSteps steps={["Hold pendant button 3s", "Light pulses blue", "Tap Search below"]} />
              <Button variant="hero" className="w-full rounded-xl" onClick={startBtSearch}>
                <Bluetooth className="w-4 h-4 mr-2" /> Search for Pendant
              </Button>
            </StepPanel>
          )}

          {/* BT searching */}
          {step === "bt-searching" && (
            <StepPanel key="bt-search">
              <div className="flex flex-col items-center py-8 gap-4">
                <Loader2 className="w-10 h-10 text-accent-sky animate-spin" />
                <p className="text-muted-foreground font-medium">Searching for Stammerly Pendant…</p>
              </div>
            </StepPanel>
          )}

          {/* BT success */}
          {step === "bt-success" && (
            <StepPanel key="bt-ok">
              <StepVisual emoji="✅" colour="bg-success/10">
                <h3 className="font-display text-lg font-bold text-foreground">Bluetooth Connected!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Stammerly Pendant is paired. Now let's connect it to Wi-Fi so sessions sync automatically.
                </p>
              </StepVisual>
              <Button variant="hero" className="w-full rounded-xl" onClick={() => setStep("wifi")}>
                <ArrowRight className="w-4 h-4 mr-2" /> Next: Wi-Fi Setup
              </Button>
            </StepPanel>
          )}

          {/* BT fail */}
          {step === "bt-fail" && (
            <StepPanel key="bt-fail">
              <StepVisual emoji="⚠️" colour="bg-destructive/10">
                <h3 className="font-display text-lg font-bold text-foreground">Couldn't find pendant</h3>
              </StepVisual>
              <TroubleshootList items={troubleshooting["bt-fail"]} />
              <Button variant="hero" className="w-full rounded-xl" onClick={startBtSearch}>
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </StepPanel>
          )}

          {/* Wi-Fi intro */}
          {step === "wifi" && (
            <StepPanel key="wifi">
              <StepVisual emoji="📶" colour="bg-primary/10">
                <h3 className="font-display text-lg font-bold text-foreground">Step 2: Connect to Wi-Fi</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  The pendant will use your home Wi-Fi to sync recordings. Select your network below.
                </p>
              </StepVisual>
              <IllustrationSteps steps={["Pendant scans for networks", "Select your home Wi-Fi", "Enter your password"]} />
              <Button variant="hero" className="w-full rounded-xl" onClick={startWifiConnect}>
                <Wifi className="w-4 h-4 mr-2" /> Connect to Wi-Fi
              </Button>
            </StepPanel>
          )}

          {/* Wi-Fi connecting */}
          {step === "wifi-connecting" && (
            <StepPanel key="wifi-conn">
              <div className="flex flex-col items-center py-8 gap-4">
                <Loader2 className="w-10 h-10 text-primary animate-spin" />
                <p className="text-muted-foreground font-medium">Connecting to Wi-Fi…</p>
              </div>
            </StepPanel>
          )}

          {/* Wi-Fi success */}
          {step === "wifi-success" && (
            <StepPanel key="wifi-ok">
              <StepVisual emoji="🎉" colour="bg-success/10">
                <h3 className="font-display text-lg font-bold text-foreground">All Connected!</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Your pendant is paired via Bluetooth and connected to Wi-Fi. Sessions will sync automatically.
                </p>
              </StepVisual>
              <Button variant="hero" className="w-full rounded-xl" onClick={() => setStep("done")}>
                <CheckCircle className="w-4 h-4 mr-2" /> Finish Setup
              </Button>
            </StepPanel>
          )}

          {/* Wi-Fi fail */}
          {step === "wifi-fail" && (
            <StepPanel key="wifi-fail">
              <StepVisual emoji="⚠️" colour="bg-destructive/10">
                <h3 className="font-display text-lg font-bold text-foreground">Wi-Fi Connection Failed</h3>
              </StepVisual>
              <TroubleshootList items={troubleshooting["wifi-fail"]} />
              <Button variant="hero" className="w-full rounded-xl" onClick={startWifiConnect}>
                <RefreshCw className="w-4 h-4 mr-2" /> Try Again
              </Button>
            </StepPanel>
          )}

          {/* Done */}
          {step === "done" && (
            <StepPanel key="done">
              <div className="bg-success/10 rounded-2xl p-6 text-center">
                <span className="text-4xl mb-2 block">🚀</span>
                <h3 className="font-display text-lg font-bold text-foreground mb-1">Setup Complete</h3>
                <p className="text-sm text-muted-foreground">
                  The pendant is ready. Your child can start wearing it and recordings will sync to the platform automatically.
                </p>
              </div>
            </StepPanel>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
};

/* Sub-components */
const StepPanel = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    className="space-y-4"
  >
    {children}
  </motion.div>
);

const StepVisual = ({ emoji, colour, children }: { emoji: string; colour: string; children: React.ReactNode }) => (
  <div className={`${colour} rounded-2xl p-5`}>
    <span className="text-3xl mb-2 block text-center">{emoji}</span>
    <div className="text-center">{children}</div>
  </div>
);

const IllustrationSteps = ({ steps }: { steps: string[] }) => (
  <div className="flex items-center gap-2 justify-center">
    {steps.map((s, i) => (
      <div key={i} className="flex items-center gap-2">
        <div className="flex flex-col items-center gap-1">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
            {i + 1}
          </div>
          <span className="text-[11px] text-muted-foreground text-center max-w-[80px]">{s}</span>
        </div>
        {i < steps.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground/40 mb-4" />}
      </div>
    ))}
  </div>
);

const TroubleshootList = ({ items }: { items: string[] }) => (
  <div className="space-y-2">
    <p className="text-sm font-semibold text-foreground flex items-center gap-1.5">
      <AlertTriangle className="w-4 h-4 text-accent-orange" /> Troubleshooting
    </p>
    <ul className="space-y-2">
      {items.map((item, i) => (
        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
          <span className="text-primary font-bold mt-0.5">{i + 1}.</span>
          {item}
        </li>
      ))}
    </ul>
  </div>
);
