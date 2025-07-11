#!/bin/bash
# Check Notification Status Script for CareAI
# Usage: ./check-notification-status.sh <notification_id>

set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default API URL
API_URL="https://wvuyppurctdosfvlefkk.supabase.co/functions/v1/send-test-notification"

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo -e "${RED}Error: jq is required but not installed.${NC}"
  echo "Please install jq using your package manager:"
  echo "  - macOS: brew install jq"
  echo "  - Ubuntu/Debian: sudo apt install jq"
  exit 1
fi

# Print usage information
function print_usage {
  echo -e "${BLUE}CareAI Notification Status Checker${NC}"
  echo ""
  echo "Usage:"
  echo "  $0 <notification_id>"
  echo ""
  echo "Options:"
  echo "  -h, --help        Show this help message"
  echo "  -a, --all         Show all notifications for a user (requires user_id)"
  echo "  -u, --user USER   Specify user ID to check notifications for"
  echo ""
  echo "Examples:"
  echo "  $0 12345678-1234-1234-1234-123456789012"
  echo "  $0 --all --user auth0|123456789"
  exit 1
}

# Check a single notification
function check_notification {
  local notification_id="$1"
  
  echo -e "${YELLOW}Checking status of notification ${notification_id}...${NC}"
  
  # Check status
  response=$(curl -s "$API_URL/status/$notification_id")
  
  if [ "$(echo "$response" | jq -r '.error')" != "null" ]; then
    echo -e "${RED}Error: $(echo "$response" | jq -r '.error')${NC}"
    exit 1
  fi
  
  # Format and display the result
  status=$(echo "$response" | jq -r '.status')
  created=$(echo "$response" | jq -r '.created_at')
  processed=$(echo "$response" | jq -r '.processed_at')
  delivered=$(echo "$response" | jq -r '.delivered_at')
  
  echo -e "${GREEN}Notification Details:${NC}"
  echo "ID:         $notification_id"
  echo "Status:     $status"
  echo "Created:    $created"
  
  if [ "$processed" != "null" ]; then
    echo "Processed:  $processed"
  else
    echo "Processed:  Not yet processed"
  fi
  
  if [ "$delivered" != "null" ]; then
    echo "Delivered:  $delivered"
    
    # Calculate delivery time if both timestamps are available
    if [ "$created" != "null" ] && [ "$delivered" != "null" ]; then
      created_ts=$(date -j -f "%Y-%m-%dT%H:%M:%S.%NZ" "$created" "+%s" 2>/dev/null || date -d "$created" "+%s")
      delivered_ts=$(date -j -f "%Y-%m-%dT%H:%M:%S.%NZ" "$delivered" "+%s" 2>/dev/null || date -d "$delivered" "+%s")
      delivery_time=$((delivered_ts - created_ts))
      echo "Delay:      ${delivery_time}s"
    fi
  else
    echo "Delivered:  Not yet delivered"
  fi
  
  # Show additional info if available
  echo ""
  echo -e "${BLUE}Additional Details:${NC}"
  echo "$response" | jq '.channel, .recipient_id, .event'
}

# Check all notifications for a user
function check_all_notifications {
  local user_id="$1"
  
  echo -e "${YELLOW}Fetching all notifications for user ${user_id}...${NC}"
  
  # Fetch notifications
  response=$(curl -s "$API_URL/user/$user_id")
  
  if [ "$(echo "$response" | jq -r '.error')" != "null" ]; then
    echo -e "${RED}Error: $(echo "$response" | jq -r '.error')${NC}"
    exit 1
  fi
  
  count=$(echo "$response" | jq 'length')
  echo -e "${GREEN}Found $count notifications${NC}"
  
  if [ "$count" -eq 0 ]; then
    echo "No notifications found for this user."
    exit 0
  fi
  
  echo ""
  echo -e "${BLUE}Recent Notifications:${NC}"
  echo "$response" | jq -r '.[] | "ID: \(.id) | Status: \(.status) | Created: \(.created_at) | Type: \(.event.event_type)"'
  
  echo ""
  echo -e "${YELLOW}To check details of a specific notification:${NC}"
  echo "$0 <notification_id>"
}

# Parse command line arguments
if [ $# -eq 0 ]; then
  print_usage
fi

# Process arguments
case "$1" in
  -h|--help)
    print_usage
    ;;
  -a|--all)
    if [ -z "$3" ]; then
      echo -e "${RED}Error: User ID is required with --all option${NC}"
      print_usage
    fi
    check_all_notifications "$3"
    ;;
  -u|--user)
    if [ -z "$2" ]; then
      echo -e "${RED}Error: User ID is required with --user option${NC}"
      print_usage
    fi
    check_all_notifications "$2"
    ;;
  *)
    # Assume it's a notification ID
    if [[ ! "$1" =~ ^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$ ]]; then
      echo -e "${RED}Error: Invalid notification ID format${NC}"
      print_usage
    fi
    check_notification "$1"
    ;;
esac 