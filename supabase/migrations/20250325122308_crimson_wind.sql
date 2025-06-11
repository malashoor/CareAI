/*
  # Multi-user support schema with safe policy creation

  1. New Tables
    - profiles
    - medications
    - connected_users
    - health_metrics
    - medication_status
    - voice_messages

  2. Security
    - Enable RLS on all tables
    - Add policies with existence checks
    - Ensure proper data isolation

  3. Changes
    - Add safe policy creation
    - Add indexes for performance
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id),
  role text NOT NULL CHECK (role IN ('senior', 'child', 'medical')),
  name text NOT NULL,
  email text UNIQUE NOT NULL,
  avatar_url text,
  language text DEFAULT 'en',
  timezone text NOT NULL,
  emergency_contacts jsonb[],
  medical_info jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create medications table first
CREATE TABLE IF NOT EXISTS medications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  dosage text NOT NULL,
  frequency text NOT NULL,
  instructions text,
  side_effects text[],
  warnings text[],
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create connected_users table
CREATE TABLE IF NOT EXISTS connected_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  connected_user_id uuid REFERENCES profiles(id),
  relationship text NOT NULL CHECK (relationship IN ('child', 'medical', 'senior')),
  permissions jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, connected_user_id)
);

-- Create health_metrics table
CREATE TABLE IF NOT EXISTS health_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  type text NOT NULL,
  value numeric NOT NULL,
  unit text NOT NULL,
  status text NOT NULL CHECK (status IN ('normal', 'attention', 'critical')),
  timestamp timestamptz DEFAULT now(),
  metadata jsonb
);

-- Create medication_status table
CREATE TABLE IF NOT EXISTS medication_status (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id),
  medication_id uuid REFERENCES medications(id),
  status text NOT NULL CHECK (status IN ('taken', 'missed', 'upcoming')),
  scheduled_time timestamptz NOT NULL,
  taken_time timestamptz,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create voice_messages table
CREATE TABLE IF NOT EXISTS voice_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_user_id uuid REFERENCES profiles(id),
  to_user_id uuid REFERENCES profiles(id),
  audio_url text NOT NULL,
  transcript text,
  duration integer NOT NULL,
  status text DEFAULT 'unread' CHECK (status IN ('unread', 'read')),
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- Safe policy creation functions
DO $$
BEGIN
  -- Profiles policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can read their own profile'
  ) THEN
    CREATE POLICY "Users can read their own profile"
      ON profiles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can update their own profile'
  ) THEN
    CREATE POLICY "Users can update their own profile"
      ON profiles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'profiles' AND policyname = 'Users can create their own profile'
  ) THEN
    CREATE POLICY "Users can create their own profile"
      ON profiles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = id);
  END IF;

  -- Medications policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medications' AND policyname = 'All users can read medications'
  ) THEN
    CREATE POLICY "All users can read medications"
      ON medications
      FOR SELECT
      TO authenticated
      USING (true);
  END IF;

  -- Connected users policy
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'connected_users' AND policyname = 'Users can read their connections'
  ) THEN
    CREATE POLICY "Users can read their connections"
      ON connected_users
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = user_id OR
        auth.uid() = connected_user_id
      );
  END IF;

  -- Health metrics policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'health_metrics' AND policyname = 'Users can read their own health metrics'
  ) THEN
    CREATE POLICY "Users can read their own health metrics"
      ON health_metrics
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'health_metrics' AND policyname = 'Connected users can read health metrics'
  ) THEN
    CREATE POLICY "Connected users can read health metrics"
      ON health_metrics
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM connected_users
          WHERE (connected_user_id = auth.uid() AND user_id = health_metrics.user_id)
          AND permissions::jsonb ? 'health'
        )
      );
  END IF;

  -- Medication status policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medication_status' AND policyname = 'Users can read their own medication status'
  ) THEN
    CREATE POLICY "Users can read their own medication status"
      ON medication_status
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'medication_status' AND policyname = 'Connected users can read medication status'
  ) THEN
    CREATE POLICY "Connected users can read medication status"
      ON medication_status
      FOR SELECT
      TO authenticated
      USING (
        EXISTS (
          SELECT 1 FROM connected_users
          WHERE (connected_user_id = auth.uid() AND user_id = medication_status.user_id)
          AND permissions::jsonb ? 'medications'
        )
      );
  END IF;

  -- Voice messages policies
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_messages' AND policyname = 'Users can read messages sent to them'
  ) THEN
    CREATE POLICY "Users can read messages sent to them"
      ON voice_messages
      FOR SELECT
      TO authenticated
      USING (
        auth.uid() = to_user_id OR
        auth.uid() = from_user_id
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'voice_messages' AND policyname = 'Users can create voice messages'
  ) THEN
    CREATE POLICY "Users can create voice messages"
      ON voice_messages
      FOR INSERT
      TO authenticated
      WITH CHECK (
        auth.uid() = from_user_id AND
        EXISTS (
          SELECT 1 FROM connected_users
          WHERE (user_id = auth.uid() AND connected_user_id = to_user_id)
          OR (connected_user_id = auth.uid() AND user_id = to_user_id)
        )
      );
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_timestamp ON health_metrics(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_medication_status_user_scheduled ON medication_status(user_id, scheduled_time DESC);
CREATE INDEX IF NOT EXISTS idx_voice_messages_to_user ON voice_messages(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connected_users_relationship ON connected_users(user_id, connected_user_id);
CREATE INDEX IF NOT EXISTS idx_medications_name ON medications(name);