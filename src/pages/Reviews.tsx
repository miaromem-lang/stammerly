import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Star, MessageCircle, ThumbsUp, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useState } from 'react';
import { toast } from 'sonner';
import PageBackground from "@/components/PageBackground";

interface Review {
  id: string;
  name: string;
  role: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
}

const initialReviews: Review[] = [
  {
    id: '1',
    name: 'Sarah Thompson',
    role: 'Speech Therapist',
    rating: 5,
    comment: 'Stammerly has transformed how I work with my young clients. The AI-powered insights help me personalise therapy sessions like never before.',
    date: '2024-12-15',
    helpful: 12,
  },
  {
    id: '2',
    name: 'James Wilson',
    role: 'Parent',
    rating: 5,
    comment: 'My son loves using Stammerly at home. The gamified approach keeps him engaged, and we\'ve seen real improvement in his confidence.',
    date: '2024-12-10',
    helpful: 8,
  },
  {
    id: '3',
    name: 'Dr. Emily Chen',
    role: 'Educational Psychologist',
    rating: 4,
    comment: 'An evidence-based approach that bridges the gap between clinical settings and everyday practice. Impressive research foundation.',
    date: '2024-12-05',
    helpful: 15,
  },
];

const Reviews = () => {
  const [reviews, setReviews] = useState<Review[]>(initialReviews);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);
    
    setTimeout(() => {
      const newReview: Review = {
        id: Date.now().toString(),
        name: formData.get('name') as string,
        role: formData.get('role') as string,
        rating,
        comment: formData.get('comment') as string,
        date: new Date().toISOString().split('T')[0],
        helpful: 0,
      };
      
      setReviews([newReview, ...reviews]);
      setRating(0);
      setIsSubmitting(false);
      toast.success("Thank you for your review!");
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  const handleHelpful = (id: string) => {
    setReviews(reviews.map(r => 
      r.id === id ? { ...r, helpful: r.helpful + 1 } : r
    ));
    toast.success("Thanks for your feedback!");
  };

  return (
    <div className="min-h-screen relative">
      <PageBackground />
      <Helmet>
        <title>Reviews | Stammerly</title>
        <meta name="description" content="Read reviews from parents, therapists, and educators about their experience with Stammerly's AI-powered speech therapy platform." />
      </Helmet>

      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-primary hover:text-primary/80 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Home</span>
          </Link>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-500/10 rounded-full text-amber-600 mb-6">
              <Star className="w-5 h-5 fill-current" />
              <span className="font-medium">Community Feedback</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Reviews & <span className="text-primary">Testimonials</span>
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Hear from parents, therapists, and educators who are using Stammerly to support children who stammer.
            </p>
            <div className="w-24 h-1 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-6" />
          </div>

          {/* Add Review Form */}
          <Card className="mb-12 border-none shadow-xl bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-3">
                <MessageCircle className="w-6 h-6 text-primary" />
                Share Your Experience
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Your Name</Label>
                    <Input id="name" name="name" placeholder="Your name" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Your Role</Label>
                    <Input id="role" name="role" placeholder="e.g., Parent, Therapist, Teacher" required />
                  </div>
                </div>

                {/* Star Rating */}
                <div className="space-y-2">
                  <Label>Rating</Label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star 
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating) 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="comment">Your Review</Label>
                  <Textarea 
                    id="comment" 
                    name="comment"
                    placeholder="Share your experience with Stammerly..."
                    rows={4}
                    required 
                  />
                </div>

                <Button 
                  type="submit" 
                  size="lg" 
                  className="rounded-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit Review"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Reviews List */}
          <div className="space-y-6">
            {reviews.map((review) => (
              <Card key={review.id} className="border-none shadow-lg bg-card/80 backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{review.name}</h3>
                        <p className="text-sm text-muted-foreground">{review.role}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star}
                          className={`w-5 h-5 ${
                            star <= review.rating 
                              ? 'text-amber-500 fill-amber-500' 
                              : 'text-muted-foreground/30'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-muted-foreground mb-4">{review.comment}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      {new Date(review.date).toLocaleDateString('en-GB', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => handleHelpful(review.id)}
                    >
                      <ThumbsUp className="w-4 h-4" />
                      Helpful ({review.helpful})
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reviews;
