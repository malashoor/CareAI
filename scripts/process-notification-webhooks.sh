#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}CareAI Notification and Webhook Processing${NC}"
echo "-------------------------------------------"

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo -e "${YELLOW}Missing Supabase environment variables.${NC}"
  echo "Please ensure the following environment variables are set:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_KEY"
  echo "  - EXPO_ACCESS_TOKEN (for push notifications)"
  echo "  - RESEND_API_KEY (for email delivery)"
  exit 1
fi

# Make sure we're in the project root
cd "$(dirname "$0")/.."

# Check if the worker directory exists
if [ ! -d "workers" ]; then
  echo "Error: workers directory not found."
  exit 1
fi

# Check if the worker dependencies are installed
if [ ! -d "workers/node_modules" ]; then
  echo -e "${YELLOW}Installing dependencies...${NC}"
  cd workers && npm install
  cd ..
fi

# Run the notification worker
echo -e "${YELLOW}Starting notification worker...${NC}"
cd workers
npm run process-notifications

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "Notification worker exited with error code: $EXIT_CODE"
  exit $EXIT_CODE
fi

echo -e "${GREEN}✅ Notification processing completed${NC}"

# Run the webhook worker
echo -e "${YELLOW}Starting webhook worker...${NC}"
npm run process-webhooks

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "Webhook worker exited with error code: $EXIT_CODE"
  exit $EXIT_CODE
fi

echo -e "${GREEN}✅ Webhook processing completed${NC}"
echo "-------------------------------------------"

echo -e "${YELLOW}For production deployments, set up the following cron jobs:${NC}"
echo "# Run notification worker every 2 minutes"
echo "*/2 * * * * cd /path/to/CareAI && ./scripts/run-notification-worker.sh >> /var/log/careai/notifications.log 2>&1"
echo ""
echo "# Run webhook worker every 3 minutes"
echo "*/3 * * * * cd /path/to/CareAI && ./scripts/run-webhook-worker.sh >> /var/log/careai/webhooks.log 2>&1"
echo ""
echo "# Clear stale notification data weekly"
echo "0 0 * * 0 cd /path/to/CareAI && ./scripts/cleanup-notifications.sh >> /var/log/careai/cleanup.log 2>&1"
echo "-------------------------------------------" 