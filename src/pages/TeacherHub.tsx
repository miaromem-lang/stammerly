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
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800">
      {/* Header */}
      <header className="bg-slate-700/50 backdrop-blur-sm border-b border-slate-600">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate("/signin")}
              className="flex items-center gap-2 text-slate-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Back</span>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl text-white">Teacher Portal</span>
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
                    <h3 className="font-display font-bold text-lg text-white mb-1">Current Focus Strategy</h3>
                    <p className="text-slate-200">Give 5 seconds of 'Wait Time' before expecting a response. This reduces pressure and supports fluency.</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Action Widget */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Clock className="w-5 h-5 text-primary" />
                  Quick Session Log
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">One-tap logging for busy lessons:</p>
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
                <div className="mt-4 flex justify-center gap-8 text-sm text-slate-300">
                  <span>Great</span>
                  <span>Okay</span>
                  <span>Challenging</span>
                </div>
              </CardContent>
            </Card>

            {/* App Integration */}
            <Card className="bg-slate-700/50 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Smartphone className="w-5 h-5 text-primary" />
                  Connect Classroom App
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Sync observation recordings from the mobile app to generate personalized exercise recommendations for each student.
                </p>
                <Button onClick={handleConnectApp} className="w-full" variant="navy">
                  <Upload className="w-4 h-4 mr-2" />
                  Connect & Sync Data
                </Button>
              </CardContent>
            </Card>

            {/* Comment System */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
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
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5 text-primary" />
                  My Students
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {students.map((student) => (
                  <div 
                    key={student.id} 
                    className="flex items-center justify-between p-3 bg-slate-600/50 rounded-lg cursor-pointer hover:bg-slate-600 transition-colors"
                    onClick={() => navigate("/analytics/teacher")}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${
                        student.status === "good" ? "bg-success" : "bg-gold"
                      }`} />
                      <span className="font-medium text-white">{student.name}</span>
                    </div>
                    <span className="text-xs text-slate-300">{student.lastActivity}</span>
                  </div>
                ))}
                <Button 
                  variant="outline" 
                  className="w-full border-slate-500 text-white hover:bg-slate-600"
                  onClick={() => navigate("/analytics/teacher")}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  View All Analytics
                </Button>
              </CardContent>
            </Card>

            {/* IEP Comment Bank */}
            <Card className="bg-slate-700/50 border-slate-600">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <FileText className="w-5 h-5 text-gold" />
                  IEP Comment Bank
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Select onValueChange={(value) => {
                  setComment(value);
                  toast.info("Comment added to text box");
                }}>
                  <SelectTrigger className="bg-slate-600 border-slate-500 text-white">
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
                <p className="text-xs text-slate-400 mt-2">
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
