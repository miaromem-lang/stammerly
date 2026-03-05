
-- Pendant sync history: logs each sync event without transcript data
CREATE TABLE public.pendant_sync_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Stammerly Pendant',
  battery_level INTEGER,
  storage_used_mb INTEGER,
  storage_total_mb INTEGER,
  files_transferred INTEGER DEFAULT 0,
  sync_duration_seconds NUMERIC,
  sync_status TEXT NOT NULL DEFAULT 'success',
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.pendant_sync_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own sync history"
ON public.pendant_sync_history FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own sync history"
ON public.pendant_sync_history FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own sync history"
ON public.pendant_sync_history FOR DELETE TO authenticated
USING (user_id = auth.uid());

-- Low battery alerts table
CREATE TABLE public.low_battery_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  battery_level INTEGER NOT NULL,
  device_name TEXT NOT NULL DEFAULT 'Stammerly Pendant',
  acknowledged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.low_battery_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert own battery alerts"
ON public.low_battery_alerts FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can view own battery alerts"
ON public.low_battery_alerts FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can update own battery alerts"
ON public.low_battery_alerts FOR UPDATE TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "Users can delete own battery alerts"
ON public.low_battery_alerts FOR DELETE TO authenticated
USING (user_id = auth.uid());
