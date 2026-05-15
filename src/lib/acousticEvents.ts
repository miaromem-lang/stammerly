import type { StammerEvent } from "@/hooks/useStammerDetector";

/**
 * The analyze-speech edge function caps inbound acousticEvents at 500
 * (see sanitiseAcousticEvents). Chunk on the client so we never waste
 * bandwidth shipping events the server will silently drop, and so the
 * 500 we *do* send are the most clinically informative ones.
 */
export const MAX_ACOUSTIC_EVENTS_PER_TAKE = 500;

const TYPE_PRIORITY: Record<string, number> = {
  BLOCK: 0,
  PROLONGATION: 1,
  REPETITION: 2,
  INTERJECTION: 3,
};

export interface LimitedAcousticEvents {
  events: StammerEvent[];
  total: number;
  kept: number;
  dropped: number;
  truncated: boolean;
}

/**
 * Returns at most `max` events, prioritising clinically significant types
 * (Blocks > Prolongations > Repetitions > Interjections) and, within each
 * type, the longest-duration events first.
 */
export function limitAcousticEvents(
  events: StammerEvent[] | null | undefined,
  max = MAX_ACOUSTIC_EVENTS_PER_TAKE,
): LimitedAcousticEvents {
  const safe = Array.isArray(events) ? events : [];
  const total = safe.length;
  if (total <= max) {
    return { events: safe, total, kept: total, dropped: 0, truncated: false };
  }
  const sorted = [...safe].sort((a, b) => {
    const pa = TYPE_PRIORITY[a.type] ?? 99;
    const pb = TYPE_PRIORITY[b.type] ?? 99;
    if (pa !== pb) return pa - pb;
    return (b.durationMs ?? 0) - (a.durationMs ?? 0);
  });
  const kept = sorted.slice(0, max);
  return {
    events: kept,
    total,
    kept: kept.length,
    dropped: total - kept.length,
    truncated: true,
  };
}
