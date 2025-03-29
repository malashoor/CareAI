-- Create sync logs table
CREATE TABLE IF NOT EXISTS sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  timestamp timestamptz DEFAULT now(),
  status text NOT NULL, -- 'success', 'error', 'in_progress'
  details text,
  user_id uuid REFERENCES auth.users(id)
);

-- Add RLS policy for sync logs
ALTER TABLE sync_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow admin access to sync logs"
  ON sync_logs
  FOR ALL
  TO authenticated
  USING (
    auth.uid() IN (
      SELECT id FROM auth.users
      WHERE (raw_user_meta_data->>'is_admin')::boolean = true
    )
  );

-- Create index for faster queries
CREATE INDEX idx_sync_logs_timestamp ON sync_logs(timestamp DESC);
CREATE INDEX idx_sync_logs_status ON sync_logs(status); 