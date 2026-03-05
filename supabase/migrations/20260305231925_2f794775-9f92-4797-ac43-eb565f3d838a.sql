
-- Feature requests for the public roadmap
CREATE TABLE public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL DEFAULT 'general',
  status text NOT NULL DEFAULT 'under_review',
  author_name text NOT NULL DEFAULT 'Anonymous',
  author_role text NOT NULL DEFAULT 'parent',
  upvote_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Upvotes tracking (one per session via fingerprint)
CREATE TABLE public.feature_request_upvotes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  feature_request_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  session_fingerprint text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(feature_request_id, session_fingerprint)
);

-- Algorithm update changelog
CREATE TABLE public.algorithm_changelog (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  version text NOT NULL,
  title text NOT NULL,
  summary text NOT NULL,
  details text,
  model_area text NOT NULL DEFAULT 'disfluency_detection',
  impact_level text NOT NULL DEFAULT 'minor',
  published_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.algorithm_changelog ENABLE ROW LEVEL SECURITY;

-- Public read access for roadmap and changelog
CREATE POLICY "Anyone can view feature requests" ON public.feature_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can submit feature requests" ON public.feature_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view upvotes" ON public.feature_request_upvotes FOR SELECT USING (true);
CREATE POLICY "Anyone can upvote" ON public.feature_request_upvotes FOR INSERT WITH CHECK (true);

CREATE POLICY "Anyone can view changelog" ON public.algorithm_changelog FOR SELECT USING (true);

-- Function to increment upvote count
CREATE OR REPLACE FUNCTION public.increment_upvote_count()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  UPDATE public.feature_requests
  SET upvote_count = upvote_count + 1
  WHERE id = NEW.feature_request_id;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_upvote_insert
  AFTER INSERT ON public.feature_request_upvotes
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_upvote_count();
