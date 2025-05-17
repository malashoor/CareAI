#!/bin/bash

# Test script for notification routing rules
# For RC1 testing

set -e

echo "🔔 Testing CareAI Notification Routing Rules"
echo "============================================"

# Check if we have Supabase CLI installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Error: Supabase CLI not found. Please install with:"
    echo "    npm install -g supabase"
    exit 1
fi

# Get current project ID
PROJECT_ID=$(supabase projects list --json | jq -r '.[0].id')
if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: Could not determine Supabase project ID"
    echo "    Please run 'supabase login' first"
    exit 1
fi

# Test SOS alert routing
test_sos_alert() {
    echo "🚨 Testing SOS Alert routing..."
    
    curl -X POST "https://$PROJECT_ID.supabase.co/rest/v1/rpc/test_routing_rule" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "event_type": "sos_triggered",
        "source": "sos",
        "severity": "critical",
        "recipient_role": "family"
    }'
    
    echo ""
    echo "✅ SOS Alert test completed"
}

# Test vitals anomaly routing
test_vitals_anomaly() {
    echo "❤️ Testing Vitals Anomaly routing..."
    
    curl -X POST "https://$PROJECT_ID.supabase.co/rest/v1/rpc/test_routing_rule" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "event_type": "vital_anomaly",
        "source": "vitals",
        "severity": "warning",
        "recipient_role": "healthpro"
    }'
    
    echo ""
    echo "✅ Vitals Anomaly test completed"
}

# Test missed medication routing
test_missed_medication() {
    echo "💊 Testing Missed Medication routing..."
    
    curl -X POST "https://$PROJECT_ID.supabase.co/rest/v1/rpc/test_routing_rule" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "event_type": "medication_missed",
        "source": "medication",
        "severity": "warning",
        "recipient_role": "family"
    }'
    
    echo ""
    echo "✅ Missed Medication test completed"
}

# Test emotion change routing
test_emotion_change() {
    echo "😊 Testing Emotion Change routing..."
    
    curl -X POST "https://$PROJECT_ID.supabase.co/rest/v1/rpc/test_routing_rule" \
    -H "apikey: $SUPABASE_KEY" \
    -H "Content-Type: application/json" \
    -d '{
        "event_type": "emotion_change",
        "source": "emotion",
        "severity": "info",
        "recipient_role": "family"
    }'
    
    echo ""
    echo "✅ Emotion Change test completed"
}

# Check if SUPABASE_KEY is set
if [ -z "$SUPABASE_KEY" ]; then
    echo "⚠️ SUPABASE_KEY environment variable not set."
    echo "Please set it with: export SUPABASE_KEY=your_api_key"
    exit 1
fi

# Run all tests
test_sos_alert
test_vitals_anomaly
test_missed_medication
test_emotion_change

echo ""
echo "🎉 All notification routing rule tests completed!"
echo "Check the Supabase dashboard for results." 