#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}CareAI Push Notification Services Setup${NC}"
echo "-------------------------------------------"

# Check for required files
echo -e "${YELLOW}Checking for required files...${NC}"

FCM_CONFIG="./android/app/google-services.json"
APNS_KEY_FILE="./.apns/AuthKey.p8"

# Check for FCM configuration file
if [ -f "$FCM_CONFIG" ]; then
  echo -e "${GREEN}✓ Firebase configuration file found${NC}"
else
  echo -e "${RED}✗ Firebase configuration file not found${NC}"
  echo "Please add google-services.json to android/app/ directory"
  echo "You can get this from the Firebase Console → Project Settings → Your Apps"
fi

# Check for APNs key file
if [ -f "$APNS_KEY_FILE" ]; then
  echo -e "${GREEN}✓ APNs key file found${NC}"
else
  echo -e "${RED}✗ APNs key file not found${NC}"
  echo "Please add your APNs Auth Key to .apns/AuthKey.p8"
  echo "You can get this from Apple Developer Portal → Certificates, IDs & Profiles → Keys"
  
  # Create .apns directory if it doesn't exist
  mkdir -p ./.apns
fi

# Set up environment variables
echo -e "\n${YELLOW}Setting up environment variables in Supabase...${NC}"

# Check if npx is available
if ! command -v npx &> /dev/null; then
  echo -e "${RED}Error: npx is not installed. Please install Node.js and npm.${NC}"
  exit 1
fi

# Prompt for FCM server key
read -p "Enter your FCM Server Key: " FCM_SERVER_KEY
if [ -z "$FCM_SERVER_KEY" ]; then
  echo -e "${RED}Error: FCM Server Key is required${NC}"
else
  echo "Setting FCM_SERVER_KEY in Supabase secrets..."
  npx supabase secrets set FCM_SERVER_KEY="$FCM_SERVER_KEY"
  echo "Exporting FCM_SERVER_KEY to local environment..."
  export FCM_SERVER_KEY="$FCM_SERVER_KEY"
fi

# Prompt for APNs details
read -p "Enter your APNs Key ID: " APNS_KEY_ID
read -p "Enter your APNs Team ID: " APNS_TEAM_ID

if [ -f "$APNS_KEY_FILE" ] && [ ! -z "$APNS_KEY_ID" ] && [ ! -z "$APNS_TEAM_ID" ]; then
  # Read the APNs key file
  APNS_KEY=$(cat "$APNS_KEY_FILE")
  
  echo "Setting APNs secrets in Supabase..."
  npx supabase secrets set APNS_KEY_ID="$APNS_KEY_ID"
  npx supabase secrets set APNS_TEAM_ID="$APNS_TEAM_ID"
  npx supabase secrets set APNS_KEY="$APNS_KEY"
  
  echo "Exporting APNs variables to local environment..."
  export APNS_KEY_ID="$APNS_KEY_ID"
  export APNS_TEAM_ID="$APNS_TEAM_ID"
  export APNS_KEY="$APNS_KEY"
fi

# Set up Expo Access Token
read -p "Enter your Expo Access Token (from expo.dev): " EXPO_ACCESS_TOKEN
if [ ! -z "$EXPO_ACCESS_TOKEN" ]; then
  echo "Setting EXPO_ACCESS_TOKEN in Supabase secrets..."
  npx supabase secrets set EXPO_ACCESS_TOKEN="$EXPO_ACCESS_TOKEN"
  echo "Exporting EXPO_ACCESS_TOKEN to local environment..."
  export EXPO_ACCESS_TOKEN="$EXPO_ACCESS_TOKEN"
fi

echo -e "\n${GREEN}✅ Push notification services configuration completed${NC}"
echo "-------------------------------------------"
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Verify app.json has the correct bundle identifiers:"
echo "   - expo.android.package: com.careai.app"
echo "   - expo.ios.bundleIdentifier: com.careai.app"
echo "2. Test push notifications using the test script:"
echo "   ./scripts/test-push-notification.sh"
echo "-------------------------------------------" 