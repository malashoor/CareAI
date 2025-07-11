#!/bin/bash
# Push Notification Field Testing Script for CareAI
# Usage: ./test-push-notification-field.sh <device_token> <event_type> <user_id>

set -e

# Colors for terminal output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
API_URL="https://wvuyppurctdosfvlefkk.supabase.co/functions/v1/send-test-notification"
TOKEN_FILE=".device-tokens.json"
TEST_TYPES=("sos_triggered" "medication_missed" "vital_anomaly" "emotion_change")

# Helper functions
function print_usage {
  echo -e "${BLUE}CareAI Push Notification Field Testing Tool${NC}"
  echo ""
  echo "Usage:"
  echo "  $0 --register <device_token> <device_name> <user_id>"
  echo "  $0 --test <event_type> [user_id]"
  echo "  $0 --status <notification_id>"
  echo ""
  echo "Options:"
  echo "  --register      Register a new device token for testing"
  echo "  --test          Send a test notification"
  echo "  --status        Check status of a sent notification"
  echo ""
  echo "Event Types:"
  for type in "${TEST_TYPES[@]}"; do
    echo "  - $type"
  done
  exit 1
}

function register_device {
  local token="$1"
  local device_name="$2"
  local user_id="$3"
  
  if [[ -z "$token" || -z "$device_name" || -z "$user_id" ]]; then
    echo -e "${RED}Error: Missing parameters for device registration${NC}"
    print_usage
  fi
  
  echo -e "${YELLOW}Registering device token for testing...${NC}"
  
  # Create token file if it doesn't exist
  if [[ ! -f "$TOKEN_FILE" ]]; then
    echo '{"devices":[]}' > "$TOKEN_FILE"
  fi
  
  # Add device to JSON file
  local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
  local temp_file=$(mktemp)
  jq --arg token "$token" \
     --arg name "$device_name" \
     --arg user "$user_id" \
     --arg time "$timestamp" \
     '.devices += [{token: $token, device_name: $name, user_id: $user, registered_at: $time}]' \
     "$TOKEN_FILE" > "$temp_file" && mv "$temp_file" "$TOKEN_FILE"
  
  echo -e "${GREEN}Device registered successfully!${NC}"
  echo ""
  echo "Device details:"
  echo "  Token: ${token:0:15}...${token: -10}"
  echo "  Name: $device_name"
  echo "  User ID: $user_id"
  echo ""
  echo -e "${YELLOW}You can now use this token for testing with:${NC}"
  echo "  $0 --test <event_type> $user_id"
}

function send_test_notification {
  local event_type="$1"
  local user_id="$2"
  
  if [[ -z "$event_type" ]]; then
    echo -e "${RED}Error: Event type is required${NC}"
    print_usage
  fi
  
  # Validate event type
  local valid_type=false
  for type in "${TEST_TYPES[@]}"; do
    if [[ "$event_type" == "$type" ]]; then
      valid_type=true
      break
    fi
  done
  
  if [[ "$valid_type" == "false" ]]; then
    echo -e "${RED}Error: Invalid event type '$event_type'${NC}"
    print_usage
  fi
  
  local payload=""
  
  # If user_id is provided, find their token
  if [[ ! -z "$user_id" ]]; then
    if [[ ! -f "$TOKEN_FILE" ]]; then
      echo -e "${RED}Error: No registered devices found. Register a device first.${NC}"
      exit 1
    fi
    
    # Get device token for this user
    local device_token=$(jq -r --arg user "$user_id" '.devices[] | select(.user_id == $user) | .token' "$TOKEN_FILE" | head -1)
    
    if [[ -z "$device_token" || "$device_token" == "null" ]]; then
      echo -e "${RED}Error: No device token found for user $user_id${NC}"
      exit 1
    fi
    
    payload="{\"event_type\":\"$event_type\",\"user_id\":\"$user_id\",\"device_token\":\"$device_token\"}"
  else
    # Use most recently registered device
    if [[ ! -f "$TOKEN_FILE" ]]; then
      echo -e "${RED}Error: No registered devices found. Register a device first.${NC}"
      exit 1
    fi
    
    local device_data=$(jq -r '.devices | sort_by(.registered_at) | reverse | .[0]' "$TOKEN_FILE")
    local device_token=$(echo "$device_data" | jq -r '.token')
    local user_id=$(echo "$device_data" | jq -r '.user_id')
    local device_name=$(echo "$device_data" | jq -r '.device_name')
    
    if [[ -z "$device_token" || "$device_token" == "null" ]]; then
      echo -e "${RED}Error: No device token found in registry${NC}"
      exit 1
    fi
    
    echo -e "${YELLOW}Using most recent device: $device_name${NC}"
    payload="{\"event_type\":\"$event_type\",\"user_id\":\"$user_id\",\"device_token\":\"$device_token\"}"
  fi
  
  echo -e "${YELLOW}Sending test notification for '$event_type'...${NC}"
  
  # Send notification
  response=$(curl -s -X POST "$API_URL" \
    -H "Content-Type: application/json" \
    -d "$payload")
  
  notification_id=$(echo "$response" | jq -r '.notification_id')
  
  if [[ -z "$notification_id" || "$notification_id" == "null" ]]; then
    echo -e "${RED}Error sending notification: ${NC}"
    echo "$response"
    exit 1
  fi
  
  echo -e "${GREEN}Notification sent successfully!${NC}"
  echo "Notification ID: $notification_id"
  echo ""
  echo -e "${YELLOW}To check status:${NC}"
  echo "  $0 --status $notification_id"
}

function check_notification_status {
  local notification_id="$1"
  
  if [[ -z "$notification_id" ]]; then
    echo -e "${RED}Error: Notification ID is required${NC}"
    print_usage
  fi
  
  echo -e "${YELLOW}Checking status of notification $notification_id...${NC}"
  
  # Check status
  response=$(curl -s "$API_URL/status/$notification_id")
  
  status=$(echo "$response" | jq -r '.status')
  
  if [[ -z "$status" || "$status" == "null" ]]; then
    echo -e "${RED}Error checking notification status: ${NC}"
    echo "$response"
    exit 1
  fi
  
  echo -e "${GREEN}Status: $status${NC}"
  echo ""
  echo "Details:"
  echo "$response" | jq '.'
}

# Main script execution
if [[ $# -lt 1 ]]; then
  print_usage
fi

case "$1" in
  --register)
    register_device "$2" "$3" "$4"
    ;;
  --test)
    send_test_notification "$2" "$3"
    ;;
  --status)
    check_notification_status "$2"
    ;;
  --help)
    print_usage
    ;;
  *)
    echo -e "${RED}Unknown option: $1${NC}"
    print_usage
    ;;
esac 