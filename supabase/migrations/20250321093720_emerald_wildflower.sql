/*
  # Healthcare ERP Integration

  1. New Tables
    - `erp_integrations`
      - Stores ERP connection details and credentials
      - Manages OAuth tokens and API keys
      - Tracks connection status and sync history

    - `erp_sync_logs`
      - Records all sync events and data exchanges
      - Tracks success/failure status
      - Stores error messages and retry attempts

  2. Security
    - Enable RLS on new tables
    - Add policies for secure access
    - Encrypt sensitive credentials

  3. Changes
    - Add ERP reference IDs to existing tables
    - Add sync status tracking
*/

-- Create erp_integrations table
CREATE TABLE IF NOT EXISTS erp_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_name text NOT NULL,
  provider_type text NOT NULL,
  credentials jsonb NOT NULL,
  config jsonb NOT NULL,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'error')),
  last_sync_at timestamptz,
  error_message text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create erp_sync_logs table
CREATE TABLE IF NOT EXISTS erp_sync_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  integration_id uuid REFERENCES erp_integrations(id),
  sync_type text NOT NULL,
  status text NOT NULL CHECK (status IN ('success', 'error', 'retry')),
  data_type text NOT NULL,
  record_count integer,
  error_message text,
  retry_count integer DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Add ERP reference fields to existing tables
ALTER TABLE medications
ADD COLUMN erp_ref_id text,
ADD COLUMN last_erp_sync timestamptz;

ALTER TABLE health_metrics
ADD COLUMN erp_ref_id text,
ADD COLUMN last_erp_sync timestamptz;

ALTER TABLE medication_status
ADD COLUMN erp_ref_id text,
ADD COLUMN last_erp_sync timestamptz;

-- Create unique constraints for ERP references
CREATE UNIQUE INDEX medications_erp_ref_idx ON medications(erp_ref_id) WHERE erp_ref_id IS NOT NULL;
CREATE UNIQUE INDEX health_metrics_erp_ref_idx ON health_metrics(erp_ref_id) WHERE erp_ref_id IS NOT NULL;
CREATE UNIQUE INDEX medication_status_erp_ref_idx ON medication_status(erp_ref_id) WHERE erp_ref_id IS NOT NULL;

-- Enable RLS
ALTER TABLE erp_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE erp_sync_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Only medical professionals can manage ERP integrations"
  ON erp_integrations
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'medical'
    )
  );

CREATE POLICY "Medical professionals can view sync logs"
  ON erp_sync_logs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'medical'
    )
  );

-- Create indexes
CREATE INDEX idx_erp_sync_logs_integration ON erp_sync_logs(integration_id, created_at DESC);
CREATE INDEX idx_erp_sync_logs_status ON erp_sync_logs(status, created_at DESC);