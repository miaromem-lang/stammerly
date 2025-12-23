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
    const { topic, difficulty, sentenceCount } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const difficultyPrompts = {
      beginner: "Use very simple words and short sentences (5-8 words each). Avoid complex vocabulary.",
      intermediate: "Use medium complexity with some descriptive words. Sentences can be 8-12 words.",
      advanced: "Use rich vocabulary and varied sentence structures. Sentences can be 12-20 words.",
    };

    const systemPrompt = `You are a creative storyteller for children who stammer. Create engaging, fun stories that are perfect for speech practice.

Guidelines:
- ${difficultyPrompts[difficulty as keyof typeof difficultyPrompts] || difficultyPrompts.beginner}
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
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    const story = data.choices?.[0]?.message?.content || "";

    return new Response(JSON.stringify({ story }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in generate-story function:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
