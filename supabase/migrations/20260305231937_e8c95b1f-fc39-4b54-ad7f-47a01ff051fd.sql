
-- Tighten INSERT policies with basic validation constraints
DROP POLICY "Anyone can submit feature requests" ON public.feature_requests;
CREATE POLICY "Anyone can submit feature requests" ON public.feature_requests 
  FOR INSERT WITH CHECK (
    char_length(title) BETWEEN 5 AND 200
    AND char_length(description) BETWEEN 10 AND 1000
    AND author_role IN ('parent', 'therapist', 'teacher', 'adult_pws', 'other')
    AND category IN ('kid_hub', 'parent_hub', 'teacher_hub', 'therapist_hub', 'hardware', 'general')
  );

DROP POLICY "Anyone can upvote" ON public.feature_request_upvotes;
CREATE POLICY "Anyone can upvote" ON public.feature_request_upvotes
  FOR INSERT WITH CHECK (
    char_length(session_fingerprint) BETWEEN 8 AND 64
  );
