/**
 * StammerDetector.tsx
 * ────────────────────
 * Drop-in React component for Stammerly.com
 *
 * Add to any page in your Lovable project:
 *
 *   import { StammerDetector } from '@/components/StammerDetector'
 *   // then inside your JSX:
 *   <StammerDetector />
 *
 * No external packages needed beyond what Lovable already installs.
 * Uses Tailwind CSS classes and is compatible with shadcn/ui.
 */

import { useRef, useState } from 'react'
import {
  useStammerDetector,
  type MarkerType,
  type StammerEvent,
  type AudioProfile,
} from '@/hooks/useStammerDetector'
import { usePersistDetectorSession } from '@/hooks/usePersistDetectorSession'

// ── Marker metadata ───────────────────────────────────────────────────────────

const MARKER_META: Record<MarkerType, { label: string; colour: string; bg: string; icon: string; parentTip: string }> = {
  PROLONGATION: {
    label:     'Prolongation',
    colour:    'text-blue-600',
    bg:        'bg-blue-50 border-blue-200',
    icon:      '〰',
    parentTip: 'Try gentle vocal warm-ups and slow reading tonight.',
  },
  BLOCK: {
    label:     'Block',
    colour:    'text-red-600',
    bg:        'bg-red-50 border-red-200',
    icon:      '●',
    parentTip: 'Focus on low-pressure, turn-taking conversation at dinner.',
  },
  REPETITION: {
    label:     'Repetition',
    colour:    'text-amber-600',
    bg:        'bg-amber-50 border-amber-200',
    icon:      '↩',
    parentTip: 'Pause together before tricky words — no rushing.',
  },
  INTERJECTION: {
    label:     'Interjection',
    colour:    'text-purple-600',
    bg:        'bg-purple-50 border-purple-200',
    icon:      '…',
    parentTip: 'Relaxed reading aloud can help build word confidence.',
  },
}

type ViewMode = 'child' | 'parent' | 'therapist'

// ── Main component ────────────────────────────────────────────────────────────

export interface StammerDetectorProps {
  childName?: string
  childId?: string
  defaultView?: ViewMode
  defaultProfile?: AudioProfile | 'auto'
  environmentType?: string
  onSessionSaved?: (id: string) => void
}

export function StammerDetector({
  childName: childNameProp = 'Leo',
  childId = 'child_001',
  defaultView = 'parent',
  defaultProfile = 'quiet',
  environmentType,
  onSessionSaved,
}: StammerDetectorProps = {}) {
  const [view, setView] = useState<ViewMode>(defaultView)
  const [childName] = useState(childNameProp)
  const { saveSession } = usePersistDetectorSession()
  const [saveStatus, setSaveStatus] = useState<
    | { state: 'idle' }
    | { state: 'saving' }
    | { state: 'saved'; id: string; total: number }
    | { state: 'skipped'; reason: string }
    | { state: 'error'; message: string }
  >({ state: 'idle' })

  const detector = useStammerDetector({
    childId,
    audioProfile: defaultProfile,
    onEvent: (e) => {
      console.log('[Stammerly event]', e.type, e.detail, `conf=${e.confidence.toFixed(2)}`)
    },
  })

  const handleStop = async () => {
    const counts = detector.events.reduce(
      (acc, e) => ({ ...acc, [e.type]: (acc[e.type] ?? 0) + 1 }),
      {} as Partial<Record<MarkerType, number>>
    )
    const total = detector.events.length
    const sessionStart = detector.sessionStart
    detector.stopRecording()
    if (!sessionStart) {
      setSaveStatus({ state: 'skipped', reason: 'No session start recorded.' })
      return
    }
    setSaveStatus({ state: 'saving' })
    try {
      const result = await saveSession({
        counts,
        sessionStart,
        environmentType: environmentType ?? (typeof defaultProfile === 'string' ? defaultProfile : 'quiet'),
      })
      if (result.saved && result.id) {
        setSaveStatus({ state: 'saved', id: result.id, total })
        onSessionSaved?.(result.id)
      } else if (result.reason === 'not_authenticated') {
        setSaveStatus({ state: 'skipped', reason: 'Sign in to sync this session to therapist analytics.' })
      } else {
        setSaveStatus({ state: 'error', message: result.reason ?? 'Unknown error saving session.' })
      }
    } catch (err) {
      setSaveStatus({ state: 'error', message: err instanceof Error ? err.message : 'Unexpected error.' })
    }
  }

  const dismissStatus = () => setSaveStatus({ state: 'idle' })


  return (
    <div className="w-full max-w-2xl mx-auto font-sans">

      {/* ── Header ── */}
      <div className="flex items-center gap-3 pb-4 border-b border-gray-100 mb-5 flex-wrap">
        <span className="text-base font-medium text-gray-900 flex items-center gap-1.5">
          🎙 Stammerly
        </span>

        {/* View tabs */}
        <div className="flex gap-1.5 flex-1 overflow-x-auto sm:overflow-visible -mx-1 px-1 sm:mx-0 sm:px-0 snap-x">
          {(['child', 'parent', 'therapist'] as ViewMode[]).map(v => (
            <button
              key={v}
              onClick={() => setView(v)}
              className={`shrink-0 snap-start px-3 py-1 text-sm rounded-lg border transition-colors ${
                view === v
                  ? 'bg-gray-100 border-gray-300 text-gray-900 font-medium'
                  : 'border-gray-200 text-gray-500 hover:bg-gray-50'
              }`}
            >
              {v === 'child' ? '🐣' : v === 'parent' ? '🏠' : '🩺'} {v.charAt(0).toUpperCase() + v.slice(1)}
            </button>
          ))}
        </div>

        {/* Record button */}
        <RecordButton
          isRecording={detector.isRecording}
          onStart={detector.startRecording}
          onStop={handleStop}
        />
      </div>

      {/* ── Error banner ── */}
      {detector.error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {detector.error}
        </div>
      )}

      {/* ── Save status banner ── */}
      {saveStatus.state !== 'idle' && (
        <div
          role="status"
          aria-live="polite"
          className={`mb-4 p-3 rounded-lg border text-sm flex items-start gap-2 ${
            saveStatus.state === 'saving'
              ? 'bg-blue-50 border-blue-200 text-blue-700'
              : saveStatus.state === 'saved'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
              : saveStatus.state === 'skipped'
              ? 'bg-amber-50 border-amber-200 text-amber-700'
              : 'bg-red-50 border-red-200 text-red-700'
          }`}
        >
          <span className="mt-0.5">
            {saveStatus.state === 'saving' && (
              <span className="inline-block w-3.5 h-3.5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
            )}
            {saveStatus.state === 'saved' && '✓'}
            {saveStatus.state === 'skipped' && 'ⓘ'}
            {saveStatus.state === 'error' && '⚠'}
          </span>
          <div className="flex-1">
            {saveStatus.state === 'saving' && <span>Saving session to therapist analytics…</span>}
            {saveStatus.state === 'saved' && (
              <span>
                Session saved — {saveStatus.total} event{saveStatus.total === 1 ? '' : 's'} synced to therapist analytics.
              </span>
            )}
            {saveStatus.state === 'skipped' && <span>{saveStatus.reason}</span>}
            {saveStatus.state === 'error' && (
              <span>Couldn't save to analytics: {saveStatus.message}</span>
            )}
          </div>
          {saveStatus.state !== 'saving' && (
            <button
              onClick={dismissStatus}
              className="text-xs opacity-60 hover:opacity-100 px-1"
              aria-label="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* ── Views ── */}
      {view === 'child'     && <ChildView     name={childName} detector={detector} />}
      {view === 'parent'    && <ParentView    name={childName} detector={detector} />}
      {view === 'therapist' && <TherapistView name={childName} detector={detector} />}
    </div>
  )
}

// ── Record button ─────────────────────────────────────────────────────────────

function RecordButton({ isRecording, onStart, onStop }: {
  isRecording: boolean
  onStart: () => void
  onStop:  () => void
}) {
  return (
    <button
      onClick={isRecording ? onStop : onStart}
      className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg border transition-all ${
        isRecording
          ? 'border-red-400 text-red-600 hover:bg-red-50'
          : 'border-gray-300 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {isRecording ? (
        <>
          <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          Stop session
        </>
      ) : (
        <>
          <span className="w-2 h-2 rounded-full bg-gray-400" />
          Start session
        </>
      )}
    </button>
  )
}

// ── Stat card ─────────────────────────────────────────────────────────────────

function StatCard({ label, value, colour }: { label: string; value: string | number; colour?: string }) {
  return (
    <div className="bg-gray-50 rounded-xl p-3">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-medium ${colour ?? 'text-gray-900'}`}>{value}</p>
    </div>
  )
}

// ── Event feed item ───────────────────────────────────────────────────────────

function EventItem({ event }: { event: StammerEvent }) {
  const meta = MARKER_META[event.type]
  return (
    <div className="flex items-center gap-2 py-1.5 border-b border-gray-100 last:border-0 text-sm">
      <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${meta.bg} ${meta.colour}`}>
        {meta.label}
      </span>
      <span className="text-gray-500 text-xs">{event.detail}</span>
      <span className="text-gray-400 text-xs ml-auto">
        {event.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
      </span>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// CHILD VIEW — Ziggy the pet + gamification
// ─────────────────────────────────────────────────────────────────────────────

function ChildView({ name, detector }: { name: string; detector: ReturnType<typeof useStammerDetector> }) {
  const xp    = Math.min(100, detector.totalEvents * 8)
  const happy = !detector.isRecording || detector.totalEvents < 3

  return (
    <div>
      {/* Pet avatar */}
      <div className="flex flex-col items-center py-6">
        <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-3 transition-colors ${
          detector.isRecording ? 'bg-green-100' : 'bg-blue-50'
        }`}>
          {happy ? '👻' : '⭐'}
        </div>
        <p className="text-base font-medium text-gray-900">
          {detector.isRecording ? `${name} is speaking!` : 'Ziggy is ready!'}
        </p>
        <p className="text-sm text-gray-500 mt-1">
          {detector.isRecording
            ? 'Great job — keep going!'
            : 'Press start session to begin your speaking adventure'}
        </p>

        {/* XP bar */}
        <div className="w-full max-w-xs mt-4">
          <div className="flex justify-between text-xs text-gray-400 mb-1">
            <span>Today's XP</span>
            <span>{xp} / 100</span>
          </div>
          <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 rounded-full transition-all duration-500"
              style={{ width: `${xp}%` }}
            />
          </div>
        </div>
      </div>

      {/* Challenge card */}
      <div className="bg-gray-50 rounded-2xl p-4 text-center max-w-sm mx-auto mb-4">
        <p className="text-2xl mb-2">🏆</p>
        <p className="text-sm font-medium text-gray-900 mb-1.5">Today's challenge</p>
        <p className="text-sm text-gray-500">
          {detector.dominantMarker === 'BLOCK'
            ? 'Try breathing slowly before your next words — you can do it!'
            : detector.dominantMarker === 'REPETITION'
            ? 'Pausing before tricky words is a superpower. Practise it!'
            : 'Take your time with each word — slow and steady wins the race!'}
        </p>
      </div>

      {/* Badges */}
      {detector.totalEvents > 0 && (
        <div className="flex justify-center gap-4 mb-4">
          {[
            { show: true,                         emoji: '🎤', label: 'Speaker' },
            { show: detector.totalEvents >= 5,    emoji: '🌟', label: 'Star'    },
            { show: xp >= 50,                     emoji: '🏅', label: 'Brave'   },
          ].filter(b => b.show).map(b => (
            <div key={b.label} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center text-lg">
                {b.emoji}
              </div>
              <span className="text-xs text-gray-500">{b.label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Live feed — friendly version */}
      {detector.events.length > 0 && (
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Ziggy noticed…</p>
          <div className="border border-gray-100 rounded-xl overflow-hidden divide-y divide-gray-100 max-h-36 overflow-y-auto">
            {detector.events.slice(0, 8).map(e => (
              <div key={e.id} className="flex items-center gap-2 px-3 py-2 text-sm">
                <span>{MARKER_META[e.type].icon}</span>
                <span className="text-gray-700">{MARKER_META[e.type].label}</span>
                <span className="text-gray-400 text-xs ml-auto">
                  {e.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// PARENT VIEW — plain English summaries
// ─────────────────────────────────────────────────────────────────────────────

function ParentView({ name, detector }: { name: string; detector: ReturnType<typeof useStammerDetector> }) {
  const top = detector.dominantMarker
  const tipText = top ? MARKER_META[top].parentTip : null

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <StatCard label="Events today"  value={detector.totalEvents || '—'} />
        <StatCard label="Most common"   value={top ? MARKER_META[top].label : '—'} />
        <StatCard label="Rate / min"    value={detector.eventsPerMin > 0 ? detector.eventsPerMin : '—'} />
        <StatCard label="Blocks"        value={detector.counts.BLOCK ?? 0} colour="text-red-600" />
      </div>

      {/* Marker breakdown */}
      <div className="mb-5">
        <p className="text-sm font-medium text-gray-700 mb-2.5">Session breakdown</p>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(MARKER_META) as MarkerType[]).map(mk => {
            const count = detector.counts[mk] ?? 0
            const pct   = detector.totalEvents > 0 ? (count / detector.totalEvents) * 100 : 0
            const meta  = MARKER_META[mk]
            return (
              <div key={mk} className={`p-3 rounded-xl border ${meta.bg}`}>
                <div className="flex justify-between items-start mb-1.5">
                  <span className={`text-xs font-medium ${meta.colour}`}>{meta.label}</span>
                  <span className={`text-lg font-medium ${meta.colour}`}>{count}</span>
                </div>
                <div className="w-full h-1.5 bg-white rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      mk === 'BLOCK' ? 'bg-red-400' :
                      mk === 'REPETITION' ? 'bg-amber-400' :
                      mk === 'PROLONGATION' ? 'bg-blue-400' : 'bg-purple-400'
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Insight */}
      {detector.totalEvents > 0 ? (
        <div className="space-y-2.5">
          {(detector.counts.BLOCK ?? 0) > 2 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100">
              <p className="text-sm font-medium text-red-700 mb-0.5">High-tension blocks detected</p>
              <p className="text-sm text-gray-600">
                {name} had {detector.counts.BLOCK} blocking moments. These often peak during structured speaking — try relaxed reading together tonight.
              </p>
            </div>
          )}
          {(detector.counts.REPETITION ?? 0) > (detector.counts.BLOCK ?? 0) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-sm font-medium text-amber-700 mb-0.5">Repetitions were the main pattern</p>
              <p className="text-sm text-gray-600">
                Repetitions often increase when a child feels excited or rushed. No-pressure conversation works well.
              </p>
            </div>
          )}
          {tipText && (
            <div className="p-3 rounded-xl bg-blue-50 border border-blue-100">
              <p className="text-sm font-medium text-blue-700 mb-0.5">Tonight's suggestion</p>
              <p className="text-sm text-gray-600">{tipText}</p>
            </div>
          )}
          <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
            <p className="text-xs text-gray-500">
              🔒 No audio was recorded or stored. Only event metadata (type, duration, timestamp) is logged locally.
            </p>
          </div>
        </div>
      ) : (
        <div className="p-4 rounded-xl bg-gray-50 text-center">
          <p className="text-sm text-gray-500">Start a session to see personalised insights for {name}.</p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// THERAPIST VIEW — full clinical detail
// ─────────────────────────────────────────────────────────────────────────────

function TherapistView({ name, detector }: { name: string; detector: ReturnType<typeof useStammerDetector> }) {
  const exportCSV = () => {
    if (!detector.events.length) return
    const rows = [
      'timestamp,type,confidence,duration_ms,detail',
      ...detector.events.map(e =>
        `${e.timestamp.toISOString()},${e.type},${e.confidence.toFixed(3)},${e.durationMs},"${e.detail}"`
      ),
    ]
    const a  = document.createElement('a')
    a.href   = URL.createObjectURL(new Blob([rows.join('\n')], { type: 'text/csv' }))
    a.download = `stammerly_${name}_${new Date().toISOString().slice(0, 10)}.csv`
    a.click()
  }

  return (
    <div>
      {/* Stat cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5">
        <StatCard label="Prolongations" value={detector.counts.PROLONGATION ?? 0} colour="text-blue-600" />
        <StatCard label="Blocks"        value={detector.counts.BLOCK        ?? 0} colour="text-red-600"  />
        <StatCard label="Repetitions"   value={detector.counts.REPETITION   ?? 0} colour="text-amber-600" />
        <StatCard label="Interjections" value={detector.counts.INTERJECTION ?? 0} colour="text-purple-600" />
      </div>

      {/* Rate metrics */}
      {detector.totalEvents > 0 && (
        <div className="grid grid-cols-3 gap-2.5 mb-5">
          <StatCard label="Total events"  value={detector.totalEvents} />
          <StatCard label="Events / min"  value={detector.eventsPerMin} />
          <StatCard label="Dominant type" value={detector.dominantMarker ? MARKER_META[detector.dominantMarker].label : '—'} />
        </div>
      )}

      {/* Clinical notes */}
      {detector.totalEvents > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-sm font-medium text-gray-700">AI pattern analysis</p>
          {(detector.counts.BLOCK ?? 0) > 2 && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-800">
              {detector.counts.BLOCK} blocks detected — consider reviewing diaphragmatic breath-support and easy onset technique in the next session.
            </div>
          )}
          {(detector.counts.REPETITION ?? 0) > (detector.counts.BLOCK ?? 0) && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-100 text-sm text-amber-800">
              Repetitions ({detector.counts.REPETITION}) exceed blocks ({detector.counts.BLOCK ?? 0}) — pattern consistent with anticipatory anxiety rather than motor block. Consider pull-out techniques.
            </div>
          )}
          {(detector.counts.INTERJECTION ?? 0) > 3 && (
            <div className="p-3 rounded-xl bg-purple-50 border border-purple-100 text-sm text-purple-800">
              High interjection count ({detector.counts.INTERJECTION}) — may indicate avoidance strategy. Discuss word substitution awareness in therapy.
            </div>
          )}
        </div>
      )}

      {/* Event log */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <p className="text-sm font-medium text-gray-700">Event log</p>
          {detector.events.length > 0 && (
            <button
              onClick={exportCSV}
              className="text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded-lg px-2.5 py-1 transition-colors"
            >
              ↓ Export CSV
            </button>
          )}
        </div>

        <div className="border border-gray-100 rounded-xl overflow-hidden max-h-56 overflow-y-auto">
          {detector.events.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">
              No events yet — start a session
            </p>
          ) : (
            <div className="divide-y divide-gray-50">
              {detector.events.map(e => <EventItem key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </div>

      {/* Confidence legend */}
      <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
        <p className="text-xs font-medium text-gray-600 mb-1.5">Detection method reference</p>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-gray-500">
          <span>🔵 Prolongation — pitch stability (audio)</span>
          <span>🔴 Block — silence window (audio)</span>
          <span>🟡 Repetition — transcript analysis</span>
          <span>🟣 Interjection — filler word match</span>
        </div>
      </div>
    </div>
  )
}
