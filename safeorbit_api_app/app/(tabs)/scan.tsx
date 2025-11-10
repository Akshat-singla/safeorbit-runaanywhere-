import { Button } from '@/components/ui/button';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/text';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { 
  CameraIcon, 
  RotateCwIcon,
  ZapIcon,
  ZapOffIcon,
  ArrowLeftIcon,
  CheckCircleIcon,
  BookOpenIcon,
  SparklesIcon,
  RefreshCwIcon,
  VideoIcon,
  AlertCircleIcon
} from 'lucide-react-native';
import * as React from 'react';
import { 
  Pressable, 
  View, 
  StyleSheet, 
  Alert, 
  ActivityIndicator, 
  Image, 
  ScrollView, 
  Dimensions,
  StatusBar,
  TouchableOpacity
} from 'react-native';
import ImageView from 'react-native-image-viewing';
import { API_CONFIG, ENDPOINTS } from '@/lib/api-config';
import { saveScanResult } from '@/lib/storage';
import { getObjectConfig, sortByPriority, getPriorityLabel } from '@/lib/object-priorities';
import { hasInstructions } from '@/lib/object-instructions';
import { analyzeImageWithGemini, isGeminiConfigured, type GeminiDetection } from '@/lib/gemini-config';

interface Detection {
  name: string;
  confidence: number;
  bbox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

interface DetectionResponse {
  objects: Detection[];
  inference_time: number;
  image_size: [number, number];
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ScanScreen() {
  const [facing, setFacing] = React.useState<CameraType>('back');
  const [permission, requestPermission] = useCameraPermissions();
  const [isFlashOn, setIsFlashOn] = React.useState(false);
  const [isTakingPhoto, setIsTakingPhoto] = React.useState(false);
  const [showResults, setShowResults] = React.useState(false);
  const [processedImageUrl, setProcessedImageUrl] = React.useState<string | null>(null);
  const [detections, setDetections] = React.useState<Detection[]>([]);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [inferenceTime, setInferenceTime] = React.useState<number>(0);
  const [isBackendConnected, setIsBackendConnected] = React.useState(false);
  const [imageViewerVisible, setImageViewerVisible] = React.useState(false);
  const [capturedImageBase64, setCapturedImageBase64] = React.useState<string | null>(null);
  const [processingStatus, setProcessingStatus] = React.useState<string>('');
  const [errorMessage, setErrorMessage] = React.useState<string>('');
  
  const cameraRef = React.useRef<CameraView>(null);
  const scrollViewRef = React.useRef<ScrollView>(null);
  const abortControllerRef = React.useRef<AbortController | null>(null);

  // Check for incoming live scan results
  React.useEffect(() => {
    const checkForLiveScanResults = async () => {
      const tempKey = '@safeorbit_temp_live_scan_result';
      try {
        const AsyncStorage = (await import('@react-native-async-storage/async-storage')).default;
        const tempData = await AsyncStorage.getItem(tempKey);
        
        if (tempData) {
          const { detections: detectionsStr, image, inferenceTime: infTime } = JSON.parse(tempData);
          const parsedDetections = JSON.parse(detectionsStr);
          
          setDetections(parsedDetections);
          setInferenceTime(parseFloat(infTime));
          setCapturedImageBase64(image);
          setShowResults(true);
          
          await AsyncStorage.removeItem(tempKey);
          
          console.log('✅ Loaded live scan results into photo mode');
        }
      } catch (error) {
        console.log('No live scan results to load');
      }
    };
    
    checkForLiveScanResults();
  }, []);

  React.useEffect(() => {
    checkBackendHealth();
  }, []);

  const checkBackendHealth = async () => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.HEALTH_CHECK_TIMEOUT);

      const response = await fetch(ENDPOINTS.HEALTH, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      const data = await response.json();
      const isHealthy = data.status === 'healthy' && data.model_loaded;
      setIsBackendConnected(isHealthy);
      
      if (isHealthy) {
        console.log('✅ Backend connected:', data);
      } else {
        console.warn('⚠️ Backend unhealthy:', data);
      }
    } catch (error: any) {
      setIsBackendConnected(false);
      if (error.name === 'AbortError') {
        console.log('❌ Backend health check timeout');
      } else {
        console.log('❌ Backend not reachable:', error.message);
      }
    }
  };

  const captureAndAnalyze = async () => {
    if (!cameraRef.current) return;

    if (!isBackendConnected) {
      Alert.alert(
        'Backend Not Connected',
        `Please ensure the Python backend is running at:\n${API_CONFIG.BACKEND_URL}\n\nUpdate the IP address in lib/api-config.ts if needed.`,
        [
          { text: 'Retry', onPress: checkBackendHealth },
          { text: 'Cancel', style: 'cancel' }
        ]
      );
      return;
    }

    try {
      setIsTakingPhoto(true);
      setErrorMessage('');
      setProcessingStatus('Capturing photo...');

      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: API_CONFIG.IMAGE_QUALITY,
      });

      if (!photo?.base64) {
        throw new Error('Failed to capture photo');
      }

      setCapturedImageBase64(photo.base64);
      setIsProcessing(true);
      setShowResults(true);
      setProcessingStatus('Uploading to server...');

      // Create abort controller for timeout
      abortControllerRef.current = new AbortController();
      const timeoutId = setTimeout(() => {
        abortControllerRef.current?.abort();
      }, API_CONFIG.REQUEST_TIMEOUT);

      try {
        setProcessingStatus('Running AI detection...');
        
        const response = await fetch(ENDPOINTS.DETECT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: photo.base64,
            confidence: API_CONFIG.CONFIDENCE_THRESHOLD,
          }),
          signal: abortControllerRef.current.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server error (${response.status}): ${errorText}`);
        }

        const result: DetectionResponse = await response.json();
        
        console.log('✅ Detection successful:', {
          objects: result.objects.length,
          inferenceTime: result.inference_time,
          imageSize: result.image_size,
        });

        setDetections(result.objects);
        setInferenceTime(result.inference_time);

        // Save scan result to storage with image
        try {
          await saveScanResult(result.objects, result.inference_time, photo.base64);
        } catch (error) {
          console.error('Failed to save scan result:', error);
        }

        // Get annotated image
        setProcessingStatus('Generating visualization...');
        const imageResponse = await fetch(ENDPOINTS.DETECT_IMAGE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            image: photo.base64,
            confidence: API_CONFIG.CONFIDENCE_THRESHOLD,
          }),
          signal: abortControllerRef.current.signal,
        });

        if (imageResponse.ok) {
          const blob = await imageResponse.blob();
          const reader = new FileReader();
          reader.onloadend = () => {
            setProcessedImageUrl(reader.result as string);
            setProcessingStatus('');
          };
          reader.readAsDataURL(blob);
        } else {
          // If visualization fails, just show the original
          setProcessedImageUrl(`data:image/jpeg;base64,${photo.base64}`);
          setProcessingStatus('');
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Request timeout. The server took too long to respond. Please try again.');
        } else {
          throw fetchError;
        }
      }

    } catch (error: any) {
      console.error('Capture error:', error);
      const errorMsg = error.message || 'Failed to process image';
      setErrorMessage(errorMsg);
      Alert.alert(
        'Detection Failed',
        errorMsg,
        [
          { text: 'Retry', onPress: retryDetection },
          { text: 'Cancel', onPress: goBackToCamera, style: 'cancel' }
        ]
      );
      setShowResults(false);
    } finally {
      setIsTakingPhoto(false);
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const retryDetection = () => {
    if (capturedImageBase64) {
      // Retry with the same captured image
      reprocessImage(capturedImageBase64);
    } else {
      // Capture new photo
      goBackToCamera();
    }
  };

  const reprocessImage = async (imageBase64: string) => {
    try {
      setIsProcessing(true);
      setErrorMessage('');
      setShowResults(true);
      setProcessingStatus('Retrying detection...');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.REQUEST_TIMEOUT);

      const response = await fetch(ENDPOINTS.DETECT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          confidence: API_CONFIG.CONFIDENCE_THRESHOLD,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const result: DetectionResponse = await response.json();
      setDetections(result.objects);
      setInferenceTime(result.inference_time);

      // Get annotated image
      const imageResponse = await fetch(ENDPOINTS.DETECT_IMAGE, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          confidence: API_CONFIG.CONFIDENCE_THRESHOLD,
        }),
      });

      if (imageResponse.ok) {
        const blob = await imageResponse.blob();
        const reader = new FileReader();
        reader.onloadend = () => {
          setProcessedImageUrl(reader.result as string);
        };
        reader.readAsDataURL(blob);
      }

    } catch (error: any) {
      const errorMsg = error.name === 'AbortError' 
        ? 'Request timeout' 
        : error.message || 'Failed to process image';
      setErrorMessage(errorMsg);
      Alert.alert('Retry Failed', errorMsg);
    } finally {
      setIsProcessing(false);
      setProcessingStatus('');
    }
  };

  const goBackToCamera = () => {
    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    setShowResults(false);
    setProcessedImageUrl(null);
    setDetections([]);
    setInferenceTime(0);
    setCapturedImageBase64(null);
    setErrorMessage('');
    setProcessingStatus('');
  };

// ... existing code ...

  if (!permission) {
    return <View className="flex-1 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-black px-6">
        <Text className="mb-4 text-center text-white text-lg">
          We need your permission to show the camera
        </Text>
        <Button onPress={requestPermission}>
          <Text className="text-white font-semibold">Grant Permission</Text>
        </Button>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing((current) => (current === 'back' ? 'front' : 'back'));
  };

  const toggleFlash = () => {
    setIsFlashOn((current) => !current);
  };

  // Results Screen - Full screen modal
  if (showResults) {
    return (
      <View className="flex-1 bg-black">
        <StatusBar barStyle="light-content" />
        
        {/* Header with Back Button */}
        <View className="absolute top-0 left-0 right-0 z-50 pt-4 pb-4 px-5 bg-black/80">
          <Pressable 
            onPress={goBackToCamera}
            className="flex-row items-center gap-2"
            disabled={isProcessing}
          >
            <Icon as={ArrowLeftIcon} size={24} color="#ffffff" />
            <Text className="text-white text-lg font-semibold">Back to Camera</Text>
          </Pressable>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          className="flex-1"
          contentContainerStyle={{ flexGrow: 1 }}
          minimumZoomScale={1}
          maximumZoomScale={5}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
          bounces={true}
          bouncesZoom={true}
        >
          {/* Zoomable Image Container */}
          <View className="flex-1 items-center justify-center bg-black" style={{ minHeight: SCREEN_HEIGHT * 0.6 }}>
            {isProcessing ? (
              <View className="flex-1 items-center justify-center">
                <ActivityIndicator size="large" color="#ffffff" />
                <Text className="text-white mt-4 text-lg">{processingStatus || 'Processing...'}</Text>
                {processingStatus === 'Uploading to server...' && (
                  <Text className="text-white/60 mt-2 text-sm">This may take a moment...</Text>
                )}
              </View>
            ) : processedImageUrl ? (
              <TouchableOpacity 
                activeOpacity={0.9}
                onPress={() => setImageViewerVisible(true)}
                style={{ flex: 1, width: '100%', justifyContent: 'center', alignItems: 'center' }}
              >
                <Image
                  source={{ uri: processedImageUrl }}
                  style={{ 
                    width: SCREEN_WIDTH, 
                    height: SCREEN_HEIGHT * 0.6,
                  }}
                  resizeMode="contain"
                />
              </TouchableOpacity>
            ) : errorMessage ? (
              <View className="flex-1 items-center justify-center px-6">
                <Icon as={AlertCircleIcon} size={64} color="#ef4444" />
                <Text className="text-red-400 mt-4 text-lg font-bold text-center">
                  {errorMessage}
                </Text>
                <Pressable
                  onPress={retryDetection}
                  className="mt-6 bg-blue-500 px-6 py-3 rounded-full"
                >
                  <Text className="text-white font-bold">Retry Detection</Text>
                </Pressable>
              </View>
            ) : null}
          </View>

          {/* Results Section */}
          {!isProcessing && !errorMessage && (
            <View className="bg-black p-6 border-t border-white/20">
              {/* Header */}
              <View className="flex-row items-center justify-between mb-6">
                <View className="flex-row items-center gap-3">
                  <Icon as={CheckCircleIcon} size={28} color="#ffffff" />
                  <Text className="text-white text-2xl font-bold">
                    Detection Results
                  </Text>
                </View>
                {!isBackendConnected && (
                  <View className="bg-red-500 px-3 py-1 rounded-full">
                    <Text className="text-white text-xs font-bold">Offline</Text>
                  </View>
                )}
              </View>

              {/* Stats */}
              <View className="flex-row gap-4 mb-6">
                <View className="flex-1 bg-white/10 p-4 rounded-xl border border-white/30">
                  <Text className="text-white/70 text-xs font-medium mb-1">Objects Found</Text>
                  <Text className="text-white text-3xl font-bold">{detections.length}</Text>
                </View>
                <View className="flex-1 bg-white/10 p-4 rounded-xl border border-white/30">
                  <Text className="text-white/70 text-xs font-medium mb-1">Inference Time</Text>
                  <Text className="text-white text-3xl font-bold">
                    {inferenceTime.toFixed(0)}
                    <Text className="text-lg">ms</Text>
                  </Text>
                </View>
              </View>

              {/* Detections List */}
              {detections.length > 0 && (
                <View className="mb-6">
                  <Text className="text-white text-lg font-semibold mb-3">
                    Detected Objects
                  </Text>
                  
                  {sortByPriority(detections).map((detection, index) => {
                    const config = getObjectConfig(detection.name);
                    const priorityLabel = getPriorityLabel(config.priority);
                    const hasGuide = hasInstructions(detection.name);
                    
                    return (
                      <View 
                        key={index}
                        className="bg-white/5 p-4 rounded-xl mb-3"
                        style={{ borderWidth: 2, borderColor: config.color }}
                      >
                        <View className="flex-row items-center justify-between mb-2">
                          <View className="flex-1">
                            <View className="flex-row items-center gap-2 mb-1">
                              <View 
                                className="px-2 py-1 rounded"
                                style={{ backgroundColor: config.color }}
                              >
                                <Text className="text-white text-xs font-bold">
                                  {priorityLabel}
                                </Text>
                              </View>
                            </View>
                            <Text className="text-white text-lg font-semibold">
                              {config.displayName || detection.name}
                            </Text>
                          </View>
                          <View 
                            className="px-3 py-1 rounded-full"
                            style={{ backgroundColor: config.color }}
                          >
                            <Text className="text-white text-sm font-bold">
                              {(detection.confidence * 100).toFixed(1)}%
                            </Text>
                          </View>
                        </View>
                        <View className="flex-row gap-4 mt-2">
                          <Text className="text-white/60 text-xs">
                            X: {(detection.bbox.x * 100).toFixed(1)}%
                          </Text>
                          <Text className="text-white/60 text-xs">
                            Y: {(detection.bbox.y * 100).toFixed(1)}%
                          </Text>
                          <Text className="text-white/60 text-xs">
                            W: {(detection.bbox.width * 100).toFixed(1)}%
                          </Text>
                          <Text className="text-white/60 text-xs">
                            H: {(detection.bbox.height * 100).toFixed(1)}%
                          </Text>
                        </View>
                        
                        {/* Instructions Button */}
                        {hasGuide && (
                          <Pressable
                            onPress={() => router.push({
                              pathname: '/instructions',
                              params: { objectName: detection.name }
                            })}
                            className="mt-3 flex-row items-center justify-center gap-2 py-2 px-4 rounded-lg"
                            style={{ backgroundColor: config.color }}
                          >
                            <Icon as={BookOpenIcon} size={16} color="#ffffff" />
                            <Text className="text-white text-sm font-bold">
                              How to Use
                            </Text>
                          </Pressable>
                        )}
                      </View>
                    );
                  })}
                </View>
              )}

              {detections.length === 0 && !isProcessing && (
                <View className="bg-white/5 p-6 rounded-xl border border-white/20 items-center">
                  <Text className="text-white/60 text-center text-base mb-4">
                    No objects detected in this image
                  </Text>
                  <Text className="text-white/40 text-center text-sm">
                    Try adjusting lighting or positioning objects more clearly in frame
                  </Text>
                  <Pressable
                    onPress={goBackToCamera}
                    className="mt-4 bg-blue-500 px-4 py-2 rounded-full"
                  >
                    <Text className="text-white font-bold">Try Again</Text>
                  </Pressable>
                </View>
              )}
            </View>
          )}
        </ScrollView>

        {/* Image Viewer Modal */}
        <ImageView
          images={processedImageUrl ? [{ uri: processedImageUrl }] : []}
          imageIndex={0}
          visible={imageViewerVisible}
          onRequestClose={() => setImageViewerVisible(false)}
        />
      </View>
    );
  }

  // Camera Screen
  return (
    <View className="flex-1 bg-black">
      <CameraView 
        ref={cameraRef}
        style={StyleSheet.absoluteFill} 
        facing={facing} 
        enableTorch={isFlashOn}
      />
      
      <View className="absolute inset-0" style={{ pointerEvents: 'box-none' }}>
        {/* Top Bar */}
        <View className="absolute top-[20px] left-5 right-5 flex-row justify-between items-center">
          {/* Connection Status */}
          {!isBackendConnected ? (
            <View className="flex-row items-center gap-2 bg-red-500/90 px-3 py-2 rounded-full">
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
              <Text className="text-white text-xs font-bold">Backend Offline</Text>
            </View>
          ) : (
            <View className="flex-row items-center gap-2 bg-green-500/90 px-3 py-2 rounded-full">
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#fff' }} />
              <Text className="text-white text-xs font-bold">Ready</Text>
            </View>
          )}

          {/* Live Scan Mode Button */}
          <Pressable 
            className="flex-row items-center gap-2 bg-blue-500 px-3 py-2 rounded-full ml-auto mr-2"
            onPress={() => router.push('/(tabs)/live-scan' as any)}
          >
            <Icon as={VideoIcon} size={16} color="#ffffff" />
            <Text className="text-white text-xs font-bold">Live Mode</Text>
          </Pressable>

          {/* Flash Toggle */}
          <Pressable 
            className="w-10 h-10 rounded-full bg-black/60 justify-center items-center mr-2"
            onPress={toggleFlash}
          >
            <Icon
              as={isFlashOn ? ZapIcon : ZapOffIcon}
              size={20}
              color="#ffffff"
            />
          </Pressable>

          {/* Rotate Camera Button */}
          <Pressable 
            className="w-10 h-10 rounded-full bg-black/60 justify-center items-center"
            onPress={toggleCameraFacing}
          >
            <Icon as={RotateCwIcon} size={20} color="#ffffff" />
          </Pressable>
        </View>

        {/* Center Frame Guide */}
        <View 
          className="absolute"
          style={{
            top: '20%',
            left: '10%',
            right: '10%',
            bottom: '30%',
            borderWidth: 2,
            borderColor: isBackendConnected ? 'rgba(66, 133, 244, 0.5)' : 'rgba(239, 68, 68, 0.5)',
            borderRadius: 20,
          }}
        >
          <View style={{ position: 'absolute', top: -2, left: -2, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#ffffff', borderTopLeftRadius: 20 }} />
          <View style={{ position: 'absolute', top: -2, right: -2, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: '#ffffff', borderTopRightRadius: 20 }} />
          <View style={{ position: 'absolute', bottom: -2, left: -2, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#ffffff', borderBottomLeftRadius: 20 }} />
          <View style={{ position: 'absolute', bottom: -2, right: -2, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#ffffff', borderBottomRightRadius: 20 }} />
        </View>

        {/* Instructions */}
        <View className="absolute top-[15%] left-0 right-0 items-center">
          <View className="bg-black/60 px-6 py-3 rounded-full">
            <Text className="text-white text-sm font-medium">
              Position object in frame
            </Text>
          </View>
        </View>

        {/* Bottom Controls */}
        <View className="absolute bottom-8 left-0 right-0 items-center">
          <Pressable 
            onPress={captureAndAnalyze}
            disabled={isTakingPhoto || !isBackendConnected}
            className="bg-white px-8 py-4 rounded-full shadow-lg"
            style={{
              opacity: (isTakingPhoto || !isBackendConnected) ? 0.5 : 1,
            }}
          >
            {isTakingPhoto ? (
              <View className="flex-row items-center gap-3">
                <ActivityIndicator size="small" color="#000000" />
                <Text className="text-black font-bold text-lg">Processing...</Text>
              </View>
            ) : (
              <View className="flex-row items-center gap-3">
                <Icon as={CameraIcon} size={24} color="#000000" />
                <Text className="text-black font-bold text-lg">Capture & Detect</Text>
              </View>
            )}
          </Pressable>

          {!isBackendConnected && (
            <Pressable 
              onPress={checkBackendHealth}
              className="mt-4 bg-white/20 px-4 py-2 rounded-full border border-white/40"
            >
              <View className="flex-row items-center gap-2">
                <Icon as={RefreshCwIcon} size={16} color="#ffffff" />
                <Text className="text-white text-xs font-bold">Retry Connection</Text>
              </View>
            </Pressable>
          )}
        </View>
      </View>
    </View>
  );
}
