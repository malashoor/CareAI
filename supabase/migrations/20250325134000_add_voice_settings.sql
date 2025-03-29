-- Add voice_settings column to profiles table
ALTER TABLE profiles
ADD COLUMN voice_settings JSONB DEFAULT jsonb_build_object(
  'speed', 1.0,
  'pitch', 1.0,
  'volume', 1.0,
  'clarity', 1.0
);

-- Add voice settings to existing profiles
UPDATE profiles
SET voice_settings = jsonb_build_object(
  'speed', CASE 
    WHEN date_of_birth IS NOT NULL AND 
         EXTRACT(YEAR FROM age(date_of_birth)) >= 70 THEN 0.9
    ELSE 1.0
  END,
  'pitch', CASE 
    WHEN date_of_birth IS NOT NULL AND 
         EXTRACT(YEAR FROM age(date_of_birth)) >= 70 THEN 0.95
    ELSE 1.0
  END,
  'volume', CASE 
    WHEN date_of_birth IS NOT NULL AND 
         EXTRACT(YEAR FROM age(date_of_birth)) >= 70 THEN 1.2
    ELSE 1.0
  END,
  'clarity', CASE 
    WHEN date_of_birth IS NOT NULL AND 
         EXTRACT(YEAR FROM age(date_of_birth)) >= 70 THEN 1.1
    ELSE 1.0
  END
)
WHERE voice_settings IS NULL; 