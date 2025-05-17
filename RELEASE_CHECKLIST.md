# Release Checklist v1.0.0-rc1

## Build Information
- Version: 1.0.0-rc1
- Build Date: May 2025
- Git SHA: [auto-populated during RC build]

## Pre-Release Testing

### QA Regression
- [ ] iOS light mode test matrix complete
- [ ] iOS dark mode test matrix complete
- [ ] Android light mode test matrix complete
- [ ] Android dark mode test matrix complete
- [ ] RTL layout verification
- [ ] Large text accessibility verification
- [ ] Push notification deep links verified

### App Store Metadata
- [ ] App Privacy questionnaire completed (Apple)
- [ ] 5 screenshots uploaded per form factor
- [ ] "What's New" description drafted (EN + AR)
- [ ] App description updated (EN + AR)

### Accessibility Audit
- [ ] VoiceOver / TalkBack tests completed on:
  - [ ] Family dashboard
  - [ ] Health professional dashboard
  - [ ] Settings screens
  - [ ] Notifications center
- [ ] Unlabeled buttons and contrast issues resolved

### Performance & Battery
- [ ] Health professional vitals chart profiled (no frame drops)
- [ ] 10-minute session profiling performed
- [ ] Battery usage < 10% CPU average on mid-range device

### Release Testing
- [ ] TestFlight / Internal APK distributed to 10+ testers
- [ ] 48-hour crash stats collection period completed
- [ ] Sentry crash-free session rate ≥ 99.5%
- [ ] Push notification delivery success rate > 99%
- [ ] Event→Display latency ≤ 2s p95

## Sign-Off

**Engineering**  
Name: ____________________  
Date: ____________________  
Signature: ________________

**QA**  
Name: ____________________  
Date: ____________________  
Signature: ________________

**Product**  
Name: ____________________  
Date: ____________________  
Signature: ________________ 