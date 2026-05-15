import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
// `syllable` (npm) uses a CMU-pronouncing-dictionary-derived algorithm
// (Frank Liang's hyphenation patterns + curated overrides) and is far more
// accurate than vowel-group heuristics, especially for irregular English
// words ("queue" = 1, "fire" = 1, "every" = 2, "people" = 2).
import { syllable as syllableLib } from 'https://esm.sh/syllable@5.0.1';

// Allowed origins for CORS
const allowedOrigins = [
  'https://id-preview--d0edb71f-4882-40ab-b574-d207ca05f86d.lovable.app',
  'https://hiigdwgdfuabgjiiapid.supabase.co',
  'http://localhost:5173',
  'http://localhost:8080'
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') || '';
  const allowedOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Credentials': 'true'
  };
}

interface WordTiming {
  word: string;
  start: number;
  end: number;
  duration: number;
}

interface Segment {
  id?: number | null;
  start: number;
  end: number;
  text?: string;
}

interface DisfluencyLog {
  type: string;
  category: 'SLD' | 'OD';
  word: string;
  phoneme?: string;
  severity: string;
  durationMs?: number;
  positionInWord?: string;
  timestampInSession?: number;
  suggestion?: string;
}

interface PhonemeTrigger {
  phoneme: string;
  count: number;
  avgDurationMs: number;
  words: string[];
}

// Mirror of the browser-side StammerEvent emitted by useStammerDetector.
// `timestamp` may arrive as ISO string after JSON serialisation.
type AcousticMarkerType = 'PROLONGATION' | 'BLOCK' | 'REPETITION' | 'INTERJECTION';
interface AcousticEvent {
  id: string;
  type: AcousticMarkerType;
  confidence: number;   // 0–1
  durationMs: number;
  timestamp: string | number | Date;
  detail: string;
}

// Sanitise the events array coming from the client. Anything malformed is
// dropped silently — the LLM and downstream metrics should never see junk.
function sanitiseAcousticEvents(raw: unknown): AcousticEvent[] {
  if (!Array.isArray(raw)) return [];
  const allowed: AcousticMarkerType[] = ['PROLONGATION', 'BLOCK', 'REPETITION', 'INTERJECTION'];
  const out: AcousticEvent[] = [];
  for (const item of raw.slice(0, 500)) {
    if (!item || typeof item !== 'object') continue;
    const e = item as Record<string, unknown>;
    if (typeof e.type !== 'string' || !allowed.includes(e.type as AcousticMarkerType)) continue;
    const durationMs = typeof e.durationMs === 'number' && isFinite(e.durationMs)
      ? Math.max(0, Math.min(60_000, e.durationMs)) : 0;
    const confidence = typeof e.confidence === 'number' && isFinite(e.confidence)
      ? Math.max(0, Math.min(1, e.confidence)) : 0.5;
    out.push({
      id: typeof e.id === 'string' ? e.id : crypto.randomUUID(),
      type: e.type as AcousticMarkerType,
      confidence,
      durationMs,
      timestamp: (e.timestamp as string | number | Date) ?? new Date().toISOString(),
      detail: typeof e.detail === 'string' ? e.detail.slice(0, 240) : '',
    });
  }
  return out;
}

// Map a browser acoustic event to a DisfluencyLog so it appears in the
// merged disfluency timeline alongside transcript-derived patterns.
function acousticEventToDisfluency(ev: AcousticEvent): DisfluencyLog {
  const typeMap: Record<AcousticMarkerType, { type: string; category: 'SLD' | 'OD' }> = {
    BLOCK:        { type: 'Block',        category: 'SLD' },
    PROLONGATION: { type: 'Prolongation', category: 'SLD' },
    REPETITION:   { type: 'SoundRepetition', category: 'SLD' },
    INTERJECTION: { type: 'Interjection', category: 'OD' },
  };
  const { type, category } = typeMap[ev.type];
  const severity = ev.durationMs > 1000 ? 'severe'
    : ev.durationMs > 500 ? 'moderate' : 'mild';
  return {
    type,
    category,
    word: ev.detail || `(acoustic ${ev.type.toLowerCase()})`,
    severity,
    durationMs: ev.durationMs,
    suggestion: 'Detected acoustically by the live microphone analyser',
  };
}

// Extract initial phoneme from a word
function getInitialPhoneme(word: string): string {
  const lower = word.toLowerCase().replace(/[^a-z]/g, '');
  if (!lower) return '';
  
  // Common digraphs
  const digraphs = ['th', 'sh', 'ch', 'wh', 'ph', 'ck', 'ng', 'qu'];
  for (const digraph of digraphs) {
    if (lower.startsWith(digraph)) return digraph;
  }
  return lower[0] || '';
}

// Wilson score interval for a binomial proportion. More accurate than the
// normal approximation when n is small or p is near 0/1, which is exactly
// the regime %SS lives in for short practice clips.
function wilsonInterval(successes: number, n: number, z = 1.96): { low: number; high: number } {
  if (n <= 0) return { low: 0, high: 0 };
  const p = successes / n;
  const z2 = z * z;
  const denom = 1 + z2 / n;
  const centre = p + z2 / (2 * n);
  const margin = z * Math.sqrt((p * (1 - p) + z2 / (4 * n)) / n);
  return {
    low: Math.max(0, (centre - margin) / denom),
    high: Math.min(1, (centre + margin) / denom),
  };
}

// SSI-4 norms recommend ≥200 syllables for stable severity scoring.
// Below ~100 syllables, %SS and WSS should be treated as indicative only.
function classifySampleAdequacy(totalSyllables: number): 'low' | 'moderate' | 'adequate' {
  if (totalSyllables < 100) return 'low';
  if (totalSyllables < 200) return 'moderate';
  return 'adequate';
}

// Calculate Weighted Stuttering Severity (WSS) based on SSI-4 standards
function calculateWSS(
  blocksCount: number,
  prolongationsCount: number,
  repetitionsCount: number,
  longestBlocks: number[],
  totalSyllables: number
): number {
  if (totalSyllables === 0) return 0;
  
  // SSI-4 inspired calculation
  // Frequency score: percentage of stuttered syllables
  const stutteredSyllables = blocksCount + prolongationsCount + repetitionsCount;
  const percentStuttered = (stutteredSyllables / totalSyllables) * 100;
  return calculateWSSFromPercent(percentStuttered, longestBlocks);
}

// WSS from a precomputed %-stuttered, so we can recompute at the bounds of
// the Wilson CI for the proportion.
function calculateWSSFromPercent(percentStuttered: number, longestBlocks: number[]): number {
  // Duration score: average of three longest blocks
  const avgLongestBlocks = longestBlocks.length > 0 
    ? longestBlocks.reduce((a, b) => a + b, 0) / longestBlocks.length 
    : 0;
  
  // Duration scoring (SSI-4 inspired):
  // < 0.5s = mild, 0.5-1s = moderate, > 1s = severe
  let durationScore = 0;
  if (avgLongestBlocks > 1000) durationScore = 3;
  else if (avgLongestBlocks > 500) durationScore = 2;
  else if (avgLongestBlocks > 250) durationScore = 1;
  
  // Frequency scoring
  let frequencyScore = 0;
  if (percentStuttered > 18) frequencyScore = 4;
  else if (percentStuttered > 12) frequencyScore = 3;
  else if (percentStuttered > 6) frequencyScore = 2;
  else if (percentStuttered > 2) frequencyScore = 1;
  
  // Combined score (0-100 scale, lower is better)
  const rawScore = frequencyScore * 10 + durationScore * 15;
  return Math.min(100, rawScore);
}


// Calculate initiation lag (time from prompt end to first vocalization)
function calculateInitiationLag(words: WordTiming[]): number | null {
  if (!words || words.length === 0) return null;
  // First word's start time represents initiation lag
  return words[0].start * 1000; // Convert to ms
}

// Calculate naturalness score (1-9 scale, 1 = most natural)
function calculateNaturalnessScore(
  words: WordTiming[],
  syllablesPerMinute: number,
  pauseVariance: number
): number {
  if (!words || words.length === 0) return 5;
  
  // Factors affecting naturalness:
  // 1. Speech rate (too slow = robotic, too fast = cluttering)
  // 2. Pause variance (too uniform = robotic)
  // 3. Word duration variance (natural speech has variation)
  
  let score = 5; // Start neutral
  
  // SPM check (natural range: 100-180 SPM)
  if (syllablesPerMinute < 80) score += 2; // Too slow
  else if (syllablesPerMinute > 200) score += 1; // Too fast
  else if (syllablesPerMinute >= 100 && syllablesPerMinute <= 160) score -= 1; // Good range
  
  // Pause variance check (low variance = robotic)
  if (pauseVariance < 50) score += 2; // Very uniform pauses
  else if (pauseVariance < 100) score += 1;
  else if (pauseVariance > 200) score -= 1; // Natural variation
  
  return Math.max(1, Math.min(9, score));
}


// CMU-dict-backed single-word syllable count (via the `syllable` npm package).
// Falls back to a vowel-group heuristic only if the library throws on a token.
function syllableCount(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z']/g, '');
  if (!w) return 0;
  try {
    const n = syllableLib(w);
    return Number.isFinite(n) && n > 0 ? n : 1;
  } catch {
    const vowels = w.match(/[aeiouy]+/g);
    let n = vowels ? vowels.length : 1;
    if (w.endsWith('e') && n > 1) n--;
    if (w.endsWith('le') && w.length > 2) n++;
    return Math.max(1, n);
  }
}

/**
 * Detect intra-word blocks: silences that occur *within* a single Whisper
 * word token. Whisper collapses silence into the surrounding word's duration,
 * so a 600ms block in the middle of "ball" makes the word's duration much
 * larger than physically articulating "ball" should ever take.
 *
 * Strategy: compare each word's actual duration to its expected articulation
 * duration (syllables × per-sample average articulation rate, with a floor).
 * Words that overshoot by a meaningful margin are flagged as intra-word
 * blocks, with the excess duration treated as the block length.
 *
 * Segment timestamps refine the signal: within a single Whisper segment,
 * abnormally long words are far more likely to contain a real silent block
 * than a slow but fluent articulation, because segment boundaries usually
 * correspond to true phrase boundaries (where stretching is natural).
 */
function detectIntraWordBlocks(
  words: WordTiming[],
  segments: Segment[]
): DisfluencyLog[] {
  if (!words || words.length === 0) return [];

  // Per-sample average articulation seconds per syllable.
  // Use the median word's seconds-per-syllable to resist outliers.
  const ratesPerSyl: number[] = [];
  for (const w of words) {
    const syl = syllableCount(w.word);
    if (syl > 0 && w.duration > 0.04) ratesPerSyl.push(w.duration / syl);
  }
  ratesPerSyl.sort((a, b) => a - b);
  const sampleSecPerSyl = ratesPerSyl.length
    ? ratesPerSyl[Math.floor(ratesPerSyl.length / 2)]
    : 0.18;
  // Clamp so a very stuttered sample doesn't make the baseline absurd.
  const baselineSecPerSyl = Math.max(0.12, Math.min(0.30, sampleSecPerSyl));

  // Build word -> segment lookup so we can prefer in-segment evidence.
  const segmentForTime = (t: number): Segment | null =>
    segments.find(s => t >= s.start && t <= s.end) || null;

  const out: DisfluencyLog[] = [];
  for (const w of words) {
    const syl = syllableCount(w.word);
    if (syl === 0) continue;

    const expected = Math.max(0.18, syl * baselineSecPerSyl); // seconds
    const actual = w.duration;
    const excess = actual - expected;

    // Only flag when:
    //  - the word over-runs its expected duration by ≥ 250ms (real block size)
    //  - and the ratio is meaningful (≥ 1.6×) so we ignore mild lengthening
    //  - and the word lives inside a segment (i.e. not a lone phrase) — being
    //    in a segment with neighbouring words means the stretch isn't a
    //    natural end-of-phrase prolongation.
    if (excess < 0.25 || actual < expected * 1.6) continue;

    const seg = segmentForTime(w.start + w.duration / 2);
    const insideMultiWordSegment = seg ? (seg.end - seg.start) > actual * 1.05 : false;
    if (!insideMultiWordSegment) continue;

    const excessMs = excess * 1000;
    out.push({
      type: 'IntraWordBlock',
      category: 'SLD',
      word: w.word,
      phoneme: getInitialPhoneme(w.word),
      severity: excessMs > 800 ? 'severe' : excessMs > 400 ? 'moderate' : 'mild',
      durationMs: excessMs,
      positionInWord: 'medial',
      timestampInSession: w.start,
      suggestion: 'Long silent pause inside this word — try gentle airflow through the syllable',
    });
  }
  return out;
}

// Analyze word timings for comprehensive acoustic patterns
function analyzeAcousticPatterns(words: WordTiming[]): {
  patterns: DisfluencyLog[];
  longestBlocks: number[];
  pauseArchitecture: { linguistic: number; stutter: number; avgDuration: number };
  phonemeTriggers: PhonemeTrigger[];
} {
  const patterns: DisfluencyLog[] = [];
  const blockDurations: number[] = [];
  let linguisticPauses = 0;
  let stutterHesitations = 0;
  const pauseDurations: number[] = [];
  const phonemeMap: Map<string, { count: number; durations: number[]; words: string[] }> = new Map();
  
  if (!words || words.length === 0) {
    return {
      patterns,
      longestBlocks: [],
      pauseArchitecture: { linguistic: 0, stutter: 0, avgDuration: 0 },
      phonemeTriggers: []
    };
  }
  
  const avgDuration = words.reduce((sum, w) => sum + w.duration, 0) / words.length;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = words[i - 1];
    const phoneme = getInitialPhoneme(word.word);
    
    // Detect prolongations (unusually long words)
    if (word.duration > avgDuration * 2) {
      const durationMs = word.duration * 1000;
      patterns.push({
        type: 'Prolongation',
        category: 'SLD',
        word: word.word,
        phoneme,
        severity: word.duration > avgDuration * 3 ? 'severe' : 'moderate',
        durationMs,
        timestampInSession: word.start,
        suggestion: 'Let the sound flow smoothly without stretching'
      });
      
      // Track phoneme triggers
      if (phoneme) {
        const existing = phonemeMap.get(phoneme) || { count: 0, durations: [], words: [] };
        existing.count++;
        existing.durations.push(durationMs);
        existing.words.push(word.word);
        phonemeMap.set(phoneme, existing);
      }
    }
    
    // Detect blocks (long pauses before words)
    if (prevWord) {
      const gap = word.start - prevWord.end;
      const gapMs = gap * 1000;
      pauseDurations.push(gapMs);
      
      if (gap > 0.5) { // > 500ms pause
        blockDurations.push(gapMs);
        
        // Classify as stutter hesitation vs linguistic pause
        // Linguistic pauses typically occur at sentence/clause boundaries
        const prevWordLower = prevWord.word.toLowerCase();
        const isLinguisticBoundary = /[.!?,;:]$/.test(prevWord.word) || 
          ['and', 'but', 'or', 'so', 'because', 'when', 'if', 'then'].includes(prevWordLower);
        
        if (isLinguisticBoundary && gap < 1.0) {
          linguisticPauses++;
        } else {
          stutterHesitations++;
          patterns.push({
            type: 'Block',
            category: 'SLD',
            word: word.word,
            phoneme,
            severity: gap > 1.0 ? 'severe' : gap > 0.7 ? 'moderate' : 'mild',
            durationMs: gapMs,
            timestampInSession: prevWord.end,
            suggestion: 'Try taking a gentle breath before speaking'
          });
          
          // Track phoneme triggers for blocks
          if (phoneme) {
            const existing = phonemeMap.get(phoneme) || { count: 0, durations: [], words: [] };
            existing.count++;
            existing.durations.push(gapMs);
            existing.words.push(word.word);
            phonemeMap.set(phoneme, existing);
          }
        }
      } else if (gap > 0.15 && gap <= 0.5) {
        // Short pause - check if linguistic
        const prevWordLower = prevWord.word.toLowerCase();
        if (/[.!?,;:]$/.test(prevWord.word)) {
          linguisticPauses++;
        }
      }
    }
  }
  
  // Sort block durations to get longest three
  blockDurations.sort((a, b) => b - a);
  const longestBlocks = blockDurations.slice(0, 3);
  
  // Calculate average pause duration
  const avgPauseDuration = pauseDurations.length > 0 
    ? pauseDurations.reduce((a, b) => a + b, 0) / pauseDurations.length 
    : 0;
  
  // Convert phoneme map to sorted array (most problematic first)
  const phonemeTriggers: PhonemeTrigger[] = Array.from(phonemeMap.entries())
    .map(([phoneme, data]) => ({
      phoneme,
      count: data.count,
      avgDurationMs: data.durations.reduce((a, b) => a + b, 0) / data.durations.length,
      words: [...new Set(data.words)]
    }))
    .filter(p => p.count >= 2) // Only include phonemes with multiple occurrences
    .sort((a, b) => b.count - a.count);
  
  return {
    patterns,
    longestBlocks,
    pauseArchitecture: {
      linguistic: linguisticPauses,
      stutter: stutterHesitations,
      avgDuration: avgPauseDuration
    },
    phonemeTriggers
  };
}

// Detect text-based disfluencies with SLD/OD classification
function detectTextDisfluencies(text: string): DisfluencyLog[] {
  const disfluencies: DisfluencyLog[] = [];
  const lowerText = text.toLowerCase();
  
  // Sound/syllable repetitions (SLD): "b-b-ball", "ba-ba-baby"
  const soundRepPattern = /\b(\w{1,2})-\1+(-\w+)?\b/gi;
  let match;
  while ((match = soundRepPattern.exec(text)) !== null) {
    const phoneme = getInitialPhoneme(match[0]);
    disfluencies.push({
      type: 'SoundRepetition',
      category: 'SLD',
      word: match[0],
      phoneme,
      severity: 'moderate',
      positionInWord: 'initial',
      suggestion: 'Try starting the word more gently with easy onset'
    });
  }
  
  // Syllable repetitions (SLD): "ba-ba-baby"
  const syllableRepPattern = /\b(\w{2,3})-\1+(-?\w*)\b/gi;
  while ((match = syllableRepPattern.exec(text)) !== null) {
    if (!soundRepPattern.test(match[0])) { // Avoid double-counting
      disfluencies.push({
        type: 'SyllableRepetition',
        category: 'SLD',
        word: match[0],
        phoneme: getInitialPhoneme(match[0]),
        severity: 'moderate',
        positionInWord: 'initial',
        suggestion: 'Slow down and let the syllable flow out once'
      });
    }
  }
  
  // Part-word repetitions (SLD): "w-w-want"
  const partWordRepPattern = /\b(\w)-\1+-?\w*\b/gi;
  while ((match = partWordRepPattern.exec(text)) !== null) {
    disfluencies.push({
      type: 'PartWordRepetition',
      category: 'SLD',
      word: match[0],
      phoneme: match[1].toLowerCase(),
      severity: 'moderate',
      positionInWord: 'initial',
      suggestion: 'Use easy onset to start the sound gently'
    });
  }
  
  // Word repetitions (OD for single, SLD for multiple): "the the", "I I I"
  const wordRepPattern = /\b(\w+)(\s+\1){1,}\b/gi;
  while ((match = wordRepPattern.exec(text)) !== null) {
    const repetitionCount = (match[0].match(new RegExp(`\\b${match[1]}\\b`, 'gi')) || []).length;
    disfluencies.push({
      type: 'WordRepetition',
      category: repetitionCount > 2 ? 'SLD' : 'OD',
      word: match[0],
      severity: repetitionCount > 2 ? 'moderate' : 'mild',
      suggestion: 'Pause, take a breath, then continue smoothly'
    });
  }
  
  // Phrase repetitions (OD): "I want, I want a drink"
  const phraseRepPattern = /\b(\w+\s+\w+),?\s*\1\b/gi;
  while ((match = phraseRepPattern.exec(text)) !== null) {
    disfluencies.push({
      type: 'PhraseRepetition',
      category: 'OD',
      word: match[0],
      severity: 'mild',
      suggestion: 'This is normal! Just continue with your thought'
    });
  }
  
  // Interjections (OD)
  const interjections = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'well', 'so', 'basically'];
  for (const filler of interjections) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    while ((match = regex.exec(lowerText)) !== null) {
      disfluencies.push({
        type: 'Interjection',
        category: 'OD',
        word: filler,
        severity: 'mild',
        suggestion: "It's okay to pause silently instead of using filler words"
      });
    }
  }
  
  // Revisions (OD): "I went - I mean I walked"
  const revisionPattern = /\b(\w+)\s*[-–—]\s*(I mean|no|wait|actually|I meant)\s*/gi;
  while ((match = revisionPattern.exec(text)) !== null) {
    disfluencies.push({
      type: 'Revision',
      category: 'OD',
      word: match[0],
      severity: 'mild',
      suggestion: 'Revisions show you are thinking carefully about what you want to say'
    });
  }
  
  return disfluencies;
}

// Detect word avoidances (synonym swapping patterns)
function detectWordAvoidances(transcript: string, targetPhrase: string): string[] {
  const avoidances: string[] = [];
  
  // Simple check: words in target but not in transcript might indicate avoidance
  const targetWords = targetPhrase.toLowerCase().split(/\s+/);
  const transcriptWords = transcript.toLowerCase().split(/\s+/);
  
  for (const targetWord of targetWords) {
    if (targetWord.length > 3 && !transcriptWords.includes(targetWord)) {
      // Word was in target but not spoken - possible avoidance
      avoidances.push(targetWord);
    }
  }
  
  return avoidances;
}

// Calculate total syllable count from text using the CMU-dict-backed counter.
function estimateSyllables(text: string): number {
  const words = text.toLowerCase().replace(/[^a-z'\s]/g, '').split(/\s+/).filter(w => w);
  let count = 0;
  for (const word of words) count += syllableCount(word);
  return count;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Validate Authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await supabase.auth.getUser(token);
    if (claimsError || !claimsData?.user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = claimsData.user.id;
    console.log('Authenticated user:', userId);

    // Parse and validate input
    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { transcript, targetPhrase, words, segments: rawSegments, sessionContext, environmentType } = rawBody;
    const segments: Segment[] = Array.isArray(rawSegments)
      ? rawSegments
          .filter((s: unknown) => s && typeof s === 'object'
            && typeof (s as Segment).start === 'number'
            && typeof (s as Segment).end === 'number')
          .map((s: Segment) => ({
            id: s.id ?? null,
            start: s.start,
            end: s.end,
            text: typeof s.text === 'string' ? s.text : '',
          }))
      : [];
    const acousticEvents = sanitiseAcousticEvents(rawBody?.acousticEvents);
    
    if (!transcript || typeof transcript !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid request' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('Analyzing speech for user:', userId, { transcript, targetPhrase, wordCount: words?.length });

    // --- Rate Limit Check ---
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: rlCheck } = await serviceClient.rpc('check_rate_limit', { _function_name: 'analyze-speech', _user_id: userId });
    if (rlCheck && !rlCheck.allowed) {
      console.warn('Rate limit hit for analyze-speech:', rlCheck.reason);
      return new Response(JSON.stringify({ error: `Rate limit exceeded: ${rlCheck.reason}` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate duration and speech rate metrics
    const totalDuration = words && words.length > 0 ? words[words.length - 1].end : 0;
    const totalSyllables = estimateSyllables(transcript);
    const syllablesPerMinute = totalDuration > 0 ? (totalSyllables / totalDuration) * 60 : 0;
    
    // Calculate articulation rate (excluding pauses)
    const totalWordDuration = words ? words.reduce((sum: number, w: WordTiming) => sum + w.duration, 0) : 0;
    const articulationRate = totalWordDuration > 0 ? (totalSyllables / totalWordDuration) * 60 : 0;

    // Pre-analyze acoustic patterns from word timings
    const acousticAnalysis = analyzeAcousticPatterns(words || []);
    // Detect blocks that occur *within* a single Whisper word using
    // segment-level timestamps. These are silences the existing inter-word
    // gap analysis cannot see.
    const intraWordBlocks = detectIntraWordBlocks(words || [], segments);
    const textDisfluencies = detectTextDisfluencies(transcript);
    const wordAvoidances = detectWordAvoidances(transcript, targetPhrase || '');
    
    // Calculate initiation lag
    const initiationLagMs = calculateInitiationLag(words || []);
    
    // Calculate pause variance for naturalness
    const pauseVariance = words && words.length > 1 
      ? Math.sqrt(words.reduce((sum: number, w: WordTiming, i: number) => {
          if (i === 0) return 0;
          const gap = (w.start - words[i-1].end) * 1000;
          return sum + Math.pow(gap - acousticAnalysis.pauseArchitecture.avgDuration, 2);
        }, 0) / (words.length - 1))
      : 100;
    
    // Convert browser acoustic events into disfluency logs and merge them in.
    // These are higher-quality signals than transcript-derived patterns because
    // they capture intra-word blocks and prolongations Whisper cannot see.
    const acousticEventDisfluencies = acousticEvents.map(acousticEventToDisfluency);

    // Count SLD vs OD
    const allDisfluencies = [...acousticAnalysis.patterns, ...textDisfluencies, ...acousticEventDisfluencies, ...intraWordBlocks];
    const sldCount = allDisfluencies.filter(d => d.category === 'SLD').length;
    const odCount = allDisfluencies.filter(d => d.category === 'OD').length;

    // Count specific disfluency types
    const soundRepsCount = allDisfluencies.filter(d => d.type === 'SoundRepetition' || d.type === 'PartWordRepetition').length;
    const syllableRepsCount = allDisfluencies.filter(d => d.type === 'SyllableRepetition').length;
    const wordRepsCount = allDisfluencies.filter(d => d.type === 'WordRepetition').length;
    const phraseRepsCount = allDisfluencies.filter(d => d.type === 'PhraseRepetition').length;
    const revisionsCount = allDisfluencies.filter(d => d.type === 'Revision').length;
    const blocksCount = allDisfluencies.filter(d => d.type === 'Block' || d.type === 'IntraWordBlock').length;
    const prolongationsCount = allDisfluencies.filter(d => d.type === 'Prolongation').length;
    const interjectionsCount = allDisfluencies.filter(d => d.type === 'Interjection').length;
    const intraWordBlocksCount = intraWordBlocks.length;

    // Transcript-only pool: derived purely from Whisper word-level timings + text patterns.
    // Excludes the live browser acoustic events and intra-word silent blocks from segments.
    const transcriptOnlyBlockDurations = [...acousticAnalysis.longestBlocks].sort((a, b) => b - a);
    const transcriptOnlyLongestBlocks = transcriptOnlyBlockDurations.slice(0, 3);

    const transcriptOnlyDisfluencies = [...acousticAnalysis.patterns, ...textDisfluencies];
    const transcriptOnlySldCount = transcriptOnlyDisfluencies.filter(d => d.category === 'SLD').length;
    const transcriptOnlyBlocks = transcriptOnlyDisfluencies.filter(d => d.type === 'Block').length;
    const transcriptOnlyProlongations = transcriptOnlyDisfluencies.filter(d => d.type === 'Prolongation').length;
    const transcriptOnlyReps = transcriptOnlyDisfluencies.filter(d => d.type === 'SoundRepetition' || d.type === 'PartWordRepetition' || d.type === 'SyllableRepetition').length;
    const transcriptOnlyPercentSS = totalSyllables > 0 ? (transcriptOnlySldCount / totalSyllables) * 100 : 0;
    const transcriptOnlyWss = calculateWSS(
      transcriptOnlyBlocks,
      transcriptOnlyProlongations,
      transcriptOnlyReps,
      transcriptOnlyLongestBlocks,
      totalSyllables
    );

    // Merge acoustic block durations into the longest-blocks pool used by WSS,
    // so silent intra-word blocks contribute to severity scoring.
    const acousticBlockDurations = acousticEvents
      .filter(e => e.type === 'BLOCK' || e.type === 'PROLONGATION')
      .map(e => e.durationMs);
    const intraWordBlockDurations = intraWordBlocks.map(b => b.durationMs ?? 0);
    const combinedBlockDurations = [
      ...acousticAnalysis.longestBlocks,
      ...acousticBlockDurations,
      ...intraWordBlockDurations,
    ].sort((a, b) => b - a);
    const longestBlocks = combinedBlockDurations.slice(0, 3);

    // Calculate WSS using the merged block pool
    const wss = calculateWSS(
      blocksCount,
      prolongationsCount,
      soundRepsCount + syllableRepsCount,
      longestBlocks,
      totalSyllables
    );

    // Explainability: how the merged pool changed the score vs transcript-only.
    const avg = (xs: number[]) => xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0;
    const wssExplain = {
      transcriptOnly: {
        wss: transcriptOnlyWss,
        percentStuttered: transcriptOnlyPercentSS,
        sldCount: transcriptOnlySldCount,
        longestBlocks: transcriptOnlyLongestBlocks,
        avgLongestBlockMs: avg(transcriptOnlyLongestBlocks),
      },
      merged: {
        wss,
        percentStuttered: totalSyllables > 0 ? (sldCount / totalSyllables) * 100 : 0,
        sldCount,
        longestBlocks,
        avgLongestBlockMs: avg(longestBlocks),
      },
      contributions: {
        acousticEventsAdded: acousticEvents.length,
        acousticBlocksAdded: acousticBlockDurations.length,
        intraWordBlocksAdded: intraWordBlockDurations.length,
        addedSldCount: sldCount - transcriptOnlySldCount,
        addedBlockDurationsMs: [...acousticBlockDurations, ...intraWordBlockDurations].sort((a, b) => b - a),
        wssDelta: wss - transcriptOnlyWss,
        percentStutteredDelta: (totalSyllables > 0 ? (sldCount / totalSyllables) * 100 : 0) - transcriptOnlyPercentSS,
        avgLongestBlockDeltaMs: avg(longestBlocks) - avg(transcriptOnlyLongestBlocks),
      },
    };
    
    // Calculate percent syllables stuttered
    const percentSS = totalSyllables > 0 
      ? (sldCount / totalSyllables) * 100 
      : 0;

    // 95% Wilson confidence interval for %SS, plus a propagated CI for WSS
    // by recomputing the score at the lower/upper proportion bounds.
    const ssInterval = wilsonInterval(sldCount, totalSyllables);
    const percentSSCI = {
      low: ssInterval.low * 100,
      high: ssInterval.high * 100,
    };
    const wssCI = {
      low: calculateWSSFromPercent(ssInterval.low * 100, longestBlocks),
      high: calculateWSSFromPercent(ssInterval.high * 100, longestBlocks),
    };
    const sampleAdequacy = classifySampleAdequacy(totalSyllables);
    
    // Calculate naturalness score
    const naturalnessScore = calculateNaturalnessScore(words || [], syllablesPerMinute, pauseVariance);
    
    console.log('Pre-analysis complete:', { 
      sldCount, odCount, blocksCount, prolongationsCount,
      wss, percentSS, percentSSCI, wssCI, sampleAdequacy, totalSyllables,
      naturalnessScore,
      phonemeTriggers: acousticAnalysis.phonemeTriggers.length
    });


    // Enhanced system prompt with comprehensive clinical analysis
    const systemPrompt = `You are an expert speech-language pathologist specializing in fluency disorders in children ages 4-12. You use evidence-based assessment methods including SSI-4 standards.

ACOUSTIC ANALYSIS DETECTED:
${acousticAnalysis.patterns.length > 0 ? acousticAnalysis.patterns.map(p => `- ${p.type} (${p.category}): "${p.word}" (${p.severity}${p.durationMs ? `, ${p.durationMs.toFixed(0)}ms` : ''})`).join('\n') : 'No acoustic anomalies detected'}

TEXT PATTERN ANALYSIS DETECTED:
${textDisfluencies.length > 0 ? textDisfluencies.map(d => `- ${d.type} (${d.category}): "${d.word}"`).join('\n') : 'No text-based disfluencies detected'}

LIVE BROWSER ACOUSTIC EVENTS (real-time microphone analyser, ground-truth signal):
${acousticEvents.length > 0
  ? acousticEvents.map(e => `- ${e.type} ${e.durationMs.toFixed(0)}ms (confidence ${(e.confidence * 100).toFixed(0)}%): ${e.detail}`).join('\n')
  : 'No live acoustic events captured (detector inactive or clean speech)'}

INTRA-WORD BLOCKS (silences inside a Whisper word, derived from segment-level timing):
${intraWordBlocks.length > 0
  ? intraWordBlocks.map(b => `- "${b.word}" (${b.severity}, ~${(b.durationMs ?? 0).toFixed(0)}ms hidden silence)`).join('\n')
  : 'None detected'}

PHONEME TRIGGERS IDENTIFIED:
${acousticAnalysis.phonemeTriggers.length > 0 ? acousticAnalysis.phonemeTriggers.map(p => `- /${p.phoneme}/: ${p.count} occurrences (avg ${p.avgDurationMs.toFixed(0)}ms) - words: ${p.words.join(', ')}`).join('\n') : 'No significant phoneme triggers'}

CLINICAL METRICS CALCULATED:
- Weighted Stuttering Severity (WSS): ${wss.toFixed(1)}/100 (95% CI ${wssCI.low.toFixed(1)}–${wssCI.high.toFixed(1)})
- Percent Syllables Stuttered (%SS): ${percentSS.toFixed(1)}% (95% CI ${percentSSCI.low.toFixed(1)}–${percentSSCI.high.toFixed(1)}%)
- Sample size: ${totalSyllables} syllables (adequacy: ${sampleAdequacy}; SSI-4 norm ≥200). Treat scores as ${sampleAdequacy === 'adequate' ? 'stable' : 'indicative only — wide CI reflects small sample'}.
- SLD Count: ${sldCount}, OD Count: ${odCount}
- Syllables Per Minute: ${syllablesPerMinute.toFixed(0)}
- Articulation Rate: ${articulationRate.toFixed(0)} SPM
- Initiation Lag: ${initiationLagMs ? initiationLagMs.toFixed(0) + 'ms' : 'N/A'}
- Naturalness Score: ${naturalnessScore}/9 (1=most natural)
- Longest Blocks (merged transcript + acoustic): ${longestBlocks.map(b => b.toFixed(0) + 'ms').join(', ') || 'None'}

IMPORTANT: When LIVE BROWSER ACOUSTIC EVENTS are present, treat them as the primary signal — they capture intra-word blocks and prolongations the transcript alone cannot show. Cross-reference them with the transcript timing rather than discounting them.

SCORING FRAMEWORK:
- Base fluency score: 100
- Per Block: -10 (severe), -7 (moderate), -5 (mild)
- Per Sound/Part-word Repetition: -8
- Per Syllable/Word Repetition: -5
- Per Prolongation: -6
- Per Interjection: -2
- Bonus for detected techniques: +5 each

Be precise and clinically accurate. Incorporate all pre-analyzed patterns.`;

    const userPrompt = `## SPEECH SAMPLE

**Target Phrase:** "${targetPhrase}"
**Spoken Transcript:** "${transcript}"
**Word Count:** ${(words || []).length}
**Total Duration:** ${totalDuration.toFixed(2)}s
**Context:** ${sessionContext || 'app'} / ${environmentType || 'home'}

Analyze this sample incorporating the pre-detected patterns. Provide accurate clinical assessment with specific technique feedback.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_speech',
              description: 'Provide detailed clinical analysis of speech sample with all metrics',
              parameters: {
                type: 'object',
                properties: {
                  fluencyScore: {
                    type: 'number',
                    description: 'Overall fluency score 0-100 using the scoring framework'
                  },
                  accuracy: {
                    type: 'number',
                    description: 'Word accuracy percentage comparing transcript to target (0-100)'
                  },
                  easyOnsetScore: {
                    type: 'number',
                    description: 'Easy onset technique usage score (0-100)'
                  },
                  easyOnsetAttempts: {
                    type: 'number',
                    description: 'Number of times easy onset was attempted'
                  },
                  easyOnsetSuccesses: {
                    type: 'number',
                    description: 'Number of successful easy onset uses'
                  },
                  softContactScore: {
                    type: 'number',
                    description: 'Soft contact technique score (0-100)'
                  },
                  pacingScore: {
                    type: 'number',
                    description: 'Pacing appropriateness score (0-100)'
                  },
                  disfluencies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        category: { type: 'string', enum: ['SLD', 'OD'] },
                        word: { type: 'string' },
                        severity: { type: 'string' },
                        suggestion: { type: 'string' }
                      }
                    },
                    description: 'All disfluencies with SLD/OD classification'
                  },
                  strengths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific positive aspects observed'
                  },
                  areasToImprove: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Clinical areas needing practice'
                  },
                  techniquesObserved: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Fluency techniques detected (easy onset, light contact, etc.)'
                  },
                  clinicalNote: {
                    type: 'string',
                    description: 'Brief clinical observation for therapist'
                  },
                  encouragement: {
                    type: 'string',
                    description: 'Warm, specific encouragement for the child'
                  }
                },
                required: ['fluencyScore', 'accuracy', 'disfluencies', 'strengths', 'encouragement']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_speech' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('AI credits exhausted');
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    console.log('AI response received');

    // Extract the tool call arguments
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      
      // Merge pre-detected disfluencies (transcript-derived + live acoustic + intra-word) with AI analysis
      const mergedDisfluencies = [
        ...acousticAnalysis.patterns,
        ...textDisfluencies,
        ...acousticEventDisfluencies,
        ...intraWordBlocks,
        ...(analysis.disfluencies || [])
      ];
      
      // Remove duplicates based on word and type
      const uniqueDisfluencies = mergedDisfluencies.filter((d, i, arr) => 
        arr.findIndex(x => x.word === d.word && x.type === d.type) === i
      );
      
      const finalAnalysis = {
        // Basic scores
        fluencyScore: Math.max(0, Math.min(100, analysis.fluencyScore ?? 75)),
        accuracy: analysis.accuracy ?? 80,
        easyOnsetScore: analysis.easyOnsetScore ?? 70,
        pacingScore: analysis.pacingScore ?? 75,
        
        // Clinical metrics (Surface Command Centre)
        weightedStutteringSeverity: wss,
        weightedStutteringSeverityCI: wssCI,
        percentSyllablesStuttered: percentSS,
        percentSyllablesStutteredCI: percentSSCI,
        totalSyllables,
        sampleAdequacy,
        syllablesPerMinute: syllablesPerMinute,
        articulationRate: articulationRate,
        sldCount,
        odCount,
        
        // Temporal & Prosodic (Hidden Block detection)
        initiationLagMs: initiationLagMs,
        naturalnessScore: naturalnessScore,
        
        // Disfluency breakdown
        blocksCount,
        prolongationsCount,
        soundRepetitionsCount: soundRepsCount,
        syllableRepetitionsCount: syllableRepsCount,
        wordRepetitionsCount: wordRepsCount,
        phraseRepetitionsCount: phraseRepsCount,
        revisionsCount,
        interjectionsCount,
        
        // Technique tracking
        easyOnsetAttempts: analysis.easyOnsetAttempts ?? 0,
        easyOnsetSuccesses: analysis.easyOnsetSuccesses ?? 0,
        softContactScore: analysis.softContactScore ?? null,
        
        // Pause architecture
        linguisticPausesCount: acousticAnalysis.pauseArchitecture.linguistic,
        stutterHesitationsCount: acousticAnalysis.pauseArchitecture.stutter,
        avgPauseDurationMs: acousticAnalysis.pauseArchitecture.avgDuration,
        
        // Phoneme triggers (for heatmap)
        phonemeTriggers: acousticAnalysis.phonemeTriggers,
        
        // Word avoidances
        wordAvoidances,
        
        // Longest blocks (for WSS) — merged transcript gaps + live acoustic blocks
        longestBlockMs: longestBlocks[0] ?? null,
        secondLongestBlockMs: longestBlocks[1] ?? null,
        thirdLongestBlockMs: longestBlocks[2] ?? null,

        // Echo back the live acoustic events used in this analysis
        acousticEventsCount: acousticEvents.length,
        intraWordBlocksCount,

        // Explainability: WSS breakdown vs transcript-only baseline
        wssExplain,
        
        // All disfluencies with full detail
        disfluencies: uniqueDisfluencies,
        
        // Qualitative analysis
        strengths: analysis.strengths ?? ["Good effort!"],
        areasToImprove: analysis.areasToImprove ?? [],
        techniquesObserved: analysis.techniquesObserved ?? [],
        clinicalNote: analysis.clinicalNote ?? "",
        encouragement: analysis.encouragement ?? "Great job practicing! Keep it up!",
        
        // Context
        sessionContext: sessionContext || 'app',
        environmentType: environmentType || 'home'
      };
      
      // --- Safeguarding Check ---
      // Use proper word-boundary regex matching so "hurt" doesn't fire on
      // "hurtle", "hit" on "hitch", "die" on "diet"/"died"/"studied", etc.
      // Multi-word phrases anchor with \b on the outer tokens only.
      const safeguardingKeywords = ['hurt', 'hit', 'scared', 'help me', "don't touch", 'stop it', 'go away', 'kill', 'die', 'hate myself'];
      const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const keywordPatterns = safeguardingKeywords.map(kw => ({
        keyword: kw,
        // \b works around the alphanumeric tokens; internal spaces/apostrophes
        // are matched literally (apostrophes are non-word chars so we don't
        // need a boundary around them).
        pattern: new RegExp(`\\b${escapeRegex(kw)}\\b`, 'i'),
      }));

      const matched = keywordPatterns.find(({ pattern }) => pattern.test(transcript));

      if (matched) {
        try {
          const serviceClient = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
          );

          await serviceClient.from('safeguarding_alerts').insert({
            user_id: userId,
            alert_type: 'keyword_detected',
            reason: `Keyword detected in transcript: "${matched.keyword}"`,
            status: 'pending',
          });

          console.log('Safeguarding alert created for user:', userId, 'keyword:', matched.keyword);
        } catch (safeguardingError) {
          console.error('Failed to create safeguarding alert:', safeguardingError);
        }
      }

      
      // --- Log API Usage ---
      try {
        const usageTokens = JSON.stringify(finalAnalysis).length; // approximate
        await serviceClient.from('api_usage_logs').insert({
          function_name: 'analyze-speech',
          user_id: userId,
          tokens_used: usageTokens,
          estimated_cost_gbp: usageTokens * 0.000002,
          status: 'success',
        });
      } catch (logErr) {
        console.error('Usage logging failed (non-blocking):', logErr);
      }

      console.log('Final comprehensive analysis for user:', userId, {
        wss: finalAnalysis.weightedStutteringSeverity,
        percentSS: finalAnalysis.percentSyllablesStuttered,
        sld: finalAnalysis.sldCount,
        od: finalAnalysis.odCount,
        naturalness: finalAnalysis.naturalnessScore,
        phonemeTriggers: finalAnalysis.phonemeTriggers.length
      });
      
      return new Response(JSON.stringify(finalAnalysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('No analysis returned from AI');

  } catch (error: unknown) {
    console.error('Speech analysis error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to process request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
