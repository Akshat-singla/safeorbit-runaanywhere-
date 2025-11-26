# 🚀 Quick Start Guide

## Prerequisites Installed ✅

- Node.js and npm
- All dependencies installed
- All errors fixed

---

## Run the App (3 Simple Steps)

### Step 1: Open Terminal

Navigate to the project directory:

```bash
cd D:/workshop/safeorbit-runaanywhere-/safeorbit_api_app
```

### Step 2: Start Development Server

```bash
npm run dev
```

### Step 3: Choose Your Platform

Once the server starts, you'll see options:

```
› Press w │ open web
› Press a │ open Android
› Press i │ open iOS (Mac only)
```

**For Web Preview (Easiest):**

- Press `w` in the terminal
- Your browser will open automatically at `http://localhost:8081`
- **OR** scan the QR code with the Expo Go app on your phone

---

## Platform-Specific Quick Commands

### 🌐 Web (Recommended for quick testing)

```bash
npm run web
```

Opens directly in your browser at http://localhost:8081

### 📱 Android

```bash
npm run android
```

Requires:

- Android Studio with emulator **OR**
- Physical Android device with USB debugging

### 🍎 iOS (Mac only)

```bash
npm run ios
```

Requires:

- macOS
- Xcode with iOS Simulator

### 📲 Physical Device (Any platform)

1. Install **Expo Go** app from App Store / Play Store
2. Run `npm run dev`
3. Scan the QR code shown in terminal

---

## What You'll See

### Welcome Screen

- Sign up / Sign in options
- OAuth providers (Google, Apple, GitHub)

### Main App (After Login)

- **Home**: Quick access to features
- **Photo**: Capture and analyze images
- **Live Scan**: Real-time object detection
- **Emergency**: Chat and actions
- **Dashboard**: Analytics and statistics
- **Settings**: User preferences

---

## Common Issues & Solutions

### Issue: "Cannot find module"

**Solution:**

```bash
rm -rf node_modules
npm install
```

### Issue: "Metro bundler cache"

**Solution:**

```bash
npm run dev -- --clear
```

### Issue: "Port already in use"

**Solution:**

```bash
npx expo start --clear --port 8082
```

### Issue: "Backend not connected"

**Note:** This is expected if you haven't set up the Python backend yet. The app will still run, but
object detection features require the backend.

To set up backend:

1. Update `lib/api-config.ts` with your backend URL
2. See main README for Python backend setup

---

## Development Tips

### Hot Reload

The app automatically reloads when you save changes to code files.

### Clear Cache

If you see weird behavior:

```bash
npm run dev -- --clear
```

### View Logs

- **Web**: Open browser DevTools (F12)
- **Mobile**: Shake device → "Show Dev Menu" → "Debug Remote JS"
- **Terminal**: Logs appear automatically

### Color Scheme

The app supports both light and dark modes. Toggle from the settings or top bar.

---

## Environment Variables

The app uses Clerk for authentication. Your `.env` file is already configured:

```
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_YmlnLWZpbGx5LTg4LmNsZXJrLmFjY291bnRzLmRldiQ
```

---

## Need Help?

- Check `DEBUGGING_COMPLETE.md` for detailed fixes applied
- Check main `README.md` for full documentation
- Run `npx expo-doctor` to diagnose issues

---

## Ready to Start? 🎉

```bash
npm run dev
```

**Then press `w` for instant web preview!**

---

**Note:** The app is fully functional on web, Android, and iOS. Start with web for the quickest
preview experience.
