## Goal

Wire the `/session` Stammer Detector to write a row into Supabase `practice_sessions` when the user presses **Stop session**, and replace the dummy data on `/history` with real rows from that table for the signed-in user. This also makes the data visible in the Therapist Analytics dashboard, which already reads from `practice_sessions` via the existing therapist RLS policy.

## Auth precondition

`practice_sessions` RLS requires `user_id = auth.uid()`. The detector must only attempt to save when a Supabase session exists. If the user is not signed in (e.g. dev / waitlist mode), we skip the insert silently and show a toast that the session was not saved. We will not change the existing pre-launch auth gate.

## Changes

### 1. `src/hooks/useStammerDetector.ts`
- Track `sessionStartedAt: Date | null` when `startRecording` runs and clear it on reset.
- Expose `sessionStartedAt` on the hook's return value alongside `events`, `counts`, `totalEvents`, etc. (already exposed today).

### 2. New: `src/hooks/usePersistDetectorSession.ts`
A small hook that takes `{ events, counts, sessionStartedAt, environmentType, sessionContext }` and provides `saveSession()`:
- Reads `supabase.auth.getUser()`; if no user, returns `{ saved: false, reason: 'not_authenticated' }`.
- Computes:
  - `duration_seconds` = `(now - sessionStartedAt) / 1000`
  - `blocks_count`, `repetitions_count` (= REPETITION), `prolongations_count`, `interjections_count` from `counts`
  - `sound_repetitions_count` = same as REPETITION for now (best available mapping)
  - `session_date` = `sessionStartedAt.toISOString()`
- Inserts into `practice_sessions` with:
  - `user_id` = `auth.uid()`
  - `exercise_category` = `'live_session'`
  - `exercise_name` = `'Stammerly Live Session'`
  - `exercise_difficulty` = `'beginner'`
  - `environment_type` = passed-in audio profile (quiet/classroom/cafeteria/outdoor)
  - `session_context` = `'live_detector'`
  - the disfluency counts above
  - `transcript` = null (no transcript captured by this detector)
- Returns the inserted row id; toasts success / failure via `sonner`.

### 3. `src/components/StammerDetector.tsx`
- Accept new optional props: `environmentType?: string` (mirrors `defaultProfile`) and `onSessionSaved?: (id: string) => void`.
- Wrap `detector.stopRecording` in a handler that:
  1. Calls `detector.stopRecording()` (existing behavior).
  2. If `detector.totalEvents > 0` and `sessionStartedAt` exists, calls `usePersistDetectorSession.saveSession(...)`.
- Pass that wrapped handler to `<RecordButton onStop={...} />`.

### 4. `src/pages/Session.tsx`
- Pass `environmentType={audioProfile}` to `<StammerDetector>` so the saved row records the chosen environment.
- Child name + role stay in component state as today; `child_user_id` is implicit (the row's `user_id` is the signed-in user, which is the child for the kid flow).

### 5. `src/pages/History.tsx`
- Remove dummy `SESSIONS` array.
- Add a `useEffect` that fetches the most recent 50 rows for the signed-in user:
  ```ts
  supabase
    .from('practice_sessions')
    .select('id, session_date, duration_seconds, blocks_count, repetitions_count, prolongations_count, interjections_count, environment_type')
    .order('session_date', { ascending: false })
    .limit(50)
  ```
  (RLS already restricts to own rows.)
- Compute per row:
  - `totalEvents` = sum of the four count columns
  - `dominantMarker` = whichever of Block / Repetition / Prolongation / Interjection has the highest count (ties → Block)
  - `durationMin` = `Math.round(duration_seconds / 60)`
  - `date` = `new Date(session_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })`
- Render the same card list as today, plus:
  - Loading skeleton state
  - Empty state ("No sessions yet — start one from the Session tab")
  - Show `environment_type` as a small muted label next to the date

## Database

No schema changes. `practice_sessions` already has every column we need (`user_id`, `session_date`, `duration_seconds`, `blocks_count`, `repetitions_count`, `prolongations_count`, `interjections_count`, `environment_type`, `session_context`, `exercise_category`, `exercise_name`). RLS is already correct: users see/insert their own rows; assigned therapists see their patients' rows.

## What this delivers

- Pressing **Stop session** on `/session` saves the session to Supabase (when signed in).
- `/history` lists those real sessions with date, duration, total events, dominant marker badge, and environment.
- The same rows automatically appear in the Therapist Analytics dashboard for any therapist with an active `therapist_assigned_quests` link to that child — no extra wiring needed.

## Out of scope (flag for later)

- Per-event persistence into `disfluency_logs` (would let the therapist disfluency audit log drill into individual blocks). Easy follow-up: bulk-insert `events` mapped to `disfluency_logs` rows after the session insert.
- Capturing a transcript (the lightweight detector doesn't transcribe; the Whisper pipeline in `useSpeechAnalysis` does).
- Linking `child_user_id` to a separate parent account — for now the signed-in user is the owner of the row.
