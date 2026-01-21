import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
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

    const { exerciseCategory, exerciseId, questTitle, therapistReason, childAnalytics } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a speech therapy AI assistant that collaborates with human therapists. Your role is to:
1. Analyze therapist quest assignments for children who stutter
2. Provide constructive feedback based on the child's practice data
3. Either agree with the therapist's recommendation or respectfully suggest alternatives
4. Always be collaborative and supportive of both the therapist and the child

When you disagree, explain why based on the data and offer a specific alternative.
When you agree, reinforce why the recommendation is good.

Keep responses concise and actionable. Be specific about exercise categories when suggesting alternatives.`;

    const userPrompt = `A therapist has assigned a quest for a child who stutters:

**Quest Title:** ${questTitle}
**Exercise Category:** ${exerciseCategory}
**Exercise ID:** ${exerciseId}
**Therapist's Reasoning:** ${therapistReason}

**Child's Recent Practice Analytics:**
${JSON.stringify(childAnalytics, null, 2)}

Please analyze this assignment and provide:
1. Whether you agree or disagree with this recommendation
2. Your reasoning based on the child's data
3. If you disagree, suggest a specific alternative exercise category and explain why

Respond in JSON format:
{
  "agrees": true/false,
  "feedback": "Your analysis and reasoning (2-3 sentences)",
  "alternativeSuggestion": "If you disagree, suggest alternative here, otherwise null"
}`;

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
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits required. Please add funds." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error("AI gateway error");
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse the JSON response from AI
    let parsedFeedback;
    try {
      // Extract JSON from the response (handle markdown code blocks)
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedFeedback = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", content);
      parsedFeedback = {
        agrees: true,
        feedback: "AI analysis unavailable. The therapist's recommendation stands.",
        alternativeSuggestion: null,
      };
    }

    console.log('Quest validation for user:', userId);

    return new Response(JSON.stringify(parsedFeedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in validate-quest-assignment:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
