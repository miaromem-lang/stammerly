import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Clock, PoundSterling, FileText } from "lucide-react";

const TherapistROICalculator = () => {
  const [weeklyPatients, setWeeklyPatients] = useState(20);
  const [hourlyRate, setHourlyRate] = useState(65);

  // Assumptions
  const minutesPerNoteManual = 18;
  const minutesPerNoteStammerly = 3;
  const minutesSaved = minutesPerNoteManual - minutesPerNoteStammerly;
  const weeklySavedMinutes = weeklyPatients * minutesSaved;
  const weeklySavedHours = weeklySavedMinutes / 60;
  const annualSavedHours = weeklySavedHours * 46; // 46 working weeks
  const annualRevenueRecovered = annualSavedHours * hourlyRate;
  const stammerlyAnnualCost = 9.99 * 12;
  const netBenefit = annualRevenueRecovered - stammerlyAnnualCost;
  const roi = stammerlyAnnualCost > 0 ? ((netBenefit / stammerlyAnnualCost) * 100).toFixed(0) : "0";

  return (
    <Card variant="glass" className="w-full">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-success" />
          </div>
          <div>
            <CardTitle className="text-xl">Therapist ROI Calculator</CardTitle>
            <CardDescription>See how much billable time you'll recover by automating clinical notes</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Sliders */}
        <div className="space-y-5">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" /> Weekly Patients
              </label>
              <span className="font-display font-bold text-lg text-foreground">{weeklyPatients}</span>
            </div>
            <Slider
              value={[weeklyPatients]}
              onValueChange={(v) => setWeeklyPatients(v[0])}
              min={5}
              max={60}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>5</span>
              <span>60</span>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-foreground flex items-center gap-2">
                <PoundSterling className="w-4 h-4 text-muted-foreground" /> Hourly Rate (£)
              </label>
              <span className="font-display font-bold text-lg text-foreground">£{hourlyRate}</span>
            </div>
            <Slider
              value={[hourlyRate]}
              onValueChange={(v) => setHourlyRate(v[0])}
              min={30}
              max={150}
              step={5}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>£30</span>
              <span>£150</span>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="border-t border-border pt-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-success/5 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="font-display font-bold text-2xl text-foreground">{weeklySavedHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">saved per week</p>
            </div>
            <div className="bg-success/5 rounded-xl p-4 text-center">
              <Clock className="w-5 h-5 text-success mx-auto mb-1" />
              <p className="font-display font-bold text-2xl text-foreground">{annualSavedHours.toFixed(0)}h</p>
              <p className="text-xs text-muted-foreground">saved per year</p>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 text-center col-span-2">
              <PoundSterling className="w-5 h-5 text-primary mx-auto mb-1" />
              <p className="font-display font-bold text-3xl text-foreground">£{annualRevenueRecovered.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">billable revenue recovered annually</p>
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="bg-foreground/5 rounded-xl p-4 text-sm text-muted-foreground space-y-2">
          <p>
            Based on reducing note-writing from <strong>{minutesPerNoteManual} min</strong> to <strong>{minutesPerNoteStammerly} min</strong> per session via automated SOAP note generation.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="bg-success/10 text-success border-success/20">{roi}% ROI</Badge>
            <Badge variant="outline">Stammerly cost: £{stammerlyAnnualCost.toFixed(2)}/yr</Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default TherapistROICalculator;
