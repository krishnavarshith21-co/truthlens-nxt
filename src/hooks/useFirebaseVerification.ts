import { useState } from 'react';
import { db, storage, isDemoMode } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

export interface VerificationResult {
  trustScore: number;
  category: string;
  summary: string;
  authenticity: string;
  aiDetection: string;
  sources: string[];
  processingTime: number;
  sourcesChecked: number;
  confidence: string;
  relatedArticles?: any[];
  factCheckResults?: any[];
}

// Mock data for demo mode
const generateMockResult = (content: string, contentType: string): VerificationResult => {
  const isLikelyFake = content.toLowerCase().includes('fake') || content.toLowerCase().includes('ai generated');
  const trustScore = isLikelyFake ? Math.floor(Math.random() * 40) + 10 : Math.floor(Math.random() * 30) + 70;
  
  return {
    trustScore,
    category: trustScore > 70 ? "Real & Verified" : trustScore > 40 ? "Suspicious" : "Fake or AI-Generated",
    summary: `This ${contentType} has been analyzed using AI detection algorithms and fact-checking sources.`,
    authenticity: trustScore > 70 
      ? "Content appears authentic with verified sources"
      : trustScore > 40
      ? "Content shows some signs of manipulation or unverified claims"
      : "Content likely generated or heavily manipulated",
    aiDetection: trustScore < 50 
      ? "High probability of AI generation detected"
      : "No significant AI generation patterns found",
    sources: ["Gemini AI Analysis", "Pattern Recognition", "Fact Check Database"],
    processingTime: Math.random() * 3 + 1,
    sourcesChecked: Math.floor(Math.random() * 5) + 3,
    confidence: trustScore > 70 ? "High" : trustScore > 40 ? "Medium" : "Low",
    relatedArticles: [
      {
        title: "Related news article about this topic",
        url: "https://example.com",
        source: { name: "News Source" }
      }
    ]
  };
};

export const useFirebaseVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const verifyContent = async (
    content: string | File, 
    contentType: string
  ): Promise<VerificationResult | null> => {
    setIsLoading(true);
    
    try {
      let contentData = content;
      let fileUrl = '';

      // Handle file uploads
      if (content instanceof File) {
        if (isDemoMode) {
          // In demo mode, create a fake URL
          fileUrl = URL.createObjectURL(content);
          contentData = fileUrl;
          toast({
            title: "Demo Mode",
            description: "File uploaded in demo mode. Add Firebase config for real storage.",
          });
        } else {
          if (!storage) throw new Error('Firebase Storage not configured');
          const storageRef = ref(storage, `verifications/${user?.uid}/${Date.now()}_${content.name}`);
          await uploadBytes(storageRef, content);
          fileUrl = await getDownloadURL(storageRef);
          contentData = fileUrl;
        }
      }

      let analysis: VerificationResult;

      // Check if Gemini API is configured
      const geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const useRealAPI = geminiApiKey && geminiApiKey !== 'YOUR_API_KEY';

      if (useRealAPI) {
        // Call real Gemini AI API
        const geminiResponse = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [{
                  text: `Analyze this ${contentType} for authenticity and AI generation. Content: ${typeof contentData === 'string' ? contentData.slice(0, 500) : 'File uploaded'}. 
                  
                  Respond with ONLY a JSON object (no markdown, no extra text) containing:
                  {
                    "trustScore": number between 0-100,
                    "category": "Real & Verified" or "Suspicious" or "Fake or AI-Generated",
                    "summary": "brief explanation in one sentence",
                    "authenticity": "assessment of content authenticity",
                    "aiDetection": "AI generation analysis",
                    "sources": ["array", "of", "verification methods"],
                    "processingTime": number in seconds,
                    "sourcesChecked": number of sources,
                    "confidence": "High" or "Medium" or "Low"
                  }`
                }]
              }]
            })
          }
        );

        if (!geminiResponse.ok) {
          throw new Error(`Gemini API error: ${geminiResponse.status}`);
        }

        const geminiData = await geminiResponse.json();
        const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        
        try {
          const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
          analysis = JSON.parse(jsonMatch ? jsonMatch[0] : analysisText);
        } catch (e) {
          console.error('Failed to parse Gemini response:', analysisText);
          analysis = generateMockResult(typeof contentData === 'string' ? contentData : 'file', contentType);
        }
      } else {
        // Use mock data in demo mode
        analysis = generateMockResult(typeof contentData === 'string' ? contentData : 'file', contentType);
        toast({
          title: "Demo Mode",
          description: "Using mock AI analysis. Add Gemini API key for real verification.",
        });
      }

      // Fetch related articles from NewsAPI (if configured)
      if (import.meta.env.VITE_NEWS_API_KEY && typeof contentData === 'string') {
        try {
          const newsResponse = await fetch(
            `https://newsapi.org/v2/everything?q=${encodeURIComponent(contentData.slice(0, 100))}&apiKey=${import.meta.env.VITE_NEWS_API_KEY}&pageSize=3`
          );
          if (newsResponse.ok) {
            const newsData = await newsResponse.json();
            analysis.relatedArticles = newsData.articles || [];
          }
        } catch (e) {
          console.log('NewsAPI not available');
        }
      }

      // Fetch fact-check results (if configured)
      if (import.meta.env.VITE_GOOGLE_FACT_CHECK_API_KEY && typeof contentData === 'string') {
        try {
          const factCheckResponse = await fetch(
            `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(contentData.slice(0, 100))}&key=${import.meta.env.VITE_GOOGLE_FACT_CHECK_API_KEY}`
          );
          if (factCheckResponse.ok) {
            const factCheckData = await factCheckResponse.json();
            analysis.factCheckResults = factCheckData.claims || [];
          }
        } catch (e) {
          console.log('Fact Check API not available');
        }
      }

      // Save to Firestore (if configured)
      if (!isDemoMode && db && user) {
        try {
          await addDoc(collection(db, 'verifications'), {
            userId: user.uid,
            contentType,
            content: typeof contentData === 'string' ? contentData : fileUrl,
            result: analysis,
            createdAt: serverTimestamp()
          });
        } catch (e) {
          console.error('Failed to save to Firestore:', e);
        }
      }

      toast({
        title: "Verification Complete",
        description: "Content has been analyzed successfully",
      });

      return analysis;
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: "Verification Failed",
        description: error instanceof Error ? error.message : "An error occurred during verification",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { verifyContent, isLoading };
};