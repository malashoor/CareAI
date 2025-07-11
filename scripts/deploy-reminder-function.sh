#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}CareAI Medication Reminder Function Deployment${NC}"
echo "-------------------------------------------"

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
  echo -e "${RED}Error: Supabase CLI is not installed.${NC}"
  echo "Please install it with: npm install -g supabase"
  exit 1
fi

# Check if we have the required files
if [ ! -d "supabase/functions/send-reminder" ]; then
  echo -e "${RED}Error: send-reminder function not found.${NC}"
  echo "Make sure the function exists at supabase/functions/send-reminder/"
  exit 1
fi

echo -e "${YELLOW}Deploying send-reminder function...${NC}"
supabase functions deploy send-reminder

# Check if the function was deployed successfully
if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to deploy function.${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Function deployed successfully${NC}"

# Schedule the function
echo -e "${YELLOW}Scheduling function to run every 15 minutes...${NC}"
supabase functions schedule send-reminder "*/15 * * * *"

if [ $? -ne 0 ]; then
  echo -e "${RED}Error: Failed to schedule function.${NC}"
  echo "You may need to manually schedule it in the Supabase dashboard."
  exit 1
fi

echo -e "${GREEN}✓ Function scheduled successfully${NC}"
echo "-------------------------------------------"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Create the medication_reminders table if it doesn't exist:"
echo "2. Test the function by creating a medication reminder with a past date:"
echo "   INSERT INTO medication_reminders (medication_id, user_id, scheduled_for, medication_name, dosage, status)"
echo "   VALUES ('your-medication-id', 'your-user-id', NOW(), 'Medication Name', '10mg', 'pending');"
echo "3. Invoke the function manually to test:"
echo "   supabase functions invoke send-reminder"
echo "-------------------------------------------" 