/*
  # Add test data for initial testing
  
  This migration adds sample data for:
  1. Create test user profiles first
  2. Cognitive exercises
  3. Social activities
  4. Fall detection events
  5. Subscription trials
*/

-- First, create test user profiles if they don't exist
DO $$
DECLARE
  test_senior_id uuid;
  test_medical_id uuid;
BEGIN
  -- Create a test senior profile
  INSERT INTO profiles (id, role, name, email, timezone)
  VALUES (
    gen_random_uuid(),
    'senior',
    'Alice Johnson',
    'alice@example.com',
    'America/New_York'
  )
  ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name
  RETURNING id INTO test_senior_id;

  -- Create a test medical professional profile
  INSERT INTO profiles (id, role, name, email, timezone)
  VALUES (
    gen_random_uuid(),
    'medical',
    'Dr. Sarah Smith',
    'sarah@example.com',
    'America/New_York'
  )
  ON CONFLICT (email) DO UPDATE
  SET name = EXCLUDED.name
  RETURNING id INTO test_medical_id;

  -- Add sample cognitive exercises
  INSERT INTO cognitive_exercises (title, type, difficulty, content, instructions, duration_minutes) VALUES
  ('Memory Match', 'memory', 'easy', 
    jsonb_build_object(
      'cards', 12,
      'theme', 'nature',
      'time_limit', 120
    ),
    'Match pairs of cards by remembering their positions',
    5
  ),
  ('Word Association', 'language', 'medium',
    jsonb_build_object(
      'words', 20,
      'categories', ARRAY['animals', 'food', 'colors']
    ),
    'Group words into their correct categories',
    10
  ),
  ('Pattern Recognition', 'visual', 'hard',
    jsonb_build_object(
      'patterns', 15,
      'complexity', 'high'
    ),
    'Complete the sequence by identifying the pattern',
    15
  );

  -- Add sample social activities
  INSERT INTO social_activities (
    title, description, type, start_time, end_time,
    max_participants, location, created_by, status
  ) VALUES
  ('Morning Yoga', 'Gentle yoga session for seniors', 'fitness',
    NOW() + INTERVAL '1 day',
    NOW() + INTERVAL '1 day' + INTERVAL '1 hour',
    10,
    jsonb_build_object(
      'name', 'Community Center',
      'address', '123 Main St',
      'coordinates', jsonb_build_object('latitude', 40.7128, 'longitude', -74.0060)
    ),
    test_medical_id,
    'upcoming'
  ),
  ('Book Club Meeting', 'Discussion of "The Thursday Murder Club"', 'book_club',
    NOW() + INTERVAL '2 days',
    NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
    15,
    NULL,
    test_medical_id,
    'upcoming'
  );

  -- Add sample fall detection events
  INSERT INTO fall_detection_events (
    user_id, detected_at, location, severity,
    response_status, device_data
  ) VALUES
  (
    test_senior_id,
    NOW() - INTERVAL '2 hours',
    jsonb_build_object(
      'latitude', 40.7128,
      'longitude', -74.0060,
      'accuracy', 10
    ),
    'medium',
    'resolved',
    jsonb_build_object(
      'device_type', 'smartwatch',
      'acceleration', jsonb_build_object('x', -9.8, 'y', 0.5, 'z', 0.3),
      'heart_rate', 85
    )
  );

  -- Add subscription trial for testing
  INSERT INTO subscription_trials (
    user_id, plan_type, end_date
  ) VALUES (
    test_senior_id,
    'premium',
    NOW() + INTERVAL '14 days'
  );

END $$;