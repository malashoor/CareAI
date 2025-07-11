#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}CareAI Notification Worker${NC}"
echo "-------------------------------------------"

# Check for required environment variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
  echo -e "${YELLOW}Missing Supabase environment variables.${NC}"
  echo "Please ensure the following environment variables are set:"
  echo "  - SUPABASE_URL"
  echo "  - SUPABASE_SERVICE_KEY"
  echo "  - RESEND_API_KEY (optional for email delivery)"
  echo "-------------------------------------------"
  echo "Example:"
  echo "export SUPABASE_URL=\"https://your-project-ref.supabase.co\""
  echo "export SUPABASE_SERVICE_KEY=\"your-service-key\""
  echo "export RESEND_API_KEY=\"your-resend-api-key\""
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

# Run the worker
echo -e "${YELLOW}Starting notification worker...${NC}"
cd workers
npm run process-notifications

# Check exit code
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
  echo "Worker exited with error code: $EXIT_CODE"
  exit $EXIT_CODE
fi

echo -e "${GREEN}✅ Notification processing completed${NC}"
echo "-------------------------------------------" 