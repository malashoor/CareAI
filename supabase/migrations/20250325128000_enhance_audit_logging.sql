-- Create comprehensive audit log table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  user_id uuid REFERENCES auth.users(id),
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  old_value jsonb,
  new_value jsonb,
  ip_address text,
  user_agent text,
  device_info jsonb,
  location_info jsonb,
  metadata jsonb,
  severity text DEFAULT 'info',
  status text DEFAULT 'success',
  error_message text
);

-- Create indexes for faster queries
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp DESC);
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action_type ON audit_logs(action_type);
CREATE INDEX idx_audit_logs_entity_type ON audit_logs(entity_type);
CREATE INDEX idx_audit_logs_severity ON audit_logs(severity);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION log_audit_event(
  p_user_id uuid,
  p_action_type text,
  p_entity_type text,
  p_entity_id uuid,
  p_old_value jsonb,
  p_new_value jsonb,
  p_ip_address text,
  p_user_agent text,
  p_device_info jsonb,
  p_location_info jsonb,
  p_metadata jsonb,
  p_severity text DEFAULT 'info',
  p_status text DEFAULT 'success',
  p_error_message text DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO audit_logs (
    user_id,
    action_type,
    entity_type,
    entity_id,
    old_value,
    new_value,
    ip_address,
    user_agent,
    device_info,
    location_info,
    metadata,
    severity,
    status,
    error_message
  ) VALUES (
    p_user_id,
    p_action_type,
    p_entity_type,
    p_entity_id,
    p_old_value,
    p_new_value,
    p_ip_address,
    p_user_agent,
    p_device_info,
    p_location_info,
    p_metadata,
    p_severity,
    p_status,
    p_error_message
  )
  RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create view for comprehensive audit information
CREATE OR REPLACE VIEW comprehensive_audit_log AS
SELECT 
  al.*,
  u.email as user_email,
  u.raw_user_meta_data->>'role' as user_role,
  u.raw_user_meta_data->>'is_admin' as is_admin
FROM audit_logs al
JOIN auth.users u ON al.user_id = u.id;

-- Create function to get audit trail for an entity
CREATE OR REPLACE FUNCTION get_entity_audit_trail(
  p_entity_type text,
  p_entity_id uuid,
  p_limit integer DEFAULT 100
)
RETURNS TABLE (
  id uuid,
  timestamp timestamptz,
  user_email text,
  user_role text,
  action_type text,
  old_value jsonb,
  new_value jsonb,
  metadata jsonb,
  severity text,
  status text
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    al.id,
    al.timestamp,
    u.email as user_email,
    u.raw_user_meta_data->>'role' as user_role,
    al.action_type,
    al.old_value,
    al.new_value,
    al.metadata,
    al.severity,
    al.status
  FROM audit_logs al
  JOIN auth.users u ON al.user_id = u.id
  WHERE al.entity_type = p_entity_type
  AND al.entity_id = p_entity_id
  ORDER BY al.timestamp DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user activity summary
CREATE OR REPLACE FUNCTION get_user_activity_summary(
  p_user_id uuid,
  p_days integer DEFAULT 30
)
RETURNS TABLE (
  action_type text,
  count bigint,
  last_occurrence timestamptz,
  success_rate numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    action_type,
    COUNT(*) as count,
    MAX(timestamp) as last_occurrence,
    ROUND(
      (COUNT(*) FILTER (WHERE status = 'success')::numeric / COUNT(*)::numeric) * 100,
      2
    ) as success_rate
  FROM audit_logs
  WHERE user_id = p_user_id
  AND timestamp >= now() - (p_days || ' days')::interval
  GROUP BY action_type
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add RLS policies
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Allow admins to view all audit logs
CREATE POLICY "Allow admin access to audit logs"
  ON audit_logs
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Allow users to view their own audit logs
CREATE POLICY "Allow users to view their own audit logs"
  ON audit_logs
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid()); 