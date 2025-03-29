-- Add test date of birth data to existing profiles
DO $$
DECLARE
  test_senior_id uuid;
  test_medical_id uuid;
BEGIN
  -- Update test senior profile with DOB
  UPDATE profiles
  SET date_of_birth = '1950-06-15',
      consent_preferences = consent_preferences || 
        jsonb_build_object('date_of_birth_use', true)
  WHERE email = 'alice@example.com'
  RETURNING id INTO test_senior_id;

  -- Update test medical professional profile with DOB
  UPDATE profiles
  SET date_of_birth = '1975-03-22',
      consent_preferences = consent_preferences || 
        jsonb_build_object('date_of_birth_use', true)
  WHERE email = 'sarah@example.com'
  RETURNING id INTO test_medical_id;

  -- Add more test profiles with varying ages
  INSERT INTO profiles (
    id, role, name, email, date_of_birth, timezone, consent_preferences
  ) VALUES
    (
      gen_random_uuid(),
      'senior',
      'Robert Wilson',
      'robert@example.com',
      '1945-12-10',
      'America/New_York',
      jsonb_build_object(
        'health_data_tracking', true,
        'location_tracking', true,
        'voice_recording', true,
        'sharing_with_family', true,
        'sharing_with_professionals', true,
        'date_of_birth_use', true,
        'last_updated', current_timestamp
      )
    ),
    (
      gen_random_uuid(),
      'senior',
      'Margaret Chen',
      'margaret@example.com',
      '1955-08-28',
      'America/Los_Angeles',
      jsonb_build_object(
        'health_data_tracking', true,
        'location_tracking', true,
        'voice_recording', true,
        'sharing_with_family', true,
        'sharing_with_professionals', true,
        'date_of_birth_use', true,
        'last_updated', current_timestamp
      )
    ),
    (
      gen_random_uuid(),
      'medical',
      'Dr. James Anderson',
      'james@example.com',
      '1965-04-15',
      'America/Chicago',
      jsonb_build_object(
        'health_data_tracking', true,
        'location_tracking', true,
        'voice_recording', true,
        'sharing_with_family', true,
        'sharing_with_professionals', true,
        'date_of_birth_use', true,
        'last_updated', current_timestamp
      )
    )
  ON CONFLICT (email) DO UPDATE
  SET date_of_birth = EXCLUDED.date_of_birth,
      consent_preferences = EXCLUDED.consent_preferences;
END $$; 