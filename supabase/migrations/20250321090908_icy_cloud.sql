/*
  # Multi-user support schema

  1. New Tables
    - profiles
      - Stores user profile information
      - Includes role, language preferences, and basic info
    - connected_users
      - Manages relationships between users
      - Defines permissions and access levels
    - health_metrics
      - Stores real-time health data
      - Includes status and timestamp
    - medication_status
      - Tracks medication adherence
      - Records scheduled and actual intake times
    - voice_messages
      - Stores voice messages between users
      - Includes transcripts and metadata

  2. Security
    - Enable RLS on all tables
    - Add policies for different user roles
    - Ensure proper data isolation

  3. Indexes
    - Add indexes for frequently queried columns
    - Optimize for real-time monitoring queries
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
ALTER TABLE connected_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE voice_messages ENABLE ROW LEVEL SECURITY;

-- Create policies

-- Profiles policies
CREATE POLICY "Users can read their own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON profiles
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Connected users policies
CREATE POLICY "Users can read their connections"
  ON connected_users
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    auth.uid() = connected_user_id
  );

-- Health metrics policies
CREATE POLICY "Users can read their own health metrics"
  ON health_metrics
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Medication status policies
CREATE POLICY "Users can read their own medication status"
  ON medication_status
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

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

-- Voice messages policies
CREATE POLICY "Users can read messages sent to them"
  ON voice_messages
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = to_user_id OR
    auth.uid() = from_user_id
  );

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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_health_metrics_user_timestamp ON health_metrics(user_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_medication_status_user_scheduled ON medication_status(user_id, scheduled_time DESC);
CREATE INDEX IF NOT EXISTS idx_voice_messages_to_user ON voice_messages(to_user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_connected_users_relationship ON connected_users(user_id, connected_user_id);