import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect, useMemo } from "react";
import { ArrowLeft, ThumbsUp, Plus, Filter, MessageSquare, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Footer } from "@/components/Footer";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

type Status = "all" | "under_review" | "planned" | "in_progress" | "completed";
type Category = "all" | "kid_hub" | "parent_hub" | "teacher_hub" | "therapist_hub" | "hardware" | "general";

const statusConfig: Record<string, { label: string; color: string }> = {
  under_review: { label: "Under Review", color: "bg-muted text-muted-foreground" },
  planned: { label: "Planned", color: "bg-primary/10 text-primary border-primary/20" },
  in_progress: { label: "In Progress", color: "bg-gold/10 text-gold border-gold/20" },
  completed: { label: "Completed", color: "bg-success/10 text-success border-success/20" },
};

const categoryLabels: Record<string, string> = {
  kid_hub: "Kid Hub",
  parent_hub: "Parent Hub",
  teacher_hub: "Teacher Hub",
  therapist_hub: "Therapist Hub",
  hardware: "Hardware",
  general: "General",
};

// Simple session fingerprint
const getFingerprint = (): string => {
  let fp = sessionStorage.getItem("stammerly_fp");
  if (!fp) {
    fp = crypto.randomUUID().replace(/-/g, "").slice(0, 32);
    sessionStorage.setItem("stammerly_fp", fp);
  }
  return fp;
};

interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: string;
  status: string;
  author_name: string;
  author_role: string;
  upvote_count: number;
  created_at: string;
}

const Roadmap = () => {
  const [features, setFeatures] = useState<FeatureRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<Status>("all");
  const [categoryFilter, setCategoryFilter] = useState<Category>("all");
  const [upvoted, setUpvoted] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("general");
  const [newRole, setNewRole] = useState("parent");
  const [newName, setNewName] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    fetchFeatures();
  }, []);

  const fetchFeatures = async () => {
    const { data } = await supabase
      .from("feature_requests")
      .select("*")
      .order("upvote_count", { ascending: false });
    if (data) setFeatures(data);
    setLoading(false);
  };

  const handleUpvote = async (id: string) => {
    if (upvoted.has(id)) return;
    const fp = getFingerprint();
    const { error } = await supabase
      .from("feature_request_upvotes")
      .insert({ feature_request_id: id, session_fingerprint: fp });
    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already upvoted", description: "You've already upvoted this feature." });
      }
      return;
    }
    setUpvoted((prev) => new Set(prev).add(id));
    setFeatures((prev) =>
      prev.map((f) => (f.id === id ? { ...f, upvote_count: f.upvote_count + 1 } : f))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newTitle.length < 5 || newDesc.length < 10) {
      toast({ title: "Too short", description: "Please provide more detail.", variant: "destructive" });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from("feature_requests").insert({
      title: newTitle.trim(),
      description: newDesc.trim(),
      category: newCategory,
      author_role: newRole,
      author_name: newName.trim() || "Anonymous",
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: "Could not submit. Please try again.", variant: "destructive" });
      return;
    }
    toast({ title: "Submitted! 🎉", description: "Your feature request is now under review." });
    setDialogOpen(false);
    setNewTitle("");
    setNewDesc("");
    setNewName("");
    fetchFeatures();
  };

  const filtered = useMemo(
    () =>
      features.filter((f) => {
        if (statusFilter !== "all" && f.status !== statusFilter) return false;
        if (categoryFilter !== "all" && f.category !== categoryFilter) return false;
        return true;
      }),
    [features, statusFilter, categoryFilter]
  );

  return (
    <>
      <Helmet>
        <title>Product Roadmap | Stammerly</title>
        <meta name="description" content="See what's coming next for Stammerly. Submit feature requests and upvote ideas from the community." />
      </Helmet>

      <main className="min-h-screen bg-background">
        <header className="container mx-auto px-4 py-6">
          <Link to="/product" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Product</span>
          </Link>
        </header>

        <section className="container mx-auto px-4 pb-20">
          <motion.div initial="hidden" animate="visible" variants={fadeUp} className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">Product Roadmap</h1>
              <p className="text-muted-foreground max-w-lg mx-auto mb-6">
                Stammerly is co-designed with the community. Submit ideas, upvote features, and shape the platform.
              </p>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero" size="lg" className="rounded-xl">
                    <Plus className="w-4 h-4" /> Submit a Feature Request
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle className="font-display">Submit a Feature Request</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label>Your Name (optional)</Label>
                      <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="Anonymous" maxLength={100} />
                    </div>
                    <div className="space-y-2">
                      <Label>I am a…</Label>
                      <Select value={newRole} onValueChange={setNewRole}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="parent">Parent / Carer</SelectItem>
                          <SelectItem value="therapist">Speech & Language Therapist</SelectItem>
                          <SelectItem value="teacher">Teacher / SENCO</SelectItem>
                          <SelectItem value="adult_pws">Adult Who Stammers</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Feature Title</Label>
                      <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="e.g. Dark mode for Kid Hub" required maxLength={200} />
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Select value={newCategory} onValueChange={setNewCategory}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(categoryLabels).map(([k, v]) => (
                            <SelectItem key={k} value={k}>{v}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Why is this important? How would it help?" rows={4} required maxLength={1000} />
                    </div>
                    <Button type="submit" variant="hero" className="w-full rounded-xl" disabled={submitting}>
                      {submitting ? "Submitting…" : "Submit Request"}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as Status)}>
                <SelectTrigger className="w-40">
                  <Filter className="w-3.5 h-3.5 mr-1" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="under_review">Under Review</SelectItem>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
              <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as Category)}>
                <SelectTrigger className="w-44">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {Object.entries(categoryLabels).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Feature list */}
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-24 rounded-xl bg-secondary/50 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map((f) => {
                  const sc = statusConfig[f.status] || statusConfig.under_review;
                  return (
                    <Card key={f.id} variant="elevated" className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-5 flex gap-4">
                        {/* Upvote */}
                        <button
                          onClick={() => handleUpvote(f.id)}
                          className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl border transition-all shrink-0 ${
                            upvoted.has(f.id)
                              ? "bg-primary/10 border-primary/30 text-primary"
                              : "bg-secondary/50 border-border/30 text-muted-foreground hover:border-primary/30 hover:text-primary"
                          }`}
                        >
                          <ThumbsUp className="w-4 h-4" />
                          <span className="font-bold text-sm">{f.upvote_count}</span>
                        </button>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-semibold text-foreground">{f.title}</h3>
                            <Badge variant="outline" className={sc.color}>{sc.label}</Badge>
                            <Badge variant="outline" className="text-xs">{categoryLabels[f.category] || f.category}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{f.description}</p>
                          <p className="text-xs text-muted-foreground">
                            Submitted by {f.author_name} · {f.author_role.replace("_", " ")}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
                {filtered.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No features match your filters.</p>
                )}
              </div>
            )}
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Roadmap;
