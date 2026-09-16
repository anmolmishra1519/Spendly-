# Building and shipping Spendly

## What's included

| Platform | Command | Output |
|---|---|---|
| Windows | `npm run electron:build:win` | `release/Spendly Setup 1.0.0.exe` |
| Linux | `npm run electron:build:linux` | `release/Spendly-1.0.0.AppImage` |
| macOS | `npm run electron:build:mac` (must run **on a Mac**) | `release/Spendly-1.0.0.dmg` |
| Android | `npm run android:open` (needs Android Studio) | `.apk`/`.aab` via Android Studio's Build menu |
| iOS | `npx cap add ios` (needs a Mac + Xcode) | Xcode project |

## Windows / Linux

```bash
npm install
npm run electron:build:win     # or electron:build:linux
```

Both are unsigned. Windows SmartScreen / no equivalent warning on Linux,
but see "Code signing" below before distributing widely.

## macOS

Requires an actual Mac (Apple's dmg-building tools don't run on
Windows/Linux — this is a hard OS limitation, not a config issue):

```bash
xcode-select --install   # once
npm install
npm run electron:build:mac
```

## Android

The native project is already scaffolded at `android/`, with the Spendly
logo installed as the launcher icon at every density. Finish the build with
Android Studio (handles the SDK/Gradle toolchain for you):

```bash
npm install
npm run build
npm run android:open
```

Then in Android Studio: **Build → Build Bundle(s)/APK(s) → Build APK(s)**
for a testing build, or **Build → Generate Signed Bundle/APK** for a
Play Store release (Android Studio will help you create a signing key —
keep it and its password safe; losing it means you can never update the
same app listing again).

Or, fully from the terminal once Android Studio has installed the SDK once:
```bash
cd android
./gradlew assembleDebug
```
Output: `android/app/build/outputs/apk/debug/app-debug.apk`

## iOS

Needs a Mac with Xcode:
```bash
npx cap add ios
npm run build
npx cap sync
npx cap open ios
```

## If you're planning to sell this

- **Code signing**: unsigned installers trigger OS warnings. Windows needs
  an Authenticode certificate (~$100–400/yr). macOS needs an Apple
  Developer Program membership ($99/yr) for a Developer ID cert + notarization.
- **No purchase/license gate exists in this codebase.** It's fully
  functional the moment it's installed. Selling through the Microsoft
  Store / Mac App Store / Google Play handles licensing for you. Selling it
  yourself (e.g. Gumroad) would need a license-key screen added to the app
  — that doesn't exist today.
- **Store listings** need screenshots, a description, and a privacy policy
  (even though Spendly stores everything locally and sends nothing anywhere).
