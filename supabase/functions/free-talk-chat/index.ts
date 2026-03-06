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
    throw new Error(`Invalid ${fieldName}: must be a string`);
  }
  if (value.length > maxLength) {
    throw new Error(`Invalid ${fieldName}: exceeds maximum length`);
  }
  return value.trim();
}

function validateArray(value: unknown, maxItems: number, fieldName: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${fieldName}: must be an array`);
  }
  if (value.length > maxItems) {
    throw new Error(`Invalid ${fieldName}: exceeds maximum items`);
  }
  return value;
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

    const message = validateString(rawBody.message, 2000, 'message');
    const characterName = validateString(rawBody.characterName || 'Ollie', 100, 'characterName');
    const characterPersonality = validateString(rawBody.characterPersonality || 'friendly', 500, 'characterPersonality');
    const conversationHistory = validateArray(rawBody.conversationHistory || [], 50, 'conversationHistory');

    // Validate each message in conversation history
    const validatedHistory = conversationHistory.map((msg: unknown, index: number) => {
      if (typeof msg !== 'object' || msg === null) {
        throw new Error(`Invalid conversation history item at index ${index}`);
      }
      const msgObj = msg as Record<string, unknown>;
      return {
        role: validateString(msgObj.role, 20, 'role'),
        content: validateString(msgObj.content as string, 5000, 'content')
      };
    });

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
    const { data: rlCheck } = await serviceClient.rpc('check_rate_limit', { _function_name: 'free-talk-chat', _user_id: userId });
    if (rlCheck && !rlCheck.allowed) {
      console.warn('Rate limit hit for free-talk-chat:', rlCheck.reason);
      return new Response(JSON.stringify({ error: `Rate limit exceeded: ${rlCheck.reason}` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are ${characterName}, a friendly animal character who helps children practice speaking fluently. Your personality is ${characterPersonality}.

## CORE MISSION - STAY FOCUSED
You are a speech therapy practice companion. Your ONLY purpose is to help children practice fluent speech in a fun, supportive environment. You must ALWAYS keep conversations focused on:
- Practicing speaking and communication
- Building confidence in speech
- Using fluency techniques (easy onset, light contact, pacing, breathing)
- Having fun conversations that encourage more talking

## STRICT BOUNDARIES - DO NOT
- Provide medical, psychological, or therapeutic diagnoses
- Give advice on topics unrelated to speech practice (homework, relationships, personal problems)
- Discuss sensitive topics (politics, religion, violence, mature themes)
- Pretend to be a human therapist or give clinical advice
- Make promises about "curing" stuttering or disfluencies
- Compare the child to others or use negative language about their speech

If a child asks about off-topic subjects, gently redirect: "That's interesting! But hey, let's practice our talking together! Tell me about [related speech topic]."

## EVIDENCE-BASED APPROACH (from ASHA & speech pathology research)
- Stuttering is a neurological difference, NOT a sign of nervousness or low intelligence
- All speech patterns are valid - focus on COMMUNICATION, not perfection
- Praise EFFORT and PARTICIPATION, not just fluent speech
- Never ask a child to "slow down" or "take a breath" in a corrective way - model it instead
- Celebrate all attempts at communication equally
- Use positive, specific feedback: "I loved how you used your easy start!" vs generic praise

## CONVERSATION GUIDELINES
1. Keep responses SHORT (2-3 sentences max)
2. Ask ONE simple follow-up question to encourage more talking
3. Model slow, easy speech patterns in your responses (use commas and short sentences)
4. Celebrate their efforts: "Great job talking with me!" "You're doing awesome!"
5. If they mention struggling, normalize it: "Everyone's voice does tricky things sometimes. You're doing great just by practicing!"
6. Focus on WHAT they said, not HOW - respond to their ideas and interests

## DISFLUENCY DETECTION (for data only - never comment on these to the child)
Silently analyze for:
- Blocks: sudden stops or pauses (indicated by "..." or repeated attempts)
- Repetitions: repeated sounds/words (like "I-I-I" or "the the the")
- Prolongations: stretched sounds (like "sssso" or "aaaand")
- Interjections: filler words (like "um", "uh", "like", "you know")

NEVER mention detected disfluencies to the child. This data is for therapist/parent review only.

## TONE
Speak like a friendly animal buddy using simple, warm language. Be genuinely interested in what they share. Make practice feel like play, not work.`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...validatedHistory,
      { role: "user", content: message }
    ];

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages,
        tools: [
          {
            type: "function",
            function: {
              name: "respond_to_child",
              description: "Generate a response and analyze disfluencies",
              parameters: {
                type: "object",
                properties: {
                  response: {
                    type: "string",
                    description: "Your friendly response to the child (2-3 sentences)"
                  },
                  disfluencies: {
                    type: "object",
                    properties: {
                      blocks: { type: "number", description: "Count of blocks detected" },
                      repetitions: { type: "number", description: "Count of repetitions detected" },
                      prolongations: { type: "number", description: "Count of prolongations detected" },
                      interjections: { type: "number", description: "Count of interjections detected" }
                    }
                  },
                  userDisfluencies: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string" },
                        word: { type: "string" }
                      }
                    },
                    description: "Specific disfluencies found in user message"
                  }
                },
                required: ["response"]
              }
            }
          }
        ],
        tool_choice: { type: "function", function: { name: "respond_to_child" } }
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
      return new Response(JSON.stringify({ error: "Unable to process request" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
      // --- Log API Usage ---
      try {
        const usageTokens = JSON.stringify(result).length;
        await serviceClient.from('api_usage_logs').insert({
          function_name: 'free-talk-chat',
          user_id: userId,
          tokens_used: usageTokens,
          estimated_cost_gbp: usageTokens * 0.000001,
          status: 'success',
        });
      } catch (logErr) { console.error('Usage logging failed:', logErr); }
      console.log('Free talk response for user:', userId);
      return new Response(JSON.stringify(result), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fallback response
    return new Response(JSON.stringify({ 
      response: "That's wonderful! Tell me more about that! Remember to take nice slow breaths. 🌟" 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in free-talk-chat function:", error);
    // Return sanitized error message
    return new Response(JSON.stringify({ 
      error: "Unable to process request",
      response: "Oops, I got a little confused! Can you tell me that again? 🦦"
    }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
