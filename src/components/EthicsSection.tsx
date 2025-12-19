import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Shield, Brain, Users, Lock, Eye, UserCheck, Trash2 } from "lucide-react";

const badges = [
  { name: "HIPAA", icon: Shield },
  { name: "UK GDPR", icon: Lock },
  { name: "UCL Ethics", icon: UserCheck },
];

export const EthicsSection = () => {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="inline-block bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-4">
            UCL DUTE Standards
          </span>
          <h2 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Human-Centred AI & Data Sovereignty
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Built with rigorous ethical standards and complete transparency
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <Card variant="glassStrong">
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
                            <div>
                              <p className="font-medium text-sm">Delete My Voice Data</p>
                              <p className="text-xs text-muted-foreground">
                                Request complete deletion of all voice recordings
                              </p>
                            </div>
                            <Button variant="outline" size="sm" className="ml-auto">
                              Request
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
                          <p className="text-sm font-medium text-foreground">
                            ⚠️ Important Disclaimer
                          </p>
                          <p className="text-sm text-muted-foreground mt-1">
                            "AI flags patterns; humans make diagnoses. Stammerly is a support tool, 
                            not a replacement for professional clinical judgement."
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </Tabs>
            </CardContent>
          </Card>
          
          {/* Compliance Badges */}
          <div className="flex justify-center gap-8 mt-12">
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
        </div>
      </div>
    </section>
  );
};
