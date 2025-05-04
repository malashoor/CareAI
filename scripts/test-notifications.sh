#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting CareAI Notification Testing Suite${NC}"
echo "-------------------------------------------"

# Check if Expo CLI is installed
if ! command -v expo &> /dev/null; then
    echo "Expo CLI is not installed. Installing..."
    npm install -g expo-cli
fi

# Check if required packages are installed
echo -e "${YELLOW}Checking required packages...${NC}"
npm install expo-notifications expo-device expo-constants expo-speech

# Start Expo development server
echo -e "${YELLOW}Starting Expo development server...${NC}"
echo "Please scan the QR code with your secondary device when it appears."
echo "Make sure you have Expo Go installed on your secondary device."
echo "-------------------------------------------"

# Run the app in development mode
npx expo start --clear 