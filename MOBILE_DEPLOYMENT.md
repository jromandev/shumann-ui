# Mobile App Deployment Guide

## Overview
The Schumann Resonance Monitor is now a full hybrid mobile application using Capacitor. It can be deployed as:
- **Progressive Web App (PWA)** - Installable on any device via browser
- **iOS Native App** - Distributed via Apple App Store
- **Android Native App** - Distributed via Google Play Store

## Prerequisites

### For iOS Development
- macOS with Xcode installed
- Apple Developer Account ($99/year)
- CocoaPods: `sudo gem install cocoapods`

### For Android Development
- Android Studio installed
- Java Development Kit (JDK) 17 or higher
- Android SDK Platform 34 (Android 14)

## Development Workflow

### 1. Web Development
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### 2. Mobile Development

#### Build and Sync
```bash
# Build web assets and sync to native platforms
npm run build:mobile
```

#### iOS Development
```bash
# Open iOS project in Xcode
npm run open:ios

# Or run directly on device/simulator
npm run run:ios
```

**In Xcode:**
1. Select your development team in "Signing & Capabilities"
2. Choose a device or simulator
3. Click Run (⌘R)

#### Android Development
```bash
# Open Android project in Android Studio
npm run open:android

# Or run directly on device/emulator
npm run run:android
```

**In Android Studio:**
1. Wait for Gradle sync to complete
2. Select a device or emulator
3. Click Run (▶)

## Native Features Implemented

### Status Bar
- Dark style with custom background color (#0B1F3F)
- Configured for both iOS and Android

### Splash Screen
- 2-second display duration
- Brand colors matching app theme
- Full screen immersive mode

### App Lifecycle
- Handles app state changes (background/foreground)
- Android back button handling
- Proper cleanup on app exit

### Haptic Feedback
- Light haptic feedback when sharing events
- Available on both iOS and Android

### Share API
- Native share sheet for event information
- Falls back to Web Share API on PWA

### Network Detection
- Monitor online/offline status (plugin installed, ready to use)

## App Store Deployment

### iOS App Store

1. **Prepare in Xcode:**
   ```bash
   npm run open:ios
   ```
   
2. **Configure App:**
   - Update bundle identifier in Xcode (currently: `com.shuman.monitor`)
   - Add app icons in Assets.xcassets
   - Configure launch screen
   - Set up signing with your Apple Developer account

3. **Archive and Upload:**
   - Product → Archive
   - Distribute App → App Store Connect
   - Follow Apple's submission guidelines

4. **App Store Connect:**
   - Create app listing
   - Add screenshots and descriptions
   - Set pricing and availability
   - Submit for review

### Google Play Store

1. **Prepare in Android Studio:**
   ```bash
   npm run open:android
   ```

2. **Configure App:**
   - Update `applicationId` in `android/app/build.gradle`
   - Add app icons (use Android Asset Studio)
   - Update colors in `android/app/src/main/res/values/`

3. **Generate Signed APK/AAB:**
   - Build → Generate Signed Bundle/APK
   - Create or use existing keystore
   - Build release bundle (.aab)

4. **Google Play Console:**
   - Create app listing
   - Upload AAB file
   - Add store listing details
   - Set content rating
   - Submit for review

## Testing

### PWA Testing
1. Build: `npm run build`
2. Preview: `npm run preview`
3. Open http://localhost:4173 in browser
4. Look for install prompt in address bar

### iOS Testing
- **Simulator:** Run from Xcode (free)
- **Device:** Requires Apple Developer account

### Android Testing
- **Emulator:** Run from Android Studio (free)
- **Device:** Enable USB debugging and connect

## Configuration Files

### capacitor.config.ts
Main Capacitor configuration with plugin settings:
- App ID: `com.shuman.monitor`
- App Name: `Schumann Monitor`
- Web directory: `dist`
- Plugin configurations (StatusBar, SplashScreen, etc.)

### package.json
New scripts for mobile development:
- `build:mobile` - Build and sync to platforms
- `open:ios` - Open in Xcode
- `open:android` - Open in Android Studio
- `run:ios` - Build and run on iOS
- `run:android` - Build and run on Android

## Native Plugins

Currently installed and configured:
- `@capacitor/app` - App lifecycle and events
- `@capacitor/status-bar` - Status bar styling
- `@capacitor/splash-screen` - Launch screen
- `@capacitor/haptics` - Haptic feedback
- `@capacitor/share` - Native share functionality
- `@capacitor/network` - Network status monitoring

## Environment Variables

Update `.env` file:
```env
VITE_API_URL=https://your-production-api.com/api/v1
VITE_USE_MOCK_DATA=false
```

For production builds, ensure the API URL points to your live backend.

## Troubleshooting

### iOS Build Issues
- Clean build folder: Product → Clean Build Folder (⇧⌘K)
- Update pods: `cd ios/App && pod install`
- Reset simulator: Device → Erase All Content and Settings

### Android Build Issues
- Clean project: Build → Clean Project
- Invalidate caches: File → Invalidate Caches / Restart
- Check JDK version: `java -version` (needs JDK 17+)

### Capacitor Sync Issues
```bash
# Remove and re-add platforms
npx cap sync --force

# Or remove and re-add specific platform
rm -rf ios android
npm run build
npx cap add ios
npx cap add android
```

## Next Steps

1. **Customize App Icons:** Replace the default icons in:
   - iOS: `ios/App/App/Assets.xcassets/AppIcon.appiconset/`
   - Android: `android/app/src/main/res/mipmap-*/`

2. **Add Splash Screens:** Update splash screen images for both platforms

3. **Configure Deep Links:** Set up custom URL schemes for app linking

4. **Add Push Notifications:** Install `@capacitor/push-notifications`

5. **Implement Analytics:** Add Firebase or similar analytics

6. **Add Crash Reporting:** Configure Sentry or Crashlytics

## Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [iOS Human Interface Guidelines](https://developer.apple.com/design/human-interface-guidelines/)
- [Android Design Guidelines](https://developer.android.com/design)
- [App Store Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)
- [Google Play Policy](https://play.google.com/about/developer-content-policy/)
