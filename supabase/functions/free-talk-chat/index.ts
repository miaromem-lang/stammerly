import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, characterName, characterPersonality, conversationHistory } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are ${characterName}, a friendly animal character who helps children practice speaking fluently. Your personality is ${characterPersonality}.

Your role:
1. Be encouraging, warm, and supportive
2. Keep responses SHORT (2-3 sentences max for a child to read/listen)
3. Ask simple follow-up questions to keep the conversation going
4. Occasionally remind them to breathe, slow down, or use easy onset
5. Celebrate their efforts with enthusiasm
6. If they seem to struggle, offer gentle encouragement

Also analyze the user's message for potential disfluencies:
- Blocks: sudden stops or pauses (indicated by "..." or repeated attempts)
- Repetitions: repeated sounds/words (like "I-I-I" or "the the the")
- Prolongations: stretched sounds (like "sssso" or "aaaand")
- Interjections: filler words (like "um", "uh", "like", "you know")

Speak like a friendly animal buddy, not a therapist. Use simple words a child would understand.`;

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
