/*
  # Add health sync support

  1. Changes
    - Add health_sync_config column to profiles table
    - Add source tracking to health metrics table
    - Add unique constraint for external health data
    - Add sync-related policies and indexes

  2. Security
    - Update RLS policies for health data sync
*/

-- Add health sync configuration to profiles
ALTER TABLE profiles
ADD COLUMN health_sync_config jsonb DEFAULT jsonb_build_object(
  'enabled', false,
  'platforms', jsonb_build_object(
    'appleHealth', false,
    'googleFit', false
  ),
  'dataTypes', jsonb_build_array()
);

-- Add source tracking to health metrics
ALTER TABLE health_metrics
ADD COLUMN source text,
ADD COLUMN sync_id text,
ADD COLUMN sync_timestamp timestamptz DEFAULT now();

-- Create unique constraint for external health data
CREATE UNIQUE INDEX health_metrics_sync_unique 
ON health_metrics(user_id, type, source, sync_id) 
WHERE source IS NOT NULL AND sync_id IS NOT NULL;

-- Update health metrics policies for sync
CREATE POLICY "Health sync services can insert metrics"
  ON health_metrics
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = user_id
      AND health_sync_config->>'enabled' = 'true'
    )
  );

-- Create index for sync performance
CREATE INDEX idx_health_metrics_sync 
ON health_metrics(user_id, source, sync_timestamp)
WHERE source IS NOT NULL;