import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Sparkles, Shield, Brain, Users, Lock, Eye, UserCheck, Trash2, AlertTriangle } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { toast } from "sonner";

const badges = [
  { name: "HIPAA", icon: Shield },
  { name: "UK GDPR", icon: Lock },
  { name: "UCL Ethics", icon: UserCheck },
];

const Ethics = () => {
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteRequest = () => {
    setIsDeleting(true);
    setTimeout(() => {
      toast.success("Data deletion request submitted. You will receive confirmation within 72 hours.");
      setIsDeleting(false);
    }, 1500);
  };

  return (
    <>
      <Helmet>
        <title>Ethics & Privacy | Stammerly</title>
        <meta name="description" content="Learn about Stammerly's commitment to ethical AI, data privacy, and human oversight in speech therapy technology." />
      </Helmet>
      
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/30">
        {/* Header */}
        <header className="bg-background/80 backdrop-blur-sm border-b border-border sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <button 
                onClick={() => navigate("/")}
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span>Home</span>
              </button>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-primary-foreground" />
                </div>
                <span className="font-display font-bold text-xl text-foreground">Stammerly</span>
              </div>
              <div className="w-20" />
            </div>
          </div>
        </header>

        <main className="container mx-auto px-4 py-16">
          {/* Hero */}
          <div className="text-center max-w-3xl mx-auto mb-12">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full mb-6">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">UCL DUTE Standards</span>
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
              Human-Centred AI & Data Sovereignty
            </h1>
            <p className="text-lg text-muted-foreground">
              Built with rigorous ethical standards and complete transparency
            </p>
          </div>

          {/* Main Tabs Card */}
          <div className="max-w-4xl mx-auto mb-12">
            <Card className="bg-card/80 backdrop-blur-sm">
              <CardContent className="p-0">
                <Tabs defaultValue="privacy" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent h-auto p-0">
                    <TabsTrigger 
                      value="privacy" 
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Privacy
                    </TabsTrigger>
                    <TabsTrigger 
                      value="accuracy"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Accuracy
                    </TabsTrigger>
                    <TabsTrigger 
                      value="oversight"
                      className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent px-8 py-4"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Human Oversight
                    </TabsTrigger>
                  </TabsList>
                  
                  <div className="p-8">
                    <TabsContent value="privacy" className="mt-0">
                      <div className="flex items-start gap-6">
                        <div className="p-4 rounded-xl bg-primary/10">
                          <Lock className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-semibold mb-3">UK GDPR Compliant</h3>
                          <p className="text-muted-foreground mb-4">
                            All data is encrypted at rest and in transit. Voice recordings are processed 
                            locally where possible, with explicit consent for cloud processing.
                          </p>
                          <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                            <div className="flex items-center gap-3">
                              <Trash2 className="w-5 h-5 text-destructive" />
                              <div className="flex-1">
                                <p className="font-medium text-sm">Delete My Voice Data</p>
                                <p className="text-xs text-muted-foreground">
                                  Request complete deletion of all voice recordings
                                </p>
                              </div>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={handleDeleteRequest}
                                disabled={isDeleting}
                              >
                                {isDeleting ? "Requesting..." : "Request"}
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="accuracy" className="mt-0">
                      <div className="flex items-start gap-6">
                        <div className="p-4 rounded-xl bg-primary/10">
                          <Eye className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-semibold mb-3">Non-Bias Guarantee</h3>
                          <p className="text-muted-foreground mb-4">
                            Our AI models are trained on diverse speech patterns across accents, 
                            ages, and speaking styles. Regular audits ensure fair and accurate detection.
                          </p>
                          <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 rounded-lg bg-secondary/50">
                              <p className="text-2xl font-bold text-primary">15+</p>
                              <p className="text-xs text-muted-foreground">Accent Variants</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-secondary/50">
                              <p className="text-2xl font-bold text-primary">4-18</p>
                              <p className="text-xs text-muted-foreground">Age Range</p>
                            </div>
                            <div className="text-center p-4 rounded-lg bg-secondary/50">
                              <p className="text-2xl font-bold text-primary">98%</p>
                              <p className="text-xs text-muted-foreground">Accuracy Rate</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="oversight" className="mt-0">
                      <div className="flex items-start gap-6">
                        <div className="p-4 rounded-xl bg-primary/10">
                          <Users className="w-8 h-8 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-display text-xl font-semibold mb-3">AI Supports, Humans Decide</h3>
                          <p className="text-muted-foreground mb-4">
                            Our AI flags patterns and provides insights, but all clinical decisions 
                            are made by qualified speech and language therapists.
                          </p>
                          <div className="p-4 rounded-lg bg-gold/10 border border-gold/30">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className="w-5 h-5 text-gold mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-foreground">
                                  Important Disclaimer
                                </p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  "AI flags patterns; humans make diagnoses. Stammerly is a support tool, 
                                  not a replacement for professional clinical judgement."
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Compliance Badges */}
          <div className="flex justify-center gap-8 mb-16">
            {badges.map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.name} className="flex flex-col items-center gap-2">
                  <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                    <Icon className="w-8 h-8 text-primary" />
                  </div>
                  <span className="text-sm font-medium text-muted-foreground">{badge.name}</span>
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="text-center">
            <Button variant="navy" size="lg" onClick={() => navigate("/signin")}>
              Start Your Secure Journey
            </Button>
          </div>
        </main>
      </div>
    </>
  );
};

export default Ethics;