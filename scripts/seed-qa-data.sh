#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}CareAI QA Test Data Seeding${NC}"
echo "-------------------------------------------"

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo -e "${YELLOW}Missing Supabase environment variables.${NC}"
  echo "Please ensure the following environment variables are set:"
  echo "  - SUPABASE_URL (should be the UAT URL)"
  echo "  - SUPABASE_SERVICE_KEY"
  exit 1
fi

# Make sure we're in the project root
cd "$(dirname "$0")/.."

echo -e "${YELLOW}Creating demo user accounts...${NC}"

# Create demo seniors
create_senior() {
  local NAME=$1
  local EMAIL=$2
  local PASSWORD=$3
  
  echo "Creating senior account for $NAME..."
  
  # Create user account
  USER_ID=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO auth.users (
      instance_id, email, encrypted_password, email_confirmed_at, 
      aud, role, raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '$EMAIL',
      crypt('$PASSWORD', gen_salt('bf')),
      NOW(),
      'authenticated',
      'authenticated',
      '{\"provider\":\"email\",\"providers\":[\"email\"]}',
      '{\"name\":\"$NAME\", \"role\":\"senior\"}'
    ) RETURNING id;" -t | tr -d '[:space:]')
  
  if [ -z "$USER_ID" ]; then
    echo -e "${RED}Failed to create user account for $NAME${NC}"
    return 1
  fi
  
  # Create profile
  PROFILE_RESULT=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO profiles (
      id, created_at, email, display_name, role, avatar_url
    ) VALUES (
      '$USER_ID',
      NOW(),
      '$EMAIL',
      '$NAME',
      'senior',
      'https://i.pravatar.cc/150?u=$EMAIL'
    );" -t)
  
  echo -e "${GREEN}✓ Created senior account for $NAME with ID: $USER_ID${NC}"
  
  # Return the user ID
  echo "$USER_ID"
}

# Create demo caregivers
create_caregiver() {
  local NAME=$1
  local EMAIL=$2
  local PASSWORD=$3
  local ROLE=$4
  
  echo "Creating $ROLE account for $NAME..."
  
  # Create user account
  USER_ID=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO auth.users (
      instance_id, email, encrypted_password, email_confirmed_at, 
      aud, role, raw_app_meta_data, raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      '$EMAIL',
      crypt('$PASSWORD', gen_salt('bf')),
      NOW(),
      'authenticated',
      'authenticated',
      '{\"provider\":\"email\",\"providers\":[\"email\"]}',
      '{\"name\":\"$NAME\", \"role\":\"$ROLE\"}'
    ) RETURNING id;" -t | tr -d '[:space:]')
  
  if [ -z "$USER_ID" ]; then
    echo -e "${RED}Failed to create user account for $NAME${NC}"
    return 1
  fi
  
  # Create profile
  PROFILE_RESULT=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO profiles (
      id, created_at, email, display_name, role, avatar_url
    ) VALUES (
      '$USER_ID',
      NOW(),
      '$EMAIL',
      '$NAME',
      '$ROLE',
      'https://i.pravatar.cc/150?u=$EMAIL'
    );" -t)
  
  echo -e "${GREEN}✓ Created $ROLE account for $NAME with ID: $USER_ID${NC}"
  
  # Return the user ID
  echo "$USER_ID"
}

# Associate seniors with caregivers
associate_senior_caregiver() {
  local SENIOR_ID=$1
  local CAREGIVER_ID=$2
  local RELATIONSHIP=$3
  
  echo "Associating senior $SENIOR_ID with caregiver $CAREGIVER_ID as $RELATIONSHIP..."
  
  RESULT=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO care_relationships (
      senior_id, caregiver_id, relationship_type, status
    ) VALUES (
      '$SENIOR_ID',
      '$CAREGIVER_ID',
      '$RELATIONSHIP',
      'active'
    );" -t)
  
  echo -e "${GREEN}✓ Associated senior with caregiver${NC}"
}

# Create demo notification channels
setup_notification_preferences() {
  local USER_ID=$1
  
  echo "Setting up notification preferences for user $USER_ID..."
  
  RESULT=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO notification_preferences (
      user_id, channels, quiet_hours_enabled, quiet_hours_start, quiet_hours_end, quiet_hours_timezone
    ) VALUES (
      '$USER_ID',
      ARRAY['push', 'in-app', 'email']::notification_channel[],
      true,
      '22:00:00',
      '08:00:00',
      'America/New_York'
    );" -t)
  
  echo -e "${GREEN}✓ Set up notification preferences${NC}"
}

# Register device tokens
register_device_token() {
  local USER_ID=$1
  local TOKEN=$2
  
  echo "Registering device token for user $USER_ID..."
  
  RESULT=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO device_tokens (
      user_id, token, device_type, app_version
    ) VALUES (
      '$USER_ID',
      '$TOKEN',
      'ios',
      '1.0.0'
    );" -t)
  
  echo -e "${GREEN}✓ Registered device token${NC}"
}

# Create demo data
echo -e "${YELLOW}Creating demo seniors...${NC}"
SENIOR1_ID=$(create_senior "Ahmed Al-Saud" "ahmed.demo@careai.com" "Password123")
SENIOR2_ID=$(create_senior "Fatima Al-Harbi" "fatima.demo@careai.com" "Password123")
SENIOR3_ID=$(create_senior "Mohammed Al-Qahtani" "mohammed.demo@careai.com" "Password123")
SENIOR4_ID=$(create_senior "Layla Al-Mutairi" "layla.demo@careai.com" "Password123")
SENIOR5_ID=$(create_senior "Omar Al-Ghamdi" "omar.demo@careai.com" "Password123")

echo -e "${YELLOW}Creating demo caregivers...${NC}"
FAMILY_ID=$(create_caregiver "Sara Al-Saud" "sara.family@careai.com" "Password123" "family")
HEALTHPRO_ID=$(create_caregiver "Dr. Khalid Abadi" "khalid.healthpro@careai.com" "Password123" "healthpro")

echo -e "${YELLOW}Creating relationships...${NC}"
associate_senior_caregiver "$SENIOR1_ID" "$FAMILY_ID" "daughter"
associate_senior_caregiver "$SENIOR2_ID" "$FAMILY_ID" "daughter"
associate_senior_caregiver "$SENIOR3_ID" "$FAMILY_ID" "daughter"
associate_senior_caregiver "$SENIOR1_ID" "$HEALTHPRO_ID" "physician"
associate_senior_caregiver "$SENIOR2_ID" "$HEALTHPRO_ID" "physician"
associate_senior_caregiver "$SENIOR4_ID" "$HEALTHPRO_ID" "physician"
associate_senior_caregiver "$SENIOR5_ID" "$HEALTHPRO_ID" "physician"

echo -e "${YELLOW}Setting up notification preferences...${NC}"
setup_notification_preferences "$SENIOR1_ID"
setup_notification_preferences "$SENIOR2_ID"
setup_notification_preferences "$SENIOR3_ID"
setup_notification_preferences "$SENIOR4_ID"
setup_notification_preferences "$SENIOR5_ID"
setup_notification_preferences "$FAMILY_ID"
setup_notification_preferences "$HEALTHPRO_ID"

echo -e "${YELLOW}Registering dummy device tokens...${NC}"
register_device_token "$FAMILY_ID" "ExponentPushToken[XXXXXXXXXXXXXXXXXXXXXXX]"
register_device_token "$HEALTHPRO_ID" "ExponentPushToken[YYYYYYYYYYYYYYYYYYYYYYY]"

echo -e "${YELLOW}Creating sample health data...${NC}"
# Insert sample vital signs
for SENIOR_ID in "$SENIOR1_ID" "$SENIOR2_ID" "$SENIOR3_ID" "$SENIOR4_ID" "$SENIOR5_ID"; do
  # Generate 7 days of vitals data
  for i in {1..7}; do
    DATE=$(date -v-${i}d +%Y-%m-%d)
    
    # Random vitals within normal ranges
    SYSTOLIC=$((110 + RANDOM % 30))
    DIASTOLIC=$((70 + RANDOM % 20))
    HEART_RATE=$((60 + RANDOM % 30))
    TEMPERATURE=$(echo "scale=1; 36.5 + (RANDOM % 10) / 10" | bc)
    
    # Insert vitals record
    PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
      INSERT INTO vitals (
        user_id, recorded_at, systolic_bp, diastolic_bp, heart_rate, temperature
      ) VALUES (
        '$SENIOR_ID',
        '$DATE 09:00:00',
        $SYSTOLIC,
        $DIASTOLIC,
        $HEART_RATE,
        $TEMPERATURE
      );" -t
  done
  
  echo -e "${GREEN}✓ Created sample vitals for senior $SENIOR_ID${NC}"
  
  # Create some medication reminders
  MEDICATION_ID=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
    INSERT INTO medications (
      user_id, name, dosage, instructions, prescribed_by
    ) VALUES (
      '$SENIOR_ID',
      'Metformin',
      '500mg',
      'Take with food',
      'Dr. Khalid Abadi'
    ) RETURNING id;" -t | tr -d '[:space:]')
  
  # Create reminders for tomorrow
  TOMORROW=$(date -v+1d +%Y-%m-%d)
  for HOUR in "08:00:00" "14:00:00" "20:00:00"; do
    PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "
      INSERT INTO medication_reminders (
        medication_id, user_id, scheduled_for, medication_name, dosage, instructions
      ) VALUES (
        '$MEDICATION_ID',
        '$SENIOR_ID',
        '$TOMORROW $HOUR',
        'Metformin',
        '500mg',
        'Take with food'
      );" -t
  done
  
  echo -e "${GREEN}✓ Created medication reminders for senior $SENIOR_ID${NC}"
done

echo -e "${GREEN}✅ QA test data seeding completed${NC}"
echo "-------------------------------------------"
echo -e "${YELLOW}User Credentials:${NC}"
echo "Family Caregiver: sara.family@careai.com / Password123"
echo "Health Professional: khalid.healthpro@careai.com / Password123"
echo "Seniors: ahmed.demo@careai.com, fatima.demo@careai.com, etc. / Password123"
echo "-------------------------------------------" 