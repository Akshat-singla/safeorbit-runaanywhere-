"""
SafeOrbit - FastAPI Backend for Object Detection
Serves YOLOv8 model predictions with bounding boxes
Enhanced with domain adaptation for real-world images
"""

from fastapi import FastAPI, HTTPException, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Optional
import cv2
import numpy as np
from ultralytics import YOLO
import base64
from io import BytesIO
from PIL import Image
import logging
from pathlib import Path
import sys
import torch
import time

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="SafeOrbit Object Detection API",
    description="Real-time object detection for space station safety",
    version="1.0.0"
)

# Add CORS middleware - Allow all origins for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None
# Use the improved model (90%+ mAP, works on real images)
MODEL_PATH = Path("results/best-model/best.pt")

class DetectionRequest(BaseModel):
    image: str  # Base64 encoded image
    confidence: Optional[float] = 0.50  # Lower threshold for better detection
    use_tta: Optional[bool] = False  # Disable TTA by default

class BoundingBox(BaseModel):
    x: float
    y: float
    width: float
    height: float

class Detection(BaseModel):
    name: str
    confidence: float
    bbox: BoundingBox

class DetectionResponse(BaseModel):
    objects: List[Detection]
    inference_time: float
    image_size: List[int]

class HealthResponse(BaseModel):
    status: str
    model_loaded: bool
    model_path: Optional[str] = None
    device: Optional[str] = None
    classes: Optional[List[str]] = None

def load_model():
    """Load YOLO model on startup"""
    global model
    try:
        # Load the trained YOLOv8m model
        if MODEL_PATH.exists():
            logger.info(f"Loading model from {MODEL_PATH}")
            model = YOLO(str(MODEL_PATH))
            
            # Force model to use CPU to avoid CUDA errors
            device = 'cpu'
            model.to(device)
            
            # Warm up the model with a dummy image
            logger.info("Warming up model...")
            dummy_img = np.zeros((640, 640, 3), dtype=np.uint8)
            with torch.inference_mode():
                _ = model(dummy_img, conf=0.15, verbose=False, device=device)
            
            logger.info(f"✅ YOLOv8m model loaded successfully on {device}")
            logger.info(f"📦 Classes: {list(model.names.values())}")
            return
        
        # Fallback to YOLOv8n pretrained if custom model not found
        logger.warning("Custom model not found, loading YOLOv8n pretrained model")
        model = YOLO("yolov8n.pt")
        model.to('cpu')
        logger.info("✅ YOLOv8n pretrained model loaded (CPU mode)")
        
    except Exception as e:
        logger.error(f"❌ Failed to load model: {e}", exc_info=True)
        model = None

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    load_model()

@app.get("/", tags=["Root"])
async def root():
    """Root endpoint"""
    return {
        "message": "SafeOrbit Object Detection API",
        "version": "1.0.0",
        "status": "healthy" if model is not None else "unhealthy",
        "endpoints": {
            "health": "/health",
            "detect": "/detect (POST)",
            "detect_with_image": "/detect-image (POST)"
        }
    }

@app.get("/health", response_model=HealthResponse, tags=["Health"])
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy" if model is not None else "unhealthy",
        "model_loaded": model is not None,
        "model_path": str(MODEL_PATH) if MODEL_PATH.exists() else None,
        "device": "cpu",
        "classes": list(model.names.values()) if model is not None else None
    }

def decode_base64_image(base64_string: str) -> np.ndarray:
    """Decode base64 string to OpenCV image"""
    try:
        # Remove header if present (data:image/jpeg;base64,...)
        if "," in base64_string:
            base64_string = base64_string.split(",")[1]
        
        # Decode base64
        image_bytes = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        image = Image.open(BytesIO(image_bytes))
        
        # Convert to OpenCV format (BGR)
        image_np = np.array(image)
        if len(image_np.shape) == 2:  # Grayscale
            image_np = cv2.cvtColor(image_np, cv2.COLOR_GRAY2BGR)
        elif image_np.shape[2] == 4:  # RGBA
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGBA2BGR)
        else:  # RGB
            image_np = cv2.cvtColor(image_np, cv2.COLOR_RGB2BGR)
        
        logger.info(f"📸 Decoded image: shape={image_np.shape}, dtype={image_np.dtype}")
        return image_np
    
    except Exception as e:
        logger.error(f"Error decoding image: {e}")
        raise HTTPException(status_code=400, detail=f"Invalid image data: {str(e)}")


def draw_detections(image: np.ndarray, detections: List[Detection]) -> np.ndarray:
    """Draw bounding boxes and labels on image"""
    img_height, img_width = image.shape[:2]
    
    # Color palette
    colors = {
        'OxygenTank': (244, 133, 66),       # Blue
        'NitrogenTank': (176, 39, 156),     # Purple  
        'FirstAidBox': (55, 68, 219),       # Red
        'FireAlarm': (0, 255, 255),         # Yellow
        'SafetySwitchPanel': (255, 0, 255), # Magenta
        'EmergencyPhone': (255, 255, 0),    # Cyan
        'FireExtinguisher': (128, 0, 128),  # Purple
    }
    
    for det in detections:
        # Convert normalized coordinates to pixel coordinates
        x = int(det.bbox.x * img_width)
        y = int(det.bbox.y * img_height)
        w = int(det.bbox.width * img_width)
        h = int(det.bbox.height * img_height)
        
        # Get color
        color = colors.get(det.name, (244, 133, 66))  # Default to blue
        
        # Draw bounding box
        thickness = 3
        cv2.rectangle(image, (x, y), (x + w, y + h), color, thickness)
        
        # Draw corner accents
        corner_length = 20
        corner_thickness = 4
        
        # Top-left
        cv2.line(image, (x, y), (x + corner_length, y), color, corner_thickness)
        cv2.line(image, (x, y), (x, y + corner_length), color, corner_thickness)
        
        # Top-right
        cv2.line(image, (x + w, y), (x + w - corner_length, y), color, corner_thickness)
        cv2.line(image, (x + w, y), (x + w, y + corner_length), color, corner_thickness)
        
        # Bottom-left
        cv2.line(image, (x, y + h), (x + corner_length, y + h), color, corner_thickness)
        cv2.line(image, (x, y + h), (x, y + h - corner_length), color, corner_thickness)
        
        # Bottom-right
        cv2.line(image, (x + w, y + h), (x + w - corner_length, y + h), color, corner_thickness)
        cv2.line(image, (x + w, y + h), (x + w, y + h - corner_length), color, corner_thickness)
        
        # Prepare label text
        label = f"{det.name} {det.confidence*100:.0f}%"
        
        # Calculate label size
        font = cv2.FONT_HERSHEY_SIMPLEX
        font_scale = 0.7
        font_thickness = 2
        (text_width, text_height), baseline = cv2.getTextSize(label, font, font_scale, font_thickness)
        
        # Draw label background
        label_y = max(y - 10, text_height + 10)
        cv2.rectangle(
            image,
            (x, label_y - text_height - 10),
            (x + text_width + 10, label_y),
            color,
            -1  # Filled
        )
        
        # Draw label text
        cv2.putText(
            image,
            label,
            (x + 5, label_y - 5),
            font,
            font_scale,
            (255, 255, 255),  # White text
            font_thickness
        )
    
    return image

@app.post("/detect", response_model=DetectionResponse, tags=["Detection"])
async def detect_objects(request: DetectionRequest):
    """
    Detect objects in base64 encoded image
    Returns detection metadata (no image)
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        start_time = time.time()
        
        # Decode image
        image = decode_base64_image(request.image)
        img_height, img_width = image.shape[:2]
        
        logger.info(f"🔍 Running inference on image {img_width}x{img_height} with conf={request.confidence}")
        
        # Run inference on CPU with inference mode
        with torch.inference_mode():
            results = model(
                image, 
                conf=request.confidence,
                iou=0.45,
                verbose=False, 
                device='cpu',
                imgsz=640
            )
            result = results[0]
            
            logger.info(f"📊 Raw detections: {len(result.boxes)} boxes found")
            
            # Extract detections
            detections = []
            for box in result.boxes:
                # Get box coordinates (xyxy format)
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                
                # Convert to normalized xywh format
                x_norm = float(x1 / img_width)
                y_norm = float(y1 / img_height)
                w_norm = float((x2 - x1) / img_width)
                h_norm = float((y2 - y1) / img_height)
                
                # Get class name and confidence
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                name = result.names[cls]
                
                logger.info(f"  ✓ {name}: {conf:.2f} at ({x_norm:.2f}, {y_norm:.2f})")
                
                detections.append(Detection(
                    name=name,
                    confidence=conf,
                    bbox=BoundingBox(
                        x=x_norm,
                        y=y_norm,
                        width=w_norm,
                        height=h_norm
                    )
                ))
        
        # Calculate inference time
        inference_time = (time.time() - start_time) * 1000  # milliseconds
        
        logger.info(f"✅ Detection complete: {len(detections)} objects in {inference_time:.0f}ms")
        
        return DetectionResponse(
            objects=detections,
            inference_time=inference_time,
            image_size=[img_width, img_height]
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@app.post("/detect-image", tags=["Detection"])
async def detect_objects_with_image(request: DetectionRequest):
    """
    Detect objects in base64 encoded image
    Returns image with bounding boxes drawn
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Decode image
        image = decode_base64_image(request.image)
        
        # Run inference on CPU with inference mode
        with torch.inference_mode():
            results = model(
                image, 
                conf=request.confidence,
                iou=0.45,
                verbose=False, 
                device='cpu',
                imgsz=640
            )
            result = results[0]
        
        # Extract detections
        detections = []
        img_height, img_width = image.shape[:2]
        
        for box in result.boxes:
            # Get box coordinates (xyxy format)
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            
            # Convert to normalized xywh format
            x_norm = float(x1 / img_width)
            y_norm = float(y1 / img_height)
            w_norm = float((x2 - x1) / img_width)
            h_norm = float((y2 - y1) / img_height)
            
            # Get class name and confidence
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            name = result.names[cls]
            
            detections.append(Detection(
                name=name,
                confidence=conf,
                bbox=BoundingBox(
                    x=x_norm,
                    y=y_norm,
                    width=w_norm,
                    height=h_norm
                )
            ))
        
        # Draw detections on image
        annotated_image = draw_detections(image.copy(), detections)
        
        # Encode image to JPEG
        _, buffer = cv2.imencode('.jpg', annotated_image, [cv2.IMWRITE_JPEG_QUALITY, 90])
        
        # Return image as stream
        return StreamingResponse(
            BytesIO(buffer.tobytes()),
            media_type="image/jpeg",
            headers={
                "X-Inference-Time": str(result.speed['inference']),
                "X-Detections-Count": str(len(detections))
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

@app.post("/upload-detect", tags=["Detection"])
async def detect_from_upload(file: UploadFile = File(...), confidence: float = 0.15):
    """
    Detect objects from uploaded image file
    Returns image with bounding boxes drawn
    """
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Read image file
        contents = await file.read()
        nparr = np.frombuffer(contents, np.uint8)
        image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Run inference on CPU with inference mode
        with torch.inference_mode():
            results = model(
                image, 
                conf=confidence,
                iou=0.45,
                verbose=False, 
                device='cpu',
                imgsz=640
            )
            result = results[0]
        
        # Extract detections
        detections = []
        img_height, img_width = image.shape[:2]
        
        for box in result.boxes:
            # Get box coordinates (xyxy format)
            x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
            
            # Convert to normalized xywh format
            x_norm = float(x1 / img_width)
            y_norm = float(y1 / img_height)
            w_norm = float((x2 - x1) / img_width)
            h_norm = float((y2 - y1) / img_height)
            
            # Get class name and confidence
            conf = float(box.conf[0])
            cls = int(box.cls[0])
            name = result.names[cls]
            
            detections.append(Detection(
                name=name,
                confidence=conf,
                bbox=BoundingBox(
                    x=x_norm,
                    y=y_norm,
                    width=w_norm,
                    height=h_norm
                )
            ))
        
        # Draw detections on image
        annotated_image = draw_detections(image.copy(), detections)
        
        # Encode image to JPEG
        _, buffer = cv2.imencode('.jpg', annotated_image, [cv2.IMWRITE_JPEG_QUALITY, 90])
        
        # Return image as stream
        return StreamingResponse(
            BytesIO(buffer.tobytes()),
            media_type="image/jpeg",
            headers={
                "X-Inference-Time": str(result.speed['inference']),
                "X-Detections-Count": str(len(detections))
            }
        )
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Detection error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")
