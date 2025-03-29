/*
  # Add Appointments System

  1. New Tables
    - `appointments`
      - `id` (uuid, primary key)
      - `senior_id` (uuid, references profiles)
      - `professional_id` (uuid, references profiles)
      - `title` (text)
      - `description` (text)
      - `location` (jsonb)
      - `start_time` (timestamptz)
      - `end_time` (timestamptz)
      - `status` (text)
      - `instructions` (text)
      - `reminder_preferences` (jsonb)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `appointment_reminders`
      - `id` (uuid, primary key)
      - `appointment_id` (uuid, references appointments)
      - `type` (text)
      - `scheduled_time` (timestamptz)
      - `sent_at` (timestamptz)
      - `status` (text)

  2. Security
    - Enable RLS on both tables
    - Add policies for medical professionals and seniors
*/

-- Create appointments table
CREATE TABLE appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  senior_id uuid REFERENCES profiles(id) NOT NULL,
  professional_id uuid REFERENCES profiles(id) NOT NULL,
  title text NOT NULL,
  description text,
  location jsonb NOT NULL,
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('scheduled', 'confirmed', 'cancelled', 'completed')),
  instructions text,
  reminder_preferences jsonb DEFAULT jsonb_build_object(
    'advance_notice', 24,
    'pre_appointment_notice', 60,
    'notification_type', 'both'
  ),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create appointment reminders table
CREATE TABLE appointment_reminders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('advance', 'pre_appointment')),
  scheduled_time timestamptz NOT NULL,
  sent_at timestamptz,
  status text NOT NULL CHECK (status IN ('pending', 'sent', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_reminders ENABLE ROW LEVEL SECURITY;

-- Policies for appointments
CREATE POLICY "Medical professionals can manage appointments"
  ON appointments
  FOR ALL
  TO authenticated
  USING (
    professional_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid()
      AND role = 'medical'
    )
  );

CREATE POLICY "Seniors can view their appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    senior_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE (connected_user_id = auth.uid() AND user_id = appointments.senior_id)
      AND relationship IN ('child', 'medical')
    )
  );

-- Policies for reminders
CREATE POLICY "Medical professionals can manage reminders"
  ON appointment_reminders
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_reminders.appointment_id
      AND appointments.professional_id = auth.uid()
    )
  );

CREATE POLICY "Seniors can view their reminders"
  ON appointment_reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM appointments
      WHERE appointments.id = appointment_reminders.appointment_id
      AND (
        appointments.senior_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM connected_users
          WHERE (connected_user_id = auth.uid() AND user_id = appointments.senior_id)
          AND relationship IN ('child', 'medical')
        )
      )
    )
  );

-- Create indexes
CREATE INDEX idx_appointments_senior ON appointments(senior_id, start_time);
CREATE INDEX idx_appointments_professional ON appointments(professional_id, start_time);
CREATE INDEX idx_appointment_reminders_scheduled ON appointment_reminders(scheduled_time)
  WHERE status = 'pending';