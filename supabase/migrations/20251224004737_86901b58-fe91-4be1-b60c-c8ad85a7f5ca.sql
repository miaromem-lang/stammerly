-- Create therapist session reviews table
CREATE TABLE public.session_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.practice_sessions(id) ON DELETE CASCADE,
  therapist_notes TEXT,
  technique_rating INTEGER CHECK (technique_rating >= 1 AND technique_rating <= 5),
  progress_rating INTEGER CHECK (progress_rating >= 1 AND progress_rating <= 5),
  recommendations TEXT,
  reviewed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.session_reviews ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view reviews (for demo purposes)
CREATE POLICY "Anyone can view reviews"
ON public.session_reviews
FOR SELECT
USING (true);

-- Allow anyone to create reviews
CREATE POLICY "Anyone can create reviews"
ON public.session_reviews
FOR INSERT
WITH CHECK (true);

-- Allow anyone to update reviews
CREATE POLICY "Anyone can update reviews"
ON public.session_reviews
FOR UPDATE
USING (true);