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
    if (!authHeader) {
      throw new Error('Missing authorization header');
    }

    // Initialize Supabase client with user's auth
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    );

    // Get authenticated user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    const { content, contentType, isBase64Image, mimeType, fileName } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const startTime = Date.now();
    let imageUrl = null;

    // Upload image to Supabase Storage if it's a base64 image
    if (isBase64Image && mimeType) {
      const fileExt = mimeType.split('/')[1];
      const filePath = `${user.id}/${Date.now()}.${fileExt}`;
      
      // Convert base64 to blob
      const binaryString = atob(content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('verification-images')
        .upload(filePath, bytes, {
          contentType: mimeType,
          upsert: false
        });

      if (uploadError) {
        console.error('Storage upload error:', uploadError);
        throw new Error('Failed to upload image');
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('verification-images')
        .getPublicUrl(filePath);
      
      imageUrl = publicUrl;
    }

    // Prepare message content based on type
    let userMessage;
    if (isBase64Image && mimeType) {
      // For images, use vision capabilities
      userMessage = {
        role: 'user',
        content: [
          {
            type: 'text',
            text: `Analyze this ${contentType || 'image'} for authenticity, AI generation signs, and verify its content. Provide a detailed verification analysis.`
          },
          {
            type: 'image_url',
            image_url: {
              url: `data:${mimeType};base64,${content}`
            }
          }
        ]
      };
    } else {
      // For text content
      userMessage = {
        role: 'user',
        content: `Verify this ${contentType || 'text'} content:\n\n${content}`
      };
    }

    // Call Gemini through Lovable AI Gateway
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: `You are an expert content verification AI. Analyze content for authenticity, detect AI-generated content, and fact-check claims. 
            
            For images: Describe what you see, check for manipulation signs, assess if it's AI-generated, and verify the content's authenticity.
            For text: Analyze claims, detect AI writing patterns, and verify factual accuracy.
            
            Respond ONLY with a valid JSON object (no markdown) containing:
            - trustScore (number 0-100): Overall trust rating
            - category (string): "Real & Verified", "Suspicious", or "Fake or AI-Generated"
            - summary (string): Brief explanation of findings (2-3 sentences)
            - authenticity (string): Assessment of content authenticity
            - aiDetection (string): Analysis of AI generation signs
            - sources (array): List of verification methods used (e.g., ["Visual Analysis", "Pattern Recognition", "Gemini Vision API"])
            - sourcesChecked (number): Number of verification checks performed
            - confidence (string): "High", "Medium", or "Low"`
          },
          userMessage
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const analysisText = data.choices?.[0]?.message?.content;
    
    if (!analysisText) {
      throw new Error('No response from AI');
    }

    const processingTime = ((Date.now() - startTime) / 1000).toFixed(2);

    // Parse the JSON response from Gemini
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      const parsedData = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisText);
      
      // Ensure all required fields are present
      analysis = {
        trustScore: parsedData.trustScore || 50,
        category: parsedData.category || "Suspicious",
        summary: parsedData.summary || "Content analyzed with partial results.",
        authenticity: parsedData.authenticity || "Analysis completed.",
        aiDetection: parsedData.aiDetection || "AI detection analysis performed.",
        sources: parsedData.sources || ["Gemini Analysis"],
        processingTime: parseFloat(processingTime),
        sourcesChecked: parsedData.sourcesChecked || parsedData.sources?.length || 3,
        confidence: parsedData.confidence || "Medium"
      };
    } catch (e) {
      console.error('Failed to parse AI response:', analysisText);
      // Fallback response
      analysis = {
        trustScore: 50,
        category: "Suspicious",
        summary: "Unable to fully verify content. The AI analysis could not be properly parsed.",
        authenticity: "Analysis completed but results are uncertain",
        aiDetection: "Could not determine AI generation likelihood",
        sources: ["Gemini Analysis"],
        processingTime: parseFloat(processingTime),
        sourcesChecked: 1,
        confidence: "Low"
      };
    }

    // Save verification to database
    const { error: dbError } = await supabase
      .from('verifications')
      .insert({
        user_id: user.id,
        content_url: imageUrl,
        content_type: contentType,
        content_text: !isBase64Image ? content.substring(0, 500) : null,
        trust_score: analysis.trustScore,
        summary: analysis.summary,
        detailed_explanation: analysis.authenticity,
        is_ai_generated: analysis.category === 'Fake or AI-Generated',
        related_articles: analysis.sources
      });

    if (dbError) {
      console.error('Database insert error:', dbError);
      // Don't fail the request if DB save fails
    }

    // Update user profile stats
    await supabase
      .from('profiles')
      .select('total_verifications')
      .eq('id', user.id)
      .single()
      .then(async ({ data: profile }) => {
        if (profile) {
          await supabase
            .from('profiles')
            .update({ total_verifications: (profile.total_verifications || 0) + 1 })
            .eq('id', user.id);
        }
      });

    return new Response(JSON.stringify({ ...analysis, imageUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in verify-content:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
