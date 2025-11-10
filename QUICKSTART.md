# 🚀 SafeOrbit - Quick Start Guide

Get up and running in 5 minutes!

---

## ⚡ Prerequisites

Before starting, make sure you have:

- [x] Python 3.8+ installed
- [x] Node.js 18+ installed
- [x] Git installed
- [x] Text editor (VS Code recommended)

---

## 📦 Step 1: Clone & Setup

```powershell
# Clone the repository
git clone https://github.com/Namann-14/safeorbit.git
cd safeorbit
```

---

## 🤖 Step 2: Start the AI Backend

```powershell
# Navigate to AI engine
cd ai-engine

# Install dependencies (one-time setup)
pip install -r requirements.txt

# Start the backend server
python api.py
```

**Expected Output:**

```
INFO:     Started server process
INFO:     Waiting for application startup.
Loading model from results/improved_model/train/weights/best.pt
Warming up model...
✅ YOLOv8m model loaded successfully on cpu
📦 Classes: ['OxygenTank', 'NitrogenTank', ...]
INFO:     Application startup complete.
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**Test it:**
Open browser and visit: `http://localhost:8000`

You should see:

```json
{
  "message": "SafeOrbit Object Detection API",
  "version": "1.0.0",
  "status": "healthy"
}
```

✅ **Backend is ready!** Keep this terminal window open.

---

## 📱 Step 3: Configure Mobile App

**Open a NEW terminal/PowerShell window:**

```powershell
# Navigate to mobile app (from safeorbit root)
cd expo

# Install dependencies (one-time setup)
npm install
```

### 🔧 Configure Backend URL

**⚠️ CRITICAL STEP - DO NOT SKIP!**

1. Open `expo/lib/api-config.ts` in your text editor

2. Find your computer's IP address:

   **Windows:**
   ```powershell
   ipconfig
   ```
   Look for "IPv4 Address" (e.g., `192.168.1.100`)

   **Mac/Linux:**
   ```bash
   ifconfig
   # or
   ip addr
   ```

3. Update the `BACKEND_URL`:
   ```typescript
   export const API_CONFIG = {
     // Replace with YOUR computer's IP address!
     BACKEND_URL: 'http://192.168.1.100:8000',  // ⚠️ CHANGE THIS
     // ... rest of config
   };
   ```

4. Save the file

---

## 🎯 Step 4: Start the Mobile App

```powershell
# Still in expo directory
npm run dev
```

**Expected Output:**

```
› Metro waiting on exp://192.168.1.100:8081
› Scan the QR code above with Expo Go (Android) or Camera app (iOS)

› Press a │ open Android
› Press i │ open iOS simulator
› Press w │ open web
```

### Choose Your Platform:

**Option A: Physical Device** (Recommended)

1. Install Expo Go app on your phone
2. Scan the QR code
3. Wait for app to load

**Option B: Emulator**

- Press `a` for Android emulator
- Press `i` for iOS simulator (Mac only)

**Option C: Web Browser**

- Press `w` to open in browser

---

## ✅ Step 5: Test the App

### Test Connection:

1. Open the app
2. Sign up/Sign in (use any email for testing)
3. Navigate to "Scan" tab
4. Look for **green "Ready" badge** at top

   ✅ **Green "Ready"** = Backend connected  
   ❌ **Red "Backend Offline"** = Connection problem

### Test Detection:

1. Click "Capture & Detect" button
2. Point camera at any object
3. Take photo
4. Wait for results (up to 30 seconds)

**Expected Result:**

- Processing status updates appear
- Detection results show with bounding boxes
- Object confidence scores displayed

---

## 🔧 Troubleshooting

### ❌ "Backend Offline" in App

**Problem:** Red badge showing "Backend Offline"

**Solutions:**

1. Check backend is running:
   ```powershell
   # In browser, visit:
   http://localhost:8000/health
   ```
   Should return: `{"status": "healthy", "model_loaded": true}`

2. Verify IP address in `api-config.ts` matches your computer's IP

3. Check firewall:
    - Windows: Allow Python through firewall
    - Mac: System Preferences > Security & Privacy > Firewall

4. Ensure phone and computer on **same WiFi network**

5. Click "Retry Connection" button in app

### ❌ App Stuck on "Uploading..."

**Problem:** Processing never completes

**Solution:**

- ✅ **FIXED** in v1.0.1 - Now has 30-second timeout
- If still stuck, check backend console for errors
- Use "Retry" button when timeout occurs
- Try "Back to Camera" and capture again

### ❌ No Objects Detected

**Problem:** "0 objects detected" even with clear objects in view

**Solutions:**

1. Ensure good lighting
2. Position object clearly in frame
3. Try different angles/distances
4. Check backend console - should see:
   ```
   📸 Decoded image: shape=(480, 640, 3)
   🔍 Running inference...
   📊 Raw detections: X boxes found
   ```

5. If always 0 detections, model might not be trained on those objects

### ❌ Cannot Connect from Phone

**Problem:** Connection refused or timeout

**Solutions:**

1. **Find correct IP:**
   ```powershell
   ipconfig  # Windows
   ```
   Use the IPv4 address (e.g., `192.168.1.100`)

2. **Update config:**
   ```typescript
   // expo/lib/api-config.ts
   BACKEND_URL: 'http://192.168.1.100:8000',  // Your IP here!
   ```

3. **Check same network:**
    - Phone and computer must be on SAME WiFi
    - No guest networks!
    - No VPN on phone

4. **Test from phone browser:**
    - Open Safari/Chrome on phone
    - Visit: `http://YOUR_IP:8000/health`
    - Should see JSON response

5. **Firewall check:**
   ```powershell
   # Windows - Add firewall rule
   netsh advfirewall firewall add rule name="Python API" dir=in action=allow protocol=TCP localport=8000
   ```

### ❌ Python Package Errors

**Problem:** `ModuleNotFoundError` when running backend

**Solution:**

```powershell
# Reinstall requirements
pip install -r requirements.txt --upgrade

# If still issues, try:
pip install torch torchvision ultralytics opencv-python pillow fastapi uvicorn
```

---

## 🎓 Next Steps

### Explore Features:

1. **Live Scan Mode**
    - Click "Live Mode" button
    - Real-time continuous detection
    - Great for scanning multiple objects

2. **Dashboard**
    - View scan history
    - Analytics and statistics
    - Charts and insights

3. **Settings**
    - Adjust confidence threshold
    - Change image quality
    - Configure timeouts

### Adjust Configuration:

Edit `expo/lib/api-config.ts` for fine-tuning:

```typescript
export const API_CONFIG = {
  BACKEND_URL: 'http://YOUR_IP:8000',
  
  // Lower = more detections (but more false positives)
  CONFIDENCE_THRESHOLD: 0.15,  
  
  // Higher = better quality (but slower upload)
  IMAGE_QUALITY: 0.7,  // Range: 0.0 - 1.0
  
  // Longer timeout for slow networks
  REQUEST_TIMEOUT: 30000,  // milliseconds
};
```

---

## 📊 Performance Tips

### For Better Detection:

- ✅ Good, even lighting
- ✅ Clear view of object
- ✅ Stable camera (not moving)
- ✅ Object fills ~50% of frame
- ❌ Avoid extreme angles
- ❌ Avoid motion blur
- ❌ Avoid heavy shadows

### For Faster Processing:

- Use Photo Mode instead of Live Scan
- Lower IMAGE_QUALITY to 0.5
- Ensure strong WiFi signal
- Close other apps on phone

### For Better Accuracy:

- Increase CONFIDENCE_THRESHOLD to 0.25
- Use Live Scan Mode (multiple frames)
- Better lighting conditions
- Multiple angles of same object

---

## 🆘 Still Having Issues?

1. **Check Backend Logs**
    - Look at terminal running `python api.py`
    - Should see emojis: 📸, 🔍, ✅, ❌
    - Any error messages?

2. **Check App Console**
    - In Expo, press `m` for menu
    - Select "Show Dev Menu"
    - Enable "Debug Remote JS"
    - Open browser console

3. **Test Backend Directly**
   ```powershell
   # Test detection with curl
   curl -X POST http://localhost:8000/detect \
     -H "Content-Type: application/json" \
     -d '{"image": "base64_image_here", "confidence": 0.15}'
   ```

4. **Read Full Documentation**
    - `README.md` - Complete guide
    - `FIXES.md` - Recent fixes and known issues
    - `ai-engine/README.md` - Backend details

5. **GitHub Issues**
    - Check existing issues
    - Create new issue with:
        - Error messages
        - Screenshots
        - Steps to reproduce

---

## ✅ Success Checklist

- [ ] Backend running on port 8000
- [ ] Can access `http://localhost:8000` in browser
- [ ] Mobile app showing green "Ready" badge
- [ ] Can capture and see processing status
- [ ] Detections working (or clear error messages)
- [ ] Can retry after errors
- [ ] Can navigate between screens

---

## 🎉 You're All Set!

The app should now be fully functional. If you followed all steps and it's not working, check the
troubleshooting section or review the logs for errors.

**Happy detecting! 🔍🚀**

---

<div align="center">
  <p><strong>SafeOrbit v1.0.1</strong></p>
  <p>Built with ❤️ for safer space exploration</p>
</div>
