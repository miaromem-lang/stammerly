/**
 * Audio Analysis Utilities for Easy Onset Detection
 * 
 * Detects the characteristic "gentle rise in volume" acoustic signature
 * of a proper Easy Onset technique from raw audio data.
 */

export interface OnsetPattern {
  startTime: number;
  endTime: number;
  slope: number;
  classification: 'easy-onset' | 'partial-onset' | 'hard-onset';
  confidence: number;
}

export interface VolumeAnalysisResult {
  sentenceOnsets: OnsetPattern[];
  easyOnsetSignatures: number;
  partialOnsetSignatures: number;
  hardOnsetSignatures: number;
  overallEasyOnsetScore: number;
}

/**
 * Convert base64 audio to AudioBuffer using Web Audio API
 */
export async function decodeAudioFromBase64(base64Audio: string): Promise<AudioBuffer> {
  const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
  
  // Remove data URL prefix if present
  const base64Data = base64Audio.includes(',') 
    ? base64Audio.split(',')[1] 
    : base64Audio;
  
  // Decode base64 to binary
  const binaryString = atob(base64Data);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  
  // Decode audio data
  const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
  return audioBuffer;
}

/**
 * Calculate RMS (Root Mean Square) volume for a segment of audio samples
 */
function calculateRMS(samples: Float32Array, start: number, length: number): number {
  let sum = 0;
  const end = Math.min(start + length, samples.length);
  const count = end - start;
  
  if (count <= 0) return 0;
  
  for (let i = start; i < end; i++) {
    sum += samples[i] * samples[i];
  }
  
  return Math.sqrt(sum / count);
}

/**
 * Extract volume envelope from audio samples at specified window size
 */
export function extractVolumeEnvelope(
  samples: Float32Array, 
  sampleRate: number, 
  windowMs: number = 20
): number[] {
  const windowSize = Math.floor(sampleRate * windowMs / 1000);
  const envelope: number[] = [];
  
  for (let i = 0; i < samples.length; i += windowSize) {
    const rms = calculateRMS(samples, i, windowSize);
    envelope.push(rms);
  }
  
  return envelope;
}

/**
 * Detect utterance start points based on volume threshold
 */
function detectUtteranceStarts(
  envelope: number[], 
  windowMs: number,
  threshold: number = 0.02
): number[] {
  const starts: number[] = [];
  let inSilence = true;
  const silenceThreshold = threshold * 0.5;
  
  for (let i = 0; i < envelope.length; i++) {
    if (inSilence && envelope[i] > threshold) {
      // Found start of utterance
      // Look back to find the actual onset
      let onsetIndex = i;
      for (let j = i - 1; j >= 0 && j >= i - 5; j--) {
        if (envelope[j] > silenceThreshold) {
          onsetIndex = j;
        } else {
          break;
        }
      }
      starts.push(onsetIndex * windowMs);
      inSilence = false;
    } else if (!inSilence && envelope[i] < silenceThreshold) {
      // Entered silence
      let silenceCount = 0;
      for (let j = i; j < envelope.length && j < i + 10; j++) {
        if (envelope[j] < silenceThreshold) silenceCount++;
      }
      // Require sustained silence
      if (silenceCount >= 5) {
        inSilence = true;
      }
    }
  }
  
  return starts;
}

/**
 * Calculate volume slope (rate of increase) for a segment
 */
function calculateVolumeSlope(envelope: number[], startWindow: number, windowCount: number): number {
  const end = Math.min(startWindow + windowCount, envelope.length);
  const count = end - startWindow;
  
  if (count < 2) return 0;
  
  // Linear regression to find slope
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < count; i++) {
    const x = i;
    const y = envelope[startWindow + i];
    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumXX += x * x;
  }
  
  const n = count;
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  
  // Normalize slope to a 0-1 scale based on max amplitude
  const maxAmplitude = Math.max(...envelope.slice(startWindow, end));
  const normalizedSlope = maxAmplitude > 0 ? slope / maxAmplitude : 0;
  
  return normalizedSlope;
}

/**
 * Classify onset pattern based on volume slope
 * 
 * Easy Onset: Gradual rise over 200-400ms (slope < 0.3)
 * Partial Onset: Moderate rise (slope 0.3-0.6)
 * Hard Onset: Abrupt rise (slope > 0.6)
 */
function classifyOnset(slope: number): { classification: OnsetPattern['classification']; confidence: number } {
  const absSlope = Math.abs(slope);
  
  if (absSlope < 0.3) {
    return {
      classification: 'easy-onset',
      confidence: Math.max(0.5, 1 - absSlope / 0.3)
    };
  } else if (absSlope < 0.6) {
    return {
      classification: 'partial-onset',
      confidence: 0.6
    };
  } else {
    return {
      classification: 'hard-onset',
      confidence: Math.min(1, absSlope / 0.6 - 0.5)
    };
  }
}

/**
 * Analyze audio for Easy Onset volume-rise signatures
 */
export function analyzeVolumeEnvelope(
  samples: Float32Array,
  sampleRate: number,
  windowMs: number = 20
): VolumeAnalysisResult {
  const envelope = extractVolumeEnvelope(samples, sampleRate, windowMs);
  const utteranceStarts = detectUtteranceStarts(envelope, windowMs);
  
  const onsetPatterns: OnsetPattern[] = [];
  let easyOnsets = 0;
  let partialOnsets = 0;
  let hardOnsets = 0;
  
  // Analyze first 300ms of each utterance
  const analysisWindowMs = 300;
  const windowsToAnalyze = Math.ceil(analysisWindowMs / windowMs);
  
  for (const startMs of utteranceStarts) {
    const startWindow = Math.floor(startMs / windowMs);
    const slope = calculateVolumeSlope(envelope, startWindow, windowsToAnalyze);
    const { classification, confidence } = classifyOnset(slope);
    
    onsetPatterns.push({
      startTime: startMs / 1000,
      endTime: (startMs + analysisWindowMs) / 1000,
      slope,
      classification,
      confidence
    });
    
    switch (classification) {
      case 'easy-onset':
        easyOnsets++;
        break;
      case 'partial-onset':
        partialOnsets++;
        break;
      case 'hard-onset':
        hardOnsets++;
        break;
    }
  }
  
  // Calculate overall Easy Onset score (0-100)
  const totalOnsets = onsetPatterns.length;
  const overallScore = totalOnsets > 0
    ? ((easyOnsets * 1 + partialOnsets * 0.5) / totalOnsets) * 100
    : 50; // Default neutral score if no onsets detected
  
  return {
    sentenceOnsets: onsetPatterns,
    easyOnsetSignatures: easyOnsets,
    partialOnsetSignatures: partialOnsets,
    hardOnsetSignatures: hardOnsets,
    overallEasyOnsetScore: Math.round(overallScore)
  };
}

/**
 * Simplified analysis for quick acoustic signature detection
 * Used when full AudioBuffer decoding is not needed
 */
export async function analyzeAudioForEasyOnset(base64Audio: string): Promise<VolumeAnalysisResult | null> {
  try {
    const audioBuffer = await decodeAudioFromBase64(base64Audio);
    const samples = audioBuffer.getChannelData(0); // Get mono channel
    const sampleRate = audioBuffer.sampleRate;
    
    return analyzeVolumeEnvelope(samples, sampleRate);
  } catch (error) {
    console.error('Error analyzing audio for Easy Onset:', error);
    return null;
  }
}
