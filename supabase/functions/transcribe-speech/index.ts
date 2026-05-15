import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

function validateString(value: unknown, maxLength: number, fieldName: string): string {
  if (typeof value !== 'string') throw new Error(`Invalid ${fieldName}`);
  if (value.length > maxLength) throw new Error(`Invalid ${fieldName}: exceeds maximum length`);
  return value;
}

function processBase64Chunks(base64String: string, chunkSize = 32768): Uint8Array {
  const chunks: Uint8Array[] = [];
  let position = 0;
  while (position < base64String.length) {
    const chunk = base64String.slice(position, position + chunkSize);
    const binaryChunk = atob(chunk);
    const bytes = new Uint8Array(binaryChunk.length);
    for (let i = 0; i < binaryChunk.length; i++) {
      bytes[i] = binaryChunk.charCodeAt(i);
    }
    chunks.push(bytes);
    position += chunkSize;
  }
  const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const result = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.length;
  }
  return result;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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

    let rawBody;
    try {
      rawBody = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid request format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const audio = validateString(rawBody.audio, 25 * 1024 * 1024, 'audio');
    const language = validateString(rawBody.language || 'en', 10, 'language');
    const sessionId = rawBody.sessionId ? validateString(rawBody.sessionId, 100, 'sessionId') : null;

    if (!audio) {
      return new Response(JSON.stringify({ error: 'No audio data provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const validLanguagePattern = /^[a-z]{2}(-[A-Z]{2})?$/;
    if (!validLanguagePattern.test(language)) {
      return new Response(JSON.stringify({ error: 'Invalid language code' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    if (!OPENAI_API_KEY) {
      console.error('OPENAI_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Rate Limit Check ---
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: rlCheck } = await serviceClient.rpc('check_rate_limit', { _function_name: 'transcribe-speech', _user_id: userId });
    if (rlCheck && !rlCheck.allowed) {
      console.warn('Rate limit hit for transcribe-speech:', rlCheck.reason);
      return new Response(JSON.stringify({ error: `Rate limit exceeded: ${rlCheck.reason}` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const binaryAudio = processBase64Chunks(audio);
    console.log(`Audio size: ${binaryAudio.length} bytes`);

    // Upload audio to storage for therapist audit playback
    let audioFilePath: string | null = null;
    try {
      const fileId = sessionId || crypto.randomUUID();
      const storagePath = `${userId}/${fileId}.webm`;
      
      const serviceClient = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      const { error: uploadError } = await serviceClient.storage
        .from('session-audio')
        .upload(storagePath, binaryAudio.buffer as ArrayBuffer, {
          contentType: 'audio/webm',
          upsert: true,
        });

      if (uploadError) {
        console.error('Audio upload error:', uploadError.message);
      } else {
        audioFilePath = storagePath;
        console.log('Audio stored at:', audioFilePath);
      }
    } catch (uploadErr) {
      console.error('Audio storage failed (non-blocking):', uploadErr);
    }

    // Transcribe with Whisper
    const formData = new FormData();
    const blob = new Blob([binaryAudio.buffer as ArrayBuffer], { type: 'audio/webm' });
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', language);
    formData.append('response_format', 'verbose_json');
    // Request both word- and segment-level timestamps so the analyser can
    // detect within-segment intra-word silences (blocks Whisper otherwise hides).
    formData.append('timestamp_granularities[]', 'word');
    formData.append('timestamp_granularities[]', 'segment');

    const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}` },
      body: formData,
    });

    if (!response.ok) {
      console.error('Whisper API error:', response.status);
      return new Response(JSON.stringify({ error: 'Unable to transcribe audio' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const result = await response.json();
    console.log('Transcription complete for user:', userId);

    const words = result.words || [];
    const segments = (result.segments || []).map(
      (s: { id?: number; start: number; end: number; text?: string }) => ({
        id: s.id ?? null,
        start: s.start,
        end: s.end,
        text: s.text ?? '',
      })
    );
    const rawText = result.text || '';
    const rawWords = words.map((w: { word: string; start: number; end: number }) => ({
      word: w.word,
      start: w.start,
      end: w.end,
      duration: w.end - w.start
    }));

    // --- PII Scrubbing Pass (GDPR compliance) ---
    let scrubbedText = rawText;
    let scrubbedWords = rawWords;
    let piiDetected = false;
    let piiCategories: string[] = [];

    try {
      console.log('Running PII scrubbing pass...');
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (LOVABLE_API_KEY && rawText.trim().length > 0) {
        const piiResponse = await fetch(
          `${Deno.env.get('SUPABASE_URL')}/functions/v1/scrub-pii`,
          {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text: rawText, words: rawWords }),
          }
        );

        if (piiResponse.ok) {
          const piiResult = await piiResponse.json();
          scrubbedText = piiResult.scrubbedText || rawText;
          scrubbedWords = piiResult.scrubbedWords || rawWords;
          piiDetected = piiResult.piiDetected || false;
          piiCategories = piiResult.piiCategories || [];
          console.log(`PII scrub result: detected=${piiDetected}, categories=${piiCategories.join(',')}`);
        } else {
          console.warn('PII scrubbing failed (non-blocking), using raw transcript:', piiResponse.status);
        }
      }
    } catch (piiErr) {
      console.error('PII scrubbing error (non-blocking):', piiErr);
    }

    const transcription = {
      text: scrubbedText,
      words: scrubbedWords,
      segments,
      duration: result.duration || 0,
      language: result.language || language,
      audioFilePath,
      piiScrubbed: piiDetected,
      piiCategories,
    };

    // --- Log API Usage ---
    try {
      const audioSeconds = result.duration || 0;
      const estimatedCost = audioSeconds * 0.0001; // ~£0.006/min for Whisper
      await serviceClient.from('api_usage_logs').insert({
        function_name: 'transcribe-speech',
        user_id: userId,
        tokens_used: Math.round(audioSeconds * 25), // approximate token equivalent
        estimated_cost_gbp: estimatedCost,
        status: 'success',
      });
    } catch (logErr) { console.error('Usage logging failed:', logErr); }

    return new Response(JSON.stringify(transcription), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error: unknown) {
    console.error('Transcription error:', error);
    return new Response(
      JSON.stringify({ error: 'Unable to process request' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
