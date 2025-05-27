-- Add indexes to improve notification system performance

-- Index for notification status and scheduled time (for worker processing)
CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled 
ON notifications(status, scheduled_for);

-- Index for delivered notifications by severity (for analytics)
CREATE INDEX IF NOT EXISTS idx_notifications_delivered_severity 
ON notifications(status, severity);

-- Index for notification preferences by user (for preference lookups)
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id 
ON notification_preferences(user_id);

-- Index for device tokens by user (for push notification delivery)
CREATE INDEX IF NOT EXISTS idx_device_tokens_user_id 
ON device_tokens(user_id);

-- Index for searching notifications by recipient
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_channel 
ON notifications(recipient_id, channel);

-- Index for filtering read/unread notifications
CREATE INDEX IF NOT EXISTS idx_notifications_recipient_read 
ON notifications(recipient_id, read);

-- Add unread notifications count function for badges
CREATE OR REPLACE FUNCTION get_unread_notification_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)
  INTO v_count
  FROM notifications
  WHERE recipient_id = p_user_id
    AND status = 'delivered'
    AND read = false
    AND channel = 'in-app';
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 