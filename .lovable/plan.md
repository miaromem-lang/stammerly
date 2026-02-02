
# Implementation Plan: Complete Minor Gaps in Clinical Analytics Hub

## Overview
This plan addresses the three remaining gaps in the Multi-Dimensional Assessment Framework:
1. **%SS Comparison Chart** - Visualize stuttering rates by task type (Reading vs Spontaneous Speech)
2. **Webcam Integration** - Detect concomitant secondary behaviours (eye blinks, jaw tension, head movements)
3. **Technique Accuracy with Acoustic Analysis** - Detect Easy Onset volume-rise signature from raw audio

---

## Feature 1: %SS Comparison Chart by Task Type

### Purpose
Allow therapists to compare Percentage of Syllables Stuttered (%SS) across different exercise categories (Reading, Spontaneous Speech, Conversation, etc.) to identify situational patterns.

### Implementation

**A. Update SurfaceCommandCentre Component**
- Add a new props interface to accept task-type breakdown data
- Create a bar chart visualization using Recharts showing %SS per category
- Display clinical insights comparing Reading vs Spontaneous performance

**B. Update TherapistAnalyticsHub Data Fetching**
- Group practice_sessions by `exercise_category`
- Calculate %SS per category using existing SLD counts and syllable estimates
- Pass aggregated data to SurfaceCommandCentre

**C. Visual Design**
- Horizontal bar chart with category labels
- Color-coded bars (green = low %SS, yellow = moderate, red = high)
- Clinical insight text explaining Reading vs Spontaneous patterns

### Files to Modify
- `src/components/therapist/SurfaceCommandCentre.tsx` - Add TaskTypeChart sub-component
- `src/pages/TherapistAnalyticsHub.tsx` - Add task-type aggregation to metrics

---

## Feature 2: Webcam Integration for Concomitant Behaviours

### Purpose
Detect physical secondary behaviours (eye blinking, jaw tightening, head nodding) that accompany speech blocks using TensorFlow.js face detection models.

### Implementation

**A. Create ConcomitantMovementTracker Component**
New component with:
- Webcam video feed display
- Real-time face landmark detection using MediaPipe/TensorFlow.js
- Detection algorithms for:
  - **Eye blinks**: Track eye aspect ratio changes
  - **Jaw tension**: Monitor mouth opening/closing patterns
  - **Head movements**: Detect rapid head position changes
- Visual overlay showing detected movements
- Session summary with movement counts and timestamps

**B. Create useWebcamAnalysis Hook**
New custom hook to:
- Initialize webcam stream
- Load TensorFlow.js FaceMesh model
- Process video frames at 10-15 FPS
- Detect and log secondary behaviours
- Provide real-time metrics to UI

**C. Update TherapistAnalyticsHub**
- Add new "Physicality" tab dedicated to this feature
- Display aggregate movement statistics
- Provide clinical interpretation of concomitant patterns

**D. Database Schema Consideration**
- Store concomitant metrics in practice_sessions (new fields or JSON column)
- No immediate schema change required - use existing JSON flexibility

### Files to Create
- `src/hooks/useWebcamAnalysis.ts` - Webcam and face detection logic
- `src/components/therapist/ConcomitantMovementTracker.tsx` - UI component

### Files to Modify
- `src/pages/TherapistAnalyticsHub.tsx` - Add Physicality tab and integration

### Dependencies Note
TensorFlow.js face detection will be loaded via CDN to avoid bundle bloat. The model runs client-side for privacy.

---

## Feature 3: Acoustic Signature Analysis for Easy Onset

### Purpose
Detect the characteristic "gentle rise in volume" acoustic signature of a proper Easy Onset technique, rather than relying solely on AI inference.

### Implementation

**A. Create analyzeVolumeEnvelope Function**
New utility function to:
- Decode raw audio from base64 to AudioBuffer
- Calculate RMS (Root Mean Square) volume at sentence starts
- Detect volume rise patterns (gradual increase over 100-300ms = Easy Onset)
- Identify abrupt volume spikes (potential hard onset)

**B. Update useSpeechAnalysis Hook**
- Before sending to edge function, analyze audio locally
- Extract volume envelope data for first 500ms of each detected sentence
- Calculate Easy Onset signature matches:
  - Measure volume slope at utterance start
  - Compare to ideal Easy Onset profile (gradual 0.2-0.4s rise)
- Send volume analysis results alongside transcription

**C. Update analyze-speech Edge Function**
- Accept new `volumeAnalysis` parameter containing:
  - `sentenceOnsets`: Array of onset patterns detected
  - `easyOnsetSignatures`: Count of proper Easy Onset patterns
  - `hardOnsetSignatures`: Count of abrupt starts
- Use this data to enhance technique scoring accuracy

**D. Update TechniqueAccuracyTracker UI**
- Display "Acoustic Signature Analysis" section
- Show breakdown of detected onset patterns
- Visual waveform representation of ideal vs detected onset

### Files to Create
- `src/lib/audioAnalysis.ts` - Volume envelope analysis utilities

### Files to Modify
- `src/hooks/useSpeechAnalysis.ts` - Add volume analysis before edge function call
- `supabase/functions/analyze-speech/index.ts` - Accept and integrate volume data
- `src/components/therapist/TechniqueAccuracyTracker.tsx` - Add acoustic analysis display

---

## Technical Approach

### Volume Envelope Analysis Algorithm
```text
For each detected sentence start:
1. Extract audio samples for first 300ms
2. Calculate RMS volume in 20ms windows
3. Compute volume slope (rate of increase)
4. Classify onset:
   - Gradual rise (slope < 0.3) = Easy Onset signature
   - Moderate rise (0.3-0.6) = Partial Easy Onset
   - Abrupt rise (slope > 0.6) = Hard Onset
```

### Face Detection for Concomitants
```text
Using TensorFlow.js FaceMesh:
1. Track 468 facial landmarks at 10 FPS
2. Eye Blink Detection:
   - Calculate Eye Aspect Ratio (EAR)
   - EAR < 0.2 for >100ms = blink detected
3. Jaw Tension Detection:
   - Monitor lip distance variance
   - Rapid changes during blocks = tension indicator
4. Head Movement:
   - Track nose tip position
   - Rapid displacement during speech = secondary behaviour
```

---

## Implementation Order

1. **%SS Comparison Chart** (simplest - UI only, uses existing data)
2. **Acoustic Signature Analysis** (moderate - requires audio processing)
3. **Webcam Integration** (complex - requires TensorFlow.js and real-time video processing)

---

## Summary of Changes

| Category | Files Created | Files Modified |
|----------|---------------|----------------|
| %SS Chart | 0 | 2 |
| Webcam/Concomitant | 2 | 1 |
| Acoustic Analysis | 1 | 3 |
| **Total** | **3** | **6** |

### New Files
1. `src/hooks/useWebcamAnalysis.ts`
2. `src/components/therapist/ConcomitantMovementTracker.tsx`
3. `src/lib/audioAnalysis.ts`

### Modified Files
1. `src/components/therapist/SurfaceCommandCentre.tsx`
2. `src/components/therapist/TechniqueAccuracyTracker.tsx`
3. `src/pages/TherapistAnalyticsHub.tsx`
4. `src/hooks/useSpeechAnalysis.ts`
5. `supabase/functions/analyze-speech/index.ts`
6. `src/components/therapist/index.ts` (export new component)
