-- Copy and paste this entire file into the SQL Editor in your Supabase Dashboard
-- https://supabase.com/dashboard/project/wvuyppurctdosfvlefkk/editor

-- Enable PostgreSQL extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Core notification schema
CREATE TYPE notification_severity AS ENUM ('critical', 'warning', 'info');
CREATE TYPE notification_source AS ENUM ('vitals', 'medication', 'sos', 'system', 'emotion');
CREATE TYPE notification_channel AS ENUM ('push', 'email', 'in-app', 'sms');

-- Routing rules table
CREATE TABLE public.routing_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  name TEXT NOT NULL,
  description TEXT,
  event_type TEXT NOT NULL,
  source notification_source,
  min_severity notification_severity NOT NULL,
  recipient_roles TEXT[] NOT NULL,
  channels notification_channel[] NOT NULL,
  override_quiet_hours BOOLEAN NOT NULL DEFAULT false,
  active BOOLEAN NOT NULL DEFAULT true,
  priority INTEGER NOT NULL DEFAULT 1000
);

-- Create a function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to update timestamp
CREATE TRIGGER set_routing_rules_updated_at
BEFORE UPDATE ON public.routing_rules
FOR EACH ROW EXECUTE FUNCTION set_updated_at_timestamp();

-- Notifications delivery tracking
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  event_id UUID NOT NULL,
  event JSONB NOT NULL,
  recipient_id UUID NOT NULL,
  channel notification_channel NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  scheduled_for TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending'
);

-- User notification preferences
CREATE TABLE public.notification_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  channels notification_channel[] NOT NULL DEFAULT ARRAY['push', 'in-app']::notification_channel[],
  quiet_hours_start TIME,
  quiet_hours_end TIME,
  quiet_hours_timezone TEXT NOT NULL DEFAULT 'UTC',
  quiet_hours_enabled BOOLEAN NOT NULL DEFAULT false,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Device tokens for push notifications
CREATE TABLE public.device_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  device_type TEXT NOT NULL,
  app_version TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, token)
);

-- RLS Policies
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own notifications" 
  ON public.notifications FOR SELECT
  USING (recipient_id = auth.uid());

ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can read their own preferences" 
  ON public.notification_preferences FOR SELECT
  USING (user_id = auth.uid());
CREATE POLICY "Users can update their own preferences" 
  ON public.notification_preferences FOR UPDATE
  USING (user_id = auth.uid());

-- Seed default routing rules
INSERT INTO public.routing_rules
  (name, event_type, source, min_severity, recipient_roles, channels, override_quiet_hours, priority)
VALUES
  ('Critical SOS Alerts', 'sos_triggered', 'sos', 'critical', ARRAY['family', 'healthpro'], ARRAY['push'::notification_channel, 'sms'::notification_channel, 'in-app'::notification_channel], true, 100),
  ('Vital Signs Anomalies', 'vital_anomaly', 'vitals', 'warning', ARRAY['healthpro'], ARRAY['push'::notification_channel, 'in-app'::notification_channel], false, 200),
  ('Missed Medication Alerts', 'medication_missed', 'medication', 'warning', ARRAY['family', 'healthpro'], ARRAY['push'::notification_channel, 'in-app'::notification_channel], false, 300),
  ('Emotion State Changes', 'emotion_change', 'emotion', 'info', ARRAY['family'], ARRAY['in-app'::notification_channel], false, 400);