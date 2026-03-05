import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calculator, PoundSterling, Users, GraduationCap, Info } from "lucide-react";

const LICENCE_COST_MONTHLY = 4.99;
const HARDWARE_COST = 89;
const CLINICAL_LICENCE_MONTHLY = 9.99;

type FundingSource = "high-needs" | "pupil-premium" | "mixed";

const SendFundingCalculator = () => {
  const [studentCount, setStudentCount] = useState(5);
  const [fundingSource, setFundingSource] = useState<FundingSource>("high-needs");
  const [annualBudget, setAnnualBudget] = useState(6000);
  const [includeHardware, setIncludeHardware] = useState(true);
  const [clinicianCount, setClinicianCount] = useState(1);

  const annualStudentCost = studentCount * (LICENCE_COST_MONTHLY * 12 + (includeHardware ? HARDWARE_COST : 0));
  const annualClinicianCost = clinicianCount * CLINICAL_LICENCE_MONTHLY * 12;
  const totalAnnualCost = annualStudentCost + annualClinicianCost;
  const remainingBudget = annualBudget - totalAnnualCost;
  const perPupilCost = studentCount > 0 ? totalAnnualCost / studentCount : 0;
  const withinBudget = remainingBudget >= 0;

  const pupilPremiumRate = 1480; // 2024/25 primary rate
  const pupilPremiumCoverage = studentCount > 0 ? Math.min(100, (pupilPremiumRate / perPupilCost) * 100) : 0;

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Calculator className="w-5 h-5 text-primary" />
          </div>
          <div>
            <CardTitle className="text-xl">SEND Funding Calculator</CardTitle>
            <CardDescription>Calculate compliant allocation of High Needs Block or Pupil Premium funding</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" /> Number of Pupils
            </Label>
            <Input
              type="number"
              min={1}
              max={200}
              value={studentCount}
              onChange={(e) => setStudentCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GraduationCap className="w-4 h-4" /> Clinician Licences
            </Label>
            <Input
              type="number"
              min={0}
              max={50}
              value={clinicianCount}
              onChange={(e) => setClinicianCount(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
          <div className="space-y-2">
            <Label>Funding Source</Label>
            <Select value={fundingSource} onValueChange={(v) => setFundingSource(v as FundingSource)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="high-needs">High Needs Block (Element 3)</SelectItem>
                <SelectItem value="pupil-premium">Pupil Premium</SelectItem>
                <SelectItem value="mixed">Mixed Funding</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <PoundSterling className="w-4 h-4" /> Annual Budget (£)
            </Label>
            <Input
              type="number"
              min={0}
              value={annualBudget}
              onChange={(e) => setAnnualBudget(Math.max(0, parseInt(e.target.value) || 0))}
            />
          </div>
        </div>

        {/* Hardware toggle */}
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={includeHardware}
            onChange={(e) => setIncludeHardware(e.target.checked)}
            className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
          />
          <span className="text-sm text-muted-foreground">Include Stammerly Pendant hardware (£{HARDWARE_COST}/unit, one-off)</span>
        </label>

        {/* Results */}
        <div className="border-t border-border pt-4 space-y-3">
          <h3 className="font-display font-semibold text-foreground">Cost Breakdown</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Pupil Licences</p>
              <p className="font-display font-bold text-lg text-foreground">£{annualStudentCost.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">/year</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Clinician Licences</p>
              <p className="font-display font-bold text-lg text-foreground">£{annualClinicianCost.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">/year</p>
            </div>
            <div className="bg-secondary/50 rounded-xl p-3 text-center">
              <p className="text-xs text-muted-foreground">Per-Pupil Cost</p>
              <p className="font-display font-bold text-lg text-foreground">£{perPupilCost.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">/year</p>
            </div>
            <div className={`rounded-xl p-3 text-center ${withinBudget ? "bg-success/10" : "bg-destructive/10"}`}>
              <p className="text-xs text-muted-foreground">Remaining Budget</p>
              <p className={`font-display font-bold text-lg ${withinBudget ? "text-success" : "text-destructive"}`}>
                £{Math.abs(remainingBudget).toLocaleString()}
              </p>
              <p className="text-xs text-muted-foreground">{withinBudget ? "surplus" : "shortfall"}</p>
            </div>
          </div>
        </div>

        {/* Compliance notes */}
        <div className="bg-primary/5 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
            <div className="text-sm text-muted-foreground space-y-1">
              {fundingSource === "high-needs" && (
                <p>High Needs Block Element 3 (top-up funding) can be used for specialist assistive technology where specified in the pupil's EHCP. Stammerly qualifies as a speech &amp; language intervention tool.</p>
              )}
              {fundingSource === "pupil-premium" && (
                <p>Pupil Premium (£{pupilPremiumRate}/pupil for 2024-25) can fund evidence-based interventions. At £{perPupilCost.toFixed(2)}/pupil, Stammerly uses <strong>{pupilPremiumCoverage.toFixed(0)}%</strong> of the per-pupil allocation.</p>
              )}
              {fundingSource === "mixed" && (
                <p>Schools can combine Element 3 top-up funding with Pupil Premium allocations. Ensure each funding source is separately accounted for in your annual Pupil Premium strategy statement.</p>
              )}
              <Badge variant="outline" className="mt-1">DfE Compliant</Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SendFundingCalculator;
