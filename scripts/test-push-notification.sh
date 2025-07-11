#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}CareAI Push Notification Test${NC}"
echo "-------------------------------------------"

# Check for user ID argument
if [ -z "$1" ]; then
  echo -e "${RED}Error: User ID is required${NC}"
  echo "Usage: $0 <user_id>"
  exit 1
fi

USER_ID=$1
EVENT_TYPE=${2:-"test_notification"}
MESSAGE=${3:-"This is a test notification from CareAI"}

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo -e "${YELLOW}Missing Supabase environment variables.${NC}"
  echo "Please ensure the following environment variables are set:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_KEY"
  echo "  - EXPO_ACCESS_TOKEN (optional but recommended)"
  exit 1
fi

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Determine if we can test all channels or just specific ones
CHANNELS=("push" "in-app")
if [ ! -z "$RESEND_API_KEY" ]; then
  CHANNELS+=("email")
  echo -e "${GREEN}Email delivery is enabled${NC}"
else
  echo -e "${YELLOW}Email delivery is disabled (RESEND_API_KEY not set)${NC}"
fi

echo -e "${YELLOW}Sending test notifications to user $USER_ID...${NC}"

# Create a unique event ID for this test
EVENT_ID=$(uuidgen | tr '[:upper:]' '[:lower:]')

# Generate the timestamp
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Test each notification channel
for CHANNEL in "${CHANNELS[@]}"; do
  echo -e "Testing ${YELLOW}$CHANNEL${NC} channel..."
  
  # Prepare the notification event JSON
  EVENT_JSON="{\"id\":\"$EVENT_ID\",\"title\":\"Test Notification\",\"message\":\"$MESSAGE\",\"type\":\"$EVENT_TYPE\",\"source\":\"system\",\"severity\":\"info\",\"timestamp\":\"$TIMESTAMP\"}"
  
  # Insert the notification record
  SQL="
  INSERT INTO notifications (
    event_id, 
    event, 
    recipient_id, 
    channel, 
    status
  ) VALUES (
    '$EVENT_ID', 
    '$EVENT_JSON'::jsonb, 
    '$USER_ID'::uuid, 
    '$CHANNEL'::notification_channel, 
    'pending'
  ) RETURNING id;"
  
  echo -e "Inserting notification record..."
  NOTIFICATION_ID=$(PGSSLMODE=require psql "$SUPABASE_URL" -U postgres -c "$SQL" -t | tr -d '[:space:]')
  
  if [ -z "$NOTIFICATION_ID" ]; then
    echo -e "${RED}✗ Failed to insert notification record${NC}"
  else
    echo -e "${GREEN}✓ Notification record created with ID: $NOTIFICATION_ID${NC}"
  fi
done

echo -e "\n${YELLOW}Running notification worker to process notifications...${NC}"
cd workers && npm run process-notifications

echo -e "\n${GREEN}✅ Test completed${NC}"
echo "-------------------------------------------"
echo "Check the device and app for notifications."
echo "You can also check the notification status in the database:"
echo "SELECT id, channel, status, delivered_at, error FROM notifications WHERE event_id = '$EVENT_ID';"
echo "-------------------------------------------" 