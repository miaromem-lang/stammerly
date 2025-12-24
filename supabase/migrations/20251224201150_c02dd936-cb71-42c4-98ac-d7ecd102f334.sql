-- Create a table for kid-to-adult messages
CREATE TABLE public.kid_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  child_user_id UUID,
  recipient_role TEXT NOT NULL CHECK (recipient_role IN ('therapist', 'teacher')),
  message TEXT NOT NULL,
  read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.kid_messages ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Anyone can create kid messages"
ON public.kid_messages
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Anyone can view kid messages"
ON public.kid_messages
FOR SELECT
USING (true);

CREATE POLICY "Anyone can update kid messages"
ON public.kid_messages
FOR UPDATE
USING (true);

-- Index for faster queries
CREATE INDEX idx_kid_messages_recipient ON public.kid_messages(recipient_role);
CREATE INDEX idx_kid_messages_created ON public.kid_messages(created_at DESC);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.kid_messages;