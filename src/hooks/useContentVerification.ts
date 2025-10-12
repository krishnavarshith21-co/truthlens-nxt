import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
}

export const useContentVerification = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const verifyContent = async (
    content: string, 
    contentType: string, 
    options?: { isBase64Image?: boolean; mimeType?: string; fileName?: string }
  ): Promise<VerificationResult | null> => {
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('verify-content', {
        body: { 
          content, 
          contentType,
          isBase64Image: options?.isBase64Image || false,
          mimeType: options?.mimeType || 'text/plain',
          fileName: options?.fileName || 'file'
        }
      });

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('No data returned from verification');
      }

      // Update user profile stats
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('total_verifications, trust_points')
          .eq('id', user.id)
          .single();

        if (profile) {
          await supabase
            .from('profiles')
            .update({ 
              total_verifications: (profile.total_verifications || 0) + 1,
              trust_points: (profile.trust_points || 0) + data.trustScore
            })
            .eq('id', user.id);
        }
      }

      toast({
        title: "✅ Verification Complete",
        description: "Content has been analyzed and saved successfully",
      });

      return data as VerificationResult;
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
