# 🏆 SafeOrbit


**AI-Powered Safety Equipment Detection System for Space Stations**

A complete full-stack solution combining YOLOv8-based object detection with a cross-platform mobile application for real-time safety equipment monitoring in space station environments.

![Python](https://img.shields.io/badge/Python-3.8+-blue)
![React Native](https://img.shields.io/badge/React%20Native-0.81-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue)
![YOLOv8](https://img.shields.io/badge/YOLOv8-m-green)
![Expo](https://img.shields.io/badge/Expo-54.0-black)
![FastAPI](https://img.shields.io/badge/FastAPI-Latest-green)

<video controls muted loop autoplay src="public/landing.mp4" title="Title"></video>


https://github.com/user-attachments/assets/31af0b30-26af-4bb2-8695-b18eb3dafe34


---

## 🎉 Recent Fixes & Enhancements

### Backend Improvements

- ✅ **Fixed inference not detecting objects** - Lowered confidence threshold from 0.4 to 0.15 for
  better recall
- ✅ **Removed problematic TTA dependencies** - Simplified inference for stability
- ✅ **Enhanced error logging** - Better debugging with detailed logs
- ✅ **Model warm-up on startup** - Faster first inference
- ✅ **CPU optimization** - Reliable performance without CUDA issues
- ✅ **Better request handling** - Improved timeout and error responses

### Mobile App Improvements

- ✅ **Fixed "stuck on uploading"** - Added proper timeout handling with AbortController
- ✅ **Better error messages** - Clear, actionable error feedback
- ✅ **Retry functionality** - Easy retry without recapturing
- ✅ **Improved loading states** - Real-time processing status updates
- ✅ **Enhanced UI feedback** - Visual indicators for connection status
- ✅ **Color-coded status badges** - Green for connected, red for offline
- ✅ **30-second request timeout** - Prevents indefinite hanging
- ✅ **Graceful error recovery** - Automatic cleanup on failures

### Performance Enhancements

- ⚡ **Faster initial connection** - 5-second health check timeout
- ⚡ **Optimized image quality** - Balanced quality (0.7) for speed
- ⚡ **Smart request queuing** - Prevents overload
- ⚡ **Better memory management** - Cleanup on navigation

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#️-architecture)
- [Quick Start](#-quick-start)
- [Troubleshooting](#-troubleshooting)
- [AI Engine Setup](#-ai-engine-setup)
- [Mobile App Setup](#-mobile-app-setup)
- [API Documentation](#-api-documentation)
- [Model Performance](#-model-performance)
- [Project Structure](#-project-structure)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## 🎯 Overview

SafeOrbit is an intelligent safety monitoring system designed for space station environments. It combines advanced computer vision with a modern mobile interface to detect and track critical safety equipment in real-time.

### Key Components

- **AI Engine**: YOLOv8m-based object detection model achieving 86.4% mAP@0.5
- **Mobile App**: Cross-platform React Native application with real-time inference
- **REST API**: FastAPI backend for model serving and real-time predictions
- **On-device ML**: ONNX Runtime support for offline operation

### Detected Safety Equipment

The system identifies 7 critical safety equipment classes:

| Class ID | Equipment | Purpose |
|----------|-----------|---------|
| 0 | Oxygen Tank | Emergency oxygen supply |
| 1 | Nitrogen Tank | Nitrogen storage |
| 2 | First Aid Box | Medical emergency kit |
| 3 | Fire Alarm | Fire detection system |
| 4 | Safety Switch Panel | Emergency control panel |
| 5 | Emergency Phone | Emergency communication |
| 6 | Fire Extinguisher | Fire suppression equipment |

---

## ✨ Features

### 🤖 AI-Powered Detection
- **High Accuracy**: 86.7% mAP@0.5, 95.52% precision
- **Real-time Processing**: Fast inference with optimized pipeline
- **Multi-platform**: CPU support with automatic optimization
- **Low Confidence Threshold**: 0.15 for better detection recall

### 📱 Mobile Application
- **Cross-platform**: iOS, Android, and web support via React Native
- **Live Scanning**: Real-time camera-based object detection
- **Photo Mode**: Single-shot analysis with retry capability
- **Emergency Chat Assistant**: 🆕 AI-powered emergency guidance via local LLM
- **Secure Authentication**: Clerk-based authentication system
- **Analytics Dashboard**: Visual insights and scanning history
- **Error Recovery**: Automatic retry and graceful error handling

### 🆕 Emergency Chat Assistant

- **Offline AI Support**: Connect to local LLM via RunAnywhere HTTP API
- **Real-time Streaming**: See responses as they're generated
- **Emergency Guidance**: First aid, CPR, disaster safety, and more
- **Quick Prompts**: Pre-configured emergency questions for fast access
- **Conversation History**: Maintains context across multiple questions
- **Server Status Indicator**: Visual feedback on connection status

### 🔧 Developer Experience
- **TypeScript**: 100% type-safe codebase
- **Modern UI**: Beautiful, responsive design with NativeWind
- **Production Ready**: Comprehensive logging and error handling
- **Well Documented**: Extensive documentation and code comments

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    Mobile App (React Native)                 │
├──────────────────────────────────────────────────────────────┤
│  • Expo Router navigation                                    │
│  • On-device ONNX inference                                  │
│  • Real-time camera scanning                                 │
│  • Analytics dashboard                                       │
│  • Clerk authentication                                      │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    REST API (FastAPI)                        │
├──────────────────────────────────────────────────────────────┤
│  • /predict endpoint                                         │
│  • Base64 image processing                                   │
│  • CORS handling                                             │
│  • Health checks                                             │
└──────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌──────────────────────────────────────────────────────────────┐
│                    AI Engine (YOLOv8m)                       │
├──────────────────────────────────────────────────────────────┤
│  • YOLOv8m architecture                                      │
│  • Custom trained weights (204 epochs)                       │
│  • ONNX export support                                       │
│  • CPU/GPU inference                                         │
│  • Advanced augmentation pipeline                            │
└──────────────────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Python**: 3.8 or higher
- **Node.js**: 18.x or higher
- **Git**: Latest version
- **Expo CLI**: For mobile development

### 1. Clone the Repository

```powershell
git clone https://github.com/Namann-14/safeorbit.git
cd safeorbit
```

### 2. AI Engine Setup

```powershell
cd ai-engine
pip install -r requirements.txt
```

Create `.env` file (optional):
```env
MODEL_PATH=results/improved_model/train/weights/best.pt
DEVICE=cpu
```

Start the API server:
```powershell
python api.py
```

The API will be available at `http://localhost:8000`

### 3. Mobile App Setup

```powershell
cd expo
npm install
```

Configure environment variables in `.env.local`:
```env
EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key_here
EXPO_PUBLIC_API_BASE_URL=http://localhost:8000
```

Start the development server:
```powershell
npm run dev
```

### 4. Access the Application

- **API Documentation**: http://localhost:8000/docs
- **Mobile App**: Scan QR code with Expo Go or press `i`/`a` for simulator

### 5. (Optional) Emergency Chat Assistant Setup

The Emergency Chat feature requires the RunAnywhere app to run a local LLM:

1. Install the [RunAnywhere](https://github.com/ankan-ban/llama_cu_awq) app on your Android device
2. Load a compatible LLM model (recommended: Phi-3, Gemma-2B, or similar)
3. Enable the HTTP API server in RunAnywhere (runs on `localhost:8080`)
4. Open the Emergency tab in SafeOrbit app

See [expo/EMERGENCY_CHAT_README.md](expo/EMERGENCY_CHAT_README.md) for detailed setup instructions.

---

## 🔧 Troubleshooting

### Backend Issues

#### Model Not Loading

```
❌ Failed to load model
```

**Solution**:

- Check if model file exists at `ai-engine/results/improved_model/train/weights/best.pt`
- If missing, the API will fallback to YOLOv8n pretrained model
- Check Python console for detailed error messages

#### No Objects Detected

```
📊 Raw detections: 0 boxes found
```

**Solution**:

- Confidence threshold might be too high - already lowered to 0.15
- Ensure good lighting in the image
- Check if objects are clearly visible in frame
- Try different angles or distances

### Mobile App Issues

#### Stuck on "Uploading..."

**Solution**:

- ✅ **FIXED**: Now has 30-second timeout
- Check if backend is running (`python api.py`)
- Verify IP address in `expo/lib/api-config.ts`
- Check firewall settings on your computer
- Ensure phone and computer are on same WiFi network

#### "Backend Not Connected"

**Solution**:

1. Verify backend is running: Visit `http://localhost:8000` in browser
2. Check IP address in `api-config.ts` matches your computer's IP
3. Try health check: `http://YOUR_IP:8000/health`
4. Disable firewall temporarily to test
5. Use Retry Connection button in the app

#### Request Timeout

**Solution**:

- Backend might be overloaded - wait and retry
- Check server logs for errors
- Reduce image quality in `api-config.ts` (IMAGE_QUALITY: 0.5)
- Use photo mode instead of live scan for better reliability

#### Images Too Large / Slow Upload

**Solution**:

- Image quality is set to 0.7 (optimized)
- Images are resized to 640x640 automatically
- Adjust IMAGE_QUALITY in `api-config.ts` if needed

### Network Issues

#### Can't Connect from Physical Device

**Solution**:

1. Find your computer's IP address:
   ```powershell
   ipconfig  # Windows
   ifconfig  # Mac/Linux
   ```
2. Update `BACKEND_URL` in `expo/lib/api-config.ts`
3. Ensure both devices are on the **same WiFi network**
4. Check Windows Firewall:
    - Allow Python through firewall
    - Allow port 8000 inbound
5. Test connection in browser: `http://YOUR_IP:8000/health`

#### CORS Errors

**Solution**:

- CORS is configured to allow all origins in development
- If issues persist, check browser console for specific errors
- Backend logs will show CORS-related requests

---

## 🤖 AI Engine Setup

### Training the Model

The AI engine includes comprehensive training scripts and configurations.

**Basic Training:**
```powershell
cd ai-engine
python train.py
```

**Advanced Training with Optimization:**
```powershell
python scripts/train.py --config configs/train_config.yaml
```

### Model Inference

**Python API:**
```python
from ultralytics import YOLO

model = YOLO('results/improved_model/train/weights/best.pt')
results = model.predict('image.jpg', conf=0.15)  # Lower confidence
```

**Command Line:**
```powershell
python predict.py --source image.jpg --conf 0.15
```

**FastAPI Endpoint:**
```powershell
curl -X POST "http://localhost:8000/detect" \
  -H "Content-Type: application/json" \
  -d '{"image": "base64_encoded_image", "confidence": 0.15}'
```

### Export to ONNX

```powershell
python -c "from ultralytics import YOLO; YOLO('results/improved_model/train/weights/best.pt').export(format='onnx')"
```

---

## 📱 Mobile App Setup

### Running on Different Platforms

**iOS Simulator (macOS only):**
```powershell
npm run ios
```

**Android Emulator:**
```powershell
npm run android
```

**Web Browser:**
```powershell
npm run web
```

**Physical Device:**
```powershell
npm run dev
# Scan QR code with Expo Go app
```

### Key Features

- **Authentication**: Sign up, sign in, password reset, email verification
- **Live Scanning**: Real-time camera-based object detection
- **Photo Mode**: Single-shot analysis with retry capability
- **Dashboard**: Analytics with charts and statistics
- **Scan History**: Review past detections with details
- **Settings**: User preferences and account management

### Configuration

All configuration is in `expo/lib/api-config.ts`:

```typescript
export const API_CONFIG = {
  BACKEND_URL: 'http://YOUR_IP:8000',  // Update this!
  CONFIDENCE_THRESHOLD: 0.15,  // Detection threshold
  IMAGE_QUALITY: 0.7,  // JPEG quality (0-1)
  REQUEST_TIMEOUT: 30000,  // 30 seconds
  // ...
};
```

---

## 📚 API Documentation

### Endpoints

#### GET `/health`

Check API health status.

**Response:**

```json
{
  "status": "healthy",
  "model_loaded": true,
  "device": "cpu",
  "classes": ["OxygenTank", "NitrogenTank", ...]
}
```

#### POST `/detect`
Detect objects in an image.

**Request:**
```json
{
  "image": "base64_encoded_image",
  "confidence": 0.15
}
```

**Response:**
```json
{
  "objects": [
    {
      "name": "FireExtinguisher",
      "confidence": 0.95,
      "bbox": {
        "x": 0.1,
        "y": 0.15,
        "width": 0.2,
        "height": 0.3
      }
    }
  ],
  "inference_time": 245.3,
  "image_size": [640, 480]
}
```

#### POST `/detect-image`

Returns image with bounding boxes drawn.

**Request:** Same as `/detect`

**Response:** JPEG image with annotations

### Interactive Documentation

Visit `http://localhost:8000/docs` for Swagger UI with interactive API testing.

---

## 📊 Model Performance

### Validation Metrics (Epoch 204)

| Metric | Value |
|--------|-------|
| **mAP@0.5** | **86.7%** |
| **mAP@0.5:0.95** | **76.3%** |
| **Precision** | **95.52%** |
| **Recall** | **74.31%** |

### Inference Performance

- **CPU Inference**: ~200-400ms per image
- **Image Size**: 640x640 pixels
- **Confidence Threshold**: 0.15 (optimized for recall)
- **IoU Threshold**: 0.45

---

## 📁 Project Structure

```
safeorbit/
├── ai-engine/                      # AI/ML Backend
│   ├── api.py                     # FastAPI server ⭐
│   ├── predict.py                 # Inference script
│   ├── requirements.txt           # Python dependencies
│   ├── configs/                   # Configuration files
│   ├── scripts/                   # Training scripts
│   └── results/                   # Training outputs
│       └── improved_model/
│           └── train/weights/
│               └── best.pt        # Trained model ⭐
│
└── expo/                          # Mobile Application
    ├── app/                       # App screens and routes
    │   ├── (tabs)/
    │   │   ├── scan.tsx          # Photo mode ⭐
    │   │   └── live-scan.tsx     # Live scan mode ⭐
    ├── components/                # UI components
    ├── lib/                       # Utilities and config
    │   └── api-config.ts         # API configuration ⭐
    ├── assets/                    # Static assets
    └── package.json               # Node dependencies
```

---

## 🚀 Deployment

### AI Engine Deployment

**Docker:**
```dockerfile
FROM python:3.8-slim
WORKDIR /app
COPY ai-engine/ .
RUN pip install -r requirements.txt
CMD ["python", "api.py"]
```

**Production Server:**
```powershell
uvicorn api:app --host 0.0.0.0 --port 8000 --workers 4
```

### Mobile App Deployment

**iOS:**
```powershell
eas build --platform ios
```

**Android:**
```powershell
eas build --platform android
```

**Web:**
```powershell
npm run build:web
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

## 🙏 Acknowledgments

- **YOLOv8**: Ultralytics for the excellent object detection framework
- **Expo**: For simplifying cross-platform mobile development
- **React Native Community**: For comprehensive ecosystem and support

---

## 📞 Contact

**Project Maintainer**: Namann-14  
**Repository**: [github.com/Namann-14/safeorbit](https://github.com/Namann-14/safeorbit)

---

<div align="center">
  <p>Built with ❤️ for safer space exploration</p>
  <p><strong>Version 1.0.1</strong> - Enhanced & Optimized</p>
</div>

