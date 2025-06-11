/*
  # Add test data for cognitive exercises and activities
  
  This migration adds sample data for:
  1. Cognitive exercises
  2. Social activities
  3. Fall detection events
  4. Subscription trials

  Note: User profiles should be created through the auth system and application logic,
  not directly in the database, to ensure proper foreign key relationships.
*/

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
DO $$
DECLARE
  first_profile_id uuid;
BEGIN
  -- Get the first available profile for sample data
  SELECT id INTO first_profile_id FROM profiles LIMIT 1;

  IF first_profile_id IS NOT NULL THEN
    -- Add social activities
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
      first_profile_id,
      'upcoming'
    ),
    ('Book Club Meeting', 'Discussion of "The Thursday Murder Club"', 'book_club',
      NOW() + INTERVAL '2 days',
      NOW() + INTERVAL '2 days' + INTERVAL '2 hours',
      15,
      NULL,
      first_profile_id,
      'upcoming'
    );

    -- Add fall detection event
    INSERT INTO fall_detection_events (
      user_id, detected_at, location, severity,
      response_status, device_data
    ) VALUES
    (
      first_profile_id,
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

    -- Add subscription trial
    INSERT INTO subscription_trials (
      user_id, plan_type, end_date
    ) VALUES (
      first_profile_id,
      'premium',
      NOW() + INTERVAL '14 days'
    );
  END IF;
END $$;