-- Create notification archive table for long-term storage

-- Notifications archive table (for historical data)
CREATE TABLE public.notifications_archive (
  id UUID PRIMARY KEY,
  event_id UUID NOT NULL,
  event JSONB NOT NULL,
  recipient_id UUID NOT NULL,
  channel notification_channel NOT NULL,
  created_at TIMESTAMPTZ NOT NULL,
  scheduled_for TIMESTAMPTZ NOT NULL,
  processed_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  error TEXT,
  retry_count INTEGER NOT NULL,
  status TEXT NOT NULL,
  read BOOLEAN,
  severity notification_severity,
  archived_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for efficient querying of archived notifications
CREATE INDEX idx_notifications_archive_recipient_created 
ON notifications_archive(recipient_id, created_at);

CREATE INDEX idx_notifications_archive_event_type
ON notifications_archive((event->>'type'));

-- Add comment to explain purpose
COMMENT ON TABLE notifications_archive IS 
'Stores historical notifications that have been processed and are no longer active. Used for audit and analytics purposes.';

-- RLS Policies - highly restrictive, only allow read access to admins
ALTER TABLE public.notifications_archive ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Only admins can access notification archive" 
ON public.notifications_archive FOR SELECT
USING (auth.jwt() ->> 'role' = 'admin');

-- Function to archive notifications (for manual use if needed)
CREATE OR REPLACE FUNCTION archive_old_notifications(days INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
DECLARE
  archived_count INTEGER;
BEGIN
  -- Insert old notifications into archive
  WITH archived AS (
    INSERT INTO notifications_archive
    SELECT *
    FROM notifications
    WHERE created_at < NOW() - (days * INTERVAL '1 day')
    AND status IN ('delivered', 'failed', 'dismissed')
    RETURNING id
  )
  -- Delete the archived notifications from the main table
  DELETE FROM notifications
  WHERE id IN (SELECT id FROM archived);
  
  GET DIAGNOSTICS archived_count = ROW_COUNT;
  RETURN archived_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 