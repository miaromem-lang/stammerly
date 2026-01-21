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

function validateArray(value: unknown, maxItems: number, fieldName: string): unknown[] {
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${fieldName}: must be an array`);
  }
  if (value.length > maxItems) {
    throw new Error(`Invalid ${fieldName}: exceeds maximum items`);
  }
  return value;
}

function validateObject(value: unknown, fieldName: string): Record<string, unknown> {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    throw new Error(`Invalid ${fieldName}: must be an object`);
  }
  return value as Record<string, unknown>;
}

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);
  
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

    const questId = validateString(rawBody.questId || '', 100, 'questId');
    const message = validateString(rawBody.message, 5000, 'message');
    const conversationHistory = validateArray(rawBody.conversationHistory || [], 100, 'conversationHistory');
    const questContext = rawBody.questContext ? validateObject(rawBody.questContext, 'questContext') : {};

    // Validate conversation history items
    const validatedHistory = conversationHistory.map((msg: unknown, index: number) => {
      if (typeof msg !== 'object' || msg === null) {
        throw new Error(`Invalid conversation history item at index ${index}`);
      }
      const msgObj = msg as Record<string, unknown>;
      return {
        role: validateString(msgObj.role, 20, 'role'),
        message: validateString(msgObj.message as string, 5000, 'message')
      };
    });

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Safely extract quest context values
    const questTitle = typeof questContext.questTitle === 'string' ? questContext.questTitle : 'Unknown';
    const exerciseCategory = typeof questContext.exerciseCategory === 'string' ? questContext.exerciseCategory : 'Unknown';
    const therapistReason = typeof questContext.therapistReason === 'string' ? questContext.therapistReason : 'Not provided';
    const aiFeedback = typeof questContext.aiFeedback === 'string' ? questContext.aiFeedback : 'Not provided';
    const aiAgrees = questContext.aiAgrees;
    const aiAlternativeSuggestion = typeof questContext.aiAlternativeSuggestion === 'string' ? questContext.aiAlternativeSuggestion : null;
    const childAnalytics = questContext.childAnalytics || null;

    const systemPrompt = `You are a collaborative AI speech therapy assistant having a conversation with a licensed speech-language pathologist (SLP). 

Your role is to:
1. Discuss therapy recommendations and reasoning
2. Share insights from the child's practice data
3. Learn from the therapist's clinical expertise
4. Explain your reasoning when you make suggestions
5. Be open to changing your recommendations based on the therapist's input
6. Ask clarifying questions when helpful

Context about this quest:
- Quest Title: ${questTitle}
- Exercise Category: ${exerciseCategory}
- Therapist's Original Reasoning: ${therapistReason}
- AI's Original Feedback: ${aiFeedback}
- AI Originally Agreed: ${aiAgrees ?? "Unknown"}
${aiAlternativeSuggestion ? `- AI's Alternative Suggestion: ${aiAlternativeSuggestion}` : ""}

Child's Analytics Summary:
${childAnalytics ? JSON.stringify(childAnalytics, null, 2) : "No analytics available"}

Be conversational, professional, and collaborative. Keep responses concise (2-4 sentences typically). 
Remember: The therapist has clinical expertise you don't have - respect their judgment while sharing data-driven insights.`;

    // Build messages array from conversation history
    const messages = [
      { role: "system", content: systemPrompt },
      ...validatedHistory.map((msg: { role: string; message: string }) => ({
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
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Unable to process request" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const aiMessage = aiResult.choices?.[0]?.message?.content || "I'm having trouble responding right now. Please try again.";

    console.log('AI chat response for user:', userId);

    return new Response(JSON.stringify({ message: aiMessage }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in therapist-ai-chat:", error);
    return new Response(JSON.stringify({ error: "Unable to process request" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
