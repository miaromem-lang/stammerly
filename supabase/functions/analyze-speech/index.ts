import "https://deno.land/x/xhr@0.1.0/mod.ts";
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

    // Enhanced system prompt for better fluency analysis
    const systemPrompt = `You are an expert speech-language pathologist with 20+ years of experience in fluency disorders, particularly stammering/stuttering in children ages 4-12. You specialize in evidence-based assessment using the Lidcombe Program and Camperdown Program methodologies.

CRITICAL ANALYSIS FRAMEWORK:

## 1. DISFLUENCY DETECTION (Be thorough and precise)

### CORE DISFLUENCY TYPES (Count each occurrence):

**BLOCKS (B)** - Most severe, score heavily:
- Complete stops in airflow before or during speech
- Indicated by: "...", "I... want", sudden pauses mid-word
- Often accompanied by physical tension
- Score: -10 points per block detected

**SOUND REPETITIONS (SR)** - Characteristic of stammering:
- Single sound repeated: "b-b-ball", "s-s-see", "th-th-the"
- Initial phoneme repetitions are most common
- Score: -8 points per occurrence

**SYLLABLE REPETITIONS (SyR)**:
- Partial word repetitions: "ba-ba-baby", "ta-ta-table"
- Score: -7 points per occurrence

**WORD REPETITIONS (WR)**:
- Whole word repeated: "I I I want", "the the dog"
- Score: -5 points per occurrence

**PROLONGATIONS (P)**:
- Sound stretched abnormally: "sssssun", "mmmmom", "aaand"
- Vowels or continuant consonants held too long
- Score: -6 points per occurrence

**INTERJECTIONS (I)**:
- Filler sounds: "um", "uh", "er", "like", "you know"
- May indicate struggle or avoidance
- Score: -3 points per occurrence

**REVISIONS (R)**:
- False starts and changes: "I want... I need... I want to go"
- Abandoning a word/phrase to start again
- Score: -4 points per occurrence

## 2. FLUENCY ENHANCEMENT TECHNIQUES (Reward when detected):

**EASY ONSET** - Starting words gently with breathy quality:
- Look for gentle, relaxed word beginnings
- +5 points if detected

**LIGHT ARTICULATORY CONTACT** - Soft consonant production:
- Gentle touching of tongue/lips for sounds
- +4 points if speech sounds relaxed

**APPROPRIATE PACING** - Natural rhythm with pauses:
- Reasonable rate, deliberate but not rushed
- +5 points for good pacing

**CONTINUOUS PHONATION** - Smooth connections between words:
- Linking words without abrupt stops
- +4 points if detected

## 3. SCORING CALCULATION:

Base Score: 100 points
- Subtract for each disfluency (weights above)
- Add for detected techniques
- Minimum score: 0, Maximum: 100

ACCURACY CALCULATION:
- Compare transcript to target phrase
- Calculate word-by-word match percentage
- Account for minor pronunciation variations

## 4. RESPONSE REQUIREMENTS:

You MUST provide precise, clinically accurate feedback:
- Count EACH disfluency individually
- Identify SPECIFIC words where disfluencies occur
- Note patterns (word-initial sounds, specific phonemes, etc.)
- Provide actionable, child-friendly encouragement

BE OBJECTIVE: Don't inflate scores. A transcript with multiple disfluencies should NOT score above 70. 
A clean transcript with no issues can score 85-95.
Perfect technique usage with zero disfluencies: 95-100.`;

    const userPrompt = `## SPEECH SAMPLE ANALYSIS

**Target Phrase:** "${targetPhrase}"
**Spoken Transcript:** "${transcript}"

ANALYZE THIS SAMPLE:

1. First, identify ANY differences between target and transcript
2. Count all disfluency types present (even subtle ones)
3. Note any fluency techniques being used
4. Calculate scores based on the framework
5. Provide specific, constructive feedback

Be CLINICALLY ACCURATE. If the transcript shows disfluencies, the fluency score must reflect this.
If the transcript is clean and matches the target well, score appropriately high.

Provide your analysis using the analyze_speech function.`;

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
              description: 'Provide detailed clinical analysis of speech sample with accurate scoring',
              parameters: {
                type: 'object',
                properties: {
                  fluencyScore: {
                    type: 'number',
                    description: 'Overall fluency score from 0-100 based on disfluency count and severity. Be accurate: many disfluencies = low score (40-60), some disfluencies = medium score (60-80), few/none = high score (80-100)'
                  },
                  accuracy: {
                    type: 'number',
                    description: 'Word accuracy percentage - how closely the transcript matches the target phrase (0-100)'
                  },
                  easyOnsetScore: {
                    type: 'number',
                    description: 'Score for easy onset technique usage (0-100). 0 if hard/tense beginnings detected, 100 if all words started gently'
                  },
                  pacingScore: {
                    type: 'number',
                    description: 'Score for appropriate pacing (0-100). Consider if speech was too fast, too slow, or well-paced'
                  },
                  syllablesPerMinute: {
                    type: 'number',
                    description: 'Estimated syllables per minute based on transcript length (typical range 100-200 for children)'
                  },
                  percentSyllablesStuttered: {
                    type: 'number',
                    description: 'Percentage of syllables with disfluencies (0-100). Clinical measure of stuttering severity'
                  },
                  disfluencies: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        type: { 
                          type: 'string',
                          description: 'Type: Block, SoundRepetition, SyllableRepetition, WordRepetition, Prolongation, Interjection, Revision'
                        },
                        word: { 
                          type: 'string',
                          description: 'The specific word or sound where disfluency occurred'
                        },
                        severity: {
                          type: 'string',
                          description: 'Severity: mild, moderate, severe'
                        },
                        suggestion: { 
                          type: 'string',
                          description: 'Child-friendly tip to address this specific disfluency'
                        }
                      }
                    },
                    description: 'List of ALL identified disfluencies with details. Include every instance found.'
                  },
                  strengths: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific positive aspects observed (e.g., "Good use of easy onset on word Sally", "Smooth connection between words")'
                  },
                  areasToImprove: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Specific areas needing practice (e.g., "Focus on gentle start for S sounds", "Practice slowing down on longer words")'
                  },
                  techniquesObserved: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Any fluency shaping techniques detected in the speech'
                  },
                  clinicalNote: {
                    type: 'string',
                    description: 'Brief clinical observation for therapist review (1-2 sentences)'
                  },
                  encouragement: {
                    type: 'string',
                    description: 'A warm, specific, encouraging message for the child based on their actual performance. Be genuine and specific to what they did well.'
                  }
                },
                required: ['fluencyScore', 'accuracy', 'easyOnsetScore', 'pacingScore', 'disfluencies', 'strengths', 'encouragement']
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
    console.log('AI response:', JSON.stringify(result, null, 2));

    // Extract the tool call arguments
    const toolCall = result.choices?.[0]?.message?.tool_calls?.[0];
    if (toolCall?.function?.arguments) {
      const analysis = JSON.parse(toolCall.function.arguments);
      
      // Ensure we have all required fields with defaults
      const finalAnalysis = {
        fluencyScore: analysis.fluencyScore ?? 75,
        accuracy: analysis.accuracy ?? 80,
        easyOnsetScore: analysis.easyOnsetScore ?? 70,
        pacingScore: analysis.pacingScore ?? 75,
        syllablesPerMinute: analysis.syllablesPerMinute ?? 120,
        percentSyllablesStuttered: analysis.percentSyllablesStuttered ?? 5,
        disfluencies: analysis.disfluencies ?? [],
        strengths: analysis.strengths ?? ["Good effort!"],
        areasToImprove: analysis.areasToImprove ?? [],
        techniquesObserved: analysis.techniquesObserved ?? [],
        clinicalNote: analysis.clinicalNote ?? "",
        encouragement: analysis.encouragement ?? "Great job practicing! Keep it up!"
      };
      
      console.log('Final analysis:', JSON.stringify(finalAnalysis, null, 2));
      
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