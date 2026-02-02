import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Face detection and concomitant behaviour tracking using TensorFlow.js FaceMesh
 * Detects secondary behaviours: eye blinks, jaw tension, head movements
 */

export interface ConcomitantMetrics {
  eyeBlinks: number;
  jawTensionEvents: number;
  headMovements: number;
  avgBlinkDuration: number;
  blinkRate: number; // per minute
  tensionIntensity: 'low' | 'moderate' | 'high';
}

export interface DetectionEvent {
  type: 'eye-blink' | 'jaw-tension' | 'head-movement';
  timestamp: number;
  duration?: number;
  intensity?: number;
}

interface FaceLandmarks {
  positions: Array<{ x: number; y: number; z: number }>;
}

// TensorFlow.js global objects loaded via CDN
declare global {
  interface Window {
    faceLandmarksDetection: any;
    tf: any;
  }
}

// Eye landmark indices for FaceMesh
const LEFT_EYE_INDICES = [33, 160, 158, 133, 153, 144];
const RIGHT_EYE_INDICES = [362, 385, 387, 263, 373, 380];
const UPPER_LIP_INDEX = 13;
const LOWER_LIP_INDEX = 14;
const NOSE_TIP_INDEX = 1;

// Thresholds
const EYE_ASPECT_RATIO_THRESHOLD = 0.2;
const BLINK_DURATION_THRESHOLD = 100; // ms
const HEAD_MOVEMENT_THRESHOLD = 15; // pixels
const JAW_VARIANCE_THRESHOLD = 0.15;

export function useWebcamAnalysis() {
  const [isActive, setIsActive] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<ConcomitantMetrics>({
    eyeBlinks: 0,
    jawTensionEvents: 0,
    headMovements: 0,
    avgBlinkDuration: 0,
    blinkRate: 0,
    tensionIntensity: 'low'
  });
  const [events, setEvents] = useState<DetectionEvent[]>([]);
  
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  
  // Tracking state for detection algorithms
  const trackingRef = useRef({
    lastNosePosition: { x: 0, y: 0 },
    eyeClosedStart: 0,
    blinkDurations: [] as number[],
    lipDistances: [] as number[],
    isEyeClosed: false,
    headPositions: [] as { x: number; y: number; time: number }[]
  });

  // Load TensorFlow.js and Face Landmarks Detection model
  const loadModel = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Load TensorFlow.js via CDN if not already loaded
      if (!window.tf) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.17.0/dist/tf.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load TensorFlow.js'));
          document.head.appendChild(script);
        });
      }
      
      // Load Face Landmarks Detection
      if (!window.faceLandmarksDetection) {
        await new Promise<void>((resolve, reject) => {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow-models/face-landmarks-detection@1.0.5/dist/face-landmarks-detection.min.js';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Failed to load Face Landmarks Detection'));
          document.head.appendChild(script);
        });
      }
      
      // Wait for libraries to initialize
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Create detector
      const model = window.faceLandmarksDetection.SupportedModels.MediaPipeFaceMesh;
      detectorRef.current = await window.faceLandmarksDetection.createDetector(model, {
        runtime: 'tfjs',
        refineLandmarks: true,
        maxFaces: 1
      });
      
      console.log('Face detection model loaded successfully');
    } catch (err) {
      console.error('Error loading face detection model:', err);
      setError('Failed to load face detection model. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Calculate Eye Aspect Ratio (EAR)
  const calculateEAR = useCallback((landmarks: FaceLandmarks['positions'], eyeIndices: number[]): number => {
    if (!landmarks || landmarks.length < Math.max(...eyeIndices)) return 1;
    
    const points = eyeIndices.map(i => landmarks[i]);
    if (points.some(p => !p)) return 1;
    
    // Vertical distances
    const v1 = Math.sqrt(Math.pow(points[1].x - points[5].x, 2) + Math.pow(points[1].y - points[5].y, 2));
    const v2 = Math.sqrt(Math.pow(points[2].x - points[4].x, 2) + Math.pow(points[2].y - points[4].y, 2));
    
    // Horizontal distance
    const h = Math.sqrt(Math.pow(points[0].x - points[3].x, 2) + Math.pow(points[0].y - points[3].y, 2));
    
    if (h === 0) return 1;
    return (v1 + v2) / (2 * h);
  }, []);

  // Process a single video frame
  const processFrame = useCallback(async () => {
    if (!videoRef.current || !detectorRef.current || !isActive) return;
    
    try {
      const faces = await detectorRef.current.estimateFaces(videoRef.current);
      
      if (faces.length > 0) {
        const landmarks = faces[0].keypoints;
        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000; // seconds
        
        // === Eye Blink Detection ===
        const leftEAR = calculateEAR(landmarks, LEFT_EYE_INDICES);
        const rightEAR = calculateEAR(landmarks, RIGHT_EYE_INDICES);
        const avgEAR = (leftEAR + rightEAR) / 2;
        
        if (avgEAR < EYE_ASPECT_RATIO_THRESHOLD) {
          if (!trackingRef.current.isEyeClosed) {
            trackingRef.current.isEyeClosed = true;
            trackingRef.current.eyeClosedStart = now;
          }
        } else {
          if (trackingRef.current.isEyeClosed) {
            const blinkDuration = now - trackingRef.current.eyeClosedStart;
            if (blinkDuration > BLINK_DURATION_THRESHOLD) {
              trackingRef.current.blinkDurations.push(blinkDuration);
              setEvents(prev => [...prev, { 
                type: 'eye-blink', 
                timestamp: now, 
                duration: blinkDuration 
              }]);
              setMetrics(prev => ({
                ...prev,
                eyeBlinks: prev.eyeBlinks + 1,
                avgBlinkDuration: trackingRef.current.blinkDurations.reduce((a, b) => a + b, 0) / 
                  trackingRef.current.blinkDurations.length,
                blinkRate: elapsed > 0 ? (prev.eyeBlinks + 1) / elapsed * 60 : 0
              }));
            }
            trackingRef.current.isEyeClosed = false;
          }
        }
        
        // === Jaw Tension Detection ===
        const upperLip = landmarks[UPPER_LIP_INDEX];
        const lowerLip = landmarks[LOWER_LIP_INDEX];
        if (upperLip && lowerLip) {
          const lipDistance = Math.sqrt(
            Math.pow(upperLip.x - lowerLip.x, 2) + 
            Math.pow(upperLip.y - lowerLip.y, 2)
          );
          
          trackingRef.current.lipDistances.push(lipDistance);
          if (trackingRef.current.lipDistances.length > 30) {
            trackingRef.current.lipDistances.shift();
            
            // Calculate variance in lip distance
            const mean = trackingRef.current.lipDistances.reduce((a, b) => a + b, 0) / 
              trackingRef.current.lipDistances.length;
            const variance = trackingRef.current.lipDistances.reduce((sum, val) => 
              sum + Math.pow(val - mean, 2), 0) / trackingRef.current.lipDistances.length;
            const normalizedVariance = variance / (mean * mean);
            
            // High variance during speech could indicate tension
            if (normalizedVariance > JAW_VARIANCE_THRESHOLD) {
              setMetrics(prev => {
                const newEvents = prev.jawTensionEvents + 1;
                return {
                  ...prev,
                  jawTensionEvents: newEvents,
                  tensionIntensity: newEvents > 10 ? 'high' : newEvents > 5 ? 'moderate' : 'low'
                };
              });
              setEvents(prev => [...prev, { 
                type: 'jaw-tension', 
                timestamp: now, 
                intensity: normalizedVariance 
              }]);
              // Reset to avoid repeated counting
              trackingRef.current.lipDistances = [];
            }
          }
        }
        
        // === Head Movement Detection ===
        const noseTip = landmarks[NOSE_TIP_INDEX];
        if (noseTip) {
          const { x, y } = noseTip;
          trackingRef.current.headPositions.push({ x, y, time: now });
          
          // Keep last 10 positions
          if (trackingRef.current.headPositions.length > 10) {
            trackingRef.current.headPositions.shift();
          }
          
          // Check for rapid displacement
          if (trackingRef.current.headPositions.length >= 2) {
            const prev = trackingRef.current.headPositions[trackingRef.current.headPositions.length - 2];
            const displacement = Math.sqrt(
              Math.pow(x - prev.x, 2) + Math.pow(y - prev.y, 2)
            );
            
            if (displacement > HEAD_MOVEMENT_THRESHOLD) {
              setMetrics(prev => ({
                ...prev,
                headMovements: prev.headMovements + 1
              }));
              setEvents(prev => [...prev, { 
                type: 'head-movement', 
                timestamp: now, 
                intensity: displacement 
              }]);
            }
          }
          
          trackingRef.current.lastNosePosition = { x, y };
        }
      }
    } catch (err) {
      console.error('Error processing frame:', err);
    }
    
    // Continue processing frames
    if (isActive) {
      animationRef.current = requestAnimationFrame(processFrame);
    }
  }, [isActive, calculateEAR]);

  // Start webcam and detection
  const startAnalysis = useCallback(async (videoElement: HTMLVideoElement) => {
    setError(null);
    videoRef.current = videoElement;
    
    try {
      // Load model if not loaded
      if (!detectorRef.current) {
        await loadModel();
      }
      
      // Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: 'user'
        }
      });
      
      streamRef.current = stream;
      videoElement.srcObject = stream;
      await videoElement.play();
      
      // Reset metrics and tracking
      setMetrics({
        eyeBlinks: 0,
        jawTensionEvents: 0,
        headMovements: 0,
        avgBlinkDuration: 0,
        blinkRate: 0,
        tensionIntensity: 'low'
      });
      setEvents([]);
      trackingRef.current = {
        lastNosePosition: { x: 0, y: 0 },
        eyeClosedStart: 0,
        blinkDurations: [],
        lipDistances: [],
        isEyeClosed: false,
        headPositions: []
      };
      startTimeRef.current = Date.now();
      
      // Start processing
      setIsActive(true);
      animationRef.current = requestAnimationFrame(processFrame);
      
      console.log('Webcam analysis started');
    } catch (err) {
      console.error('Error starting webcam analysis:', err);
      setError('Could not access webcam. Please check permissions.');
    }
  }, [loadModel, processFrame]);

  // Stop analysis
  const stopAnalysis = useCallback(() => {
    setIsActive(false);
    
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    console.log('Webcam analysis stopped');
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAnalysis();
    };
  }, [stopAnalysis]);

  return {
    isActive,
    isLoading,
    error,
    metrics,
    events,
    startAnalysis,
    stopAnalysis
  };
}
