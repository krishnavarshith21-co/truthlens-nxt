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
    const { content, contentType, isBase64Image, mimeType } = await req.json();
    
    if (!content) {
      throw new Error('Content is required');
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const startTime = Date.now();

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

    return new Response(JSON.stringify(analysis), {
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
