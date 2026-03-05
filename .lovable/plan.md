

## Micro-Level Audio Playback for Therapist Disfluency Verification

### Problem
Currently, audio recordings from practice sessions are processed and discarded -- they are never stored. Therapists cannot audit the AI's disfluency assessments against the actual audio, breaking the Hybrid Intelligence verification loop.

### Architecture Overview

This feature requires three layers: **storage** (persisting audio clips), **backend** (secure retrieval), and **frontend** (playback UI in the Clinical Analytics Hub).

```text
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│  Kid records  │────▶│ transcribe-speech │────▶│  Storage Bucket     │
│  practice     │     │ (saves full audio)│     │  "session-audio"    │
│  session      │     └──────────────────┘     │  /{user_id}/{sid}   │
└──────────────┘                               └─────────┬───────────┘
                                                         │
         ┌───────────────────────────────────────────────┘
         ▼
┌────────────────────────┐     ┌──────────────────────────────┐
│ Therapist Analytics Hub│────▶│ Disfluency click → fetch     │
│ (disfluency events     │     │ signed URL for time range    │
│  become clickable)     │     │ → <audio> with currentTime   │
└────────────────────────┘     └──────────────────────────────┘
```

### Plan

#### 1. Create Storage Bucket (migration)
- Create a private `session-audio` storage bucket.
- RLS policies: users can upload their own audio; therapists with an active assignment (`therapist_assigned_quests`) can read their patients' audio.
- Add `audio_file_path` column to `practice_sessions` table to store the storage path.

#### 2. Modify `transcribe-speech` Edge Function
- After successful transcription, upload the audio blob to `session-audio/{user_id}/{session_id}.webm`.
- Return the `audio_file_path` in the response so the client can save it to `practice_sessions`.

#### 3. Update `useSpeechAnalysis` hook
- After transcription returns, store the `audio_file_path` value so it can be saved alongside the practice session record.

#### 4. Create `AudioClipPlayer` component
- A small, secure playback widget that:
  - Accepts a `sessionId`, `audioFilePath`, and a `startTimeMs`/`endTimeMs` for the disfluency event.
  - Fetches a signed URL from storage (via the Supabase client `createSignedUrl`).
  - Renders an `<audio>` element that seeks to the disfluency timestamp and plays only the isolated segment.
  - Shows waveform context (word, type, severity) alongside playback controls.

#### 5. Integrate into Therapist Analytics Hub
- In the disfluency event displays (Surface Command Centre stutter type breakdown, Phoneme Trigger Heatmap), make flagged disfluency events clickable.
- On click, open a dialog/popover containing the `AudioClipPlayer` positioned at that event's timestamp.
- Only render playback controls when `audio_file_path` exists on the session.

#### 6. Add Disfluency Event List component
- New `DisfluencyAuditLog` component showing a table of flagged disfluency events for the selected patient, with columns: word, type, severity, timestamp, and a play button.
- Add as a new section/tab in the Therapist Analytics Hub (e.g., under the Fluency tab).

### Security Considerations
- Storage bucket is **private** -- no public access.
- Signed URLs expire after 60 seconds.
- Therapist access is gated through `therapist_assigned_quests` relationship check in RLS.
- Audio files are keyed by `user_id` to prevent path traversal.
- The `disfluency_logs` table already has RLS; therapist read access will need a new policy mirroring the `practice_sessions` pattern via `therapist_assigned_quests`.

### Files to Create/Edit
- **Migration SQL**: storage bucket, `audio_file_path` column, RLS policies on `storage.objects` and `disfluency_logs` for therapist access
- **`supabase/functions/transcribe-speech/index.ts`**: add audio upload to storage
- **`src/hooks/useSpeechAnalysis.ts`**: propagate `audio_file_path`
- **`src/components/therapist/AudioClipPlayer.tsx`** (new): secure playback widget
- **`src/components/therapist/DisfluencyAuditLog.tsx`** (new): clickable event list
- **`src/components/therapist/index.ts`**: export new components
- **`src/pages/TherapistAnalyticsHub.tsx`**: integrate audit log into Fluency tab

