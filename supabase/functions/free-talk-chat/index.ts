import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
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

    const { message, characterName, characterPersonality, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
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
      ...conversationHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content
      })),
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    
    if (toolCall?.function?.arguments) {
      const result = JSON.parse(toolCall.function.arguments);
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
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : "Unknown error",
      response: "Oops, I got a little confused! Can you tell me that again? 🦦"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
