# Accessibility Testing Matrix

## Notification Flows and Dashboard Accessibility Verification

| Scenario ID | Screen / Flow | Assistive Tech | Steps | Expected Result |
|-------------|--------------|----------------|-------|-----------------|
| A11Y-N1 | Family Dashboard → Missed-Medication card list | VoiceOver (iOS) | 1. Enable VO<br>2. Swipe through each card label | VO announces "Missed medication, Aspirin, 9 AM"—no "unlabeled" warnings |
| A11Y-N2 | Notification Center badge | VoiceOver & Dynamic-Type (XL) | 1. Set text size to XL<br>2. Navigate tab bar | Badge count scales, no clipping |
| A11Y-N3 | Escalation Queue (HP) swipe action | TalkBack (Android) | 1. Long-press card<br>2. Swipe right to "Mark Resolved" | TB reads action label; state changes to "resolved" |
| A11Y-N4 | SOS deep-link push → Family Dashboard | VoiceOver (iOS) | 1. Send SOS curl<br>2. Tap push banner | VO focus lands on SOS detail; back-button labeled |
| A11Y-N5 | Family Dashboard RTL | Arabic device locale | 1. Launch app<br>2. Open Family tab | Layout mirrors; KPI cards right-aligned; labels in Arabic |
| A11Y-N6 | Health Dashboard Charts | VoiceOver (iOS) | 1. Enable VO<br>2. Navigate to charts | Each chart announces trend summary and time period |
| A11Y-N7 | Notification Preferences | VoiceOver (iOS) | 1. Navigate to settings<br>2. Open notifications | Toggle states clearly announced, labels read correctly |
| A11Y-N8 | Emotion State Change | TalkBack (Android) | 1. Trigger emotion change<br>2. Open notification | Emotion states and changes properly announced |
| A11Y-N9 | Settings Menu | Dynamic-Type (XXL) | 1. Set text size to XXL<br>2. Navigate settings | No text truncation, all elements fully visible |
| A11Y-N10 | Critical Alert Modal | VoiceOver (iOS) | 1. Trigger SOS alert<br>2. Navigate modal with VO | Modal properly traps focus, emergency actions clearly labeled |

## Test Commands

### iOS VoiceOver Testing
```bash
npx expo run:ios --device "iPhone 14" --configuration "Release"
```

### Android TalkBack Testing
```bash
npx expo run:android --device "Pixel 6" --variant "release"
```

### Testing Notification Delivery with Accessibility
```bash
# Set API key first
export SUPABASE_KEY=your_api_key_here

# Run the notification test script
./scripts/test-notification-rules.sh

# Alternative: Test specific notification type
curl -X POST "https://wvuyppurctdosfvlefkk.supabase.co/rest/v1/rpc/test_routing_rule" \
-H "apikey: $SUPABASE_KEY" \
-H "Content-Type: application/json" \
-d '{
    "event_type": "sos_triggered",
    "source": "sos",
    "severity": "critical",
    "recipient_role": "family"
}'
```

## Accessibility Compliance Requirements

- All interactive elements must be accessible via screen readers
- Minimum touch target size of 44×44 points
- Text meets minimum contrast ratio (4.5:1 for normal text, 3:1 for large text)
- All functionality usable with screen readers enabled
- RTL layout support for Arabic localization
- Dynamic Type support across all screens
- No time-dependent interactions without override options 