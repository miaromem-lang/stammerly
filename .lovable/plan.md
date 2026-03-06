

# Implementation Plan: Gamification Safeguards, Spaced Repetition, Variable Rewards, and Clinical Enhancements

---

## 1. Streak Freeze Mechanism

**Goal**: Let parents pause a child's streak without losing progress.

**Database changes**:
- Add columns to `user_streaks` table: `streak_freeze_active BOOLEAN DEFAULT false`, `streak_freeze_until DATE`, `streak_freezes_remaining INTEGER DEFAULT 3`.

**Code changes**:
- **`src/hooks/useUserProgress.ts`**: Update `updateStreak()` logic — if `streak_freeze_active` is true and today is before `streak_freeze_until`, skip the streak-break check and preserve the current streak count. Add `activateStreakFreeze(days: number)` function.
- **`src/pages/ParentHub.tsx`**: Add a "Streak Freeze" card in the parent dashboard with a toggle/button to activate a freeze for 1-7 days. Show remaining freezes (3 per month).
- **`src/pages/KidHub.tsx`**: Display a snowflake/pause icon on the streak indicator when a freeze is active, so the child understands their streak is safe.

---

## 2. Spaced Repetition for Trigger Words

**Goal**: Strategically reintroduce mastered trigger words at increasing intervals.

**Database changes**:
- Create `spaced_repetition_items` table: `id UUID PK`, `user_id UUID NOT NULL`, `phoneme TEXT`, `word TEXT`, `exercise_id TEXT`, `ease_factor NUMERIC DEFAULT 2.5`, `interval_days INTEGER DEFAULT 1`, `next_review_date DATE DEFAULT CURRENT_DATE`, `repetition_count INTEGER DEFAULT 0`, `last_reviewed_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT now()`. RLS: users can CRUD own rows.

**Code changes**:
- **`src/hooks/useSpacedRepetition.ts`** (new): Implement SM-2 algorithm logic — after each practice, update `ease_factor` and `interval_days` based on fluency score. Fetch items due for review (`next_review_date <= today`).
- **`src/components/PersonalizedQuestMap.tsx`**: Integrate spaced repetition items into the quest recommendation list. Items due for review appear as priority "revision" quests with a distinct visual style (e.g., a refresh icon).
- **Practice flow**: After completing a practice session involving a trigger word, call the spaced repetition hook to schedule the next review.

---

## 3. Variable Reward Schedules

**Goal**: Replace static point awards with randomised, tiered rewards.

**Code changes**:
- **`src/lib/rewardEngine.ts`** (new): Create a reward generator with tiered probability:
  - 60% chance: standard reward (base gems)
  - 25% chance: bonus reward (1.5x-2x gems + special animation)
  - 10% chance: rare reward (3x gems + rare badge unlock)
  - 5% chance: jackpot (5x gems + exclusive avatar item)
- **`src/hooks/useUserProgress.ts`**: Replace the current static `addGemsAndStars()` with a call to the reward engine. Return the reward tier so the UI can show appropriate celebration.
- **`src/pages/KidHub.tsx`** and practice completion flow: Display different celebration animations based on reward tier (confetti, sparkles, rainbow explosion for jackpot). Show "You found a rare gem!" type messaging.

---

## 4. Ambient Safeguarding Triggers

**Goal**: Flag audio containing distress markers for a Clinical Safety Officer.

**Code changes**:
- **`supabase/functions/analyze-speech/index.ts`**: Add a safeguarding check to the AI prompt — instruct the model to flag if the transcript contains indicators of severe distress or harm keywords. Return a `safeguardingFlag: boolean` and `safeguardingReason: string` in the response.
- **Database**: Create `safeguarding_alerts` table: `id UUID PK`, `user_id UUID NOT NULL`, `session_id UUID`, `alert_type TEXT`, `reason TEXT`, `audio_file_path TEXT`, `status TEXT DEFAULT 'pending'`, `reviewed_by UUID`, `reviewed_at TIMESTAMPTZ`, `created_at TIMESTAMPTZ DEFAULT now()`. RLS: only users with `therapist` role can SELECT; system inserts via service role.
- **`supabase/functions/analyze-speech/index.ts`**: If safeguarding flag is triggered, insert into `safeguarding_alerts` using service role client. The flagged audio file path is stored but access is restricted.
- **`src/pages/TherapistAnalyticsHub.tsx`**: Add a safeguarding alerts panel (visible only to designated safety officers) showing pending alerts with review/dismiss actions.

---

## 5. Private Practice Billing Integration

**Goal**: Map session data to clinical diagnostic codes for invoice generation.

**Code changes**:
- **`src/components/therapist/BillingExport.tsx`** (new): Create a component that:
  - Maps practice session data to ICD-10 codes (F98.5 for stuttering, F80.0 for phonological disorder).
  - Generates a downloadable CSV/PDF invoice line item with: date, patient reference, diagnostic code, session duration, and billable amount (based on therapist's hourly rate input).
  - Uses `jspdf` (already installed) for PDF export.
- **`src/pages/TherapistHub.tsx`**: Add the BillingExport component to the therapist operational tools section.

---

## 6. Disfluency Typology Filtering on Trend Charts

**Goal**: Allow therapists to filter analytics by specific disfluency types.

**Code changes**:
- **`src/pages/TherapistAnalyticsHub.tsx`**: Add a multi-select filter component on the Fluency tab allowing therapists to isolate: blocks, prolongations, sound repetitions, syllable repetitions, word repetitions, phrase repetitions, revisions, interjections.
- The existing data fetch already retrieves all these counts from `practice_sessions`. Add a filter state that controls which disfluency types are displayed in the `SurfaceCommandCentre` breakdown chart and trend lines.
- **`src/components/therapist/SurfaceCommandCentre.tsx`**: Accept an optional `visibleTypes` prop to filter the disfluency breakdown display.
- **`src/components/ProgressCharts.tsx`**: If applicable, add typology toggle for the trend view showing individual disfluency type lines over time.

---

## Summary of Files

| Action | File |
|--------|------|
| Migration | Add columns to `user_streaks`; create `spaced_repetition_items` and `safeguarding_alerts` tables |
| Create | `src/hooks/useSpacedRepetition.ts`, `src/lib/rewardEngine.ts`, `src/components/therapist/BillingExport.tsx` |
| Edit | `src/hooks/useUserProgress.ts`, `src/pages/ParentHub.tsx`, `src/pages/KidHub.tsx`, `src/components/PersonalizedQuestMap.tsx`, `supabase/functions/analyze-speech/index.ts`, `src/pages/TherapistAnalyticsHub.tsx`, `src/components/therapist/SurfaceCommandCentre.tsx`, `src/pages/TherapistHub.tsx`, `src/components/therapist/index.ts` |

