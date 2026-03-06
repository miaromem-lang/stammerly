import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { ArrowLeft, GitCommit, Shield, Brain, Zap, BarChart3, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

import { supabase } from "@/integrations/supabase/client";
import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const impactConfig: Record<string, { label: string; color: string }> = {
  major: { label: "Major", color: "bg-primary/10 text-primary border-primary/20" },
  moderate: { label: "Moderate", color: "bg-gold/10 text-gold border-gold/20" },
  minor: { label: "Minor", color: "bg-muted text-muted-foreground" },
};

const areaConfig: Record<string, { label: string; icon: React.ReactNode }> = {
  disfluency_detection: { label: "Disfluency Detection", icon: <Brain className="w-3.5 h-3.5" /> },
  performance: { label: "Performance", icon: <Zap className="w-3.5 h-3.5" /> },
  clinical_analytics: { label: "Clinical Analytics", icon: <BarChart3 className="w-3.5 h-3.5" /> },
  report_generation: { label: "Report Generation", icon: <FileText className="w-3.5 h-3.5" /> },
};

interface ChangelogEntry {
  id: string;
  version: string;
  title: string;
  summary: string;
  details: string | null;
  model_area: string;
  impact_level: string;
  published_at: string;
}

const AlgorithmChangelog = () => {
  const [entries, setEntries] = useState<ChangelogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchEntries = async () => {
      const { data } = await supabase
        .from("algorithm_changelog")
        .select("*")
        .order("published_at", { ascending: false });
      if (data) setEntries(data);
      setLoading(false);
    };
    fetchEntries();
  }, []);

  return (
    <>
      <Helmet>
        <title>Algorithm Changelog | Stammerly Explainable AI</title>
        <meta name="description" content="Transparent changelog for Stammerly's AI models. See exactly what changed, when, and why — in plain English." />
      </Helmet>

      <main className="min-h-screen bg-background">
        <header className="container mx-auto px-4 py-6">
          <Link to="/product" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Product</span>
          </Link>
        </header>

        <section className="container mx-auto px-4 pb-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-3xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-10">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full mb-4 text-sm font-medium">
                <Shield className="w-4 h-4" /> Explainable AI
              </div>
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">Algorithm Changelog</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">
                Every time we update our AI models, we publish a plain-English summary here. No black boxes — just transparent, auditable science.
              </p>
            </motion.div>

            {loading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 rounded-xl bg-secondary/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="relative">
                {/* Timeline line */}
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border hidden md:block" />

                <div className="space-y-6">
                  {entries.map((entry) => {
                    const impact = impactConfig[entry.impact_level] || impactConfig.minor;
                    const area = areaConfig[entry.model_area] || { label: entry.model_area, icon: <Brain className="w-3.5 h-3.5" /> };
                    const isExpanded = expandedId === entry.id;

                    return (
                      <motion.div key={entry.id} variants={fadeUp} className="relative md:pl-16">
                        {/* Timeline dot */}
                        <div className="absolute left-4 top-6 w-4 h-4 rounded-full bg-primary border-2 border-background hidden md:block" />

                        <Card
                          variant="elevated"
                          className="cursor-pointer hover:shadow-lg transition-shadow"
                          onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                        >
                          <CardContent className="p-5">
                            <div className="flex items-start justify-between gap-3 mb-2">
                              <div className="flex items-center gap-2 flex-wrap">
                                <Badge variant="outline" className="font-mono text-xs bg-foreground/5">
                                  <GitCommit className="w-3 h-3 mr-1" /> v{entry.version}
                                </Badge>
                                <Badge variant="outline" className={impact.color}>{impact.label}</Badge>
                                <Badge variant="outline" className="text-xs">
                                  {area.icon}<span className="ml-1">{area.label}</span>
                                </Badge>
                              </div>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(entry.published_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                              </span>
                            </div>
                            <h2 className="font-display font-bold text-lg text-foreground mb-1">{entry.title}</h2>
                            <p className="text-sm text-muted-foreground">{entry.summary}</p>

                            {isExpanded && entry.details && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-4 pt-4 border-t border-border/30"
                              >
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Technical Details</h4>
                                <p className="text-sm text-foreground/80 leading-relaxed">{entry.details}</p>
                              </motion.div>
                            )}

                            {entry.details && (
                              <p className="text-xs text-primary mt-2 font-medium">
                                {isExpanded ? "Click to collapse" : "Click for technical details →"}
                              </p>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>
        </section>
      </main>
    </>
  );
};

export default AlgorithmChangelog;
