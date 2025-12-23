import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, ArrowLeft, BarChart3, MessageSquare, Users, Clock, Send, FileText, Smartphone, Upload } from "lucide-react";
import { toast } from "sonner";

const students = [
  { id: 1, name: "Alex M.", status: "good", lastActivity: "2 hours ago" },
  { id: 2, name: "Jordan S.", status: "needs-attention", lastActivity: "1 day ago" },
  { id: 3, name: "Sam T.", status: "good", lastActivity: "30 min ago" },
];

const iepComments = [
  "Demonstrates consistent use of easy onset techniques during classroom activities.",
  "Shows improvement in speech fluency when given adequate wait time.",
  "Successfully applies breathing techniques before oral presentations.",
  "Benefits from visual cues and reminders for fluency strategies.",
  "Participates actively in group discussions with increased confidence.",
];

const TeacherHub = () => {
  const navigate = useNavigate();
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [selectedRecipient, setSelectedRecipient] = useState<string>("");
  const [comment, setComment] = useState("");
  const [quickLog, setQuickLog] = useState<string>("");

  const handleQuickLog = (emoji: string) => {
    setQuickLog(emoji);
    toast.success(`Quick log recorded: ${emoji === "😃" ? "Great session" : emoji === "😐" ? "Okay session" : "Challenging session"}`);
  };

  const handleSubmitComment = () => {
    if (comment.trim() && selectedStudent && selectedRecipient) {
      toast.success(`Comment sent to ${selectedRecipient === "parent" ? "parent" : "student"}`);
      setComment("");
      setSelectedStudent("");
      setSelectedRecipient("");
    } else {
      toast.error("Please select a student, recipient, and add a comment");
    }
  };

  const handleConnectApp = () => {
    toast.success("App connection initiated - sync classroom observation data");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
      {/* Header */}
      <header className="glass-card-strong border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/signin")}
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-foreground">Teacher Portal</span>
            </div>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Pinned Strategy */}
            <Card className="bg-gold/20 border-gold/30">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="text-4xl">📌</div>
                  <div>
                    <h3 className="font-display font-bold text-lg text-foreground mb-1">Current Focus Strategy</h3>
                    <p className="text-foreground/80">Give 5 seconds of 'Wait Time' before expecting a response. This reduces pressure and supports fluency.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Action Widget */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  Quick Session Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">One-tap logging for busy lessons:</p>
                <div className="flex gap-4 justify-center">
                  {["😃", "😐", "😟"].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleQuickLog(emoji)}
                      className={`text-5xl p-4 rounded-xl transition-all hover:scale-110 ${
                        quickLog === emoji ? "bg-primary/20 ring-2 ring-primary" : "bg-secondary/50 hover:bg-secondary"
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
                <div className="mt-4 flex justify-center gap-8 text-sm text-muted-foreground">
                  <span>Great</span>
                  <span>Okay</span>
                  <span>Challenging</span>
                </div>
              </CardContent>
            </Card>

            {/* App Integration */}
            <Card className="glass-card-strong border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Connect Classroom App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Sync observation recordings from the mobile app to generate personalized exercise recommendations for each student.
                </p>
                <Button onClick={handleConnectApp} className="w-full" variant="navy">
                  <Upload className="w-4 h-4 mr-2" />
                  Connect & Sync Data
                </Button>
              </CardContent>
            </Card>

            {/* Comment System */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-accent-orange" />
                  Send Comment to Parent or Student
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Student" />
                    </SelectTrigger>
                    <SelectContent>
                      {students.map((student) => (
                        <SelectItem key={student.id} value={student.id.toString()}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={selectedRecipient} onValueChange={setSelectedRecipient}>
                    <SelectTrigger>
                      <SelectValue placeholder="Send To" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="parent">Parent</SelectItem>
                      <SelectItem value="student">Student (Victory Log)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Textarea
                  placeholder="Write your observation or encouragement..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                />
                <Button onClick={handleSubmitComment} className="w-full" variant="navy">
                  <Send className="w-4 h-4 mr-2" />
                  Send Comment
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Students Overview */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  My Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg cursor-pointer hover:bg-secondary transition-colors"
                    onClick={() => navigate("/analytics/teacher")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        student.status === "good" ? "bg-success" : "bg-gold"
                      }`} />
                      <span className="font-medium text-foreground">{student.name}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{student.lastActivity}</span>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/analytics/teacher")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View All Analytics
                </Button>
              </CardContent>
            </Card>

            {/* IEP Comment Bank */}
            <Card className="glass-card-strong">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-gold" />
                  IEP Comment Bank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={(value) => {
                  setComment(value);
                  toast.info("Comment added to text box");
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select pre-written comment" />
                  </SelectTrigger>
                  <SelectContent>
                    {iepComments.map((comment, index) => (
                      <SelectItem key={index} value={comment}>
                        {comment.substring(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-2">
                  Evidence-based comments for IEP documentation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherHub;
