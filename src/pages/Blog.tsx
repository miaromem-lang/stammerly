import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Search, BookOpen, Stethoscope, Lightbulb, Megaphone } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Footer } from "@/components/Footer";
import { useState } from "react";
import type { Variants } from "framer-motion";

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

type Category = "all" | "parents" | "therapists" | "updates";

interface Article {
  id: string;
  title: string;
  excerpt: string;
  category: Category;
  categoryLabel: string;
  date: string;
  readTime: string;
  emoji: string;
}

const articles: Article[] = [
  {
    id: "1",
    title: "5 Ways to Reduce Speaking Pressure at Home",
    excerpt: "Evidence-based communication strategies parents can adopt today — including increasing your own pause time before responding to your child.",
    category: "parents",
    categoryLabel: "Tips for Parents",
    date: "2026-02-28",
    readTime: "4 min",
    emoji: "👨‍👩‍👧",
  },
  {
    id: "2",
    title: "Understanding the Difference Between Blocks and Prolongations",
    excerpt: "A clinical primer on stammering typologies and why different disfluency types require different therapeutic interventions.",
    category: "therapists",
    categoryLabel: "Insights for Therapists",
    date: "2026-02-20",
    readTime: "6 min",
    emoji: "🩺",
  },
  {
    id: "3",
    title: "Stammerly v0.9 Beta: What's New",
    excerpt: "Introducing automated SOAP note generation, phoneme trigger heatmaps, and the new variable reward system for the Kid Hub.",
    category: "updates",
    categoryLabel: "Product Updates",
    date: "2026-02-15",
    readTime: "3 min",
    emoji: "🚀",
  },
  {
    id: "4",
    title: "How Spaced Repetition Builds Long-Term Fluency",
    excerpt: "Why strategically reintroducing mastered trigger words at increasing intervals leads to lasting phonetic retention.",
    category: "therapists",
    categoryLabel: "Insights for Therapists",
    date: "2026-02-10",
    readTime: "5 min",
    emoji: "🧠",
  },
  {
    id: "5",
    title: "What to Do When Your Child Loses Their Practice Streak",
    excerpt: "Holidays and sick days happen. Here's how to use Streak Freeze and reframe setbacks as learning moments.",
    category: "parents",
    categoryLabel: "Tips for Parents",
    date: "2026-02-05",
    readTime: "3 min",
    emoji: "❄️",
  },
  {
    id: "6",
    title: "NHS Procurement: A SENCO's Guide to Stammerly",
    excerpt: "Step-by-step guide for allocating High Needs Block or Pupil Premium funding to purchase Stammerly licences compliantly.",
    category: "updates",
    categoryLabel: "Product Updates",
    date: "2026-01-28",
    readTime: "7 min",
    emoji: "📋",
  },
];

const categoryConfig: Record<Category, { label: string; icon: React.ReactNode; color: string }> = {
  all: { label: "All Articles", icon: <BookOpen className="w-4 h-4" />, color: "" },
  parents: { label: "Tips for Parents", icon: <Lightbulb className="w-4 h-4" />, color: "bg-accent-orange/10 text-accent-orange" },
  therapists: { label: "Insights for Therapists", icon: <Stethoscope className="w-4 h-4" />, color: "bg-primary/10 text-primary" },
  updates: { label: "Product Updates", icon: <Megaphone className="w-4 h-4" />, color: "bg-success/10 text-success" },
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [search, setSearch] = useState("");

  const filtered = articles.filter((a) => {
    const matchesCat = activeCategory === "all" || a.category === activeCategory;
    const matchesSearch = !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.excerpt.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <>
      <Helmet>
        <title>Resources & Articles | Stammerly</title>
        <meta name="description" content="Tips for parents, clinical insights for therapists, and product updates from Stammerly — the AI-powered speech therapy platform." />
      </Helmet>

      <main className="min-h-screen bg-background">
        <header className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </header>

        <section className="container mx-auto px-4 pb-20">
          <motion.div initial="hidden" animate="visible" variants={stagger} className="max-w-4xl mx-auto">
            <motion.div variants={fadeUp} className="text-center mb-10">
              <h1 className="font-display text-3xl md:text-5xl font-bold text-foreground mb-3">Resources & Articles</h1>
              <p className="text-muted-foreground max-w-lg mx-auto">Expert guidance for parents and clinicians, plus the latest from Stammerly.</p>
            </motion.div>

            {/* Search + Filters */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search articles…" value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <div className="flex gap-2 flex-wrap">
                {(Object.keys(categoryConfig) as Category[]).map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                      activeCategory === cat ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground hover:bg-secondary/80"
                    }`}
                  >
                    {categoryConfig[cat].label}
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Articles */}
            <motion.div variants={stagger} className="space-y-4">
              {filtered.map((article) => (
                <motion.div key={article.id} variants={fadeUp}>
                  <Card variant="elevated" className="hover:shadow-xl transition-shadow cursor-pointer">
                    <CardContent className="p-6 flex gap-4">
                      <span className="text-3xl shrink-0">{article.emoji}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <Badge variant="outline" className={categoryConfig[article.category as Category]?.color}>
                            {article.categoryLabel}
                          </Badge>
                          <span className="text-xs text-muted-foreground">{article.date} · {article.readTime} read</span>
                        </div>
                        <h2 className="font-display font-bold text-lg text-foreground mb-1">{article.title}</h2>
                        <p className="text-sm text-muted-foreground line-clamp-2">{article.excerpt}</p>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
              {filtered.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No articles found matching your search.</p>
              )}
            </motion.div>
          </motion.div>
        </section>

        <Footer />
      </main>
    </>
  );
};

export default Blog;
