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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY is not configured');

    const start = Date.now();

    // Build the prompt and attempt multimodal reference to the video URL
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-pro',
        messages: [
          {
            role: 'system',
            content: `You are an expert deepfake and AI-media verification assistant. Given a short video, determine whether it appears real, suspicious, or AI-generated. Output strictly valid JSON.`
          },
          {
            role: 'user',
            content: [
              { type: 'text', text: `Analyze this video and detect if it's AI-generated, a deepfake, or real. Return JSON with fields: trustScore (0-100), category (Real & Verified | Suspicious | Fake or AI-Generated), summary (1-2 sentences), authenticity, aiDetection, sources (array), sourcesChecked (number), confidence (High|Medium|Low).` },
              // Attempt to pass media reference (some models can use remote URLs)
              { type: 'image_url', image_url: { url: fileUrl } }
            ]
          }
        ]
      })
    });

    if (!response.ok) {
      const t = await response.text();
      console.error('AI gateway error:', response.status, t);
      return new Response(JSON.stringify({ error: 'AI analysis failed' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const json = await response.json();
    const content = json.choices?.[0]?.message?.content as string | undefined;
    if (!content) throw new Error('Empty AI response');

    let analysis: any;
    try {
      const match = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
      analysis = JSON.parse(match ? match[1] || match[0] : content);
    } catch (e) {
      console.error('Failed to parse AI JSON:', content);
      analysis = {
        trustScore: 40,
        category: 'Suspicious',
        summary: 'AI analysis unavailable or unstructured. Returning conservative assessment.',
        authenticity: 'Uncertain',
        aiDetection: 'Could not conclusively assess video frames',
        sources: ['Model Heuristics'],
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
