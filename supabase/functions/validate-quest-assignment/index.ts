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

    const exerciseCategory = validateString(rawBody.exerciseCategory, 100, 'exerciseCategory');
    const exerciseId = validateString(rawBody.exerciseId, 100, 'exerciseId');
    const questTitle = validateString(rawBody.questTitle, 200, 'questTitle');
    const therapistReason = validateString(rawBody.therapistReason, 2000, 'therapistReason');
    
    // Validate childAnalytics is an object (optional)
    const childAnalytics = rawBody.childAnalytics || {};
    if (typeof childAnalytics !== 'object' || Array.isArray(childAnalytics)) {
      return new Response(JSON.stringify({ error: 'Invalid childAnalytics format' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
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
    const { data: rlCheck } = await serviceClient.rpc('check_rate_limit', { _function_name: 'validate-quest-assignment', _user_id: userId });
    if (rlCheck && !rlCheck.allowed) {
      console.warn('Rate limit hit for validate-quest-assignment:', rlCheck.reason);
      return new Response(JSON.stringify({ error: `Rate limit exceeded: ${rlCheck.reason}` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
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
      console.error("AI gateway error:", response.status);
      return new Response(JSON.stringify({ error: "Unable to process request" }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || "";

    // Parse the JSON response from AI
    let parsedFeedback;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedFeedback = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response");
      parsedFeedback = {
        agrees: true,
        feedback: "AI analysis unavailable. The therapist's recommendation stands.",
        alternativeSuggestion: null,
      };
    }

    // --- Log API Usage ---
    try {
      const usageTokens = content.length;
      await serviceClient.from('api_usage_logs').insert({
        function_name: 'validate-quest-assignment',
        user_id: userId,
        tokens_used: usageTokens,
        estimated_cost_gbp: usageTokens * 0.000001,
        status: 'success',
      });
    } catch (logErr) { console.error('Usage logging failed:', logErr); }

    console.log('Quest validation for user:', userId);

    return new Response(JSON.stringify(parsedFeedback), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in validate-quest-assignment:", error);
    return new Response(JSON.stringify({ error: "Unable to process request" }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
