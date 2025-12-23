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
    const { transcript, targetPhrase } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing speech:', { transcript, targetPhrase });

    const systemPrompt = `You are an expert speech-language pathologist specializing in fluency disorders, particularly stammering/stuttering in children. Analyze the transcribed speech and provide helpful, encouraging feedback.

Your task is to:
1. Compare the spoken transcript to the target phrase
2. Identify any disfluencies (repetitions, prolongations, blocks, interjections)
3. Assess fluency techniques like easy onset, light contact, and pacing
4. Provide a fluency score (0-100)
5. Give specific, actionable feedback that is encouraging and child-friendly

Focus on progress and positive reinforcement while noting areas for practice.`;

    const userPrompt = `Target phrase: "${targetPhrase}"
Spoken transcript: "${transcript}"

Analyze this speech sample for fluency and provide feedback.`;

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
        tools: [
          {
            type: 'function',
            function: {
              name: 'analyze_speech',
              description: 'Analyze speech sample and return structured feedback',
              parameters: {
                type: 'object',
                properties: {
                  fluencyScore: {
                    type: 'number',
                    description: 'Overall fluency score from 0-100'
                  },
                  accuracy: {
                    type: 'number',
                    description: 'Word accuracy percentage compared to target'
                  },
                  easyOnsetScore: {
                    type: 'number',
                    description: 'Score for easy onset technique usage (0-100)'
                  },
                  pacingScore: {
                    type: 'number',
                    description: 'Score for appropriate pacing (0-100)'
                  },
                  disfluencies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        word: { type: 'string' },
                        suggestion: { type: 'string' }
                      }
                    },
                    description: 'List of identified disfluencies'
                  },
                  strengths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Positive aspects of the speech'
                  },
                  areasToImprove: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Areas that could use more practice'
                  },
                  encouragement: {
                    type: 'string',
                    description: 'A friendly, encouraging message for the child'
                  }
                },
                required: ['fluencyScore', 'accuracy', 'easyOnsetScore', 'pacingScore', 'strengths', 'encouragement']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_speech' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI credits exhausted. Please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const result = await response.json();
    console.log('AI response:', JSON.stringify(result, null, 2));

    // Extract the tool call arguments
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    throw new Error('No analysis returned from AI');

  } catch (error: unknown) {
    console.error('Speech analysis error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to analyze speech';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
