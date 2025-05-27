-- CareAI Database Setup Script
-- Run this script to populate the database with sample data for development

-- Ensure tab_configurations table exists and has data
INSERT INTO tab_configurations (name, title, icon, "order", roles, "isEnabled") 
VALUES 
  -- Senior tabs
  ('index', 'Home', 'home', 1, ARRAY['senior'], true),
  ('health', 'Health', 'heart', 2, ARRAY['senior'], true),
  ('cognitive', 'Mind', 'brain', 3, ARRAY['senior'], true),
  ('monitoring', 'Safety', 'shield', 4, ARRAY['senior'], true),
  ('settings', 'Settings', 'settings', 5, ARRAY['senior'], true),
  
  -- Family Member tabs
  ('index', 'Overview', 'activity', 1, ARRAY['child'], true),
  ('monitoring', 'Monitor', 'shield', 2, ARRAY['child'], true),
  ('chat', 'Messages', 'message-square', 3, ARRAY['child'], true),
  ('alerts', 'Alerts', 'bell', 4, ARRAY['child'], true),
  ('settings', 'Settings', 'settings', 5, ARRAY['child'], true),
  
  -- Healthcare Professional tabs
  ('index', 'Dashboard', 'stethoscope', 1, ARRAY['medical'], true),
  ('appointments', 'Schedule', 'calendar', 2, ARRAY['medical'], true),
  ('patients', 'Patients', 'users', 3, ARRAY['medical'], true),
  ('chat', 'Consult', 'message-square', 4, ARRAY['medical'], true),
  ('settings', 'Settings', 'settings', 5, ARRAY['medical'], true)
ON CONFLICT (name, "order") DO UPDATE SET
  title = EXCLUDED.title,
  icon = EXCLUDED.icon,
  roles = EXCLUDED.roles,
  "isEnabled" = EXCLUDED."isEnabled";

-- Create cognitive_exercises table if it doesn't exist
CREATE TABLE IF NOT EXISTS cognitive_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  type text NOT NULL CHECK (type IN ('memory', 'attention', 'problem_solving', 'language', 'visual')),
  difficulty text NOT NULL CHECK (difficulty IN ('easy', 'medium', 'hard')),
  content jsonb DEFAULT '{}',
  instructions text NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 5,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create cognitive_progress table if it doesn't exist  
CREATE TABLE IF NOT EXISTS cognitive_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  exercise_id uuid NOT NULL REFERENCES cognitive_exercises(id),
  score integer NOT NULL CHECK (score >= 0 AND score <= 100),
  completion_time integer NOT NULL, -- in seconds
  difficulty text NOT NULL,
  mistakes integer DEFAULT 0,
  feedback jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Insert sample cognitive exercises
INSERT INTO cognitive_exercises (title, type, difficulty, content, instructions, duration_minutes)
VALUES 
  (
    'Memory Match', 
    'memory', 
    'easy', 
    '{"pairs": 8, "theme": "numbers"}',
    'Match the cards by finding pairs. Click on two cards to flip them over. If they match, they will stay face up.',
    5
  ),
  (
    'Word Association', 
    'language', 
    'medium', 
    '{"word_count": 10, "categories": ["animals", "colors", "objects"]}',
    'Find words that are related to the given category. Think quickly and creatively!',
    8
  ),
  (
    'Pattern Recognition', 
    'visual', 
    'medium', 
    '{"pattern_length": 6, "complexity": "medium"}',
    'Study the pattern and complete the sequence. Look for the underlying rule.',
    10
  ),
  (
    'Math Challenge', 
    'problem_solving', 
    'hard', 
    '{"operation_types": ["addition", "subtraction", "multiplication"], "max_number": 100}',
    'Solve the math problems as quickly and accurately as possible.',
    12
  ),
  (
    'Attention Focus', 
    'attention', 
    'easy', 
    '{"target_color": "red", "distractors": 5}',
    'Focus on the red objects and count them. Ignore the distractors.',
    6
  ),
  (
    'Advanced Memory', 
    'memory', 
    'hard', 
    '{"pairs": 16, "theme": "mixed"}',
    'Advanced memory challenge with more pairs. Stay focused and remember the positions.',
    10
  ),
  (
    'Word Puzzle', 
    'language', 
    'easy', 
    '{"word_length": 5, "hints": true}',
    'Unscramble the letters to form a word. Use the hints if you get stuck.',
    7
  ),
  (
    'Visual Tracking', 
    'visual', 
    'hard', 
    '{"objects": 8, "speed": "fast"}',
    'Track the moving objects and remember their final positions.',
    8
  )
ON CONFLICT (title) DO UPDATE SET
  type = EXCLUDED.type,
  difficulty = EXCLUDED.difficulty,
  content = EXCLUDED.content,
  instructions = EXCLUDED.instructions,
  duration_minutes = EXCLUDED.duration_minutes,
  updated_at = now();

-- Enable Row Level Security
ALTER TABLE cognitive_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE cognitive_progress ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for cognitive_exercises (public read access)
CREATE POLICY "Allow public read access to cognitive exercises"
  ON cognitive_exercises
  FOR SELECT
  TO authenticated
  USING (true);

-- Create RLS policies for cognitive_progress (users can only access their own data)
CREATE POLICY "Users can view their own progress"
  ON cognitive_progress
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own progress"
  ON cognitive_progress
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own progress"
  ON cognitive_progress
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cognitive_progress_user_id ON cognitive_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_progress_exercise_id ON cognitive_progress(exercise_id);
CREATE INDEX IF NOT EXISTS idx_cognitive_progress_created_at ON cognitive_progress(created_at);
CREATE INDEX IF NOT EXISTS idx_cognitive_exercises_type ON cognitive_exercises(type);
CREATE INDEX IF NOT EXISTS idx_cognitive_exercises_difficulty ON cognitive_exercises(difficulty);

-- Verify the setup
SELECT 
  'Tab Configurations' as table_name,
  COUNT(*) as record_count
FROM tab_configurations
WHERE "isEnabled" = true

UNION ALL

SELECT 
  'Cognitive Exercises' as table_name,
  COUNT(*) as record_count  
FROM cognitive_exercises

UNION ALL

SELECT 
  'Cognitive Progress' as table_name,
  COUNT(*) as record_count
FROM cognitive_progress;

-- Show sample data
SELECT 'Sample Cognitive Exercises:' as info;
SELECT title, type, difficulty, duration_minutes 
FROM cognitive_exercises 
ORDER BY type, difficulty
LIMIT 10;

SELECT 'Tab Configuration by Role:' as info;
SELECT 
  role,
  COUNT(*) as tab_count,
  ARRAY_AGG(title ORDER BY "order") as tab_titles
FROM (
  SELECT 
    UNNEST(roles) as role,
    title,
    "order"
  FROM tab_configurations 
  WHERE "isEnabled" = true
) role_tabs
GROUP BY role
ORDER BY role; 