-- Add date_of_birth column to profiles table
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS date_of_birth DATE;

-- Update consent_preferences default to include date_of_birth_use
ALTER TABLE profiles
ALTER COLUMN consent_preferences SET DEFAULT jsonb_build_object(
  'health_data_tracking', true,
  'location_tracking', true,
  'voice_recording', true,
  'sharing_with_family', true,
  'sharing_with_professionals', true,
  'date_of_birth_use', true,
  'last_updated', current_timestamp
);

-- Update existing profiles to include date_of_birth_use in consent_preferences
UPDATE profiles
SET consent_preferences = consent_preferences || 
  jsonb_build_object('date_of_birth_use', true)
WHERE consent_preferences->>'date_of_birth_use' IS NULL;

-- Create function to check if user has access to profile
CREATE OR REPLACE FUNCTION check_profile_access(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user is the profile owner
  IF auth.uid() = profile_id THEN
    RETURN TRUE;
  END IF;

  -- Check if user is an assigned family member or professional
  RETURN EXISTS (
    SELECT 1
    FROM profile_relationships pr
    WHERE pr.target_profile_id = profile_id
    AND pr.source_profile_id = auth.uid()
    AND pr.status = 'approved'
    AND pr.relationship_type IN ('family', 'professional')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update RLS policy for profiles to use the new access check function
DROP POLICY IF EXISTS "Users can view authorized profiles" ON profiles;
CREATE POLICY "Users can view authorized profiles" ON profiles
  FOR SELECT USING (
    check_profile_access(id)
  ); 