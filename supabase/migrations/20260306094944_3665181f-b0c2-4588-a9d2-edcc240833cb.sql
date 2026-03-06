
-- Parent-child linking table for sibling account separation
CREATE TABLE public.parent_child_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID NOT NULL,
  child_user_id UUID NOT NULL,
  child_display_name TEXT NOT NULL DEFAULT 'My Child',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(parent_user_id, child_user_id)
);

ALTER TABLE public.parent_child_links ENABLE ROW LEVEL SECURITY;

-- Parents can view their own links
CREATE POLICY "Parents can view own child links"
  ON public.parent_child_links FOR SELECT
  TO authenticated
  USING (parent_user_id = auth.uid());

-- Parents can create child links
CREATE POLICY "Parents can create child links"
  ON public.parent_child_links FOR INSERT
  TO authenticated
  WITH CHECK (parent_user_id = auth.uid() AND has_role(auth.uid(), 'parent'));

-- Parents can update own links
CREATE POLICY "Parents can update own child links"
  ON public.parent_child_links FOR UPDATE
  TO authenticated
  USING (parent_user_id = auth.uid());

-- Parents can delete own links
CREATE POLICY "Parents can delete own child links"
  ON public.parent_child_links FOR DELETE
  TO authenticated
  USING (parent_user_id = auth.uid());
