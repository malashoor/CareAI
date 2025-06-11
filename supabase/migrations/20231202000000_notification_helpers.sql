-- Add helper functions for notification processing

-- Function to increment retry count for a single notification
CREATE OR REPLACE FUNCTION increment_retry_count(row_id UUID)
RETURNS INTEGER AS $$
DECLARE
  new_count INTEGER;
BEGIN
  UPDATE notifications
  SET retry_count = retry_count + 1
  WHERE id = row_id
  RETURNING retry_count INTO new_count;
  
  RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment retry count for multiple notifications
CREATE OR REPLACE FUNCTION increment_retry_count(row_ids UUID[])
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  UPDATE notifications
  SET retry_count = retry_count + 1
  WHERE id = ANY(row_ids);
  
  GET DIAGNOSTICS updated_count = ROW_COUNT;
  RETURN updated_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add read field to notifications table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'read'
  ) THEN
    ALTER TABLE notifications ADD COLUMN read BOOLEAN NOT NULL DEFAULT false;
  END IF;
END $$;

-- Add severity field to notifications table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'notifications' 
    AND column_name = 'severity'
  ) THEN
    ALTER TABLE notifications ADD COLUMN severity notification_severity;
    
    -- Update severity based on event data for existing notifications
    UPDATE notifications
    SET severity = (event->>'severity')::notification_severity
    WHERE event->>'severity' IS NOT NULL;
  END IF;
END $$;

-- Add an index on the read status for efficient notification badge counts
CREATE INDEX IF NOT EXISTS idx_notifications_read 
ON notifications(recipient_id, read) 
WHERE channel = 'in-app';

-- Add a function to get the next quiet hours end time for a user
CREATE OR REPLACE FUNCTION get_next_quiet_hours_end(user_id UUID)
RETURNS TIMESTAMPTZ AS $$
DECLARE
  prefs RECORD;
  quiet_end TIMESTAMPTZ;
  now_in_user_tz TIMESTAMPTZ;
BEGIN
  -- Get user preferences
  SELECT 
    quiet_hours_end,
    quiet_hours_timezone
  INTO prefs
  FROM notification_preferences
  WHERE user_id = get_next_quiet_hours_end.user_id;
  
  IF NOT FOUND THEN
    -- Default to 8 AM tomorrow UTC if no preferences
    RETURN (DATE_TRUNC('day', NOW() AT TIME ZONE 'UTC') + INTERVAL '1 day' + INTERVAL '8 hour')::TIMESTAMPTZ;
  END IF;
  
  -- Get current time in user's timezone
  now_in_user_tz := NOW() AT TIME ZONE prefs.quiet_hours_timezone;
  
  -- Parse quiet hours end time
  quiet_end := (
    DATE_TRUNC('day', now_in_user_tz) + 
    prefs.quiet_hours_end::TIME
  ) AT TIME ZONE prefs.quiet_hours_timezone;
  
  -- If end time has already passed today, use tomorrow
  IF quiet_end <= now_in_user_tz THEN
    quiet_end := quiet_end + INTERVAL '1 day';
  END IF;
  
  RETURN quiet_end;
END;
$$ LANGUAGE plpgsql STABLE; 