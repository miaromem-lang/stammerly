import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ClinicalData {
  weightedStutteringSeverity: number;
  percentSyllablesStuttered: number;
  sldCount: number;
  odCount: number;
  initiationLagMs: number | null;
  naturalnessScore: number | null;
  blocksCount: number;
  prolongationsCount: number;
  repetitionsCount: number;
  easyOnsetScore: number | null;
  easyOnsetAttempts: number;
  easyOnsetSuccesses: number;
  totalSessions: number;
  adherenceRate: number;
  streakDays: number;
  patientName?: string;
  sessionDate?: string;
  // Psychosocial
  recentMoodAvg?: number | null;
  recentAnxietyAvg?: number | null;
  moodTrend?: string | null;
  moodCheckinCount?: number;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // --- JWT validation ---
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const { data: userData, error: userErr } = await authClient.auth.getUser(token);
    if (userErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Restrict to therapists/admins only
    const { data: roles } = await serviceClient
      .from('user_roles')
      .select('role')
      .eq('user_id', userData.user.id);
    const allowed = (roles || []).some((r: { role: string }) => r.role === 'therapist' || r.role === 'admin');
    if (!allowed) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { clinicalData } = await req.json() as { clinicalData: ClinicalData };

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(JSON.stringify({ error: 'Service temporarily unavailable' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // --- Rate Limit Check (per-user) ---
    const { data: rlCheck } = await serviceClient.rpc('check_rate_limit', {
      _function_name: 'generate-soap-note',
      _user_id: userData.user.id,
    });
    if (rlCheck && !rlCheck.allowed) {
      console.warn('Rate limit hit for generate-soap-note:', rlCheck.reason);
      return new Response(JSON.stringify({ error: `Rate limit exceeded: ${rlCheck.reason}` }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const date = clinicalData.sessionDate || new Date().toLocaleDateString();
    const name = clinicalData.patientName || "Patient";
    
    const systemPrompt = `You are a speech-language pathologist creating clinical documentation. 
Generate a professional S.O.A.P. note (Subjective, Objective, Assessment, Plan) based on the provided clinical data.

Guidelines:
- Use professional clinical terminology
- Be concise but thorough
- Focus on stuttering/fluency disorder treatment
- Include specific metrics where available
- Make actionable recommendations
- Consider SSI-4 standards for severity ratings
- When psychosocial data (mood/anxiety check-ins) is available, integrate it into the Subjective and Assessment sections, noting correlations with fluency patterns per Parsons et al. (2021)`;

    const userPrompt = `Generate a S.O.A.P. note for a pediatric stuttering patient with the following data:

Patient: ${name}
Date: ${date}

OBJECTIVE METRICS:
- Weighted Stuttering Severity (WSS): ${clinicalData.weightedStutteringSeverity.toFixed(1)}/100
- Percent Syllables Stuttered (%SS): ${clinicalData.percentSyllablesStuttered.toFixed(1)}%
- Stutter-Like Disfluencies (SLD): ${clinicalData.sldCount}
- Other Disfluencies (OD): ${clinicalData.odCount}
- Blocks: ${clinicalData.blocksCount}
- Prolongations: ${clinicalData.prolongationsCount}
- Repetitions: ${clinicalData.repetitionsCount}
- Initiation Lag: ${clinicalData.initiationLagMs ? clinicalData.initiationLagMs.toFixed(0) + 'ms' : 'Not measured'}
- Naturalness Score: ${clinicalData.naturalnessScore ?? 'Not measured'}/9

TECHNIQUE METRICS:
- Easy Onset Score: ${clinicalData.easyOnsetScore ?? 'N/A'}%
- Easy Onset Attempts: ${clinicalData.easyOnsetAttempts}
- Easy Onset Successes: ${clinicalData.easyOnsetSuccesses}
- Success Rate: ${clinicalData.easyOnsetAttempts > 0 ? ((clinicalData.easyOnsetSuccesses / clinicalData.easyOnsetAttempts) * 100).toFixed(0) : 'N/A'}%

ENGAGEMENT METRICS:
- Total Sessions: ${clinicalData.totalSessions}
- Adherence Rate: ${clinicalData.adherenceRate.toFixed(0)}%
- Current Streak: ${clinicalData.streakDays} days
${clinicalData.recentMoodAvg != null ? `
PSYCHOSOCIAL DATA (self-reported by child):
- Average Mood Score: ${clinicalData.recentMoodAvg.toFixed(1)}/5
- Average Anxiety Level: ${clinicalData.recentAnxietyAvg != null ? clinicalData.recentAnxietyAvg.toFixed(1) + '/10' : 'Not reported'}
- Mood Trend: ${clinicalData.moodTrend || 'Insufficient data'}
- Check-ins Recorded: ${clinicalData.moodCheckinCount || 0}
` : ''}
Format the note with clear section headers (SUBJECTIVE, OBJECTIVE, ASSESSMENT, PLAN) and use bullet points where appropriate.${clinicalData.recentMoodAvg != null ? ' Include psychosocial observations in the SUBJECTIVE section and consider emotional factors in the ASSESSMENT.' : ''}`;

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
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    const soapNote = result.choices?.[0]?.message?.content || 'Unable to generate note';

    // --- Log API Usage ---
    try {
      const usageTokens = soapNote.length;
      await serviceClient.from('api_usage_logs').insert({
        function_name: 'generate-soap-note',
        tokens_used: usageTokens,
        estimated_cost_gbp: usageTokens * 0.000002,
        status: 'success',
      });
    } catch (logErr) { console.error('Usage logging failed:', logErr); }

    console.log('S.O.A.P. note generated successfully');

    return new Response(JSON.stringify({ soapNote }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error generating S.O.A.P. note:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate note' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
