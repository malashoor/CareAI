---
title: "EAS build fails on Node 20"
labels: handover-blocker
assignees: ""
---

## Description
Expo EAS fails during expo prebuild with TypeError (TS ext). Works on Node 18; investigate ts-node/metro config.

## Steps to Reproduce
1. Install Node 20.x
2. Run `expo prebuild` or `eas build`
3. Observe the build failure

## Expected behavior
The build should complete successfully, as it does with Node 18

## Current behavior
Build fails with a TypeError related to TypeScript extensions

## Environment
- Node.js version: 20.x
- Expo EAS CLI version: [version]
- Platform: Both iOS and Android builds affected

## Error logs
```
// Include error logs here
TypeError: [TS EXT ERROR DETAILS]
```

## Additional context
The issue is likely related to the ts-node configuration or metro config which may not be fully compatible with Node 20. A workaround is to use Node 18 for building, but this should be fixed for proper forward compatibility. 