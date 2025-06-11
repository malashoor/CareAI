# CareAI Store Assets

This directory contains all the assets required for publishing CareAI to the Apple App Store and Google Play Store.

## Directory Structure

```
assets/
├── screenshots/     # App screenshots for both platforms
├── icons/          # App icons in various sizes
└── feature_graphics/ # Feature graphics for Play Store
```

## Build Output Paths

- Android: `/dist/android/app-release.aab`
- iOS: `/dist/ios/CareAI.xcarchive`

## App Store Publishing Checklist

### Screenshots
- iPhone 6.7" Display (1290 x 2796 pixels)
- iPhone 5.5" Display (1242 x 2208 pixels)
- iPad Pro (2048 x 2732 pixels)

### App Icon
- App Store Icon: 1024 x 1024 pixels
- iPhone: 60 x 60 pixels (@1x, @2x, @3x)
- iPad: 76 x 76 pixels (@1x, @2x)

### Upload Notes
1. Archive the app using Xcode
2. Use App Store Connect to submit the build
3. Fill in all required metadata:
   - App name
   - Description
   - Keywords
   - Support URL
   - Privacy Policy URL
   - Age Rating
4. Submit for review

## Google Play Store Publishing Checklist

### Screenshots
- Phone Screenshots (1080 x 1920 pixels)
- 7-inch Tablet (1080 x 1920 pixels)
- 10-inch Tablet (2048 x 1536 pixels)

### App Icon
- Play Store Icon: 512 x 512 pixels
- High-res Icon: 192 x 192 pixels
- App Icons:
  - mdpi: 48 x 48 pixels
  - hdpi: 72 x 72 pixels
  - xhdpi: 96 x 96 pixels
  - xxhdpi: 144 x 144 pixels
  - xxxhdpi: 192 x 192 pixels

### Feature Graphic
- Size: 1024 x 500 pixels

### Upload Notes
1. Create a release in Google Play Console
2. Upload the Android App Bundle (`.aab` file)
3. Fill in all required metadata:
   - App name
   - Short description (80 characters)
   - Full description
   - Privacy Policy URL
   - Content Rating
4. Submit for review

## Version History

- v1.0.0 (2024-04-01)
  - Initial release
  - Added admin features
  - Improved analytics dashboard 