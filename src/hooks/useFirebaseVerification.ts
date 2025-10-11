import { useState } from 'react';
import { db, storage } from '@/lib/firebase';
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
        const storageRef = ref(storage, `verifications/${user?.uid}/${Date.now()}_${content.name}`);
        await uploadBytes(storageRef, content);
        fileUrl = await getDownloadURL(storageRef);
        contentData = fileUrl;
      }

      // Call Gemini AI API
      const geminiResponse = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `Analyze this ${contentType} for authenticity and AI generation. Content: ${typeof contentData === 'string' ? contentData : fileUrl}. 
                
                Respond with JSON containing:
                - trustScore (0-100)
                - category ("Real & Verified", "Suspicious", or "Fake or AI-Generated")
                - summary (brief explanation)
                - authenticity (assessment)
                - aiDetection (AI generation analysis)
                - sources (array of verification methods)
                - processingTime (number)
                - sourcesChecked (number)
                - confidence ("High", "Medium", "Low")`
              }]
            }]
          })
        }
      );

      const geminiData = await geminiResponse.json();
      const analysisText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      
      let analysis: VerificationResult;
      try {
        const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || analysisText.match(/\{[\s\S]*\}/);
        analysis = JSON.parse(jsonMatch ? jsonMatch[1] || jsonMatch[0] : analysisText);
      } catch (e) {
        analysis = {
          trustScore: 50,
          category: "Suspicious",
          summary: "Unable to fully verify content",
          authenticity: "Analysis completed but results are uncertain",
          aiDetection: "Could not determine AI generation likelihood",
          sources: ["Gemini Analysis"],
          processingTime: 2.5,
          sourcesChecked: 1,
          confidence: "Low"
        };
      }

      // Fetch related articles from NewsAPI
      if (import.meta.env.VITE_NEWS_API_KEY) {
        const newsResponse = await fetch(
          `https://newsapi.org/v2/everything?q=${encodeURIComponent(typeof contentData === 'string' ? contentData.slice(0, 100) : '')}&apiKey=${import.meta.env.VITE_NEWS_API_KEY}&pageSize=3`
        );
        const newsData = await newsResponse.json();
        analysis.relatedArticles = newsData.articles || [];
      }

      // Fetch fact-check results from Google Fact Check API
      if (import.meta.env.VITE_GOOGLE_FACT_CHECK_API_KEY) {
        const factCheckResponse = await fetch(
          `https://factchecktools.googleapis.com/v1alpha1/claims:search?query=${encodeURIComponent(typeof contentData === 'string' ? contentData.slice(0, 100) : '')}&key=${import.meta.env.VITE_GOOGLE_FACT_CHECK_API_KEY}`
        );
        const factCheckData = await factCheckResponse.json();
        analysis.factCheckResults = factCheckData.claims || [];
      }

      // Save to Firestore
      if (user) {
        await addDoc(collection(db, 'verifications'), {
          userId: user.uid,
          contentType,
          content: typeof contentData === 'string' ? contentData : fileUrl,
          result: analysis,
          createdAt: serverTimestamp()
        });
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
