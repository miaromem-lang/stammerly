import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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

// Input validation helpers
function validateString(value: unknown, maxLength: number, fieldName: string): string {
  if (typeof value !== 'string') {
    throw new Error(`Invalid ${fieldName}`);
  }
  if (value.length > maxLength) {
    throw new Error(`Invalid ${fieldName}: exceeds maximum length`);
  }
  return value.trim();
}

function validateNumber(value: unknown, min: number, max: number, fieldName: string): number {
  const num = typeof value === 'number' ? value : parseInt(String(value), 10);
  if (isNaN(num) || num < min || num > max) {
    throw new Error(`Invalid ${fieldName}: must be between ${min} and ${max}`);
  }
  return num;
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

    const topic = validateString(rawBody.topic, 200, 'topic');
    const difficulty = validateString(rawBody.difficulty || 'beginner', 20, 'difficulty');
    const sentenceCount = validateNumber(rawBody.sentenceCount || 5, 1, 20, 'sentenceCount');

    // Validate difficulty is one of allowed values
    const allowedDifficulties = ['beginner', 'intermediate', 'advanced'];
    if (!allowedDifficulties.includes(difficulty)) {
      return new Response(JSON.stringify({ error: 'Invalid difficulty level' }), {
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

    // --- Rate Limit Check ---
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );
    const { data: rlCheck } = await serviceClient.rpc('check_rate_limit', { _function_name: 'generate-story', _user_id: userId });
    if (rlCheck && !rlCheck.allowed) {
      console.warn('Rate limit hit for generate-story:', rlCheck.reason);
      return new Response(JSON.stringify({ error: `Rate limit exceeded: ${rlCheck.reason}` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const difficultyPrompts: Record<string, string> = {
      beginner: "Use very simple words and short sentences (5-8 words each). Avoid complex vocabulary.",
      intermediate: "Use medium complexity with some descriptive words. Sentences can be 8-12 words.",
      advanced: "Use rich vocabulary and varied sentence structures. Sentences can be 12-20 words.",
    };

    const systemPrompt = `You are a creative storyteller for children who stammer. Create engaging, fun stories that are perfect for speech practice.

Guidelines:
- ${difficultyPrompts[difficulty] || difficultyPrompts.beginner}
- Make the story engaging and positive
- Include the topic naturally throughout the story
- Each sentence should be clear and easy to read aloud
- Avoid tongue twisters or difficult sound combinations
- End the story on a happy, encouraging note`;

    const userPrompt = `Create a story about "${topic}" with exactly ${sentenceCount} sentences. The story should be fun and engaging for a child to read aloud.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limits exceeded, please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required, please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      console.error('AI gateway error:', response.status);
      return new Response(JSON.stringify({ error: "Unable to generate story" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content || "";

    console.log('Story generated for user:', userId);

    return new Response(JSON.stringify({ story }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-story function:", error);
    return new Response(JSON.stringify({ error: "Unable to process request" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
