
-- Admin permission levels enum
CREATE TYPE public.admin_permission_level AS ENUM ('none', 'read', 'write', 'full');

-- Admin permissions table for granular RBAC
CREATE TABLE public.admin_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  permission_area TEXT NOT NULL,
  permission_level admin_permission_level NOT NULL DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, permission_area)
);

ALTER TABLE public.admin_permissions ENABLE ROW LEVEL SECURITY;

-- Only admins can view permissions
CREATE POLICY "Admins can view all permissions"
  ON public.admin_permissions FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Only admins can manage permissions
CREATE POLICY "Admins can insert permissions"
  ON public.admin_permissions FOR INSERT
  TO authenticated
  WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update permissions"
  ON public.admin_permissions FOR UPDATE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete permissions"
  ON public.admin_permissions FOR DELETE
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- API usage tracking table
CREATE TABLE public.api_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL,
  user_id UUID,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  estimated_cost_gbp NUMERIC(10, 6) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'success',
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.api_usage_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view usage logs
CREATE POLICY "Admins can view api usage logs"
  ON public.api_usage_logs FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- API rate limits configuration
CREATE TABLE public.api_rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  function_name TEXT NOT NULL UNIQUE,
  max_requests_per_minute INTEGER NOT NULL DEFAULT 30,
  max_requests_per_hour INTEGER NOT NULL DEFAULT 500,
  max_daily_cost_gbp NUMERIC(10, 2) NOT NULL DEFAULT 50.00,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.api_rate_limits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view rate limits"
  ON public.api_rate_limits FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage rate limits"
  ON public.api_rate_limits FOR ALL
  TO authenticated
  USING (has_role(auth.uid(), 'admin'));

-- Insert default rate limits for existing functions
INSERT INTO public.api_rate_limits (function_name, max_requests_per_minute, max_requests_per_hour, max_daily_cost_gbp)
VALUES
  ('analyze-speech', 20, 300, 25.00),
  ('free-talk-chat', 30, 500, 50.00),
  ('generate-soap-note', 10, 100, 15.00),
  ('generate-story', 15, 200, 20.00),
  ('therapist-ai-chat', 20, 300, 30.00),
  ('transcribe-speech', 20, 300, 25.00),
  ('validate-quest-assignment', 30, 500, 10.00);

-- Function to check rate limit (used by edge functions)
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  _function_name TEXT,
  _user_id UUID DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _config api_rate_limits%ROWTYPE;
  _minute_count INTEGER;
  _hour_count INTEGER;
  _daily_cost NUMERIC;
  _result JSON;
BEGIN
  -- Get config
  SELECT * INTO _config FROM api_rate_limits WHERE function_name = _function_name;
  
  IF NOT FOUND OR NOT _config.is_enabled THEN
    RETURN json_build_object('allowed', true, 'reason', 'no_limit');
  END IF;
  
  -- Count requests in last minute
  SELECT COUNT(*) INTO _minute_count
  FROM api_usage_logs
  WHERE function_name = _function_name
    AND created_at > now() - interval '1 minute';
  
  IF _minute_count >= _config.max_requests_per_minute THEN
    RETURN json_build_object('allowed', false, 'reason', 'rate_limit_minute', 'limit', _config.max_requests_per_minute);
  END IF;
  
  -- Count requests in last hour
  SELECT COUNT(*) INTO _hour_count
  FROM api_usage_logs
  WHERE function_name = _function_name
    AND created_at > now() - interval '1 hour';
  
  IF _hour_count >= _config.max_requests_per_hour THEN
    RETURN json_build_object('allowed', false, 'reason', 'rate_limit_hour', 'limit', _config.max_requests_per_hour);
  END IF;
  
  -- Check daily cost
  SELECT COALESCE(SUM(estimated_cost_gbp), 0) INTO _daily_cost
  FROM api_usage_logs
  WHERE function_name = _function_name
    AND created_at > date_trunc('day', now());
  
  IF _daily_cost >= _config.max_daily_cost_gbp THEN
    RETURN json_build_object('allowed', false, 'reason', 'daily_budget_exceeded', 'spent', _daily_cost, 'limit', _config.max_daily_cost_gbp);
  END IF;
  
  RETURN json_build_object('allowed', true, 'minute_count', _minute_count, 'hour_count', _hour_count, 'daily_cost', _daily_cost);
END;
$$;
