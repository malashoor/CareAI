-- Add date_of_birth column to profiles table
ALTER TABLE profiles
ADD COLUMN date_of_birth DATE;

-- Update RLS policy to include date_of_birth
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
CREATE POLICY "Users can view their own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM relationships
    WHERE (requester_id = auth.uid() AND target_id = profiles.id OR
           target_id = auth.uid() AND requester_id = profiles.id) AND
          status = 'approved'
  )
);

-- Add policy for updating date_of_birth
DROP POLICY IF EXISTS "Users can update their own date_of_birth" ON profiles;
CREATE POLICY "Users can update their own date_of_birth"
ON profiles FOR UPDATE
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Add function to check if user has access to profile
CREATE OR REPLACE FUNCTION check_profile_access(profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    profile_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM relationships
      WHERE (requester_id = auth.uid() AND target_id = profile_id OR
             target_id = auth.uid() AND requester_id = profile_id) AND
            status = 'approved'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 