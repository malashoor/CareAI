/*
  # Cognitive Support and Social Features Schema

  1. New Tables
    - `cognitive_exercises`
      - Stores brain training exercises and games
    - `cognitive_progress`
      - Tracks user progress in cognitive exercises
    - `social_activities`
      - Manages social events and group activities
    - `activity_participants`
      - Tracks participation in social activities
    - `mood_logs`
      - Records daily mood and emotional state
    - `fall_detection_events`
      - Stores fall detection and emergency events
    - `device_integrations`
      - Manages connected devices and wearables

  2. Security
    - Enable RLS on all new tables
    - Add policies for data access control
    - Ensure privacy of sensitive information

  3. Changes
    - Add cognitive health fields to profiles
    - Add device integration capabilities
*/

-- Create cognitive exercises table
CREATE TABLE cognitive_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('memory', 'attention', 'problem_solving', 'language', 'visual')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  content jsonb NOT NULL,
  instructions text NOT NULL,
  duration_minutes integer NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create cognitive progress table
CREATE TABLE cognitive_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  exercise_id uuid REFERENCES cognitive_exercises(id) NOT NULL,
  score integer NOT NULL,
  completion_time integer NOT NULL, -- in seconds
  difficulty text NOT NULL,
  mistakes integer DEFAULT 0,
  feedback jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create social activities table
CREATE TABLE social_activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  type text NOT NULL CHECK (type IN ('fitness', 'book_club', 'hobby', 'support_group', 'game')),
  start_time timestamptz NOT NULL,
  end_time timestamptz NOT NULL,
  max_participants integer,
  location jsonb,
  virtual_meeting_link text,
  created_by uuid REFERENCES profiles(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('upcoming', 'in_progress', 'completed', 'cancelled')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create activity participants table
CREATE TABLE activity_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_id uuid REFERENCES social_activities(id) NOT NULL,
  user_id uuid REFERENCES profiles(id) NOT NULL,
  status text NOT NULL CHECK (status IN ('registered', 'attended', 'cancelled')),
  feedback text,
  created_at timestamptz DEFAULT now(),
  UNIQUE(activity_id, user_id)
);

-- Create mood logs table
CREATE TABLE mood_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  mood text NOT NULL CHECK (mood IN ('happy', 'calm', 'sad', 'anxious', 'stressed', 'energetic')),
  intensity integer NOT NULL CHECK (intensity BETWEEN 1 AND 5),
  notes text,
  activities jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create fall detection events table
CREATE TABLE fall_detection_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  detected_at timestamptz NOT NULL,
  location jsonb,
  severity text NOT NULL CHECK (severity IN ('low', 'medium', 'high')),
  response_status text NOT NULL CHECK (response_status IN ('detected', 'notified', 'responded', 'resolved')),
  responder_id uuid REFERENCES profiles(id),
  device_data jsonb,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create device integrations table
CREATE TABLE device_integrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  device_type text NOT NULL CHECK (device_type IN ('smartwatch', 'fitness_tracker', 'medical_device', 'smart_home')),
  device_id text NOT NULL,
  manufacturer text NOT NULL,
  model text NOT NULL,
  capabilities jsonb NOT NULL,
  settings jsonb DEFAULT '{}',
  last_sync timestamptz,
  status text NOT NULL CHECK (status IN ('active', 'inactive', 'error')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, device_id)
);

-- Add cognitive health fields to profiles
ALTER TABLE profiles
ADD COLUMN cognitive_preferences jsonb DEFAULT jsonb_build_object(
  'exercise_frequency', 'daily',
  'preferred_difficulty', 'medium',
  'favorite_categories', ARRAY['memory', 'problem_solving'],
  'daily_goal_minutes', 30
),
ADD COLUMN device_notifications jsonb DEFAULT jsonb_build_object(
  'fall_detection', true,
  'emergency_alerts', true,
  'activity_reminders', true,
  'social_updates', true
);

-- Enable RLS
ALTER TABLE cognitive_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fall_detection_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE device_integrations ENABLE ROW LEVEL SECURITY;

-- Cognitive exercise policies
CREATE POLICY "Anyone can view exercises"
  ON cognitive_exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Cognitive progress policies
CREATE POLICY "Users can view their own progress"
  ON cognitive_progress
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE connected_user_id = auth.uid()
      AND user_id = cognitive_progress.user_id
      AND permissions ? 'health'
    )
  );

-- Social activity policies
CREATE POLICY "Anyone can view activities"
  ON social_activities
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can manage their activities"
  ON social_activities
  FOR ALL
  TO authenticated
  USING (created_by = auth.uid());

-- Activity participants policies
CREATE POLICY "Users can manage their participation"
  ON activity_participants
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Mood logs policies
CREATE POLICY "Users can manage their mood logs"
  ON mood_logs
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE connected_user_id = auth.uid()
      AND user_id = mood_logs.user_id
      AND permissions ? 'health'
    )
  );

-- Fall detection policies
CREATE POLICY "Users and caregivers can view fall events"
  ON fall_detection_events
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE connected_user_id = auth.uid()
      AND user_id = fall_detection_events.user_id
    )
  );

-- Device integration policies
CREATE POLICY "Users can manage their devices"
  ON device_integrations
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX idx_cognitive_progress_user ON cognitive_progress(user_id, created_at DESC);
CREATE INDEX idx_social_activities_date ON social_activities(start_time);
CREATE INDEX idx_activity_participants_user ON activity_participants(user_id);
CREATE INDEX idx_mood_logs_user_date ON mood_logs(user_id, created_at DESC);
CREATE INDEX idx_fall_events_user ON fall_detection_events(user_id, detected_at DESC);
CREATE INDEX idx_device_integrations_user ON device_integrations(user_id, device_type);