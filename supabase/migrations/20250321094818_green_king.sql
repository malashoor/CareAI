/*
  # Subscription and Enhanced Features Schema

  1. New Tables
    - `subscriptions`
      - Tracks user subscription status and plan details
    - `health_insights`
      - Stores AI-generated health insights and recommendations
    - `medical_consultations`
      - Records medical advice and consultation sessions
    - `subscription_trials`
      - Manages free trial periods

  2. Security
    - Enable RLS on all new tables
    - Add policies for subscription access control
    - Add policies for medical data access

  3. Changes
    - Add subscription-related fields to profiles
    - Add consultation capabilities to appointments
*/

-- Create subscriptions table
CREATE TABLE subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('free', 'premium', 'family', 'professional')),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'annual')),
  status text NOT NULL CHECK (status IN ('active', 'cancelled', 'past_due')),
  current_period_start timestamptz NOT NULL,
  current_period_end timestamptz NOT NULL,
  cancel_at_period_end boolean DEFAULT false,
  payment_method jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create subscription trials table
CREATE TABLE subscription_trials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  plan_type text NOT NULL CHECK (plan_type IN ('premium', 'family', 'professional')),
  start_date timestamptz NOT NULL DEFAULT now(),
  end_date timestamptz NOT NULL,
  converted_to_paid boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create health insights table
CREATE TABLE health_insights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) NOT NULL,
  type text NOT NULL CHECK (type IN ('medication', 'vitals', 'lifestyle', 'trend')),
  severity text NOT NULL CHECK (severity IN ('info', 'warning', 'critical')),
  insight text NOT NULL,
  recommendations jsonb NOT NULL,
  metrics_snapshot jsonb,
  created_at timestamptz DEFAULT now()
);

-- Create medical consultations table
CREATE TABLE medical_consultations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  appointment_id uuid REFERENCES appointments(id),
  senior_id uuid REFERENCES profiles(id) NOT NULL,
  professional_id uuid REFERENCES profiles(id) NOT NULL,
  consultation_type text NOT NULL CHECK (consultation_type IN ('chat', 'video', 'voice')),
  status text NOT NULL CHECK (status IN ('scheduled', 'in_progress', 'completed', 'cancelled')),
  notes text,
  recommendations jsonb,
  follow_up_required boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add subscription fields to profiles
ALTER TABLE profiles
ADD COLUMN subscription_id uuid REFERENCES subscriptions(id),
ADD COLUMN features_enabled jsonb DEFAULT jsonb_build_object(
  'advanced_analytics', false,
  'medical_advice', false,
  'appointment_rescheduling', false,
  'video_consultations', false
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_trials ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE medical_consultations ENABLE ROW LEVEL SECURITY;

-- Subscription policies
CREATE POLICY "Users can view their own subscription"
  ON subscriptions
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can view their own trial"
  ON subscription_trials
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Health insights policies
CREATE POLICY "Users can view their own health insights"
  ON health_insights
  FOR SELECT
  TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE connected_user_id = auth.uid()
      AND user_id = health_insights.user_id
      AND permissions ? 'health'
    )
  );

-- Medical consultation policies
CREATE POLICY "Medical professionals can manage consultations"
  ON medical_consultations
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

CREATE POLICY "Seniors can view their consultations"
  ON medical_consultations
  FOR SELECT
  TO authenticated
  USING (
    senior_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM connected_users
      WHERE connected_user_id = auth.uid()
      AND user_id = medical_consultations.senior_id
      AND relationship IN ('child', 'medical')
    )
  );

-- Create indexes
CREATE INDEX idx_subscriptions_user ON subscriptions(user_id, status);
CREATE INDEX idx_trials_user ON subscription_trials(user_id, end_date);
CREATE INDEX idx_health_insights_user ON health_insights(user_id, created_at DESC);
CREATE INDEX idx_consultations_appointment ON medical_consultations(appointment_id);
CREATE INDEX idx_consultations_senior ON medical_consultations(senior_id, created_at DESC);
CREATE INDEX idx_consultations_professional ON medical_consultations(professional_id, created_at DESC);