-- Add consent_preferences to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS consent_preferences JSONB DEFAULT jsonb_build_object(
  'health_data_tracking', true,
  'location_tracking', true,
  'voice_recording', true,
  'sharing_with_family', true,
  'sharing_with_professionals', true,
  'last_updated', current_timestamp
);

-- Create consent_log table
CREATE TABLE IF NOT EXISTS consent_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT current_timestamp,
  changed_fields TEXT[] NOT NULL,
  previous_values JSONB NOT NULL,
  new_values JSONB NOT NULL,
  device_info JSONB,
  location_info JSONB,
  created_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- Create data_export_requests table
CREATE TABLE IF NOT EXISTS data_export_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT current_timestamp,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  file_path TEXT,
  completed_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT current_timestamp,
  updated_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- Create account_deletion_requests table
CREATE TABLE IF NOT EXISTS account_deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  requested_at TIMESTAMPTZ DEFAULT current_timestamp,
  status TEXT NOT NULL CHECK (status IN ('pending', 'scheduled', 'cancelled', 'completed')),
  scheduled_deletion_date TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT current_timestamp,
  updated_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- Create user_activity_log table
CREATE TABLE IF NOT EXISTS user_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  timestamp TIMESTAMPTZ DEFAULT current_timestamp,
  activity_type TEXT NOT NULL,
  page_url TEXT NOT NULL,
  action_details JSONB,
  device_info JSONB,
  location_info JSONB,
  created_at TIMESTAMPTZ DEFAULT current_timestamp
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS consent_log_user_id_idx ON consent_log(user_id);
CREATE INDEX IF NOT EXISTS consent_log_timestamp_idx ON consent_log(timestamp);

CREATE INDEX IF NOT EXISTS data_export_requests_user_id_idx ON data_export_requests(user_id);
CREATE INDEX IF NOT EXISTS data_export_requests_status_idx ON data_export_requests(status);
CREATE INDEX IF NOT EXISTS data_export_requests_requested_at_idx ON data_export_requests(requested_at);

CREATE INDEX IF NOT EXISTS account_deletion_requests_user_id_idx ON account_deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS account_deletion_requests_status_idx ON account_deletion_requests(status);
CREATE INDEX IF NOT EXISTS account_deletion_requests_scheduled_deletion_date_idx ON account_deletion_requests(scheduled_deletion_date);

CREATE INDEX IF NOT EXISTS user_activity_log_user_id_idx ON user_activity_log(user_id);
CREATE INDEX IF NOT EXISTS user_activity_log_timestamp_idx ON user_activity_log(timestamp);
CREATE INDEX IF NOT EXISTS user_activity_log_activity_type_idx ON user_activity_log(activity_type);

-- Enable Row Level Security
ALTER TABLE consent_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_export_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE account_deletion_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_activity_log ENABLE ROW LEVEL SECURITY;

-- Create policies for consent_log
CREATE POLICY "Users can view their own consent logs"
  ON consent_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own consent logs"
  ON consent_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for data_export_requests
CREATE POLICY "Users can view their own export requests"
  ON data_export_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own export requests"
  ON data_export_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own export requests"
  ON data_export_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for account_deletion_requests
CREATE POLICY "Users can view their own deletion requests"
  ON account_deletion_requests FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own deletion requests"
  ON account_deletion_requests FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own deletion requests"
  ON account_deletion_requests FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policies for user_activity_log
CREATE POLICY "Users can view their own activity logs"
  ON user_activity_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own activity logs"
  ON user_activity_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to handle account deletion after grace period
CREATE OR REPLACE FUNCTION process_account_deletion()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Find accounts scheduled for deletion that have passed their grace period
  WITH accounts_to_delete AS (
    SELECT user_id
    FROM account_deletion_requests
    WHERE status = 'scheduled'
    AND scheduled_deletion_date <= current_timestamp
  )
  UPDATE account_deletion_requests
  SET status = 'completed'
  WHERE user_id IN (SELECT user_id FROM accounts_to_delete);

  -- Here you would typically trigger a serverless function to handle the actual data deletion
  -- This could include:
  -- 1. Anonymizing or deleting personal data
  -- 2. Removing or archiving health records
  -- 3. Cleaning up associated files and media
  -- 4. Finally, deleting the user account
END;
$$; 