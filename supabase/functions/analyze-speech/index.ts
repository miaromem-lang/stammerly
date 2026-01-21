import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

interface WordTiming {
  word: string;
  start: number;
  end: number;
  duration: number;
}

// Analyze word timings for acoustic disfluency patterns
function analyzeAcousticPatterns(words: WordTiming[]) {
  const patterns: any[] = [];
  
  if (!words || words.length === 0) return patterns;
  
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    const prevWord = words[i - 1];
    
    // Detect prolongations (unusually long words)
    const avgDuration = words.reduce((sum, w) => sum + w.duration, 0) / words.length;
    if (word.duration > avgDuration * 2) {
      patterns.push({
        type: 'Prolongation',
        word: word.word,
        severity: word.duration > avgDuration * 3 ? 'severe' : 'moderate',
        details: `Word "${word.word}" was ${(word.duration * 1000).toFixed(0)}ms (avg: ${(avgDuration * 1000).toFixed(0)}ms)`
      });
    }
    
    // Detect blocks (long pauses before words)
    if (prevWord) {
      const gap = word.start - prevWord.end;
      if (gap > 0.5) { // > 500ms pause
        patterns.push({
          type: 'Block',
          word: word.word,
          severity: gap > 1.0 ? 'severe' : gap > 0.7 ? 'moderate' : 'mild',
          details: `${(gap * 1000).toFixed(0)}ms pause before "${word.word}"`
        });
      }
    }
  }
  
  return patterns;
}

// Detect text-based disfluencies
function detectTextDisfluencies(text: string) {
  const disfluencies: any[] = [];
  const lowerText = text.toLowerCase();
  
  // Sound/syllable repetitions: "b-b-ball", "ba-ba-baby"
  const repetitionPattern = /\b(\w{1,3})-\1+(-\w+)?\b/gi;
  let match;
  while ((match = repetitionPattern.exec(text)) !== null) {
    disfluencies.push({
      type: 'SoundRepetition',
      word: match[0],
      severity: 'moderate',
      suggestion: 'Try starting the word more gently with easy onset'
    });
  }
  
  // Word repetitions: "the the", "I I I"
  const wordRepPattern = /\b(\w+)\s+\1\b/gi;
  while ((match = wordRepPattern.exec(text)) !== null) {
    disfluencies.push({
      type: 'WordRepetition',
      word: match[0],
      severity: 'mild',
      suggestion: 'Pause, take a breath, then continue smoothly'
    });
  }
  
  // Interjections
  const interjections = ['um', 'uh', 'er', 'ah', 'like', 'you know', 'well'];
  for (const filler of interjections) {
    const regex = new RegExp(`\\b${filler}\\b`, 'gi');
    while ((match = regex.exec(lowerText)) !== null) {
      disfluencies.push({
        type: 'Interjection',
        word: filler,
        severity: 'mild',
        suggestion: 'It\'s okay to pause silently instead of using filler words'
      });
    }
  }
  
  return disfluencies;
}

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

    const { transcript, targetPhrase, words } = await req.json();
    
    if (!transcript) {
      throw new Error('No transcript provided');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    console.log('Analyzing speech for user:', userId, { transcript, targetPhrase, wordCount: words?.length });

    // Pre-analyze acoustic patterns from word timings
    const acousticPatterns = analyzeAcousticPatterns(words || []);
    const textDisfluencies = detectTextDisfluencies(transcript);
    
    console.log('Pre-analysis:', { 
      acousticPatterns: acousticPatterns.length, 
      textDisfluencies: textDisfluencies.length 
    });

    // Enhanced system prompt with pre-analyzed data
    const systemPrompt = `You are an expert speech-language pathologist specializing in fluency disorders in children ages 4-12. You use evidence-based assessment methods.

ACOUSTIC ANALYSIS ALREADY DETECTED:
${acousticPatterns.length > 0 ? acousticPatterns.map(p => `- ${p.type}: "${p.word}" (${p.severity}) - ${p.details}`).join('\n') : 'No acoustic anomalies detected'}

TEXT PATTERN ANALYSIS DETECTED:
${textDisfluencies.length > 0 ? textDisfluencies.map(d => `- ${d.type}: "${d.word}"`).join('\n') : 'No text-based disfluencies detected'}

SCORING FRAMEWORK:
- Base score: 100
- Per Block: -10 (severe), -7 (moderate), -5 (mild)
- Per Repetition: -8 (sound), -6 (syllable), -4 (word)
- Per Prolongation: -6
- Per Interjection: -2
- Bonus for detected techniques: +5 each

Be precise: incorporate the pre-analyzed patterns into your assessment. Don't ignore them.`;

    const userPrompt = `## SPEECH SAMPLE

**Target Phrase:** "${targetPhrase}"
**Spoken Transcript:** "${transcript}"
**Word Count:** ${(words || []).length}
**Total Duration:** ${words && words.length > 0 ? (words[words.length - 1].end).toFixed(2) : 0}s

Analyze this sample incorporating the pre-detected patterns. Provide accurate clinical assessment.`;

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
              description: 'Provide detailed clinical analysis of speech sample',
              parameters: {
                type: 'object',
                properties: {
                  fluencyScore: {
                    type: 'number',
                    description: 'Overall fluency score 0-100. Use the scoring framework accurately.'
                  },
                  accuracy: {
                    type: 'number',
                    description: 'Word accuracy percentage comparing transcript to target (0-100)'
                  },
                  easyOnsetScore: {
                    type: 'number',
                    description: 'Easy onset technique usage score (0-100)'
                  },
                  pacingScore: {
                    type: 'number',
                    description: 'Pacing appropriateness score (0-100)'
                  },
                  syllablesPerMinute: {
                    type: 'number',
                    description: 'Estimated syllables per minute'
                  },
                  percentSyllablesStuttered: {
                    type: 'number',
                    description: 'Percentage of syllables with disfluencies'
                  },
                  disfluencies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { type: 'string' },
                        word: { type: 'string' },
                        severity: { type: 'string' },
                        suggestion: { type: 'string' }
                      }
                    },
                    description: 'All disfluencies including pre-detected ones'
                  },
                  strengths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific positive aspects observed'
                  },
                  areasToImprove: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Areas needing practice'
                  },
                  techniquesObserved: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Fluency techniques detected'
                  },
                  clinicalNote: {
                    type: 'string',
                    description: 'Brief clinical observation'
                  },
                  encouragement: {
                    type: 'string',
                    description: 'Warm, specific encouragement for the child'
                  }
                },
                required: ['fluencyScore', 'accuracy', 'disfluencies', 'strengths', 'encouragement']
              }
            }
          }
        ],
        tool_choice: { type: 'function', function: { name: 'analyze_speech' } }
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        console.error('Rate limit exceeded');
        return new Response(JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        console.error('AI credits exhausted');
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
    console.log('AI response received');

    // Extract the tool call arguments
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      
      // Merge pre-detected disfluencies with AI analysis
      const allDisfluencies = [
        ...acousticPatterns.map(p => ({
          type: p.type,
          word: p.word,
          severity: p.severity,
          suggestion: p.type === 'Block' ? 'Try taking a gentle breath before speaking' : 'Let the sound flow smoothly'
        })),
        ...(analysis.disfluencies || [])
      ];
      
      // Remove duplicates based on word
      const uniqueDisfluencies = allDisfluencies.filter((d, i, arr) => 
        arr.findIndex(x => x.word === d.word && x.type === d.type) === i
      );
      
      const finalAnalysis = {
        fluencyScore: Math.max(0, Math.min(100, analysis.fluencyScore ?? 75)),
        accuracy: analysis.accuracy ?? 80,
        easyOnsetScore: analysis.easyOnsetScore ?? 70,
        pacingScore: analysis.pacingScore ?? 75,
        syllablesPerMinute: analysis.syllablesPerMinute ?? 120,
        percentSyllablesStuttered: analysis.percentSyllablesStuttered ?? 5,
        disfluencies: uniqueDisfluencies,
        strengths: analysis.strengths ?? ["Good effort!"],
        areasToImprove: analysis.areasToImprove ?? [],
        techniquesObserved: analysis.techniquesObserved ?? [],
        clinicalNote: analysis.clinicalNote ?? "",
        encouragement: analysis.encouragement ?? "Great job practicing! Keep it up!",
        acousticAnalysis: {
          blocksDetected: acousticPatterns.filter(p => p.type === 'Block').length,
          prolongationsDetected: acousticPatterns.filter(p => p.type === 'Prolongation').length
        }
      };
      
      console.log('Final analysis for user:', userId);
      
      return new Response(JSON.stringify(finalAnalysis), {
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
