/*
  # Add Medication Refill and Delivery System

  1. New Tables
    - `medication_refills`
      - `id` (uuid, primary key)
      - `medication_id` (uuid, references medications)
      - `user_id` (uuid, references profiles)
      - `status` (text: pending, approved, delivered)
      - `remaining_days` (integer)
      - `delivery_address` (jsonb)
      - `approved_by` (uuid, references profiles)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `delivery_locations`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references profiles)
      - `address` (jsonb)
      - `is_default` (boolean)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on new tables
    - Add policies for access control
    - Create indexes for performance

  3. Changes
    - Add delivery tracking to medication_status
*/

-- Create medication_refills table
CREATE TABLE IF NOT EXISTS medication_refills (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  medication_id uuid REFERENCES medications(id),
  user_id uuid REFERENCES profiles(id),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'delivered')),
  remaining_days integer NOT NULL,
  delivery_address jsonb NOT NULL,
  approved_by uuid REFERENCES profiles(id),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create delivery_locations table
CREATE TABLE IF NOT EXISTS delivery_locations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  address jsonb NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add delivery tracking to medication_status
ALTER TABLE medication_status
ADD COLUMN delivery_status jsonb DEFAULT NULL;

-- Enable RLS
ALTER TABLE medication_refills ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_locations ENABLE ROW LEVEL SECURITY;

-- Policies for medication_refills
CREATE POLICY "Users can view their own refills"
  ON medication_refills
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Medical professionals can view and approve refills"
  ON medication_refills
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE connected_user_id = auth.uid()
      AND user_id = medication_refills.user_id
      AND relationship = 'medical'
    )
  );

-- Policies for delivery_locations
CREATE POLICY "Users can manage their delivery locations"
  ON delivery_locations
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Connected users can view delivery locations"
  ON delivery_locations
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE connected_user_id = auth.uid()
      AND user_id = delivery_locations.user_id
    )
  );

-- Create indexes
CREATE INDEX idx_medication_refills_user ON medication_refills(user_id, status);
CREATE INDEX idx_medication_refills_medication ON medication_refills(medication_id);
CREATE INDEX idx_delivery_locations_user ON delivery_locations(user_id);
CREATE INDEX idx_delivery_locations_default ON delivery_locations(user_id, is_default);