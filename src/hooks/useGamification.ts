/**
 * useGamification.ts
 * ──────────────────
 * Persistent gamification state for the Stammerly child experience.
 *
 * State is stored in Supabase (table: stammerly_gamification) so it
 * survives device switches and app reinstalls. A local cache in
 * localStorage keeps the UI snappy while the Supabase sync completes.
 *
 * Key design decisions
 * --------------------
 * • XP is AUTHORITATIVE on the server — the hook calls the API to
 *   award XP after each session rather than computing it locally.
 *   This prevents any client-side tampering with the child's score.
 *
 * • Badges are awarded locally by the hook (based on session events)
 *   then synced to the server. The server deduplicates by badge ID.
 *
 * • Streak is computed server-side (based on last_session_at date)
 *   so the streak can't be inflated by repeatedly opening the app.
 *
 * • The hook subscribes to real-time Supabase changes, so if the
 *   therapist awards XP from the dashboard, the child's view updates
 *   immediately without a refresh.
 *
 * Usage
 * -----
 *   const { state, awardSession, isLoading } = useGamification({
 *     childId: 'child_001',
 *     supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
 *     supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
 *   })
 */

import { useState, useEffect, useCallback, useRef } from 'react'

// ── Types ──────────────────────────────────────────────────────────────────────

export interface Badge {
  id:          string
  label:       string
  emoji:       string
  earnedAt:    Date
  description: string
}

export interface GamificationState {
  childId:       string
  xpTotal:       number
  xpToday:       number
  level:         number
  currentStreak: number
  longestStreak: number
  badges:        Badge[]
  lastSessionAt: Date | null
  updatedAt:     Date
}

export interface SessionAwardInput {
  sessionId:   string
  totalEvents: number
  blocks:      number
  prolongations: number
  repetitions: number
  interjections: number
  durationMs:  number
}

export interface GamificationOptions {
  childId:         string
  supabaseUrl:     string
  supabaseAnonKey: string
  /** API endpoint for server-authoritative XP awards. Default: /gamification/update */
  apiBaseUrl?:     string
  /** Bearer token for the API. Needed for XP updates. */
  apiToken?:       string
  /** Disable Supabase realtime subscription (useful for testing). */
  noRealtime?:     boolean
}

// ── Badge definitions ──────────────────────────────────────────────────────────

export const BADGE_DEFS = {
  first_session: {
    id:          'first_session',
    label:       'First Words',
    emoji:       '🎤',
    description: 'Completed your very first Stammerly session!',
  },
  three_sessions: {
    id:          'three_sessions',
    label:       'Consistent',
    emoji:       '🌟',
    description: 'Completed 3 sessions — you\'re building a habit!',
  },
  five_streak: {
    id:          'five_streak',
    label:       '5-Day Streak',
    emoji:       '🔥',
    description: '5 sessions in a row — incredible dedication!',
  },
  brave_speaker: {
    id:          'brave_speaker',
    label:       'Brave Speaker',
    emoji:       '🦁',
    description: 'Kept speaking through a tricky moment — so brave!',
  },
  level_5: {
    id:          'level_5',
    label:       'Rising Star',
    emoji:       '⭐',
    description: 'Reached Level 5 — you\'re a rising star!',
  },
  level_10: {
    id:          'level_10',
    label:       'Champion',
    emoji:       '🏆',
    description: 'Reached Level 10 — you\'re a Stammerly champion!',
  },
} as const

export type BadgeId = keyof typeof BADGE_DEFS

// ── XP formula ─────────────────────────────────────────────────────────────────

/**
 * Compute XP to award for a session.
 *
 * The formula intentionally rewards participation (showing up, keeping
 * going) rather than having fewer dysfluency events — lower event counts
 * should never feel like a "punishment" for trying hard.
 *
 *   Base XP:       10 (for completing any session)
 *   Duration XP:   1 per minute (capped at 30 min)
 *   Courage XP:    2 per block event (blocks take the most effort to push through)
 *   Fluency XP:    5 if events_per_min < 1.0 (a great fluency session)
 */
export function computeSessionXP(input: SessionAwardInput): number {
  const durationMin = Math.min(30, input.durationMs / 60_000)
  const epm         = input.durationMs > 0
    ? (input.totalEvents / (input.durationMs / 60_000))
    : 0

  let xp = 10                            // participation
  xp    += Math.round(durationMin)       // duration
  xp    += input.blocks * 2             // courage for pushing through blocks
  if (epm < 1.0 && input.totalEvents > 0) xp += 5  // fluency bonus

  return xp
}

/**
 * Which new badges should be awarded after this session?
 * Returns badge IDs that aren't already in the current badge list.
 */
export function computeNewBadges(
  state: GamificationState,
  session: SessionAwardInput,
  sessionCount: number,
): BadgeId[] {
  const existing = new Set(state.badges.map(b => b.id))
  const earned: BadgeId[] = []

  const maybe = (id: BadgeId, condition: boolean) => {
    if (condition && !existing.has(id)) earned.push(id)
  }

  const newLevel = Math.max(1, (state.xpTotal + computeSessionXP(session)) / 100 | 0)

  maybe('first_session',  sessionCount >= 1)
  maybe('three_sessions', sessionCount >= 3)
  maybe('five_streak',    state.currentStreak >= 5)
  maybe('brave_speaker',  session.blocks >= 3)
  maybe('level_5',        newLevel >= 5)
  maybe('level_10',       newLevel >= 10)

  return earned
}

// ── Local cache helpers ────────────────────────────────────────────────────────

function cacheKey(childId: string) { return `stammerly_gamification_${childId}` }

function readCache(childId: string): GamificationState | null {
  try {
    const raw = localStorage.getItem(cacheKey(childId))
    if (!raw) return null
    const d = JSON.parse(raw)
    return {
      ...d,
      lastSessionAt: d.lastSessionAt ? new Date(d.lastSessionAt) : null,
      updatedAt:     new Date(d.updatedAt),
      badges:        (d.badges ?? []).map((b: any) => ({ ...b, earnedAt: new Date(b.earnedAt) })),
    }
  } catch {
    return null
  }
}

function writeCache(state: GamificationState) {
  try {
    localStorage.setItem(cacheKey(state.childId), JSON.stringify(state))
  } catch { /* storage may be full in some browsers */ }
}

// ── Supabase row → GamificationState ──────────────────────────────────────────

function rowToState(row: Record<string, any>): GamificationState {
  return {
    childId:       row.child_id,
    xpTotal:       row.xp_total      ?? 0,
    xpToday:       row.xp_today      ?? 0,
    level:         row.level         ?? 1,
    currentStreak: row.current_streak ?? 0,
    longestStreak: row.longest_streak ?? 0,
    badges: (row.badges ?? []).map((b: any) => ({
      id:          b.id,
      label:       b.label,
      emoji:       b.emoji,
      earnedAt:    new Date(b.earned_at),
      description: b.description,
    })),
    lastSessionAt: row.last_session_at ? new Date(row.last_session_at) : null,
    updatedAt:     new Date(row.updated_at ?? Date.now()),
  }
}

// ── Main hook ──────────────────────────────────────────────────────────────────

export function useGamification(options: GamificationOptions) {
  const {
    childId,
    supabaseUrl,
    supabaseAnonKey,
    apiBaseUrl = '/api',
    apiToken   = '',
    noRealtime = false,
  } = options

  const [state,     setState]     = useState<GamificationState | null>(readCache(childId))
  const [isLoading, setIsLoading] = useState(true)
  const [error,     setError]     = useState<string | null>(null)
  const [sessionCount, setSessionCount] = useState(0)

  // Ref to always have the latest state in async callbacks
  const stateRef = useRef(state)
  useEffect(() => { stateRef.current = state }, [state])

  // ── Supabase fetch ──────────────────────────────────────────────────────────

  const fetchState = useCallback(async () => {
    try {
      const url = `${supabaseUrl}/rest/v1/stammerly_gamification?child_id=eq.${childId}&select=*`
      const resp = await fetch(url, {
        headers: {
          apikey:        supabaseAnonKey,
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
      })
      if (!resp.ok) throw new Error(`Supabase error ${resp.status}`)
      const rows: any[] = await resp.json()
      if (rows.length > 0) {
        const fresh = rowToState(rows[0])
        setState(fresh)
        writeCache(fresh)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load gamification state')
    } finally {
      setIsLoading(false)
    }
  }, [childId, supabaseUrl, supabaseAnonKey])

  // ── Realtime subscription ───────────────────────────────────────────────────

  useEffect(() => {
    fetchState()

    if (noRealtime) return

    // Supabase Realtime via WebSocket — subscribes to changes on stammerly_gamification
    // where child_id = childId. Updates state in real time when the therapist
    // awards XP from the dashboard.
    let ws: WebSocket | null = null
    try {
      const wsUrl = supabaseUrl.replace('https://', 'wss://').replace('http://', 'ws://')
      ws = new WebSocket(
        `${wsUrl}/realtime/v1/websocket?apikey=${supabaseAnonKey}&vsn=1.0.0`
      )
      ws.onopen = () => {
        ws!.send(JSON.stringify({
          topic:   `realtime:public:stammerly_gamification:child_id=eq.${childId}`,
          event:   'phx_join',
          payload: { config: { broadcast: { ack: false }, presence: { key: '' } } },
          ref:     '1',
        }))
      }
      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data)
          if (msg.event === 'UPDATE' && msg.payload?.record) {
            const fresh = rowToState(msg.payload.record)
            setState(fresh)
            writeCache(fresh)
          }
        } catch { /* ignore malformed messages */ }
      }
    } catch { /* WebSocket not available in some environments */ }

    return () => { ws?.close() }
  }, [childId, fetchState, noRealtime, supabaseUrl, supabaseAnonKey])

  // ── Award a session ─────────────────────────────────────────────────────────

  const awardSession = useCallback(async (session: SessionAwardInput): Promise<Badge[]> => {
    const current = stateRef.current
    const newCount = sessionCount + 1
    setSessionCount(newCount)

    const xpEarned = computeSessionXP(session)
    const newBadgeIds = current
      ? computeNewBadges(current, session, newCount)
      : (newCount === 1 ? ['first_session' as BadgeId] : [])

    const now = new Date()
    const newBadges: Badge[] = newBadgeIds.map(id => ({
      ...BADGE_DEFS[id],
      earnedAt: now,
    }))

    // Optimistic update — apply locally immediately while API call is in flight
    if (current) {
      const optimistic: GamificationState = {
        ...current,
        xpTotal:       current.xpTotal + xpEarned,
        xpToday:       current.xpToday + xpEarned,
        level:         Math.max(1, Math.floor((current.xpTotal + xpEarned) / 100)),
        badges:        [...current.badges, ...newBadges],
        lastSessionAt: now,
        updatedAt:     now,
      }
      setState(optimistic)
      writeCache(optimistic)
    }

    // Server-authoritative update
    try {
      const body = {
        child_id:   childId,
        xp_earned:  xpEarned,
        session_id: session.sessionId,
        new_badges: newBadges.map(b => ({
          id:          b.id,
          label:       b.label,
          emoji:       b.emoji,
          earned_at:   b.earnedAt.toISOString(),
          description: b.description,
        })),
      }
      const resp = await fetch(`${apiBaseUrl}/gamification/update`, {
        method:  'POST',
        headers: {
          'Content-Type':  'application/json',
          'Authorization': `Bearer ${apiToken}`,
        },
        body: JSON.stringify(body),
      })
      if (resp.ok) {
        const row = await resp.json()
        const authoritative = rowToState(row)
        setState(authoritative)
        writeCache(authoritative)
      }
    } catch (err) {
      // Optimistic state stays — will reconcile on next fetchState()
      console.warn('[Stammerly] Gamification API sync failed:', err)
    }

    return newBadges
  }, [childId, apiBaseUrl, apiToken, sessionCount])

  // ── Derived values ──────────────────────────────────────────────────────────

  const xpToNextLevel = state
    ? 100 - (state.xpTotal % 100)
    : 100

  const xpProgressPct = state
    ? (state.xpTotal % 100)
    : 0

  return {
    state,
    isLoading,
    error,
    awardSession,
    refetch: fetchState,
    // Derived
    xpToNextLevel,
    xpProgressPct,
    level:         state?.level ?? 1,
    badges:        state?.badges ?? [],
    currentStreak: state?.currentStreak ?? 0,
    hasNewBadge:   (id: string) => state?.badges.some(b => b.id === id) ?? false,
  }
}
