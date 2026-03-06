import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

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

    const { text, words } = await req.json();

    if (!text || typeof text !== 'string') {
      return new Response(JSON.stringify({ error: 'No text provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (text.trim().length === 0) {
      return new Response(JSON.stringify({ scrubbedText: '', scrubbedWords: words || [], piiDetected: false, piiCategories: [] }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are a UK GDPR-compliant PII scrubbing engine for a children's speech therapy application called Stammerly.

Your task is to identify and redact ALL personally identifiable information from speech transcripts before they are stored or used for machine learning model retraining.

Categories to detect and redact:
- PERSON_NAME: First names, surnames, nicknames (e.g. "my teacher Mrs Smith" → "my teacher [PERSON]")
- ADDRESS: Street names, house numbers, postcodes (e.g. "I live on Elm Street" → "I live on [ADDRESS]")
- SCHOOL: School names, college names (e.g. "at St Mary's Primary" → "at [SCHOOL]")
- LOCATION: Specific places, towns, landmarks that could identify someone (e.g. "near the Tesco in Bromley" → "near [LOCATION]")
- PHONE: Phone numbers
- EMAIL: Email addresses
- DATE_OF_BIRTH: Specific birth dates when combined with other identifiers
- NHS_NUMBER: NHS numbers or similar health identifiers

Rules:
- Common nouns and generic words must NOT be redacted
- Speech therapy target words/phrases must be preserved (e.g. "say the word butterfly slowly" should remain intact)
- Filler words, repetitions, and disfluencies must be preserved as they are clinically relevant
- When uncertain, err on the side of redacting (data protection > data retention)
- Preserve the natural structure and punctuation of the text

Return a JSON object with tool calling.`;

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
          { role: 'user', content: `Scrub PII from this transcript:\n\n"${text}"` },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'scrub_pii_result',
              description: 'Return the PII-scrubbed transcript and metadata.',
              parameters: {
                type: 'object',
                properties: {
                  scrubbed_text: {
                    type: 'string',
                    description: 'The transcript with all PII replaced by category tags like [PERSON], [ADDRESS], [SCHOOL], [LOCATION].',
                  },
                  pii_detected: {
                    type: 'boolean',
                    description: 'Whether any PII was found in the text.',
                  },
                  pii_items: {
                    type: 'array',
                    description: 'List of PII items found.',
                    items: {
                      type: 'object',
                      properties: {
                        original: { type: 'string', description: 'The original PII text.' },
                        category: { type: 'string', description: 'PII category: PERSON_NAME, ADDRESS, SCHOOL, LOCATION, PHONE, EMAIL, DATE_OF_BIRTH, NHS_NUMBER.' },
                        replacement: { type: 'string', description: 'The redaction tag used.' },
                      },
                      required: ['original', 'category', 'replacement'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['scrubbed_text', 'pii_detected', 'pii_items'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'scrub_pii_result' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted.' }), {
          status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      console.error('AI gateway error:', response.status);
      return new Response(JSON.stringify({ error: 'PII scrubbing service unavailable' }), {
        status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = await response.json();
    const toolCall = aiResult.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall?.function?.arguments) {
      console.error('No tool call in AI response');
      // Fallback: return original text with warning
      return new Response(JSON.stringify({
        scrubbedText: text,
        scrubbedWords: words || [],
        piiDetected: false,
        piiCategories: [],
        warning: 'PII scrubbing could not be performed; original text returned.',
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const scrubbedText = parsed.scrubbed_text || text;
    const piiDetected = parsed.pii_detected || false;
    const piiItems = parsed.pii_items || [];

    // Also scrub word-level timings if provided
    let scrubbedWords = words || [];
    if (piiDetected && piiItems.length > 0 && words?.length > 0) {
      scrubbedWords = words.map((w: { word: string; start: number; end: number; duration: number }) => {
        let word = w.word;
        for (const item of piiItems) {
          if (word.toLowerCase().includes(item.original.toLowerCase())) {
            word = item.replacement;
          }
        }
        return { ...w, word };
      });
    }

    const piiCategories = [...new Set(piiItems.map((i: { category: string }) => i.category))];

    console.log(`PII scrub complete. Detected: ${piiDetected}, Items: ${piiItems.length}, Categories: ${piiCategories.join(', ')}`);

    return new Response(JSON.stringify({
      scrubbedText,
      scrubbedWords,
      piiDetected,
      piiCategories,
      piiCount: piiItems.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('PII scrub error:', error);
    return new Response(JSON.stringify({ error: 'Unable to process request' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
