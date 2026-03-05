import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { UsersRound, Send, CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface BulkPatient {
  id: number;
  name: string;
  age: number;
  currentDifficulty: string;
}

const PATIENTS: BulkPatient[] = [
  { id: 1, name: "Alex M.", age: 8, currentDifficulty: "Beginner" },
  { id: 2, name: "Jordan S.", age: 10, currentDifficulty: "Intermediate" },
  { id: 3, name: "Sam T.", age: 7, currentDifficulty: "Beginner" },
  { id: 4, name: "Lily K.", age: 9, currentDifficulty: "Intermediate" },
  { id: 5, name: "Oscar P.", age: 6, currentDifficulty: "Beginner" },
];

const EXERCISES = [
  { id: "easy-onset", name: "Easy Onset Quest", category: "Onset" },
  { id: "slow-speech", name: "Slow Speech Safari", category: "Rate" },
  { id: "breathing", name: "Breathing Bubbles", category: "Breathing" },
  { id: "story-reading", name: "Story Reading", category: "Reading" },
  { id: "phrase-power", name: "Phrase Power", category: "Fluency" },
];

export const BulkAssignment = () => {
  const [open, setOpen] = useState(false);
  const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
  const [action, setAction] = useState<"quest" | "difficulty">("quest");
  const [selectedExercise, setSelectedExercise] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [assigning, setAssigning] = useState(false);
  const [done, setDone] = useState(false);

  const togglePatient = (id: number) => {
    setSelectedPatients((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedPatients.length === PATIENTS.length) {
      setSelectedPatients([]);
    } else {
      setSelectedPatients(PATIENTS.map((p) => p.id));
    }
  };

  const handleAssign = async () => {
    if (selectedPatients.length === 0) {
      toast.error("Please select at least one patient");
      return;
    }
    if (action === "quest" && !selectedExercise) {
      toast.error("Please select an exercise to assign");
      return;
    }
    if (action === "difficulty" && !selectedDifficulty) {
      toast.error("Please select a difficulty level");
      return;
    }

    setAssigning(true);
    await new Promise((r) => setTimeout(r, 1200));
    setAssigning(false);
    setDone(true);

    const names = PATIENTS.filter((p) => selectedPatients.includes(p.id))
      .map((p) => p.name)
      .join(", ");

    if (action === "quest") {
      const ex = EXERCISES.find((e) => e.id === selectedExercise);
      toast.success(`"${ex?.name}" assigned to ${selectedPatients.length} patients`);
    } else {
      toast.success(`Difficulty set to ${selectedDifficulty} for ${selectedPatients.length} patients`);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setDone(false);
    setSelectedPatients([]);
    setSelectedExercise("");
    setSelectedDifficulty("");
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) handleClose(); else setOpen(true); }}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs w-full">
          <UsersRound className="w-3.5 h-3.5" />
          Bulk Assign
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border text-foreground max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UsersRound className="w-5 h-5 text-accent-orange" />
            Bulk Assignment
          </DialogTitle>
        </DialogHeader>

        {done ? (
          <div className="text-center py-6">
            <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-sm font-medium text-foreground mb-1">Assignment Complete!</p>
            <p className="text-xs text-muted-foreground">
              {selectedPatients.length} patients updated successfully.
            </p>
            <Button className="mt-4" onClick={handleClose}>
              Done
            </Button>
          </div>
        ) : (
          <div className="space-y-4 mt-2">
            {/* Action Type */}
            <div className="flex gap-2">
              <Button
                variant={action === "quest" ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setAction("quest")}
              >
                Assign Quest
              </Button>
              <Button
                variant={action === "difficulty" ? "default" : "outline"}
                size="sm"
                className="flex-1 text-xs"
                onClick={() => setAction("difficulty")}
              >
                Set Difficulty
              </Button>
            </div>

            {/* Assignment Target */}
            {action === "quest" ? (
              <Select value={selectedExercise} onValueChange={setSelectedExercise}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select exercise to assign..." />
                </SelectTrigger>
                <SelectContent>
                  {EXERCISES.map((ex) => (
                    <SelectItem key={ex.id} value={ex.id}>
                      {ex.name} ({ex.category})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                <SelectTrigger className="text-xs">
                  <SelectValue placeholder="Select difficulty level..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">🌱 Beginner</SelectItem>
                  <SelectItem value="Intermediate">🌟 Intermediate</SelectItem>
                  <SelectItem value="Advanced">🏆 Advanced</SelectItem>
                </SelectContent>
              </Select>
            )}

            {/* Patient Selection */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-foreground">Select Patients</p>
                <Button variant="ghost" size="sm" className="text-[10px] h-6 px-2" onClick={selectAll}>
                  {selectedPatients.length === PATIENTS.length ? "Deselect All" : "Select All"}
                </Button>
              </div>
              <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
                {PATIENTS.map((patient) => {
                  const isSelected = selectedPatients.includes(patient.id);
                  return (
                    <label
                      key={patient.id}
                      className={`flex items-center gap-3 p-2.5 rounded-lg border cursor-pointer transition-all ${
                        isSelected
                          ? "bg-primary/5 border-primary/30"
                          : "bg-secondary/30 border-border hover:bg-secondary/50"
                      }`}
                    >
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => togglePatient(patient.id)}
                      />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{patient.name}</p>
                        <p className="text-[10px] text-muted-foreground">
                          Age {patient.age} • Currently: {patient.currentDifficulty}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
              {selectedPatients.length > 0 && (
                <p className="text-[10px] text-muted-foreground mt-2">
                  {selectedPatients.length} of {PATIENTS.length} selected
                </p>
              )}
            </div>

            <DialogFooter>
              <Button
                className="w-full gap-2"
                onClick={handleAssign}
                disabled={assigning || selectedPatients.length === 0}
              >
                {assigning ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Assign to {selectedPatients.length} Patient{selectedPatients.length !== 1 ? "s" : ""}
                  </>
                )}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
