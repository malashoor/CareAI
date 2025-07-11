-- Enable Row Level Security on profiles table (if not already enabled)
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow profile owners to read their own profile
DROP POLICY IF EXISTS "owner_read_own_profile" ON public.profiles;
CREATE POLICY "owner_read_own_profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow profile owners to update their own profile
DROP POLICY IF EXISTS "owner_update_own_profile" ON public.profiles;
CREATE POLICY "owner_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile owners to insert their own profile (during signup/onboarding)
DROP POLICY IF EXISTS "owner_insert_own_profile" ON public.profiles;
CREATE POLICY "owner_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow family/caregiver roles to read profiles where share_data = true
DROP POLICY IF EXISTS "caregiver_read_shared_profiles" ON public.profiles;
CREATE POLICY "caregiver_read_shared_profiles" ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'caregiver'
    AND share_data = true
  );

-- Allow health professionals to read profiles where share_data = true
DROP POLICY IF EXISTS "healthpro_read_shared_profiles" ON public.profiles;
CREATE POLICY "healthpro_read_shared_profiles" ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'healthprofessional'
    AND share_data = true
  );

-- Disallow deletion for all users to prevent data loss
DROP POLICY IF EXISTS "no_delete_profiles" ON public.profiles;
CREATE POLICY "no_delete_profiles" ON public.profiles
  FOR DELETE
  USING (false); 