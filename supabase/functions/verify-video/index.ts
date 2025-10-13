import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) throw new Error('Missing authorization header');

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Unauthorized');

    const { fileUrl, mimeType, fileName } = await req.json();
    if (!fileUrl || !mimeType) throw new Error('fileUrl and mimeType are required');

    // Basic validation for supported video types
    const allowed = ['video/mp4', 'video/quicktime', 'video/x-msvideo', 'video/webm'];
    if (!allowed.includes(mimeType)) {
      return new Response(JSON.stringify({ error: 'Unsupported video format. Please upload MP4, MOV, AVI, or WEBM.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');

    const start = Date.now();

    // Send video to Gemini API for analysis
    const prompt = `
Analyze this video for authenticity and detect whether it is AI-generated, deepfake, or real.
Provide a clear trust score (0-100), authenticity label (Real & Verified, Suspicious, or Fake or AI-Generated), and detailed explanation.

Return your response in JSON format with the following fields:
- trustScore: number (0-100)
- category: string (one of: "Real & Verified", "Suspicious", "Fake or AI-Generated")
- summary: string (1-2 sentences)
- authenticity: string (detailed authenticity assessment)
- aiDetection: string (AI detection analysis)
- sources: array of strings (verification sources)
- sourcesChecked: number
- confidence: string (High, Medium, or Low)
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                { text: prompt },
                {
                  fileData: {
                    mimeType: mimeType,
                    fileUri: fileUrl
                  }
                }
              ]
            }
          ]
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: `Gemini API request failed: ${errorText}` }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const json = await response.json();
    const aiText = json.candidates?.[0]?.content?.parts?.[0]?.text as string | undefined;
    if (!aiText) throw new Error('Empty AI response from Gemini');

    let analysis: any;
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiText.match(/```json\n([\s\S]*?)\n```/) || aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        analysis = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } else {
        // If no JSON found, try to extract trust score from text
        const scoreMatch = aiText.match(/(\d{1,3})%/);
        const trustScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;
        
        analysis = {
          trustScore,
          category: trustScore > 80 ? 'Real & Verified' : trustScore > 50 ? 'Suspicious' : 'Fake or AI-Generated',
          summary: aiText.substring(0, 200),
          authenticity: 'Analysis based on text response',
          aiDetection: aiText,
          sources: ['Gemini 1.5 Pro Analysis'],
          sourcesChecked: 1,
          confidence: trustScore > 70 ? 'High' : trustScore > 40 ? 'Medium' : 'Low'
        };
      }
    } catch (e) {
      console.error('Failed to parse Gemini response:', aiText, e);
      analysis = {
        trustScore: 40,
        category: 'Suspicious',
        summary: 'Unable to parse AI analysis. Returning conservative assessment.',
        authenticity: 'Uncertain',
        aiDetection: 'Could not conclusively assess video',
        sources: ['Gemini Analysis'],
        sourcesChecked: 1,
        confidence: 'Low'
      };
    }

    const processingTime = Math.round((Date.now() - start) / 1000);

    // Persist to DB (reusing existing schema)
    const { error: dbError } = await supabase
      .from('verifications')
      .insert({
        user_id: user.id,
        content_url: fileUrl,
        content_type: 'video',
        trust_score: analysis.trustScore ?? 0,
        summary: analysis.summary ?? null,
        detailed_explanation: analysis.authenticity ?? null,
        is_ai_generated: (analysis.category || '').toLowerCase().includes('fake')
      });

    if (dbError) console.error('DB insert error (verify-video):', dbError);

    return new Response(
      JSON.stringify({
        trustScore: analysis.trustScore ?? 0,
        category: analysis.category ?? 'Suspicious',
        summary: analysis.summary ?? 'Partial analysis',
        authenticity: analysis.authenticity ?? 'Unknown',
        aiDetection: analysis.aiDetection ?? 'Unknown',
        sources: analysis.sources ?? ['Gemini Analysis'],
        processingTime,
        sourcesChecked: analysis.sourcesChecked ?? 1,
        confidence: analysis.confidence ?? 'Low',
        videoUrl: fileUrl
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('verify-video error:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
