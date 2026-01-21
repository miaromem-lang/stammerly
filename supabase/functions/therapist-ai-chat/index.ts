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

    const { questId, message, conversationHistory, questContext } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are a collaborative AI speech therapy assistant having a conversation with a licensed speech-language pathologist (SLP). 

Your role is to:
1. Discuss therapy recommendations and reasoning
2. Share insights from the child's practice data
3. Learn from the therapist's clinical expertise
4. Explain your reasoning when you make suggestions
5. Be open to changing your recommendations based on the therapist's input
6. Ask clarifying questions when helpful

Context about this quest:
- Quest Title: ${questContext?.questTitle || "Unknown"}
- Exercise Category: ${questContext?.exerciseCategory || "Unknown"}
- Therapist's Original Reasoning: ${questContext?.therapistReason || "Not provided"}
- AI's Original Feedback: ${questContext?.aiFeedback || "Not provided"}
- AI Originally Agreed: ${questContext?.aiAgrees ?? "Unknown"}
${questContext?.aiAlternativeSuggestion ? `- AI's Alternative Suggestion: ${questContext.aiAlternativeSuggestion}` : ""}

Child's Analytics Summary:
${questContext?.childAnalytics ? JSON.stringify(questContext.childAnalytics, null, 2) : "No analytics available"}

Be conversational, professional, and collaborative. Keep responses concise (2-4 sentences typically). 
Remember: The therapist has clinical expertise you don't have - respect their judgment while sharing data-driven insights.`;

    // Build messages array from conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...conversationHistory.map((msg: { role: string; message: string }) => ({
        role: msg.role === "therapist" ? "user" : "assistant",
        content: msg.message,
      })),
      { role: "user", content: message },
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
    const aiMessage = aiResult.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

    console.log('AI chat response for user:', userId);

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in therapist-ai-chat:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
