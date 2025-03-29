-- Add consent preferences to profiles table
ALTER TABLE profiles
ADD COLUMN consent_preferences jsonb DEFAULT '{
  "health_data_tracking": false,
  "location_tracking": false,
  "voice_recording": false,
  "sharing_with_family": false,
  "sharing_with_professionals": false,
  "last_updated": null
}'::jsonb;

-- Create consent log table
CREATE TABLE consent_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  timestamp timestamptz DEFAULT now(),
  changed_fields jsonb NOT NULL,
  previous_values jsonb NOT NULL,
  new_values jsonb NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb
);

-- Create user activity log table
CREATE TABLE user_activity_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  timestamp timestamptz DEFAULT now(),
  activity_type text NOT NULL,
  page_url text,
  action_details jsonb,
  ip_address text,
  user_agent text,
  metadata jsonb
);

-- Create data export requests table
CREATE TABLE data_export_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  requested_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  file_path text,
  completed_at timestamptz,
  expires_at timestamptz,
  metadata jsonb
);

-- Create account deletion requests table
CREATE TABLE account_deletion_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) NOT NULL,
  requested_at timestamptz DEFAULT now(),
  status text DEFAULT 'pending',
  scheduled_deletion_date timestamptz,
  cancelled_at timestamptz,
  metadata jsonb
);

-- Create function to log consent changes
CREATE OR REPLACE FUNCTION log_consent_change(
  p_user_id uuid,
  p_changed_fields jsonb,
  p_previous_values jsonb,
  p_new_values jsonb,
  p_ip_address text,
  p_user_agent text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO consent_log (
    user_id,
    changed_fields,
    previous_values,
    new_values,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_changed_fields,
    p_previous_values,
    p_new_values,
    p_ip_address,
    p_user_agent,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to log user activity
CREATE OR REPLACE FUNCTION log_user_activity(
  p_user_id uuid,
  p_activity_type text,
  p_page_url text,
  p_action_details jsonb,
  p_ip_address text,
  p_user_agent text,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_log_id uuid;
BEGIN
  INSERT INTO user_activity_log (
    user_id,
    activity_type,
    page_url,
    action_details,
    ip_address,
    user_agent,
    metadata
  ) VALUES (
    p_user_id,
    p_activity_type,
    p_page_url,
    p_action_details,
    p_ip_address,
    p_user_agent,
    p_metadata
  )
  RETURNING id INTO v_log_id;

  RETURN v_log_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to request data export
CREATE OR REPLACE FUNCTION request_data_export(
  p_user_id uuid,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_request_id uuid;
BEGIN
  INSERT INTO data_export_requests (
    user_id,
    status,
    expires_at,
    metadata
  ) VALUES (
    p_user_id,
    'pending',
    now() + interval '7 days',
    p_metadata
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to request account deletion
CREATE OR REPLACE FUNCTION request_account_deletion(
  p_user_id uuid,
  p_metadata jsonb DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_request_id uuid;
BEGIN
  INSERT INTO account_deletion_requests (
    user_id,
    status,
    scheduled_deletion_date,
    metadata
  ) VALUES (
    p_user_id,
    'pending',
    now() + interval '30 days',
    p_metadata
  )
  RETURNING id INTO v_request_id;

  RETURN v_request_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to cancel account deletion
CREATE OR REPLACE FUNCTION cancel_account_deletion(
  p_user_id uuid
)
RETURNS boolean AS $$
BEGIN
  UPDATE account_deletion_requests
  SET status = 'cancelled',
      cancelled_at = now()
  WHERE user_id = p_user_id
  AND status = 'pending';

  RETURN true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to process account deletions
CREATE OR REPLACE FUNCTION process_account_deletions()
RETURNS void AS $$
BEGIN
  -- Soft delete profiles
  UPDATE profiles
  SET deleted_at = now()
  WHERE id IN (
    SELECT user_id
    FROM account_deletion_requests
    WHERE status = 'pending'
    AND scheduled_deletion_date <= now()
  );

  -- Update deletion request status
  UPDATE account_deletion_requests
  SET status = 'completed'
  WHERE status = 'pending'
  AND scheduled_deletion_date <= now();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create scheduled job for account deletion processing
SELECT cron.schedule(
  'process-account-deletions',
  '0 0 * * *', -- Run daily at midnight
  $$
  SELECT process_account_deletions();
  $$
);

-- Add RLS policies
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own consent logs
CREATE POLICY "Users can view their own consent logs"
  ON consent_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to view their own activity logs
CREATE POLICY "Users can view their own activity logs"
  ON user_activity_log
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to view their own export requests
CREATE POLICY "Users can view their own export requests"
  ON data_export_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow users to view their own deletion requests
CREATE POLICY "Users can view their own deletion requests"
  ON account_deletion_requests
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Allow admins to view all logs
CREATE POLICY "Admins can view all consent logs"
  ON consent_log
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

CREATE POLICY "Admins can view all activity logs"
  ON user_activity_log
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

CREATE POLICY "Admins can view all export requests"
  ON data_export_requests
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

CREATE POLICY "Admins can view all deletion requests"
  ON account_deletion_requests
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  ); 