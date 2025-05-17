-- RC Notification Routing Rules
-- This file contains the routing rules for the 1.0.0-rc1 release

-- Make sure PostgreSQL extensions are enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Define notification types if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_severity') THEN
        CREATE TYPE notification_severity AS ENUM ('critical', 'warning', 'info');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_source') THEN
        CREATE TYPE notification_source AS ENUM ('vitals', 'medication', 'sos', 'system', 'emotion');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'notification_channel') THEN
        CREATE TYPE notification_channel AS ENUM ('push', 'email', 'in-app', 'sms');
    END IF;
END$$;

-- Create routing rules table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.routing_rules (
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

-- Add timestamp update trigger if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'set_routing_rules_updated_at') THEN
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
    END IF;
END$$;

-- RC1 Default Rules - Clear existing and add new ones
TRUNCATE public.routing_rules;

INSERT INTO public.routing_rules
  (name, event_type, source, min_severity, recipient_roles, channels, override_quiet_hours, priority)
VALUES
  ('Critical SOS Alerts', 'sos_triggered', 'sos', 'critical', ARRAY['family', 'healthpro'], ARRAY['push'::notification_channel, 'in-app'::notification_channel], true, 100),
  ('Vital Signs Anomalies', 'vital_anomaly', 'vitals', 'warning', ARRAY['healthpro'], ARRAY['push'::notification_channel, 'in-app'::notification_channel], false, 200),
  ('Missed Medication Alerts', 'medication_missed', 'medication', 'warning', ARRAY['family', 'healthpro'], ARRAY['push'::notification_channel, 'in-app'::notification_channel], false, 300),
  ('Emotion State Changes', 'emotion_change', 'emotion', 'info', ARRAY['family'], ARRAY['in-app'::notification_channel], false, 400); 