/**
 * API Configuration for SafeOrbit
 * 
 * Update the BACKEND_URL with your computer's local IP address
 * to connect from your mobile device.
 * 
 * To find your IP:
 * - Windows: Run 'ipconfig' in PowerShell, look for IPv4 Address
 * - Mac/Linux: Run 'ifconfig' or 'ip addr'
 * 
 * Example: http://192.168.1.100:8000
 */

// For development, update this with your local IP address
export const API_CONFIG = {
  // Replace with your computer's IP address when testing on physical device
  BACKEND_URL: 'http://192.168.1.4:8000',
  
  // Use localhost when testing on emulator/simulator on same machine
  // BACKEND_URL: 'http://localhost:8000',
  // For Android emulator, use: 'http://10.0.2.2:8000'
  
  // Detection settings - LOWERED for better detection
  DETECTION_INTERVAL_IDLE: 500, // milliseconds when nothing detected
  DETECTION_INTERVAL_ACTIVE: 200, // milliseconds when objects detected
  DETECTION_INTERVAL_BOOST: 150, // milliseconds for maximum responsiveness
  CONFIDENCE_THRESHOLD: 0.15, // LOWERED from 0.4 to 0.15 for better recall
  IMAGE_QUALITY: 0.7, // JPEG quality (0-1) - balance between quality and speed
  IMAGE_MAX_WIDTH: 640, // resize image to this width
  IMAGE_MAX_HEIGHT: 640, // resize image to this height
  
  // Network settings
  REQUEST_TIMEOUT: 30000, // 30 seconds timeout for requests
  HEALTH_CHECK_TIMEOUT: 5000, // 5 seconds for health checks
  RETRY_ATTEMPTS: 2, // Number of retry attempts on failure
  RETRY_DELAY: 1000, // Delay between retries in ms
  
  // Smart features
  SKIP_IF_PROCESSING: true, // skip frame if previous request still processing
  MAX_CONCURRENT_REQUESTS: 1, // only 1 request at a time
  
  // Image preprocessing (applied before sending to backend)
  ENABLE_IMAGE_RESIZE: true, // Resize images to save bandwidth
  ENABLE_COMPRESSION: true, // Compress images before upload
};

export const ENDPOINTS = {
  DETECT: `${API_CONFIG.BACKEND_URL}/detect`,
  DETECT_IMAGE: `${API_CONFIG.BACKEND_URL}/detect-image`,
  UPLOAD_DETECT: `${API_CONFIG.BACKEND_URL}/upload-detect`,
  HEALTH: `${API_CONFIG.BACKEND_URL}/health`,
};

// Helper function to check if backend is localhost/emulator
export const isLocalBackend = () => {
  return API_CONFIG.BACKEND_URL.includes('localhost') || 
         API_CONFIG.BACKEND_URL.includes('127.0.0.1') ||
         API_CONFIG.BACKEND_URL.includes('10.0.2.2');
};

// Helper function to create fetch with timeout
export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = API_CONFIG.REQUEST_TIMEOUT
): Promise<Response> => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    throw error;
  }
};
