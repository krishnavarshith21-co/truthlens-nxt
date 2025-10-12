import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Clock, Image, FileText, CheckCircle, AlertTriangle, XCircle } from "lucide-react";
import { LoadingScreen } from "@/components/LoadingScreen";

interface Verification {
  id: string;
  content_url: string | null;
  content_text: string | null;
  content_type: string;
  trust_score: number;
  summary: string;
  created_at: string;
}

const History = () => {
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    loadHistory();
  }, [user, navigate]);

  const loadHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('verifications')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setVerifications(data || []);
    } catch (error) {
      console.error('Error loading history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getScoreIcon = (score: number) => {
    if (score >= 70) return <CheckCircle className="w-6 h-6 text-trust-high" />;
    if (score >= 40) return <AlertTriangle className="w-6 h-6 text-trust-medium" />;
    return <XCircle className="w-6 h-6 text-trust-low" />;
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return "text-trust-high";
    if (score >= 40) return "text-trust-medium";
    return "text-trust-low";
  };

  if (isLoading) {
    return <LoadingScreen message="Loading your verification history..." />;
  }

  return (
    <div className="min-h-screen">
      <Navigation />
      
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4">
              <span className="text-gradient">Verification History</span>
            </h1>
            <p className="text-xl text-muted-foreground">
              View all your previous content verifications
            </p>
          </div>

          {verifications.length === 0 ? (
            <Card className="glass-card p-12 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
              <h3 className="text-2xl font-semibold mb-2">No Verifications Yet</h3>
              <p className="text-muted-foreground">
                Start analyzing content to build your verification history
              </p>
            </Card>
          ) : (
            <div className="grid gap-6">
              {verifications.map((verification) => (
                <Card
                  key={verification.id}
                  className="glass-card p-6 hover:glow-primary transition-all cursor-pointer"
                  onClick={() => navigate('/result', { state: { 
                    result: {
                      trustScore: verification.trust_score,
                      summary: verification.summary,
                      category: verification.trust_score >= 70 ? "Real & Verified" : 
                               verification.trust_score >= 40 ? "Suspicious" : "Fake or AI-Generated",
                      authenticity: "",
                      aiDetection: "",
                      sources: [],
                      processingTime: 0,
                      sourcesChecked: 0,
                      confidence: "High"
                    },
                    content: verification.content_text || verification.content_url
                  }})}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {verification.content_url ? (
                        <Image className="w-12 h-12 text-primary" />
                      ) : (
                        <FileText className="w-12 h-12 text-primary" />
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getScoreIcon(verification.trust_score)}
                        <span className={`text-2xl font-bold ${getScoreColor(verification.trust_score)}`}>
                          {verification.trust_score}%
                        </span>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mb-2">
                        {verification.summary}
                      </p>
                      
                      {verification.content_url && (
                        <img 
                          src={verification.content_url} 
                          alt="Verified content"
                          className="w-32 h-32 object-cover rounded-lg mt-2"
                        />
                      )}
                      
                      {verification.content_text && (
                        <p className="text-sm text-muted-foreground italic line-clamp-2 mt-2">
                          "{verification.content_text}"
                        </p>
                      )}
                    </div>
                    
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {new Date(verification.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default History;
