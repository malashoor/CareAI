#!/bin/bash

# Get the user ID from the argument or prompt for it
USER_ID=$1

if [ -z "$USER_ID" ]; then
  echo "Please enter a user ID to send a test notification to:"
  read USER_ID
fi

if [ -z "$USER_ID" ]; then
  echo "Error: No user ID provided. Exiting."
  exit 1
fi

echo "Sending test notification to user: $USER_ID"

# Run the notification test script
node scripts/test-notifications.js $USER_ID

# Check exit code
if [ $? -eq 0 ]; then
  echo "✅ Test notification sent successfully!"
else
  echo "❌ Failed to send test notification. Check the logs above for details."
fi 