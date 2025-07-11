# Profile Management Module - Functional Test Checklist

This document outlines the functional tests required to verify the profile management features.

## Prerequisites

- Supabase project with RLS policies applied
- Test users of different roles (patient, caregiver, healthprofessional)

## Supabase RLS Configuration

Before testing, ensure all the required RLS policies are applied to the profiles table. Run the following SQL script:

```sql
-- Enable Row Level Security
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;

-- Allow profile owners to read their own profile
CREATE POLICY "owner_read_own_profile" ON public.profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Allow profile owners to update their own profile
CREATE POLICY "owner_update_own_profile" ON public.profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Allow profile owners to insert their own profile
CREATE POLICY "owner_insert_own_profile" ON public.profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Allow family/caregiver roles to read profiles where share_data = true
CREATE POLICY "caregiver_read_shared_profiles" ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'caregiver'
    AND share_data = true
  );

-- Allow health professionals to read profiles where share_data = true
CREATE POLICY "healthpro_read_shared_profiles" ON public.profiles
  FOR SELECT
  USING (
    (auth.jwt() ->> 'role')::text = 'healthprofessional'
    AND share_data = true
  );
```

## Functional Test Checklist

### 1. Patient (Owner) User Tests

- [ ] **Login / Authentication**
  - [ ] New user should be directed to onboarding
  - [ ] Returning user should be directed to main tabs
  
- [ ] **Profile Settings Basic Functionality**
  - [ ] Profile screen loads without errors
  - [ ] Full name field accepts text input
  - [ ] Phone number field accepts numeric input
  - [ ] Language dropdown shows available options
  - [ ] Saving profile shows success toast

- [ ] **Accessibility Features**
  - [ ] Toggle Larger Text Size updates font_scale to 1.2
  - [ ] Toggle High Contrast Mode updates high_contrast to true
  - [ ] Observe UI changes when toggles are applied (font size larger, high contrast colors)

- [ ] **Privacy Settings**
  - [ ] Toggle Share Data with Caregivers updates share_data setting
  - [ ] Toggling to false prevents caregivers from viewing profile (test with separate account)

### 2. Caregiver / Family Member User Tests

- [ ] **Access Control**
  - [ ] Cannot update a senior's profile settings (should receive permission denied)
  - [ ] Can view senior's profile only if share_data = true
  - [ ] Cannot view senior's profile if share_data = false
  
### 3. Health Professional User Tests

- [ ] **Access Control**
  - [ ] Cannot update a patient's profile settings
  - [ ] Can view patient's profile only if share_data = true
  - [ ] Cannot view patient's profile if share_data = false

### 4. Across All Users

- [ ] **UI/UX**
  - [ ] Larger font scale is respected across the app
  - [ ] High contrast mode is applied consistently across all screens
  - [ ] Proper error messages when operations fail
  - [ ] Loading states shown during async operations

## Automated Tests

Ensure all automated tests for the profile module pass:

```bash
# Run unit and integration tests
yarn test src/tests/ProfileScreen.test.tsx

# Run the RLS verification script
yarn ts-node scripts/verifyProfileRLS.ts
```

## Type Safety

Verify TypeScript checks pass for all profile-related files:

```bash
# Run TypeScript type checking
yarn type-check
```

## Known Issues

Document any known issues or limitations:

1. On iOS, we don't have direct access to system font scale preferences
2. Testing RLS policies requires appropriate Supabase API keys configured in the environment 